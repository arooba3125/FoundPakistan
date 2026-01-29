import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum CaseType {
  MISSING = 'missing',
  FOUND = 'found',
}

export enum CaseStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FOUND = 'found',
  REJECTED = 'rejected',
}

export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('cases')
export class Case {
  @PrimaryGeneratedColumn('uuid')
  case_id: string;

  @Column({
    type: 'enum',
    enum: CaseType,
  })
  case_type: CaseType;

  @Column({
    type: 'enum',
    enum: CaseStatus,
    default: CaseStatus.PENDING,
  })
  status: CaseStatus;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority: Priority;

  @Column()
  name: string;

  @Column({ nullable: true })
  name_ur: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column()
  city: string;

  @Column({ nullable: true })
  area: string;

  @Column('simple-array', { nullable: true })
  badge_tags: string[];

  @Column({ nullable: true })
  last_seen_location: string;

  @Column({ nullable: true })
  last_seen_date: Date;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  description_ur: string;

  @Column('simple-json', { nullable: true })
  media: { type: string; url: string }[];

  @Column({ nullable: true })
  contact_name: string;

  @Column({ nullable: true })
  contact_phone: string;

  @Column({ nullable: true })
  contact_email: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column()
  reporter_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verified_by' })
  verifiedBy: User;

  @Column({ nullable: true })
  verified_by: string;

  @Column({ nullable: true })
  verified_at: Date;

  @Column({ nullable: true })
  rejection_reason: string;

  @Column({ nullable: true })
  matched_with_case_id: string;

  @Column({ nullable: true, type: 'timestamp' })
  cancelled_at: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
