import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../lib/db";
import Task, { ITask } from "../../models/task";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "POST") {
    const { id, title, description, completed, dueDate, priority, tags }: ITask = req.body;
    try {
      const newTask = new Task({ id, title, description, completed, dueDate, priority, tags });
      await newTask.save();
      res.status(201).json({ success: true, task: newTask });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else if (req.method === "GET") {
    const tasks: ITask[] = await Task.find();
    res.status(200).json(tasks);
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
