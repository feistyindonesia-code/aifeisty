// ==========================================
// AI FEISTY - GOOGLE APPS SCRIPT BACKEND
// Islamic AI Assistant with RAG
// ==========================================

// Configuration
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with your Sheet ID
const AI_API_KEY = 'YOUR_AI_API_KEY'; // Store in PropertiesService instead of here
const AI_API_URL = 'https://api.openai.com/v1/chat/completions'; // or your AI provider

// Sheet names
const SHEET_USERS = 'USERS';
const SHEET_CHATS = 'CHATS';
const SHEET_DALIL = 'DALIL';

// Constants
const DAILY_LIMIT_FREE = 10;
const CHAT_HISTORY_LIMIT = 5;
const PASSWORD_HASH_ALGORITHM = 'SHA-256';

/**
 * Main entry point for POST requests
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    switch(action) {
      case 'register':
        return handleRegister(payload);
      case 'login':
        return handleLogin(payload);
      case 'chat':
        return handleChat(payload);
      default:
        return JsonResponse(false, null, 'Invalid action');
    }
  } catch(error) {
    Logger.log('Error in doPost: ' + error);
    return JsonResponse(false, null, 'Server error: ' + error.toString());
  }
}

/**
 * Add CORS headers
 */
function doOptions(e) {
  const output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.TEXT_PLAIN);
  output.addHeader('Access-Control-Allow-Origin', '*');
  output.addHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  output.addHeader('Access-Control-Allow-Headers', 'Content-Type');
  return output;
}

// ==========================================
// AUTHENTICATION HANDLERS
// ==========================================

/**
 * Handle user registration
 */
function handleRegister(payload) {
  try {
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password;

    // Validation
    if (!email || !password) {
      return JsonResponse(false, null, 'Email dan password harus diisi');
    }

    if (password.length < 6) {
      return JsonResponse(false, null, 'Password minimal 6 karakter');
    }

    if (!isValidEmail(email)) {
      return JsonResponse(false, null, 'Format email tidak valid');
    }

    // Check if email already exists
    const existingUser = getUser(email);
    if (existingUser) {
      return JsonResponse(false, null, 'Email sudah terdaftar');
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Generate user ID
    const userId = generateUserId();

    // Get USERS sheet
    const sheet = getSheetByName(SHEET_USERS);
    if (!sheet) {
      return JsonResponse(false, null, 'Database error');
    }

    // Add new user
    const today = new Date().toISOString().split('T')[0];
    sheet.appendRow([
      userId,
      email,
      passwordHash,
      'free',
      0,
      today
    ]);

    return JsonResponse(true, { user_id: userId }, 'Registrasi berhasil');
  } catch(error) {
    Logger.log('Register error: ' + error);
    return JsonResponse(false, null, 'Registrasi gagal: ' + error.toString());
  }
}

/**
 * Handle user login
 */
function handleLogin(payload) {
  try {
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password;

    // Validation
    if (!email || !password) {
      return JsonResponse(false, null, 'Email dan password harus diisi');
    }

    // Get user
    const user = getUser(email);
    if (!user) {
      return JsonResponse(false, null, 'Email atau password salah');
    }

    // Verify password
    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return JsonResponse(false, null, 'Email atau password salah');
    }

    return JsonResponse(true, { user_id: user.userId }, 'Login berhasil');
  } catch(error) {
    Logger.log('Login error: ' + error);
    return JsonResponse(false, null, 'Login gagal: ' + error.toString());
  }
}

// ==========================================
// CHAT HANDLER
// ==========================================

/**
 * Handle chat request with RAG and daily limit
 */
function handleChat(payload) {
  try {
    const userId = payload.user_id;
    const userMessage = payload.message?.trim();

    // Validation
    if (!userId || !userMessage) {
      return JsonResponse(false, null, 'user_id dan message harus diisi');
    }

    if (userMessage.length > 2000) {
      return JsonResponse(false, null, 'Pesan terlalu panjang (max 2000 karakter)');
    }

    // Get user
    const user = getUserById(userId);
    if (!user) {
      return JsonResponse(false, null, 'User tidak ditemukan');
    }

    // Check and reset daily count if new day
    resetDailyCountIfNeeded(user);

    // Check daily limit for free users
    if (user.role === 'free' && user.dailyCount >= DAILY_LIMIT_FREE) {
      return JsonResponse(false, null, 'Batas harian tercapai. Coba lagi besok.');
    }

    // Increment daily count
    incrementDailyCount(userId);

    // Get chat history (last 5 messages)
    const chatHistory = getLastMessages(userId, CHAT_HISTORY_LIMIT);

    // Search relevant dalil/references
    const relevantDalil = searchDalil(userMessage);

    // Build AI prompt
    const systemPrompt = buildSystemPrompt(relevantDalil);
    const messages = buildConversation(systemPrompt, chatHistory, userMessage);

    // Call AI API
    const aiResponse = callAIAPI(messages);

    if (!aiResponse.success) {
      return JsonResponse(false, null, 'Gagal mendapat respons dari AI: ' + aiResponse.error);
    }

    // Extract answer
    const answer = aiResponse.text;

    // Save messages to chat history
    saveChatMessage(userId, 'user', userMessage);
    saveChatMessage(userId, 'assistant', answer);

    return JsonResponse(true, { response: answer }, 'Sukses');
  } catch(error) {
    Logger.log('Chat error: ' + error);
    return JsonResponse(false, null, 'Terjadi kesalahan: ' + error.toString());
  }
}

// ==========================================
// DATABASE FUNCTIONS
// ==========================================

/**
 * Get sheet by name
 */
function getSheetByName(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  return spreadsheet.getSheetByName(sheetName);
}

/**
 * Get user by email
 */
function getUser(email) {
  const sheet = getSheetByName(SHEET_USERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][1]?.toLowerCase() === email.toLowerCase()) {
      return {
        userId: data[i][0],
        email: data[i][1],
        passwordHash: data[i][2],
        role: data[i][3],
        dailyCount: data[i][4] || 0,
        lastReset: data[i][5],
        rowIndex: i
      };
    }
  }
  return null;
}

/**
 * Get user by user_id
 */
function getUserById(userId) {
  const sheet = getSheetByName(SHEET_USERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      return {
        userId: data[i][0],
        email: data[i][1],
        passwordHash: data[i][2],
        role: data[i][3],
        dailyCount: data[i][4] || 0,
        lastReset: data[i][5],
        rowIndex: i
      };
    }
  }
  return null;
}

/**
 * Reset daily count if new day
 */
function resetDailyCountIfNeeded(user) {
  const today = new Date().toISOString().split('T')[0];
  const lastReset = user.lastReset;

  if (lastReset !== today) {
    const sheet = getSheetByName(SHEET_USERS);
    sheet.getRange(user.rowIndex + 1, 5).setValue(0); // Reset daily_count
    sheet.getRange(user.rowIndex + 1, 6).setValue(today); // Update last_reset
    user.dailyCount = 0;
  }
}

/**
 * Increment daily count
 */
function incrementDailyCount(userId) {
  const user = getUserById(userId);
  const sheet = getSheetByName(SHEET_USERS);
  sheet.getRange(user.rowIndex + 1, 5).setValue(user.dailyCount + 1);
}

/**
 * Get last N messages for user
 */
function getLastMessages(userId, limit) {
  const sheet = getSheetByName(SHEET_CHATS);
  const data = sheet.getDataRange().getValues();

  const userMessages = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      userMessages.push({
        role: data[i][1],
        message: data[i][2],
        timestamp: data[i][3]
      });
    }
  }

  // Return last N messages
  return userMessages.slice(-limit);
}

/**
 * Save chat message
 */
function saveChatMessage(userId, role, message) {
  const sheet = getSheetByName(SHEET_CHATS);
  const timestamp = new Date().toISOString();
  sheet.appendRow([userId, role, message, timestamp]);
}

/**
 * Search relevant dalil/references from spreadsheet
 */
function searchDalil(query) {
  const sheet = getSheetByName(SHEET_DALIL);
  const data = sheet.getDataRange().getValues();

  const keywords = query.toLowerCase().split(/\s+/);
  const relevantDalil = [];

  for (let i = 1; i < data.length; i++) {
    const id = data[i][0];
    const sumber = data[i][1];
    const referensi = data[i][2];
    const teks = data[i][3];
    const katakunci = data[i][4]?.toLowerCase() || '';

    // Simple keyword matching
    let matchScore = 0;
    keywords.forEach(keyword => {
      if (katakunci.includes(keyword) || teks.toLowerCase().includes(keyword)) {
        matchScore++;
      }
    });

    if (matchScore > 0) {
      relevantDalil.push({
        id: id,
        sumber: sumber,
        referensi: referensi,
        teks: teks,
        score: matchScore
      });
    }
  }

  // Sort by score and return top 5
  relevantDalil.sort((a, b) => b.score - a.score);
  return relevantDalil.slice(0, 5);
}

// ==========================================
// AI INTEGRATION
// ==========================================

/**
 * Build system prompt with anti-hallucination guardrails
 */
function buildSystemPrompt(relevantDalil) {
  let dalilContext = '';

  if (relevantDalil.length > 0) {
    dalilContext = '\n\nReferensi Dalil Relevan:\n';
    relevantDalil.forEach((dalil, index) => {
      dalilContext += `\n${index + 1}. ${dalil.sumber} (${dalil.referensi}):\n"${dalil.teks}"\n`;
    });
  } else {
    dalilContext = '\n\nTidak ada referensi dalil yang relevan ditemukan.';
  }

  const systemPrompt = `Kamu adalah Asisten Islami (AI Feisty) yang berbasis pada dalil Alquran dan Hadis.

INSTRUKSI PENTING:
1. Jawab HANYA berdasarkan referensi dalil yang diberikan di bawah ini.
2. JANGAN membuat ayat, hadis, atau dalil baru.
3. JANGAN mengarang-ngarang atau bermain-main dengan teks agama.
4. Jika referensi tidak cukup untuk menjawab pertanyaan, katakan dengan jelas: "Saya tidak memiliki dalil yang cukup untuk menjawab pertanyaan ini."
5. JANGAN mengeluarkan fatwa final atau keputusan hukum yang pasti.
6. Untuk kasus-kasus sensitif atau mazhab yang berbeda, arahkan penanya untuk berkonsultasi dengan ulama terpercaya.
7. Berikan jawaban dalam bahasa yang mudah dipahami.
8. Selalu kaitkan jawaban dengan dalil yang disediakan.
9. Jika ada perbedaan pendapat ulama, jelaskan dengan netral.
10. Jangan mengeluarkan opini pribadi, hanya berdasarkan sumber Islami yang terpercaya.${dalilContext}

KONTEKS PERCAKAPAN:
`;

  return systemPrompt;
}

/**
 * Build conversation array for API
 */
function buildConversation(systemPrompt, chatHistory, userMessage) {
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    }
  ];

  // Add chat history
  chatHistory.forEach(chat => {
    messages.push({
      role: chat.role === 'assistant' ? 'assistant' : 'user',
      content: chat.message
    });
  });

  // Add current user message
  messages.push({
    role: 'user',
    content: userMessage
  });

  return messages;
}

/**
 * Call AI API (OpenAI or similar)
 */
function callAIAPI(messages) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('AI_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        error: 'API key tidak dikonfigurasi'
      };
    }

    const payload = {
      model: 'gpt-4o-mini', // atau 'gpt-3.5-turbo' untuk lebih murah
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0.6
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + apiKey
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(AI_API_URL, options);
    const result = JSON.parse(response.getContentText());

    if (response.getResponseCode() === 200) {
      const aiText = result.choices[0].message.content;
      return {
        success: true,
        text: aiText
      };
    } else {
      return {
        success: false,
        error: result.error?.message || 'API error'
      };
    }
  } catch(error) {
    Logger.log('AI API error: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ==========================================
// SECURITY & UTILITY FUNCTIONS
// ==========================================

/**
 * Generate unique user ID
 */
function generateUserId() {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 8);
  return 'user_' + timestamp + '_' + randomPart;
}

/**
 * Hash password using SHA-256
 */
function hashPassword(password) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return Utilities.base64Encode(digest);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * JSON Response helper
 */
function JsonResponse(success, data, message) {
  const response = ContentService.createTextOutput(
    JSON.stringify({
      success: success,
      data: data,
      message: message
    })
  );
  response.setMimeType(ContentService.MimeType.JSON);
  response.addHeader('Access-Control-Allow-Origin', '*');
  response.addHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.addHeader('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// ==========================================
// SETUP & TESTING FUNCTIONS
// ==========================================

/**
 * Initialize spreadsheet with required sheets
 * Run this once after creating your spreadsheet
 */
function initializeSpreadsheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Create USERS sheet
  try {
    let sheet = spreadsheet.getSheetByName(SHEET_USERS);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_USERS);
      sheet.appendRow(['user_id', 'email', 'password_hash', 'role', 'daily_count', 'last_reset']);
    }
  } catch(e) {
    Logger.log('USERS sheet already exists');
  }

  // Create CHATS sheet
  try {
    let sheet = spreadsheet.getSheetByName(SHEET_CHATS);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_CHATS);
      sheet.appendRow(['user_id', 'role', 'message', 'timestamp']);
    }
  } catch(e) {
    Logger.log('CHATS sheet already exists');
  }

  // Create DALIL sheet
  try {
    let sheet = spreadsheet.getSheetByName(SHEET_DALIL);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_DALIL);
      sheet.appendRow(['id', 'sumber', 'referensi', 'teks', 'kata_kunci']);
      
      // Add sample data
      sheet.appendRow([
        1,
        'Alquran',
        'Al-Baqarah: 183',
        'Walakum fi as-siyami hikmatun lilladhina amanu',
        'puasa, ibadah, kesehatan'
      ]);
      sheet.appendRow([
        2,
        'Hadis Riwayat Bukhari',
        'Shahih Bukhari 1',
        'Innamal a\'malu bi-niyyah',
        'niat, amal, ibadah'
      ]);
    }
  } catch(e) {
    Logger.log('DALIL sheet already exists');
  }

  Logger.log('Spreadsheet initialized successfully');
}

/**
 * Set API Key in PropertiesService
 * Replace 'YOUR_API_KEY' with actual key
 */
function setAPIKey() {
  PropertiesService.getScriptProperties().setProperty('AI_API_KEY', 'YOUR_API_KEY');
  Logger.log('API Key set successfully');
}

/**
 * Test register function
 */
function testRegister() {
  const payload = {
    action: 'register',
    email: 'test@example.com',
    password: 'password123'
  };
  
  const result = handleRegister(payload);
  Logger.log(result.getContent());
}

/**
 * Test login function
 */
function testLogin() {
  const payload = {
    action: 'login',
    email: 'test@example.com',
    password: 'password123'
  };
  
  const result = handleLogin(payload);
  Logger.log(result.getContent());
}
