<<<<<<< HEAD
# ---- Etapa de producción ----
=======
 ---- Etapa de producción ----
>>>>>>> 049311de0bbeefca62cbcc3195b4c250594385cf
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos solo dependencias de producción
RUN npm install --omit=dev

# Copiamos los archivos compilados y necesarios (dist y files)
COPY dist ./dist
COPY files ./files

# Exponemos el puerto del backend
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "dist/index.js"]

