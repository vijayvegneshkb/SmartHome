// src/StatusOfTicket.js
import React, { useState } from 'react';
import './StatusTicket.css';

const StatusTicket = () => {
  const [ticketId, setTicketId] = useState('');
  const [decision, setDecision] = useState(null);
  const [justification, setJustification] = useState(null);
  const [error, setError] = useState(null);

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
    }
  };

  return (
    <div className="status-ticket-section">
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
  );
};

export default StatusTicket;
