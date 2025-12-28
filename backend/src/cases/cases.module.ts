import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { MatchingService } from './matching.service';
import { Case } from './case.entity';
import { ContactRequest } from './contact-request.entity';
import { CaseMatch } from './case-match.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Case, ContactRequest, CaseMatch]),
    EmailModule,
  ],
  controllers: [CasesController],
  providers: [CasesService, MatchingService],
  exports: [CasesService, MatchingService],
})
export class CasesModule {}
