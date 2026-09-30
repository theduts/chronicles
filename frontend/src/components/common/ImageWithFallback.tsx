import React, { useState, useEffect } from 'react';

export interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const FALLBACK_IMAGE_PATH = '/images/placeholders/fallback.svg';

export default function ImageWithFallback({
  src,
  alt = '',
  className = '',
  fallbackSrc = FALLBACK_IMAGE_PATH,
  onError,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasFallbackError, setHasFallbackError] = useState(false);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setHasFallbackError(false);
  }, [src, fallbackSrc]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (imgSrc !== fallbackSrc && !hasFallbackError) {
      setImgSrc(fallbackSrc);
    } else {
      setHasFallbackError(true);
    }
    if (onError) {
      onError(e);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
