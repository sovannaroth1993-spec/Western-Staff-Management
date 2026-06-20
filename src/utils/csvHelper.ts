/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Staff, AttendanceRecord, DEPARTMENT_NAMES_KM } from '../types';

/**
 * Downloads data as a CSV file in the browser with UTF-8 BOM encoding for perfect Khmer characters.
 */
function downloadCsv(headers: string[], rows: string[][], filename: string) {
  const escapeCsvField = (field: string | number | undefined | null): string => {
    if (field === null || field === undefined) return '""';
    const stringField = String(field);
    const escaped = stringField.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const formattedHeaders = headers.map(escapeCsvField).join(',');
  const formattedRows = rows.map(row => row.map(escapeCsvField).join(',')).join('\r\n');
  
  const csvContent = '\uFEFF' + formattedHeaders + '\r\n' + formattedRows;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportStaffToCsv(staffList: Staff[], department: string) {
  const headers = [
    'ល.រ (No)',
    'លេខសម្គាល់ (Staff ID)',
    'ឈ្មោះ (Name)',
    'ភេទ (Gender)',
    'ថ្ងៃខែឆ្នាំកំណើត (DOB)',
    'ថ្ងៃចូលធ្វើការ (Joining Date)',
    'លេខទូរស័ព្ទ (Phone Number)',
    'ផ្នែក (Department)',
    'អាយកូម (Icom)',
    'ទីតាំងទទួលខុសត្រូវ (Location)',
    'ទំហំរូបថត (Photo Info)'
  ];

  const rows = staffList.map((s, index) => [
    String(index + 1),
    s.staffId,
    s.name,
    s.gender,
    s.dob,
    s.joinDate || 'N/A',
    s.phoneNumber,
    (s.department === 'Other' && s.customDepartment) ? s.customDepartment : (DEPARTMENT_NAMES_KM[s.department] || s.department),
    s.icom || 'គ្មាន',
    s.responsibleLocation || 'គ្មាន',
    '4x6 ' + (s.photo ? 'មានរូបថត' : 'គ្មានរូបថត')
  ]);

  const dateSuffix = new Date().toISOString().split('T')[0];
  const filename = `WIS_Staff_List_${department}_${dateSuffix}.csv`;
  downloadCsv(headers, rows, filename);
}

export function exportAttendanceToCsv(records: AttendanceRecord[], staffList: Staff[], date: string, department: string) {
  const headers = [
    'ល.រ (No)',
    'លេខសម្គាល់ (Staff ID)',
    'ឈ្មោះ (Name)',
    'ភេទ (Gender)',
    'ផ្នែក (Department)',
    'កាលបរិច្ឆេទ (Date)',
    'វត្តមាន (Status)',
    'សម្គាល់ (Notes)'
  ];

  const rows = records.map((record, index) => {
    const staff = staffList.find(s => s.staffId === record.staffId);
    let statusId = 'មក';
    if (record.status === 'Excused') statusId = 'ច្បាប់';
    if (record.status === 'Absent') statusId = 'អវត្តមាន';

    return [
      String(index + 1),
      record.staffId,
      record.staffName,
      staff?.gender || 'N/A',
      (staff && staff.department === 'Other' && staff.customDepartment) ? staff.customDepartment : (DEPARTMENT_NAMES_KM[record.department] || record.department),
      date,
      statusId,
      record.notes || ''
    ];
  });

  const filename = `WIS_Attendance_${department}_${date}.csv`;
  downloadCsv(headers, rows, filename);
}
