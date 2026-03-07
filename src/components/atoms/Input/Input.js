import React from 'react';
import './Input.css';

const Input = ({ 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  error,
  prefix 
}) => {
  return (
    <div className="input-wrapper">
      <div className={`input-container ${prefix ? 'with-prefix' : ''}`}>
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`input ${error ? 'input-error' : ''} ${prefix ? 'has-prefix' : ''}`}
        />
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Input;
