import mongoose, { Schema, Document } from "mongoose";

// Define the TypeScript interface for a Task
export interface ITask extends Document {
  title: string;
  description: string;
  status: 'pending' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// Define the Mongoose schema
const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  },
  {
    timestamps: true,
  }
);

// Export the Mongoose model
export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
