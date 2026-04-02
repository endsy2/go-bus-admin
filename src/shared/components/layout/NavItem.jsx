import React from 'react';
import { cn } from 'lib/utils';

export const NavItem = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all duration-200 relative group",
        active 
          ? "bg-white/15 text-white shadow-lg" 
          : "text-white/70 hover:text-white hover:bg-white/5"
      )}
    >
      {/* Active indicator */}
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full shadow-lg shadow-white/30" />
      )}
      
      {/* Icon */}
      <span className={cn(
        "flex items-center justify-center w-5 h-5 transition-all duration-200",
        active ? "text-white scale-110" : "text-white/70 group-hover:text-white group-hover:scale-105"
      )}>
        {icon}
      </span>
      
      {/* Label */}
      <span className={cn(
        "flex-1 text-left transition-all duration-200",
        active ? "font-semibold" : "font-medium"
      )}>
        {label}
      </span>

      {/* Hover effect */}
      {!active && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
    </button>
  );
};

export default NavItem;
