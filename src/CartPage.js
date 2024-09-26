// src/CartPage.js
import React from 'react';

const CartPage = ({ cartItems }) => {
  return (
      <div className="cart-page">
        <h1>Your Cart</h1>
        {cartItems && cartItems.length === 0 ? ( // Check if cartItems is defined
          <p>Your cart is empty.</p>
        ) : (
          <div className="product-grid">
            {cartItems.map((item, index) => (
              <div key={index} className="product-card">
                <img src={item.image} alt={item.name} className="product-image" />
                <h2>{item.name}</h2>
                <p>Manufacturer: {item.manufacturer}</p>
                <p className="price">Price: ${item.price}</p>
              </div>
            ))}
          </div>
        )}
      </div>
  );
};

export default CartPage;
