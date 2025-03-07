import { AIResponse } from './types';

// This is a mock implementation of the Gemini API
// In a real application, you would replace this with actual API calls
export async function processTaskWithAI(userInput: string): Promise<AIResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simple keyword-based processing to simulate AI
  const input = userInput.toLowerCase();
  
  let priority = 'medium' as const;
  if (input.includes('urgent') || input.includes('important')) {
    priority = 'high';
  } else if (input.includes('whenever') || input.includes('low priority')) {
    priority = 'low';
  }
  
  // Extract potential date information
  let dueDate: string | undefined = undefined;
  if (input.includes('tomorrow')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dueDate = tomorrow.toISOString();
  } else if (input.includes('today')) {
    dueDate = new Date().toISOString();
  } else if (input.includes('next week')) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    dueDate = nextWeek.toISOString();
  }
  
  // Extract tags
  const tags: string[] = [];
  if (input.includes('shopping')) tags.push('shopping');
  if (input.includes('work')) tags.push('work');
  if (input.includes('personal')) tags.push('personal');
  if (input.includes('health')) tags.push('health');
  if (input.includes('food')) tags.push('food');
  
  return {
    title: userInput,
    description: 'AI-generated task from your input',
    dueDate,
    priority,
    tags: tags.length > 0 ? tags : undefined,
  };
}

// Function to ask follow-up questions based on the initial input
export function generateFollowUpQuestions(userInput: string): string[] {
  const questions: string[] = [];
  const input = userInput.toLowerCase();
  
  if (!input.includes('today') && !input.includes('tomorrow') && !input.includes('next week')) {
    questions.push('When do you need to complete this task?');
  }
  
  if (!input.includes('urgent') && !input.includes('important') && !input.includes('whenever') && !input.includes('priority')) {
    questions.push('What priority level would you assign to this task?');
  }
  
  if (questions.length === 0) {
    questions.push('Would you like to add any additional details to this task?');
  }
  
  return questions;
}