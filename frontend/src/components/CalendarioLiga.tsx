import React, { useState } from 'react';
import { Edit2, Save, X, Plus, Minus, Calendar, Trophy } from 'lucide-react';
import type { Partido, Equipo } from '../types';

interface CalendarioLigaProps {
  partidos: Partido[];
  equipos: Equipo[];
  onUpdateResult?: (partidoId: number, golesLocal: number, golesVisitante: number, isEditing?: boolean) => Promise<void>;
}

const CalendarioLiga: React.FC<CalendarioLigaProps> = ({ partidos, equipos, onUpdateResult }) => {
  const [editingPartido, setEditingPartido] = useState<number | null>(null);
  const [editGolesLocal, setEditGolesLocal] = useState<number>(0);
  const [editGolesVisitante, setEditGolesVisitante] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const handleEdit = (partido: Partido) => {
    setEditingPartido(partido.id);
    setEditGolesLocal(partido.golesLocal !== null && partido.golesLocal !== undefined ? partido.golesLocal : 0);
    setEditGolesVisitante(partido.golesVisitante !== null && partido.golesVisitante !== undefined ? partido.golesVisitante : 0);
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
      
      const partido = partidos.find(p => p.id === partidoId);
      const isEditing = partido?.estado === 'jugado';
      
      await onUpdateResult(partidoId, editGolesLocal, editGolesVisitante, isEditing);
      
      setEditingPartido(null);
    } catch (error) {
      console.error('Error al guardar resultado:', error);
    } finally {
      setSaving(false);
    }
  };

  const getResultadoColor = (partido: Partido) => {
    if (partido.estado !== 'jugado' || partido.golesLocal === null || partido.golesLocal === undefined || partido.golesVisitante === null || partido.golesVisitante === undefined) {
      return 'text-gray-400';
    }
    
    return 'text-gray-900 font-bold';
  };

  const getResultadoText = (partido: Partido) => {
    if (partido.estado !== 'jugado' || partido.golesLocal === null || partido.golesLocal === undefined || partido.golesVisitante === null || partido.golesVisitante === undefined) {
      return 'vs';
    }
    
    return `${partido.golesLocal} - ${partido.golesVisitante}`;
  };

  const getResultadoBadge = (partido: Partido) => {
    if (partido.estado !== 'jugado' || partido.golesLocal === null || partido.golesLocal === undefined || partido.golesVisitante === null || partido.golesVisitante === undefined) {
      return (
        <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
          Pendiente
        </div>
      );
    }
    
    return (
      <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
        Jugado
      </div>
    );
  };

  const partidosOrdenados = [...partidos].sort((a, b) => {
    // Ordenar por ID para mantener consistencia
    return a.id - b.id;
  });

  const partidosJugados = partidos.filter(p => p.estado === 'jugado').length;
  const totalPartidos = partidos.length;

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <div className="text-lg font-bold text-blue-900">Calendario de Partidos</div>
              <div className="text-sm text-blue-700">
                {partidosJugados} de {totalPartidos} partidos jugados
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-900">{Math.round((partidosJugados / totalPartidos) * 100)}%</div>
            <div className="text-sm text-blue-700">Completado</div>
          </div>
        </div>
      </div>

      {/* Lista de partidos */}
      <div className="space-y-4">
        {partidosOrdenados.map((partido, index) => {
          const isEditing = editingPartido === partido.id;
          const jugado = partido.estado === 'jugado';
          
          return (
            <div 
              key={partido.id} 
              className={`border rounded-lg transition-all duration-200 ${
                jugado ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-md' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Header del partido */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Partido #{index + 1}</span>
                    {getResultadoBadge(partido)}
                  </div>

                </div>
              </div>

              {/* Contenido del partido */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  {/* Equipos y resultado */}
                  <div className="flex-1 flex items-center justify-center space-x-6">
                    {/* Equipo Local */}
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg overflow-hidden">
                        {partido.equipoLocal?.escudo_url ? (
                          <img 
                            src={partido.equipoLocal.escudo_url} 
                            alt={`Escudo de ${partido.equipoLocal.nombre}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <span className={`text-white font-bold text-lg ${partido.equipoLocal?.escudo_url ? 'hidden' : ''}`}>
                          {partido.equipoLocal?.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">
                          {partido.equipoLocal?.nombre}
                        </div>
                        <div className="text-xs text-gray-500">Local</div>
                      </div>
                    </div>

                    {/* Resultado */}
                    <div className="flex items-center space-x-3">
                      {isEditing ? (
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setEditGolesLocal(Math.max(0, editGolesLocal - 1))}
                              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={editGolesLocal}
                              onChange={(e) => setEditGolesLocal(parseInt(e.target.value) || 0)}
                              className="w-12 h-10 text-center border border-gray-300 rounded-lg text-lg font-bold bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              onClick={() => setEditGolesLocal(editGolesLocal + 1)}
                              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                          
                          <span className="text-2xl font-bold text-gray-500">-</span>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setEditGolesVisitante(Math.max(0, editGolesVisitante - 1))}
                              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={editGolesVisitante}
                              onChange={(e) => setEditGolesVisitante(parseInt(e.target.value) || 0)}
                              className="w-12 h-10 text-center border border-gray-300 rounded-lg text-lg font-bold bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              onClick={() => setEditGolesVisitante(editGolesVisitante + 1)}
                              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${getResultadoColor(partido)}`}>
                            {getResultadoText(partido)}
                          </div>

                        </div>
                      )}
                    </div>

                    {/* Equipo Visitante */}
                    <div className="flex items-center space-x-3">
                      <div className="text-left">
                        <div className="text-sm font-bold text-gray-900">
                          {partido.equipoVisitante?.nombre}
                        </div>
                        <div className="text-xs text-gray-500">Visitante</div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg overflow-hidden">
                        {partido.equipoVisitante?.escudo_url ? (
                          <img 
                            src={partido.equipoVisitante.escudo_url} 
                            alt={`Escudo de ${partido.equipoVisitante.nombre}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <span className={`text-white font-bold text-lg ${partido.equipoVisitante?.escudo_url ? 'hidden' : ''}`}>
                          {partido.equipoVisitante?.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center space-x-2 ml-6">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSave(partido.id)}
                          disabled={saving}
                          className="w-10 h-10 text-green-600 hover:text-green-700 disabled:opacity-50 flex items-center justify-center transition-colors bg-green-50 hover:bg-green-100 rounded-full"
                          title={saving ? 'Guardando...' : 'Guardar'}
                        >
                          {saving ? (
                            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Save className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="w-10 h-10 text-gray-400 hover:text-gray-600 disabled:opacity-50 flex items-center justify-center transition-colors bg-gray-50 hover:bg-gray-100 rounded-full"
                          title="Cancelar"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit(partido)}
                        className="w-10 h-10 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full"
                        title={jugado ? 'Editar resultado' : 'Registrar resultado'}
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer con información adicional */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-600 text-center">
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Partidos jugados</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span>Partidos pendientes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span>Campeón se determina por puntos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarioLiga;
