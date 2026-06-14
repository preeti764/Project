import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-black bg-black text-white',
        outline: 'border-zinc-300 bg-white text-black',
        secondary: 'border-zinc-200 bg-zinc-100 text-zinc-800',
      },
    },
    defaultVariants: { variant: 'outline' },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
