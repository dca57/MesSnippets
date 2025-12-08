import React, { useState } from 'react';
import { Icons } from "@/core/helpers/icons";
import IAToolExampleModal from './IAToolExampleModal';

interface IAToolExampleButtonProps {
  className?: string;
  categoryId: string;
  categoryName: string;
}

const IAToolExampleButton: React.FC<IAToolExampleButtonProps> = ({ className, categoryId, categoryName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center justify-center gap-2 px-2 py-1 text-amber-500 hover:bg-red-700 dark:hover:bg-red-800 rounded-lg text-sm font-medium transition-colors ${className}`}
        title="Suggestions IA"
      >
        <Icons.Sparkles className="w-4 h-4" />       
      </button>

      <IAToolExampleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        categoryId={categoryId}
        categoryName={categoryName}
      />
    </>
  );
};

export default IAToolExampleButton;
