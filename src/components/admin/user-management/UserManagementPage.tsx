import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchUsers } from '../../../services/userApi';
import type { User } from '../../../types/user';
import { normalizeEmail } from '../../../utils/email';
import UserTable from './UserTable';
import UserToolbar from './UserToolbar';
import UserCreateModal from './UserCreateModal';
import UserEditModal from './UserEditModal';
import UserDeleteDialog from './UserDeleteDialog';
import UserManagementToast from './UserManagementToast';

function matchesSearch(user: User, query: string): boolean {
  const haystack = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase();
  return haystack.includes(query);
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentUserEmail = useMemo(
    () => normalizeEmail(localStorage.getItem('userEmail') || ''),
    [],
  );

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
  }, []);

  const dismissSuccess = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setUsers([]);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => matchesSearch(user, query));
  }, [users, searchQuery]);

  const handleDeleteRequest = useCallback(
    (user: User) => {
      if (normalizeEmail(user.email) === currentUserEmail) {
        return;
      }
      setDeletingUser(user);
    },
    [currentUserEmail],
  );

  const showToolbar = !error;
  const showInitialLoading = loading && users.length === 0 && !error;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
      <p className="mt-2 text-slate-600">View and manage registered users.</p>

      {showToolbar && (
        <UserToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={() => void loadUsers()}
          onAddUser={() => setCreateModalOpen(true)}
          refreshing={loading}
        />
      )}

      {showInitialLoading && (
        <div className="mt-8 flex items-center gap-3 text-slate-600">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <span>Loading users…</span>
        </div>
      )}

      {!loading && error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
          <button
            type="button"
            onClick={() => void loadUsers()}
            className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">No users found.</p>
        </div>
      )}

      {!loading && !error && users.length > 0 && filteredUsers.length === 0 && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">No users match &ldquo;{searchQuery.trim()}&rdquo;.</p>
        </div>
      )}

      {!loading && !error && filteredUsers.length > 0 && (
        <UserTable
          users={filteredUsers}
          onEdit={setEditingUser}
          onDelete={handleDeleteRequest}
          currentUserEmail={currentUserEmail}
        />
      )}

      <UserCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => {
          void loadUsers();
          showSuccess('User created successfully.');
        }}
      />

      <UserEditModal
        user={editingUser}
        open={editingUser !== null}
        onClose={() => setEditingUser(null)}
        onUpdated={() => {
          void loadUsers();
          showSuccess('User updated successfully.');
        }}
      />

      <UserDeleteDialog
        user={deletingUser}
        open={deletingUser !== null}
        onClose={() => setDeletingUser(null)}
        onDeleted={() => {
          void loadUsers();
          showSuccess('User deleted successfully.');
        }}
      />

      <UserManagementToast message={successMessage} onDismiss={dismissSuccess} />
    </div>
  );
};

export default UserManagementPage;
