require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const stopRoutes = require('./routes/stops');
const routeRoutes = require('./routes/routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/routes', routeRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Serve frontend
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) next();
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

async function start() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/routeopt';
    await mongoose.connect(uri);
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`RouteOpt API running on http://localhost:${PORT}`);
      console.log('  POST /api/auth/register | /api/auth/login');
      console.log('  CRUD  /api/stops  (Stop model)');
      console.log('  POST /api/routes/optimize  (server-side heuristic)');
      console.log('  CRUD  /api/routes  (RoutePlan history)');
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
