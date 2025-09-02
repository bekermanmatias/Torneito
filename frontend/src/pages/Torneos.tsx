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
import TorneoCard from '../components/TorneoCard';

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
    try {
      await torneoService.delete(id);
      loadData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al eliminar el torneo');
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {torneos.map((torneo) => (
            <TorneoCard
              key={torneo.id}
              torneo={torneo}
              variant="torneos"
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Torneos;
