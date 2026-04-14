import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  const prismaMock = {
    user: { findUnique: jest.fn(), create: jest.fn() },
    role: { findUniqueOrThrow: jest.fn() },
    refreshToken: { create: jest.fn(), findFirst: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('token') },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (k: string) =>
              k === 'JWT_ACCESS_SECRET' ? 'x'.repeat(32) : '7',
            get: (k: string) =>
              k === 'JWT_ACCESS_TTL' ? '15m' : k === 'JWT_REFRESH_DAYS' ? '7' : undefined,
          },
        },
      ],
    }).compile();
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('register rejects duplicate email', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: '1' });
    await expect(
      service.register({
        email: 'a@b.com',
        password: 'password123',
      }),
    ).rejects.toBeDefined();
  });
});
