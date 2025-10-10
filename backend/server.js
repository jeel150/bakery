// server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './Config/db.js';
import productRoutes from './Routes/productRoutes.js';
import authRoutes from "./Routes/authRoutes.js";
import userRoutes from "./Routes/userRoutes.js";
import orderRoutes from './Routes/orderRoutes.js';
import courseRoutes from './Routes/courseRoutes.js';
import courseApplicationsRouter from './Routes/courseApplications.js';
import pagesApi from "./pagesApi.js";
import categoryRoutes from "./Routes/categoryRoutes.js";
import uploadRoutes from "./Routes/uploadRoutes.js"; 
import themesRoutes from "./Routes/themesRoutes.js";
import dashboardRoutes from './Routes/dashboardRoutes.js';

connectDB();

const app = express();

// Enhanced CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174", 
  "https://bakery-lime-eight.vercel.app",
  "https://bakery-x0g5.onrender.com",
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_PROD,
  process.env.ADMIN_FRONTEND_URL
].filter(Boolean);


// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked for origin:', origin);
      console.log('✅ Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },

  
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
// app.options('*', cors()); 
// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📍 ${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/course-applications', courseApplicationsRouter);
app.use("/api/pages", pagesApi);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRoutes); 
app.use("/api/themes", themesRoutes);
app.use('/api', dashboardRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      message: 'CORS policy violation',
      allowedOrigins: allowedOrigins
    });
  }
  
  console.error('Server Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
});