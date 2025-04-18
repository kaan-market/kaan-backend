import { PrismaClient } from '../../generated/prisma';
import { BadRequestException, NotFoundException } from '../../utils/exceptions';

export class ProfileService {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  private validateRequiredFields(data: any) {
    if (!data.username) {
      throw new BadRequestException('Username is required');
    }
    if (!data.location) {
      throw new BadRequestException('Location is required');
    }
  }

  async createProfile(userId: string, data: {
    username: string;
    bio?: string;
    location: string;
    moq?: number;
    interests?: string[];
  }) {
    this.validateRequiredFields(data);

    // Check if username is already taken
    const existingUser = await this.prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Username already taken');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        bio: data.bio,
        location: data.location,
        moq: data.moq,
        interests: data.interests,
      },
    });
  }

  async updateProfile(userId: string, data: {
    username?: string;
    bio?: string;
    location?: string;
    moq?: number;
    interests?: string[];
  }) {
    // For update, only validate if the field is being updated
    if (data.username || data.location) {
      this.validateRequiredFields({
        username: data.username,
        location: data.location,
      });
    }

    if (data.username) {
      // Check if username is already taken
      const existingUser = await this.prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Username already taken');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        bio: data.bio,
        location: data.location,
        moq: data.moq,
        interests: data.interests,
      },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        bio: true,
        location: true,
        moq: true,
        interests: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Profile not found');
    }

    return user;
  }

  async deleteProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.user.delete({
      where: { id: userId },
    });
  }
} 