import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Plus, 
  X,
  Check,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { torneoService, equipoService } from '../services/api';
import type { Equipo, CreateTorneoData } from '../types';

const CrearTorneo: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<CreateTorneoData>({
    nombre: '',
    tipo: 'liga',
    equiposIds: [] // Se llenará al crear los equipos
  });
  const [newEquipos, setNewEquipos] = useState<string[]>(['']);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEquipos();
  }, []);

  // Detectar parámetros de URL para pre-seleccionar tipo de torneo
  useEffect(() => {
    const tipoFromUrl = searchParams.get('tipo');
    if (tipoFromUrl && (tipoFromUrl === 'liga' || tipoFromUrl === 'eliminacion')) {
      setFormData(prev => ({ ...prev, tipo: tipoFromUrl as 'liga' | 'eliminacion' }));
    }
  }, [searchParams]);

  const loadEquipos = async () => {
    try {
      setLoading(true);
      // Por ahora no cargamos equipos existentes ya que se crean al momento
      setEquipos([]);
    } catch (error: any) {
      setError('Error al cargar los equipos');
      console.error('Error loading equipos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
             // Obtener nombres de equipos válidos (mínimo 2 caracteres)
       const equiposNuevos = newEquipos.filter(equipo => equipo.trim().length >= 2);
      
             // Validar que se hayan agregado equipos
       if (equiposNuevos.length === 0) {
         setError('Debes agregar al menos un equipo para el torneo');
         return;
       }

       // Validar que todos los equipos tengan al menos 2 caracteres
       const equiposInvalidos = newEquipos.filter(equipo => equipo.trim() && equipo.trim().length < 2);
       if (equiposInvalidos.length > 0) {
         setError('Todos los equipos deben tener al menos 2 caracteres');
         return;
       }

      // Validar número mínimo de equipos según el tipo
      const minEquipos = 2;
      if (equiposNuevos.length < minEquipos) {
        setError(`Para un torneo necesitas al menos ${minEquipos} equipos`);
        return;
      }

      // Para eliminación, validar que sea potencia de 2
      if (formData.tipo === 'eliminacion') {
        const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;
        if (!isPowerOfTwo(equiposNuevos.length)) {
          setError('Para un torneo de eliminación directa, el número de equipos debe ser una potencia de 2 (2, 4, 8, 16, etc.)');
          return;
        }
      }

      const torneoData = {
        nombre: formData.nombre,
        tipo: formData.tipo,
        equiposNuevos
      };

      const torneoCreado = await torneoService.create(torneoData);
      
      // Redirigir a los detalles del torneo después de crearlo
      navigate(`/torneo/${torneoCreado.data.torneo.id}`);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al crear el torneo');
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Torneo</h1>
              <p className="mt-2 text-gray-600">
                Configura tu torneo de fútbol
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Form */}
      <div className="card">
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

                     {/* Crear equipos nuevos */}
          <div>
            <div className="flex items-center justify-between mb-2">
                               <label className="label">
                   Equipos del Torneo
                 </label>
                 <span className="text-sm text-gray-500">
                   {newEquipos.filter(e => e.trim()).length} equipos
                 </span>
            </div>
                         <div className="space-y-2">
               {newEquipos.map((equipo, index) => (
                 <div key={index} className="space-y-1">
                   <div className="flex items-center space-x-2">
                     <input
                       type="text"
                       value={equipo}
                       onChange={(e) => updateNewEquipo(index, e.target.value)}
                       className={`input flex-1 ${
                         equipo.trim() && equipo.trim().length < 2 
                           ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                           : ''
                       }`}
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
                   {equipo.trim() && equipo.trim().length < 2 && (
                     <p className="text-xs text-red-600 ml-1">
                       El nombre debe tener al menos 2 caracteres
                     </p>
                   )}
                 </div>
               ))}
                             <button
                 type="button"
                 onClick={addNewEquipo}
                 className="btn btn-secondary text-sm"
               >
                 <Plus className="w-4 h-4 mr-2" />
                 Agregar Otro Equipo
               </button>
            </div>
          </div>

                     {/* Resumen de equipos */}
           <div className="bg-gray-50 p-4 rounded-lg">
             <div className="flex items-center justify-between">
               <span className="text-sm font-medium text-gray-700">Total de equipos:</span>
               <span className="text-lg font-bold text-primary-600">
                 {newEquipos.filter(e => e.trim()).length}
               </span>
             </div>
             {formData.tipo === 'eliminacion' && (
               <div className="mt-2 text-sm text-gray-600">
                 {(() => {
                   const total = newEquipos.filter(e => e.trim()).length;
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
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Crear Torneo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearTorneo;
