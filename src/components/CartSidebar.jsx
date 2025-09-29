import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/central.css";
import { API_BASE_URL } from '../config/api.js'; 

const CartSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  // Fetch cart from backend
  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  const fetchCart = async () => {
    try {
      setLoading(true);
       const res = await fetch(`${API_BASE_URL}/api/cart`);
      const data = await res.json();
      setCart(data || { items: [] });
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update quantity (+/-)
  const updateQty = async (productId, delta) => {
    try {
       const res = await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: delta }),
      });
      const updatedCart = await res.json();
      setCart(updatedCart);
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  if (!isOpen) return null;

  const itemsTotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discount = itemsTotal > 1000 ? itemsTotal * 0.1 : 0; // example rule
  const subTotal = itemsTotal - discount;

  return (
    <>
      {/* Blurred Overlay */}
      <div className="cart-blur-overlay" onClick={onClose}></div>

      {/* Sidebar */}
      <aside className="cart-sidebar">
        <div className="cart-sidebar-header">
          <h2 className="cart-sidebar-title">CART</h2>
          <button className="cart-sidebar-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Cart Items */}
        <div className="cart-sidebar-items">
          {loading ? (
            <p>Loading...</p>
          ) : cart.items.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            cart.items.map((item, idx) => (
              <div className="cart-sidebar-item" key={idx}>
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="cart-sidebar-item-img"
                />
                <div className="cart-sidebar-item-info">
                  <div className="cart-sidebar-item-title">
                    {item.product.name}
                  </div>
                  <div className="cart-sidebar-item-desc">
                    {item.product.desc || ""}
                  </div>
                  <div className="cart-sidebar-item-qty-row">
                    <button
                      className="cart-sidebar-qty-btn"
                      onClick={() => updateQty(item.product._id, -1)}
                    >
                      -
                    </button>
                    <span className="cart-sidebar-qty">{item.quantity}</span>
                    <button
                      className="cart-sidebar-qty-btn"
                      onClick={() => updateQty(item.product._id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-sidebar-item-price">
                  ฿ {item.product.price * item.quantity}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Coupon Section */}
        <div className="cart-sidebar-coupon-row">
          <input
            className="cart-sidebar-coupon-input"
            placeholder="Enter Coupon Code"
          />
          <button className="cart-sidebar-coupon-apply">Apply</button>
        </div>

        {/* Summary */}
        <div className="cart-sidebar-summary">
          <div className="cart-sidebar-summary-row">
            <span>Items total</span>
            <span>฿ {itemsTotal.toFixed(2)}</span>
          </div>
          <div className="cart-sidebar-summary-row">
            <span>Voucher Discount</span>
            <span>฿ {discount.toFixed(2)}</span>
          </div>
          <div className="cart-sidebar-summary-row cart-sidebar-summary-subtotal">
            <span>Sub Total</span>
            <span>฿ {subTotal.toFixed(2)}</span>
          </div>
          <div className="cart-sidebar-summary-note">
            Proceed to checkout and add location to see shipping charges
          </div>
        </div>

        {/* Checkout Button */}
        <button
          className="cart-sidebar-checkout"
          onClick={() => {
            onClose();
            navigate("/checkout");
          }}
        >
          Proceed to Checkout
        </button>
      </aside>
    </>
  );
};

export default CartSidebar;
