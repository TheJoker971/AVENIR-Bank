import { Request, Response, NextFunction } from 'express';
import { MessageRepositoryInterface } from '../../../application/repositories/MessageRepositoryInterface';

/**
 * Middleware spécifique pour l'autorisation des messages
 * Vérifie que l'utilisateur peut accéder au message (soit expéditeur, soit destinataire)
 */
export const requireMessageAccess = (messageRepository: MessageRepositoryInterface) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const messageId = parseInt(req.params.id);
      
      if (isNaN(messageId)) {
        return res.status(400).json({ error: 'ID de message invalide' });
      }

      const message = await messageRepository.findById(messageId);
      
      if (!message) {
        return res.status(404).json({ error: 'Message non trouvé' });
      }

      // Vérifier que l'utilisateur est soit l'expéditeur soit le destinataire
      const isOwner = message.senderId === userId || message.receiverId === userId;
      
      if (!isOwner) {
        return res.status(403).json({ 
          error: 'Accès interdit',
          message: 'Vous n\'avez pas accès à ce message'
        });
      }

      // Ajouter le message à la requête pour éviter de le récupérer à nouveau
      (req as any).message = message;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la vérification d\'accès au message' });
    }
  };
};

/**
 * Middleware pour vérifier que l'utilisateur peut envoyer un message
 * Un utilisateur peut envoyer un message si c'est un CLIENT ou un ADVISE
 */
export const requireCanSendMessage = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.headers['x-user-role'];

      if (!userRole) {
        return res.status(403).json({ 
          error: 'Accès interdit',
          message: 'Rôle utilisateur manquant'
        });
      }

      if (!['CLIENT', 'ADVISE'].includes(userRole as string)) {
        return res.status(403).json({ 
          error: 'Accès interdit',
          message: 'Seuls les clients et conseillers peuvent envoyer des messages'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la vérification des permissions' });
    }
  };
};

/**
 * Middleware pour vérifier que l'utilisateur peut lister ses messages
 * Retourne uniquement les messages de l'utilisateur authentifié
 */
export const filterUserMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Ajouter le filtre pour que le controller ne retourne que les messages de cet utilisateur
    (req as any).filterUserId = userId;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du filtrage des messages' });
  }
};

