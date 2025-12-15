import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from "@/core/helpers/icons";

interface BackToMainButtonProps {
  className?: string;
}

const BackToMainButton: React.FC<BackToMainButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/')}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ${className}`}
    >
      <Icons.ArrowLeft className="w-4 h-4" />
      Retour au bureau
    </button>
  );
};

export default BackToMainButton;
