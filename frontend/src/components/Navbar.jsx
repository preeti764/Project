import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getUser, clearAuth } from '@/api/axios';

export default function Navbar({ showAuth = true }) {
  const user = getUser();

  const logout = () => {
    clearAuth();
    window.location.href = '/';
  };

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold text-sm tracking-tight">
          AlumniConnect
        </Link>
        {showAuth && (
          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={user.role === 'alumni' ? '/alumni' : '/student'}>Dashboard</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
