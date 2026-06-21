import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmProps {
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

/**
 * Delete confirmation modal content.
 * Shows a warning icon with the user's name and confirm/cancel buttons.
 */
export default function DeleteConfirm({ userName, onConfirm, onCancel, isDeleting }: DeleteConfirmProps) {
  return (
    <div className="modal-overlay" onClick={onCancel} id="delete-confirm-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-body">
          <div className="delete-confirm">
            <div className="delete-confirm-icon"><AlertTriangle size={32} /></div>
            <h3 className="delete-confirm-title">Delete User?</h3>
            <p className="delete-confirm-message">
              Are you sure you want to delete{' '}
              <span className="delete-confirm-name">{userName}</span>?
            </p>
            <p className="delete-confirm-message" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              This action will soft-delete the user. The record will be preserved for audit purposes.
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
            id="delete-cancel-btn"
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
            id="delete-confirm-btn"
          >
            {isDeleting ? (
              <>
                <span className="spinner" /> Deleting...
              </>
            ) : (
              <><Trash2 size={16} style={{ marginRight: '6px' }} /> Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
