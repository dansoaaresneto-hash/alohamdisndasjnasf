export enum TaskStatus {
  Pending = 'PENDING',
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS'
}

export enum Category {
  Work = 'Work',
  Health = 'Health',
  Personal = 'Personal',
  Shopping = 'Shopping',
  Other = 'Other'
}

export enum RecurrenceFrequency {
  None = 'None',
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly'
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  readableId: number; // e.g. 1, 2, 3
  title: string;
  description?: string;
  time: string; // e.g., "8:00 am"
  date: Date;
  status: TaskStatus;
  category: Category;
  recurrence?: RecurrenceFrequency;
  subtasks?: Subtask[];
  progress?: {
    current: number;
    total: number;
  };
}

export interface AITaskSuggestion {
  title: string;
  category: string;
  time: string;
  description: string;
}

export type ProjectBlockType = 'text' | 'h1' | 'h2' | 'task' | 'bullet';

export interface ProjectBlock {
  id: string;
  type: ProjectBlockType;
  content: string;
  taskId?: string; // If type is task
}

export interface Project {
  id: string;
  title: string;
  icon: string;
  blocks: ProjectBlock[];
  updatedAt: Date;
}