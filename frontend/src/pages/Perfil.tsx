import React, { useState, useEffect } from 'react';
import { 
  User, 
  Edit, 
  Save, 
  X,
  Trophy,
  Shield,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { usuarioService } from '../services/api';
import type { Usuario } from '../types';

interface Estadisticas {
  totalTorneos: number;
  torneosFinalizados: number;
  torneosEnCurso: number;
  torneosPendientes: number;
  totalEquipos: number;
}

const Perfil: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    passwordActual: '',
    passwordNuevo: '',
    confirmarPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [perfilRes, statsRes] = await Promise.all([
        usuarioService.getProfile(),
        usuarioService.getStats()
      ]);
      
      setUsuario(perfilRes.data.usuario);
      setEstadisticas(statsRes.data.estadisticas);
      setFormData({
        nombre: perfilRes.data.usuario.nombre,
        email: perfilRes.data.usuario.email,
        passwordActual: '',
        passwordNuevo: '',
        confirmarPassword: ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar contraseñas si se está cambiando
    if (formData.passwordNuevo) {
      if (!formData.passwordActual) {
        setError('Debe ingresar su contraseña actual');
        return;
      }
      if (formData.passwordNuevo !== formData.confirmarPassword) {
        setError('Las contraseñas nuevas no coinciden');
        return;
      }
      if (formData.passwordNuevo.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    try {
      const updateData: any = {};
      if (formData.nombre !== usuario?.nombre) updateData.nombre = formData.nombre;
      if (formData.email !== usuario?.email) updateData.email = formData.email;
      if (formData.passwordNuevo) {
        updateData.passwordActual = formData.passwordActual;
        updateData.passwordNuevo = formData.passwordNuevo;
      }

      if (Object.keys(updateData).length === 0) {
        setError('No hay cambios para guardar');
        return;
      }

      await usuarioService.updateProfile(updateData);
      setSuccess('Perfil actualizado exitosamente');
      setEditing(false);
      loadData(); // Recargar datos
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al actualizar el perfil');
    }
  };

  const startEditing = () => {
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const cancelEditing = () => {
    setEditing(false);
    setFormData({
      nombre: usuario?.nombre || '',
      email: usuario?.email || '',
      passwordActual: '',
      passwordNuevo: '',
      confirmarPassword: ''
    });
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="mt-2 text-gray-600">
              Gestiona tu información personal y contraseña
            </p>
          </div>
          {!editing && (
            <button
              onClick={startEditing}
              className="btn btn-primary"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Perfil
            </button>
          )}
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-md flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información del Perfil */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {usuario?.nombre}
                </h2>
                <p className="text-gray-600">{usuario?.email}</p>
                <p className="text-sm text-gray-500">
                  Miembro desde {new Date(usuario?.fechaRegistro || '').toLocaleDateString()}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="label">
                    Nombre *
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="input"
                    disabled={!editing}
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="label">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    disabled={!editing}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Cambio de Contraseña */}
              {editing && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Cambiar Contraseña (Opcional)
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="passwordActual" className="label">
                        Contraseña Actual
                      </label>
                      <input
                        id="passwordActual"
                        type="password"
                        value={formData.passwordActual}
                        onChange={(e) => setFormData({ ...formData, passwordActual: e.target.value })}
                        className="input"
                        placeholder="Tu contraseña actual"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="passwordNuevo" className="label">
                          Nueva Contraseña
                        </label>
                        <input
                          id="passwordNuevo"
                          type="password"
                          value={formData.passwordNuevo}
                          onChange={(e) => setFormData({ ...formData, passwordNuevo: e.target.value })}
                          className="input"
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmarPassword" className="label">
                          Confirmar Nueva Contraseña
                        </label>
                        <input
                          id="confirmarPassword"
                          type="password"
                          value={formData.confirmarPassword}
                          onChange={(e) => setFormData({ ...formData, confirmarPassword: e.target.value })}
                          className="input"
                          placeholder="Repite la nueva contraseña"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              {editing && (
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="btn btn-secondary"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mis Estadísticas
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Trophy className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Total Torneos</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {estadisticas?.totalTorneos || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Finalizados</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {estadisticas?.torneosFinalizados || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">En Curso</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">
                  {estadisticas?.torneosEnCurso || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Pendientes</span>
                </div>
                <span className="text-lg font-bold text-gray-600">
                  {estadisticas?.torneosPendientes || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">Total Equipos</span>
                </div>
                <span className="text-lg font-bold text-purple-600">
                  {estadisticas?.totalEquipos || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
