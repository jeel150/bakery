import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/central.css';
import Navbar from '../components/Navbar.jsx';
import CakeCard from '../components/CakeCard.jsx';
import Footer from '../components/Footer.jsx';
import { useCart } from "../components/CartContext";  
import { useTheme } from "../components/ThemeContext.jsx";  
import { API_BASE_URL } from '../config/api.js';

function Cake() {
  const [products, setProducts] = useState([]);
  const [minPrice, setMinPrice] = useState(80);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [categories, setCategories] = useState({
    Chocolate: false,
    Vegan: false,
    Cheesecakes: false,
    'Gluten Free': false,
    'Fruit Cakes': false,
    'Not So Chocolate': false,
  });
  const [sort, setSort] = useState('Latest');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ cart
  const { cartItems, addToCart } = useCart();
  
  // ✅ Theme context
  const { theme, loading: themeLoading } = useTheme();

  // ✅ Fetch products from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // ✅ Add to cart handler
  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleClear = () => {
    setMinPrice(80);
    setMaxPrice(1000);
    setCategories({
      Chocolate: false,
      Vegan: false,
      Cheesecakes: false,
      'Gluten Free': false,
      'Fruit Cakes': false,
      'Not So Chocolate': false,
    });
  };

  const handleSort = (type) => {
    setSort(type);
    setDropdownOpen(false);
  };

  const handleHomeBreadcrumbClick = () => {
    navigate('/');
  };

  // ✅ Filtering logic
  let filteredCakes = [...products];

  // Apply Price Range Filter
  filteredCakes = filteredCakes.filter(
    (cake) => cake.price >= minPrice && cake.price <= maxPrice
  );

  // Apply Category Filter (AND logic)
  const activeCategories = Object.keys(categories).filter((cat) => categories[cat]);
  if (activeCategories.length > 0) {
    filteredCakes = filteredCakes.filter((cake) =>
      activeCategories.every((cat) =>
        Array.isArray(cake.category)
          ? cake.category.map((c) => c.toLowerCase()).includes(cat.toLowerCase())
          : cake.category?.toLowerCase().includes(cat.toLowerCase())
      )
    );
  }

  // ✅ Sorting logic
  if (sort === 'Price: Low to High') {
    filteredCakes.sort((a, b) => a.price - b.price);
  } else if (sort === 'Price: High to Low') {
    filteredCakes.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="cake-page-wrapper">
      <Navbar />

      {/* ✅ Floating Cart Button */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 999,
          cursor: "pointer",
        }}
        onClick={() => navigate('/checkout')}
      >
        <div
          style={{
            position: "relative",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "#f1d2e2ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="8" width="13" height="10" rx="2" stroke="#2A110A" strokeWidth="1.5" fill="none"/>
            <path d="M8 8V6a3 3 0 0 1 6 0v2" stroke="#2A110A" strokeWidth="1.5" fill="none"/>
          </svg>

          {cartItems.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: "5px",
                right: "5px",
                backgroundColor: "red",
                color: "white",
                borderRadius: "50%",
                padding: "4px 8px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {cartItems.length}
            </span>
          )}
        </div>
      </div>

      <div className="cake-divider-top"></div>
      <div className="home-breadcrumb" onClick={handleHomeBreadcrumbClick} style={{cursor: 'pointer'}}>Home</div>
      <div className="breadcrumb-arrow">
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4.5L10 8.5L6 12.5" stroke="#969696" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="breadcrumb-current">Cakes</div>
      <h1 className="cakes-title">CAKES</h1>
      <div className="showing-results">Showing {filteredCakes.length} Results</div>

       {/* ✅ Show active theme info */}
      {!themeLoading && (
        <div className="theme-banner">
          {theme ? (
            <p style={{ color: "var(--primary-color)" }}>
            </p>
          ) : 
          null
          }
        </div>
      )}


      {/* Sort Dropdown */}
      <div className="sort-by-label">Sort by :</div>
      <div className="sort-dropdown">
        <button className="sort-dropdown-btn" onClick={() => setDropdownOpen((o) => !o)}>
          {sort}
          <span className="sort-dropdown-arrow">▼</span>
        </button>
        {dropdownOpen && (
          <ul className="sort-dropdown-menu">
            <li onClick={() => handleSort('Latest')}>Latest</li>
            <li onClick={() => handleSort('Oldest')}>Oldest</li>
            <li onClick={() => handleSort('Price: Low to High')}>Price: Low to High</li>
            <li onClick={() => handleSort('Price: High to Low')}>Price: High to Low</li>
          </ul>
        )}
      </div>

      <div className="cake-divider"></div>
      <div className="cake-main-content">
        {/* Sidebar */}
        <aside className="cake-sidebar">
          <div className="cake-sidebar-header filter-header-with-line">
            <span className="cake-sidebar-title">Filter</span>
            <span className="cake-sidebar-clear" onClick={handleClear} tabIndex={0}>Clear</span>
          </div>
          <div className="cake-sidebar-section">
            <div className="cake-sidebar-label">Price</div>
            <div className="cake-sidebar-slider-row">
              <span className="cake-sidebar-slider-min">₹ {minPrice}</span>
              <input
                type="range"
                min="80"
                max="1000"
                className="cake-sidebar-slider"
                value={minPrice}
                onChange={e => setMinPrice(Number(e.target.value))}
              />
              <span className="cake-sidebar-slider-max">₹ {maxPrice}</span>
            </div>
            <div className="cake-sidebar-slider-row">
              <span className="cake-sidebar-slider-min">Min</span>
              <span className="cake-sidebar-slider-max">Max</span>
              <input
                type="range"
                min="80"
                max="1000"
                className="cake-sidebar-slider"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="cake-sidebar-section">
            <div className="cake-sidebar-label categories-label">Categories</div>
            <div className="cake-sidebar-subsection">Cakes</div>
            <div className="cake-sidebar-checkboxes">
              {Object.keys(categories).map((cat) => (
                <label key={cat}>
                  <input type="checkbox" checked={categories[cat]} onChange={() => setCategories(prev => ({ ...prev, [cat]: !prev[cat] }))} /> {cat}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* ✅ Cakes Grid with Scroll (max 12 visible) */}
        <div
          className="cake-card-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            maxHeight: "calc(2 * 370px)", // 4 rows of ~350px cards
            overflowY: "auto",
            paddingTop: "20px",
          }}
        >
          {filteredCakes.map((cake) => (
            <CakeCard
              key={cake._id}
              _id={cake._id}            // ✅ pass product id
              image={cake.image}
              title={cake.name}
              price={cake.price}
              weight={cake.customWeight ? cake.customWeight : cake.weight ? cake.weight : "N/A"} 
              onBagClick={(e) => handleAddToCart(cake, e)}
            />
          ))}
        </div>
      </div>
      <Footer className="footer-cake" />
    </div>
  );
}

export default Cake;
