import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middleware/errorHandler';
import { initializeDatabase } from './utils/db-init';

// Load environment variables before anything else
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────

// Enable CORS for frontend dev server
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

// Parse JSON request bodies (with a 10mb limit for address fields)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// User CRUD routes
app.use('/api/users', userRoutes);

// ──────────────────────────────────────────────
// Error Handling
// ──────────────────────────────────────────────

// Global error handler (must be registered after routes)
app.use(errorHandler);

// ──────────────────────────────────────────────
// Server Startup
// ──────────────────────────────────────────────

async function startServer(): Promise<void> {
  try {
    // Initialize database schema before accepting requests
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 API base: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
