/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Staff, 
  Department, 
  AttendanceRecord, 
  CleaningTask, 
  DEPARTMENT_NAMES_KM, 
  WaterRecord,
  MonthlyReport,
  LunchRecord,
  MosquitoSpraySchedule,
  AchievementRecord,
  InsuranceClaimRecord,
  StudentAbsentRecord,
  StudentSickRecord
} from '../types';

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
  
  autoTable(doc, {
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

  autoTable(doc, {
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
  
  autoTable(doc, {
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
  
  autoTable(doc, {
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

/**
 * Helper to export the Monthly Performance Report to PDF
 */
export function exportMonthlyReportToPdf(report: MonthlyReport) {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  // 1. Initial Page Branding Banner
  doc.setFillColor(7, 59, 58); // Western deep green (#073B3A)
  doc.rect(0, 0, 210, 16, 'F');
  
  doc.setFillColor(251, 191, 36); // Amber Gold divider line
  doc.rect(0, 16, 210, 2, 'F');
  
  // Header Branding Text
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('WESTERN INTERNATIONAL SCHOOL', 14, 11);
  
  doc.setFontSize(8);
  doc.setTextColor(217, 249, 157); // Light green-yellow
  doc.text('WIS COMPREHENSIVE CAMPUS SUMMARY RECORD', 140, 11);

  // Document Title & Reference Month
  doc.setTextColor(7, 59, 58);
  doc.setFontSize(18);
  doc.text('MONTHLY PERFORMANCE REPORT', 14, 28);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Reference Month: `, 14, 35);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(7, 59, 58);
  doc.text(`${report.month.toUpperCase()}`, 45, 35);
  
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Report Level: Administrative Review SOP-2.1`, 14, 40);
  doc.text(`Generated On: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 110, 40);
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(14, 43, 196, 43);

  let currentY = 50;

  // Function to check and prevent orphaned headings (adds new page if near bottom)
  const ensureSpace = (heightNeeded: number) => {
    if (currentY + heightNeeded > 280) {
      doc.addPage();
      currentY = 20; // reset to margin top on the new page
    }
  };

  // --- SECTION 1: LUNCH RECORDS ---
  ensureSpace(25);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(7, 59, 58);
  doc.text('1. STUDENT & FACULTY LUNCH SUPPLY RECORDS', 14, currentY);
  
  const lunchColumns = ['No', 'Lunch Pack Description', 'Count (Qty)', 'Total Outlay ($)', 'Period / Active Note'];
  const lunchRows = (report.lunchList || []).map((item, idx) => [
    idx + 1,
    transliterateKhmerToLatin(item.description),
    item.count,
    `$${Number(item.total).toFixed(2)}`,
    transliterateKhmerToLatin(item.note) || 'New Academic Year: 2025-2026'
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [lunchColumns],
    body: lunchRows.length > 0 ? lunchRows : [['-', 'No lunch records entered for this period.', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [7, 59, 58], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, font: 'Helvetica' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 72 },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 26, halign: 'center' },
      4: { cellWidth: 50 }
    }
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // --- SECTION 2: MOSQUITO SPRAY ---
  ensureSpace(25);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(7, 59, 58);
  doc.text('2. SANITATION MOSQUITO SPRAY SCHEDULE BY GUARDS', 14, currentY);

  const mosqColumns = ['No', 'Date of Spray', 'Day of Week', 'Execution Time', 'Operational Instructions'];
  const mosqRows = (report.mosquitoList || []).map((item, idx) => [
    idx + 1,
    item.date,
    transliterateKhmerToLatin(item.day),
    item.time,
    'SOP compliant. Performed by guards after class hours.'
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [mosqColumns],
    body: mosqRows.length > 0 ? mosqRows : [['-', 'No mosquito spray logs captured.', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [7, 59, 58], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, font: 'Helvetica' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 32, halign: 'center' },
      2: { cellWidth: 35 },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 75 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // --- SECTION 3: KEY SCHOOL ACHIEVEMENTS ---
  ensureSpace(25);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(7, 59, 58);
  doc.text('3. CAMPUS IMPROVEMENTS & KEY ACHIEVEMENTS', 14, currentY);

  const achieveColumns = ['No', 'Notable Achievements / Upgrades Description', 'Remarks & Current Development Status'];
  const achieveRows = (report.achievementList || []).map((item, idx) => [
    idx + 1,
    transliterateKhmerToLatin(item.description),
    transliterateKhmerToLatin(item.remarks)
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [achieveColumns],
    body: achieveRows.length > 0 ? achieveRows : [['-', 'No notable development milestones recorded.', '-']],
    theme: 'grid',
    headStyles: { fillColor: [7, 59, 58], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, font: 'Helvetica' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 92 },
      2: { cellWidth: 80 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // --- SECTION 4: INSURANCE CLAIMS ---
  ensureSpace(25);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(7, 59, 58);
  doc.text('4. STUDENT INSURANCE CLAIMS TRACKING LOG', 14, currentY);

  const claimColumns = ['No', 'Student Full Name', 'Grade', 'Sex', 'Accident Date & Time', 'Claim Date', 'Coverage Remarks / Status'];
  const claimRows = (report.insuranceClaimList || []).map((item, idx) => [
    idx + 1,
    transliterateKhmerToLatin(item.name),
    item.grade,
    item.sex.includes('Female') || item.sex.includes('ស្រី') ? 'Female' : 'Male',
    `${item.dateAccident} ${item.timeAccident}`,
    item.dateClaim,
    transliterateKhmerToLatin(item.remarks)
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [claimColumns],
    body: claimRows.length > 0 ? claimRows : [['-', 'No injury insurance claims lodged this month.', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [7, 59, 58], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, font: 'Helvetica' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 35 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 32, halign: 'center' },
      5: { cellWidth: 22, halign: 'center' },
      6: { cellWidth: 50 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // --- SECTION 5: STUDENT DAILY ABSENTEES ---
  ensureSpace(25);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(7, 59, 58);
  doc.text('5. DAILY STUDENT ABSENTEES SUMMARY LOG', 14, currentY);

  const absentColumns = ['No', 'Absent Date', 'Male (Qty)', 'Female (Qty)', 'Total Absentees', 'Main Stated Circumstances & Reasons'];
  const absentRows = (report.absentList || []).map((item, idx) => [
    idx + 1,
    item.date,
    item.male,
    item.female,
    item.total,
    transliterateKhmerToLatin(item.remarks) || '-'
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [absentColumns],
    body: absentRows.length > 0 ? absentRows : [['-', 'No school absentees registered.', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [7, 59, 58], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, font: 'Helvetica' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 28, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 26, halign: 'center' },
      5: { cellWidth: 78 }
    }
  });

  // Brief absentees summary helper text if we have rows
  if (report.absentList && report.absentList.length > 0) {
    const totalAbs = report.absentList.reduce((acc, c) => acc + c.total, 0);
    const avgAbs = (totalAbs / report.absentList.length).toFixed(1);
    doc.setFontSize(8.5);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(`* Total Days Tracked: ${report.absentList.length} days | Total Cumulative Absent days: ${totalAbs} | Avg: ${avgAbs} daily absentees.`, 14, (doc as any).lastAutoTable.finalY + 5);
    currentY = (doc as any).lastAutoTable.finalY + 12;
  } else {
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // --- SECTION 6: DAILY STUDENT SICK LOGS ---
  ensureSpace(25);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(7, 59, 58);
  doc.text('6. DAILY STUDENT SICK & CLINIC VISITS LOG', 14, currentY);

  const sickColumns = ['No', 'Date Logged', 'Male Case', 'Female Case', 'Total Incident', 'Primary Symptoms & Clinic Response'];
  const sickRows = (report.sickList || []).map((item, idx) => [
    idx + 1,
    item.date,
    item.male,
    item.female,
    item.total,
    transliterateKhmerToLatin(item.remarks) || '-'
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [sickColumns],
    body: sickRows.length > 0 ? sickRows : [['-', 'No students reported ill in the campus clinic.', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [7, 59, 58], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, font: 'Helvetica' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 28, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 26, halign: 'center' },
      5: { cellWidth: 78 }
    }
  });

  // Brief sick summary helper text if we have rows
  if (report.sickList && report.sickList.length > 0) {
    const totalSick = report.sickList.reduce((acc, c) => acc + c.total, 0);
    doc.setFontSize(8.5);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(`* Total Campus Medical Incidents: ${totalSick} cases recorded and handled by campus nurse.`, 14, (doc as any).lastAutoTable.finalY + 5);
    currentY = (doc as any).lastAutoTable.finalY + 15;
  } else {
    currentY = (doc as any).lastAutoTable.finalY + 12;
  }

  // --- SIGNATURE FOOTER ACCENT BLOCK ---
  ensureSpace(45);
  
  // Footer rule
  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, currentY, 196, currentY);

  currentY += 8;

  // Signatures
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Prepared By:', 14, currentY);
  
  doc.text('Verified & Approved By:', 135, currentY);

  doc.setFontSize(10);
  doc.setTextColor(7, 59, 58);
  const prepName = transliterateKhmerToLatin(report.preparedBy || 'Mr. LOUNG Veasna');
  const prepTitle = transliterateKhmerToLatin(report.preparedTitle || 'Admin Supervisor');
  doc.text(prepName, 14, currentY + 18);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text('_________________________', 14, currentY + 12);
  doc.text(prepTitle, 14, currentY + 22);
  doc.setFontSize(7.5);
  doc.text('Signature Verified Digitally', 14, currentY + 26);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(7, 59, 58);
  doc.text('School Principal', 135, currentY + 18);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text('_________________________', 135, currentY + 12);
  doc.text('Western International School', 135, currentY + 22);

  // Print Date footprint on bottom left
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`WIS-SOP-V2.1 • MONTHLY_REPORTS_DB • SYSTEM ID: ${report.id}`, 14, 287);
  doc.text(`Report Ref: PDF_COMP_SUMMARY`, 160, 287);

  // Save PDF
  doc.save(`WIS_Monthly_Performance_Report_${report.id}.pdf`);
}
