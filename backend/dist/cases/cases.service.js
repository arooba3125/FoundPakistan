"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const case_entity_1 = require("./case.entity");
const contact_request_entity_1 = require("./contact-request.entity");
const user_entity_1 = require("../users/user.entity");
const email_service_1 = require("../email/email.service");
const matching_service_1 = require("./matching.service");
let CasesService = class CasesService {
    casesRepository;
    contactRequestRepository;
    emailService;
    matchingService;
    constructor(casesRepository, contactRequestRepository, emailService, matchingService) {
        this.casesRepository = casesRepository;
        this.contactRequestRepository = contactRequestRepository;
        this.emailService = emailService;
        this.matchingService = matchingService;
    }
    async create(createCaseDto, userId) {
        const caseEntity = this.casesRepository.create({
            ...createCaseDto,
            reporter_id: userId,
            status: case_entity_1.CaseStatus.PENDING,
        });
        return this.casesRepository.save(caseEntity);
    }
    async findAll(filters) {
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
    async findOne(id) {
        const caseEntity = await this.casesRepository.findOne({
            where: { case_id: id },
            relations: ['reporter', 'verifiedBy'],
        });
        if (!caseEntity) {
            throw new common_1.NotFoundException('Case not found');
        }
        return caseEntity;
    }
    async findByReporter(userId) {
        try {
            const cases = await this.casesRepository.find({
                where: { reporter_id: userId },
                relations: ['reporter', 'verifiedBy'],
                order: { createdAt: 'DESC' },
            });
            return cases;
        }
        catch (error) {
            console.error('Error in findByReporter:', error);
            throw error;
        }
    }
    async update(id, updateCaseDto, user) {
        const caseEntity = await this.findOne(id);
        if (caseEntity.reporter_id !== user.id &&
            user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only update your own cases');
        }
        if (updateCaseDto.status && user.role !== user_entity_1.UserRole.ADMIN) {
            delete updateCaseDto.status;
        }
        Object.assign(caseEntity, updateCaseDto);
        return this.casesRepository.save(caseEntity);
    }
    async verifyCase(id, adminId) {
        const caseEntity = await this.findOne(id);
        if (caseEntity.cancelled_at !== null) {
            throw new common_1.ForbiddenException('Cannot verify a cancelled case');
        }
        if (caseEntity.status === case_entity_1.CaseStatus.REJECTED ||
            caseEntity.status === case_entity_1.CaseStatus.FOUND) {
            throw new common_1.ForbiddenException(`Cannot verify a ${caseEntity.status} case. Only pending cases can be verified.`);
        }
        caseEntity.status = case_entity_1.CaseStatus.VERIFIED;
        caseEntity.verified_by = adminId;
        caseEntity.verified_at = new Date();
        const savedCase = await this.casesRepository.save(caseEntity);
        if (caseEntity.reporter?.email) {
            try {
                await this.emailService.sendCaseStatusEmail(caseEntity.reporter.email, caseEntity.case_id, 'VERIFIED', caseEntity.name, caseEntity.case_type);
            }
            catch (error) {
                console.error('Failed to send verification email:', error);
            }
        }
        try {
            await this.matchingService.findPotentialMatches(savedCase.case_id);
        }
        catch (error) {
            console.error('Failed to run automatic matching:', error);
        }
        return savedCase;
    }
    async rejectCase(id, adminId, reason) {
        const caseEntity = await this.findOne(id);
        if (caseEntity.cancelled_at !== null) {
            throw new common_1.ForbiddenException('Cannot reject a cancelled case');
        }
        if (caseEntity.status === case_entity_1.CaseStatus.REJECTED ||
            caseEntity.status === case_entity_1.CaseStatus.FOUND ||
            caseEntity.status === case_entity_1.CaseStatus.VERIFIED) {
            throw new common_1.ForbiddenException(`Cannot reject a ${caseEntity.status} case. Only pending cases can be rejected.`);
        }
        caseEntity.status = case_entity_1.CaseStatus.REJECTED;
        caseEntity.verified_by = adminId;
        caseEntity.verified_at = new Date();
        caseEntity.rejection_reason = reason;
        const savedCase = await this.casesRepository.save(caseEntity);
        if (caseEntity.reporter?.email) {
            try {
                await this.emailService.sendCaseStatusEmail(caseEntity.reporter.email, caseEntity.case_id, 'REJECTED', caseEntity.name, caseEntity.case_type, reason);
            }
            catch (error) {
                console.error('Failed to send rejection email:', error);
            }
        }
        return savedCase;
    }
    async markAsFound(id, adminId) {
        const caseEntity = await this.findOne(id);
        if (caseEntity.cancelled_at !== null) {
            throw new common_1.ForbiddenException('Cannot mark a cancelled case as found');
        }
        if (caseEntity.status === case_entity_1.CaseStatus.REJECTED ||
            caseEntity.status === case_entity_1.CaseStatus.FOUND) {
            throw new common_1.ForbiddenException(`Cannot mark a ${caseEntity.status} case as found. Only pending or verified cases can be marked as found.`);
        }
        caseEntity.status = case_entity_1.CaseStatus.FOUND;
        caseEntity.verified_by = adminId;
        caseEntity.verified_at = new Date();
        const savedCase = await this.casesRepository.save(caseEntity);
        try {
            const pendingRequests = await this.contactRequestRepository.find({
                where: {
                    case_id: id,
                    status: contact_request_entity_1.ContactRequestStatus.PENDING,
                },
            });
            if (pendingRequests.length > 0) {
                pendingRequests.forEach(request => {
                    request.status = contact_request_entity_1.ContactRequestStatus.REJECTED;
                    request.respondedAt = new Date();
                });
                await this.contactRequestRepository.save(pendingRequests);
            }
        }
        catch (error) {
            console.error('Failed to cancel pending contact requests:', error);
        }
        if (caseEntity.reporter?.email) {
            try {
                await this.emailService.sendCaseStatusEmail(caseEntity.reporter.email, caseEntity.case_id, 'FOUND', caseEntity.name, caseEntity.case_type);
            }
            catch (error) {
                console.error('Failed to send found notification email:', error);
            }
        }
        return savedCase;
    }
    async delete(id, user) {
        const caseEntity = await this.findOne(id);
        if (caseEntity.reporter_id !== user.id &&
            user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only delete your own cases');
        }
        await this.casesRepository.remove(caseEntity);
    }
    async createContactRequest(caseId, requesterEmail, requesterMessage, requesterId) {
        const caseEntity = await this.findOne(caseId);
        if (caseEntity.status === case_entity_1.CaseStatus.REJECTED ||
            caseEntity.status === case_entity_1.CaseStatus.FOUND ||
            caseEntity.cancelled_at !== null) {
            throw new common_1.BadRequestException('Cannot request contact for this case');
        }
        if (requesterId && caseEntity.reporter_id === requesterId) {
            throw new common_1.BadRequestException('You cannot request contact for your own case');
        }
        const existingRequest = await this.contactRequestRepository.findOne({
            where: {
                case_id: caseId,
                requester_email: requesterEmail,
                status: contact_request_entity_1.ContactRequestStatus.PENDING,
            },
        });
        if (existingRequest) {
            throw new common_1.BadRequestException('You already have a pending request for this case');
        }
        const contactRequest = this.contactRequestRepository.create({
            case_id: caseId,
            requester_email: requesterEmail,
            requester_message: requesterMessage,
            requester_id: requesterId || null,
            status: contact_request_entity_1.ContactRequestStatus.PENDING,
        });
        const savedRequest = await this.contactRequestRepository.save(contactRequest);
        if (caseEntity.reporter?.email) {
            try {
                await this.emailService.sendContactRequestEmail(caseEntity.reporter.email, caseEntity.case_id, caseEntity.name, requesterEmail, requesterMessage);
            }
            catch (error) {
                console.error('Failed to send contact request email:', error);
            }
        }
        return savedRequest;
    }
    async getContactRequestsForReporter(userId) {
        try {
            const userCases = await this.casesRepository
                .createQueryBuilder('case')
                .select('case.case_id', 'case_id')
                .where('case.reporter_id = :userId', { userId })
                .getRawMany();
            const caseIds = userCases.map(c => c.case_id);
            if (caseIds.length === 0) {
                return [];
            }
            const contactRequests = await this.contactRequestRepository
                .createQueryBuilder('contactRequest')
                .leftJoinAndSelect('contactRequest.case', 'case')
                .leftJoinAndSelect('case.reporter', 'reporter')
                .where('contactRequest.case_id IN (:...caseIds)', { caseIds })
                .orderBy('contactRequest.createdAt', 'DESC')
                .getMany();
            return contactRequests;
        }
        catch (error) {
            console.error('Error in getContactRequestsForReporter:', error);
            console.error('Error details:', error.message, error.stack);
            return [];
        }
    }
    async approveContactRequest(requestId, userId) {
        const request = await this.contactRequestRepository.findOne({
            where: { id: requestId },
            relations: ['case', 'case.reporter'],
        });
        if (!request) {
            throw new common_1.NotFoundException('Contact request not found');
        }
        if (request.case.reporter_id !== userId) {
            throw new common_1.ForbiddenException('You can only approve requests for your own cases');
        }
        if (request.status !== contact_request_entity_1.ContactRequestStatus.PENDING) {
            throw new common_1.BadRequestException('This request has already been processed');
        }
        request.status = contact_request_entity_1.ContactRequestStatus.APPROVED;
        request.respondedAt = new Date();
        const savedRequest = await this.contactRequestRepository.save(request);
        try {
            await this.emailService.sendContactApprovalEmail(request.requester_email, request.case.case_id, request.case.name, request.case.reporter.name || request.case.reporter.email || '', request.case.contact_phone || '', request.case.contact_email || request.case.reporter.email || '');
        }
        catch (error) {
            console.error('Failed to send contact approval email:', error);
        }
        return savedRequest;
    }
    async rejectContactRequest(requestId, userId) {
        const request = await this.contactRequestRepository.findOne({
            where: { id: requestId },
            relations: ['case', 'case.reporter'],
        });
        if (!request) {
            throw new common_1.NotFoundException('Contact request not found');
        }
        if (request.case.reporter_id !== userId) {
            throw new common_1.ForbiddenException('You can only reject requests for your own cases');
        }
        if (request.status !== contact_request_entity_1.ContactRequestStatus.PENDING) {
            throw new common_1.BadRequestException('This request has already been processed');
        }
        request.status = contact_request_entity_1.ContactRequestStatus.REJECTED;
        request.respondedAt = new Date();
        const savedRequest = await this.contactRequestRepository.save(request);
        try {
            await this.emailService.sendContactRejectionEmail(request.requester_email, request.case.case_id, request.case.name);
        }
        catch (error) {
            console.error('Failed to send contact rejection email:', error);
        }
        return savedRequest;
    }
    async cancelCase(caseId, userId) {
        const caseEntity = await this.findOne(caseId);
        if (caseEntity.reporter_id !== userId) {
            throw new common_1.ForbiddenException('You can only cancel your own cases');
        }
        if (caseEntity.cancelled_at !== null) {
            throw new common_1.BadRequestException('This case has already been cancelled');
        }
        if (caseEntity.status === case_entity_1.CaseStatus.REJECTED) {
            throw new common_1.BadRequestException('Cannot cancel a rejected case');
        }
        if (caseEntity.status === case_entity_1.CaseStatus.FOUND) {
            throw new common_1.BadRequestException('Cannot cancel a case that has already been found/matched');
        }
        if (caseEntity.status !== case_entity_1.CaseStatus.PENDING && caseEntity.status !== case_entity_1.CaseStatus.VERIFIED) {
            throw new common_1.BadRequestException(`Cannot cancel a case with status: ${caseEntity.status}`);
        }
        caseEntity.cancelled_at = new Date();
        const savedCase = await this.casesRepository.save(caseEntity);
        try {
            await this.matchingService.rejectMatchesForCase(caseId);
        }
        catch (error) {
            console.error('Failed to reject matches for cancelled case:', error);
        }
        return savedCase;
    }
    async markAsFoundByUser(caseId, userId) {
        const caseEntity = await this.findOne(caseId);
        if (caseEntity.reporter_id !== userId) {
            throw new common_1.ForbiddenException('You can only mark your own cases as found');
        }
        if (caseEntity.cancelled_at !== null) {
            throw new common_1.BadRequestException('Cannot mark a cancelled case as found');
        }
        if (caseEntity.status === case_entity_1.CaseStatus.FOUND) {
            throw new common_1.BadRequestException('This case is already marked as found');
        }
        if (caseEntity.status !== case_entity_1.CaseStatus.VERIFIED) {
            if (caseEntity.status === case_entity_1.CaseStatus.PENDING) {
                throw new common_1.BadRequestException('Please wait for admin verification before marking as found');
            }
            if (caseEntity.status === case_entity_1.CaseStatus.REJECTED) {
                throw new common_1.BadRequestException('Cannot mark a rejected case as found');
            }
            throw new common_1.BadRequestException(`Cannot mark case as found with status: ${caseEntity.status}`);
        }
        caseEntity.status = case_entity_1.CaseStatus.FOUND;
        const savedCase = await this.casesRepository.save(caseEntity);
        try {
            const pendingRequests = await this.contactRequestRepository.find({
                where: {
                    case_id: caseId,
                    status: contact_request_entity_1.ContactRequestStatus.PENDING,
                },
            });
            if (pendingRequests.length > 0) {
                pendingRequests.forEach(request => {
                    request.status = contact_request_entity_1.ContactRequestStatus.REJECTED;
                    request.respondedAt = new Date();
                });
                await this.contactRequestRepository.save(pendingRequests);
            }
        }
        catch (error) {
            console.error('Failed to cancel pending contact requests:', error);
        }
        if (caseEntity.reporter?.email) {
            try {
                await this.emailService.sendCaseStatusEmail(caseEntity.reporter.email, caseEntity.case_id, 'FOUND', caseEntity.name, caseEntity.case_type);
            }
            catch (error) {
                console.error('Failed to send found notification email:', error);
            }
        }
        return savedCase;
    }
};
exports.CasesService = CasesService;
exports.CasesService = CasesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(case_entity_1.Case)),
    __param(1, (0, typeorm_1.InjectRepository)(contact_request_entity_1.ContactRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        email_service_1.EmailService,
        matching_service_1.MatchingService])
], CasesService);
//# sourceMappingURL=cases.service.js.map