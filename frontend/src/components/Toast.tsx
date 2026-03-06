import { X } from "lucide-react";
import { useToast } from "../hooks/useToast";

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slideInRight bg-card border border-border"
          style={{
            borderColor: toast.type === "error" ? "var(--destructive)" : undefined,
          }}
        >
          <span
            className="text-sm font-medium"
            style={{
              color: toast.type === "error" ? "var(--destructive)" : "var(--foreground)",
            }}
          >
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
