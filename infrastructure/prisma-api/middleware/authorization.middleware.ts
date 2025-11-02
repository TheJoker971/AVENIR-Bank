import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

/**
 * Middleware d'autorisation par rôle
 * Vérifie que l'utilisateur a le rôle requis pour accéder à la route
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Accès interdit',
        message: `Cette route nécessite un des rôles suivants: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Rôles définis dans le système
 */
export const ROLES = {
  CLIENT: 'CLIENT',
  ADVISE: 'ADVISE', // Conseiller bancaire
  DIRECTOR: 'DIRECTOR', // Directeur de banque
  ADMIN: 'ADMIN'
} as const;

/**
 * Middlewares préconfigurés pour chaque rôle
 */
export const requireClient = requireRole(ROLES.CLIENT);
export const requireAdvisor = requireRole(ROLES.ADVISE);
export const requireDirector = requireRole(ROLES.DIRECTOR, ROLES.ADMIN);
export const requireAdmin = requireRole(ROLES.ADMIN);
