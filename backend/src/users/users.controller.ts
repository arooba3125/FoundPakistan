import { Controller, Get, Patch, UseGuards, Param, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UsersService } from './users.service';
import { User as UserEntity } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * Get list of all admins (admin-only)
   */
  @Get('admins')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async listAdmins(): Promise<{ admins: Partial<UserEntity>[] }> {
    const admins = await this.usersService.listAdmins();
    return {
      admins: admins.map(admin => ({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      })),
    };
  }

  /**
   * Promote a user to admin (admin-only)
   */
  @Patch(':id/promote')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async promoteToAdmin(@Param('id') userId: string): Promise<{ user: Partial<UserEntity> }> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    
    try {
      const user = await this.usersService.promoteToAdmin(userId);
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  /**
   * Demote an admin to user (admin-only, cannot demote last admin)
   */
  @Patch(':id/demote')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async demoteFromAdmin(@Param('id') userId: string): Promise<{ user: Partial<UserEntity> }> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const user = await this.usersService.demoteFromAdmin(userId);
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  /**
   * Find a user by email (admin-only)
   */
  @Get('by-email/:email')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findByEmail(@Param('email') email: string): Promise<{ user: Partial<UserEntity> | null }> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { user: null };
    }
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
