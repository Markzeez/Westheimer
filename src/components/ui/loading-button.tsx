'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: ReactNode;
  spinnerClassName?: string;
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <LoaderCircle
      aria-hidden="true"
      className={`animate-spin ${className}`.trim()}
    />
  );
}

export function LoadingButton({
  loading = false,
  loadingText,
  spinnerClassName,
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && <Spinner className={`${spinnerClassName ?? 'h-5 w-5'} shrink-0`} />}
      {loading && loadingText !== undefined ? loadingText : children}
    </button>
  );
}
