// src/CustomerService.js
import React, { useEffect, useState } from 'react';
import './CustomerService.css';
import { useNavigate } from 'react-router-dom';

const CustomerService = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);

  const handleOpenTicket = () => {
    navigate('/customer-service/open-ticket');
  };

  const handleStatusOfTicket = () => {
    navigate('/customer-service/status-ticket');
  };

  // Fetch all tickets from backend
  useEffect(() => {
    fetch('http://localhost:5000/customer-service/tickets')
      .then(response => response.json())
      .then(data => setTickets(data))
      .catch(error => console.error('Error fetching tickets:', error));
  }, []);

  const handleDeleteTicket = (ticketId) => {
    fetch(`http://localhost:5000/customer-service/tickets/${ticketId}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (response.ok) {
          setTickets(prevTickets => prevTickets.filter(ticket => ticket.ticket_id !== ticketId));
        } else {
          console.error('Error deleting ticket');
        }
      })
      .catch(error => console.error('Error deleting ticket:', error));
  };

  return (
    <div className="customer-service-container">
      <div className="customer-service-section">
        <h2>Customer Service</h2>
        <p>Choose an option below:</p>
        <div className="customer-service-options">
          <button onClick={handleOpenTicket} className="customer-service-button">
            Open a Ticket
          </button>
          <button onClick={handleStatusOfTicket} className="customer-service-button">
            Status of a Ticket
          </button>
        </div>
      </div>

      <div className="ticket-cards-container">
        {tickets.map(ticket => (
          <div className="ticket-card" key={ticket.ticket_id}>
            <h3>Ticket ID: {ticket.ticket_id}</h3>
            <p>{ticket.description}</p>
            <img 
              src={`http://localhost:5000/${ticket.image_path.replace(/\\/g, '/')}`} 
              alt={`Ticket ${ticket.ticket_id} - ${ticket.description}`} 
              className="ticket-image" 
            />
            <button 
              onClick={() => handleDeleteTicket(ticket.ticket_id)} 
              className="delete-button"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerService;
