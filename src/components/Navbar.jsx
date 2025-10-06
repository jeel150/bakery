import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/central.css';
import images from '../data/images';
const { logo } = images;
import OrderHistory from '../pages/orderhistory.jsx';
import OrderDetails from '../pages/orderdetails.jsx';
import Invoice from '../pages/invoice.jsx';
import '../styles/orderhistory.css';
import '../styles/orderdetails.css';
import '../styles/invoice.css';
import { useTheme } from '../components/ThemeContext.jsx';

const Navbar = ({ onSearch }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('cakes');
  const [showToast, setShowToast] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const navigate = useNavigate();

  const { theme } = useTheme();

  useEffect(() => {
    if (theme?.colors) {
      document.documentElement.style.setProperty('--navbar-primary', theme.colors.primary);
      document.documentElement.style.setProperty('--navbar-secondary', theme.colors.secondary);
      document.documentElement.style.setProperty('--navbar-accent', theme.colors.accent);
      document.documentElement.style.setProperty('--navbar-background', theme.colors.background);
    } else {
      document.documentElement.style.removeProperty('--navbar-primary');
      document.documentElement.style.removeProperty('--navbar-secondary');
      document.documentElement.style.removeProperty('--navbar-accent');
      document.documentElement.style.removeProperty('--navbar-background');
    }
  }, [theme]);

  const handleSearchClick = () => setShowSearch(true);
  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchText("");
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      const q = searchText.trim();
      if (!q) return;
      if (onSearch) onSearch(q);
      setShowSearch(false);
      setSearchText("");
    }
  };

  const handleSearchButtonSubmit = () => {
    const q = searchText.trim();
    if (!q) return;
    if (onSearch) onSearch(q);
    setShowSearch(false);
    setSearchText("");
  };

  const handleHeartClick = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleBagClick = () => {
    setShowOrderHistory(true);
  };

  const handleUserClick = () => {
    navigate('/contact');
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
    setShowMobileMenu(false);

    if (window.location.pathname !== '/') {
      navigate('/');
    }

    setTimeout(() => {
      let sectionId = '';

      switch (menuItem) {
        case 'cakes':
          sectionId = 'sweet-story-section';
          break;
        case 'jars':
          sectionId = 'minibites-section';
          break;
        case 'chefs':
          sectionId = 'sweet-story-section';
          break;
        case 'mini-bites':
          sectionId = 'minibites-section';
          break;
        case 'customized':
          sectionId = 'imagination-section';
          break;
        case 'corporate':
          sectionId = 'occasions-section';
          break;
        default:
          sectionId = 'sweet-story-section';
          break;
      }

      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleOrderSelect = (order) => {
    setSelectedOrderId(order.id);
    setShowOrderHistory(false);
    setShowOrderDetails(true);
  };

  const handleGenerateInvoice = (orderId) => {
    setSelectedOrderId(orderId);
    setShowOrderDetails(false);
    setShowInvoice(true);
  };

  const handleDownloadInvoice = (order) => {
    console.log('Downloading invoice for order:', order);
    alert('Invoice download functionality would be implemented here');
  };

  const handleCloseOrderHistory = () => {
    setShowOrderHistory(false);
  };

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrderId(null);
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setShowOrderDetails(true);
  };

  const handleBackFromInvoice = () => {
    setShowInvoice(false);
    setShowOrderDetails(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu && !event.target.closest('.navbar-rb')) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  return (
    <>
      {showToast && (
        <div className="toast-notification">
          <div className="toast-content">
            <div className="toast-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 17s-5-3.33-7-6.5C1 8 2.5 5 5.5 5c1.54 0 2.54 1 3.5 2 0.96-1 1.96-2 3.5-2C17.5 5 19 8 17 10.5c-2 3.17-7 6.5-7 6.5z" stroke="#B89B5E" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <span className="toast-message">Nothing is in favourite</span>
            <button className="toast-close" onClick={() => setShowToast(false)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {showOrderHistory && (
        <div className="order-history-slider">
          <div className="order-history-content">
            <OrderHistory onClose={handleCloseOrderHistory} onOrderSelect={handleOrderSelect} />
          </div>
        </div>
      )}

      {showOrderDetails && (
        <div className="order-details-slider">
          <div className="order-details-content">
            <OrderDetails
              orderId={selectedOrderId}
              onClose={handleCloseOrderDetails}
              onGenerateInvoice={handleGenerateInvoice}
            />
          </div>
        </div>
      )}

      {showInvoice && (
        <div className="invoice-slider">
          <div className="invoice-content">
            <Invoice
              orderId={selectedOrderId}
              onClose={handleBackFromInvoice}
              onDownload={handleDownloadInvoice}
            />
          </div>
        </div>
      )}

      <nav className="navbar-rb">
        {/* Floating Searchbar */}
        {showSearch && (
          <div className="floating-searchbar-overlay" onClick={handleCloseSearch}>
            <div className="floating-searchbar" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                placeholder="Search cakes, desserts..."
                autoFocus
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="close-searchbar" onClick={handleCloseSearch}>&times;</button>
                <button className="close-searchbar" onClick={handleSearchButtonSubmit} aria-label="Search">Search</button>
              </div>
            </div>
          </div>
        )}

        <div className="navbar-logo">
          <img src={logo} alt="Ribbons & Balloons" />
        </div>

        <ul className={`navbar-menu ${showMobileMenu ? 'mobile-active' : ''}`}>
          <li
            className={`navbar-item cakes ${activeMenuItem === 'cakes' ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('cakes')}
          >
            Cakes
          </li>
          <li
            className={`navbar-item jars ${activeMenuItem === 'jars' ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('jars')}
          >
            Jars
          </li>
          <li
            className={`navbar-item chefs ${activeMenuItem === 'chefs' ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('chefs')}
          >
            Chef's Special
          </li>
          <li
            className={`navbar-item mini-bites ${activeMenuItem === 'mini-bites' ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('mini-bites')}
          >
            Mini Bites
          </li>
          <li
            className={`navbar-item customized ${activeMenuItem === 'customized' ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('customized')}
          >
            Customized Cake
          </li>
          <li
            className={`navbar-item corporate ${activeMenuItem === 'corporate' ? 'active' : ''}`}
            onClick={() => handleMenuItemClick('corporate')}
          >
            Corporate & events
          </li>
        </ul>

        <div className="navbar-icons">
          <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            {!showMobileMenu ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12H21M3 6H21M3 18H21" stroke="var(--navbar-primary, #2A110A)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5L5 15M5 5L15 15" stroke="var(--navbar-primary, #2A110A)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <div className="icon-circle" onClick={handleSearchClick} style={{ cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="9" r="7" stroke="var(--navbar-primary, #2A110A)" strokeWidth="2" />
              <line x1="14.2929" y1="14.7071" x2="18" y2="18.4142" stroke="var(--navbar-primary, #2A110A)" strokeWidth="2" />
            </svg>
          </div>
          <div className="icon-circle" onClick={handleHeartClick} style={{ cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 17s-5-3.33-7-6.5C1 8 2.5 5 5.5 5c1.54 0 2.54 1 3.5 2 0.96-1 1.96-2 3.5-2C17.5 5 19 8 17 10.5c-2 3.17-7 6.5-7 6.5z" stroke="var(--navbar-primary, #2A110A)" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <div className="icon-circle" onClick={handleUserClick} style={{ cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="7" r="3" stroke="var(--navbar-primary, #2A110A)" strokeWidth="2" />
              <path d="M3 17c0-2.21 3.13-4 7-4s7 1.79 7 4" stroke="var(--navbar-primary, #2A110A)" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <div className="icon-circle" onClick={handleBagClick} style={{ cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="7" width="12" height="9" rx="2" stroke="var(--navbar-primary, #2A110A)" strokeWidth="2" />
              <path d="M7 7V5a3 3 0 1 1 6 0v2" stroke="var(--navbar-primary, #2A110A)" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
