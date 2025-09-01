import axios from 'axios';

// Función para obtener la URL de la API dinámicamente
const getAPIUrl = () => {
  // En desarrollo, usar localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:3001/api';
  }
  
  // En producción, usar la URL del servidor
  return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
};

const API_BASE_URL = getAPIUrl();

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  register: (userData: { nombre: string; email: string; password: string }) =>
    api.post('/usuarios/register', userData),
  
  login: (credentials: { email: string; password: string }) =>
    api.post('/usuarios/login', credentials),
};

// Servicios de usuario/perfil
export const usuarioService = {
  getProfile: () => api.get('/usuarios/profile'),
  
  updateProfile: (userData: { nombre?: string; email?: string; passwordActual?: string; passwordNuevo?: string }) =>
    api.put('/usuarios/profile', userData),
  
  getStats: () => api.get('/usuarios/stats'),
};

// Servicios de equipos
export const equipoService = {
  getAll: () => api.get('/equipos'),
  
  getById: (id: number) => api.get(`/equipos/${id}`),
  
  create: (equipoData: { nombre: string; escudo_url?: string }) =>
    api.post('/equipos', equipoData),
  
  update: (id: number, equipoData: { nombre?: string; escudo_url?: string }) =>
    api.put(`/equipos/${id}`, equipoData),
  
  delete: (id: number) => api.delete(`/equipos/${id}`),
  
  search: (query: string) => api.get(`/equipos/search?q=${query}`),
};

// Servicios de upload
export const uploadService = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadBanner: (file: File) => {
    const formData = new FormData();
    formData.append('banner', file);
    return api.post('/upload/banner', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteImage: (publicId: string) => api.delete(`/upload/image/${publicId}`),
};

// Servicios de torneos
export const torneoService = {
  getAll: () => api.get('/torneos'),
  
  getById: (id: number) => api.get(`/torneos/${id}`),
  
  create: (torneoData: { nombre: string; tipo: 'liga' | 'eliminacion'; equiposIds?: number[]; equiposNuevos?: string[] }) =>
    api.post('/torneos', torneoData),
  
  update: (id: number, torneoData: { nombre?: string; estado?: string; banner_url?: string; banner_position?: { x: number; y: number } }) =>
    api.put(`/torneos/${id}`, torneoData),
  
  delete: (id: number) => api.delete(`/torneos/${id}`),
  
  getStandings: (id: number) => api.get(`/torneos/${id}/tabla-posiciones`),
};

// Servicios de partidos
export const partidoService = {
  getByTorneo: (torneoId: number) => api.get(`/partidos/torneo/${torneoId}`),
  
  getById: (id: number) => api.get(`/partidos/${id}`),
  
  registerResult: (id: number, result: { golesLocal: number; golesVisitante: number }) =>
    api.put(`/partidos/${id}/resultado`, result),
  
  updateResult: (id: number, result: { golesLocal: number; golesVisitante: number }) =>
    api.put(`/partidos/${id}/actualizar-resultado`, result),
  
  deleteResult: (id: number) => api.delete(`/partidos/${id}/resultado`),
  
  getTeamStats: (torneoId: number, equipoId: number) =>
    api.get(`/partidos/torneo/${torneoId}/equipo/${equipoId}/estadisticas`),
};

export default api;
