import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Zap,
  Calendar,
  X,
  Users,
  Target,
  Award
} from 'lucide-react';

interface CrearTorneoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CrearTorneoModal: React.FC<CrearTorneoModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleSelectTipo = (tipo: 'liga' | 'eliminacion') => {
    onClose();
    if (tipo === 'liga') {
      navigate('/crear-liga');
    } else {
      navigate('/crear-eliminacion');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Torneo</h2>
            <p className="mt-1 text-gray-600">
              Selecciona el tipo de torneo que deseas crear
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Selector de tipo de torneo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opción Liga */}
            <div 
              className="card cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-blue-200"
              onClick={() => handleSelectTipo('liga')}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Torneo de Liga</h3>
                    <p className="text-sm text-gray-600">Todos contra todos</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">
                  Todos los equipos juegan entre sí. El campeón se determina por puntos acumulados al final de la temporada.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-blue-600 mr-1" />
                      <span className="text-xs text-gray-600">Equipos</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">2-20</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Target className="w-4 h-4 text-blue-600 mr-1" />
                      <span className="text-xs text-gray-600">Formato</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">Ida/Vuelta</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Sistema de puntos personalizable
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Tabla de posiciones automática
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Calendario de partidos
                  </div>
                </div>

                <button className="w-full mt-4 btn btn-primary">
                  <Calendar className="w-4 h-4 mr-2" />
                  Crear Liga
                </button>
              </div>
            </div>

            {/* Opción Eliminación */}
            <div 
              className="card cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-red-200"
              onClick={() => handleSelectTipo('eliminacion')}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <Zap className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Eliminación Directa</h3>
                    <p className="text-sm text-gray-600">Rondas eliminatorias</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">
                  Los equipos compiten en rondas eliminatorias. El ganador de cada partido avanza a la siguiente ronda hasta llegar a la final.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-red-600 mr-1" />
                      <span className="text-xs text-gray-600">Equipos</span>
                    </div>
                    <span className="text-sm font-bold text-red-600">2, 4, 8, 16</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Target className="w-4 h-4 text-red-600 mr-1" />
                      <span className="text-xs text-gray-600">Rondas</span>
                    </div>
                    <span className="text-sm font-bold text-red-600">Eliminatorias</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Cuadro de eliminación visual
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Avance automático de equipos
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    Partido por tercer lugar
                  </div>
                </div>

                <button className="w-full mt-4 btn btn-primary">
                  <Zap className="w-4 h-4 mr-2" />
                  Crear Eliminación
                </button>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">¿Cuál elegir?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-blue-600 mb-2">Liga - Ideal para:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Temporadas largas con muchos equipos</li>
                  <li>• Determinar el mejor equipo por consistencia</li>
                  <li>• Máxima cantidad de partidos</li>
                  <li>• Tabla de posiciones detallada</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-600 mb-2">Eliminación - Ideal para:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Torneos cortos y emocionantes</li>
                  <li>• Competencias de copa</li>
                  <li>• Menos equipos (máximo 16)</li>
                  <li>• Resultados inmediatos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearTorneoModal;
