import nodemailer, { Transporter } from 'nodemailer';
import { EmailConfig, EmailMessage } from '../types';
import logger from '../utils/logger';

export class EmailService {
  private transporter: Transporter;
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;

    // Create nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password
      },
      tls: {
        // Do not fail on invalid certs in development
        rejectUnauthorized: false
      }
    });

    logger.info('Email service initialized');
  }

  /**
   * Verify email configuration
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error: any) {
      logger.error('Email service verification failed:', error.message);
      return false;
    }
  }

  /**
   * Send an email
   */
  async sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const mailOptions = {
        from: this.config.from,
        to: Array.isArray(message.to) ? message.to.join(', ') : message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        attachments: message.attachments
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info(`Email sent successfully. MessageId: ${info.messageId}`, {
        to: mailOptions.to,
        subject: message.subject
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error: any) {
      logger.error('Failed to send email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(messages: EmailMessage[]): Promise<{
    totalSent: number;
    totalFailed: number;
    results: Array<{ success: boolean; to: string | string[]; error?: string }>;
  }> {
    const results = [];
    let totalSent = 0;
    let totalFailed = 0;

    for (const message of messages) {
      const result = await this.sendEmail(message);

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
    }

    logger.info(`Bulk email sending completed. Sent: ${totalSent}, Failed: ${totalFailed}`);

    return {
      totalSent,
      totalFailed,
      results
    };
  }

  /**
   * Create a formatted invoice email
   */
  createInvoiceEmail(
    to: string,
    customerName: string,
    invoiceNumber: number,
    total: number,
    dueDate: string
  ): EmailMessage {
    const subject = `Invoice #${invoiceNumber} - ${customerName}`;

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .invoice-details { background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #0066cc; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .amount { font-size: 24px; font-weight: bold; color: #0066cc; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Invoice</h1>
            </div>
            <div class="content">
              <p>Dear ${customerName},</p>
              <p>Thank you for your business. Please find the details of your invoice below:</p>

              <div class="invoice-details">
                <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                <p><strong>Due Date:</strong> ${dueDate}</p>
                <p><strong>Total Amount:</strong> <span class="amount">$${total.toFixed(2)}</span></p>
              </div>

              <p>Please ensure payment is made by the due date. If you have any questions regarding this invoice, please don't hesitate to contact us.</p>

              <p>Best regards,<br>Your Company Name</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Dear ${customerName},

Thank you for your business. Please find the details of your invoice below:

Invoice Number: ${invoiceNumber}
Due Date: ${dueDate}
Total Amount: $${total.toFixed(2)}

Please ensure payment is made by the due date. If you have any questions regarding this invoice, please don't hesitate to contact us.

Best regards,
Your Company Name
    `;

    return {
      to,
      subject,
      html,
      text
    };
  }

  /**
   * Create a formatted order confirmation email
   */
  createOrderConfirmationEmail(
    to: string,
    customerName: string,
    orderNumber: number,
    total: number,
    orderDate: string
  ): EmailMessage {
    const subject = `Order Confirmation #${orderNumber}`;

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .order-details { background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #28a745; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed!</h1>
            </div>
            <div class="content">
              <p>Dear ${customerName},</p>
              <p>Thank you for your order. Your order has been confirmed and is being processed.</p>

              <div class="order-details">
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>Order Date:</strong> ${orderDate}</p>
                <p><strong>Total Amount:</strong> $${total.toFixed(2)}</p>
              </div>

              <p>We will notify you once your order has been shipped.</p>

              <p>Best regards,<br>Your Company Name</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return {
      to,
      subject,
      html
    };
  }
}
