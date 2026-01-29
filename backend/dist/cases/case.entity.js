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
exports.Case = exports.Gender = exports.Priority = exports.CaseStatus = exports.CaseType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
var CaseType;
(function (CaseType) {
    CaseType["MISSING"] = "missing";
    CaseType["FOUND"] = "found";
})(CaseType || (exports.CaseType = CaseType = {}));
var CaseStatus;
(function (CaseStatus) {
    CaseStatus["PENDING"] = "pending";
    CaseStatus["VERIFIED"] = "verified";
    CaseStatus["FOUND"] = "found";
    CaseStatus["REJECTED"] = "rejected";
})(CaseStatus || (exports.CaseStatus = CaseStatus = {}));
var Priority;
(function (Priority) {
    Priority["HIGH"] = "high";
    Priority["MEDIUM"] = "medium";
    Priority["LOW"] = "low";
})(Priority || (exports.Priority = Priority = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
    Gender["OTHER"] = "other";
})(Gender || (exports.Gender = Gender = {}));
let Case = class Case {
    case_id;
    case_type;
    status;
    priority;
    name;
    name_ur;
    age;
    gender;
    city;
    area;
    badge_tags;
    last_seen_location;
    last_seen_date;
    description;
    description_ur;
    media;
    contact_name;
    contact_phone;
    contact_email;
    reporter;
    reporter_id;
    verifiedBy;
    verified_by;
    verified_at;
    rejection_reason;
    matched_with_case_id;
    cancelled_at;
    createdAt;
    updatedAt;
};
exports.Case = Case;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Case.prototype, "case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CaseType,
    }),
    __metadata("design:type", String)
], Case.prototype, "case_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CaseStatus,
        default: CaseStatus.PENDING,
    }),
    __metadata("design:type", String)
], Case.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Priority,
        default: Priority.MEDIUM,
    }),
    __metadata("design:type", String)
], Case.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Case.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "name_ur", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Case.prototype, "age", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Gender,
    }),
    __metadata("design:type", String)
], Case.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Case.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "area", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Case.prototype, "badge_tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "last_seen_location", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Case.prototype, "last_seen_date", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Case.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "description_ur", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Array)
], Case.prototype, "media", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "contact_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "contact_phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "contact_email", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'reporter_id' }),
    __metadata("design:type", user_entity_1.User)
], Case.prototype, "reporter", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Case.prototype, "reporter_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'verified_by' }),
    __metadata("design:type", user_entity_1.User)
], Case.prototype, "verifiedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "verified_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Case.prototype, "verified_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "rejection_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Case.prototype, "matched_with_case_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'timestamp' }),
    __metadata("design:type", Object)
], Case.prototype, "cancelled_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Case.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Case.prototype, "updatedAt", void 0);
exports.Case = Case = __decorate([
    (0, typeorm_1.Entity)('cases')
], Case);
//# sourceMappingURL=case.entity.js.map