import twilio from 'twilio';
import { SMSConfig, SMSMessage } from '../types';
import logger from '../utils/logger';

export class SMSService {
  private client: twilio.Twilio | null = null;
  private config: SMSConfig;
  private enabled: boolean = false;

  constructor(config: SMSConfig) {
    this.config = config;

    // Only initialize Twilio if credentials are provided
    if (config.accountSid && config.authToken && config.phoneNumber) {
      try {
        this.client = twilio(config.accountSid, config.authToken);
        this.enabled = true;
        logger.info('SMS service initialized successfully');
      } catch (error: any) {
        logger.error('Failed to initialize SMS service:', error.message);
        this.enabled = false;
      }
    } else {
      logger.warn('SMS service not configured. SMS functionality will be disabled.');
    }
  }

  /**
   * Check if SMS service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Send an SMS message
   */
  async sendSMS(message: SMSMessage): Promise<{ success: boolean; sid?: string; error?: string }> {
    if (!this.enabled || !this.client) {
      return {
        success: false,
        error: 'SMS service is not configured or enabled'
      };
    }

    try {
      // Validate phone number format
      const phoneNumber = this.formatPhoneNumber(message.to);

      const result = await this.client.messages.create({
        body: message.body,
        from: this.config.phoneNumber,
        to: phoneNumber
      });

      logger.info(`SMS sent successfully. SID: ${result.sid}`, {
        to: phoneNumber,
        body: message.body.substring(0, 50) + '...'
      });

      return {
        success: true,
        sid: result.sid
      };
    } catch (error: any) {
      logger.error('Failed to send SMS:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulkSMS(messages: SMSMessage[]): Promise<{
    totalSent: number;
    totalFailed: number;
    results: Array<{ success: boolean; to: string; error?: string }>;
  }> {
    if (!this.enabled) {
      return {
        totalSent: 0,
        totalFailed: messages.length,
        results: messages.map(msg => ({
          success: false,
          to: msg.to,
          error: 'SMS service is not configured'
        }))
      };
    }

    const results = [];
    let totalSent = 0;
    let totalFailed = 0;

    for (const message of messages) {
      const result = await this.sendSMS(message);

      if (result.success) {
        totalSent++;
      } else {
        totalFailed++;
      }

      results.push({
        success: result.success,
        to: message.to,
        error: result.error
      });

      // Add a small delay to avoid rate limiting
      await this.delay(100);
    }

    logger.info(`Bulk SMS sending completed. Sent: ${totalSent}, Failed: ${totalFailed}`);

    return {
      totalSent,
      totalFailed,
      results
    };
  }

  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // If number doesn't start with +, add it
    if (!phoneNumber.startsWith('+')) {
      // If it doesn't start with country code, assume +1 (US/Canada)
      if (cleaned.length === 10) {
        cleaned = '1' + cleaned;
      }
      return '+' + cleaned;
    }

    return phoneNumber;
  }

  /**
   * Create a formatted invoice SMS notification
   */
  createInvoiceSMS(customerName: string, invoiceNumber: number, total: number): SMSMessage {
    const body = `Hello ${customerName}, your invoice #${invoiceNumber} for $${total.toFixed(2)} is ready. Please check your email for details. Thank you!`;

    return {
      to: '', // Will be set by caller
      body
    };
  }

  /**
   * Create a formatted order confirmation SMS
   */
  createOrderConfirmationSMS(customerName: string, orderNumber: number): SMSMessage {
    const body = `Hi ${customerName}! Your order #${orderNumber} has been confirmed and is being processed. Thank you for your business!`;

    return {
      to: '', // Will be set by caller
      body
    };
  }

  /**
   * Create a formatted delivery notification SMS
   */
  createDeliveryNotificationSMS(customerName: string, orderNumber: number): SMSMessage {
    const body = `Hi ${customerName}! Your order #${orderNumber} has been shipped and is on its way. Track your delivery for updates.`;

    return {
      to: '', // Will be set by caller
      body
    };
  }

  /**
   * Create a custom SMS message
   */
  createCustomSMS(to: string, body: string): SMSMessage {
    // Truncate message if too long (SMS limit is typically 160 characters)
    const truncatedBody = body.length > 160 ? body.substring(0, 157) + '...' : body;

    return {
      to,
      body: truncatedBody
    };
  }

  /**
   * Utility function to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
