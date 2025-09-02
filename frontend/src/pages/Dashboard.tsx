import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  ArrowRight,
  Users,
  Zap,
  Crown,
  Medal
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { torneoService } from '../services/api';
import type { Torneo } from '../types';
import { lazy, Suspense } from 'react';
import TorneoCard from '../components/TorneoCard';
import './Dashboard.css';

// Componente de imagen de fondo profesional
const BackgroundImage: React.FC = () => (
  <div className="background-image-container">
    <img 
      src="/fondo.jpg" 
      alt="Estadio de fútbol profesional" 
      className="background-image"
      onError={(e) => {
        console.error('Error loading background image:', e);
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
      }}
      onLoad={() => {
        console.log('Background image loaded successfully');
      }}
    />
    <div className="background-overlay"></div>
  </div>
);

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
        {/* Imagen de fondo profesional - Primero para que esté detrás de todo */}
        <BackgroundImage />
        
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
        
        {/* Contenido de la Hero Section - Centrado verticalmente */}
        <div className="hero-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left max-w-2xl lg:max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-3">
              ¡Bienvenido, 
              </h1>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4">
              {user?.nombre}! 👋
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Gestiona tus torneos, rapido y profesional
            </p>
            
            {/* Botones de acción principales */}
            <div className="flex flex-col sm:flex-row gap-4 justify-start mb-12">
              <button
                onClick={() => {
                  document.querySelector('.crear-torneos-section')?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Trophy className="w-6 h-6 mr-3" />
                Crear Torneo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <Link
                to="/torneos"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-navy-600 to-navy-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Crown className="w-6 h-6 mr-3" />
                Mis Torneos
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Botón de scroll hacia abajo */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
              <button
                onClick={() => {
                  document.querySelector('.info-section')?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
                className="scroll-down-button inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm text-primary-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-primary-100"
              >
                <span className="mr-2 font-medium">Ver más</span>
                <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </section>

              {/* Sección informativa resumida */}
        <section className="w-full bg-gradient-to-br from-navy-50 to-white relative py-20 info-section">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-8">
              ¿Cómo funciona Torneito?
            </h2>
            <p className="text-xl text-navy-600 mb-16 max-w-3xl mx-auto">
              Una plataforma simple y eficiente para gestionar torneos
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center group">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-all duration-300">
                  <div className="text-4xl font-bold text-primary-700">1</div>
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-4">Crear</h3>
                <p className="text-navy-600 text-lg leading-relaxed">Crea tu torneo en segundos</p>
              </div>
              
              <div className="text-center group">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-all duration-300">
                  <div className="text-4xl font-bold text-primary-700">2</div>
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-4">Gestionar</h3>
                <p className="text-navy-600 text-lg leading-relaxed">Administra partidos y resultados</p>
              </div>
              
              <div className="text-center group">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-all duration-300">
                  <div className="text-4xl font-bold text-primary-700">3</div>
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-4">Compartir</h3>
                <p className="text-navy-600 text-lg leading-relaxed">Comparte con participantes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de creación de torneos */}
        <section className="w-full min-h-screen bg-white relative section-transition crear-torneos-section">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Título de la sección */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
                Crear Nuevo Torneo
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Elige el formato que mejor se adapte a tus necesidades
              </p>
            </div>
            
            {/* Botones de Crear Torneo - Versión expandida */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Link
            to="/crear-eliminacion"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-center w-20 h-20 bg-white/20 rounded-full">
                <Trophy className="w-10 h-10" />
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
                  <Trophy className="w-4 h-4 mr-2" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentTorneos.map((torneo) => (
                <TorneoCard
                  key={torneo.id}
                  torneo={torneo}
                  variant="dashboard"
                />
              ))}
            </div>
          )}
        </div>
                  </div>
        </section>

        {/* Footer con características destacadas */}
        <footer className="w-full bg-navy-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                ¿Por qué elegir Torneito?
              </h3>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Características que hacen de nuestra plataforma la mejor opción para gestionar torneos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center group footer-feature">
                <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500 transition-colors duration-300 icon-container">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Rápido</h4>
                <p className="text-gray-300 text-sm">Configuración en menos de 2 minutos</p>
              </div>

              <div className="text-center group footer-feature">
                <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500 transition-colors duration-300 icon-container">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Profesional</h4>
                <p className="text-gray-300 text-sm">Resultados precisos y estadísticas</p>
              </div>

              <div className="text-center group footer-feature">
                <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500 transition-colors duration-300 icon-container">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Flexible</h4>
                <p className="text-gray-300 text-sm">Adaptable a cualquier formato</p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-700 text-center">
              <p className="text-gray-400 text-sm">
                © 2025 Torneito. Todos los derechos reservados.
              </p>
              <p className="text-gray-400 text-sm">
                Matias Rau Bekerman
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
};

export default Dashboard;
