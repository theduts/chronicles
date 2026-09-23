import React, { ButtonHTMLAttributes } from 'react';
import { LucideIcon, Save, Plus, Edit, Trash2 } from 'lucide-react';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon | React.ReactNode;
  label?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'danger-ghost' | 'primary-ghost' | 'outline' | 'blue';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  hideLabelOnMobile?: boolean;
}

export function ActionButton({
  icon: Icon,
  label,
  variant = 'primary',
  size = 'md',
  hideLabelOnMobile = true,
  className = '',
  children,
  ...props
}: ActionButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-sans font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container border border-transparent",
    secondary: "bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container border border-transparent",
    blue: "bg-[#93c5fd] hover:bg-[#bfdbfe] text-[#0a2540] border border-transparent",
    danger: "bg-error hover:bg-error/80 text-on-error border border-error/50",
    ghost: "bg-transparent text-outline-variant hover:text-on-surface hover:bg-surface-container-highest/50 border border-transparent",
    'danger-ghost': "bg-transparent text-error hover:text-error hover:bg-error-container/50 border border-transparent",
    'primary-ghost': "bg-transparent text-primary hover:bg-primary hover:text-on-primary border border-transparent",
    outline: "bg-transparent text-primary border border-primary/30 hover:bg-primary-container/20",
  };
  
  const displayLabel = label || (typeof children === 'string' ? children : undefined);

  const sizeClasses = {
    sm: hideLabelOnMobile && displayLabel ? "w-8 h-8 sm:w-auto sm:h-auto p-0 sm:px-3 sm:py-1.5 text-[10px]" : "px-3 py-1.5 text-[10px]",
    md: hideLabelOnMobile && displayLabel ? "w-10 h-10 sm:w-auto sm:h-auto p-0 sm:px-5 sm:py-2.5 text-[11px]" : "px-5 py-2.5 text-[11px]",
    lg: hideLabelOnMobile && displayLabel ? "w-12 h-12 sm:w-auto sm:h-auto p-0 sm:px-6 sm:py-3 text-xs" : "px-6 py-3 text-xs",
    icon: "w-8 h-8 p-1.5 text-sm", // For icon-only buttons
  };

  const labelClasses = hideLabelOnMobile ? "hidden sm:inline-block" : "inline-block";

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    const IconComponent = Icon as LucideIcon;
    return <IconComponent className={size === 'sm' || size === 'icon' ? "w-3.5 h-3.5 shrink-0" : "w-4 h-4 shrink-0"} />;
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${displayLabel && size !== 'icon' ? (hideLabelOnMobile ? 'sm:gap-1.5' : 'gap-1.5') : ''} ${className}`}
      title={typeof displayLabel === 'string' ? displayLabel : undefined}
      {...props}
    >
      {renderIcon()}
      {displayLabel && size !== 'icon' && (
        <span className={labelClasses}>
          {displayLabel}
        </span>
      )}
      {typeof children !== 'string' ? children : null}
    </button>
  );
}

// Pre-configured specialized buttons

export function SaveButton({ label = "Salvar", icon = Save, ...props }: ActionButtonProps) {
  return <ActionButton icon={icon} variant="primary" label={label} {...props} />;
}

export function AddButton({ label = "Adicionar", icon = Plus, ...props }: ActionButtonProps) {
  return <ActionButton icon={icon} variant="primary" label={label} {...props} />;
}

export function EditButton({ label = "Editar", icon = Edit, variant = "ghost", ...props }: ActionButtonProps) {
  return <ActionButton icon={icon} variant={variant} label={label} {...props} />;
}

export function DeleteButton({ label = "Excluir", icon = Trash2, variant = "danger-ghost", ...props }: ActionButtonProps) {
  return <ActionButton icon={icon} variant={variant} label={label} {...props} />;
}
