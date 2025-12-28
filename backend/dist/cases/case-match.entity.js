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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseMatch = exports.CaseMatchStatus = void 0;
const typeorm_1 = require("typeorm");
const case_entity_1 = require("./case.entity");
const user_entity_1 = require("../users/user.entity");
var CaseMatchStatus;
(function (CaseMatchStatus) {
    CaseMatchStatus["PENDING"] = "pending";
    CaseMatchStatus["CONFIRMED"] = "confirmed";
    CaseMatchStatus["REJECTED"] = "rejected";
})(CaseMatchStatus || (exports.CaseMatchStatus = CaseMatchStatus = {}));
let CaseMatch = class CaseMatch {
    id;
    missingCase;
    missing_case_id;
    foundCase;
    found_case_id;
    match_score;
    status;
    confirmedBy;
    confirmed_by;
    confirmed_at;
    createdAt;
};
exports.CaseMatch = CaseMatch;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CaseMatch.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => case_entity_1.Case, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'missing_case_id' }),
    __metadata("design:type", case_entity_1.Case)
], CaseMatch.prototype, "missingCase", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CaseMatch.prototype, "missing_case_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => case_entity_1.Case, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'found_case_id' }),
    __metadata("design:type", case_entity_1.Case)
], CaseMatch.prototype, "foundCase", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CaseMatch.prototype, "found_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CaseMatch.prototype, "match_score", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CaseMatchStatus,
        default: CaseMatchStatus.PENDING,
    }),
    __metadata("design:type", String)
], CaseMatch.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'confirmed_by' }),
    __metadata("design:type", user_entity_1.User)
], CaseMatch.prototype, "confirmedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CaseMatch.prototype, "confirmed_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'timestamp' }),
    __metadata("design:type", Object)
], CaseMatch.prototype, "confirmed_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CaseMatch.prototype, "createdAt", void 0);
exports.CaseMatch = CaseMatch = __decorate([
    (0, typeorm_1.Entity)('case_matches')
], CaseMatch);
//# sourceMappingURL=case-match.entity.js.map