import "../styles/orderhistory.css";
import OrderDetails from "../pages/orderdetails"; 
import { useState, useEffect } from "react";
import { API_BASE_URL } from '../config/api.js';

const OrderHistory = ({ onClose, onOrderSelect, user }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token'); // Or your auth token storage method
        
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const formatPrice = (amount) => (!amount || isNaN(amount) ? "0.00" : amount.toFixed(2));

  const handleOrderSelect = (order) => setSelectedOrder(order);
  const handleBackToList = () => setSelectedOrder(null);

  const handleDeleteOrder = async (orderId, e) => {
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      } else {
        console.error('Failed to delete order');
      }
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  if (!user) {
    return (
      <div className="order-container1">
        <button className="order-close1" onClick={onClose}>×</button>
        <div className="order-title1">Orders</div>
        <div className="no-orders">Place your Order to see Order history </div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <OrderDetails 
        order={selectedOrder} 
        onClose={onClose} 
        onBack={handleBackToList}
        onGenerateInvoice={(orderId) => console.log("Generate invoice for order:", orderId)}
      />
    );
  }

  return (
    <div className="order-container1"> 
      <button className="order-close1" onClick={onClose}>×</button> 
      <div className="order-title1">My Orders</div>

      <div className="order-subcontainer1">
        {loading ? (
          <div className="no-orders">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="no-orders">No orders found</div>
        ) : (
          orders.map(order => {
            const firstItem = order.items?.[0] || {};
            const product = firstItem.product;

            const displayName = product?.name || firstItem.name || "Unnamed product";
            const displayImage = product?.image || firstItem.image || "/placeholder.png";

            return (
              <div 
                key={order._id} 
                className="order-item-container" 
                onClick={() => handleOrderSelect(order)}
              >
                <div className="order-detail1">
                  {order.shipping?.date
                    ? new Date(order.shipping.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                    : "Date not available"}
                  <div className="order-product-name">{displayName}</div>
                </div>

                <div className="order-images1">
                  <img 
                    src={displayImage} 
                    alt={displayName} 
                    style={{ width: "110px", height: "90px", borderRadius: "8px", objectFit: "cover" }}
                  />
                </div>

                <div className="order-status">Order : {order.status || "Unknown"}</div>
                <div className="order-price1">₹{formatPrice(order?.total)}</div>

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