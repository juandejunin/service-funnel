# ---- Etapa de construcción ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos los package.json antes de instalar dependencias
COPY package*.json ./

# Instalamos dependencias de desarrollo (para compilar)
RUN npm install

# Copiamos todo el código fuente al contenedor
COPY . .

# Compilamos TypeScript
RUN npm run build

# ---- Etapa final (producción) ----
FROM node:20-alpine

WORKDIR /app

# Copiamos solo el build y archivos necesarios desde la etapa de builder
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Instalamos solo dependencias de producción
RUN npm install --omit=dev

# Copiamos la carpeta "files"
COPY files ./files

# Exponemos el puerto del backend
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "dist/index.js"]
