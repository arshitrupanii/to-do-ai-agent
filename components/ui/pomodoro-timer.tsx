"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const POMODORO_TIME = 25 * 60; // 25 minutes
const BREAK_TIME = 5 * 60; // 5 minutes

export function PomodoroTimer() {
  const [time, setTime] = useState(POMODORO_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [audio] = useState(new Audio("/path/to/meditation-music.mp3"));

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            setIsBreak(!isBreak);
            setTime(isBreak ? POMODORO_TIME : BREAK_TIME);
            audio.play();
            return isBreak ? POMODORO_TIME : BREAK_TIME;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, isBreak, audio]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(POMODORO_TIME);
    setIsBreak(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="pomodoro-timer">
      <h2 className="text-2xl font-bold">{isBreak ? "Break Time" : "Focus Time"}</h2>
      <div className="time-display text-4xl font-mono">{formatTime(time)}</div>
      <div className="controls mt-4">
        <Button onClick={toggleTimer}>{isRunning ? "Pause" : "Start"}</Button>
        <Button onClick={resetTimer} className="ml-2">Reset</Button>
      </div>
    </div>
  );
} 