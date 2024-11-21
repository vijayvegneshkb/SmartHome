import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProductReviewsPage.css'; // Optional CSS for styling

const ProductReviewsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reviewsData } = location.state || {}; // Retrieve data from navigation state

  if (!reviewsData || !reviewsData.reviews) {
    return <div>No reviews to display</div>;
  }

  console.log('reviewData', reviewsData);

  return (
    <div className="reviews-container">
      <h1>Product Reviews</h1>
      {reviewsData.reviews.map((product) => (
        <div key={product.ProductName} className="product-section">
          <div className="product-header">
            <div>
              <h2>Product Name: {product.ProductName}</h2>
              <h3>Category: {product.Category}</h3>
            </div>
            <button
              className="view-product-button"
              onClick={() => navigate(`/search?query=${product.ProductName}`)}
            >
              View Product
            </button>
          </div>
          <div className="reviews-list">
            {product.reviews.map((review, index) => (
              <div key={index} className="review-card">
                <p><strong>Review ID:</strong> {review.ReviewId}</p>
                <p><strong>Username:</strong> {review.ReviewUserName}</p>
                <p><strong>Age:</strong> {review.ReviewUserAge}</p>
                <p><strong>Gender:</strong> {review.ReviewUserGender}</p>
                <p><strong>Rating:</strong> {review.ReviewRating}</p>
                <p><strong>Date of Review:</strong> {review.ReviewDate}</p>
                <p><strong>Review Text:</strong> {review.ReviewText}</p>
                <p><strong>Semantic Match:</strong> {review.score}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductReviewsPage;
