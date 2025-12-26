import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private transporter;
    private logger;
    constructor(configService: ConfigService);
    private initializeTransporter;
    sendVerificationEmail(email: string, token: string): Promise<void>;
    sendCaseStatusEmail(email: string, caseId: string, status: string): Promise<void>;
}
