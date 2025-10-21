import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSetup20251018160850 implements MigrationInterface {
  name = 'InitialSetup20251018160850';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear extensión UUID
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Crear tabla users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nombre" character varying(100) NOT NULL,
        "apellidos" character varying(100) NOT NULL,
        "dni" character varying(20) NOT NULL,
        "direccion" text NOT NULL,
        "email" character varying(255) NOT NULL,
        "password" character varying(255) NOT NULL,
        "emailVerified" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "lastLoginAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    // Crear tabla campaigns
    await queryRunner.query(`
      CREATE TABLE "campaigns" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nombre" character varying(255) NOT NULL,
        "descripcion" text,
        "imagenUrl" character varying(500),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_5371f2e727451e8a5e48aecb4e4" PRIMARY KEY ("id")
      )
    `);

    // Crear tabla associates
    await queryRunner.query(`
      CREATE TABLE "associates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nombre" character varying(255) NOT NULL,
        "direccion" character varying(500) NOT NULL,
        "telefono" character varying(20),
        "activo" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_5b90b7eba01b16e8b43f7b30cae" PRIMARY KEY ("id")
      )
    `);

    // Crear tabla participations
    await queryRunner.query(`
      CREATE TABLE "participations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "associateId" uuid NOT NULL,
        "numeroTicket" character varying(100) NOT NULL,
        "fechaTicket" date NOT NULL,
        "importeTotal" numeric(10,2) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_67fb3ca32e43c9d8f1ee2be1c3e" PRIMARY KEY ("id")
      )
    `);

    // Crear índices únicos
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_5fe9cfa518b76c96518a206b350" ON "users" ("dni") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_97672ac88f789774dd47f7c8be3" ON "users" ("email") `);

    // Crear claves foráneas
    await queryRunner.query(`
      ALTER TABLE "participations" 
      ADD CONSTRAINT "FK_b96d1e076744a3081adbb791c48" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "participations" 
      ADD CONSTRAINT "FK_9d03fd9b14c9b62f4167a7acd7b" 
      FOREIGN KEY ("associateId") REFERENCES "associates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar claves foráneas
    await queryRunner.query(`ALTER TABLE "participations" DROP CONSTRAINT "FK_9d03fd9b14c9b62f4167a7acd7b"`);
    await queryRunner.query(`ALTER TABLE "participations" DROP CONSTRAINT "FK_b96d1e076744a3081adbb791c48"`);

    // Eliminar índices únicos
    await queryRunner.query(`DROP INDEX "UQ_97672ac88f789774dd47f7c8be3"`);
    await queryRunner.query(`DROP INDEX "UQ_5fe9cfa518b76c96518a206b350"`);

    // Eliminar tablas
    await queryRunner.query(`DROP TABLE "participations"`);
    await queryRunner.query(`DROP TABLE "associates"`);
    await queryRunner.query(`DROP TABLE "campaigns"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
