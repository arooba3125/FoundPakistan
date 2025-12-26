"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = class EmailService {
    configService;
    transporter;
    logger = new common_1.Logger('EmailService');
    constructor(configService) {
        this.configService = configService;
        this.initializeTransporter();
    }
    async initializeTransporter() {
        const emailUser = this.configService.get('EMAIL_USER');
        const emailPass = this.configService.get('EMAIL_PASS');
        if (!emailUser || !emailPass) {
            try {
                const testAccount = await nodemailer.createTestAccount();
                this.transporter = nodemailer.createTransport({
                    host: testAccount.smtp.host,
                    port: testAccount.smtp.port,
                    secure: testAccount.smtp.secure,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass,
                    },
                });
                this.logger.log('✅ Using Ethereal test email account');
                this.logger.log(`📧 Test account: ${testAccount.user}`);
            }
            catch (error) {
                this.logger.error('Failed to create Ethereal test account:', error.message);
                this.transporter = null;
            }
        }
        else {
            this.transporter = nodemailer.createTransport({
                host: this.configService.get('EMAIL_HOST') || 'smtp.mailtrap.io',
                port: this.configService.get('EMAIL_PORT') || 587,
                secure: false,
                auth: {
                    user: emailUser,
                    pass: emailPass,
                },
            });
            this.logger.log('✅ Email service configured with custom SMTP');
        }
    }
    async sendVerificationEmail(email, token) {
        const verificationCode = token.substring(0, 6).toUpperCase();
        if (!this.transporter) {
            this.logger.warn(`[TEST MODE] Verification code for ${email}: ${verificationCode}`);
            return;
        }
        try {
            const info = await this.transporter.sendMail({
                from: '"FoundPakistan" <noreply@foundpakistan.pk>',
                to: email,
                subject: 'Verify Your Email - FoundPakistan',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #059669;">Welcome to FoundPakistan!</h2>
            <p>Thank you for registering. Please verify your email address to complete your registration.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">Your Verification Code:</h3>
              <p style="font-size: 32px; font-weight: bold; color: #059669; margin: 0; letter-spacing: 5px;">${verificationCode}</p>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p style="color: #6b7280; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
          </div>
        `,
            });
            if (process.env.NODE_ENV !== 'production' && info.response && info.response.includes('Ethereal')) {
                const previewUrl = nodemailer.getTestMessageUrl(info);
                this.logger.log(`📬 Test email preview: ${previewUrl}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${email}:`, error.message);
        }
    }
    async sendCaseStatusEmail(email, caseId, status) {
        if (!this.transporter) {
            this.logger.log(`[TEST MODE] Case ${caseId} status updated to ${status} for ${email}`);
            return;
        }
        try {
            await this.transporter.sendMail({
                from: '"FoundPakistan" <noreply@foundpakistan.pk>',
                to: email,
                subject: `Case ${caseId} Status Update - FoundPakistan`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #059669;">Case Status Update</h2>
            <p>Your case <strong>${caseId}</strong> has been updated.</p>
            <p><strong>New Status:</strong> ${status}</p>
            <p>You can view your case details by logging into your account.</p>
            <p style="color: #6b7280; font-size: 12px;">This is an automated message from FoundPakistan.</p>
          </div>
        `,
            });
        }
        catch (error) {
            this.logger.error(`Failed to send case status email to ${email}:`, error.message);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map