import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link for navigation
import axios from 'axios'; // Import axios for HTTP requests
import './Register.css'; // Import the CSS file

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'customer' // Default role
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate(); // Initialize useNavigate for navigation

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password, confirmPassword, role } = formData;

    // Simple validation: check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/register', {
        username, password, role
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        setError('');

        // Automatically log in the user after successful registration
        setUser({ username, role });

        // Store user details in localStorage
        localStorage.setItem('user', username);
        localStorage.setItem('role', role);

        // Optionally reset form data
        setFormData({ username: '', password: '', confirmPassword: '', role: 'customer' });
        
        // Redirect to home page after successful registration
        navigate(`/?user=${username}`);
      } else {
        setError(response.data.message);
        setSuccess('');
      }
    } catch (error) {
      setError('Failed to register. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div>
      <Link to="/login" className="return-link">Return to Login</Link>
      <div className="register-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              name="role"
              id="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="customer">Customer</option>
              <option value="salesman">Salesman</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <button type="submit" className="register-button">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
