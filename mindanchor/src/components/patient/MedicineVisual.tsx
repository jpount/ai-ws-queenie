import React from 'react';

export type PillShape = 'round' | 'oval' | 'capsule' | 'tablet';
export type PillColor = 'white' | 'blue' | 'red' | 'yellow' | 'green' | 'orange' | 'pink' | 'purple';

interface MedicineVisualProps {
  shape?: PillShape;
  color?: PillColor;
  size?: 'small' | 'medium' | 'large';
  quantity?: number;
  label?: string;
}

const MedicineVisual: React.FC<MedicineVisualProps> = ({ 
  shape = 'round', 
  color = 'white',
  size = 'medium',
  quantity = 1,
  label
}) => {
  const getColorClasses = (pillColor: PillColor): string => {
    const colors = {
      white: 'bg-white border-gray-300',
      blue: 'bg-blue-400 border-blue-500',
      red: 'bg-red-400 border-red-500',
      yellow: 'bg-yellow-300 border-yellow-400',
      green: 'bg-green-400 border-green-500',
      orange: 'bg-orange-400 border-orange-500',
      pink: 'bg-pink-300 border-pink-400',
      purple: 'bg-purple-400 border-purple-500'
    };
    return colors[pillColor];
  };

  const getSizeClasses = (pillSize: string): { container: string; pill: string } => {
    const sizes = {
      small: { container: 'w-16 h-16', pill: 'w-8 h-8' },
      medium: { container: 'w-24 h-24', pill: 'w-12 h-12' },
      large: { container: 'w-32 h-32', pill: 'w-16 h-16' }
    };
    return sizes[pillSize as keyof typeof sizes];
  };

  const renderPill = (index: number) => {
    const colorClass = getColorClasses(color);
    const { pill: pillSize } = getSizeClasses(size);
    
    const baseClasses = `${colorClass} border-2 shadow-md relative overflow-hidden`;
    
    switch (shape) {
      case 'round':
        return (
          <div
            key={index}
            className={`${baseClasses} ${pillSize} rounded-full`}
            style={{ 
              transform: `translate(${index * 5}px, ${index * 5}px)`,
              zIndex: quantity - index
            }}
          >
            <div className="absolute inset-0 bg-white opacity-30 rounded-full transform -translate-x-1/4 -translate-y-1/4 w-1/2 h-1/2" />
          </div>
        );
        
      case 'oval':
        return (
          <div
            key={index}
            className={`${baseClasses} ${pillSize} rounded-full scale-x-150`}
            style={{ 
              transform: `scaleX(1.5) translate(${index * 3}px, ${index * 5}px)`,
              zIndex: quantity - index
            }}
          >
            <div className="absolute inset-0 bg-white opacity-30 rounded-full transform -translate-x-1/4 -translate-y-1/4 w-1/2 h-1/2" />
          </div>
        );
        
      case 'capsule':
        return (
          <div
            key={index}
            className={`${baseClasses} ${pillSize} rounded-full flex`}
            style={{ 
              transform: `translate(${index * 5}px, ${index * 5}px) rotate(45deg)`,
              zIndex: quantity - index
            }}
          >
            <div className={`w-1/2 h-full ${getColorClasses(color)} rounded-l-full`}>
              <div className="absolute inset-0 bg-white opacity-20 rounded-l-full w-1/3" />
            </div>
            <div className="w-1/2 h-full bg-white rounded-r-full border-l-0">
              <div className="absolute right-0 top-0 bg-gray-100 opacity-50 rounded-r-full w-1/3 h-full" />
            </div>
          </div>
        );
        
      case 'tablet':
        return (
          <div
            key={index}
            className={`${baseClasses} ${pillSize} rounded-lg`}
            style={{ 
              transform: `translate(${index * 5}px, ${index * 5}px)`,
              zIndex: quantity - index
            }}
          >
            <div className="absolute inset-0 bg-white opacity-30 rounded-lg transform -translate-x-1/4 -translate-y-1/4 w-1/2 h-1/2" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400 opacity-30" />
          </div>
        );
        
      default:
        return null;
    }
  };

  const { container: containerSize } = getSizeClasses(size);

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${containerSize} flex items-center justify-center`}>
        {Array.from({ length: Math.min(quantity, 3) }, (_, i) => renderPill(i))}
      </div>
      {label && (
        <p className="mt-2 text-sm font-medium text-gray-700 text-center">
          {label}
          {quantity > 1 && ` (${quantity})`}
        </p>
      )}
    </div>
  );
};

export default MedicineVisual;