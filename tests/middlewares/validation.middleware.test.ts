import { validateUserRegistration } from '../../src/middlewares/validation.middleware';
import { Request, Response, NextFunction } from 'express';


describe('Middleware: validateUserRegistration', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it('Debería llamar a next si los datos son válidos', () => {
        req.body = { nombre: 'Carlos', email: 'carlos@example.com' };

        validateUserRegistration(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
    });

    it('Debería devolver error si falta el nombre', () => {
        req.body = { email: 'carlos@example.com' };

        validateUserRegistration(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'El nombre es obligatorio.' });
    });

    it('Debería devolver error si el email no es válido', () => {
        req.body = { nombre: 'Carlos', email: 'carlos@example' };

        validateUserRegistration(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'El email no es válido.' });
    });



    it('Debería sanitizar correctamente un nombre válido con espacios adicionales', async () => {
        const req = {
            body: {
                nombre: '  Carlos  ', // Nombre válido pero con espacios adicionales
                email: 'carlos@example.com', // Email válido
            },
        } as Partial<Request>;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        const next = jest.fn() as NextFunction;

        // Ejecutar el middleware
        validateUserRegistration(req as Request, res, next);

        // Verificar que el nombre fue sanitizado correctamente
        expect(req.body.nombre).toBe('Carlos'); // Espacios eliminados
        expect(req.body.email).toBe('carlos@example.com'); // Email intacto

        // Verificar que se llamó a `next()` sin errores
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled(); // Ningún error reportado
    });
});