# Usamos una imagen base ligera con Node.js
FROM node:20-alpine

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos necesarios antes de instalar dependencias
COPY package.json package-lock.json ./

# Instalamos dependencias
RUN npm install --omit=dev

# Copiamos todo el código fuente al contenedor
COPY . .

# Compilamos TypeScript (si es necesario)
RUN npm run build

# Copiar la carpeta "files" a "dist/files"
RUN mkdir -p dist/files && cp -r src/files/* dist/files/

# Exponemos el puerto 3000 del backend
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
