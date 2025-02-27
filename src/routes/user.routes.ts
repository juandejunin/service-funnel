import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validateUserRegistration } from "../middlewares/validation.middleware";
import { VisitController } from "../controllers/visit.controller";



const router = Router();
const userController = new UserController();
const visitController = new VisitController(); // Instancia del controlador de visitas

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Crea un usuario y envía un correo de verificación.
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - acepta_politicas
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del usuario.
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario.
 *                 example: "juanperez@example.com"
 *               acepta_politicas:
 *                 type: boolean
 *                 description: Indica si el usuario acepta las políticas de privacidad.
 *                 example: true
 *     responses:
 *       201:
 *         description: Usuario registrado y correo enviado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "¡Gracias por registrarte! Hemos enviado un correo electrónico con las indicaciones para completar tu registro. Por favor, revisa tu bandeja de entrada (y también la carpeta de spam)."
 *                 usuario:
 *                   type: object
 *                   description: Datos del usuario registrado.
 *       400:
 *         description: Error en los datos enviados.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "El email ya está registrado."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Error inesperado al registrar el usuario."
 */

/**
 * @swagger
 * /api/users/verify-email:
 *   get:
 *     summary: Verifica el correo electrónico de un usuario a través de un token.
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token de verificación enviado por correo.
 *     responses:
 *       302:
 *         description: Redirección al frontend con el resultado de la verificación.
 *       400:
 *         description: El token es requerido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Token is required"
 */


/**
 * @swagger
 * /api/visits/track:
 *   get:
 *     summary: Registra una visita a la página.
 *     tags:
 *       - Visitas
 *     responses:
 *       200:
 *         description: Visita registrada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 visits:
 *                   type: number
 *                   example: 42
 *       500:
 *         description: Error al registrar la visita.
 */

/**
 * @swagger
 * /api/visits:
 *   get:
 *     summary: Consulta el total de visitas.
 *     tags:
 *       - Visitas
 *     responses:
 *       200:
 *         description: Total de visitas devuelto.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 visits:
 *                   type: number
 *                   example: 42
 *       500:
 *         description: Error al consultar las visitas.
 */

router.post(
  "/register",
  validateUserRegistration,
  userController.register.bind(userController)
); // Ruta para registrar usuario

router.get("/verify-email", userController.verifyEmail.bind(userController)); // Ruta para verificar email
router.get("/resend-file", userController.resendFile.bind(userController));

router.get("/visits/track", visitController.trackVisit.bind(visitController));


router.get("/visits", visitController.getVisits.bind(visitController));
export default router;
