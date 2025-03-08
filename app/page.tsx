"use strict";
import TaskManager from '@/components/task-manager';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto ">
          {/* Simple Header */}
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2">TaskAI</h1>
            <p className="text-muted-foreground">Smart task management with AI assistance</p>
          </header>

          {/* Main Content */}
          <div className="bg-card rounded-lg border border-border p-6">
            <TaskManager />
          </div>

          {/* Simple Footer */}
          <footer className="mt-8 text-center text-sm text-muted-foreground">
            <p>TaskAI - Organize your work efficiently</p>
          </footer>
        </div>
      </div>
    </div>
  );
}