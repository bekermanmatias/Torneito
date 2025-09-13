import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
import Torneos from './pages/Torneos';
import Equipos from './pages/Equipos';
import Perfil from './pages/Perfil';
import CrearEliminacion from './pages/CrearEliminacion';
import CrearLiga from './pages/CrearLiga';
import DetalleTorneo from './pages/DetalleTorneo';
import Test3D from './pages/Test3D';

// Componente para rutas protegidas (no utilizado actualmente)
// const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   return <>{children}</>;
// };

// Componente para rutas que requieren autenticación pero redirigen a login
const AuthRequiredRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

// Componente para manejar el estado de carga global
const LoadingWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
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
    <LoadingWrapper>
      <Router>
        <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<LoginForm />} />
        
        {/* Home público */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        
        {/* Rutas de torneos */}
        <Route
          path="/torneos"
          element={
            <AuthRequiredRoute>
              <MainLayout>
                <Torneos />
              </MainLayout>
            </AuthRequiredRoute>
          }
        />
        
        {/* Rutas de equipos */}
        <Route
          path="/equipos"
          element={
            <AuthRequiredRoute>
              <MainLayout>
                <Equipos />
              </MainLayout>
            </AuthRequiredRoute>
          }
        />
        
        {/* Rutas de creación de torneos */}
        <Route
          path="/crear-eliminacion"
          element={
            <AuthRequiredRoute>
              <MainLayout>
                <CrearEliminacion />
              </MainLayout>
            </AuthRequiredRoute>
          }
        />
        
        <Route
          path="/crear-liga"
          element={
            <AuthRequiredRoute>
              <MainLayout>
                <CrearLiga />
              </MainLayout>
            </AuthRequiredRoute>
          }
        />
        
        <Route
          path="/perfil"
          element={
            <AuthRequiredRoute>
              <MainLayout>
                <Perfil />
              </MainLayout>
            </AuthRequiredRoute>
          }
        />
        
        <Route
          path="/torneo/:id"
          element={
            <AuthRequiredRoute>
              <MainLayout>
                <DetalleTorneo />
              </MainLayout>
            </AuthRequiredRoute>
          }
        />
        
        {/* Ruta de prueba 3D */}
        <Route
          path="/test-3d"
          element={
            <AuthRequiredRoute>
              <MainLayout>
                <Test3D />
              </MainLayout>
            </AuthRequiredRoute>
          }
        />
        
        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LoadingWrapper>
  );
};

// Componente raíz con providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            fontSize: '14px',
            fontWeight: '500',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #10b981',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #ef4444',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;
