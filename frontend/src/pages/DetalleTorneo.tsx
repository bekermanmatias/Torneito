import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, XCircle, AlertCircle, Play, CheckCircle, Edit2, Save, X } from 'lucide-react';
import { torneoService, partidoService, equipoService } from '../services/api';
import type { Torneo, Partido, Equipo } from '../types';
import CuadroEliminacion from '../components/CuadroEliminacion';
import TablaPosiciones from '../components/TablaPosiciones';
import CalendarioLiga from '../components/CalendarioLiga';

const DetalleTorneo: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingResult, setUpdatingResult] = useState(false);
  const [editingTorneoName, setEditingTorneoName] = useState(false);
  const [editTorneoName, setEditTorneoName] = useState('');
  const [savingTorneoName, setSavingTorneoName] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState<number | null>(null);
  const [editEquipoName, setEditEquipoName] = useState('');
  const [savingEquipo, setSavingEquipo] = useState(false);

  useEffect(() => {
    if (id) {
      loadTorneo();
    }
  }, [id]);

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

  const handleEditEquipoName = (equipo: Equipo) => {
    setEditEquipoName(equipo.nombre);
    setEditingEquipo(equipo.id);
  };

  const handleCancelEditEquipo = () => {
    setEditingEquipo(null);
    setEditEquipoName('');
  };

  const handleSaveEquipoName = async () => {
    if (!editingEquipo || !editEquipoName.trim()) return;
    
    try {
      setSavingEquipo(true);
      await equipoService.update(editingEquipo, { nombre: editEquipoName.trim() });
      
      // Actualizar el estado local
      if (torneo) {
        const equiposActualizados = torneo.equipos?.map(equipo => 
          equipo.id === editingEquipo 
            ? { ...equipo, nombre: editEquipoName.trim() }
            : equipo
        );
        setTorneo({ ...torneo, equipos: equiposActualizados });
      }
      setEditingEquipo(null);
    } catch (error: any) {
      console.error('Error al actualizar nombre del equipo:', error);
      setError('Error al actualizar el nombre del equipo');
    } finally {
      setSavingEquipo(false);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
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
                    className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-primary-500 focus:outline-none focus:border-primary-600"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTorneoName}
                    disabled={savingTorneoName}
                    className="p-1 text-green-600 hover:text-green-700 transition-colors"
                  >
                    {savingTorneoName ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={handleCancelEditTorneoName}
                    className="p-1 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-bold text-gray-900">{torneo.nombre}</h1>
                  <button
                    onClick={handleEditTorneoName}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {torneo.estado === 'finalizado' && torneo.campeon && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg">
                <Trophy className="w-6 h-6 text-yellow-800" />
                <span className="text-lg font-bold text-yellow-900">{torneo.campeon.nombre}</span>
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {equipo.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  {editingEquipo === equipo.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editEquipoName}
                        onChange={(e) => setEditEquipoName(e.target.value)}
                        className="text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-primary-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEquipoName}
                        disabled={savingEquipo}
                        className="p-1 text-green-600 hover:text-green-700 transition-colors"
                      >
                        {savingEquipo ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                        ) : (
                          <Save className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={handleCancelEditEquipo}
                        className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{equipo.nombre}</span>
                      <button
                        onClick={() => handleEditEquipoName(equipo)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
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
    </div>
  );
};

export default DetalleTorneo;
