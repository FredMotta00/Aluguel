import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  CalendarCheck,
  Menu,
  X,
  Home,
  Tag,
  Percent,
  Settings,
  Users
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import logoExs from '@/assets/logo-exs-new.png';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: CalendarCheck, label: 'Reservas', path: '/admin/reservas' },
  { icon: Package, label: 'Produtos', path: '/admin/produtos' },
  { icon: Package, label: 'Pacotes', path: '/admin/pacotes' },
  { icon: Tag, label: 'Categorias', path: '/admin/categorias' },
  { icon: Percent, label: 'Promoções', path: '/admin/promocoes' },
  { icon: Settings, label: 'Editor do Site', path: '/admin/site-editor' },
  { icon: Users, label: 'Administradores', path: '/admin/usuarios' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        // Import dynamically to avoid circular deps
        const { checkIsAdmin } = await import('@/lib/adminAuth');
        const adminStatus = await checkIsAdmin(user.email);

        if (adminStatus) {
          setIsAdmin(true);
        } else {
          // User is logged in but not admin
          navigate('/admin/login');
        }
      } else {
        // Not logged in
        navigate('/admin/login');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Double check to prevent flash of content
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2">
              <img src={logoExs} alt="EXS Solutions" className="h-12 w-auto" />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link to="/">
                <Home className="h-4 w-4" />
                Voltar ao Site
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-card border-b border-border p-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <img src={logoExs} alt="EXS Solutions" className="h-10 w-auto" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
