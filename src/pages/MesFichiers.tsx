import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../features/admin/context/AuthContext";
import { FileService } from "./MesFichiers/services/fileService";
import { SniFichier, FileUploadPayload } from "./MesFichiers/types";
import { CategorySidebar } from "./MesFichiers/components/CategorySidebar";
import { FileList } from "./MesFichiers/components/FileList";
import { FileDropZone } from "./MesFichiers/components/FileDropZone";
import { UploadModal } from "./MesFichiers/modals/UploadModal";
import { DeleteConfirmModal } from "./MesFichiers/modals/DeleteConfirmModal";
import { Icons } from "../core/helpers/icons";

const MesFichiers: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<SniFichier[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals & Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  
  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<SniFichier | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedFiles, fetchedCategories] = await Promise.all([
        FileService.getFiles(),
        FileService.getUniqueCategories(),
      ]);
      setFiles(fetchedFiles);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = (file: File) => {
    setFileToUpload(file);
    setIsUploadModalOpen(true);
  };

  const handleUpload = async (payload: FileUploadPayload) => {
    if (!user) return;
    try {
      await FileService.uploadFile(payload, user.id);
      await loadData(); // Refresh all
      setIsUploadModalOpen(false);
      setFileToUpload(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Erreur lors de l'upload. Vérifiez que vous avez les droits d'accès ou que le fichier n'est pas trop volumineux.");
    }
  };

  const handleDeleteRequest = (file: SniFichier) => {
    setFileToDelete(file);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    try {
      await FileService.deleteFile(fileToDelete);
      await loadData();
      setIsDeleteModalOpen(false);
      setFileToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Erreur lors de la suppression.");
    }
  };

  const handleDownload = async (file: SniFichier) => {
    try {
        const blob = await FileService.downloadFile(file);
        if (blob) {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.nom_fichier;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    } catch (error) {
        console.error("Download error:", error);
        alert("Erreur lors du téléchargement.");
    }
  };

  const filteredFiles = useMemo(() => {
    if (!selectedCategory) return files;
    return files.filter(f => f.categorie === selectedCategory);
  }, [files, selectedCategory]);

  return (
    <div className="flex h-[calc(100vh-3rem)] overflow-hidden">
        {/* Left Sidebar */}
        <div className="hidden md:block">
            <CategorySidebar 
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                             Mes Fichiers
                             {selectedCategory && <span className="text-purple-600 dark:text-purple-400 text-lg font-normal">/ {selectedCategory}</span>}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Gérez vos documents personnels
                        </p>
                    </div>
                </div>

                {/* Drop Zone */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm">
                    <FileDropZone onFileDropped={handleFileDrop} />
                </div>

                {/* File List */}
                <div>
                   <FileList 
                        files={filteredFiles}
                        onDownload={handleDownload}
                        onDelete={handleDeleteRequest}
                        isLoading={loading}
                   />
                </div>
            </div>
        </div>

        {/* Modals */}
        <UploadModal 
            isOpen={isUploadModalOpen}
            onClose={() => {
                setIsUploadModalOpen(false);
                setFileToUpload(null);
            }}
            onUpload={handleUpload}
            existingCategories={categories}
            initialFile={fileToUpload}
        />

        <DeleteConfirmModal 
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteConfirm}
            fileName={fileToDelete?.nom_fichier}
        />
    </div>
  );
};

export default MesFichiers;