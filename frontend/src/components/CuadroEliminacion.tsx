import React, { useState, useEffect } from 'react';
import { Trophy, Award, Edit2, Save, X, Plus, Minus, CheckCircle } from 'lucide-react';
import type { Partido, Equipo } from '../types';

interface CuadroEliminacionProps {
  partidos: Partido[];
  equipos: Equipo[];
  onUpdateResult?: (partidoId: number, golesLocal: number, golesVisitante: number, isEditing?: boolean) => Promise<void>;
  disableReload?: boolean; // Prop para evitar recarga de datos
  campeon?: Equipo; // Prop para el campeón del torneo
}

interface Ronda {
  numero: number;
  partidos: Partido[];
  titulo: string;
}

const CuadroEliminacion: React.FC<CuadroEliminacionProps> = ({ partidos, equipos, onUpdateResult, disableReload = false, campeon }) => {
  const [editingPartido, setEditingPartido] = useState<number | null>(null);
  const [editGolesLocal, setEditGolesLocal] = useState<number>(0);
  const [editGolesVisitante, setEditGolesVisitante] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [localPartidos, setLocalPartidos] = useState<Partido[]>(partidos);
  const [hoveredEquipo, setHoveredEquipo] = useState<{partidoId: number, equipoNombre: string} | null>(null);
  
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

  // Función para calcular el camino del equipo por nombre (hacia adelante y hacia atrás)
  const getCaminoEquipo = (partidoId: number, nombreEquipoEspecifico?: string): number[] => {
    const partido = localPartidos.find(p => p.id === partidoId);
    if (!partido) {
      return [partidoId];
    }
    
    // Usar el nombre específico si se proporciona, sino usar el equipo local como prioridad
    const nombreEquipo = nombreEquipoEspecifico || partido.equipoLocal?.nombre || partido.equipoVisitante?.nombre;
    if (!nombreEquipo) return [partidoId];
    
    const camino: number[] = [];
    
    // 1. Buscar hacia atrás: encontrar todos los partidos anteriores donde participó este equipo
    const buscarHaciaAtras = (nombreEquipo: string, rondaActual: number): number[] => {
      const partidosAnteriores: number[] = [];
      
      for (let ronda = rondaActual - 1; ronda >= 1; ronda--) {
        const partidosRonda = localPartidos.filter(p => p.ronda === ronda);
        
        for (const partidoAnterior of partidosRonda) {
          if (partidoAnterior.equipoLocal?.nombre === nombreEquipo || 
              partidoAnterior.equipoVisitante?.nombre === nombreEquipo) {
            partidosAnteriores.unshift(partidoAnterior.id);
            // Buscar recursivamente hacia atrás desde este partido
            const caminoAnterior = buscarHaciaAtras(nombreEquipo, ronda);
            partidosAnteriores.unshift(...caminoAnterior);
            break;
          }
        }
      }
      
      return partidosAnteriores;
    };
    
    // 2. Buscar hacia adelante: encontrar todos los partidos siguientes donde participa este equipo
    const buscarHaciaAdelante = (nombreEquipo: string, rondaActual: number): number[] => {
      const partidosSiguientes: number[] = [];
      
      for (let ronda = rondaActual + 1; ronda <= totalRondas; ronda++) {
        const partidosRonda = localPartidos.filter(p => p.ronda === ronda);
        
        for (const partidoSiguiente of partidosRonda) {
          if (partidoSiguiente.equipoLocal?.nombre === nombreEquipo || 
              partidoSiguiente.equipoVisitante?.nombre === nombreEquipo) {
            partidosSiguientes.push(partidoSiguiente.id);
            // Buscar recursivamente hacia adelante desde este partido
            const caminoSiguiente = buscarHaciaAdelante(nombreEquipo, ronda);
            partidosSiguientes.push(...caminoSiguiente);
            break;
          }
        }
      }
      
      return partidosSiguientes;
    };
    
    // 3. Construir el camino completo
    const partidosAnteriores = buscarHaciaAtras(nombreEquipo, partido.ronda || 1);
    const partidosSiguientes = buscarHaciaAdelante(nombreEquipo, partido.ronda || 1);
    
    camino.push(...partidosAnteriores, partidoId, ...partidosSiguientes);
    
    return camino;
  };

  const handleEdit = (partido: Partido) => {
    // No permitir editar partidos vacíos
    if (partido.id < 0) {
      return;
    }
    
    // No permitir editar partidos ya jugados
    if (partido.estado === 'jugado') {
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

  const renderPartido = (partido: Partido, numeroGlobal: number, rondaIndex: number) => {
    const ganador = getGanador(partido);
    const perdedor = getPerdedor(partido);
    const jugado = partido.estado === 'jugado';
    const isEditing = editingPartido === partido.id;
    // Un partido está vacío si tiene ID negativo O si no tiene equipos asignados
    const esPartidoVacio = partido.id < 0 || !partido.equipoLocal || !partido.equipoVisitante;
    
    // Calcular si este partido está en el camino del equipo hovered
    const caminoEquipo = hoveredEquipo ? getCaminoEquipo(hoveredEquipo.partidoId, hoveredEquipo.equipoNombre) : [];
    const estaEnCamino = caminoEquipo.includes(partido.id);
    const esPartidoHovered = hoveredEquipo?.partidoId === partido.id;
    
    // Verificar si este es el partido de la final y si hay un campeón
    const esFinal = partido.ronda === totalRondas;
    const esCampeonLocal = esFinal && campeon && partido.equipoLocal?.id === campeon.id;
    const esCampeonVisitante = esFinal && campeon && partido.equipoVisitante?.id === campeon.id;
    
          return (
        <div 
          key={partido.id} 
          className="relative"
        >
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
                    className="w-5 h-5 text-green-600 hover:text-green-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                    title={saving ? 'Guardando...' : 'Guardar'}
                  >
                    {saving ? (
                      <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="w-5 h-5 text-gray-400 hover:text-gray-600 disabled:opacity-50 flex items-center justify-center transition-colors"
                    title="Cancelar"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                // Solo mostrar botón de editar si el partido no está jugado
                !jugado ? (
                  <button
                    onClick={() => handleEdit(partido)}
                    className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
                    title="Registrar resultado"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                ) : (
                  <div className="w-5 h-5 flex items-center justify-center" title="No se puede editar un partido ya jugado">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  </div>
                )
              )}
            </div>
          )}
        </div>
        
        {/* Tarjeta del partido */}
        <div className={`border rounded-lg w-full min-w-[220px] transition-all duration-200 ${
          esPartidoVacio ? 'bg-gray-50 border-gray-200' : 
          esPartidoHovered ? 'bg-blue-50 border-blue-300 shadow-md' :
          estaEnCamino ? 'bg-green-50 border-green-300 shadow-sm' :
          'bg-white border-gray-200'
        }`}>
          {/* Equipo Local */}
          <div className={`flex items-center justify-between p-3 border-b border-gray-200 ${
            esCampeonLocal ? 'bg-gradient-to-r from-yellow-100 to-yellow-200' : ''
          }`}>
            <span 
              className={`text-sm truncate flex-1 cursor-pointer transition-colors ${
                esCampeonLocal 
                  ? 'text-yellow-800 font-bold hover:text-yellow-900' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
              onMouseEnter={() => setHoveredEquipo({partidoId: partido.id, equipoNombre: partido.equipoLocal?.nombre || ''})}
              onMouseLeave={() => setHoveredEquipo(null)}
            >
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
          <div className={`flex items-center justify-between p-3 ${
            esCampeonVisitante ? 'bg-gradient-to-r from-yellow-100 to-yellow-200' : ''
          }`}>
            <span 
              className={`text-sm truncate flex-1 cursor-pointer transition-colors ${
                esCampeonVisitante 
                  ? 'text-yellow-800 font-bold hover:text-yellow-900' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
              onMouseEnter={() => setHoveredEquipo({partidoId: partido.id, equipoNombre: partido.equipoVisitante?.nombre || ''})}
              onMouseLeave={() => setHoveredEquipo(null)}
            >
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
          <div className="w-full bg-gray-50 p-4">
        <div className="flex flex-col space-y-8 max-w-7xl mx-auto">
        {rondas.map((ronda, rondaIndex) => (
          <div key={ronda.numero} className="flex flex-col w-full">
            {/* Título de la ronda */}
            <div className="mb-4 text-center w-full">
              <h3 className="text-lg font-medium text-gray-700">
                {ronda.titulo}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {ronda.partidos.filter(p => p.estado === 'jugado').length} de {ronda.partidos.length} jugados
              </p>
            </div>
            
            {/* Partidos de la ronda */}
            <div className="relative flex flex-wrap justify-center gap-6 w-full max-w-7xl">
              {ronda.partidos.map((partido, partidoIndex) => {
                // Calcular el número global del partido
                let numeroGlobal = 1; // Empezar en 1
                
                // Sumar todos los partidos de las rondas anteriores
                for (let i = 0; i < rondaIndex; i++) {
                  numeroGlobal += rondas[i].partidos.length;
                }
                
                // Sumar los partidos de la ronda actual hasta este índice
                numeroGlobal += partidoIndex;
                
                return (
                  <div 
                    key={partido.id} 
                    className="relative"
                  >
                    {renderPartido(partido, numeroGlobal - 1, rondaIndex)} {/* Pasar el índice global y ronda */}
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
