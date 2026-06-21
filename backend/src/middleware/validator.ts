import { body, param, query } from 'express-validator';

/**
 * Validation rules for creating a new user.
 * Uses express-validator for declarative, chainable validation.
 *
 * Validation strategy:
 * - Name: required, trimmed, 2-255 chars
 * - Email: valid format, normalized
 * - PrimaryMobile: 10-digit Indian mobile number
 * - SecondaryMobile: optional, same format
 * - Aadhaar: exactly 12 digits
 * - PAN: ABCDE1234F format (5 letters, 4 digits, 1 letter)
 * - DateOfBirth: valid ISO date, must be in the past
 * - PlaceOfBirth: required string
 * - Addresses: required, non-empty strings
 */
export const createUserValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('primaryMobile')
    .trim()
    .notEmpty().withMessage('Primary mobile number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Primary mobile must be a valid 10-digit Indian mobile number'),

  body('secondaryMobile')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Secondary mobile must be a valid 10-digit Indian mobile number'),

  body('aadhaar')
    .trim()
    .notEmpty().withMessage('Aadhaar number is required')
    .matches(/^\d{12}$/).withMessage('Aadhaar must be exactly 12 digits'),

  body('pan')
    .trim()
    .notEmpty().withMessage('PAN number is required')
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage('PAN must be in format: ABCDE1234F')
    .toUpperCase(),

  body('dateOfBirth')
    .trim()
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .custom((value: string) => {
      const dob = new Date(value);
      if (dob >= new Date()) {
        throw new Error('Date of birth must be in the past');
      }
      return true;
    }),

  body('placeOfBirth')
    .trim()
    .notEmpty().withMessage('Place of birth is required')
    .isLength({ max: 255 }).withMessage('Place of birth must be at most 255 characters'),

  body('currentAddress')
    .trim()
    .notEmpty().withMessage('Current address is required'),

  body('permanentAddress')
    .trim()
    .notEmpty().withMessage('Permanent address is required'),
];

/**
 * Validation rules for updating a user.
 * Same as create but all fields are optional (partial update support).
 */
export const updateUserValidation = [
  param('id')
    .isUUID().withMessage('Invalid user ID format'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('primaryMobile')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Primary mobile must be a valid 10-digit Indian mobile number'),

  body('secondaryMobile')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Secondary mobile must be a valid 10-digit Indian mobile number'),

  body('aadhaar')
    .optional()
    .trim()
    .matches(/^\d{12}$/).withMessage('Aadhaar must be exactly 12 digits'),

  body('pan')
    .optional()
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage('PAN must be in format: ABCDE1234F')
    .toUpperCase(),

  body('dateOfBirth')
    .optional()
    .trim()
    .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .custom((value: string) => {
      const dob = new Date(value);
      if (dob >= new Date()) {
        throw new Error('Date of birth must be in the past');
      }
      return true;
    }),

  body('placeOfBirth')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Place of birth must be at most 255 characters'),

  body('currentAddress')
    .optional()
    .trim(),

  body('permanentAddress')
    .optional()
    .trim(),
];

/**
 * Validation for UUID route parameter.
 */
export const idParamValidation = [
  param('id')
    .isUUID().withMessage('Invalid user ID format'),
];

/**
 * Validation for pagination query parameters.
 */
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Search term must be at most 255 characters'),
];
