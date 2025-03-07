"use client";

import { useState, useEffect } from 'react';
import { AITaskCreator } from '@/components/ai-task-creator';
import { TaskCard } from '@/components/ui/task-card';
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
  SortDesc
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
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    setTasks(mockTasks);
  }, []);

  const handleAddTask = (newTask) => {
    setTasks([newTask, ...tasks]);
    console.log([newTask, ...tasks].map((e) => console.log(e)) + " new tasks ")
    setShowAddForm(false);
    toast({
      title: "Task created",
      description: "Your new task has been added successfully.",
    });
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

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {showAddForm && <AITaskCreator onAddTask={handleAddTask} />}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant={view === 'list' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setView('list')}
          >
            List
          </Button>
          <Button 
            variant={view === 'calendar' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setView('calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button 
            variant={view === 'stats' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setView('stats')}
          >
            <BarChart4 className="h-4 w-4 mr-2" />
            Stats
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {sortDirection === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
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

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Actions
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
                  Delete All Completed Tasks ({completedTasks.length})
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const updatedTasks = pendingTasks.map(task => ({
                      ...task,
                      completed: true
                    }));
                    
                    updatedTasks.forEach(task => {
                      handleToggleComplete(task.id, true);
                    });
                  }}
                  disabled={pendingTasks.length === 0}
                >
                  Mark All Pending as Complete ({pendingTasks.length})
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {view === 'list' && (
        <Tabs defaultValue="pending" className="mt-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedTasks.length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({sortedTasks.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending tasks found
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
          
          <TabsContent value="completed" className="mt-4">
            {completedTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No completed tasks found
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
          
          <TabsContent value="all" className="mt-4">
            {sortedTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tasks found
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
      )}

      {view === 'calendar' && (
        <TaskCalendarView tasks={sortedTasks} onToggleComplete={handleToggleComplete} />
      )}

      {view === 'stats' && (
        <TaskStats tasks={tasks} />
      )}
    </div>
  );
};

export default TaskManager;