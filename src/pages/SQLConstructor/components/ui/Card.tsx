import React, { useState } from "react";

export interface DragItem {
  table: string;
  column: string;
  type: string;
}

interface CardProps {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  onDrop?: (item: DragItem) => void;
  className?: string;
}

export const Card = ({
  title,
  children,
  action,
  onDrop,
  className = "",
}: CardProps) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const dataStr = e.dataTransfer.getData("application/json");
    if (dataStr && onDrop) {
      try {
        const item: DragItem = JSON.parse(dataStr);
        onDrop(item);
      } catch (err) {
        console.error("Drop Error", err);
      }
    }
  };

  return (
    <div
      className={`bg-slate-100 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-400 rounded-lg shadow-sm mb-6 overflow-hidden transition-colors ${
        isOver ? "border-indigo-400 ring-1 ring-indigo-400" : "border-slate-800"
      } ${className}`}
      onDragOver={onDrop ? handleDragOver : undefined}
      onDragLeave={onDrop ? handleDragLeave : undefined}
      onDrop={onDrop ? handleDrop : undefined}
    >
      <div
        className={`px-4 py-3 border-b flex justify-between items-center ${
          isOver
            ? "bg-indigo-900/30 border-indigo-900"
            : "bg-slate-900/50 border-slate-800"
        }`}
      >
        <h3
          className={`text-xs font-bold uppercase tracking-wider ${
            isOver ? "text-indigo-200" : "text-slate-700 dark:text-slate-300"
          }`}
        >
          {title}{" "}
          {onDrop && isOver && (
            <span className="ml-2 normal-case opacity-75">
              - Drop to add field
            </span>
          )}
        </h3>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};
