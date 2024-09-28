// src/Orders.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css'; // Import the CSS file

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate(); // Use the useNavigate hook for redirection

  // Check if the user is logged in
  const isLoggedIn = !!localStorage.getItem('user');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      fetchOrders();
    }
  }, [isLoggedIn, navigate]);

  const fetchOrders = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user')).id; // Get user ID from localStorage
      const response = await fetch(`http://localhost:5000/orders?userId=${userId}`); // Fetch orders for the specific user
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const confirmed = window.confirm('Are you sure you want to delete this order?');
    if (confirmed) {
      try {
        await fetch(`http://localhost:5000/orders/${orderId}`, { method: 'DELETE' });
        setOrders(orders.filter(order => order.id !== orderId));
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="orders-container">
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-info">
              <p><strong>Order Confirmation:</strong> {order.confirmation_number}</p>
              <p><strong>Customer:</strong> {order.customer_name}</p>
              <p><strong>Address:</strong> {order.address}</p>
              <p><strong>Street:</strong> {order.street}</p> {/* Display Street */}
              <p><strong>City:</strong> {order.city}</p>     {/* Display City */}
              <p><strong>State:</strong> {order.state}</p>   {/* Display State */}
              <p><strong>Zip Code:</strong> {order.zip_code}</p> {/* Display Zip Code */}
              <p><strong>Delivery Option:</strong> {order.delivery_option}</p>
              <p><strong>Total Amount:</strong> ${order.total_amount}</p>
              <p><strong>Delivery Date:</strong> {formatDate(order.delivery_date)}</p>
            </div>
            <div className="products-info">
              <h4>Products Purchased:</h4>
              {order.products.map((product) => (
                <div key={product.product_id} className="product-item">
                  <p><strong>Product:</strong> {product.product_name}</p>
                  <p><strong>Price:</strong> ${product.price}</p>
                  <p><strong>Discount:</strong> {product.discount}%</p>
                </div>
              ))}
            </div>
            <button className="delete-button" onClick={() => handleDeleteOrder(order.id)}>
              Delete Order
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
