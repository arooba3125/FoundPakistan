import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async countAdmins(): Promise<number> {
    return this.usersRepository.count({ where: { role: UserRole.ADMIN } });
  }

  async create(
    email: string,
    password: string,
    name?: string,
  ): Promise<User> {
    // Check if this should be admin:
    // 1. First check env variable (override)
    const isAdminByEnv = process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
    
    // 2. Bootstrap: First user ever becomes admin automatically if no admins exist
    const adminCount = await this.countAdmins();
    const isFirstUser = adminCount === 0;
    
    const role = (isAdminByEnv || isFirstUser) ? UserRole.ADMIN : UserRole.USER;

    const user = this.usersRepository.create({
      email,
      password,
      name,
      role,
      isVerified: false, // Requires OTP verification
    });
    
    return this.usersRepository.save(user);
  }

  async promoteToAdmin(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.role = UserRole.ADMIN;
    return this.usersRepository.save(user);
  }

  async demoteFromAdmin(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    // Prevent demoting if it's the only admin
    const adminCount = await this.countAdmins();
    if (adminCount <= 1 && user.role === UserRole.ADMIN) {
      throw new Error('Cannot demote the last admin');
    }
    user.role = UserRole.USER;
    return this.usersRepository.save(user);
  }

  async listAdmins(): Promise<User[]> {
    return this.usersRepository.find({ where: { role: UserRole.ADMIN } });
  }

  async updateOtpData(
    userId: string,
    otpHash: string,
    otpExpiresAt: Date,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.otpHash = otpHash;
    user.otpExpiresAt = otpExpiresAt;
    user.otpSentAt = new Date();
    user.otpAttempts = 0;
    return this.usersRepository.save(user);
  }

  async incrementOtpAttempts(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    return this.usersRepository.save(user);
  }

  async clearOtpData(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    user.otpSentAt = null;
    return this.usersRepository.save(user);
  }
}
