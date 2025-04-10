import { PrismaClient } from '../../generated/prisma';
import { generateOtp, hashOtp, verifyOtp } from '../../utils/otp';
import { sendOtpSms } from '../../utils/twilio';

export class AuthService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  async requestOtp(phone: string) {
    // Generate OTP
    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);
    
    // Store OTP in database
    await this.prisma.otp.create({
      data: {
        phone,
        codeHash: hashedOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
      },
    });

    // Send OTP via SMS
    await sendOtpSms(phone, otp);

    return { success: true };
  }

  async verifyOtp(phone: string, otp: string) {
    // Find the most recent OTP for this phone
    const otpRecord = await this.prisma.otp.findFirst({
      where: {
        phone,
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      throw new Error('OTP not found or expired');
    }

    // Verify OTP
    const isValid = await verifyOtp(otp, otpRecord.codeHash);
    if (!isValid) {
      throw new Error('Invalid OTP');
    }

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { phone },
      });
    }

    // Delete used OTP
    await this.prisma.otp.delete({
      where: { id: otpRecord.id },
    });

    return { success: true, user };
  }
} 