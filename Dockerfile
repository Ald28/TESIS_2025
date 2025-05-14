# Usamos Node oficial como base
FROM node:18

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de definición
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del proyecto
COPY . .

# Puerto expuesto
EXPOSE 8080

# Comando de inicio
CMD ["npm", "start"]