import { Request, Response, NextFunction } from 'express';

/**
 * Middleware d'authentification basique
 * Vérifie que l'utilisateur est authentifié via un header X-User-Id
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ 
      error: 'Non autorisé',
      message: 'Vous devez être authentifié pour accéder à cette ressource'
    });
  }

  const userIdNumber = parseInt(userId as string);
  if (isNaN(userIdNumber)) {
    return res.status(401).json({ 
      error: 'Identifiant utilisateur invalide',
      message: 'L\'ID utilisateur doit être un nombre'
    });
  }

  // Ajouter l'ID de l'utilisateur authentifié à la requête
  (req as any).userId = userIdNumber;
  next();
};

/**
 * Middleware d'autorisation basé sur les rôles
 * Vérifie que l'utilisateur a le bon rôle pour accéder à la ressource
 */
export const requireRole = (...allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Récupérer l'utilisateur depuis l'ID dans la requête
      // Pour simplifier, on utilise un header X-User-Role
      // Dans une vraie application, on récupérerait l'utilisateur depuis la base de données
      const userRole = req.headers['x-user-role'];

      if (!userRole) {
        return res.status(403).json({ 
          error: 'Accès interdit',
          message: 'Rôle utilisateur manquant'
        });
      }

      if (!allowedRoles.includes(userRole as string)) {
        return res.status(403).json({ 
          error: 'Accès interdit',
          message: `Vous devez avoir l'un des rôles suivants: ${allowedRoles.join(', ')}`
        });
      }

      (req as any).userRole = userRole;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la vérification des permissions' });
    }
  };
};

/**
 * Middleware pour vérifier que l'utilisateur est propriétaire de la ressource
 */
export const requireOwnership = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      // Vérifier que l'utilisateur est propriétaire de la ressource
      const resourceOwnerId = parseInt(req.params.userId || req.params.ownerId || req.query.userId as string || '0');
      
      if (resourceOwnerId !== userId) {
        return res.status(403).json({ 
          error: 'Accès interdit',
          message: 'Vous n\'avez pas accès à cette ressource'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la vérification de propriété' });
    }
  };
};

