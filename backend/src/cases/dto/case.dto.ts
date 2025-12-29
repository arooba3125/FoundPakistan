import { IsString, IsEnum, IsOptional, IsInt, IsArray, IsEmail, IsDateString } from 'class-validator';
import { CaseType, Priority, Gender, CaseStatus } from '../case.entity';

export class CreateCaseDto {
  @IsEnum(CaseType)
  case_type: CaseType;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  name_ur?: string;

  @IsOptional()
  @IsInt()
  age?: number;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsArray()
  badge_tags?: string[];

  @IsOptional()
  @IsString()
  last_seen_location?: string;

  @IsOptional()
  @IsDateString()
  last_seen_date?: Date;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  description_ur?: string;

  @IsOptional()
  @IsArray()
  media?: { type: string; url: string }[];

  @IsOptional()
  @IsString()
  contact_name?: string;

  @IsOptional()
  @IsString()
  contact_phone?: string;

  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
}

export class UpdateCaseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  name_ur?: string;

  @IsOptional()
  @IsInt()
  age?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsArray()
  badge_tags?: string[];

  @IsOptional()
  @IsString()
  last_seen_location?: string;

  @IsOptional()
  @IsDateString()
  last_seen_date?: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  description_ur?: string;

  @IsOptional()
  @IsArray()
  media?: { type: string; url: string }[];

  @IsOptional()
  @IsString()
  contact_name?: string;

  @IsOptional()
  @IsString()
  contact_phone?: string;

  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsEnum(CaseType)
  case_type?: CaseType;

  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;
}
