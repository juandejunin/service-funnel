# Proyecto: **Sistema de Registro de Usuarios**

## Descripción

Este proyecto es una aplicación backend construida con Node.js, Express, TypeScript y MongoDB para gestionar el registro de usuarios. Permite a los usuarios crear una cuenta proporcionando su nombre y correo electrónico. La aplicación sigue el paradigma de Programación Orientada a Objetos (POO) para estructurar mejor el código y facilitar su mantenimiento y escalabilidad. Además, se han implementado medidas de seguridad para proteger las entradas de los usuarios y evitar ataques comunes como XSS (Cross-Site Scripting).

### Rendimiento Destacado:
- Solicitudes por segundo: 1787.74 solicitudes por segundo
- Tiempo promedio por solicitud: 5.594 ms
- Tasa de transferencia: 700.08 Kbytes/sec
- Tiempo máximo de respuesta: 35 ms
- Pruebas realizadas con Apache Benchmark (ab), con 1000 solicitudes y 10 conexiones simultáneas. Estos resultados demuestran la capacidad de la aplicación para manejar un alto volumen de solicitudes concurrentes, lo que la hace ideal para entornos de producción de alto tráfico.

## Tecnologías

- **Node.js**: Entorno de ejecución de JavaScript en el servidor.
- **Express**: Framework para construir aplicaciones web en Node.js.
- **TypeScript**: Lenguaje que extiende JavaScript añadiendo tipos estáticos.
- **MongoDB**: Base de datos NoSQL.
- **Mongoose**: Biblioteca de ODM para interactuar con MongoDB.
- **Validator**: Librería para validar y sanitizar entradas.
- **XSS Protection**: Protección contra ataques de XSS utilizando las librerías `xss` y `sanitize-html`.

## Estructura del Proyecto

El código está organizado siguiendo el paradigma de Programación Orientada a Objetos (POO). El proyecto se estructura en clases que representan diferentes responsabilidades del sistema:

- **UserController**: Contiene la lógica para manejar las solicitudes HTTP relacionadas con los usuarios.
- **UserService**: Gestiona la lógica de negocio y la interacción con la base de datos.
- **UserModel**: Representa el modelo de datos del usuario para la base de datos MongoDB.

### Estructura de Carpetas

![Descripción de la imagen](https://github.com/juandejunin/service-funnel.git/docs/folders.png)

## Funcionalidades

1. **Registro de usuarios**:

   - Los usuarios pueden registrarse proporcionando su nombre y correo electrónico.
   - El correo electrónico debe ser válido.
   - El nombre debe ser único y sin caracteres especiales (solo letras y espacios).

2. **Medidas de Seguridad**:
   - **Validación de entradas**: Se valida que los campos de nombre y correo electrónico sean correctos antes de registrar al usuario.
   - **Sanitización contra XSS**: Se sanitizan las entradas para evitar ataques de inyección de código malicioso.
   - **Protección contra caracteres especiales**: Se impide que se ingresen caracteres especiales en el nombre del usuario (solo letras y espacios).
   - **Longitud del nombre**: Se valida que el nombre tenga entre 3 y 50 caracteres.
   - **Normalización del correo electrónico**: Se normaliza el correo electrónico para evitar inconsistencias.

## Instalación

### Requisitos previos

1. **Node.js**: Asegúrate de tener **Node.js** instalado en tu sistema. Puedes verificarlo ejecutando:

```
   node -v
```

2. **MongoDB**: Necesitarás una base de datos MongoDB en funcionamiento. Si no tienes una local, puedes usar MongoDB Atlas.

3. **TypeScript**: El proyecto está escrito en TypeScript, así que necesitas tener instalado TypeScript globalmente:

```
npm install -g typescript
```

## Pasos para instalar y ejecutar el proyecto

1. Clona este repositorio:

```
git clone https://github.com/tuusuario/tu-repositorio.git
```

2.  Navega al directorio del proyecto:

```
cd tu-repositorio
```

3. Instala las dependencias:

```
npm install
```

4. Crea un archivo .env en la raíz del proyecto con las siguientes variables de entorno:

```
NODE_ENV=

PORT=xxxx

MONGODB_URI=mongodb+srv://usuario:contraseña@xxxxxxxxxxxxxxxx

EMAIL_USER=xxxxxxxx@xxxx.xxxxxxxx

EMAIL_PASSWORD=xxxx xxxx xxxx xxxx


JWT_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxx

BASE_URL=http://localhost:xxxx

BASE_HOST=localhost

REDIS_HOST=redis
REDIS_PORT=xxxx
REDIS_PASSWORD= xxxxxxxxxxxxxxxxxxxxxxxxxx

ETHEREAL_USER=xxxxxxxxxxxxxxxxxxxx@ethereal.email
ETHEREAL_PASS=xxxxxxxxxxxxxxxxxxxx

FRONTEND_URL=http://localhost:xxxx 
```

5. Compila los archivos TypeScript:

```
tsc
```

6. Inicia el servidor:

```
npm start
```

## Rutas

POST /api/users/register: Registra un nuevo usuario proporcionando un JSON con los campos nombre y email.

Ejemplo de solicitud:

```
{
  "nombre": "Juan Pérez",
  "email": "juanperez@mail.com",
  "acepta_politicas":true
}
```

Respuesta de éxito:

```
{
    "mensaje": "¡Gracias por registrarte! Hemos enviado un correo electrónico con las indicaciones para completar tu registro. Por favor, revisa tu bandeja de entrada (y también la carpeta de spam).",
    "usuario": {
        "mensaje": "Usuario registrado y correo de verificación enviado"
    }
}
```

## Configuración de Docker

Este proyecto utiliza Docker para simplificar la configuración y despliegue de la aplicación. Docker nos permite contenerizar tanto el servicio backend como el servicio de Redis, asegurando consistencia en diferentes entornos.

### ¿Por qué usamos Docker?

Consistencia del entorno: Docker asegura que la aplicación se ejecute de la misma manera en diferentes entornos (desarrollo, producción, etc.) sin tener que preocuparnos por las dependencias o configuraciones.
Despliegue simplificado: Al usar Docker Compose, podemos gestionar y levantar tanto el servicio backend como el servicio de Redis con un solo comando.
Aislamiento: Los contenedores de Docker nos permiten aislar los servicios, haciendo el proceso de desarrollo más limpio y manejable.
Cómo levantar el servidor con Docker:
Asegúrate de tener Docker instalado: Asegúrate de que Docker esté instalado en tu sistema. Puedes verificar si Docker está instalado ejecutando:

```
docker --version
```

Construir y levantar los servicios: Navega al directorio del proyecto y usa Docker Compose para construir y levantar los servicios de backend y Redis. Ejecuta el siguiente comando:

```
docker-compose up --build
```

Esto hará lo siguiente:

Construir las imágenes Docker para los servicios de backend y Redis (si no están construidas previamente).
Levantar los contenedores para ambos servicios.
Exponer el backend en el puerto 3000 y Redis en el puerto 6379.
Acceder al backend: Una vez que los servicios estén en funcionamiento, puedes acceder a la API del backend navegando a:

```
http://localhost:3000
```

Detener los servicios: Para detener los servicios en ejecución, usa el siguiente comando:

```
docker-compose down
```

Esto detendrá y eliminará los contenedores, redes y volúmenes creados por Docker Compose.

## Medidas de Seguridad

A continuación se describen las medidas de seguridad que hemos implementado para proteger el sistema de ataques comunes:

Validación de entradas:

Nombre: El nombre debe contener solo letras (con o sin acentos) y espacios. Se rechazan caracteres especiales.
Correo electrónico: Se valida que el correo tenga un formato correcto utilizando la librería validator.
Longitud del nombre: El nombre debe tener entre 3 y 50 caracteres.
Sanitización contra XSS: Utilizamos las librerías xss y sanitize-html para limpiar las entradas de usuario y evitar la ejecución de código malicioso que podría aprovecharse en ataques de tipo XSS.

Normalización de correo electrónico: El correo electrónico es normalizado para evitar inconsistencias (como diferentes mayúsculas y minúsculas) antes de ser almacenado.

Protección contra ataques de inyección: Utilizamos el paquete validator para asegurar que los campos no contengan datos maliciosos o peligrosos que puedan llevar a un ataque de inyección o XSS.

Futuras Mejoras
Autenticación y autorización: Implementar autenticación utilizando JWT para proteger las rutas privadas y mejorar la seguridad del sistema.
Pruebas de seguridad adicionales: Continuar con pruebas de seguridad, incluyendo protección contra ataques CSRF y uso de HTTPS para todas las comunicaciones.
Optimización del rendimiento: Mejorar el manejo de bases de datos y la eficiencia de las consultas para mejorar el rendimiento de la aplicación.
Contribuciones
Si deseas contribuir a este proyecto, por favor sigue estos pasos:

Haz un fork de este repositorio.
Crea una nueva rama (git checkout -b feature/nueva-caracteristica).
Realiza tus cambios.
Haz commit de tus cambios (git commit -am 'Agregada nueva característica').
Haz push a tu rama (git push origin feature/nueva-caracteristica).
Abre un pull request para que tus cambios sean revisados.

## Uso de Redis para el envío asincrónico de correos electrónicos

En este proyecto, hemos integrado Redis para optimizar el proceso de registro de usuarios mediante el envío asincrónico de correos electrónicos. Este enfoque se utiliza para mejorar la velocidad de la creación de usuarios, evitando que el proceso se ralentice al tener que esperar la confirmación del correo de verificación.

### ¿Por qué Redis?

Al utilizar Redis como una cola de mensajes, podemos enviar los correos electrónicos en segundo plano sin bloquear la creación del usuario. En lugar de esperar que el correo de verificación sea enviado antes de finalizar el registro, ahora se agrega a una cola y se procesa de manera independiente. Esto reduce considerablemente el tiempo que tarda en completarse el proceso de registro, mejorando la experiencia del usuario y la eficiencia del sistema.

### Funcionamiento

Registro de usuario: Cuando un nuevo usuario se registra, sus datos se guardan en la base de datos.
Encolado del correo electrónico: El envío del correo de verificación se agrega a una cola de Redis.
Procesamiento asincrónico: Un worker de Redis toma los correos electrónicos pendientes de la cola y los envía de manera asincrónica.
Confirmación del correo: El correo de verificación se envía sin afectar el proceso de registro del usuario, que se completa de inmediato.
Beneficios
Reducción de latencia: La creación del usuario es más rápida al no depender del envío del correo electrónico.
Escalabilidad: El sistema puede manejar un mayor volumen de registros y correos electrónicos sin afectar el rendimiento.
Mejora en la experiencia del usuario: Los usuarios no tienen que esperar largos períodos para completar el registro, ya que el proceso se maneja de forma más eficiente.

## Medidas de Seguridad Implementadas en Docker y Redis

Este proyecto utiliza Docker para contenerizar los servicios y Redis como sistema de colas para tareas en segundo plano, como el envío de correos electrónicos. Para garantizar la seguridad de Redis y prevenir accesos no autorizados, se implementaron varias medidas clave en la configuración del entorno Docker.

### 1. Red Interna de Docker

Para limitar el acceso a los servicios dentro de los contenedores, se configuró una red interna de Docker. Esto asegura que solo los servicios que forman parte de la misma red puedan comunicarse entre sí, evitando accesos externos a servicios como Redis.
En el archivo docker-compose.yml, se definió la red interna como sigue:

```
networks:
  internal_net:
    driver: bridge
```

Ambos servicios (Redis y backend) están conectados a esta red interna, lo que restringe su comunicación únicamente dentro de este entorno.

### 2. Contraseña para Redis

Redis fue configurado para requerir autenticación antes de permitir cualquier operación. Esta medida agrega una capa de seguridad para prevenir el uso no autorizado de Redis, lo que podría ser aprovechado para realizar acciones maliciosas, como el envío de correos fraudulentos.

En el archivo docker-compose.yml, se añadió la configuración de la contraseña para Redis:

```
redis:
  image: redis:latest
  container_name: redis_service
  command: redis-server --requirepass ${REDIS_PASSWORD}
  networks:
    - internal_net
```

La contraseña se define mediante una variable de entorno REDIS_PASSWORD, la cual se carga en el entorno del contenedor para garantizar que Redis no acepte conexiones sin autenticación.

### 3. Configuración del Código para Uso de Variables de Entorno

Para evitar que las credenciales se encuentren directamente en el código, se configuraron variables de entorno para que el backend y el worker utilicen el nombre del servicio, el puerto y la contraseña de Redis de manera segura:

```
this.emailQueue = new Queue('emailQueue', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  }
});
```

De este modo, el código puede acceder a Redis de manera segura sin tener que hardcodear las credenciales, y las variables de entorno se configuran automáticamente al iniciar el contenedor.

### 4. Evitar Exposición del Puerto REDIS

Para evitar que el puerto de Redis esté accesible desde fuera del contenedor, se eliminó la sección ports del servicio Redis en el archivo docker-compose.yml:

```
redis:
  image: redis:latest
  container_name: redis_service
  networks:
    - internal_net
  command: redis-server --requirepass ${REDIS_PASSWORD}
```

De esta forma, Redis solo está disponible para otros servicios dentro de la red interna de Docker, y no es accesible desde el exterior. Esto reduce el riesgo de que un atacante pueda intentar conectarse a Redis directamente a través de la red pública.

### 5. Configuración de Redis para Aceptar Solo Conexiones Internas

Se configuró Redis para que solo acepte conexiones de localhost o de la red interna de Docker. Esto se hace agregando la siguiente configuración en el archivo redis.conf (que puede ser modificado al montar el archivo dentro del contenedor):

```
bind 127.0.0.1 ::1
requirepass ${REDIS_PASSWORD}
```

Esto asegura que Redis no escuche en direcciones IP externas, lo que agrega una capa adicional de seguridad al restringir las conexiones solo a los contenedores de Docker.

### 6. Autenticación de Redis en el Backend y Worker

Con la configuración anterior, cualquier intento de acceder a Redis sin la autenticación adecuada generará un error, como el siguiente:

```
ReplyError: NOAUTH Authentication required
```

Esto es una señal de que la seguridad está funcionando correctamente, ya que Redis requiere que los servicios proporcionen la contraseña correctamente antes de permitir cualquier operación.

