import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import { deleteUser } from '../../../services/userApi';
import type { User } from '../../../types/user';

interface UserDeleteDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

const UserDeleteDialog = ({ user, open, onClose, onDeleted }: UserDeleteDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setLoading(false);
  }, [open, user]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, loading, onClose]);

  if (!open || !user) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await deleteUser(user.id);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-1100 flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Close dialog"
        onClick={() => {
          if (!loading) onClose();
        }}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-user-title"
        aria-describedby="delete-user-description"
        className="relative z-10 w-full max-w-md rounded-t-xl bg-white p-6 shadow-xl sm:rounded-lg"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2 id="delete-user-title" className="text-lg font-semibold text-slate-900">
                Delete user
              </h2>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p id="delete-user-description" className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete{' '}
              <span className="font-medium text-slate-900">
                {user.firstName} {user.lastName}
              </span>{' '}
              ({user.email})? This action cannot be undone.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={loading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? 'Deleting…' : 'Delete user'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default UserDeleteDialog;
