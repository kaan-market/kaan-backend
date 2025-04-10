import { Router, Request, Response } from 'express';
import { AuthController } from './auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/request-otp', async (req: Request, res: Response) => {
  await authController.requestOtp(req, res);
});

router.post('/verify-otp', async (req: Request, res: Response) => {
  await authController.verifyOtp(req, res);
});

export default router; 