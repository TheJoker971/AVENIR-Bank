import { Router, Request, Response } from 'express';
import { UserRepositoryInterface } from '../../../application/repositories/UserRepositoryInterface';
import { AccountRepositoryInterface } from '../../../application/repositories/AccountRepositoryInterface';
import { CreateUserUseCase } from '../../../application/use-cases/admin/CreateUserUseCase';
import { BanUserUseCase } from '../../../application/use-cases/admin/BanUserUseCase';
import { UnbanUserUseCase } from '../../../application/use-cases/admin/UnbanUserUseCase';
import { AssignAdvisorToClientUseCase } from '../../../application/use-cases/admin/AssignAdvisorToClientUseCase';
import { RemoveAdvisorFromClientUseCase } from '../../../application/use-cases/admin/RemoveAdvisorFromClientUseCase';
import { requireAuth, requireRole } from '../middlewares/auth';

export class UserController {
  private router: Router;
  private createUserUseCase: CreateUserUseCase;
  private banUserUseCase: BanUserUseCase;
  private unbanUserUseCase: UnbanUserUseCase;
  private assignAdvisorUseCase: AssignAdvisorToClientUseCase;
  private removeAdvisorUseCase: RemoveAdvisorFromClientUseCase;

  constructor(
    private userRepository: UserRepositoryInterface,
    private accountRepository?: AccountRepositoryInterface
  ) {
    this.router = Router();
    this.createUserUseCase = new CreateUserUseCase(userRepository);
    this.banUserUseCase = new BanUserUseCase(userRepository);
    this.unbanUserUseCase = new UnbanUserUseCase(userRepository);
    this.assignAdvisorUseCase = new AssignAdvisorToClientUseCase(userRepository);
    this.removeAdvisorUseCase = new RemoveAdvisorFromClientUseCase(userRepository);
    this.setupRoutes();
  }

  private toUserDto(user: any): any {
    return {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email?.value || user.email || '',
      address: user.address,
      role: user.role?.value || user.role || '',
      banned: user.banned || false,
      advisorId: user.advisorId || null, // ID du conseiller assigné (pour les clients)
      activeAccountId: user.activeAccountId || null, // ID du compte actif
    };
  }

  private toUserDtoArray(users: any[]): any[] {
    return users.map(user => this.toUserDto(user));
  }

  private setupRoutes(): void {
    // GET /api/users - Liste tous les utilisateurs (DIRECTOR uniquement)
    this.router.get('/', requireAuth, requireRole('DIRECTOR'), async (req: Request, res: Response) => {
      try {
        const users = await this.userRepository.findAll();
        res.json(this.toUserDtoArray(users));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
      }
    });

    // POST /api/users - Crée un nouvel utilisateur (DIRECTOR uniquement)
    this.router.post('/', requireAuth, requireRole('DIRECTOR'), async (req: Request, res: Response) => {
      try {
        const { firstname, lastname, email, password, address, role } = req.body;

        if (!firstname || !lastname || !email || !password || !address || !role) {
          return res.status(400).json({ 
            error: 'Paramètres manquants',
            message: 'Les champs firstname, lastname, email, password, address et role sont requis'
          });
        }

        const user = await this.createUserUseCase.execute(
          firstname,
          lastname,
          email,
          password,
          address,
          role
        );

        if (user instanceof Error) {
          return res.status(400).json({ error: user.message });
        }

        res.status(201).json(this.toUserDto(user));
      } catch (error: any) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        res.status(500).json({ 
          error: 'Erreur lors de la création de l\'utilisateur',
          details: error.message 
        });
      }
    });

    // GET /api/users/:id - Récupère un utilisateur par ID
    this.router.get('/:id', requireAuth, async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const user = await this.userRepository.findById(id);
        
        if (!user || user instanceof Error) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        res.json(this.toUserDto(user));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
      }
    });

    // PUT /api/users/:id/ban - Bannir un utilisateur (DIRECTOR uniquement)
    this.router.put('/:id/ban', requireAuth, requireRole('DIRECTOR'), async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const user = await this.banUserUseCase.execute(id);

        if (user instanceof Error) {
          return res.status(400).json({ error: user.message });
        }

        res.json(this.toUserDto(user));
      } catch (error: any) {
        res.status(500).json({ 
          error: 'Erreur lors du bannissement de l\'utilisateur',
          details: error.message 
        });
      }
    });

    // PUT /api/users/:id/unban - Débannir un utilisateur (DIRECTOR uniquement)
    this.router.put('/:id/unban', requireAuth, requireRole('DIRECTOR'), async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const user = await this.unbanUserUseCase.execute(id);

        if (user instanceof Error) {
          return res.status(400).json({ error: user.message });
        }

        res.json(this.toUserDto(user));
      } catch (error: any) {
        res.status(500).json({ 
          error: 'Erreur lors du débannissement de l\'utilisateur',
          details: error.message 
        });
      }
    });

    // DELETE /api/users/:id - Supprimer un utilisateur (DIRECTOR uniquement)
    this.router.delete('/:id', requireAuth, requireRole('DIRECTOR'), async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        
        // Vérifier que l'utilisateur existe
        const user = await this.userRepository.findById(id);
        if (!user || user instanceof Error) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Supprimer l'utilisateur
        await this.userRepository.delete(id);
        
        res.status(204).send();
      } catch (error: any) {
        res.status(500).json({ 
          error: 'Erreur lors de la suppression de l\'utilisateur',
          details: error.message 
        });
      }
    });

    // GET /api/users/by-email/:email - Récupère un utilisateur par email
    this.router.get('/by-email/:email', requireAuth, async (req: Request, res: Response) => {
      try {
        const email = req.params.email;
        const user = await this.userRepository.findByEmail(email);
        
        if (!user || user instanceof Error) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        res.json(this.toUserDto(user));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
      }
    });

    // GET /api/users/by-role/:role - Récupère les utilisateurs par rôle
    this.router.get('/by-role/:role', requireAuth, async (req: Request, res: Response) => {
      try {
        const role = req.params.role;
        const users = await this.userRepository.findByRole(role);
        res.json(this.toUserDtoArray(users));
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
      }
    });

    // PUT /api/users/:clientId/assign-advisor/:advisorId - Assigner un conseiller à un client (DIRECTOR uniquement)
    this.router.put('/:clientId/assign-advisor/:advisorId', requireAuth, requireRole('DIRECTOR'), async (req: Request, res: Response) => {
      try {
        const clientId = parseInt(req.params.clientId);
        const advisorId = parseInt(req.params.advisorId);

        if (isNaN(clientId) || isNaN(advisorId)) {
          return res.status(400).json({ error: 'IDs invalides' });
        }

        const updatedClient = await this.assignAdvisorUseCase.execute(clientId, advisorId);

        if (updatedClient instanceof Error) {
          return res.status(400).json({ error: updatedClient.message });
        }

        res.json(this.toUserDto(updatedClient));
      } catch (error: any) {
        res.status(500).json({ 
          error: 'Erreur lors de l\'assignation du conseiller',
          details: error.message 
        });
      }
    });

    // PUT /api/users/:clientId/remove-advisor - Retirer le conseiller d'un client (DIRECTOR uniquement)
    this.router.put('/:clientId/remove-advisor', requireAuth, requireRole('DIRECTOR'), async (req: Request, res: Response) => {
      try {
        const clientId = parseInt(req.params.clientId);

        if (isNaN(clientId)) {
          return res.status(400).json({ error: 'ID invalide' });
        }

        const updatedClient = await this.removeAdvisorUseCase.execute(clientId);

        if (updatedClient instanceof Error) {
          return res.status(400).json({ error: updatedClient.message });
        }

        res.json(this.toUserDto(updatedClient));
      } catch (error: any) {
        res.status(500).json({ 
          error: 'Erreur lors du retrait du conseiller',
          details: error.message 
        });
      }
    });

    // GET /api/users/by-advisor/:advisorId - Récupère les clients assignés à un conseiller
    this.router.get('/by-advisor/:advisorId', requireAuth, async (req: Request, res: Response) => {
      try {
        const advisorId = parseInt(req.params.advisorId);
        const userRole = (req as any).userRole;
        const userId = (req as any).userId;

        if (isNaN(advisorId)) {
          return res.status(400).json({ error: 'ID invalide' });
        }

        // Vérifier les permissions : un conseiller ne peut voir que ses propres clients
        // Un directeur peut voir tous les clients
        if (userRole === 'ADVISE' && advisorId !== userId) {
          return res.status(403).json({ error: 'Vous ne pouvez voir que vos propres clients' });
        }

        // Récupérer tous les clients et filtrer par advisorId
        const allClients = await this.userRepository.findByRole('CLIENT');
        const clientsWithAdvisor = allClients.filter(client => client.advisorId === advisorId);

        res.json(this.toUserDtoArray(clientsWithAdvisor));
      } catch (error: any) {
        res.status(500).json({ 
          error: 'Erreur lors de la récupération des clients',
          details: error.message 
        });
      }
    });

    // PUT /api/users/:userId/active-account - Définir le compte actif
    this.router.put('/:userId/active-account', requireAuth, async (req: Request, res: Response) => {
      try {
        const userId = parseInt(req.params.userId);
        const authenticatedUserId = (req as any).userId;
        const { accountId } = req.body;

        // Vérifier que l'utilisateur modifie son propre compte actif
        if (userId !== authenticatedUserId) {
          return res.status(403).json({ error: 'Vous ne pouvez modifier que votre propre compte actif' });
        }

        if (!accountId || isNaN(parseInt(accountId))) {
          return res.status(400).json({ error: 'ID de compte invalide' });
        }

        // Récupérer l'utilisateur
        const user = await this.userRepository.findById(userId);
        if (!user || user instanceof Error) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Vérifier que le compte existe et appartient à l'utilisateur
        if (this.accountRepository) {
          const account = await this.accountRepository.findById(parseInt(accountId));
          if (!account) {
            return res.status(404).json({ error: 'Compte non trouvé' });
          }

          const accountOwnerId = account.ownerId || account.ownerID;
          if (accountOwnerId !== userId) {
            return res.status(403).json({ error: 'Ce compte ne vous appartient pas' });
          }
        }

        // Définir le compte actif
        const updatedUser = user.setActiveAccount(parseInt(accountId));
        await this.userRepository.update(updatedUser);

        res.json({ 
          message: 'Compte actif défini avec succès',
          activeAccountId: updatedUser.getActiveAccountId()
        });
      } catch (error: any) {
        console.error('Erreur lors de la définition du compte actif:', error);
        res.status(500).json({ 
          error: 'Erreur lors de la définition du compte actif',
          details: error.message 
        });
      }
    });

    // GET /api/users/:userId/active-account - Récupérer le compte actif
    this.router.get('/:userId/active-account', requireAuth, async (req: Request, res: Response) => {
      try {
        const userId = parseInt(req.params.userId);
        const authenticatedUserId = (req as any).userId;

        // Vérifier que l'utilisateur consulte son propre compte actif
        if (userId !== authenticatedUserId) {
          return res.status(403).json({ error: 'Vous ne pouvez consulter que votre propre compte actif' });
        }

        // Récupérer l'utilisateur
        const user = await this.userRepository.findById(userId);
        if (!user || user instanceof Error) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const activeAccountId = user.getActiveAccountId();

        // Si aucun compte actif n'est défini
        if (!activeAccountId) {
          return res.json({ 
            activeAccount: null,
            message: 'Aucun compte actif défini'
          });
        }

        // Récupérer les détails du compte actif
        if (this.accountRepository) {
          const account = await this.accountRepository.findById(activeAccountId);
          if (!account) {
            return res.json({ 
              activeAccount: null,
              message: 'Le compte actif n\'existe plus'
            });
          }

          console.log('🔵 [UserController] Compte actif trouvé:', {
            activeAccountId,
            accountNumber: account.accountNumber?.value || account.accountNumber,
            iban: account.iban?.value || account.iban,
          });

          res.json({
            activeAccount: {
              id: activeAccountId, // Utiliser l'ID passé en paramètre, pas account.id
              accountNumber: account.accountNumber?.value || account.accountNumber || '',
              iban: account.iban?.value || account.iban || '',
              balance: typeof account.balance === 'number' ? account.balance : (account.balance?.value || 0),
              ownerId: account.ownerId || account.ownerID || 0,
            }
          });
        } else {
          res.json({
            activeAccountId,
            message: 'Détails du compte non disponibles'
          });
        }
      } catch (error: any) {
        console.error('Erreur lors de la récupération du compte actif:', error);
        res.status(500).json({ 
          error: 'Erreur lors de la récupération du compte actif',
          details: error.message 
        });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}

