import React, { useState, useEffect } from "react";
import '../styles/invoice.css';
import { useParams } from "react-router-dom";
import { API_BASE_URL } from '../config/api.js';

const Invoice = () => {
  const { orderId } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Try to fetch order data from your API
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);

        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle case where API returns an array
        if (Array.isArray(data)) {
          setOrderData(data[0]); // Take first order if array is returned
        } else {
          setOrderData(data);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError(error.message);
        
        // Fallback to mock data if API fails
        const mockData = {
          customer: {
            name: "jeel shah",
            email: "shahjeel865@gmail.com",
            phone: "07435031603"
          },
          shipping: {
            method: "pickup",
            location: "Oud Metha",
            date: "2025-08-30",
            time: "17:10"
          },
          payment: {
            method: "cod",
            status: "pending",
            transactionId: null
          },
          _id: "68ac3db8bad1648b5a330594",
          items: [
            {
              product: {
                _id: "68a6e32d7f5854eb6d0ba2d9",
                name: "white chocolate",
                price: 900,
                image: "https://res.cloudinary.com/dk5ywfj3e/image/upload/v1755673758/set_efowyt.jpg"
              },
              name: "white chocolate",
              quantity: 1,
              price: 900,
              _id: "68ac3db8bad1648b5a330595"
            }
          ],
          total: 950,
          status: "Delivered",
          createdAt: "2025-08-25T10:40:56.593Z",
          updatedAt: "2025-08-25T10:42:24.531Z",
          trackingNumber: "1356"
        };
        
        setOrderData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="invoice-container">
        <div>Loading invoice...</div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="invoice-container">
        <div>Order not found</div>
      </div>
    );
  }

  // Calculate subtotal from items
  const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate shipping cost
  const shippingCost = orderData.total - subtotal;

  return (
    <div className="invoice-container">
      {/* Header */}
      <div className="invoice-header">
        <h1 className="invoice-title">INVOICE</h1>
        <div className="invoice-company">
          <h2>RIBBONS & BALLOONS</h2>
          <p>Invoice : #{orderData._id.substring(0, 8)}</p>
          <p>Order : #{orderData.trackingNumber}</p>
          <p>Order Date : {new Date(orderData.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric'
          })}</p>
        </div>
      </div>
      
      {/* Address + Payment Section */}
      <div className="address-payment-section">
        <div className="grid-header">
          <div><strong>Sold to :</strong>
            <hr className="divider" />
          </div>
          <div><strong>Ship to :</strong>
            <hr className="divider" />
          </div>
        </div>
        <div className="grid-body">
          <div>
            <p>{orderData.customer.name}</p>
            <p>{orderData.shipping.location}</p>
            <p>Dubai</p>
            <p>United Arab Emirates</p>
            <p>T: {orderData.customer.phone}</p>
            <p>E: {orderData.customer.email}</p>
          </div>
          <div>
            <p>{orderData.customer.name}</p>
            <p>{orderData.shipping.location}</p>
            <p>Dubai</p>
            <p>United Arab Emirates</p>
            <p>T: {orderData.customer.phone}</p>
            <p>E: {orderData.customer.email}</p>
          </div>
        </div>
        <hr className="divider" />

        <div className="grid-footer">
          <div className='payment-type'>Payment Method : 
            <span className='Cash'>
              {orderData.payment.method === 'cod' ? 'Cash on Delivery' : orderData.payment.method}
            </span>
          </div>
          <div className='shipping-method'> Shipping Method:
            <span className='rate'>{orderData.shipping.method}</span>
          </div>
          <div>
            <br /><span className="charges">Total Shipping Charges ₹ {shippingCost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Products</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Tax</th>
            <th>Subtotal</th>
          </tr>
        </thead>
       <tbody>
  {orderData.items && orderData.items.map((item, index) => {
    const productId = item.product?._id || item._id; // fallback
    return (
      <tr key={index}>
        <td>
          {item.name || item.product?.name} <br />
          <span>Product ID: {productId.substring(0, 8)}</span>
        </td>
        <td>{productId.substring(0, 8)}</td>
        <td>₹ {item.price.toFixed(2)}</td>
        <td>{item.quantity}</td>
        <td>₹ 0.00</td>
        <td>₹ {(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    );
  })}
</tbody>

      </table>

      {/* Totals */}
      <div className="invoice-totals">
        <p>Sub Total : <span>₹ {subtotal.toFixed(2)}</span></p>
        <p>Shipping & Handling : <span>₹ {shippingCost.toFixed(2)}</span></p>
        <h3>Grand Total : <span>₹ {orderData.total.toFixed(2)}</span></h3>
      </div>
    </div>
  );
};

export default Invoice;