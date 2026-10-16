export const GAS_STANDALONE_SCRIPT = `/**
 * ============================================================================
 * GABSI KOTA BATU — BACKEND HEADLESS GOOGLE APPS SCRIPT (STANDALONE VERSION)
 * ID SPREADSHEET: 1tyYyUpBnbv7OtHuEbG7qf4pn0mCnjzDG-sSgZ99H8F4
 * Developed for: Pengurus Cabang GABSI (Bridge) Kota Batu
 * ============================================================================
 * 
 * CARA PASANG:
 * 1. Buka https://script.google.com
 * 2. Klik "+ Project baru"
 * 3. Beri nama: "GABSI Batu - Backend REST API"
 * 4. Hapus semua kode default di Code.gs, lalu paste seluruh skrip ini.
 * 5. Klik ikon Disket (Save / Simpan).
 * 6. Klik tombol "Deploy" (di kanan atas) > "New deployment" (Deployment baru).
 *    - Pilih type: "Web app" (ikon bola dunia).
 *    - Description: "Versi 2.0 REST API Standalone"
 *    - Execute as: "Me" (Akun Google Anda)
 *    - Who has access: "Anyone" (Siapa saja, termasuk anonim)
 * 7. Klik "Deploy" dan izinkan otorisasi (Review permissions > Advanced > Go to project).
 * 8. Salin "Web app URL" (akhiran /exec) dan tempelkan di Headless GAS Center pada Web App!
 */

const SPREADSHEET_ID = "1tyYyUpBnbv7OtHuEbG7qf4pn0mCnjzDG-sSgZ99H8F4";

const SHEET_CATEGORIES = "Kategori";
const SHEET_ACCOUNTS = "Akun";
const SHEET_MEMBERS = "Anggota";
const SHEET_EVENTS = "Event";
const SHEET_TRANSACTIONS = "Transaksi";
const SHEET_USERS = "Pengguna";
const SHEET_ROLES = "Peran";
const SHEET_HISTORY = "RiwayatTransaksi";
const SHEET_ACTIVITY = "RiwayatAktivitas";

/** Helper Response JSON dengan CORS */
function jsonResponse(data, status) {
  var payload = JSON.stringify({
    success: status !== false,
    timestamp: new Date().toISOString(),
    data: data
  });
  return ContentService.createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}

/** Error Response Helper */
function errorResponse(msg) {
  return jsonResponse({ error: msg }, false);
}

/** Buka Spreadsheet target */
function getSS_() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch(e) {
    throw new Error("Gagal membuka Spreadsheet ID: " + SPREADSHEET_ID + ". Pastikan akun Google script ini memiliki hak akses minimal Editor.");
  }
}

/** Helper ambil sheet & buat jika belum ada */
function getSheet_(name, headers) {
  var ss = getSS_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#F1F5F9");
  }
  return sheet;
}

/** Pastikan seluruh struktur tabel tersedia */
function ensureSheets_() {
  getSheet_(SHEET_CATEGORIES, ["Jenis", "Nama"]);
  getSheet_(SHEET_ACCOUNTS, ["ID", "Nama", "Jenis", "SaldoAwal"]);
  getSheet_(SHEET_MEMBERS, ["ID", "Nama", "NoHP", "Status", "IuranBulanan"]);
  getSheet_(SHEET_EVENTS, ["ID", "Nama", "Tanggal", "Lokasi"]);
  getSheet_(SHEET_TRANSACTIONS, ["ID", "Tanggal", "Jenis", "AccountId", "Kategori", "Deskripsi", "Jumlah", "DicatatOleh", "ToAccountId", "MemberId", "EventId", "DibuatPada"]);
  getSheet_(SHEET_USERS, ["Email", "Nama", "RoleID", "PIN", "IsDefaultPIN", "DibuatPada"]);
  getSheet_(SHEET_ROLES, ["ID", "Nama", "Deskripsi", "PermissionsJSON"]);
  getSheet_(SHEET_HISTORY, ["ID", "TransactionID", "DieditOleh", "DieditPada", "SnapshotLama"]);
  getSheet_(SHEET_ACTIVITY, ["ID", "Waktu", "Email", "Entitas", "Aksi", "Deskripsi"]);
}

function formatDate_(v) {
  if (Object.prototype.toString.call(v) === "[object Date]") {
    return Utilities.formatDate(v, Session.getScriptTimeZone() || "Asia/Jakarta", "yyyy-MM-dd");
  }
  return String(v || "").slice(0, 10);
}

function formatDateTime_(v) {
  if (Object.prototype.toString.call(v) === "[object Date]") {
    return Utilities.formatDate(v, Session.getScriptTimeZone() || "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
  }
  return String(v || "");
}

function clearBody_(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow > 1 && lastCol >= 1) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  }
}

/** Log Riwayat Aktivitas */
function logActivity_(email, entity, action, description) {
  try {
    var sheet = getSheet_(SHEET_ACTIVITY, ["ID", "Waktu", "Email", "Entitas", "Aksi", "Deskripsi"]);
    sheet.appendRow([Utilities.getUuid(), new Date(), email || "system", entity, action, description || ""]);
  } catch(e) {
    Logger.log("Gagal log activity: " + e.message);
  }
}

/** REST API: GET Endpoint */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "ping";

  try {
    ensureSheets_();

    if (action === "ping") {
      var ss = getSS_();
      return jsonResponse({
        status: "connected",
        mode: "standalone",
        spreadsheetTitle: ss.getName(),
        spreadsheetId: SPREADSHEET_ID,
        message: "Koneksi Headless GAS Standalone Aktif & Terhubung!"
      });
    }

    if (action === "getData") {
      return jsonResponse(fetchAllData_());
    }

    if (action === "getHistory") {
      var txId = e.parameter.txId;
      return jsonResponse(fetchTxHistory_(txId));
    }

    return errorResponse("Aksi GET tidak dikenal: " + action);
  } catch (err) {
    return errorResponse(err.message || String(err));
  }
}

/** REST API: POST Endpoint */
function doPost(e) {
  var lock = LockService.getScriptLock();
  // Tunggu lock sampai 30 detik untuk anti-race condition
  var hasLock = lock.tryLock(30000);
  if (!hasLock) {
    return errorResponse("Server sibuk sedang memproses transaksi lain. Silakan coba 5 detik lagi.");
  }

  try {
    ensureSheets_();
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }
    var action = payload.action || "saveAll";

    if (action === "saveAll") {
      saveAllData_(payload.data, payload.userEmail);
      return jsonResponse({ message: "Semua data berhasil disimpan ke Google Sheets." });
    }

    if (action === "commitTx") {
      var result = commitSingleTx_(payload.tx, payload.userEmail);
      return jsonResponse({ message: "Transaksi berhasil dicatat.", tx: result });
    }

    if (action === "changePin") {
      updateUserPin_(payload.email, payload.newPin);
      return jsonResponse({ message: "PIN berhasil diperbarui." });
    }

    return errorResponse("Aksi POST tidak dikenal: " + action);
  } catch(err) {
    return errorResponse(err.message || String(err));
  } finally {
    lock.releaseLock();
  }
}

/** Mengambil seluruh data sheet dalam format JSON terstruktur */
function fetchAllData_() {
  var ss = getSS_();

  // 1. Kategori
  var catSheet = ss.getSheetByName(SHEET_CATEGORIES);
  var catRows = catSheet.getLastRow() > 1 ? catSheet.getRange(2, 1, catSheet.getLastRow() - 1, 2).getValues() : [];
  var categories = { income: [], expense: [] };
  catRows.forEach(function(r) {
    if (!r[1]) return;
    if (r[0] === "income") categories.income.push(String(r[1]));
    else if (r[0] === "expense") categories.expense.push(String(r[1]));
  });

  // 2. Akun
  var accSheet = ss.getSheetByName(SHEET_ACCOUNTS);
  var accRows = accSheet.getLastRow() > 1 ? accSheet.getRange(2, 1, accSheet.getLastRow() - 1, 4).getValues() : [];
  var accounts = accRows.filter(function(r) { return r[0]; }).map(function(r) {
    return { id: String(r[0]), name: String(r[1]), type: String(r[2] || "Kas"), initialBalance: Number(r[3]) || 0 };
  });

  // 3. Anggota
  var memSheet = ss.getSheetByName(SHEET_MEMBERS);
  var memRows = memSheet.getLastRow() > 1 ? memSheet.getRange(2, 1, memSheet.getLastRow() - 1, 5).getValues() : [];
  var members = memRows.filter(function(r) { return r[0]; }).map(function(r) {
    return { id: String(r[0]), name: String(r[1]), phone: String(r[2] || ""), status: String(r[3] || "Aktif"), monthlyDues: Number(r[4]) || 0 };
  });

  // 4. Event
  var evtSheet = ss.getSheetByName(SHEET_EVENTS);
  var evtRows = evtSheet.getLastRow() > 1 ? evtSheet.getRange(2, 1, evtSheet.getLastRow() - 1, 4).getValues() : [];
  var events = evtRows.filter(function(r) { return r[0]; }).map(function(r) {
    return { id: String(r[0]), name: String(r[1]), date: formatDate_(r[2]), location: String(r[3] || "") };
  });

  // 5. Transaksi
  var txSheet = ss.getSheetByName(SHEET_TRANSACTIONS);
  var txRows = txSheet.getLastRow() > 1 ? txSheet.getRange(2, 1, txSheet.getLastRow() - 1, 12).getValues() : [];
  var transactions = txRows.filter(function(r) { return r[0]; }).map(function(r) {
    return {
      id: String(r[0]),
      date: formatDate_(r[1]),
      type: String(r[2]),
      accountId: String(r[3]),
      category: String(r[4] || ""),
      desc: String(r[5] || ""),
      amount: Number(r[6]) || 0,
      createdBy: String(r[7] || ""),
      toAccountId: String(r[8] || ""),
      memberId: String(r[9] || ""),
      eventId: String(r[10] || ""),
      createdAt: formatDateTime_(r[11])
    };
  });

  // 6. Pengguna
  var userSheet = ss.getSheetByName(SHEET_USERS);
  var userRows = userSheet.getLastRow() > 1 ? userSheet.getRange(2, 1, userSheet.getLastRow() - 1, 6).getValues() : [];
  var users = userRows.filter(function(r) { return r[0]; }).map(function(r) {
    return {
      email: String(r[0]),
      name: String(r[1] || ""),
      roleId: String(r[2] || "user"),
      pin: String(r[3] || "123456"),
      isDefaultPin: String(r[4]).toLowerCase() === "true",
      createdAt: formatDateTime_(r[5])
    };
  });

  // 7. Riwayat Aktivitas (100 terbaru)
  var actSheet = ss.getSheetByName(SHEET_ACTIVITY);
  var actRows = actSheet.getLastRow() > 1 ? actSheet.getRange(Math.max(2, actSheet.getLastRow() - 100), 1, Math.min(100, actSheet.getLastRow() - 1), 6).getValues() : [];
  var activityLogs = actRows.filter(function(r) { return r[0]; }).map(function(r) {
    return { id: String(r[0]), time: formatDateTime_(r[1]), email: String(r[2]), entity: String(r[3]), action: String(r[4]), desc: String(r[5] || "") };
  }).reverse();

  return {
    categories: categories,
    accounts: accounts,
    members: members,
    events: events,
    transactions: transactions,
    users: users,
    activityLogs: activityLogs
  };
}

/** Menyimpan seluruh dataset ke Google Sheets */
function saveAllData_(data, userEmail) {
  var ss = getSS_();
  userEmail = userEmail || "system";

  // Simpan Kategori
  if (data.categories) {
    var catSheet = ss.getSheetByName(SHEET_CATEGORIES);
    clearBody_(catSheet);
    var catRows = [];
    (data.categories.income || []).forEach(function(c) { catRows.push(["income", c]); });
    (data.categories.expense || []).forEach(function(c) { catRows.push(["expense", c]); });
    if (catRows.length) catSheet.getRange(2, 1, catRows.length, 2).setValues(catRows);
  }

  // Simpan Akun
  if (data.accounts) {
    var accSheet = ss.getSheetByName(SHEET_ACCOUNTS);
    clearBody_(accSheet);
    var accRows = (data.accounts || []).map(function(a) { return [a.id, a.name, a.type || "Kas", a.initialBalance || 0]; });
    if (accRows.length) accSheet.getRange(2, 1, accRows.length, 4).setValues(accRows);
  }

  // Simpan Anggota
  if (data.members) {
    var memSheet = ss.getSheetByName(SHEET_MEMBERS);
    clearBody_(memSheet);
    var memRows = (data.members || []).map(function(m) { return [m.id, m.name, m.phone || "", m.status || "Aktif", m.monthlyDues || 0]; });
    if (memRows.length) memSheet.getRange(2, 1, memRows.length, 5).setValues(memRows);
  }

  // Simpan Event
  if (data.events) {
    var evtSheet = ss.getSheetByName(SHEET_EVENTS);
    clearBody_(evtSheet);
    var evtRows = (data.events || []).map(function(e) { return [e.id, e.name, e.date, e.location || ""]; });
    if (evtRows.length) evtSheet.getRange(2, 1, evtRows.length, 4).setValues(evtRows);
  }

  // Simpan Transaksi
  if (data.transactions) {
    var txSheet = ss.getSheetByName(SHEET_TRANSACTIONS);
    clearBody_(txSheet);
    var txRows = (data.transactions || []).map(function(t) {
      return [
        t.id, t.date, t.type, t.accountId, t.category || "", t.desc || "",
        t.amount || 0, t.createdBy || userEmail, t.toAccountId || "", t.memberId || "",
        t.eventId || "", t.createdAt || new Date()
      ];
    });
    if (txRows.length) txSheet.getRange(2, 1, txRows.length, 12).setValues(txRows);
  }

  // Simpan Pengguna
  if (data.users) {
    var userSheet = ss.getSheetByName(SHEET_USERS);
    clearBody_(userSheet);
    var userRows = (data.users || []).map(function(u) {
      return [u.email, u.name, u.roleId || "user", u.pin || "123456", u.isDefaultPin ? "true" : "false", u.createdAt || new Date()];
    });
    if (userRows.length) userSheet.getRange(2, 1, userRows.length, 6).setValues(userRows);
  }

  logActivity_(userEmail, "Database", "Ubah", "Sinkronisasi menyeluruh (Save All) berhasil.");
}

/** Commit / Simpan 1 transaksi baru atau update */
function commitSingleTx_(tx, userEmail) {
  var ss = getSS_();
  var sheet = ss.getSheetByName(SHEET_TRANSACTIONS);
  var rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 12).getValues() : [];
  var existingIdx = -1;

  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === String(tx.id)) {
      existingIdx = i;
      break;
    }
  }

  var rowData = [
    tx.id, tx.date, tx.type, tx.accountId, tx.category || "", tx.desc || "",
    tx.amount || 0, tx.createdBy || userEmail, tx.toAccountId || "", tx.memberId || "",
    tx.eventId || "", tx.createdAt || new Date()
  ];

  if (existingIdx >= 0) {
    // Catat riwayat perubahan ke sheet RiwayatTransaksi
    var oldRow = rows[existingIdx];
    var histSheet = ss.getSheetByName(SHEET_HISTORY);
    var snapshot = {
      date: formatDate_(oldRow[1]), type: oldRow[2], accountId: oldRow[3],
      category: oldRow[4], desc: oldRow[5], amount: oldRow[6],
      toAccountId: oldRow[8], memberId: oldRow[9], eventId: oldRow[10]
    };
    histSheet.appendRow([Utilities.getUuid(), tx.id, userEmail, new Date(), JSON.stringify(snapshot)]);

    // Update row
    sheet.getRange(existingIdx + 2, 1, 1, 12).setValues([rowData]);
    logActivity_(userEmail, "Transaksi", "Ubah", tx.type + " Rp " + tx.amount + " (" + (tx.desc || tx.category) + ")");
  } else {
    // Tambah baru
    sheet.appendRow(rowData);
    logActivity_(userEmail, "Transaksi", "Tambah", tx.type + " Rp " + tx.amount + " (" + (tx.desc || tx.category) + ")");
  }
  return tx;
}

/** Update PIN Pengguna */
function updateUserPin_(email, newPin) {
  var ss = getSS_();
  var sheet = ss.getSheetByName(SHEET_USERS);
  var rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues() : [];

  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]).toLowerCase() === String(email).toLowerCase()) {
      sheet.getRange(i + 2, 4, 1, 2).setValues([[newPin, "false"]]);
      logActivity_(email, "Pengguna", "Ganti PIN", "Pengguna memperbarui PIN akses mandiri.");
      return true;
    }
  }
  throw new Error("Pengguna dengan email " + email + " tidak ditemukan.");
}

/** Ambil riwayat audit per transaksi */
function fetchTxHistory_(txId) {
  var ss = getSS_();
  var sheet = ss.getSheetByName(SHEET_HISTORY);
  var rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues() : [];
  return rows.filter(function(r) { return String(r[1]) === String(txId); }).map(function(r) {
    return {
      id: String(r[0]),
      transactionId: String(r[1]),
      editedBy: String(r[2]),
      editedAt: formatDateTime_(r[3]),
      oldSnapshot: JSON.parse(r[4])
    };
  });
}
`;
