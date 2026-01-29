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
exports.MatchingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const case_entity_1 = require("./case.entity");
const case_match_entity_1 = require("./case-match.entity");
const contact_request_entity_1 = require("./contact-request.entity");
const email_service_1 = require("../email/email.service");
let MatchingService = class MatchingService {
    casesRepository;
    caseMatchRepository;
    contactRequestRepository;
    emailService;
    constructor(casesRepository, caseMatchRepository, contactRequestRepository, emailService) {
        this.casesRepository = casesRepository;
        this.caseMatchRepository = caseMatchRepository;
        this.contactRequestRepository = contactRequestRepository;
        this.emailService = emailService;
    }
    calculateMatchScore(missingCase, foundCase) {
        if (missingCase.gender !== foundCase.gender) {
            return 0;
        }
        if (missingCase.age && foundCase.age) {
            const ageDiff = Math.abs(missingCase.age - foundCase.age);
            if (ageDiff > 3) {
                return 0;
            }
        }
        let score = 0;
        if (missingCase.name && foundCase.name) {
            const nameScore = this.calculateNameSimilarity(missingCase.name.toLowerCase(), foundCase.name.toLowerCase());
            score += nameScore * 40;
        }
        const dateScore = this.calculateDateProximity(missingCase.last_seen_date, foundCase.last_seen_date);
        score += dateScore * 30;
        if (missingCase.city && foundCase.city) {
            const locationScore = this.calculateLocationSimilarity(missingCase.city, foundCase.city);
            score += locationScore * 30;
        }
        return Math.round(score);
    }
    calculateNameSimilarity(name1, name2) {
        if (!name1 || !name2)
            return 0;
        if (name1 === name2)
            return 1;
        const longer = name1.length > name2.length ? name1 : name2;
        const shorter = name1.length > name2.length ? name2 : name1;
        if (longer.includes(shorter)) {
            return 0.9;
        }
        const commonChars = this.countCommonCharacters(name1, name2);
        const maxLength = Math.max(name1.length, name2.length);
        return commonChars / maxLength;
    }
    countCommonCharacters(str1, str2) {
        const chars1 = str1.split('').sort();
        const chars2 = str2.split('').sort();
        let count = 0;
        let i = 0;
        let j = 0;
        while (i < chars1.length && j < chars2.length) {
            if (chars1[i] === chars2[j]) {
                count++;
                i++;
                j++;
            }
            else if (chars1[i] < chars2[j]) {
                i++;
            }
            else {
                j++;
            }
        }
        return count;
    }
    calculateDateProximity(date1, date2) {
        if (!date1 || !date2)
            return 0.5;
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffDays = Math.abs((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 60)
            return 1.0;
        if (diffDays <= 90)
            return 0.7;
        return 0.3;
    }
    calculateLocationSimilarity(city1, city2) {
        if (!city1 || !city2)
            return 0.15;
        if (city1.toLowerCase().trim() === city2.toLowerCase().trim()) {
            return 1.0;
        }
        return 0.15;
    }
    async findPotentialMatches(caseId) {
        const sourceCase = await this.casesRepository.findOne({
            where: { case_id: caseId },
        });
        if (!sourceCase) {
            throw new Error('Case not found');
        }
        if (sourceCase.status !== case_entity_1.CaseStatus.VERIFIED) {
            return [];
        }
        const oppositeType = sourceCase.case_type === case_entity_1.CaseType.MISSING
            ? case_entity_1.CaseType.FOUND
            : case_entity_1.CaseType.MISSING;
        const candidates = await this.casesRepository.find({
            where: {
                case_type: oppositeType,
                status: case_entity_1.CaseStatus.VERIFIED,
            },
            relations: ['reporter'],
        });
        const potentialMatches = [];
        for (const candidate of candidates) {
            if (candidate.matched_with_case_id) {
                continue;
            }
            if (candidate.cancelled_at) {
                continue;
            }
            if (sourceCase.cancelled_at) {
                continue;
            }
            const matchScore = this.calculateMatchScore(sourceCase, candidate);
            if (matchScore >= 70) {
                const existingMatch = await this.caseMatchRepository.findOne({
                    where: [
                        {
                            missing_case_id: sourceCase.case_type === case_entity_1.CaseType.MISSING
                                ? sourceCase.case_id
                                : candidate.case_id,
                            found_case_id: sourceCase.case_type === case_entity_1.CaseType.FOUND
                                ? sourceCase.case_id
                                : candidate.case_id,
                            status: case_match_entity_1.CaseMatchStatus.PENDING,
                        },
                        {
                            missing_case_id: sourceCase.case_type === case_entity_1.CaseType.FOUND
                                ? sourceCase.case_id
                                : candidate.case_id,
                            found_case_id: sourceCase.case_type === case_entity_1.CaseType.MISSING
                                ? sourceCase.case_id
                                : candidate.case_id,
                            status: case_match_entity_1.CaseMatchStatus.PENDING,
                        },
                    ],
                });
                if (!existingMatch) {
                    const match = this.caseMatchRepository.create({
                        missing_case_id: sourceCase.case_type === case_entity_1.CaseType.MISSING
                            ? sourceCase.case_id
                            : candidate.case_id,
                        found_case_id: sourceCase.case_type === case_entity_1.CaseType.FOUND
                            ? sourceCase.case_id
                            : candidate.case_id,
                        match_score: Math.round(matchScore),
                        status: case_match_entity_1.CaseMatchStatus.PENDING,
                    });
                    const savedMatch = await this.caseMatchRepository.save(match);
                    potentialMatches.push(savedMatch);
                }
            }
        }
        return potentialMatches;
    }
    async getPendingMatches() {
        const matches = await this.caseMatchRepository.find({
            where: { status: case_match_entity_1.CaseMatchStatus.PENDING },
            relations: ['missingCase', 'missingCase.reporter', 'foundCase', 'foundCase.reporter'],
            order: { match_score: 'DESC', createdAt: 'DESC' },
        });
        return matches.filter(match => {
            return !match.missingCase.cancelled_at && !match.foundCase.cancelled_at;
        });
    }
    async getMatchById(matchId) {
        const match = await this.caseMatchRepository.findOne({
            where: { id: matchId },
            relations: ['missingCase', 'missingCase.reporter', 'foundCase', 'foundCase.reporter'],
        });
        if (!match) {
            throw new Error('Match not found');
        }
        return match;
    }
    async confirmMatch(matchId, adminId) {
        const match = await this.getMatchById(matchId);
        if (match.status !== case_match_entity_1.CaseMatchStatus.PENDING) {
            throw new Error('Match has already been processed');
        }
        const missingCase = await this.casesRepository.findOne({
            where: { case_id: match.missing_case_id },
            relations: ['reporter'],
        });
        const foundCase = await this.casesRepository.findOne({
            where: { case_id: match.found_case_id },
            relations: ['reporter'],
        });
        if (!missingCase || !foundCase) {
            throw new Error('Cases not found');
        }
        missingCase.matched_with_case_id = foundCase.case_id;
        foundCase.matched_with_case_id = missingCase.case_id;
        missingCase.status = case_entity_1.CaseStatus.FOUND;
        foundCase.status = case_entity_1.CaseStatus.FOUND;
        missingCase.verified_by = adminId;
        foundCase.verified_by = adminId;
        missingCase.verified_at = new Date();
        foundCase.verified_at = new Date();
        await this.casesRepository.save([missingCase, foundCase]);
        try {
            const [missingPendingRequests, foundPendingRequests] = await Promise.all([
                this.contactRequestRepository.find({
                    where: {
                        case_id: missingCase.case_id,
                        status: contact_request_entity_1.ContactRequestStatus.PENDING,
                    },
                }),
                this.contactRequestRepository.find({
                    where: {
                        case_id: foundCase.case_id,
                        status: contact_request_entity_1.ContactRequestStatus.PENDING,
                    },
                }),
            ]);
            const allPendingRequests = [...missingPendingRequests, ...foundPendingRequests];
            if (allPendingRequests.length > 0) {
                allPendingRequests.forEach(request => {
                    request.status = contact_request_entity_1.ContactRequestStatus.REJECTED;
                    request.respondedAt = new Date();
                });
                await this.contactRequestRepository.save(allPendingRequests);
            }
        }
        catch (error) {
            console.error('Failed to cancel pending contact requests:', error);
        }
        match.status = case_match_entity_1.CaseMatchStatus.CONFIRMED;
        match.confirmed_by = adminId;
        match.confirmed_at = new Date();
        const savedMatch = await this.caseMatchRepository.save(match);
        try {
            if (missingCase.reporter?.email) {
                await this.emailService.sendMatchConfirmedEmail(missingCase.reporter.email, missingCase.case_id, missingCase.name, foundCase.case_id, foundCase.name, foundCase.reporter?.name || foundCase.contact_name || foundCase.reporter?.email, foundCase.contact_phone || '', foundCase.contact_email || foundCase.reporter?.email || '');
            }
            if (foundCase.reporter?.email) {
                await this.emailService.sendMatchConfirmedEmail(foundCase.reporter.email, foundCase.case_id, foundCase.name, missingCase.case_id, missingCase.name, missingCase.reporter?.name || missingCase.contact_name || missingCase.reporter?.email, missingCase.contact_phone || '', missingCase.contact_email || missingCase.reporter?.email || '');
            }
        }
        catch (error) {
            console.error('Failed to send match confirmation emails:', error);
        }
        return savedMatch;
    }
    async rejectMatch(matchId, adminId) {
        const match = await this.getMatchById(matchId);
        if (match.status !== case_match_entity_1.CaseMatchStatus.PENDING) {
            throw new Error('Match has already been processed');
        }
        match.status = case_match_entity_1.CaseMatchStatus.REJECTED;
        const savedMatch = await this.caseMatchRepository.save(match);
        return savedMatch;
    }
    async rejectMatchesForCase(caseId) {
        try {
            const pendingMatches = await this.caseMatchRepository.find({
                where: [
                    { missing_case_id: caseId, status: case_match_entity_1.CaseMatchStatus.PENDING },
                    { found_case_id: caseId, status: case_match_entity_1.CaseMatchStatus.PENDING },
                ],
            });
            if (pendingMatches.length > 0) {
                pendingMatches.forEach(match => {
                    match.status = case_match_entity_1.CaseMatchStatus.REJECTED;
                });
                await this.caseMatchRepository.save(pendingMatches);
            }
        }
        catch (error) {
            console.error('Failed to reject matches for cancelled case:', error);
        }
    }
};
exports.MatchingService = MatchingService;
exports.MatchingService = MatchingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(case_entity_1.Case)),
    __param(1, (0, typeorm_1.InjectRepository)(case_match_entity_1.CaseMatch)),
    __param(2, (0, typeorm_1.InjectRepository)(contact_request_entity_1.ContactRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        email_service_1.EmailService])
], MatchingService);
//# sourceMappingURL=matching.service.js.map