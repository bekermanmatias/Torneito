import React from 'react';
import SoccerBallDebug from '../components/SoccerBallDebug';

const Test3D: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Prueba del Modelo 3D - Balón de Fútbol
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Información del Modelo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <strong>Archivo:</strong> soccer_ball21.glb
              </div>
              <div>
                <strong>Tamaño:</strong> 139MB
              </div>
              <div>
                <strong>Formato:</strong> GLB (GL Binary)
              </div>
              <div>
                <strong>Ubicación:</strong> /public/soccer_ball21.glb
              </div>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
              Vista Previa del Modelo 3D
            </h3>
            <div className="w-full h-96 bg-gray-50 rounded-lg overflow-hidden">
              <SoccerBallDebug />
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Instrucciones de Debugging:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Abre la consola del navegador (F12) para ver los logs</li>
              <li>• Verifica que el archivo se esté cargando desde la ruta correcta</li>
              <li>• Si hay errores, revisa la red del navegador para ver si el archivo se descarga</li>
              <li>• El modelo debería rotar y flotar suavemente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test3D;
