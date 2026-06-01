/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Staff, Department, AttendanceRecord, CleaningTask, DEPARTMENT_NAMES_KM, WaterRecord } from '../types';

// Normalizes sheet cell values
function cleanStr(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

/**
 * Parses XLSX/XLS file into Staff array.
 * Tries to support both English & Khmer headers.
 */
export async function parseStaffExcel(file: File, targetDepartment: Department): Promise<Staff[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('គ្មានទិន្នន័យឯកសារ'));
          return;
        }
        
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJsonList = XLSX.utils.sheet_to_json<any>(worksheet);
        
        const parsedStaff: Staff[] = [];
        
        rawJsonList.forEach((row, index) => {
          // Normalize header keys by checking common Khmer or English mappings
          let noVal = index + 1;
          let staffIdVal = '';
          let nameVal = '';
          let genderVal: 'ប្រុស' | 'ស្រី' = 'ប្រុស';
          let dobVal = '';
          let joinDateVal = '';
          let phoneVal = '';
          let photoVal = '';
          let icomVal = '';
          let locationVal = '';
          
          // Try to look up columns dynamically
          for (const key of Object.keys(row)) {
            const cleanKey = key.trim().toLowerCase();
            const val = row[key];
            
            if (cleanKey === 'no' || cleanKey === 'លរ' || cleanKey === 'ល.រ' || cleanKey === 'លេខរៀង' || cleanKey === 'លំដាប់') {
              noVal = parseInt(val, 10) || noVal;
            } else if (cleanKey === 'staff id' || cleanKey === 'staffid' || cleanKey === 'id' || cleanKey === 'អត្តសញ្ញាណប័ណ្ណ' || cleanKey === 'លេខសម្គាល់' || cleanKey === 'កូដបុគ្គលិក') {
              staffIdVal = cleanStr(val);
            } else if (cleanKey === 'name' || cleanKey === 'ឈ្មោះ' || cleanKey === 'នាមខ្លួន' || cleanKey === 'នាម' || cleanKey === 'គោត្តនាម និងនាមខ្លួន' || cleanKey === 'ឈ្មោះបុគ្គលិក') {
              nameVal = cleanStr(val);
            } else if (cleanKey === 'gender' || cleanKey === 'sex' || cleanKey === 'ភេទ') {
              const genderText = cleanStr(val).toLowerCase();
              if (genderText === 'ស្រី' || genderText === 'female' || genderText === 'f' || genderText === 'g') {
                genderVal = 'ស្រី';
              } else {
                genderVal = 'ប្រុស';
              }
            } else if (cleanKey === 'dob' || cleanKey === 'date of birth' || cleanKey === 'ថ្ងៃខែឆ្នាំកំណើត' || cleanKey === 'ថ្ងៃកំណើត') {
              if (val instanceof Date) {
                dobVal = val.toISOString().split('T')[0];
              } else {
                dobVal = cleanStr(val);
              }
            } else if (cleanKey === 'join date' || cleanKey === 'date of joining' || cleanKey === 'hire date' || cleanKey === 'ថ្ងៃខែឆ្នាំចូលធ្វើការ' || cleanKey === 'ថ្ងៃចូលធ្វើការ' || cleanKey === 'ថ្ងៃចូលការងារ' || cleanKey === 'joindate') {
              if (val instanceof Date) {
                joinDateVal = val.toISOString().split('T')[0];
              } else {
                joinDateVal = cleanStr(val);
              }
            } else if (cleanKey === 'phone number' || cleanKey === 'phone' || cleanKey === 'phonenumber' || cleanKey === 'លេខទូរស័ព្ទ' || cleanKey === 'ទូរស័ព្ទ') {
              phoneVal = cleanStr(val);
            } else if (cleanKey === 'photo' || cleanKey === 'រូបភាព' || cleanKey === 'size 4*6') {
              photoVal = cleanStr(val);
            } else if (cleanKey === 'icom' || cleanKey === 'អាយកូម' || cleanKey === 'walkie talkie' || cleanKey === 'walkietalkie') {
              icomVal = cleanStr(val);
            } else if (cleanKey === 'location' || cleanKey === 'responsible location' || cleanKey === 'ទីតាំង' || cleanKey === 'ទីតាំងទទួលខុសត្រូវ' || cleanKey === 'កន្លែងទទួលខុសត្រូវ') {
              locationVal = cleanStr(val);
            }
          }
          
          // Only add rows that have at least a name
          if (nameVal) {
            // Guarantee a staff code if empty
            if (!staffIdVal) {
              const deptCode = targetDepartment.substring(0, 3).toUpperCase();
              staffIdVal = `WIS-${deptCode}-${Math.floor(100 + Math.random() * 900)}`;
            }
            
            parsedStaff.push({
              id: staffIdVal,
              no: noVal,
              staffId: staffIdVal,
              name: nameVal,
              gender: genderVal,
              dob: dobVal || '1990-01-01',
              phoneNumber: phoneVal || 'N/A',
              photo: photoVal,
              department: targetDepartment,
              icom: icomVal || undefined,
              responsibleLocation: locationVal || undefined,
              joinDate: joinDateVal || undefined
            });
          }
        });
        
        resolve(parsedStaff);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}

/**
 * Exports Staff array to XLSX file
 */
export function exportStaffToExcel(staffList: Staff[], department: Department | 'All') {
  const data = staffList.map((s, index) => ({
    'ល.រ (No)': index + 1,
    'លេខសម្គាល់ (Staff ID)': s.staffId,
    'ឈ្មោះ (Name)': s.name,
    'ភេទ (Gender)': s.gender,
    'ថ្ងៃខែឆ្នាំកំណើត (DOB)': s.dob,
    'ថ្ងៃចូលធ្វើការ (Joining Date)': s.joinDate || 'N/A',
    'លេខទូរស័ព្ទ (Phone Number)': s.phoneNumber,
    'ផ្នែក (Department)': DEPARTMENT_NAMES_KM[s.department] || s.department,
    'អាយកូម (Icom)': s.icom || 'គ្មាន',
    'ទីតាំងទទួលខុសត្រូវ (Location)': s.responsibleLocation || 'គ្មាន',
    'ទំហំរូបថត (Photo Info)': '4x6 ' + (s.photo ? 'មានរូបថត' : 'គ្មានរូបថត')
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'បញ្ជីបុគ្គលិក');
  
  // Create XLSX binary and trigger download
  XLSX.writeFile(workbook, `WIS_Staff_List_${department}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Exports Attendance Records to XLSX
 */
export function exportAttendanceToExcel(records: AttendanceRecord[], staffList: Staff[], date: string, department: Department) {
  const data = records.map((record, index) => {
    const staff = staffList.find(s => s.staffId === record.staffId);
    let statusId = 'មក';
    if (record.status === 'Excused') statusId = 'ច្បាប់';
    if (record.status === 'Absent') statusId = 'អវត្តមាន';
    
    return {
      'ល.រ (No)': index + 1,
      'លេខសម្គាល់ (Staff ID)': record.staffId,
      'ឈ្មោះ (Name)': record.staffName,
      'ភេទ (Gender)': staff?.gender || 'N/A',
      'ផ្នែក (Department)': DEPARTMENT_NAMES_KM[record.department],
      'កាលបរិច្ឆេទ (Date)': date,
      'វត្តមាន (Status)': statusId,
      'សម្គាល់ (Notes)': record.notes || ''
    };
  });
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ស្រង់វត្តមាន');
  
  XLSX.writeFile(workbook, `WIS_Attendance_${department}_${date}.xlsx`);
}

/**
 * Exports Cleaning Tasks to XLSX
 */
export function exportCleaningToExcel(tasks: CleaningTask[], date: string) {
  const data = tasks.map((task, index) => ({
    'ល.រ (No)': index + 1,
    'កាលបរិច្ឆេទ (Date)': task.date,
    'តំបន់/បន្ទប់សម្អាត (Cleaning Area)': task.areaName,
    'អ្នកសម្អាតទទួលបន្ទុក (Cleaner)': task.cleanerName,
    'លេខកូដ (Cleaner ID)': task.cleanerId,
    'វេន (Shift)': task.timeOfDay === 'Morning' ? 'ព្រឹក' : 'រសៀល',
    'ស្ថានភាព (Status)': task.status === 'Completed' ? 'រួចរាល់' : 'កំពុងធ្វើ',
    'ម៉ោងបញ្ចប់ (Completed At)': task.completedAt || '-',
    'សម្គាល់ (Notes)': task.notes || ''
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'របាយការណ៍សម្អាត');
  
  XLSX.writeFile(workbook, `WIS_Cleaning_Report_${date}.xlsx`);
}

/**
 * Exports Water Records list to XLSX
 */
export function exportWaterToExcel(waterRecords: WaterRecord[]) {
  const khmerMonths = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];
  const formatKhmerMonthExcel = (monthYearStr: string) => {
    if (!monthYearStr) return '';
    const [year, month] = monthYearStr.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    const khmerMonthName = khmerMonths[monthIndex] || month;
    return `${khmerMonthName} ${year}`;
  };

  const sorted = [...waterRecords].sort((a, b) => a.monthYear.localeCompare(b.monthYear));

  const data = sorted.map((r, index) => {
    const isCostSaved = r.differenceUsd < 0;
    const isCostEqual = r.differenceUsd === 0;
    
    let statusKm = 'ថេរ';
    if (isCostSaved) statusKm = 'សន្សំសំចៃ';
    if (r.differenceUsd > 0) statusKm = 'កើនឡើង';

    return {
      'ល.រ (No)': index + 1,
      'ខែ-ឆ្នាំ (Month-Year)': formatKhmerMonthExcel(r.monthYear) + ` (${r.monthYear})`,
      'ការប្រើប្រាស់ខែមុន ($) (Cost Before)': r.costBeforeUsd,
      'ការប្រើប្រាស់ខែបន្ទាប់ ($) (Cost After)': r.costAfterUsd,
      'គម្លាតគណនា ($) (Difference)': r.differenceUsd,
      'ភាគរយ (%) (Percentage)': parseFloat(r.differencePercent.toFixed(1)),
      'ស្ថានភាព (Status)': statusKm,
      'អ្នកបញ្ចូល (Recorded By)': r.recordedBy,
      'កាលបរិច្ឆេទចុះបញ្ចូល (Recorded At)': r.recordedAt,
      'សម្គាល់បន្ថែម (Notes)': r.notes || ''
    };
  });
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'របាយការណ៍ប្រើប្រាស់ទឹក');
  
  XLSX.writeFile(workbook, `WIS_Water_Analysis_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
}
