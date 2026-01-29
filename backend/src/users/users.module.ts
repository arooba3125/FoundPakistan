import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CleanupService } from './cleanup.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, CleanupService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
