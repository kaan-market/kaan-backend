import { Request, Response, NextFunction } from 'express';
import { UnauthorizedException } from '../utils/exceptions';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        phone: string;
      };
    }
  }
}

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string; phone: string };
      req.user = decoded;
      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token signature');
      }
      throw jwtError;
    }
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      next(error);
    } else {
      console.error('Auth middleware error:', error);
      next(new UnauthorizedException('Authentication failed'));
    }
  }
}; 