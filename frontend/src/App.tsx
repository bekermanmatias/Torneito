import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Layout principal con navegación
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>{children}</main>
    </div>
  );
};

// Componente principal de la aplicación
const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<LoginForm />} />
        
        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Rutas temporales - redirigir al dashboard */}
        <Route path="/equipos" element={<Navigate to="/" replace />} />
        <Route path="/torneos" element={<Navigate to="/" replace />} />
        <Route path="/partidos" element={<Navigate to="/" replace />} />
        
        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// Componente raíz con providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
