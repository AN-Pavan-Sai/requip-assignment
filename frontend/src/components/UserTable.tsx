import type { User, PaginationInfo } from '../types/user';
import Pagination from './Pagination';
import { Users, Edit2, Trash2 } from 'lucide-react';

interface UserTableProps {
  users: User[];
  pagination: PaginationInfo;
  isLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onPageChange: (page: number) => void;
}

/**
 * Formats a date string to a localized, human-readable format.
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Masks sensitive data for display (e.g., Aadhaar: XXXX XXXX 9012).
 */
function maskAadhaar(aadhaar: string): string {
  if (aadhaar.length !== 12) return aadhaar;
  return `XXXX XXXX ${aadhaar.slice(8)}`;
}

/**
 * Gets initials from a name for the avatar badge.
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * User table component with pagination.
 * Displays user records with avatar initials, masked Aadhaar,
 * formatted dates, and edit/delete action buttons.
 */
export default function UserTable({
  users,
  pagination,
  isLoading,
  onEdit,
  onDelete,
  onPageChange,
}: UserTableProps) {
  if (isLoading) {
    return (
      <div className="table-wrapper">
        <div className="loading-overlay">
          <div className="spinner" />
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <div style={{ overflowX: 'auto' }}>
        <table className="table" id="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Aadhaar</th>
              <th>PAN</th>
              <th>Date of Birth</th>
              <th>Place of Birth</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-empty">
                  <span className="table-empty-icon"><Users size={48} opacity={0.5} /></span>
                  <div className="table-empty-text">No users found</div>
                  <div className="table-empty-subtext">
                    Create a new user to get started
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} id={`user-row-${user.id}`}>
                  <td>
                    <div className="user-name-cell">
                      <span className="user-avatar">{getInitials(user.name)}</span>
                      {user.name}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.primaryMobile}</td>
                  <td>
                    <span className="masked-text">{maskAadhaar(user.aadhaar)}</span>
                  </td>
                  <td>
                    <span className="masked-text">{user.pan}</span>
                  </td>
                  <td>{formatDate(user.dateOfBirth)}</td>
                  <td>{user.placeOfBirth}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => onEdit(user)}
                        title="Edit user"
                        aria-label={`Edit ${user.name}`}
                        id={`edit-btn-${user.id}`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => onDelete(user)}
                        title="Delete user"
                        aria-label={`Delete ${user.name}`}
                        id={`delete-btn-${user.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {users.length > 0 && (
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}
