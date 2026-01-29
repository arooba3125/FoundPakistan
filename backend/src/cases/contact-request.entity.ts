import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Case } from './case.entity';
import { User } from '../users/user.entity';

export enum ContactRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('contact_requests')
export class ContactRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Case, { nullable: false })
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @Column()
  case_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  @Column({ nullable: true })
  requester_id: string | null;

  @Column()
  requester_email: string;

  @Column({ type: 'text', nullable: true })
  requester_message: string;

  @Column({
    type: 'enum',
    enum: ContactRequestStatus,
    default: ContactRequestStatus.PENDING,
  })
  status: ContactRequestStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  respondedAt: Date | null;
}

