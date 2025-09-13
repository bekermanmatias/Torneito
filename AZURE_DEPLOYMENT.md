# Despliegue en Azure - Torneito

## Archivos necesarios para Azure

### 1. `docker-compose.azure.yml`
Este archivo está optimizado para Azure y usa las imágenes de Docker Hub:
- ✅ Usa las imágenes subidas a Docker Hub (`bekermanmatias/torneito-*`)
- ✅ Incluye health checks para mejor monitoreo
- ✅ Variables de entorno configurables
- ✅ Optimizado para producción

### 2. `env.azure.example`
Archivo de ejemplo para las variables de entorno. Copia como `.env` y configura:
- `DB_PASSWORD`: Contraseña segura para PostgreSQL
- `JWT_SECRET`: Clave secreta para JWT (debe ser larga y segura)
- `CORS_ORIGIN`: URL de tu aplicación en Azure
- `CLOUDINARY_*`: Credenciales de Cloudinary

## Diferencias entre local y Azure

| Aspecto | Local | Azure |
|---------|-------|-------|
| **Imágenes** | Se construyen localmente | Se descargan de Docker Hub |
| **Variables** | Archivo .env en backend/ | Variables de entorno del sistema |
| **Base de datos** | Volumen local | Volumen persistente de Azure |
| **Health checks** | No incluidos | Incluidos para monitoreo |
| **Seguridad** | Básica | Variables de entorno seguras |

## Cómo desplegar en Azure

### Opción 1: Azure Container Instances (ACI)
```bash
# 1. Copia el archivo de variables
cp env.azure.example .env

# 2. Configura las variables en .env

# 3. Despliega con Docker Compose
docker-compose -f docker-compose.azure.yml up -d
```

### Opción 2: Azure App Service
1. Conecta tu repositorio a Azure App Service
2. Configura las variables de entorno en el portal de Azure
3. Azure automáticamente usará el `docker-compose.azure.yml`

### Opción 3: Azure Container Apps
1. Usa Azure Container Apps para orquestación
2. Cada servicio se despliega como una app separada
3. Configura las variables de entorno en cada app

## Variables de entorno requeridas en Azure

```bash
# Base de datos
DB_PASSWORD=tu_password_seguro

# JWT
JWT_SECRET=clave_super_secreta_y_larga
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://tu-app.azurewebsites.net

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## Verificación del despliegue

Una vez desplegado, verifica que todos los servicios estén funcionando:

```bash
# Verificar contenedores
docker-compose -f docker-compose.azure.yml ps

# Verificar logs
docker-compose -f docker-compose.azure.yml logs

# Verificar health checks
docker-compose -f docker-compose.azure.yml exec backend curl http://localhost:3000/health
```

## URLs de acceso

- **Frontend**: http://tu-dominio.azurewebsites.net
- **Backend API**: http://tu-dominio.azurewebsites.net:3000
- **Base de datos**: Solo accesible internamente

## Notas importantes

1. **Seguridad**: Nunca hardcodees contraseñas en el código
2. **Variables**: Usa variables de entorno para toda configuración sensible
3. **Health checks**: Los health checks ayudan a Azure a monitorear la salud de tus servicios
4. **Volúmenes**: Los datos de PostgreSQL se persisten en volúmenes de Azure
5. **Red**: Los servicios se comunican a través de la red interna de Docker
