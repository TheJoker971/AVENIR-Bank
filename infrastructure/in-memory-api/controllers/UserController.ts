import { Router, Request, Response } from 'express';
import { UserRepositoryInterface } from '../../../application/repositories/UserRepositoryInterface';
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

  constructor(private userRepository: UserRepositoryInterface) {
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
  }

  public getRouter(): Router {
    return this.router;
  }
}
