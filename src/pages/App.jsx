import{ useState, useEffect } from "react";
import axios from "axios";
import Navbar from '../components/Navbar.jsx';
import images from '../data/images.js';
const { cakeBg, ladyImg, statementSetImg, jarsImg } = images;
import { useNavigate } from 'react-router-dom';
import { useCart } from "../components/CartContext";
import '../styles/Base.css';
import { API_BASE_URL } from '../config/api.js';

function App() {
  const navigate = useNavigate();
  
const scrollToSection = (sectionId) => {
  if (window.location.pathname !== '/') {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  } else {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  }
};

const [categories,setCategories] = useState([]);
const [occasionCategories, setOccasionCategories] = useState([]);
const [miniBitesCategories, setMiniBitesCategories] = useState([]);
const [sweetStoryCategories, setSweetStoryCategories] = useState([]);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/categories`);
      setCategories(data);

// filter by section
setSweetStoryCategories(data.filter(c => c.sections?.includes("sweet-story")));
setOccasionCategories(data.filter(c => c.sections?.includes("occasion")));
setMiniBitesCategories(data.filter(c => c.sections?.includes("mini-bites")));

// auto-select first tab if not set
if (!selectedSweetTab && data.find(c => c.sections?.includes("sweet-story"))) {
  setSelectedSweetTab(data.find(c => c.sections?.includes("sweet-story")).name);
}
if (!selectedOccasionTab && data.find(c => c.sections?.includes("occasion"))) {
  setSelectedOccasionTab(data.find(c => c.sections?.includes("occasion")).name);
}
if (!selectedMiniBitesTab && data.find(c => c.sections?.includes("mini-bites"))) {
  setSelectedMiniBitesTab(data.find(c => c.sections?.includes("mini-bites")).name);
}
      if (sweet) setSelectedSweetTab(sweet.name);
      if (occ) setSelectedOccasionTab(occ.name);
      if (mini) setSelectedMiniBitesTab(mini.name);

    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };
  fetchCategories();
}, []);


const [products, setProducts] = useState([]);
useEffect(() => {
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/products`); 
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  fetchProducts();
}, []);
 const handleProductCardClick = (productId) => {
    navigate(`/product/${productId}`);
  };

//all button navigations
const handleJustinCartClick = (e) => {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
};
  const handleImaginationBtnClick = () => {
    navigate("/cakes");
  };
  const handleStatementCakesBtnClick = () => {
    navigate("/cakes");
  };


  //Active state for all section catagories
  const [selectedSweetTab, setSelectedSweetTab] = useState('Custom Cake');
  const [selectedOccasionTab, setSelectedOccasionTab] = useState('Birthday');
  const [selectedMiniBitesTab, setSelectedMiniBitesTab] = useState('Mini Cake');


// heart states :
const [productLikes, setProductLikes] = useState({});
const [productAnimations, setProductAnimations] = useState({});
const handleHeartClick = (productId, e) => { e.stopPropagation(); setProductLikes(prev => ({...prev,[productId]: !prev[productId]
  }));  
  // Set animation
  setProductAnimations(prev => ({
    ...prev,
    [productId]: true
  }));
  setTimeout(() => {
    setProductAnimations(prev => ({
      ...prev,
      [productId]: false
    }));
  }, 400);
};


//cart item 
const { cartItems, addToCart } = useCart();
 const handleAddToCart = (product, e) => {
  e.stopPropagation();
  addToCart(product); 
};



  return (
    <>

      {/* Floating Cart Button - Only show when cart has items */}
      {cartItems.length > 0 && (
        <div
          className="floating-cart-button"
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
              pointerEvents: "auto"
            }}
          >
            <svg width="28" height="28" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="8" width="13" height="10" rx="2" stroke="#2A110A" strokeWidth="1.5" fill="none"/>
              <path d="M8 8V6a3 3 0 0 1 6 0v2" stroke="#2A110A" strokeWidth="1.5" fill="none"/>
            </svg>

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
          </div>
        </div>
      )}
      
      <div className="position-relative w-100 main-container" style={{overflowX: 'hidden', minHeight: '100vh'}}>
        {/* Background Image Div */}
        <div 
          className="background-image-container"
          style={{
            backgroundImage: `url(${cakeBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            zIndex: -1
          }}
        ></div>
        <Navbar />

      {/* Hero Section */}
      <div className="hero-rb">
        <h1 className="hero-title">CELEBRATION BEGINS<br/>WITH R&B</h1>
        <p className="hero-desc">Custom cakes, handcrafted desserts —<br/>made for your moment.</p>
        <button className="hero-btn" onClick={() => navigate('/cakes')}>
          <span>Explore the menu</span>
          <span className="hero-btn-arrow">→</span>
        </button>
      </div>

        {/* Just In Section */}
     <div className="justin-section">
      <div className="justin-title">JUST IN</div>
      <div className="justin-scroll d-flex">
        {products.map((p) => (
          <div key={p._id} className="justin-card">
          <img src={p.image} alt={p.name} className="justin-img" />
          <div className="justin-card-content">
            <div className="justin-flavor">{p.category}</div>
            <div className="justin-name">{p.name}</div>
              <div className="justin-weight">
                {p.customWeight ? p.customWeight : p.weight ? `${p.weight}` : "N/A"}
              </div>
            <div className="justin-bottom-row">
              <div className="justin-price">₹ <b>{p.price}.00</b></div>  
              <div
                  className="justin-cart"
                  onClick={(e) => handleJustinCartClick(e)}
                  style={{ cursor: "pointer" }}
                >
              Cart <span className="justin-arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
    {/* Sweet Story Section */}
<div className="sweet-story-section">
  <div className="sweet-story-title">START YOUR SWEET STORY</div>

  {/* Tabs */}
  <div className="sweet-story-tabs">
   {sweetStoryCategories.map(cat => (
    <button
      key={cat._id}
      className={`sweet-tab${selectedSweetTab === cat.name ? ' active' : ''}`}
      onClick={() => setSelectedSweetTab(cat.name)}
    >
      {cat.name}
    </button>
  ))}
        {/* ✅ View All -> redirect to Cake.jsx */}
        <span 
          className="sweet-viewall"
          onClick={() => navigate("/cakes")}  // redirect to Cake.jsx route
          style={{ cursor: "pointer" }}
        >
          View All
        </span>
  </div>

  {/* Filter products by active tab */}
  <div
    className={`sweetstory-card-grid ${products.length > 4 ? 'scrollable' : ''}`}
    style={{
      display: "flex",
      justifyContent: products.length <= 4 ? "left" : "flex-start",
      gap: "20px",
      overflowX: products.length > 4 ? "auto" : "hidden",
      padding: "10px 0",
      scrollBehavior: "smooth"
    }}
  >
    {products
      .filter(product => product.category === selectedSweetTab) // ✅ filter by active tab
      .map((product) => (
        <div 
          key={product._id} 
          className="sweetstory-card position-relative d-flex flex-column"
          style={{ width: "250px", flex: "0 0 auto", cursor: 'pointer' }}
          onClick={() => handleProductCardClick(product._id)}
        >
          {/* Heart Icon */}
          <div
            className={`sweetstory-card-heart position-absolute d-flex align-items-center justify-content-center${productLikes[product._id] ? ' liked' : ''}${productAnimations[product._id] ? ' animate' : ''}`}
            onClick={(e) => handleHeartClick(product._id, e)}
            style={{ cursor: 'pointer', top: "10px", right: "10px" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill={productLikes[product._id] ? '#F1A8B6' : 'none'} xmlns="http://www.w3.org/2000/svg">
              <path d="M9 15.25s-5.25-3.8-5.25-7.25A3.25 3.25 0 0 1 9 4.75a3.25 3.25 0 0 1 5.25 3.25c0 3.45-5.25 7.25-5.25 7.25z" stroke="#F1A8B6" strokeWidth="1.5" fill={productLikes[product._id] ? '#F1A8B6' : 'none'}/>
            </svg>
          </div>

          {/* Product Image */}
          <img 
            src={product.image} 
            alt={product.name} 
            className="sweetstory-card-img w-100"
            style={{ borderRadius: "12px", height: "200px", objectFit: "cover" }}
          />

          {/* Card Body */}
          <div className="sweetstory-card-body d-flex flex-column flex-grow-1 p-2">
            <div className="sweetstory-card-title">{product.name}</div>
            <div className="sweetstory-card-weight">
              {product.customWeight ? product.customWeight : product.weight ? `${product.weight} ` : "N/A"}
            </div>
            <div className="sweetstory-card-bottom-row d-flex align-items-center justify-content-between mt-auto" onClick={(e) => handleAddToCart(product, e)}>
              <div className="sweetstory-card-price">₹ {product.price}.00</div>
              <div className={`sweetstory-card-bag d-flex align-items-center justify-content-center`}>
                <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="8" width="13" height="10" rx="2" stroke="#2A110A" strokeWidth="1.5" fill="none"/>
                  <path d="M8 8V6a3 3 0 0 1 6 0v2" stroke="#2A110A" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      ))}
  </div>
</div>




      {/* Imagination Section */}
      <div className="imagination-section">
        <div className="imagination-title">YOUR IMAGINATION <br /> OUR CREATION</div>
        <div className="imagination-desc">
          Our cakes are not just desserts—they're edible masterpieces. We specialize in creating highly detailed
        </div>
        <div className="imagination-btn-container d-flex align-items-center">
          <button className="imagination-btn" onClick={handleImaginationBtnClick}>Customize your cake</button>
        </div>
      </div>
       <div className="imagination-features-wrapper d-flex flex-column">
        <div className="imagination-features-row d-flex align-items-start">
          <div className="imagination-number imagination-number-1 d-flex align-items-center justify-content-center">1</div>
          <div className="imagination-feature d-flex flex-column">
            <div className="imagination-feature-line"></div>
            <div className="imagination-feature-title">CUSTOM ARTISTIC DESIGNS</div>
            <div className="imagination-feature-desc">Our cakes are not just desserts—they're edible masterpieces. We specialize in creating highly detailed</div>
          </div>
        </div>
        <div className="imagination-features-row d-flex align-items-start">
          <div className="imagination-number imagination-number-2 d-flex align-items-center justify-content-center">2</div>
          <div className="imagination-feature d-flex flex-column">
            <div className="imagination-feature-line"></div>
            <div className="imagination-feature-title">INNOVATIVE FLAVOR COMBINATIONS</div>
            <div className="imagination-feature-desc">Our cakes are not just desserts—they're edible masterpieces. We specialize in creating highly detailed</div>
          </div>
        </div>
        <div className="imagination-features-row d-flex align-items-start">
          <div className="imagination-number imagination-number-3 d-flex align-items-center justify-content-center">3</div>
          <div className="imagination-feature d-flex flex-column">
            <div className="imagination-feature-line"></div>
            <div className="imagination-feature-title">HANDCRAFTED EXCELLENCE</div>
            <div className="imagination-feature-desc">Our cakes are not just desserts—they're edible masterpieces. We specialize in creating highly detailed</div>
          </div>
        </div>
        <div className="imagination-features-row d-flex align-items-start">
          <div className="imagination-number imagination-number-4 d-flex align-items-center justify-content-center">4</div>
          <div className="imagination-feature d-flex flex-column">
            <div className="imagination-feature-line"></div>
            <div className="imagination-feature-title">PERSONALIZED CLIENT EXPERIENCE</div>
            <div className="imagination-feature-desc">Our cakes are not just desserts—they're edible masterpieces. We specialize in creating highly detailed</div>
          </div>
        </div>
      </div>

      {/* Lady Image and Symbol */}
      <div className="imagination-image-wrapper d-flex align-items-center justify-content-center">
        <div className="imagination-symbol">&amp;</div>
        <img src={ladyImg} alt="Lady decorating cake" className="imagination-image w-100" />
      </div>

    

      {/* Statement Cakes Section */}
      <div className="statement-cakes-section d-flex">
        <div className="statement-cakes-left d-flex flex-column">
          <img src={statementSetImg} alt="Statement Cakes" className="statement-cakes-img w-100" />
          <div className="statement-cakes-text d-flex flex-column">
            <div className="statement-cakes-title">STATEMENT CAKES FOR STANDOUT CELEBRATIONS.</div>
            <div className="statement-cakes-desc">Lorem ipsum is simply dummy text of the printing and typesetting industry.</div>
            <button className="statement-cakes-btn" onClick={handleStatementCakesBtnClick}>Explore our collection</button>
          </div>
        </div>

       <div className="statement-cakes-right d-grid">
        {products.slice(0, 8).map((p) => (
          <div 
            className="statement-cake-card position-relative d-flex flex-column"
            key={p._id}
            style={{cursor: 'pointer'}}
            onClick={() => handleProductCardClick(p._id)} 
          >
      
      {/* Heart Icon */}
      <div
        className={`statement-card-heart position-absolute d-flex align-items-center justify-content-center${
    productLikes[p._id] ? ' liked' : ''
  }${productAnimations[p._id] ? ' animate' : ''}`}
  onClick={(e) => handleHeartClick(p._id, e)}
  style={{ cursor: 'pointer', top: "10px", right: "10px" }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill={productLikes[p._id]? '#F1A8B6' : 'none'} xmlns="http://www.w3.org/2000/svg">
          <path d="M9 15.25s-5.25-3.8-5.25-7.25A3.25 3.25 0 0 1 9 4.75a3.25 3.25 0 0 1 5.25 3.25c0 3.45-5.25 7.25-5.25 7.25z" stroke="#F1A8B6" strokeWidth="1.5" fill={productLikes[p._id] ? '#F1A8B6' : 'none'}/>
        </svg>
       
      </div>

      {/* Product Image */}
      <img
        src={p.image}
        alt={p.name}
        className="statement-cake-img w-100"
      />

      {/* Product Content */}
      <div className="statement-cake-content d-flex flex-column flex-grow-1">
        <div className="statement-cake-title">{p.name}</div>
          <div className="statement-cake-weight">
            {p.customWeight ? p.customWeight : p.weight ? `${p.weight}` : "N/A"}
          </div>

        <div className="statement-cake-price">
          <span className="currency">₹ {p.price}.00</span>

          {/* Cart Button */}
          <div
            className={`statement-card-bag d-flex align-items-center justify-content-center`}
            onClick={(e) => handleAddToCart(p, e)}
            style={{ cursor: "pointer" }}
>
            <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="8" width="13" height="10" rx="2" stroke="#2A110A" strokeWidth="1.5" fill="none"/>
              <path d="M8 8V6a3 3 0 0 1 6 0v2" stroke="#2A110A" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
 </div>
     
      {/* Promo Wrapper for Ribbon and Section */}
      <div className="promo-wrapper d-flex flex-column"
       style={{
        backgroundImage: `url(${ladyImg})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
        <div className="promo-ribbon d-flex">
          <span>RIBBONS & BALLOONS</span>
          <span>RIBBONS & BALLOONS</span>
          <span>RIBBONS & BALLOONS</span>
          <span>RIBBONS & BALLOONS</span>
        </div>
        <div className="promo-section d-flex align-items-center justify-content-center">
          <div className="promo-content d-flex flex-column align-items-center">
            <div className="promo-title">A SWEET START - ENJOY 20% OFF YOUR FIRST ORDER.</div>
            <button className="promo-btn" onClick={() => navigate('/cakes')}>Order Now</button>
          </div>
        </div>
      </div>


{/* Shop for Occasions Section */}


<div className="occasions-section">
  <div className="occasions-title">SHOP FOR OCCASIONS</div>

  {/* Tabs */}
  <div className="occasions-tabs">
    {occasionCategories.map(cat => (
   <button
      key={cat._id}
      className={`occasions-tab${selectedOccasionTab === cat.name ? ' active' : ''}`}
      onClick={() => setSelectedOccasionTab(cat.name)}
    >
      {cat.name}
    </button>
    ))}


    {/* ✅ Redirect to cake.jsx when clicking View All */}
    <span 
      className="occasions-viewall"
      onClick={() => navigate("/cakes")}
      style={{ cursor: "pointer" }}
    >
      View All
    </span>
  </div>

  {/* Filtered Products */}
  <div 
    className={`occasions-cards ${products.length > 4 ? 'scrollable' : ''}`}
    style={{
      display: "flex",
      justifyContent: products.length <= 4 ? "left" : "flex-start",
      gap: "20px",
      overflowX: products.length > 4 ? "auto" : "hidden",
      padding: "10px 0",
      scrollBehavior: "smooth"
    }}
  >
    {products
      .filter(p => p.category.toLowerCase() === selectedOccasionTab.toLowerCase())
      .map((p) => (
        <div 
          className="occasions-card position-relative d-flex flex-column"
          key={p._id}
          style={{ width: "320px", flex: "0 0 auto", cursor: 'pointer' }}
          onClick={() => handleProductCardClick(p._id)} 
        >
          {/* ❤️ Heart */}
          <div
            className={`occasion-card-heart position-absolute d-flex align-items-center justify-content-center${productLikes[p._id] ? ' liked' : ''}${productAnimations[p._id] ? ' animate' : ''}`}
            onClick={(e) => handleHeartClick(p._id, e)}
            style={{ cursor: 'pointer', top: "10px", right: "10px" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill={productLikes[p._id] ? '#F1A8B6' : 'none'} xmlns="http://www.w3.org/2000/svg">
              <path d="M9 15.25s-5.25-3.8-5.25-7.25A3.25 3.25 0 0 1 9 4.75a3.25 3.25 0 0 1 5.25 3.25c0 3.45-5.25 7.25-5.25 7.25z" stroke="#F1A8B6" strokeWidth="1.5" fill={productLikes[p._id] ? '#F1A8B6' : 'none'}/>
            </svg>
          </div>

          {/* 🖼️ Product Image */}
          <img src={p.image} alt={p.name} className="occasions-card-img w-100" />

          {/* 📦 Product Content */}
          <div className="occasions-card-content d-flex flex-column flex-grow-1">
            <div className="occasions-card-title">{p.name}</div>
            <div className="occasions-card-weight">
              {p.customWeight ? p.customWeight : p.weight ? `${p.weight}` : "N/A"}
            </div>
            <div className="occasions-card-price"><span className="currency">₹ {p.price}.00</span></div>
          </div>

          {/* 🛒 Bag */}
          <div
            className={`occasion-card-bag position-absolute d-flex align-items-center justify-content-center`}
            onClick={(e) => handleAddToCart(p, e)}
            style={{ cursor: 'pointer' }}
          >
            <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="8" width="13" height="10" rx="2" stroke="#2A110A" strokeWidth="1.5" fill="none"/>
              <path d="M8 8V6a3 3 0 0 1 6 0v2" stroke="#2A110A" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
        </div>
    ))}
  </div>
</div>


        {/* Jar Feature Section */}
        <div className="jar-feature-section d-flex align-items-center">
          <img src={jarsImg} alt="Jars" className="jar-feature-img w-100" />
          <div className="jar-feature-content d-flex flex-column">
            <div className="jar-feature-title">LOREM IPSUM IS SIMPLY</div>
            <div className="jar-feature-desc">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy</div>
            <button className="jar-feature-btn">Explore our collection</button>
          </div>
        </div>

      {/* Mini Bites Section */}
<div className="minibites-section">
  <div className="minibites-title">MINI BITES & JARS</div>

  {/* Tabs */}
  <div className="minibites-tabs d-flex align-items-center">
   {miniBitesCategories.map(cat => (
    <button
      key={cat._id}
      className={`minibites-tab${selectedMiniBitesTab === cat.name ? ' active' : ''}`}
      onClick={() => setSelectedMiniBitesTab(cat.name)}
    >
      {cat.name}
    </button>
  ))}

    {/* View All */}
    <span
      className="minibites-viewall ms-auto"
      onClick={() => navigate("/cakes")}
      style={{ cursor: "pointer" }}
    >
      View All
    </span>
  </div>

  {/* Cards */}
  <div
    className={`minibites-cards ${products.length > 4 ? 'scrollable' : ''}`}
    style={{
      display: "flex",
      justifyContent: products.length <= 4 ? "left" : "flex-start",
      gap: "20px",
      overflowX: products.length > 4 ? "auto" : "hidden",
      padding: "10px 0",
      scrollBehavior: "smooth"
    }}
  >
    {products
      .filter((p) =>
        selectedMiniBitesTab
          ? p.category?.toLowerCase() === selectedMiniBitesTab.toLowerCase()
          : true
      )
      .map((p) => (
        <div
          className="minibites-card position-relative d-flex flex-column"
          key={p._id}
          style={{ width: "320px", flex: "0 0 auto", cursor: "pointer" }}
          onClick={() => handleProductCardClick(p._id)}
        >
          {/* ❤️ Heart */}
          <div
            className={`minibites-card-heart position-absolute d-flex align-items-center justify-content-center${
              productLikes[p._id] ? " liked" : ""
            }${productAnimations[p._id] ? " animate" : ""}`}
            onClick={(e) => handleHeartClick(p._id, e)}
            style={{ cursor: "pointer", top: "10px", right: "10px" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill={productLikes[p._id] ? "#F1A8B6" : "none"}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 15.25s-5.25-3.8-5.25-7.25A3.25 3.25 0 0 1 9 4.75a3.25 3.25 0 0 1 5.25 3.25c0 3.45-5.25 7.25-5.25 7.25z"
                stroke="#F1A8B6"
                strokeWidth="1.5"
                fill={productLikes[p._id] ? "#F1A8B6" : "none"}
              />
            </svg>
          </div>

          {/* 🖼️ Product Image */}
          <img src={p.image} alt={p.name} className="minibites-card-img w-100" />

          {/* 📦 Product Content */}
          <div className="minibites-card-content d-flex flex-column flex-grow-1">
            <div className="minibites-card-title">{p.name}</div>
            <div className="minibites-card-weight">
              {p.customWeight
                ? p.customWeight
                : p.weight
                ? `${p.weight}`
                : "N/A"}
            </div>
            <div className="minibites-card-price">
              <span className="currency">₹{p.price}.00</span>
            </div>
          </div>

          {/* 🛒 Bag */}
          <div
            className="minibites-card-bag position-absolute d-flex align-items-center justify-content-center"
            onClick={(e) => handleAddToCart(p, e)}
            style={{ cursor: "pointer" }}
          >
            <svg
              width="23"
              height="23"
              viewBox="0 0 23 23"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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
</div> 

{/* Footer Section */}
      <footer className="rb-footer">
        <div className="rb-footer-top d-flex">
          <div className="rb-footer-brand d-flex flex-column">
            <div className="rb-footer-logo">RIBBONS <span>&amp;</span> BALLOONS</div>
            <button className="rb-footer-follow d-flex align-items-center">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="6" fill="#F6DBE0" stroke="#441E14" strokeWidth="2"/>
                <circle cx="12" cy="12" r="5" stroke="#441E14" strokeWidth="2" fill="none"/>
                <circle cx="17" cy="7" r="1.2" fill="#441E14"/>
              </svg>
              Follow US
            </button>
          <button
  className="rb-footer-google"
  style={{
    width: '188px',
    height: '42px',
    borderRadius: '50px',
    background: '#F6DBE0',
    border: 'none',
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: '15px',
    fontWeight: 500,
    color: '#441E14',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    padding: '0 16px',
    margin: '4px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  }}
  aria-label="Review on Google"
>
  <i className="fab fa-google" style={{ fontSize: '16px' }} />
  Review on Google
</button>
          </div>
          <div className="rb-footer-links d-flex">
            <div className="rb-footer-col d-flex flex-column">
              <div className="rb-footer-col-title">Quick Links</div>
              <ul className="list-unstyled">
                <li onClick={() => navigate('/')} style={{cursor: 'pointer'}}>Home</li>
                <li onClick={() => navigate('/cakes')} style={{cursor: 'pointer'}}>Shop</li>
                <li onClick={() => navigate('/courses')} style={{cursor: 'pointer'}}>Baking Classes</li>
                <li onClick={() => navigate('/contact')} style={{cursor: 'pointer'}}>Contact Us</li>
              </ul>
            </div>
            <div className="rb-footer-col d-flex flex-column">
              <div className="rb-footer-col-title">Shop Now</div>
              <ul className="list-unstyled">
                <li>Customized Cakes</li>
                <li>Mason Jar Cakes</li>
                <li>Cake Slice</li>
                <li>Brownies</li>
                <li>Cupcakes</li>
                <li>Mousses & Desserts</li>
              </ul>
            </div>
            <div className="rb-footer-col d-flex flex-column">
              <div className="rb-footer-col-title">Help</div>
              <ul className="list-unstyled">
                <li>Delivery / Shipment Policy</li>
                <li>Returns & Exchange</li>
                <li>Terms and Conditions</li>
                <li>Privacy Policy</li>
                <li>FAQ</li>
                <li onClick={() => navigate('/contact')} style={{cursor: 'pointer'}}>Contact Us</li>
              </ul>
            </div>
            <div className="rb-footer-col rb-footer-subscribe d-flex flex-column">
              <div className="rb-footer-col-title">Subscribe</div>
              <div className="rb-footer-subscribe-desc">Please enter your email address to receive<br/>daily newsletter or our blog posts.</div>
              <div className="rb-footer-subscribe-form d-flex">
                <input type="email" placeholder="Your email id" className="form-control" />
                <button className="btn" >&#8594;</button>
              </div>
            </div>
          </div>
        </div>
        <div className="rb-footer-bottom">
          <div className="rb-footer-addresses d-flex">
            <div className="rb-footer-address d-flex flex-column">
              <div className="rb-footer-address-title">Oud Metha</div>
              <div className="rb-footer-address-desc">shop no. 5, 8th St - Oud Metha - Dubai<br/>+971 52 489 9029</div>
              <button className="rb-footer-map d-flex align-items-center">View on Map
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22s7-6.5 7-12A7 7 0 1 0 5 10c0 5.5 7 12 7 12z" fill="#B89B5E"/>
                  <circle cx="12" cy="10" r="3" fill="#fff"/>
                </svg>
              </button>
            </div>
            <div className="rb-footer-address d-flex flex-column">
              <div className="rb-footer-address-title">Studio City</div>
              <div className="rb-footer-address-desc">Studio City - Dubai<br/>+971 52 489 8141</div>
              <button className="rb-footer-map d-flex align-items-center" >View on Map
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22s7-6.5 7-12A7 7 0 1 0 5 10c0 5.5 7 12 7 12z" fill="#B89B5E"/>
                  <circle cx="12" cy="10" r="3" fill="#fff"/>
                </svg>
              </button>
            </div>
            <div className="rb-footer-address d-flex flex-column">
              <div className="rb-footer-address-title">Al Qusais</div>
              <div className="rb-footer-address-desc">Inside royal medicare hospital, 16 18th St<br/>- Al Qusais - Al Qusais 2 - Dubai<br/>+971 52 848 3368</div>
              <button className="rb-footer-map d-flex align-items-center" >View on Map
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22s7-6.5 7-12A7 7 0 1 0 5 10c0 5.5 7 12 7 12z" fill="#B89B5E"/>
                  <circle cx="12" cy="10" r="3" fill="#fff"/>
                </svg>
              </button>
            </div>
            <div className="rb-footer-address d-flex flex-column">
              <div className="rb-footer-address-title">Barsha Heights</div>
              <div className="rb-footer-address-desc">Inside grosvenor business tower<br/>Dubai<br/>+971 58 823 8753</div>
              <button className="rb-footer-map d-flex align-items-center">View on Map
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22s7-6.5 7-12A7 7 0 1 0 5 10c0 5.5 7 12 7 12z" fill="#B89B5E"/>
                  <circle cx="12" cy="10" r="3" fill="#fff"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="rb-footer-bottom-row d-flex align-items-center justify-content-between">
            <div className="rb-footer-payment">Secure Payment <span className="rb-footer-payment-icons">
              {/* Visa */}
              <svg width="40" height="16" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '4px'}}>
                <rect width="32" height="20" rx="4" fill="#fff"/>
                <text x="6" y="15" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="13" fill="#1A1F71">VISA</text>
              </svg>
              {/* MasterCard */}
              <svg width="26" height="16" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '4px'}}>
                <rect width="32" height="20" rx="4" fill="#fff"/>
                <circle cx="13" cy="10" r="6" fill="#EB001B"/>
                <circle cx="19" cy="10" r="6" fill="#F79E1B"/>
              </svg>
              {/* Amex */}
              <svg width="36" height="16" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '4px'}}>
                <rect width="32" height="20" rx="4" fill="#fff"/>
                <text x="4" y="15" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="12" fill="#2E77BB">AMEX</text>
              </svg>
              {/* Cash */}
              <svg width="26" height="16" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '4px'}}>
                <rect width="32" height="20" rx="4" fill="#fff"/>
                <rect x="7" y="5" width="18" height="10" rx="2" fill="#B89B5E"/>
                <circle cx="16" cy="10" r="2.5" fill="#fff"/>
              </svg>
            </span></div>
            <div className="rb-footer-copyright">© Ribbons & Balloons 2025. Designed & Developed by Cheval</div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;