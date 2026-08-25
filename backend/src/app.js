const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const healthRoutes = require('./routes/health');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security headers first, before any route handling
app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true, // allows cookies/auth headers from the frontend
  })
);

// Mount health check route before body parsers to avoid overhead
app.use('/api/health', healthRoutes);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

// Error handlers must be registered after routes
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
