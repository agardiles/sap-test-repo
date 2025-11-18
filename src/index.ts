import express from 'express';
import { SAPService } from './services/SAPService';
import { EmailService } from './services/EmailService';
import { SMSService } from './services/SMSService';
import { IntegrationService } from './services/IntegrationService';
import { createRouter } from './routes';
import { sapConfig, emailConfig, smsConfig, appConfig, validateConfig } from './utils/config';
import logger from './utils/logger';
import fs from 'fs';
import path from 'path';

async function main() {
  try {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    logger.info('Starting SAP Business One Email & SMS Sender...');

    // Validate configuration
    const configValidation = validateConfig();
    if (!configValidation.valid) {
      logger.error('Configuration validation failed:');
      configValidation.errors.forEach(error => logger.error(`  - ${error}`));
      process.exit(1);
    }

    logger.info('Configuration validated successfully');

    // Initialize services
    logger.info('Initializing services...');

    const sapService = new SAPService(sapConfig);
    const emailService = new EmailService(emailConfig);
    const smsService = new SMSService(smsConfig);

    // Test connections
    logger.info('Testing service connections...');

    try {
      await sapService.login();
      logger.info('✓ SAP Service Layer connection successful');
    } catch (error: any) {
      logger.error('✗ SAP Service Layer connection failed:', error.message);
      logger.error('Please check your SAP credentials and Service Layer URL');
      process.exit(1);
    }

    const emailVerified = await emailService.verifyConnection();
    if (emailVerified) {
      logger.info('✓ Email service connection successful');
    } else {
      logger.warn('✗ Email service connection failed - emails may not be sent');
    }

    if (smsService.isEnabled()) {
      logger.info('✓ SMS service configured and ready');
    } else {
      logger.warn('✗ SMS service not configured - SMS functionality disabled');
    }

    // Create integration service
    const integrationService = new IntegrationService(
      sapService,
      emailService,
      smsService
    );

    // Create Express app
    const app = express();

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Serve static files from public directory
    const publicPath = path.join(__dirname, '../public');
    app.use(express.static(publicPath));
    logger.info(`Serving static files from: ${publicPath}`);

    // Request logging middleware (skip for static files)
    app.use((req, res, next) => {
      if (!req.path.startsWith('/css') && !req.path.startsWith('/js') && !req.path.startsWith('/images')) {
        logger.info(`${req.method} ${req.path}`, {
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
      }
      next();
    });

    // API Routes
    app.use('/api', createRouter(integrationService));

    // Error handling middleware
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    });

    // Start server
    const server = app.listen(appConfig.port, () => {
      logger.info(`Server running on port ${appConfig.port}`);
      logger.info(`Environment: ${appConfig.nodeEnv}`);
      logger.info('');
      logger.info('='.repeat(60));
      logger.info(`🌐 Web Interface: http://localhost:${appConfig.port}/`);
      logger.info('='.repeat(60));
      logger.info('');
      logger.info('API endpoints available:');
      logger.info(`  - GET  http://localhost:${appConfig.port}/api/health`);
      logger.info(`  - POST http://localhost:${appConfig.port}/api/email`);
      logger.info(`  - POST http://localhost:${appConfig.port}/api/sms`);
      logger.info(`  - POST http://localhost:${appConfig.port}/api/document-notification`);
      logger.info(`  - POST http://localhost:${appConfig.port}/api/bulk-notifications`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');

      server.close(() => {
        logger.info('HTTP server closed');
      });

      try {
        await sapService.logout();
        logger.info('Logged out from SAP Service Layer');
      } catch (error: any) {
        logger.error('Error during SAP logout:', error.message);
      }

      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error: any) {
    logger.error('Fatal error during startup:', error);
    process.exit(1);
  }
}

// Run the application
main().catch((error) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});
