import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case, CaseStatus } from './case.entity';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';
import { User, UserRole } from '../users/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case)
    private casesRepository: Repository<Case>,
    private emailService: EmailService,
  ) {}

  async create(createCaseDto: CreateCaseDto, userId: string): Promise<Case> {
    const caseEntity = this.casesRepository.create({
      ...createCaseDto,
      reporter_id: userId,
      status: CaseStatus.PENDING,
    });
    return this.casesRepository.save(caseEntity);
  }

  async findAll(filters?: {
    status?: CaseStatus;
    case_type?: string;
    city?: string;
  }): Promise<Case[]> {
    const query = this.casesRepository
      .createQueryBuilder('case')
      .leftJoinAndSelect('case.reporter', 'reporter')
      .orderBy('case.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('case.status = :status', { status: filters.status });
    }

    if (filters?.case_type) {
      query.andWhere('case.case_type = :case_type', {
        case_type: filters.case_type,
      });
    }

    if (filters?.city) {
      query.andWhere('case.city = :city', { city: filters.city });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Case> {
    const caseEntity = await this.casesRepository.findOne({
      where: { case_id: id },
      relations: ['reporter', 'verifiedBy'],
    });

    if (!caseEntity) {
      throw new NotFoundException('Case not found');
    }

    return caseEntity;
  }

  async findByReporter(userId: string): Promise<Case[]> {
    return this.casesRepository.find({
      where: { reporter_id: userId },
      relations: ['reporter'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateCaseDto: UpdateCaseDto,
    user: User,
  ): Promise<Case> {
    const caseEntity = await this.findOne(id);

    // Only reporter or admin can update
    if (
      caseEntity.reporter_id !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('You can only update your own cases');
    }

    // Users cannot change status, only admin can
    if (updateCaseDto.status && user.role !== UserRole.ADMIN) {
      delete updateCaseDto.status;
    }

    Object.assign(caseEntity, updateCaseDto);
    return this.casesRepository.save(caseEntity);
  }

  async verifyCase(id: string, adminId: string): Promise<Case> {
    const caseEntity = await this.findOne(id);

    // Prevent status change if case is already in final state
    if (
      caseEntity.status === CaseStatus.REJECTED ||
      caseEntity.status === CaseStatus.FOUND
    ) {
      throw new ForbiddenException(
        `Cannot verify a ${caseEntity.status} case. Only pending cases can be verified.`,
      );
    }

    caseEntity.status = CaseStatus.VERIFIED;
    caseEntity.verified_by = adminId;
    caseEntity.verified_at = new Date();

    const savedCase = await this.casesRepository.save(caseEntity);

    // Send email notification to reporter
    if (caseEntity.reporter?.email) {
      try {
        await this.emailService.sendCaseStatusEmail(
          caseEntity.reporter.email,
          caseEntity.case_id,
          'VERIFIED',
          caseEntity.name,
          caseEntity.case_type,
        );
      } catch (error) {
        // Log error but don't fail the case update
        console.error('Failed to send verification email:', error);
      }
    }

    return savedCase;
  }

  async rejectCase(
    id: string,
    adminId: string,
    reason: string,
  ): Promise<Case> {
    const caseEntity = await this.findOne(id);

    // Prevent status change if case is already in final state or verified
    if (
      caseEntity.status === CaseStatus.REJECTED ||
      caseEntity.status === CaseStatus.FOUND ||
      caseEntity.status === CaseStatus.VERIFIED
    ) {
      throw new ForbiddenException(
        `Cannot reject a ${caseEntity.status} case. Only pending cases can be rejected.`,
      );
    }

    caseEntity.status = CaseStatus.REJECTED;
    caseEntity.verified_by = adminId;
    caseEntity.verified_at = new Date();
    caseEntity.rejection_reason = reason;

    const savedCase = await this.casesRepository.save(caseEntity);

    // Send email notification to reporter
    if (caseEntity.reporter?.email) {
      try {
        await this.emailService.sendCaseStatusEmail(
          caseEntity.reporter.email,
          caseEntity.case_id,
          'REJECTED',
          caseEntity.name,
          caseEntity.case_type,
          reason,
        );
      } catch (error) {
        // Log error but don't fail the case update
        console.error('Failed to send rejection email:', error);
      }
    }

    return savedCase;
  }

  async markAsFound(id: string, adminId: string): Promise<Case> {
    const caseEntity = await this.findOne(id);

    // Prevent status change if case is already in final state
    if (
      caseEntity.status === CaseStatus.REJECTED ||
      caseEntity.status === CaseStatus.FOUND
    ) {
      throw new ForbiddenException(
        `Cannot mark a ${caseEntity.status} case as found. Only pending or verified cases can be marked as found.`,
      );
    }

    caseEntity.status = CaseStatus.FOUND;
    caseEntity.verified_by = adminId;
    caseEntity.verified_at = new Date();

    const savedCase = await this.casesRepository.save(caseEntity);

    // Send email notification to reporter
    if (caseEntity.reporter?.email) {
      try {
        await this.emailService.sendCaseStatusEmail(
          caseEntity.reporter.email,
          caseEntity.case_id,
          'FOUND',
          caseEntity.name,
          caseEntity.case_type,
        );
      } catch (error) {
        // Log error but don't fail the case update
        console.error('Failed to send found notification email:', error);
      }
    }

    return savedCase;
  }

  async delete(id: string, user: User): Promise<void> {
    const caseEntity = await this.findOne(id);

    // Only reporter or admin can delete
    if (
      caseEntity.reporter_id !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('You can only delete your own cases');
    }

    await this.casesRepository.remove(caseEntity);
  }
}
