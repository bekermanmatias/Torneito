import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Plus, 
  Users, 
  Calendar,
  Edit, 
  Trash2, 
  Eye
} from 'lucide-react';
import { torneoService } from '../services/api';
import type { Torneo } from '../types';

const Torneos: React.FC = () => {
  const navigate = useNavigate();
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const torneosRes = await torneoService.getAll();
      // Asegurar que los datos sean arrays
      const torneosData = Array.isArray(torneosRes.data.data) ? torneosRes.data.data : [];
      setTorneos(torneosData);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este torneo?')) {
      return;
    }

    try {
      await torneoService.delete(id);
      loadData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al eliminar el torneo');
    }
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Torneos</h1>
            <p className="mt-2 text-gray-600">
              Gestiona tus torneos de fútbol
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/crear-eliminacion')}
              className="btn btn-secondary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Eliminación Directa
            </button>
            <button
              onClick={() => navigate('/crear-liga')}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Liga
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Tournaments Grid */}
      {torneos.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay torneos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza creando tu primer torneo.
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <button
              onClick={() => navigate('/crear-eliminacion')}
              className="btn btn-secondary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Eliminación Directa
            </button>
            <button
              onClick={() => navigate('/crear-liga')}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Liga
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {torneos.map((torneo) => (
            <div key={torneo.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Trophy className="w-5 h-5 text-primary-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {torneo.nombre}
                    </h3>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Tipo: {torneo.tipo === 'liga' ? 'Liga' : 'Eliminación'}</p>
                    <p>Equipos: {torneo.equipos?.length || 0}</p>
                    <p>Creado: {new Date(torneo.createdAt).toLocaleDateString()}</p>
                  </div>
                  {torneo.estado === 'finalizado' && torneo.campeon && (
                    <div className="mt-2 p-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-md">
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-4 h-4 text-yellow-800" />
                        <span className="text-sm font-bold text-yellow-900">{torneo.campeon.nombre}</span>
                      </div>
                    </div>
                  )}
                  <div className="mt-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTorneoStatusColor(torneo.estado)}`}>
                      {getTorneoStatusText(torneo.estado)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => navigate(`/torneo/${torneo.id}`)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(torneo.id)}
                    className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Torneos;
