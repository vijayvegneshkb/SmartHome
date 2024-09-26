// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './Home';
import CategoryPage from './CategoryPage';
import CartPage from './CartPage';
import Login from './login';
import Register from './Register';

function App() {
  const [cart, setCart] = useState([]); // Initialize cart state

  const addToCart = (product) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  return (
    <Router>
      <Layout cart={cart} setCart={setCart} addToCart={addToCart}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doorbells" element={<CategoryPage category="doorbells" addToCart={addToCart} />} />
          <Route path="/doorlocks" element={<CategoryPage category="doorlocks" addToCart={addToCart} />} />
          <Route path="/speakers" element={<CategoryPage category="speakers" addToCart={addToCart} />} />
          <Route path="/lightings" element={<CategoryPage category="lightings" addToCart={addToCart} />} />
          <Route path="/thermostats" element={<CategoryPage category="thermostats" addToCart={addToCart} />} />
          <Route path="/cart" element={<CartPage cartItems={cart} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
