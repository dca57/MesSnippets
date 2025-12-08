import React from "react";
import { Modal } from "./ui/Modal";

interface ImportModalProps {
  isOpen: boolean;
  isEditing: boolean;
  name: string;
  json: string;
  onNameChange: (val: string) => void;
  onJsonChange: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  isEditing,
  name,
  json,
  onNameChange,
  onJsonChange,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;
  return (
    <Modal
      title={isEditing ? "Edit Schema" : "Import JSON"}
      onClose={onClose}
      onSave={onSave}
      saveLabel={isEditing ? "Update" : "Import"}
    >
      <div className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Schema Name"
          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
        />
        <textarea
          value={json}
          onChange={(e) => onJsonChange(e.target.value)}
          placeholder="JSON Schema..."
          className="w-full h-64 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs font-mono"
        />
      </div>
    </Modal>
  );
};

interface SaveQueryModalProps {
  isOpen: boolean;
  name: string;
  onNameChange: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const SaveQueryModal: React.FC<SaveQueryModalProps> = ({
  isOpen,
  name,
  onNameChange,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;
  return (
    <Modal
      title="Save Query"
      onClose={onClose}
      onSave={() => {
        if (name.trim()) onSave();
      }}
    >
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Query Name"
        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
      />
    </Modal>
  );
};

interface UnsavedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

export const UnsavedModal: React.FC<UnsavedModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDiscard,
}) => {
  if (!isOpen) return null;
  return (
    <Modal
      title="Unsaved Changes"
      onClose={onClose}
      onSave={onSave}
      saveLabel="Save & Continue"
      extraButtons={
        <button
          onClick={onDiscard}
          className="px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded"
        >
          Don't Save
        </button>
      }
    >
      <p>Save changes before continuing?</p>
    </Modal>
  );
};
