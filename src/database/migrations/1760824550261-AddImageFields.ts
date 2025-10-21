import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageFields1760824550261 implements MigrationInterface {
    name = 'AddImageFields1760824550261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."UQ_5fe9cfa518b76c96518a206b350"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "avatarUrl" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "associates" ADD "logoUrl" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_5fe9cfa518b76c96518a206b350" UNIQUE ("dni")`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_5fe9cfa518b76c96518a206b350"`);
        await queryRunner.query(`ALTER TABLE "associates" DROP COLUMN "logoUrl"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatarUrl"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_97672ac88f789774dd47f7c8be3" ON "users" ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_5fe9cfa518b76c96518a206b350" ON "users" ("dni") `);
    }

}
