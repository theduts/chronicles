import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackIcon?: React.ReactNode;
  fallbackText?: string;
  iconClassName?: string;
}

export default function ImageWithFallback({
  src,
  alt = '',
  className = '',
  fallbackIcon,
  fallbackText,
  iconClassName = 'w-8 h-8',
  onError,
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    const containerClasses = className
      .replace(/\bobject-(cover|contain|fill|none|scale-down)\b/g, '')
      .trim();

    return (
      <div
        className={`flex flex-col items-center justify-center bg-surface-container-highest/50 border border-outline-variant/30 text-on-surface-variant/40 select-none p-3 transition-colors ${containerClasses || 'w-full h-full min-h-[60px]'}`}
        title={alt || 'Imagem indisponível'}
      >
        {fallbackIcon || <ImageIcon className={`${iconClassName} opacity-50 stroke-[1.5] text-on-surface-variant`} />}
        {fallbackText && (
          <span className="text-micro font-sans font-medium mt-1.5 text-center truncate max-w-full opacity-60 text-on-surface-variant">
            {fallbackText}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        setHasError(true);
        if (onError) onError(e);
      }}
      {...props}
    />
  );
}
