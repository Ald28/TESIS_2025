# Etapa 1: Build del proyecto
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependencias e instalarlas
COPY package.json package-lock.json* ./
RUN npm install

# Copiar todo el proyecto y construir
COPY . .
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar build generado al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# (Opcional) Sobrescribir la configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]