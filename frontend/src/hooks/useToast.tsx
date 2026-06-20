import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";

type ToastType = "error" | "success" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const currentTimeouts = timeoutsRef.current;
    return () => {
      currentTimeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "error") => {
    const uniqueId = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.floor(Math.random() * 1_000_000_000)}`;
    const id = `toast_${uniqueId}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timeoutsRef.current.delete(id);
    }, 5000);
    timeoutsRef.current.set(id, timeout);
  }, []);

  const removeToast = useCallback((id: string) => {
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
