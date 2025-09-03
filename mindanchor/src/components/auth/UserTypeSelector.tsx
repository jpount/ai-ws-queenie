import React from 'react';
import type { UserType } from '../../types';
import { Users, Heart, HandHeart } from 'lucide-react';

interface UserTypeSelectorProps {
  selected: UserType | null;
  onSelect: (type: UserType) => void;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ selected, onSelect }) => {
  const types = [
    {
      type: 'patient' as UserType,
      title: 'Patient',
      description: 'I need assistance and monitoring',
      icon: Heart,
      color: 'bg-mind-blue'
    },
    {
      type: 'caregiver' as UserType,
      title: 'Caregiver',
      description: 'I provide care and respond to alerts',
      icon: Users,
      color: 'bg-anchor-gold'
    },
    {
      type: 'volunteer' as UserType,
      title: 'Volunteer',
      description: 'I want to help my community',
      icon: HandHeart,
      color: 'bg-alert-cyan'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {types.map((item) => {
        const Icon = item.icon;
        const isSelected = selected === item.type;
        
        return (
          <button
            key={item.type}
            type="button"
            onClick={() => onSelect(item.type)}
            className={`
              relative p-6 rounded-xl border-2 transition-all
              ${isSelected 
                ? 'border-mind-blue bg-blue-50 shadow-lg scale-105' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }
            `}
          >
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
              ${item.color} ${isSelected ? 'opacity-100' : 'opacity-70'}
            `}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-lg font-heading font-semibold text-deep-navy mb-2">
              {item.title}
            </h3>
            
            <p className="text-sm text-neutral-gray">
              {item.description}
            </p>
            
            {isSelected && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-mind-blue rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default UserTypeSelector;