import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Standard page header (title + subtitle + actions) used by every main view.
 * Single source of truth for page-level typography: serif title, sans subtitle.
 * Mobile-first: stacks on small screens, row layout from `sm`.
 */
export default function PageHeader({ title, subtitle, actions, className = '' }: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant pb-6 shrink-0 relative z-10 ${className}`}
    >
      <div className="min-w-0">
        <h1 className="font-serif text-3xl md:text-4xl text-on-surface font-medium">{title}</h1>
        {subtitle && (
          <p className="font-sans text-xs text-on-surface-variant mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
