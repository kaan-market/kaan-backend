import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export class AuthController {
  async requestOtp(req: Request, res: Response) {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      const result = await authService.requestOtp(phone);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }

  async verifyOtp(req: Request, res: Response) {
    try {
      const { phone, otp } = req.body;
      
      if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone and OTP are required' });
      }

      const result = await authService.verifyOtp(phone, otp);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  }
} 