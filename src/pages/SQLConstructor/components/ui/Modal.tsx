import React from "react";
import { Icons } from "../icons";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave?: () => void;
  saveLabel?: string;
  extraButtons?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  children,
  onClose,
  onSave,
  saveLabel = "Save",
  extraButtons,
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h3 className="font-bold text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <Icons.Close className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 text-slate-300">
          {children}
        </div>
        <div className="p-4 border-t border-slate-700 flex justify-end gap-2">
          {extraButtons}
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          {onSave && (
            <button
              onClick={onSave}
              className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition-colors"
            >
              {saveLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
