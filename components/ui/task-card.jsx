"use client";

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle2,
  Tag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

const TaskCard = ({ task, onToggleComplete, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  const getDueStatus = () => {
    if (!task.dueDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: "Overdue", variant: "destructive" };
    } else if (diffDays === 0) {
      return { label: "Due today", variant: "warning" };
    } else if (diffDays === 1) {
      return { label: "Due tomorrow", variant: "warning" };
    } else if (diffDays <= 3) {
      return { label: `Due in ${diffDays} days`, variant: "warning" };
    } else {
      return { label: `Due in ${diffDays} days`, variant: "outline" };
    }
  };
  
  const dueStatus = getDueStatus();
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleSave = () => {
    onEdit(task.id, editedTask);
    setIsEditing(false);
  };
  
  return (
    <Card className={`mb-4 shadow-lg ${task.completed ? 'opacity-80' : ''} bg-[#333]`}>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Checkbox 
              checked={task.completed} 
              onCheckedChange={(checked) => onToggleComplete(task.id, checked)}
              className="mt-1 text-[#ff7518]"
            />
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-medium ${task.completed ? 'line-through text-[#666]' : ''}`}>
                  {task.title}
                </h3>
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
              </div>
              
              {task.description && (
                <CardDescription className={`mt-1 ${task.completed ? 'line-through' : ''}`}>
                  {task.description}
                </CardDescription>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#ff7518]">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#222] text-white">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleComplete(task.id, !task.completed)}>
                {task.completed ? (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Mark as pending
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as completed
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(task.id)}
                className="text-red-500 focus:text-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <div className="flex flex-wrap gap-2 mt-2">
          {task.tags && task.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs bg-[#4b0082] text-white">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-[#666]">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>Created {formatDate(task.createdAt)}</span>
        </div>
        
        {dueStatus && (
          <Badge variant={dueStatus.variant} className="ml-auto bg-[#ffcc00] text-black">
            {dueStatus.label}
          </Badge>
        )}
      </CardFooter>
      
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="bg-[#222] text-white">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-title" className="text-sm font-medium">Title</label>
              <Input
                id="edit-title"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="bg-[#333] text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
              <Input
                id="edit-description"
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="bg-[#333] text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-due-date" className="text-sm font-medium">Due Date</label>
              <Input
                id="edit-due-date"
                type="date"
                value={editedTask.dueDate ? new Date(editedTask.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                className="bg-[#333] text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map((priority) => (
                  <Badge
                    key={priority}
                    variant={editedTask.priority === priority ? 'default' : 'outline'}
                    className="capitalize cursor-pointer bg-[#4b0082] text-white"
                    onClick={() => setEditedTask({ ...editedTask, priority })}
                  >
                    {priority}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="text-[#ff7518]">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} className="bg-[#ff7518] text-black">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TaskCard;