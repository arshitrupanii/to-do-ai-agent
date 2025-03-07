"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, MessageSquare, Plus, Sparkles } from 'lucide-react';
import { generateFollowUpQuestions, processTaskWithAI } from '@/lib/ai';
import { generateId } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export function AITaskCreator({ onAddTask }) {
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(undefined);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const { toast } = useToast();

  const handleAIProcess = async () => {
    if (!userInput.trim()) return;
    
    setIsProcessing(true);
    try {
      // Generate follow-up questions first
      const questions = generateFollowUpQuestions(userInput);
      setFollowUpQuestions(questions);
      
      // Process with AI
      const response = await processTaskWithAI(userInput);
      setAiResponse(response);
      
      // Pre-fill the form with AI suggestions
      setTitle(response.title);
      setDescription(response.description || '');
      setPriority(response.priority);
      if (response.dueDate) {
        setDueDate(new Date(response.dueDate));
      }
      setTags(response.tags || []);
      
      setShowTaskForm(true);
    } catch (error) {
      toast({
        title: "Error processing with AI",
        description: "There was a problem processing your request.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleCreateTask = () => {
    if (!title.trim()) return;
    
    const newTask = {
      id: generateId(),
      title,
      description: description || undefined,
      completed: false,
      createdAt: new Date(),
      dueDate,
      priority,
      tags: tags.length > 0 ? tags : undefined,
    };
    
    onAddTask(newTask);
    
    // Reset form
    setUserInput('');
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(undefined);
    setTags([]);
    setAiResponse(null);
    setFollowUpQuestions([]);
    setShowTaskForm(false);
    
    toast({
      title: "Task created",
      description: "Your task has been added to the list.",
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Create Task with AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Describe your task (e.g., 'Go shopping for food and milk')"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-1"
              disabled={isProcessing || showTaskForm}
            />
            <Button 
              onClick={handleAIProcess} 
              disabled={!userInput.trim() || isProcessing || showTaskForm}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4 mr-2" />
              )}
              {isProcessing ? "Processing..." : "Ask AI"}
            </Button>
          </div>
          
          {followUpQuestions.length > 0 && !showTaskForm && (
            <div className="bg-secondary/50 p-3 rounded-md">
              <h4 className="text-sm font-medium mb-2">AI would like to know:</h4>
              <ul className="space-y-1 text-sm">
                {followUpQuestions.map((question, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{question}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {showTaskForm && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task description"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Tags</label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddTag} disabled={!newTag.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 h-4 w-4 rounded-full hover:bg-muted flex items-center justify-center"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {showTaskForm && (
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowTaskForm(false);
              setFollowUpQuestions([]);
              setAiResponse(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateTask} disabled={!title.trim()}>
            Create Task
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}