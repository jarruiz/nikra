import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserFields1760850000000 implements MigrationInterface {
  name = 'UpdateUserFields1760850000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar la nueva columna fullName (temporalmente nullable para permitir la migración)
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "fullName" character varying(200)
    `);

    // 2. Migrar datos: concatenar nombre y apellidos en fullName
    await queryRunner.query(`
      UPDATE "users" 
      SET "fullName" = CONCAT("nombre", ' ', "apellidos")
      WHERE "fullName" IS NULL
    `);

    // 3. Hacer fullName NOT NULL
    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "fullName" SET NOT NULL
    `);

    // 4. Eliminar columnas antiguas
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "nombre"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "apellidos"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "direccion"
    `);

    // 5. Agregar nueva columna phone (nullable)
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "phone" character varying(15)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir cambios en orden inverso
    
    // 1. Eliminar columna phone
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "phone"
    `);

    // 2. Agregar columnas antiguas
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "direccion" text
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "apellidos" character varying(100)
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "nombre" character varying(100)
    `);

    // 3. Intentar recuperar datos de fullName (separando por espacio)
    // Nota: Esta es una aproximación, puede no ser perfecta
    await queryRunner.query(`
      UPDATE "users" 
      SET "nombre" = SPLIT_PART("fullName", ' ', 1),
          "apellidos" = SUBSTRING("fullName" FROM POSITION(' ' IN "fullName") + 1)
      WHERE "nombre" IS NULL
    `);

    // 4. Hacer NOT NULL las columnas recuperadas
    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "nombre" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "apellidos" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "direccion" SET NOT NULL,
      ALTER COLUMN "direccion" SET DEFAULT ''
    `);

    // 5. Eliminar columna fullName
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "fullName"
    `);
  }
}

