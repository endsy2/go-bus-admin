import React, { useState, useEffect } from 'react';
import Button from '../../atoms/Button/Button';
import Icon from '../../atoms/Icon/Icon';
import { apiRequest } from '../../../utils/api';
import './AssignRoleDialog.css';

const AssignRoleDialog = ({ isOpen, user, onSave, onCancel }) => {
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      // Initialize selected roles from user's current roles
      if (user?.roles) {
        setSelectedRoles(user.roles.map(role => role.name || role));
      }
    }
  }, [isOpen, user]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/admin/roles`, {
        method: 'GET'
      });

      const result = await response.json();

      if (response.ok) {
        const rolesData = result.data || result;
        setAvailableRoles(Array.isArray(rolesData) ? rolesData : []);
        setError('');
      } else {
        const errorData = result.data || result;
        setError(errorData.message || 'Failed to fetch roles');
      }
    } catch (err) {
      setError('Failed to load roles');
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleName) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleName)) {
        return prev.filter(r => r !== roleName);
      } else {
        return [...prev, roleName];
      }
    });
  };

  const handleSave = () => {
    onSave(selectedRoles);
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog assign-role-dialog">
        <div className="dialog-header">
          <h2>Assign Roles</h2>
          <button className="close-btn" onClick={onCancel}>
            <Icon name="x" size={24} />
          </button>
        </div>

        <div className="dialog-body">
          {user && (
            <div className="user-info-section">
              <div className="user-avatar-small">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <div className="user-name">{user.fullName}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading-state">Loading roles...</div>
          ) : (
            <div className="roles-selection">
              <p className="section-label">Select roles for this user:</p>
              <div className="roles-list">
                {availableRoles.map(role => (
                  <label key={role.id} className="role-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.name)}
                      onChange={() => handleRoleToggle(role.name)}
                    />
                    <div className="role-info">
                      <div className="role-name">
                        <Icon name="shield" size={16} />
                        {role.name.replace('ROLE_', '')}
                      </div>
                      {role.description && (
                        <div className="role-description">{role.description}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            Save Roles
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignRoleDialog;
