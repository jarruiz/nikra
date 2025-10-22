import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAssociatesFields1760850000001 implements MigrationInterface {
  name = 'UpdateAssociatesFields1760850000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar nuevos campos a la tabla associates
    // Mantener el id como UUID de generación automática
    
    // Verificar si los campos ya existen antes de agregarlos
    const tableExists = await queryRunner.hasTable('associates');
    if (!tableExists) {
      throw new Error('Tabla associates no existe');
    }

    // Agregar campos que no existen
    await queryRunner.query(`ALTER TABLE "associates" ADD "descripcion" text`);
    
    // Modificar campo telefono existente para aumentar longitud
    await queryRunner.query(`ALTER TABLE "associates" ALTER COLUMN "telefono" TYPE character varying(50)`);
    
    // Modificar campo direccion existente para cambiar longitud
    await queryRunner.query(`ALTER TABLE "associates" ALTER COLUMN "direccion" TYPE character varying(255)`);
    
    // Agregar nuevos campos
    await queryRunner.query(`ALTER TABLE "associates" ADD "maps_url" text`);
    await queryRunner.query(`ALTER TABLE "associates" ADD "web_texto" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "associates" ADD "web_url" text`);
    await queryRunner.query(`ALTER TABLE "associates" ADD "rrss_texto" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "associates" ADD "rrss_url" text`);
    await queryRunner.query(`ALTER TABLE "associates" ADD "imagen" character varying(255)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir cambios - eliminar campos agregados y restaurar campos modificados
    
    // Eliminar campos agregados
    await queryRunner.query(`ALTER TABLE "associates" DROP COLUMN "imagen"`);
    await queryRunner.query(`ALTER TABLE "associates" DROP COLUMN "rrss_url"`);
    await queryRunner.query(`ALTER TABLE "associates" DROP COLUMN "rrss_texto"`);
    await queryRunner.query(`ALTER TABLE "associates" DROP COLUMN "web_url"`);
    await queryRunner.query(`ALTER TABLE "associates" DROP COLUMN "web_texto"`);
    await queryRunner.query(`ALTER TABLE "associates" DROP COLUMN "maps_url"`);
    await queryRunner.query(`ALTER TABLE "associates" DROP COLUMN "descripcion"`);
    
    // Restaurar campos modificados a su estado original
    await queryRunner.query(`ALTER TABLE "associates" ALTER COLUMN "telefono" TYPE character varying(20)`);
    await queryRunner.query(`ALTER TABLE "associates" ALTER COLUMN "direccion" TYPE character varying(500)`);
  }
}
