// ==========================================
// HELPER SETUP FUNCTIONS
// ==========================================

function importSampleDaulData() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_DALIL);
  
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }

  const sampleData = [
    [1, 'Alquran', 'Al-Baqarah: 183', 'Walikum fi as-siyami hikmatun lilladhina amanu', 'puasa, ibadah, kesehatan, bulan ramadan'],
    [2, 'Alquran', 'Al-Maidah: 6', 'Ya ayyuha alladhina amanu idha qumtum ila as-salati faighsilu wujuhakum', 'wudhu, solat, kebersihan, ablution'],
    [3, 'Hadis', 'Shahih Bukhari 1904', 'Barang siapa yang berpuasa Ramadan karena iman akan diampuni dosa-dosanya', 'puasa, niat, ramadan, dosa'],
    [4, 'Alquran', 'At-Taubah: 60', 'Zakat itu hanya untuk orang miskin dan yang membutuhkan', 'zakat, sedekah, miskin, mustahik'],
    [5, 'Hadis', 'Jami at-Tirmidhi 2314', 'Tidak sempurna iman sampai mencintai saudara apa yang dicinta untuk diri', 'akhlak, iman, persaudaraan, cinta'],
  ];

  sampleData.forEach(item => {
    sheet.appendRow(item);
  });

  Logger.log('Sample data imported: ' + sampleData.length + ' items');
}

function testRegister() {
  const payload = {
    action: 'register',
    email: 'test@example.com',
    password: 'password123'
  };
  
  const result = handleRegister(payload);
  Logger.log(result.getContent());
}

function testLogin() {
  const payload = {
    action: 'login',
    email: 'test@example.com',
    password: 'password123'
  };
  
  const result = handleLogin(payload);
  Logger.log(result.getContent());
}

function dailyUsageReport() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usersSheet = spreadsheet.getSheetByName(SHEET_USERS);
  const userData = usersSheet.getDataRange().getValues();

  let totalUsers = 0;
  let totalChats = 0;
  let usedDaily = 0;

  for (let i = 1; i < userData.length; i++) {
    if (userData[i][0]) {
      totalUsers++;
      if (userData[i][4] > 0) {
        totalChats += userData[i][4];
        usedDaily++;
      }
    }
  }

  const report = `Daily Usage Report - ${new Date().toLocaleDateString()}
Total Users: ${totalUsers}
Active Today: ${usedDaily}
Total Chats Today: ${totalChats}`;

  Logger.log(report);
}
