import mongoose, { Schema, Document } from "mongoose";

// Define the TypeScript interface for a Task
export interface ITask extends Document {
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
  tags?: string[];
}

// Define the Mongoose schema
const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date },
    priority: { 
      type: String, 
      enum: ["low", "medium", "high"], 
      default: "medium" 
    },
    tags: { type: [String], default: [] }
  },
  {
    timestamps: true,
  }
);

// Export the Mongoose model
export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
