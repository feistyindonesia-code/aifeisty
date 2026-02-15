# API REFERENCE - AI Feisty

Complete API documentation for Google Apps Script backend.

## Base URL

```
https://script.google.com/macros/d/YOUR_SCRIPT_ID/usw
```

All requests: **POST** with `Content-Type: application/json`

---

## ENDPOINTS

### 1. REGISTER - Create New Account

**Request:**
```json
{
  "action": "register",
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": { "user_id": "user_1708020600000_a1b2c3" },
  "message": "Registrasi berhasil"
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "message": "Email sudah terdaftar"
}
```

**Validation:**
- Email: Valid format + unique
- Password: Minimum 6 characters
- Both fields required

---

### 2. LOGIN - Authenticate User

**Request:**
```json
{
  "action": "login",
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": { "user_id": "user_1708020600000_a1b2c3" },
  "message": "Login berhasil"
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "message": "Email atau password salah"
}
```

---

### 3. CHAT - Send Message & Get AI Response

**Request:**
```json
{
  "action": "chat",
  "user_id": "user_1708020600000_a1b2c3",
  "message": "Bagaimana cara berwudhu?"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": { "response": "Wudhu menurut Islam adalah... [AI response]" },
  "message": "Sukses"
}
```

**Error Response - Daily Limit:**
```json
{
  "success": false,
  "data": null,
  "message": "Batas harian tercapai. Coba lagi besok."
}
```

**Features:**
- Last 5 messages included as context
- Top 5 relevant dalil references included
- Anti-hallucination system prompt
- All messages saved to CHATS sheet

---

## SECURITY

- Passwords: SHA-256 hashed
- API Key: PropertiesService (not exposed)
- CORS: Enabled for cross-origin
- XSS: HTML escaping on frontend
- Validation: Backend validation required

---

## ERROR CODES

| Status | Message | Solution |
|--------|---------|----------|
| 400 | Email tidak valid | Use valid email format |
| 400 | Password minimal 6 karakter | Use longer password |
| 409 | Email sudah terdaftar | Use different email |
| 401 | Email atau password salah | Check credentials |
| 429 | Batas harian tercapai | Try again tomorrow |
| 500 | Server error | Contact admin |

---

## CURL EXAMPLES

### Register
```bash
curl -X POST https://script.google.com/macros/d/[ID]/usw \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Login
```bash
curl -X POST https://script.google.com/macros/d/[ID]/usw \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Chat
```bash
curl -X POST https://script.google.com/macros/d/[ID]/usw \
  -H "Content-Type: application/json" \
  -d '{
    "action": "chat",
    "user_id": "user_...",
    "message": "Apa itu solat?"
  }'
```

---

**Complete API Reference** ✓
