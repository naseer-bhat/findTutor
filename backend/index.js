// Entry: server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectToMongo from './config/db.js';

// Routes
import adminRoutes from './routes/adminRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// Init
const app = express();
dotenv.config();

// Middleware
app.use(express.json());
app.use(cors());

// Connect DB
connectToMongo();

// Base Route
app.get('/', (req, res) => {
  res.send('Welcome to the Tutor-Time API!');
});

// Route Mounting
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/messages', messageRoutes);

// Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
