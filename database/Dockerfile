# Dockerfile para Base de Datos PostgreSQL de Torneito
FROM postgres:15-alpine

# Establecer variables de entorno
ENV POSTGRES_DB=torneito_db
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=password

# Crear directorio para scripts de inicialización
RUN mkdir -p /docker-entrypoint-initdb.d

# Copiar script de inicialización
COPY init-db.sql /docker-entrypoint-initdb.d/

# Exponer puerto
EXPOSE 5432

# El comando por defecto de postgres:15-alpine ya maneja la inicialización
