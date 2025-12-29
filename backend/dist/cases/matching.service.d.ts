import { Repository } from 'typeorm';
import { Case } from './case.entity';
import { CaseMatch } from './case-match.entity';
import { ContactRequest } from './contact-request.entity';
import { EmailService } from '../email/email.service';
export declare class MatchingService {
    private casesRepository;
    private caseMatchRepository;
    private contactRequestRepository;
    private emailService;
    constructor(casesRepository: Repository<Case>, caseMatchRepository: Repository<CaseMatch>, contactRequestRepository: Repository<ContactRequest>, emailService: EmailService);
    calculateMatchScore(missingCase: Case, foundCase: Case): number;
    private calculateNameSimilarity;
    private countCommonCharacters;
    private calculateDateProximity;
    private calculateLocationSimilarity;
    findPotentialMatches(caseId: string): Promise<CaseMatch[]>;
    getPendingMatches(): Promise<CaseMatch[]>;
    getMatchById(matchId: string): Promise<CaseMatch>;
    confirmMatch(matchId: string, adminId: string): Promise<CaseMatch>;
    rejectMatch(matchId: string, adminId: string): Promise<CaseMatch>;
    rejectMatchesForCase(caseId: string): Promise<void>;
}
