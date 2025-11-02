import { Router, Request, Response } from 'express';
import { UserRepositoryInterface } from '../../../application/repositories/UserRepositoryInterface';

export class UserController {
  private router: Router;

  constructor(private userRepository: UserRepositoryInterface) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/users - Liste tous les utilisateurs
    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const users = await this.userRepository.findAll();
        res.json(users);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
      }
    });

    // GET /api/users/:id - Récupère un utilisateur par ID
    this.router.get('/:id', async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const user = await this.userRepository.findById(id);
        
        if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        res.json(user);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
      }
    });

    // GET /api/users/by-email/:email - Récupère un utilisateur par email
    this.router.get('/by-email/:email', async (req: Request, res: Response) => {
      try {
        const email = req.params.email;
        const user = await this.userRepository.findByEmail(email);
        
        if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        res.json(user);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
      }
    });

    // GET /api/users/by-role/:role - Récupère les utilisateurs par rôle
    this.router.get('/by-role/:role', async (req: Request, res: Response) => {
      try {
        const role = req.params.role;
        const users = await this.userRepository.findByRole(role);
        res.json(users);
      } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
