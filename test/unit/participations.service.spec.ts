import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';

import { ParticipationsService } from '../../src/participations/participations.service';
import { Participation } from '../../src/participations/entities/participation.entity';
import { User } from '../../src/users/entities/user.entity';
import { Associate } from '../../src/associates/entities/associate.entity';
import { CreateParticipationDto } from '../../src/participations/dto/create-participation.dto';

describe('ParticipationsService', () => {
  let service: ParticipationsService;
  let participationRepository: Repository<Participation>;
  let userRepository: Repository<User>;
  let associateRepository: Repository<Associate>;

  const mockParticipationRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockAssociateRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipationsService,
        {
          provide: getRepositoryToken(Participation),
          useValue: mockParticipationRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Associate),
          useValue: mockAssociateRepository,
        },
      ],
    }).compile();

    service = module.get<ParticipationsService>(ParticipationsService);
    participationRepository = module.get<Repository<Participation>>(getRepositoryToken(Participation));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    associateRepository = module.get<Repository<Associate>>(getRepositoryToken(Associate));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = 'user-id';
    const createDto: CreateParticipationDto = {
      associateId: 'associate-id',
      numeroTicket: 'T-2025-001',
      fechaTicket: '2025-01-18',
      importeTotal: 25.99,
    };

    const mockUser = {
      id: userId,
      email: 'user@example.com',
      isActive: true,
    };

    const mockAssociate = {
      id: 'associate-id',
      nombre: 'Supermercado Test',
      activo: true,
    };

    it('should create participation successfully', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockAssociateRepository.findOne.mockResolvedValue(mockAssociate);
      mockParticipationRepository.findOne.mockResolvedValue(null); // No duplicate
      mockParticipationRepository.count.mockResolvedValue(0); // No daily limit exceeded
      
      const savedParticipation = {
        id: 'participation-id',
        userId,
        ...createDto,
        fechaTicket: new Date(createDto.fechaTicket),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockParticipationRepository.create.mockReturnValue(savedParticipation);
      mockParticipationRepository.save.mockResolvedValue(savedParticipation);

      // Act
      const result = await service.create(createDto, userId);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockAssociateRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.associateId, activo: true },
      });
      expect(result.numeroTicket).toBe(createDto.numeroTicket);
      expect(result.userId).toBe(userId);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createDto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when associate does not exist', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockAssociateRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createDto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when ticket already exists', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockAssociateRepository.findOne.mockResolvedValue(mockAssociate);
      mockParticipationRepository.findOne.mockResolvedValue({ id: 'existing' });

      // Act & Assert
      await expect(service.create(createDto, userId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for future date', async () => {
      // Arrange
      const futureDto = { ...createDto, fechaTicket: '2026-01-01' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockAssociateRepository.findOne.mockResolvedValue(mockAssociate);
      mockParticipationRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(futureDto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for date older than 30 days', async () => {
      // Arrange
      const oldDto = { ...createDto, fechaTicket: '2020-01-01' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockAssociateRepository.findOne.mockResolvedValue(mockAssociate);
      mockParticipationRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(oldDto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException when daily limit exceeded', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockAssociateRepository.findOne.mockResolvedValue(mockAssociate);
      mockParticipationRepository.findOne.mockResolvedValue(null);
      mockParticipationRepository.count.mockResolvedValue(5); // 5 participations already

      // Act & Assert
      await expect(service.create(createDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated participations', async () => {
      // Arrange
      const mockParticipations = [
        { id: '1', userId: 'user-1' },
        { id: '2', userId: 'user-2' },
      ];
      mockParticipationRepository.findAndCount.mockResolvedValue([
        mockParticipations,
        2,
      ]);

      // Act
      const result = await service.findAll({ page: 1, limit: 10 }, 'user-1');

      // Assert
      expect(result).toHaveProperty('participations');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return participation when found', async () => {
      // Arrange
      const participationId = 'participation-id';
      const mockParticipation = {
        id: participationId,
        userId: 'user-1',
        numeroTicket: 'T-001',
      };
      mockParticipationRepository.findOne.mockResolvedValue(mockParticipation);

      // Act
      const result = await service.findOne(participationId);

      // Assert
      expect(mockParticipationRepository.findOne).toHaveBeenCalledWith({
        where: { id: participationId },
        relations: ['user', 'associate'],
      });
      expect(result.id).toBe(participationId);
    });

    it('should throw NotFoundException when participation not found', async () => {
      // Arrange
      mockParticipationRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
