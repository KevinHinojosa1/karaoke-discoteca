import React from 'react';

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'lavender' | 'pink' | 'mint' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const LiquidButton: React.FC<LiquidButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3.5 py-2 text-xs font-semibold rounded-xl gap-1.5',
    md: 'px-5 py-3 text-sm font-semibold rounded-2xl gap-2',
    lg: 'px-6 py-4 text-base font-bold rounded-2xl gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-pastel-lavender/30 via-pastel-pink/25 to-pastel-sky/30 text-white border border-white/25 hover:border-white/40 shadow-liquid hover:shadow-glow-lavender',
    secondary:
      'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-white/20 shadow-liquid-sm',
    lavender:
      'bg-pastel-lavender/25 hover:bg-pastel-lavender/35 text-pastel-lavender border border-pastel-lavender/40 shadow-glow-lavender',
    pink:
      'bg-pastel-pink/25 hover:bg-pastel-pink/35 text-pastel-pink border border-pastel-pink/40 shadow-glow-pink',
    mint:
      'bg-pastel-mint/25 hover:bg-pastel-mint/35 text-pastel-mint border border-pastel-mint/40 shadow-glow-mint',
    danger:
      'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/30 shadow-liquid-sm',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-300 border border-transparent hover:border-white/10',
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center font-medium transition-all duration-200 tap-squish liquid-specular select-none disabled:opacity-50 disabled:pointer-events-none ${
        fullWidth ? 'w-full' : ''
      } ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
