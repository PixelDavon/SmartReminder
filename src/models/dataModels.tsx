// src/models/dataModels.tsx
export type Priority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | undefined;
  reminderTimeISO: string | null;
  reminderType?: 'none' | 'daily' | 'priority';
  priority: Priority;
  completed: boolean;
  createdAt: string;
};

export type Goal = {
  id: string;
  title: string;
  description?: string;
  progress: number;
  target: number;
  unit?: string;
  targetDate?: string | undefined;
  reminderTimeISO: string | null;
  reminderType?: 'none' | 'daily' | 'priority';
  priority: Priority;
  createdAt: string;
};

export type Reminder = {
  id: string;
  title: string;
  message?: string;
  dateTimeISO: string; // ISO string
  repeat: 'none' | 'daily' | 'priority';
  repeatIntervalDays?: number | null;
  taskId?: string | null;
  goalId?: string | null;
  interacted?: boolean;
  notificationId?: string | null;
  priority?: Priority;
  note?: string | null;
};
