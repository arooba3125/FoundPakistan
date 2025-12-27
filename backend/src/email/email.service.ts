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
      // Use Gmail SMTP
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass, // Use App Password for Gmail
        },
      });
      this.logger.log('✅ Email service configured with Gmail SMTP');
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

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    // Validate email format
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

      // For Ethereal test emails, print preview URL
      if (process.env.NODE_ENV !== 'production' && info.response && info.response.includes('Ethereal')) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        this.logger.log(`📬 Test email preview: ${previewUrl}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error.message);
      throw error; // Re-throw for OTP emails since they're critical
    }
  }

  async sendCaseStatusEmail(
    email: string,
    caseId: string,
    status: string,
    caseName?: string,
    caseType?: string,
    rejectionReason?: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[TEST MODE] Case ${caseId} status updated to ${status} for ${email}`);
      return;
    }

    // Determine email content based on status
    let subject = '';
    let statusColor = '#059669';
    let statusMessage = '';
    let additionalInfo = '';

    switch (status.toUpperCase()) {
      case 'VERIFIED':
        subject = `✅ Case Approved - ${caseName || 'Your Case'}`;
        statusColor = '#10b981'; // Green
        statusMessage = 'Your case has been verified and approved by our team.';
        additionalInfo = '<p>Your case is now live and visible to the community, helping increase the chances of finding the person.</p>';
        break;
      case 'REJECTED':
        subject = `❌ Case Rejected - ${caseName || 'Your Case'}`;
        statusColor = '#ef4444'; // Red
        statusMessage = 'Your case has been reviewed but unfortunately could not be approved.';
        if (rejectionReason) {
          additionalInfo = `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0;"><strong>Reason:</strong> ${rejectionReason}</div>`;
        }
        break;
      case 'FOUND':
        subject = `🎉 Great News! - ${caseName || 'Person'} Has Been Found`;
        statusColor = '#3b82f6'; // Blue
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
    } catch (error) {
      this.logger.error(
        `Failed to send case status email to ${email}:`,
        error.message,
      );
      // Don't throw; case update should succeed even if email fails
    }
  }
}
