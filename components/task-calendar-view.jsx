"use client";

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPriorityColor } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { format, isSameDay } from 'date-fns';

export function TaskCalendarView({ tasks, onToggleComplete }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get tasks for the selected date
  const tasksForSelectedDate = tasks.filter(task => 
    task.dueDate && isSameDay(new Date(task.dueDate), selectedDate)
  );
  
  // Get all dates that have tasks
  const taskDates = tasks
    .filter(task => task.dueDate)
    .map(task => new Date(task.dueDate));
  
  // Custom day rendering to highlight days with tasks
  const dayWithTasks = (date, tasks) => {
    const hasTasksOnDay = tasks.some(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
    
    if (!hasTasksOnDay) return null;
    
    const tasksOnDay = tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
    
    const hasHighPriority = tasksOnDay.some(task => task.priority === 'high');
    const hasMediumPriority = tasksOnDay.some(task => task.priority === 'medium');
    
    let dotClass = 'bg-blue-500';
    if (hasHighPriority) dotClass = 'bg-red-500';
    else if (hasMediumPriority) dotClass = 'bg-yellow-500';
    
    return (
      <div className="flex justify-center">
        <div className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      </div>
    );
  };
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Task Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            components={{
              DayContent: ({ date }) => (
                <>
                  <div>{date.getDate()}</div>
                  {dayWithTasks(date, tasks)}
                </>
              ),
            }}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>
            Tasks for {format(selectedDate, 'MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasksForSelectedDate.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks scheduled for this day
            </div>
          ) : (
            <div className="space-y-4">
              {tasksForSelectedDate.map(task => (
                <div 
                  key={task.id} 
                  className={`p-3 border rounded-md flex items-start gap-2 ${task.completed ? 'opacity-60' : ''}`}
                >
                  <Checkbox 
                    checked={task.completed} 
                    onCheckedChange={(checked) => onToggleComplete(task.id, checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h3>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}