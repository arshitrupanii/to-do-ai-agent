"use strict";
import TaskManager from '@/components/task-manager';

export default function Home() {

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">TaskAI</h1>
          <p className="text-muted-foreground">Smart task management with AI assistance</p>
        </header> */}
        <TaskManager />
      </div>
    </div>
  );
}