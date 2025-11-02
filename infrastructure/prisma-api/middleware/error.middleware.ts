import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  status?: number;
}

/**
 * Middleware de gestion d'erreurs global
 * Capture toutes les erreurs non gérées et renvoie une réponse JSON structurée
 */
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Erreur:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Erreur serveur interne';

  // Si c'est une erreur Prisma
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      error: 'Erreur de base de données',
      message: 'Une erreur est survenue lors de l\'accès à la base de données'
    });
  }

  // Si c'est une erreur de validation Prisma
  if (err.name === 'PrismaClientValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      message: 'Les données fournies sont invalides'
    });
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware pour gérer les routes non trouvées
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path,
    method: req.method
  });
};
