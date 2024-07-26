# Usa una imagen base oficial de Node.js
FROM node:14

# Crea un directorio de trabajo
WORKDIR /usr/src/app

# Copia el archivo package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Exponer el puerto que usa tu aplicación
EXPOSE 3000

# Comando para correr tu aplicación
CMD ["node", "index.js"]
