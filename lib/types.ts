export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  priority: Priority;
  tags?: string[];
}

export interface AIResponse {
  title: string;
  description?: string;
  dueDate?: string;
  priority: Priority;
  tags?: string[];
}