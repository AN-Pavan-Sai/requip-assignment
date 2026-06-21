import { useState, useEffect, useCallback, useRef } from 'react';
import type { User, UserFormData, PaginationInfo } from './types/user';
import { userApi } from './services/api';
import UserTable from './components/UserTable';
import UserForm from './components/UserForm';
import DeleteConfirm from './components/DeleteConfirm';
import { Users, FileText, BarChart, Search, Plus, CheckCircle, XCircle, X } from 'lucide-react';

/**
 * Toast notification type.
 */
interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

/**
 * Main application shell.
 * Manages global state for user list, modals, search, pagination, and toast notifications.
 */
export default function App() {
  // ── State ────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Search debounce
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Toast Helpers ────────────────────────────────────
  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ── Fetch Users ──────────────────────────────────────
  const fetchUsers = useCallback(async (page: number, searchTerm: string) => {
    setIsLoading(true);
    try {
      const response = await userApi.getAll(page, 10, searchTerm);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch users';
      addToast('error', message);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Initial load & reload on page/search change
  useEffect(() => {
    fetchUsers(currentPage, search);
  }, [currentPage, fetchUsers]);

  // Debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, value);
    }, 400);
  };

  // ── Create/Update Handler ────────────────────────────
  const handleFormSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await userApi.update(editingUser.id, data);
        addToast('success', `User "${data.name}" updated successfully`);
      } else {
        await userApi.create(data);
        addToast('success', `User "${data.name}" created successfully`);
      }
      setShowForm(false);
      setEditingUser(null);
      fetchUsers(currentPage, search);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        'Operation failed';
      addToast('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete Handler ───────────────────────────────────
  const handleDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      await userApi.delete(deletingUser.id);
      addToast('success', `User "${deletingUser.name}" deleted successfully`);
      setDeletingUser(null);
      fetchUsers(currentPage, search);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete user';
      addToast('error', message);
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Modal Openers ────────────────────────────────────
  const openCreateForm = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const openEditForm = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  // ── Render ───────────────────────────────────────────
  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-brand">
            <div className="header-logo">R</div>
            <div>
              <h1 className="header-title">User Management</h1>
              <p className="header-subtitle">Manage user records with ease</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-icon primary"><Users size={24} /></div>
            <div>
              <div className="stat-value">{pagination.totalItems}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon cyan"><FileText size={24} /></div>
            <div>
              <div className="stat-value">{pagination.totalPages}</div>
              <div className="stat-label">Total Pages</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success"><BarChart size={24} /></div>
            <div>
              <div className="stat-value">{users.length}</div>
              <div className="stat-label">Showing</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-container">
              <span className="search-icon"><Search size={18} /></span>
              <input
                className="search-input"
                type="text"
                placeholder="Search by name, email, or mobile..."
                value={search}
                onChange={handleSearchChange}
                id="search-input"
              />
            </div>
          </div>
          <button className="btn btn-primary" onClick={openCreateForm} id="add-user-btn">
            <Plus size={18} style={{ marginRight: '6px' }} /> Add User
          </button>
        </div>

        {/* User Table */}
        <UserTable
          users={users}
          pagination={pagination}
          isLoading={isLoading}
          onEdit={openEditForm}
          onDelete={setDeletingUser}
          onPageChange={setCurrentPage}
        />
      </main>

      {/* Create/Edit Modal */}
      {showForm && (
        <UserForm
          user={editingUser}
          onSubmit={handleFormSubmit}
          onClose={closeForm}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <DeleteConfirm
          userName={deletingUser.name}
          onConfirm={handleDelete}
          onCancel={() => setDeletingUser(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="toast-container" id="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`} id={`toast-${toast.id}`}>
              <span>{toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}</span>
              <span>{toast.message}</span>
              <button className="toast-close" onClick={() => removeToast(toast.id)}>
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
