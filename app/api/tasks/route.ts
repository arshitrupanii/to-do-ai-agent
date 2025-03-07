import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/task';

export async function GET() {
  try {
    await dbConnect();
    const tasks = await Task.find({});
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const task = await Task.create(body);
    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
} 