// src/Trending.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importing axios for API calls
import './Trending.css'; // Optional: For styling

const Trending = ({ addToCart }) => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topStoreLocations, setTopStoreLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Get the navigate function
  const [showModal, setShowModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false); // State for reviews modal
  const [reviewData, setReviewData] = useState({
    productId: '',
    productName: '',
    productCategory: '',
    productPrice: '',
    storeID: '',
    storeStreet: '',
    storeZip: '',
    storeCity: '',
    storeState: '',
    productOnSale: false,
    manufacturerName: '',
    manufacturerRebate: '',
    userID: '',
    userAge: '',
    userGender: '',
    userOccupation: '',
    reviewRating: '',
    reviewDate: new Date().toISOString().split('T')[0], // Set today's date
    reviewText: ''
  });

  const [storeLocations, setStoreLocations] = useState([]); // State for store locations
  const [reviews, setReviews] = useState([]); // State for reviews

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/trending');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        //console.log(data); // Log the data for debugging
        
        // Set the trending products in state
        setTrendingProducts(data);
      } catch (error) {
        console.error('Error fetching trending products:', error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchTrendingProducts();
    fetch('http://localhost:5000/store-locations')
      .then(response => response.json())
      .then(data => setStoreLocations(data))
      .catch(error => console.error('Error fetching store locations:', error));

    // Fetch top store locations
    axios.get('http://localhost:5000/top-store-locations')
    .then(response => {
        setTopStoreLocations(response.data);
    })
    .catch(error => {
        console.error('Error fetching top store locations:', error);
    });

    axios
      .get('http://localhost:5000/api/top-sold-products')
      .then((response) => {
        setTopProducts(response.data);
      })
      .catch((error) => {
        console.error('Error fetching the top products:', error);
      });

  }, []);

  const handleBuyClick = (product) => {
    const userName = localStorage.getItem('user'); // Check if user is logged in
    if (userName) {
      addToCart(product); // Add to cart if logged in
    } else {
      navigate('/login'); // Redirect to login if not logged in
    }
  };


  if (loading) {
    return <div>Loading...</div>; // Loading state
  }

  const handleReviewChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReviewData({
      ...reviewData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleStoreChange = (e) => {
    const selectedStoreID = e.target.value;
    const selectedStore = storeLocations.find(store => store.StoreID === Number(selectedStoreID));

    if (selectedStore) {
      setReviewData({
        ...reviewData,
        storeID: selectedStoreID,
        storeStreet: selectedStore.Street,
        storeZip: selectedStore.ZipCode,
        storeCity: selectedStore.City,
        storeState: selectedStore.State
      });
    } else {
      // Reset store data if no store is selected
      setReviewData({
        ...reviewData,
        storeID: '',
        storeStreet: '',
        storeZip: '',
        storeCity: '',
        storeState: ''
      });
    }
  };

  const handleReviewButtonClick = (product) => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      alert('You must be logged in to give a review.'); // Alert the user
      return; // Exit if not logged in
    }

    const parsedUserData = JSON.parse(userData); // Parse user data

    // Set initial review data and show modal
    setReviewData({
      ...reviewData,
      productId: product.id,
      productName: product.name,
      productCategory: product.category,
      productPrice: product.price,
      manufacturerName: product.manufacturer,
      userID: parsedUserData.id // Set userID for the review
    });

    setShowModal(true); // Show the modal
  };

  const handleViewReviewsButtonClick = (productId) => {
    // Fetch reviews for the specific product
    axios.get(`http://localhost:5000/reviews/${productId}`)
      .then(response => {
        setReviews(response.data); // Set reviews data
        setShowReviewsModal(true); // Show reviews modal
      })
      .catch(error => {
        //console.error('Error fetching reviews:', error);
        alert('No reviews found');
      });
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    // Ensure userID is present (it's now set when the review button is clicked)
    if (!reviewData.userID) {
      alert('You must be logged in to submit a review.'); // Alert the user
      return; // Exit the function if userID is not available
    }

    // Proceed with review submission
    axios.post('http://localhost:5000/reviews', reviewData)
      .then(response => {
        console.log('Review submitted:', response.data);
        setShowModal(false);
        setReviewData({ ...reviewData, reviewText: '' }); // Reset form after submission
      })
      .catch(error => {
        console.error('Error submitting review:', error);
      });
  };

  const importImage = (imageName) => {
    try {
      return require(`./assets/images/${imageName}`);
    } catch (error) {
      console.error(`Error loading image ${imageName}:`, error);
      return null; // Return a default image or null if the image cannot be loaded
    }
  };

  return (
    <div className="trending-container">
        <h2>Trending Products</h2>
        <div className="product-grid">
            {trendingProducts.map(product => (
                <div key={product.id} className="product-card">
                <img src={importImage(product.image)} alt={product.name} className="product-image" />
                <h2>{product.name}</h2>
                <p>Manufacturer: {product.manufacturer}</p>
                <p className="price">Price: ${product.price}</p>
                <button className="buy-button" onClick={() => handleBuyClick(product)}>Buy</button>
                <button className="review-button" onClick={() => handleReviewButtonClick(product)}>Give Review</button>
                <button className="view-reviews-button" onClick={() => handleViewReviewsButtonClick(product.id)}>View Reviews</button>
                </div>
            ))}
        </div>

        <h2>Top ZipCodes/Locations</h2>
        <div className="top-store-locations">
            {topStoreLocations.length > 0 ? (
                <ul>
                    {topStoreLocations.map((store) => (
                        <li key={store.storeId}>
                            <h3>{store.street}, {store.city}, {store.state}, {store.zipCode}</h3>
                            <p>Products: {store.totalOrders}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No store locations available.</p>
            )}
        </div>

        <h2>Most Sold Products</h2>
        <div className="product-grid">
            {topProducts.map(product => (
                <div key={product.id} className="product-card">
                <img src={importImage(product.image)} alt={product.name} className="product-image" />
                <h2>{product.name}</h2>
                <p>Manufacturer: {product.manufacturer}</p>
                <p className="price">Price: ${product.price}</p>
                <button className="buy-button" onClick={() => handleBuyClick(product)}>Buy</button>
                <button className="review-button" onClick={() => handleReviewButtonClick(product)}>Give Review</button>
                <button className="view-reviews-button" onClick={() => handleViewReviewsButtonClick(product.id)}>View Reviews</button>
                </div>
            ))}
        </div>

        {/* Modal for review form */}
        {showModal && (
            <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                <h2>Submit Review</h2>
                <form onSubmit={handleSubmitReview}>
                <label>Product ID:</label>
                <input type="text" name="productId" value={reviewData.productId} readOnly />
    
                <label>Product Name:</label>
                <input type="text" name="productName" value={reviewData.productName} readOnly />
    
                <label>Product Category:</label>
                <input type="text" name="productCategory" value={reviewData.productCategory} readOnly />
    
                <label>Product Price:</label>
                <input type="text" name="productPrice" value={reviewData.productPrice} readOnly />
    
                <label>Store ID:</label><br />
                <select name="storeID" onChange={handleStoreChange} required>
                    <option value="">Select Store</option>
                    {storeLocations.map(store => (
                    <option key={store.StoreID} value={store.StoreID}>
                        {store.Street}, {store.City}, {store.State}, {store.ZipCode}
                    </option>
                    ))}
                </select>
                <br />
                <label>Store Street:</label>
                <input type="text" name="storeStreet" value={reviewData.storeStreet} readOnly required />
                
                <label>Store Zip:</label>
                <input type="text" name="storeZip" value={reviewData.storeZip} readOnly required />
                
                <label>Store City:</label>
                <input type="text" name="storeCity" value={reviewData.storeCity} readOnly required />
                
                <label>Store State:</label>
                <input type="text" name="storeState" value={reviewData.storeState} readOnly required />
                
                <label>Product On Sale:</label>
                <input type="checkbox" name="productOnSale" onChange={handleReviewChange} />
                
                <label>Manufacturer Name:</label>
                <input type="text" name="manufacturerName" value={reviewData.manufacturerName} readOnly />
                
                <label>Manufacturer Rebate:</label>
                <input type="text" name="manufacturerRebate" onChange={handleReviewChange} required />
                
                <label>User ID:</label>
                <input type="text" name="userID" value={reviewData.userID} readOnly required />
                
                <label>User Age:</label>
                <input type="number" name="userAge" onChange={handleReviewChange} required />
                
                <label>User Gender:</label>
                <input type="text" name="userGender" onChange={handleReviewChange} required />
                
                <label>User Occupation:</label>
                <input type="text" name="userOccupation" onChange={handleReviewChange} required />
                
                <label>Review Rating:</label>
                <input type="number" name="reviewRating" min="1" max="5" onChange={handleReviewChange} required />
                
                <label>Review Date:</label>
                <input type="date" name="reviewDate" value={reviewData.reviewDate} onChange={handleReviewChange} required />
                
                <label>Review Text:</label>
                <textarea name="reviewText" value={reviewData.reviewText} onChange={handleReviewChange} required></textarea>
                
                <button type="submit">Submit Review</button>
                </form>
            </div>
            </div>
        )}
    
        {/* Modal for viewing reviews */}
        {showReviewsModal && (
            <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={() => setShowReviewsModal(false)}>&times;</span>
                <h2>Product Reviews</h2>
                <div className="reviews-list">
                {reviews.map(review => (
                    <div key={review.reviewID || `${review.productId}-${review.userID}-${review.reviewDate}`} className="review-item">
                    <p><strong>Product ID:</strong> {review.productId}</p>
                    <p><strong>Product Name:</strong> {review.productName}</p>
                    <p><strong>Category:</strong> {review.productCategory}</p>
                    <p><strong>Price:</strong> ${review.productPrice}</p>
                    <p><strong>Store:</strong> {review.storeStreet}, {review.storeCity}, {review.storeState}, {review.storeZip}</p>
                    <p><strong>On Sale:</strong> {review.productOnSale ? 'Yes' : 'No'}</p>
                    <p><strong>Manufacturer:</strong> {review.manufacturerName}</p>
                    <p><strong>Manufacturer Rebate:</strong> ${review.manufacturerRebate}</p>
                    <p><strong>User ID:</strong> {review.userID}</p>
                    <p><strong>User Age:</strong> {review.userAge}</p>
                    <p><strong>User Gender:</strong> {review.userGender}</p>
                    <p><strong>User Occupation:</strong> {review.userOccupation}</p>
                    <p><strong>Rating:</strong> {review.reviewRating}/5</p>
                    <p><strong>Date:</strong> {new Date(review.reviewDate).toLocaleDateString()}</p>
                    <p><strong>Review:</strong> {review.reviewText}</p>
                    <hr />
                    </div>
                ))}
                </div>
            </div>
            </div>
        )}
    </div>
  );
};

export default Trending;
