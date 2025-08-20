import React, { useState, useEffect } from 'react';
import { Trophy, Award, Edit2, Save, X, Plus, Minus } from 'lucide-react';
import type { Partido, Equipo } from '../types';

interface CuadroEliminacionProps {
  partidos: Partido[];
  equipos: Equipo[];
  onUpdateResult?: (partidoId: number, golesLocal: number, golesVisitante: number, isEditing?: boolean) => Promise<void>;
  disableReload?: boolean; // Prop para evitar recarga de datos
}

interface Ronda {
  numero: number;
  partidos: Partido[];
  titulo: string;
}

const CuadroEliminacion: React.FC<CuadroEliminacionProps> = ({ partidos, equipos, onUpdateResult, disableReload = false }) => {
  const [editingPartido, setEditingPartido] = useState<number | null>(null);
  const [editGolesLocal, setEditGolesLocal] = useState<number>(0);
  const [editGolesVisitante, setEditGolesVisitante] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [localPartidos, setLocalPartidos] = useState<Partido[]>(partidos);
  
  // Actualizar partidos locales cuando cambien los props (solo si no está deshabilitado el reload)
  useEffect(() => {
    if (!disableReload) {
      setLocalPartidos(partidos);
    }
  }, [partidos, disableReload]);

  // Calcular el número total de rondas basado en la cantidad de equipos
  const totalEquipos = equipos.length;
  const totalRondas = Math.ceil(Math.log2(totalEquipos));

  // Organizar partidos por rondas
  const organizarRondas = (): Ronda[] => {
    const rondas: Ronda[] = [];
    const partidosPorRonda = new Map<number, Partido[]>();
    
    // Agrupar partidos por ronda
    localPartidos.forEach(partido => {
      const ronda = partido.ronda || 1;
      if (!partidosPorRonda.has(ronda)) {
        partidosPorRonda.set(ronda, []);
      }
      partidosPorRonda.get(ronda)!.push(partido);
    });
    
    // Crear objetos de ronda ordenados usando el totalRondas calculado externamente
    for (let i = 1; i <= totalRondas; i++) {
      const partidosRonda = partidosPorRonda.get(i) || [];
      let titulo = '';
      
      if (i === 1) {
        titulo = 'Primera Ronda';
      } else if (i === totalRondas) {
        titulo = 'Final';
      } else if (i === totalRondas - 1) {
        titulo = 'Semifinales';
      } else if (i === totalRondas - 2) {
        titulo = 'Cuartos de Final';
      } else {
        titulo = `Ronda ${i}`;
      }
      
      // Calcular cuántos partidos debería tener esta ronda
      const partidosEsperados = Math.pow(2, totalRondas - i);
      
      // Crear partidos vacíos si no existen
      const partidosCompletos = [...partidosRonda];
      while (partidosCompletos.length < partidosEsperados) {
        partidosCompletos.push({
          id: -(partidosCompletos.length + 1), // ID negativo único para partidos vacíos
          torneoId: 0,
          equipoLocalId: 0,
          equipoVisitanteId: 0,
          fecha: new Date().toISOString(),
          estado: 'pendiente',
          ronda: i,
          equipoLocal: undefined,
          equipoVisitante: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Partido);
      }
      
      rondas.push({
        numero: i,
        partidos: partidosCompletos.sort((a, b) => a.id - b.id),
        titulo
      });
    }
    
    return rondas;
  };
  
  const rondas = organizarRondas();

  const getGanador = (partido: Partido): Equipo | null => {
    if (partido.estado !== 'jugado' || 
        partido.golesLocal === null || partido.golesLocal === undefined || 
        partido.golesVisitante === null || partido.golesVisitante === undefined) {
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
    if (partido.estado !== 'jugado' || 
        partido.golesLocal === null || partido.golesLocal === undefined || 
        partido.golesVisitante === null || partido.golesVisitante === undefined) {
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
    // No permitir editar partidos vacíos
    if (partido.id < 0) {
      return;
    }
    
    setEditingPartido(partido.id);
    // Si el partido ya tiene goles, usar esos valores, sino usar 0
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
      console.log('💾 Guardando resultado para partido:', partidoId);
      
      // Determinar si estamos editando un partido ya jugado
      const partido = localPartidos.find(p => p.id === partidoId);
      const isEditing = partido?.estado === 'jugado';
      
      // Actualizar el estado local inmediatamente para evitar parpadeo
      const partidoIndex = localPartidos.findIndex(p => p.id === partidoId);
      if (partidoIndex !== -1) {
        const partidosActualizados = [...localPartidos];
        partidosActualizados[partidoIndex] = {
          ...partidosActualizados[partidoIndex],
          golesLocal: editGolesLocal,
          golesVisitante: editGolesVisitante,
          estado: 'jugado'
        };
        setLocalPartidos(partidosActualizados);
      }
      
      // Llamar al callback del padre pero no esperar a que recargue los datos
      onUpdateResult(partidoId, editGolesLocal, editGolesVisitante, isEditing).catch(error => {
        console.error('Error en el backend:', error);
        // Si hay error, revertir el cambio local
        const partidoIndex = localPartidos.findIndex(p => p.id === partidoId);
        if (partidoIndex !== -1) {
          const partidosActualizados = [...localPartidos];
          partidosActualizados[partidoIndex] = {
            ...partidosActualizados[partidoIndex],
            golesLocal: partido?.golesLocal || 0,
            golesVisitante: partido?.golesVisitante || 0,
            estado: partido?.estado || 'pendiente'
          };
          setLocalPartidos(partidosActualizados);
        }
      });
      
      setEditingPartido(null);
      console.log('✅ Resultado guardado exitosamente');
    } catch (error) {
      console.error('❌ Error al guardar resultado:', error);
      // Mostrar error al usuario sin recargar la página
      console.error('Error al guardar el resultado. Por favor, inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const renderPartido = (partido: Partido, numeroGlobal: number) => {
    const ganador = getGanador(partido);
    const perdedor = getPerdedor(partido);
    const jugado = partido.estado === 'jugado';
    const isEditing = editingPartido === partido.id;
    // Un partido está vacío si tiene ID negativo O si no tiene equipos asignados
    const esPartidoVacio = partido.id < 0 || !partido.equipoLocal || !partido.equipoVisitante;
    
    return (
      <div key={partido.id} className="relative">
        {/* Título del partido con botón */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-700">
            Partido {numeroGlobal + 1}
          </div>
          
          {/* Botón de acción a la derecha */}
          {!esPartidoVacio && (
            <div className="flex space-x-1">
              {isEditing ? (
                <>
                  <button
                    onClick={() => handleSave(partido.id)}
                    disabled={saving}
                    className="w-6 h-6 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                    title={saving ? 'Guardando...' : 'Guardar'}
                  >
                    {saving ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="w-6 h-6 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center"
                    title="Cancelar"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleEdit(partido)}
                  className="w-6 h-6 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
                  title={jugado ? 'Editar' : 'Registrar'}
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Tarjeta del partido */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg w-64">
          {/* Equipo Local */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <span className="text-sm text-gray-700 truncate flex-1">
              {esPartidoVacio ? 'TBD' : partido.equipoLocal?.nombre || 'TBD'}
            </span>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditGolesLocal(Math.max(0, editGolesLocal - 1))}
                    className="w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3 text-gray-600" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={editGolesLocal}
                    onChange={(e) => setEditGolesLocal(parseInt(e.target.value) || 0)}
                    className="w-8 h-6 text-center border border-gray-300 rounded text-xs bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setEditGolesLocal(editGolesLocal + 1)}
                    className="w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              ) : (
                <input
                  type="number"
                  min="0"
                  value={partido.golesLocal || 0}
                  readOnly
                  className="w-8 h-6 text-center border border-gray-300 rounded text-xs bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              )}
            </div>
          </div>
          
          {/* Equipo Visitante */}
          <div className="flex items-center justify-between p-3">
            <span className="text-sm text-gray-700 truncate flex-1">
              {esPartidoVacio ? 'TBD' : partido.equipoVisitante?.nombre || 'TBD'}
            </span>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditGolesVisitante(Math.max(0, editGolesVisitante - 1))}
                    className="w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3 text-gray-600" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={editGolesVisitante}
                    onChange={(e) => setEditGolesVisitante(parseInt(e.target.value) || 0)}
                    className="w-8 h-6 text-center border border-gray-300 rounded text-xs bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setEditGolesVisitante(editGolesVisitante + 1)}
                    className="w-5 h-5 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              ) : (
                <input
                  type="number"
                  min="0"
                  value={partido.golesVisitante || 0}
                  readOnly
                  className="w-8 h-6 text-center border border-gray-300 rounded text-xs bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              )}
            </div>
          </div>
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
    <div className="w-full overflow-x-auto bg-gray-50 p-8">
      <div className="flex space-x-20 min-w-max relative">
        {rondas.map((ronda, rondaIndex) => (
          <div key={ronda.numero} className="flex flex-col items-center">
            {/* Título de la ronda */}
            <div className="mb-8 text-center">
              <h3 className="text-lg font-medium text-gray-700">{ronda.titulo}</h3>
            </div>
            
            {/* Partidos de la ronda */}
            <div className="relative flex flex-col">
              {ronda.partidos.map((partido, partidoIndex) => {
                // Calcular el número global del partido
                let numeroGlobal = 1; // Empezar en 1
                
                // Sumar todos los partidos de las rondas anteriores
                for (let i = 0; i < rondaIndex; i++) {
                  numeroGlobal += rondas[i].partidos.length;
                }
                
                // Sumar los partidos de la ronda actual hasta este índice
                numeroGlobal += partidoIndex;
                
                // Calcular la posición vertical
                let marginTop = '0px';
                
                if (rondaIndex === 0) {
                  // Primera ronda: espaciado uniforme
                  marginTop = partidoIndex === 0 ? '0px' : '30px';
                } else {
                  // Rondas siguientes: posicionar entre los partidos de la ronda anterior
                  const partidosRondaAnterior = rondas[rondaIndex - 1].partidos.length;
                  
                  // Calcular qué partidos de la ronda anterior alimentan a este partido
                  const partidoAnterior1 = partidoIndex * 2; // Primer partido de la ronda anterior
                  const partidoAnterior2 = partidoIndex * 2 + 1; // Segundo partido de la ronda anterior
                  
                  // Posiciones de los partidos de la ronda anterior
                  const posicionPartido1 = partidoAnterior1 * 70;
                  const posicionPartido2 = partidoAnterior2 * 70;
                  
                  // Posición centrada entre los dos partidos
                  const posicionCentrada = (posicionPartido1 + posicionPartido2) / 2;
                  
                  // Debug: mostrar información del partido 9
                  if (numeroGlobal === 9) {
                    console.log(`Partido 9 - Ronda: ${rondaIndex}, Índice: ${partidoIndex}`);
                    console.log(`Partidos anteriores: ${partidoAnterior1} y ${partidoAnterior2}`);
                    console.log(`Posiciones: ${posicionPartido1}px y ${posicionPartido2}px`);
                    console.log(`Posición centrada: ${posicionCentrada}px`);
                  }
                  
                  // Asegurar que los partidos de la segunda columna estén correctamente posicionados
                  if (numeroGlobal === 9) {
                    marginTop = '80px'; // Entre partido 1 (0px) y partido 2 (30px)
                  } else if (numeroGlobal === 10) {
                    marginTop = '190px'; // Entre partido 3 (60px) y partido 4 (90px)
                  } else if (numeroGlobal === 11) {
                    marginTop = '190px'; // Entre partido 5 (120px) y partido 6 (150px)
                  } else if (numeroGlobal === 12) {
                    marginTop = '190px'; // Entre partido 7 (180px) y partido 8 (210px)
                  } else if (numeroGlobal === 13) {
                    marginTop = '240px'; // Entre partido 9 (80px) y partido 10 (190px) = (80+190)/2
                  } else if (numeroGlobal === 14) {
                    marginTop = '500px'; // Entre partido 11 (190px) y partido 12 (190px) = 190px
                  } else if (numeroGlobal === 15) {
                    marginTop = '520px'; // Entre partido 13 (135px) y partido 14 (190px) = (135+190)/2
                  } else {
                    marginTop = `${posicionCentrada}px`;
                  }
                }
                
                return (
                  <div 
                    key={partido.id} 
                    className="relative"
                    style={{ 
                      marginTop: marginTop
                    }}
                  >
                    {renderPartido(partido, numeroGlobal - 1)} {/* Pasar el índice global */}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        

      </div>
    </div>
  );
};

export default CuadroEliminacion;
