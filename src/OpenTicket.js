import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OpenTicket.css';

const OpenTicket = () => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [ticketId, setTicketId] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('description', description);
    formData.append('image', image);

    try {
      const response = await fetch('http://localhost:5000/customer-service/tickets', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setTicketId(data.ticketId);
        setDescription('');
        setImage(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error creating ticket');
      }
    } catch (err) {
      console.error('Error submitting ticket:', err);
      setError('An error occurred while submitting the ticket.');
    }
  };

  return (
    <div className="open-ticket-section">
      <button className="back-button" onClick={() => navigate('/customer-service')}>
        &#8592; Back
      </button>
      
      <div className="open-ticket-form-container">
        <h2>Open a Customer Service Ticket</h2>
        <form onSubmit={handleSubmit} className="open-ticket-form">
          <label>
            Describe the issue with the shipment:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>

          <label>
            Upload an image of the product or box:
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
          </label>

          <button type="submit">Submit Ticket</button>
        </form>

        {ticketId && (
          <p className="ticket-id">
            Ticket successfully created! Your ticket ID is: <strong>{ticketId}</strong>
          </p>
        )}

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default OpenTicket;
