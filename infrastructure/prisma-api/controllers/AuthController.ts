import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { validateRequest, validators } from '../middleware/validation.middleware';

export class AuthController {
  private router: Router;

  constructor(private prisma: PrismaClient) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // POST /api/auth/register - Inscription d'un nouveau client
    this.router.post('/register', 
      validateRequest({
        body: {
          email: 'required',
          password: 'required',
          firstName: 'required',
          lastName: 'required'
        }
      }),
      async (req: Request, res: Response) => {
        try {
          const { email, password, firstName, lastName } = req.body;

          // Vérifier que l'email n'existe pas déjà
          const existingUser = await this.prisma.user.findUnique({
            where: { email }
          });

          if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
          }

          // Valider l'email
          if (!validators.email(email)) {
            return res.status(400).json({ error: 'Format d\'email invalide' });
          }

          // Hasher le mot de passe
          const hashedPassword = await bcrypt.hash(password, 10);

          // Créer l'utilisateur
          const user = await this.prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              firstName,
              lastName,
              role: 'CLIENT' // Par défaut, nouveau client
            }
          });

          // TODO: Envoyer un email de confirmation
          // TODO: Créer automatiquement un premier compte (selon le sujet)

          res.status(201).json({
            message: 'Inscription réussie',
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role
            }
          });
        } catch (error: any) {
          console.error(error);
          if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
          }
          res.status(500).json({ error: 'Erreur lors de l\'inscription' });
        }
      }
    );

    // POST /api/auth/login - Connexion
    this.router.post('/login',
      validateRequest({
        body: {
          email: 'required',
          password: 'required'
        }
      }),
      async (req: Request, res: Response) => {
        try {
          const { email, password } = req.body;

          // Trouver l'utilisateur
          const user = await this.prisma.user.findUnique({
            where: { email }
          });

          if (!user) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
          }

          // Vérifier le mot de passe
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
          }

          // TODO: Générer un token JWT
          // Pour l'instant, on retourne les informations utilisateur
          // Dans un vrai projet, vous devriez utiliser JWT

          res.json({
            message: 'Connexion réussie',
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role
            },
            // Dans un vrai projet, vous devriez retourner un token JWT ici
            token: `mock-token-${user.id}` // À remplacer par un vrai JWT
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erreur lors de la connexion' });
        }
      }
    );

    // POST /api/auth/logout - Déconnexion
    this.router.post('/logout', async (req: Request, res: Response) => {
      try {
        // TODO: Invalider le token JWT côté serveur si nécessaire
        res.json({ message: 'Déconnexion réussie' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la déconnexion' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
