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
                service: 'gmail',
                auth: {
                    user: emailUser,
                    pass: emailPass,
                },
            });
            this.logger.log('✅ Email service configured with Gmail SMTP');
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
    async sendOtpEmail(email, otp) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.trim())) {
            throw new Error(`Invalid email address format: ${email}`);
        }
        if (!this.transporter) {
            this.logger.warn(`[TEST MODE] OTP for ${email}: ${otp}`);
            return;
        }
        try {
            const info = await this.transporter.sendMail({
                from: this.configService.get('EMAIL_FROM') || '"FoundPakistan" <noreply@foundpakistan.pk>',
                to: email,
                subject: 'Your Login OTP - FoundPakistan',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #059669;">Your Login Verification Code</h2>
            <p>You have requested to login to your FoundPakistan account. Please use the following code to complete your login:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="margin: 0 0 10px 0; color: #111827;">Your Verification Code:</h3>
              <p style="font-size: 36px; font-weight: bold; color: #059669; margin: 0; letter-spacing: 8px; font-family: monospace;">${otp}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This code will expire in <strong>5 minutes</strong>.</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px;">This is an automated message from FoundPakistan. Please do not reply to this email.</p>
          </div>
        `,
            });
            if (process.env.NODE_ENV !== 'production' && info.response && info.response.includes('Ethereal')) {
                const previewUrl = nodemailer.getTestMessageUrl(info);
                this.logger.log(`📬 Test email preview: ${previewUrl}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to send OTP email to ${email}:`, error.message);
            throw error;
        }
    }
    async sendCaseStatusEmail(email, caseId, status, caseName, caseType, rejectionReason) {
        if (!this.transporter) {
            this.logger.log(`[TEST MODE] Case ${caseId} status updated to ${status} for ${email}`);
            return;
        }
        let subject = '';
        let statusColor = '#059669';
        let statusMessage = '';
        let additionalInfo = '';
        switch (status.toUpperCase()) {
            case 'VERIFIED':
                subject = `✅ Case Approved - ${caseName || 'Your Case'}`;
                statusColor = '#10b981';
                statusMessage = 'Your case has been verified and approved by our team.';
                additionalInfo = '<p>Your case is now live and visible to the community, helping increase the chances of finding the person.</p>';
                break;
            case 'REJECTED':
                subject = `❌ Case Rejected - ${caseName || 'Your Case'}`;
                statusColor = '#ef4444';
                statusMessage = 'Your case has been reviewed but unfortunately could not be approved.';
                if (rejectionReason) {
                    additionalInfo = `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0;"><strong>Reason:</strong> ${rejectionReason}</div>`;
                }
                break;
            case 'FOUND':
                subject = `🎉 Great News! - ${caseName || 'Person'} Has Been Found`;
                statusColor = '#3b82f6';
                statusMessage = 'We have wonderful news! The person from your case has been found.';
                additionalInfo = '<p style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 16px 0;"><strong>This is great news!</strong> Thank you for using FoundPakistan. Your case will now be marked as resolved.</p>';
                break;
            default:
                subject = `Case Status Update - ${caseName || 'Your Case'}`;
                statusMessage = `Your case status has been updated to: ${status}`;
        }
        const caseTypeText = caseType === 'missing' ? 'Missing Person' : 'Found Person';
        try {
            await this.transporter.sendMail({
                from: this.configService.get('EMAIL_FROM') || '"FoundPakistan" <noreply@foundpakistan.pk>',
                to: email,
                subject: subject,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; margin: 0;">FoundPakistan</h1>
            </div>
            
            <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
              <h2 style="color: #111827; margin-top: 0;">Case Status Update</h2>
              ${caseName ? `<p style="font-size: 18px; color: #374151; margin: 8px 0;"><strong>Case:</strong> ${caseName}</p>` : ''}
              ${caseType ? `<p style="color: #6b7280; margin: 4px 0;"><strong>Type:</strong> ${caseTypeText}</p>` : ''}
              <p style="color: #6b7280; margin: 4px 0;"><strong>Case ID:</strong> ${caseId}</p>
            </div>

            <div style="background-color: ${statusColor}15; border-left: 4px solid ${statusColor}; padding: 20px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #111827; font-size: 16px; margin: 0; line-height: 1.6;">${statusMessage}</p>
              ${additionalInfo}
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">You can view your case details and manage your cases by logging into your FoundPakistan account.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px; font-weight: 600;">View Your Cases</a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">This is an automated message from FoundPakistan. Please do not reply to this email.</p>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 8px 0 0 0;">If you have questions, please contact our support team through your account dashboard.</p>
          </div>
        `,
            });
            this.logger.log(`Case status email sent to ${email} for case ${caseId} (${status})`);
        }
        catch (error) {
            this.logger.error(`Failed to send case status email to ${email}:`, error.message);
        }
    }
    async sendLoginNotificationEmail(email, timestamp, ipAddress) {
        if (!this.transporter) {
            this.logger.log(`[TEST MODE] Login notification for ${email} at ${timestamp.toISOString()}${ipAddress ? ` from IP: ${ipAddress}` : ''}`);
            return;
        }
        const formattedDate = timestamp.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short',
        });
        try {
            await this.transporter.sendMail({
                from: this.configService.get('EMAIL_FROM') || '"FoundPakistan" <noreply@foundpakistan.pk>',
                to: email,
                subject: '🔐 New Login Detected - FoundPakistan',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; margin: 0;">FoundPakistan</h1>
            </div>
            
            <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
              <h2 style="color: #111827; margin-top: 0;">New Login Detected</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                We detected a new login to your FoundPakistan account.
              </p>
            </div>

            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #111827; font-size: 16px; margin: 0 0 12px 0;"><strong>Login Details:</strong></p>
              <p style="color: #374151; margin: 8px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
              ${ipAddress ? `<p style="color: #374151; margin: 8px 0;"><strong>IP Address:</strong> ${ipAddress}</p>` : ''}
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                <strong>⚠️ Wasn't you?</strong><br/>
                If you didn't log in, please secure your account immediately by changing your password. If you notice any suspicious activity, contact our support team right away.
              </p>
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">This is an automated security notification from FoundPakistan.</p>
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">If you have any concerns, please contact our support team through your account dashboard.</p>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">This is an automated message from FoundPakistan. Please do not reply to this email.</p>
          </div>
        `,
            });
            this.logger.log(`Login notification email sent to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send login notification email to ${email}:`, error.message);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map