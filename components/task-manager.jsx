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

// New TaskCard component designed here instead of importing
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
              id={`task-${task.id}`}
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

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [view, setView] = useState('list');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const { toast } = useToast();
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('/api/tasks');
        setTasks(response.data.data);
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
      const response = await axios.post('/api/tasks', newTask);
      setTasks([...tasks, response.data.data]);
      setNewTask({ title: '', description: '' });
      toast({
        title: "Task created",
        description: "Your new task has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error adding task",
        description: "There was an issue adding your task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = (id, completed) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, completed } : task))
    );
    toast({
      title: completed ? "Task completed" : "Task reopened",
      description: completed ? "Task marked as completed" : "Task marked as pending",
    });
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast({
      title: "Task deleted",
      description: "The task has been permanently removed.",
      variant: "destructive"
    });
  };

  const handleEditTask = (id, updatedTask) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, ...updatedTask } : task));
    toast({
      title: "Task updated",
      description: "Your changes have been saved.",
    });
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
    setSelectedPriority(null);
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
            <Button onClick={() => setShowAddForm(!showAddForm)} className="sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {showAddForm ? "Hide Form" : "New Task"}
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="sm:w-auto">
                  <ListFilter className="h-4 w-4 mr-2" />
                  Bulk Actions
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Actions</DialogTitle>
                  <DialogDescription>
                    Perform actions on multiple tasks at once.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => handleBulkDelete(completedTasks.map(task => task.id))}
                    disabled={completedTasks.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Completed Tasks ({completedTasks.length})
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
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
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium">Progress</h3>
                  <span className="text-sm text-muted-foreground">{stats.percentage}%</span>
                </div>
                <Progress value={stats.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {stats.completed} of {stats.total} tasks completed
                </p>
              </div>
              
              <div className="flex items-center gap-6 justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold">{pendingTasks.length}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <Separator orientation="vertical" className="h-12" />
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
                    className="pl-8"
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
          <Card className="border-dashed border-2 bg-accent/20">
            <CardContent className="p-6">
              <AITaskCreator onAddTask={handleAddTask} />
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
                    className="h-9 px-3"
                  >
                    <ListFilter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={view === 'calendar' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setView('calendar')}
                    className="h-9 px-3"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Calendar View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={view === 'stats' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setView('stats')}
                    className="h-9 px-3"
                  >
                    <BarChart4 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Statistics</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Separator orientation="vertical" className="h-8 mx-1 hidden sm:block" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  {sortDirection === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                  {sortBy === 'createdAt' ? 'Date Created' : sortBy === 'dueDate' ? 'Due Date' : 'Priority'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
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
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {(selectedTags.length > 0 || selectedPriority) && (
                    <Badge variant="secondary" className="ml-2 px-1">
                      {selectedTags.length + (selectedPriority ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="p-2">
                  <h4 className="text-sm font-medium mb-2">Priority</h4>
                  <div className="flex flex-wrap gap-1">
                    <Badge 
                      variant={selectedPriority === 'high' ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedPriority(selectedPriority === 'high' ? null : 'high')}
                    >
                      High
                    </Badge>
                    <Badge 
                      variant={selectedPriority === 'medium' ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedPriority(selectedPriority === 'medium' ? null : 'medium')}
                    >
                      Medium
                    </Badge>
                    <Badge 
                      variant={selectedPriority === 'low' ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedPriority(selectedPriority === 'low' ? null : 'low')}
                    >
                      Low
                    </Badge>
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                <div className="p-2">
                  <h4 className="text-sm font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {allTags.map(tag => (
                      <Badge 
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
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
                
                <DropdownMenuSeparator />
                
                <div className="p-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-center"
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
                className="h-9"
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
              <Badge variant="secondary" className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                "{searchQuery}"
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setSearchQuery('')}
                />
              </Badge>
            )}
            
            {selectedPriority && (
              <Badge variant="secondary" className="flex items-center gap-1 capitalize">
                <AlertCircle className="h-3 w-3" />
                {selectedPriority} priority
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setSelectedPriority(null)}
                />
              </Badge>
            )}
            
            {selectedTags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
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
          <Card>
            <CardHeader className="p-4 pb-0">
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending">
                    Pending ({pendingTasks.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Completed ({completedTasks.length})
                  </TabsTrigger>
                  <TabsTrigger value="all">All ({sortedTasks.length})</TabsTrigger>
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