import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AppModule } from '../../src/app.module';
import { User } from '../../src/users/entities/user.entity';
import { Campaign } from '../../src/campaigns/entities/campaign.entity';
import { Associate } from '../../src/associates/entities/associate.entity';
import { Participation } from '../../src/participations/entities/participation.entity';

describe('Nikra Backend E2E Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let campaignRepository: Repository<Campaign>;
  let associateRepository: Repository<Associate>;
  let participationRepository: Repository<Participation>;
  
  let accessToken: string;
  let userId: string;
  let campaignId: string;
  let associateId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Configurar app como en main.ts
    app.setGlobalPrefix('');
    
    await app.init();

    // Obtener repositorios
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    campaignRepository = moduleFixture.get<Repository<Campaign>>(getRepositoryToken(Campaign));
    associateRepository = moduleFixture.get<Repository<Associate>>(getRepositoryToken(Associate));
    participationRepository = moduleFixture.get<Repository<Participation>>(getRepositoryToken(Participation));
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    // Limpiar datos de test
    await participationRepository.delete({});
    await campaignRepository.delete({});
    await associateRepository.delete({});
    await userRepository.delete({});
    await app.close();
  });

  describe('🏥 Health Check', () => {
    it('should return 404 for root path (expected behavior)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(404);
    });

    it('should access Swagger documentation', () => {
      return request(app.getHttpServer())
        .get('/api/docs')
        .expect(200);
    });
  });

  describe('🔐 Authentication Module', () => {
    const testUser = {
      nombre: 'Juan',
      apellidos: 'García López',
      dni: '12345678A',
      direccion: 'Calle Mayor 123, Ceuta',
      email: 'juan.test@example.com',
      password: 'TestPassword123!'
    };

    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(testUser.email);
      
      accessToken = response.body.accessToken;
      userId = response.body.user.id;
    });

    it('should not register user with existing email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should not login with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
      expect(response.body.nombre).toBe(testUser.nombre);
    });

    it('should not access protected endpoint without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });
  });

  describe('👥 Users Module', () => {
    it('should get user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.email).toBe('juan.test@example.com');
    });

    it('should update user profile', async () => {
      const updateData = {
        nombre: 'Juan Carlos',
        apellidos: 'García López'
      };

      const response = await request(app.getHttpServer())
        .patch('/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.nombre).toBe(updateData.nombre);
    });

    it('should list users (with pagination)', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('should search users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search?q=Juan')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('🎯 Campaigns Module', () => {
    const testCampaign = {
      nombre: 'Campaña Test 2025',
      descripcion: 'Campaña de prueba para testing',
      imagenUrl: 'https://example.com/campaign.jpg',
      isActive: true
    };

    it('should create a new campaign', async () => {
      const response = await request(app.getHttpServer())
        .post('/campaigns')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testCampaign)
        .expect(201);

      expect(response.body.nombre).toBe(testCampaign.nombre);
      expect(response.body.isActive).toBe(true);
      
      campaignId = response.body.id;
    });

    it('should get all campaigns', async () => {
      const response = await request(app.getHttpServer())
        .get('/campaigns')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('campaigns');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.campaigns.length).toBeGreaterThan(0);
    });

    it('should get active campaigns', async () => {
      const response = await request(app.getHttpServer())
        .get('/campaigns/active')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get campaign by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/campaigns/${campaignId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(campaignId);
      expect(response.body.nombre).toBe(testCampaign.nombre);
    });

    it('should update campaign', async () => {
      const updateData = {
        nombre: 'Campaña Test 2025 - Actualizada',
        descripcion: 'Descripción actualizada'
      };

      const response = await request(app.getHttpServer())
        .patch(`/campaigns/${campaignId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.nombre).toBe(updateData.nombre);
    });

    it('should change campaign status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/campaigns/${campaignId}/status?isActive=false`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.isActive).toBe(false);
    });

    it('should clone campaign', async () => {
      const response = await request(app.getHttpServer())
        .post(`/campaigns/${campaignId}/clone`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ nombre: 'Copia de Campaña Test' })
        .expect(201);

      expect(response.body.nombre).toBe('Copia de Campaña Test');
      expect(response.body.isActive).toBe(false); // Copia inicia inactiva
    });
  });

  describe('🏪 Associates Module', () => {
    const testAssociate = {
      nombre: 'Supermercado Test',
      direccion: 'Calle Principal 456, Ceuta',
      telefono: '+34 956 123 456',
      activo: true
    };

    it('should create a new associate', async () => {
      const response = await request(app.getHttpServer())
        .post('/associates')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testAssociate)
        .expect(201);

      expect(response.body.nombre).toBe(testAssociate.nombre);
      expect(response.body.activo).toBe(true);
      
      associateId = response.body.id;
    });

    it('should get all associates', async () => {
      const response = await request(app.getHttpServer())
        .get('/associates')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('associates');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.associates.length).toBeGreaterThan(0);
    });

    it('should get active associates', async () => {
      const response = await request(app.getHttpServer())
        .get('/associates/active')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get associate by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/associates/${associateId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(associateId);
      expect(response.body.nombre).toBe(testAssociate.nombre);
    });

    it('should update associate', async () => {
      const updateData = {
        nombre: 'Supermercado Test - Actualizado',
        telefono: '+34 956 789 012'
      };

      const response = await request(app.getHttpServer())
        .patch(`/associates/${associateId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.nombre).toBe(updateData.nombre);
    });
  });

  describe('🎫 Participations Module', () => {
    const testParticipation = {
      associateId: associateId,
      numeroTicket: 'T-2025-TEST-001',
      fechaTicket: '2025-01-18',
      importeTotal: 25.99
    };

    it('should create a new participation', async () => {
      const response = await request(app.getHttpServer())
        .post('/participations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testParticipation)
        .expect(201);

      expect(response.body.numeroTicket).toBe(testParticipation.numeroTicket);
      expect(response.body.importeTotal).toBe(testParticipation.importeTotal);
      expect(response.body.userId).toBe(userId);
    });

    it('should not create duplicate participation', async () => {
      await request(app.getHttpServer())
        .post('/participations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testParticipation)
        .expect(409); // Conflict - duplicate ticket
    });

    it('should get user participations', async () => {
      const response = await request(app.getHttpServer())
        .get('/participations/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get all participations (with filters)', async () => {
      const response = await request(app.getHttpServer())
        .get('/participations')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('participations');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should not accept participation with future date', async () => {
      const futureParticipation = {
        ...testParticipation,
        numeroTicket: 'T-2025-FUTURE-001',
        fechaTicket: '2026-01-01'
      };

      await request(app.getHttpServer())
        .post('/participations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(futureParticipation)
        .expect(400);
    });

    it('should not accept participation with old date (>30 days)', async () => {
      const oldParticipation = {
        ...testParticipation,
        numeroTicket: 'T-2025-OLD-001',
        fechaTicket: '2024-01-01'
      };

      await request(app.getHttpServer())
        .post('/participations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(oldParticipation)
        .expect(400);
    });

    it('should enforce daily limit (5 participations per day)', async () => {
      // Crear 5 participaciones para el mismo día
      for (let i = 1; i <= 5; i++) {
        await request(app.getHttpServer())
          .post('/participations')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            ...testParticipation,
            numeroTicket: `T-2025-LIMIT-${i.toString().padStart(3, '0')}`
          })
          .expect(201);
      }

      // La sexta debería fallar
      await request(app.getHttpServer())
        .post('/participations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...testParticipation,
          numeroTicket: 'T-2025-LIMIT-006'
        })
        .expect(403); // Forbidden - daily limit exceeded
    });
  });

  describe('📊 Export Module', () => {
    it('should get export statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/export/participations/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalParticipations');
      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('totalAssociates');
      expect(response.body).toHaveProperty('totalAmount');
    });

    it('should export participations to CSV', async () => {
      const response = await request(app.getHttpServer())
        .get('/export/participations/csv')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('participaciones');
    });

    it('should export participations to Excel', async () => {
      const response = await request(app.getHttpServer())
        .get('/export/participations/excel')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('spreadsheetml');
      expect(response.headers['content-disposition']).toContain('participaciones');
    });

    it('should handle export with filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/export/participations/excel?associateId=' + associateId)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('spreadsheetml');
    });
  });

  describe('🛡️ Security Tests', () => {
    it('should reject invalid JWT token', async () => {
      await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject requests without authorization header', async () => {
      await request(app.getHttpServer())
        .get('/users/profile')
        .expect(401);
    });

    it('should validate input data', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: '123' // Too short
        })
        .expect(400);
    });

    it('should sanitize input data', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          nombre: '  Juan Carlos  ',
          apellidos: '  García López  '
        })
        .expect(200);

      // Los espacios deberían ser recortados
      expect(response.body.nombre).toBe('Juan Carlos');
      expect(response.body.apellidos).toBe('García López');
    });
  });

  describe('📈 Performance Tests', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(app.getHttpServer())
          .get('/campaigns/active')
          .set('Authorization', `Bearer ${accessToken}`)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});
