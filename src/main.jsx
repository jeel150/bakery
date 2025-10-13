import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/central.css';
import App from '../src/pages/App.jsx';
import Cake from './pages/Cake.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Checkout from './pages/Checkout.jsx';
import CartSidebar from './components/CartSidebar.jsx';
import { CartSidebarContext } from './data/CartSidebarContext.js';
import { CartProvider } from '../src/components/CartContext.jsx';
import Course from './pages/course.jsx';
import ViewCourse from './pages/viewcourse.jsx';
import About from './pages/about.jsx';
import Contact from './pages/contact.jsx';
import Signup from './pages/SignUp.jsx';
import Login from './pages/Login.jsx';
import ReturnPolicy from './pages/returnpolicy.jsx';
import Invoice from './pages/invoice.jsx';
import OrderHistory from './pages/orderhistory.jsx';
import OrderDetails from './pages/orderdetails.jsx';
import { ThemeProvider } from "./components/ThemeContext.jsx";
import CategoryManagement from '../Admin/src/pages/CategoryManagement.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


function MainProvider() {
  const [isCartOpen, setCartOpen] = useState(false);
  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);


  return (
     <React.StrictMode>
    <CartProvider>
      <ThemeProvider>
        <CartSidebarContext.Provider value={{ openCart, closeCart }}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={ <App />} />
              <Route path="/cakes" element={<Cake />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/courses" element={<Course />} />
              <Route path="/viewcourse" element={<ViewCourse />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/signup" element={<Signup /> } />
              <Route path="/login" element={<Login />} />
              <Route path="/returnpolicy" element={<ReturnPolicy />} />
              <Route path="/invoice" element={<Invoice />} />
              <Route path="/orderhistory" element={<OrderHistory />} />
              <Route path="/orderdetails" element={<OrderDetails/>}/>
              <Route path="/categories" element={<CategoryManagement/>}/>
            </Routes>
            <CartSidebar isOpen={isCartOpen} onClose={closeCart}/>
          </BrowserRouter>
        </CartSidebarContext.Provider>
      </ThemeProvider>
    </CartProvider>
    </React.StrictMode>

  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainProvider />
  </React.StrictMode>
);

