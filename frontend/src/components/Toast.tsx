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
          className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slideInRight bg-(--color-box-bg) border border-(--color-box-border)"
          style={{
            borderColor: toast.type === "error" ? "var(--color-error)" : undefined,
          }}
        >
          <span
            className="text-sm font-medium"
            style={{
              color: toast.type === "error" ? "var(--color-error)" : "var(--color-white)",
            }}
          >
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
