import express from "express";
import { 
  getOrders,
  createOrder,
  getOrderById, 
  updateOrderStatus,
  refundOrder,
} from "../Controller/orderController.js";
import { protect } from "../middleware/authMiddleware.js"; // Your auth middleware

const router = express.Router();

// Apply authentication middleware to all order routes
router.use(protect);

router.route('/')
  .get(getOrders)
  .post(createOrder);
  
router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .put(updateOrderStatus);

router.route('/:id/refund')
  .post(refundOrder);

export default router;