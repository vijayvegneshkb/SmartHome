import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Salesman.css';

const Salesman = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [updatedCustomerName, setUpdatedCustomerName] = useState('');
  const [updatedAddress, setUpdatedAddress] = useState('');
  const [updatedStreet, setUpdatedStreet] = useState('');
  const [updatedCity, setUpdatedCity] = useState('');
  const [updatedState, setUpdatedState] = useState('');
  const [updatedZipcode, setUpdatedZipcode] = useState('');
  const [updatedTotalAmount, setUpdatedTotalAmount] = useState('');
  const [updatedDeliveryOption, setUpdatedDeliveryOption] = useState('');
  const [updatedDeliveryDate, setUpdatedDeliveryDate] = useState('');
  const [updatedCreditCardNumber, setUpdatedCreditCardNumber] = useState('');
  const [updatedShippingCost, setUpdatedShippingCost] = useState(''); // New state for shipping cost
  const [updatedDiscount, setUpdatedDiscount] = useState(''); // New state for discount

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch orders.');
    }
  };

  const createCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/create-customer', { username, password });
      setSuccess('Customer created successfully!');
      setError('');
      setUsername('');
      setPassword('');
      fetchOrders(); // Refresh orders after creating a new customer
    } catch (err) {
      console.error(err);
      setError('Failed to create customer.');
      setSuccess('');
    }
  };

  const updateOrder = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/orders/${currentOrder.id}`, {
        customer_name: updatedCustomerName,
        address: updatedAddress,
        street: updatedStreet,
        city: updatedCity,
        state: updatedState,
        zip_code: updatedZipcode,
        total_amount: updatedTotalAmount,
        delivery_option: updatedDeliveryOption,
        delivery_date: updatedDeliveryDate,
        credit_card_number: updatedCreditCardNumber,
        shippingCost: updatedShippingCost, // Include shipping cost
        discount: updatedDiscount // Include discount
      });
      setSuccess('Order updated successfully!');
      setError('');
      setIsModalOpen(false); // Close modal after updating
      fetchOrders(); // Refresh orders
    } catch (err) {
      console.error(err);
      setError('Failed to update order.');
      setSuccess('');
    }
  };

  const openUpdateModal = (order) => {
    setCurrentOrder(order);
    setUpdatedCustomerName(order.customer_name);
    setUpdatedAddress(order.address);
    setUpdatedStreet(order.street);
    setUpdatedCity(order.city);
    setUpdatedState(order.state);
    setUpdatedZipcode(order.zip_code);
    setUpdatedTotalAmount(order.total_amount);
    setUpdatedDeliveryOption(order.delivery_option);
    setUpdatedDeliveryDate(order.delivery_date);
    setUpdatedCreditCardNumber(order.credit_card_number || '');
    setUpdatedShippingCost(order.shippingCost || ''); // Set existing shipping cost
    setUpdatedDiscount(order.discount || ''); // Set existing discount
    setIsModalOpen(true);
  };

  const deleteOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:5000/orders/${orderId}`);
      setSuccess('Order deleted successfully!');
      setError('');
      fetchOrders(); // Refresh orders
    } catch (err) {
      console.error(err);
      setError('Failed to delete order.');
      setSuccess('');
    }
  };

  return (
    <div className="salesman-container">
      <h2 className="title">Salesman Dashboard</h2>

      {/* Success/Error Messages */}
      <div className="message-container">
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>

      <div className="form-card">
        <h3>Create New Customer</h3>
        <form onSubmit={createCustomer}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="submit-button">Create Customer</button>
        </form>
      </div>

      <div className="orders-card">
        <h3>All Orders</h3>
        <ul className="orders-list">
          {orders.map((order) => (
            <li key={order.id} className="order-item">
              <div className="order-details">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Customer Name:</strong> {order.customer_name}</p>
                <p><strong>Address:</strong> {order.address}</p>
                <p><strong>Street:</strong> {order.street}</p>
                <p><strong>City:</strong> {order.city}</p>
                <p><strong>State:</strong> {order.state}</p>
                <p><strong>ZipCode:</strong> {order.zip_code}</p>
                <p><strong>Total Amount:</strong> ${order.total_amount}</p>
                <p><strong>Delivery Option:</strong> {order.delivery_option}</p>
                <p><strong>Delivery Date:</strong> {order.delivery_date}</p>
                <p><strong>Confirmation Number:</strong> {order.confirmation_number}</p>
                <h4>Products:</h4>
                <ul>
                  {order.products.map((product) => (
                    <li key={product.product_id}>
                      {product.product_name} - {product.quantity} x ${product.price}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-buttons">
                <button onClick={() => openUpdateModal(order)} className="update-button">Update</button>
                <button onClick={() => deleteOrder(order.id)} className="delete-button">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal for updating order */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Update Order</h3>
            <form onSubmit={updateOrder}>
              <input
                type="text"
                placeholder="Customer Name"
                value={updatedCustomerName}
                onChange={(e) => setUpdatedCustomerName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={updatedAddress}
                onChange={(e) => setUpdatedAddress(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Street"
                value={updatedStreet}
                onChange={(e) => setUpdatedStreet(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="City"
                value={updatedCity}
                onChange={(e) => setUpdatedCity(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="State"
                value={updatedState}
                onChange={(e) => setUpdatedState(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="ZipCode"
                value={updatedZipcode}
                onChange={(e) => setUpdatedZipcode(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Total Amount"
                value={updatedTotalAmount}
                onChange={(e) => setUpdatedTotalAmount(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Delivery Option"
                value={updatedDeliveryOption}
                onChange={(e) => setUpdatedDeliveryOption(e.target.value)}
                required
              />
              <input
                type="date"
                placeholder="Delivery Date"
                value={updatedDeliveryDate}
                onChange={(e) => setUpdatedDeliveryDate(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Credit Card Number"
                value={updatedCreditCardNumber}
                onChange={(e) => setUpdatedCreditCardNumber(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Shipping Cost"
                value={updatedShippingCost}
                onChange={(e) => setUpdatedShippingCost(e.target.value)}
              />
              <input
                type="number"
                placeholder="Discount"
                value={updatedDiscount}
                onChange={(e) => setUpdatedDiscount(e.target.value)}
              />
              <button type="submit" className="submit-button">Update Order</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="close-button">Close</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salesman;
