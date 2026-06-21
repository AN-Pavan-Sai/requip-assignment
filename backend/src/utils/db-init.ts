import pool from '../config/db';

/**
 * Initializes the database schema.
 * Creates the `users` table if it doesn't already exist.
 *
 * Called once at server startup before listening for requests.
 * Uses IF NOT EXISTS so it's safe to run on every boot.
 */
export async function initializeDatabase(): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      primaryMobile VARCHAR(15) NOT NULL,
      secondaryMobile VARCHAR(15) DEFAULT NULL,
      aadhaar VARCHAR(12) NOT NULL,
      pan VARCHAR(10) NOT NULL,
      dateOfBirth DATE NOT NULL,
      placeOfBirth VARCHAR(255) NOT NULL,
      currentAddress TEXT NOT NULL,
      permanentAddress TEXT NOT NULL,
      isDeleted BOOLEAN DEFAULT FALSE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_email (email),
      UNIQUE KEY unique_aadhaar (aadhaar),
      UNIQUE KEY unique_pan (pan),
      INDEX idx_isDeleted (isDeleted),
      INDEX idx_name (name),
      INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await pool.execute(createTableQuery);
    console.log('✅ Database initialized — users table ready');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}
