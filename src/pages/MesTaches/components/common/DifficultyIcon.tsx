import React from 'react';
import { Icons } from '../../helpers/icons';
import { Difficulty, DIFFICULTY_CONFIG } from '../../types/types';

export const DifficultyIcon = ({ difficulty, onChange }: { difficulty: Difficulty, onChange: (d: Difficulty) => void }) => {
  const config = DIFFICULTY_CONFIG[difficulty];
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

  const cycleDifficulty = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = difficulties.indexOf(difficulty);
    const nextIndex = (currentIndex + 1) % difficulties.length;
    onChange(difficulties[nextIndex]);
  };

  const IconComponent = () => {
    switch(difficulty) {
      case 'easy': return <Icons.Smile size={16} className={config.color} />;
      case 'medium': return <Icons.Meh size={16} className={config.color} />;
      case 'hard': return <Icons.Frown size={16} className={config.color} />;
      case 'expert': return <Icons.AlertTriangle size={16} className={config.color} />;
    }
  };

  return (
    <button onClick={cycleDifficulty} className="hover:bg-slate-100 dark:hover:bg-slate-700 rounded p-0.5 transition-colors" title={config.label}>
      <IconComponent />
    </button>
  );
};