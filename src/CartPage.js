// src/CartPage.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CartPage.css'; // Import the new CSS file

const CartPage = ({ cartItems, setCart }) => {
  // Calculate the total amount
  const totalAmount = cartItems.reduce((total, item) => total + item.price, 0);

  // Function to remove an item from the cart
  const removeFromCart = (index) => {
    const newCartItems = cartItems.filter((_, i) => i !== index);
    setCart(newCartItems);

    // Update local storage
    localStorage.setItem('cart', JSON.stringify(newCartItems));
  };

  useEffect(() => {
    // Set the cartItems from local storage on component mount
    const storedCartItems = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCartItems);
  }, [setCart]);

  return (
    <div className="cart-page">
      <h1 className="cart-title">Your Cart</h1>
      {cartItems && cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty.</p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {cartItems.map((item, index) => (
              <div key={index} className="product-card">
                <img src={item.image} alt={item.name} className="product-image" />
                <div className="product-info">
                  <h2 className="product-name">{item.name}</h2>
                  <p className="manufacturer">Manufacturer: {item.manufacturer}</p>
                  <p className="price">Price: ${item.price}</p>
                  <button className="remove-button" onClick={() => removeFromCart(index)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h2>Total Amount: ${totalAmount.toFixed(2)}</h2>
            <Link to="/checkout">
              <button className="checkout-button">Checkout</button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
