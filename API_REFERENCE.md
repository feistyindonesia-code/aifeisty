# API REFERENCE - AI FEISTY BACKEND

Complete API documentation for Google Apps Script backend.

## 🔌 Base URL

```
https://script.google.com/macros/d/YOUR_SCRIPT_ID/usw
```

All requests are POST with `Content-Type: application/json`

---

## 📝 ENDPOINTS

### 1. REGISTER - Create New Account

**Request:**
```json
{
  "action": "register",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "user_id": "user_1708020600000_a1b2c3"
  },
  "message": "Registrasi berhasil"
}
```

**Response Error (200):**
```json
{
  "success": false,
  "data": null,
  "message": "Email sudah terdaftar"
}
```

**Validation Rules:**
- Email: Must be valid format (xxx@xxx.xxx)
- Email: Must be unique (not already registered)
- Password: Minimum 6 characters
- Both fields required

**Possible Errors:**
- "Email dan password harus diisi"
- "Password minimal 6 karakter"
- "Format email tidak valid"
- "Email sudah terdaftar"

**Backend Process:**
1. Validate email & password
2. Check if email already exists
3. Hash password with SHA-256
4. Generate unique user_id
5. Insert to USERS sheet
6. Return user_id to client
7. Save to localStorage (frontend)

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

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "user_id": "user_1708020600000_a1b2c3"
  },
  "message": "Login berhasil"
}
```

**Response Error (200):**
```json
{
  "success": false,
  "data": null,
  "message": "Email atau password salah"
}
```

**Validation Rules:**
- Email: Must exist in database
- Password: Must match stored hash
- Both fields required

**Possible Errors:**
- "Email dan password harus diisi"
- "Email atau password salah"

**Backend Process:**
1. Find user by email (case-insensitive)
2. Hash provided password
3. Compare with stored hash
4. If match, return user_id
5. If no match, return error

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

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "response": "Wudhu menurut Islam adalah... [AI response dengan referensi dalil]"
  },
  "message": "Sukses"
}
```

**Response Error - Daily Limit (200):**
```json
{
  "success": false,
  "data": null,
  "message": "Batas harian tercapai. Coba lagi besok."
}
```

**Response Error - Invalid Input (200):**
```json
{
  "success": false,
  "data": null,
  "message": "user_id dan message harus diisi"
}
```

**Validation Rules:**
- user_id: Must exist in database
- message: Required, max 2000 characters
- Daily limit: 10 messages/day for free users

**Possible Errors:**
- "user_id dan message harus diisi"
- "Pesan terlalu panjang (max 2000 karakter)"
- "User tidak ditemukan"
- "Batas harian tercapai. Coba lagi besok."
- "Gagal mendapat respons dari AI: [error]"

**Backend Process:**
1. Validate user_id exists
2. Check/reset daily count (if new day)
3. Check daily limit:
   - Role free: max 10/day
   - Increment count
4. Fetch last 5 messages from CHATS sheet
5. Search relevant dalil from DALIL sheet (keyword matching)
6. Build system prompt with:
   - Anti-hallucination instructions
   - Relevant dalil references
   - Context from chat history
7. Call OpenAI API
8. Parse and return AI response
9. Save both messages (user + assistant) to CHATS sheet
10. Return response to client

**Daily Limit Details:**
- Free users: 10 messages/day
- Counter resets at midnight UTC (stored in last_reset)
- Column updates:
  - daily_count: incremented per message
  - last_reset: updated when day changes

**Chat History:**
- Last 5 messages included in context
- Helps AI maintain conversation flow
- All messages logged to CHATS sheet with timestamp

**RAG (Retrieval Augmented Generation):**
- Search DALIL sheet with message keywords
- Top 5 most relevant results returned
- Each result includes: sumber, referensi, teks, score
- Prevents AI hallucination with actual references

---

## 🔐 AUTHENTICATION

### Session Management

No session tokens. Uses user_id:

1. **Registration:** Backend generates unique user_id
2. **Login:** User provides credentials, gets user_id
3. **Storage:** Frontend stores user_id in localStorage
4. **Chat:** Frontend sends user_id with each message

### Security Considerations

- user_id is public (generated randomly, not predictable)
- Not a security token (don't use alone for production)
- For production: Add JWT tokens or session management
- Password always hashed before storage
- API key never exposed to frontend

---

## 📊 SPREADSHEET DATA STRUCTURE

### Sheet: USERS
```
Row 1: Headers
[user_id] [email] [password_hash] [role] [daily_count] [last_reset]

Example:
user_1708020600000_a1b2c3 | test@example.com | [SHA256_HASH] | free | 5 | 2026-02-15
```

### Sheet: CHATS
```
Row 1: Headers
[user_id] [role] [message] [timestamp]

Example:
user_1708020600000_a1b2c3 | user | Apa itu wudhu? | 2026-02-15T10:30:00Z
user_1708020600000_a1b2c3 | assistant | Wudhu adalah... | 2026-02-15T10:30:15Z
```

### Sheet: DALIL
```
Row 1: Headers
[id] [sumber] [referensi] [teks] [kata_kunci]

Example:
1 | Alquran | Al-Maidah: 6 | Ya ayyuha alladhina... | wudhu, solat, kebersihan
```

---

## 🤖 AI INTEGRATION

### System Prompt Template

```
Kamu adalah Asisten Islami (AI Feisty) yang berbasis pada dalil Alquran dan Hadis.

INSTRUKSI PENTING:
1. Jawab HANYA berdasarkan referensi dalil yang diberikan.
2. JANGAN membuat ayat atau hadis baru.
3. Jika referensi tidak cukup, katakan: "Saya tidak memiliki dalil yang cukup"
4. JANGAN mengeluarkan fatwa final.
5. Untuk kasus sensitif, arahkan konsultasi ke ulama.

[RELEVANT DALIL WILL BE INSERTED HERE]

KONTEKS PERCAKAPAN:
[CHAT HISTORY WILL BE INSERTED HERE]
```

### API Provider Configuration

**OpenAI:**
```javascript
Model: gpt-4o-mini
Temperature: 0.7
Max tokens: 1500
Top P: 0.95
```

Modify in `callAIAPI()` function for other providers.

---

## 📈 RATE LIMITING & QUOTAS

### Daily Limits
- Free users: 10 messages/day
- Resets at midnight UTC
- Stored in daily_count column

### Google Apps Script Quotas
- 30 second execution timeout
- 1M cells read/write per day
- 200MB file size limit
- Check quotas dashboard in Apps Script

### OpenAI API Quotas
- Check at platform.openai.com/account/billing
- Set spending limits to prevent overages
- Monitor usage regularly

---

## 🛠️ HELPER FUNCTIONS

### Public Functions

| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `doPost(e)` | Main handler | payload | JSON response |
| `handleRegister(payload)` | Register user | {email, password} | JSON |
| `handleLogin(payload)` | Login user | {email, password} | JSON with user_id |
| `handleChat(payload)` | Chat handler | {user_id, message} | JSON with response |

### Internal Functions

| Function | Purpose |
|----------|---------|
| `getUser(email)` | Find user by email |
| `getUserById(userId)` | Find user by ID |
| `getLastMessages(userId, limit)` | Get chat history |
| `searchDalil(query)` | Search relevant references |
| `callAIAPI(messages)` | Call AI service |
| `saveChatMessage(userId, role, message)` | Save to CHATS sheet |
| `hashPassword(password)` | SHA-256 hash |
| `generateUserId()` | Create unique ID |
| `JsonResponse(success, data, message)` | Format response |

---

## 🔧 SETUP FUNCTIONS

These functions must be run manually in Apps Script console:

```javascript
// 1. Initialize database
initializeSpreadsheet()

// 2. Set API key
setAPIKey()

// 3. Import sample dalil data
importSampleDaulData()

// 4. Setup triggers (optional)
setupTriggers()
```

---

## 🧪 TESTING

### cURL Example

```bash
# Register
curl -X POST https://script.google.com/macros/d/YOUR_ID/usw \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST https://script.google.com/macros/d/YOUR_ID/usw \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "email": "test@example.com",
    "password": "password123"
  }'

# Chat
curl -X POST https://script.google.com/macros/d/YOUR_ID/usw \
  -H "Content-Type: application/json" \
  -d '{
    "action": "chat",
    "user_id": "user_...",
    "message": "Apa itu wudhu?"
  }'
```

### JavaScript Fetch Example

```javascript
async function testAPI(action, payload) {
  const response = await fetch('https://script.google.com/macros/d/YOUR_ID/usw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload })
  });
  return response.json();
}

// Usage
testAPI('register', { email: 'test@test.com', password: 'test123' });
testAPI('login', { email: 'test@test.com', password: 'test123' });
testAPI('chat', { user_id: 'user_...', message: 'Hello' });
```

---

## 📝 RESPONSE FORMATS

### Success Response
```json
{
  "success": true,
  "data": { /* variable data */ },
  "message": "Deskripsi singkat"
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "message": "Error description"
}
```

### HTTP Status
- All responses return HTTP 200
- Check `success` field to determine actual status
- Errors included in message field

---

## 🚀 DEPLOYMENT

### Generate Web App URL

1. Apps Script → Deploy → New Deployment
2. Type: Web app
3. Execute as: Your account
4. Access: Anyone
5. Deploy → Copy URL

### Update in Frontend

```javascript
// js/app.js
const GAS_API_URL = 'https://script.google.com/macros/d/YOUR_SCRIPT_ID/usw';
```

### CORS Headers

Backend automatically includes:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## 📊 ANALYTICS

View usage stats:

```javascript
// In Apps Script console
const stats = getUserStats('user_id');
console.log(stats);
// Output: { userId, email, role, dailyCount, totalChats, joined }
```

Daily report:
```javascript
dailyUsageReport();
// Returns: total users, active today, chat requests, average usage
```

---

## 🔒 SECURITY BEST PRACTICES

1. **Never expose API key**
   - Store in PropertiesService
   - Access only in backend

2. **Hash all passwords**
   - SHA-256 algorithm
   - Never store plaintext

3. **Validate all input**
   - Email format
   - Message length
   - user_id existence

4. **Rate limiting**
   - Daily limit per user
   - Prevent abuse

5. **Audit logs**
   - All actions logged to CHATS
   - Monitor suspicious activity

6. **HTTPS only**
   - Gmail/Apps Script enforces
   - Use HTTPS in production

---

**Last Updated:** 2026-02-15
**Version:** 1.0
**Status:** Production Ready
