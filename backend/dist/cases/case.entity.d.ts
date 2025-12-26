import { User } from '../users/user.entity';
export declare enum CaseType {
    MISSING = "missing",
    FOUND = "found"
}
export declare enum CaseStatus {
    PENDING = "pending",
    VERIFIED = "verified",
    FOUND = "found",
    REJECTED = "rejected"
}
export declare enum Priority {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other"
}
export declare class Case {
    case_id: string;
    case_type: CaseType;
    status: CaseStatus;
    priority: Priority;
    name: string;
    name_ur: string;
    age: number;
    gender: Gender;
    city: string;
    area: string;
    badge_tags: string[];
    last_seen_location: string;
    last_seen_date: Date;
    description: string;
    description_ur: string;
    media: {
        type: string;
        url: string;
    }[];
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    reporter: User;
    reporter_id: string;
    verifiedBy: User;
    verified_by: string;
    verified_at: Date;
    rejection_reason: string;
    createdAt: Date;
    updatedAt: Date;
}
