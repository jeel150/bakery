// // server.js

// import dotenv from 'dotenv';
// dotenv.config();

// import express from 'express';
// import cors from 'cors';
// import connectDB from './Config/db.js';
// import productRoutes from './Routes/productRoutes.js';
// import authRoutes from "./Routes/authRoutes.js";
// import userRoutes from "./Routes/userRoutes.js";
// import orderRoutes from './Routes/orderRoutes.js';
// import courseRoutes from './Routes/courseRoutes.js';
// import courseApplicationsRouter from './Routes/courseApplications.js';
// import pagesApi from "./pagesApi.js";
// import categoryRoutes from "./Routes/categoryRoutes.js";
// import uploadRoutes from "./Routes/uploadRoutes.js"; 
// import themesRoutes from "./Routes/themesRoutes.js";




// connectDB();

// const app = express();

// app.use(cors({
//   origin: process.env.FRONTEND_URL || "http://localhost:5173",
//   credentials: true
// }));
// app.use(express.json());

// // Routes
// app.use('/api/products', productRoutes);
// app.use('/api/auth', authRoutes);
// app.use("/api/users", userRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/courses', courseRoutes);
// app.use('/api/course-applications', courseApplicationsRouter);
// app.use("/api/pages", pagesApi);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/upload", uploadRoutes); 
// app.use("/api/themes", themesRoutes);

// // Test route
// app.get('/', (req, res) => {
//   res.send('API is running...');
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });

// server.js - Updated CORS configuration
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

connectDB();

const app = express();

// Enhanced CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running...',
    timestamp: new Date().toISOString()
  });
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
  next(err);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
});