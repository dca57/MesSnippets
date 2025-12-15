
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../helpers/utils';

export const EditableText = ({ 
  value, 
  onSave, 
  className,
  placeholder = "...",
  singleLine = true,
  inputClassName,
  onEditingChange,
  clearOnFocus = false
}: { 
  value: string, 
  onSave: (val: string) => void, 
  className?: string, 
  placeholder?: string, 
  singleLine?: boolean, 
  inputClassName?: string,
  onEditingChange?: (isEditing: boolean) => void,
  clearOnFocus?: boolean
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => { setTempValue(value); }, [value]);
  useEffect(() => { if (isEditing && inputRef.current) inputRef.current.focus(); }, [isEditing]);

  const handleStartEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If clearOnFocus is true, start with empty string, otherwise current value
    setTempValue(clearOnFocus ? '' : value);
    setIsEditing(true);
    if (onEditingChange) onEditingChange(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onEditingChange) onEditingChange(false);
    // If clearOnFocus was used and user left it empty, revert to original value or decide behavior
    // Here: if empty and clearOnFocus, we might want to prevent saving empty if it's strictly for numbers, 
    // but the generic component allows empty. 
    // Logic: If user typed nothing (empty) and it was clearOnFocus, usually we don't want to save "empty string" for a time field.
    // But for generic text, empty might be valid.
    // Safety check: if clearOnFocus is true and tempValue is empty, we assume cancellation for safety in this context,
    // unless the parent handles empty string validation.
    if (clearOnFocus && tempValue.trim() === '') {
        setTempValue(value); 
        return;
    }

    if (tempValue.trim() !== value) onSave(tempValue);
  };

  if (isEditing) {
    return singleLine ? (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
        className={cn("bg-transparent border-b border-blue-500 outline-none w-full", inputClassName || className)}
        onClick={(e) => e.stopPropagation()} // Prevent drag start on input click
      />
    ) : (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        className={cn("bg-transparent border-b border-blue-500 outline-none w-full min-h-[60px]", inputClassName || className)}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div 
      onClick={handleStartEditing}
      className={cn("cursor-text hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded px-1 -mx-1 transition-colors empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400", className)}
      data-placeholder={placeholder}
    >
      {value}
    </div>
  );
};
