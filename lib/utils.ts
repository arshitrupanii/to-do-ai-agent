import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type Priority, type Task } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}

export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case 'low':
      return 'bg-blue-500/20 text-blue-500';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-500';
    case 'high':
      return 'bg-red-500/20 text-red-500';
    default:
      return 'bg-gray-500/20 text-gray-500';
  }
}

export const mockTasks: Task[] = [
  {
    id: generateId(),
    title: 'Complete project proposal',
    description: 'Finish the draft and send it to the team for review',
    completed: false,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
    priority: 'high',
    tags: ['work', 'project'],
  },
  {
    id: generateId(),
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, and vegetables',
    completed: true,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    dueDate: new Date(Date.now() - 43200000), // 12 hours ago
    priority: 'medium',
    tags: ['personal', 'shopping'],
  },
  {
    id: generateId(),
    title: 'Schedule dentist appointment',
    completed: false,
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
    priority: 'low',
    tags: ['health'],
  },
];