import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X } from 'lucide-react';

interface UserManagementToastProps {
  message: string | null;
  onDismiss: () => void;
}

const UserManagementToast = ({ message, onDismiss }: UserManagementToastProps) => {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-1200 flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end">
      <div
        role="status"
        className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg"
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
        <p className="flex-1 text-sm font-medium text-emerald-900">{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 text-emerald-700 hover:bg-emerald-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default UserManagementToast;
