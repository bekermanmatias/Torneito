import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Trophy, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toastService } from '../services/toast';

const LoginForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Prevenir el comportamiento por defecto del formulario
    e.preventDefault();
    
    // Prevenir múltiples envíos
    if (loading) {
      console.log('⚠️ Formulario ya está procesando...');
      return;
    }
    
    // Validar campos requeridos
    if (!formData.email || !formData.password) {
      toastService.validation.required('Todos los campos');
      setError('Por favor completa todos los campos requeridos');
      return;
    }
    
    if (!isLogin && !formData.nombre) {
      toastService.validation.required('Nombre completo');
      setError('Por favor ingresa tu nombre completo');
      return;
    }
    
    console.log('🔍 Iniciando proceso de login/registro...');
    console.log('Datos del formulario:', { ...formData, password: '[HIDDEN]' });
    
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        console.log('🔐 Intentando login...');
        await login(formData.email, formData.password);
        console.log('✅ Login exitoso');
        toastService.auth.loginSuccess(formData.email.split('@')[0]);
      } else {
        console.log('📝 Intentando registro...');
        await register(formData.nombre, formData.email, formData.password);
        console.log('✅ Registro exitoso');
        toastService.auth.registerSuccess(formData.nombre);
      }
      
      // Limpiar el formulario
      setFormData({ nombre: '', email: '', password: '' });
      
      console.log('🚀 Navegando al home...');
      // Navegar al home usando React Router
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('❌ Error en handleSubmit:', error);
      console.error('Error completo:', error);
      
      // Mostrar error más detallado
      let errorMessage = 'Error desconocido';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifica que el backend esté corriendo.';
        toastService.network.serverError();
      } else {
        toastService.auth.error(errorMessage);
      }
      
      setError(errorMessage);
      console.log('❌ Error mostrado al usuario:', errorMessage);
      
      // Mantener los datos del formulario para que el usuario pueda corregir
      console.log('📝 Manteniendo datos del formulario para corrección');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ nombre: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Efectos de fondo similares al Dashboard */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Partículas flotantes */}
        <div className="floating-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header con branding */}
          <div className="text-center">
            {/* Logo y nombre de la app */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Torneito</h1>
                  <p className="text-sm text-gray-500">Gestiona tus torneos</p>
                </div>
              </div>
            </div>

            {/* Título del formulario */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? '¡Bienvenido de vuelta!' : '¡Únete a Torneito!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta y comienza a gestionar torneos'}
            </p>

            {/* Toggle entre login y registro */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <button
                onClick={toggleMode}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isLogin
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                onClick={toggleMode}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  !isLogin
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Registrarse
              </button>
            </div>
          </div>

          {/* Formulario en tarjeta */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
                  <strong>❌ Error:</strong> {error}
                </div>
              )}

              <div className="space-y-5">
                {!isLogin && (
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        required={!isLogin}
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Tu contraseña"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg transition-all duration-200 ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed opacity-75' 
                      : 'text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {isLogin ? (
                        <>
                          <Trophy className="w-4 h-4 mr-2" />
                          Iniciar sesión
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          Crear cuenta
                        </>
                      )}
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginForm;
