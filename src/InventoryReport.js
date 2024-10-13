import React, { useState, useEffect } from 'react';
import { Chart } from 'react-google-charts';
import { Link } from 'react-router-dom';
import './InventoryReport.css'; // Your styles here

const InventoryReport = () => {
  const [inventoryData, setInventoryData] = useState([]);

  // Fetch Inventory Data
  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const response = await fetch('http://localhost:5000/inventory');
      const data = await response.json();
      setInventoryData(data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    }
  };

  return (
    <div className="inventory-report">
      <div className="header-container">
        <h1 className="title">Inventory Report</h1>
        <Link to="/store-manager" className="back-link">
          Back
        </Link>
      </div>

      {/* Table of Products Available in Inventory */}
      <h3 className="section-title">Products Availability</h3>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Price</th>
            <th>Available Items</th>
          </tr>
        </thead>
        <tbody>
          {inventoryData.map((item, index) => (
            <tr key={index}>
              <td>{item.productName}</td>
              <td>${item.price}</td>
              <td>{item.availableItems}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bar Chart for Inventory */}
      <h3 className="section-title">Inventory Bar Chart</h3>
      <div className="chart-container">
        <Chart
          width={'800px'}
          height={'500px'}
          chartType="Bar" // Use Bar chart for horizontal display
          loader={<div>Loading Chart...</div>}
          data={[
            ['Product Name', 'Available Items'],
            ...inventoryData.map((item) => [item.productName, item.availableItems]),
          ]}
          options={{
            title: 'Inventory Report',
            chartArea: { width: '60%' },
            hAxis: {
              title: 'Total Items Available',
              minValue: 0,
            },
            vAxis: {
              title: 'Product Name',
            },
            colors: ['#4285F4'],
            bars: 'horizontal', // Set to horizontal bars
            //legend: { position: 'none' }, // Optional: Hide the legend
          }}
        />
      </div>

      {/* Tables for Products on Sale and Manufacturer Rebates */}
      <h3 className="section-title">Products on Sale</h3>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {inventoryData
            .filter((item) => item.onSale)
            .map((item, index) => (
              <tr key={index}>
                <td>{item.productName}</td>
                <td>${item.price}</td>
              </tr>
            ))}
        </tbody>
      </table>

      <h3 className="section-title">Products with Manufacturer Rebates</h3>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Price</th>
            <th>Rebate Amount</th>
          </tr>
        </thead>
        <tbody>
          {inventoryData
            .filter((item) => item.rebateAmount > 0)
            .map((item, index) => (
              <tr key={index}>
                <td>{item.productName}</td>
                <td>${item.price}</td>
                <td>${item.rebateAmount}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryReport;
