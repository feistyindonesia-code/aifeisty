# AI FEISTY - Islamic AI Chat Application

**Modern Frontend + Google Apps Script Backend + RAG System + Gemini AI**

## 🎯 Quick Start (20 minutes)

### 1. Backend Setup
```
1. Create Google Spreadsheet
2. Copy SPREADSHEET_ID from URL
3. Open Apps Script: Tools > Apps Script
4. Copy Code.gs content
5. Update SPREADSHEET_ID in line 6
6. Run: initializeSpreadsheet()
7. Get Gemini API key from https://aistudio.google.com/app/apikey (FREE!)
8. Run: setGeminiAPIKey() with your API key
9. Deploy: Deploy > New Deployment > Web app
10. Copy deployment URL
```

### 2. Frontend Setup
```
1. Update GAS_API_URL in app.js (line 3)
2. Push to GitHub
3. Enable GitHub Pages (Settings > Pages)
```

### 3. Done!
- Visit your GitHub Pages URL
- Register → Login → Chat

## 📁 File Structure

```
📁 aifeisty/
├── index.html ..................... Login/Register page
├── chat.html ...................... Chat interface
├── app.js ......................... Frontend JavaScript
├── style.css ...................... Custom styling
├── Code.gs ........................ Backend (Google Apps Script)
├── HelperFunctions.gs ............. Helper functions
├── 404.html ....................... GitHub Pages routing
├── .gitignore ..................... Security
└── README.md ...................... This file
```

## ✨ Features

✅ **Authentication**
- Register with email/password
- Login with verification
- Session management via localStorage

✅ **Chat**
- Real-time AI responses
- Message history (last 5 messages)
- Auto-scroll to latest message

✅ **Security**
- SHA-256 password hashing
- API key in PropertiesService (secure)
- CORS headers
- XSS prevention

✅ **Islamic AI**
- RAG system (search relevant dalil)
- Anti-hallucination system prompt
- Daily limit (10 messages/day free)
- References from Quran & Hadith

✅ **UX/Design**
- Modern minimalist interface (ChatGPT-style)
- Mobile responsive
- Smooth animations
- Error handling

## 🗂️ How to Upload to GitHub

### Option 1: Web Upload (Simple)
1. Go to https://github.com/feistyindonesia-code/aifeisty
2. Click "Add file" > "Upload files"
3. Drag & drop all project files
4. Commit

### Option 2: Git Command
```powershell
cd e:\FeistyAI
rm -r .git
git init
git add .
git commit -m "Initial commit: AI Feisty"
git branch -M main
git remote add origin https://[TOKEN]@github.com/feistyindonesia-code/aifeisty.git
git push -u origin main
```

## 🔐 Setup Security Notes

- Do NOT hardcode API keys in code
- Store API key in Google Apps Script PropertiesService
- Always use HTTPS in production
- Enable GitHub Pages HTTPS

## 📚 Documentation

- **BACKEND_SETUP.md** - Step-by-step backend guide
- **API_REFERENCE.md** - Complete API documentation

## 🚀 Deploy & Enable GitHub Pages

1. Push code to GitHub
2. Go to Settings > Pages
3. Select "main" branch
4. Your site is live at:
   `https://[username].github.io/aifeisty/`

## 🛠️ Technologies

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: Google Apps Script, Google Sheets
- **AI**: Google Gemini AI (gemini-2.0-flash) - FREE tier available!
- **Hosting**: GitHub Pages (frontend), Google Apps Script (backend)

## 📊 Spreadsheet Structure

### Sheet: USERS
- user_id, email, password_hash, role, daily_count, last_reset

### Sheet: CHATS  
- user_id, role, message, timestamp

### Sheet: DALIL
- id, sumber, referensi, teks, kata_kunci

## 🎓 Setup Costs

- **Frontend**: FREE (GitHub Pages)
- **Backend**: FREE (Google Apps Script)
- **Database**: FREE (Google Sheets)
- **AI API**: FREE! (Gemini has generous free tier)
- **Custom Domain**: Optional ($12/year)

Total: **100% FREE** with Gemini!

## ❓ Need Help?

Check documentation files included in repo.

---

**Status**: ✅ Production Ready  
**Version**: 2.0 (Gemini AI)  
**License**: MIT
