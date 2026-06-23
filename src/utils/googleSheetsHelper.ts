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

// Sync Classroom Equipment and Inventory to Google Sheets
export const syncClassroomEquipmentToSpreadsheet = async (
  token: string,
  spreadsheetId: string,
  rooms: any[],
  equipmentTypes: any[]
): Promise<void> => {
  // 1. Fetch current sheets to see if target tabs exist
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(title))`;
  const metaRes = await fetch(metaUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!metaRes.ok) {
    const errData = await metaRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to fetch spreadsheet metadata');
  }

  const metaData = await metaRes.json();
  const existingSheetTitles = (metaData.sheets || []).map((s: any) => s.properties.title);

  const targetSheets = [
    'សម្ភារៈបន្ទប់រៀន (Classroom Inventory)',
    'កំណត់ត្រាថែទាំសម្ភារៈ (Maintenance Logs)'
  ];

  const requests: any[] = [];
  for (const title of targetSheets) {
    if (!existingSheetTitles.includes(title)) {
      requests.push({
        addSheet: {
          properties: { title }
        }
      });
    }
  }

  // Add missing tabs if any
  if (requests.length > 0) {
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const updateRes = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!updateRes.ok) {
      const errData = await updateRes.json().catch(() => ({}));
      throw new Error(errData?.error?.message || 'Failed to add missing sheets to Google Spreadsheet');
    }
  }

  // 2. Prepare Classroom Inventory Headers and Rows
  const invHeaders = [
    'លេខសម្គាល់បន្ទប់ (Room ID)',
    'ឈ្មោះបន្ទប់/លេខបន្ទប់ (Room Number)',
    'ទីតាំង/អាគារ (Location/Building)',
    'ជាន់ (Floor)',
    'កំណត់សម្គាល់ (Remarks)',
    ...equipmentTypes.map(eq => `${eq.label} (Qty)`)
  ];

  const invRows = rooms.map(room => {
    const eqValues = equipmentTypes.map(eq => room.equipment?.[eq.key] || 0);
    return [
      room.id,
      room.roomNumber,
      room.location || '-',
      room.floor || '-',
      room.remarks || '-',
      ...eqValues
    ];
  });

  // 3. Prepare Maintenance Logs Headers and Rows
  const logHeaders = [
    'លេខសម្គាល់កំណត់ត្រា (Log ID)',
    'លេខបន្ទប់ (Room Number)',
    'ឧបករណ៍ (Equipment Type)',
    'ចំនួន (Quantity)',
    'ស្ថានភាព (Condition)',
    'បញ្ហាដែលបានរាយការណ៍ (Reported Issue)',
    'កាលបរិច្ឆេទរាយការណ៍ (Report Date)',
    'កាលបរិច្ឆេទជួសជុល (Repair Date)',
    'ស្ថានភាពជួសជុល (Repair Status)',
    'កំណត់សម្គាល់ផ្សេងៗ (Maintenance Remarks)',
    'រូបថតសកម្មភាព (Photo URL)'
  ];

  const allLogs: any[] = [];
  rooms.forEach(room => {
    if (room.maintenanceLogs && Array.isArray(room.maintenanceLogs)) {
      room.maintenanceLogs.forEach((log: any) => {
        const eqType = equipmentTypes.find(eq => eq.key === log.equipmentKey);
        const eqLabel = eqType ? eqType.label : log.equipmentKey;
        
        let conditionKh = log.condition;
        if (log.condition === 'Good') conditionKh = 'ល្អ (Good)';
        else if (log.condition === 'Damaged') conditionKh = 'បាក់បែក/ខូចខាត (Damaged)';
        else if (log.condition === 'Missing') conditionKh = 'បាត់បង់ (Missing)';
        else if (log.condition === 'NeedRepair') conditionKh = 'ត្រូវការជួសជុល (Need Repair)';

        let statusKh = log.repairStatus;
        if (log.repairStatus === 'Pending') statusKh = 'រង់ចាំជួសជុល (Pending)';
        else if (log.repairStatus === 'Repairing') statusKh = 'កំពុងជួសជុល (Repairing)';
        else if (log.repairStatus === 'Repaired') statusKh = 'បានជួសជុលរួចរាល់ (Repaired)';
        else if (log.repairStatus === 'Replaced') statusKh = 'បានផ្លាស់ប្ដូរថ្មី (Replaced)';

        allLogs.push([
          log.id,
          room.roomNumber,
          eqLabel,
          log.quantity || 1,
          conditionKh,
          log.reportedIssue || '-',
          log.reportDate || '-',
          log.repairDate || '-',
          statusKh,
          log.remarks || '-',
          log.photoUrl || '-'
        ]);
      });
    }
  });

  // 4. Batch Clear first to ensure no stale data remains
  const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`;
  await fetch(clearUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ranges: [
        "'សម្ភារៈបន្ទប់រៀន (Classroom Inventory)'!A1:Z1000",
        "'កំណត់ត្រាថែទាំសម្ភារៈ (Maintenance Logs)'!A1:K1000"
      ]
    })
  }).catch(() => {});

  // 5. Batch Update values
  const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
  const valuesRes = await fetch(valuesUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: "'សម្ភារៈបន្ទប់រៀន (Classroom Inventory)'!A1:Z1000",
          values: [invHeaders, ...invRows],
        },
        {
          range: "'កំណត់ត្រាថែទាំសម្ភារៈ (Maintenance Logs)'!A1:K1000",
          values: [logHeaders, ...allLogs]
        }
      ]
    })
  });

  if (!valuesRes.ok) {
    const errData = await valuesRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to update Classroom Inventory in Google Sheets');
  }
};

// Sync Fixed Assets to Google Sheets
export const syncFixedAssetsToSpreadsheet = async (
  token: string,
  spreadsheetId: string,
  assets: any[]
): Promise<void> => {
  // 1. Fetch current sheets to see if target tab exists
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(title))`;
  const metaRes = await fetch(metaUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!metaRes.ok) {
    const errData = await metaRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to fetch spreadsheet metadata');
  }

  const metaData = await metaRes.json();
  const existingSheetTitles = (metaData.sheets || []).map((s: any) => s.properties.title);

  const targetSheet = 'ទ្រព្យសកម្មសាលា (Fixed Assets)';

  const requests: any[] = [];
  if (!existingSheetTitles.includes(targetSheet)) {
    requests.push({
      addSheet: {
        properties: { title: targetSheet }
      }
    });
  }

  // Add missing tab if any
  if (requests.length > 0) {
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const updateRes = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!updateRes.ok) {
      const errData = await updateRes.json().catch(() => ({}));
      throw new Error(errData?.error?.message || 'Failed to add missing Fixed Assets sheet to Google Spreadsheet');
    }
  }

  // 2. Prepare Headers and Rows
  const assetHeaders = [
    'លេខសម្គាល់ (Asset ID)',
    'ឈ្មោះឧបករណ៍ (Asset Name)',
    'ប្រភេទ (Category)',
    'ម៉ាក (Brand)',
    'ម៉ូដែល (Model)',
    'លេខស៊េរី (Serial Number)',
    'ទីតាំង (Location)',
    'អ្នកទទួលបន្ទុក (Assigned To)',
    'ស្ថានភាពឧបករណ៍ (Status)',
    'កាលបរិច្ឆេទទិញ (Purchase Date)',
    'តម្លៃទិញ ($ Cost USD)',
    'សម្គាល់/កំណត់ត្រា (Notes)'
  ];

  const categoryTranslations: Record<string, string> = {
    Computer: 'កុំព្យូទ័រ (Computer)',
    Laptop: 'ឡេបថប (Laptop)',
    Projector: 'ម៉ាស៊ីនបញ្ចាំង (Projector)',
    Camera: 'កាមេរ៉ា (Camera)',
    TV: 'ទូរទស្សន៍ (TV)',
    Other: 'ផ្សេងៗ (Other)'
  };

  const statusTranslations: Record<string, string> = {
    Operational: 'កំពុងប្រើប្រាស់ (Operational)',
    Maintenance: 'កំពុងជួសជុល (Maintenance)',
    Broken: 'ខូច/មិនដំណើរការ (Broken)'
  };

  const assetRows = assets.map(item => [
    item.id,
    item.name,
    categoryTranslations[item.category] || item.category,
    item.brand || '-',
    item.model || '-',
    item.serialNumber || '-',
    item.location || '-',
    item.assignedTo || '-',
    statusTranslations[item.status] || item.status,
    item.purchaseDate || '-',
    item.costUsd ? `$${Number(item.costUsd).toFixed(2)}` : '$0.00',
    item.notes || '-'
  ]);

  // 3. Clear first to avoid stale rows
  const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`;
  await fetch(clearUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ranges: [
        "'ទ្រព្យសកម្មសាលា (Fixed Assets)'!A1:L2000"
      ]
    })
  }).catch(() => {});

  // 4. Update core content
  const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
  const valuesRes = await fetch(valuesUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: "'ទ្រព្យសកម្មសាលា (Fixed Assets)'!A1:L2000",
          values: [assetHeaders, ...assetRows],
        }
      ]
    })
  });

  if (!valuesRes.ok) {
    const errData = await valuesRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to update Fixed Assets in Google Sheets');
  }
};

// Sync Task Follow-ups to Google Sheets (General Tasks, Insurance, Staff Tasks, Weekly Followups, Monthly Evaluations, CS Grades)
export const syncTaskFollowupsToSpreadsheet = async (
  token: string,
  spreadsheetId: string,
  tasks: any[],
  insuranceClaims: any[],
  staffTasks: any[],
  weeklyFollowups: any[],
  monthlyEvaluations: any[],
  cleanerSecurityEvaluations: any[]
): Promise<void> => {
  // 1. Fetch current sheets to see if target tabs exist
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(title))`;
  const metaRes = await fetch(metaUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!metaRes.ok) {
    const errData = await metaRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to fetch spreadsheet metadata');
  }

  const metaData = await metaRes.json();
  const existingSheetTitles = (metaData.sheets || []).map((s: any) => s.properties.title);

  const targetSheets = [
    'តាមដានការងារទូទៅ (General Tasks)',
    'តាមដានធានារ៉ាប់រងសិស្ស (Insurance)',
    'តាមដានការងារបុគ្គលិក (Staff Tasks)',
    'ការងារប្រចាំសប្តាហ៍-បុគ្គលិក (Weekly Tasks)',
    'វាយតម្លៃកិច្ចការប្រចាំខែ (Monthly Tasks)',
    'វាយតម្លៃអនាម័យនិងសន្តិសុខ (Cleaner & Security)'
  ];

  const requests: any[] = [];
  for (const title of targetSheets) {
    if (!existingSheetTitles.includes(title)) {
      requests.push({
        addSheet: {
          properties: { title }
        }
      });
    }
  }

  // Add missing tabs if any
  if (requests.length > 0) {
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const updateRes = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!updateRes.ok) {
      const errData = await updateRes.json().catch(() => ({}));
      throw new Error(errData?.error?.message || 'Failed to add missing Task Follow-up sheets to Google Spreadsheet');
    }
  }

  // 2. Prepare data headers and rows for each tab
  
  // Tab 1: General Tasks
  const generalHeaders = [
    'លេខសម្គាល់ការងារ (Task ID)',
    'កាលបរិច្ឆេទស្នើសុំ (Request Date)',
    'ការងារស្នើឡើង (Issue Statement)',
    'ប្រភេទការងារ (Category)',
    'ទីតាំងរងផលប៉ះពាល់ (Location)',
    'អ្នកស្នើសុំ (Requested By)',
    'អ្នកទទួលបន្ទុក (PIC / Assigned To)',
    'ស្ថានភាពការងារ (Status)',
    'កាលបរិច្ឆេទតាមដានចុងក្រោយ (Last Follow-up Date)',
    'កំណត់សម្គាល់ (Account Logs / Remarks)'
  ];

  const generalStatusTranslations: Record<string, string> = {
    Pending: 'រង់ចាំ (Pending)',
    InProgress: 'កំពុងដោះស្រាយ (InProgress)',
    Completed: 'បានបញ្ចប់ (Completed)',
    FollowUp: 'កំពុងតាមដានបន្ថែម (FollowUp)',
    Cancelled: 'លុបចោល (Cancelled)'
  };

  const generalTaskRows = tasks.map(t => [
    t.id,
    t.dateRequest,
    t.issueRequest,
    t.issueCategory,
    t.location || '-',
    t.requestedBy,
    t.pic || '-',
    generalStatusTranslations[t.status] || t.status,
    t.followupDate || '-',
    t.remark || '-'
  ]);

  // Tab 2: Insurance Tracking
  const insuranceHeaders = [
    'លេខកូដសន្លឹកករណី (Claim Code)',
    'កាលបរិច្ឆេទកើតហេតុ (Incident Date)',
    'ឈ្មោះសិស្ស (Student Name)',
    'ថ្នាក់រៀន (Grade/Class)',
    'ព័ត៌មានលម្អិតនៃករណី (Incident Details)',
    'មន្ទីរពេទ្យ/គ្លីនិក (Hospital/Clinic)',
    'លេខប័ណ្ណធានារ៉ាប់រង (Claim/Policy No)',
    'ឯកសារដែលបានដាក់ (Documents Submitted)',
    'ស្ថានភាពសំណង (Claim Status)',
    'កំណត់សម្គាល់/ការផ្ទៀងផ្ទាត់ (Remarks)'
  ];

  const insuranceStatusTranslations: Record<string, string> = {
    PendingSubmission: 'រង់ចាំការដាក់ឯកសារ (Pending Submission)',
    UnderReview: 'កំពុងត្រួតពិនិត្យ (Under Review)',
    AdditionalDocRequired: 'ត្រូវការឯកសារបន្ថែម (Additional Doc Required)',
    Approved: 'បានអនុម័តសំណង (Approved)',
    Rejected: 'បដិសេធសំណង (Rejected)',
    Completed: 'បញ្ចប់ករណីទាំងស្រុង (Completed)'
  };

  const insuranceRows = insuranceClaims.map(c => [
    c.id,
    c.dateIncident,
    c.studentName,
    c.gradeClass,
    c.incidentDetails,
    c.hospitalClinic || '-',
    c.insuranceClaimNo || '-',
    c.documentsSubmitted || '-',
    insuranceStatusTranslations[c.status] || c.status,
    c.remark || '-'
  ]);

  // Tab 3: Staff Tasks Tracking
  const staffTaskHeaders = [
    'លេខកូដការងារ (Staff Task ID)',
    'កាលបរិច្ឆេទចាត់តាំង (Assigned Date)',
    'ឈ្មោះបុគ្គលិក (Staff Name)',
    'តួនាទី (Position)',
    'ការងារចាំបាច់ត្រូវធ្វើ (Task Description)',
    'ថ្ងៃផុតកំណត់ (Deadline)',
    'ស្ថានភាពការងារ (Task Status)',
    'កាលបរិច្ឆេទបញ្ចប់ពិតប្រាកដ (Actual Finish Date)',
    'លទ្ធផលការងារ (Job Result)',
    'ប្រធានត្រួតពិនិត្យ (Supervisor)',
    'សម្គាល់/របាយការណ៍បន្ថែម (Remarks)'
  ];

  const staffTaskStatusTranslations: Record<string, string> = {
    Pending: 'រង់ចាំ (Pending)',
    InProgress: 'កំពុងអនុវត្ត (InProgress)',
    Completed: 'បានបញ្ចប់ (Completed)',
    Overdue: 'ហួសកាលកំណត់ (Overdue)',
    OnHold: 'ផ្អាកជាបណ្តោះអាសន្ន (OnHold)'
  };

  const staffTaskRows = staffTasks.map(t => [
    t.id,
    t.assignedDate,
    t.staffName,
    t.position || '-',
    t.taskToDo,
    t.deadline || '-',
    staffTaskStatusTranslations[t.status] || t.status,
    t.finishDate || '-',
    t.result || '-',
    t.supervisor || '-',
    t.remark || '-'
  ]);

  // Tab 4: Weekly Staff Followup
  const weeklyHeaders = [
    'លេខកូដសប្តាហ៍ (Weekly ID)',
    'កាលបរិច្ឆេទតាមដាន (Date Tracked)',
    'ឈ្មោះបុគ្គលិក (Staff Name)',
    'កិច្ចការកំពុងតាមដាន (Task Tracked)',
    'ភាគរយសម្រេចបាន (% Progress)',
    'បញ្ហាប្រឈម/ឧបសគ្គ (Challenges)',
    'ដំណោះស្រាយ/សកម្មភាពបន្ទាប់ (Solutions/Next Step)',
    'ថ្ងៃរំពឹងបញ្ចប់ (Expected Finish Date)'
  ];

  const weeklyRows = weeklyFollowups.map(w => [
    w.id,
    w.date,
    w.staffName,
    w.taskDesc,
    w.progressPercent ? `${w.progressPercent}%` : '0%',
    w.challenge || '-',
    w.solution || '-',
    w.expectedFinishDate || '-'
  ]);

  // Tab 5: Monthly Staff Evaluation
  const monthlyHeaders = [
    'លេខកូដវាយតម្លៃ (Evaluation ID)',
    'ឈ្មោះបុគ្គលិក (Staff Name)',
    'ការងារចាត់តាំងសរុប (Total Assigned Tasks)',
    'បានបញ្ចប់ទាន់ពេល (Completed On Time)',
    'បានបញ្ចប់យឺតយ៉ាវ (Completed Late)',
    'មិនទាន់បានបញ្ចប់ (Unfinished Tasks)',
    'ពិន្ទុ/លទ្ធផលសម្រេចបាន (% Achievement Score)'
  ];

  const monthlyRows = monthlyEvaluations.map(m => [
    m.id,
    m.staffName,
    m.totalTasks || 0,
    m.completedOnTime || 0,
    m.completedLate || 0,
    m.unfinished || 0,
    m.score || '0%'
  ]);

  // Tab 6: Cleaner & Security Evaluation
  const csHeaders = [
    'លេខកូដវាយតម្លៃ (CS ID)',
    'ឈ្មោះបុគ្គលិក (Staff Name)',
    'តួនាទី (Role)',
    'ប្រចាំខែ (Month)',
    'កាលបរិច្ឆេទវាយតម្លៃ (Evaluated Date)',
    'ពិន្ទុសរុប (Total Score / 100)',
    'គំនិតវាយតម្លៃ (Grade Category)',
    'សេចក្តីពិន័យ/ដកពិន្ទុ (Penalties / Deductions Info)'
  ];

  const csRows = cleanerSecurityEvaluations.map(c => [
    c.id,
    c.staffName,
    c.role === 'Cleaner' ? 'ផ្នែកអនាម័យ (Cleaner)' : 'ផ្នែកសន្តិសុខ (Security)',
    c.month,
    c.dateEvaluated,
    c.totalScore || 0,
    c.grade || '-',
    c.customPenaltiesText || '-'
  ]);

  // 3. Clear existing values to prevent stale overlaps
  const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`;
  await fetch(clearUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ranges: [
        "'តាមដានការងារទូទៅ (General Tasks)'!A1:J3000",
        "'តាមដានធានារ៉ាប់រងសិស្ស (Insurance)'!A1:J3000",
        "'តាមដានការងារបុគ្គលិក (Staff Tasks)'!A1:K3000",
        "'ការងារប្រចាំសប្តាហ៍-បុគ្គលិក (Weekly Tasks)'!A1:H3000",
        "'វាយតម្លៃកិច្ចការប្រចាំខែ (Monthly Tasks)'!A1:G3000",
        "'វាយតម្លៃអនាម័យនិងសន្តិសុខ (Cleaner & Security)'!A1:H3000"
      ]
    })
  }).catch(() => {});

  // 4. Update the content of all sheets in a single batch
  const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
  const valuesRes = await fetch(valuesUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: "'តាមដានការងារទូទៅ (General Tasks)'!A1:J3000",
          values: [generalHeaders, ...generalTaskRows]
        },
        {
          range: "'តាមដានធានារ៉ាប់រងសិស្ស (Insurance)'!A1:J3000",
          values: [insuranceHeaders, ...insuranceRows]
        },
        {
          range: "'តាមដានការងារបុគ្គលិក (Staff Tasks)'!A1:K3000",
          values: [staffTaskHeaders, ...staffTaskRows]
        },
        {
          range: "'ការងារប្រចាំសប្តាហ៍-បុគ្គលិក (Weekly Tasks)'!A1:H3000",
          values: [weeklyHeaders, ...weeklyRows]
        },
        {
          range: "'វាយតម្លៃកិច្ចការប្រចាំខែ (Monthly Tasks)'!A1:G3000",
          values: [monthlyHeaders, ...monthlyRows]
        },
        {
          range: "'វាយតម្លៃអនាម័យនិងសន្តិសុខ (Cleaner & Security)'!A1:H3000",
          values: [csHeaders, ...csRows]
        }
      ]
    })
  });

  if (!valuesRes.ok) {
    const errData = await valuesRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to update Task Follow-up registries in Google Sheets');
  }
};

// Sync Medicine Records to Google Sheets (Medicine Registry, Stock In Logs, Patient Intake Logs)
export const syncMedicinesToSpreadsheet = async (
  token: string,
  spreadsheetId: string,
  medicines: any[],
  stockIns: any[],
  usageLogs: any[]
): Promise<void> => {
  // 1. Fetch current sheets to see if target tabs exist
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(title))`;
  const metaRes = await fetch(metaUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!metaRes.ok) {
    const errData = await metaRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to fetch spreadsheet metadata');
  }

  const metaData = await metaRes.json();
  const existingSheetTitles = (metaData.sheets || []).map((s: any) => s.properties.title);

  const targetSheets = [
    'បញ្ជីឱសថមេ (Medicine Registry)',
    'ប្រវត្តិនាំចូលថ្នាំ (Stock In Logs)',
    'ប្រវត្តិប្រើប្រាស់ថ្នាំ (Patient Intake Logs)'
  ];

  const requests: any[] = [];
  for (const title of targetSheets) {
    if (!existingSheetTitles.includes(title)) {
      requests.push({
        addSheet: {
          properties: { title }
        }
      });
    }
  }

  // Add missing tabs if any
  if (requests.length > 0) {
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const updateRes = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!updateRes.ok) {
      const errData = await updateRes.json().catch(() => ({}));
      throw new Error(errData?.error?.message || 'Failed to add missing Medicine sheets to Google Spreadsheet');
    }
  }

  // 2. Prepare data headers and rows for each tab
  
  // Tab 1: Medicine Registry
  const medHeaders = [
    'លេខកូដឱសថ (ID)',
    'ឈ្មោះថ្នាំ (Medicine Name)',
    'ប្រភេទ (Category)',
    'ទំហំ/កម្រាស់ (Strength)',
    'ចំនួនស្តុកបច្ចុប្បន្ន (Current Stock)',
    'កាលបរិច្ឆេទបញ្ជាទិញ (Purchase Date)',
    'កាលបរិច្ឆេទផុតកំណត់ (Expiry Date)',
    'ទីតាំងរក្សាទុក (Cabinet / Location)',
    'តម្លៃឯកតា (Unit Price)',
    'ចំណុចបញ្ជាទិញឡើងវិញ (Reorder Point)',
    'ស្ថានភាព (Status)'
  ];

  const medRows = medicines.map(m => [
    m.id,
    m.name,
    m.category,
    m.strength,
    m.stock,
    m.purchaseDate,
    m.expiryDate,
    m.location || '-',
    m.unitPrice || 0,
    m.reorderPoint || 0,
    m.status === 'Active' ? 'ដំណើរការ (Active)' : 'អសកម្ម (Inactive)'
  ]);

  // Tab 2: Stock In Logs
  const stockInHeaders = [
    'លេខប្រតិបត្តិការនាំចូល (ID)',
    'កាលបរិច្ឆេទនាំចូល (Stock In Date)',
    'លេខកូដថ្នាំ (Medicine ID)',
    'ឈ្មោះថ្នាំ (Medicine Name)',
    'ចំនួននាំចូល (Qty In)',
    'ប្រភពផ្គត់ផ្គង់ (Supplier)',
    'លេខបាច់ផលិត (Batch No)',
    'កាលបរិច្ឆេទផុតកំណត់ (Expiry Date)',
    'អ្នកទទួលខុសត្រូវ (Received By)'
  ];

  const stockInRows = stockIns.map(si => [
    si.id,
    si.date,
    si.medicineId,
    si.medicineName,
    si.qtyIn,
    si.supplier || '-',
    si.batchNo || '-',
    si.expiryDate || '-',
    si.receivedBy
  ]);

  // Tab 3: Medicine Usage Log
  const usageHeaders = [
    'លេខប្រតិបត្តិការប្រើប្រាស់ (ID)',
    'កាលបរិច្ឆេទប្រើប្រាស់ (Date)',
    'ឈ្មោះសិស្ស/អ្នកជំងឺ (Patient/Student Name)',
    'ថ្នាក់រៀន (Grade/Class)',
    'លេខកូដថ្នាំ (Medicine ID)',
    'ឈ្មោះថ្នាំ (Medicine Name)',
    'ចំនួនប្រើប្រាស់ (Qty Used)',
    'រោគសញ្ញា/មូលហេតុ (Symptoms/Reason)',
    'គិលានុបដ្ឋាយិកាទទួលបន្ទុក (Nurse)'
  ];

  const usageRows = usageLogs.map(ul => [
    ul.id,
    ul.date,
    ul.studentName,
    ul.grade,
    ul.medicineId,
    ul.medicineName,
    ul.qtyUsed,
    ul.reason,
    ul.nurse
  ]);

  // 3. Clear existing values to prevent stale overlaps
  const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`;
  await fetch(clearUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ranges: [
        "'បញ្ជីឱសថមេ (Medicine Registry)'!A1:K3000",
        "'ប្រវត្តិនាំចូលថ្នាំ (Stock In Logs)'!A1:I3000",
        "'ប្រវត្តិប្រើប្រាស់ថ្នាំ (Patient Intake Logs)'!A1:I3000"
      ]
    })
  }).catch(() => {});

  // 4. Update the content of all sheets in a single batch
  const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
  const valuesRes = await fetch(valuesUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: "'បញ្ជីឱសថមេ (Medicine Registry)'!A1:K3000",
          values: [medHeaders, ...medRows]
        },
        {
          range: "'ប្រវត្តិនាំចូលថ្នាំ (Stock In Logs)'!A1:I3000",
          values: [stockInHeaders, ...stockInRows]
        },
        {
          range: "'ប្រវត្តិប្រើប្រាស់ថ្នាំ (Patient Intake Logs)'!A1:I3000",
          values: [usageHeaders, ...usageRows]
        }
      ]
    })
  });

  if (!valuesRes.ok) {
    const errData = await valuesRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to update Medicine inventory logs in Google Sheets');
  }
};

