import React from 'react';
import Icon from '../../atoms/Icon/Icon';
import './UnauthorizedDialog.css';

const UnauthorizedDialog = ({ isOpen, onOk }) => {
  if (!isOpen) return null;

  return (
    <div className="unauthorized-dialog-overlay">
      <div className="unauthorized-dialog">
        <div className="unauthorized-icon">
          <Icon name="lock" size={64} color="#dc3545" />
        </div>
        <h3>Unauthorized Access</h3>
        <p>Your session has expired or you don't have permission to access this resource.</p>
        <p className="unauthorized-subtitle">Please login again to continue.</p>
        <button className="btn-ok" onClick={onOk}>
          OK
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedDialog;
