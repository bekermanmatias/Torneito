import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Plus, 
  Search
} from 'lucide-react';
import { torneoService } from '../services/api';
import type { Torneo } from '../types';
import TorneoCard from '../components/TorneoCard';

const Torneos: React.FC = () => {
  const navigate = useNavigate();
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [filteredTorneos, setFilteredTorneos] = useState<Torneo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTorneos(torneos);
    } else {
      const filtered = torneos.filter(torneo =>
        torneo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        torneo.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTorneos(filtered);
    }
  }, [searchTerm, torneos]);

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

  // const handleDelete = async (id: number) => {
  //   try {
  //     await torneoService.delete(id);
  //     loadData();
  //   } catch (error: any) {
  //     setError(error.response?.data?.message || 'Error al eliminar el torneo');
  //   }
  // };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredTorneos(torneos);
    } else {
      const filtered = torneos.filter(torneo =>
        torneo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        torneo.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTorneos(filtered);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
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

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar torneos por nombre o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Tournaments Grid */}
      <div className="card">
        {filteredTorneos.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'No se encontraron torneos' : 'No hay torneos'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Intenta con otro término de búsqueda.'
                : 'Comienza creando tu primer torneo.'
              }
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
            {filteredTorneos.map((torneo) => (
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
  );
};

export default Torneos;
