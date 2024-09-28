// src/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // Import the CSS file

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default role
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); // Use the useNavigate hook for redirection

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const res = await axios.post('http://localhost:5000/login', { username, password, role });
      if (res.data.loggedIn) {
        // Store the user information in localStorage
        const userData = { id: res.data.user.id, username, role }; // Assuming the API returns the user ID
        localStorage.setItem('user', JSON.stringify(userData)); // Store username, ID, and role

        // Update user state in the app
        setUser(userData);

        setSuccess('Login successful!');
        setError('');
        // Redirect based on role
      if (role === 'manager') {
        navigate('/store-manager'); // Redirect to StoreManager page
      } else if (role === 'salesman') {
        navigate('/salesman'); // Redirect to Salesman page
      } else {
        navigate('/'); // Redirect to home page for other roles
      }
      } else {
        setError('Invalid credentials');
        setSuccess('');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="customer">Customer</option>
          <option value="salesman">Salesman</option>
          <option value="manager">Manager</option>
        </select>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <Link to="/register">Register here</Link></p>
    </div>
  );
};

export default Login;
