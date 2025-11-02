import { Request, Response, NextFunction } from 'express';
import { NotificationRepositoryInterface } from '../../../application/repositories/NotificationRepositoryInterface';

/**
 * Middleware pour vérifier que l'utilisateur peut accéder à la notification
 * Vérifie que l'utilisateur est le destinataire de la notification
 */
export const requireNotificationAccess = (notificationRepository: NotificationRepositoryInterface) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const notificationId = parseInt(req.params.id);
      
      if (isNaN(notificationId)) {
        return res.status(400).json({ error: 'ID de notification invalide' });
      }

      const notification = await notificationRepository.findById(notificationId);
      
      if (!notification) {
        return res.status(404).json({ error: 'Notification non trouvée' });
      }

      // Vérifier que l'utilisateur est le destinataire de la notification
      if (notification.getRecipientId() !== userId) {
        return res.status(403).json({ 
          error: 'Accès interdit',
          message: 'Vous n\'avez pas accès à cette notification'
        });
      }

      // Ajouter la notification à la requête
      (req as any).notification = notification;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la vérification d\'accès à la notification' });
    }
  };
};

/**
 * Middleware pour filtrer les notifications par destinataire
 * Retourne uniquement les notifications de l'utilisateur authentifié
 */
export const filterUserNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Ajouter le filtre pour que le controller ne retourne que les notifications de cet utilisateur
    (req as any).filterUserId = userId;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du filtrage des notifications' });
  }
};

