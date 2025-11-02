import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de validation des données
 * Vérifie que les champs requis sont présents et valides
 */
export const validateRequest = (schema: {
  body?: { [key: string]: 'required' | 'optional' | ((value: any) => boolean) };
  params?: { [key: string]: 'required' | 'optional' | ((value: any) => boolean) };
  query?: { [key: string]: 'required' | 'optional' | ((value: any) => boolean) };
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    // Valider le body
    if (schema.body) {
      for (const [field, validator] of Object.entries(schema.body)) {
        const value = req.body[field];

        if (validator === 'required' && (value === undefined || value === null || value === '')) {
          errors.push(`Le champ '${field}' est requis`);
        } else if (typeof validator === 'function') {
          try {
            if (!validator(value)) {
              errors.push(`Le champ '${field}' n'est pas valide`);
            }
          } catch (error) {
            errors.push(`Erreur de validation pour '${field}': ${error}`);
          }
        }
      }
    }

    // Valider les params
    if (schema.params) {
      for (const [field, validator] of Object.entries(schema.params)) {
        const value = req.params[field];

        if (validator === 'required' && !value) {
          errors.push(`Le paramètre '${field}' est requis`);
        } else if (typeof validator === 'function') {
          try {
            if (!validator(value)) {
              errors.push(`Le paramètre '${field}' n'est pas valide`);
            }
          } catch (error) {
            errors.push(`Erreur de validation pour '${field}': ${error}`);
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Erreur de validation',
        details: errors
      });
    }

    next();
  };
};

/**
 * Validateurs réutilisables
 */
export const validators = {
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof value === 'string' && emailRegex.test(value);
  },
  
  iban: (value: string) => {
    // Format IBAN basique (à améliorer avec validation complète)
    return typeof value === 'string' && value.length >= 15 && value.length <= 34;
  },
  
  positiveNumber: (value: any) => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  },
  
  nonNegativeNumber: (value: any) => {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
  },
  
  integer: (value: any) => {
    const num = Number(value);
    return !isNaN(num) && Number.isInteger(num);
  },
  
  string: (value: any) => typeof value === 'string' && value.trim().length > 0
};
