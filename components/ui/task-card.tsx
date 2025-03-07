"use client";

import { useState } from 'react';
import { Task } from '@/lib/types';
import { formatDate, getPriorityColor } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { CalendarIcon, Clock, Tag } from 'lucide-react';
import { PomodoroTimer } from '@/components/ui/pomodoro-timer';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string, completed: boolean) => void;
}

export function TaskCard({ task, onToggleComplete }: TaskCardProps) {
  const [isCompleted, setIsCompleted] = useState(task.completed);

  const handleToggle = () => {
    const newState = !isCompleted;
    setIsCompleted(newState);
    onToggleComplete(task.id, newState);
  };

  return (
    <Card className={`mb-4 transition-opacity duration-300 ${isCompleted ? 'opacity-60' : 'opacity-100'}`}>
      <CardHeader className="pb-2 flex flex-row items-center gap-3">
        <div className="flex items-center justify-center h-full">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleToggle}
          />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          )}
        </div>
        <Badge className={getPriorityColor(task.priority)}>
          {task.priority}
        </Badge>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between items-center">
          <PomodoroTimer />
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="flex items-center gap-1">
                  <Tag size={12} />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>Created: {formatDate(task.createdAt)}</span>
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <CalendarIcon size={12} />
              <span>Due: {formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}