import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { SAPConfig, SAPBusinessPartner, SAPDocument } from '../types';
import logger from '../utils/logger';

export class SAPService {
  private axiosInstance: AxiosInstance;
  private sessionId: string | null = null;
  private config: SAPConfig;

  constructor(config: SAPConfig) {
    this.config = config;

    // Create axios instance with SSL verification disabled for development
    // In production, use proper SSL certificates
    this.axiosInstance = axios.create({
      baseURL: config.serviceLayerUrl,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Login to SAP Business One Service Layer
   */
  async login(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.post('/Login', {
        CompanyDB: this.config.companyDB,
        UserName: this.config.username,
        Password: this.config.password
      });

      this.sessionId = response.data.SessionId;

      // Set the session cookie for subsequent requests
      if (response.headers['set-cookie']) {
        this.axiosInstance.defaults.headers.Cookie = response.headers['set-cookie'].join('; ');
      }

      logger.info('Successfully logged in to SAP Business One Service Layer');
      return true;
    } catch (error: any) {
      logger.error('Failed to login to SAP Service Layer:', error.message);
      throw new Error(`SAP Login failed: ${error.message}`);
    }
  }

  /**
   * Logout from SAP Business One Service Layer
   */
  async logout(): Promise<void> {
    try {
      await this.axiosInstance.post('/Logout');
      this.sessionId = null;
      logger.info('Logged out from SAP Business One Service Layer');
    } catch (error: any) {
      logger.error('Failed to logout:', error.message);
    }
  }

  /**
   * Ensure we're logged in before making requests
   */
  private async ensureLoggedIn(): Promise<void> {
    if (!this.sessionId) {
      await this.login();
    }
  }

  /**
   * Get Business Partner by CardCode
   */
  async getBusinessPartner(cardCode: string): Promise<SAPBusinessPartner | null> {
    try {
      await this.ensureLoggedIn();

      const response = await this.axiosInstance.get(`/BusinessPartners('${cardCode}')`);

      return {
        CardCode: response.data.CardCode,
        CardName: response.data.CardName,
        Phone1: response.data.Phone1,
        Cellular: response.data.Cellular,
        EmailAddress: response.data.EmailAddress
      };
    } catch (error: any) {
      logger.error(`Failed to get Business Partner ${cardCode}:`, error.message);
      return null;
    }
  }

  /**
   * Get all Business Partners with email addresses
   */
  async getBusinessPartnersWithEmail(): Promise<SAPBusinessPartner[]> {
    try {
      await this.ensureLoggedIn();

      const response = await this.axiosInstance.get('/BusinessPartners', {
        params: {
          $select: 'CardCode,CardName,Phone1,Cellular,EmailAddress',
          $filter: "EmailAddress ne null and EmailAddress ne ''"
        }
      });

      return response.data.value || [];
    } catch (error: any) {
      logger.error('Failed to get Business Partners:', error.message);
      return [];
    }
  }

  /**
   * Get Invoice by DocEntry
   */
  async getInvoice(docEntry: number): Promise<SAPDocument | null> {
    try {
      await this.ensureLoggedIn();

      const response = await this.axiosInstance.get(`/Invoices(${docEntry})`);

      return {
        DocEntry: response.data.DocEntry,
        DocNum: response.data.DocNum,
        CardCode: response.data.CardCode,
        CardName: response.data.CardName,
        DocDate: response.data.DocDate,
        DocTotal: response.data.DocTotal,
        DocumentStatus: response.data.DocumentStatus
      };
    } catch (error: any) {
      logger.error(`Failed to get Invoice ${docEntry}:`, error.message);
      return null;
    }
  }

  /**
   * Get Order by DocEntry
   */
  async getOrder(docEntry: number): Promise<SAPDocument | null> {
    try {
      await this.ensureLoggedIn();

      const response = await this.axiosInstance.get(`/Orders(${docEntry})`);

      return {
        DocEntry: response.data.DocEntry,
        DocNum: response.data.DocNum,
        CardCode: response.data.CardCode,
        CardName: response.data.CardName,
        DocDate: response.data.DocDate,
        DocTotal: response.data.DocTotal,
        DocumentStatus: response.data.DocumentStatus
      };
    } catch (error: any) {
      logger.error(`Failed to get Order ${docEntry}:`, error.message);
      return null;
    }
  }

  /**
   * Get Quotation by DocEntry
   */
  async getQuotation(docEntry: number): Promise<SAPDocument | null> {
    try {
      await this.ensureLoggedIn();

      const response = await this.axiosInstance.get(`/Quotations(${docEntry})`);

      return {
        DocEntry: response.data.DocEntry,
        DocNum: response.data.DocNum,
        CardCode: response.data.CardCode,
        CardName: response.data.CardName,
        DocDate: response.data.DocDate,
        DocTotal: response.data.DocTotal,
        DocumentStatus: response.data.DocumentStatus
      };
    } catch (error: any) {
      logger.error(`Failed to get Quotation ${docEntry}:`, error.message);
      return null;
    }
  }

  /**
   * Get Delivery Note by DocEntry
   */
  async getDeliveryNote(docEntry: number): Promise<SAPDocument | null> {
    try {
      await this.ensureLoggedIn();

      const response = await this.axiosInstance.get(`/DeliveryNotes(${docEntry})`);

      return {
        DocEntry: response.data.DocEntry,
        DocNum: response.data.DocNum,
        CardCode: response.data.CardCode,
        CardName: response.data.CardName,
        DocDate: response.data.DocDate,
        DocTotal: response.data.DocTotal,
        DocumentStatus: response.data.DocumentStatus
      };
    } catch (error: any) {
      logger.error(`Failed to get Delivery Note ${docEntry}:`, error.message);
      return null;
    }
  }

  /**
   * Get document by type and number
   */
  async getDocument(documentType: string, docEntry: number): Promise<SAPDocument | null> {
    switch (documentType.toLowerCase()) {
      case 'invoice':
        return this.getInvoice(docEntry);
      case 'order':
        return this.getOrder(docEntry);
      case 'quotation':
        return this.getQuotation(docEntry);
      case 'deliverynote':
        return this.getDeliveryNote(docEntry);
      default:
        logger.error(`Unknown document type: ${documentType}`);
        return null;
    }
  }
}
