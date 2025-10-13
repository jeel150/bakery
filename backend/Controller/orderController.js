import Order from "../Models/orderModel.js";
import Product from "../Models/productModel.js";

// Get all orders (for admin - keeps existing functionality)
export const getOrders = async (req, res) => {
  try {
    const { status, date } = req.query;
    
    let query = {};
    
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
    
    const orders = await Order.find(query)
      .populate("items.product", "name price image")
      .populate("user", "name email") // Populate user info
      .sort({ createdAt: -1 });

    // Process orders to ensure proper image URLs
    const processedOrders = orders.map(order => {
      const orderObj = order.toObject();
      
      // Process each item in the order
      orderObj.items = orderObj.items.map(item => {
        // Use the snapshot image from order, or fallback to populated product image
        let imageUrl = item.image;
        
        // If no image in snapshot, try to get from populated product
        if (!imageUrl && item.product && item.product.image) {
          imageUrl = item.product.image;
        }
        
        // Convert relative path to absolute URL if needed
        if (imageUrl && !imageUrl.startsWith('http')) {
          // Remove leading slash if present to avoid double slashes
          const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
          imageUrl = `${process.env.API_BASE_URL || 'http://localhost:5000'}/${cleanPath}`;
        }
        
        return {
          ...item,
          image: imageUrl || '/placeholder.png'
        };
      });
      
      return orderObj;
    });

    res.json(processedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ NEW: Get orders for specific user
export const getUserOrders = async (req, res) => {
  try {
    // Get user ID from authenticated user (from auth middleware)
    const userId = req.user.id;
    
    const orders = await Order.find({ user: userId })
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 });

    // Process orders to ensure proper image URLs
    const processedOrders = orders.map(order => {
      const orderObj = order.toObject();
      
      orderObj.items = orderObj.items.map(item => {
        let imageUrl = item.image;
        
        if (!imageUrl && item.product && item.product.image) {
          imageUrl = item.product.image;
        }
        
        if (imageUrl && !imageUrl.startsWith('http')) {
          const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
          imageUrl = `${process.env.API_BASE_URL || 'http://localhost:5000'}/${cleanPath}`;
        }
        
        return {
          ...item,
          image: imageUrl || '/placeholder.png'
        };
      });
      
      return orderObj;
    });

    res.json(processedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new order (snapshot product details)
export const createOrder = async (req, res) => {
  try {
    const { items, total, customer, shipping, payment } = req.body;

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
        image: product.image // ✅ snapshot saved in order
      });
    }

    const order = new Order({
      items: enrichedItems,
      total,
      customer,
      shipping,
      payment,
      user: req.user.id, // ✅ Add user ID from authenticated user
      status: "Pending"
    });

    const savedOrder = await order.save();
    
    // Populate the saved order before sending response
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate("items.product", "name price image")
      .populate("user", "name email");

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name price image")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to view this order
    // Allow admin or the user who created the order
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    // Process the order to ensure proper image URLs
    const orderObj = order.toObject();
    orderObj.items = orderObj.items.map(item => {
      let imageUrl = item.image;
      
      if (!imageUrl && item.product && item.product.image) {
        imageUrl = item.product.image;
      }
      
      if (imageUrl && !imageUrl.startsWith('http')) {
        const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
        imageUrl = `${process.env.API_BASE_URL || 'http://localhost:5000'}/${cleanPath}`;
      }
      
      return {
        ...item,
        image: imageUrl || '/placeholder.png'
      };
    });

    res.json(orderObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refund an order
export const refundOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to refund this order
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to refund this order" });
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

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only admin can update order status
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to update order status" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};