import React, { useState, useEffect } from 'react';
import './CheckoutPage.css';

const CheckoutPage = ({ cartItems, user, setUser, setCart }) => {
  const totalAmount = cartItems.length > 0
    ? cartItems.reduce((total, item) => total + (item.price || 0), 0)
    : 0;

  const [shippingCost, setShippingCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    deliveryMethod: 'Home Delivery',
    zipCode: '',
    storeId: '',
    creditCardNumber: '',
  });
  const [salesmanUserId, setSalesmanUserId] = useState(''); // For salesman user ID input
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [storeLocations, setStoreLocations] = useState([]);

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 14);
  const confirmationNumber = Math.floor(Math.random() * 1000000);

  useEffect(() => {
    fetch('http://localhost:5000/store-locations')
      .then(response => response.json())
      .then(data => {
        setStoreLocations(data);
      })
      .catch(error => console.error('Error fetching store locations:', error));
  }, []);

  useEffect(() => {
    if (formData.deliveryMethod === 'Home Delivery') {
      setShippingCost(totalAmount * 0.1);
    } else if (formData.deliveryMethod === 'In-store Pickup') {
      setShippingCost(0);
    }
  }, [formData.deliveryMethod, totalAmount]);

  useEffect(() => {
    const randomDiscount = Math.floor(Math.random() * 9) + 1;
    setDiscount((totalAmount * randomDiscount) / 100);
  }, [totalAmount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleConfirmOrder = (e) => {
    e.preventDefault();

    // Use the entered userId if the user is a salesman, else use the logged-in user
    const userId = (user && user.role === 'salesman') ? salesmanUserId : user.id;

    if (!userId) {
      alert('Please log in to place an order or enter a user ID.');
      return;
    }

    const grandTotal = totalAmount + shippingCost - discount;
    const quantity = cartItems.length;

    const orderDetails = {
      userId, // Use the userId from the input or user props
      cartItems,
      customerDetails: formData,
      deliveryOption: formData.deliveryMethod,
      totalAmount: grandTotal,
      confirmationNumber,
      deliveryDate: deliveryDate.toISOString().split('T')[0],
      creditCardNumber: formData.creditCardNumber,
      shippingCost,
      discount,
      quantity,
    };

    if (formData.deliveryMethod === 'In-store Pickup') {
      orderDetails.storeId = formData.storeId;
    }

    fetch('http://localhost:5000/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderDetails),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          setOrderConfirmation(data);
          clearCart();
        }
      })
      .catch((error) => console.error('Error placing order:', error));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

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
          {formData.deliveryMethod === 'Home Delivery' && (
            <h3>Shipping Cost (10%): ${shippingCost.toFixed(2)}</h3>
          )}
          <h3>Discount: ${discount.toFixed(2)}</h3>
          <h3>Grand Total: ${(totalAmount + shippingCost - discount).toFixed(2)}</h3>
        </div>
      )}

      {!orderConfirmation ? (
        <form className="checkout-form" onSubmit={handleConfirmOrder}>
          <h2>Enter Your Details</h2>

          {/* Salesman user ID input */}
          {user && user.role === 'salesman' && (
            <label>
              User ID:
              <input
                type="text"
                value={salesmanUserId}
                onChange={(e) => setSalesmanUserId(e.target.value)}
                required
              />
            </label>
          )}

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
              Select Store:
              <select
                name="storeId"
                value={formData.storeId}
                onChange={handleChange}
                required
              >
                <option value="">Select Store</option>
                {storeLocations.map((store) => (
                  <option key={store.StoreID} value={store.StoreID}>
                    {store.Street}, {store.City}, {store.State}, {store.ZipCode}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            Credit Card Number:
            <input
              type="text"
              name="creditCardNumber"
              value={formData.creditCardNumber}
              onChange={handleChange}
              required
            />
          </label>

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
          <p>Total Amount: ${orderConfirmation.totalAmount ? orderConfirmation.totalAmount.toFixed(2) : "0.00"}</p>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
