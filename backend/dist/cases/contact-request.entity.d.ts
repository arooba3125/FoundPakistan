import { Case } from './case.entity';
import { User } from '../users/user.entity';
export declare enum ContactRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class ContactRequest {
    id: string;
    case: Case;
    case_id: string;
    requester: User;
    requester_id: string | null;
    requester_email: string;
    requester_message: string;
    status: ContactRequestStatus;
    createdAt: Date;
    updatedAt: Date;
    respondedAt: Date | null;
}
