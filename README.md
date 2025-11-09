# 📦 Shippo Tracking Integration – WIMO Automation
A Node.js API that integrates with Shippo to pull tracking data, transform statuses, and handle errors—built for the WIMO automation system.

## 🔗 API Used
**[Shippo Tracking API](https://goshippo.com/docs/)**  
✓ Free test mode with sample tracking numbers  
✓ Simple API key auth  
✓ Reliable dev sandbox  

## What It Does
- Authenticates with `ShippoToken {API_KEY}`
- Creates tracking via `POST /tracks/`
- Retrieves status via `GET /tracks/:carrier/:tracking_number`
- Maps carrier statuses to: `IN_TRANSIT`, `DELIVERED`, `EXCEPTION`, `UNKNOWN`
- Retries on timeout (once), 429 (up to 3), and handles 4xx with clear errors

## 🛠 Setup
1. Add your `.env` file:
```env
SHIPPO_API_KEY=shippo_test_xxx
```
2. Start the app:
```bash
npm install
npm run start
```
3. Test via Postman:
```http
POST /api/track
{
  "carrier": "shippo",
  "trackingNumber": "SHIPPO_TRANSIT"
}

GET /api/track/shippo/SHIPPO_TRANSIT
```

## 🔁 Error Strategy
| Case    | Action |
|---------|--------|
| Timeout | Retry once (exponential backoff) |
| 429     | Retry 3 times max |
| 4xx     | Return clear error message to support team |

## 🚨 If We Hit Rate Limits
If we exceed limits during peak hours:
- App retries 3x, then fails gracefully with:
```json
{ "error": "Tracking info not yet available after retries." }
```

## ✅ Support Plan B (No Code Change)
Support can directly check tracking via:
- **[Shippo Dashboard](https://apps.goshippo.com/)**
- CSV export
- Hosted tracking pages 

## 📂 Folder Structure
```
- server.js
- routes/trackingRoutes.js
- controllers/trackingController.js
- services/trackingService.js
- utils/statusMapper.js
```

## 📦 Sample Response
```json
{
  "tracking_id": "xyz123",
  "carrier": "shippo",
  "tracking_number": "SHIPPO_TRANSIT",
  "original_status": "TRANSIT",
  "mapped_status": "IN_TRANSIT"
}
```
