// ==========================================
// HELPER SETUP FUNCTIONS
// (Jalankan ini secara terpisah untuk setup)
// ==========================================

/**
 * Jalankan ini sekali untuk import sample data DALIL
 * Setelah jalankan initializeSpreadsheet() terlebih dahulu
 */
function importSampleDaulData() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_DALIL);
  
  // Clear existing data (keep header)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }

  const sampleData = [
    // Puasa
    {
      id: 1,
      sumber: 'Alquran',
      referensi: 'Al-Baqarah: 183',
      teks: 'Walikum fi as-siyami hikmatun lilladhina amanu',
      kata_kunci: 'puasa, ibadah, kesehatan, bulan ramadan'
    },
    {
      id: 2,
      sumber: 'Alquran',
      referensi: 'Al-Baqarah: 184',
      teks: 'Ayyamun ma\'dudatun fakaman kana minkum maridhan aw alaa safarin faAAiddatun min ayyamin ukhra',
      kata_kunci: 'puasa, sakit, perjalanan, pengecualian'
    },
    {
      id: 3,
      sumber: 'Hadis',
      referensi: 'Shahih Bukhari 1904',
      teks: 'Dari Abu Hurairah r.a. bahwa Nabi saw. bersabda: Barang siapa yang berpuasa Ramadan karena iman dan mengharap pahala Allah, maka akan diampuni dosa-dosanya yang lalu',
      kata_kunci: 'puasa, niat, ramadan, dosa'
    },

    // Wudhu
    {
      id: 4,
      sumber: 'Alquran',
      referensi: 'Al-Maidah: 6',
      teks: 'Ya ayyuha alladhina amanu idha qumtum ila as-salati faighsilu wujuhakum wa-aydeekum ila al-marafiqi wa-amsihu biruusikum wa-arjulakum ila al-kaAAbayn',
      kata_kunci: 'wudhu, solat, kebersihan, ablution'
    },
    {
      id: 5,
      sumber: 'Hadis',
      referensi: 'Sunan Ibn Majah 481',
      teks: 'Nabi saw. bersabda: Tidak ada yang diterima dari amal tanpa wudhu',
      kata_kunci: 'wudhu, amal, ibadah'
    },

    // Zakat
    {
      id: 6,
      sumber: 'Alquran',
      referensi: 'At-Taubah: 60',
      teks: 'Innama as-sadaqatu lilfu​qara wa-al-masakeeni wa-al-AAamilina AAalayha wa-al-mu-allafati quloobuhum wa-fi ar-riqabi wa-al-gharimeena wa-fee sabi​li Allahi wa-abni as-sabeel fareedatun mina Allahi wa-Allahu AAaleemun hakeemun',
      kata_kunci: 'zakat, sedekah, miskin, mustahik'
    },
    {
      id: 7,
      sumber: 'Hadis',
      referensi: 'Shahih Bukhari 1331',
      teks: 'Dari Ibnu Abbas r.a. bahwa Nabi saw. bersabda: Zakat itu tidak wajib pada harta yang kurang dari lima oqiyah',
      kata_kunci: 'zakat, nisab, harta, fardhu'
    },

    // Solat
    {
      id: 8,
      sumber: 'Alquran',
      referensi: 'Al-Ankabut: 45',
      teks: 'Iqami as-salata inna as-salata tanha ani al-fahsha wa-al-munkari wa-ladhikru Allahi akbar',
      kata_kunci: 'solat, ibadah, dosa, kebaikan'
    },
    {
      id: 9,
      sumber: 'Alquran',
      referensi: 'Al-Isra: 78',
      teks: 'Aqimi as-salata lima doolin minasha-sya wa-hata ghisaqi al-layli wa-quraana al-fajri inna quraana al-fajri kana masyhuda',
      kata_kunci: 'solat lima waktu, tepat waktu, subuh'
    },

    // Haji
    {
      id: 10,
      sumber: 'Alquran',
      referensi: 'Al-Imran: 97',
      teks: 'Walillahi AAala an-nasi hijju al-bayt mani istataAAa ilayh sabeelan wa-man kafara fainallaha ghaniyu AAani al-AAalameena',
      kata_kunci: 'haji, rukun islam, ibadah, mampu'
    },

    // Akhlak
    {
      id: 11,
      sumber: 'Hadis',
      referensi: 'Jami\' at-Tirmidhi 2314',
      teks: 'Rasulullah saw. bersabda: Tidak sempurna iman seseorang sampai orang itu mencintai untuk saudaranya apa yang dia cintai untuk dirinya sendiri',
      kata_kunci: 'akhlak, iman, persaudaraan, cinta'
    },
    {
      id: 12,
      sumber: 'Hadis',
      referensi: 'Shahih Muslim 2309',
      teks: 'Rasulullah saw. bersabda: Sebaik-baik kalian adalah yang terbaik akhlaknya',
      kata_kunci: 'akhlak, moral, karakter, kebaikan'
    },

    // Kehalalan Makanan
    {
      id: 13,
      sumber: 'Alquran',
      referensi: 'Al-Baqarah: 168',
      teks: 'Ya ayyuha an-nasu kulu mimma fi al-ardi halalan tayyiban wa-la tattabiAAu khutuwati ash-shaytan innahu lakum AAaduwwun mubeenun',
      kata_kunci: 'halal, makanan, haram, kebersihan'
    },
    {
      id: 14,
      sumber: 'Hadis',
      referensi: 'Sunan Ibn Majah 3390',
      teks: 'Nabi saw. bersabda: Tidak akan masuk surga daging yang tumbuh dari harta haram',
      kata_kunci: 'halal, haram, surga, dosa'
    },

    // Keluarga
    {
      id: 15,
      sumber: 'Alquran',
      referensi: 'At-Tahrim: 6',
      teks: 'Ya ayyuha alladhina amanu qoo anfusakum wa-ahleekum naran waqooduhannasu wa-al-hijaratu AAalayha malaikatu ghilazun shedadun la yasAAoona Allaha ma amarahum wa-yafAAaloona ma yumaru',
      kata_kunci: 'keluarga, tanggungjawab, anak, istri'
    },
    {
      id: 16,
      sumber: 'Hadis',
      referensi: 'Shahih Bukhari 5194',
      teks: 'Rasulullah saw. bersabda: Kalian semua adalah pemimpin dan kalian semua akan diminta tanggung jawab atas kepemimpinan kalian',
      kata_kunci: 'tanggung jawab, pemimpin, keluarga'
    },

    // Ilmu Pengetahuan
    {
      id: 17,
      sumber: 'Hadis',
      referensi: 'Sunan Ibnu Majah 224',
      teks: 'Rasulullah saw. bersabda: Mencari ilmu adalah kewajiban bagi setiap Muslim baik laki-laki maupun perempuan',
      kata_kunci: 'ilmu, pendidikan, kewajiban, pembelajaran'
    },
    {
      id: 18,
      sumber: 'Alquran',
      referensi: 'Taha: 114',
      teks: 'Fa-taAAala Allahu al-maliku al-haqqu wa-la taAAjal bi-al-Quraani min qabli an yuqda ilayke wahyuhu wa-qul rabbi zidni AAilman',
      kata_kunci: 'ilmu, pembelajaran, quran, pemahaman'
    },

    // Bisnis dan Perdagangan
    {
      id: 19,
      sumber: 'Hadis',
      referensi: 'Sunan Ibnu Majah 2138',
      teks: 'Nabi saw. bersabda: Pedagang yang jujur dan dapat dipercaya akan bersama-sama dengan para nabi pada hari kiamat',
      kata_kunci: 'bisnis, jujur, perdagangan, amanah'
    },
    {
      id: 20,
      sumber: 'Hadis',
      referensi: 'Jami\' at-Tirmidhi 1209',
      teks: 'Nabi saw. bersabda: Janganlah kalian melakukan riba (bunga). Riba itu adalah haram',
      kata_kunci: 'riba, haram, bunga, bisnis'
    }
  ];

  sampleData.forEach(item => {
    sheet.appendRow([
      item.id,
      item.sumber,
      item.referensi,
      item.teks,
      item.kata_kunci
    ]);
  });

  Logger.log('Sample data imported: ' + sampleData.length + ' items');
}

/**
 * Function untuk test send email ke admin
 * (untuk monitoring dan debugging)
 */
function sendAdminNotification(subject, message) {
  const adminEmail = 'YOUR_EMAIL@gmail.com'; // Ganti dengan email Anda
  
  const emailBody = `
Notifikasi AI Feisty Backend
Time: ${new Date().toISOString()}

${message}

---
System Generated
  `;
  
  try {
    GmailApp.sendEmail(adminEmail, subject, emailBody);
  } catch(error) {
    Logger.log('Failed to send email: ' + error);
  }
}

/**
 * Monitor daily usage - jalankan ini dengan Triggers
 * (Apps Script > Triggers > Create new trigger)
 */
function dailyUsageReport() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usersSheet = spreadsheet.getSheetByName(SHEET_USERS);
  const userData = usersSheet.getDataRange().getValues();

  let totalUsers = 0;
  let totalChats = 0;
  let usedDaily = 0;

  for (let i = 1; i < userData.length; i++) {
    if (userData[i][0]) { // if user_id exists
      totalUsers++;
      if (userData[i][4] > 0) {
        totalChats += userData[i][4];
        usedDaily++;
      }
    }
  }

  const chatsSheet = spreadsheet.getSheetByName(SHEET_CHATS);
  const allChats = chatsSheet.getDataRange().getValues().length - 1;

  const report = `
Daily Usage Report
Date: ${new Date().toLocaleDateString()}

- Total Users: ${totalUsers}
- Users Active Today: ${usedDaily}
- Total Chat Requests Today: ${totalChats}
- Total Chat History: ${allChats}
Average: ${(totalChats / totalUsers).toFixed(2)} chats per user
  `;

  Logger.log(report);
  // sendAdminNotification('Daily Usage Report', report);
}

/**
 * Clear old chat history (lebih dari 30 hari)
 * Run secara berkala untuk cleaning
 */
function cleanOldChats() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_CHATS);
  const data = sheet.getDataRange().getValues();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  let deletedRows = 0;
  for (let i = data.length - 1; i > 0; i--) {
    const timestamp = new Date(data[i][3]);
    if (timestamp < thirtyDaysAgo) {
      sheet.deleteRow(i + 1);
      deletedRows++;
    }
  }

  Logger.log('Deleted ' + deletedRows + ' old chat messages');
}

/**
 * Get user statistics
 */
function getUserStats(userId) {
  const usersSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_USERS);
  const user = getUserById(userId);
  
  if (!user) {
    return null;
  }

  const chatsSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_CHATS);
  const chatsData = chatsSheet.getDataRange().getValues();
  
  let chatCount = 0;
  for (let i = 1; i < chatsData.length; i++) {
    if (chatsData[i][0] === userId) {
      chatCount++;
    }
  }

  return {
    userId: userId,
    email: user.email,
    role: user.role,
    dailyCount: user.dailyCount,
    totalChats: chatCount,
    joined: user.lastReset
  };
}

/**
 * Export all data to JSON
 * Useful untuk backup
 */
function exportToJSON() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  const usersData = spreadsheet.getSheetByName(SHEET_USERS).getDataRange().getValues();
  const chatsData = spreadsheet.getSheetByName(SHEET_CHATS).getDataRange().getValues();
  const dalilData = spreadsheet.getSheetByName(SHEET_DALIL).getDataRange().getValues();

  const exportData = {
    exportDate: new Date().toISOString(),
    users: rowsToObjects(usersData, ['user_id', 'email', 'role', 'daily_count', 'last_reset']),
    chats: rowsToObjects(chatsData, ['user_id', 'role', 'message', 'timestamp']),
    dalil: rowsToObjects(dalilData, ['id', 'sumber', 'referensi', 'teks', 'kata_kunci'])
  };

  Logger.log(JSON.stringify(exportData, null, 2));
  return JSON.stringify(exportData);
}

/**
 * Helper function untuk convert rows ke objects
 */
function rowsToObjects(rows, headers) {
  const objects = [];
  for (let i = 1; i < rows.length; i++) {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = rows[i][index];
    });
    objects.push(obj);
  }
  return objects;
}

/**
 * Setup triggers untuk automated tasks
 * Manual setup: Apps Script > Triggers > Create new trigger
 */
function setupTriggers() {
  // Daily cleanup dan reporting
  const triggers = ScriptApp.getProjectTriggers();
  
  // Remove existing triggers
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });

  // Create new triggers
  ScriptApp.newTrigger('dailyUsageReport')
    .timeBased()
    .atHour(23) // 11 PM
    .everyDays(1)
    .create();

  ScriptApp.newTrigger('cleanOldChats')
    .timeBased()
    .atHour(2) // 2 AM
    .everyDays(7) // Weekly
    .create();

  Logger.log('Triggers setup completed');
}

/**
 * DEBUG: Test search functionality
 */
function testSearch() {
  const queries = ['puasa', 'wudhu', 'zakat', 'solat'];
  
  queries.forEach(query => {
    const results = searchDalil(query);
    Logger.log(`\nSearching: "${query}"`);
    Logger.log('Results: ' + results.length);
    results.forEach(result => {
      Logger.log(`- ${result.sumber} (${result.referensi}): Score ${result.score}`);
    });
  });
}

/**
 * DEBUG: View all users
 */
function viewAllUsers() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_USERS);
  const data = sheet.getDataRange().getValues();
  
  Logger.log('=== ALL USERS ===');
  for (let i = 1; i < data.length; i++) {
    Logger.log(`${data[i][0]} | ${data[i][1]} | Role: ${data[i][3]} | Count: ${data[i][4]}`);
  }
}

/**
 * DEBUG: Clear all data (USE WITH CAUTION!)
 */
function clearAllData() {
  if (!confirm('Are you sure? This will delete all data!')) {
    return;
  }

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  [SHEET_USERS, SHEET_CHATS].forEach(sheetName => {
    const sheet = spreadsheet.getSheetByName(sheetName);
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
  });

  Logger.log('All data cleared');
}
