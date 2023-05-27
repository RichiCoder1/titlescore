import { useToaster } from "react-hot-toast/headless";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastViewport,
} from "./ui/Toast";

export const Notifications = () => {
  const { toasts, handlers } = useToaster();

  return (
    <ToastProvider>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          duration={toast.duration}
          onPause={handlers.startPause}
          onResume={handlers.endPause}
          variant={toast.type === "error" ? "destructive" : "default"}
        >
          <div className="grid gap-1">
            {toast.message && (
              <ToastDescription>{toast.message as any}</ToastDescription>
            )}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
};
