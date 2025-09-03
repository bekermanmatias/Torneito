import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Crown, 
  ArrowLeft,
  Users,
  Plus,
  X
} from 'lucide-react';
import { torneoService } from '../services/api';
import { equipoService } from '../services/api';
import { uploadService } from '../services/api';
import type { Equipo } from '../types';

interface FormData {
  nombre: string;
  tipo: 'liga' | 'eliminacion';
  equiposIds: number[];
  equiposNuevos: string[];
  banner_url?: string;
  banner_color?: string;
}

const CrearTorneo: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    tipo: 'liga',
    equiposIds: [],
    equiposNuevos: []
  });
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nuevoEquipo, setNuevoEquipo] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  React.useEffect(() => {
    loadEquipos();
  }, []);

  const loadEquipos = async () => {
    try {
      const response = await equipoService.getAll();
      setEquipos(response.data.data || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

          try {
        // Crear el torneo con el método genérico
        await torneoService.create({
          nombre: formData.nombre,
          tipo: formData.tipo,
          equiposIds: formData.equiposIds,
          equiposNuevos: formData.equiposNuevos,
          banner_url: formData.banner_url,
          banner_color: formData.banner_color
        } as any);
        
        navigate('/torneos');
      } catch (error: any) {
      setError(error.response?.data?.message || 'Error al crear el torneo');
    } finally {
      setLoading(false);
    }
  };

  const addEquipoExistente = (equipoId: number) => {
    if (!formData.equiposIds.includes(equipoId)) {
      setFormData(prev => ({
        ...prev,
        equiposIds: [...prev.equiposIds, equipoId]
      }));
    }
  };

  const removeEquipoExistente = (equipoId: number) => {
    setFormData(prev => ({
      ...prev,
      equiposIds: prev.equiposIds.filter(id => id !== equipoId)
    }));
  };

  const addEquipoNuevo = () => {
    if (nuevoEquipo.trim() && !formData.equiposNuevos.includes(nuevoEquipo.trim())) {
      setFormData(prev => ({
        ...prev,
        equiposNuevos: [...prev.equiposNuevos, nuevoEquipo.trim()]
      }));
      setNuevoEquipo('');
    }
  };

  const removeEquipoNuevo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equiposNuevos: prev.equiposNuevos.filter((_, i) => i !== index)
    }));
  };

  const handleBannerUpload = async (file: File) => {
    setBannerFile(file);
    setUploadingBanner(true);
    setError('');

    try {
      const response = await uploadService.uploadBanner(file);
      setFormData(prev => ({
        ...prev,
        banner_url: response.data.url,
        banner_color: undefined // Limpiar color si se sube imagen
      }));
    } catch (error: any) {
      setError('Error al subir el banner: ' + (error.response?.data?.message || 'Error desconocido'));
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({
      ...prev,
      banner_color: color,
      banner_url: undefined // Limpiar URL si se selecciona color
    }));
    setBannerFile(null);
  };

  const removeBanner = () => {
    setFormData(prev => ({
      ...prev,
      banner_url: undefined,
      banner_color: undefined
    }));
    setBannerFile(null);
  };

  const getEquiposSeleccionados = () => {
    const equiposExistentes = equipos.filter(e => formData.equiposIds.includes(e.id));
    const equiposNuevos = formData.equiposNuevos.map(nombre => ({ id: -1, nombre, escudo_url: undefined, usuarioId: 0, createdAt: '', updatedAt: '' }));
    return [...equiposExistentes, ...equiposNuevos];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Torneo</h1>
        <p className="mt-2 text-gray-600">
          Configura tu torneo de fútbol
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información básica */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Torneo</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Torneo
              </label>
              <input
                type="text"
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ej: Copa 2025"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Torneo
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50">
                  <input
                    type="radio"
                    name="tipo"
                    value="liga"
                    checked={formData.tipo === 'liga'}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'liga' | 'eliminacion' })}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <Crown className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Liga</div>
                      <div className="text-sm text-gray-500">Todos contra todos</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50">
                  <input
                    type="radio"
                    name="tipo"
                    value="eliminacion"
                    checked={formData.tipo === 'eliminacion'}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'liga' | 'eliminacion' })}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <Trophy className="w-6 h-6 text-red-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Eliminación</div>
                      <div className="text-sm text-gray-500">Eliminación directa</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Selección de equipos */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Equipos Participantes</h2>
          
          {/* Equipos existentes */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Equipos Existentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {equipos.map((equipo) => {
                const isSelected = formData.equiposIds.includes(equipo.id);
                return (
                  <div
                    key={equipo.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-900'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => isSelected ? removeEquipoExistente(equipo.id) : addEquipoExistente(equipo.id)}
                  >
                    <div className="flex items-center">
                      {equipo.escudo_url ? (
                        <img
                          src={equipo.escudo_url}
                          alt={`Escudo de ${equipo.nombre}`}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                      <span className="font-medium">{equipo.nombre}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agregar equipos nuevos */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Agregar Equipos Nuevos</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={nuevoEquipo}
                onChange={(e) => setNuevoEquipo(e.target.value)}
                placeholder="Nombre del equipo"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addEquipoNuevo()}
              />
              <button
                type="button"
                onClick={addEquipoNuevo}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {formData.equiposNuevos.map((nombre, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-300 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="font-medium">{nombre}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEquipoNuevo(index)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Banner - Versión Simplificada */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Banner del Torneo</h2>
          <div className="space-y-4">
            <p className="text-gray-600">Esta es la sección de banner que debería aparecer</p>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">✅ Sección de Banner Funcionando</p>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Nombre:</span>
              <span className="font-medium">{formData.nombre || 'No especificado'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tipo:</span>
              <span className="font-medium capitalize flex items-center">
                {formData.tipo === 'liga' ? (
                  <>
                    <Crown className="w-4 h-4 text-blue-600 mr-1" />
                    Liga
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 text-red-600 mr-1" />
                    Eliminación
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total de equipos:</span>
              <span className="font-medium">{getEquiposSeleccionados().length}</span>
            </div>
            {formData.banner_url && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Banner:</span>
                <div className="flex items-center">
                  <img src={formData.banner_url} alt="Banner del torneo" className="w-8 h-8 rounded-md mr-2" />
                  <span className="text-sm text-gray-600">Imagen subida</span>
                </div>
              </div>
            )}
            {formData.banner_color && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Color de fondo:</span>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-md mr-2" style={{ backgroundColor: formData.banner_color }}></div>
                  <span className="text-sm text-gray-600">Color seleccionado</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || getEquiposSeleccionados().length < 2}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Torneo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearTorneo;
