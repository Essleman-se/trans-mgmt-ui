import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { updateUser } from '../../../services/userApi';
import type { User } from '../../../types/user';
import { normalizeEmail } from '../../../utils/email';
import UserFormFields, { type UserFormValues, userToFormValues } from './UserFormFields';

interface UserEditModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (user: User) => void;
}

function editFormIsDirty(values: UserFormValues, user: User): boolean {
  return (
    values.firstName.trim() !== user.firstName ||
    values.lastName.trim() !== user.lastName ||
    normalizeEmail(values.email) !== normalizeEmail(user.email) ||
    values.phone.trim() !== user.phone
  );
}

const UserEditModal = ({ user, open, onClose, onUpdated }: UserEditModalProps) => {
  const [values, setValues] = useState<UserFormValues>(userToFormValues({ firstName: '', lastName: '', email: '', phone: '' }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = useMemo(() => (user ? editFormIsDirty(values, user) : false), [values, user]);

  useEffect(() => {
    if (!open || !user) return;
    setValues(userToFormValues(user));
    setError(null);
    setLoading(false);
  }, [open, user]);

  const requestClose = useCallback(() => {
    if (loading) return;
    if (user && editFormIsDirty(values, user) && !window.confirm('Discard unsaved changes?')) {
      return;
    }
    onClose();
  }, [loading, user, values, onClose]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        requestClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, loading, requestClose]);

  if (!open || !user) return null;

  const handleChange = (field: keyof UserFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleEmailBlur = () => {
    setValues((prev) => ({ ...prev, email: normalizeEmail(prev.email) }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    const email = normalizeEmail(values.email);
    const phone = values.phone.trim();

    if (!firstName || !lastName) {
      setError('First name and last name are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updated = await updateUser(user.id, { firstName, lastName, email, phone });
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
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
        onClick={requestClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-title"
        className="relative z-10 flex max-h-[min(92dvh,100dvh)] w-full max-w-lg flex-col rounded-t-xl bg-white shadow-xl sm:max-h-[min(85dvh,720px)] sm:rounded-lg"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
          <div className="min-w-0 pr-2">
            <h2 id="edit-user-title" className="text-lg font-semibold text-slate-900">
              Edit user
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Update {user.firstName} {user.lastName} (ID {user.id}).
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={loading}
            className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 [-webkit-overflow-scrolling:touch]">
            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <UserFormFields
              mode="edit"
              values={values}
              onChange={handleChange}
              onEmailBlur={handleEmailBlur}
              idPrefix="edit-user"
              status={user.status}
            />
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={requestClose}
              disabled={loading}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isDirty}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default UserEditModal;
