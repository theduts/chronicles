import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: React.ReactNode;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
}

export interface CustomSelectProps {
  value?: string | number;
  onChange?: (e: any) => void;
  options?: Array<SelectOption | string | number>;
  placeholder?: string;
  disabled?: boolean;
  className?: string; // Container wrapper styles
  buttonClassName?: string; // Custom button trigger styles
  dropdownClassName?: string; // Custom dropdown menu styles
  optionClassName?: string; // Custom option item styles
  id?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'sheet' | 'ghost' | 'parchment' | 'minimal';
  align?: 'left' | 'right';
  children?: React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  disabled = false,
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  optionClassName = '',
  id,
  name,
  size = 'md',
  variant = 'default',
  align = 'left',
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract options either from options prop or from React children (<option>)
  const parsedOptions: SelectOption[] = useMemo(() => {
    if (options && options.length > 0) {
      return options.map((opt) => {
        if (typeof opt === 'object' && opt !== null) {
          return {
            value: String(opt.value),
            label: opt.label,
            disabled: opt.disabled,
            description: opt.description,
            icon: opt.icon,
          };
        }
        return { value: String(opt), label: String(opt) };
      });
    }

    if (children) {
      const opts: SelectOption[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          const props = child.props as any;
          const val = props.value !== undefined ? String(props.value) : String(props.children ?? '');
          const labelText = props.children !== undefined ? props.children : val;
          opts.push({
            value: val,
            label: labelText,
            disabled: props.disabled,
          });
        }
      });
      return opts;
    }

    return [];
  }, [options, children]);

  const stringValue = value !== undefined && value !== null ? String(value) : '';

  // Find selected option
  const selectedOption = useMemo(() => {
    return parsedOptions.find((opt) => String(opt.value) === stringValue);
  }, [parsedOptions, stringValue]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      const currentIndex = parsedOptions.findIndex((opt) => String(opt.value) === stringValue);
      const nextIndex = (currentIndex + 1) % parsedOptions.length;
      if (parsedOptions[nextIndex] && !parsedOptions[nextIndex].disabled) {
        handleSelect(parsedOptions[nextIndex].value);
      }
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault();
      const currentIndex = parsedOptions.findIndex((opt) => String(opt.value) === stringValue);
      const prevIndex = (currentIndex - 1 + parsedOptions.length) % parsedOptions.length;
      if (parsedOptions[prevIndex] && !parsedOptions[prevIndex].disabled) {
        handleSelect(parsedOptions[prevIndex].value);
      }
    }
  };

  const handleSelect = (optionValue: string | number) => {
    if (disabled) return;
    const valStr = String(optionValue);
    setIsOpen(false);

    if (onChange) {
      // Create synthetic event object so standard e.target.value callbacks work seamlessly
      const syntheticEvent = {
        target: { value: valStr, name: name || id },
        currentTarget: { value: valStr, name: name || id },
        preventDefault: () => {},
        stopPropagation: () => {},
      };
      onChange(syntheticEvent);
    }
  };

  // Base size styles
  const sizeStyles = {
    sm: 'py-1 px-2.5 text-xs min-h-[30px]',
    md: 'py-1.5 px-3 text-xs md:text-sm min-h-[36px]',
    lg: 'py-2 px-4 text-sm md:text-base min-h-[44px]',
  }[size];

  // Variant styles
  const variantStyles = {
    default:
      'bg-surface-container-high/90 border border-outline-variant/40 text-on-surface hover:border-primary/60 focus:border-primary focus:ring-1 focus:ring-primary/40 rounded-sm shadow-sm',
    sheet:
      'bg-transparent border-b border-outline-variant/60 hover:border-primary text-on-surface focus:border-primary rounded-none px-1 py-0.5',
    ghost:
      'bg-transparent border-none text-on-surface hover:text-primary focus:text-primary px-1 py-0.5',
    parchment:
      'bg-surface-container parchment-texture border border-outline-variant text-on-surface hover:border-amber-500/60 focus:border-amber-500 rounded-sm shadow-md',
    minimal:
      'bg-surface-container border border-outline-variant/30 text-on-surface hover:border-outline-variant/80 rounded-md',
  }[variant];

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left w-full ${className}`}
      id={id}
    >
      {/* Hidden native input for form submissions */}
      <input type="hidden" name={name} value={stringValue} />

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`w-full flex items-center justify-between gap-2 font-sans transition-all duration-200 outline-none select-none cursor-pointer ${sizeStyles} ${variantStyles} ${
          disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
        } ${buttonClassName}`}
      >
        <span className="truncate flex items-center gap-2 text-left flex-1 font-medium">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <span className="shrink-0">{selectedOption.icon}</span>
              )}
              <span className="truncate">{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-on-surface-variant/50 italic">{placeholder}</span>
          )}
        </span>

        {/* Chevron Icon with Rotation Animation */}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="shrink-0 text-outline-variant/80 hover:text-primary transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.span>
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute z-[9999] mt-1.5 w-full min-w-[140px] max-h-60 overflow-y-auto custom-scrollbar rounded-md bg-surface-container-highest border border-outline-variant shadow-2xl py-1 backdrop-blur-md ${
              align === 'right' ? 'right-0' : 'left-0'
            } ${dropdownClassName}`}
            role="listbox"
          >
            {parsedOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-outline-variant/50 italic text-center">
                Nenhuma opção
              </div>
            ) : (
              parsedOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === stringValue;
                const isDisabledOpt = opt.disabled;

                return (
                  <div
                    key={`${opt.value}-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => !isDisabledOpt && handleSelect(opt.value)}
                    className={`group px-3 py-2 text-xs font-sans flex items-center justify-between cursor-pointer transition-colors duration-150 rounded-sm mx-1 ${
                      isSelected
                        ? 'bg-primary/20 text-primary font-bold border-l-2 border-primary pl-2.5'
                        : 'text-on-surface hover:bg-surface-container-highest/80 hover:text-on-surface'
                    } ${
                      isDisabledOpt
                        ? 'opacity-40 cursor-not-allowed pointer-events-none'
                        : ''
                    } ${optionClassName}`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-2 truncate">
                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {opt.description && (
                        <span
                          className={`text-micro font-sans mt-0.5 truncate font-medium ${
                            isSelected
                              ? 'text-primary font-semibold'
                              : 'text-on-surface-variant group-hover:text-on-surface'
                          }`}
                        >
                          {opt.description}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />
                    )}
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
