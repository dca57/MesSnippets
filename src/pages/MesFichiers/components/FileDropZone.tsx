import React, { useRef, useState } from "react";
import { Icons } from "../../../core/helpers/icons";

interface FileDropZoneProps {
  onFileDropped: (file: File) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onFileDropped }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileDropped(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileDropped(e.target.files[0]);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50
        ${
          isDragOver
            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 scale-102"
            : "border-slate-300 dark:border-slate-700"
        }
      `}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className={`p-4 rounded-full mb-4 transition-colors ${isDragOver ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
        <Icons.Upload className="w-8 h-8" />
      </div>
      
      <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-1">
        Déposez un fichier ici
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        ou cliquez pour sélectionner un fichier
      </p>
    </div>
  );
};
