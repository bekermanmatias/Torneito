# 🏆 Torneito Backend

Backend para la aplicación de gestión de torneos de fútbol.

## 🚀 Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- PostgreSQL
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd torneito/backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   ```
   
   Editar el archivo `.env` con tus configuraciones:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=torneito_db
   DB_USER=tu_usuario
   DB_PASSWORD=tu_password
   JWT_SECRET=tu_secret_super_seguro
   ```

4. **Crear la base de datos**
   ```sql
   CREATE DATABASE torneito_db;
   ```

5. **Ejecutar el servidor**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

## 📊 Modelos de Datos

### Usuario
- `id` - Identificador único
- `nombre` - Nombre del usuario
- `email` - Email único
- `passwordHash` - Contraseña encriptada
- `fechaRegistro` - Fecha de registro

### Equipo
- `id` - Identificador único
- `nombre` - Nombre del equipo
- `escudo_url` - URL del escudo (opcional)
- `usuarioId` - Usuario propietario

### Torneo
- `id` - Identificador único
- `nombre` - Nombre del torneo
- `tipo` - 'liga' o 'eliminacion'
- `estado` - 'pendiente', 'en_curso', 'finalizado'
- `usuarioId` - Usuario creador

### Partido
- `id` - Identificador único
- `torneoId` - Torneo al que pertenece
- `equipoLocalId` - Equipo local
- `equipoVisitanteId` - Equipo visitante
- `golesLocal` - Goles del equipo local
- `golesVisitante` - Goles del equipo visitante
- `fecha` - Fecha del partido
- `estado` - 'pendiente' o 'jugado'
- `ronda` - Ronda (para eliminación directa)

## 🔗 Relaciones

- **Usuario** → **Equipo** (1:N)
- **Usuario** → **Torneo** (1:N)
- **Torneo** ↔ **Equipo** (N:N a través de TorneoEquipo)
- **Torneo** → **Partido** (1:N)
- **Partido** → **Equipo** (N:1 para local y visitante)

## 🌐 Endpoints

### Usuarios
- `POST /api/usuarios/register` - Registrar usuario
- `POST /api/usuarios/login` - Iniciar sesión
- `GET /api/usuarios/profile` - Obtener perfil

### Equipos
- `GET /api/equipos` - Listar equipos del usuario
- `POST /api/equipos` - Crear equipo
- `PUT /api/equipos/:id` - Actualizar equipo
- `DELETE /api/equipos/:id` - Eliminar equipo

### Torneos
- `GET /api/torneos` - Listar torneos del usuario
- `POST /api/torneos` - Crear torneo
- `GET /api/torneos/:id` - Obtener torneo con detalles
- `PUT /api/torneos/:id` - Actualizar torneo
- `DELETE /api/torneos/:id` - Eliminar torneo

### Partidos
- `GET /api/partidos/torneo/:torneoId` - Listar partidos de un torneo
- `POST /api/partidos` - Crear partido
- `PUT /api/partidos/:id/resultado` - Registrar resultado
- `DELETE /api/partidos/:id` - Eliminar partido

## 🔧 Scripts Disponibles

- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en desarrollo con nodemon
- `npm test` - Ejecutar tests (pendiente)

## 📝 Notas de Desarrollo

- El servidor corre en el puerto 3001 por defecto
- La base de datos se sincroniza automáticamente al iniciar
- Los modelos incluyen validaciones y hooks automáticos
- Las contraseñas se encriptan automáticamente con bcrypt
- JWT se usa para autenticación de usuarios

## 🐳 Docker (Próximamente)

```bash
# Construir imagen
docker build -t torneito-backend .

# Ejecutar contenedor
docker run -p 3001:3001 torneito-backend
```
