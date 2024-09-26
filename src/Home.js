// src/Home.js
import React from 'react';
import heroImage from './assets/hero-img.png';
import './Home.css';

const Home = () => {
  return (
      <div className="hero-section">
        <img src={heroImage} alt="Smart Home" className="hero-image" />
        <div className="hero-text">
          <h2>Your Smart Home, Simplified</h2>
          <p>Manage all your smart devices from one place.</p>
        </div>
      </div>
  );
};

export default Home;
