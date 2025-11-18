import express, { Request, Response } from 'express';
import { IntegrationService } from '../services/IntegrationService';
import { SendEmailRequest, SendSMSRequest } from '../types';
import logger from '../utils/logger';

export function createRouter(integrationService: IntegrationService): express.Router {
  const router = express.Router();

  /**
   * Health check endpoint
   */
  router.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Send email endpoint
   * POST /api/email
   */
  router.post('/email', async (req: Request, res: Response) => {
    try {
      const request: SendEmailRequest = req.body;

      if (!request.subject) {
        return res.status(400).json({
          success: false,
          error: 'Subject is required'
        });
      }

      if (!request.businessPartnerCode && !request.to) {
        return res.status(400).json({
          success: false,
          error: 'Either businessPartnerCode or to (email address) is required'
        });
      }

      const result = await integrationService.sendEmail(request);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      logger.error('Error in /api/email:', error.message);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * Send SMS endpoint
   * POST /api/sms
   */
  router.post('/sms', async (req: Request, res: Response) => {
    try {
      const request: SendSMSRequest = req.body;

      if (!request.message) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      if (!request.businessPartnerCode && !request.to) {
        return res.status(400).json({
          success: false,
          error: 'Either businessPartnerCode or to (phone number) is required'
        });
      }

      const result = await integrationService.sendSMS(request);

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      logger.error('Error in /api/sms:', error.message);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * Send document notification (email and/or SMS)
   * POST /api/document-notification
   */
  router.post('/document-notification', async (req: Request, res: Response) => {
    try {
      const {
        businessPartnerCode,
        documentType,
        documentNumber,
        includeEmail = true,
        includeSMS = true
      } = req.body;

      if (!businessPartnerCode) {
        return res.status(400).json({
          success: false,
          error: 'businessPartnerCode is required'
        });
      }

      if (!documentType) {
        return res.status(400).json({
          success: false,
          error: 'documentType is required (Invoice, Order, Quotation, or DeliveryNote)'
        });
      }

      if (!documentNumber) {
        return res.status(400).json({
          success: false,
          error: 'documentNumber is required'
        });
      }

      const result = await integrationService.sendDocumentNotification(
        businessPartnerCode,
        documentType,
        documentNumber,
        includeEmail,
        includeSMS
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      logger.error('Error in /api/document-notification:', error.message);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * Send bulk notifications
   * POST /api/bulk-notifications
   */
  router.post('/bulk-notifications', async (req: Request, res: Response) => {
    try {
      const {
        businessPartnerCodes,
        subject,
        message,
        includeEmail = true,
        includeSMS = false
      } = req.body;

      if (!businessPartnerCodes || !Array.isArray(businessPartnerCodes)) {
        return res.status(400).json({
          success: false,
          error: 'businessPartnerCodes array is required'
        });
      }

      if (!subject) {
        return res.status(400).json({
          success: false,
          error: 'subject is required'
        });
      }

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'message is required'
        });
      }

      const result = await integrationService.sendBulkNotifications(
        businessPartnerCodes,
        subject,
        message,
        includeEmail,
        includeSMS
      );

      res.json(result);
    } catch (error: any) {
      logger.error('Error in /api/bulk-notifications:', error.message);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  return router;
}
