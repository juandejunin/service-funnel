# Usamos una imagen base ligera con Node.js
FROM node:20-alpine

# Configuramos directorio de trabajo
WORKDIR /app

# Copiamos package.json y tsconfig para instalar dependencias y build
COPY package*.json ./
COPY tsconfig*.json ./

# Instalamos todas las dependencias (dev incluidas)
RUN npm install

# Copiamos solo el código fuente
COPY src ./src
COPY files ./files

# Compilamos TypeScript
RUN npm run build

# ---- Etapa final (producción) ----
FROM node:20-alpine
WORKDIR /app

# Copiamos build y archivos necesarios
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/files ./files

# Instalamos solo deps de producción
RUN npm install --omit=dev

# Copiamos archivo de variables de entorno
COPY .env ./

# Exponemos el puerto
EXPOSE 3000

# Comando para ejecutar la app
CMD ["node", "dist/index.js"]
