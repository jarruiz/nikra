import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../../src/auth/auth.service';
import { User } from '../../src/users/entities/user.entity';
import { RegisterDto } from '../../src/auth/dto/register.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      nombre: 'Juan',
      apellidos: 'García López',
      dni: '12345678A',
      direccion: 'Calle Mayor 123, Ceuta',
      email: 'juan@example.com',
      password: 'TestPassword123!',
    };

    it('should register a new user successfully', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null); // No existing user
      const savedUser = {
        id: 'user-id',
        ...registerDto,
        password: 'hashed-password',
        emailVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');
      mockConfigService.get.mockReturnValue('mock-secret');

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { dni: registerDto.dni },
      });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(registerDto.email);
    });

    it('should throw ConflictException if user already exists by email', async () => {
      // Arrange
      mockUserRepository.findOne
        .mockResolvedValueOnce({ id: 'existing-user' }); // Email exists

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if user already exists by DNI', async () => {
      // Arrange
      mockUserRepository.findOne
        .mockResolvedValueOnce(null) // Email doesn't exist
        .mockResolvedValueOnce({ id: 'existing-user' }); // But DNI exists

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('validateUser', () => {
    const email = 'juan@example.com';
    const password = 'TestPassword123!';
    const user = {
      id: 'user-id',
      email,
      password: 'hashed-password',
      isActive: true,
      validatePassword: jest.fn(),
    };

    it('should return user data when credentials are valid', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(user.validatePassword).toHaveBeenCalledWith(password);
      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
    });

    it('should return null when user is not found', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(false);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when user is inactive', async () => {
      // Arrange
      const inactiveUser = { ...user, isActive: false };
      mockUserRepository.findOne.mockResolvedValue(inactiveUser);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'juan@example.com',
      password: 'TestPassword123!',
    };

    it('should login user successfully', async () => {
      // Arrange
      const user = {
        id: 'user-id',
        email: loginDto.email,
        nombre: 'Juan',
        apellidos: 'García',
        emailVerified: true,
        isActive: true,
        lastLoginAt: null,
        validatePassword: jest.fn().mockResolvedValue(true),
      };
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');
      mockConfigService.get.mockReturnValue('mock-secret');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('findUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = 'user-id';
      const user = { id: userId, email: 'juan@example.com' };
      mockUserRepository.findOne.mockResolvedValue(user);

      // Act
      const result = await service.findUserById(userId);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = 'non-existent-id';
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findUserById(userId)).rejects.toThrow(
        'Usuario no encontrado',
      );
    });
  });
});
