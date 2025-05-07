import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  className = '',
  label,
  error,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-amber-400">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-2 bg-gray-800/80 backdrop-blur-sm
          border-2 border-amber-500/20 text-gray-100 rounded-md 
          focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/30
          transition-colors placeholder:text-gray-500 disabled:opacity-50
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;