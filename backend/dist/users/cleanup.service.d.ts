import { Repository } from 'typeorm';
import { User } from './user.entity';
import { ConfigService } from '@nestjs/config';
export declare class CleanupService {
    private usersRepository;
    private configService;
    private readonly logger;
    constructor(usersRepository: Repository<User>, configService: ConfigService);
    handleUnverifiedAccountsCleanup(): Promise<void>;
    cleanupUnverifiedAccounts(): Promise<number>;
}
