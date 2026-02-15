# AI FEISTY - BACKEND SETUP GUIDE

Google Apps Script Backend untuk AI Islami dengan RAG dan Daily Limit

## 📋 Struktur Spreadsheet

### Sheet: USERS
```
| user_id | email | password_hash | role | daily_count | last_reset |
|---------|-------|---------------|------|-------------|------------|
| user_123... | user@email.com | [SHA256_HASH] | free | 5 | 2026-02-15 |
```

**Penjelasan:**
- `user_id`: ID unik (generated otomatis)
- `email`: Email user (unik)
- `password_hash`: SHA-256 hash dari password
- `role`: "free" atau "premium" (untuk future expansion)
- `daily_count`: Jumlah chat hari ini (reset otomatis setiap hari baru)
- `last_reset`: Tanggal terakhir reset (format: YYYY-MM-DD)

### Sheet: CHATS
```
| user_id | role | message | timestamp |
|---------|------|---------|-----------|
| user_123... | user | Apa itu wudhu? | 2026-02-15T10:30:00Z |
| user_123... | assistant | Wudhu adalah... | 2026-02-15T10:30:15Z |
```

**Penjelasan:**
- `user_id`: ID user yang chat
- `role`: "user" atau "assistant"
- `message`: Konten pesan
- `timestamp`: ISO format timestamp

### Sheet: DALIL
```
| id | sumber | referensi | teks | kata_kunci |
|----|--------|-----------|------|------------|
| 1 | Alquran | Al-Baqarah: 183 | Walakum fi as-siyami... | puasa, ibadah, kesehatan |
| 2 | Hadis Riwayat Bukhari | Shahih Bukhari 1 | Innamal a'malu bi-niyyah | niat, amal, ibadah |
```

**Penjelasan:**
- `id`: ID unik referensi
- `sumber`: Sumber (Alquran, Hadis, Tafsir, dll)
- `referensi`: Ayat/Hadis yang dikutip
- `teks`: Teks lengkap dalil
- `kata_kunci`: Keywords untuk search (dipisah dengan koma)

## 🚀 STEP-BY-STEP SETUP

### Step 1: Buat Google Spreadsheet

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru
3. Salin **Spreadsheet ID** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### Step 2: Setup Google Apps Script

1. Di spreadsheet, buka **Tools → Apps Script**
2. Buat project baru akan terbuka
3. Hapus code template yang ada
4. Copy-paste seluruh code dari `Code.gs`
5. Ganti `YOUR_SPREADSHEET_ID` dengan ID spreadsheet Anda:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
   ```

### Step 3: Inisialisasi Spreadsheet

1. Di Apps Script, jalankan function `initializeSpreadsheet()`:
   - Klik tombol ▶️ (Run)
   - Pilih function: `initializeSpreadsheet`
   - Tunggu selesai (akan membuat 3 sheets otomatis)

2. Refresh spreadsheet Anda - sekarang sudah ada sheets: USERS, CHATS, DALIL

### Step 4: Setup AI API

#### Opsi A: Gunakan OpenAI

1. Buka [OpenAI Platform](https://platform.openai.com)
2. Buat API key baru
3. Di Apps Script, jalankan function `setAPIKey()`:
   - Ubah `YOUR_API_KEY` dengan API key OpenAI Anda
   - Klik ▶️ (Run)

#### Opsi B: Gunakan Provider Lain

Modifikasi `callAIAPI()` function untuk provider Anda (Claude, Gemini, dll)

### Step 5: Deploy sebagai Web App

1. Di Apps Script, klik **Deploy → New Deployment**
2. Pilih type: **Web app**
3. Konfigurasi:
   - Execute as: Akun Google Anda
   - Who has access: **Anyone**
4. Klik **Deploy**
5. Salin URL deployment - ini adalah `GAS_API_URL` Anda

**Contoh URL:**
```
https://script.google.com/macros/d/YOUR_SCRIPT_ID/usw
```

5. Update di frontend `js/app.js`:
   ```javascript
   const GAS_API_URL = 'YOUR_GAS_DEPLOYMENT_URL';
   ```

## 🔐 KEAMANAN

### API Key Management
- **Jangan** simpan API key di Code.gs
- Gunakan `PropertiesService` untuk store API key
- Function `setAPIKey()` untuk setup

### Password Security
- Semua password di-hash dengan SHA-256
- Password asli tidak pernah disimpan
- Validasi dilakukan pada server

### CORS Headers
- Semua response include CORS headers
- Mendukung cross-origin requests
- Function `doOptions()` handle preflight requests

## 📊 FITUR DETAIL

### 1. Registration
```
POST request:
{
  "action": "register",
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": { "user_id": "user_123..." },
  "message": "Registrasi berhasil"
}
```

- Validasi email format
- Password minimal 6 karakter
- Email must be unique
- Auto-generate unique user_id

### 2. Login
```
POST request:
{
  "action": "login",
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": { "user_id": "user_123..." },
  "message": "Login berhasil"
}
```

- Verifikasi email & password
- Return user_id untuk session

### 3. Chat dengan RAG
```
POST request:
{
  "action": "chat",
  "user_id": "user_123...",
  "message": "Bagaimana cara berwudhu?"
}

Response:
{
  "success": true,
  "data": { "response": "Wudhu adalah..." },
  "message": "Sukses"
}
```

**Process:**
1. Validasi user_id
2. Reset daily_count jika hari baru
3. Cek daily limit (10 pesan/hari untuk free user)
4. Increment daily_count
5. Ambil 5 chat terakhir
6. Search dalil relevan from DALIL sheet
7. Build conversation dengan system prompt
8. Call AI API
9. Save ke CHATS sheet
10. Return response

### 4. Daily Limit
- **Free users**: 10 chat per hari
- Reset otomatis tengah malam (UTC)
- Counter di kolom `daily_count`
- Last reset date di `last_reset`

### 5. RAG (Retrieval Augmented Generation)
- Search keywords di DALIL sheet
- Match dari kolom `kata_kunci` dan `teks`
- Return top 5 referensi terbaik
- Include dalam system prompt

### 6. Anti-Hallucination
System prompt include:
- HANYA jawab dari referensi yang diberikan
- JANGAN membuat ayat/hadis baru
- Jika referensi tidak cukup → katakan jelas
- JANGAN keluarkan fatwa final
- Arahkan ke ulama untuk kasus sensitif
- Jelaskan perbedaan mazhab dengan netral

## 🧪 TESTING

### Test di Apps Script Editor

```javascript
// Test Register
testRegister();

// Test Login
testLogin();

// View logs
// Klik View → Logs
```

### Test dengan Frontend

1. Update `GAS_API_URL` di `js/app.js`
2. Buka `http://localhost:8000` (local server)
3. Test registration
4. Test login
5. Test chat

### Test dengan Postman

```
POST: [YOUR_GAS_URL]
Headers: Content-Type: application/json

Body:
{
  "action": "register",
  "email": "test@test.com",
  "password": "test123"
}
```

## 🛠️ TROUBLESHOOTING

### Error: "SPREADSHEET_ID tidak valid"
- Update SPREADSHEET_ID di line 5 Code.gs
- Pastikan spreadsheet ID benar dari URL

### Error: "API key tidak dikonfigurasi"
- Jalankan function `setAPIKey()`
- Pastikan API key OpenAI valid

### Error: CORS issue
- Backend sudah include CORS headers
- Pastikan frontend mengirim JSON

### Chat tidak menyimpan di history
- Check CHATS sheet - ada 4 kolom?
- Jalankan `initializeSpreadsheet()` lagi

### Daily limit tidak reset
- Check `last_reset` di USERS sheet
- System auto-reset saat hari baru

## 📈 MAINTENANCE

### Monitor penggunaan
- Buka CHATS sheet
- Review conversation logs
- Monitor daily_count per user

### Update DALIL references
- Tambah row baru ke DALIL sheet
- Format: id, sumber, referensi, teks, kata_kunci
- Otomatis di-index untuk search

### Backup
- Download spreadsheet secara berkala
- Export sebagai CSV untuk arsip

## 🎯 NEXT STEPS

1. ✅ Copy Code.gs ke Apps Script
2. ✅ Setup SPREADSHEET_ID
3. ✅ Jalankan initializeSpreadsheet()
4. ✅ Setup AI API key
5. ✅ Deploy sebagai Web App
6. ✅ Dapatkan Web App URL
7. ✅ Update frontend GAS_API_URL
8. ✅ Test lengkap
9. ✅ Deploy frontend ke GitHub Pages
10. ✅ Production monitoring

## 🔗 RESOURCES

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Spreadsheet API Reference](https://developers.google.com/sheets/api)

---

**Created for AI Feisty - Islamic AI Assistant**
