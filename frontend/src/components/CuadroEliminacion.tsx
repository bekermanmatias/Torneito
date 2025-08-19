import React, { useState } from 'react';
import { Trophy, Award, Edit2, Save, X } from 'lucide-react';
import type { Partido, Equipo } from '../types';

interface CuadroEliminacionProps {
  partidos: Partido[];
  equipos: Equipo[];
  onUpdateResult?: (partidoId: number, golesLocal: number, golesVisitante: number) => Promise<void>;
}

interface Ronda {
  numero: number;
  partidos: Partido[];
  titulo: string;
}

const CuadroEliminacion: React.FC<CuadroEliminacionProps> = ({ partidos, equipos, onUpdateResult }) => {
  const [editingPartido, setEditingPartido] = useState<number | null>(null);
  const [editGolesLocal, setEditGolesLocal] = useState<number>(0);
  const [editGolesVisitante, setEditGolesVisitante] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  // Organizar partidos por rondas
  const organizarRondas = (): Ronda[] => {
    const rondas: Ronda[] = [];
    const partidosPorRonda = new Map<number, Partido[]>();
    
    // Agrupar partidos por ronda
    partidos.forEach(partido => {
      const ronda = partido.ronda || 1;
      if (!partidosPorRonda.has(ronda)) {
        partidosPorRonda.set(ronda, []);
      }
      partidosPorRonda.get(ronda)!.push(partido);
    });
    
    // Crear objetos de ronda ordenados
    const maxRonda = Math.max(...partidosPorRonda.keys());
    for (let i = 1; i <= maxRonda; i++) {
      const partidosRonda = partidosPorRonda.get(i) || [];
      let titulo = '';
      
      if (i === 1) {
        titulo = 'Primera Ronda';
      } else if (i === 2) {
        titulo = 'Semifinales';
      } else if (i === 3) {
        titulo = 'Final';
      } else {
        titulo = `Ronda ${i}`;
      }
      
      rondas.push({
        numero: i,
        partidos: partidosRonda.sort((a, b) => a.id - b.id),
        titulo
      });
    }
    
    return rondas;
  };

  const rondas = organizarRondas();

  const getGanador = (partido: Partido): Equipo | null => {
    if (partido.estado !== 'jugado' || partido.golesLocal === undefined || partido.golesVisitante === undefined) {
      return null;
    }
    
    if (partido.golesLocal > partido.golesVisitante) {
      return partido.equipoLocal || null;
    } else if (partido.golesVisitante > partido.golesLocal) {
      return partido.equipoVisitante || null;
    }
    
    return null; // Empate
  };

  const getPerdedor = (partido: Partido): Equipo | null => {
    if (partido.estado !== 'jugado' || partido.golesLocal === undefined || partido.golesVisitante === undefined) {
      return null;
    }
    
    if (partido.golesLocal > partido.golesVisitante) {
      return partido.equipoVisitante || null;
    } else if (partido.golesVisitante > partido.golesLocal) {
      return partido.equipoLocal || null;
    }
    
    return null; // Empate
  };

  const handleEdit = (partido: Partido) => {
    setEditingPartido(partido.id);
    setEditGolesLocal(partido.golesLocal || 0);
    setEditGolesVisitante(partido.golesVisitante || 0);
  };

  const handleCancel = () => {
    setEditingPartido(null);
    setEditGolesLocal(0);
    setEditGolesVisitante(0);
  };

  const handleSave = async (partidoId: number) => {
    if (!onUpdateResult) return;
    
    try {
      setSaving(true);
      await onUpdateResult(partidoId, editGolesLocal, editGolesVisitante);
      setEditingPartido(null);
    } catch (error) {
      console.error('Error al guardar resultado:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderPartido = (partido: Partido, esFinal: boolean = false) => {
    const ganador = getGanador(partido);
    const perdedor = getPerdedor(partido);
    const jugado = partido.estado === 'jugado';
    const isEditing = editingPartido === partido.id;
    
    return (
      <div key={partido.id} className={`bg-white border-2 rounded-lg p-4 min-w-64 ${
        jugado ? 'border-green-200 shadow-md' : 'border-gray-200'
      } ${esFinal ? 'border-4 border-yellow-300 shadow-lg' : ''}`}>
        <div className="flex items-center justify-between">
          {/* Equipo Local */}
          <div className={`flex-1 text-right pr-3 ${
            ganador === partido.equipoLocal ? 'font-bold text-green-600' : 
            perdedor === partido.equipoLocal ? 'text-red-500' : ''
          }`}>
            <div className="flex items-center justify-end">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold text-sm">
                  {partido.equipoLocal?.nombre.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium truncate max-w-28">
                {partido.equipoLocal?.nombre || 'TBD'}
              </span>
            </div>
          </div>
          
          {/* Resultado */}
          <div className="flex flex-col items-center px-4">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  value={editGolesLocal}
                  onChange={(e) => setEditGolesLocal(parseInt(e.target.value) || 0)}
                  className="w-12 h-8 text-center border border-gray-300 rounded text-sm font-bold"
                />
                <span className="text-lg font-bold text-gray-900">-</span>
                <input
                  type="number"
                  min="0"
                  value={editGolesVisitante}
                  onChange={(e) => setEditGolesVisitante(parseInt(e.target.value) || 0)}
                  className="w-12 h-8 text-center border border-gray-300 rounded text-sm font-bold"
                />
              </div>
            ) : (
              <div className="text-xl font-bold text-gray-900">
                {jugado ? (
                  `${partido.golesLocal || 0} - ${partido.golesVisitante || 0}`
                ) : (
                  'vs'
                )}
              </div>
            )}
            
            <div className={`text-xs px-3 py-1 rounded-full mt-2 ${
              jugado 
                ? 'bg-green-100 text-green-600' 
                : 'bg-yellow-100 text-yellow-600'
            }`}>
              {jugado ? 'Finalizado' : 'Pendiente'}
            </div>
            
            {esFinal && ganador && (
              <div className="flex items-center mt-2 text-yellow-600">
                <Trophy className="w-4 h-4 mr-1" />
                <span className="text-xs font-bold">CAMPEÓN</span>
              </div>
            )}
          </div>
          
          {/* Equipo Visitante */}
          <div className={`flex-1 text-left pl-3 ${
            ganador === partido.equipoVisitante ? 'font-bold text-green-600' : 
            perdedor === partido.equipoVisitante ? 'text-red-500' : ''
          }`}>
            <div className="flex items-center">
              <span className="text-sm font-medium truncate max-w-28">
                {partido.equipoVisitante?.nombre || 'TBD'}
              </span>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center ml-3">
                <span className="text-red-600 font-bold text-sm">
                  {partido.equipoVisitante?.nombre.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="flex justify-center mt-3 space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => handleSave(partido.id)}
                disabled={saving}
                className="flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="w-3 h-3 mr-1" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 disabled:opacity-50"
              >
                <X className="w-3 h-3 mr-1" />
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => handleEdit(partido)}
              className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              <Edit2 className="w-3 h-3 mr-1" />
              {jugado ? 'Editar' : 'Registrar'}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (rondas.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No hay partidos programados aún</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-12 min-w-max p-6">
        {rondas.map((ronda, index) => (
          <div key={ronda.numero} className="flex flex-col items-center">
            {/* Título de la ronda */}
            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold text-gray-900">{ronda.titulo}</h3>
              <p className="text-sm text-gray-500">{ronda.partidos.length} partido{ronda.partidos.length !== 1 ? 's' : ''}</p>
            </div>
            
            {/* Partidos de la ronda */}
            <div className="relative space-y-6">
              {ronda.partidos.map((partido, partidoIndex) => (
                <div key={partido.id} className="relative">
                  {renderPartido(partido, ronda.numero === Math.max(...rondas.map(r => r.numero)))}
                  
                  {/* Líneas de conexión entre rondas */}
                  {index < rondas.length - 1 && (
                    <div className="absolute top-1/2 right-0 w-12 h-0.5 bg-gray-300 transform translate-x-full"></div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Información adicional de la ronda */}
            <div className="mt-6 text-center">
              <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                {ronda.partidos.filter(p => p.estado === 'jugado').length} de {ronda.partidos.length} jugados
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CuadroEliminacion;
