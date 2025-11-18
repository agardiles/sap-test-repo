# SAP Business One Email & SMS Sender

A comprehensive integration service for SAP Business One that enables automated email and SMS notifications to business partners. This solution integrates with SAP Business One Service Layer to fetch business partner data and send notifications via email (SMTP) and SMS (Twilio).

## Features

- **SAP Business One Integration**: Connect to SAP B1 Service Layer to retrieve business partner and document information
- **Email Notifications**: Send professional HTML-formatted emails with customizable templates
- **SMS Notifications**: Send SMS messages via Twilio integration
- **Document Notifications**: Automatically send notifications for invoices, orders, quotations, and delivery notes
- **Bulk Messaging**: Send notifications to multiple business partners at once
- **RESTful API**: Easy-to-use REST API for integration with other systems
- **Logging**: Comprehensive logging with Winston for debugging and monitoring
- **Type Safety**: Built with TypeScript for better code quality and maintainability

## Prerequisites

- Node.js 18+ and npm
- SAP Business One with Service Layer enabled
- SMTP server credentials (Gmail, Office 365, etc.)
- Twilio account (optional, for SMS functionality)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sap-test-repo
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file with your credentials:
```env
# SAP Business One Service Layer Configuration
SAP_SERVICE_LAYER_URL=https://your-sap-server:50000/b1s/v1
SAP_COMPANY_DB=SBODEMOUS
SAP_USERNAME=manager
SAP_PASSWORD=your-password

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourcompany.com

# SMS Configuration (Twilio) - Optional
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Application Configuration
PORT=3000
LOG_LEVEL=info
NODE_ENV=development
```

## Build and Run

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### 1. Health Check
```http
GET /api/health
```

### 2. Send Email
```http
POST /api/email
Content-Type: application/json

{
  "businessPartnerCode": "C00001",
  "subject": "Order Confirmation",
  "text": "Your order has been confirmed.",
  "html": "<p>Your order has been confirmed.</p>"
}
```

Or send to a specific email address:
```json
{
  "to": "customer@example.com",
  "subject": "Order Confirmation",
  "html": "<p>Your order has been confirmed.</p>"
}
```

### 3. Send SMS
```http
POST /api/sms
Content-Type: application/json

{
  "businessPartnerCode": "C00001",
  "message": "Your order has been shipped!"
}
```

Or send to a specific phone number:
```json
{
  "to": "+1234567890",
  "message": "Your order has been shipped!"
}
```

### 4. Send Document Notification
```http
POST /api/document-notification
Content-Type: application/json

{
  "businessPartnerCode": "C00001",
  "documentType": "Invoice",
  "documentNumber": 123,
  "includeEmail": true,
  "includeSMS": true
}
```

Supported document types:
- `Invoice`
- `Order`
- `Quotation`
- `DeliveryNote`

### 5. Send Bulk Notifications
```http
POST /api/bulk-notifications
Content-Type: application/json

{
  "businessPartnerCodes": ["C00001", "C00002", "C00003"],
  "subject": "Important Update",
  "message": "We have an important update for you.",
  "includeEmail": true,
  "includeSMS": false
}
```

## Usage Examples

### Example 1: Send Invoice Email to Business Partner
```bash
curl -X POST http://localhost:3000/api/document-notification \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCode": "C00001",
    "documentType": "Invoice",
    "documentNumber": 123,
    "includeEmail": true,
    "includeSMS": false
  }'
```

### Example 2: Send Custom Email
```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "customer@example.com",
    "subject": "Special Offer",
    "html": "<h1>Limited Time Offer!</h1><p>Get 20% off your next order.</p>"
  }'
```

### Example 3: Send SMS to Business Partner
```bash
curl -X POST http://localhost:3000/api/sms \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCode": "C00001",
    "message": "Your order #12345 has been shipped and will arrive in 2-3 business days."
  }'
```

### Example 4: Bulk Email Campaign
```bash
curl -X POST http://localhost:3000/api/bulk-notifications \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCodes": ["C00001", "C00002", "C00003"],
    "subject": "Holiday Sale",
    "message": "Enjoy our special holiday discounts!",
    "includeEmail": true,
    "includeSMS": false
  }'
```

## Project Structure

```
sap-test-repo/
├── src/
│   ├── services/
│   │   ├── SAPService.ts          # SAP Business One integration
│   │   ├── EmailService.ts        # Email sending functionality
│   │   ├── SMSService.ts          # SMS sending functionality
│   │   └── IntegrationService.ts  # Combined integration service
│   ├── routes/
│   │   └── index.ts               # API routes
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── utils/
│   │   ├── config.ts              # Configuration management
│   │   └── logger.ts              # Logging utility
│   └── index.ts                   # Main application entry point
├── logs/                          # Log files
├── dist/                          # Compiled JavaScript (after build)
├── .env                           # Environment variables (not in git)
├── .env.example                   # Environment variables template
├── package.json                   # Project dependencies
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

## Configuration

### Email Configuration

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use the app password in `EMAIL_PASSWORD`

For other SMTP providers, adjust `EMAIL_HOST` and `EMAIL_PORT` accordingly.

### SMS Configuration (Optional)

To enable SMS functionality:
1. Create a Twilio account at https://www.twilio.com
2. Get your Account SID and Auth Token
3. Purchase a phone number
4. Add credentials to `.env` file

If SMS credentials are not provided, the service will run with email-only functionality.

## Logging

Logs are stored in the `logs/` directory:
- `error.log`: Error-level logs only
- `combined.log`: All logs

In development mode, logs are also output to the console with color formatting.

## Security Considerations

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use HTTPS** in production for the API
3. **Implement authentication** - Add API key or OAuth for production use
4. **Use SSL certificates** - Configure proper SSL for SAP Service Layer
5. **Rate limiting** - Consider adding rate limiting for bulk operations
6. **Input validation** - All inputs are validated, but review for your use case

## Troubleshooting

### SAP Connection Issues
- Verify Service Layer URL is correct
- Check username and password
- Ensure Service Layer is running
- Check firewall settings

### Email Issues
- Verify SMTP credentials
- Check if your email provider allows SMTP access
- Review firewall/network settings
- Check logs in `logs/error.log`

### SMS Issues
- Verify Twilio credentials
- Ensure phone number format is correct (E.164 format)
- Check Twilio account balance
- Review Twilio console for error messages

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create an issue in the repository.