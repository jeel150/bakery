import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true },
        image: { type: String }
      },
    ],
    total: { type: Number, required: true, default: 0 },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true }
    },
    shipping: {
      method: { type: String, enum: ['delivery', 'pickup'], required: true },
      address: {
        city: String,
        landmark: String,
        address: String
      },
      location: String, // For pickup
      date: String,
      time: String
    },
    payment: {
      method: { type: String, enum: ['cod', 'card'], required: true },
      status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
      transactionId: String // For card payments
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
      default: 'Pending'
    },
    trackingNumber: {
      type: String
    }
  },
  { timestamps: true }
);
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
