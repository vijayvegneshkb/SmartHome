// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './Home';
import CategoryPage from './CategoryPage';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import Login from './login';
import Register from './Register';
import ManufacturerPage from './ManufacturerPage';
import Orders from './Orders';
import StoreManager from './StoreManager';
import Salesman from './Salesman';
import Trending from './Trending';
import InventoryReport from './InventoryReport';
import SalesReport from './SalesReport';
import Search from './Search';
import CustomerService from './CustomerService';
import OpenTicket from './OpenTicket';
import StatusTicket from './StatusTicket';
import RecommendedProducts from './RecommendedProducts';
import ProductReviewsPage from './ProductReviewsPage';


function App() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const addToCart = (product) => {
    const updatedCart = [...cart, product];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <Router>
      <Layout cart={cart} setCart={setCart} addToCart={addToCart} user={user}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doorbells" element={<CategoryPage category="doorbells" addToCart={addToCart} />} />
          <Route path="/doorlocks" element={<CategoryPage category="doorlocks" addToCart={addToCart} />} />
          <Route path="/speakers" element={<CategoryPage category="speakers" addToCart={addToCart} />} />
          <Route path="/lightings" element={<CategoryPage category="lightings" addToCart={addToCart} />} />
          <Route path="/thermostats" element={<CategoryPage category="thermostats" addToCart={addToCart} />} />
          <Route path="/cart" element={<CartPage cartItems={cart} setCart={setCart} />} />
          <Route path="/checkout" element={<CheckoutPage cartItems={cart} user={user} setUser={setUser} setCart={setCart} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/:category/:manufacturer" element={<ManufacturerPage addToCart={addToCart} />} /> {/* Pass addToCart prop */}
          <Route path="/orders" element={<Orders />} />
          <Route path="/store-manager" element={<StoreManager />} />
          <Route path="/salesman" element={<Salesman />} />
          <Route path="/trending" element={<Trending addToCart={addToCart} />} />
          <Route path="/inventory" element={<InventoryReport />} />
          <Route path="/sales" element={<SalesReport />} />
          <Route path="/search" element={<Search addToCart={addToCart} />} />
          <Route path="/customer-service" element={<CustomerService />} />
          <Route path="/customer-service/open-ticket" element={<OpenTicket />} />
          <Route path="/customer-service/status-ticket" element={<StatusTicket />} />
          <Route path="/recommended-products" element={<RecommendedProducts addToCart={addToCart} />} />
          <Route path="/product-reviews" element={<ProductReviewsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
