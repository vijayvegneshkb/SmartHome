// src/CategoryPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CategoryPage.css';

const CategoryPage = ({ category, addToCart }) => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate(); // Get the navigate function

  useEffect(() => {
    axios.get(`http://localhost:5000/products/category/${category}`)
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  }, [category]);

  const handleBuyClick = (product) => {
    const userName = localStorage.getItem('user'); // Check if user is logged in
    if (userName) {
      addToCart(product); // Add to cart if logged in
    } else {
      navigate('/login'); // Redirect to login if not logged in
    }
  };

  return (
    <div className="category-page">
      <h1>{category.charAt(0).toUpperCase() + category.slice(1)} Products</h1>
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <h2>{product.name}</h2>
            <p>Manufacturer: {product.manufacturer}</p>
            <p className="price">Price: ${product.price}</p>
            <button className="buy-button" onClick={() => handleBuyClick(product)}>Buy</button> {/* Updated function call */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
