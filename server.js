require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const studentRoutes = require('./routes/students');

const app = express();

/* ======================
   MIDDLEWARE
====================== */
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://studentrecord-frontend.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

/* ======================
   ROUTES
====================== */
app.use('/api/students', studentRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

/* ======================
   ERROR HANDLING
====================== */
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({
    message: 'Server error'
  });
});

/* ======================
   DATABASE + SERVER
====================== */
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });
