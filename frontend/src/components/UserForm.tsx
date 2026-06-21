import { useState, useEffect } from 'react';
import type { User, UserFormData } from '../types/user';
import { UserPlus, Edit2, Save, X } from 'lucide-react';

interface UserFormProps {
  user: User | null;        // null = create mode, User = edit mode
  onSubmit: (data: UserFormData) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
}

/**
 * Validation error map type.
 */
type FormErrors = Partial<Record<keyof UserFormData, string>>;

/**
 * Initial empty form state.
 */
const emptyForm: UserFormData = {
  name: '',
  email: '',
  primaryMobile: '',
  secondaryMobile: '',
  aadhaar: '',
  pan: '',
  dateOfBirth: '',
  placeOfBirth: '',
  currentAddress: '',
  permanentAddress: '',
};

/**
 * User form modal for creating and editing users.
 * Features client-side validation matching backend rules:
 * - Indian mobile format (10 digits starting with 6-9)
 * - Aadhaar (12 digits)
 * - PAN (ABCDE1234F format)
 * - Email, DOB, required fields
 */
export default function UserForm({ user, onSubmit, onClose, isSubmitting }: UserFormProps) {
  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const isEditMode = !!user;

  // Populate form when editing
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        primaryMobile: user.primaryMobile,
        secondaryMobile: user.secondaryMobile || '',
        aadhaar: user.aadhaar,
        pan: user.pan,
        dateOfBirth: user.dateOfBirth.split('T')[0], // Handle ISO date string
        placeOfBirth: user.placeOfBirth,
        currentAddress: user.currentAddress,
        permanentAddress: user.permanentAddress,
      });
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof UserFormData]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof UserFormData];
        return next;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched((prev) => new Set(prev).add(e.target.name));
    validateField(e.target.name as keyof UserFormData, form[e.target.name as keyof UserFormData]);
  };

  // Field-level validation
  const validateField = (name: keyof UserFormData, value: string): string => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
        break;

      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;

      case 'primaryMobile':
        if (!value.trim()) error = 'Primary mobile is required';
        else if (!/^[6-9]\d{9}$/.test(value)) error = 'Must be a valid 10-digit Indian mobile number';
        break;

      case 'secondaryMobile':
        if (value.trim() && !/^[6-9]\d{9}$/.test(value)) error = 'Must be a valid 10-digit Indian mobile number';
        break;

      case 'aadhaar':
        if (!value.trim()) error = 'Aadhaar is required';
        else if (!/^\d{12}$/.test(value)) error = 'Aadhaar must be exactly 12 digits';
        break;

      case 'pan':
        if (!value.trim()) error = 'PAN is required';
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) error = 'Format: ABCDE1234F';
        break;

      case 'dateOfBirth':
        if (!value) error = 'Date of birth is required';
        else if (new Date(value) >= new Date()) error = 'Must be in the past';
        break;

      case 'placeOfBirth':
        if (!value.trim()) error = 'Place of birth is required';
        break;

      case 'currentAddress':
        if (!value.trim()) error = 'Current address is required';
        break;

      case 'permanentAddress':
        if (!value.trim()) error = 'Permanent address is required';
        break;
    }

    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
    return error;
  };

  // Full form validation
  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    for (const key of Object.keys(form) as (keyof UserFormData)[]) {
      const error = validateField(key, form[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    setTouched(new Set(Object.keys(form)));
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    // Uppercase PAN before submitting
    const submitData = {
      ...form,
      pan: form.pan.toUpperCase(),
    };

    await onSubmit(submitData);
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const showError = (field: keyof UserFormData) =>
    touched.has(field) && errors[field];

  return (
    <div className="modal-overlay" onClick={onClose} id="user-form-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" id="user-form-title">
            {isEditMode ? <><Edit2 size={20} style={{ marginRight: '8px' }} /> Edit User</> : <><UserPlus size={20} style={{ marginRight: '8px' }} /> New User</>}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close" id="user-form-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Name <span className="required">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  className={`form-input ${showError('name') ? 'error' : ''}`}
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoFocus
                />
                {showError('name') && <span className="form-error">{errors.name}</span>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  className={`form-input ${showError('email') ? 'error' : ''}`}
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {showError('email') && <span className="form-error">{errors.email}</span>}
              </div>

              {/* Primary Mobile */}
              <div className="form-group">
                <label className="form-label" htmlFor="primaryMobile">
                  Primary Mobile <span className="required">*</span>
                </label>
                <input
                  id="primaryMobile"
                  name="primaryMobile"
                  className={`form-input ${showError('primaryMobile') ? 'error' : ''}`}
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  value={form.primaryMobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {showError('primaryMobile') && <span className="form-error">{errors.primaryMobile}</span>}
                <span className="form-hint">10-digit Indian mobile number</span>
              </div>

              {/* Secondary Mobile */}
              <div className="form-group">
                <label className="form-label" htmlFor="secondaryMobile">
                  Secondary Mobile
                </label>
                <input
                  id="secondaryMobile"
                  name="secondaryMobile"
                  className={`form-input ${showError('secondaryMobile') ? 'error' : ''}`}
                  type="tel"
                  placeholder="Optional"
                  maxLength={10}
                  value={form.secondaryMobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {showError('secondaryMobile') && <span className="form-error">{errors.secondaryMobile}</span>}
              </div>

              {/* Aadhaar */}
              <div className="form-group">
                <label className="form-label" htmlFor="aadhaar">
                  Aadhaar <span className="required">*</span>
                </label>
                <input
                  id="aadhaar"
                  name="aadhaar"
                  className={`form-input ${showError('aadhaar') ? 'error' : ''}`}
                  type="text"
                  placeholder="123456789012"
                  maxLength={12}
                  value={form.aadhaar}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {showError('aadhaar') && <span className="form-error">{errors.aadhaar}</span>}
                <span className="form-hint">12-digit Aadhaar number</span>
              </div>

              {/* PAN */}
              <div className="form-group">
                <label className="form-label" htmlFor="pan">
                  PAN <span className="required">*</span>
                </label>
                <input
                  id="pan"
                  name="pan"
                  className={`form-input ${showError('pan') ? 'error' : ''}`}
                  type="text"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  value={form.pan}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{ textTransform: 'uppercase' }}
                />
                {showError('pan') && <span className="form-error">{errors.pan}</span>}
                <span className="form-hint">Format: ABCDE1234F</span>
              </div>

              {/* Date of Birth */}
              <div className="form-group">
                <label className="form-label" htmlFor="dateOfBirth">
                  Date of Birth <span className="required">*</span>
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  className={`form-input ${showError('dateOfBirth') ? 'error' : ''}`}
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {showError('dateOfBirth') && <span className="form-error">{errors.dateOfBirth}</span>}
              </div>

              {/* Place of Birth */}
              <div className="form-group">
                <label className="form-label" htmlFor="placeOfBirth">
                  Place of Birth <span className="required">*</span>
                </label>
                <input
                  id="placeOfBirth"
                  name="placeOfBirth"
                  className={`form-input ${showError('placeOfBirth') ? 'error' : ''}`}
                  type="text"
                  placeholder="Mumbai"
                  value={form.placeOfBirth}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {showError('placeOfBirth') && <span className="form-error">{errors.placeOfBirth}</span>}
              </div>

              {/* Current Address */}
              <div className="form-group full-width">
                <label className="form-label" htmlFor="currentAddress">
                  Current Address <span className="required">*</span>
                </label>
                <textarea
                  id="currentAddress"
                  name="currentAddress"
                  className={`form-textarea ${showError('currentAddress') ? 'error' : ''}`}
                  placeholder="Enter current residential address"
                  rows={2}
                  value={form.currentAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {showError('currentAddress') && <span className="form-error">{errors.currentAddress}</span>}
              </div>

              {/* Permanent Address */}
              <div className="form-group full-width">
                <label className="form-label" htmlFor="permanentAddress">
                  Permanent Address <span className="required">*</span>
                </label>
                <textarea
                  id="permanentAddress"
                  name="permanentAddress"
                  className={`form-textarea ${showError('permanentAddress') ? 'error' : ''}`}
                  placeholder="Enter permanent address"
                  rows={2}
                  value={form.permanentAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {showError('permanentAddress') && <span className="form-error">{errors.permanentAddress}</span>}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
              id="user-form-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              id="user-form-submit"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" /> Saving...
                </>
              ) : isEditMode ? (
                <><Save size={18} style={{ marginRight: '6px' }} /> Update User</>
              ) : (
                <><UserPlus size={18} style={{ marginRight: '6px' }} /> Create User</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
