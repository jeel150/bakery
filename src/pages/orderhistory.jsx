import "../styles/orderhistory.css";
import OrderDetails from "../pages/orderdetails"; 
import { useState, useEffect } from "react";
import { API_BASE_URL } from '../config/api.js';
import { useNavigate } from 'react-router-dom';

const OrderHistory = ({ onClose, onOrderSelect }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check if user is logged in and get user data
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!savedUser || !token) {
        // User not logged in, redirect to login or show message
        console.log("User not authenticated");
        setLoading(false);
        return false;
      }
      
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        return userData;
      } catch (error) {
        console.error("Error parsing user data:", error);
        setLoading(false);
        return false;
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchUserOrders = async () => {
      // Check if user is logged in
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!savedUser || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userData = JSON.parse(savedUser);
        
        // Fetch orders with authentication
        const response = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            throw new Error('Please login again');
          }
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching user orders:", error);
        // If there's an auth error, clear local storage
        if (error.message.includes('login')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, []);

  const formatPrice = (amount) => (!amount || isNaN(amount) ? "0.00" : amount.toFixed(2));

  const handleOrderSelect = (order) => setSelectedOrder(order);
  const handleBackToList = () => setSelectedOrder(null);

  const handleDeleteOrder = async (orderId, e) => {
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to delete orders');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert('Failed to delete order');
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login', { 
      state: { 
        from: '/order-history',
        message: 'Please login to view your order history'
      } 
    });
    onClose?.();
  };

  // Show login prompt if user is not authenticated
  if (!localStorage.getItem('user') || !localStorage.getItem('token')) {
    return (
      <div className="order-container1"> 
        <button className="order-close1" onClick={onClose}>×</button> 
        <div className="order-title1">Orders</div>
        
        <div className="order-subcontainer1">
          <div className="no-orders" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔐</div>
            <h3 style={{ marginBottom: '10px', color: '#333' }}>Login Required</h3>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Please login to view your order history
            </p>
            <button 
              onClick={handleLoginRedirect}
              style={{
                backgroundColor: '#2A110A',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Login Now
            </button>
          </div>
        </div>
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
          <div className="no-orders" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
            <h3 style={{ marginBottom: '10px', color: '#333' }}>No Orders Yet</h3>
            <p style={{ color: '#666' }}>You haven't placed any orders yet.</p>
            <p style={{ color: '#666', marginTop: '5px' }}>
              Start shopping to see your orders here!
            </p>
          </div>
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