import { UsersService } from './users.service';
import { User as UserEntity } from './user.entity';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    listAdmins(): Promise<{
        admins: Partial<UserEntity>[];
    }>;
    promoteToAdmin(userId: string): Promise<{
        user: Partial<UserEntity>;
    }>;
    demoteFromAdmin(userId: string): Promise<{
        user: Partial<UserEntity>;
    }>;
    findByEmail(email: string): Promise<{
        user: Partial<UserEntity> | null;
    }>;
}
