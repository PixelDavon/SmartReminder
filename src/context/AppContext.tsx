// src/context/AppContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  cancelNotification,
  initNotifications,
  scheduleReminder,
} from "@utils/notifications";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ==============================
// TYPES
// ==============================

export type RepeatType = "none" | "daily" | "weekly";

export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO date (YYYY-MM-DD)
  reminderTimeISO?: string | null; // ISO datetime for reminders
  priority?: "low" | "medium" | "high";
  completed: boolean;
  notified?: boolean;
};

export type Goal = {
  id: string;
  title: string;
  description?: string;
  progress: number;
  target: number;
  targetDate?: string;
  unit?: string;
};

export type Reminder = {
  id: string;
  title: string;
  message?: string;
  dateTimeISO: string;
  repeat: RepeatType;
  taskId?: string | null;
  notificationId?: string | null;
  interacted?: boolean;
};

// ==============================
// CONTEXT TYPE
// ==============================

type AppContextType = {
  tasks: Task[];
  goals: Goal[];
  reminders: Reminder[];

  addTask: (payload: Omit<Task, "id" | "completed">) => Promise<Task>;
  removeTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;

  addGoal: (payload: Omit<Goal, "id" | "progress">) => Promise<Goal>;
  updateGoalProgress: (id: string, delta: number) => void;
  removeGoal: (id: string) => void;

  addReminder: (payload: {
    title: string;
    message?: string;
    dateTimeISO: string;
    repeat?: RepeatType;
    taskId?: string | null;
  }) => Promise<Reminder | null>;
  removeReminder: (id: string) => Promise<void>;

  addItem: (
    tabName: "Tugas" | "Tujuan" | "Pengingat",
    payload: any
  ) => Promise<any>;
};

// ==============================
// INITIAL STATE
// ==============================

const STORAGE_KEY = "smartReminder:v1";

const AppContext = createContext<AppContextType | undefined>(undefined);

// ==============================
// PROVIDER
// ==============================

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [ready, setReady] = useState(false);

  // Load persisted data
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setTasks(parsed.tasks || []);
          setGoals(parsed.goals || []);
          setReminders(parsed.reminders || []);
        }
      } catch (err) {
        console.warn("AppProvider: failed to load storage", err);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Save on change
  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const data = { tasks, goals, reminders };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        console.warn("AppProvider: failed to save storage", err);
      }
    })();
  }, [tasks, goals, reminders, ready]);

  // Initialize notifications
  useEffect(() => {
    initNotifications();
  }, []);

  // ==============================
  // TASK FUNCTIONS
  // ==============================

  const addTask = useCallback(
    async (payload: Omit<Task, "id" | "completed">) => {
      const id = Date.now().toString();
      const task: Task = {
        id,
        title: payload.title,
        description: payload.description,
        dueDate: payload.dueDate,
        reminderTimeISO: payload.reminderTimeISO ?? null,
        priority: payload.priority ?? "medium",
        completed: false,
        notified: false,
      };
      setTasks((prev) => [task, ...prev]);

      // Schedule reminder if available
      if (task.reminderTimeISO) {
        await addReminder({
          title: `Pengingat: ${task.title}`,
          message: task.description,
          dateTimeISO: task.reminderTimeISO,
          repeat: "none",
          taskId: task.id,
        });
      }

      return task;
    },
    []
  );

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTaskCompletion = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );

    // mark linked reminders as interacted
    setReminders((prev) =>
      prev.map((r) =>
        r.taskId === id ? { ...r, interacted: true } : r
      )
    );
  }, []);

  // ==============================
  // GOAL FUNCTIONS
  // ==============================

  const addGoal = useCallback(
    async (payload: Omit<Goal, "id" | "progress">) => {
      const id = Date.now().toString();
      const goal: Goal = {
        id,
        title: payload.title,
        description: payload.description,
        targetDate: payload.targetDate,
        progress: 0,
        target: payload.target || 1,
        unit: payload.unit,
      };
      setGoals((prev) => [goal, ...prev]);
      return goal;
    },
    []
  );

  const updateGoalProgress = useCallback((id: string, delta: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, progress: Math.min(g.progress + delta, g.target) }
          : g
      )
    );
  }, []);

  const removeGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  // ==============================
  // REMINDER FUNCTIONS
  // ==============================

  const addReminder = useCallback(
    async (payload: {
      title: string;
      message?: string;
      dateTimeISO: string;
      repeat?: RepeatType;
      taskId?: string | null;
    }) => {
      try {
        const id = Date.now().toString();
        const repeat = payload.repeat ?? "none";

        const notificationId = await scheduleReminder(
          payload.title,
          payload.message || "",
          payload.dateTimeISO,
          repeat
        );

        const reminder: Reminder = {
          id,
          title: payload.title,
          message: payload.message,
          dateTimeISO: payload.dateTimeISO,
          repeat,
          taskId: payload.taskId ?? null,
          notificationId: notificationId ?? null,
          interacted: false,
        };

        setReminders((prev) => [reminder, ...prev]);
        return reminder;
      } catch (err) {
        console.warn("addReminder failed:", err);
        return null;
      }
    },
    []
  );

  const removeReminder = useCallback(
    async (id: string) => {
      const target = reminders.find((r) => r.id === id);
      if (target?.notificationId) {
        await cancelNotification(target.notificationId);
      }
      setReminders((prev) => prev.filter((r) => r.id !== id));
    },
    [reminders]
  );

  // ==============================
  // GENERIC addItem (used by modal input)
  // ==============================

  const addItem = useCallback(
    async (tabName: "Tugas" | "Tujuan" | "Pengingat", payload: any) => {
      if (tabName === "Tugas") return addTask(payload);
      if (tabName === "Tujuan") return addGoal(payload);
      return addReminder(payload);
    },
    [addTask, addGoal, addReminder]
  );

  // ==============================
  // PROVIDER VALUE
  // ==============================

  const value: AppContextType = {
    tasks,
    goals,
    reminders,
    addTask,
    removeTask,
    toggleTaskCompletion,
    addGoal,
    updateGoalProgress,
    removeGoal,
    addReminder,
    removeReminder,
    addItem,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

// ==============================
// HOOK
// ==============================

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx)
    throw new Error("useAppContext must be used within an AppProvider");
  return ctx;
};

export default AppProvider;
