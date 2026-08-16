import React from 'react';

interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'standard' | 'subtle' | 'elevated' | 'lavender' | 'pink' | 'mint' | 'sky';
  specular?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  variant = 'standard',
  specular = true,
  className = '',
  children,
  ...props
}) => {
  const variantClass = {
    standard: 'liquid-glass',
    subtle: 'liquid-glass-subtle',
    elevated: 'liquid-glass-elevated',
    lavender: 'liquid-glass-lavender',
    pink: 'liquid-glass-pink',
    mint: 'liquid-glass-mint',
    sky: 'liquid-glass-sky',
  }[variant];

  return (
    <div
      className={`rounded-3xl transition-all duration-300 ${variantClass} ${
        specular ? 'liquid-specular' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
