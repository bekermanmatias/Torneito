import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { torneoService, partidoService } from '../services/api';
import type { Torneo, Partido, Equipo } from '../types';
import CuadroEliminacion from '../components/CuadroEliminacion';

const DetalleTorneo: React.FC = () => {
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
            <h1 className="text-3xl font-bold text-gray-900">{torneo.nombre}</h1>
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
            disableReload={false}
            campeon={torneo.campeon}
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
