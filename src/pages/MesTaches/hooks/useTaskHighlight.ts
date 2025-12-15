
import { useState, useEffect, useRef } from 'react';
import { Task } from '../types/types';

/**
 * Hook qui renvoie true temporairement si la tâche vient d'être créée
 * ou si son ordre/statut a changé.
 */
export const useTaskHighlight = (task: Task) => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const prevStatus = useRef(task.status);
  const prevOrder = useRef(task.order);
  const mounted = useRef(false);

  useEffect(() => {
    // 1. Détection à l'initialisation (Création)
    if (!mounted.current) {
      const now = new Date().getTime();
      const created = new Date(task.createdAt).getTime();
      
      // Si la tâche a été créée il y a moins de 2 secondes, on highlight
      if (now - created < 2000) { 
         setIsHighlighted(true);
         const timer = setTimeout(() => setIsHighlighted(false), 1000); // Highlight plus long pour la création
         return () => clearTimeout(timer);
      }
      mounted.current = true;
      return;
    }

    // 2. Détection des changements (Move / Reorder)
    if (prevStatus.current !== task.status || prevOrder.current !== task.order) {
        setIsHighlighted(true);
        const timer = setTimeout(() => setIsHighlighted(false), 400); // 400ms flash
        
        prevStatus.current = task.status;
        prevOrder.current = task.order;
        
        return () => clearTimeout(timer);
    }
  }, [task.createdAt, task.status, task.order]);

  return isHighlighted;
};
