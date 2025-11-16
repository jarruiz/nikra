import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeCampaignDatesRequired1763326906071 implements MigrationInterface {
    name = 'MakeCampaignDatesRequired1763326906071'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar que la tabla campaigns existe
        const tableExists = await queryRunner.hasTable('campaigns');
        if (!tableExists) {
            throw new Error('Tabla campaigns no existe');
        }

        // Verificar si hay registros con fechas null
        const campaignsWithNullDates = await queryRunner.query(`
            SELECT COUNT(*) as count 
            FROM "campaigns" 
            WHERE "fechaInicio" IS NULL OR "fechaFin" IS NULL
        `);

        const nullCount = parseInt(campaignsWithNullDates[0]?.count || '0', 10);

        if (nullCount > 0) {
            // Si hay registros con fechas null, establecer valores por defecto
            // Usar fecha de creación como fechaInicio y 30 días después como fechaFin
            await queryRunner.query(`
                UPDATE "campaigns" 
                SET 
                    "fechaInicio" = COALESCE("fechaInicio", "createdAt"),
                    "fechaFin" = COALESCE("fechaFin", "createdAt" + INTERVAL '30 days')
                WHERE "fechaInicio" IS NULL OR "fechaFin" IS NULL
            `);
        }

        // Agregar restricción NOT NULL a fechaInicio
        await queryRunner.query(`
            ALTER TABLE "campaigns" 
            ALTER COLUMN "fechaInicio" SET NOT NULL
        `);

        // Agregar restricción NOT NULL a fechaFin
        await queryRunner.query(`
            ALTER TABLE "campaigns" 
            ALTER COLUMN "fechaFin" SET NOT NULL
        `);

        // Agregar constraint CHECK para validar que fechaFin > fechaInicio
        await queryRunner.query(`
            ALTER TABLE "campaigns" 
            ADD CONSTRAINT "CHK_campaigns_fechaFin_after_fechaInicio" 
            CHECK ("fechaFin" > "fechaInicio")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar constraint CHECK
        await queryRunner.query(`
            ALTER TABLE "campaigns" 
            DROP CONSTRAINT IF EXISTS "CHK_campaigns_fechaFin_after_fechaInicio"
        `);

        // Eliminar restricción NOT NULL de fechaFin
        await queryRunner.query(`
            ALTER TABLE "campaigns" 
            ALTER COLUMN "fechaFin" DROP NOT NULL
        `);

        // Eliminar restricción NOT NULL de fechaInicio
        await queryRunner.query(`
            ALTER TABLE "campaigns" 
            ALTER COLUMN "fechaInicio" DROP NOT NULL
        `);
    }
}

