import toast from 'react-hot-toast';
import { Trophy, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

// Servicio de toast personalizado con el estilo de Torneito
export const toastService = {
  // Toast de éxito
  success: (message: string, options?: any) => {
    return toast.success(message, {
      icon: <CheckCircle className="w-5 h-5" />,
      ...options,
    });
  },

  // Toast de error
  error: (message: string, options?: any) => {
    return toast.error(message, {
      icon: <XCircle className="w-5 h-5" />,
      ...options,
    });
  },

  // Toast de advertencia
  warning: (message: string, options?: any) => {
    return toast(message, {
      icon: <AlertCircle className="w-5 h-5" />,
      style: {
        background: '#fef3c7',
        color: '#92400e',
        border: '1px solid #f59e0b',
      },
      ...options,
    });
  },

  // Toast de información
  info: (message: string, options?: any) => {
    return toast(message, {
      icon: <Info className="w-5 h-5" />,
      style: {
        background: '#dbeafe',
        color: '#1e40af',
        border: '1px solid #3b82f6',
      },
      ...options,
    });
  },

  // Toast de carga
  loading: (message: string, options?: any) => {
    return toast.loading(message, {
      icon: <Trophy className="w-5 h-5" />,
      ...options,
    });
  },

  // Toast personalizado para torneos
  tournament: {
    created: (tournamentName: string) => {
      return toast.success(`¡Torneo "${tournamentName}" creado exitosamente!`, {
        icon: <Trophy className="w-5 h-5" />,
        duration: 5000,
      });
    },

    updated: (tournamentName: string) => {
      return toast.success(`Torneo "${tournamentName}" actualizado`, {
        icon: <Trophy className="w-5 h-5" />,
      });
    },

    deleted: (tournamentName: string) => {
      return toast.success(`Torneo "${tournamentName}" eliminado`, {
        icon: <Trophy className="w-5 h-5" />,
      });
    },

    error: (action: string) => {
      return toast.error(`Error al ${action} el torneo`, {
        icon: <XCircle className="w-5 h-5" />,
      });
    },
  },

  // Toast para autenticación
  auth: {
    loginSuccess: (userName: string) => {
      return toast.success(`¡Bienvenido, ${userName}!`, {
        icon: <CheckCircle className="w-5 h-5" />,
        duration: 3000,
      });
    },

    registerSuccess: (userName: string) => {
      return toast.success(`¡Cuenta creada exitosamente! Bienvenido, ${userName}`, {
        icon: <CheckCircle className="w-5 h-5" />,
        duration: 4000,
      });
    },

    logout: () => {
      return toast.success('Sesión cerrada correctamente', {
        icon: <CheckCircle className="w-5 h-5" />,
        duration: 2000,
      });
    },

    error: (message: string) => {
      return toast.error(message, {
        icon: <XCircle className="w-5 h-5" />,
      });
    },
  },

  // Toast para equipos
  team: {
    created: (teamName: string) => {
      return toast.success(`Equipo "${teamName}" creado exitosamente`, {
        icon: <CheckCircle className="w-5 h-5" />,
      });
    },

    updated: (teamName: string) => {
      return toast.success(`Equipo "${teamName}" actualizado`, {
        icon: <CheckCircle className="w-5 h-5" />,
      });
    },

    deleted: (teamName: string) => {
      return toast.success(`Equipo "${teamName}" eliminado`, {
        icon: <CheckCircle className="w-5 h-5" />,
      });
    },

    error: (action: string) => {
      return toast.error(`Error al ${action} el equipo`, {
        icon: <XCircle className="w-5 h-5" />,
      });
    },
  },

  // Toast para partidos
  match: {
    created: () => {
      return toast.success('Partido creado exitosamente', {
        icon: <Trophy className="w-5 h-5" />,
      });
    },

    updated: () => {
      return toast.success('Partido actualizado', {
        icon: <Trophy className="w-5 h-5" />,
      });
    },

    resultUpdated: () => {
      return toast.success('Resultado del partido actualizado', {
        icon: <Trophy className="w-5 h-5" />,
      });
    },

    error: (action: string) => {
      return toast.error(`Error al ${action} el partido`, {
        icon: <XCircle className="w-5 h-5" />,
      });
    },
  },

  // Toast para validaciones
  validation: {
    required: (field: string) => {
      return toast.error(`${field} es requerido`, {
        icon: <AlertCircle className="w-5 h-5" />,
      });
    },

    invalid: (field: string) => {
      return toast.error(`${field} no es válido`, {
        icon: <AlertCircle className="w-5 h-5" />,
      });
    },

    minLength: (field: string, min: number) => {
      return toast.error(`${field} debe tener al menos ${min} caracteres`, {
        icon: <AlertCircle className="w-5 h-5" />,
      });
    },

    maxLength: (field: string, max: number) => {
      return toast.error(`${field} no puede tener más de ${max} caracteres`, {
        icon: <AlertCircle className="w-5 h-5" />,
      });
    },
  },

  // Toast para operaciones de red
  network: {
    offline: () => {
      return toast.error('Sin conexión a internet', {
        icon: <XCircle className="w-5 h-5" />,
        duration: 6000,
      });
    },

    serverError: () => {
      return toast.error('Error del servidor. Intenta nuevamente', {
        icon: <XCircle className="w-5 h-5" />,
      });
    },

    timeout: () => {
      return toast.error('Tiempo de espera agotado', {
        icon: <XCircle className="w-5 h-5" />,
      });
    },
  },

  // Método para limpiar todos los toasts
  dismiss: () => {
    toast.dismiss();
  },

  // Método para limpiar un toast específico
  dismissToast: (toastId: string) => {
    toast.dismiss(toastId);
  },
};

export default toastService;
