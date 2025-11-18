export interface SAPConfig {
  serviceLayerUrl: string;
  companyDB: string;
  username: string;
  password: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
}

export interface SMSConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export interface EmailMessage {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string | Buffer;
  }>;
}

export interface SMSMessage {
  to: string;
  body: string;
}

export interface SAPBusinessPartner {
  CardCode: string;
  CardName: string;
  Phone1?: string;
  Cellular?: string;
  EmailAddress?: string;
}

export interface SAPDocument {
  DocEntry: number;
  DocNum: number;
  CardCode: string;
  CardName: string;
  DocDate: string;
  DocTotal: number;
  DocumentStatus?: string;
}

export interface SendEmailRequest {
  businessPartnerCode?: string;
  to?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  documentNumber?: number;
  documentType?: 'Invoice' | 'Order' | 'Quotation' | 'DeliveryNote';
}

export interface SendSMSRequest {
  businessPartnerCode?: string;
  to?: string;
  message: string;
  documentNumber?: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
