import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyableCellProps {
  text: string;
  id?: string | null;
  className?: string;
}

export const CopyableCell: React.FC<CopyableCellProps> = ({ text, id, className }) => {
  const [copied, setCopied] = useState(false);

  if (!id) return <span className={className}>{text}</span>;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`group/cell flex items-center gap-2 ${className}`}>
      <span className="truncate max-w-[150px] sm:max-w-[200px]">{text}</span>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover/cell:opacity-100 transition-opacity p-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
        title={`ID: ${id} (Cliquer pour copier)`}
      >
        {copied ? (
          <Check size={12} className="text-green-500" />
        ) : (
          <Copy size={12} />
        )}
      </button>
    </div>
  );
};
