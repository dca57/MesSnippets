
import React, { useRef, useEffect } from 'react';
import { Icons } from '../../helpers/icons';
import { formatDuration, parseDurationInput } from '../../helpers/utils';
import { EditableText } from './EditableText';

export const TimeEstimator = ({ value, onChange, compact = false }: { value: number, onChange: (val: number) => void, compact?: boolean }) => {
  // Refs pour gérer l'intervalle et la valeur courante sans dépendre du cycle de rendu dans le setInterval
  const intervalRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);
  const valueRef = useRef(value);

  // Garder la ref synchronisée avec la prop value
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => stopChange();
  }, []);

  const changeValue = (direction: 'up' | 'down') => {
    const currentValue = valueRef.current;
    let step = 5;
    
    // Logique de pas dynamique
    if (currentValue >= 1440) step = 60; // Au delà de 24h, pas de 1h (pour aller vite)
    else if (currentValue >= 240) step = 30; // Au delà de 4h, pas de 30min
    else if (currentValue >= 60) step = 15; // Au delà de 1h, pas de 15min
    
    const newValue = direction === 'up' ? currentValue + step : currentValue - step;
    const finalValue = Math.max(0, newValue);
    
    onChange(finalValue);
  };

  const startChange = (direction: 'up' | 'down') => {
    // 1. Exécuter immédiatement une fois (pour un clic simple)
    changeValue(direction);

    // 2. Préparer l'appui long
    timeoutRef.current = setTimeout(() => {
        // Si on est toujours appuyé après 400ms, on lance la répétition
        intervalRef.current = setInterval(() => {
            changeValue(direction);
        }, 100); // Répétition toutes les 100ms
    }, 400);
  };

  const stopChange = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Gestion de l'édition manuelle via le texte
  const formatted = formatDuration(value * 60);
  const handleTextSave = (str: string) => {
      const seconds = parseDurationInput(str);
      onChange(Math.floor(seconds / 60)); // Store as minutes
  };

  // Empêcher la propagation du double-clic (déjà géré, mais utile de le rappeler sur les conteneurs)
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  // Props communes pour les boutons
  const getButtonProps = (direction: 'up' | 'down') => ({
    onMouseDown: (e: React.MouseEvent) => { e.stopPropagation(); startChange(direction); },
    onMouseUp: stopChange,
    onMouseLeave: stopChange,
    // Pour le tactile sur mobile
    onTouchStart: (e: React.TouchEvent) => { e.stopPropagation(); startChange(direction); },
    onTouchEnd: stopChange,
    type: "button" as const
  });

  if (compact) {
     return (
        <div 
            className="flex items-center gap-1"
            onDoubleClick={stopPropagation}
            onClick={stopPropagation}
        >
            <EditableText 
                value={formatted}
                onSave={handleTextSave}
                className="font-mono text-xs font-medium text-center min-w-[40px]"
                inputClassName="w-[50px] text-xs font-mono"
            />
            <div className="flex flex-col -space-y-0.5 select-none">
                <button 
                    {...getButtonProps('up')}
                    className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-blue-600 transition-colors p-0.5 active:bg-slate-300 dark:active:bg-slate-600"
                >
                    <Icons.ChevronUp size={14} />
                </button>
                <button 
                    {...getButtonProps('down')}
                    className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-blue-600 transition-colors p-0.5 active:bg-slate-300 dark:active:bg-slate-600"
                >
                    <Icons.ChevronDown size={14} />
                </button>
            </div>
        </div>
     );
  }

  // Card version
  return (
    <div 
        className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-md p-0.5 select-none"
        onDoubleClick={stopPropagation}
        onClick={stopPropagation}
    >
      <button 
        {...getButtonProps('down')}
        className="p-1 hover:text-blue-600 active:scale-90 transition-transform"
      >
        <Icons.ChevronLeft size={12} />
      </button>
      
      <span className="text-xs font-mono font-medium min-w-[50px] text-center">
        {formatted}
      </span>
      
      <button 
        {...getButtonProps('up')}
        className="p-1 hover:text-blue-600 active:scale-90 transition-transform"
      >
        <Icons.ChevronRight size={12} />
      </button>
    </div>
  );
};
