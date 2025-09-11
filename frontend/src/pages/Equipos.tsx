import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X,
  Check,
  AlertCircle,
  Trophy,
  Calendar,
  Upload,
  Image
} from 'lucide-react';
import { equipoService, uploadService } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import type { Equipo, CreateEquipoData } from '../types';

const Equipos: React.FC = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [equipoToDelete, setEquipoToDelete] = useState<Equipo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);
  const [formData, setFormData] = useState<CreateEquipoData>({
    nombre: '',
    escudo_url: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadEquipos();
  }, []);

  const loadEquipos = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Cargando equipos...');
      
      const response = await equipoService.getAll();
      console.log('✅ Respuesta completa:', response);
      
      // Verificar la estructura de la respuesta
      if (response.data && Array.isArray(response.data)) {
        setEquipos(response.data);
        console.log('✅ Equipos cargados (array directo):', response.data.length);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setEquipos(response.data.data);
        console.log('✅ Equipos cargados (estructura anidada):', response.data.data.length);
      } else {
        console.warn('⚠️ Estructura de respuesta inesperada:', response);
        setEquipos([]);
      }
    } catch (error: any) {
      console.error('❌ Error al cargar equipos:', error);
      
      let errorMessage = 'Error al cargar los equipos';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setEquipos([]);
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

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    try {
      const response = await uploadService.uploadImage(file);
      return response.data.data.url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Error al subir la imagen a Cloudinary');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');
      
      const imageUrl = await uploadImageToCloudinary(file);
      setFormData(prev => ({ ...prev, escudo_url: imageUrl }));
      
      console.log('✅ Imagen subida exitosamente:', imageUrl);
    } catch (error: any) {
      setError(error.message || 'Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

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
    } finally {
      setSubmitting(false);
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

  const handleDelete = (equipo: Equipo) => {
    setEquipoToDelete(equipo);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!equipoToDelete) return;

    try {
      await equipoService.delete(equipoToDelete.id);
      loadEquipos();
      setShowDeleteModal(false);
      setEquipoToDelete(null);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Mis Equipos</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {equipos.length} {equipos.length === 1 ? 'equipo' : 'equipos'}
              </span>
            </div>
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
                placeholder="Buscar equipos por nombre..."
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
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}



      {/* Teams Grid */}
      {filteredEquipos.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
            <Users className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {searchTerm ? 'No se encontraron equipos' : 'No hay equipos creados'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchTerm 
              ? 'Intenta con otro término de búsqueda.'
              : 'Comienza creando tu primer equipo para poder agregarlo a tus torneos.'
            }
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={openCreateModal}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear mi primer equipo
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipos.map((equipo) => (
            <div key={equipo.id} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {equipo.escudo_url ? (
                        <img 
                          src={equipo.escudo_url} 
                          alt={`Escudo de ${equipo.nombre}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <Users className={`w-5 h-5 text-primary-600 ${equipo.escudo_url ? 'hidden' : ''}`} />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-base font-semibold text-gray-900">
                        {equipo.nombre}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(equipo.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(equipo)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors duration-200 rounded-md hover:bg-primary-50"
                      title="Editar equipo"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(equipo)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors duration-200 rounded-md hover:bg-red-50"
                      title="Eliminar equipo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingEquipo ? 'Editar Equipo' : 'Nuevo Equipo'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Equipo *
                </label>
                <input
                  id="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="Ej: Real Madrid"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escudo del Equipo
                </label>
                
                {/* Preview de imagen */}
                {formData.escudo_url && (
                  <div className="mb-3">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img 
                        src={formData.escudo_url} 
                        alt="Preview del escudo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Upload de imagen */}
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImage ? 'Subiendo...' : 'Subir Imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  
                  {formData.escudo_url && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, escudo_url: '' })}
                      className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <p className="mt-1 text-xs text-gray-500">
                  Formatos: JPG, PNG, GIF. Máximo 5MB.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingEquipo ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setEquipoToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Equipo"
        message={`¿Estás seguro de que quieres eliminar el equipo "${equipoToDelete?.nombre}"?\n\nEsta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default Equipos;
