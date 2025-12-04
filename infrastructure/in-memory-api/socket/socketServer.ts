/**
 * Serveur WebSocket pour les mises à jour en temps réel
 * Utilise Socket.IO pour les communications bidirectionnelles
 */
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

export class SocketServer {
  private io: SocketIOServer;
  private connectedUsers: Map<number, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: (origin, callback) => {
          // Autoriser toutes les origines localhost
          if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            callback(null, true);
          } else {
            callback(null, true); // Pour le développement
          }
        },
        credentials: true,
        methods: ['GET', 'POST'],
      },
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connecté: ${socket.id}`);

      // Authentification via token
      socket.on('authenticate', (data: { userId: number; token: string }) => {
        const { userId } = data;
        
        // Stocker la connexion de l'utilisateur
        if (!this.connectedUsers.has(userId)) {
          this.connectedUsers.set(userId, new Set());
        }
        this.connectedUsers.get(userId)!.add(socket.id);
        
        // Joindre la room de l'utilisateur pour les notifications personnalisées
        socket.join(`user:${userId}`);
        
        // Joindre les rooms selon le rôle
        socket.on('join-role-room', (role: string) => {
          socket.join(`role:${role}`);
        });

        console.log(`✅ Utilisateur ${userId} authentifié sur socket ${socket.id}`);
      });

      socket.on('disconnect', () => {
        console.log(`❌ Client déconnecté: ${socket.id}`);
        // Nettoyer les références
        this.connectedUsers.forEach((sockets, userId) => {
          if (sockets.has(socket.id)) {
            sockets.delete(socket.id);
            if (sockets.size === 0) {
              this.connectedUsers.delete(userId);
            }
          }
        });
      });
    });
  }

  /**
   * Émettre un nouveau message à tous les utilisateurs concernés
   */
  emitNewMessage(message: any): void {
    // Émettre à l'expéditeur
    if (message.senderId) {
      this.io.to(`user:${message.senderId}`).emit('new-message', message);
    }
    
    // Émettre au destinataire
    if (message.receiverId && message.receiverId > 0) {
      this.io.to(`user:${message.receiverId}`).emit('new-message', message);
    } else {
      // Si receiverId est 0, c'est un message non assigné, émettre à tous les conseillers
      this.io.to('role:ADVISE').emit('new-unassigned-message', message);
    }
  }

  /**
   * Émettre une nouvelle notification à l'utilisateur concerné
   */
  emitNewNotification(notification: any): void {
    const userId = notification.userId || notification.recipientId || 0;
    this.io.to(`user:${userId}`).emit('new-notification', notification);
    // Émettre aussi le compteur de notifications non lues
    this.emitUnreadNotificationCount(userId);
  }

  /**
   * Émettre le nombre de notifications non lues
   */
  emitUnreadNotificationCount(userId: number): void {
    // Le client devra récupérer le compte depuis l'API, mais on peut émettre un événement de rafraîchissement
    this.io.to(`user:${userId}`).emit('refresh-notifications');
  }

  /**
   * Émettre un nouvel ordre d'action
   */
  emitNewOrder(order: any): void {
    // Émettre au propriétaire de l'ordre
    this.io.to(`user:${order.clientId}`).emit('new-order', order);
    
    // Émettre une mise à jour du carnet d'ordres pour tous les utilisateurs intéressés
    this.io.emit('orderbook-update', {
      stockSymbol: order.stockSymbol,
      message: 'Nouvel ordre ajouté',
    });
  }

  /**
   * Émettre une mise à jour du carnet d'ordres
   */
  emitOrderBookUpdate(stockSymbol: string, orderBook: any): void {
    this.io.emit('orderbook-update', {
      stockSymbol,
      orderBook,
    });
  }

  /**
   * Émettre une nouvelle opération (virement)
   */
  emitNewOperation(operation: any): void {
    // Émettre aux comptes concernés (via ownerId)
    if (operation.fromAccount) {
      this.io.to(`user:${operation.fromAccount.ownerId}`).emit('new-operation', operation);
    }
    if (operation.toAccount) {
      this.io.to(`user:${operation.toAccount.ownerId}`).emit('new-operation', operation);
    }
  }

  /**
   * Émettre une mise à jour du portefeuille
   */
  emitPortfolioUpdate(userId: number, portfolio: any): void {
    this.io.to(`user:${userId}`).emit('portfolio-update', portfolio);
  }

  /**
   * Émettre une mise à jour du taux d'intérêt
   */
  emitInterestRateUpdate(newRate: number): void {
    // Émettre à tous les clients (pour les notifications automatiques)
    this.io.to('role:CLIENT').emit('interest-rate-update', { newRate });
  }

  /**
   * Émettre un nouveau compte créé
   */
  emitNewAccount(account: any): void {
    const ownerId = account.ownerId || account.ownerID || 0;
    this.io.to(`user:${ownerId}`).emit('new-account', account);
    // Émettre aussi un événement de rafraîchissement pour forcer la mise à jour
    this.io.to(`user:${ownerId}`).emit('refresh-accounts');
  }

  /**
   * Obtenir le serveur Socket.IO
   */
  getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Vérifier si un utilisateur est connecté
   */
  isUserConnected(userId: number): boolean {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId)!.size > 0;
  }
}
