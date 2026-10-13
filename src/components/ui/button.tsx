import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', variant = 'primary', size = 'md', loading = false, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20 hover:brightness-110 active:brightness-95',
      secondary:
        'bg-slate-800 text-slate-200 border border-slate-700/80 hover:bg-slate-750 hover:text-white',
      outline:
        'border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white',
      ghost:
        'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100',
      danger:
        'bg-red-950/40 text-red-400 border border-red-800/60 hover:bg-red-900/60 hover:text-red-300',
      accent:
        'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20',
    };

    const sizes = {
      sm: 'px-2.5 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-xs gap-2',
      lg: 'px-5 py-2.5 text-sm gap-2.5',
      icon: 'p-2 text-sm',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-1.5 text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
