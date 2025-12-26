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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({ where: { email } });
    }
    async findById(id) {
        return this.usersRepository.findOne({ where: { id } });
    }
    async countAdmins() {
        return this.usersRepository.count({ where: { role: user_entity_1.UserRole.ADMIN } });
    }
    async create(email, password, name) {
        const isAdminByEnv = process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
        const adminCount = await this.countAdmins();
        const isFirstUser = adminCount === 0;
        const role = (isAdminByEnv || isFirstUser) ? user_entity_1.UserRole.ADMIN : user_entity_1.UserRole.USER;
        const user = this.usersRepository.create({
            email,
            password,
            name,
            role,
            isVerified: true,
        });
        return this.usersRepository.save(user);
    }
    async promoteToAdmin(userId) {
        const user = await this.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        user.role = user_entity_1.UserRole.ADMIN;
        return this.usersRepository.save(user);
    }
    async demoteFromAdmin(userId) {
        const user = await this.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const adminCount = await this.countAdmins();
        if (adminCount <= 1 && user.role === user_entity_1.UserRole.ADMIN) {
            throw new Error('Cannot demote the last admin');
        }
        user.role = user_entity_1.UserRole.USER;
        return this.usersRepository.save(user);
    }
    async listAdmins() {
        return this.usersRepository.find({ where: { role: user_entity_1.UserRole.ADMIN } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map