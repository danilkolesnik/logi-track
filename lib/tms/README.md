# TMS Integration

Integration with Transportation Management System (TMS) for automatic shipment synchronization.

## Setup

Add environment variables to `.env.local`:

```env
TMS_API_URL=https://your-tms-api.com/api
TMS_API_KEY=your_tms_api_key
TMS_API_TIMEOUT=30000
TMS_WEBHOOK_SECRET=your_webhook_secret
```

## API Endpoints

### POST `/api/tms/sync`

Manual synchronization of shipments from TMS. Available only for admins.

**Request Body:**
```json
{
  "clientId": "optional-client-id",
  "updatedSince": "2025-01-01T00:00:00Z"
}
```

**Response:**
```json
{
  "data": {
    "synced": 10,
    "created": 5,
    "updated": 5
  }
}
```

### POST `/api/tms/webhook`

Webhook endpoint for automatic shipment updates from TMS.

**Headers:**
- `x-tms-signature`: secret for verification (if `TMS_WEBHOOK_SECRET` is set)

**Events:**

1. `shipment.created` / `shipment.updated`:
```json
{
  "event": "shipment.updated",
  "data": {
    "trackingNumber": "TRK-001",
    "origin": "Warehouse A",
    "destination": "Client B",
    "status": "in_transit",
    "estimatedDelivery": "2025-02-15",
    "actualDelivery": null,
    "clientEmail": "client@example.com",
    "clientId": "optional-uuid",
    "timeline": []
  }
}
```

2. `timeline.updated`:
```json
{
  "event": "timeline.updated",
  "data": {
    "trackingNumber": "TRK-001",
    "events": [
      {
        "shipmentId": "tms-id",
        "status": "in_transit",
        "timestamp": "2025-02-05T10:00:00Z",
        "location": "Warehouse B",
        "notes": "In transit"
      }
    ]
  }
}
```

## Cron Synchronization

For automatic synchronization, you can set up a cron job:

```bash
curl -X POST https://your-domain.com/api/tms/sync \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"updatedSince": "2025-02-05T00:00:00Z"}'
```

Or use services like Vercel Cron Jobs, GitHub Actions, or Supabase Edge Functions.

## TMS Data Format

TMS API should return data in the following format:

**Shipments:**
```json
[
  {
    "id": "tms-shipment-id",
    "trackingNumber": "TRK-001",
    "origin": "Warehouse A",
    "destination": "Client B",
    "status": "in_transit",
    "estimatedDelivery": "2025-02-15",
    "actualDelivery": null,
    "clientEmail": "client@example.com",
    "clientId": "optional-uuid",
    "updatedAt": "2025-02-05T10:00:00Z"
  }
]
```

**Timeline Events:**
```json
[
  {
    "shipmentId": "tms-shipment-id",
    "status": "in_transit",
    "timestamp": "2025-02-05T10:00:00Z",
    "location": "Warehouse B",
    "notes": "In transit"
  }
]
```

## Statuses

Supported statuses:
- `pending`
- `in_transit`
- `delivered`
- `cancelled`

Other statuses will be normalized to `pending`.
