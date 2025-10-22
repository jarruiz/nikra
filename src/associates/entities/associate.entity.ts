import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('associates')
export class Associate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion: string;

  @Column({ type: 'text', nullable: true })
  maps_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  web_texto: string;

  @Column({ type: 'text', nullable: true })
  web_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rrss_texto: string;

  @Column({ type: 'text', nullable: true })
  rrss_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imagen: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
