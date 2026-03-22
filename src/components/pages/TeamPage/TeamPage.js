import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../atoms/Icon/Icon';
import Snackbar from '../../atoms/Snackbar/Snackbar';
import AssignRoleDialog from '../../molecules/AssignRoleDialog/AssignRoleDialog';
import Pagination from '../../molecules/Pagination/Pagination';
import { apiRequest } from '../../../utils/api';
import { useLocale } from '../../../context/LocaleContext';
import { translations } from '../../../locales/translations';
import './TeamPage.css';

const TeamPage = () => {
  const { locale } = useLocale();
  const t = (key) => translations[locale]?.[key] || translations.en[key] || key;

  const [activeTab, setActiveTab] = useState('members');

  // Members state
  const [teamMembers, setTeamMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersPagination, setMembersPagination] = useState({
    currentPage: 1,
    pageSize: 15,
    totalPages: 0,
    totalElements: 0
  });

  // Roles state
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  // Permissions state
  const [allPermissions, setAllPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [savingRole, setSavingRole] = useState(null);

  // UI state
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ isOpen: false, message: '', type: 'success' });
  const [showAssignRoleDialog, setShowAssignRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const groupCheckboxRefs = useRef({});

  // ─── Data fetching ────────────────────────────────────────────

  useEffect(() => {
    if (activeTab === 'roles') {
      fetchRoles();
    } else {
      fetchTeamMembers();
    }
  }, [activeTab]);

  useEffect(() => {
    if (roles.length > 0) {
      const initial = {};
      roles.forEach(role => {
        initial[role.id] = new Set((role.permissions || []).map(p => p.id));
      });
      setRolePermissions(initial);
      fetchAllPermissions();
    }
  }, [roles]);

  useEffect(() => {
    const grouped = groupPermissions(allPermissions);
    roles.forEach(role => {
      const checkedSet = rolePermissions[role.id] || new Set();
      Object.entries(grouped).forEach(([groupName, perms]) => {
        const el = groupCheckboxRefs.current[`${role.id}-${groupName}`];
        if (el) {
          const allChecked = perms.every(p => checkedSet.has(p.id));
          const someChecked = perms.some(p => checkedSet.has(p.id));
          
          el.checked = allChecked;
          el.indeterminate = !allChecked && someChecked;
        }
      });
    });
  }, [rolePermissions, allPermissions, roles]);

  const fetchTeamMembers = async (page = 1, size = 15) => {
    try {
      setMembersLoading(true);
      const response = await apiRequest(
        `${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/users/specification?pageStart=${page}&pageSize=${size}&isEmployee=true`,
        { method: 'GET' }
      );
      const result = await response.json();
      if (response.ok) {
        const users = result.data?.content || result.content || result.data || result;
        setTeamMembers(Array.isArray(users) ? users : []);
        
        // Update pagination info
        const pageData = result.data || result;
        setMembersPagination({
          currentPage: page,
          pageSize: pageData.size || size,
          totalPages: pageData.totalPages || 1,
          totalElements: pageData.totalElements || 0
        });
        
        setError('');
      } else {
        const errorData = result.data || result;
        setError(errorData.message || 'Failed to fetch team members');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setMembersLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await apiRequest(
        `${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/admin/roles`,
        { method: 'GET' }
      );
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
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const response = await apiRequest(
        `${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/admin/permissions`,
        { method: 'GET' }
      );
      const result = await response.json();
      if (response.ok) {
        const data = result.data || result;
        setAllPermissions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
    }
  };

  // ─── Handlers ─────────────────────────────────────────────────

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
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
        { method: 'PUT', body: JSON.stringify({ roles }) }
      );
      if (response.ok) {
        setShowAssignRoleDialog(false);
        setSnackbar({ isOpen: true, message: 'Roles updated successfully!', type: 'success' });
        fetchTeamMembers(membersPagination.currentPage, membersPagination.pageSize);
      } else {
        const result = await response.json();
        const errorData = result.data || result;
        setSnackbar({ isOpen: true, message: errorData.message || 'Failed to update roles', type: 'error' });
      }
    } catch (err) {
      setSnackbar({ isOpen: true, message: 'Network error. Failed to update roles.', type: 'error' });
    }
  };

  const handleMembersPageChange = (newPage) => {
    fetchTeamMembers(newPage, membersPagination.pageSize);
  };

  const handleMembersPageSizeChange = (newSize) => {
    fetchTeamMembers(1, newSize);
  };

  const cancelAssignRole = () => {
    setShowAssignRoleDialog(false);
    setSelectedUser(null);
  };

  const togglePermission = (roleId, permissionId) => {
    setRolePermissions(prev => {
      const current = new Set(prev[roleId] || []);
      if (current.has(permissionId)) current.delete(permissionId);
      else current.add(permissionId);
      return { ...prev, [roleId]: current };
    });
  };

  const togglePermissionGroup = (roleId, perms, allChecked) => {
    setRolePermissions(prev => {
      const current = new Set(prev[roleId] || []);
      if (allChecked) perms.forEach(p => current.delete(p.id));
      else perms.forEach(p => current.add(p.id));
      return { ...prev, [roleId]: current };
    });
  };

  const handleSaveRolePermissions = async (role) => {
    setSavingRole(role.id);
    try {
      const permissionIds = Array.from(rolePermissions[role.id] || []);
      const response = await apiRequest(
        `${process.env.REACT_APP_BASE_URL || 'http://localhost:8080'}/api/admin/roles/${role.id}/permissions`,
        { method: 'PUT', body: JSON.stringify({ permissionIds }) }
      );
      if (response.ok) {
        setSnackbar({
          isOpen: true,
          message: `Permissions for ${role.name.replace('ROLE_', '')} updated!`,
          type: 'success',
        });
        fetchRoles();
      } else {
        const result = await response.json();
        setSnackbar({ isOpen: true, message: result.message || 'Failed to update permissions', type: 'error' });
      }
    } catch (err) {
      setSnackbar({ isOpen: true, message: 'Network error. Failed to update permissions.', type: 'error' });
    } finally {
      setSavingRole(null);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────

  const groupPermissions = (permissions) =>
    permissions.reduce((groups, perm) => {
      const group = perm.name.includes('_') ? perm.name.split('_')[0] : 'OTHER';
      if (!groups[group]) groups[group] = [];
      groups[group].push(perm);
      return groups;
    }, {});

  const formatPermissionLabel = (name) =>
    name.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());

  const getRoleDisplayName = (role) =>
    typeof role === 'string' ? role.replace('ROLE_', '') : role.name?.replace('ROLE_', '');

  // Avatar color per initial — keeps colors consistent
  const avatarGradients = [
    'linear-gradient(135deg,#3b82f6,#6366f1)',
    'linear-gradient(135deg,#10b981,#3b82f6)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#8b5cf6,#ec4899)',
    'linear-gradient(135deg,#06b6d4,#3b82f6)',
  ];

  const getAvatarGradient = (name = '') => {
    const code = (name.charCodeAt(0) || 0) % avatarGradients.length;
    return avatarGradients[code];
  };

  // ─── Render: Team Members ──────────────────────────────────────

  const renderTeamMembers = () => {
    if (membersLoading) {
      return (
        <div className="team-members-content">
          <div className="content-header">
            <div>
              <div className="shimmer shimmer-title"></div>
              <div className="shimmer shimmer-subtitle"></div>
            </div>
            <div className="shimmer shimmer-badge"></div>
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
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td>
                      <div className="member-info">
                        <div className="shimmer shimmer-avatar"></div>
                        <div>
                          <div className="shimmer shimmer-member-name"></div>
                          <div className="shimmer shimmer-member-username"></div>
                        </div>
                      </div>
                    </td>
                    <td><div className="shimmer shimmer-text"></div></td>
                    <td><div className="shimmer shimmer-text"></div></td>
                    <td><div className="shimmer shimmer-role-badge"></div></td>
                    <td><div className="shimmer shimmer-date"></div></td>
                    <td>
                      <div className="action-buttons">
                        <div className="shimmer shimmer-action-btn"></div>
                        <div className="shimmer shimmer-action-btn"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="team-members-content">
        <div className="content-header">
          <div>
            <h2>Team Members</h2>
            <p>Manage members and their access levels</p>
          </div>
          {teamMembers.length > 0 && (
            <span className="member-count-badge">
              <Icon name="users" size={13} />
              {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}
            </span>
          )}
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
                  <td colSpan="6" className="empty-row">No team members found</td>
                </tr>
              ) : (
                teamMembers.map(member => (
                  <tr key={member.id}>
                    <td>
                      <div className="member-info">
                        <div
                          className="member-avatar"
                          style={{ background: getAvatarGradient(member.fullName) }}
                        >
                          {member.fullName ? member.fullName.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <div className="member-name">{member.fullName || '—'}</div>
                          <div className="member-username">@{member.userName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="cell-email">{member.email || '—'}</td>
                    <td className="cell-phone">{member.phone || '—'}</td>
                    <td>
                      <div className="roles-cell">
                        {member.roles && member.roles.length > 0 ? (
                          member.roles.map((role, i) => (
                            <span key={i} className="role-badge">
                              {getRoleDisplayName(role)}
                            </span>
                          ))
                        ) : (
                          <span className="role-badge">User</span>
                        )}
                      </div>
                    </td>
                    <td className="cell-date">{formatDate(member.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-assign-role"
                          title="Assign Roles"
                          onClick={() => handleAssignRole(member)}
                        >
                          <Icon name="shield" size={15} />
                        </button>
                        <button className="btn-icon btn-edit" title="Edit member">
                          <Icon name="edit" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {teamMembers.length > 0 && (
            <Pagination
              currentPage={membersPagination.currentPage}
              totalPages={membersPagination.totalPages}
              pageSize={membersPagination.pageSize}
              totalElements={membersPagination.totalElements}
              onPageChange={handleMembersPageChange}
              onPageSizeChange={handleMembersPageSizeChange}
            />
          )}
        </div>
      </div>
    );
  };

  // ─── Render: Roles & Permissions ──────────────────────────────

  const renderRolesAndPermissions = () => {
    if (rolesLoading) {
      return (
        <div className="roles-content">
          <div className="content-header">
            <div>
              <div className="shimmer shimmer-title"></div>
              <div className="shimmer shimmer-subtitle"></div>
            </div>
          </div>

          <div className="roles-permissions-layout">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="role-permission-card">
                <div className="role-permission-card-header">
                  <div className="shimmer shimmer-role-icon"></div>
                  <div className="role-meta">
                    <div className="shimmer shimmer-role-name"></div>
                    <div className="shimmer shimmer-role-description"></div>
                  </div>
                  <div className="shimmer shimmer-permission-count"></div>
                </div>

                <div className="permission-groups">
                  {[...Array(3)].map((_, groupIndex) => (
                    <div key={groupIndex} className="permission-group">
                      <div className="permission-group-header">
                        <div className="permission-group-label">
                          <div className="shimmer shimmer-checkbox"></div>
                          <div className="shimmer shimmer-group-name"></div>
                          <div className="shimmer shimmer-group-count"></div>
                        </div>
                      </div>
                      <div className="permission-checkboxes">
                        {[...Array(4)].map((_, permIndex) => (
                          <div key={permIndex} className="permission-checkbox-item">
                            <div className="shimmer shimmer-checkbox"></div>
                            <div className="shimmer shimmer-permission-name"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="role-permission-card-footer">
                  <div className="shimmer shimmer-save-button"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const grouped = groupPermissions(allPermissions);

    return (
      <div className="roles-content">
        <div className="content-header">
          <div>
            <h2>Roles & Permissions</h2>
            <p>Toggle permissions per role, then save to apply changes.</p>
          </div>
        </div>

        <div className="roles-permissions-layout">
          {roles.length === 0 ? (
            <div className="empty-state">No roles found</div>
          ) : (
            roles.map(role => {
              const checkedSet = rolePermissions[role.id] || new Set();
              const checkedCount = checkedSet.size;

              return (
                <div key={role.id} className="role-permission-card">

                  {/* Card Header */}
                  <div className="role-permission-card-header">
                    <div className="role-icon">
                      <Icon name="shield" size={18} />
                    </div>
                    <div className="role-meta">
                      <h3>{role.name.replace('ROLE_', '')}</h3>
                      <p>{role.description || 'No description'}</p>
                    </div>
                    <span className="role-permission-count">
                      {checkedCount}/{allPermissions.length}
                    </span>
                  </div>

                  {/* Permission Groups */}
                  <div className="permission-groups">
                    {allPermissions.length === 0 ? (
                      <div className="empty-permissions">No permissions available</div>
                    ) : (
                      Object.entries(grouped).map(([groupName, perms]) => {
                        const allChecked = perms.every(p => checkedSet.has(p.id));
                        const refKey = `${role.id}-${groupName}`;

                        return (
                          <div key={groupName} className="permission-group">
                            <div className="permission-group-header">
                              <label className="permission-group-label">
                                <input
                                  type="checkbox"
                                  checked={allChecked}
                                  ref={el => { groupCheckboxRefs.current[refKey] = el; }}
                                  onChange={() => togglePermissionGroup(role.id, perms, allChecked)}
                                />
                                <span className="group-name">{groupName}</span>
                                <span className="group-count">
                                  {perms.filter(p => checkedSet.has(p.id)).length}/{perms.length}
                                </span>
                              </label>
                            </div>

                            <div className="permission-checkboxes">
                              {perms.map(perm => (
                                <label key={perm.id} className="permission-checkbox-item">
                                  <input
                                    type="checkbox"
                                    checked={checkedSet.has(perm.id)}
                                    onChange={() => togglePermission(role.id, perm.id)}
                                  />
                                  <span className="perm-name">
                                    {formatPermissionLabel(perm.name)}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Save Footer */}
                  <div className="role-permission-card-footer">
                    <button
                      className="btn-save-permissions"
                      onClick={() => handleSaveRolePermissions(role)}
                      disabled={savingRole === role.id}
                    >
                      {savingRole === role.id ? (
                        'Saving…'
                      ) : (
                        <>
                          <Icon name="save" size={14} />
                          Save permissions
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // ─── Main Render ──────────────────────────────────────────────

  return (
    <div className="team-page">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Team Management</h1>
          <p>Manage members, roles, and access permissions</p>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <Icon name="userCheck" size={15} />
            Team Members
          </button>
          <button
            className={`tab ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            <Icon name="shield" size={15} />
            Roles & Permissions
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

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