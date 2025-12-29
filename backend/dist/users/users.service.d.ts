import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    countAdmins(): Promise<number>;
    create(email: string, password: string, name?: string): Promise<User>;
    promoteToAdmin(userId: string): Promise<User>;
    demoteFromAdmin(userId: string): Promise<User>;
    listAdmins(): Promise<User[]>;
    updateOtpData(userId: string, otpHash: string, otpExpiresAt: Date): Promise<User>;
    incrementOtpAttempts(userId: string): Promise<User>;
    clearOtpData(userId: string): Promise<User>;
}
