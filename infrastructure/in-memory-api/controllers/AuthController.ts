import { Router, Request, Response } from 'express';
import { UserRepositoryInterface } from '../../../application/repositories/UserRepositoryInterface';
import { UserEntity } from 'domain/entities/UserEntity';
import { AccountRepositoryInterface } from '../../../application/repositories/AccountRepositoryInterface';
import { AccountEntity } from 'domain/entities/AccountEntity';
import { CountryCode } from 'domain/values/CountryCode';
import { BankCode } from 'domain/values/BankCode';
import { BranchCode } from 'domain/values/BranchCode';

export class AuthController {
  private router: Router;

  constructor(
    private userRepository: UserRepositoryInterface,
    private accountRepository: AccountRepositoryInterface
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // POST /api/auth/register - Inscription d'un nouvel utilisateur
    this.router.post('/register', async (req: Request, res: Response) => {
      try {
        const { firstname, lastname, email, password, address } = req.body;

        // Validation des champs requis
        if (!firstname || !lastname || !email || !password || !address) {
          return res.status(400).json({ 
            error: 'Tous les champs sont requis (firstname, lastname, email, password, address)' 
          });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
          return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà' });
        }

        // Créer un nouvel utilisateur (client par défaut)
        const userResult = UserEntity.createClient(
          0, // L'ID sera généré par le repository
          firstname,
          lastname,
          email,
          password,
          address
        );

        if (userResult instanceof Error) {
          return res.status(400).json({ error: userResult.message });
        }

        // Sauvegarder l'utilisateur
        await this.userRepository.save(userResult);
        
        // Récupérer l'utilisateur sauvegardé (avec son ID généré)
        const savedUser = await this.userRepository.findByEmail(email);
        
        if (!savedUser) {
          return res.status(500).json({ error: 'Erreur lors de la sauvegarde de l\'utilisateur' });
        }
        
        // Créer automatiquement un premier compte pour le nouvel utilisateur
        const countryCode = 'FR' as CountryCode;
        const bankCodeOrError = BankCode.create('12345');
        const branchCodeOrError = BranchCode.create('67890');
        
        if (bankCodeOrError instanceof Error || branchCodeOrError instanceof Error) {
          return res.status(500).json({ error: 'Erreur lors de la création du compte' });
        }

        const accountResult = AccountEntity.create(
          countryCode,
          bankCodeOrError,
          branchCodeOrError,
          '00',
          0,
          savedUser.id
        );

        if (accountResult instanceof Error) {
          return res.status(500).json({ error: accountResult.message });
        }

        await this.accountRepository.save(accountResult);

        // Retourner l'utilisateur sans le mot de passe
        const userDto = {
          id: savedUser.id,
          firstname: savedUser.firstname,
          lastname: savedUser.lastname,
          email: savedUser.email.value,
          address: savedUser.address,
          role: savedUser.role.value,
          banned: savedUser.banned,
        };

        res.status(201).json({ 
          message: 'Utilisateur créé avec succès',
          user: userDto,
          token: this.generateToken(savedUser.id, savedUser.role.value)
        });
      } catch (error: any) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
      }
    });

    // POST /api/auth/login - Connexion d'un utilisateur
    this.router.post('/login', async (req: Request, res: Response) => {
      try {
        const { email, password } = req.body;

        // Validation des champs requis
        if (!email || !password) {
          return res.status(400).json({ 
            error: 'Email et mot de passe sont requis' 
          });
        }

        // Trouver l'utilisateur par email
        const user = await this.userRepository.findByEmail(email);
        
        if (!user) {
          return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        // Vérifier si l'utilisateur est banni
        if (user.banned) {
          return res.status(403).json({ error: 'Votre compte a été suspendu' });
        }

        // Vérifier le mot de passe
        // La méthode compare() de Password utilise bcrypt.compareSync() qui compare
        // automatiquement le mot de passe en clair (password) avec le hash stocké (user.password.value)
        // On ne doit PAS hasher le mot de passe reçu, bcrypt.compareSync() le fait automatiquement
        const isPasswordValid = user.password.compare(password);
        
        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        // Retourner l'utilisateur sans le mot de passe
        const userDto = {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email.value,
          address: user.address,
          role: user.role.value,
          banned: user.banned,
        };

        res.json({
          message: 'Connexion réussie',
          user: userDto,
          token: this.generateToken(user.id, user.role.value)
        });
      } catch (error: any) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ error: 'Erreur lors de la connexion' });
      }
    });

    // GET /api/auth/me - Récupérer l'utilisateur actuel (nécessite un token)
    this.router.get('/me', async (req: Request, res: Response) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Non authentifié' });
        }

        const token = authHeader.substring(7);
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [userId] = decoded.split(':');
        
        if (!userId) {
          return res.status(401).json({ error: 'Non authentifié' });
        }

        const user = await this.userRepository.findById(parseInt(userId));
        
        if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const userDto = {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email.value,
          address: user.address,
          role: user.role.value,
          banned: user.banned,
        };

        res.json(userDto);
      } catch (error: any) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
      }
    });
  }

  /**
   * Génère un token simple basé sur l'ID et le rôle de l'utilisateur
   * Dans un environnement de production, utilisez JWT
   */
  private generateToken(userId: number, role: string): string {
    // Token simple encodé en base64 (user:role:timestamp)
    const data = `${userId}:${role}:${Date.now()}`;
    return Buffer.from(data).toString('base64');
  }


  public getRouter(): Router {
    return this.router;
  }
}

