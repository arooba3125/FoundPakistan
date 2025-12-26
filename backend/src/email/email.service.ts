import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null;
  private logger = new Logger('EmailService');

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    const emailUser = this.configService.get('EMAIL_USER');
    const emailPass = this.configService.get('EMAIL_PASS');

    // If no credentials provided, create test account using Ethereal
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
      } catch (error) {
        this.logger.error('Failed to create Ethereal test account:', error.message);
        this.transporter = null;
      }
    } else {
      // Use provided credentials
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

  async sendVerificationEmail(email: string, token: string): Promise<void> {
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

      // For Ethereal test emails, print preview URL
      if (process.env.NODE_ENV !== 'production' && info.response && info.response.includes('Ethereal')) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        this.logger.log(`📬 Test email preview: ${previewUrl}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error.message);
      // Continue - user can still verify with code from debug response
    }
  }

  async sendCaseStatusEmail(
    email: string,
    caseId: string,
    status: string,
  ): Promise<void> {
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
    } catch (error) {
      this.logger.error(
        `Failed to send case status email to ${email}:`,
        error.message,
      );
      // Don't throw; case update should succeed even if email fails
    }
  }
}
