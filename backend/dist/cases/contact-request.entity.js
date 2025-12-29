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
exports.ContactRequest = exports.ContactRequestStatus = void 0;
const typeorm_1 = require("typeorm");
const case_entity_1 = require("./case.entity");
const user_entity_1 = require("../users/user.entity");
var ContactRequestStatus;
(function (ContactRequestStatus) {
    ContactRequestStatus["PENDING"] = "pending";
    ContactRequestStatus["APPROVED"] = "approved";
    ContactRequestStatus["REJECTED"] = "rejected";
})(ContactRequestStatus || (exports.ContactRequestStatus = ContactRequestStatus = {}));
let ContactRequest = class ContactRequest {
    id;
    case;
    case_id;
    requester;
    requester_id;
    requester_email;
    requester_message;
    status;
    createdAt;
    updatedAt;
    respondedAt;
};
exports.ContactRequest = ContactRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ContactRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => case_entity_1.Case, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'case_id' }),
    __metadata("design:type", case_entity_1.Case)
], ContactRequest.prototype, "case", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ContactRequest.prototype, "case_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'requester_id' }),
    __metadata("design:type", user_entity_1.User)
], ContactRequest.prototype, "requester", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], ContactRequest.prototype, "requester_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ContactRequest.prototype, "requester_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ContactRequest.prototype, "requester_message", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ContactRequestStatus,
        default: ContactRequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], ContactRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ContactRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ContactRequest.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'timestamp' }),
    __metadata("design:type", Object)
], ContactRequest.prototype, "respondedAt", void 0);
exports.ContactRequest = ContactRequest = __decorate([
    (0, typeorm_1.Entity)('contact_requests')
], ContactRequest);
//# sourceMappingURL=contact-request.entity.js.map