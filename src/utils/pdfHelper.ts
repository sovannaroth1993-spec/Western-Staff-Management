/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Staff, Department, AttendanceRecord, CleaningTask, DEPARTMENT_NAMES_KM, WaterRecord } from '../types';

// Declare standard plugins for jsPDF
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

/**
 * Phonetically transliterates Khmer Unicode characters to Latin/English counterparts.
 * This yields beautiful English/Latin directory listings and prevents standard Roman-only
 * fonts in pdf layout engines (like Helvetica) from throwing exceptions or freezing threads.
 */
export function transliterateKhmerToLatin(text: string): string {
  if (!text) return '';
  
  // High fidelity pre-mappings for typical names/words to keep business reports looking stellar
  const preMappedNames: Record<string, string> = {
    'សោម សុខា': 'Som Sokha',
    'កែវ ពិសិដ្ឋ': 'Keo Piseth',
    'ចាន់ ធារី': 'Chan Theary',
    'សុខ ស្រីនឿន': 'Sok Sreynoeun',
    'លី ចាន់ណា': 'Ly Channa',
    'ជា ពិសី': 'Chea Pisey',
    'អ៊ុំ សុវណ្ណារី': 'Oum Sovannary',
    'អ៊ុំ ស្រីមុំ': 'Oum Sreymom',
    'ប៉ែន សម្បត្តិ': 'Pen Sambath',
    'សន ចាន់ធូ': 'Sorn Chanthou',
    'អនាម័យ': 'Cleaner',
    'សន្តិសុខ': 'Security',
    'បណ្ណារក្ស': 'Librarian',
    'គិលានុបដ្ឋាយិកា': 'Nurse',
    'រដ្ឋបាល': 'Admin',
    'អាហារដ្ឋាន': 'Canteen',
    'បណ្ណារ័ក្ស': 'Librarian',
    'អាយកូម': 'Icom'
  };

  const trimmed = text.trim();
  if (preMappedNames[trimmed]) {
    return preMappedNames[trimmed];
  }

  // Fallback character-by-character transliteration mapper
  const consonants: Record<string, string> = {
    'ក': 'K', 'ខ': 'Kh', 'គ': 'K', 'ឃ': 'Kh', 'ង': 'Ng',
    'ច': 'Ch', 'ឆ': 'Chh', 'ជ': 'Ch', 'ឈ': 'Chh', 'ញ': 'Nh',
    'ដ': 'D', 'ឋ': 'Th', 'ឌ': 'D', 'ឍ': 'Th', 'ណ': 'N',
    'ត': 'T', 'ថ': 'Th', 'ទ': 'T', 'ធ': 'Th', 'ន': 'N',
    'ប': 'B', 'ផ': 'Ph', 'ព': 'P', 'ភ': 'Ph', 'ម': 'M',
    'យ': 'Y', 'រ': 'R', 'ល': 'L', 'វ': 'V',
    'ស': 'S', 'ហ': 'H', 'ឡ': 'L', 'អ': 'O'
  };

  const vowels: Record<string, string> = {
    'ា': 'a', 'ិ': 'i', 'ី': 'ei', 'ឹ': 'teu', 'ឺ': 'teu',
    'ុ': 'u', 'ូ': 'ou', 'ួ': 'uor', 'ើ': 'eu', 'ឿ': 'eua',
    'ៀ': 'ieth', 'េ': 'e', 'ែ': 'ae', 'ៃ': 'ey', 'ោ': 'ao',
    'ៅ': 'au', 'ុំ': 'om', 'ំ': 'om', 'ំា': 'am', 'ះ': 'ah',
    'ុះ': 'uh', 'េះ': 'eh', 'ោះ': 'oh'
  };

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (consonants[char] !== undefined) {
      result += consonants[char];
    } else if (vowels[char] !== undefined) {
      result += vowels[char];
    } else if (char === ' ') {
      result += ' ';
    } else if (char >= '0' && char <= '9') {
      result += char;
    } else if (char === '-' || char === '_' || char === '/' || char === '(' || char === ')') {
      result += char;
    }
    // ignore nested sub-signs and diacritics like ្ and ៍ to keep output strictly raw ASCII
  }

  // Clean layout spacing and capitalization
  return result
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Helper to export Staff list to PDF
 */
export function exportStaffToPdf(staffList: Staff[], department: Department | 'All') {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  // Western International School branding accents
  doc.setFillColor(15, 23, 42); // Navy Dark
  doc.rect(0, 0, 210, 15, 'F');
  
  doc.setFillColor(220, 38, 38); // Red Crimson Accent Line
  doc.rect(0, 15, 210, 2, 'F');
  
  // Title Header
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('WESTERN INTERNATIONAL SCHOOL', 14, 10);
  
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(18);
  doc.text(`STAFF DIRECTORY - ${department.toUpperCase()}`, 14, 28);
  
  // Report Meta info
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 35);
  doc.text(`Total Staff Count: ${staffList.length}`, 14, 40);
  
  // Dynamic columns Setup
  const showDept = department === 'All';
  const tableColumn = [
    'No', 
    'Staff ID', 
    'Name', 
    'Gender', 
    'DOB', 
    'Joined', 
    'Phone Number', 
    ...(showDept ? ['Department'] : []), 
    'Icom', 
    'Location'
  ];
  
  const tableRows: any[][] = [];
  
  staffList.forEach((s, idx) => {
    // Transliterate Khmer text to Latin to guarantee perfect jsPDF metric measuring
    const row = [
      idx + 1,
      s.staffId,
      transliterateKhmerToLatin(s.name),
      s.gender === 'ស្រី' ? 'Female' : 'Male',
      s.dob,
      s.joinDate || '-',
      s.phoneNumber,
    ];
    if (showDept) {
      row.push(s.department);
    }
    row.push(s.icom ? transliterateKhmerToLatin(s.icom) : '-');
    row.push(s.responsibleLocation ? transliterateKhmerToLatin(s.responsibleLocation) : '-');
    tableRows.push(row);
  });

  const dynamicColumnStyles = showDept ? {
    0: { cellWidth: 8 },   // No
    1: { cellWidth: 20 },  // Staff ID
    2: { cellWidth: 25 },  // Name
    3: { cellWidth: 12 },  // Gender
    4: { cellWidth: 18 },  // DOB
    5: { cellWidth: 18 },  // Joined
    6: { cellWidth: 22 },  // Phone Number
    7: { cellWidth: 24 },  // Department
    8: { cellWidth: 14 },  // Icom
    9: { cellWidth: 21 }   // Location
  } : {
    0: { cellWidth: 8 },   // No
    1: { cellWidth: 22 },  // Staff ID
    2: { cellWidth: 32 },  // Name
    3: { cellWidth: 14 },  // Gender
    4: { cellWidth: 20 },  // DOB
    5: { cellWidth: 20 },  // Joined
    6: { cellWidth: 26 },  // Phone Number
    7: { cellWidth: 16 },  // Icom
    8: { cellWidth: 24 }   // Location
  };
  
  doc.autoTable({
    startY: 46,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, font: 'Helvetica', overflow: 'linebreak' },
    columnStyles: dynamicColumnStyles
  });
  
  // Signature footprint
  const finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(10);
  doc.text('Prepared By:', 14, finalY + 20);
  doc.text('__________________', 14, finalY + 30);
  doc.text('Staff Coordinator', 14, finalY + 35);
  
  doc.text('Approved By:', 140, finalY + 20);
  doc.text('__________________', 140, finalY + 30);
  doc.text('School Principal', 140, finalY + 35);
  
  doc.save(`WIS_Staff_${department}_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Helper to export Attendance Records list to PDF
 */
export function exportAttendanceToPdf(records: AttendanceRecord[], staffList: Staff[], date: string, department: Department) {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  // Header Branding
  doc.setFillColor(15, 23, 42); 
  doc.rect(0, 0, 210, 15, 'F');
  doc.setFillColor(220, 38, 38); 
  doc.rect(0, 15, 210, 2, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('WESTERN INTERNATIONAL SCHOOL', 14, 10);
  
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(18);
  doc.text(`ATTENDANCE REPORT - ${department.toUpperCase()}`, 14, 28);
  
  // Date and parameters info
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Attendance Date: ${date}`, 14, 35);
  doc.text(`Department: ${department}`, 14, 40);
  
  const presentCount = records.filter(r => r.status === 'Present').length;
  const excusedCount = records.filter(r => r.status === 'Excused').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;
  
  doc.text(`Summary: Present: ${presentCount} | Excused: ${excusedCount} | Absent: ${absentCount}`, 120, 40);
  
  const isSecurity = department === 'Security';
  const tableColumn = isSecurity 
    ? ['No', 'Staff ID', 'Full Name', 'Gender', 'Status', 'Icom', 'Patrol Location', 'Notes']
    : ['No', 'Staff ID', 'Full Name', 'Gender', 'Status', 'Notes'];

  const tableRows: any[][] = [];
  
  records.forEach((r, idx) => {
    const staff = staffList.find(s => s.staffId === r.staffId);
    let statusId = 'Present';
    if (r.status === 'Excused') statusId = 'Excused';
    if (r.status === 'Absent') statusId = 'Absent';
    
    const row = [
      idx + 1,
      r.staffId,
      transliterateKhmerToLatin(r.staffName),
      staff?.gender === 'ស្រី' ? 'Female' : 'Male',
      statusId,
    ];
    
    if (isSecurity) {
      row.push(staff?.icom ? transliterateKhmerToLatin(staff.icom) : '-');
      row.push(staff?.responsibleLocation ? transliterateKhmerToLatin(staff.responsibleLocation) : '-');
    }
    
    row.push(r.notes ? transliterateKhmerToLatin(r.notes) : '');
    tableRows.push(row);
  });
  
  const dynamicColumnStyles = isSecurity ? {
    0: { cellWidth: 8 },    // No
    1: { cellWidth: 22 },   // Staff ID
    2: { cellWidth: 32 },   // Full Name
    3: { cellWidth: 14 },   // Gender
    4: { cellWidth: 28 },   // Status
    5: { cellWidth: 14 },   // Icom
    6: { cellWidth: 28 },   // Patrol Location
    7: { cellWidth: 36 }    // Notes
  } : {
    0: { cellWidth: 10 },   // No
    1: { cellWidth: 30 },   // Staff ID
    2: { cellWidth: 45 },   // Full Name
    3: { cellWidth: 20 },   // Gender
    4: { cellWidth: 35 },   // Status
    5: { cellWidth: 42 }    // Notes
  };

  doc.autoTable({
    startY: 46,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, font: 'Helvetica', overflow: 'linebreak' },
    columnStyles: dynamicColumnStyles
  });
  
  const finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(10);
  doc.text('Prepared By:', 14, finalY + 15);
  doc.text('__________________', 14, finalY + 25);
  
  doc.text('Verified By:', 140, finalY + 15);
  doc.text('__________________', 140, finalY + 25);
  
  doc.save(`WIS_Attendance_${department}_${date}.pdf`);
}

/**
 * Helper to export Cleaning Report to PDF
 */
export function exportCleaningToPdf(tasks: CleaningTask[], date: string) {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  // Header Branding
  doc.setFillColor(4, 120, 87); // Emerald Green for Cleaning/Hygiene
  doc.rect(0, 0, 210, 15, 'F');
  doc.setFillColor(251, 191, 36); // Amber gold line
  doc.rect(0, 15, 210, 2, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('WESTERN INTERNATIONAL SCHOOL', 14, 10);
  
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(18);
  doc.text('CLEANING & SANITATION LOG', 14, 28);
  
  // Date and parameters info
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Cleaning Date: ${date}`, 14, 35);
  
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  doc.text(`Scope: ${completedCount} / ${tasks.length} Cleaning Tasks Completed`, 14, 40);
  
  const tableColumn = ['No', 'Cleaning Area / Room', 'Assignee / Staff', 'Shift', 'Status', 'Completed Time', 'Notes'];
  const tableRows: any[][] = [];
  
  tasks.forEach((t, idx) => {
    tableRows.push([
      idx + 1,
      transliterateKhmerToLatin(t.areaName),
      `${transliterateKhmerToLatin(t.cleanerName)} (${t.cleanerId})`,
      t.timeOfDay === 'Morning' ? 'Morning' : 'Afternoon',
      t.status === 'Completed' ? 'Completed' : 'In Progress',
      t.completedAt || '-',
      t.notes ? transliterateKhmerToLatin(t.notes) : ''
    ]);
  });
  
  doc.autoTable({
    startY: 46,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [4, 120, 87], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, font: 'Helvetica' },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 45 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30 },
      5: { cellWidth: 25 },
      6: { cellWidth: 20 }
    }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(10);
  doc.text('Inspected By:', 14, finalY + 15);
  doc.text('__________________', 14, finalY + 25);
  doc.text('Hygiene Inspector', 14, finalY + 30);
  
  doc.text('Acknowledged By:', 140, finalY + 15);
  doc.text('__________________', 140, finalY + 25);
  doc.text('Campus Supervisor', 140, finalY + 30);
  
  doc.save(`WIS_Cleaning_Report_${date}.pdf`);
}

/**
 * Helper to export Water Records to PDF
 */
export function exportWaterToPdf(waterRecords: WaterRecord[]) {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  // Header Branding (Sky Blue for Water/Resources)
  doc.setFillColor(14, 165, 233); // Sky Blue
  doc.rect(0, 0, 210, 15, 'F');
  doc.setFillColor(15, 23, 42); // Navy Accent Line
  doc.rect(0, 15, 210, 2, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('WESTERN INTERNATIONAL SCHOOL', 14, 10);
  
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(18);
  doc.text('MONTHLY WATER SUPPLY ANALYSIS REPORT', 14, 28);
  
  // Date and parameters info
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 35);
  doc.text(`Total Records: ${waterRecords.length} Month(s)`, 14, 40);

  // Stats summary calculation
  const totalCostUsd = waterRecords.reduce((sum, r) => sum + r.costAfterUsd, 0);
  const averageCostUsd = waterRecords.length > 0 ? totalCostUsd / waterRecords.length : 0;
  
  doc.text(`Total Water Expense: $${totalCostUsd.toFixed(2)} | Average Monthly: $${averageCostUsd.toFixed(2)}`, 110, 45);
  
  const englishMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const formatEnglishMonthPdf = (monthYearStr: string) => {
    if (!monthYearStr) return '';
    const [year, month] = monthYearStr.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    const name = englishMonths[monthIndex] || month;
    return `${name} ${year}`;
  };

  const tableColumn = ['No', 'Month-Year', 'Cost Before ($)', 'Cost After ($)', 'Difference ($)', 'Variance (%)', 'Recorded By', 'Notes'];
  const tableRows: any[][] = [];
  
  // Sort chronologically
  const sorted = [...waterRecords].sort((a, b) => a.monthYear.localeCompare(b.monthYear));
  
  sorted.forEach((r, idx) => {
    const isCostSaved = r.differenceUsd < 0;
    const isCostEqual = r.differenceUsd === 0;
    
    let diffStr = '-';
    if (!isCostEqual) {
      diffStr = isCostSaved ? `$${r.differenceUsd.toFixed(2)}` : `+$${r.differenceUsd.toFixed(2)}`;
    }
    
    let pctStr = '0%';
    if (!isCostEqual) {
      pctStr = isCostSaved ? `Saved ${Math.abs(r.differencePercent).toFixed(1)}%` : `Increased +${r.differencePercent.toFixed(1)}%`;
    }

    tableRows.push([
      idx + 1,
      formatEnglishMonthPdf(r.monthYear) + ` (${r.monthYear})`,
      `$${r.costBeforeUsd.toFixed(2)}`,
      `$${r.costAfterUsd.toFixed(2)}`,
      diffStr,
      pctStr,
      transliterateKhmerToLatin(r.recordedBy),
      r.notes ? transliterateKhmerToLatin(r.notes) : ''
    ]);
  });
  
  doc.autoTable({
    startY: 52,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, font: 'Helvetica' },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 32 },
      2: { cellWidth: 24 },
      3: { cellWidth: 24 },
      4: { cellWidth: 24 },
      5: { cellWidth: 26 },
      6: { cellWidth: 26 },
      7: { cellWidth: 24 }
    }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(10);
  doc.text('Prepared By:', 14, finalY + 15);
  doc.text('__________________', 14, finalY + 25);
  doc.text('Admin Supervisor', 14, finalY + 30);
  
  doc.text('Approved By:', 140, finalY + 15);
  doc.text('__________________', 140, finalY + 25);
  doc.text('School Principal', 140, finalY + 30);
  
  doc.save(`WIS_Water_Supply_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
