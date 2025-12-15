
import confetti from 'canvas-confetti';

export const triggerCelebration = () => {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
    });
};
