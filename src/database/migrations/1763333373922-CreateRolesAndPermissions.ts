import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRolesAndPermissions1763333373922 implements MigrationInterface {
    name = 'CreateRolesAndPermissions1763333373922'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla permissions
        await queryRunner.query(`
            CREATE TABLE "permissions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "resource" character varying(50) NOT NULL,
                "action" character varying(50) NOT NULL,
                "description" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_permissions" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_permissions_name" UNIQUE ("name")
            )
        `);

        // Crear tabla roles
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "description" text,
                "isDefault" boolean NOT NULL DEFAULT false,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_roles" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_roles_name" UNIQUE ("name")
            )
        `);

        // Crear tabla intermedia role_permissions
        await queryRunner.query(`
            CREATE TABLE "role_permissions" (
                "roleId" uuid NOT NULL,
                "permissionId" uuid NOT NULL,
                CONSTRAINT "PK_role_permissions" PRIMARY KEY ("roleId", "permissionId")
            )
        `);

        // Crear tabla intermedia user_roles
        await queryRunner.query(`
            CREATE TABLE "user_roles" (
                "userId" uuid NOT NULL,
                "roleId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_user_roles" PRIMARY KEY ("userId", "roleId")
            )
        `);

        // Crear índices
        await queryRunner.query(`CREATE INDEX "IDX_role_permissions_roleId" ON "role_permissions" ("roleId")`);
        await queryRunner.query(`CREATE INDEX "IDX_role_permissions_permissionId" ON "role_permissions" ("permissionId")`);
        await queryRunner.query(`CREATE INDEX "IDX_user_roles_userId" ON "user_roles" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_user_roles_roleId" ON "user_roles" ("roleId")`);
        await queryRunner.query(`CREATE INDEX "IDX_roles_isDefault" ON "roles" ("isDefault")`);

        // Crear claves foráneas para role_permissions
        await queryRunner.query(`
            ALTER TABLE "role_permissions" 
            ADD CONSTRAINT "FK_role_permissions_roleId" 
            FOREIGN KEY ("roleId") REFERENCES "roles"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "role_permissions" 
            ADD CONSTRAINT "FK_role_permissions_permissionId" 
            FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // Crear claves foráneas para user_roles
        await queryRunner.query(`
            ALTER TABLE "user_roles" 
            ADD CONSTRAINT "FK_user_roles_userId" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "user_roles" 
            ADD CONSTRAINT "FK_user_roles_roleId" 
            FOREIGN KEY ("roleId") REFERENCES "roles"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // Crear constraint para asegurar solo un rol por defecto
        // Esto se hará mediante un trigger o validación a nivel de aplicación
        // ya que PostgreSQL no tiene constraint CHECK que funcione bien para esto
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar claves foráneas
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "FK_user_roles_roleId"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "FK_user_roles_userId"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "FK_role_permissions_permissionId"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "FK_role_permissions_roleId"`);

        // Eliminar índices
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_roles_isDefault"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_roles_roleId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_roles_userId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_role_permissions_permissionId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_role_permissions_roleId"`);

        // Eliminar tablas
        await queryRunner.query(`DROP TABLE IF EXISTS "user_roles"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "permissions"`);
    }
}

