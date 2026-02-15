# DEPLOYMENT CHECKLIST & TROUBLESHOOTING

## 🚀 PRE-DEPLOYMENT CHECKLIST

### Backend (Google Apps Script)

- [ ] Google Spreadsheet dibuat
- [ ] Spreadsheet ID dikopi dan di-update di `Code.gs` line 5
- [ ] Apps Script project dibuat di spreadsheet
- [ ] `Code.gs` di-copy ke Apps Script
- [ ] `initializeSpreadsheet()` function dijalankan
- [ ] Sheets USERS, CHATS, DALIL terbuat dengan benar
- [ ] OpenAI API key didapat dan disimpan
- [ ] `setAPIKey()` dijalankan dan API key tersimpan
- [ ] Google Apps Script di-deploy sebagai Web App
- [ ] Deployment URL dikopi (format: `https://script.google.com/macros/d/...`)
- [ ] Deployment URL di-test dengan Postman
- [ ] CORS headers terlihat di response

### Frontend

- [ ] `js/app.js` GAS_API_URL sudah di-update dengan deployment URL
- [ ] Repo GitHub sudah dibuat
- [ ] GitHub Pages sudah enabled (Settings > Pages > main branch)
- [ ] Frontend berhasil diakses via GitHub Pages URL
- [ ] Login page bisa diakses
- [ ] Chat page bisa diakses

### Integration Testing

- [ ] Test register via frontend → berhasil
- [ ] Email user tersimpan di USERS sheet
- [ ] Password ter-hash di database
- [ ] Test login via frontend → berhasil
- [ ] Test send message → berhasil
- [ ] AI response muncul
- [ ] Chat history tersimpan di CHATS sheet
- [ ] Search dalil berfungsi
- [ ] Daily limit berfungsi
- [ ] Error handling berfungsi

---

## 🔧 TROUBLESHOOTING GUIDE

### ❌ ERROR: "Spreadsheet not found" atau "Cannot read property '0' of undefined"

**Penyebab:**
- SPREADSHEET_ID tidak valid
- Spreadsheet sudah dihapus
- Akses terbatas

**Solusi:**
```javascript
// Di Code.gs line 5, pastikan benar
const SPREADSHEET_ID = '1a2b3c4d5e6f7g8h9i0j'; // Copy dari URL
```

Verify di URL:
```
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
```

---

### ❌ ERROR: "API key tidak dikonfigurasi"

**Penyebab:**
- `setAPIKey()` belum dijalankan
- API key salah atau expired

**Solusi:**

1. Di Apps Script, buka function `setAPIKey()`
2. Ganti `YOUR_API_KEY` dengan key OpenAI Anda
3. Jalankan function (klik ▶️)
4. Cek Logs (View → Logs)

Verify API key di [OpenAI Platform](https://platform.openai.com/api-keys)

---

### ❌ ERROR: "No CORS header" di browser console

**Penyebab:**
- Web App belum di-deploy dengan benar
- Deployment URL salah

**Solusi:**

Re-deploy sebagai Web App:
1. Apps Script → Deploy → Manage Deployments
2. Jika ada versi lama, delete
3. New Deployment → Web app
4. Pilih user Anda
5. Who has access: **Anyone**
6. Deploy

---

### ❌ ERROR: "Invalid JSON" atau "Cannot parse payload"

**Penyebab:**
- Frontend mengirim JSON tidak valid
- Content-Type header bukan JSON

**Solusi:**

Di `js/app.js`, pastikan:
```javascript
const response = await fetch(GAS_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'login',
    email: email,
    password: password
  })
});
```

---

### ❌ ERROR: "User tidak ditemukan" saat login

**Penyebab:**
- Email case sensitivity
- Password tidak sesuai
- User belum registrasi

**Solusi:**

1. Check USERS sheet - user sudah ada?
2. Di `getUser()`, email sudah di-lowercase:
   ```javascript
   if (data[i][1]?.toLowerCase() === email.toLowerCase())
   ```
3. Test manual:
   - Register: test@test.com / password123
   - Login: TEST@TEST.COM / password123 (harus berhasil)

---

### ❌ ERROR: "Sheet belum ada" atau "sendChatMessage failed"

**Penyebab:**
- `initializeSpreadsheet()` belum dijalankan
- Sheets tidak dengan nama yang benar

**Solusi:**

1. Jalankan `initializeSpreadsheet()`
2. Check di Spreadsheet:
   - Ada sheet "USERS"?
   - Ada sheet "CHATS"?
   - Ada sheet "DALIL"?
3. Jika tidak, buat manual:
   - Sheet USERS → Headers: user_id, email, password_hash, role, daily_count, last_reset
   - Sheet CHATS → Headers: user_id, role, message, timestamp
   - Sheet DALIL → Headers: id, sumber, referensi, teks, kata_kunci

---

### ❌ ERROR: "Daily limit reached" tapi masih early morning

**Penyebab:**
- `daily_count` tidak di-reset
- `last_reset` tidak update

**Solusi:**

Manual reset:
1. Buka USERS sheet
2. Column F (daily_count) ubah ke 0
3. Column G (last_reset) ubah ke hari ini (YYYY-MM-DD)

Atau jalankan:
```javascript
// Di Apps Script console
resetDailyCountIfNeeded(getUserById('user_id_anda'));
```

---

### ❌ ERROR: "AI API error" atau response kosong

**Penyebab:**
- OpenAI API limit tercapai
- API key invalid
- Model tidak tersedia

**Solusi:**

Check OpenAI Dashboard:
1. Buka [platform.openai.com](https://platform.openai.com/account/billing/overview)
2. Pastikan credit ada
3. Check API key masih valid
4. Check model: `gpt-4o-mini` available?

Test API manual:
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hi"}]
  }'
```

---

### ❌ ERROR: Chat tidak tersimpan di CHATS sheet

**Penyebab:**
- `saveChatMessage()` gagal
- CHATS sheet columns tidak sesuai

**Solusi:**

Check CHATS sheet:
- Column A: user_id
- Column B: role
- Column C: message
- Column D: timestamp

Test manual:
```javascript
// Di console
saveChatMessage('test_user', 'user', 'Hello');
// Check CHATS sheet - ada row baru?
```

---

### ❌ ERROR: Search dalil tidak menemukan apa-apa

**Penyebab:**
- DALIL sheet kosong
- Keyword tidak cocok
- Format tidak sesuai

**Solusi:**

1. Jalankan `importSampleDaulData()`
2. Check DALIL sheet - ada data?
3. Test search:
   ```javascript
   testSearch(); // Di console
   ```

4. Tambah keyword relevan di DALIL sheet:
   - Column E: kata_kunci (pisahkan dengan koma)
   - Contoh: "puasa, ibadah, kesehatan, ramadan"

---

### ❌ ERROR: 404 page sudah dibuat tapi pindah ke home page

**Penyebab:**
- GitHub Pages cache
- 404.html tidak terbaca

**Solusi:**

1. Push lagi dengan force:
   ```bash
   git add .
   git commit -m "Fix 404"
   git push origin main --force
   ```

2. Clear cache browser (Ctrl+F5)

3. Tunggu 5 menit untuk GitHub Pages update

---

### ⚠️ WARNING: Response slow atau timeout

**Penyebab:**
- Google Apps Script cold start
- DALIL sheet terlalu besar
- Search query terlalu kompleks

**Solusi:**

Optimasi:
1. Reduce DALIL sheet size (maksimal 1000 rows)
2. Add indexing di keyword kolom
3. Cache search results
4. Use PropertiesService untuk caching

---

## 🧪 TESTING COMMANDS

### Test di Google Apps Script Console

```javascript
// 1. View logs
// Shortcut: Ctrl+Enter atau View > Logs

// 2. Test register
testRegister();

// 3. Test login
testLogin();

// 4. View all users
viewAllUsers();

// 5. Test search
testSearch();

// 6. Check stats
const stats = getUserStats('user_id_anda');
Logger.log(JSON.stringify(stats));

// 7. Export data
const data = exportToJSON();
```

### Test dengan Postman

```
POST: https://script.google.com/macros/d/[YOUR_SCRIPT_ID]/usw

1. Register:
{
  "action": "register",
  "email": "test@example.com",
  "password": "password123"
}

2. Login:
{
  "action": "login",
  "email": "test@example.com",
  "password": "password123"
}

3. Chat:
{
  "action": "chat",
  "user_id": "user_123...",
  "message": "Bagaimana cara berwudhu?"
}
```

### Test di Browser Console

```javascript
// 1. Check localStorage
localStorage.getItem('user_id');

// 2. Check chat history
localStorage.getItem('chatHistory');

// 3. Manual fetch
fetch('https://script.google.com/macros/d/.../usw', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'login',
    email: 'test@example.com',
    password: 'password123'
  })
}).then(r => r.json()).then(d => console.log(d));
```

---

## 📊 PERFORMANCE MONITORING

### Check execution time

```javascript
function monitorPerformance() {
  const startTime = new Date();
  
  // Code to monitor
  const results = searchDalil('puasa');
  
  const endTime = new Date();
  const duration = endTime - startTime;
  
  Logger.log(`Execution time: ${duration}ms`);
}
```

### View Apps Script quotas

Dashboard → Project Settings → Show "appsscript.json"

Limits:
- 30 second execution timeout
- 200MB file size
- 1M cell reads per day
- See more at [Google Apps Script Quotas](https://developers.google.com/apps-script/guides/services/quotas)

---

## 🔐 SECURITY CHECKLIST

- [ ] API key disimpan di PropertiesService (bukan di Code)
- [ ] Password di-hash sebelum disimpan
- [ ] All responses punya CORS headers
- [ ] Frontend tidak expose logic backend
- [ ] User ID session dari localStorage (bukan hardcoded)
- [ ] Daily limit terpantau per user
- [ ] Old chat history di-cleanup berkala
- [ ] Spreadsheet akses terbatas (owner only)

---

## 📞 SUPPORT & RESOURCES

Jika masih error:

1. **Check Logs**
   - Apps Script → View → Logs
   - Lihat error message yang detail

2. **Check Sheets**
   - Buka spreadsheet
   - Verify data di setiap sheet

3. **Test Endpoints**
   - Gunakan Postman
   - Test direct ke GAS URL

4. **Browser DevTools**
   - F12 → Network tab
   - F12 → Console tab
   - Lihat request/response

5. **Google Apps Script Documentation**
   - https://developers.google.com/apps-script/reference

---

## ✅ FINAL VERIFICATION

Sebelum production:

```javascript
✅ doPost(e) function berjalan
✅ Registration berhasil & data tersimpan
✅ Login berhasil & return user_id
✅ Chat API berhasil & response dari AI
✅ DALIL search berfungsi
✅ Daily limit counting
✅ Chat history tersimpan
✅ Error handling proper
✅ CORS headers present
✅ Spreadsheet structure correct
✅ Sample data ada di DALIL
```

Done! 🎉 Sekarang siap production.
