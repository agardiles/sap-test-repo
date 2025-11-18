# API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
Currently, no authentication is required. For production use, implement API key authentication or OAuth.

## Response Format
All responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message description"
}
```

## Endpoints

### 1. Health Check

Check if the service is running.

**Request:**
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-18T12:00:00.000Z"
}
```

---

### 2. Send Email

Send an email to a business partner or specific email address.

**Request:**
```http
POST /api/email
Content-Type: application/json
```

**Request Body:**
```json
{
  "businessPartnerCode": "C00001",  // Optional if 'to' is provided
  "to": "email@example.com",         // Optional if 'businessPartnerCode' is provided
  "subject": "Email Subject",        // Required
  "text": "Plain text content",     // Optional
  "html": "<p>HTML content</p>",    // Optional
  "documentType": "Invoice",        // Optional: Invoice, Order, Quotation, DeliveryNote
  "documentNumber": 123             // Optional: DocEntry number
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "messageId": "<message-id@smtp.server>",
    "recipients": ["email@example.com"]
  }
}
```

**Example 1: Send to Business Partner**
```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCode": "C00001",
    "subject": "Order Confirmation",
    "html": "<p>Your order has been confirmed.</p>"
  }'
```

**Example 2: Send Invoice Email**
```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCode": "C00001",
    "subject": "Invoice Ready",
    "documentType": "Invoice",
    "documentNumber": 123
  }'
```

---

### 3. Send SMS

Send an SMS to a business partner or specific phone number.

**Request:**
```http
POST /api/sms
Content-Type: application/json
```

**Request Body:**
```json
{
  "businessPartnerCode": "C00001",  // Optional if 'to' is provided
  "to": "+1234567890",               // Optional if 'businessPartnerCode' is provided
  "message": "Your SMS message"      // Required
}
```

**Response:**
```json
{
  "success": true,
  "message": "SMS sent successfully",
  "data": {
    "sid": "SM1234567890abcdef",
    "to": "+1234567890"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/sms \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCode": "C00001",
    "message": "Your order has been shipped!"
  }'
```

---

### 4. Send Document Notification

Send email and/or SMS notification for a specific SAP document.

**Request:**
```http
POST /api/document-notification
Content-Type: application/json
```

**Request Body:**
```json
{
  "businessPartnerCode": "C00001",        // Required
  "documentType": "Invoice",              // Required: Invoice, Order, Quotation, DeliveryNote
  "documentNumber": 123,                  // Required: DocEntry number
  "includeEmail": true,                   // Optional, default: true
  "includeSMS": true                      // Optional, default: true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sent 2 of 2 notifications",
  "data": {
    "email": {
      "success": true,
      "message": "Email sent successfully",
      "data": {
        "messageId": "<message-id@smtp.server>",
        "recipients": ["customer@example.com"]
      }
    },
    "sms": {
      "success": true,
      "message": "SMS sent successfully",
      "data": {
        "sid": "SM1234567890abcdef",
        "to": "+1234567890"
      }
    }
  }
}
```

**Example: Send Invoice Notification**
```bash
curl -X POST http://localhost:3000/api/document-notification \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCode": "C00001",
    "documentType": "Invoice",
    "documentNumber": 123,
    "includeEmail": true,
    "includeSMS": true
  }'
```

**Example: Send Order Confirmation (Email Only)**
```bash
curl -X POST http://localhost:3000/api/document-notification \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCode": "C00002",
    "documentType": "Order",
    "documentNumber": 456,
    "includeEmail": true,
    "includeSMS": false
  }'
```

---

### 5. Send Bulk Notifications

Send the same message to multiple business partners.

**Request:**
```http
POST /api/bulk-notifications
Content-Type: application/json
```

**Request Body:**
```json
{
  "businessPartnerCodes": ["C00001", "C00002", "C00003"],  // Required
  "subject": "Email subject",                              // Required
  "message": "Message content",                            // Required
  "includeEmail": true,                                    // Optional, default: true
  "includeSMS": false                                      // Optional, default: false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully sent notifications to 3 of 3 business partners",
  "data": [
    {
      "businessPartnerCode": "C00001",
      "email": {
        "success": true,
        "message": "Email sent successfully",
        "data": { "messageId": "...", "recipients": [...] }
      },
      "sms": null
    },
    {
      "businessPartnerCode": "C00002",
      "email": {
        "success": true,
        "message": "Email sent successfully",
        "data": { "messageId": "...", "recipients": [...] }
      },
      "sms": null
    },
    {
      "businessPartnerCode": "C00003",
      "email": {
        "success": true,
        "message": "Email sent successfully",
        "data": { "messageId": "...", "recipients": [...] }
      },
      "sms": null
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/bulk-notifications \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCodes": ["C00001", "C00002", "C00003"],
    "subject": "Monthly Newsletter",
    "message": "Check out our latest products and offers!",
    "includeEmail": true,
    "includeSMS": false
  }'
```

---

## Error Codes

| HTTP Status | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input parameters |
| 500 | Internal Server Error |

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting to prevent abuse.

## Best Practices

1. **Use Business Partner Codes**: When possible, use `businessPartnerCode` to automatically fetch contact information from SAP
2. **Batch Operations**: For multiple recipients, use the bulk notification endpoint
3. **Error Handling**: Always check the `success` field in responses
4. **Logging**: Check application logs for detailed error information
5. **Testing**: Test with a small set of recipients before sending bulk notifications

## Notes

- Phone numbers should be in E.164 format (e.g., +1234567890)
- Email addresses are validated by the email service
- SMS functionality requires Twilio configuration
- Document numbers refer to the DocEntry field in SAP Business One
