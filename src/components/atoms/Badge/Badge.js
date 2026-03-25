import React from 'react';
import { Badge as ShadcnBadge } from '../../ui/badge';

const Badge = ({ children, variant = 'confirmed' }) => {
  const variantMap = {
    confirmed: 'default',
    pending: 'secondary',
    cancelled: 'destructive'
  };

  return (
    <ShadcnBadge variant={variantMap[variant.toLowerCase()] || 'default'}>
      {children}
    </ShadcnBadge>
  );
};

export default Badge;
