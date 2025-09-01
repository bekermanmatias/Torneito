// Tipos de usuario
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  fechaRegistro: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
}

// Tipos de equipo
export interface Equipo {
  id: number;
  nombre: string;
  escudo_url?: string;
  usuarioId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEquipoData {
  nombre: string;
  escudo_url?: string;
}

export interface UpdateEquipoData {
  nombre?: string;
  escudo_url?: string;
}

// Tipos de torneo
export type TorneoTipo = 'liga' | 'eliminacion';
export type TorneoEstado = 'pendiente' | 'en_curso' | 'finalizado';

export interface Torneo {
  id: number;
  nombre: string;
  tipo: TorneoTipo;
  estado: TorneoEstado;
  banner_url?: string;
  banner_position?: { x: number; y: number };
  usuarioId: number;
  equipos?: Equipo[];
  partidos?: Partido[];
  campeon?: Equipo;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTorneoData {
  nombre: string;
  tipo: TorneoTipo;
  equiposIds?: number[];
  equiposNuevos?: string[];
  configuracion?: {
    formato?: 'ida' | 'ida-vuelta' | 'simple' | 'doble';
    puntosVictoria?: number;
    puntosEmpate?: number;
    puntosDerrota?: number;
    incluirPlayoffs?: boolean;
    incluirTercerLugar?: boolean;
  };
}

export interface UpdateTorneoData {
  nombre?: string;
  estado?: TorneoEstado;
  banner_url?: string;
  banner_position?: { x: number; y: number };
}

// Tipos de partido
export type PartidoEstado = 'pendiente' | 'jugado';

export interface Partido {
  id: number;
  torneoId: number;
  equipoLocalId: number;
  equipoVisitanteId: number;
  golesLocal?: number;
  golesVisitante?: number;
  fecha: string;
  estado: PartidoEstado;
  ronda?: number;
  equipoLocal?: Equipo;
  equipoVisitante?: Equipo;
  createdAt: string;
  updatedAt: string;
}

export interface PartidoResult {
  golesLocal: number;
  golesVisitante: number;
}

// Tipos de estadísticas
export interface EstadisticasEquipo {
  equipo: Equipo;
  partidosJugados: number;
  partidosGanados: number;
  partidosEmpatados: number;
  partidosPerdidos: number;
  golesFavor: number;
  golesContra: number;
  diferenciaGoles: number;
  puntos: number;
}

export interface TablaPosiciones {
  posicion: number;
  equipo: Equipo;
  partidosJugados: number;
  partidosGanados: number;
  partidosEmpatados: number;
  partidosPerdidos: number;
  golesFavor: number;
  golesContra: number;
  diferenciaGoles: number;
  puntos: number;
}

// Tipos de respuesta de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos de formularios
export interface FormErrors {
  [key: string]: string;
}

// Tipos de navegación
export interface NavItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}
