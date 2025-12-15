
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateId = () => Math.random().toString(36).substr(2, 9);

// Format seconds to HH:MM
export const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h${m.toString().padStart(2, '0')}`;
};

// Parse user input duration string (e.g. "1h30", "90", "1h") to seconds
export const parseDurationInput = (input: string): number => {
  const str = input.toLowerCase().replace(/\s/g, '');
  
  if (str.includes('h')) {
    const parts = str.split('h');
    const h = parseInt(parts[0]) || 0;
    const m = parseInt(parts[1]) || 0;
    return (h * 3600) + (m * 60);
  } else {
    // Assume minutes if no unit
    const m = parseInt(str) || 0;
    return m * 60;
  }
};
