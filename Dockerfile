# Usamos una imagen base ligera con Node.js
FROM node:18-alpine AS builder

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos necesarios antes de instalar dependencias
COPY package*.json ./

# Instalamos dependencias de desarrollo (para compilar)
RUN npm install

# Copiamos todo el código fuente al contenedor
COPY . .

# Compilamos TypeScript
RUN npm run build

# ---- Etapa final (producción) ----
FROM node:18-alpine
WORKDIR /app

# Copiamos solo el build y archivos necesarios desde la etapa anterior
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Instalamos solo dependencias de producción
RUN npm install --omit=dev

# Copiamos la carpeta "files" (que está en la raíz del proyecto)
COPY files ./files

# Exponemos el puerto 3000 del backend
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "dist/index.js"]
