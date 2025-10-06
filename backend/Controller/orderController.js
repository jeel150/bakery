import Order from "../Models/orderModel.js";
import Product from "../Models/productModel.js";

// Get all orders for the logged-in user
export const getOrders = async (req, res) => {
  try {
    const { status, date } = req.query;
    
    let query = { 'customer.email': req.user.email }; // Filter by logged-in user's email
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    // Populate product details if product still exists
    const orders = await Order.find(query)
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders by user email (alternative approach)
export const getOrdersByUser = async (req, res) => {
  try {
    const userEmail = req.user.email; // From authenticated user
    
    const orders = await Order.find({ 'customer.email': userEmail })
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new order (snapshot product details)
export const createOrder = async (req, res) => {
  try {
    const { items, total, customer, shipping, payment } = req.body;

    // Verify that the order is being created for the logged-in user
    if (customer.email !== req.user.email) {
      return res.status(403).json({ message: "You can only create orders for yourself" });
    }

    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.product}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      product.stock -= item.quantity;
      await product.save();

      enrichedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image || null,
        weight: product.weight,
        customWeight: product.customWeight
      });
    }

    const order = new Order({
      items: enrichedItems,
      total,
      customer,
      shipping,
      payment,
      status: "Pending"
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order by ID - with user verification
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name price image");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order belongs to the logged-in user
    if (order.customer.email !== req.user.email) {
      return res.status(403).json({ message: "Access denied. This order does not belong to you." });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refund an order - with user verification
export const refundOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order belongs to the logged-in user
    if (order.customer.email !== req.user.email) {
      return res.status(403).json({ message: "Access denied. This order does not belong to you." });
    }

    if (order.status !== "Completed") {
      return res.status(400).json({ message: "Only completed orders can be refunded" });
    }

    order.status = "Refunded";
    await order.save();

    // Restock products
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    res.json({ message: "Order refunded successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (admin only or with proper authorization)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Optional: Add admin check here if you want only admins to update status
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ message: "Access denied. Admin privileges required." });
    // }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};