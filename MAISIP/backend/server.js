const express = require('express');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');
const pino = require('pino-http')();
const rateLimit = require('express-rate-limit');
const { z } = require('zod');

// Boot-time validation
const envSchema = z.object({
  PORT: z.string().default('5000'),
  DB_USER: z.string(),
  DB_HOST: z.string(),
  DB_NAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_PORT: z.string().default('5432'),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string()
});

try {
  envSchema.parse(process.env);
} catch (err) {
  console.error('Environment variable validation failed:', err.errors);
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(pino);
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // accommodate local dev and UI navigation
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Athlete Digital Identity API is running' });
});

// Import and use routes
const registrationRoutes = require('./routes/registration');
const instituteRegistrationRoutes = require('./routes/instituteRegistration');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const verificationRoutes = require('./routes/verification');
const institutesRoutes = require('./routes/institutes');

const athletesRoutes = require('./routes/athletes');
const uploadRoutes = require('./routes/upload');
const publicRoutes = require('./routes/public');
const analysisRoutes = require('./routes/analysis');

app.use('/api/auth', authRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/institute', instituteRegistrationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/institutes', institutesRoutes);
app.use('/api/athletes', athletesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/athlete-analysis', analysisRoutes);

// Catch-all 404 handler for API routes (always return JSON, never HTML)
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Central JSON error handler (never send HTML stack traces)
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
  });
}

module.exports = app;
