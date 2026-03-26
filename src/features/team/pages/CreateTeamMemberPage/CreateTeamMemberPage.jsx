import React from 'react';
import CreateCustomerPage from '../../../customers/pages/CreateCustomerPage/CreateCustomerPage';

const CreateTeamMemberPage = ({ onCancel, onSuccess }) => {
  return (
    <CreateCustomerPage 
      onCancel={onCancel} 
      onSuccess={onSuccess} 
      isEmployee={true} 
    />
  );
};

export default CreateTeamMemberPage;
