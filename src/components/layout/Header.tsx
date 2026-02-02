import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Calendar, Settings, Menu, X, LogIn, CreditCard, Wallet, User, LogOut, ShoppingCart, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import logoExs from '@/assets/logo-exs-new.png';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const { itemCount } = useCart();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/auth');
  };

  const allNavItems = [
    { label: 'Home', to: '/', icon: Package },
    { label: 'Planos', to: '/planos', icon: CreditCard },
    { label: 'Pacotes', to: '/pacotes', icon: Package },
    { label: 'Fidelidade', to: '/fidelidade', icon: Trophy, highlighted: true },
    { label: 'Minha Conta', to: '/minha-conta', icon: Wallet, requiresAuth: true }
  ];

  // Filter navigation items based on authentication status
  const navItems = allNavItems.filter(item => !item.requiresAuth || user);

  const getInitials = (name: string | null) => {
    if (!name) return 'EX';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center group">
          <img
            src={logoExs}
            alt="EXS Solutions"
            className="h-14 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon, highlighted }) => (
            <Link key={to} to={to}>
              <Button
                variant={isActive(to) ? 'default' : 'ghost'}
                className={`gap-2 font-medium transition-all duration-200 ${isActive(to)
                  ? 'shadow-md'
                  : highlighted
                    ? 'text-primary hover:text-primary hover:bg-primary/10 font-bold'
                    : 'hover:bg-accent'
                  }`}
                size="sm"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            </Link>
          ))}

          {/* User Profile / Login Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-none ml-2">
                  <Avatar className="h-9 w-9 border border-border/50">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 p-0 overflow-hidden border-border/50 bg-card/95 backdrop-blur-xl rounded-none" align="end" forceMount>
                <div className="bg-gradient-to-r from-blue-950/50 to-slate-950/50 p-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-sm">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {getInitials(user.displayName || user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 overflow-hidden">
                      <p className="text-sm font-bold text-white leading-none truncate">{user.displayName || 'Usuário'}</p>
                      <p className="text-xs leading-none text-blue-200/70 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-1">

                  <Link to="/minha-conta">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Minha Conta</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/fidelidade">
                    <DropdownMenuItem>
                      <Trophy className="mr-2 h-4 w-4" />
                      <span>Programa de Fidelidade</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/configuracoes">
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configurações</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="gap-2 ml-2">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </Link>
          )}

          {!user && (
            <Link to="/configuracoes">
              {/* ... settings button ... */}
            </Link>
          )}

          {/* Cart Button (Visible to all) */}
          <Link to="/carrinho">
            <Button
              variant={isActive('/carrinho') ? 'default' : 'ghost'}
              className="relative ml-1"
              size="icon"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-none w-4 h-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {
        menuOpen && (
          <nav className="md:hidden border-t border-border/40 bg-card/95 backdrop-blur-sm p-4 space-y-2 animate-fade-in">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
              >
                <Button
                  variant={isActive(to) ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}

            <div className="border-t border-border/50 pt-2 mt-2">
              {user ? (
                <>
                  <div className="px-4 py-2 flex items-center gap-3 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || ''} />
                      <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.displayName || 'Usuário'}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                  <Link to="/configuracoes" onClick={() => setMenuOpen(false)}>
                    <Button
                      variant={isActive('/configuracoes') ? 'default' : 'ghost'}
                      className="w-full justify-start gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Configurações
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-2 mt-2">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/configuracoes" onClick={() => setMenuOpen(false)}>
                    <Button
                      variant={isActive('/configuracoes') ? 'default' : 'ghost'}
                      className="w-full justify-start gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Configurações
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        )
      }
    </header >
  );
};

export default Header;