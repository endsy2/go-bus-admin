import React from 'react';
import Button from '../../atoms/Button/Button';
import './CustomersPage.css';

const CustomersPage = () => {
  const customers = [
    { id: 'C001', name: 'John Doe', email: 'john@example.com', phone: '+1 234-567-8901', bookings: 12, joined: '2025-01-15' },
    { id: 'C002', name: 'Jane Smith', email: 'jane@example.com', phone: '+1 234-567-8902', bookings: 8, joined: '2025-02-20' },
    { id: 'C003', name: 'Mike Johnson', email: 'mike@example.com', phone: '+1 234-567-8903', bookings: 15, joined: '2024-12-10' },
    { id: 'C004', name: 'Sarah Williams', email: 'sarah@example.com', phone: '+1 234-567-8904', bookings: 5, joined: '2026-01-05' },
    { id: 'C005', name: 'David Lee', email: 'david@example.com', phone: '+1 234-567-8905', bookings: 20, joined: '2024-11-22' },
  ];

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1>Customer Management</h1>
          <p>View and manage customer information</p>
        </div>
        <Button variant="primary">+ Add Customer</Button>
      </div>

      <div className="customers-table">
        <table>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Total Bookings</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td className="customer-id">{customer.id}</td>
                <td>
                  <div className="customer-name">
                    <div className="avatar">{customer.name.charAt(0)}</div>
                    {customer.name}
                  </div>
                </td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>
                  <span className="bookings-count">{customer.bookings}</span>
                </td>
                <td>{customer.joined}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="View">👁️</button>
                    <button className="btn-icon" title="Edit">✏️</button>
                    <button className="btn-icon" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersPage;
