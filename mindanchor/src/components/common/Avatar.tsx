import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
    xlarge: 'w-32 h-32'
  };

  const iconSizes = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  // Generate a color based on the name for consistent placeholder colors
  const getPlaceholderColor = (name: string) => {
    const colors = [
      'bg-pink-400',
      'bg-purple-400',
      'bg-indigo-400',
      'bg-blue-400',
      'bg-green-400',
      'bg-yellow-400',
      'bg-orange-400',
      'bg-red-400'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Default placeholder with initials
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${getPlaceholderColor(name)} text-white font-bold text-lg ${className}`}
    >
      {initials || <User className={iconSizes[size]} />}
    </div>
  );
};

export default Avatar;