import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  ArrowRight,
  Users,
  Zap,
  Target,
  Crown,
  Medal
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { torneoService } from '../services/api';
import type { Torneo } from '../types';
import { lazy, Suspense } from 'react';
import './Dashboard.css';

// Lazy loading del componente 3D para mejor rendimiento
const SoccerBall3D = lazy(() => import('../components/SoccerBall3D'));

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentTorneos, setRecentTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const torneosRes = await torneoService.getAll();
        const torneos = Array.isArray(torneosRes.data.data) ? torneosRes.data.data : [];
        setRecentTorneos(torneos.slice(0, 5)); // Mostrar los 5 más recientes
      } catch (error) {
        console.error('Error loading tournaments:', error);
        setRecentTorneos([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getTorneoStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-warning-100 text-warning-800';
      case 'en_curso':
        return 'bg-success-100 text-success-800';
      case 'finalizado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTorneoStatusText = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_curso':
        return 'En curso';
      case 'finalizado':
        return 'Finalizado';
      default:
        return estado;
    }
  };

  // Función para obtener el icono específico del tipo de torneo
  const getTorneoIcon = (tipo: string) => {
    switch (tipo) {
      case 'eliminacion':
        return <Target className="w-6 h-6 mr-3 torneo-icon-eliminacion icon-hover" />;
      case 'liga':
        return <Crown className="w-6 h-6 mr-3 torneo-icon-liga icon-hover" />;
      default:
        return <Trophy className="w-6 h-6 mr-3 torneo-icon-default icon-hover" />;
    }
  };

  // Función para obtener el icono grande del tipo de torneo
  const getTorneoIconLarge = (tipo: string) => {
    switch (tipo) {
      case 'eliminacion':
        return <Target className="w-10 h-10 torneo-icon-eliminacion icon-bounce" />;
      case 'liga':
        return <Crown className="w-10 h-10 torneo-icon-liga icon-bounce" />;
      default:
        return <Trophy className="w-10 h-10 torneo-icon-default icon-bounce" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-fullscreen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section - Pantalla completa */}
      <section className="hero-fullscreen">
        {/* Fondo con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100"></div>
        
        {/* Partículas flotantes para el fondo */}
        <div className="floating-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        
        {/* Balón 3D de fondo - Solo uno grande a la derecha */}
        <div className="absolute inset-0">
          <div className="ball-3d-right">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
              </div>
            }>
              <SoccerBall3D />
            </Suspense>
          </div>
        </div>
        
        {/* Contenido de la Hero Section - Centrado verticalmente */}
        <div className="hero-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left max-w-2xl lg:max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              ¡Bienvenido, {user?.nombre}! 👋
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Gestiona tus torneos de forma profesional y divertida
            </p>
            
            {/* Botones de acción principales */}
            <div className="flex flex-col sm:flex-row gap-4 justify-start mb-12">
              <Link
                to="/crear-eliminacion"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Target className="w-6 h-6 mr-3" />
                Crear Eliminación
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/crear-liga"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Crown className="w-6 h-6 mr-3" />
                Crear Liga
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            

          </div>
        </div>
      </section>

      {/* Sección de contenido principal - Pantalla completa */}
      <section className="w-full min-h-screen bg-white relative section-transition">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Botones de Crear Torneo - Versión expandida */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Link
            to="/crear-eliminacion"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-center w-20 h-20 bg-white/20 rounded-full">
                <Target className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Eliminación Directa</h3>
              <p className="text-red-100 mb-6 text-lg">
                Crea un torneo de eliminación directa donde los equipos compiten en rondas hasta llegar al campeón.
              </p>
              <div className="flex items-center text-red-100 group-hover:text-white transition-colors">
                <span className="font-medium text-lg">Crear Torneo</span>
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>

          <Link
            to="/crear-liga"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-center w-20 h-20 bg-white/20 rounded-full">
                <Crown className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Liga</h3>
              <p className="text-blue-100 mb-6 text-lg">
                Crea un torneo de liga donde todos los equipos juegan entre sí y se determina el campeón por puntos.
              </p>
              <div className="flex items-center text-blue-100 group-hover:text-white transition-colors">
                <span className="font-medium text-lg">Crear Torneo</span>
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>

        {/* Sección de Torneos Recientes */}
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Torneos Recientes</h2>
            <Link
              to="/torneos"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
            >
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {recentTorneos.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay torneos</h3>
              <p className="text-gray-500 mb-6">
                Comienza creando tu primer torneo usando los botones de arriba.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  to="/crear-eliminacion"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Crear Eliminación
                </Link>
                <Link
                  to="/crear-liga"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Crear Liga
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTorneos.map((torneo) => (
                <div
                  key={torneo.id}
                  className="group bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {getTorneoIcon(torneo.tipo)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {torneo.nombre}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {torneo.tipo === 'liga' ? 'Liga' : 'Eliminación'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTorneoStatusColor(torneo.estado)}`}>
                      {getTorneoStatusText(torneo.estado)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Creado el {new Date(torneo.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/torneo/${torneo.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform"
                    >
                      Ver detalles
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Botón de scroll suave */}
        <div className="text-center mt-12">
          <button
            onClick={() => {
              document.querySelector('.card')?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }}
            className="scroll-button inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 hover:scale-105"
          >
            <span className="mr-2">Ver más</span>
            <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
