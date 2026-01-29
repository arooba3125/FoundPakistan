import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case, CaseStatus } from './case.entity';
import { ContactRequest, ContactRequestStatus } from './contact-request.entity';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';
import { User, UserRole } from '../users/user.entity';
import { EmailService } from '../email/email.service';
import { MatchingService } from './matching.service';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case)
    private casesRepository: Repository<Case>,
    @InjectRepository(ContactRequest)
    private contactRequestRepository: Repository<ContactRequest>,
    private emailService: EmailService,
    private matchingService: MatchingService,
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
    try {
      const cases = await this.casesRepository.find({
        where: { reporter_id: userId },
        relations: ['reporter', 'verifiedBy'],
        order: { createdAt: 'DESC' },
      });
      return cases;
    } catch (error) {
      console.error('Error in findByReporter:', error);
      throw error;
    }
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

    // Prevent verification if case is cancelled
    if (caseEntity.cancelled_at !== null) {
      throw new ForbiddenException('Cannot verify a cancelled case');
    }

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

    // Auto-run matching when case is verified
    try {
      await this.matchingService.findPotentialMatches(savedCase.case_id);
    } catch (error) {
      console.error('Failed to run automatic matching:', error);
      // Don't fail the verification if matching fails
    }

    return savedCase;
  }

  async rejectCase(
    id: string,
    adminId: string,
    reason: string,
  ): Promise<Case> {
    const caseEntity = await this.findOne(id);

    // Prevent rejection if case is cancelled
    if (caseEntity.cancelled_at !== null) {
      throw new ForbiddenException('Cannot reject a cancelled case');
    }

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

    // Prevent marking as found if case is cancelled
    if (caseEntity.cancelled_at !== null) {
      throw new ForbiddenException('Cannot mark a cancelled case as found');
    }

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

    // Cancel all pending contact requests for this case (case is resolved)
    try {
      const pendingRequests = await this.contactRequestRepository.find({
        where: {
          case_id: id,
          status: ContactRequestStatus.PENDING,
        },
      });
      
      if (pendingRequests.length > 0) {
        pendingRequests.forEach(request => {
          request.status = ContactRequestStatus.REJECTED;
          request.respondedAt = new Date();
        });
        await this.contactRequestRepository.save(pendingRequests);
      }
    } catch (error) {
      console.error('Failed to cancel pending contact requests:', error);
      // Don't fail the mark as found operation if this fails
    }

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

  // Contact Request Methods
  async createContactRequest(
    caseId: string,
    requesterEmail: string,
    requesterMessage?: string,
    requesterId?: string,
  ): Promise<ContactRequest> {
    const caseEntity = await this.findOne(caseId);

    // Don't allow requests for cancelled, rejected, or found cases
    if (
      caseEntity.status === CaseStatus.REJECTED ||
      caseEntity.status === CaseStatus.FOUND ||
      caseEntity.cancelled_at !== null
    ) {
      throw new BadRequestException('Cannot request contact for this case');
    }

    // Check if requester is the case owner (they already have contact info)
    if (requesterId && caseEntity.reporter_id === requesterId) {
      throw new BadRequestException('You cannot request contact for your own case');
    }

    // Check for existing pending request from same email
    const existingRequest = await this.contactRequestRepository.findOne({
      where: {
        case_id: caseId,
        requester_email: requesterEmail,
        status: ContactRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('You already have a pending request for this case');
    }

    const contactRequest = this.contactRequestRepository.create({
      case_id: caseId,
      requester_email: requesterEmail,
      requester_message: requesterMessage,
      requester_id: requesterId || null,
      status: ContactRequestStatus.PENDING,
    });

    const savedRequest = await this.contactRequestRepository.save(contactRequest);

    // Send email to case reporter
    if (caseEntity.reporter?.email) {
      try {
        await this.emailService.sendContactRequestEmail(
          caseEntity.reporter.email,
          caseEntity.case_id,
          caseEntity.name,
          requesterEmail,
          requesterMessage,
        );
      } catch (error) {
        console.error('Failed to send contact request email:', error);
        // Don't fail the request creation if email fails
      }
    }

    return savedRequest;
  }

  async getContactRequestsForReporter(userId: string): Promise<ContactRequest[]> {
    try {
      // Get all contact requests where the case reporter is the user
      // First get all case IDs for this reporter
      const userCases = await this.casesRepository
        .createQueryBuilder('case')
        .select('case.case_id', 'case_id')
        .where('case.reporter_id = :userId', { userId })
        .getRawMany();
      
      const caseIds = userCases.map(c => c.case_id);
      
      if (caseIds.length === 0) {
        return [];
      }
      
      // Then get all contact requests for those cases using query builder with IN
      const contactRequests = await this.contactRequestRepository
        .createQueryBuilder('contactRequest')
        .leftJoinAndSelect('contactRequest.case', 'case')
        .leftJoinAndSelect('case.reporter', 'reporter')
        .where('contactRequest.case_id IN (:...caseIds)', { caseIds })
        .orderBy('contactRequest.createdAt', 'DESC')
        .getMany();
      
      return contactRequests;
    } catch (error) {
      console.error('Error in getContactRequestsForReporter:', error);
      console.error('Error details:', error.message, error.stack);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  async approveContactRequest(requestId: string, userId: string): Promise<ContactRequest> {
    const request = await this.contactRequestRepository.findOne({
      where: { id: requestId },
      relations: ['case', 'case.reporter'],
    });

    if (!request) {
      throw new NotFoundException('Contact request not found');
    }

    // Verify the user is the case owner
    if (request.case.reporter_id !== userId) {
      throw new ForbiddenException('You can only approve requests for your own cases');
    }

    if (request.status !== ContactRequestStatus.PENDING) {
      throw new BadRequestException('This request has already been processed');
    }

    request.status = ContactRequestStatus.APPROVED;
    request.respondedAt = new Date();
    const savedRequest = await this.contactRequestRepository.save(request);

    // Send email to requester with contact info
    try {
      await this.emailService.sendContactApprovalEmail(
        request.requester_email,
        request.case.case_id,
        request.case.name,
        request.case.reporter.name || request.case.reporter.email || '',
        request.case.contact_phone || '',
        request.case.contact_email || request.case.reporter.email || '',
      );
    } catch (error) {
      console.error('Failed to send contact approval email:', error);
    }

    return savedRequest;
  }

  async rejectContactRequest(requestId: string, userId: string): Promise<ContactRequest> {
    const request = await this.contactRequestRepository.findOne({
      where: { id: requestId },
      relations: ['case', 'case.reporter'],
    });

    if (!request) {
      throw new NotFoundException('Contact request not found');
    }

    // Verify the user is the case owner
    if (request.case.reporter_id !== userId) {
      throw new ForbiddenException('You can only reject requests for your own cases');
    }

    if (request.status !== ContactRequestStatus.PENDING) {
      throw new BadRequestException('This request has already been processed');
    }

    request.status = ContactRequestStatus.REJECTED;
    request.respondedAt = new Date();
    const savedRequest = await this.contactRequestRepository.save(request);

    // Send email to requester
    try {
      await this.emailService.sendContactRejectionEmail(
        request.requester_email,
        request.case.case_id,
        request.case.name,
      );
    } catch (error) {
      console.error('Failed to send contact rejection email:', error);
    }

    return savedRequest;
  }

  // User Actions: Cancel and Mark Found

  /**
   * Cancel a case (user can cancel their own case)
   * Rules:
   * - Can cancel if status is PENDING or VERIFIED
   * - Cannot cancel if REJECTED (already rejected, no point)
   * - Cannot cancel if FOUND (already matched/found, case is closed)
   * - Cannot cancel if already cancelled
   */
  async cancelCase(caseId: string, userId: string): Promise<Case> {
    const caseEntity = await this.findOne(caseId);

    // Verify user is the case owner
    if (caseEntity.reporter_id !== userId) {
      throw new ForbiddenException('You can only cancel your own cases');
    }

    // Check if already cancelled
    if (caseEntity.cancelled_at !== null) {
      throw new BadRequestException('This case has already been cancelled');
    }

    // Check business rules for cancellation
    if (caseEntity.status === CaseStatus.REJECTED) {
      throw new BadRequestException('Cannot cancel a rejected case');
    }

    if (caseEntity.status === CaseStatus.FOUND) {
      throw new BadRequestException('Cannot cancel a case that has already been found/matched');
    }

    // Allow cancellation if PENDING or VERIFIED
    if (caseEntity.status !== CaseStatus.PENDING && caseEntity.status !== CaseStatus.VERIFIED) {
      throw new BadRequestException(`Cannot cancel a case with status: ${caseEntity.status}`);
    }

    // Mark as cancelled
    caseEntity.cancelled_at = new Date();
    const savedCase = await this.casesRepository.save(caseEntity);

    // Reject all pending matches involving this case
    try {
      await this.matchingService.rejectMatchesForCase(caseId);
    } catch (error) {
      console.error('Failed to reject matches for cancelled case:', error);
      // Don't fail the cancellation if match cleanup fails
    }

    return savedCase;
  }

  /**
   * Mark case as found/resolved by user (for both MISSING and FOUND cases)
   * Rules:
   * - Works for both MISSING and FOUND cases
   * - For MISSING: means the missing person was found
   * - For FOUND: means the found person was claimed/resolved
   * - Can mark found if status is VERIFIED (admin verified it)
   * - Cannot mark found if PENDING (wait for admin verification first)
   * - Cannot mark found if REJECTED (case was rejected by admin)
   * - Cannot mark found if already FOUND
   * - Cannot mark found if cancelled
   */
  async markAsFoundByUser(caseId: string, userId: string): Promise<Case> {
    const caseEntity = await this.findOne(caseId);

    // Verify user is the case owner
    if (caseEntity.reporter_id !== userId) {
      throw new ForbiddenException('You can only mark your own cases as found');
    }

    // Both MISSING and FOUND cases can be marked as found by user
    // (MISSING = person was found, FOUND = person was claimed/resolved)

    // Check if already cancelled
    if (caseEntity.cancelled_at !== null) {
      throw new BadRequestException('Cannot mark a cancelled case as found');
    }

    // Check if already found
    if (caseEntity.status === CaseStatus.FOUND) {
      throw new BadRequestException('This case is already marked as found');
    }

    // Must be VERIFIED before user can mark as found
    if (caseEntity.status !== CaseStatus.VERIFIED) {
      if (caseEntity.status === CaseStatus.PENDING) {
        throw new BadRequestException('Please wait for admin verification before marking as found');
      }
      if (caseEntity.status === CaseStatus.REJECTED) {
        throw new BadRequestException('Cannot mark a rejected case as found');
      }
      throw new BadRequestException(`Cannot mark case as found with status: ${caseEntity.status}`);
    }

    // Mark as found
    caseEntity.status = CaseStatus.FOUND;
    const savedCase = await this.casesRepository.save(caseEntity);

    // Cancel all pending contact requests for this case (case is resolved)
    try {
      const pendingRequests = await this.contactRequestRepository.find({
        where: {
          case_id: caseId,
          status: ContactRequestStatus.PENDING,
        },
      });
      
      if (pendingRequests.length > 0) {
        pendingRequests.forEach(request => {
          request.status = ContactRequestStatus.REJECTED;
          request.respondedAt = new Date();
        });
        await this.contactRequestRepository.save(pendingRequests);
      }
    } catch (error) {
      console.error('Failed to cancel pending contact requests:', error);
      // Don't fail the mark as found operation if this fails
    }

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
        console.error('Failed to send found notification email:', error);
      }
    }

    return savedCase;
  }
}
