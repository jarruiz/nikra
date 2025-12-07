import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddCampaignFieldsAndParticipationCampaign1765071821903 implements MigrationInterface {
  name = 'AddCampaignFieldsAndParticipationCampaign1765071821903';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar que las tablas existen
    const campaignsExists = await queryRunner.hasTable('campaigns');
    const participationsExists = await queryRunner.hasTable('participations');

    if (!campaignsExists) {
      throw new Error('Tabla campaigns no existe');
    }
    if (!participationsExists) {
      throw new Error('Tabla participations no existe');
    }

    // Agregar nuevos campos a la tabla campaigns
    await queryRunner.addColumn(
      'campaigns',
      new TableColumn({
        name: 'importeMinimo',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: false,
        default: 0,
      }),
    );

    await queryRunner.addColumn(
      'campaigns',
      new TableColumn({
        name: 'cuantiaMaximaAcumulable',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'campaigns',
      new TableColumn({
        name: 'reglaParticipacion',
        type: 'varchar',
        length: '255',
        isNullable: false,
        default: '',
      }),
    );

    await queryRunner.addColumn(
      'campaigns',
      new TableColumn({
        name: 'reglaRedondeo',
        type: 'varchar',
        length: '255',
        isNullable: false,
        default: '',
      }),
    );

    await queryRunner.addColumn(
      'campaigns',
      new TableColumn({
        name: 'basesLegalesUrl',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
    );

    // Agregar campaignId a la tabla participations (nullable para compatibilidad con datos existentes)
    // Las nuevas participaciones siempre tendrán campaignId, pero las antiguas pueden no tenerlo
    await queryRunner.addColumn(
      'participations',
      new TableColumn({
        name: 'campaignId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Agregar clave foránea de participations a campaigns (solo para valores no null)
    // Nota: PostgreSQL permite foreign keys con valores null
    await queryRunner.createForeignKey(
      'participations',
      new TableForeignKey({
        columnNames: ['campaignId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'campaigns',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_participations_campaign',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar clave foránea
    const table = await queryRunner.getTable('participations');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.name === 'FK_participations_campaign',
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('participations', foreignKey);
      }
    }

    // Eliminar columna campaignId
    await queryRunner.dropColumn('participations', 'campaignId');

    // Eliminar columnas de campaigns
    await queryRunner.dropColumn('campaigns', 'basesLegalesUrl');
    await queryRunner.dropColumn('campaigns', 'reglaRedondeo');
    await queryRunner.dropColumn('campaigns', 'reglaParticipacion');
    await queryRunner.dropColumn('campaigns', 'cuantiaMaximaAcumulable');
    await queryRunner.dropColumn('campaigns', 'importeMinimo');
  }
}

