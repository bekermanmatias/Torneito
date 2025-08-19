# 🧪 Guía de Testing - API Torneito

Guía completa para probar la API de gestión de torneos de fútbol usando Postman.

## 🚀 Configuración Inicial

### 1. Levantar la Base de Datos

```bash
# Levantar PostgreSQL y pgAdmin
docker-compose up -d

# Verificar que los servicios estén funcionando
docker-compose ps
```

**Servicios disponibles:**
- **PostgreSQL**: `localhost:5432`
- **pgAdmin**: `http://localhost:5050` (admin@torneito.com / admin123)

### 2. Configurar el Backend

```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias (si no están instaladas)
npm install

# Iniciar el servidor
npm run dev
```

**Servidor backend**: `http://localhost:3001`

### 3. Importar Colección de Postman

1. Abrir Postman
2. Hacer clic en "Import"
3. Seleccionar el archivo `Torneito_API.postman_collection.json`
4. La colección se importará con todas las variables configuradas

## 🔧 Variables de Postman

La colección incluye las siguientes variables que se actualizan automáticamente:

- **`base_url`**: `http://localhost:3001`
- **`auth_token`**: Token JWT (se actualiza automáticamente al hacer login)
- **`equipo_id`**: ID del equipo (se actualiza manualmente)
- **`torneo_id`**: ID del torneo (se actualiza manualmente)
- **`partido_id`**: ID del partido (se actualiza manualmente)

## 📋 Flujo de Testing

### Paso 1: Registrar Usuario

1. Ejecutar **"Registrar Usuario"**
2. Body:
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "123456"
}
```
3. Copiar el `token` de la respuesta

### Paso 2: Configurar Token

1. En la colección, ir a "Variables"
2. Actualizar `auth_token` con el token copiado
3. O usar el script automático en la respuesta del login

### Paso 3: Crear Equipos

1. Ejecutar **"Crear Equipo"** varias veces:
```json
{
  "nombre": "Real Madrid",
  "escudo_url": "https://ejemplo.com/real-madrid.png"
}
```

```json
{
  "nombre": "Barcelona",
  "escudo_url": "https://ejemplo.com/barcelona.png"
}
```

```json
{
  "nombre": "Atlético Madrid",
  "escudo_url": "https://ejemplo.com/atletico.png"
}
```

```json
{
  "nombre": "Sevilla",
  "escudo_url": "https://ejemplo.com/sevilla.png"
}
```

### Paso 4: Crear Torneo

1. Ejecutar **"Crear Torneo Liga"**:
```json
{
  "nombre": "Liga Española 2024",
  "tipo": "liga",
  "equiposIds": [1, 2, 3, 4]
}
```

2. Copiar el `id` del torneo creado y actualizar `torneo_id`

### Paso 5: Probar Funcionalidades

#### Obtener Partidos
- Ejecutar **"Obtener Partidos de Torneo"**
- Verificar que se generaron automáticamente los partidos

#### Registrar Resultados
1. Ejecutar **"Obtener Partidos de Torneo"**
2. Copiar el `id` del primer partido y actualizar `partido_id`
3. Ejecutar **"Registrar Resultado"**:
```json
{
  "golesLocal": 2,
  "golesVisitante": 1
}
```

#### Ver Tabla de Posiciones
- Ejecutar **"Tabla de Posiciones"** para ver las estadísticas

## 🧪 Casos de Prueba

### Casos de Éxito

1. **Registro de Usuario**
   - ✅ Usuario válido
   - ✅ Email único
   - ✅ Contraseña mínima 6 caracteres

2. **Login**
   - ✅ Credenciales correctas
   - ✅ Token JWT generado

3. **Gestión de Equipos**
   - ✅ Crear equipo
   - ✅ Listar equipos
   - ✅ Buscar equipos
   - ✅ Actualizar equipo
   - ✅ Eliminar equipo

4. **Gestión de Torneos**
   - ✅ Crear torneo de liga
   - ✅ Crear torneo de eliminación
   - ✅ Generación automática de fixtures
   - ✅ Tabla de posiciones

5. **Gestión de Partidos**
   - ✅ Registrar resultados
   - ✅ Actualizar resultados
   - ✅ Eliminar resultados
   - ✅ Estadísticas de equipos

### Casos de Error

1. **Validaciones**
   - ❌ Email duplicado
   - ❌ Contraseña muy corta
   - ❌ Nombre de equipo duplicado
   - ❌ Goles negativos
   - ❌ Número de equipos inválido para eliminación

2. **Autenticación**
   - ❌ Token inválido
   - ❌ Token expirado
   - ❌ Sin token

3. **Autorización**
   - ❌ Acceso a recursos de otro usuario
   - ❌ Eliminar equipo en uso
   - ❌ Eliminar torneo con partidos jugados

## 🔍 Verificación de Base de Datos

### Usando pgAdmin

1. Abrir `http://localhost:5050`
2. Login: `admin@torneito.com` / `admin123`
3. Agregar servidor:
   - **Host**: `postgres` (nombre del contenedor)
   - **Port**: `5432`
   - **Database**: `torneito_db`
   - **Username**: `postgres`
   - **Password**: `password`

### Usando psql

```bash
# Conectar a la base de datos
docker exec -it torneito_postgres psql -U postgres -d torneito_db

# Verificar tablas
\dt

# Verificar datos
SELECT * FROM usuarios;
SELECT * FROM equipos;
SELECT * FROM torneos;
SELECT * FROM partidos;
```

## 📊 Monitoreo

### Logs del Backend

```bash
# Ver logs en tiempo real
cd backend
npm run dev
```

### Logs de Docker

```bash
# Ver logs de PostgreSQL
docker-compose logs postgres

# Ver logs de pgAdmin
docker-compose logs pgadmin

# Ver todos los logs
docker-compose logs -f
```

## 🚨 Solución de Problemas

### Error de Conexión a la Base de Datos

```bash
# Verificar que PostgreSQL esté funcionando
docker-compose ps

# Reiniciar servicios
docker-compose restart

# Ver logs de error
docker-compose logs postgres
```

### Error de Puerto en Uso

```bash
# Verificar puertos en uso
netstat -an | findstr :3001
netstat -an | findstr :5432

# Cambiar puertos en docker-compose.yml si es necesario
```

### Error de Autenticación

1. Verificar que el token JWT sea válido
2. Verificar que el token no haya expirado
3. Regenerar token haciendo login nuevamente

## 🎯 Próximos Pasos

1. **Probar todos los endpoints** de la colección
2. **Verificar validaciones** con datos inválidos
3. **Probar casos límite** (máximo de equipos, etc.)
4. **Verificar integridad** de datos en la base de datos
5. **Probar rendimiento** con múltiples usuarios

## 📝 Notas Importantes

- Los IDs se generan automáticamente, actualizar las variables según sea necesario
- El token JWT expira en 7 días por defecto
- Los partidos se generan automáticamente al crear un torneo
- La tabla de posiciones solo funciona para torneos de liga
- Los equipos no se pueden eliminar si están en torneos activos
