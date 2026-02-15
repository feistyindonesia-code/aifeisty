# 📁 FILES OVERVIEW - AI FEISTY PROJECT

Complete guide to every file in the project with explanations.

---

## 📂 PROJECT STRUCTURE

```
AI-Feisty/
│
├── Frontend Files
│   ├── index.html ..................... Login & Register page
│   ├── chat.html ...................... Chat interface
│   ├── 404.html ....................... GitHub Pages routing (optional)
│   ├── js/
│   │   └── app.js ..................... Vanilla JavaScript logic (★ MAIN)
│   └── css/
│       └── style.css .................. Custom CSS & animations
│
├── Backend Files (Google Apps Script)
│   ├── Code.gs ........................ Main backend logic (★ COPY THIS!)
│   └── HelperFunctions.gs ............ Helper & testing functions
│
├── Documentation
│   ├── README.md ...................... Project overview (START HERE)
│   ├── BACKEND_SETUP.md .............. Backend setup guide
│   ├── API_REFERENCE.md .............. Complete API documentation
│   ├── PROJECT_SUMMARY.md ............ Full project details
│   ├── DEPLOYMENT_TROUBLESHOOTING.md ✓ Common errors & fixes
│   ├── QUICKSTART.txt ................ 20-minute quick start
│   ├── CONFIGURATION_TRACKING.md .... Setup checklist
│   └── FILES_OVERVIEW.md ............ This file
│
├── Configuration
│   ├── .gitignore .................... Git ignore (protect secrets)
│
└── Spreadsheet (Google Sheets - Not included)
    ├── USERS sheet ................... User accounts database
    ├── CHATS sheet ................... Chat history
    └── DALIL sheet ................... Islamic references
```

---

## 📄 FRONTEND FILES

### index.html (200 lines)
**Purpose:** Login & Register page  
**Framework:** HTML5 + Tailwind CDN  
**Components:**
- Tab navigation (Login/Register)
- Email input field
- Password input field
- Login button
- Register button
- Error message display
- Professional card layout

**Key Features:**
- Responsive design
- Form validation UI
- Tab switching
- Runs app.js automatically

**When to edit:**
- Change branding/text
- Add fields
- Modify styling

---

### chat.html (150 lines)
**Purpose:** Main chat interface  
**Framework:** HTML5 + Tailwind CDN  
**Components:**
- Header (logo + logout button)
- Chat message container
- Scrollable message area
- Input textarea
- Send button
- Error message area

**Key Features:**
- Auto-scrolling chat
- Message bubbles (user right, AI left)
- Textarea auto-resize
- Keyboard shortcuts (Enter to send)
- Loading animation
- Error handling

**When to edit:**
- Change UI layout
- Add features
- Modify colors

---

### js/app.js (700+ lines) ⭐ MAIN FILE

**Purpose:** All JavaScript logic  
**Type:** Vanilla JavaScript (no frameworks)  
**Key Functions:**

**Authentication:**
- `login()` - Handle login form
- `register()` - Handle registration
- `logout()` - Clear session
- `checkAuth()` - Verify user logged in
- `hashPassword()` - Hash passwords (SHA-256)
- `validateEmail()` - Email format check

**Chat:**
- `sendMessage()` - Send chat message
- `appendMessage(role, text)` - Add bubble to chat
- `removeMessage(id)` - Delete message
- `buildConversation()` - Build conversation for API

**UI:**
- `switchTab(tab)` - Toggle login/register
- `showError()` - Display error message
- `escapeHtml()` - XSS prevention

**Utilities:**
- `showError(div, msg)` - Show error
- `validateEmail(email)` - Validate email
- `escapeHtml(text)` - Escape HTML

**API Integration:**
- Fetch to GAS backend
- Pass user_id with requests
- Handle responses
- Error handling

**Storage:**
- localStorage for user_id
- Chat state management

**When to edit:**
- Add new features
- Change API endpoints
- Modify form validation
- Adjust chat behavior

**Key Variables:**
```javascript
const GAS_API_URL = '...'; // Backend URL
const userId = localStorage.getItem('user_id');
```

---

### css/style.css (200 lines)

**Purpose:** Custom styles & animations  
**Primary Styles:**
- Loading animation (bounce dots)
- Chat bubble styling
- Form styling
- Focus states
- Mobile optimization

**Key Animations:**
- `@keyframes bounce` - Loading dots
- `@keyframes fadeInUp` - Message enter
- `@keyframes slideDown` - Error slide

**Browser Compatibility:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**When to edit:**
- Change colors
- Adjust spacing
- Add animations
- Optimize for new devices

---

### 404.html (20 lines)

**Purpose:** GitHub Pages routing helper  
**Function:** Redirect 404 errors to base URL  
**Why needed:** GitHub Pages doesn't support client-side routing  
**Auto-included:** GitHub Pages sees this file automatically  

**When to edit:**
- Never (works as-is for SPA routing)

---

## 🖥️ BACKEND FILES (Google Apps Script)

### Code.gs (700+ lines) ⭐⭐ MOST IMPORTANT

**Purpose:** Main Google Apps Script backend  
**Type:** Server-side JavaScript for Google  

**Structure:**

**Entry Points:**
```javascript
doPost(e)     → Main HTTP handler
doOptions(e)  → Handle CORS preflight
```

**Authentication Handlers:**
```javascript
handleRegister(payload)  → Register new user
handleLogin(payload)     → Login user
handleChat(payload)      → Chat handler
```

**Database Functions:**
```javascript
getUser(email)              → Find user by email
getUserById(userId)         → Find user by ID
getLastMessages(userId, n)  → Get chat history
searchDalil(query)          → Search references
saveChatMessage(...)        → Save chat
```

**AI Integration:**
```javascript
buildSystemPrompt(dalil)    → Build system prompt
buildConversation(...)      → Build messages array
callAIAPI(messages)         → Call OpenAI
```

**Security Functions:**
```javascript
hashPassword(pwd)           → SHA-256 hash
generateUserId()            → Create unique ID
validateEmail(email)        → Email validation
JsonResponse(...)           → Format JSON response
```

**Features:**
- Password hashing (SHA-256)
- Daily limit counting
- Chat history (5 messages)
- RAG search algorithm
- Anti-hallucination prompt
- OpenAI API integration
- CORS headers

**Configuration:**
```javascript
Line 5: SPREADSHEET_ID = '...'
Line 3 in setAPIKey(): API_KEY = '...'
Line 8: AI_API_URL (OpenAI)
```

**How to Use:**
1. Copy entire file
2. Paste in Apps Script editor
3. Update SPREADSHEET_ID
4. Run initializeSpreadsheet()
5. Run setAPIKey()
6. Deploy as Web App

**When to edit:**
- Change AI model
- Modify prompt
- Add new features
- Change daily limit

---

### HelperFunctions.gs (400+ lines)

**Purpose:** Utility & helper functions  
**Functions:**

**Setup:**
```javascript
initializeSpreadsheet()    → Create sheets (run once)
setAPIKey()               → Set API key (run once)
importSampleDaulData()    → Add sample data (run once)
```

**Testing:**
```javascript
testRegister()            → Test registration
testLogin()               → Test login
testSearch()              → Test RAG search
viewAllUsers()            → List all users
```

**Monitoring:**
```javascript
dailyUsageReport()        → Daily stats
getUserStats(userId)      → User metrics
cleanOldChats()           → Delete old messages
```

**Utilities:**
```javascript
sendAdminNotification()   → Email alert
exportToJSON()            → Backup data
rowsToObjects()           → Convert data format
setupTriggers()           → Setup automation
```

**When to Use:**
- Initial setup (run setup functions once)
- Testing in console
- Monitoring usage
- Data export/backup

---

## 📚 DOCUMENTATION FILES

### README.md (300+ lines) ⭐ START HERE

**What it covers:**
- Project overview
- Features list
- Technologies used
- Quick start
- Setup instructions
- Troubleshooting
- Browser support
- Customization
- License

**When to read:** First thing!

---

### BACKEND_SETUP.md (400+ lines)

**What it covers:**
- Spreadsheet structure explained
- Step-by-step setup
- Google Apps Script deployment
- API configuration
- Testing instructions
- Maintenance guide
- CORS setup

**When to read:** When setting up backend

---

### API_REFERENCE.md (500+ lines)

**What it covers:**
- All endpoints documented
- Request/response formats
- Validation rules
- Error messages
- Daily limits
- RAG system
- Helper functions
- Rate limiting
- Testing examples

**When to read:** For development/debugging

---

### PROJECT_SUMMARY.md (500+ lines)

**What it covers:**
- Full project overview
- Architecture diagram
- Request flows
- Tech stack
- Features breakdown
- File guide
- Security features
- Scaling options
- Next steps

**When to read:** For understanding project

---

### DEPLOYMENT_TROUBLESHOOTING.md (400+ lines)

**What it covers:**
- Pre-deployment checklist
- Common errors & fixes
- Testing commands
- Performance monitoring
- Security checklist
- Final verification

**When to read:** When something goes wrong

---

### QUICKSTART.txt (150 lines)

**What it covers:**
- 7-step quick start
- 20-minute timeline
- Troubleshooting tips
- Feature list
- Resource links

**When to read:** First time setup (fast version)

---

### CONFIGURATION_TRACKING.md (300+ lines)

**What it covers:**
- Config checklist
- Testing checklist
- Project phases
- Performance metrics
- Data management
- Support contacts
- Future roadmap

**When to read:** During project management

---

### FILES_OVERVIEW.md (This file)

**What it covers:**
- Every file explained
- Line counts
- Key functions
- When to edit
- Usage examples

**When to read:** For understanding file purposes

---

## ⚙️ CONFIGURATION FILES

### .gitignore (20 lines)

**Purpose:** Tell Git what files to ignore  
**Ignores:**
- Environment variables (`.env`)
- Dependencies (`node_modules/`)
- API keys
- IDE settings (`.vscode/`)
- Build files
- Logs

**Why important:** Prevents accidentally committing secrets

**When to edit:**
- Add new directories to ignore
- Add new file patterns

---

## 📊 GENERATED BY PROJECT (Not in repo)

### Google Spreadsheet (You create this)

**USERS Sheet:**
- user_id (unique)
- email (unique)
- password_hash (SHA-256)
- role (free/premium)
- daily_count (0-10)
- last_reset (date)

**CHATS Sheet:**
- user_id (references USERS)
- role (user/assistant)
- message (text)
- timestamp (ISO)

**DALIL Sheet:**
- id (unique)
- sumber (source)
- referensi (verse/hadis)
- teks (full text)
- kata_kunci (keywords)

---

## 🔄 FILE DEPENDENCIES

```
index.html
  ├─ app.js (script)
  └─ style.css (styling)
  └─ Tailwind CDN
      └─ GAS_API_URL

chat.html
  ├─ app.js (script)
  └─ style.css (styling)
  └─ Tailwind CDN
      └─ GAS_API_URL
      └─ localStorage (user_id)

app.js
  ├─ GAS_API_URL (references Code.gs endpoint)
  ├─ localStorage (USERS table)
  └─ Fetch API

Code.gs (Backend)
  ├─ SPREADSHEET_ID (Google Sheet)
  ├─ PropertiesService (API key)
  ├─ UrlFetchApp (OpenAI API)
  └─ Utilities (SHA-256 hashing)

HelperFunctions.gs (Optional)
  └─ References Code.gs functions
```

---

## 📖 READING ORDER

### For Quick Setup
1. QUICKSTART.txt (5 min)
2. Start coding

### For Full Understanding
1. README.md (overview)
2. BACKEND_SETUP.md (backend)
3. FILES_OVERVIEW.md (this file)
4. API_REFERENCE.md (API)
5. Code files themselves

### For Troubleshooting
1. DEPLOYMENT_TROUBLESHOOTING.md
2. Check specific section
3. Follow fix

---

## 💾 FILE STATISTICS

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| index.html | HTML | 200 | Login page |
| chat.html | HTML | 150 | Chat UI |
| app.js | JS | 700+ | Frontend logic |
| style.css | CSS | 200 | Styling |
| Code.gs | JS | 700+ | Backend |
| HelperFunctions.gs | JS | 400+ | Utilities |
| README.md | Doc | 300+ | Overview |
| BACKEND_SETUP.md | Doc | 400+ | Setup guide |
| API_REFERENCE.md | Doc | 500+ | API docs |
| PROJECT_SUMMARY.md | Doc | 500+ | Summary |
| DEPLOYMENT_TROUBLESHOOTING.md | Doc | 400+ | Fixes |
| QUICKSTART.txt | Doc | 150 | Quick start |
| CONFIGURATION_TRACKING.md | Doc | 300+ | Checklist |
| FILES_OVERVIEW.md | Doc | This | File guide |

**Total Lines:** ~5,500+
**Total Size:** ~200KB (without node_modules)

---

## 🎯 WHICH FILE TO EDIT FOR...

### I want to change colors
→ Edit `css/style.css` or use Tailwind classes in HTML

### I want to change login UI
→ Edit `index.html`

### I want to change chat UI
→ Edit `chat.html`

### I want to add a new feature
→ Modify `js/app.js` (frontend) and `Code.gs` (backend)

### I want to change AI model
→ Edit `callAIAPI()` in `Code.gs`

### I want to add more Islamic references
→ Add rows to DALIL sheet in Spreadsheet

### I want to change daily limit
→ Edit `DAILY_LIMIT_FREE` in `Code.gs` line 17

### I want to understand API
→ Read `API_REFERENCE.md`

### I want to debug errors
→ Check `DEPLOYMENT_TROUBLESHOOTING.md`

### I want to see full implementation
→ Read specific `.gs` function in `Code.gs`

---

## 🔐 FILES TO NEVER COMMIT

These should be in `.gitignore`:
```
.env
.env.local
config.local.json
YOUR_API_KEY (if accidentally here)
node_modules/
.vscode/settings.json (with secrets)
```

These ARE safe to commit:
```
All HTML files
All CSS files
All JS files (no keys in them)
All .md docs
.gitignore itself
```

---

## ✅ VERIFICATION CHECKLIST

All files present?
- [ ] index.html
- [ ] chat.html
- [ ] 404.html
- [ ] js/app.js
- [ ] css/style.css
- [ ] Code.gs
- [ ] HelperFunctions.gs
- [ ] All .md files
- [ ] .gitignore

All files readable?
- [ ] No corrupted files
- [ ] Correct line endings
- [ ] UTF-8 encoding

All files updated?
- [ ] GAS_API_URL correct in app.js
- [ ] SPREADSHEET_ID correct in Code.gs
- [ ] API key set in Apps Script

---

## 🚀 FINAL SUMMARY

**Core Files (Must Have):**
1. `Code.gs` - Backend
2. `index.html` - Frontend login
3. `chat.html` - Frontend chat
4. `js/app.js` - Frontend logic
5. `README.md` - Documentation

**Recommended Files (Should Have):**
1. `css/style.css` - Better styling
2. `BACKEND_SETUP.md` - Setup guide
3. `API_REFERENCE.md` - Reference

**Optional but Helpful:**
1. `HelperFunctions.gs` - Utilities
2. All other `.md` files - Documentation
3. `404.html` - GitHub Pages routing

---

**Project Status:** ✅ Complete  
**Version:** 1.0  
**Created:** 2026-02-15  
**Ready to Deploy:** YES

All files are production-ready! 🎉
