import dotenv from 'dotenv';
import { SAPConfig, EmailConfig, SMSConfig } from '../types';

dotenv.config();

export const sapConfig: SAPConfig = {
  serviceLayerUrl: process.env.SAP_SERVICE_LAYER_URL || '',
  companyDB: process.env.SAP_COMPANY_DB || '',
  username: process.env.SAP_USERNAME || '',
  password: process.env.SAP_PASSWORD || ''
};

export const emailConfig: EmailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  user: process.env.EMAIL_USER || '',
  password: process.env.EMAIL_PASSWORD || '',
  from: process.env.EMAIL_FROM || ''
};

export const smsConfig: SMSConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
};

export const appConfig = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development'
};

export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate SAP configuration
  if (!sapConfig.serviceLayerUrl) errors.push('SAP_SERVICE_LAYER_URL is required');
  if (!sapConfig.companyDB) errors.push('SAP_COMPANY_DB is required');
  if (!sapConfig.username) errors.push('SAP_USERNAME is required');
  if (!sapConfig.password) errors.push('SAP_PASSWORD is required');

  // Validate Email configuration
  if (!emailConfig.host) errors.push('EMAIL_HOST is required');
  if (!emailConfig.user) errors.push('EMAIL_USER is required');
  if (!emailConfig.password) errors.push('EMAIL_PASSWORD is required');
  if (!emailConfig.from) errors.push('EMAIL_FROM is required');

  // Validate SMS configuration (optional, warn if not set)
  if (!smsConfig.accountSid || !smsConfig.authToken || !smsConfig.phoneNumber) {
    console.warn('SMS configuration incomplete. SMS functionality will be disabled.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
