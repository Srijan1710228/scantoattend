import { google } from "googleapis";
import fs from "fs";
import path from "path";

function ensureEnvLoaded() {
  if (
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  ) {
    return;
  }

  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      content.split(/\r?\n/).forEach((line: string) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const firstEq = trimmed.indexOf("=");
        if (firstEq === -1) return;
        const key = trimmed.substring(0, firstEq).trim();
        let val = trimmed.substring(firstEq + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      });
    }
  } catch {}
}

function getAuthClient() {
  ensureEnvLoaded();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw new Error(
      "Google Sheets environment variables (GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY) are not configured."
    );
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function appendRow(sheetName: string, values: any[]) {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [values],
      },
    });
  } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error(`Google Sheets Append Error (${sheetName}):`, err.message);
    throw new Error(`Failed to save record to Google Sheets: ${err.message}`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getRows(sheetName: string): Promise<any[][]> {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
    });

    return response.data.values || [];
  } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error(`Google Sheets Read Error (${sheetName}):`, err.message);
    throw err;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateRow(sheetName: string, range: string, values: any[]) {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${sheetName}!${range}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [values],
      },
    });
  } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error(`Google Sheets Update Error (${sheetName}):`, err.message);
    throw new Error(`Failed to update record in Google Sheets: ${err.message}`);
  }
}

