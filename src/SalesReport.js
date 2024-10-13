import React, { useState, useEffect } from 'react';
import { Chart } from 'react-google-charts';
import { Link } from 'react-router-dom';
import './SalesReport.css'; // Your styles here

const SalesReport = () => {
  const [salesData, setSalesData] = useState([]);
  const [dailySalesData, setDailySalesData] = useState([]);

  // Fetch Sales Data
  useEffect(() => {
    fetchSalesData();
    fetchDailySalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await fetch('http://localhost:5000/sales'); // Adjust the URL as needed
      const data = await response.json();
      setSalesData(data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const fetchDailySalesData = async () => {
    try {
      const response = await fetch('http://localhost:5000/daily-sales'); // Adjust the URL as needed
      const data = await response.json();
      setDailySalesData(data);
    } catch (error) {
      console.error('Error fetching daily sales data:', error);
    }
  };

  // Function to format the date
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="sales-report">
      <div className="header-container">
        <h1 className="title">Sales Report</h1>
        <Link to="/store-manager" className="back-link">Back</Link>
      </div>

      {/* Table of Products Sold */}
      <h3 className="section-title">Products Sold</h3>
      <table className="sales-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Product Price</th>
            <th>Number of Items Sold</th>
            <th>Total Sales</th>
          </tr>
        </thead>
        <tbody>
          {salesData.map((item, index) => (
            <tr key={index}>
              <td>{item.productName}</td>
              <td>${item.productPrice}</td>
              <td>{item.itemsSold}</td>
              <td>${(item.productPrice * item.itemsSold).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bar Chart for Total Sales by Product */}
      <h3 className="section-title">Total Sales Bar Chart</h3>
      <div className="chart-container">
        <Chart
          width={'800px'}
          height={'500px'}
          chartType="Bar"
          loader={<div>Loading Chart...</div>}
          data={[
            ['Product Name', 'Total Sales'],
            ...salesData.map((item) => [item.productName, item.productPrice * item.itemsSold]),
          ]}
          options={{
            title: 'Total Sales per Product',
            chartArea: { width: '60%' },
            hAxis: {
              title: 'Total Sales',
              minValue: 0,
            },
            vAxis: {
              title: 'Product Name',
            },
            colors: ['#4285F4'],
            bars: 'horizontal', // Set to horizontal bars
          }}
        />
      </div>

      {/* Table of Daily Sales Transactions */}
      <h3 className="section-title">Daily Sales Transactions</h3>
      <table className="sales-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Total Items Sold</th>
            <th>Total Sales</th>
          </tr>
        </thead>
        <tbody>
          {dailySalesData.map((item, index) => (
            <tr key={index}>
              <td>{formatDate(item.saleDate)}</td>
              <td>{item.totalItemsSold}</td>
              <td>${item.totalSales.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesReport;
