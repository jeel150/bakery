import express from "express";
import { 
  getOrders,
  createOrder,
  getOrderById, 
  updateOrderStatus,
  refundOrder,
  getUserOrders, // ✅ Import the new function
} from "../Controller/orderController.js";
import {authMiddleware }from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (if any)

// Protected routes
router.route('/')
  .get(authMiddleware, getOrders) // Admin can see all orders
  .post(authMiddleware, createOrder); // Authenticated users can create orders

// ✅ NEW: Get orders for logged-in user only
router.route('/my-orders')
  .get(authMiddleware, getUserOrders);

router.route('/:id')
  .get(authMiddleware, getOrderById); // Authenticated users can view their own orders

router.route('/:id/status')
  .put(authMiddleware, updateOrderStatus); // Admin only

router.route('/:id/refund')
  .post(authMiddleware, refundOrder); // Admin or order owner

export default router;