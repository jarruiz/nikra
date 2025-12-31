import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';

// Configuración
import { DatabaseConfig } from './config/database.config';
import { JwtConfig } from './config/jwt.config';
import emailConfig from './config/email.config';

// Módulos
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ParticipationsModule } from './participations/participations.module';
import { AssociatesModule } from './associates/associates.module';
import { ExportModule } from './export/export.module';
import { UploadModule } from './upload/upload.module';
import { RolesModule } from './roles/roles.module';
import { TicketsModule } from './tickets/tickets.module';

// Entidades
import { User } from './users/entities/user.entity';
import { Campaign } from './campaigns/entities/campaign.entity';
import { Participation } from './participations/entities/participation.entity';
import { Ticket } from './tickets/entities/ticket.entity';
import { Associate } from './associates/entities/associate.entity';
import { Role } from './roles/entities/role.entity';
import { Permission } from './roles/entities/permission.entity';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [DatabaseConfig, JwtConfig, emailConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Base de datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          entities: [User, Campaign, Participation, Ticket, Associate, Role, Permission],
          migrations: [join(__dirname, 'database/migrations/*{.ts,.js}')],
          synchronize: false, // Usar migraciones en su lugar
          migrationsRun: process.env.NODE_ENV === 'production', // Auto-run migraciones en producción
          logging: dbConfig.logging,
          ssl: dbConfig.ssl,
          timezone: dbConfig.timezone,
          extra: {
            ...dbConfig.extra,
            // Configuraciones específicas de TypeORM
            retryAttempts: 3,
            retryDelay: 3000,
          },
        };
      },
      inject: [ConfigService],
    }),

    // JWT Global - eliminado porque se configura en AuthModule

    // Passport
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Schedule Module para tareas programadas
    ScheduleModule.forRoot(),

    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    RolesModule,
    CampaignsModule,
    ParticipationsModule,
    AssociatesModule,
    ExportModule,
    UploadModule,
    TicketsModule,
  ],
})
export class AppModule {}
