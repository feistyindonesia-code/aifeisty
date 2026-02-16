// ==========================================
// AI FEISTY - GOOGLE APPS SCRIPT BACKEND
// Islamic AI Assistant with RAG (Gemini AI)
// ==========================================

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // WAJIB: Ganti dengan ID Spreadsheet Anda
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SHEET_USERS = 'USERS';
const SHEET_CHATS = 'CHATS';
const SHEET_DALIL = 'DALIL';

const DAILY_LIMIT_FREE = 10;
const CHAT_HISTORY_LIMIT = 5;
const PASSWORD_HASH_ALGORITHM = 'SHA-256';

function doPost(e) {
  try {
    // Ensure sheets exist automatically
    ensureSheetsExist();
    
    // Handle both JSON and text/plain content types for CORS compatibility
    let payload;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      return JsonResponse(false, null, 'No data received');
    }
    
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

// doGet for testing and CORS support with JSONP
function doGet(e) {
  const action = e.parameter.action;
  const callback = e.parameter.callback || 'handleResponse';
  
  if (action === 'test') {
    return JsonpResponse(callback, true, { status: 'ok', timestamp: new Date().toISOString() }, 'API is working');
  }
  
  // Handle JSONP-style requests for CORS bypass
  if (e.parameter.payload) {
    try {
      const payload = JSON.parse(e.parameter.payload);
      
      switch(payload.action) {
        case 'register':
          return handleRegisterJsonp(payload, callback);
        case 'login':
          return handleLoginJsonp(payload, callback);
        case 'chat':
          return handleChatJsonp(payload, callback);
        default:
          return JsonpResponse(callback, false, null, 'Invalid action');
      }
    } catch(error) {
      return JsonpResponse(callback, false, null, 'Parse error: ' + error.toString());
    }
  }
  
  return JsonpResponse(callback, false, null, 'Use POST method or provide action parameter');
}

// JSONP Response wrapper - returns JavaScript that calls the callback
function JsonpResponse(callback, success, data, message) {
  const jsonData = JSON.stringify({
    success: success,
    data: data,
    message: message
  });
  
  // Return as JavaScript (not JSON) - this bypasses CORS
  const output = ContentService.createTextOutput(
    callback + '(' + jsonData + ');'
  );
  output.setMimeType(ContentService.MimeType.JAVASCRIPT);
  return output;
}

// JSONP handlers
function handleRegisterJsonp(payload, callback) {
  try {
    ensureSheetsExist();
    
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password;

    if (!email || !password) {
      return JsonpResponse(callback, false, null, 'Email dan password harus diisi');
    }

    if (password.length < 6) {
      return JsonpResponse(callback, false, null, 'Password minimal 6 karakter');
    }

    if (!isValidEmail(email)) {
      return JsonpResponse(callback, false, null, 'Format email tidak valid');
    }

    const existingUser = getUser(email);
    if (existingUser) {
      return JsonpResponse(callback, false, null, 'Email sudah terdaftar');
    }

    const passwordHash = hashPassword(password);
    const userId = generateUserId();

    const sheet = getSheetByName(SHEET_USERS);
    if (!sheet) {
      return JsonpResponse(callback, false, null, 'Database error');
    }

    const today = new Date().toISOString().split('T')[0];
    sheet.appendRow([userId, email, passwordHash, 'free', 0, today]);

    return JsonpResponse(callback, true, { user_id: userId }, 'Registrasi berhasil');
  } catch(error) {
    Logger.log('Register error: ' + error);
    return JsonpResponse(callback, false, null, 'Registrasi gagal: ' + error.toString());
  }
}

function handleLoginJsonp(payload, callback) {
  try {
    ensureSheetsExist();
    
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password;

    if (!email || !password) {
      return JsonpResponse(callback, false, null, 'Email dan password harus diisi');
    }

    const user = getUser(email);
    if (!user) {
      return JsonpResponse(callback, false, null, 'Email atau password salah');
    }

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return JsonpResponse(callback, false, null, 'Email atau password salah');
    }

    return JsonpResponse(callback, true, { user_id: user.userId }, 'Login berhasil');
  } catch(error) {
    Logger.log('Login error: ' + error);
    return JsonpResponse(callback, false, null, 'Login gagal: ' + error.toString());
  }
}

function handleChatJsonp(payload, callback) {
  try {
    ensureSheetsExist();
    
    const userId = payload.user_id;
    const userMessage = payload.message?.trim();

    if (!userId || !userMessage) {
      return JsonpResponse(callback, false, null, 'user_id dan message harus diisi');
    }

    if (userMessage.length > 2000) {
      return JsonpResponse(callback, false, null, 'Pesan terlalu panjang (max 2000 karakter)');
    }

    const user = getUserById(userId);
    if (!user) {
      return JsonpResponse(callback, false, null, 'User tidak ditemukan');
    }

    resetDailyCountIfNeeded(user);

    if (user.role === 'free' && user.dailyCount >= DAILY_LIMIT_FREE) {
      return JsonpResponse(callback, false, null, 'Batas harian tercapai. Coba lagi besok.');
    }

    incrementDailyCount(userId);

    const chatHistory = getLastMessages(userId, CHAT_HISTORY_LIMIT);
    const relevantDalil = searchDalil(userMessage);

    const systemPrompt = buildSystemPrompt(relevantDalil);
    const messages = buildConversation(systemPrompt, chatHistory, userMessage);

    const aiResponse = callAIAPI(messages);

    if (!aiResponse.success) {
      return JsonpResponse(callback, false, null, 'Gagal mendapat respons dari AI: ' + aiResponse.error);
    }

    const answer = aiResponse.text;

    saveChatMessage(userId, 'user', userMessage);
    saveChatMessage(userId, 'assistant', answer);

    return JsonpResponse(callback, true, { response: answer }, 'Sukses');
  } catch(error) {
    Logger.log('Chat error: ' + error);
    return JsonpResponse(callback, false, null, 'Terjadi kesalahan: ' + error.toString());
  }
}

function doOptions(e) {
  const output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.TEXT_PLAIN);
  output.addHeader('Access-Control-Allow-Origin', '*');
  output.addHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  output.addHeader('Access-Control-Allow-Headers', 'Content-Type');
  return output;
}

function handleRegister(payload) {
  try {
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password;

    if (!email || !password) {
      return JsonResponse(false, null, 'Email dan password harus diisi');
    }

    if (password.length < 6) {
      return JsonResponse(false, null, 'Password minimal 6 karakter');
    }

    if (!isValidEmail(email)) {
      return JsonResponse(false, null, 'Format email tidak valid');
    }

    const existingUser = getUser(email);
    if (existingUser) {
      return JsonResponse(false, null, 'Email sudah terdaftar');
    }

    const passwordHash = hashPassword(password);
    const userId = generateUserId();

    const sheet = getSheetByName(SHEET_USERS);
    if (!sheet) {
      return JsonResponse(false, null, 'Database error');
    }

    const today = new Date().toISOString().split('T')[0];
    sheet.appendRow([userId, email, passwordHash, 'free', 0, today]);

    return JsonResponse(true, { user_id: userId }, 'Registrasi berhasil');
  } catch(error) {
    Logger.log('Register error: ' + error);
    return JsonResponse(false, null, 'Registrasi gagal: ' + error.toString());
  }
}

function handleLogin(payload) {
  try {
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password;

    if (!email || !password) {
      return JsonResponse(false, null, 'Email dan password harus diisi');
    }

    const user = getUser(email);
    if (!user) {
      return JsonResponse(false, null, 'Email atau password salah');
    }

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

function handleChat(payload) {
  try {
    const userId = payload.user_id;
    const userMessage = payload.message?.trim();

    if (!userId || !userMessage) {
      return JsonResponse(false, null, 'user_id dan message harus diisi');
    }

    if (userMessage.length > 2000) {
      return JsonResponse(false, null, 'Pesan terlalu panjang (max 2000 karakter)');
    }

    const user = getUserById(userId);
    if (!user) {
      return JsonResponse(false, null, 'User tidak ditemukan');
    }

    resetDailyCountIfNeeded(user);

    if (user.role === 'free' && user.dailyCount >= DAILY_LIMIT_FREE) {
      return JsonResponse(false, null, 'Batas harian tercapai. Coba lagi besok.');
    }

    incrementDailyCount(userId);

    const chatHistory = getLastMessages(userId, CHAT_HISTORY_LIMIT);
    const relevantDalil = searchDalil(userMessage);

    const systemPrompt = buildSystemPrompt(relevantDalil);
    const messages = buildConversation(systemPrompt, chatHistory, userMessage);

    const aiResponse = callAIAPI(messages);

    if (!aiResponse.success) {
      return JsonResponse(false, null, 'Gagal mendapat respons dari AI: ' + aiResponse.error);
    }

    const answer = aiResponse.text;

    saveChatMessage(userId, 'user', userMessage);
    saveChatMessage(userId, 'assistant', answer);

    return JsonResponse(true, { response: answer }, 'Sukses');
  } catch(error) {
    Logger.log('Chat error: ' + error);
    return JsonResponse(false, null, 'Terjadi kesalahan: ' + error.toString());
  }
}

function getSheetByName(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  return spreadsheet.getSheetByName(sheetName);
}

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

function resetDailyCountIfNeeded(user) {
  const today = new Date().toISOString().split('T')[0];
  const lastReset = user.lastReset;

  if (lastReset !== today) {
    const sheet = getSheetByName(SHEET_USERS);
    sheet.getRange(user.rowIndex + 1, 5).setValue(0);
    sheet.getRange(user.rowIndex + 1, 6).setValue(today);
    user.dailyCount = 0;
  }
}

function incrementDailyCount(userId) {
  const user = getUserById(userId);
  const sheet = getSheetByName(SHEET_USERS);
  sheet.getRange(user.rowIndex + 1, 5).setValue(user.dailyCount + 1);
}

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

  return userMessages.slice(-limit);
}

function saveChatMessage(userId, role, message) {
  const sheet = getSheetByName(SHEET_CHATS);
  const timestamp = new Date().toISOString();
  sheet.appendRow([userId, role, message, timestamp]);
}

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

  relevantDalil.sort((a, b) => b.score - a.score);
  return relevantDalil.slice(0, 5);
}

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
3. Jika referensi tidak cukup, katakan: "Saya tidak memiliki dalil yang cukup untuk menjawab pertanyaan ini."
4. JANGAN mengeluarkan fatwa final atau keputusan hukum yang pasti.
5. Untuk kasus sensitif, arahkan konsultasi ke ulama terpercaya.
6. Berikan jawaban dalam bahasa yang mudah dipahami.
7. Selalu kaitkan jawaban dengan dalil yang disediakan.${dalilContext}

KONTEKS PERCAKAPAN:
`;

  return systemPrompt;
}

function buildConversation(systemPrompt, chatHistory, userMessage) {
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    }
  ];

  chatHistory.forEach(chat => {
    messages.push({
      role: chat.role === 'assistant' ? 'assistant' : 'user',
      content: chat.message
    });
  });

  messages.push({
    role: 'user',
    content: userMessage
  });

  return messages;
}

function callAIAPI(messages) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    
    if (!apiKey) {
      return {
        success: false,
        error: 'API key tidak dikonfigurasi. Jalankan setGeminiAPIKey() dengan API key Anda.'
      };
    }

    // Convert OpenAI-style messages to Gemini format
    const geminiContents = [];
    let systemInstruction = '';
    
    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = msg.content;
      } else {
        geminiContents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      }
    }

    const payload = {
      contents: geminiContents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
        topP: 0.95,
        topK: 40
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-goog-api-key': apiKey
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(GEMINI_API_URL, options);
    const result = JSON.parse(response.getContentText());

    if (response.getResponseCode() === 200) {
      if (result.candidates && result.candidates[0] && result.candidates[0].content) {
        const aiText = result.candidates[0].content.parts[0].text;
        return {
          success: true,
          text: aiText
        };
      } else {
        return {
          success: false,
          error: 'Respons tidak valid dari Gemini API'
        };
      }
    } else {
      Logger.log('Gemini API Error Response: ' + JSON.stringify(result));
      return {
        success: false,
        error: result.error?.message || 'API error: ' + response.getResponseCode()
      };
    }
  } catch(error) {
    Logger.log('Gemini API error: ' + error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

function generateUserId() {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 8);
  return 'user_' + timestamp + '_' + randomPart;
}

function hashPassword(password) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return Utilities.base64Encode(digest);
}

function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

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

function ensureSheetsExist() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Create USERS sheet if not exists
    if (!spreadsheet.getSheetByName(SHEET_USERS)) {
      const usersSheet = spreadsheet.insertSheet(SHEET_USERS);
      usersSheet.appendRow(['user_id', 'email', 'password_hash', 'role', 'daily_count', 'last_reset']);
      Logger.log('USERS sheet created');
    }

    // Create CHATS sheet if not exists
    if (!spreadsheet.getSheetByName(SHEET_CHATS)) {
      const chatsSheet = spreadsheet.insertSheet(SHEET_CHATS);
      chatsSheet.appendRow(['user_id', 'role', 'message', 'timestamp']);
      Logger.log('CHATS sheet created');
    }

    // Create DALIL sheet if not exists
    if (!spreadsheet.getSheetByName(SHEET_DALIL)) {
      const dalilSheet = spreadsheet.insertSheet(SHEET_DALIL);
      dalilSheet.appendRow(['id', 'sumber', 'referensi', 'teks', 'kata_kunci']);
      Logger.log('DALIL sheet created');
    }

  } catch(error) {
    Logger.log('Error ensuring sheets exist: ' + error);
  }
}

function initializeSpreadsheet() {
  ensureSheetsExist();
  Logger.log('Spreadsheet initialized successfully');
}

function setGeminiAPIKey() {
  // Ganti YOUR_GEMINI_API_KEY dengan API key dari Google AI Studio
  // Dapatkan API key gratis di: https://aistudio.google.com/app/apikey
  PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', 'YOUR_GEMINI_API_KEY');
  Logger.log('Gemini API Key set successfully');
}

// Legacy function for backward compatibility
function setAPIKey() {
  setGeminiAPIKey();
}
