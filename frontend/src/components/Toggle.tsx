import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  iconOn?: React.ReactNode;
  iconOff?: React.ReactNode;
  className?: string;
  title?: string;
  activeBgClass?: string;
  activeCircleTextClass?: string;
}

export default function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  size = 'md',
  iconOn,
  iconOff,
  className = '',
  title,
  activeBgClass,
  activeCircleTextClass
}: ToggleProps) {
  const sizes = {
    sm: {
      w: 'w-8', h: 'h-4',
      circle: 'w-2.5 h-2.5',
      translate: 'translate-x-4',
      iconBase: 'w-2 h-2'
    },
    md: {
      w: 'w-10', h: 'h-5',
      circle: 'w-3.5 h-3.5',
      translate: 'translate-x-5',
      iconBase: 'w-2.5 h-2.5'
    },
    lg: {
      w: 'w-14', h: 'h-7',
      circle: 'w-5 h-5',
      translate: 'translate-x-[26px]',
      iconBase: 'w-3.5 h-3.5'
    },
  };

  const currSize = sizes[size];

  return (
    <div 
      className={`flex items-center gap-3 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`} 
      title={title}
      onClick={(e) => {
        if (!disabled) {
          e.stopPropagation();
          onChange(!checked);
        }
      }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange(!checked);
        }}
        className={`
          relative flex items-center shrink-0 rounded-full p-[3px] transition-colors duration-300
          ${currSize.w} ${currSize.h}
          ${checked ? (activeBgClass || 'bg-primary') : 'bg-surface-container-highest border border-outline-variant/50'}
        `}
      >
        <div
          className={`
            flex items-center justify-center rounded-full shadow-md transform duration-300 ease-in-out
            ${currSize.circle}
            ${checked ? `${currSize.translate} bg-black ${activeCircleTextClass || 'text-primary'}` : 'translate-x-0 bg-white text-black'}
          `}
        >
          {checked && iconOn ? (
            <span className={`flex items-center justify-center ${currSize.iconBase}`}>
              {iconOn}
            </span>
          ) : !checked && iconOff ? (
            <span className={`flex items-center justify-center ${currSize.iconBase}`}>
              {iconOff}
            </span>
          ) : null}
        </div>
      </button>
      {label && (
        <span className="text-caption font-sans font-bold uppercase tracking-wider text-on-surface-variant">
          {label}
        </span>
      )}
    </div>
  );
}
