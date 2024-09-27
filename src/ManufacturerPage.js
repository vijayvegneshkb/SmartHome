// src/ManufacturerPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
//import './ManufacturerPage.css';

const ManufacturerPage = ({ addToCart }) => {
  const { category, manufacturer } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProductsByManufacturer = async () => {
      const response = await axios.get(`http://localhost:5000/products/category/${category}/manufacturer/${manufacturer}`);
      setProducts(response.data);
    };

    fetchProductsByManufacturer();
  }, [category, manufacturer]);

  return (
    <div className="manufacturer-page">
      <h1>{manufacturer} Products in {category.charAt(0).toUpperCase() + category.slice(1)}</h1>
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <h2>{product.name}</h2>
            <p className="price">Price: ${product.price}</p>
            <button className="buy-button" onClick={() => addToCart(product)}>Buy</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManufacturerPage;
