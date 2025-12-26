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
const user_entity_1 = require("../users/user.entity");
let CasesService = class CasesService {
    casesRepository;
    constructor(casesRepository) {
        this.casesRepository = casesRepository;
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
        return this.casesRepository.find({
            where: { reporter_id: userId },
            relations: ['reporter'],
            order: { createdAt: 'DESC' },
        });
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
        if (caseEntity.status === case_entity_1.CaseStatus.REJECTED ||
            caseEntity.status === case_entity_1.CaseStatus.FOUND) {
            throw new common_1.ForbiddenException(`Cannot verify a ${caseEntity.status} case. Only pending cases can be verified.`);
        }
        caseEntity.status = case_entity_1.CaseStatus.VERIFIED;
        caseEntity.verified_by = adminId;
        caseEntity.verified_at = new Date();
        return this.casesRepository.save(caseEntity);
    }
    async rejectCase(id, adminId, reason) {
        const caseEntity = await this.findOne(id);
        if (caseEntity.status === case_entity_1.CaseStatus.REJECTED ||
            caseEntity.status === case_entity_1.CaseStatus.FOUND ||
            caseEntity.status === case_entity_1.CaseStatus.VERIFIED) {
            throw new common_1.ForbiddenException(`Cannot reject a ${caseEntity.status} case. Only pending cases can be rejected.`);
        }
        caseEntity.status = case_entity_1.CaseStatus.REJECTED;
        caseEntity.verified_by = adminId;
        caseEntity.verified_at = new Date();
        caseEntity.rejection_reason = reason;
        return this.casesRepository.save(caseEntity);
    }
    async markAsFound(id, adminId) {
        const caseEntity = await this.findOne(id);
        if (caseEntity.status === case_entity_1.CaseStatus.REJECTED ||
            caseEntity.status === case_entity_1.CaseStatus.FOUND) {
            throw new common_1.ForbiddenException(`Cannot mark a ${caseEntity.status} case as found. Only pending or verified cases can be marked as found.`);
        }
        caseEntity.status = case_entity_1.CaseStatus.FOUND;
        caseEntity.verified_by = adminId;
        caseEntity.verified_at = new Date();
        return this.casesRepository.save(caseEntity);
    }
    async delete(id, user) {
        const caseEntity = await this.findOne(id);
        if (caseEntity.reporter_id !== user.id &&
            user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only delete your own cases');
        }
        await this.casesRepository.remove(caseEntity);
    }
};
exports.CasesService = CasesService;
exports.CasesService = CasesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(case_entity_1.Case)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CasesService);
//# sourceMappingURL=cases.service.js.map