"use client";

import { useState, useEffect } from 'react';
import { Button } from './button';
import { PlayIcon, PauseIcon, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PomodoroTimerProps {
  onComplete?: () => void;
}

export function PomodoroTimer({ onComplete }: PomodoroTimerProps) {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState<number>(() => {
    const savedSessions = localStorage.getItem('completedPomodoros');
    return savedSessions ? JSON.parse(savedSessions) : 0;
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
            onComplete?.();
            toast({
              title: "Pomodoro Complete!",
              description: "Time to take a break.",
            });
            setCompletedSessions((prev) => {
              const newCount = prev + 1;
              localStorage.setItem('completedPomodoros', JSON.stringify(newCount));
              return newCount;
            });
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete, toast]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm font-medium">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTimer}
        className="h-8 w-8 p-0"
      >
        {isRunning ? (
          <PauseIcon className="h-4 w-4" />
        ) : (
          <PlayIcon className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={resetTimer}
        className="h-8 w-8 p-0"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
      <div className="ml-4 text-sm">
        Completed: {completedSessions}
      </div>
    </div>
  );
} 