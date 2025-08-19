import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { equipoService } from '../services/api';
import type { Equipo, CreateEquipoData } from '../types';

const Equipos: React.FC = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);
  const [formData, setFormData] = useState<CreateEquipoData>({
    nombre: '',
    escudo_url: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadEquipos();
  }, []);

  const loadEquipos = async () => {
    try {
      setLoading(true);
      const response = await equipoService.getAll();
      setEquipos(response.data);
    } catch (error: any) {
      setError('Error al cargar los equipos');
      console.error('Error loading equipos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadEquipos();
      return;
    }

    try {
      setLoading(true);
      const response = await equipoService.search(searchTerm);
      setEquipos(response.data);
    } catch (error: any) {
      setError('Error al buscar equipos');
      console.error('Error searching equipos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingEquipo) {
        await equipoService.update(editingEquipo.id, formData);
      } else {
        await equipoService.create(formData);
      }
      
      setShowModal(false);
      setEditingEquipo(null);
      setFormData({ nombre: '', escudo_url: '' });
      loadEquipos();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar el equipo');
    }
  };

  const handleEdit = (equipo: Equipo) => {
    setEditingEquipo(equipo);
    setFormData({
      nombre: equipo.nombre,
      escudo_url: equipo.escudo_url || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
      return;
    }

    try {
      await equipoService.delete(id);
      loadEquipos();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al eliminar el equipo');
    }
  };

  const openCreateModal = () => {
    setEditingEquipo(null);
    setFormData({ nombre: '', escudo_url: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEquipo(null);
    setFormData({ nombre: '', escudo_url: '' });
    setError('');
  };

  const filteredEquipos = equipos.filter(equipo =>
    equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && equipos.length === 0) {
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
            <h1 className="text-3xl font-bold text-gray-900">Equipos</h1>
            <p className="mt-2 text-gray-600">
              Gestiona los equipos que participarán en tus torneos
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Equipo
          </button>
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
                placeholder="Buscar equipos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input pl-10"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="btn btn-secondary"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Teams Grid */}
      {filteredEquipos.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'No se encontraron equipos' : 'No hay equipos'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? 'Intenta con otro término de búsqueda.'
              : 'Comienza creando tu primer equipo.'
            }
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={openCreateModal}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Equipo
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipos.map((equipo) => (
            <div key={equipo.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {equipo.nombre}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Creado el {new Date(equipo.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(equipo)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(equipo.id)}
                    className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingEquipo ? 'Editar Equipo' : 'Nuevo Equipo'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nombre" className="label">
                  Nombre del Equipo *
                </label>
                <input
                  id="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input"
                  placeholder="Ej: Real Madrid"
                />
              </div>

              <div>
                <label htmlFor="escudo_url" className="label">
                  URL del Escudo (opcional)
                </label>
                <input
                  id="escudo_url"
                  type="url"
                  value={formData.escudo_url}
                  onChange={(e) => setFormData({ ...formData, escudo_url: e.target.value })}
                  className="input"
                  placeholder="https://ejemplo.com/escudo.png"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingEquipo ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Actualizar
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipos;
