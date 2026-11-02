import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { ToastContext } from "./ToastContextValue";

const toastStyles = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-300",
  },
  error: {
    icon: XCircle,
    iconClass: "text-rose-300",
  },
  info: {
    icon: Info,
    iconClass: "text-violet-300",
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }, []);

  const showToast = useCallback(
    (message, type = "info") => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((currentToasts) => [
        ...currentToasts,
        { id, message, type },
      ]);
      window.setTimeout(() => dismissToast(id), 4000);
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => {
          const { icon: Icon, iconClass } =
            toastStyles[toast.type] || toastStyles.info;

          return (
            <div
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
              className="toast-enter pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white shadow-2xl shadow-black/30 backdrop-blur-xl"
            >
              <Icon size={20} className={`shrink-0 ${iconClass}`} />
              <p className="flex-1">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-lg p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
