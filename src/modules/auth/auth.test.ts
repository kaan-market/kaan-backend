// @ts-nocheck
import { AuthService } from './auth.service';
import { PrismaClient } from '@prisma/client';
import { sendOtpSms } from '../../utils/twilio';
import { generateOtp, hashOtp, verifyOtp } from '../../utils/otp';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

type MockPrismaClient = {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
  otp: {
    create: jest.Mock;
    findFirst: jest.Mock;
    delete: jest.Mock;
  };
};

// Mock OTP utils
jest.mock('../../utils/otp', () => ({
  generateOtp: jest.fn().mockReturnValue('123456'),
  hashOtp: jest.fn().mockResolvedValue('hashed_otp'),
  verifyOtp: jest.fn().mockImplementation((plain, hashed) => Promise.resolve(true)),
}));

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: '1', phone: '+1234567890' }),
    },
    otp: {
      create: jest.fn().mockResolvedValue({ id: '1', phone: '+1234567890', codeHash: 'hash', expiresAt: new Date() }),
      findFirst: jest.fn().mockResolvedValue(null),
      delete: jest.fn().mockResolvedValue(undefined),
    },
  })),
}));

// Mock Twilio
jest.mock('../../utils/twilio', () => ({
  sendOtpSms: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: MockPrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
    authService = new AuthService(prisma);
    jest.clearAllMocks();
  });

  describe('requestOtp', () => {
    it('should generate and send OTP', async () => {
      const phone = '+1234567890';
      const expectedOtp = '123456';
      
      await authService.requestOtp(phone);

      expect(generateOtp).toHaveBeenCalled();
      expect(hashOtp).toHaveBeenCalledWith(expectedOtp);
      expect(prisma.otp.create).toHaveBeenCalledWith({
        data: {
          phone,
          codeHash: 'hashed_otp',
          expiresAt: expect.any(Date),
        },
      });
      expect(sendOtpSms).toHaveBeenCalledWith(phone, expectedOtp);
    });
  });

  describe('verifyOtp', () => {
    it('should verify valid OTP and create user', async () => {
      const phone = '+1234567890';
      const otp = '123456';
      const mockOtpRecord = {
        id: '1',
        phone,
        codeHash: 'hashed_otp',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        createdAt: new Date(),
      };

      prisma.otp.findFirst.mockResolvedValue(mockOtpRecord);
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: '1', phone });

      const result = await authService.verifyOtp(phone, otp);

      expect(verifyOtp).toHaveBeenCalledWith(otp, mockOtpRecord.codeHash);
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(prisma.otp.delete).toHaveBeenCalled();
    });

    it('should throw error for expired OTP', async () => {
      const phone = '+1234567890';
      const otp = '123456';
      const mockOtpRecord = {
        id: '1',
        phone,
        codeHash: 'hashed_otp',
        expiresAt: new Date(Date.now() - 1000), // Expired
        createdAt: new Date(),
      };

      prisma.otp.findFirst.mockResolvedValue(null); // No valid OTP found (expired)

      await expect(authService.verifyOtp(phone, otp)).rejects.toThrow('OTP not found or expired');
    });
  });
}); 