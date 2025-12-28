import { Repository } from 'typeorm';
import { Case, CaseStatus } from './case.entity';
import { ContactRequest } from './contact-request.entity';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';
import { User } from '../users/user.entity';
import { EmailService } from '../email/email.service';
import { MatchingService } from './matching.service';
export declare class CasesService {
    private casesRepository;
    private contactRequestRepository;
    private emailService;
    private matchingService;
    constructor(casesRepository: Repository<Case>, contactRequestRepository: Repository<ContactRequest>, emailService: EmailService, matchingService: MatchingService);
    create(createCaseDto: CreateCaseDto, userId: string): Promise<Case>;
    findAll(filters?: {
        status?: CaseStatus;
        case_type?: string;
        city?: string;
    }): Promise<Case[]>;
    findOne(id: string): Promise<Case>;
    findByReporter(userId: string): Promise<Case[]>;
    update(id: string, updateCaseDto: UpdateCaseDto, user: User): Promise<Case>;
    verifyCase(id: string, adminId: string): Promise<Case>;
    rejectCase(id: string, adminId: string, reason: string): Promise<Case>;
    markAsFound(id: string, adminId: string): Promise<Case>;
    delete(id: string, user: User): Promise<void>;
    createContactRequest(caseId: string, requesterEmail: string, requesterMessage?: string, requesterId?: string): Promise<ContactRequest>;
    getContactRequestsForReporter(userId: string): Promise<ContactRequest[]>;
    approveContactRequest(requestId: string, userId: string): Promise<ContactRequest>;
    rejectContactRequest(requestId: string, userId: string): Promise<ContactRequest>;
    cancelCase(caseId: string, userId: string): Promise<Case>;
    markAsFoundByUser(caseId: string, userId: string): Promise<Case>;
}
