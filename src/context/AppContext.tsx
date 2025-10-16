// src/context/AppContext.tsx
import { Goal, Reminder, Task } from "@models/dataModels";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { exportDataToJSON, importDataFromJSON } from "@utils/dataIO";
import {
  cancelReminder,
  initializeNotifications,
  scheduleReminder,
} from "@utils/notifications";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "smartReminder:v1";

function makeId(prefix = "") {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

type TaskInput = {
  title: string;
  description?: string;
  dueDate?: string | undefined;
  reminderTimeISO?: string | null;
  priority?: "low" | "medium" | "high";
  reminderType?: "none" | "daily" | "priority";
};

type GoalInput = {
  title: string;
  description?: string;
  target: number;
  unit?: string;
  targetDate?: string | undefined;
  priority?: "low" | "medium" | "high";
  reminderTimeISO?: string | null;
  reminderType?: "none" | "daily" | "priority";
};

type ReminderInput = {
  title: string;
  message?: string;
  dateTimeISO: string;
  repeat?: "none" | "daily" | "priority";
  repeatIntervalDays?: number | null;
  priority?: "low" | "medium" | "high";
  linkedTaskId?: string | null;
  linkedGoalId?: string | null;
  note?: string | null;
};

export interface AppContextValue {
  tasks: Task[];
  goals: Goal[];
  reminders: Reminder[];

  addTask: (input: TaskInput) => Promise<Task>;
  editTask: (task: Task) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => void;

  addGoal: (input: GoalInput) => Promise<Goal>;
  editGoal: (goal: Goal) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  updateGoalProgress: (id: string, delta: number) => void;

  addReminder: (input: ReminderInput) => Promise<Reminder>;
  removeReminder: (id: string) => Promise<void>;

  exportData: () => Promise<string | null>;
  importData: (json: string) => Promise<boolean>;

  undoLast: () => Promise<void>;
}

const AppContext = createContext<AppContextValue>({} as AppContextValue);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const undoRef = useRef<any>(null);

  useEffect(() => { initializeNotifications().catch((e) => console.warn(e)); }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setTasks(parsed.tasks ?? []);
          setGoals(parsed.goals ?? []);
          setReminders(parsed.reminders ?? []);
        }
      } catch (err) {
        console.warn("Failed to load storage", err);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, goals, reminders })).catch(console.warn);
  }, [tasks, goals, reminders]);

  /* -------------------- TASKS -------------------- */
  const addTask = async (input: TaskInput): Promise<Task> => {
    const id = makeId("t_");
    const now = new Date().toISOString();
    const task: Task = {
      id,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate ?? undefined,
      reminderTimeISO: input.reminderTimeISO ?? null,
      priority: input.priority ?? "medium",
      completed: false,
      createdAt: now,
    };
    setTasks((p) => [...p, task]);

    if (input.reminderType && input.reminderType !== "none") {
      await createOrUpdateTaskReminder(task, input.reminderType, input.reminderTimeISO);
    }

    return task;
  };

  const editTask = async (task: Task) => {
    setTasks((p) => p.map((t) => (t.id === task.id ? task : t)));

    // Update linked reminders
    const linkedRems = reminders.filter((r) => r.taskId === task.id);
    if (linkedRems.length > 0 || task.reminderTimeISO) {
      const remType: "none" | "daily" | "priority" = task.reminderTimeISO ? "none" : "priority";
      await createOrUpdateTaskReminder(task, remType, task.reminderTimeISO);
    }
  };

  const createOrUpdateTaskReminder = async (task: Task, type: "none" | "daily" | "priority", specificTime?: string | null) => {
    const existing = reminders.filter((r) => r.taskId === task.id);

    let scheduleDate: Date | null = null;
    const now = new Date();

    if (specificTime) {
      const tmp = new Date(specificTime);
      if (!isNaN(tmp.getTime())) scheduleDate = tmp;
    } else if (type === "daily") {
      scheduleDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0);
    } else if (type === "priority") {
      const hour = task.priority === "high" ? 9 : task.priority === "medium" ? 13 : 18;
      scheduleDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0);
      if (scheduleDate.getTime() <= Date.now()) scheduleDate.setDate(scheduleDate.getDate() + 1);
    }

    if (scheduleDate) {
      for (const r of existing) {
        if (r.notificationId) {
          await cancelReminder(r.notificationId).catch(() => {});
        }
      }

      const notifId = await scheduleReminder(task.title, task.description ?? "", scheduleDate, type === "daily").catch(() => null);

      const rem: Reminder = {
        id: existing[0]?.id ?? makeId("r_"),
        title: task.title,
        message: task.description,
        dateTimeISO: scheduleDate.toISOString(),
        repeat: type === "daily" ? "daily" : "none",
        repeatIntervalDays: null,
        taskId: task.id,
        goalId: null,
        interacted: existing[0]?.interacted ?? false,
        notificationId: notifId ?? null,
        priority: task.priority,
        note: existing[0]?.note ?? null,
      };

      setReminders((p) => [...p.filter((r) => r.taskId !== task.id), rem]);
    }
  };

  const removeTask = async (id: string) => {
    const linked = reminders.filter((r) => r.taskId === id);
    undoRef.current = { action: "delete", payload: { tasks: tasks.filter((t) => t.id === id), reminders: linked } };

    for (const r of linked) {
      if (r.notificationId) await cancelReminder(r.notificationId).catch(() => {});
    }

    setReminders((p) => p.filter((r) => r.taskId !== id));
    setTasks((p) => p.filter((t) => t.id !== id));
  };

  const toggleTaskCompletion = (id: string) =>
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  /* -------------------- GOALS -------------------- */
  const addGoal = async (input: GoalInput): Promise<Goal> => {
    const id = makeId("g_");
    const now = new Date().toISOString();
    const goal: Goal = {
      id,
      title: input.title,
      description: input.description,
      progress: 0,
      target: Math.max(1, input.target),
      unit: input.unit,
      targetDate: input.targetDate ?? undefined,
      priority: input.priority ?? "medium",
      reminderTimeISO: input.reminderTimeISO ?? null,
      createdAt: now,
    };
    setGoals((p) => [...p, goal]);

    if (input.reminderTimeISO || input.reminderType) {
      await createOrUpdateGoalReminder(goal, input.reminderTimeISO ?? null);
    }

    return goal;
  };

  const editGoal = async (goal: Goal) => {
    setGoals((p) => p.map((g) => (g.id === goal.id ? goal : g)));
    await createOrUpdateGoalReminder(goal, goal.reminderTimeISO ?? null);
  };

  const createOrUpdateGoalReminder = async (goal: Goal, specificTime?: string | null) => {
    const existing = reminders.filter((r) => r.goalId === goal.id);

    if (!specificTime && existing.length === 0) return;

    let scheduleDate: Date | null = specificTime ? new Date(specificTime) : null;
    if (scheduleDate && isNaN(scheduleDate.getTime())) scheduleDate = null;

    if (scheduleDate) {
      for (const r of existing) {
        if (r.notificationId) await cancelReminder(r.notificationId).catch(() => {});
      }

      const notifId = await scheduleReminder(goal.title, goal.description ?? "", scheduleDate, false).catch(() => null);

      const rem: Reminder = {
        id: existing[0]?.id ?? makeId("r_"),
        title: goal.title,
        message: goal.description,
        dateTimeISO: scheduleDate.toISOString(),
        repeat: "none",
        repeatIntervalDays: null,
        taskId: null,
        goalId: goal.id,
        interacted: existing[0]?.interacted ?? false,
        notificationId: notifId ?? null,
        priority: goal.priority,
        note: existing[0]?.note ?? null,
      };

      setReminders((p) => [...p.filter((r) => r.goalId !== goal.id), rem]);
    }
  };

  const removeGoal = async (id: string) => {
    const linked = reminders.filter((r) => r.goalId === id);
    undoRef.current = { action: "delete", payload: { goals: goals.filter((g) => g.id === id), reminders: linked } };

    for (const r of linked) if (r.notificationId) await cancelReminder(r.notificationId).catch(() => {});

    setReminders((p) => p.filter((r) => r.goalId !== id));
    setGoals((p) => p.filter((g) => g.id !== id));
  };

  const updateGoalProgress = (id: string, delta: number) => {
    setGoals((p) =>
      p.map((g) => {
        if (g.id !== id) return g;
        const before = g.progress;
        const after = Math.min(g.target, Math.max(0, g.progress + delta));
        undoRef.current = { action: "progress", payload: { id, before, after } };
        return { ...g, progress: after };
      })
    );
  };

  /* -------------------- REMINDERS -------------------- */
  const addReminder = async (input: ReminderInput): Promise<Reminder> => {
    const id = makeId("r_");
    let notificationId: string | null = null;

    try {
      const d = new Date(input.dateTimeISO);
      if (!isNaN(d.getTime())) {
        notificationId = (await scheduleReminder(input.title, input.message ?? "", d, input.repeat === "daily")) ?? null;
      }
    } catch {}

    const rem: Reminder = {
      id,
      title: input.title,
      message: input.message,
      dateTimeISO: input.dateTimeISO,
      repeat: input.repeat ?? "none",
      repeatIntervalDays: input.repeatIntervalDays ?? null,
      taskId: input.linkedTaskId ?? null,
      goalId: input.linkedGoalId ?? null,
      interacted: false,
      notificationId,
      priority: input.priority ?? "medium",
      note: input.note ?? null,
    };

    setReminders((p) => [...p, rem]);
    return rem;
  };

  const removeReminder = async (id: string) => {
    const rem = reminders.find((r) => r.id === id);
    undoRef.current = { action: "delete", payload: { reminders: reminders.filter((r) => r.id === id) } };

    if (rem?.notificationId) await cancelReminder(rem.notificationId).catch(() => {});
    setReminders((p) => p.filter((r) => r.id !== id));
  };

  /* -------------------- export/import -------------------- */
  const exportData = async () => exportDataToJSON().catch(() => null);

  const importData = async (json: string) => {
    const ok = await importDataFromJSON(json);
    if (ok) {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setTasks(parsed.tasks ?? []);
        setGoals(parsed.goals ?? []);
        setReminders(parsed.reminders ?? []);
      }
    }
    return ok;
  };

  /* -------------------- UNDO -------------------- */
  const undoLast = async () => {
    if (!undoRef.current) return;
    const { action, payload } = undoRef.current;

    if (action === "delete" && payload) {
      if (payload.tasks) setTasks((p) => [...p, ...payload.tasks]);
      if (payload.goals) setGoals((p) => [...p, ...payload.goals]);

      if (payload.reminders) {
        for (const r of payload.reminders) {
          try {
            let notificationId = r.notificationId;
            if (!notificationId) {
              const dt = new Date(r.dateTimeISO);
              if (!isNaN(dt.getTime())) notificationId = (await scheduleReminder(r.title, r.message ?? "", dt, r.repeat === "daily")) ?? null;
            }
            setReminders((p) => [...p, { ...r, notificationId }]);
          } catch {
            setReminders((p) => [...p, r]);
          }
        }
      }
    } else if (action === "progress" && payload) {
      setGoals((p) => p.map((g) => (g.id === payload.id ? { ...g, progress: payload.before } : g)));
    }

    undoRef.current = null;
  };

  const value: AppContextValue = {
    tasks,
    goals,
    reminders,
    addTask,
    editTask,
    removeTask,
    toggleTaskCompletion,
    addGoal,
    editGoal,
    removeGoal,
    updateGoalProgress,
    addReminder,
    removeReminder,
    exportData,
    importData,
    undoLast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
export default AppContext;
