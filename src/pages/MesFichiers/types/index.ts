import { Database } from "../../../supabase/types";

export type SniFichier = Database["public"]["Tables"]["sni_fichiers"]["Row"];

export interface FileUploadPayload {
  categorie: string;
  titre: string;
  file: File;
}
