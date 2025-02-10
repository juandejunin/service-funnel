import { generateToken } from '../../src/utils/jwt.utils'; // Asegúrate de ajustar la ruta según tu estructura de archivos
import jwt from 'jsonwebtoken';

describe('generateToken', () => {



    it('should throw an error if token generation fails due to malformed token', () => {
        const invalidPayload = { email: 'invalid_email' }; // Un ejemplo de payload no válido

        // Simulamos que jwt.sign lanza un error de tipo malformed
        jest.spyOn(jwt, 'sign').mockImplementationOnce(() => {
            throw new jwt.JsonWebTokenError('malformed');
        });

        // Verificamos que se lance un error específico
        expect(() => generateToken(invalidPayload))
            .toThrow('El token generado tiene un formato incorrecto.');
    });

    it('should throw an error if token generation fails for unknown reasons', () => {
        const invalidPayload = { email: 'test@example.com' };

        // Simulamos un error genérico en jwt.sign
        jest.spyOn(jwt, 'sign').mockImplementationOnce(() => {
            throw new Error('Error desconocido al generar el token');
        });

        // Verificamos que se lance un error genérico
        expect(() => generateToken(invalidPayload))
            .toThrow('Error desconocido al generar el token.');
    });

});
