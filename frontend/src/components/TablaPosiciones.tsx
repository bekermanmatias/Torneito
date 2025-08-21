import React, { useMemo } from 'react';
import { Trophy, Medal, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Partido, Equipo } from '../types';

interface TablaPosicionesProps {
  partidos: Partido[];
  equipos: Equipo[];
}

interface EstadisticasEquipo {
  equipo: Equipo;
  partidosJugados: number;
  partidosGanados: number;
  partidosEmpatados: number;
  partidosPerdidos: number;
  golesFavor: number;
  golesContra: number;
  diferenciaGoles: number;
  puntos: number;
  posicion: number;
}

const TablaPosiciones: React.FC<TablaPosicionesProps> = ({ partidos, equipos }) => {
  const estadisticas = useMemo(() => {
    const stats: { [key: number]: EstadisticasEquipo } = {};

    // Inicializar estadísticas para cada equipo
    equipos.forEach(equipo => {
      stats[equipo.id] = {
        equipo,
        partidosJugados: 0,
        partidosGanados: 0,
        partidosEmpatados: 0,
        partidosPerdidos: 0,
        golesFavor: 0,
        golesContra: 0,
        diferenciaGoles: 0,
        puntos: 0,
        posicion: 0
      };
    });

    // Calcular estadísticas de partidos jugados
    partidos.forEach(partido => {
      if (partido.estado === 'jugado' && partido.golesLocal !== null && partido.golesLocal !== undefined && partido.golesVisitante !== null && partido.golesVisitante !== undefined) {
        const equipoLocal = stats[partido.equipoLocalId];
        const equipoVisitante = stats[partido.equipoVisitanteId];

        if (equipoLocal && equipoVisitante) {
          // Actualizar partidos jugados
          equipoLocal.partidosJugados++;
          equipoVisitante.partidosJugados++;

          // Actualizar goles
          equipoLocal.golesFavor += partido.golesLocal;
          equipoLocal.golesContra += partido.golesVisitante;
          equipoVisitante.golesFavor += partido.golesVisitante;
          equipoVisitante.golesContra += partido.golesLocal;

          // Determinar resultado
          if (partido.golesLocal > partido.golesVisitante) {
            // Victoria local
            equipoLocal.partidosGanados++;
            equipoLocal.puntos += 3;
            equipoVisitante.partidosPerdidos++;
          } else if (partido.golesVisitante > partido.golesLocal) {
            // Victoria visitante
            equipoVisitante.partidosGanados++;
            equipoVisitante.puntos += 3;
            equipoLocal.partidosPerdidos++;
          } else {
            // Empate
            equipoLocal.partidosEmpatados++;
            equipoLocal.puntos += 1;
            equipoVisitante.partidosEmpatados++;
            equipoVisitante.puntos += 1;
          }
        }
      }
    });

    // Calcular diferencia de goles
    Object.values(stats).forEach(stat => {
      stat.diferenciaGoles = stat.golesFavor - stat.golesContra;
    });

    // Ordenar por puntos, diferencia de goles y goles a favor
    const equiposOrdenados = Object.values(stats).sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      if (b.diferenciaGoles !== a.diferenciaGoles) return b.diferenciaGoles - a.diferenciaGoles;
      return b.golesFavor - a.golesFavor;
    });

    // Asignar posiciones
    equiposOrdenados.forEach((equipo, index) => {
      equipo.posicion = index + 1;
    });

    return equiposOrdenados;
  }, [partidos, equipos]);

  const getPosicionIcon = (posicion: number) => {
    switch (posicion) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 text-gray-400 text-sm font-bold flex items-center justify-center">{posicion}</span>;
    }
  };

  const getPosicionColor = (posicion: number) => {
    switch (posicion) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getTendenciaIcon = (posicion: number) => {
    if (posicion <= 3) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (posicion >= estadisticas.length - 2) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabla de Posiciones */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pos
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipo
              </th>
              <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                PJ
              </th>
              <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                PG
              </th>
              <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                PE
              </th>
              <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                PP
              </th>
              <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                GF
              </th>
              <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                GC
              </th>
              <th className="px-3 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                DG
              </th>
              <th className="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pts
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {estadisticas.map((stat) => (
              <tr 
                key={stat.equipo.id} 
                className={`hover:bg-gray-50 transition-all duration-200 border-l-4 ${getPosicionColor(stat.posicion)}`}
              >
                <td className="px-4 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center justify-center space-x-2">
                    {getPosicionIcon(stat.posicion)}
                    {getTendenciaIcon(stat.posicion)}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {stat.equipo.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">
                        {stat.equipo.nombre}
                      </div>
                      <div className="text-xs text-gray-500">
                        {stat.posicion === 1 ? 'Líder' : 
                         stat.posicion <= 3 ? 'Puestos de honor' : 
                         stat.posicion >= estadisticas.length - 2 ? 'Zona de descenso' : 'Zona media'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-5 whitespace-nowrap text-sm text-center text-gray-900 font-medium">
                  {stat.partidosJugados}
                </td>
                <td className="px-3 py-5 whitespace-nowrap text-sm text-center text-green-600 font-bold">
                  {stat.partidosGanados}
                </td>
                <td className="px-3 py-5 whitespace-nowrap text-sm text-center text-blue-600 font-bold">
                  {stat.partidosEmpatados}
                </td>
                <td className="px-3 py-5 whitespace-nowrap text-sm text-center text-red-600 font-bold">
                  {stat.partidosPerdidos}
                </td>
                <td className="px-3 py-5 whitespace-nowrap text-sm text-center text-gray-900 font-medium">
                  {stat.golesFavor}
                </td>
                <td className="px-3 py-5 whitespace-nowrap text-sm text-center text-gray-900 font-medium">
                  {stat.golesContra}
                </td>
                <td className="px-3 py-5 whitespace-nowrap text-sm text-center font-bold">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    stat.diferenciaGoles > 0 
                      ? 'bg-green-100 text-green-800' 
                      : stat.diferenciaGoles < 0 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {stat.diferenciaGoles > 0 ? '+' : ''}{stat.diferenciaGoles}
                  </span>
                </td>
                <td className="px-4 py-5 whitespace-nowrap text-sm text-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-lg font-bold bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md">
                    {stat.puntos}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leyenda Mejorada */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
        <div className="text-sm font-bold text-gray-800 mb-3">📊 Leyenda de la Tabla</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
          <div className="space-y-1">
            <div className="font-medium text-gray-700">Estadísticas:</div>
            <div>PJ = Partidos Jugados</div>
            <div>PG = Partidos Ganados</div>
            <div>PE = Partidos Empatados</div>
            <div>PP = Partidos Perdidos</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-gray-700">Goles:</div>
            <div>GF = Goles a Favor</div>
            <div>GC = Goles en Contra</div>
            <div>DG = Diferencia de Goles</div>
            <div>Pts = Puntos</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-gray-700">Sistema de Puntos:</div>
            <div>Victoria = 3 puntos</div>
            <div>Empate = 1 punto</div>
            <div>Derrota = 0 puntos</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-gray-700">Desempate:</div>
            <div>1. Puntos totales</div>
            <div>2. Diferencia de goles</div>
            <div>3. Goles a favor</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablaPosiciones;
