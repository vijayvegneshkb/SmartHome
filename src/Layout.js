// src/Layout.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './assets/logo.png';
import './Home.css';

const Layout = ({ children, cart, setCart, addToCart }) => {
  const navigate = useNavigate();

  // Retrieve the user object from localStorage and parse it
  const savedUser = localStorage.getItem('user');
  const user = savedUser ? JSON.parse(savedUser) : null; // Parse to get the user object

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setCart([]); // Clear the cart on logout
    navigate('/'); // Redirect after logout
  };

  const cartItemsCount = cart.length;

  return (
    <div className="home-container">
      {/* Header Section */}
      <header className="home-header">
        <div className="logo-container">
          <img src={logo} alt="Smart Home Logo" className="logo" />
          <h1 className="logo-name">SMART HOME</h1>
        </div>
        {user && user.username && <span className="user-greeting">Hello, {user.username}</span>}
        {user && (
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        )}
      </header>

      {/* Top Menu Bar */}
      <nav className="menu-bar">
        <ul className="menu-list">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/doorbells">Doorbell</Link></li>
          <li><Link to="/doorlocks">Doorlock</Link></li>
          <li><Link to="/speakers">Speakers</Link></li>
          <li><Link to="/lightings">Lightings</Link></li>
          <li><Link to="/thermostats">Thermostats</Link></li>
        </ul>
        <div className="user-actions">
          <Link to="/orders" className="action-button">Orders</Link>
          {!user && <Link to="/login" className="action-button">Login</Link>}
          <Link to="/cart" className="action-button">Cart({cartItemsCount})</Link>
        </div>
      </nav>

      <div className="content-container">
        {/* Left Side Navbar */}
        <nav className="side-nav">
          <ul>
            <li>Doorbell
              <ul>
                <li><Link to="/doorbells/manufacturer1">Manufacturer 1</Link></li>
                <li><Link to="/doorbells/manufacturer2">Manufacturer 2</Link></li>
                <li><Link to="/doorbells/manufacturer3">Manufacturer 3</Link></li>
              </ul>
            </li>
            <li>Doorlock
              <ul>
                <li><Link to="/doorlocks/manufacturer1">Manufacturer 1</Link></li>
                <li><Link to="/doorlocks/manufacturer2">Manufacturer 2</Link></li>
                <li><Link to="/doorlocks/manufacturer3">Manufacturer 3</Link></li>
              </ul>
            </li>
            <li>Speakers
              <ul>
                <li><Link to="/speakers/manufacturer1">Manufacturer 1</Link></li>
                <li><Link to="/speakers/manufacturer2">Manufacturer 2</Link></li>
                <li><Link to="/speakers/manufacturer3">Manufacturer 3</Link></li>
              </ul>
            </li>
            <li>Lightings
              <ul>
                <li><Link to="/lightings/manufacturer1">Manufacturer 1</Link></li>
                <li><Link to="/lightings/manufacturer2">Manufacturer 2</Link></li>
                <li><Link to="/lightings/manufacturer3">Manufacturer 3</Link></li>
              </ul>
            </li>
            <li>Thermostats
              <ul>
                <li><Link to="/thermostats/manufacturer1">Manufacturer 1</Link></li>
                <li><Link to="/thermostats/manufacturer2">Manufacturer 2</Link></li>
                <li><Link to="/thermostats/manufacturer3">Manufacturer 3</Link></li>
              </ul>
            </li>
          </ul>
        </nav>

        {/* Render Child Components */}
        <main className="main-content">
          {React.Children.map(children, (child) => {
            return React.cloneElement(child, { addToCart });
          })}
        </main>
      </div>
    </div>
  );
};

export default Layout;
