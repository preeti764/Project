import * as React from 'react';
import { cn } from '@/lib/utils';

const Toggle = React.forwardRef(({ pressed, onPressedChange, className, children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-pressed={pressed}
    onClick={() => onPressedChange?.(!pressed)}
    className={cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-8 px-3',
      pressed ? 'bg-black text-white' : 'border border-zinc-300 bg-white text-black hover:bg-zinc-100',
      className
    )}
    {...props}
  >
    {children}
  </button>
));
Toggle.displayName = 'Toggle';

export { Toggle };
