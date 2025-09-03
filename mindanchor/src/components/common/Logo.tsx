import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-12 w-auto',
    medium: 'h-16 w-auto',
    large: 'h-24 w-auto'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src="/logo.jpeg" 
        alt="MindAnchor Logo" 
        className={sizeClasses[size]}
      />
    </div>
  );
};

export default Logo;