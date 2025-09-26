// orderdetails.jsx
import "../styles/orderdetails.css";
import { useState, useEffect } from "react";
import { API_BASE_URL } from '../config/api.js';


const OrderDetails = ({ order, onClose, onBack, onGenerateInvoice }) => {
  const [orderData, setOrderData] = useState(order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (order) {
        setOrderData(order);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${order}`);
        const data = await response.json();
        setOrderData(data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [order]);

  if (loading) {
    return (
      <div className="order-container">
        <div>Loading order details...</div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="order-container">
        <div>Order not found</div>
      </div>
    );
  }

  // Calculate subtotal from items
  const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate shipping cost (total - subtotal)
  const shippingCost = orderData.total - subtotal;

  return (
    <div className="order-container"> 
      <button className="order-close" onClick={onBack || onClose}>×</button> 
      <div className="order-title">Order#{orderData.trackingNumber || orderData._id}</div>
      <div className="order-subtitle">Order status: {orderData.status}</div>

      <div className="order-subcontainer">
        <div className="order-detail">Order Detail</div>
        <div className="order-divider"></div>
      </div>
      
      <div className="order-info-grid">
        <div>
          <p className="order-label">Order Number</p>
          <div className="order-divider2"></div>
          <p className="order-value">{orderData.trackingNumber || orderData._id}</p>
        </div>
        <div>
          <p className="order-label">Order Date</p>
          <div className="order-divider2"></div>
          <p className="order-value">
            {new Date(orderData.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
        <div>
          <p className="order-label">Shipping Method</p>
          <div className="order-divider2"></div>
          <p className="order-value">{orderData.shipping?.method || 'Not specified'}</p>
        </div>
        <div>
          <p className="order-label">Payment Method</p>
          <div className="order-divider2"></div>
          <p className="order-value">
            {orderData.payment?.method || 'Not specified'} <br /> 
            Status: {orderData.payment?.status || 'Unknown'}
          </p>
        </div>
        <div>
          <p className="order-label">Shipping Address</p>
          <div className="order-divider2"></div>
          <p className="order-value">
            {orderData.shipping?.location || 'Not specified'}
          </p>
        </div>
        <div>
          <p className="order-label">Customer Information</p>
          <div className="order-divider2"></div>
          <p className="order-value">
            {orderData.customer?.name || 'Not specified'} <br />
            {orderData.customer?.email || ''} <br />
            {orderData.customer?.phone || ''}
          </p>
        </div>
      </div>

      <div className="order-subcontainer2">
        <div className="order-item">Order Item</div>
        <div className="order-divider3"></div>
        {orderData.items && orderData.items.map((item, index) => (
          <div key={index} className="order-item-row">
            <div>
              <p className="order-name">{item.name || item.product?.name}</p>
              <p className="order-weight">1Kg</p>
            </div>
            <div>
              <p className="order-price">₹ {item.price.toFixed(2)}</p>
              <p className="order-quantity">{item.quantity}x</p>
              <p className="order-cprice">₹ {(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="order-subcontainer3">
        <div>
          <p className="order-product">Product</p>
          <p className="order-shiping">Shipping ({orderData.shipping?.method || 'Standard'})</p>
        </div>
        <div>
          <p className="order-rate">₹ {subtotal.toFixed(2)}</p>
          <p className="order-charge">₹ {shippingCost.toFixed(2)}</p>                
        </div>
        <div className="order-divider4"></div>
        <div>
          <p className="order-total">Total</p>
          <p className="order-amount">₹ {orderData.total.toFixed(2)}</p>
        </div>
        <div className="order-divider5"></div>
      </div>

      {/* Buttons */}
      <button className="reorder-btn">Re Order</button>
      <button className="invoice-btn" onClick={() => onGenerateInvoice(orderData._id)}>
        Generate Invoice
      </button>
    </div>
  );
};

export default OrderDetails;