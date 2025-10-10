// src/models/dataModels.ts
export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  reminderTime?: string; // ISO string
  priority?: "low" | "medium" | "high";
  completed: boolean;
  category?: string;
  optimalTime?: string; // HH:MM
  notified?: boolean;
};

export type Goal = {
  id: string;
  title: string;
  description?: string;
  progress: number;
  target: number;
  unit?: string;
  targetDate?: string; // YYYY-MM-DD
};

export type Reminder = {
  id: string;
  title: string;
  dateTime: string; // ISO
  repeat?: "none" | "daily" | "weekly";
  taskId?: string | null;
  message?: string;
  interacted?: boolean;
  notificationId?: string | null;
};
