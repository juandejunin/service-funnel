# Proyecto: **Sistema de Registro de Usuarios**

## Descripción

Este proyecto es una aplicación backend construida con **Node.js**, **Express**, **TypeScript** y **MongoDB** para gestionar el registro de usuarios. Permite a los usuarios crear una cuenta proporcionando su nombre y correo electrónico. La aplicación sigue el paradigma de **Programación Orientada a Objetos (POO)** para estructurar mejor el código y facilitar su mantenimiento y escalabilidad. Además, se han implementado medidas de seguridad para proteger las entradas de los usuarios y evitar ataques comunes como **XSS** (Cross-Site Scripting).

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
my-project/
│
├── public/                     # Archivos públicos (HTML, CSS, JS)
│   ├── assets/                 # Archivos de recursos estáticos (imagenes, videos, etc.)
│   ├── css/                    # Archivos CSS
│   ├── js/                     # Archivos JS
│   └── index.html              # Página de inicio
│
├── src/                        # Código fuente del back-end
│   ├── config/                 # Configuración de la base de datos y variables
│   │   └── database.ts         # Configuración de la base de datos
│   ├── controllers/            # Controladores para manejar las rutas
│   │   └── user.controller.ts  # Controlador de usuarios
│   ├── middlewares/            # Middlewares de validación y sanitización
│   │   └── validation.middleware.ts  # Validación del registro de usuario
│   ├── models/                 # Modelos de Mongoose
│   │   └── user.model.ts       # Modelo de usuario con Mongoose
│   ├── routes/                 # Rutas del proyecto
│   │   └── user.routes.ts      # Rutas de usuario (registro, login, etc.)
│   ├── services/               # Servicios para manejar la lógica de negocio
│   │   └── user.service.ts     # Lógica de negocio para usuarios
│   └── index.ts                # Archivo principal para arrancar el servidor
│
└── test/                       # Archivos de pruebas
    ├── user.test.ts            # Pruebas de la lógica de usuario
    └── ...                     # Otras pruebas


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

 2. Navega al directorio del proyecto:
 ```
 cd tu-repositorio
 ```
3. Instala las dependencias:

```
npm install
```
4. Crea un archivo .env en la raíz del proyecto con las siguientes variables de entorno:

```
MONGO_URI=mongodb://localhost:27017/tu_base_de_datos
PORT=3000
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
  "email": "juan.perez@example.com"
}
```

Respuesta de éxito:

```
{
  "mensaje": "Usuario registrado correctamente",
  "usuario": {
    "nombre": "Juan Pérez",
    "email": "juan.perez@example.com",
    "_id": "60d6f7b9c5d1e520f836e8a9"
  }
}
```

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