# Usa la imagen oficial de Node.js como base
FROM node:14

# Crea el directorio de trabajo
WORKDIR /usr/src/app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto en el que corre la aplicación
EXPOSE 8080

# Define el comando para correr la aplicación
CMD ["node", "server.js"]