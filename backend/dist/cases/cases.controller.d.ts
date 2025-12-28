import { CasesService } from './cases.service';
import { MatchingService } from './matching.service';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';
import { CaseStatus } from './case.entity';
export declare class CasesController {
    private readonly casesService;
    private readonly matchingService;
    constructor(casesService: CasesService, matchingService: MatchingService);
    create(createCaseDto: CreateCaseDto, req: any): Promise<import("./case.entity").Case>;
    findAll(status?: CaseStatus, caseType?: string, city?: string): Promise<import("./case.entity").Case[]>;
    findMyCases(req: any): Promise<import("./case.entity").Case[]>;
    getContactRequests(req: any): Promise<import("./contact-request.entity").ContactRequest[]>;
    cancelCase(id: string, req: any): Promise<import("./case.entity").Case>;
    markAsFoundByUser(id: string, req: any): Promise<import("./case.entity").Case>;
    verifyCase(id: string, req: any): Promise<import("./case.entity").Case>;
    rejectCase(id: string, reason: string, req: any): Promise<import("./case.entity").Case>;
    createContactRequest(id: string, body: {
        email: string;
        message?: string;
    }, req: any): Promise<import("./contact-request.entity").ContactRequest>;
    findOne(id: string): Promise<import("./case.entity").Case>;
    update(id: string, updateCaseDto: UpdateCaseDto, req: any): Promise<import("./case.entity").Case>;
    remove(id: string, req: any): Promise<void>;
    approveContactRequest(id: string, req: any): Promise<import("./contact-request.entity").ContactRequest>;
    rejectContactRequest(id: string, req: any): Promise<import("./contact-request.entity").ContactRequest>;
    getPotentialMatches(): Promise<import("./case-match.entity").CaseMatch[]>;
    confirmMatch(id: string, req: any): Promise<import("./case-match.entity").CaseMatch>;
    rejectMatch(id: string, req: any): Promise<import("./case-match.entity").CaseMatch>;
}
