import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Trophy, 
  Plus, 
  Users, 
  Calendar,
  Edit, 
  Trash2, 
  X,
  Check,
  AlertCircle,
  Eye
} from 'lucide-react';
import { torneoService, equipoService } from '../services/api';
import type { Torneo, Equipo, CreateTorneoData } from '../types';

const Torneos: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTorneo, setEditingTorneo] = useState<Torneo | null>(null);
  const [formData, setFormData] = useState<CreateTorneoData>({
    nombre: '',
    tipo: 'liga',
    equiposIds: []
  });
  const [newEquipos, setNewEquipos] = useState<string[]>(['']);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // Detectar parámetros de URL para pre-seleccionar tipo de torneo
  useEffect(() => {
    const tipoFromUrl = searchParams.get('tipo');
    if (tipoFromUrl && (tipoFromUrl === 'liga' || tipoFromUrl === 'eliminacion')) {
      setFormData(prev => ({ ...prev, tipo: tipoFromUrl as 'liga' | 'eliminacion' }));
      setShowModal(true);
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [torneosRes, equiposRes] = await Promise.all([
        torneoService.getAll(),
        equipoService.getAll()
      ]);
      // Asegurar que los datos sean arrays
      const torneosData = Array.isArray(torneosRes.data.data) ? torneosRes.data.data : [];
      const equiposData = Array.isArray(equiposRes.data.data) ? equiposRes.data.data : [];
      setTorneos(torneosData);
      setEquipos(equiposData);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Crear equipos nuevos si existen
      const equiposIds = [...formData.equiposIds];
      
      for (const nombreEquipo of newEquipos) {
        if (nombreEquipo.trim()) {
          const equipoRes = await equipoService.create({ nombre: nombreEquipo.trim() });
          equiposIds.push(equipoRes.data.id);
        }
      }

      // Validar que se hayan seleccionado equipos
      if (equiposIds.length === 0) {
        setError('Debes seleccionar al menos un equipo para el torneo');
        return;
      }

      // Validar número mínimo de equipos según el tipo
      const minEquipos = formData.tipo === 'eliminacion' ? 2 : 2;
      if (equiposIds.length < minEquipos) {
        setError(`Para un torneo de ${formData.tipo === 'eliminacion' ? 'eliminación' : 'liga'} necesitas al menos ${minEquipos} equipos`);
        return;
      }

      // Para eliminación, validar que sea potencia de 2
      if (formData.tipo === 'eliminacion') {
        const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;
        if (!isPowerOfTwo(equiposIds.length)) {
          setError('Para un torneo de eliminación directa, el número de equipos debe ser una potencia de 2 (2, 4, 8, 16, etc.)');
          return;
        }
      }

      const torneoData = {
        ...formData,
        equiposIds
      };

      if (editingTorneo) {
        await torneoService.update(editingTorneo.id, torneoData);
      } else {
        await torneoService.create(torneoData);
      }
      
      setShowModal(false);
      setEditingTorneo(null);
      setFormData({ nombre: '', tipo: 'liga', equiposIds: [] });
      setNewEquipos(['']);
      loadData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar el torneo');
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

  const openCreateModal = () => {
    setEditingTorneo(null);
    setFormData({ nombre: '', tipo: 'liga', equiposIds: [] });
    setNewEquipos(['']);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTorneo(null);
    setFormData({ nombre: '', tipo: 'liga', equiposIds: [] });
    setNewEquipos(['']);
    setError('');
  };

  const addNewEquipo = () => {
    setNewEquipos([...newEquipos, '']);
  };

  const removeNewEquipo = (index: number) => {
    setNewEquipos(newEquipos.filter((_, i) => i !== index));
  };

  const updateNewEquipo = (index: number, value: string) => {
    const updated = [...newEquipos];
    updated[index] = value;
    setNewEquipos(updated);
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
              Crea y gestiona tus torneos de fútbol
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Torneo
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

      {/* Tournaments Grid */}
      {torneos.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay torneos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza creando tu primer torneo.
          </p>
          <div className="mt-6">
            <button
              onClick={openCreateModal}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Torneo
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
                    onClick={() => window.location.href = `/torneos/${torneo.id}`}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTorneo ? 'Editar Torneo' : 'Nuevo Torneo'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="label">
                    Nombre del Torneo *
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="input"
                    placeholder="Ej: Liga Española 2024"
                  />
                </div>

                <div>
                  <label htmlFor="tipo" className="label">
                    Tipo de Torneo *
                  </label>
                  <select
                    id="tipo"
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'liga' | 'eliminacion' })}
                    className="input"
                  >
                    <option value="liga">Liga (Todos contra todos)</option>
                    <option value="eliminacion">Eliminación Directa</option>
                  </select>
                </div>
              </div>

              {/* Información sobre el tipo de torneo */}
              <div className={`p-4 rounded-lg ${
                formData.tipo === 'liga' 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start">
                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                    formData.tipo === 'liga' ? 'bg-blue-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {formData.tipo === 'liga' ? 'Torneo de Liga' : 'Torneo de Eliminación Directa'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formData.tipo === 'liga' 
                        ? 'Todos los equipos juegan entre sí. El campeón se determina por puntos acumulados.'
                        : 'Los equipos compiten en rondas eliminatorias. El número de equipos debe ser una potencia de 2 (2, 4, 8, 16, etc.).'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Equipos existentes */}
              {equipos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label">
                      Seleccionar Equipos Existentes
                    </label>
                    <span className="text-sm text-gray-500">
                      {formData.equiposIds.length} seleccionados
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                    {equipos.map((equipo) => (
                      <label key={equipo.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.equiposIds.includes(equipo.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                equiposIds: [...formData.equiposIds, equipo.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                equiposIds: formData.equiposIds.filter(id => id !== equipo.id)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{equipo.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Crear equipos nuevos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label">
                    Crear Equipos Nuevos
                  </label>
                  <span className="text-sm text-gray-500">
                    {newEquipos.filter(e => e.trim()).length} equipos nuevos
                  </span>
                </div>
                <div className="space-y-2">
                  {newEquipos.map((equipo, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={equipo}
                        onChange={(e) => updateNewEquipo(index, e.target.value)}
                        className="input flex-1"
                        placeholder={`Nombre del equipo ${index + 1}`}
                      />
                      {newEquipos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeNewEquipo(index)}
                          className="p-2 text-danger-600 hover:text-danger-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addNewEquipo}
                    className="btn btn-secondary text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Equipo
                  </button>
                </div>
              </div>

              {/* Resumen de equipos */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total de equipos:</span>
                  <span className="text-lg font-bold text-primary-600">
                    {formData.equiposIds.length + newEquipos.filter(e => e.trim()).length}
                  </span>
                </div>
                {formData.tipo === 'eliminacion' && (
                  <div className="mt-2 text-sm text-gray-600">
                    {(() => {
                      const total = formData.equiposIds.length + newEquipos.filter(e => e.trim()).length;
                      const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;
                      if (total === 0) return 'Agrega equipos para continuar';
                      if (isPowerOfTwo(total)) return '✅ Número válido para eliminación directa';
                      return '⚠️ El número de equipos debe ser una potencia de 2 (2, 4, 8, 16, etc.)';
                    })()}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
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
                  {editingTorneo ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Actualizar
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Torneo
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

export default Torneos;
