// Checkout.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/central.css';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useCart } from '../components/CartContext.jsx';
import { API_BASE_URL } from '../config/api.js';

/** ---------------- Fake Stripe Modal ---------------- */
function FakeStripeModal({ amount, onCancel, onSuccess }) {
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Very light validation (not production)
  const luhnValid = (num) => {
    const s = (num || '').replace(/\s|-/g, '');
    if (!/^\d{12,19}$/.test(s)) return false;
    let sum = 0, dbl = false;
    for (let i = s.length - 1; i >= 0; i--) { 
      let d = parseInt(s[i], 10);
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  };

  const handlePay = async () => {
    setError('');
    if (!cardName.trim()) return setError('Name on card is required.');
    if (!luhnValid(cardNumber)) return setError('Invalid card number.');
    if (!/^\d{2}\/\d{2}$/.test(exp)) return setError('Expiry must be MM/YY.');
    if (!/^\d{3,4}$/.test(cvc)) return setError('Invalid CVC.');
    setProcessing(true);
    // Simulate payment intent success
    setTimeout(() => {
      const txid = `pi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      onSuccess(txid);
    }, 900);
  };

  return (
    <div className="fs-overlay" role="dialog" aria-modal="true">
      <div className="fs-modal">
        <div className="fs-header">
          <h3>Pay ₹{amount.toFixed(2)}</h3>
          <button className="fs-close" onClick={onCancel} disabled={processing}>×</button>
        </div>
        <div className="fs-body">
          <label className="fs-label">Name on Card
            <input className="fs-input" value={cardName} onChange={e=>setCardName(e.target.value)} placeholder="Jane Doe" />
          </label>
          <label className="fs-label">Card Number
            <input className="fs-input" value={cardNumber} onChange={e=>setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" />
          </label>
          <div className="fs-row">
            <label className="fs-label">Expiry (MM/YY)
              <input className="fs-input" value={exp} onChange={e=>setExp(e.target.value)} placeholder="12/28" />
            </label>
            <label className="fs-label">CVC
              <input className="fs-input" value={cvc} onChange={e=>setCvc(e.target.value)} placeholder="123" />
            </label>
          </div>
          {error && <div className="fs-error">{error}</div>}
        </div>
        <div className="fs-footer">
          <button className="fs-btn ghost" onClick={onCancel} disabled={processing}>Cancel</button>
          <button className="fs-btn primary" onClick={handlePay} disabled={processing}>
            {processing ? 'Processing…' : 'Pay Now'}
          </button>
        </div>
      </div>
      {/* Quick styles (optional) – move to CSS if you prefer */}
      <style>{`
        .fs-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999}
        .fs-modal{background:#fff;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.2);width:min(460px,92vw);padding:18px}
        .fs-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
        .fs-close{border:none;background:transparent;font-size:22px;cursor:pointer;line-height:1}
        .fs-body{display:grid;gap:10px}
        .fs-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .fs-label{display:grid;gap:6px;font-size:14px}
        .fs-input{height:40px;border:1px solid #ddd;border-radius:8px;padding:0 10px}
        .fs-error{color:#b00020;background:#fde7eb;border:1px solid #f7c6cf;padding:8px;border-radius:8px}
        .fs-footer{display:flex;justify-content:flex-end;gap:10px;margin-top:14px}
        .fs-btn{height:40px;border-radius:8px;padding:0 14px;border:1px solid #ccc;cursor:pointer}
        .fs-btn.primary{background:#2A110A;color:#fff;border-color:#2A110A}
        .fs-btn.ghost{background:#fff}
      `}</style>
    </div>
  );
}

/** ---------------- Main Checkout ---------------- */
export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems: contextCart, updateQuantity, removeFromCart, addToCart } = useCart();

  // ✅ Prefer Buy Now items from location.state, otherwise use global CartContext
  const cartItems = location.state?.cartItems
    ? location.state.cartItems.map(item => ({
        product: { ...item }, // wrap to match CartContext shape
        quantity: item.quantity || 1,
      }))
    : contextCart;
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shipping state
  const [shippingMethod, setShippingMethod] = useState('pickup');
  const [userDetails, setUserDetails] = useState({ name: '', phone: '', email: '' });
  const [deliveryAddress, setDeliveryAddress] = useState({ city: '', landmark: '', address: '' });
  const [selectedLocation, setSelectedLocation] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // New: payment/order state
  const [showPayModal, setShowPayModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Fetch products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await fetch(`${API_BASE_URL}/api/products`);
        const productsData = await productsRes.json();
        setAllProducts(productsData);
      } catch (err) {
        console.error("Error fetching checkout data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Safe cart
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  // Stock helpers
  const getAvailableStock = (productId) => {
    const product = allProducts.find(p => p._id === productId);
    return product ? product.stock : 0;
  };
  const canAddProduct = (productId, currentQuantity = 0) => {
    const availableStock = getAvailableStock(productId);
    return currentQuantity < availableStock;
  };

  // Quantity change
  const handleOrderQtyChange = (id, delta) => {
    const item = safeCartItems.find(item => item.product && item.product._id === id);
    if (!item) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) { removeFromCart(id); return; }
    if (delta > 0 && !canAddProduct(id, item.quantity)) {
      alert(`Cannot add more. Only ${getAvailableStock(id)} available in stock.`);
      return;
    }
    updateQuantity(id, newQuantity);
  };

  // Addons
  const addons = allProducts.filter(product =>
    product && product.category && product.category.toLowerCase().includes('addon')
  );
  const handleAddonAdd = (addon) => {
    if (!addon || !addon._id) return;
    if (!canAddProduct(addon._id, 0)) { alert(`Sorry, "${addon.name}" is out of stock.`); return; }
    const existingItem = safeCartItems.find(item => item.product && item.product._id === addon._id);
    if (existingItem) {
      if (!canAddProduct(addon._id, existingItem.quantity)) {
        alert(`Cannot add more. Only ${getAvailableStock(addon._id)} available in stock.`);
        return;
      }
      updateQuantity(addon._id, existingItem.quantity + 1);
    } else {
      addToCart(addon, 1);
    }
  };

  // Coupon
  const handleCouponApply = () => {
    alert('Coupon applied! (This would connect to your backend in a real app)');
  };

  // Totals
  const calculateTotal = () => {
    return safeCartItems.reduce((total, item) => {
      if (item.product && item.product.price) {
        return total + (item.product.price * item.quantity);
      }
      return total;
    }, 0);
  };
  const itemsTotal = calculateTotal();
  const shippingFee = itemsTotal > 0 ? 50 : 0;
  const grandTotal = itemsTotal + shippingFee;

  // Form handlers
  const handleUserDetailsChange = (field, value) => setUserDetails(prev => ({ ...prev, [field]: value }));
  const handleDeliveryAddressChange = (field, value) => setDeliveryAddress(prev => ({ ...prev, [field]: value }));
  const handleLocationSelect = (location) => setSelectedLocation(location);
  const handleDateSelect = (e) => setDeliveryDate(e.target.value);
  const handleTimeSelect = (e) => setDeliveryTime(e.target.value);

  // Pickup locations
  const pickupLocations = [
    { name: 'Oud Metha', address: 'shop no. 5, 8th St - Oud Metha - Dubai', phone: '+971 52 889 9029' },
    { name: 'Studio City', address: 'Studio City - Dubai', phone: '+971 52 489 8141' },
    { name: 'Al Qusais', address: 'Inside royal medcare hospital, 16 18th St - Al Qusais - Al Qusais 2 - Dubai', phone: '+971 52 848 3368' },
    { name: 'Barsha Heights', address: 'inside grosvenor business tower Dubai', phone: '+971 58 823 8753' }
  ];

  /** ---------------- Validation ---------------- */
  const validateCheckout = () => {
    if (!safeCartItems.length) return { ok: false, msg: 'Your cart is empty.' };
    if (!userDetails.name.trim() || !userDetails.phone.trim() || !userDetails.email.trim()) {
      return { ok: false, msg: 'Please fill your name, phone, and email.' };
    }
    if (!deliveryDate || !deliveryTime) {
      return { ok: false, msg: 'Please select delivery date and time.' };
    }
    if (shippingMethod === 'delivery') {
      if (!deliveryAddress.city || !deliveryAddress.address) {
        return { ok: false, msg: 'Please provide city and address for delivery.' };
      }
    } else {
      if (!selectedLocation) return { ok: false, msg: 'Please select a pickup location.' };
    }
    return { ok: true };
  };

  /** ---------------- Build order payload (matches schema) ---------------- */
  const buildOrderPayload = (paymentStatus = 'pending', transactionId) => {
    const items = safeCartItems.map(ci => ({
      product: ci.product?._id,            // ObjectId
      name: ci.product?.name,              // stored redundantly by schema
      quantity: ci.quantity,
      price: ci.product?.price
    }));
    return {
      items,
      total: grandTotal,                    // backend will store number
      customer: {
        name: userDetails.name,
        email: userDetails.email,
        phone: userDetails.phone
      },
      shipping: {
        method: shippingMethod === 'delivery' ? 'delivery' : 'pickup',
        address: shippingMethod === 'delivery'
          ? { city: deliveryAddress.city, landmark: deliveryAddress.landmark, address: deliveryAddress.address }
          : undefined,
        location: shippingMethod === 'pickup' ? selectedLocation : undefined,
        date: deliveryDate,
        time: deliveryTime
      },
      payment: {
        method: paymentMethod === 'card' ? 'card' : 'cod',
        status: paymentStatus,              // 'pending' | 'completed' | 'failed'
        transactionId: transactionId || undefined
      }
    };
  };

  /** ---------------- Create order on server ---------------- */
  const createOrderOnServer = async (payload) => {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({message:'Order creation failed'}));
      throw new Error(err.message || 'Order creation failed');
    }
    return res.json();
  };

  /** ---------------- Proceed To Pay ---------------- */
  const handleProceedPay = async () => {
    setApiError('');
    const v = validateCheckout();
    if (!v.ok) { setApiError(v.msg); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    if (paymentMethod === 'cod') {
      try {
        setSubmitting(true);
        const payload = buildOrderPayload('pending'); // COD stays pending
        const saved = await createOrderOnServer(payload); // stock adjusts in controller :contentReference[oaicite:3]{index=3}
        alert(`Order placed! ID: ${saved._id}`);
        navigate('/'); // or navigate(`/order/${saved._id}`)
      } catch (e) {
        setApiError(e.message);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Card flow → open modal
    setShowPayModal(true);
  };

  /** ---------------- Card paid callback ---------------- */
  const handleCardPaid = async (transactionId) => {
    setShowPayModal(false);
    setSubmitting(true);
    setApiError('');
    try {
      const payload = buildOrderPayload('completed', transactionId); // card = completed
      const saved = await createOrderOnServer(payload);
      alert(`Payment successful! Order ID: ${saved._id}`);
      navigate('/'); // adjust to your success page/route
    } catch (e) {
      setApiError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <Navbar />
      <div className="checkout-content">

        {/* Top error banner */}
        {apiError && (
          <div className="checkout-error-banner">
            {apiError}
          </div>
        )}

        {/* Breadcrumb */}
        <hr className="checkout-divider" />
        <div className="checkout-breadcrumb">
          <span className="breadcrumb-link" onClick={() => navigate('/')}>Home</span>
          <span className="breadcrumb-separator">&gt;</span>
          <span className="breadcrumb-link" onClick={() => navigate('/cakes')}>Cart</span>
          <span className="breadcrumb-separator">&gt;</span>
          <span className="breadcrumb-link">Checkout</span>
        </div>

        <div className="checkout-title">YOUR SHOPPING CART</div>
        <hr className="checkout-divider-secondary" />

        {/* Banner */}
        <div className="checkout-banner">
          A sweet start - Enjoy 20% off your first order.
          <a href="#" className="checkout-banner-link">Login/Signup</a>
        </div>

        {/* Order Items */}
        <div className="checkout-order-title">Your Order</div>
        <div className={`checkout-order-box ${safeCartItems.length > 2 ? 'scrollable' : ''}`}>
          {safeCartItems.length > 0 ? safeCartItems.map((item, idx) => (
            item.product && (
              <div key={idx} className="order-item">
                <img src={item.product.image} alt={item.product.name} className="order-item-img" />
                <div className="order-item-details">
                  <div className="order-item-title">{item.product.name}</div>
                  <div className="order-item-subtitle">{item.product.category}</div>
                  {getAvailableStock(item.product._id) - item.quantity <= 2 && (
                    <div className="low-stock-warning">
                      Only {getAvailableStock(item.product._id) - item.quantity} left in stock!
                    </div>
                  )}
                </div>
                <div className="order-item-price">₹ {item.product.price}</div>
                <div className="order-item-qty-box">
                  <button className="order-qty-btn" onClick={() => handleOrderQtyChange(item.product._id, -1)}>-</button>
                  <span className="order-qty-count">{item.quantity}</span>
                  <button
                    className="order-qty-btn"
                    onClick={() => handleOrderQtyChange(item.product._id, 1)}
                    disabled={!canAddProduct(item.product._id, item.quantity)}
                  >+</button>
                </div>
              </div>
            )
          )) : <p className="empty-cart">No items in your cart</p>}
        </div>

        {/* Coupon */}
        <div className="coupon-section">
          <input type="text" className="coupon-input" placeholder="Enter Coupon Code" />
          <button className="coupon-apply-btn" onClick={handleCouponApply}>Apply</button>
        </div>

        {/* Add Ons */}
        <div className="checkout-section-title">Add Ons</div>
        <div className="checkout-addon-box">
          {addons.length > 0 ? addons.map((addon, idx) => {
            const cartItem = safeCartItems.find(item => item.product && item.product._id === addon._id);
            const quantity = cartItem ? cartItem.quantity : 0;
            const availableStock = getAvailableStock(addon._id);
            const canAddMore = canAddProduct(addon._id, quantity);

            return (
              <div key={idx} className="checkout-addon-item-box">
                <div className="addon-inner">
                  <img src={addon.image} alt={addon.name} className="addon-img-inside" />
                  <div className="addon-info">
                    <div className="addon-title-inside">{addon.name}</div>
                    <div className="addon-price-inside">₹ {addon.price}</div>
                    {availableStock === 0 && <div className="out-of-stock-label">Out of Stock</div>}

                    {quantity > 0 ? (
                      <div className="addon-qty-box-inside">
                        <button className="addon-qty-btn" onClick={() => handleOrderQtyChange(addon._id, -1)}>-</button>
                        <span className="addon-qty-count">{quantity}</span>
                        <button className="addon-qty-btn" onClick={() => handleOrderQtyChange(addon._id, 1)} disabled={!canAddMore}>+</button>
                      </div>
                    ) : (
                      <button className="addon-add-btn" onClick={() => handleAddonAdd(addon)} disabled={availableStock === 0}>
                        {availableStock === 0 ? 'Out of Stock' : 'Add'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : <div className="no-addons-message"><p>No addons available at the moment.</p></div>}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <div className="order-summary-row"><span className="summary-label">Items Total</span><span className="summary-value">₹ {itemsTotal.toFixed(2)}</span></div>
          <div className="order-summary-row"><span className="summary-label">Voucher Discount</span><span className="summary-value">₹ 0.00</span></div>
          <div className="order-summary-row"><span className="summary-label">Shipping Charges</span><span className="summary-value">₹ {shippingFee.toFixed(2)}</span></div>
          <hr className="summary-divider" />
          <div className="order-summary-row total">
            <span className="summary-label total-label">Total <span className="vat">(Incl. 5% VAT)</span></span>
            <span className="summary-value total-value">₹ {grandTotal.toFixed(2)}</span>
          </div>
          <button
            className="proceed-pay-btn"
            onClick={handleProceedPay}
            disabled={submitting || loading || !safeCartItems.length}
          >
            {submitting ? 'Please wait…' : 'Proceed To Pay'}
          </button>
        </div>

        {/* Shipping */}
        <div className="checkout-shipping-title">Shipping</div>
        <div className="checkout-shipping-box">
          <p className="checkout-shipping-description">Add your delivery location or select pickup if you wish to pick up from one of our stores.</p>

          <div className="shipping-method-buttons">
            <button className={`shipping-method-btn ${shippingMethod === 'delivery' ? 'active' : ''}`} onClick={() => setShippingMethod('delivery')}>Delivery</button>
            <button className={`shipping-method-btn ${shippingMethod === 'pickup' ? 'active' : ''}`} onClick={() => setShippingMethod('pickup')}>Pickup</button>
          </div>

          {/* Your Details */}
          <div className="user-details-section">
            <h3 className="section-title">Your Details</h3>
            <div className="form-row">
              <input type="text" placeholder="Name" value={userDetails.name} onChange={(e) => handleUserDetailsChange('name', e.target.value)} className="form-input" required />
              <input type="tel" placeholder="Phone" value={userDetails.phone} onChange={(e) => handleUserDetailsChange('phone', e.target.value)} className="form-input" required />
            </div>
            <div className="form-row">
              <input type="email" placeholder="Email" value={userDetails.email} onChange={(e) => handleUserDetailsChange('email', e.target.value)} className="form-input full-width" required />
            </div>
          </div>

          {/* Conditional Content */}
          {shippingMethod === 'delivery' ? (
            <div className="delivery-address-section">
              <h3 className="section-title">Your Address</h3>
              <div className="form-row">
                <select value={deliveryAddress.city} onChange={(e) => handleDeliveryAddressChange('city', e.target.value)} className="form-input" required>
                  <option value="">Select City</option>
                  <option value="dubai">Dubai</option>
                  <option value="abu-dhabi">Abu Dhabi</option>
                  <option value="sharjah">Sharjah</option>
                </select>
                <input type="text" placeholder="Landmark" value={deliveryAddress.landmark} onChange={(e) => handleDeliveryAddressChange('landmark', e.target.value)} className="form-input" />
              </div>
              <div className="form-row">
                <input type="text" placeholder="Address" value={deliveryAddress.address} onChange={(e) => handleDeliveryAddressChange('address', e.target.value)} className="form-input full-width" required />
              </div>
            </div>
          ) : (
            <div className="pickup-locations-section">
              <h3 className="section-title">Choose Location</h3>
              <div className="locations-grid">
                {pickupLocations.map((location, index) => (
                  <div
                    key={index}
                    className={`location-card ${selectedLocation === location.name ? 'selected' : ''}`}
                    onClick={() => handleLocationSelect(location.name)}
                  >
                    <h4 className="location-name">{location.name}</h4>
                    <p className="location-address">{location.address}</p>
                    <p className="location-phone">{location.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date & Time */}
        <div className="checkout-datetime-title">Choose Delivery Date & Time</div>
        <div className="checkout-datetime-box">
          <div className="checkout-datetime-input">
            <span className="checkout-datetime-label">Delivery Date :</span>
            <div className="datetime-button-container">
              <div className="picker-wrapper">
                <input type="date" className="inline-date-picker" value={deliveryDate} onChange={handleDateSelect} required />
              </div>
              <i className="fas fa-calendar-alt checkout-datetime-icon"></i>
            </div>
          </div>
          <div className="checkout-datetime-input-time">
            <span className="checkout-datetime-label-time">Delivery Time :</span>
            <div className="datetime-button-container">
              <div className="picker-wrapper">
                <input type="time" className="inline-time-picker" value={deliveryTime} onChange={handleTimeSelect} required />
              </div>
              <i className="fas fa-clock checkout-datetime-icon-time"></i>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="checkout-payment-title">Payment Method</div>
        <div className="checkout-payment-box">
          <div className="checkout-radio-group">
            <label className="checkout-radio-label">
              <input
                type="radio"
                name="payment"
                className="checkout-radio-input"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
              />
              Cash on Delivery
            </label>
          </div>
          <div className="checkout-radio-group">
            <label className="checkout-radio-label">
              <input
                type="radio"
                name="payment"
                className="checkout-radio-input-cc"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
              />
              Credit Card
            </label>
          </div>
        </div>
      </div>

      <Footer className="footer-checkout" />

      {/* Fake Stripe modal */}
      {showPayModal && (
        <FakeStripeModal
          amount={grandTotal}
          onCancel={() => setShowPayModal(false)}
          onSuccess={handleCardPaid}
        />
      )}

      {/* Optional styles for error banner */}
      <style>{`
        .checkout-error-banner{
          background:#fde7e7;color:#b00020;border:1px solid #f5bcbc;
          padding:10px 14px;border-radius:10px;margin-bottom:12px
        }
      `}</style>
    </div>
  );
}
