import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/central.css';
import { useCart } from '../components/CartContext.jsx';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { cartItems, addToCart } = useCart(); // ✅ global cart

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [eggType, setEggType] = useState('egg');
  const [weight, setWeight] = useState('1kg');

  // ✅ Explore state
  const [explore, setExplore] = useState([]);

  // ✅ Fetch single product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // ✅ Fetch explore cakes
  useEffect(() => {
    const fetchExplore = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`);
        const data = await res.json();
        const filtered = data.filter((p) => p._id !== id);
        setExplore(filtered);
      } catch (err) {
        console.error('Error fetching explore cakes:', err);
      }
    };
    fetchExplore();
  }, [id]);

  // ✅ Add to Cart (Floating Bag)
  const handleAddToFloatingBag = (item, e) => {
    if (e) e.stopPropagation();
    addToCart(item, 1); // default quantity 1 for explore
  };

  // ✅ Add current product to Floating Bag
  const handleAddToCart = () => {
    addToCart(
      { ...product, eggType, weight },
      quantity
    );
  };

  // ✅ Buy Now (direct checkout with this product only)
  const handleBuyNow = () => {
    navigate('/checkout', {
      state: {
        cartItems: [
          {
            ...product,
            quantity,
            eggType,
            weight,
          },
        ],
      },
    });
  };

  // ✅ Floating Bag checkout
  const handleCheckout = () => {
    navigate('/checkout', { state: { cartItems } });
  };

  if (loading) return <p>Loading product...</p>;
  if (!product) return <p>Product not found</p>;

  const productImages = [product.image, product.image, product.image, product.image];

  return (
    <div className="product-details-page">
      <Navbar />
      <div className="cake-divider-top"></div>

      {/* ✅ Breadcrumb */}
      <div className="product-breadcrumbs-row">
        <div className="rb-breadcrumbs">
          <span
            className="rb-breadcrumb-link"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            Home
          </span>
          <span className="rb-breadcrumb-arrow">&gt;</span>
          <span>{product.category}</span>
          <span className="rb-breadcrumb-arrow">&gt;</span>
          <span className="rb-breadcrumb-current">{product.name}</span>
        </div>
      </div>

      {/* ✅ Main Product Section */}
      <div className="product-main-section">
        <div className="product-image-section">
          <div className="product-main-image-wrapper">
            <img
              src={productImages[selectedImage]}
              alt={product.name}
              className="product-main-image"
            />
          </div>
          <div className="product-thumbnails">
            {productImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="Cake Thumbnail"
                className={`product-thumbnail ${selectedImage === idx ? 'active' : ''}`}
                onClick={() => setSelectedImage(idx)}
              />
            ))}
          </div>
        </div>

        <div className="product-info-section">
          <div className="product-title-row">
            <h1 className="product-title">{product.name}</h1>
            <button className="product-fav-btn" aria-label="Add to wishlist">
              <span className="product-fav-icon">♡</span>
            </button>
          </div>

          <div className="product-price-range">₹{product.price}</div>
          <div className="product-divider"></div>
          <div className="product-desc">{product.description}</div>

          {/* Egg/Eggless + Weight */}
          <div className="product-options">
            <div className="product-option-group">
              <button
                className={`product-option-btn with-egg${eggType === 'egg' ? ' selected' : ''}`}
                onClick={() => setEggType('egg')}
              >
                With Egg
              </button>
              <button
                className={`product-option-btn eggless${eggType === 'eggless' ? ' selected' : ''}`}
                onClick={() => setEggType('eggless')}
              >
                Eggless
              </button>
            </div>
            <div className="product-option-group">
              <span className="product-weight-label">Weight:</span>
              <button
                className={`product-weight-btn w1${weight === '1kg' ? ' selected' : ''}`}
                onClick={() => setWeight('1kg')}
              >
                1Kg
              </button>
              <button
                className={`product-weight-btn w2${weight === '1.5kg' ? ' selected' : ''}`}
                onClick={() => setWeight('1.5kg')}
              >
                1.5Kg
              </button>
              <button
                className={`product-weight-btn w3${weight === '2kg' ? ' selected' : ''}`}
                onClick={() => setWeight('2kg')}
              >
                2Kg
              </button>
              <button
                className={`product-weight-btn w4${weight === '3kg' ? ' selected' : ''}`}
                onClick={() => setWeight('3kg')}
              >
                3Kg
              </button>
            </div>
          </div>

          <div className="product-price">₹{product.price * quantity}</div>

          <div className="product-quantity-row">
            <span className="product-quantity-label">Quantity :</span>
            <div className="product-quantity-box">
              <button
                className="product-qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <span className="product-qty-value">{quantity}</span>
              <button className="product-qty-btn" onClick={() => setQuantity((q) => q + 1)}>
                +
              </button>
            </div>
          </div>

          <div className="product-order-note">
            <label htmlFor="order-note" className="product-order-note-label">
              Order Note (Optional)
            </label>
            <input
              id="order-note"
              className="product-order-note-input"
              placeholder="Add your message"
            />
          </div>

          <div className="product-action-row">
            <button className="product-add-cart-btn" onClick={handleAddToCart}>
              Add to cart
            </button>
            <button className="product-buy-btn" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Explore Other Cakes Section */}
      <div className="explore-section">
        <div className="explore-title">EXPLORE OTHER CAKES</div>

        <div className="explore-tabs d-flex align-items-center">
          <span
            className="explore-viewall ms-auto"
            onClick={() => navigate('/cake')}
            style={{ cursor: 'pointer' }}
          >
            View All
          </span>
        </div>

        <div className={`explore-cards ${explore.length > 4 ? 'scrollable' : ''}`}>
          {explore.map((cake) => (
            <div
              className="explore-card"
              key={cake._id}
              style={{ width: '320px', flex: '0 0 auto', cursor: 'pointer' }}
              onClick={() => navigate(`/product/${cake._id}`)}
            >
              {/* ❤️ Heart */}
              <div className="explore-card-heart">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 15.25s-5.25-3.8-5.25-7.25A3.25 3.25 0 0 1 9 4.75a3.25 3.25 0 0 1 5.25 3.25c0 3.45-5.25 7.25-5.25 7.25z"
                    stroke="#F1A8B6"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </div>

              {/* 🖼️ Image */}
              <img src={cake.image} alt={cake.name} className="explore-card-img w-100" />

              {/* 📦 Content */}
              <div className="explore-card-content">
                <div className="explore-card-title">{cake.name}</div>
                <div className="explore-card-weight">
                  {cake.customWeight ? cake.customWeight : cake.weight ? `${cake.weight}` : 'N/A'}
                </div>
                <div className="explore-card-price">
                  <span className="currency">₹{cake.price}.00</span>
                </div>
              </div>

              {/* 🛒 Floating Bag Button */}
              <div className="explore-card-bag" onClick={(e) => handleAddToFloatingBag(cake, e)}>
                <svg width="23" height="23" viewBox="0 0 23 23" fill="none">
                  <rect
                    x="5"
                    y="8"
                    width="13"
                    height="10"
                    rx="2"
                    stroke="#2A110A"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M8 8V6a3 3 0 0 1 6 0v2"
                    stroke="#2A110A"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Floating Bag Icon */}
      {cartItems.length > 0 && (
        <div className="floating-bag" onClick={handleCheckout}>
          <span className="floating-bag-count">{cartItems.length}</span>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <rect
              x="5"
              y="8"
              width="14"
              height="10"
              rx="2"
              stroke="#fff"
              strokeWidth="2"
              fill="none"
            />
            <path d="M8 8V6a4 4 0 0 1 8 0v2" stroke="#fff" strokeWidth="2" fill="none" />
          </svg>
        </div>
      )}

      <Footer className="footer-product" />
    </div>
  );
}

export default ProductDetails;
