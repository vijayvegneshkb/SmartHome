import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import logo from './assets/logo.png';
import './Home.css';

const Layout = ({ children, cart, setCart, addToCart }) => {
  const [categories, setCategories] = useState({});
  const navigate = useNavigate();
  const location = useLocation(); // Use the useLocation hook to get the current path

  // Retrieve the user object from localStorage and parse it
  const savedUser = localStorage.getItem('user');
  const user = savedUser ? JSON.parse(savedUser) : null; // Parse to get the user object

  useEffect(() => {
    // Fetch categories and their manufacturers from the server
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

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

      {/* Top Menu Bar - Conditional Rendering */}
      {location.pathname !== '/store-manager' && ( // Only show if not on store-manager page
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
            {/* Conditional rendering of Salesman Dashboard button */}
            {user && user.role === 'salesman' && (
              <Link to="/salesman" className="action-button">Salesman Dashboard</Link>
            )}
            {!user && <Link to="/login" className="action-button">Login</Link>}
            <Link to="/cart" className="action-button">Cart({cartItemsCount})</Link>
          </div>
        </nav>
      )}

      <div className="content-container">
        {/* Left Side Navbar - Conditional Rendering */}
        {location.pathname !== '/store-manager' && ( // Only show if not on store-manager page
          <nav className="side-nav">
            <div className="trending-button-container">
              <Link to="/trending" className="trending-button">Trending</Link>
            </div>
            <ul>
              {/* Iterate through categories to create links with manufacturers */}
              {Object.keys(categories).map((category, index) => (
                <li key={index}>
                  <span className="category-title">{category}</span>
                  <ul>
                    {categories[category].map((manufacturer, idx) => (
                      <li key={idx}>
                        <Link to={`/${category.toLowerCase()}/${manufacturer}`}>{manufacturer}</Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        )}

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
