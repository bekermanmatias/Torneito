import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { torneoService } from '../services/api';
import type { Torneo } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentTorneos, setRecentTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const torneosRes = await torneoService.getAll();
        const torneos = Array.isArray(torneosRes.data) ? torneosRes.data : [];
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Bienvenido, {user?.nombre}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Gestiona tus torneos de fútbol desde aquí
        </p>
      </div>

      {/* Botones de Crear Torneo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Link
          to="/crear-torneo?tipo=eliminacion"
          className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-8 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-center w-16 h-16 bg-white/20 rounded-full">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Eliminación Directa</h3>
            <p className="text-red-100 mb-4">
              Crea un torneo de eliminación directa donde los equipos compiten en rondas hasta llegar al campeón.
            </p>
            <div className="flex items-center text-red-100 group-hover:text-white transition-colors">
              <span className="font-medium">Crear Torneo</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>

        <Link
          to="/crear-torneo?tipo=liga"
          className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-center w-16 h-16 bg-white/20 rounded-full">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Liga</h3>
            <p className="text-blue-100 mb-4">
              Crea un torneo de liga donde todos los equipos juegan entre sí y se determina el campeón por puntos.
            </p>
            <div className="flex items-center text-blue-100 group-hover:text-white transition-colors">
              <span className="font-medium">Crear Torneo</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
      </div>

      {/* Historial de Torneos */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Historial de Torneos</h2>
        </div>

        {recentTorneos.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay torneos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando tu primer torneo usando los botones de arriba.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTorneos.map((torneo) => (
              <div
                key={torneo.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <Trophy className="w-5 h-5 text-primary-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {torneo.nombre}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {torneo.tipo === 'liga' ? 'Liga' : 'Eliminación'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTorneoStatusColor(torneo.estado)}`}>
                    {getTorneoStatusText(torneo.estado)}
                  </span>
                  <Link
                    to={`/torneo/${torneo.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
