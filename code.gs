var startTime;  // Variabel untuk mencatat waktu mulai eksekusi skrip

function copyAndRenameFolders2() {
  // Menyimpan waktu mulai eksekusi skrip
  startTime = new Date().getTime();
  
  // Akses spreadsheet aktif dan pilih sheet "copyfile"
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("copyfile");
  var data = sheet.getDataRange().getValues(); // Ambil seluruh data di sheet
  
  
  // Log untuk menandakan awal proses
  Logger.log('Memulai proses penyalinan folder...');
  
  // Loop melalui data yang ada di sheet
  for (var i = 1; i < data.length; i++) {  // Mulai dari index 1 untuk melewatkan header
    var folderLink = data[i][0]; // Link folder
    var newFolderName = data[i][1]; // Nama folder baru
    var status = data[i][2]; // Status (kolom "status")
    var timestamp = data[i][3]; // Timestamp (kolom "timestamp")
    var parentFolderId = data[i][4]; // ID parent folder (kolom ke-5 dalam sheet "copyfile")


    // Jika status kosong (belum diproses) atau belum ada timestamp, proses data ini
    if (!status || status.toLowerCase() !== 'done') {
      try {

               // Mengecek apakah waktu eksekusi sudah melebihi 4 menit
        if (isExecutionTimeExceeded()) {
          Logger.log('Waktu eksekusi sudah lebih dari 4 menit. Menghentikan proses.');
          break; // Stop eksekusi jika sudah lebih dari 4 menit
        }

    

        Logger.log('Proses dimulai untuk folder dengan link: ' + folderLink);
        
        // Ambil folder sumber dari link
        var folderId = extractFolderIdFromLink(folderLink);
        var folder = DriveApp.getFolderById(folderId);
        
        // Ambil parent folder dari ID yang ada di kolom "parent_folder_id"
        var parentFolder = DriveApp.getFolderById(parentFolderId);

        // Cek apakah folder dengan nama yang sama sudah ada di parentFolder
        if (isFolderExist(parentFolder, newFolderName)) {
          Logger.log('Folder dengan nama ' + newFolderName + ' sudah ada di parent folder. Melewati folder ini.');
          updateStatusAndTimestamp(i + 1, 'done');
          continue;  // Skip ke baris berikutnya jika folder sudah ada
        }
        
        // Buat folder baru di parentFolder dengan nama baru
        Logger.log('Membuat folder baru dengan nama: ' + newFolderName);
        var copiedFolder = parentFolder.createFolder(newFolderName);
        
        // Menyalin isi folder atau membuat shortcut tergantung pada waktu eksekusi
        Logger.log('Menyalin isi folder: ' + folder.getName() + ' ke ' + newFolderName);
        copyFolderContents(folder, copiedFolder);
        
        Logger.log('Folder berhasil disalin dengan nama: ' + newFolderName);
        
        // Update status dan timestamp pada sheet "copyfile"
        updateStatusAndTimestamp(i + 1, 'done');  // +1 karena baris di spreadsheet dimulai dari 1
        
      } catch (e) {
        Logger.log('Terjadi kesalahan pada folder ' + folderLink + ': ' + e.message);
      }
    } else {
      Logger.log('Folder sudah diproses atau status sudah "done" pada baris ' + (i + 1));
    }
  }
  
  Logger.log('Proses penyalinan folder selesai.');
}

// Fungsi untuk mengekstrak ID folder dari link folder Google Drive
function extractFolderIdFromLink(link) {
  var match = link.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    Logger.log('ID folder ditemukan: ' + match[1]);
    return match[1];
  } else {
    throw new Error('ID folder tidak dapat ditemukan dari link: ' + link);
  }
}

// Fungsi untuk menyalin isi folder termasuk subfolder dan file
function copyFolderContents(sourceFolder, destinationFolder) {
  // Menyalin file di dalam folder sumber
  var files = sourceFolder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    
    // Cek apakah file dengan nama yang sama sudah ada di destinationFolder
    if (isFileExist(destinationFolder, file.getName())) {
      Logger.log('File dengan nama ' + file.getName() + ' sudah ada di folder tujuan. Melewati file ini.');
      continue;  // Skip jika file sudah ada
    }
    
    Logger.log('Menyalin file: ' + file.getName() + ' ke dalam folder: ' + destinationFolder.getName());
    file.makeCopy(file.getName(), destinationFolder);
  }
  
  // Menyalin subfolder di dalam folder sumber secara rekursif
  var subfolders = sourceFolder.getFolders();
  while (subfolders.hasNext()) {
    var subfolder = subfolders.next();
    
    // Cek apakah subfolder dengan nama yang sama sudah ada di destinationFolder
    if (isFolderExist(destinationFolder, subfolder.getName())) {
      Logger.log('Subfolder dengan nama ' + subfolder.getName() + ' sudah ada di folder tujuan. Melewati subfolder ini.');
      continue;  // Skip jika subfolder sudah ada
    }
    
    // Buat subfolder di dalam destinationFolder dengan nama yang sama
    Logger.log('Membuat subfolder: ' + subfolder.getName() + ' di dalam folder: ' + destinationFolder.getName());
    var copiedSubfolder = destinationFolder.createFolder(subfolder.getName());
    
    // Panggil fungsi ini secara rekursif untuk menyalin isi subfolder
    copyFolderContents(subfolder, copiedSubfolder);
  }
}

// Fungsi untuk memeriksa apakah waktu eksekusi sudah melebihi 4 menit
function isExecutionTimeExceeded() {
  var currentTime = new Date().getTime();
  var elapsedTime = (currentTime - startTime) / 1000;  // Waktu dalam detik
  
  // Jika waktu eksekusi lebih dari 4 menit (240 detik), kembalikan true
  if (elapsedTime > 240) {
    return true;
  }
  
  return false;
}

// Fungsi untuk mengupdate status dan timestamp pada sheet "copyfile"
function updateStatusAndTimestamp(rowIndex, status) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("copyfile");
  var timestamp = new Date();
  
  // Update status dan timestamp pada baris yang sesuai
  sheet.getRange(rowIndex, 3).setValue(status); // Kolom "status" adalah kolom ke-3
  sheet.getRange(rowIndex, 4).setValue(timestamp); // Kolom "timestamp" adalah kolom ke-4
}

// Fungsi untuk mengecek apakah folder dengan nama yang sama sudah ada di folder tujuan
function isFolderExist(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  return folders.hasNext();  // Jika folder ditemukan, kembalikan true
}

// Fungsi untuk mengecek apakah file dengan nama yang sama sudah ada di folder tujuan
function isFileExist(parentFolder, fileName) {
  var files = parentFolder.getFilesByName(fileName);
  return files.hasNext();  // Jika file ditemukan, kembalikan true
}
