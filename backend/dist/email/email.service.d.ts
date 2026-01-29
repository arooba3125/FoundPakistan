import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private transporter;
    private logger;
    private fromEmail;
    constructor(configService: ConfigService);
    private initializeMailjet;
    sendVerificationEmail(email: string, token: string): Promise<void>;
    sendOtpEmail(email: string, otp: string): Promise<void>;
    sendCaseStatusEmail(email: string, caseId: string, status: string, caseName?: string, caseType?: string, rejectionReason?: string): Promise<void>;
    sendLoginNotificationEmail(email: string, timestamp: Date, ipAddress?: string): Promise<void>;
    sendContactRequestEmail(caseReporterEmail: string, caseId: string, caseName: string, requesterEmail: string, requesterMessage?: string): Promise<void>;
    sendContactApprovalEmail(requesterEmail: string, caseId: string, caseName: string, contactName: string, contactPhone: string, contactEmail: string): Promise<void>;
    sendContactRejectionEmail(requesterEmail: string, caseId: string, caseName: string): Promise<void>;
    sendMatchConfirmedEmail(reporterEmail: string, caseId: string, caseName: string, matchedCaseId: string, matchedCaseName: string, matchedCaseReporterName: string, matchedCaseContactPhone: string, matchedCaseContactEmail: string): Promise<void>;
}
