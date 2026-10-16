import { useEffect, useState } from 'react';

const readIsDark = () =>
  typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : true;

export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(readIsDark);

  useEffect(() => {
    const observer = new MutationObserver(() => setIsDark(readIsDark()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export const getChronicleFallbackImage = (isDark: boolean) =>
  isDark ? '/images/last_session - escuro.webp' : '/images/last_session - claro.webp';
