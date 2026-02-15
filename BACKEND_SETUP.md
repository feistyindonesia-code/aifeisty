# BACKEND GOOGLE APPS SCRIPT - Setup Guide

## 🚀 Step-by-Step Setup (15 minutes)

### Step 1: Create Google Spreadsheet
1. Open [sheets.google.com](https://sheets.google.com)
2. Create new spreadsheet
3. Find SPREADSHEET_ID in URL:
   ```
   https://docs.google.com/spreadsheets/d/[ID_HERE]/edit
   ```

### Step 2: Create Google Apps Script Project
1. In spreadsheet: **Tools → Apps Script**
2. Delete template code
3. Copy entire **Code.gs** file (paste in editor)
4. Find line 5 and update:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
   // Replace with your ID from Step 1
   ```

### Step 3: Initialize Database
1. Click **Run** button (▶️)
2. Select function: `initializeSpreadsheet`
3. Click **Run**
4. Check **Logs** (View → Logs) for success ✓

This creates 3 sheets automatically:
- **USERS** - User accounts
- **CHATS** - Chat history
- **DALIL** - Islamic references

### Step 4: Setup OpenAI API
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account if needed
3. API keys → Create new key
4. Copy the key (don't lose it!)

In Apps Script:
1. Find function `setAPIKey()`
2. Replace `'YOUR_API_KEY'` with your actual key
3. Click **Run**

### Step 5: Deploy as Web App
1. **Deploy** → **New Deployment**
2. Select type: **Web app**
3. Execute as: Your Google Account
4. Who has access: **Anyone**
5. Click **Deploy**
6. Copy the URL (your GAS_API_URL)

### Step 6: Update Frontend
In **app.js**, line 2:
```javascript
const GAS_API_URL = 'YOUR_DEPLOYMENT_URL_HERE';
```

Replace with actual URL from Step 5.

---

## 📊 Spreadsheet Structure

### USERS Sheet
```
| user_id | email | password_hash | role | daily_count | last_reset |
```
- Stores user accounts
- password_hash: SHA-256 encrypted
- daily_count: Resets each day
- role: "free" or "premium"

### CHATS Sheet
```
| user_id | role | message | timestamp |
```
- All chat messages logged here
- role: "user" or "assistant"
- Used for chat history retrieval
- Helps AI maintain context

### DALIL Sheet
```
| id | sumber | referensi | teks | kata_kunci |
```
- Islamic references database
- sumber: Source (Alquran, Hadis, Tafsir)
- referensi: Specific verse/hadith
- teks: Full text
- kata_kunci: Keywords for search (comma separated)

---

## 🔧 Configuration

### In Code.gs:
```javascript
Line 5:  SPREADSHEET_ID = 'YOUR_ID'
Line 8:  AI_API_URL = 'https://api.openai.com/v1/chat/completions'
Line 17: DAILY_LIMIT_FREE = 10 (messages/day)
Line 18: CHAT_HISTORY_LIMIT = 5 (messages to include)
```

### In setAPIKey():
```javascript
Replace 'YOUR_API_KEY' with actual OpenAI API key
```

---

## 📈 Features

✅ **User Management**
- Register new users
- SHA-256 password hashing
- Daily message counter
- Auto-reset at midnight

✅ **Chat System**
- Send/receive messages
- Last 5 messages context
- Real-time AI responses
- Error handling & logging

✅ **RAG (Retrieval Augmented Generation)**
- Search DALIL sheet for relevant references
- Keyword matching algorithm
- Top 5 results included in prompt
- Prevents AI hallucination

✅ **Anti-Hallucination**
- Strict system prompt
- Only answer from provided references
- Tell user when no dalil available
- Refuse to create fake hadith

✅ **CORS Headers**
- Supports GitHub Pages frontend
- Allows cross-origin requests
- Preflight response headers

---

## 🧪 Testing

### Test Register
```javascript
testRegister();
// Check Logs for output
```

### Test Login
```javascript
testLogin();
// Check Logs for output
```

### Add Sample Data
```javascript
importSampleDaulData();
// Adds 5 sample Islamic references
```

### View Daily Report
```javascript
dailyUsageReport();
// Shows usage statistics
```

---

## 🐛 Common Issues

### "Spreadsheet not found"
- Check SPREADSHEET_ID is correct
- Paste ID from URL, not full URL

### "API key error"
- Run `setAPIKey()` function
- Use actual OpenAI API key
- Check key has API access

### "CORS error" in browser
- Re-deploy Web App (Deploy menu)
- Check "Who has access" is "Anyone"
- Clear browser cache

### "Daily limit not working"
- Check USERS sheet has columns
- Verify `last_reset` column exists
- Run `initializeSpreadsheet()` again

---

## 🔐 Security Best Practices

1. **API Key**: Store in PropertiesService, never in code
2. **Password**: Always hash before storing
3. **CORS**: Allow production domain only
4. **Validation**: Validate all inputs on backend
5. **Logging**: Log suspicious activities
6. **HTTPS**: Enforce in production

---

## 📊 Database Schema Details

### USERS Table
```
Row 1: Headers
Row 2+: User data

Column A: user_id (unique) → Format: user_TIMESTAMP_RANDOM
Column B: email (unique) → Format: name@domain.com
Column C: password_hash → SHA-256 + Base64
Column D: role → "free" or "premium"
Column E: daily_count → Integer (0-10 for free)
Column F: last_reset → Date format YYYY-MM-DD
```

### CHATS Table
```
Row 1: Headers
Row 2+: Chat messages

Column A: user_id → Reference to USERS.user_id
Column B: role → "user" or "assistant"
Column C: message → Text content
Column D: timestamp → ISO format (2026-02-15T10:30:00Z)
```

### DALIL Table
```
Row 1: Headers
Row 2+: Islamic references

Column A: id → Unique identifier (1, 2, 3...)
Column B: sumber → Source name (Alquran, Hadis, Tafsir)
Column C: referensi → Citation (Al-Baqarah: 183, Shahih Bukhari 1)
Column D: teks → Full text of verse/hadith
Column E: kata_kunci → Keywords comma-separated
```

---

## 🚀 Deployment Checklist

- [ ] Google Spreadsheet created
- [ ] SPREADSHEET_ID added to Code.gs
- [ ] Apps Script project created
- [ ] Code.gs copied
- [ ] initializeSpreadsheet() executed
- [ ] 3 sheets created (USERS, CHATS, DALIL)
- [ ] OpenAI API key obtained
- [ ] setAPIKey() executed
- [ ] Code.gs deployed as Web App
- [ ] Deployment URL copied
- [ ] GAS_API_URL updated in app.js
- [ ] Frontend pushed to GitHub
- [ ] GitHub Pages enabled
- [ ] Test: Register → Login → Chat

---

## 📞 Support

- **Apps Script Docs**: https://developers.google.com/apps-script
- **Sheets API**: https://developers.google.com/sheets/api
- **OpenAI API**: https://platform.openai.com/docs

---

**Setup Complete!** 🎉

Your AI Feisty backend is ready to handle requests.
