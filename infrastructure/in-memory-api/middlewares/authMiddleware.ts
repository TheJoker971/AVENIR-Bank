import { Request, Response, NextFunction } from 'express';

/**
 * Middleware d'authentification simple basé sur les tokens
 * Décode le token et ajoute les informations utilisateur dans les headers
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Si pas de token, continuer quand même (pour les routes publiques)
      return next();
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Décoder le token (format: userId:role:timestamp en base64)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId, role] = decoded.split(':');

      // Ajouter les headers pour compatibilité avec le système existant
      req.headers['x-user-id'] = userId;
      req.headers['x-user-role'] = role;

      return next();
    } catch (error) {
      // Token invalide, continuer quand même
      return next();
    }
  } catch (error) {
    return next();
  }
};

/**
 * Middleware pour protéger les routes (nécessite une authentification)
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  return next();
};

