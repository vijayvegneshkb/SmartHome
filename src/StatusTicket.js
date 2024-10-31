import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StatusTicket.css';

const StatusTicket = () => {
  const [ticketId, setTicketId] = useState('');
  const [decision, setDecision] = useState(null);
  const [justification, setJustification] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // New loading state

  const navigate = useNavigate();

  const formatDecision = (decision) => {
    switch (decision) {
      case 'replace_order':
        return 'Replace Order';
      case 'refund_order':
        return 'Refund Order';
      case 'escalate_to_human_agent':
        return 'Escalate to Human Agent';
      default:
        return decision;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true); // Start loading

    try {
      const response = await fetch(`http://localhost:5000/customer-service/tickets/${ticketId}`);
      if (response.ok) {
        const data = await response.json();
        setDecision(data.decision);
        setJustification(data.justification);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Ticket not found');
      }
    } catch (err) {
      console.error('Error fetching ticket status:', err);
      setError('An error occurred while retrieving the ticket status.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="status-ticket-section">
      <div className="status-ticket-container">
        <button className="back-button" onClick={() => navigate('/customer-service')}>
          &#8592; Back
        </button>
        
        <h2>Check Status of a Ticket</h2>
        <form onSubmit={handleSubmit} className="status-ticket-form">
          <label>
            Enter Ticket Number:
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              required
            />
          </label>
          <button type="submit">Check Status</button>
        </form>

        {loading && <div className="loader">Loading...</div>} {/* Loader displayed during loading */}

        {decision && justification && (
          <div className="ticket-decision-container">
            <p className="ticket-decision">
              <span className="label">Decision:</span> <strong>{formatDecision(decision)}</strong>
            </p>
            <p className="ticket-justification">
              <span className="label">Justification:</span> {justification}
            </p>
          </div>
        )}
        
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default StatusTicket;
