import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, ...props }) => {
  return (
    <div 
      className={`
        bg-gray-900/90 backdrop-blur-sm
        border border-amber-500/10 rounded-lg shadow-xl
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:border-amber-500/30 hover:shadow-amber-900/20' : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = function CardHeader({ children, className = '' }: Omit<CardProps, 'onClick'>) {
  return (
    <div className={`px-6 py-4 border-b border-amber-500/10 ${className}`}>
      {children}
    </div>
  );
};

Card.Content = function CardContent({ children, className = '' }: Omit<CardProps, 'onClick'>) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, className = '' }: Omit<CardProps, 'onClick'>) {
  return (
    <div className={`px-6 py-4 bg-gray-900/50 border-t border-amber-500/10 ${className}`}>
      {children}
    </div>
  );
};

export default Card;