import React from 'react';
import { DietaryType } from '../types';

interface DietaryBadgeProps {
  dietary?: DietaryType;
  isVeg?: boolean;
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DietaryBadge: React.FC<DietaryBadgeProps> = ({
  dietary,
  isVeg,
  showText = false,
  className = '',
  size = 'md'
}) => {
  // Fallback to isVeg if dietary not explicitly provided
  const diet: DietaryType = dietary || (isVeg === false ? 'non_veg' : 'veg');

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  };

  if (diet === 'veg') {
    return (
      <div 
        className={`inline-flex items-center gap-1.5 ${className}`}
        title="Pure Vegetarian (Green Dot)"
      >
        <div className={`${sizeClasses[size]} border-2 border-emerald-600 rounded-[3px] bg-white flex items-center justify-center p-[1px] shadow-2xs`}>
          <div className={`${dotSizeClasses[size]} rounded-full bg-emerald-600`} />
        </div>
        {showText && (
          <span className="text-[11px] font-bold text-emerald-800 tracking-tight">Veg</span>
        )}
      </div>
    );
  }

  if (diet === 'egg') {
    return (
      <div 
        className={`inline-flex items-center gap-1.5 ${className}`}
        title="Contains Egg (Eggetarian - Yellow/Amber)"
      >
        <div className={`${sizeClasses[size]} border-2 border-amber-500 rounded-[3px] bg-white flex items-center justify-center p-[1px] shadow-2xs`}>
          <div className={`${dotSizeClasses[size]} rounded-full bg-amber-500`} />
        </div>
        {showText && (
          <span className="text-[11px] font-bold text-amber-800 tracking-tight">Egg</span>
        )}
      </div>
    );
  }

  // non_veg
  return (
    <div 
      className={`inline-flex items-center gap-1.5 ${className}`}
      title="Non-Vegetarian (Red Dot)"
    >
      <div className={`${sizeClasses[size]} border-2 border-rose-600 rounded-[3px] bg-white flex items-center justify-center p-[1px] shadow-2xs`}>
        <div className={`${dotSizeClasses[size]} rounded-full bg-rose-600`} />
      </div>
      {showText && (
        <span className="text-[11px] font-bold text-rose-800 tracking-tight">Non-Veg</span>
      )}
    </div>
  );
};
