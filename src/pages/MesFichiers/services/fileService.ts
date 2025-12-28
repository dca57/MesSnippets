import { supabase } from "../../../supabase/config";
import { SniFichier, FileUploadPayload } from "../types";

const TABLE_NAME = "sni_fichiers";
const BUCKET_NAME = "sni_fichiers";

export const FileService = {
  getFiles: async (): Promise<SniFichier[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getUniqueCategories: async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("categorie")
      .order("categorie", { ascending: true });

    if (error) throw error;
    
    // Extract unique categories 
    const categories = Array.from(new Set(data.map((item: any) => item.categorie)));
    return categories;
  },

  uploadFile: async (payload: FileUploadPayload, userId: string): Promise<SniFichier | null> => {
    const { file, categorie, titre } = payload;
    
    // 1. Upload to Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Insert into Table
    const sizeInMo = parseFloat((file.size / (1024 * 1024)).toFixed(2));
    
    const { data, error: dbError } = await supabase
      .from(TABLE_NAME)
      .insert([
        {
          user_id: userId,
          categorie,
          titre,
          nom_fichier: file.name,
          extension: fileExt || null,
          taille: sizeInMo,
          file_path: filePath,
        },
      ])
      .select()
      .single();

    if (dbError) {
        // Cleanup storage if DB fails
        await supabase.storage.from(BUCKET_NAME).remove([filePath]);
        throw dbError;
    }

    return data;
  },

  deleteFile: async (file: SniFichier): Promise<void> => {
    // 1. Remove from Storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([file.file_path]);

    if (storageError) throw storageError;

    // 2. Remove from Table
    const { error: dbError } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("id", file.id);

    if (dbError) throw dbError;
  },

  downloadFile: async (file: SniFichier): Promise<Blob | null> => {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(file.file_path);

    if (error) throw error;
    return data;
  }
};
