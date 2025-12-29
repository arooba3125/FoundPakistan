import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from './user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  /**
   * Cleanup unverified accounts older than configured days
   * Runs daily at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleUnverifiedAccountsCleanup() {
    this.logger.log('Starting cleanup of unverified accounts...');
    
    const cleanupDays = parseInt(
      this.configService.get<string>('CLEANUP_UNVERIFIED_DAYS') || '7',
      10,
    );
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - cleanupDays);

    try {
      const result = await this.usersRepository.delete({
        isVerified: false,
        createdAt: LessThan(cutoffDate),
      });

      const deletedCount = result.affected || 0;
      
      if (deletedCount > 0) {
        this.logger.log(
          `Successfully deleted ${deletedCount} unverified account(s) older than ${cleanupDays} days`,
        );
      } else {
        this.logger.log('No unverified accounts found to clean up');
      }
    } catch (error) {
      this.logger.error('Error during unverified accounts cleanup:', error);
    }
  }

  /**
   * Manually trigger cleanup (can be called via API if needed)
   */
  async cleanupUnverifiedAccounts(): Promise<number> {
    const cleanupDays = parseInt(
      this.configService.get<string>('CLEANUP_UNVERIFIED_DAYS') || '7',
      10,
    );
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - cleanupDays);

    try {
      const result = await this.usersRepository.delete({
        isVerified: false,
        createdAt: LessThan(cutoffDate),
      });

      const deletedCount = result.affected || 0;
      this.logger.log(
        `Manual cleanup: Deleted ${deletedCount} unverified account(s) older than ${cleanupDays} days`,
      );
      
      return deletedCount;
    } catch (error) {
      this.logger.error('Error during manual cleanup:', error);
      throw error;
    }
  }
}

