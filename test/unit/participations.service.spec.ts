import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';

import { ParticipationsService } from '../../src/participations/participations.service';
import { Participation } from '../../src/participations/entities/participation.entity';
import { Ticket } from '../../src/tickets/entities/ticket.entity';
import { User } from '../../src/users/entities/user.entity';
import { Associate } from '../../src/associates/entities/associate.entity';
import { Campaign } from '../../src/campaigns/entities/campaign.entity';
import { CreateParticipationDto } from '../../src/participations/dto/create-participation.dto';
import { EmailService } from '../../src/email/email.service';

describe('ParticipationsService', () => {
  let service: ParticipationsService;
  let participationRepository: Repository<Participation>;
  let ticketRepository: Repository<Ticket>;
  let userRepository: Repository<User>;
  let associateRepository: Repository<Associate>;
  let campaignRepository: Repository<Campaign>;

  const mockParticipationRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
  };

  const mockTicketRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockAssociateRepository = {
    findOne: jest.fn(),
  };

  const mockCampaignRepository = {
    find: jest.fn(),
  };

  const mockEmailService = {
    sendParticipationNotification: jest.fn().mockResolvedValue(undefined),
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
          provide: getRepositoryToken(Ticket),
          useValue: mockTicketRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Associate),
          useValue: mockAssociateRepository,
        },
        {
          provide: getRepositoryToken(Campaign),
          useValue: mockCampaignRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<ParticipationsService>(ParticipationsService);
    participationRepository = module.get<Repository<Participation>>(getRepositoryToken(Participation));
    ticketRepository = module.get<Repository<Ticket>>(getRepositoryToken(Ticket));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    associateRepository = module.get<Repository<Associate>>(getRepositoryToken(Associate));
    campaignRepository = module.get<Repository<Campaign>>(getRepositoryToken(Campaign));
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
      fullName: 'Test User',
      isActive: true,
    };

    const mockAssociate = {
      id: 'associate-id',
      nombre: 'Supermercado Test',
      activo: true,
    };

    it('should create participations successfully', async () => {
      // Arrange
      const mockCampaign = {
        id: 'campaign-id',
        nombre: 'Campaña Test',
        isActive: true,
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-12-31'),
        importeMinimo: 10,
        cuantiaMaximaAcumulable: null,
        reglaParticipacion: 'Regla test',
        reglaRedondeo: 'Redondeo test',
      };

      const mockTicket = {
        id: 'ticket-id',
        userId,
        associateId: createDto.associateId,
        numeroTicket: createDto.numeroTicket,
        fechaTicket: new Date(createDto.fechaTicket),
        importeTotal: createDto.importeTotal,
        validated: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: mockUser,
        associate: mockAssociate,
      };

      const savedParticipation = {
        id: 'participation-id',
        ticketId: mockTicket.id,
        campaignId: mockCampaign.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        ticket: mockTicket,
        campaign: mockCampaign,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockAssociateRepository.findOne.mockResolvedValue(mockAssociate);
      mockTicketRepository.count.mockResolvedValue(0); // No daily limit exceeded
      mockCampaignRepository.find.mockResolvedValue([mockCampaign]); // Campaña válida encontrada
      mockParticipationRepository.find.mockResolvedValue([]); // No hay participaciones previas del usuario en esta campaña
      mockTicketRepository.findOne.mockResolvedValue(null); // No existe ticket previo
      mockTicketRepository.create.mockReturnValue(mockTicket);
      mockTicketRepository.save.mockResolvedValue(mockTicket);
      mockParticipationRepository.create.mockReturnValue(savedParticipation);
      mockParticipationRepository.save.mockResolvedValue([savedParticipation]);
      mockParticipationRepository.find.mockResolvedValue([savedParticipation]); // Para la respuesta final

      // Act
      const result = await service.create(createDto, userId);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockAssociateRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.associateId, activo: true },
      });
      expect(mockTicketRepository.count).toHaveBeenCalled(); // Verificar límite diario de tickets
      expect(mockCampaignRepository.find).toHaveBeenCalled();
      expect(mockTicketRepository.create).toHaveBeenCalled();
      expect(mockTicketRepository.save).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].ticketId).toBe(mockTicket.id);
      expect(result[0].ticket?.numeroTicket).toBe(createDto.numeroTicket);
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

    it('should throw ForbiddenException when daily limit exceeded', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockAssociateRepository.findOne.mockResolvedValue(mockAssociate);
      mockTicketRepository.count.mockResolvedValue(5); // 5 tickets already

      // Act & Assert
      await expect(service.create(createDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException for future date', async () => {
      // Arrange
      const futureDto = { ...createDto, fechaTicket: '2026-01-01' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockAssociateRepository.findOne.mockResolvedValue(mockAssociate);
      mockTicketRepository.count.mockResolvedValue(0);

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
      mockTicketRepository.count.mockResolvedValue(0);

      // Act & Assert
      await expect(service.create(oldDto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated participations', async () => {
      // Arrange
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      mockParticipationRepository.createQueryBuilder.mockReturnValue(queryBuilder);

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
      const mockTicket = {
        id: 'ticket-id',
        userId: 'user-1',
        numeroTicket: 'T-001',
      };
      const mockParticipation = {
        id: participationId,
        ticketId: mockTicket.id,
        ticket: mockTicket,
      };
      mockParticipationRepository.findOne.mockResolvedValue(mockParticipation);

      // Act
      const result = await service.findOne(participationId);

      // Assert
      expect(mockParticipationRepository.findOne).toHaveBeenCalledWith({
        where: { id: participationId },
        relations: ['ticket', 'ticket.user', 'ticket.associate', 'campaign'],
      });
      expect(result.id).toBe(participationId);
      expect(result.ticketId).toBe(mockTicket.id);
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
