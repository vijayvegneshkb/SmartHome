import React, { useState } from 'react';
import './CheckoutPage.css';

const CheckoutPage = ({ cartItems, user, setUser, setCart }) => {
  console.log(cartItems); // Debug log to check cart items

  const totalAmount = cartItems.reduce((total, item) => total + item.price, 0);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    street: '',
    city: '',
    state: '',
    deliveryMethod: 'Home Delivery',
    zipCode: '',
  });
  
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const zipCodes = ['12345', '67890', '54321', '09876'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const confirmationNumber = Math.floor(Math.random() * 1000000);
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 14); // Set date two weeks from now

  const handleConfirmOrder = (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please log in to place an order.');
      return;
    }

    const orderDetails = {
      userId: user.id,  // Ensure the user is logged in and has an ID
      cartItems,
      customerDetails: formData,
      deliveryOption: formData.deliveryMethod,
      totalAmount,
      confirmationNumber,
      deliveryDate: deliveryDate.toISOString().split('T')[0], // Store date in YYYY-MM-DD format
    };

    fetch('http://localhost:5000/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderDetails),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          console.log(data);
          setOrderConfirmation(data);
          clearCart(); // Clear the cart after successful order
        }
      })
      .catch((error) => console.error('Error placing order:', error));
  };

  const clearCart = () => {
    setCart([]); // Clear cart state
    localStorage.removeItem('cart'); // Clear cart from localStorage
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      {/* Display Bill and Cart Items only if orderConfirmation is not set */}
      {!orderConfirmation && (
        <div className="bill-statement">
          <h2>Your Bill</h2>
          {cartItems.length > 0 ? (
            cartItems.map((item, index) => (
              <div key={index} className="bill-item">
                <p>{item.name} - ${item.price.toFixed(2)}</p>
              </div>
            ))
          ) : (
            <p>Your cart is empty.</p>
          )}
          <h3>Total: ${totalAmount.toFixed(2)}</h3>
        </div>
      )}

      {/* If order is not confirmed, display the checkout form */}
      {!orderConfirmation ? (
        <form className="checkout-form" onSubmit={handleConfirmOrder}>
          <h2>Enter Your Details</h2>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Address:
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Street:
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            City:
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            State:
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Delivery Method:
            <select
              name="deliveryMethod"
              value={formData.deliveryMethod}
              onChange={handleChange}
            >
              <option value="Home Delivery">Home Delivery</option>
              <option value="In-store Pickup">In-store Pickup</option>
            </select>
          </label>

          {formData.deliveryMethod === 'In-store Pickup' && (
            <label>
              Zip Code:
              <select
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
              >
                {zipCodes.map((zip, index) => (
                  <option key={index} value={zip}>
                    {zip}
                  </option>
                ))}
              </select>
            </label>
          )}

          <p>Pickup/Delivery Date: {deliveryDate.toDateString()}</p>
          <p>Confirmation Number: {confirmationNumber}</p>

          <button type="submit" className="submit-button">Confirm Order</button>
        </form>
      ) : (
        <div className="confirmation-message">
          <h2>Order Confirmed!</h2>
          <p>Thank you for your order, {formData.name}.</p>
          <p>Confirmation Number: {orderConfirmation.confirmationNumber}</p>
          <p>Delivery/Pickup Date: {new Date(orderConfirmation.deliveryDate).toDateString()}</p>
          <p>Total Amount: ${orderConfirmation.totalAmount.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
