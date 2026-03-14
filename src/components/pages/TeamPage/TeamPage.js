import React, { useState, useEffect } from 'react';
import Icon from '../../atoms/Icon/Icon';
import Snackbar from '../../atoms/Snackbar/Snackbar';
import AssignRoleDialog from '../../molecules/AssignRoleDialog/AssignRoleDialog';
import { apiRequest } from '../../../utils/api';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';
import './TeamPage.css';

const TeamPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;
  const [activeTab, setActiveTab] = useState('members');
  const [roles, setRoles] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ isOpen: false, message: '', type: 'success' });
  const [showAssignRoleDialog, setShowAssignRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (activeTab === 'roles') {
      fetchRoles();
    } else {
      fetchTeamMembers();
    }
  }, [activeTab]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/admin/roles`, {
        method: 'GET'
      });

      const result = await response.json();

      if (response.ok) {
        const rolesData = result.data || result;
        setRoles(Array.isArray(rolesData) ? rolesData : []);
        setError('');
      } else {
        const errorData = result.data || result;
        setError(errorData.message || 'Failed to fetch roles');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/users`, {
        method: 'GET'
      });

      const result = await response.json();

      if (response.ok) {
        const users = result.data || result;
        setTeamMembers(Array.isArray(users) ? users : []);
        setError('');
      } else {
        const errorData = result.data || result;
        setError(errorData.message || 'Failed to fetch team members');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleAssignRole = (user) => {
    setSelectedUser(user);
    setShowAssignRoleDialog(true);
  };

  const handleSaveRoles = async (roles) => {
    if (!selectedUser) return;

    try {
      const response = await apiRequest(
        `${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/admin/users/${selectedUser.id}/roles`,
        {
          method: 'PUT',
          body: JSON.stringify({ roles })
        }
      );

      if (response.ok) {
        setShowAssignRoleDialog(false);
        setSnackbar({
          isOpen: true,
          message: 'Roles updated successfully!',
          type: 'success'
        });
        // Refresh team members to show updated roles
        fetchTeamMembers();
      } else {
        const result = await response.json();
        const errorData = result.data || result;
        setSnackbar({
          isOpen: true,
          message: errorData.message || 'Failed to update roles',
          type: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        isOpen: true,
        message: 'Network error. Failed to update roles.',
        type: 'error'
      });
      console.error('Error updating roles:', err);
    }
  };

  const cancelAssignRole = () => {
    setShowAssignRoleDialog(false);
    setSelectedUser(null);
  };

  const renderTeamMembers = () => {
    if (loading) {
      return <div className="loading-state">Loading team members...</div>;
    }

    return (
      <div className="team-members-content">
        <div className="content-header">
          <h2>Team Members</h2>
          <p>Manage your team members and their access</p>
        </div>

        <div className="team-table">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    No team members found
                  </td>
                </tr>
              ) : (
                teamMembers.map(member => (
                  <tr key={member.id}>
                    <td>
                      <div className="member-info">
                        <div className="member-avatar">
                          {member.fullName ? member.fullName.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <div className="member-name">{member.fullName}</div>
                          <div className="member-username">@{member.userName}</div>
                        </div>
                      </div>
                    </td>
                    <td>{member.email}</td>
                    <td>{member.phone}</td>
                    <td>
                      <div className="roles-cell">
                        {member.roles && member.roles.length > 0 ? (
                          member.roles.map((role, index) => (
                            <span key={index} className="role-badge">
                              {typeof role === 'string' ? role.replace('ROLE_', '') : role.name?.replace('ROLE_', '')}
                            </span>
                          ))
                        ) : (
                          <span className="role-badge">User</span>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(member.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon btn-assign-role" 
                          title="Assign Roles"
                          onClick={() => handleAssignRole(member)}
                        >
                          <Icon name="shield" size={18} />
                        </button>
                        <button className="btn-icon btn-edit" title="Edit">
                          <Icon name="edit" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderRolesAndPermissions = () => {
    if (loading) {
      return <div className="loading-state">Loading roles...</div>;
    }

    return (
      <div className="roles-content">
        <div className="content-header">
          <h2>Roles & Permissions</h2>
          <p>Manage roles and their associated permissions</p>
        </div>

        <div className="roles-grid">
          {roles.length === 0 ? (
            <div className="empty-state">No roles found</div>
          ) : (
            roles.map(role => (
              <div key={role.id} className="role-card">
                <div className="role-card-header">
                  <div className="role-icon">
                    <Icon name="shield" size={24} />
                  </div>
                  <div className="role-info">
                    <h3>{role.name.replace('ROLE_', '')}</h3>
                    <p>{role.description}</p>
                  </div>
                </div>

                <div className="role-card-body">
                  <div className="permissions-header">
                    <span className="permissions-count">
                      {role.permissions?.length || 0} Permissions
                    </span>
                  </div>
                  <div className="permissions-list">
                    {role.permissions?.slice(0, 6).map(permission => (
                      <div key={permission.id} className="permission-item">
                        <Icon name="userCheck" size={14} />
                        <span>{permission.name.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                    {role.permissions?.length > 6 && (
                      <div className="permission-item more">
                        +{role.permissions.length - 6} more
                      </div>
                    )}
                  </div>
                </div>

                <div className="role-card-footer">
                  <button className="btn-view-details">
                    View Details
                    <Icon name="arrowLeft" size={16} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="team-page">
      <div className="page-header">
        <h1>Team Management</h1>
        <p>Manage your team members, roles, and permissions</p>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <Icon name="userCheck" size={18} />
            Team Members
          </button>
          <button
            className={`tab ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            <Icon name="shield" size={18} />
            Roles & Permissions
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="tab-content">
        {activeTab === 'members' ? renderTeamMembers() : renderRolesAndPermissions()}
      </div>

      <AssignRoleDialog
        isOpen={showAssignRoleDialog}
        user={selectedUser}
        onSave={handleSaveRoles}
        onCancel={cancelAssignRole}
      />

      <Snackbar
        isOpen={snackbar.isOpen}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar({ ...snackbar, isOpen: false })}
        duration={3000}
      />
    </div>
  );
};

export default TeamPage;
