import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  ArrowLeft,
  Users,
  Calendar,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { torneoService, partidoService } from '../services/api';
import type { Torneo, Partido, Equipo } from '../types';
import CuadroEliminacion from '../components/CuadroEliminacion';

const DetalleTorneo: React.FC = () => {
  console.log('🚀 DetalleTorneo - Componente montado');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingResult, setUpdatingResult] = useState(false);

  useEffect(() => {
    if (id) {
      loadTorneo();
    }
  }, [id]);

  const loadTorneo = async () => {
    try {
      console.log('🔍 DetalleTorneo - Cargando torneo con ID:', id);
      setLoading(true);
      
      const [torneoRes, partidosRes] = await Promise.all([
        torneoService.getById(parseInt(id!)),
        partidoService.getByTorneo(parseInt(id!))
      ]);
      
      console.log('✅ DetalleTorneo - Torneo cargado:', torneoRes.data);
      console.log('✅ DetalleTorneo - Partidos cargados:', partidosRes.data);
      console.log('🔍 DetalleTorneo - Estructura del torneo:', JSON.stringify(torneoRes.data, null, 2));
      
      setTorneo(torneoRes.data.torneo);
      setPartidos(partidosRes.data.partidos || []);
    } catch (error: any) {
      console.error('❌ DetalleTorneo - Error loading torneo:', error);
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
      
      console.log('🔄 Actualizando resultado:', { partidoId, golesLocal, golesVisitante, isEditing });
      
      // Si estamos editando un partido ya jugado, usar actualizarResultado
      if (isEditing) {
        await partidoService.updateResult(partidoId, { golesLocal, golesVisitante });
      } else {
        // Si es un partido nuevo, usar registerResult
        await partidoService.registerResult(partidoId, { golesLocal, golesVisitante });
      }
      
      console.log('✅ Resultado actualizado exitosamente');
      
      // No recargar los datos para evitar parpadeo
      // Los datos se actualizarán localmente en el componente CuadroEliminacion
      
      console.log('✅ Operación completada sin recarga');
      
    } catch (error: any) {
      console.error('❌ Error al actualizar resultado:', error);
      throw error;
    } finally {
      setUpdatingResult(false);
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
              <h1 className="text-3xl font-bold text-gray-900">{torneo.nombre}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTipoColor(torneo.tipo)}`}>
                  {torneo.tipo === 'eliminacion' ? 'Eliminación Directa' : 'Liga'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getEstadoColor(torneo.estado)}`}>
                  {getEstadoIcon(torneo.estado)}
                  <span className="capitalize">{torneo.estado ? torneo.estado.replace('_', ' ') : 'Desconocido'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Equipos</p>
              <p className="text-2xl font-bold text-gray-900">{torneo.equipos?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Partidos</p>
              <p className="text-2xl font-bold text-gray-900">{partidos.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Trophy className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Jugados</p>
              <p className="text-2xl font-bold text-gray-900">
                {partidos.filter(p => p.estado === 'jugado').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Equipos participantes */}
      {torneo.equipos && torneo.equipos.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Equipos Participantes</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {torneo.equipos.map((equipo) => (
              <div key={equipo.id} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary-600 font-bold text-lg">
                    {equipo.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{equipo.nombre}</p>
              </div>
            ))}
          </div>
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
            disableReload={true}
          />
        </div>
      )}

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
