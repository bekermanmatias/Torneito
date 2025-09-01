import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, XCircle, AlertCircle, Play, CheckCircle, Edit2, Save, X, Upload, Trash2 } from 'lucide-react';
import { torneoService, partidoService, equipoService, uploadService } from '../services/api';
import type { Torneo, Partido, Equipo } from '../types';
import CuadroEliminacion from '../components/CuadroEliminacion';
import TablaPosiciones from '../components/TablaPosiciones';
import CalendarioLiga from '../components/CalendarioLiga';
import { useAuth } from '../contexts/AuthContext';

const DetalleTorneo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingResult, setUpdatingResult] = useState(false);
  const [editingTorneoName, setEditingTorneoName] = useState(false);
  const [editTorneoName, setEditTorneoName] = useState('');
  const [savingTorneoName, setSavingTorneoName] = useState(false);
    const [savingEquipo, setSavingEquipo] = useState(false);
  const [editEquipoName, setEditEquipoName] = useState('');
  const [editEquipoEscudoUrl, setEditEquipoEscudoUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showEquipoModal, setShowEquipoModal] = useState(false);
  const [editingEquipoData, setEditingEquipoData] = useState<Equipo | null>(null);
  const [editingBanner, setEditingBanner] = useState(false);
  const [editBannerUrl, setEditBannerUrl] = useState('');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerPosition, setBannerPosition] = useState({ x: 50, y: 50 }); // Posición en porcentaje
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (id) {
      loadTorneo();
    }
  }, [id]);

  useEffect(() => {
    if (torneo?.banner_position) {
      setBannerPosition(torneo.banner_position);
    }
  }, [torneo?.banner_position]);

  const loadTorneo = async () => {
    try {
      setLoading(true);
      
      const [torneoRes, partidosRes] = await Promise.all([
        torneoService.getById(parseInt(id!)),
        partidoService.getByTorneo(parseInt(id!))
      ]);
      
      setTorneo(torneoRes.data.torneo);
      setPartidos(partidosRes.data.partidos || []);
    } catch (error: any) {
      console.error('Error loading torneo:', error);
      setError('Error al cargar el torneo');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string | undefined) => {
    switch (estado) {
      case 'pendiente': return 'text-yellow-600 bg-yellow-100';
      case 'en_curso': return 'text-blue-600 bg-blue-100';
      case 'finalizado': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEstadoIcon = (estado: string | undefined) => {
    switch (estado) {
      case 'pendiente': return <AlertCircle className="w-4 h-4" />;
      case 'en_curso': return <Play className="w-4 h-4" />;
      case 'finalizado': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'eliminacion' ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100';
  };

  const handleUpdateResult = async (partidoId: number, golesLocal: number, golesVisitante: number, isEditing: boolean = false) => {
    try {
      setUpdatingResult(true);
      
      // Si estamos editando un partido ya jugado, usar actualizarResultado
      if (isEditing) {
        await partidoService.updateResult(partidoId, { golesLocal, golesVisitante });
      } else {
        // Si es un partido nuevo, usar registerResult
        await partidoService.registerResult(partidoId, { golesLocal, golesVisitante });
      }
      
      // Recargar los datos para mostrar las nuevas rondas generadas
      await loadTorneo();
      
    } catch (error: any) {
      console.error('Error al actualizar resultado:', error);
      throw error;
    } finally {
      setUpdatingResult(false);
    }
  };

  const handleEditTorneoName = () => {
    setEditTorneoName(torneo?.nombre || '');
    setEditingTorneoName(true);
  };

  const handleCancelEditTorneoName = () => {
    setEditingTorneoName(false);
    setEditTorneoName('');
  };

  const handleSaveTorneoName = async () => {
    if (!torneo || !editTorneoName.trim()) return;
    
    try {
      setSavingTorneoName(true);
      await torneoService.update(torneo.id, { nombre: editTorneoName.trim() });
      setTorneo({ ...torneo, nombre: editTorneoName.trim() });
      setEditingTorneoName(false);
    } catch (error: any) {
      console.error('Error al actualizar nombre del torneo:', error);
      setError('Error al actualizar el nombre del torneo');
    } finally {
      setSavingTorneoName(false);
    }
  };

  const handleEditEquipo = (equipo: Equipo) => {
    setEditingEquipoData(equipo);
    setEditEquipoName(equipo.nombre);
    setEditEquipoEscudoUrl(equipo.escudo_url || '');
    setShowEquipoModal(true);
  };

  const handleCancelEditEquipo = () => {
    setShowEquipoModal(false);
    setEditingEquipoData(null);
    setEditEquipoName('');
    setEditEquipoEscudoUrl('');
  };

  const handleSaveEquipo = async () => {
    if (!editingEquipoData || !editEquipoName.trim()) return;
    
    try {
      setSavingEquipo(true);
      await equipoService.update(editingEquipoData.id, { 
        nombre: editEquipoName.trim(),
        escudo_url: editEquipoEscudoUrl
      });
      
      // Actualizar el estado local
      if (torneo) {
        const equiposActualizados = torneo.equipos?.map(equipo => 
          equipo.id === editingEquipoData.id 
            ? { ...equipo, nombre: editEquipoName.trim(), escudo_url: editEquipoEscudoUrl }
            : equipo
        );
        setTorneo({ ...torneo, equipos: equiposActualizados });
      }
      setShowEquipoModal(false);
      setEditingEquipoData(null);
    } catch (error: any) {
      console.error('Error al actualizar equipo:', error);
      setError('Error al actualizar el equipo');
    } finally {
      setSavingEquipo(false);
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, equipoId: number) => {
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
      setEditEquipoEscudoUrl(imageUrl);
      
      console.log('✅ Imagen subida exitosamente:', imageUrl);
    } catch (error: any) {
      setError(error.message || 'Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEquipoImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      setEditEquipoEscudoUrl(imageUrl);
      
      console.log('✅ Imagen subida exitosamente:', imageUrl);
    } catch (error: any) {
      setError(error.message || 'Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadBannerToCloudinary = async (file: File): Promise<string> => {
    try {
      console.log('🔍 Iniciando upload de banner...');
      console.log('🔍 Usuario autenticado:', user ? '✅ Sí' : '❌ No');
      console.log('🔍 Token de autenticación:', localStorage.getItem('auth_token') ? '✅ Presente' : '❌ Ausente');
      
      if (!user) {
        throw new Error('Debes estar autenticado para subir archivos');
      }
      
      const response = await uploadService.uploadBanner(file);
      console.log('✅ Respuesta del servidor:', response.data);
      return response.data.data.url;
    } catch (error: any) {
      console.error('❌ Error uploading banner to Cloudinary:', error);
      console.error('❌ Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw new Error('Error al subir el banner a Cloudinary');
    }
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 10MB para banners)
    if (file.size > 10 * 1024 * 1024) {
      setError('El banner debe ser menor a 10MB');
      return;
    }

    try {
      setUploadingBanner(true);
      setError('');
      
      const bannerUrl = await uploadBannerToCloudinary(file);
      setEditBannerUrl(bannerUrl);
      
      console.log('✅ Banner subido exitosamente:', bannerUrl);
    } catch (error: any) {
      setError(error.message || 'Error al subir el banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleEditBanner = () => {
    setEditBannerUrl(torneo?.banner_url || '');
    setBannerPosition({ x: 50, y: 50 }); // Posición por defecto
    setEditingBanner(true);
  };

  const handleCancelEditBanner = () => {
    setEditingBanner(false);
    setEditBannerUrl('');
  };

  const handleBannerDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleBannerDragMove(e);
  };

  const handleBannerDragMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setBannerPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    });
  };

  const handleBannerDragEnd = () => {
    setIsDragging(false);
  };

  const handleSaveBanner = async () => {
    if (!torneo) return;
    
    try {
      console.log('🔍 Guardando banner del torneo...');
      console.log('🔍 ID del torneo:', torneo.id);
      console.log('🔍 URL del banner:', editBannerUrl);
      console.log('🔍 Datos a enviar:', { banner_url: editBannerUrl });
      
      setSavingTorneoName(true);
      await torneoService.update(torneo.id, { 
        banner_url: editBannerUrl,
        banner_position: bannerPosition
      });
      
      // Actualizar el estado local
      setTorneo({ ...torneo, banner_url: editBannerUrl, banner_position: bannerPosition });
      setEditingBanner(false);
      console.log('✅ Banner guardado exitosamente');
    } catch (error: any) {
      console.error('❌ Error al actualizar banner del torneo:', error);
      console.error('❌ Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      setError('Error al actualizar el banner del torneo');
    } finally {
      setSavingTorneoName(false);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !torneo) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'No se pudo cargar el torneo'}</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner del Torneo - Ancho completo */}
      {torneo.banner_url ? (
        <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
          <img 
            src={torneo.banner_url} 
            alt={`Banner de ${torneo.nombre}`}
            className="w-full h-full object-cover"
            style={{
              objectPosition: `${bannerPosition.x}% ${bannerPosition.y}%`
            }}
          />
          {/* Overlay gradiente para mejor legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Contenido del banner */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full px-4 sm:px-6 lg:px-8 pb-6">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigate('/')}
                      className="p-2 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/30 rounded-full backdrop-blur-sm"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center space-x-2">
                      {editingTorneoName ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editTorneoName}
                            onChange={(e) => setEditTorneoName(e.target.value)}
                            className="text-3xl font-bold text-white bg-transparent border-b-2 border-white/50 focus:outline-none focus:border-white placeholder-white/70"
                            placeholder="Nombre del torneo"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveTorneoName}
                            disabled={savingTorneoName}
                            className="p-1 text-white/80 hover:text-white transition-colors"
                          >
                            {savingTorneoName ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={handleCancelEditTorneoName}
                            className="p-1 text-white/80 hover:text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <h1 className="text-3xl font-bold text-white drop-shadow-lg">{torneo.nombre}</h1>
                          <button
                            onClick={handleEditTorneoName}
                            className="p-1 text-white/80 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Botones de acción del banner */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleEditBanner}
                      className="p-2 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/30 rounded-full backdrop-blur-sm"
                      title="Editar banner"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-64 md:h-80 lg:h-96 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-medium text-primary-900 mb-2">Agregar Banner al Torneo</h3>
            <p className="text-primary-700 mb-4">Personaliza tu torneo con una imagen de fondo impactante</p>
            <button
              onClick={handleEditBanner}
              className="inline-flex items-center px-6 py-3 border border-primary-300 rounded-lg shadow-sm text-sm font-medium text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              <Upload className="w-4 h-4 mr-2" />
              Subir Banner
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Información del torneo */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {torneo.estado === 'finalizado' && torneo.campeon && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg">
                <Trophy className="w-6 h-6 text-yellow-800" />
                <span className="text-lg font-bold text-yellow-900">🏆 {torneo.campeon.nombre}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTipoColor(torneo.tipo)}`}>
              {torneo.tipo === 'eliminacion' ? 'Eliminación Directa' : 'Liga'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              torneo.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
              torneo.estado === 'en_curso' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {torneo.estado === 'pendiente' ? 'Pendiente' :
               torneo.estado === 'en_curso' ? 'En Progreso' : 'Finalizado'}
            </span>
          </div>
        </div>

      {/* Tabla de Posiciones para Liga */}
      {torneo.tipo === 'liga' && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tabla de Posiciones</h2>
          <TablaPosiciones partidos={partidos} equipos={torneo.equipos || []} />
        </div>
      )}

      {/* Cuadro de Eliminación */}
      {torneo.tipo === 'eliminacion' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cuadro de Eliminación</h2>
          <CuadroEliminacion 
            partidos={partidos} 
            equipos={torneo.equipos || []} 
            onUpdateResult={handleUpdateResult}
            disableReload={false}
            campeon={torneo.campeon}
          />
        </div>
      )}

      {/* Calendario de Partidos para Liga */}
      {torneo.tipo === 'liga' && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Calendario de Partidos</h2>
          <CalendarioLiga 
            partidos={partidos} 
            equipos={torneo.equipos || []} 
            onUpdateResult={handleUpdateResult}
          />
        </div>
      )}

      {/* Lista de Equipos */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Equipos Participantes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {torneo.equipos?.map((equipo) => (
            <div key={equipo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg overflow-hidden">
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
                  <span className={`text-white font-bold text-sm ${equipo.escudo_url ? 'hidden' : ''}`}>
                    {equipo.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">{equipo.nombre}</span>
                </div>
              </div>
              
              {/* Botón de edición unificado */}
              <button
                onClick={() => handleEditEquipo(equipo)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Editar equipo"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-end space-x-3 mt-8">
         <button
           onClick={() => navigate('/')}
           className="btn btn-secondary"
         >
           Volver al Dashboard
         </button>
       </div>

      {/* Modal de Edición de Equipo */}
      {showEquipoModal && editingEquipoData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Editar Equipo
              </h2>
              <button
                onClick={handleCancelEditEquipo}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveEquipo(); }} className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Equipo *
                </label>
                <input
                  id="nombre"
                  type="text"
                  required
                  value={editEquipoName}
                  onChange={(e) => setEditEquipoName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="Ej: Real Madrid"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escudo del Equipo
                </label>
                
                {/* Preview de imagen */}
                {editEquipoEscudoUrl && (
                  <div className="mb-3">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img 
                        src={editEquipoEscudoUrl} 
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
                      onChange={handleEquipoImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  
                  {editEquipoEscudoUrl && (
                    <button
                      type="button"
                      onClick={() => setEditEquipoEscudoUrl('')}
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
                  onClick={handleCancelEditEquipo}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEquipo || uploadingImage}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {savingEquipo ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edición de Banner */}
      {editingBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Editar Banner del Torneo
              </h2>
              <button
                onClick={handleCancelEditBanner}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner del Torneo
                </label>
                
                {/* Preview de banner con arrastre */}
                {editBannerUrl && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arrastra la imagen para ajustar la posición
                    </label>
                    <div 
                      className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden cursor-move"
                      onMouseDown={handleBannerDragStart}
                      onMouseMove={handleBannerDragMove}
                      onMouseUp={handleBannerDragEnd}
                      onMouseLeave={handleBannerDragEnd}
                    >
                      <img 
                        src={editBannerUrl} 
                        alt="Preview del banner"
                        className="w-full h-full object-cover select-none pointer-events-none"
                        style={{
                          objectPosition: `${bannerPosition.x}% ${bannerPosition.y}%`
                        }}
                      />
                      
                      {/* Indicador de posición */}
                      <div 
                        className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{
                          left: `${bannerPosition.x}%`,
                          top: `${bannerPosition.y}%`
                        }}
                      />
                    </div>
                  </div>
                )}
                


                {/* Upload de banner */}
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingBanner ? 'Subiendo...' : 'Subir Banner'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                      disabled={uploadingBanner}
                    />
                  </label>
                  
                  {editBannerUrl && (
                    <button
                      type="button"
                      onClick={() => setEditBannerUrl('')}
                      className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <p className="mt-1 text-xs text-gray-500">
                  Formatos: JPG, PNG, GIF. Máximo 10MB. Recomendado: 1200x400px.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={handleCancelEditBanner}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveBanner}
                  disabled={savingTorneoName || uploadingBanner}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {savingTorneoName ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default DetalleTorneo;
