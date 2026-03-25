import React from 'react';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';

const NavItem = ({ icon, label, active, onClick }) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-4 px-6 py-4 text-base font-medium text-white hover:bg-white/10 transition-all",
        active && "bg-white/20 border-l-4 border-white"
      )}
      onClick={onClick}
    >
      <span className="flex items-center text-white">{icon}</span>
      <span className="text-white">{label}</span>
    </Button>
  );
};

export default NavItem;
