import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type User = {
  name: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
};

type StoredUser = User & { password: string };

const USER_STORAGE_KEY = "pfe-compass-users";
const SESSION_STORAGE_KEY = "pfe-compass-session";
const DEFAULT_USERS: StoredUser[] = [
  {
    name: "Demo Student",
    email: "student@example.com",
    password: "password123",
  },
];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(USER_STORAGE_KEY);

  if (!raw) {
    return DEFAULT_USERS;
  }

  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const sessionRaw = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!sessionRaw) {
      return;
    }

    try {
      const session = JSON.parse(sessionRaw) as User;
      if (session?.email && session?.name) {
        setUser(session);
      }
    } catch {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: async (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const users = getStoredUsers();
        const matchedUser = users.find((candidate) => candidate.email.toLowerCase() === normalizedEmail);

        if (!matchedUser || matchedUser.password !== password) {
          throw new Error("Invalid email or password.");
        }

        const session = { name: matchedUser.name, email: matchedUser.email };
        setUser(session);
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      },
      signUp: async (name, email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const users = getStoredUsers();

        if (users.some((candidate) => candidate.email.toLowerCase() === normalizedEmail)) {
          throw new Error("An account with this email already exists.");
        }

        const nextUser: StoredUser = {
          name: name.trim(),
          email: normalizedEmail,
          password,
        };

        saveStoredUsers([...users, nextUser]);
        const session = { name: nextUser.name, email: nextUser.email };
        setUser(session);
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      },
      signOut: () => {
        setUser(null);
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}