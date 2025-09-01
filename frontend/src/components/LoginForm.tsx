import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
      setError('Por favor completa todos los campos requeridos');
      return;
    }
    
    if (!isLogin && !formData.nombre) {
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
      } else {
        console.log('📝 Intentando registro...');
        await register(formData.nombre, formData.email, formData.password);
        console.log('✅ Registro exitoso');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <Trophy className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? (
              <>
                ¿No tienes cuenta?{' '}
                <button
                  onClick={toggleMode}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Regístrate aquí
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={toggleMode}
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Inicia sesión aquí
                </button>
              </>
            )}
          </p>
        </div>

                 <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
           {error && (
             <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md">
               <strong>❌ Error:</strong> {error}
             </div>
           )}

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="nombre" className="label">
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
                    className="input pl-10"
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">
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
                  className="input pl-10"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">
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
                  className="input pl-10 pr-10"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed opacity-75' 
                    : 'text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }`}
              >
               {loading ? (
                 <div className="flex items-center">
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                   {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
                 </div>
               ) : (
                 isLogin ? 'Iniciar sesión' : 'Crear cuenta'
               )}
             </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
