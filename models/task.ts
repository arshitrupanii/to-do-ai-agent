import mongoose, { Schema, Document } from "mongoose";

// Define the TypeScript interface for a Task
export interface ITask extends Document {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
  tags: string[];
}

// Define the Mongoose schema
const TaskSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  dueDate: { type: Date },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  tags: { type: [String], default: [] },
});

// Export the Mongoose model
export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
