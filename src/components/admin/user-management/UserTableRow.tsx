import { Pencil, Trash2 } from 'lucide-react';
import type { User } from '../../../types/user';

export function statusBadgeClass(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === 'ACTIVE') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
  }
  if (normalized === 'PENDING') {
    return 'bg-amber-50 text-amber-700 ring-amber-600/20';
  }
  if (normalized === 'SUSPENDED') {
    return 'bg-red-50 text-red-700 ring-red-600/20';
  }
  return 'bg-slate-50 text-slate-700 ring-slate-600/20';
}

interface UserTableRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  isSelf?: boolean;
}

const UserTableRow = ({ user, onEdit, onDelete, isSelf = false }: UserTableRowProps) => {
  return (
    <tr className="hover:bg-slate-50/80">
      <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-slate-500 md:table-cell">{user.id}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
        {user.firstName} {user.lastName}
      </td>
      <td className="max-w-[12rem] truncate px-4 py-3 text-sm text-slate-700 sm:max-w-none sm:whitespace-nowrap">
        {user.email}
      </td>
      <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-slate-700 lg:table-cell">{user.phone}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClass(user.status)}`}
        >
          {user.status}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
        <div className="inline-flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white p-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:px-2.5 sm:py-1.5"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Edit</span>
            <span className="sr-only sm:hidden">Edit {user.firstName}</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(user)}
            disabled={isSelf}
            title={isSelf ? 'You cannot delete your own account' : 'Delete user'}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white p-2 text-sm font-medium text-red-700 shadow-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-2.5 sm:py-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Delete</span>
            <span className="sr-only sm:hidden">Delete {user.firstName}</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserTableRow;
