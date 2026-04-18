import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type NotificationType = "mentor" | "task" | "system" | "pfe";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  read: boolean;
};

type NotificationContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  addNotification: (notification: Omit<NotificationItem, "id" | "read">) => void;
};

const STORAGE_KEY = "pfe-compass-notifications";

const seedNotifications: NotificationItem[] = [
  {
    id: "n-1",
    title: "Mentor meeting scheduled",
    message: "Dr. Karim Belhaj confirmed your next sync for tomorrow at 14:00.",
    time: "5 min ago",
    type: "mentor",
    read: false,
  },
  {
    id: "n-2",
    title: "PFE topic update",
    message: "Your top-fit project idea was refreshed based on your latest academic trend.",
    time: "1 hour ago",
    type: "pfe",
    read: false,
  },
  {
    id: "n-3",
    title: "Deadline reminder",
    message: "Upload the senior-year transcript before the end of the week to keep your readiness score high.",
    time: "Today",
    type: "task",
    read: true,
  },
];

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

function getStoredNotifications(): NotificationItem[] {
  if (typeof window === "undefined") {
    return seedNotifications;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return seedNotifications;
  }

  try {
    const parsed = JSON.parse(raw) as NotificationItem[];
    return Array.isArray(parsed) ? parsed : seedNotifications;
  } catch {
    return seedNotifications;
  }
}

function saveNotifications(notifications: NotificationItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getStoredNotifications());

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((notification) => !notification.read).length,
      markAsRead: (id) => {
        setNotifications((current) =>
          current.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
        );
      },
      markAllAsRead: () => {
        setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
      },
      clearAll: () => {
        setNotifications([]);
      },
      addNotification: (notification) => {
        setNotifications((current) => [
          {
            id: `n-${Date.now()}`,
            read: false,
            ...notification,
          },
          ...current,
        ]);
      },
    }),
    [notifications],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }

  return context;
}
