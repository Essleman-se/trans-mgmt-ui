import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { createUser } from '../../../services/userApi';
import type { User } from '../../../types/user';
import { normalizeEmail } from '../../../utils/email';
import UserFormFields, { emptyUserFormValues, type UserFormValues } from './UserFormFields';

interface UserCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (user: User) => void;
}

const UserCreateModal = ({ open, onClose, onCreated }: UserCreateModalProps) => {
  const [values, setValues] = useState<UserFormValues>(emptyUserFormValues());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValues(emptyUserFormValues());
    setError(null);
    setLoading(false);
  }, [open]);

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

  if (!open) return null;

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
    const password = values.password;

    if (!firstName || !lastName) {
      setError('First name and last name are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await createUser({ firstName, lastName, email, phone, password });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-user-title"
        className="relative z-10 flex max-h-[min(92dvh,100dvh)] w-full max-w-lg flex-col rounded-t-xl bg-white shadow-xl sm:max-h-[min(85dvh,720px)] sm:rounded-lg"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
          <div className="min-w-0 pr-2">
            <h2 id="create-user-title" className="text-lg font-semibold text-slate-900">
              Add user
            </h2>
            <p className="mt-1 text-sm text-slate-600">Create a new user account.</p>
          </div>
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

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 [-webkit-overflow-scrolling:touch]">
            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <UserFormFields
              mode="create"
              values={values}
              onChange={handleChange}
              onEmailBlur={handleEmailBlur}
              idPrefix="create-user"
            />
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default UserCreateModal;
