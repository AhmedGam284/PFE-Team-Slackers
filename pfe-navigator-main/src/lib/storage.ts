export const STORAGE_KEYS = {
  diagnosis: "pfe-compass-diagnosis",
  pfeProgress: "pfe-compass-pfe-progress",
} as const;

export const saveToStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore (quota / blocked storage)
  }
};

export const removeFromStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
};

export const loadFromStorage = <T>(
  key: string,
  options?: {
    validate?: (value: unknown) => value is T;
    removeIfInvalid?: boolean;
  },
): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    if (options?.validate) {
      const isValid = options.validate(parsed);
      if (!isValid) {
        if (options.removeIfInvalid ?? true) removeFromStorage(key);
        return null;
      }
    }

    return parsed as T;
  } catch {
    if (options?.removeIfInvalid ?? true) removeFromStorage(key);
    return null;
  }
};
