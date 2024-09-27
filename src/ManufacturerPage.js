import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importing axios for API calls
import './ManufacturerPage.css'; // Importing the CSS file

const ManufacturerPage = ({ addToCart }) => {
  const { category, manufacturer } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Get the navigate function

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/products/category/${category}?manufacturer=${manufacturer}`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, manufacturer]);

  const handleBuyClick = (product) => {
    const userName = localStorage.getItem('user'); // Check if user is logged in
    if (userName) {
      addToCart(product); // Add to cart if logged in
    } else {
      navigate('/login'); // Redirect to login if not logged in
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="category-page">
      <h1>{`${category.charAt(0).toUpperCase() + category.slice(1)} from ${manufacturer}`}</h1>
      <div className="product-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.name} className="product-image" />
              <h2>{product.name}</h2>
              <p>Manufacturer: {product.manufacturer}</p>
              <p className="price">Price: ${product.price}</p>
              <button className="buy-button" onClick={() => handleBuyClick(product)}>Buy</button> {/* Updated button label */}
            </div>
          ))
        ) : (
          <p>No products found for this manufacturer.</p>
        )}
      </div>
    </div>
  );
};

export default ManufacturerPage;
