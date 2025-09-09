function doGet(e) {
  try {
    // Memastikan parameter 'sheet' ada dalam permintaan
    if (!e.parameter.sheet) {
      throw new Error("Parameter 'sheet' tidak ditemukan dalam permintaan.");
    }
    
    const sheetName = e.parameter.sheet;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    // Jika nama sheet tidak ditemukan, kirim error yang jelas
    if (!sheet) {
      throw new Error(`Sheet dengan nama '${sheetName}' tidak ditemukan di Google Sheet Anda.`);
    }

    const range = sheet.getDataRange();
    const data = range.getValues();
    
    if (data.length < 2) {
       return createJsonResponse({ result: 'success', data: [] });
    }

    // Mengambil header (baris pertama) dan mengubahnya menjadi kunci JSON
    const headers = data.shift().map(h => h.toString().toLowerCase().trim().replace(/\s+/g, '_'));
    
    // Mengubah sisa baris menjadi array objek JSON
    const jsonArray = data.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return createJsonResponse({ result: 'success', data: jsonArray });

  } catch (error) {
    // Menangkap error apapun dan mengirimkannya kembali sebagai JSON
    return createJsonResponse({ result: 'error', message: error.message });
  }
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pengguna");
    const noWa = e.parameter.No_WA;

    // Cek duplikasi berdasarkan No_WA
    const data = sheet.getDataRange().getValues();
    const waColumnIndex = data[0].findIndex(header => header.toLowerCase().trim() === 'no_wa');
    
    if (waColumnIndex !== -1) {
        const isDuplicate = data.slice(1).some(row => row[waColumnIndex] == noWa);
        if (isDuplicate) {
            return createJsonResponse({ result: 'success', message: 'User already exists.' });
        }
    }

    // Jika tidak duplikasi, tambahkan data baru
    const headers = data[0];
    const newRow = headers.map(header => e.parameter[header] || "");
    sheet.appendRow(newRow);

    return createJsonResponse({ result: 'success', message: 'User added successfully.' });
  } catch (error) {
    return createJsonResponse({ result: 'error', message: error.message });
  }
}

// Fungsi helper untuk membuat respons JSON yang standar
function createJsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

