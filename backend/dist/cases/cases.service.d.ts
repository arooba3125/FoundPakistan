import { Repository } from 'typeorm';
import { Case, CaseStatus } from './case.entity';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';
import { User } from '../users/user.entity';
export declare class CasesService {
    private casesRepository;
    constructor(casesRepository: Repository<Case>);
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
}
