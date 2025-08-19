# 🏆 API Documentation - Torneito

Documentación completa de la API REST para la aplicación de gestión de torneos de fútbol.

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Para las rutas protegidas, incluye el token en el header:

```
Authorization: Bearer <tu_token_jwt>
```

## 📋 Endpoints

### 👤 Usuarios

#### `POST /api/usuarios/register`
Registrar un nuevo usuario.

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "123456"
}
```

**Response (201):**
```json
{
  "message": "✅ Usuario registrado exitosamente",
  "usuario": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "fechaRegistro": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `POST /api/usuarios/login`
Iniciar sesión.

**Body:**
```json
{
  "email": "juan@ejemplo.com",
  "password": "123456"
}
```

**Response (200):**
```json
{
  "message": "✅ Inicio de sesión exitoso",
  "usuario": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `GET /api/usuarios/profile` 🔒
Obtener perfil del usuario autenticado.

**Response (200):**
```json
{
  "message": "✅ Perfil obtenido exitosamente",
  "usuario": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "fechaRegistro": "2024-01-15T10:30:00.000Z"
  }
}
```

#### `PUT /api/usuarios/profile` 🔒
Actualizar perfil del usuario.

**Body:**
```json
{
  "nombre": "Juan Carlos Pérez",
  "email": "juancarlos@ejemplo.com"
}
```

#### `PUT /api/usuarios/password` 🔒
Cambiar contraseña.

**Body:**
```json
{
  "passwordActual": "123456",
  "passwordNueva": "nueva123456"
}
```

### ⚽ Equipos

#### `GET /api/equipos` 🔒
Obtener todos los equipos del usuario.

**Response (200):**
```json
{
  "message": "✅ Equipos obtenidos exitosamente",
  "equipos": [
    {
      "id": 1,
      "nombre": "Real Madrid",
      "escudo_url": "https://ejemplo.com/escudo.png",
      "usuarioId": 1
    }
  ],
  "total": 1
}
```

#### `GET /api/equipos/search?q=Madrid` 🔒
Buscar equipos por nombre.

#### `GET /api/equipos/:id` 🔒
Obtener un equipo específico.

#### `POST /api/equipos` 🔒
Crear nuevo equipo.

**Body:**
```json
{
  "nombre": "Barcelona",
  "escudo_url": "https://ejemplo.com/barcelona.png"
}
```

#### `PUT /api/equipos/:id` 🔒
Actualizar equipo.

#### `DELETE /api/equipos/:id` 🔒
Eliminar equipo.

### 🏆 Torneos

#### `GET /api/torneos` 🔒
Obtener todos los torneos del usuario.

**Response (200):**
```json
{
  "message": "✅ Torneos obtenidos exitosamente",
  "torneos": [
    {
      "id": 1,
      "nombre": "Liga Española 2024",
      "tipo": "liga",
      "estado": "en_curso",
      "usuarioId": 1,
      "equipos": [
        {
          "id": 1,
          "nombre": "Real Madrid",
          "escudo_url": "https://ejemplo.com/escudo.png"
        }
      ]
    }
  ],
  "total": 1
}
```

#### `GET /api/torneos/:id` 🔒
Obtener un torneo específico con detalles completos.

#### `POST /api/torneos` 🔒
Crear nuevo torneo.

**Body:**
```json
{
  "nombre": "Copa Libertadores 2024",
  "tipo": "eliminacion",
  "equiposIds": [1, 2, 3, 4]
}
```

**Tipos de torneo:**
- `liga`: Todos contra todos
- `eliminacion`: Eliminación directa

#### `PUT /api/torneos/:id` 🔒
Actualizar torneo.

**Body:**
```json
{
  "nombre": "Liga Española 2024 - Actualizada",
  "estado": "finalizado"
}
```

#### `DELETE /api/torneos/:id` 🔒
Eliminar torneo.

#### `GET /api/torneos/:id/tabla-posiciones` 🔒
Obtener tabla de posiciones (solo para torneos de liga).

**Response (200):**
```json
{
  "message": "✅ Tabla de posiciones obtenida exitosamente",
  "torneo": {
    "id": 1,
    "nombre": "Liga Española 2024",
    "tipo": "liga",
    "estado": "en_curso"
  },
  "tablaPosiciones": [
    {
      "equipo": {
        "id": 1,
        "nombre": "Real Madrid",
        "escudo_url": "https://ejemplo.com/escudo.png"
      },
      "partidosJugados": 5,
      "partidosGanados": 4,
      "partidosEmpatados": 1,
      "partidosPerdidos": 0,
      "puntos": 13
    }
  ]
}
```

### ⚽ Partidos

#### `GET /api/partidos/torneo/:torneoId` 🔒
Obtener todos los partidos de un torneo.

**Response (200):**
```json
{
  "message": "✅ Partidos obtenidos exitosamente",
  "torneo": {
    "id": 1,
    "nombre": "Liga Española 2024",
    "tipo": "liga",
    "estado": "en_curso"
  },
  "partidos": [
    {
      "id": 1,
      "torneoId": 1,
      "equipoLocalId": 1,
      "equipoVisitanteId": 2,
      "golesLocal": 2,
      "golesVisitante": 1,
      "fecha": "2024-01-15T20:00:00.000Z",
      "estado": "jugado",
      "equipoLocal": {
        "id": 1,
        "nombre": "Real Madrid",
        "escudo_url": "https://ejemplo.com/escudo.png"
      },
      "equipoVisitante": {
        "id": 2,
        "nombre": "Barcelona",
        "escudo_url": "https://ejemplo.com/barcelona.png"
      }
    }
  ],
  "total": 1
}
```

#### `GET /api/partidos/:id` 🔒
Obtener un partido específico.

#### `PUT /api/partidos/:id/resultado` 🔒
Registrar resultado de un partido.

**Body:**
```json
{
  "golesLocal": 2,
  "golesVisitante": 1
}
```

#### `PUT /api/partidos/:id/actualizar-resultado` 🔒
Actualizar resultado de un partido.

#### `DELETE /api/partidos/:id/resultado` 🔒
Eliminar resultado (marcar como pendiente).

#### `GET /api/partidos/torneo/:torneoId/equipo/:equipoId/estadisticas` 🔒
Obtener estadísticas de un equipo en un torneo.

**Response (200):**
```json
{
  "message": "✅ Estadísticas obtenidas exitosamente",
  "equipo": {
    "id": 1,
    "nombre": "Real Madrid",
    "escudo_url": "https://ejemplo.com/escudo.png"
  },
  "torneo": {
    "id": 1,
    "nombre": "Liga Española 2024",
    "tipo": "liga"
  },
  "estadisticas": {
    "partidosJugados": 5,
    "partidosGanados": 4,
    "partidosEmpatados": 1,
    "partidosPerdidos": 0,
    "golesFavor": 12,
    "golesContra": 3,
    "diferenciaGoles": 9,
    "puntos": 13
  },
  "partidos": [...]
}
```

## 📊 Códigos de Estado HTTP

- `200` - OK (Operación exitosa)
- `201` - Created (Recurso creado exitosamente)
- `400` - Bad Request (Datos inválidos)
- `401` - Unauthorized (No autenticado)
- `404` - Not Found (Recurso no encontrado)
- `409` - Conflict (Conflicto, ej: email duplicado)
- `500` - Internal Server Error (Error interno del servidor)

## 🔧 Ejemplos de Uso

### Flujo típico de uso:

1. **Registrar usuario:**
   ```bash
   POST /api/usuarios/register
   ```

2. **Iniciar sesión:**
   ```bash
   POST /api/usuarios/login
   ```

3. **Crear equipos:**
   ```bash
   POST /api/equipos
   Authorization: Bearer <token>
   ```

4. **Crear torneo:**
   ```bash
   POST /api/torneos
   Authorization: Bearer <token>
   ```

5. **Registrar resultados:**
   ```bash
   PUT /api/partidos/:id/resultado
   Authorization: Bearer <token>
   ```

6. **Ver tabla de posiciones:**
   ```bash
   GET /api/torneos/:id/tabla-posiciones
   Authorization: Bearer <token>
   ```

## 🚀 Características Especiales

### Generación Automática de Fixtures

- **Liga**: Genera todos los partidos posibles (todos contra todos)
- **Eliminación Directa**: Genera partidos de la primera ronda con equipos mezclados aleatoriamente

### Validaciones

- Emails únicos
- Contraseñas mínimas de 6 caracteres
- Nombres de equipos únicos por usuario
- Número de equipos válido para eliminación directa (potencia de 2)
- Goles no negativos
- Estados válidos para torneos y partidos

### Seguridad

- Contraseñas encriptadas con bcrypt
- Tokens JWT con expiración
- Validación de propiedad de recursos
- Protección contra eliminación de recursos en uso

## 📝 Notas de Desarrollo

- Todas las fechas están en formato ISO 8601
- Los IDs son enteros autoincrementales
- Las relaciones se mantienen con foreign keys
- Los errores incluyen mensajes descriptivos en español
- La API es RESTful y sigue convenciones estándar
