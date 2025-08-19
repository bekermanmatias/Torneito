import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  Calendar, 
  TrendingUp, 
  Plus,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { equipoService, torneoService, partidoService } from '../services/api';
import type { Equipo, Torneo, Partido } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    equipos: 0,
    torneos: 0,
    partidos: 0,
    partidosJugados: 0,
  });
  const [recentTorneos, setRecentTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [equiposRes, torneosRes, partidosRes] = await Promise.all([
          equipoService.getAll(),
          torneoService.getAll(),
          partidoService.getByTorneo(1), // Temporal, necesitaremos ajustar esto
        ]);

        const equipos = equiposRes.data;
        const torneos = torneosRes.data;
        const partidos = partidosRes.data || [];

        setStats({
          equipos: equipos.length,
          torneos: torneos.length,
          partidos: partidos.length,
          partidosJugados: partidos.filter((p: Partido) => p.estado === 'jugado').length,
        });

        setRecentTorneos(torneos.slice(0, 3));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Equipos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.equipos}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-success-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Torneos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.torneos}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-warning-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Partidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.partidos}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-danger-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Jugados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.partidosJugados}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/equipos"
          className="card hover:shadow-md transition-shadow duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Gestionar Equipos</h3>
                <p className="text-sm text-gray-600">Crear y administrar equipos</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </div>
        </Link>

        <Link
          to="/torneos"
          className="card hover:shadow-md transition-shadow duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Crear Torneo</h3>
                <p className="text-sm text-gray-600">Organizar nuevos torneos</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-success-600 transition-colors" />
          </div>
        </Link>

        <Link
          to="/partidos"
          className="card hover:shadow-md transition-shadow duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Ver Partidos</h3>
                <p className="text-sm text-gray-600">Gestionar resultados</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-warning-600 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent Tournaments */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Torneos Recientes</h2>
          <Link
            to="/torneos"
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Torneo
          </Link>
        </div>

        {recentTorneos.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay torneos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando tu primer torneo.
            </p>
            <div className="mt-6">
              <Link
                to="/torneos"
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Torneo
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTorneos.map((torneo) => (
              <div
                key={torneo.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
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
                    to={`/torneos/${torneo.id}`}
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
