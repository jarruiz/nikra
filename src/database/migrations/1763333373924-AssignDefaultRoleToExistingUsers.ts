import { MigrationInterface, QueryRunner } from "typeorm";

export class AssignDefaultRoleToExistingUsers1763333373924 implements MigrationInterface {
    name = 'AssignDefaultRoleToExistingUsers1763333373924'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar que las tablas existen
        const usersTableExists = await queryRunner.hasTable('users');
        const rolesTableExists = await queryRunner.hasTable('roles');
        const userRolesTableExists = await queryRunner.hasTable('user_roles');
        
        if (!usersTableExists || !rolesTableExists || !userRolesTableExists) {
            throw new Error('Las tablas users, roles y user_roles deben existir antes de ejecutar esta migración');
        }

        // Obtener el rol por defecto
        const defaultRole = await queryRunner.query(`
            SELECT id FROM "roles" WHERE "isDefault" = true AND "isActive" = true LIMIT 1
        `);

        if (!defaultRole || defaultRole.length === 0) {
            console.warn('⚠️  No se encontró un rol por defecto. Los usuarios existentes no recibirán un rol automáticamente.');
            return;
        }

        const defaultRoleId = defaultRole[0].id;

        // Obtener todos los usuarios que no tienen roles asignados
        const usersWithoutRoles = await queryRunner.query(`
            SELECT u.id 
            FROM "users" u
            LEFT JOIN "user_roles" ur ON u.id = ur."userId"
            WHERE ur."userId" IS NULL
        `);

        if (usersWithoutRoles.length === 0) {
            console.log('✅ Todos los usuarios ya tienen roles asignados.');
            return;
        }

        // Asignar el rol por defecto a todos los usuarios sin roles
        for (const user of usersWithoutRoles) {
            await queryRunner.query(`
                INSERT INTO "user_roles" ("userId", "roleId", "createdAt")
                VALUES ($1, $2, NOW())
                ON CONFLICT DO NOTHING
            `, [user.id, defaultRoleId]);
        }

        console.log(`✅ Rol por defecto asignado a ${usersWithoutRoles.length} usuario(s) existente(s).`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Obtener el rol por defecto
        const defaultRole = await queryRunner.query(`
            SELECT id FROM "roles" WHERE "isDefault" = true LIMIT 1
        `);

        if (!defaultRole || defaultRole.length === 0) {
            return;
        }

        const defaultRoleId = defaultRole[0].id;

        // Eliminar el rol por defecto de todos los usuarios que solo tienen ese rol
        await queryRunner.query(`
            DELETE FROM "user_roles" 
            WHERE "roleId" = $1
            AND "userId" IN (
                SELECT "userId" 
                FROM "user_roles" 
                WHERE "roleId" = $1
                GROUP BY "userId"
                HAVING COUNT(*) = 1
            )
        `, [defaultRoleId]);
    }
}

