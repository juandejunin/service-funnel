import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateUserRegistration } from '../middlewares/validation.middleware';


const router = Router();
const userController = new UserController();

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
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario registrado y correo enviado.
 *       500:
 *         description: Error interno del servidor.
 */

router.post('/register', validateUserRegistration, userController.register.bind(userController));  // Ruta para registrar usuario

router.get('/verify-email', userController.verifyEmail.bind(userController)); // Ruta para verificar email



export default router;
