import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { clearAuth } from '@/api/axios';
import { LogOut } from 'lucide-react';

export default function Sidebar({ items, active, onChange }) {
  const logout = () => {
    clearAuth();
    window.location.href = '/';
  };

  return (
    <aside className="w-full md:w-52 shrink-0 border-b md:border-b-0 md:border-r border-zinc-200 bg-white md:min-h-[calc(100vh-3.5rem)]">
      <nav className="p-3 flex md:flex-col gap-1 overflow-x-auto">
        {items.map((item) => (
          <Button
            key={item.id}
            variant={active === item.id ? 'default' : 'ghost'}
            size="sm"
            className={cn('justify-start whitespace-nowrap', active === item.id && 'bg-black text-white')}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </nav>
      <Separator className="hidden md:block" />
      <div className="p-3 hidden md:block">
        <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={logout}>
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
