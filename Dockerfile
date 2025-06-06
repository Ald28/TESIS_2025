# Etapa 1: Build del proyecto
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:stable-alpine

# Elimina la configuración por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia el build de React a Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia configuración personalizada de Nginx si es necesario
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]