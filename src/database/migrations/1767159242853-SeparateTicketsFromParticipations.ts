import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class SeparateTicketsFromParticipations1767159242853 implements MigrationInterface {
  name = 'SeparateTicketsFromParticipations1767159242853';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar que las tablas existen
    const participationsExists = await queryRunner.hasTable('participations');
    const usersExists = await queryRunner.hasTable('users');
    const associatesExists = await queryRunner.hasTable('associates');

    if (!participationsExists) {
      throw new Error('Tabla participations no existe');
    }
    if (!usersExists) {
      throw new Error('Tabla users no existe');
    }
    if (!associatesExists) {
      throw new Error('Tabla associates no existe');
    }

    // 1. Crear tabla tickets
    await queryRunner.createTable(
      new Table({
        name: 'tickets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'associateId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'numeroTicket',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'fechaTicket',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'importeTotal',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'validated',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // 2. Crear índices únicos para tickets
    await queryRunner.createIndex(
      'tickets',
      new TableIndex({
        name: 'IDX_tickets_unique',
        columnNames: ['numeroTicket', 'userId', 'associateId'],
        isUnique: true,
      }),
    );

    // 3. Crear foreign keys de tickets
    await queryRunner.createForeignKey(
      'tickets',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_tickets_user',
      }),
    );

    await queryRunner.createForeignKey(
      'tickets',
      new TableForeignKey({
        columnNames: ['associateId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'associates',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_tickets_associate',
      }),
    );

    // 4. Migrar datos: Consolidar participaciones duplicadas en tickets únicos
    // Usamos DISTINCT ON para obtener un ticket único por (numeroTicket, userId, associateId)
    await queryRunner.query(`
      INSERT INTO tickets (id, "userId", "associateId", "numeroTicket", "fechaTicket", "importeTotal", validated, "createdAt", "updatedAt")
      SELECT DISTINCT ON ("numeroTicket", "userId", "associateId")
        uuid_generate_v4() as id,
        "userId",
        "associateId",
        "numeroTicket",
        "fechaTicket",
        "importeTotal",
        false as validated,
        MIN("createdAt") as "createdAt",
        MAX("updatedAt") as "updatedAt"
      FROM participations
      GROUP BY "numeroTicket", "userId", "associateId", "fechaTicket", "importeTotal"
      ORDER BY "numeroTicket", "userId", "associateId", "createdAt" ASC;
    `);

    // 5. Agregar columna ticketId a participations (nullable temporalmente)
    await queryRunner.addColumn(
      'participations',
      new TableColumn({
        name: 'ticketId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // 6. Migrar relaciones: Actualizar participations.ticketId basado en matching
    await queryRunner.query(`
      UPDATE participations p
      SET "ticketId" = t.id
      FROM tickets t
      WHERE p."numeroTicket" = t."numeroTicket"
        AND p."userId" = t."userId"
        AND p."associateId" = t."associateId";
    `);

    // 7. Verificar que todas las participaciones tienen ticketId
    const orphanedCount = await queryRunner.query(`
      SELECT COUNT(*) as count
      FROM participations
      WHERE "ticketId" IS NULL;
    `);

    if (orphanedCount[0]?.count > 0) {
      throw new Error(
        `Existen ${orphanedCount[0].count} participaciones sin ticket asociado. Revisar datos antes de continuar.`,
      );
    }

    // 8. Hacer ticketId NOT NULL
    await queryRunner.query(`
      ALTER TABLE participations
      ALTER COLUMN "ticketId" SET NOT NULL;
    `);

    // 9. Crear foreign key de participations a tickets
    await queryRunner.createForeignKey(
      'participations',
      new TableForeignKey({
        columnNames: ['ticketId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tickets',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
        name: 'FK_participations_ticket',
      }),
    );

    // 10. Crear índice en ticketId para mejor rendimiento
    await queryRunner.createIndex(
      'participations',
      new TableIndex({
        name: 'IDX_participations_ticketId',
        columnNames: ['ticketId'],
      }),
    );

    // 11. Eliminar foreign keys antiguas de participations (userId, associateId)
    const participationsTable = await queryRunner.getTable('participations');
    if (participationsTable) {
      const oldUserFk = participationsTable.foreignKeys.find(
        (fk) => fk.columnNames.includes('userId') && fk.name !== 'FK_participations_ticket',
      );
      if (oldUserFk) {
        await queryRunner.dropForeignKey('participations', oldUserFk);
      }

      const oldAssociateFk = participationsTable.foreignKeys.find(
        (fk) => fk.columnNames.includes('associateId') && fk.name !== 'FK_participations_ticket',
      );
      if (oldAssociateFk) {
        await queryRunner.dropForeignKey('participations', oldAssociateFk);
      }
    }

    // 12. Eliminar columnas duplicadas de participations
    await queryRunner.dropColumn('participations', 'numeroTicket');
    await queryRunner.dropColumn('participations', 'fechaTicket');
    await queryRunner.dropColumn('participations', 'importeTotal');
    await queryRunner.dropColumn('participations', 'userId');
    await queryRunner.dropColumn('participations', 'associateId');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Verificar que las tablas existen
    const ticketsExists = await queryRunner.hasTable('tickets');
    const participationsExists = await queryRunner.hasTable('participations');

    if (!ticketsExists || !participationsExists) {
      throw new Error('Tablas tickets o participations no existen');
    }

    // 1. Agregar columnas de vuelta a participations
    await queryRunner.addColumn(
      'participations',
      new TableColumn({
        name: 'userId',
        type: 'uuid',
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'participations',
      new TableColumn({
        name: 'associateId',
        type: 'uuid',
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'participations',
      new TableColumn({
        name: 'numeroTicket',
        type: 'varchar',
        length: '100',
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'participations',
      new TableColumn({
        name: 'fechaTicket',
        type: 'date',
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'participations',
      new TableColumn({
        name: 'importeTotal',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: false,
      }),
    );

    // 2. Migrar datos de vuelta desde tickets
    await queryRunner.query(`
      UPDATE participations p
      SET 
        "userId" = t."userId",
        "associateId" = t."associateId",
        "numeroTicket" = t."numeroTicket",
        "fechaTicket" = t."fechaTicket",
        "importeTotal" = t."importeTotal"
      FROM tickets t
      WHERE p."ticketId" = t.id;
    `);

    // 3. Eliminar foreign key de participations a tickets
    const participationsTable = await queryRunner.getTable('participations');
    if (participationsTable) {
      const ticketFk = participationsTable.foreignKeys.find(
        (fk) => fk.name === 'FK_participations_ticket',
      );
      if (ticketFk) {
        await queryRunner.dropForeignKey('participations', ticketFk);
      }
    }

    // 4. Eliminar índice de ticketId
    await queryRunner.dropIndex('participations', 'IDX_participations_ticketId');

    // 5. Eliminar columna ticketId
    await queryRunner.dropColumn('participations', 'ticketId');

    // 6. Recrear foreign keys antiguas
    await queryRunner.createForeignKey(
      'participations',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_participations_user',
      }),
    );

    await queryRunner.createForeignKey(
      'participations',
      new TableForeignKey({
        columnNames: ['associateId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'associates',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_participations_associate',
      }),
    );

    // 7. Eliminar tabla tickets
    await queryRunner.dropTable('tickets');
  }
}
