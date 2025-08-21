import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Plus, 
  X,
  Check,
  AlertCircle,
  ArrowLeft,
  Users,
  Calendar
} from 'lucide-react';
import { torneoService } from '../services/api';
import type { CreateTorneoData } from '../types';

const CrearEliminacion: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTorneoData>({
    nombre: '',
    tipo: 'eliminacion'
  });
  const [newEquipos, setNewEquipos] = useState<string[]>(['', '']); // Mínimo 2 equipos
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

      // Validar número mínimo de equipos para eliminación
      if (equiposNuevos.length < 2) {
        setError('Para un torneo de eliminación directa necesitas al menos 2 equipos');
        return;
      }

      // Validar que sea potencia de 2
      const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;
      if (!isPowerOfTwo(equiposNuevos.length)) {
        setError('Para un torneo de eliminación directa, el número de equipos debe ser una potencia de 2 (2, 4, 8, 16, etc.)');
        return;
      }

      const torneoData = {
        ...formData,
        equiposNuevos
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

  const equiposValidos = newEquipos.filter(equipo => equipo.trim()).length;
  const esPotenciaDeDos = (n: number) => n > 0 && (n & (n - 1)) === 0;

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
              <h1 className="text-3xl font-bold text-gray-900">Crear Torneo de Eliminación Directa</h1>
              <p className="mt-2 text-gray-600">
                Crea un torneo donde los equipos compiten en eliminatorias hasta llegar al campeón
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-blue-500">
            <Trophy className="w-4 h-4" />
            <span>Eliminación Directa</span>
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
              placeholder="Ej: Copa Libertadores 2024"
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
                {esPotenciaDeDos(equiposValidos) ? (
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

            <button
              type="button"
              onClick={addEquipo}
              className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Equipo
            </button>

            {/* Información sobre potencias de 2 */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                <strong>💡 Tip:</strong> Para eliminatorias, necesitas 2, 4, 8, 16, 32, etc. equipos.
                {!esPotenciaDeDos(equiposValidos) && equiposValidos > 0 && (
                  <span className="block mt-1">
                    Agrega {Math.pow(2, Math.ceil(Math.log2(equiposValidos))) - equiposValidos} equipo(s) más para completar la eliminación.
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
                    {equiposValidos > 1 ? equiposValidos - 1 : 0}
                  </span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Rondas</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {equiposValidos > 1 ? Math.log2(equiposValidos) : 0}
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
              disabled={loading || !formData.nombre.trim() || equiposValidos < 2 || !esPotenciaDeDos(equiposValidos)}
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
                  Crear Torneo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearEliminacion;
