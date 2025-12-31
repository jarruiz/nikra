import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Associate } from '../../associates/entities/associate.entity';

@Entity('tickets')
@Index(['numeroTicket', 'userId', 'associateId'], { unique: true })
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  associateId: string;

  @Column({ type: 'varchar', length: 100 })
  numeroTicket: string;

  @Column({ type: 'date' })
  fechaTicket: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  importeTotal: number;

  @Column({ type: 'boolean', default: false })
  validated: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Associate)
  @JoinColumn({ name: 'associateId' })
  associate: Associate;
}
