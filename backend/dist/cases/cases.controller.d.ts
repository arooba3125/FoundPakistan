import { CasesService } from './cases.service';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';
import { CaseStatus } from './case.entity';
export declare class CasesController {
    private readonly casesService;
    constructor(casesService: CasesService);
    create(createCaseDto: CreateCaseDto, req: any): Promise<import("./case.entity").Case>;
    findAll(status?: CaseStatus, caseType?: string, city?: string): Promise<import("./case.entity").Case[]>;
    findMyCases(req: any): Promise<import("./case.entity").Case[]>;
    findOne(id: string): Promise<import("./case.entity").Case>;
    update(id: string, updateCaseDto: UpdateCaseDto, req: any): Promise<import("./case.entity").Case>;
    verifyCase(id: string, req: any): Promise<import("./case.entity").Case>;
    rejectCase(id: string, reason: string, req: any): Promise<import("./case.entity").Case>;
    markAsFound(id: string, req: any): Promise<import("./case.entity").Case>;
    remove(id: string, req: any): Promise<void>;
}
