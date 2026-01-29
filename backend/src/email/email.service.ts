import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailjet from 'node-mailjet';

@Injectable()
export class EmailService {
  private mailjet: Mailjet | null = null;
  private logger = new Logger('EmailService');
  private fromEmail: string;
  private fromName: string;

  constructor(private configService: ConfigService) {
    this.initializeMailjet();
  }

  private initializeMailjet() {
    const mailjetApiKey = this.configService.get('MAILJET_API_KEY');
    const mailjetSecretKey = this.configService.get('MAILJET_SECRET_KEY');

    if (mailjetApiKey && mailjetSecretKey) {
      this.mailjet = new Mailjet({
        apiKey: mailjetApiKey,
        apiSecret: mailjetSecretKey,
      });
      // Email must be just the email address, not "Name <email>" format
      const emailFrom = this.configService.get('EMAIL_FROM') || 'aroobashehzadi3125@gmail.com';
      // Extract just the email if it's in "Name <email>" format
      const emailMatch = emailFrom.match(/<(.+)>/);
      this.fromEmail = emailMatch ? emailMatch[1].trim() : emailFrom.trim();
      this.fromName = 'FoundPakistan';
      this.logger.log('✅ Email service configured with Mailjet HTTP API');
      this.logger.log(`📧 Sending from: ${this.fromEmail}`);
    } else {
      this.logger.warn('⚠️ MAILJET credentials not set - emails will be logged only');
      this.mailjet = null;
    }
  }

  private async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    if (!this.mailjet) {
      this.logger.warn(`[TEST MODE] Email to ${to}: ${subject}`);
      return;
    }

    try {
      await this.mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: this.fromEmail,
              Name: this.fromName,
            },
            To: [
              {
                Email: to,
              },
            ],
            Subject: subject,
            HTMLPart: htmlContent,
          },
        ],
      });
      this.logger.log(`✅ Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error.message);
      throw error;
    }
  }

  private async sendEmailDirect(options: { from: string; to: string; subject: string; html: string }): Promise<void> {
    await this.sendEmail(options.to, options.subject, options.html);
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationCode = token.substring(0, 6).toUpperCase();

    if (!this.mailjet) {
      this.logger.warn(`[TEST MODE] Verification code for ${email}: ${verificationCode}`);
      return;
    }

    const html = `
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
    `;

    await this.sendEmail(email, 'Verify Your Email - FoundPakistan', html);
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      throw new Error(`Invalid email address format: ${email}`);
    }

    if (!this.mailjet) {
      this.logger.warn(`[TEST MODE] OTP for ${email}: ${otp}`);
      return;
    }

    const html = `
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
    `;

    await this.sendEmail(email, 'Your Login OTP - FoundPakistan', html);
  }

  async sendCaseStatusEmail(
    email: string,
    caseId: string,
    status: string,
    caseName?: string,
    caseType?: string,
    rejectionReason?: string,
  ): Promise<void> {
    if (!this.mailjet) {
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

    const html = `
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
      </div>
    `;

    try {
      await this.sendEmail(email, subject, html);
      this.logger.log(`Case status email sent to ${email} for case ${caseId} (${status})`);
    } catch (error) {
      this.logger.error(`Failed to send case status email to ${email}:`, error.message);
      // Don't throw; case update should succeed even if email fails
    }
  }

  async sendLoginNotificationEmail(email: string, timestamp: Date, ipAddress?: string): Promise<void> {
    if (!this.mailjet) {
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

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #059669; margin: 0;">FoundPakistan</h1></div>
        <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #111827; margin-top: 0;">New Login Detected</h2>
          <p style="color: #374151;">We detected a new login to your FoundPakistan account.</p>
        </div>
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0;">
          <p><strong>Date & Time:</strong> ${formattedDate}</p>
          ${ipAddress ? `<p><strong>IP Address:</strong> ${ipAddress}</p>` : ''}
        </div>
        <p style="color: #9ca3af; font-size: 12px;">This is an automated message from FoundPakistan.</p>
      </div>
    `;

    try {
      await this.sendEmail(email, '🔐 New Login Detected - FoundPakistan', html);
      this.logger.log(`Login notification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send login notification email to ${email}:`, error.message);
    }
  }

  async sendContactRequestEmail(
    caseReporterEmail: string,
    caseId: string,
    caseName: string,
    requesterEmail: string,
    requesterMessage?: string,
  ): Promise<void> {
    if (!this.mailjet) {
      this.logger.log(`[TEST MODE] Contact request for case ${caseId} from ${requesterEmail}`);
      return;
    }

    try {
      await this.sendEmailDirect({
        from: this.fromEmail,
        to: caseReporterEmail,
        subject: `Contact Request for Case ${caseId} - FoundPakistan`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; margin: 0;">FoundPakistan</h1>
            </div>
            
            <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
              <h2 style="color: #111827; margin-top: 0;">New Contact Request</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Someone wants to contact you about your case.
              </p>
            </div>

            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #111827; font-size: 16px; margin: 0 0 12px 0;"><strong>Case Details:</strong></p>
              <p style="color: #374151; margin: 8px 0;"><strong>Case ID:</strong> ${caseId}</p>
              <p style="color: #374151; margin: 8px 0;"><strong>Case Name:</strong> ${caseName}</p>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 4px;">
              <p style="color: #111827; font-size: 16px; margin: 0 0 12px 0;"><strong>Requester Information:</strong></p>
              <p style="color: #374151; margin: 8px 0;"><strong>Email:</strong> ${requesterEmail}</p>
              ${requesterMessage ? `<p style="color: #374151; margin: 8px 0;"><strong>Message:</strong> ${requesterMessage}</p>` : ''}
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">Please log in to your dashboard to approve or reject this contact request.</p>
              <p style="text-align: center; margin-top: 20px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile" style="background-color: #059669; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  View Dashboard
                </a>
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">This is an automated message from FoundPakistan. Please do not reply to this email.</p>
          </div>
        `,
      });
      this.logger.log(`Contact request email sent to ${caseReporterEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send contact request email to ${caseReporterEmail}:`, error.message);
    }
  }

  async sendContactApprovalEmail(
    requesterEmail: string,
    caseId: string,
    caseName: string,
    contactName: string,
    contactPhone: string,
    contactEmail: string,
  ): Promise<void> {
    if (!this.mailjet) {
      this.logger.log(`[TEST MODE] Contact approval for case ${caseId} to ${requesterEmail}`);
      return;
    }

    try {
      await this.sendEmailDirect({
        from: this.fromEmail,
        to: requesterEmail,
        subject: `Contact Request Approved - Case ${caseId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; margin: 0;">FoundPakistan</h1>
            </div>
            
            <div style="background-color: #d1fae5; border-left: 4px solid #059669; padding: 20px; margin: 24px 0; border-radius: 4px;">
              <h2 style="color: #111827; margin-top: 0;">Contact Request Approved! ✅</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Your contact request for case <strong>${caseName}</strong> (ID: ${caseId}) has been approved.
              </p>
            </div>

            <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; margin: 24px 0;">
              <h3 style="color: #111827; margin-top: 0;">Contact Information:</h3>
              <p style="color: #374151; margin: 8px 0;"><strong>Name:</strong> ${contactName}</p>
              <p style="color: #374151; margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${contactEmail}" style="color: #059669;">${contactEmail}</a></p>
              ${contactPhone ? `<p style="color: #374151; margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${contactPhone}" style="color: #059669;">${contactPhone}</a></p>` : ''}
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">You can now contact them directly. Please be respectful and provide helpful information.</p>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">This is an automated message from FoundPakistan. Please do not reply to this email.</p>
          </div>
        `,
      });
      this.logger.log(`Contact approval email sent to ${requesterEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send contact approval email to ${requesterEmail}:`, error.message);
    }
  }

  async sendContactRejectionEmail(
    requesterEmail: string,
    caseId: string,
    caseName: string,
  ): Promise<void> {
    if (!this.mailjet) {
      this.logger.log(`[TEST MODE] Contact rejection for case ${caseId} to ${requesterEmail}`);
      return;
    }

    try {
      await this.sendEmailDirect({
        from: this.fromEmail,
        to: requesterEmail,
        subject: `Contact Request - Case ${caseId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; margin: 0;">FoundPakistan</h1>
            </div>
            
            <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
              <h2 style="color: #111827; margin-top: 0;">Contact Request Update</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Your contact request for case <strong>${caseName}</strong> (ID: ${caseId}) could not be approved at this time.
              </p>
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">Thank you for your interest. The case reporter has chosen not to share contact information at this time.</p>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">This is an automated message from FoundPakistan. Please do not reply to this email.</p>
          </div>
        `,
      });
      this.logger.log(`Contact rejection email sent to ${requesterEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send contact rejection email to ${requesterEmail}:`, error.message);
    }
  }

  async sendMatchConfirmedEmail(
    reporterEmail: string,
    caseId: string,
    caseName: string,
    matchedCaseId: string,
    matchedCaseName: string,
    matchedCaseReporterName: string,
    matchedCaseContactPhone: string,
    matchedCaseContactEmail: string,
  ): Promise<void> {
    if (!this.mailjet) {
      this.logger.log(`[TEST MODE] Match confirmed email for case ${caseId} to ${reporterEmail}`);
      return;
    }

    try {
      await this.sendEmailDirect({
        from: this.fromEmail,
        to: reporterEmail,
        subject: `Match Confirmed - ${caseName} Has Been Found!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; margin: 0;">FoundPakistan</h1>
            </div>
            
            <div style="background-color: #d1fae5; border-left: 4px solid #059669; padding: 20px; margin: 24px 0; border-radius: 4px;">
              <h2 style="color: #111827; margin-top: 0;">🎉 Match Confirmed!</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Great news! A match has been confirmed for your case.
              </p>
            </div>

            <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px; margin: 24px 0;">
              <h3 style="color: #111827; margin-top: 0;">Your Case:</h3>
              <p style="color: #374151; margin: 8px 0;"><strong>Case ID:</strong> ${caseId}</p>
              <p style="color: #374151; margin: 8px 0;"><strong>Name:</strong> ${caseName}</p>
            </div>

            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 4px;">
              <h3 style="color: #111827; margin-top: 0;">Matched Case:</h3>
              <p style="color: #374151; margin: 8px 0;"><strong>Case ID:</strong> ${matchedCaseId}</p>
              <p style="color: #374151; margin: 8px 0;"><strong>Name:</strong> ${matchedCaseName}</p>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 4px;">
              <h3 style="color: #111827; margin-top: 0;">Contact Information:</h3>
              <p style="color: #374151; margin: 8px 0;"><strong>Name:</strong> ${matchedCaseReporterName}</p>
              <p style="color: #374151; margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${matchedCaseContactEmail}" style="color: #059669;">${matchedCaseContactEmail}</a></p>
              ${matchedCaseContactPhone ? `<p style="color: #374151; margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${matchedCaseContactPhone}" style="color: #059669;">${matchedCaseContactPhone}</a></p>` : ''}
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">You can now contact them directly. Please verify the match and proceed accordingly.</p>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">This is an automated message from FoundPakistan. Please do not reply to this email.</p>
          </div>
        `,
      });
      this.logger.log(`Match confirmed email sent to ${reporterEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send match confirmed email to ${reporterEmail}:`, error.message);
    }
  }
}
