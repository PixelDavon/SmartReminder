// src/models/dataModels.tsx
export type Priority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | undefined; // YYYY-MM-DD (date only) or ISO string
  reminderTimeISO?: string | null; // ISO string for reminder or null
  priority?: Priority;
  completed: boolean;
  createdAt: string; // ISO
};

export type Goal = {
  id: string;
  title: string;
  description?: string;
  progress: number;
  target: number;
  unit?: string;
  targetDate?: string | undefined;
  priority?: Priority;
  reminderTimeISO?: string | null;
  createdAt: string;
};

export type Reminder = {
  id: string;
  title: string;
  message?: string;
  dateTimeISO: string; // ISO string
  repeat?: 'none' | 'daily' | 'priority';
  repeatIntervalDays?: number | null;
  taskId?: string | null;
  goalId?: string | null;
  interacted?: boolean;
  notificationId?: string | null;
  priority?: Priority;
  note?: string | null;
};
