import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Extension de Request pour inclure l'utilisateur authentifié
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Middleware d'authentification
 * Vérifie le token JWT ou la session et ajoute l'utilisateur à la requête
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
  prisma: PrismaClient
) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token d\'authentification manquant' });
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // TODO: Valider le token JWT avec votre bibliothèque (jsonwebtoken)
    // Pour l'instant, on simule une authentification basique
    // Dans un vrai projet, vous devriez :
    // 1. Décoder et vérifier le token JWT
    // 2. Récupérer l'ID utilisateur depuis le token
    // 3. Charger l'utilisateur depuis la base de données

    // Simulation : récupérer l'utilisateur depuis le header (à remplacer par JWT)
    const userIdHeader = req.headers['x-user-id'];
    
    if (!userIdHeader) {
      return res.status(401).json({ error: 'Utilisateur non identifié' });
    }

    const userId = parseInt(userIdHeader as string);

    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    // Ajouter l'utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({ error: 'Erreur d\'authentification' });
  }
};

/**
 * Factory pour créer le middleware d'authentification avec Prisma
 */
export const createAuthMiddleware = (prisma: PrismaClient) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    await authenticate(req, res, next, prisma);
  };
};
