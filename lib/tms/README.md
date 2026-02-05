# TMS Integration

Інтеграція з Transportation Management System (TMS) для автоматичної синхронізації відправлень.

## Налаштування

Додайте змінні оточення в `.env.local`:

```env
TMS_API_URL=https://your-tms-api.com/api
TMS_API_KEY=your_tms_api_key
TMS_API_TIMEOUT=30000
TMS_WEBHOOK_SECRET=your_webhook_secret
```

## API Endpoints

### POST `/api/tms/sync`

Ручна синхронізація відправлень з TMS. Доступно тільки для адмінів.

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

Webhook endpoint для автоматичного оновлення відправлень з TMS.

**Headers:**
- `x-tms-signature`: секрет для верифікації (якщо встановлено `TMS_WEBHOOK_SECRET`)

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

## Синхронізація через Cron

Для автоматичної синхронізації можна налаштувати cron job:

```bash
curl -X POST https://your-domain.com/api/tms/sync \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"updatedSince": "2025-02-05T00:00:00Z"}'
```

Або використовувати сервіси типу Vercel Cron Jobs, GitHub Actions, або Supabase Edge Functions.

## Формат даних TMS

TMS API повинен повертати дані у форматі:

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

## Статуси

Підтримуються статуси:
- `pending`
- `in_transit`
- `delivered`
- `cancelled`

Інші статуси будуть нормалізовані до `pending`.
