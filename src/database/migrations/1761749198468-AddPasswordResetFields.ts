import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetFields1761749198468 implements MigrationInterface {
  name = 'AddPasswordResetFields1761749198468';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna resetPasswordToken (varchar, nullable, unique)
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "resetPasswordToken" character varying(255) NULL
    `);

    // Crear índice único para resetPasswordToken
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_resetPasswordToken" 
      ON "users" ("resetPasswordToken") 
      WHERE "resetPasswordToken" IS NOT NULL
    `);

    // Agregar columna resetPasswordExpires (timestamp, nullable)
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "resetPasswordExpires" TIMESTAMP NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índice único
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_users_resetPasswordToken"
    `);

    // Eliminar columna resetPasswordExpires
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "resetPasswordExpires"
    `);

    // Eliminar columna resetPasswordToken
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "resetPasswordToken"
    `);
  }
}

