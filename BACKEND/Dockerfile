# Etapa 1: Imagen base oficial
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar dependencias primero (mejora cache)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de archivos del backend
COPY . .

# Exponer el puerto usado por tu backend
EXPOSE 8080

# Comando para iniciar la app
CMD ["npm", "start"]