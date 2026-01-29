import { Case } from './case.entity';
import { User } from '../users/user.entity';
export declare enum CaseMatchStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    REJECTED = "rejected"
}
export declare class CaseMatch {
    id: string;
    missingCase: Case;
    missing_case_id: string;
    foundCase: Case;
    found_case_id: string;
    match_score: number;
    status: CaseMatchStatus;
    confirmedBy: User;
    confirmed_by: string;
    confirmed_at: Date | null;
    createdAt: Date;
}
