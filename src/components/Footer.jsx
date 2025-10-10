import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = ({ className = '', onSubscribe }) => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  
  const validateEmail = (email) => {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      return;
    }
    setEmail('');
    if (onSubscribe) {
      onSubscribe();
    }
  };
  
  // Handle navigation for Quick Links
  const handleQuickLinkClick = (link) => {
    switch(link) {
      case 'Home':
        navigate('/');
        break;
      case 'Shop':
        navigate('/cakes');
        break;
      case 'Baking Classes':
        navigate('/courses');
        break;
      case 'Contact Us':
        navigate('/contact');
        break;
      default:
        navigate('/');
    }
  };

  // Scroll to section function (same as in App.jsx)
  const scrollToSection = (section) => {
    // This function would need to be passed as a prop from parent component
    // or use a global state management solution
    // For now, we'll navigate to main page and rely on the main app to handle scrolling
    navigate('/');
    // The actual scrolling logic would be handled in App.jsx
  };

  // Set category and scroll function (would need to be passed as props)
  const handleShopNowClick = (category, section) => {
    navigate('/');
    // The actual tab setting and scrolling would be handled in App.jsx
  };

  return (
    <footer className={`rb-footer ${className}`}>
      <div className="rb-footer-top">
        <div className="rb-footer-brand">
          <div className="rb-footer-logo">RIBBONS <span>&amp;</span> BALLOONS</div>
          <button className="rb-footer-follow">
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
        <div className="rb-footer-links">
          <div className="rb-footer-col">
            <div className="rb-footer-col-title">Quick Links</div>
            <ul>
              <li onClick={() => handleQuickLinkClick('Home')} style={{cursor: 'pointer'}}>Home</li>
              <li onClick={() => handleQuickLinkClick('Shop')} style={{cursor: 'pointer'}}>Shop</li>
              <li onClick={() => handleQuickLinkClick('Baking Classes')} style={{cursor: 'pointer'}}>Baking Classes</li>
              <li onClick={() => handleQuickLinkClick('Contact Us')} style={{cursor: 'pointer'}}>Contact Us</li>
            </ul>
          </div>
          <div className="rb-footer-col">
            <div className="rb-footer-col-title">Shop Now</div>
            <ul>
              <li 
                onClick={() => handleShopNowClick('Custom Cake', 'sweet-story')} 
                style={{cursor: 'pointer'}}
              >
                Customized Cakes
              </li>
              <li 
                onClick={() => handleShopNowClick('Masson jar Cake', 'sweet-story')} 
                style={{cursor: 'pointer'}}
              >
                Mason Jar Cakes
              </li>
              <li 
                onClick={() => handleShopNowClick('Cake slice', 'mini-bites')} 
                style={{cursor: 'pointer'}}
              >
                Cake Slice
              </li>
              <li 
                onClick={() => handleShopNowClick('Brownie', 'mini-bites')} 
                style={{cursor: 'pointer'}}
              >
                Brownies
              </li>
              <li 
                onClick={() => handleShopNowClick('Cup Cake', 'occasions')} 
                style={{cursor: 'pointer'}}
              >
                Cup Cake
              </li>
              <li>Ramadan</li>
              <li>Whole Cake</li>
              <li>Milk Cakes</li>
              <li>Cheese Cakes</li>
              <li>Mousses & Desserts</li>
            </ul>
          </div>
          <div className="rb-footer-col">
            <div className="rb-footer-col-title">Help</div>
            <ul>
              <li onClick={() => navigate('/returnpolicy')} style={{cursor: 'pointer'}}>Returns & Exchange</li>
              <li onClick={() => navigate('/about')} style={{cursor: 'pointer'}}>Terms and Conditions</li>
              <li onClick={() => navigate('/returnpolicy')} style={{cursor: 'pointer'}}>Privacy Policy</li>
              <li onClick={() => navigate('/about')} style={{cursor: 'pointer'}}>FAQ</li>
              <li onClick={() => navigate('/contact')} style={{cursor: 'pointer'}}>Contact Us</li>
              <li onClick={() => navigate('/categories')} style={{cursor: 'pointer'}}>CMS</li>
            </ul>
          </div>
          <div className="rb-footer-col rb-footer-subscribe">
            <div className="rb-footer-col-title">Subscribe</div>
            <div className="rb-footer-subscribe-desc">
              Please enter your email address to receive<br/>daily newsletter or our blog posts.
              <span style={{color: 'red', marginLeft: 4}}>*</span>
            </div>
            <div className="rb-footer-subscribe-form">
              <input
                type="email"
                placeholder="Your email id"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button
                onClick={handleSubscribe}
                disabled={!email}
                style={{ opacity: !email ? 0.6 : 1, cursor: !email ? 'not-allowed' : 'pointer' }}
              >&#8594;</button>
            </div>
          </div>
        </div>
      </div>
      <div className="rb-footer-bottom">
        <div className="rb-footer-addresses">
          <div className="rb-footer-address">
            <div className="rb-footer-address-title">Oud Metha</div>
            <div className="rb-footer-address-desc">shop no. 5, 8th St - Oud Metha - Dubai<br/>+971 52 489 9029</div>
            <button className="rb-footer-map">View on Map
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22s7-6.5 7-12A7 7 0 1 0 5 10c0 5.5 7 12 7 12z" fill="#B89B5E"/>
                <circle cx="12" cy="10" r="3" fill="#fff"/>
              </svg>
            </button>
          </div>
          <div className="rb-footer-address">
            <div className="rb-footer-address-title">Studio City</div>
            <div className="rb-footer-address-desc">Studio City - Dubai<br/>+971 52 489 8141</div>
            <button className="rb-footer-map">View on Map
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22s7-6.5 7-12A7 7 0 1 0 5 10c0 5.5 7 12 7 12z" fill="#B89B5E"/>
                <circle cx="12" cy="10" r="3" fill="#fff"/>
              </svg>
            </button>
          </div>
          <div className="rb-footer-address">
            <div className="rb-footer-address-title">Al Qusais</div>
            <div className="rb-footer-address-desc">Inside royal medicare hospital, 16 18th St<br/>- Al Qusais - Al Qusais 2 - Dubai<br/>+971 52 848 3368</div>
            <button className="rb-footer-map">View on Map
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22s7-6.5 7-12A7 7 0 1 0 5 10c0 5.5 7 12 7 12z" fill="#B89B5E"/>
                <circle cx="12" cy="10" r="3" fill="#fff"/>
              </svg>
            </button>
          </div>
          <div className="rb-footer-address">
            <div className="rb-footer-address-title">Barsha Heights</div>
            <div className="rb-footer-address-desc">Inside grosvenor business tower<br/>Dubai<br/>+971 58 823 8753</div>
            <button className="rb-footer-map">View on Map
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22s7-6.5 7-12A7 7 0 1 0 5 10c0 5.5 7 12 7 12z" fill="#B89B5E"/>
                <circle cx="12" cy="10" r="3" fill="#fff"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="rb-footer-bottom-row">
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
  );
};

export default Footer;