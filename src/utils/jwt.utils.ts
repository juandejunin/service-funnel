import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

if (!JWT_SECRET_KEY) {
  console.log('JWT_SECRET_KEY is missing!');
  throw new Error('La clave secreta JWT no está definida en las variables de entorno.');
}

/**
 * Genera un token JWT.
 * @param payload Datos que se incluirán en el token.
 * @param expiresIn Tiempo de expiración del token (por defecto: "1h").
 * @param options Opciones adicionales para la configuración del token.
 * @returns Token JWT como string.
 * @throws Error si ocurre un problema al generar el token.
 */
export const generateToken = (
  payload: object,
  expiresIn: string = '1h',
  options: SignOptions = {}
): string => {
  try {
    return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn, ...options });
  } catch (error: unknown) {
    if (error instanceof jwt.JsonWebTokenError) {
      if (error.message.includes('malformed')) {
        throw new Error('El token generado tiene un formato incorrecto.');
      } else if (error.message.includes('expired')) {
        throw new Error('El token generado ha expirado.');
      } else {
        throw new Error('Error generando el token JWT. Verifica la configuración.');
      }
    }
    throw new Error('Error desconocido al generar el token.');
  }
};

/**
 * Verifica un token JWT.
 * @param token El token a verificar.
 * @param secret La clave secreta usada para firmar el token.
 * @returns El payload decodificado.
 * @throws Error si el token no es válido o ha expirado.
 */
export function verifyToken(token: string, secret: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === 'object' && decoded !== null) {
      return decoded as JwtPayload;
    }
    throw new Error('El token no contiene un payload válido.');
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      if (error.message.includes('malformed')) {
        throw new Error('Token inválido: formato incorrecto.');
      } else if (error.message.includes('expired')) {
        throw new Error('Token inválido: ha expirado.');
      } else {
        throw new Error('Token inválido: error desconocido.');
      }
    }
    throw new Error('Error al verificar el token.');
  }
}
