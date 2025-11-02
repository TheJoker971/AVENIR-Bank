import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { validateRequest, validators } from '../middleware/validation.middleware';
import bcrypt from 'bcryptjs';

export class UserController {
  private router: Router;

  constructor(private prisma: PrismaClient) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /api/users/admin - Liste tous les utilisateurs (DIRECTOR uniquement)
    this.router.get('/admin', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const users = await this.prisma.user.findMany({
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
            updatedAt: true
            // Ne pas retourner les mots de passe
          }
        });
        res.json(users);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
      }
    });

    // GET /api/users/admin/:id - Récupère un utilisateur par ID (DIRECTOR uniquement)
    this.router.get('/admin/:id', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const user = await this.prisma.user.findUnique({
          where: { id },
          include: {
            accounts: true,
            savingsAccounts: true,
            credits: true
          },
          // Ne pas retourner le mot de passe
          select: undefined // On utilise include donc on doit spécifier autrement
        });
        
        if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        // Retirer le mot de passe de la réponse
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
      }
    });

    // POST /api/users/admin - Créer un utilisateur (DIRECTOR uniquement)
    this.router.post('/admin',
      validateRequest({
        body: {
          email: validators.email,
          password: 'required',
          firstName: 'required',
          lastName: 'required',
          role: 'required'
        }
      }),
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const { email, password, firstName, lastName, role } = req.body;

          // Vérifier que l'email n'existe pas
          const existing = await this.prisma.user.findUnique({
            where: { email }
          });

          if (existing) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
          }

          // Vérifier que le rôle est valide
          const validRoles = ['CLIENT', 'ADVISE', 'DIRECTOR', 'ADMIN'];
          if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Rôle invalide' });
          }

          // Hasher le mot de passe
          const hashedPassword = await bcrypt.hash(password, 10);

          const user = await this.prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              firstName,
              lastName,
              role
            },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              createdAt: true
            }
          });

          res.status(201).json(user);
        } catch (error: any) {
          console.error(error);
          if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
          }
          res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
        }
      }
    );

    // PUT /api/users/admin/:id - Modifier un utilisateur (DIRECTOR uniquement)
    this.router.put('/admin/:id',
      validateRequest({
        body: {
          firstName: 'optional',
          lastName: 'optional',
          role: 'optional',
          password: 'optional'
        }
      }),
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const id = parseInt(req.params.id);
          const { firstName, lastName, role, password } = req.body;

          const user = await this.prisma.user.findUnique({
            where: { id }
          });

          if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
          }

          const updateData: any = {};
          if (firstName) updateData.firstName = firstName;
          if (lastName) updateData.lastName = lastName;
          if (role) updateData.role = role;
          if (password) {
            updateData.password = await bcrypt.hash(password, 10);
          }

          const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              updatedAt: true
            }
          });

          res.json(updatedUser);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Erreur lors de la modification de l\'utilisateur' });
        }
      }
    );

    // DELETE /api/users/admin/:id - Supprimer/Bannir un utilisateur (DIRECTOR uniquement)
    this.router.delete('/admin/:id', async (req: AuthenticatedRequest, res: Response) => {
      try {
        const id = parseInt(req.params.id);

        const user = await this.prisma.user.findUnique({
          where: { id }
        });

        if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        await this.prisma.user.delete({
          where: { id }
        });

        res.status(204).send();
      } catch (error: any) {
        console.error(error);
        if (error.code === 'P2003') {
          return res.status(400).json({ error: 'Impossible de supprimer cet utilisateur car il est lié à des données' });
        }
        res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
      }
    });

    // GET /api/users/by-email/:email - Récupère un utilisateur par email (pour vérification)
    this.router.get('/by-email/:email', async (req: Request, res: Response) => {
      try {
        const email = req.params.email;
        const user = await this.prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        });
        
        if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        res.json(user);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
      }
    });

    // GET /api/users/by-role/:role - Récupère les utilisateurs par rôle
    this.router.get('/by-role/:role', async (req: Request, res: Response) => {
      try {
        const role = req.params.role;
        const users = await this.prisma.user.findMany({
          where: { role },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        });
        res.json(users);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
