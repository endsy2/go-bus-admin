import * as React from "react";
import * as ReactDOM from "react-dom";
import { cn } from "lib/utils";

const PopoverContext = React.createContext({});

export function Popover({ children }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef(null);
  
  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block w-full" ref={triggerRef}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ children, asChild }) {
  const { open, setOpen } = React.useContext(PopoverContext);
  
  const handleClick = (e) => {
    e.stopPropagation();
    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        handleClick(e);
        // Call original onClick if it exists
        if (children.props.onClick) {
          children.props.onClick(e);
        }
      },
    });
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

export function PopoverContent({ children, className, align = "start" }) {
  const { open, setOpen, triggerRef } = React.useContext(PopoverContext);
  const contentRef = React.useRef(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      let left = rect.left + scrollLeft;
      
      if (align === 'center') {
        left = rect.left + scrollLeft + rect.width / 2;
      } else if (align === 'end') {
        left = rect.right + scrollLeft;
      }
      
      setPosition({
        top: rect.bottom + scrollTop + 8,
        left: left
      });
    }
  }, [open, align, triggerRef]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking inside the content or trigger
      if (contentRef.current && !contentRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      // Small delay to prevent immediate closure
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [open, setOpen, triggerRef]);

  if (!open) return null;

  const alignmentClasses = {
    start: "",
    center: "-translate-x-1/2",
    end: "-translate-x-full",
  };

  return ReactDOM.createPortal(
    <div
      ref={contentRef}
      className={cn(
        "fixed z-[99999] rounded-2xl border shadow-2xl pointer-events-auto",
        alignmentClasses[align],
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
}
