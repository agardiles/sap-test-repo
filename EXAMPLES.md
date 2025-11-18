# Usage Examples

This document provides comprehensive examples for using the SAP Business One Email & SMS Sender.

## Table of Contents
- [Basic Email Examples](#basic-email-examples)
- [Basic SMS Examples](#basic-sms-examples)
- [Document Notification Examples](#document-notification-examples)
- [Bulk Notification Examples](#bulk-notification-examples)
- [Integration Examples](#integration-examples)

## Basic Email Examples

### Send Simple Email to Business Partner
```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCode": "C00001",
    "subject": "Thank you for your business",
    "text": "We appreciate your continued support."
  }'
```

### Send HTML Email
```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "customer@example.com",
    "subject": "Welcome to Our Service",
    "html": "<html><body><h1>Welcome!</h1><p>Thank you for choosing us.</p></body></html>"
  }'
```

### Send Email with Both Text and HTML
```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCode": "C00001",
    "subject": "Order Status Update",
    "text": "Your order #12345 is being processed.",
    "html": "<p>Your order <strong>#12345</strong> is being processed.</p>"
  }'
```

## Basic SMS Examples

### Send SMS to Business Partner
```bash
curl -X POST http://localhost:3000/api/sms \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCode": "C00001",
    "message": "Your order is ready for pickup!"
  }'
```

### Send SMS to Specific Phone Number
```bash
curl -X POST http://localhost:3000/api/sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+12125551234",
    "message": "Reminder: Your appointment is tomorrow at 2 PM."
  }'
```

### Send Short SMS Notification
```bash
curl -X POST http://localhost:3000/api/sms \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCode": "C00002",
    "message": "Flash Sale! 30% off today only. Visit our store now!"
  }'
```

## Document Notification Examples

### Send Invoice Notification (Email + SMS)
```bash
curl -X POST http://localhost:3000/api/document-notification \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCode": "C00001",
    "documentType": "Invoice",
    "documentNumber": 1523,
    "includeEmail": true,
    "includeSMS": true
  }'
```

### Send Order Confirmation (Email Only)
```bash
curl -X POST http://localhost:3000/api/document-notification \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCode": "C00001",
    "documentType": "Order",
    "documentNumber": 789,
    "includeEmail": true,
    "includeSMS": false
  }'
```

### Send Quotation (SMS Only)
```bash
curl -X POST http://localhost:3000/api/document-notification \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCode": "C00003",
    "documentType": "Quotation",
    "documentNumber": 456,
    "includeEmail": false,
    "includeSMS": true
  }'
```

### Send Delivery Note Notification
```bash
curl -X POST http://localhost:3000/api/document-notification \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCode": "C00001",
    "documentType": "DeliveryNote",
    "documentNumber": 321,
    "includeEmail": true,
    "includeSMS": true
  }'
```

## Bulk Notification Examples

### Email Newsletter to Multiple Customers
```bash
curl -X POST http://localhost:3000/api/bulk-notifications \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCodes": ["C00001", "C00002", "C00003", "C00004", "C00005"],
    "subject": "Monthly Newsletter - December 2025",
    "message": "Dear valued customer, check out our latest products and special year-end offers!",
    "includeEmail": true,
    "includeSMS": false
  }'
```

### SMS Campaign to Select Customers
```bash
curl -X POST http://localhost:3000/api/bulk-notifications \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCodes": ["C00001", "C00002"],
    "subject": "Flash Sale",
    "message": "VIP Flash Sale! 40% off for the next 2 hours. Show this message in-store.",
    "includeEmail": false,
    "includeSMS": true
  }'
```

### Combined Email and SMS Campaign
```bash
curl -X POST http://localhost:3000/api/bulk-notifications \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCodes": ["C00001", "C00002", "C00003"],
    "subject": "Important Service Update",
    "message": "We will be performing system maintenance on Saturday from 2-4 PM. Thank you for your patience.",
    "includeEmail": true,
    "includeSMS": true
  }'
```

## Integration Examples

### Node.js Integration

```javascript
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function sendInvoiceNotification(businessPartnerCode, invoiceNumber) {
  try {
    const response = await axios.post(`${API_BASE_URL}/document-notification`, {
      businessPartnerCode: businessPartnerCode,
      documentType: 'Invoice',
      documentNumber: invoiceNumber,
      includeEmail: true,
      includeSMS: true
    });

    console.log('Notification sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send notification:', error.message);
    throw error;
  }
}

// Usage
sendInvoiceNotification('C00001', 1523);
```

### Python Integration

```python
import requests
import json

API_BASE_URL = 'http://localhost:3000/api'

def send_email(business_partner_code, subject, message):
    url = f'{API_BASE_URL}/email'
    payload = {
        'businessPartnerCode': business_partner_code,
        'subject': subject,
        'text': message
    }

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print('Email sent successfully:', response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Failed to send email: {e}')
        raise

# Usage
send_email('C00001', 'Order Update', 'Your order has been shipped!')
```

### PHP Integration

```php
<?php

function sendSMS($businessPartnerCode, $message) {
    $apiUrl = 'http://localhost:3000/api/sms';

    $data = [
        'businessPartnerCode' => $businessPartnerCode,
        'message' => $message
    ];

    $options = [
        'http' => [
            'header'  => "Content-Type: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($data)
        ]
    ];

    $context  = stream_context_create($options);
    $result = file_get_contents($apiUrl, false, $context);

    if ($result === FALSE) {
        throw new Exception('Failed to send SMS');
    }

    return json_decode($result, true);
}

// Usage
try {
    $response = sendSMS('C00001', 'Your package has been delivered!');
    echo "SMS sent successfully\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
```

### PowerShell Integration

```powershell
function Send-DocumentNotification {
    param(
        [string]$BusinessPartnerCode,
        [string]$DocumentType,
        [int]$DocumentNumber
    )

    $apiUrl = "http://localhost:3000/api/document-notification"

    $body = @{
        businessPartnerCode = $BusinessPartnerCode
        documentType = $DocumentType
        documentNumber = $DocumentNumber
        includeEmail = $true
        includeSMS = $true
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body -ContentType "application/json"
        Write-Host "Notification sent successfully"
        return $response
    }
    catch {
        Write-Error "Failed to send notification: $_"
        throw
    }
}

# Usage
Send-DocumentNotification -BusinessPartnerCode "C00001" -DocumentType "Invoice" -DocumentNumber 1523
```

## Automated Workflow Examples

### Daily Invoice Reminders
```bash
#!/bin/bash
# Send daily reminders for outstanding invoices

BUSINESS_PARTNERS=("C00001" "C00002" "C00003")

for BP in "${BUSINESS_PARTNERS[@]}"; do
    curl -X POST http://localhost:3000/api/email \
        -H "Content-Type: application/json" \
        -d "{
            \"businessPartnerCode\": \"$BP\",
            \"subject\": \"Payment Reminder\",
            \"text\": \"This is a friendly reminder about your outstanding invoice. Please review and process payment at your earliest convenience.\"
        }"

    echo "Reminder sent to $BP"
    sleep 1
done
```

### Order Confirmation Automation
```bash
#!/bin/bash
# Automatically send order confirmations after order creation

ORDER_NUMBER=$1
BP_CODE=$2

if [ -z "$ORDER_NUMBER" ] || [ -z "$BP_CODE" ]; then
    echo "Usage: $0 <order_number> <business_partner_code>"
    exit 1
fi

curl -X POST http://localhost:3000/api/document-notification \
    -H "Content-Type: application/json" \
    -d "{
        \"businessPartnerCode\": \"$BP_CODE\",
        \"documentType\": \"Order\",
        \"documentNumber\": $ORDER_NUMBER,
        \"includeEmail\": true,
        \"includeSMS\": true
    }"

echo "Order confirmation sent for Order #$ORDER_NUMBER to $BP_CODE"
```

## Testing Examples

### Test Health Check
```bash
curl -X GET http://localhost:3000/api/health
```

Expected Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-18T12:00:00.000Z"
}
```

### Test Email Service
```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "This is a test email from SAP B1 integration."
  }'
```

### Test SMS Service
```bash
curl -X POST http://localhost:3000/api/sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+12125551234",
    "message": "This is a test SMS from SAP B1 integration."
  }'
```

## Error Handling Examples

### Handle Missing Business Partner
```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCode": "INVALID",
    "subject": "Test",
    "text": "Test message"
  }'
```

Expected Response:
```json
{
  "success": false,
  "error": "Business Partner INVALID not found"
}
```

### Handle Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "businessPartnerCode": "C00001"
  }'
```

Expected Response:
```json
{
  "success": false,
  "error": "Subject is required"
}
```
