import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

function getAuthClient() {
  if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    throw new Error(
      "Google Sheets environment variables (GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY) are not configured."
    );
  }

  return new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function appendRow(sheetName: string, values: any[]) {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
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
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
    });

    return response.data.values || [];
  } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error(`Google Sheets Read Error (${sheetName}):`, err.message);
    // Return empty array instead of failing, to let local fallbacks work if config is missing
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateRow(sheetName: string, range: string, values: any[]) {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
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

