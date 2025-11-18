import { SAPService } from './SAPService';
import { EmailService } from './EmailService';
import { SMSService } from './SMSService';
import { SendEmailRequest, SendSMSRequest, APIResponse } from '../types';
import logger from '../utils/logger';

export class IntegrationService {
  private sapService: SAPService;
  private emailService: EmailService;
  private smsService: SMSService;

  constructor(
    sapService: SAPService,
    emailService: EmailService,
    smsService: SMSService
  ) {
    this.sapService = sapService;
    this.emailService = emailService;
    this.smsService = smsService;
  }

  /**
   * Send email with SAP Business Partner integration
   */
  async sendEmail(request: SendEmailRequest): Promise<APIResponse> {
    try {
      let recipients: string[] = [];

      // If business partner code is provided, fetch email from SAP
      if (request.businessPartnerCode) {
        const businessPartner = await this.sapService.getBusinessPartner(request.businessPartnerCode);

        if (!businessPartner) {
          return {
            success: false,
            error: `Business Partner ${request.businessPartnerCode} not found`
          };
        }

        if (!businessPartner.EmailAddress) {
          return {
            success: false,
            error: `Business Partner ${request.businessPartnerCode} does not have an email address`
          };
        }

        recipients.push(businessPartner.EmailAddress);
      }

      // Add manually specified recipients
      if (request.to) {
        const manualRecipients = Array.isArray(request.to) ? request.to : [request.to];
        recipients = [...recipients, ...manualRecipients];
      }

      if (recipients.length === 0) {
        return {
          success: false,
          error: 'No recipients specified'
        };
      }

      // If document information is provided, fetch and format accordingly
      let emailContent = {
        to: recipients,
        subject: request.subject,
        text: request.text,
        html: request.html
      };

      if (request.documentType && request.documentNumber) {
        const document = await this.sapService.getDocument(
          request.documentType,
          request.documentNumber
        );

        if (document) {
          // Create formatted email based on document type
          switch (request.documentType) {
            case 'Invoice':
              emailContent = this.emailService.createInvoiceEmail(
                recipients[0],
                document.CardName,
                document.DocNum,
                document.DocTotal,
                document.DocDate
              );
              emailContent.to = recipients;
              break;
            case 'Order':
              emailContent = this.emailService.createOrderConfirmationEmail(
                recipients[0],
                document.CardName,
                document.DocNum,
                document.DocTotal,
                document.DocDate
              );
              emailContent.to = recipients;
              break;
          }
        }
      }

      const result = await this.emailService.sendEmail(emailContent);

      if (result.success) {
        return {
          success: true,
          message: 'Email sent successfully',
          data: { messageId: result.messageId, recipients }
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error: any) {
      logger.error('Error in sendEmail:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send SMS with SAP Business Partner integration
   */
  async sendSMS(request: SendSMSRequest): Promise<APIResponse> {
    try {
      if (!this.smsService.isEnabled()) {
        return {
          success: false,
          error: 'SMS service is not configured'
        };
      }

      let phoneNumber: string | null = null;

      // If business partner code is provided, fetch phone from SAP
      if (request.businessPartnerCode) {
        const businessPartner = await this.sapService.getBusinessPartner(request.businessPartnerCode);

        if (!businessPartner) {
          return {
            success: false,
            error: `Business Partner ${request.businessPartnerCode} not found`
          };
        }

        phoneNumber = businessPartner.Cellular || businessPartner.Phone1 || null;

        if (!phoneNumber) {
          return {
            success: false,
            error: `Business Partner ${request.businessPartnerCode} does not have a phone number`
          };
        }
      }

      // Use manually specified phone number if provided
      if (request.to) {
        phoneNumber = request.to;
      }

      if (!phoneNumber) {
        return {
          success: false,
          error: 'No phone number specified'
        };
      }

      const result = await this.smsService.sendSMS({
        to: phoneNumber,
        body: request.message
      });

      if (result.success) {
        return {
          success: true,
          message: 'SMS sent successfully',
          data: { sid: result.sid, to: phoneNumber }
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error: any) {
      logger.error('Error in sendSMS:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send both email and SMS for a document
   */
  async sendDocumentNotification(
    businessPartnerCode: string,
    documentType: 'Invoice' | 'Order' | 'Quotation' | 'DeliveryNote',
    documentNumber: number,
    includeEmail: boolean = true,
    includeSMS: boolean = true
  ): Promise<APIResponse> {
    try {
      const results: any = {
        email: null,
        sms: null
      };

      const businessPartner = await this.sapService.getBusinessPartner(businessPartnerCode);
      if (!businessPartner) {
        return {
          success: false,
          error: `Business Partner ${businessPartnerCode} not found`
        };
      }

      const document = await this.sapService.getDocument(documentType, documentNumber);
      if (!document) {
        return {
          success: false,
          error: `${documentType} ${documentNumber} not found`
        };
      }

      // Send email if requested and email address is available
      if (includeEmail && businessPartner.EmailAddress) {
        const emailRequest: SendEmailRequest = {
          businessPartnerCode,
          subject: `${documentType} #${document.DocNum}`,
          documentType,
          documentNumber
        };

        results.email = await this.sendEmail(emailRequest);
      }

      // Send SMS if requested and phone number is available
      if (includeSMS && (businessPartner.Cellular || businessPartner.Phone1)) {
        let message = '';

        switch (documentType) {
          case 'Invoice':
            const invoiceSMS = this.smsService.createInvoiceSMS(
              businessPartner.CardName,
              document.DocNum,
              document.DocTotal
            );
            message = invoiceSMS.body;
            break;
          case 'Order':
            const orderSMS = this.smsService.createOrderConfirmationSMS(
              businessPartner.CardName,
              document.DocNum
            );
            message = orderSMS.body;
            break;
          case 'DeliveryNote':
            const deliverySMS = this.smsService.createDeliveryNotificationSMS(
              businessPartner.CardName,
              document.DocNum
            );
            message = deliverySMS.body;
            break;
          default:
            message = `${documentType} #${document.DocNum} is ready for ${businessPartner.CardName}`;
        }

        const smsRequest: SendSMSRequest = {
          businessPartnerCode,
          message
        };

        results.sms = await this.sendSMS(smsRequest);
      }

      const successCount = (results.email?.success ? 1 : 0) + (results.sms?.success ? 1 : 0);
      const attemptCount = (includeEmail && businessPartner.EmailAddress ? 1 : 0) +
                          (includeSMS && (businessPartner.Cellular || businessPartner.Phone1) ? 1 : 0);

      return {
        success: successCount > 0,
        message: `Sent ${successCount} of ${attemptCount} notifications`,
        data: results
      };
    } catch (error: any) {
      logger.error('Error in sendDocumentNotification:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send bulk notifications to multiple business partners
   */
  async sendBulkNotifications(
    businessPartnerCodes: string[],
    subject: string,
    message: string,
    includeEmail: boolean = true,
    includeSMS: boolean = false
  ): Promise<APIResponse> {
    try {
      const results = [];

      for (const code of businessPartnerCodes) {
        const result: any = {
          businessPartnerCode: code,
          email: null,
          sms: null
        };

        if (includeEmail) {
          result.email = await this.sendEmail({
            businessPartnerCode: code,
            subject,
            text: message
          });
        }

        if (includeSMS) {
          result.sms = await this.sendSMS({
            businessPartnerCode: code,
            message
          });
        }

        results.push(result);
      }

      const successCount = results.filter(r =>
        (r.email?.success || r.sms?.success)
      ).length;

      return {
        success: successCount > 0,
        message: `Successfully sent notifications to ${successCount} of ${businessPartnerCodes.length} business partners`,
        data: results
      };
    } catch (error: any) {
      logger.error('Error in sendBulkNotifications:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
