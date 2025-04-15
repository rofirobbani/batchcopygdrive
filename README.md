# 📁 Google Drive Recursive File Copier using Apps Script

This Google Apps Script allows you to **mass copy files and folders** from Google Drive, including all nested subfolders. It’s designed to be used with a Google Sheet as the controller and tracker.

---

## ✅ Features

- Recursively copies files and folders from a source folder
- Preserves folder structure
- Supports multiple copy tasks via Google Sheet
- Tracks copy status and timestamps
- Easy to set up and run

---

## 🗂️ How It Works

Create a Google Sheet with a sheet named `copyfile`. Use the following columns:

| Column | Description |
|--------|-------------|
| `link` | The link to the **source folder** you want to copy. |
| `folder_name` | Name of the new folder to be created in the destination. |
| `status` | Auto-filled by the script with success or error messages. |
| `timestamp` | Auto-filled with the time the copy operation was completed. |
| `IDFolder` | The **ID** of the destination folder in your Google Drive. |

Each row in the sheet triggers a new copy operation.

---

## ⚠️ Limitations

1. The script **does not support versioning or updating** files that already exist in the destination folder.
2. Execution is limited by **Google Apps Script's 6-minute time limit** (script is optimized for ~4 minutes).
3. The source folder must be accessible with at least **Viewer access** to copy its contents.

---

## 🔧 Setup Instructions

1. Open [Google Apps Script](https://script.google.com).
2. Link it to a new or existing Google Sheet.
3. Create a sheet named `copyfile` and follow the structure above.
4. Paste the script code.
5. Authorize the script to access your Drive and Sheets.
6. Run the main function to begin copying.

---

## 🧪 Example

Here’s an example of how your `copyfile` sheet might look:

| link | folder_name | status | timestamp | IDFolder |
|------|-------------|--------|-----------|----------|
| `https://drive.google.com/drive/folders/1abcDEF...` | `Project_Backup` | Completed | 2025-04-15 13:45:00 | `1XYZ456...` |

---

