import { Request, Response, NextFunction } from 'express';
import { BadRequestException } from '../utils/exceptions';

interface ValidationRule {
  type: string;
  required?: boolean;
  items?: ValidationRule;
}

interface ValidationSchema {
  body?: Record<string, ValidationRule>;
  params?: Record<string, ValidationRule>;
  query?: Record<string, ValidationRule>;
}

function isType(value: any, type: string): boolean {
  if (type === 'array') {
    return Array.isArray(value);
  }
  return typeof value === type;
}

export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (schema.body) {
        for (const [key, rule] of Object.entries(schema.body)) {
          if (rule.required && !req.body[key]) {
            throw new BadRequestException(`${key} is required`);
          }
          if (req.body[key] && !isType(req.body[key], rule.type)) {
            throw new BadRequestException(`${key} must be of type ${rule.type}`);
          }
          if (rule.type === 'array' && rule.items && Array.isArray(req.body[key])) {
            for (const item of req.body[key]) {
              if (!isType(item, rule.items.type)) {
                throw new BadRequestException(`Items in ${key} must be of type ${rule.items.type}`);
              }
            }
          }
        }
      }

      // Validate params
      if (schema.params) {
        for (const [key, rule] of Object.entries(schema.params)) {
          if (rule.required && !req.params[key]) {
            throw new BadRequestException(`${key} is required`);
          }
          if (req.params[key] && !isType(req.params[key], rule.type)) {
            throw new BadRequestException(`${key} must be of type ${rule.type}`);
          }
        }
      }

      // Validate query
      if (schema.query) {
        for (const [key, rule] of Object.entries(schema.query)) {
          if (rule.required && !req.query[key]) {
            throw new BadRequestException(`${key} is required`);
          }
          if (req.query[key] && !isType(req.query[key], rule.type)) {
            throw new BadRequestException(`${key} must be of type ${rule.type}`);
          }
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}; 