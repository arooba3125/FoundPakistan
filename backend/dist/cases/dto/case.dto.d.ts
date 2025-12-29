import { CaseType, Priority, Gender, CaseStatus } from '../case.entity';
export declare class CreateCaseDto {
    case_type: CaseType;
    name: string;
    name_ur?: string;
    age?: number;
    gender: Gender;
    city: string;
    area?: string;
    badge_tags?: string[];
    last_seen_location?: string;
    last_seen_date?: Date;
    description: string;
    description_ur?: string;
    media?: {
        type: string;
        url: string;
    }[];
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
    priority?: Priority;
}
export declare class UpdateCaseDto {
    name?: string;
    name_ur?: string;
    age?: number;
    gender?: Gender;
    city?: string;
    area?: string;
    badge_tags?: string[];
    last_seen_location?: string;
    last_seen_date?: Date;
    description?: string;
    description_ur?: string;
    media?: {
        type: string;
        url: string;
    }[];
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
    priority?: Priority;
    case_type?: CaseType;
    status?: CaseStatus;
}
