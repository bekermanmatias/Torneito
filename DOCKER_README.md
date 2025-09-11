# Docker Setup - Torneito

Este documento explica cómo ejecutar la aplicación Torneito usando Docker.

## Estructura de Contenedores

La aplicación está dividida en 4 contenedores:

- **postgres**: Base de datos PostgreSQL
- **backend**: API REST en Node.js
- **frontend**: Aplicación React con Nginx
- **pgadmin**: Interfaz web para administrar PostgreSQL (opcional)

## Requisitos

- Docker
- Docker Compose

## Comandos de Uso

### Construir y ejecutar todos los servicios

```bash
# Construir y ejecutar todos los contenedores
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d --build
```

### Comandos individuales

```bash
# Construir solo el backend
docker build -t torneito-backend ./backend

# Construir solo el frontend
docker build -t torneito-frontend ./frontend

# Construir solo la base de datos
docker build -t torneito-db ./database
```

### Gestión de contenedores

```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

## Puertos

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **pgAdmin**: http://localhost:5050

## Variables de Entorno

### Backend
- `NODE_ENV`: production
- `DB_HOST`: postgres
- `DB_PORT`: 5432
- `DB_NAME`: torneito_db
- `DB_USER`: postgres
- `DB_PASSWORD`: password
- `PORT`: 3000

### Base de Datos
- `POSTGRES_DB`: torneito_db
- `POSTGRES_USER`: postgres
- `POSTGRES_PASSWORD`: password

## Estructura de Archivos

```
Torneito/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .dockerignore
│   └── ...
├── database/
│   ├── Dockerfile
│   └── init-db.sql
└── docker-compose.yml
```

## Características de los Dockerfiles

### Backend
- Basado en Node.js 18 Alpine
- Usuario no-root para seguridad
- Solo dependencias de producción
- Puerto 3000 expuesto

### Frontend
- Multi-stage build (Node.js + Nginx)
- Optimización de archivos estáticos
- Configuración de compresión gzip
- Headers de seguridad
- Puerto 80 expuesto

### Base de Datos
- PostgreSQL 15 Alpine
- Script de inicialización automático
- Puerto 5432 expuesto

## Troubleshooting

### Problemas comunes

1. **Puerto ya en uso**: Cambiar los puertos en docker-compose.yml
2. **Permisos**: En Linux/Mac, puede ser necesario usar `sudo`
3. **Memoria insuficiente**: Aumentar la memoria asignada a Docker

### Limpiar Docker

```bash
# Eliminar contenedores parados
docker container prune

# Eliminar imágenes no utilizadas
docker image prune

# Eliminar volúmenes no utilizados
docker volume prune

# Limpieza completa
docker system prune -a
```
