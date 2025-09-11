import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Trophy, 
  Home, 
  LogOut, 
  User,
  Menu,
  X,
  Users,
  LogIn
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toastService } from '../services/toast';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú de usuario cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const navItems = user ? [
    { label: 'Inicio', path: '/', icon: Home },
    { label: 'Torneos', path: '/torneos', icon: Trophy },
    { label: 'Equipos', path: '/equipos', icon: Users },
  ] : [
    { label: 'Inicio', path: '/', icon: Home },
  ];

  const handleLogout = () => {
    logout();
    toastService.auth.logout();
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Función para ir al inicio de la página
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Función para manejar el clic en el logo o inicio
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      // Si ya estamos en la página principal, solo hacer scroll al inicio
      scrollToTop();
    } else {
      // Si estamos en otra página, navegar a la principal
      window.location.href = '/';
    }
  };

  // Función para manejar el clic en el logo o inicio
  const handleInicioClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      // Si ya estamos en la página principal, solo hacer scroll al inicio
      scrollToTop();
    } else {
      // Si estamos en otra página, navegar a la principal
      window.location.href = '/';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y navegación principal */}
          <div className="flex items-center">
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
            >
              <Trophy className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Torneito</span>
            </button>
            
            {/* Navegación desktop */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isInicio = item.path === '/';
                
                return (
                  <button
                    key={item.path}
                    onClick={isInicio ? handleInicioClick : undefined}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      isActive(item.path)
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {isInicio ? (
                      <>
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        className="inline-flex items-center"
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Link>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Usuario y menú móvil */}
          <div className="flex items-center">
            {/* Usuario desktop */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    <User className="h-4 w-4" />
                    <span>{user?.nombre}</span>
                  </button>
                  
                  {/* Menú desplegable del usuario */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <Link
                        to="/perfil"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Mi Perfil
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Iniciar sesión</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Botón de menú móvil */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                aria-expanded="false"
              >
                <span className="sr-only">Abrir menú principal</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isInicio = item.path === '/';
              
              return (
                <button
                  key={item.path}
                  onClick={isInicio ? handleInicioClick : undefined}
                  className={`w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isInicio ? (
                    <>
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center w-full"
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Link>
                  )}
                </button>
              );
            })}
            
            {/* Usuario en móvil */}
            {user ? (
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user?.nombre}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    to="/perfil"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <User className="h-5 w-5 mr-3" />
                    Mi Perfil
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="px-2 space-y-1">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <LogIn className="h-5 w-5 mr-3" />
                    Iniciar sesión
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
