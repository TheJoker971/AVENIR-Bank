import { Request, Response, NextFunction } from 'express';
import { AccountRepositoryInterface } from '../../../application/repositories/AccountRepositoryInterface';

/**
 * Middleware pour vérifier que l'utilisateur est propriétaire du compte
 */
export const requireAccountOwnership = (accountRepository: AccountRepositoryInterface) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const accountId = parseInt(req.params.id);
      
      if (isNaN(accountId)) {
        return res.status(400).json({ error: 'ID de compte invalide' });
      }

      const account = await accountRepository.findById(accountId);
      
      if (!account) {
        return res.status(404).json({ error: 'Compte non trouvé' });
      }

      // Vérifier que l'utilisateur est le propriétaire
      if (account.ownerId !== userId) {
        return res.status(403).json({ 
          error: 'Accès interdit',
          message: 'Vous n\'avez pas accès à ce compte'
        });
      }

      // Ajouter le compte à la requête
      (req as any).account = account;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la vérification d\'accès au compte' });
    }
  };
};

/**
 * Middleware pour filtrer les comptes par propriétaire
 * Retourne uniquement les comptes de l'utilisateur authentifié
 */
export const filterUserAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Ajouter le filtre pour que le controller ne retourne que les comptes de cet utilisateur
    (req as any).filterUserId = userId;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du filtrage des comptes' });
  }
};

/**
 * Middleware pour vérifier que l'utilisateur peut créer un compte
 * Seuls les utilisateurs authentifiés peuvent créer un compte
 */
export const requireCanCreateAccount = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      // Vérifier que l'utilisateur crée un compte pour lui-même ou qu'il est un employé
      const userRole = req.headers['x-user-role'];
      const { ownerId } = req.body;

      // Si c'est un employé (ADVISE, DIRECTOR), il peut créer pour n'importe qui
      if (['ADVISE', 'DIRECTOR'].includes(userRole as string)) {
        next();
        return;
      }

      // Sinon, il doit créer pour lui-même
      const requestedOwnerId = parseInt(ownerId);
      if (requestedOwnerId !== userId) {
        return res.status(403).json({ 
          error: 'Accès interdit',
          message: 'Vous ne pouvez créer un compte que pour vous-même'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la vérification des permissions' });
    }
  };
};

