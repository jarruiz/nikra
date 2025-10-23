import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCampaignDates1760850000002 implements MigrationInterface {
    name = 'AddCampaignDates1760850000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar que la tabla campaigns existe
        const tableExists = await queryRunner.hasTable('campaigns');
        if (!tableExists) {
            throw new Error('Tabla campaigns no existe');
        }

        // Agregar columna fechaInicio
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "fechaInicio" TIMESTAMP`);
        
        // Agregar columna fechaFin
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "fechaFin" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar columna fechaFin
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "fechaFin"`);
        
        // Eliminar columna fechaInicio
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "fechaInicio"`);
    }
}
