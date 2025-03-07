"use client";

import { useState, useEffect } from 'react';
import { AITaskCreator } from '@/components/ai-task-creator';
import { mockTasks } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Plus, 
  Calendar, 
  BarChart4, 
  Tag, 
  Filter, 
  X,
  SortAsc,
  SortDesc,
  CheckCircle2,
  Clock,
  ListFilter,
  MoreHorizontal,
  Trash2,
  Edit,
  AlertCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { TaskStats } from '@/components/task-stats';
import { TaskCalendarView } from '@/components/task-calendar-view';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import axios from 'axios';
import TaskCard from '@/components/ui/task-card';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAIForm, setShowAIForm] = useState(false);
  const [view, setView] = useState('list');
  const [newTask, setNewTask] = useState({
    id: '',
    title: '',
    description: '',
    completed: false,
    createdAt: new Date().toISOString(),
    priority: 'medium',
    tags: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const { toast } = useToast();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('api/tasks');
        if (response.data.success && Array.isArray(response.data.data)) {
          // Ensure each task has the required fields
          const formattedTasks = response.data.data.map(task => ({
            id: task._id || task.id,
            title: task.title || '',
            description: task.description || '',
            completed: task.completed || false,
            createdAt: task.createdAt || new Date().toISOString(),
            dueDate: task.dueDate || null,
            priority: task.priority || 'medium',
            tags: task.tags || []
          }));
          setTasks(formattedTasks);
        } else {
          console.error('Invalid response format:', response.data);
          toast({
            title: "Error fetching tasks",
            description: "Received invalid data format from server.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Error fetching tasks",
          description: "There was an issue retrieving tasks. Please try again later.",
          variant: "destructive",
        });
      }
    };
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    try {
      // Create a task object that matches the MongoDB schema
      const taskToAdd = {
        title: newTask.title,
        description: newTask.description || '',
        completed: false,
        priority: newTask.priority || 'medium',
        tags: newTask.tags || [],
        dueDate: newTask.dueDate || null
      };
      
      const response = await axios.post('api/tasks', taskToAdd);
      
      if (response.data.success && response.data.data) {
        // Format the returned task to match our component's expected structure
        const addedTask = {
          id: response.data.data._id,
          title: response.data.data.title,
          description: response.data.data.description || '',
          completed: response.data.data.completed || false,
          createdAt: response.data.data.createdAt,
          dueDate: response.data.data.dueDate || null,
          priority: response.data.data.priority || 'medium',
          tags: response.data.data.tags || []
        };
        
        setTasks([...tasks, addedTask]);
        setNewTask({
          id: '',
          title: '',
          description: '',
          completed: false,
          createdAt: new Date().toISOString(),
          priority: 'medium',
          tags: []
        });
        setShowAddForm(false);
        toast({
          title: "Task created",
          description: "Your new task has been added successfully.",
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error adding task",
        description: "There was an issue adding your task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === id);
      if (!taskToUpdate) return;
      
      // Use MongoDB's _id for the API request
      const mongoId = id.startsWith('new-') ? null : id;
      if (!mongoId) {
        // Handle local-only tasks that haven't been saved to MongoDB yet
        setTasks(tasks.map(task => 
          task.id === id ? { ...task, completed } : task
        ));
        return;
      }
      
      // Create an update object that matches the MongoDB schema
      const updateData = { completed };
      
      const response = await axios.put(`api/tasks/${mongoId}`, updateData);
      
      if (response.data.success) {
        setTasks(tasks.map(task => 
          task.id === id ? { ...task, completed } : task
        ));
        
        toast({
          title: completed ? "Task completed" : "Task reopened",
          description: completed ? "Task marked as completed" : "Task marked as pending",
        });
      } else {
        throw new Error('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error updating task",
        description: "There was an issue updating the task status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      // Use MongoDB's _id for the API request
      const mongoId = id.startsWith('new-') ? null : id;
      
      if (mongoId) {
        await axios.delete(`api/tasks/${mongoId}`);
      }
      
      setTasks(tasks.filter(task => task.id !== id));
      toast({
        title: "Task deleted",
        description: "The task has been removed.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error deleting task",
        description: "There was an issue deleting the task.",
        variant: "destructive",
      });
    }
  };

  const handleEditTask = async (id, updatedTask) => {
    try {
      // Use MongoDB's _id for the API request
      const mongoId = id.startsWith('new-') ? null : id;
      
      if (!mongoId) {
        // Handle local-only tasks that haven't been saved to MongoDB yet
        setTasks(tasks.map(task => 
          task.id === id ? { ...task, ...updatedTask } : task
        ));
        return;
      }
      
      // Create an update object that matches the MongoDB schema
      const updateData = {
        title: updatedTask.title,
        description: updatedTask.description || '',
        completed: updatedTask.completed || false,
        priority: updatedTask.priority || 'medium',
        tags: updatedTask.tags || [],
        dueDate: updatedTask.dueDate || null
      };
      
      const response = await axios.put(`/api/tasks/${mongoId}`, updateData);
      
      if (response.data.success) {
        setTasks(tasks.map(task => 
          task.id === id ? { ...task, ...updatedTask } : task
        ));
        
        toast({
          title: "Task updated",
          description: "The task has been updated successfully.",
        });
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error updating task",
        description: "There was an issue updating the task.",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = (ids) => {
    setTasks(tasks.filter(task => !ids.includes(task.id)));
    toast({
      title: "Tasks deleted",
      description: `${ids.length} tasks have been removed.`,
      variant: "destructive"
    });
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const toggleTagFilter = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSelectedPriority('');
    setSearchQuery('');
  };

  const allTags = [...new Set(tasks.flatMap(task => task.tags || []))];

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesTags = selectedTags.length === 0 || 
      (task.tags && selectedTags.every(tag => task.tags.includes(tag)));
    
    const matchesPriority = !selectedPriority || task.priority === selectedPriority;
    
    return matchesSearch && matchesTags && matchesPriority;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return sortDirection === 'asc' ? 1 : -1;
      if (!b.dueDate) return sortDirection === 'asc' ? -1 : 1;
      
      return sortDirection === 'asc' 
        ? new Date(a.dueDate) - new Date(b.dueDate)
        : new Date(b.dueDate) - new Date(a.dueDate);
    }
    
    if (sortBy === 'priority') {
      const priorityValues = { high: 3, medium: 2, low: 1 };
      return sortDirection === 'asc'
        ? priorityValues[a.priority] - priorityValues[b.priority]
        : priorityValues[b.priority] - priorityValues[a.priority];
    }
    
    return sortDirection === 'asc'
      ? new Date(a.createdAt) - new Date(b.createdAt)
      : new Date(b.createdAt) - new Date(a.createdAt);
  });

  const completedTasks = sortedTasks.filter((task) => task.completed);
  const pendingTasks = sortedTasks.filter((task) => !task.completed);

  const getCompletionStats = () => {
    const totalTasks = tasks.length;
    const completedCount = tasks.filter(task => task.completed).length;
    const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    
    return { total: totalTasks, completed: completedCount, percentage };
  };

  const stats = getCompletionStats();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Task Manager</h1>
            <p className="text-muted-foreground mt-1">
              Organize, prioritize, and complete your tasks efficiently
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setShowAddForm(!showAddForm)} className="sm:w-auto bg-[#ff7518] text-black hover:bg-[#e56b16]">
              <Plus className="h-4 w-4 mr-2" />
              {showAddForm ? "Hide Form" : "New Task"}
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="sm:w-auto border-[#4b0082] text-[#4b0082] hover:bg-[#4b0082] hover:text-white">
                  <ListFilter className="h-4 w-4 mr-2" />
                  Bulk Actions
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#222] text-white">
                <DialogHeader>
                  <DialogTitle>Bulk Actions</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Perform actions on multiple tasks at once.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Button 
                    variant="destructive" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => handleBulkDelete(completedTasks.map(task => task.id))}
                    disabled={completedTasks.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Completed Tasks ({completedTasks.length})
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-[#ff7518] text-[#ff7518] hover:bg-[#ff7518] hover:text-black"
                    onClick={() => {
                      pendingTasks.forEach(task => {
                        handleToggleComplete(task.id, true);
                      });
                    }}
                    disabled={pendingTasks.length === 0}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark All Pending as Complete ({pendingTasks.length})
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Status Overview Card */}
        <Card className="bg-[#333] border-[#444]">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium">Progress</h3>
                  <span className="text-sm text-muted-foreground">{stats.percentage}%</span>
                </div>
                <Progress value={stats.percentage} className="h-2 bg-[#222]" indicatorClassName="bg-[#ff7518]" />
                <p className="text-xs text-muted-foreground">
                  {stats.completed} of {stats.total} tasks completed
                </p>
              </div>
              
              <div className="flex items-center gap-6 justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold">{pendingTasks.length}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <Separator orientation="vertical" className="h-12 bg-[#444]" />
                <div className="text-center">
                  <div className="text-3xl font-bold">{completedTasks.length}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
              
              <div className="flex justify-end items-center gap-2">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    className="pl-8 bg-[#222] border-[#444] text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* AI Task Creator */}
        {showAddForm && (
          <Card className="border-dashed border-2 bg-[#333] border-[#444]">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Add New Task</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="bg-[#222] border-[#444] text-white"
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newTask.description || ''}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="bg-[#222] border-[#444] text-white"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleAddTask} className="bg-[#ff7518] text-black hover:bg-[#e56b16]">Add Task</Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)} className="border-[#444] text-white hover:bg-[#444]">Cancel</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* View Selection & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={view === 'list' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setView('list')}
                    className={`h-9 px-3 ${view === 'list' ? 'bg-[#ff7518] text-black' : 'border-[#444] text-white'}`}
                  >
                    <ListFilter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#222] text-white">List View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={view === 'calendar' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setView('calendar')}
                    className={`h-9 px-3 ${view === 'calendar' ? 'bg-[#ff7518] text-black' : 'border-[#444] text-white'}`}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#222] text-white">Calendar View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={view === 'stats' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setView('stats')}
                    className={`h-9 px-3 ${view === 'stats' ? 'bg-[#ff7518] text-black' : 'border-[#444] text-white'}`}
                  >
                    <BarChart4 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#222] text-white">Statistics</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Separator orientation="vertical" className="h-8 mx-1 hidden sm:block bg-[#444]" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 border-[#444] text-white">
                  {sortDirection === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                  {sortBy === 'createdAt' ? 'Date Created' : sortBy === 'dueDate' ? 'Due Date' : 'Priority'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-[#222] text-white">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#444]" />
                <DropdownMenuItem onClick={() => { setSortBy('createdAt'); toggleSortDirection(); }}>
                  Date Created {sortBy === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('dueDate'); toggleSortDirection(); }}>
                  Due Date {sortBy === 'dueDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('priority'); toggleSortDirection(); }}>
                  Priority {sortBy === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 border-[#444] text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {(selectedTags.length > 0 || selectedPriority) && (
                    <Badge variant="secondary" className="ml-2 px-1 bg-[#4b0082] text-white">
                      {selectedTags.length + (selectedPriority ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#222] text-white">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#444]" />
                
                <div className="p-2">
                  <h4 className="text-sm font-medium mb-2">Priority</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge 
                      variant={selectedPriority === 'high' ? 'default' : 'outline'}
                      className="cursor-pointer bg-[#4b0082] text-white"
                      onClick={() => setSelectedPriority(selectedPriority === 'high' ? null : 'high')}
                    >
                      High
                    </Badge>
                    <Badge 
                      variant={selectedPriority === 'medium' ? 'default' : 'outline'}
                      className="cursor-pointer bg-[#4b0082] text-white"
                      onClick={() => setSelectedPriority(selectedPriority === 'medium' ? null : 'medium')}
                    >
                      Medium
                    </Badge>
                    <Badge 
                      variant={selectedPriority === 'low' ? 'default' : 'outline'}
                      className="cursor-pointer bg-[#4b0082] text-white"
                      onClick={() => setSelectedPriority(selectedPriority === 'low' ? null : 'low')}
                    >
                      Low
                    </Badge>
                  </div>
                </div>
                
                <DropdownMenuSeparator className="bg-[#444]" />
                
                <div className="p-2">
                  <h4 className="text-sm font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {allTags.map(tag => (
                      <Badge 
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer bg-[#4b0082] text-white"
                        onClick={() => toggleTagFilter(tag)}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {allTags.length === 0 && (
                      <span className="text-xs text-muted-foreground">No tags available</span>
                    )}
                  </div>
                </div>
                
                <DropdownMenuSeparator className="bg-[#444]" />
                
                <div className="p-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-center text-[#ff7518]"
                    onClick={clearFilters}
                    disabled={selectedTags.length === 0 && !selectedPriority && !searchQuery}
                  >
                    <X className="h-3 w-3 mr-2" />
                    Clear filters
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {(selectedTags.length > 0 || selectedPriority || searchQuery) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearFilters}
                className="h-9 text-[#ff7518]"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedTags.length > 0 || selectedPriority || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-[#4b0082] text-white">
                <Search className="h-3 w-3" />
                "{searchQuery}"
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setSearchQuery('')}
                />
              </Badge>
            )}
            
            {selectedPriority && (
              <Badge variant="secondary" className="flex items-center gap-1 capitalize bg-[#4b0082] text-white">
                <AlertCircle className="h-3 w-3" />
                {selectedPriority} priority
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setSelectedPriority(null)}
                />
              </Badge>
            )}

            {selectedTags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1 bg-[#4b0082] text-white">
                <Tag className="h-3 w-3" />
                {tag}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => toggleTagFilter(tag)}
                />
              </Badge>
            ))}
          </div>
        )}

        {view === 'list' && (
          <Card className="bg-[#333] border-[#444]">
            <CardHeader className="p-4 pb-0">
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-[#222]">
                  <TabsTrigger value="pending" className="data-[state=active]:bg-[#ff7518] data-[state=active]:text-black">
                    Pending ({pendingTasks.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="data-[state=active]:bg-[#ff7518] data-[state=active]:text-black">
                    Completed ({completedTasks.length})
                  </TabsTrigger>
                  <TabsTrigger value="all" className="data-[state=active]:bg-[#ff7518] data-[state=active]:text-black">
                    All ({sortedTasks.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending" className="mt-6 px-2">
                  {pendingTasks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium mb-1">All caught up!</h3>
                      <p>No pending tasks found.</p>
                    </div>
                  ) : (
                    pendingTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDeleteTask}
                        onEdit={handleEditTask}
                      />
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="completed" className="mt-6 px-2">
                  {completedTasks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium mb-1">No completed tasks yet!</h3>
                      <p>Complete some tasks to see them here.</p>
                    </div>
                  ) : (
                    completedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDeleteTask}
                        onEdit={handleEditTask}
                      />
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="all" className="mt-6 px-2">
                  {sortedTasks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium mb-1">No tasks found!</h3>
                      <p>Add some tasks to get started.</p>
                    </div>
                  ) : (
                    sortedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDeleteTask}
                        onEdit={handleEditTask}
                      />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        )}

        {view === 'calendar' && (
          <TaskCalendarView tasks={sortedTasks} onToggleComplete={handleToggleComplete} />
        )}

        {view === 'stats' && (
          <TaskStats tasks={tasks} />
        )}
      </div>
    </div>
  );
};

export default TaskManager;