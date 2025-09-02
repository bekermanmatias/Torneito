import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Plus, 
  X,
  Check,
  AlertCircle,
  ArrowLeft,
  Users,
  Calendar,
  Search,
  UserCheck
} from 'lucide-react';
import { torneoService, equipoService } from '../services/api';
import type { CreateTorneoData, Equipo } from '../types';

const CrearLiga: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTorneoData>({
    nombre: '',
    tipo: 'liga'
  });
  const [newEquipos, setNewEquipos] = useState<string[]>(['', '']); // Mínimo 2 equipos
  const [selectedEquipos, setSelectedEquipos] = useState<Equipo[]>([]); // Equipos existentes seleccionados
  const [availableEquipos, setAvailableEquipos] = useState<Equipo[]>([]); // Todos los equipos disponibles
  const [searchQuery, setSearchQuery] = useState(''); // Búsqueda de equipos
  const [showEquiposModal, setShowEquiposModal] = useState(false); // Modal para seleccionar equipos
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      
      // Filtrar equipos válidos
      const equiposNuevos = newEquipos.filter(equipo => equipo.trim());

      // Validar que se hayan agregado equipos
      if (equiposNuevos.length === 0) {
        setError('Debes agregar al menos un equipo para el torneo');
        return;
      }

      // Validar número mínimo de equipos para liga
      if (equiposNuevos.length < 2) {
        setError('Para un torneo de liga necesitas al menos 2 equipos');
        return;
      }

      const torneoData = {
        ...formData,
        equiposNuevos,
        equiposIds: selectedEquipos.map(e => e.id)
      };

      const response = await torneoService.create(torneoData);
      
      // Navegar al detalle del torneo creado
      navigate(`/torneo/${response.data.torneo.id}`, { replace: true });
    } catch (error: any) {
      console.error('Error creating tournament:', error);
      setError(error.response?.data?.message || 'Error al crear el torneo');
    } finally {
      setLoading(false);
    }
  };

  const addEquipo = () => {
    setNewEquipos([...newEquipos, '']);
  };

  const removeEquipo = (index: number) => {
    if (newEquipos.length > 2) { // Mantener mínimo 2 equipos
      setNewEquipos(newEquipos.filter((_, i) => i !== index));
    }
  };

  const updateEquipo = (index: number, value: string) => {
    const updated = [...newEquipos];
    updated[index] = value;
    setNewEquipos(updated);
  };

  // Funciones para manejar equipos existentes
  const toggleEquipoSelection = (equipo: Equipo) => {
    const isSelected = selectedEquipos.some(e => e.id === equipo.id);
    if (isSelected) {
      setSelectedEquipos(selectedEquipos.filter(e => e.id !== equipo.id));
    } else {
      setSelectedEquipos([...selectedEquipos, equipo]);
    }
  };

  const removeSelectedEquipo = (equipoId: number) => {
    setSelectedEquipos(selectedEquipos.filter(e => e.id !== equipoId));
  };

  const filteredEquipos = availableEquipos.filter(equipo =>
    equipo.nombre.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedEquipos.some(selected => selected.id === equipo.id)
  );

  // Cargar equipos disponibles al montar el componente
  useEffect(() => {
    const loadEquipos = async () => {
      try {
        const response = await equipoService.getAll();
        setAvailableEquipos(response.data.data || []);
      } catch (error) {
        console.error('Error loading equipos:', error);
      }
    };
    loadEquipos();
  }, []);

  const equiposValidos = newEquipos.filter(equipo => equipo.trim()).length + selectedEquipos.length;
  const totalPartidos = equiposValidos > 1 ? (equiposValidos * (equiposValidos - 1)) / 2 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crear Torneo de Liga</h1>
              <p className="mt-2 text-gray-600">
                Crea un torneo donde todos los equipos juegan entre sí para determinar el campeón
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Trophy className="w-4 h-4" />
            <span>Liga</span>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {/* Nombre del Torneo */}
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
              placeholder="Ej: Liga Nacional 2024"
            />
          </div>

          {/* Equipos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="label">
                Equipos Participantes *
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {equiposValidos} equipos
                </span>
                {equiposValidos >= 2 ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {newEquipos.map((equipo, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    required
                    value={equipo}
                    onChange={(e) => updateEquipo(index, e.target.value)}
                    className="input flex-1"
                    placeholder={`Equipo ${index + 1}`}
                  />
                  {newEquipos.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeEquipo(index)}
                      className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-3 mt-3">
              <button
                type="button"
                onClick={addEquipo}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Equipo
              </button>
              
              <button
                type="button"
                onClick={() => setShowEquiposModal(true)}
                className="inline-flex items-center px-3 py-2 border border-primary-300 shadow-sm text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Seleccionar Equipos Existentes
              </button>
            </div>

            {/* Equipos existentes seleccionados */}
            {selectedEquipos.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="font-medium text-blue-900 mb-3">Equipos Existentes Seleccionados:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedEquipos.map((equipo) => (
                    <div key={equipo.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-sm font-medium text-gray-700">{equipo.nombre}</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedEquipo(equipo.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información sobre liga */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                <strong>💡 Tip:</strong> En una liga, cada equipo juega contra todos los demás.
                {equiposValidos >= 2 && (
                  <span className="block mt-1">
                    Se jugarán {totalPartidos} partidos en total.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Resumen del torneo */}
          {equiposValidos >= 2 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Equipos</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {equiposValidos}
                  </span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Partidos</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {totalPartidos}
                  </span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Jornadas</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {equiposValidos > 1 ? Math.ceil(totalPartidos / Math.floor(equiposValidos / 2)) : 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.nombre.trim() || equiposValidos < 2}
              className="btn btn-primary"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </div>
              ) : (
                <>
                  <Trophy className="w-4 h-4 mr-2" />
                  Crear Liga
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal para seleccionar equipos existentes */}
      {showEquiposModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Seleccionar Equipos Existentes</h3>
              <button
                onClick={() => setShowEquiposModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Búsqueda */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar equipos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Lista de equipos disponibles */}
              <div className="max-h-96 overflow-y-auto">
                {filteredEquipos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? 'No se encontraron equipos con ese nombre' : 'No hay equipos disponibles'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredEquipos.map((equipo) => (
                      <button
                        key={equipo.id}
                        onClick={() => toggleEquipoSelection(equipo)}
                        className="flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <span className="font-medium text-gray-700">{equipo.nombre}</span>
                        <Plus className="w-4 h-4 text-blue-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Equipos seleccionados en el modal */}
              {selectedEquipos.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="font-medium text-blue-900 mb-3">Equipos Seleccionados ({selectedEquipos.length}):</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedEquipos.map((equipo) => (
                      <div key={equipo.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm font-medium text-gray-700">{equipo.nombre}</span>
                        <button
                          onClick={() => removeSelectedEquipo(equipo.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowEquiposModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearLiga;
