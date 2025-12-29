import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Case } from './case.entity';
import { User } from '../users/user.entity';

export enum CaseMatchStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

@Entity('case_matches')
export class CaseMatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Case, { nullable: false })
  @JoinColumn({ name: 'missing_case_id' })
  missingCase: Case;

  @Column()
  missing_case_id: string;

  @ManyToOne(() => Case, { nullable: false })
  @JoinColumn({ name: 'found_case_id' })
  foundCase: Case;

  @Column()
  found_case_id: string;

  @Column({ type: 'int' })
  match_score: number;

  @Column({
    type: 'enum',
    enum: CaseMatchStatus,
    default: CaseMatchStatus.PENDING,
  })
  status: CaseMatchStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'confirmed_by' })
  confirmedBy: User;

  @Column({ nullable: true })
  confirmed_by: string;

  @Column({ nullable: true, type: 'timestamp' })
  confirmed_at: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}

