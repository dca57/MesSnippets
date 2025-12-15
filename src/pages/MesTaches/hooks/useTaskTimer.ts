
import { useState, useEffect } from 'react';

/**
 * Hook to track elapsed time for a task.
 * Updates every second if the task is running.
 */
export const useTaskTimer = (isRunning: boolean, lastStartedAt: string | null, spentDuration: number) => {
  const [elapsed, setElapsed] = useState(spentDuration);

  useEffect(() => {
    // Reset to current stored duration whenever inputs change (e.g. switching tasks or pausing)
    setElapsed(spentDuration);

    if (!isRunning || !lastStartedAt) return;

    // Initial calculation to avoid 1s delay
    const startTimestamp = new Date(lastStartedAt).getTime();
    setElapsed(spentDuration + Math.floor((Date.now() - startTimestamp) / 1000));

    const interval = setInterval(() => {
      const now = Date.now();
      const additionalSeconds = Math.floor((now - startTimestamp) / 1000);
      setElapsed(spentDuration + additionalSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [spentDuration, isRunning, lastStartedAt]);

  return elapsed;
};
