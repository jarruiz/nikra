import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imagenUrl: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: false })
  fechaInicio: Date;

  @Column({ type: 'timestamp', nullable: false })
  fechaFin: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  importeMinimo: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cuantiaMaximaAcumulable: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  reglaParticipacion: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  reglaRedondeo: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  basesLegalesUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
