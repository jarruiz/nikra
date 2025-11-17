import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedRolesAndPermissions1763333373923 implements MigrationInterface {
    name = 'SeedRolesAndPermissions1763333373923'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar que las tablas existen
        const permissionsTableExists = await queryRunner.hasTable('permissions');
        const rolesTableExists = await queryRunner.hasTable('roles');
        
        if (!permissionsTableExists || !rolesTableExists) {
            throw new Error('Las tablas permissions y roles deben existir antes de ejecutar este seed');
        }

        // Insertar permisos base
        const permissions = [
            // Campaigns
            { name: 'campaigns.read', resource: 'campaigns', action: 'read', description: 'Permite leer campañas' },
            { name: 'campaigns.create', resource: 'campaigns', action: 'create', description: 'Permite crear campañas' },
            { name: 'campaigns.update', resource: 'campaigns', action: 'update', description: 'Permite actualizar campañas' },
            { name: 'campaigns.delete', resource: 'campaigns', action: 'delete', description: 'Permite eliminar campañas' },
            { name: 'campaigns.manage', resource: 'campaigns', action: 'manage', description: 'Permite gestionar todas las operaciones de campañas' },
            
            // Participations
            { name: 'participations.create', resource: 'participations', action: 'create', description: 'Permite crear participaciones' },
            { name: 'participations.read.own', resource: 'participations', action: 'read.own', description: 'Permite leer solo las propias participaciones' },
            { name: 'participations.read.all', resource: 'participations', action: 'read.all', description: 'Permite leer todas las participaciones' },
            { name: 'participations.update', resource: 'participations', action: 'update', description: 'Permite actualizar participaciones' },
            { name: 'participations.delete', resource: 'participations', action: 'delete', description: 'Permite eliminar participaciones' },
            { name: 'participations.manage', resource: 'participations', action: 'manage', description: 'Permite gestionar todas las operaciones de participaciones' },
            
            // Users
            { name: 'users.read', resource: 'users', action: 'read', description: 'Permite leer usuarios' },
            { name: 'users.update', resource: 'users', action: 'update', description: 'Permite actualizar usuarios' },
            { name: 'users.delete', resource: 'users', action: 'delete', description: 'Permite eliminar usuarios' },
            { name: 'users.manage', resource: 'users', action: 'manage', description: 'Permite gestionar todas las operaciones de usuarios' },
            
            // Associates
            { name: 'associates.read', resource: 'associates', action: 'read', description: 'Permite leer comercios asociados' },
            { name: 'associates.create', resource: 'associates', action: 'create', description: 'Permite crear comercios asociados' },
            { name: 'associates.update', resource: 'associates', action: 'update', description: 'Permite actualizar comercios asociados' },
            { name: 'associates.delete', resource: 'associates', action: 'delete', description: 'Permite eliminar comercios asociados' },
            { name: 'associates.manage', resource: 'associates', action: 'manage', description: 'Permite gestionar todas las operaciones de comercios asociados' },
            
            // Roles
            { name: 'roles.read', resource: 'roles', action: 'read', description: 'Permite leer roles' },
            { name: 'roles.create', resource: 'roles', action: 'create', description: 'Permite crear roles' },
            { name: 'roles.update', resource: 'roles', action: 'update', description: 'Permite actualizar roles' },
            { name: 'roles.delete', resource: 'roles', action: 'delete', description: 'Permite eliminar roles' },
            { name: 'roles.manage', resource: 'roles', action: 'manage', description: 'Permite gestionar todas las operaciones de roles' },
            
            // Permissions
            { name: 'permissions.read', resource: 'permissions', action: 'read', description: 'Permite leer permisos' },
            { name: 'permissions.manage', resource: 'permissions', action: 'manage', description: 'Permite gestionar todas las operaciones de permisos' },
        ];

        // Insertar permisos
        for (const permission of permissions) {
            await queryRunner.query(`
                INSERT INTO "permissions" ("name", "resource", "action", "description", "createdAt", "updatedAt")
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                ON CONFLICT ("name") DO NOTHING
            `, [permission.name, permission.resource, permission.action, permission.description]);
        }

        // Insertar rol end_user (rol por defecto)
        await queryRunner.query(`
            INSERT INTO "roles" ("name", "description", "isDefault", "isActive", "createdAt", "updatedAt")
            VALUES ('end_user', 'Usuario final que participa en campañas', true, true, NOW(), NOW())
            ON CONFLICT ("name") DO NOTHING
        `);

        // Insertar rol admin
        await queryRunner.query(`
            INSERT INTO "roles" ("name", "description", "isDefault", "isActive", "createdAt", "updatedAt")
            VALUES ('admin', 'Administrador con todos los permisos', false, true, NOW(), NOW())
            ON CONFLICT ("name") DO NOTHING
        `);

        // Obtener IDs de roles y permisos
        const endUserRole = await queryRunner.query(`
            SELECT id FROM "roles" WHERE "name" = 'end_user' LIMIT 1
        `);
        const adminRole = await queryRunner.query(`
            SELECT id FROM "roles" WHERE "name" = 'admin' LIMIT 1
        `);

        // Asignar permisos al rol end_user
        if (endUserRole && endUserRole.length > 0) {
            const endUserId = endUserRole[0].id;
            
            const endUserPermissions = [
                'campaigns.read',
                'participations.create',
                'participations.read.own',
            ];

            for (const permName of endUserPermissions) {
                const permission = await queryRunner.query(`
                    SELECT id FROM "permissions" WHERE "name" = $1 LIMIT 1
                `, [permName]);
                
                if (permission && permission.length > 0) {
                    await queryRunner.query(`
                        INSERT INTO "role_permissions" ("roleId", "permissionId")
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [endUserId, permission[0].id]);
                }
            }
        }

        // Asignar todos los permisos al rol admin
        if (adminRole && adminRole.length > 0) {
            const adminId = adminRole[0].id;
            
            const allPermissions = await queryRunner.query(`
                SELECT id FROM "permissions"
            `);
            
            for (const perm of allPermissions) {
                await queryRunner.query(`
                    INSERT INTO "role_permissions" ("roleId", "permissionId")
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING
                `, [adminId, perm.id]);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar asignaciones de permisos a roles
        await queryRunner.query(`DELETE FROM "role_permissions"`);
        
        // Eliminar roles
        await queryRunner.query(`DELETE FROM "roles" WHERE "name" IN ('end_user', 'admin')`);
        
        // Eliminar permisos
        await queryRunner.query(`
            DELETE FROM "permissions" 
            WHERE "name" IN (
                'campaigns.read', 'campaigns.create', 'campaigns.update', 'campaigns.delete', 'campaigns.manage',
                'participations.create', 'participations.read.own', 'participations.read.all', 
                'participations.update', 'participations.delete', 'participations.manage',
                'users.read', 'users.update', 'users.delete', 'users.manage',
                'associates.read', 'associates.create', 'associates.update', 'associates.delete', 'associates.manage',
                'roles.read', 'roles.create', 'roles.update', 'roles.delete', 'roles.manage',
                'permissions.read', 'permissions.manage'
            )
        `);
    }
}

