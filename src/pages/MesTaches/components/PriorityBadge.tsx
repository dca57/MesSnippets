import React from 'react';
import { Priority, PRIORITY_CONFIG } from '../types/types';
import { cn } from '../helpers/utils';

interface PriorityBadgeProps {
  priority: Priority;
  onChange?: (newPriority: Priority) => void;
  onClick?: () => void;
  className?: string;
  dimmed?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ 
  priority, 
  onChange, 
  onClick, 
  className,
  dimmed = false 
}) => {
  const config = PRIORITY_CONFIG[priority];
  const priorities: Priority[] = ['low', 'normal', 'high', 'urgent'];
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onClick) {
        onClick();
        return;
    }

    if (onChange) {
        const currentIndex = priorities.indexOf(priority);
        const nextIndex = (currentIndex + 1) % priorities.length;
        onChange(priorities[nextIndex]);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={cn(
        "text-[10px] font-bold px-2 py-0.5 rounded border border-transparent transition-all uppercase whitespace-nowrap",
        config.color,
        config.bg,
        dimmed ? "opacity-40 grayscale hover:opacity-70 hover:grayscale-0" : "hover:brightness-95 shadow-sm",
        className
      )}
    >
      {config.label}
    </button>
  );
};