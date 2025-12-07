import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Associate } from '../../associates/entities/associate.entity';
import { Campaign } from '../../campaigns/entities/campaign.entity';

@Entity('participations')
export class Participation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  associateId: string;

  @Column({ type: 'uuid', nullable: true })
  campaignId: string;

  @Column({ type: 'varchar', length: 100 })
  numeroTicket: string;

  @Column({ type: 'date' })
  fechaTicket: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  importeTotal: number;

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

  @ManyToOne(() => Campaign, { nullable: true })
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;
}
