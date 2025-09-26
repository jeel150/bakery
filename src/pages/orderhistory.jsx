import "../styles/orderhistory.css";
import OrderDetails from "../pages/orderdetails"; 
import { useState, useEffect } from "react";
import { API_BASE_URL } from '../config/api.js';

const OrderHistory = ({ onClose, onOrderSelect }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders`);
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  // Safely format prices
  const formatPrice = (amount) => {
    if (!amount || isNaN(amount)) return "0.00";
    return amount.toFixed(2);
  };

  // Select / back handlers
  const handleOrderSelect = (order) => setSelectedOrder(order);
  const handleBackToList = () => setSelectedOrder(null);

  // ✅ Remove order from local state (not DB)
  const handleDeleteOrder = (orderId, e) => {
    e.stopPropagation(); // prevent opening details on click
    setOrders((prev) => prev.filter((o) => o._id !== orderId));
  };

  // If order selected → show details
  if (selectedOrder) {
    return (
      <OrderDetails 
        order={selectedOrder} 
        onClose={onClose} 
        onBack={handleBackToList}
        onGenerateInvoice={(orderId) => {
          console.log("Generate invoice for order:", orderId);
        }}
      />
    );
  }

  return (
    <div className="order-container1"> 
      <button className="order-close1" onClick={onClose}>×</button> 
      <div className="order-title1">Orders</div>

      <div className="order-subcontainer1">
        {orders.length === 0 ? (
          <div className="no-orders">No orders found</div>
        ) : (
          orders.map(order => {
            const firstItem = order.items?.[0] || {};
            const product = firstItem.product;
            const displayName = product?.name || firstItem.name || "Unnamed product";
            const displayImage = product?.image || "/placeholder.png"; // fallback

            return (
              <div 
                key={order._id} 
                className="order-item-container" 
                onClick={() => handleOrderSelect(order)}
              >
                {/* Left side: Date + Name */}
                <div className="order-detail1">
                  {order.shipping?.date
                    ? new Date(order.shipping.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                    : "Date not available"}
                  <div className="order-product-name">{displayName}</div>
                </div>

                {/* Middle: Image */}
                <div className="order-images1">
                  <img 
                    src={displayImage} 
                    alt={displayName} 
                    style={{ width: "110px", height: "90px", borderRadius: "8px", objectFit: "cover" }}
                  />
                </div>

                {/* Right: Status + Price */}
                <div className="order-status">Order : {order.status || "Unknown"}</div>
                <div className="order-price1">₹{formatPrice(order?.total)}</div>

                {/* ✅ Delete button */}
                <button 
                  className="order-delete-btn" 
                  onClick={(e) => handleDeleteOrder(order._id, e)}
                >
                  ×
                </button>

                <div className="order-divider"></div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
