import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

// Prevent redundant sign-in prompts
let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize the Auth connection
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Initiate Google Sign-In pop-up
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (isSigningIn) return null;
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('OAuth configuration/sign-in failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Logs the current user out
export const googleSignOut = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Get the cached accessToken
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

// Format function for currency to write to sheets
const formatCurrencyValue = (val: number) => `$${val.toFixed(2)}`;

// Create a premium master spreadsheet with tabs
export const createMasterSpreadsheet = async (
  token: string,
  title: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title || 'WIS School Management Master Sheet',
      },
      sheets: [
        { properties: { title: 'ព័ត៌មានបុគ្គលិក (Staff List)' } },
        { properties: { title: 'វត្តមានបុគ្គលិក (Attendance)' } },
        { properties: { title: 'ការចំណាយភ្លើង (Electricity)' } },
        { properties: { title: 'ការចំណាយទឹក (Water Supply)' } },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Failed to create Master Google Sheet: Network/OAuth Error');
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
  };
};

// Check if spreadsheet exists
export const checkSpreadsheetExists = async (token: string, spreadsheetId: string): Promise<boolean> => {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

interface SyncDataInput {
  staffList: any[];
  attendanceRecords: any[];
  electricityRecords: any[];
  waterRecords: any[];
}

// Write the current application state to Google sheets via batchUpdate
export const syncDataToSpreadsheet = async (
  token: string,
  spreadsheetId: string,
  data: SyncDataInput
): Promise<void> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;

  // 1. Prepare Staff Data
  const staffHeader = [
    'លេខសម្គាល់បុគ្គលិក (Staff ID)',
    'ឈ្មោះបុគ្គលិក (Full Name)',
    'ភេទ (Gender)',
    'អត្តសញ្ញាណប័ណ្ណ (National ID/Passport)',
    'ផ្នែក/ដេប៉ាតឺម៉ង់ (Department)',
    'តួនាទី (Role)',
    'លេខទូរស័ព្ទ (Phone Number)',
    'អ៊ីមែល (Email)',
    'ស្ថានភាពបុគ្គលិក (Active Status)',
    'កាលបរិច្ឆេទបង្កើត (Created At)'
  ];
  const staffRows = data.staffList.map((s) => [
    s.staffId,
    s.name,
    s.gender === 'M' ? 'ប្រុស' : 'ស្រី',
    s.nationalId || '-',
    s.department,
    s.role,
    s.phone || '-',
    s.email || '-',
    s.isActive ? 'កំពុងធ្វើការ' : 'ឈប់សម្រាក',
    s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'
  ]);

  // 2. Prepare Attendance Data
  const attendanceHeader = [
    'កាលបរិច្ឆេទ (Date)',
    'លេខសម្គាល់ (Staff ID)',
    'ឈ្មោះបុគ្គលិក (Name)',
    'ផ្នែក/ដេប៉ាតឺម៉ង់ (Department)',
    'ស្ថានភាពវត្តមាន (Status)',
    'មូលហេតុ/សម្គាល់ (Notes)',
    'ស្រង់វត្តមាននៅ (Recorded At)'
  ];
  const sortedAttendance = [...data.attendanceRecords].sort((a, b) => b.date.localeCompare(a.date));
  const attendanceRows = sortedAttendance.map((att) => {
    const staff = data.staffList.find((s) => s.staffId === att.staffId);
    return [
      att.date,
      att.staffId,
      staff?.name || 'Unknown',
      staff?.department || 'Unknown',
      att.status === 'Present' ? 'វត្តមាន' : att.status === 'Excused' ? 'ច្បាប់' : 'អវត្តមាន',
      att.notes || '-',
      att.recordedAt ? new Date(att.recordedAt).toLocaleString() : '-'
    ];
  });

  // 3. Prepare Electricity Records Data
  const electricityHeader = [
    'ខែ-ឆ្នាំ (Month-Year)',
    'ចំណាយខែមុន (Before USD)',
    'ចំណាយខែនេះ (After USD)',
    'គម្លាតប្រាក់ ($ Difference)',
    'ភាគរយគម្លាត (% Difference)',
    'អ្នកបញ្ចូលព័ត៌មាន (Recorded By)',
    'សម្គាល់ (Notes)',
    'ពេលវេលាបញ្ចូល (Recorded At)'
  ];
  const sortedElectric = [...data.electricityRecords].sort((a, b) => b.monthYear.localeCompare(a.monthYear));
  const electricRows = sortedElectric.map((elec) => [
    elec.monthYear,
    formatCurrencyValue(elec.costBeforeUsd),
    formatCurrencyValue(elec.costAfterUsd),
    formatCurrencyValue(elec.differenceUsd),
    `${elec.differencePercent.toFixed(2)}%`,
    elec.recordedBy || 'LOUNG Veasna',
    elec.notes || '-',
    elec.recordedAt ? new Date(elec.recordedAt).toLocaleString() : '-'
  ]);

  // 4. Prepare Water Records Data
  const waterHeader = [
    'ខែ-ឆ្នាំ (Month-Year)',
    'ចំណាយខែមុន (Before USD)',
    'ចំណាយខែនេះ (After USD)',
    'គម្លាតប្រាក់ ($ Difference)',
    'ភាគរយគម្លាត (% Difference)',
    'អ្នកបញ្ចូលព័ត៌មាន (Recorded By)',
    'សម្គាល់ (Notes)',
    'ពេលវេលាបញ្ចូល (Recorded At)'
  ];
  const sortedWater = [...data.waterRecords].sort((a, b) => b.monthYear.localeCompare(a.monthYear));
  const waterRows = sortedWater.map((wat) => [
    wat.monthYear,
    formatCurrencyValue(wat.costBeforeUsd),
    formatCurrencyValue(wat.costAfterUsd),
    formatCurrencyValue(wat.differenceUsd),
    `${wat.differencePercent.toFixed(2)}%`,
    wat.recordedBy || 'LOUNG Veasna',
    wat.notes || '-',
    wat.recordedAt ? new Date(wat.recordedAt).toLocaleString() : '-'
  ]);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: "'ព័ត៌មានបុគ្គលិក (Staff List)'!A1:J1000",
          values: [staffHeader, ...staffRows],
        },
        {
          range: "'វត្តមានបុគ្គលិក (Attendance)'!A1:G2000",
          values: [attendanceHeader, ...attendanceRows],
        },
        {
          range: "'ការចំណាយភ្លើង (Electricity)'!A1:H1000",
          values: [electricityHeader, ...electricRows],
        },
        {
          range: "'ការចំណាយទឹក (Water Supply)'!A1:H1000",
          values: [waterHeader, ...waterRows],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Failed to update Google Sheets cells');
  }
};

// List Google Drive files matching our search criteria (PDF, Excel, Docs, Images)
export const listGoogleDriveFiles = async (token: string, search?: string): Promise<any[]> => {
  let query = "trashed = false and (mimeType = 'application/pdf' or mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' or mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType.startsWith('image/'))";
  if (search) {
    const escapedSearch = search.replace(/'/g, "\\'");
    query += ` and name contains '${escapedSearch}'`;
  }
  
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&pageSize=50&fields=files(id,name,mimeType,size,modifiedTime,iconLink)`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Failed to fetch files from Google Drive');
  }

  const data = await response.json();
  return data.files || [];
};

// Download Drive binary file
export const downloadDriveFile = async (token: string, fileId: string): Promise<Blob> => {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to download Google Drive file contents.');
  }

  return await response.blob();
};

// Export native Google Documents/Sheets to PDF or Excel formats
export const exportGoogleDoc = async (token: string, fileId: string, mimeType: string): Promise<Blob> => {
  let targetMimeType = 'application/pdf';
  if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    targetMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(targetMimeType)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to export Google document/sheet to local format.');
  }

  return await response.blob();
};
