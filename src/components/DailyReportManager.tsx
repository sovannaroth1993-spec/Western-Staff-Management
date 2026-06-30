import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, User, ClipboardList, Plus, Trash2, Eye, Printer, 
  Edit3, Save, X, Check, FileText, ChevronRight, Search, Activity, 
  Sparkles, Filter, CheckCircle, AlertTriangle, Play, HelpCircle, Download,
  Building, ChevronDown, Pin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DailyReport, HourlyLog, UserAccount, DEPARTMENT_NAMES_KM } from '../types';

// Standard English & Khmer default activities preset
const DEFAULT_HOURLY_LOGS_DEMO: HourlyLog[] = [
  {
    id: 'hl-1',
    date: '2026-06-10',
    activity: 'អញ្ជើញត្រួតពិនិត្យវត្តមានបុគ្គលិកសន្តិសុខ និងកម្លាំងយាមល្បាតតាមច្រកទ្វារសាលា (Inspect security guard assembly and gate operations)',
    status: 'Completed',
    remarks: 'គ្រប់គ្នាមកទាន់ពេល និងរៀបរយល្អ'
  },
  {
    id: 'hl-2',
    date: '2026-06-10',
    activity: 'ដើរត្រួតពិនិត្យប្រព័ន្ធម៉ាស៊ីនត្រជាក់ (AC) និងឧបករណ៍អគ្គិសនីតាមបណ្តាបន្ទប់រៀនជាន់ទី១ និងជាន់ទី២ (Audit room ACs and electricity on 1st & 2nd floors)',
    status: 'Completed',
    remarks: 'រកឃើញម៉ាស៊ីនត្រជាក់បន្ទប់ ២០១ មិនសូវត្រជាក់'
  },
  {
    id: 'hl-3',
    date: '2026-06-10',
    activity: 'ពិនិត្យដំណើរការកាមេរ៉ាសុវត្ថិភាព CCTV ក្នុងមជ្ឈមណ្ឌលបញ្ជា និងផ្ទៀងផ្ទាត់ការថត (Verify CCTV control feed integrity and hard drive backup)',
    status: 'Completed',
    remarks: 'កាមេរ៉ាទាំងអស់៥៦គ្រាប់ ដំណើរការល្អ'
  },
  {
    id: 'hl-4',
    date: '2026-06-10',
    activity: 'រៀបចំរបាយការណ៍រួមប្រចាំថ្ងៃ និងត្រួតពិនិត្យច្រកចេញ-ចូល ធានាសុវត្ថិភាពសិស្ស (Construct overall daily report and monitor security dismissals)',
    status: 'In progress',
    remarks: 'កំពុងបន្តអនុវត្ត'
  }
];

const INITIAL_REPORTS_MOCK: DailyReport[] = [
  {
    id: 'dr-1',
    date: '2026-06-10',
    reporterName: 'LOUNG Veasna (Admin Supervisor)',
    hourlyLogs: DEFAULT_HOURLY_LOGS_DEMO,
    createdAt: '2026-06-10T10:00:00.000Z',
    department: 'Operations'
  },
  {
    id: 'dr-2',
    date: '2026-06-09',
    reporterName: 'LOUNG Veasna (Admin Supervisor)',
    hourlyLogs: [
      {
        id: 'hl-b1',
        date: '2026-06-09',
        activity: 'ទទួលវត្តមានបុគ្គលិក និងរៀបចំផែនការការងារប្រចាំថ្ងៃ (Staff check-in & setup daily checklist)',
        status: 'Completed'
      },
      {
        id: 'hl-b2',
        date: '2026-06-09',
        activity: 'ចុះពិនិត្យប្រព័ន្ធដកដង្ហើម និងម៉ាស៊ីនត្រជាក់ទូទាំងវិទ្យាល័យ (Full school AC & ventilation sanity checks)',
        status: 'Completed',
        remarks: 'បានសំអាតបរិក្ខារបន្ទប់កុំព្យូទ័រ'
      },
      {
        id: 'hl-b3',
        date: '2026-06-09',
        activity: 'សម្របសម្រួលជាមួយក្រុមសន្តិសុខក្នុងការបញ្ជូនសិស្សត្រឡប់ទៅផ្ទះ (Manage dismissal gate operations and secure premises)',
        status: 'Completed'
      }
    ],
    createdAt: '2026-06-09T10:05:00.000Z',
    department: 'Operations'
  }
];

interface DailyReportManagerProps {
  initialDate?: string | null;
  onClearInitialDate?: () => void;
  currentUser?: UserAccount | null;
}

export default function DailyReportManager({ initialDate, onClearInitialDate, currentUser }: DailyReportManagerProps) {
  const [reports, setReports] = useState<DailyReport[]>(() => {
    const saved = localStorage.getItem('wis_daily_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Error loading daily reports:', err);
      }
    }
    return INITIAL_REPORTS_MOCK;
  });

  const isAdmin = currentUser?.role === 'admin';
  const displayedReports = React.useMemo(() => {
    if (isAdmin) return reports;
    return reports.filter(r => r.createdBy === currentUser?.username);
  }, [reports, currentUser, isAdmin]);

  // School logo state
  const [logo, setLogo] = useState<string>(() => {
    try {
      return localStorage.getItem('wis_school_logo') || '';
    } catch {
      return '';
    }
  });

  // Sync logo in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        setLogo(localStorage.getItem('wis_school_logo') || '');
      } catch {}
    };
    window.addEventListener('wis_logo_changed', handleStorageChange);
    return () => {
      window.removeEventListener('wis_logo_changed', handleStorageChange);
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState<string>('All');
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  
  // Inline editing states
  const [inlineEditingField, setInlineEditingField] = useState<string | null>(null);
  const [inlineEditValue, setInlineEditValue] = useState('');
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  // Form Fields
  const [formDate, setFormDate] = useState('');
  const [formReporter, setFormReporter] = useState('LOUNG Veasna (Admin Supervisor)');
  const [formDepartment, setFormDepartment] = useState('Operations');
  const [formIssuesEncountered, setFormIssuesEncountered] = useState('');
  const [formActionsTaken, setFormActionsTaken] = useState('');
  const [formPlanForTomorrow, setFormPlanForTomorrow] = useState('');
  const [formRemarks, setFormRemarks] = useState('');
  const [formPinned, setFormPinned] = useState(false);

  // Hourly log listings in Form (Summary of Activities)
  const [formHourlyLogs, setFormHourlyLogs] = useState<HourlyLog[]>([]);

  // Load staff list & attendance records from localStorage dynamically when date changes or form updates
  const [staffList, setStaffList] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  useEffect(() => {
    try {
      const savedStaff = localStorage.getItem('wis_staff_list');
      if (savedStaff) {
        setStaffList(JSON.parse(savedStaff));
      }
      const savedAttendance = localStorage.getItem('wis_attendance_records');
      if (savedAttendance) {
        setAttendanceRecords(JSON.parse(savedAttendance));
      }
    } catch (e) {
      console.error('Error reading staff/attendance from localStorage:', e);
    }
  }, [selectedReport?.date, isFormOpen]);

  const dateAttendance = React.useMemo(() => {
    if (!selectedReport) return [];
    return attendanceRecords.filter((r: any) => r.date === selectedReport.date);
  }, [attendanceRecords, selectedReport?.date]);

  const attendanceStats = React.useMemo(() => {
    const present = dateAttendance.filter((r: any) => r.status === 'Present').length;
    const excused = dateAttendance.filter((r: any) => r.status === 'Excused').length;
    const absent = dateAttendance.filter((r: any) => r.status === 'Absent').length;
    const total = dateAttendance.length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : '0';
    return { present, excused, absent, total, rate };
  }, [dateAttendance]);

  const taskStats = React.useMemo(() => {
    if (!selectedReport) return { total: 0, completed: 0, inProgress: 0, pending: 0, followUp: 0, cancelled: 0 };
    const logs = selectedReport.hourlyLogs || [];
    const total = logs.length;
    const completed = logs.filter(l => l.status === 'Completed').length;
    const inProgress = logs.filter(l => l.status === 'In progress').length;
    const pending = logs.filter(l => l.status === 'Pending').length;
    const followUp = logs.filter(l => l.status === 'Follow up').length;
    const cancelled = logs.filter(l => l.status === 'Cancelled').length;
    return { total, completed, inProgress, pending, followUp, cancelled };
  }, [selectedReport]);

  const absentOrExcusedStaff = React.useMemo(() => {
    return dateAttendance.filter((r: any) => r.status === 'Absent' || r.status === 'Excused');
  }, [dateAttendance]);

  const departmentBreakdown = React.useMemo(() => {
    const breakdown: Record<string, { present: number; excused: number; absent: number; total: number }> = {};
    dateAttendance.forEach((r: any) => {
      const dept = r.department || 'Other';
      if (!breakdown[dept]) {
        breakdown[dept] = { present: 0, excused: 0, absent: 0, total: 0 };
      }
      breakdown[dept].total++;
      if (r.status === 'Present') breakdown[dept].present++;
      else if (r.status === 'Excused') breakdown[dept].excused++;
      else if (r.status === 'Absent') breakdown[dept].absent++;
    });
    return breakdown;
  }, [dateAttendance]);

  // Activity log building in Form
  const [currentLogDate, setCurrentLogDate] = useState('');
  const [currentActivity, setCurrentActivity] = useState('');
  const [currentStatus, setCurrentStatus] = useState<'Completed' | 'In progress' | 'Pending' | 'Follow up' | 'Cancelled'>('Completed');

  // Inline Activity Log states for the new on-screen data entry form
  const [inlineLogDate, setInlineLogDate] = useState('');
  const [inlineLogStatus, setInlineLogStatus] = useState<'Completed' | 'In progress' | 'Pending' | 'Follow up' | 'Cancelled'>('Completed');
  const [inlineLogActivity, setInlineLogActivity] = useState('');

  // Sync inline log date when report is selected
  useEffect(() => {
    if (selectedReport) {
      setInlineLogDate(selectedReport.date);
    }
  }, [selectedReport?.id, selectedReport?.date]);

  // Load standard date
  useEffect(() => {
    const today = new Date().toISOString().substring(0, 10);
    setFormDate(today);
    setCurrentLogDate(today);
  }, []);

  // Sync current log date with form date
  useEffect(() => {
    if (formDate) {
      setCurrentLogDate(formDate);
    }
  }, [formDate]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('wis_daily_reports', JSON.stringify(reports));
  }, [reports]);

  // Deep Link navigation logic from Khmer Calendar
  useEffect(() => {
    if (initialDate) {
      const existing = reports.find(r => r.date === initialDate);
      if (existing) {
        setSelectedReport(existing);
        setEditingReport(null);
        setIsFormOpen(false);
      } else {
        setEditingReport(null);
        setFormDate(initialDate);
        setCurrentLogDate(initialDate);
        setFormReporter('LOUNG Veasna (Admin Supervisor)');
        setFormDepartment('Operations');
        setFormIssuesEncountered('');
        setFormActionsTaken('');
        setFormPlanForTomorrow('');
        setFormRemarks('');
        setFormPinned(false);
        setFormHourlyLogs([...DEFAULT_HOURLY_LOGS_DEMO.map(l => ({ ...l, id: Math.random().toString(), date: initialDate }))]);
        setIsFormOpen(true);
        setSelectedReport(null);
      }
      if (onClearInitialDate) {
        onClearInitialDate();
      }
    }
  }, [initialDate, reports, onClearInitialDate]);

  const handleOpenNewForm = () => {
    setEditingReport(null);
    const today = new Date().toISOString().substring(0, 10);
    setFormDate(today);
    setCurrentLogDate(today);
    setFormReporter('LOUNG Veasna (Admin Supervisor)');
    setFormDepartment('Operations');
    setFormIssuesEncountered('');
    setFormActionsTaken('');
    setFormPlanForTomorrow('');
    setFormRemarks('');
    setFormPinned(false);
    setFormHourlyLogs([...DEFAULT_HOURLY_LOGS_DEMO.map(l => ({ ...l, id: Math.random().toString(), date: today }))]);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (report: DailyReport) => {
    setEditingReport(report);
    setFormDate(report.date);
    setCurrentLogDate(report.date);
    setFormReporter(report.reporterName || 'LOUNG Veasna (Admin Supervisor)');
    setFormDepartment(report.department || 'Operations');
    setFormIssuesEncountered(report.issuesEncountered || '');
    setFormActionsTaken(report.actionsTaken || '');
    setFormPlanForTomorrow(report.planForTomorrow || '');
    setFormRemarks(report.remarks || '');
    setFormPinned(!!report.pinned);
    setFormHourlyLogs([...report.hourlyLogs]);
    setIsFormOpen(true);
  };

  const handleAddHourlyLog = () => {
    if (!currentActivity.trim()) return;

    const newLog: HourlyLog = {
      id: 'hl-' + Date.now() + Math.random().toString(36).substring(2, 5),
      date: currentLogDate || formDate || new Date().toISOString().substring(0, 10),
      activity: currentActivity.trim(),
      status: currentStatus,
      remarks: ''
    };

    setFormHourlyLogs([...formHourlyLogs, newLog]);
    setCurrentActivity('');
  };

  const handleRemoveHourlyLog = (id: string) => {
    setFormHourlyLogs(formHourlyLogs.filter(l => l.id !== id));
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();

    const reportData: DailyReport = {
      id: editingReport ? editingReport.id : 'dr-' + Date.now(),
      date: formDate,
      checkInTime: '07:30',
      checkOutTime: '17:30',
      reporterName: formReporter,
      overallSummary: formIssuesEncountered || 'គ្មានកំណត់ត្រាបញ្ហាទេ',
      hourlyLogs: formHourlyLogs,
      createdAt: editingReport ? editingReport.createdAt : new Date().toISOString(),
      department: formDepartment,
      issuesEncountered: formIssuesEncountered,
      actionsTaken: formActionsTaken,
      planForTomorrow: formPlanForTomorrow,
      remarks: formRemarks,
      createdBy: editingReport?.createdBy || currentUser?.username || 'admin',
      pinned: formPinned
    };

    if (editingReport) {
      setReports(reports.map(r => r.id === editingReport.id ? reportData : r));
    } else {
      const exists = reports.some(r => r.date === formDate);
      if (exists) {
        if (!confirm(`របាយការណ៍សម្រាប់ថ្ងៃទី ${formDate} មានរួចរាល់ហើយ។ តើអ្នកចង់ជំនួសវាឬទេ?`)) {
          return;
        }
        setReports(reports.map(r => r.date === formDate ? reportData : r));
      } else {
        setReports([reportData, ...reports]);
      }
    }

    setIsFormOpen(false);
    setSelectedReport(reportData);
  };

  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('តើអ្នកពិតជាចង់លុបរបាយការណ៍ប្រចាំថ្ងៃនេះមែនទេ?')) {
      const remaining = reports.filter(r => r.id !== id);
      setReports(remaining);
      if (selectedReport && selectedReport.id === id) {
        setSelectedReport(null);
      }
    }
  };

  const handleTogglePinReport = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReports(prev => prev.map(r => r.id === id ? { ...r, pinned: !r.pinned } : r));
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport(prev => prev ? { ...prev, pinned: !prev.pinned } : null);
    }
  };

  const uniqueDates = React.useMemo(() => {
    const datesSet = new Set<string>();
    displayedReports.forEach(r => {
      if (r.date) datesSet.add(r.date);
    });
    return Array.from(datesSet).sort((a, b) => b.localeCompare(a));
  }, [displayedReports]);

  const filteredReports = displayedReports.filter(r => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = (
      r.date.includes(q) ||
      (r.department || '').toLowerCase().includes(q) ||
      r.reporterName.toLowerCase().includes(q) ||
      (r.issuesEncountered || '').toLowerCase().includes(q) ||
      r.hourlyLogs.some(log => log.activity.toLowerCase().includes(q))
    );
    const matchesDate = filterDate === 'All' || r.date === filterDate;
    return matchesSearch && matchesDate;
  });

  const sortedAndFilteredReports = React.useMemo(() => {
    return [...filteredReports].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.date.localeCompare(a.date);
    });
  }, [filteredReports]);

  const handleExportCSV = () => {
    if (!selectedReport) return;
    
    // Prepare header lines with UTF-8 BOM for perfect Khmer character sets support in MS Excel
    let csvContent = "\uFEFF"; 
    csvContent += "Western International School - Daily Operations Report\n";
    csvContent += `Date: ${selectedReport.date}\n`;
    csvContent += `Department: ${selectedReport.department || 'Operations'}\n\n`;
    
    // Headers for tasks
    csvContent += "No,Date,Description of Work,Status\n";
    selectedReport.hourlyLogs.forEach((log, idx) => {
      const cleanActivity = log.activity.replace(/"/g, '""');
      const logDate = log.date || selectedReport.date;
      csvContent += `${idx + 1},"${logDate}","${cleanActivity}","${log.status}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `WIS_Daily_Report_${selectedReport.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (!selectedReport) return;
    try {
      const blob = new Blob([JSON.stringify(selectedReport, null, 2)], { type: "application/json;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', url);
      downloadAnchor.setAttribute('download', `WIS_Daily_Report_${selectedReport.date}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export JSON failed:", err);
    }
  };

  const handlePrint = () => {
    const reportSheet = document.getElementById('report-sheet');
    if (!reportSheet) return;

    // Create a temporary hidden iframe to isolate the printable report
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!iframeDoc) return;

    // Collect all stylesheets and style blocks from the host document to replicate exact Tailwind utility classes
    let stylesAndLinks = '';
    document.querySelectorAll('link[rel="stylesheet"], style').forEach((el) => {
      stylesAndLinks += el.outerHTML;
    });

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Operations Report - Western International School</title>
          <meta charset="utf-8" />
          
          <!-- Guarantee Noto Sans Khmer and Moul web fonts are fully imported so they don't default or get distorted -->
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Moul&family=Noto+Sans+Khmer:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          
          ${stylesAndLinks}
          
          <style>
            /* Set accurate A4 size and margins to keep design perfect without cutoff */
            @page {
              size: A4 portrait;
              margin: 1.2cm 1.0cm;
            }
            
            body {
              background-color: white !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: "Khmer OS Siemreap", "Siemreap", "Kantumruy Pro", "Inter", sans-serif !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* Explicit high-contrast rules for Moul (Traditional Khmer Title Script) */
            .font-moul {
              font-family: "Khmer OS Muol Light", "Moul", "Khmer OS Muol", serif !important;
              text-shadow: none !important;
              font-weight: normal !important;
            }
            
            .font-sans {
              font-family: "Khmer OS Siemreap", "Siemreap", "Kantumruy Pro", "Inter", sans-serif !important;
            }

            input[type="checkbox"] {
              vertical-align: middle !important;
            }

            /* Hide general interactive helper components or editing widgets in vectors */
            .no-print, [title="Upload custom logo"], .group\/edit:hover svg {
              display: none !important;
            }

            .page-break-inside-avoid {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            .signature-section {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          </style>
        </head>
        <body class="bg-white">
          <div id="printable-scope">
            ${reportSheet.outerHTML}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    let hasPrinted = false;
    const triggerSystemPrint = () => {
      if (hasPrinted) return;
      hasPrinted = true;
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (error) {
          console.error("Iframe printing exception occurred: ", error);
        }
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 1500);
      }, 1000);
    };

    iframe.onload = triggerSystemPrint;
    if (iframeDoc.readyState === 'complete') {
      triggerSystemPrint();
    }
  };

  const handleInlineAddActivity = () => {
    if (!selectedReport || !inlineLogActivity.trim()) return;
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: inlineLogDate || selectedReport.date,
      activity: inlineLogActivity.trim(),
      status: inlineLogStatus
    };
    const updatedLogs = [...selectedReport.hourlyLogs, newLog];
    handleUpdateInlineField(selectedReport.id, 'hourlyLogs', updatedLogs);
    setInlineLogActivity('');
  };

  const handleUpdateInlineField = (reportId: string, field: string, value: any) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        const updated = { ...r, [field]: value };
        if (selectedReport && selectedReport.id === reportId) {
          setSelectedReport(updated);
        }
        return updated;
      }
      return r;
    }));
    setInlineEditingField(null);
  };

  const renderEditableBlock = (
    field: string,
    label: string,
    currentValue: string,
    customSave?: (newValue: string) => void,
    alignCenter?: boolean
  ) => {
    const isEditing = inlineEditingField === field;
    if (isEditing) {
      return (
        <div className="flex gap-2 p-1 bg-amber-50 rounded-lg border border-amber-300 w-full no-print mt-1">
          <textarea
            value={inlineEditValue}
            onChange={(e) => setInlineEditValue(e.target.value)}
            className="text-xs text-slate-800 bg-white border border-slate-300 p-2 rounded-lg w-full outline-none focus:ring-1 focus:ring-emerald-600"
            rows={3}
            autoFocus
          />
          <div className="flex flex-col gap-1 inline-flex shrink-0">
            <button
              type="button"
              onClick={() => {
                if (customSave) {
                  customSave(inlineEditValue);
                } else if (selectedReport) {
                  handleUpdateInlineField(selectedReport.id, field, inlineEditValue);
                }
                setInlineEditingField(null);
              }}
              className="p-1.5 bg-emerald-700 hover:bg-emerald-850 text-white rounded-md cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setInlineEditingField(null)}
              className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );
    }
    return (
      <div 
        onClick={() => {
          setInlineEditingField(field);
          setInlineEditValue(currentValue || '');
        }}
        className={`group/edit cursor-pointer hover:bg-amber-50/50 px-2 py-1 rounded-lg border border-transparent hover:border-amber-200/40 flex items-center ${alignCenter ? 'justify-center relative' : 'justify-between'} gap-2 mt-1 min-h-[1.5rem]`}
      >
        <p className={`text-xs text-slate-850 font-medium leading-relaxed whitespace-pre-wrap ${alignCenter ? 'text-center' : ''}`}>
          {currentValue || <span className="text-slate-400 italic">ចុចត្រង់នេះដើម្បីបំពេញព័ត៌មាន...</span>}
        </p>
        <Edit3 className={`w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover/edit:opacity-100 transition shrink-0 no-print ${alignCenter ? 'absolute right-2 opacity-0 group-hover/edit:opacity-100' : ''}`} />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden font-sans text-slate-800">
      
      {/* Upper Color Banner */}
      <div className="bg-gradient-to-r from-[#073B3A] to-[#0d5c5a] p-6 text-white relative">
        <div className="absolute right-6 top-6 opacity-10">
          <ClipboardList className="w-24 h-24" />
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-400 text-slate-900 rounded-2xl shadow-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] bg-teal-900/40 text-emerald-300 font-extrabold uppercase px-2.5 py-1 rounded-full border border-teal-800/50">
              Operations Daily Reporting
            </span>
            <h1 className="text-xl sm:text-2xl font-black mt-1 text-slate-100 font-moul">
              របាយការណ៍ប្រចាំថ្ងៃ (Daily Report)
            </h1>
            <p className="text-xs text-slate-200 mt-1 font-medium max-w-2xl">
              រៀបចំ និងបោះពុម្ពទម្រង់របាយការណ៍ប្រចាំថ្ងៃរបស់ការិយាល័យរដ្ឋបាល និងប្រតិបត្តិការ។
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[600px] divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        
        {/* Left Saved Reports List */}
        <div className="lg:col-span-4 p-5 flex flex-col bg-slate-50/50">
          <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
            <h3 className="text-xs font-black uppercase text-slate-550 tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>បញ្ជីរបាយការណ៍ ({filteredReports.length})</span>
            </h3>
            <button
              onClick={handleOpenNewForm}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-850 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>បង្កើតថ្មី (Create)</span>
            </button>
          </div>

          <div className="flex flex-col gap-2 mb-4 shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="ស្វែងរកតាមកាលបរិច្ឆេទ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 pl-9.5 pr-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>

            <div className="flex gap-1.5 items-center">
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-650 rounded-xl px-2.5 py-1.5 text-xs font-black cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="All">កាលបរិច្ឆេទទាំងអស់ (All Dates)</option>
                {uniqueDates.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {filterDate !== 'All' && (
                <button
                  onClick={() => setFilterDate('All')}
                  className="p-1 px-2 text-[10px] font-bold text-slate-500 bg-slate-200/60 hover:bg-slate-200 hover:text-slate-700 rounded-lg shrink-0 transition"
                  title="Clear Date Filter"
                >
                  លុប (Clear)
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-[500px] pr-1 scrollbar-thin">
            {sortedAndFilteredReports.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs py-12">
                <FileText className="w-8 h-8 mx-auto text-slate-350 mb-2" />
                <p>រកមិនឃើញរបាយការណ៍ទេ</p>
              </div>
            ) : (
              sortedAndFilteredReports.map((report) => {
                const totalTasks = report.hourlyLogs.length;
                const completedTasks = report.hourlyLogs.filter(l => l.status === 'Completed').length;
                const isSelected = selectedReport?.id === report.id;

                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer text-left relative ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-400 shadow-xs'
                        : report.pinned
                          ? 'bg-amber-50/30 border-amber-300 hover:border-amber-400 hover:bg-amber-50/50'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-xs font-extrabold text-slate-800 font-mono">
                          {report.date}
                        </span>
                        {report.pinned && (
                          <span className="inline-flex items-center text-[8px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black gap-0.5 shadow-3xs border border-amber-200/60">
                            📌  ខ្ទាស់ (Pinned)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={(e) => handleTogglePinReport(report.id, e)}
                          className={`p-1.5 hover:bg-slate-100 rounded transition ${
                            report.pinned ? 'text-amber-600 hover:text-amber-700' : 'text-slate-350 hover:text-amber-500'
                          }`}
                          title={report.pinned ? "ដកខ្ទាស់ (Unpin)" : "ខ្ទាស់របាយការណ៍ (Pin)"}
                        >
                          <Pin className={`w-3.5 h-3.5 ${report.pinned ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditForm(report);
                          }}
                          className="p-1.5 hover:bg-slate-100 hover:text-emerald-700 rounded transition text-slate-400"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteReport(report.id, e)}
                          className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded transition text-slate-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-[10px] font-bold text-slate-500 mt-1 flex justify-between">
                      <span className="text-slate-650">🏢 {report.department || 'Operations'}</span>
                      {report.reporterName && (
                        <span>✍️ {report.reporterName.split(' ')[0]}</span>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                      <span>{totalTasks} សកម្មភាពរួម</span>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[9px]">
                        {completedTasks}/{totalTasks} បានបញ្ចប់
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-emerald-600 rounded-l" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200/60 flex flex-col gap-2 shrink-0 no-print">
            <button
              type="button"
              onClick={() => {
                if (window.confirm("តើអ្នកចង់កំណត់ឡើងវិញនូវទិន្នន័យគំរូទាំងអស់ឬទេ? (រាល់ការកែប្រែនឹងត្រូវបាត់បង់)")) {
                  localStorage.setItem('wis_daily_reports', JSON.stringify(INITIAL_REPORTS_MOCK));
                  setReports(INITIAL_REPORTS_MOCK);
                  setSelectedReport(INITIAL_REPORTS_MOCK[0]);
                }
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>កំណត់ឡើងវិញទិន្នន័យគំរូ (Reset Demo Data)</span>
            </button>
          </div>
        </div>

        {/* Right Detail Presentation View (Clean A4 Standard) */}
        <div className="lg:col-span-8 p-6 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {!selectedReport ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center py-24"
              >
                <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-3 animate-pulse">
                  <ClipboardList className="w-12 h-12" />
                </div>
                <h4 className="text-sm font-black text-slate-700">សូមជ្រើសរើសរបាយការណ៍មួយ</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  ចុចលើបញ្ជីរបាយការណ៍ខាងឆ្វេង ដើម្បីពិនិត្យ ឬចុច "បង្កើតថ្មី" ដើម្បីបំពេញរបាយការណ៍ថ្មី។
                </p>
                <button
                  onClick={handleOpenNewForm}
                  className="mt-4 px-4.5 py-2.5 bg-[#073B3A] hover:bg-[#0c5352] text-white font-extrabold text-xs rounded-xl shadow transition"
                >
                  📝 សរសេររបាយការណ៍ថ្មី
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={selectedReport.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
                id="printable-report-area"
              >
                {/* Print layout inject */}
                <style dangerouslySetInnerHTML={{ __html: `
                  @media print {
                    @page {
                      size: A4 portrait;
                      margin: 1.2cm 1.0cm;
                    }
                    body * {
                      visibility: hidden !important;
                    }
                    #printable-report-area, 
                    #report-sheet, 
                    #report-sheet * {
                      visibility: visible !important;
                    }
                    #printable-report-area {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      margin: 0 !important;
                      padding: 0 !important;
                      box-shadow: none !important;
                    }
                    #report-sheet {
                      border: none !important;
                      box-shadow: none !important;
                      width: 100% !important;
                      max-width: 100% !important;
                      background: white !important;
                      padding: 0 !important;
                      margin: 0 !important;
                    }
                    .no-print {
                      display: none !important;
                    }
                    .page-break-inside-avoid {
                      page-break-inside: avoid !important;
                      break-inside: avoid !important;
                    }
                    .signature-section {
                      page-break-inside: avoid !important;
                      break-inside: avoid !important;
                    }
                    /* Crisp typography */
                    .font-moul {
                      font-family: "Khmer OS Muol Light", "Moul", "Khmer OS Muol", serif !important;
                    }
                    body {
                      font-family: "Khmer OS Siemreap", "Siemreap", "Kantumruy Pro", "Inter", sans-serif !important;
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                    }
                  }
                `}} />

                {/* Print Controls Top Ribbon */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl no-print">
                  <div className="text-xs text-slate-500 font-bold flex items-center gap-1">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>ចុចលើប្រអប់ព័ត៌មានខាងក្រោមក្រដាស A4 ផ្ទាល់ ដើម្បីកែសម្រួលរហ័ស។</span>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end flex-wrap">
                    <button
                      type="button"
                      onClick={(e) => handleTogglePinReport(selectedReport.id, e)}
                      className={`px-3.5 py-2 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
                        selectedReport.pinned
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300/50'
                      }`}
                    >
                      <Pin className={`w-3.5 h-3.5 ${selectedReport.pinned ? 'fill-current text-amber-600' : ''}`} />
                      <span>{selectedReport.pinned ? 'បានខ្ទាស់ទុក (Pinned)' : 'ខ្ទាស់របាយការណ៍ (Pin)'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditForm(selectedReport)}
                      className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>កែព័ត៌មានរួម (Form Edit)</span>
                    </button>
                    
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-sm font-sans cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>បោះពុម្ពរបាយការណ៍ (Print Report)</span>
                    </button>

                    {/* Export Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-sm font-sans cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>នាំចេញរបាយការណ៍ (Export)</span>
                        <ChevronDown className="w-3 h-3 ml-0.5 shrink-0" />
                      </button>
                      
                      {isExportDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-[80]" 
                            onClick={() => setIsExportDropdownOpen(false)} 
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-[90] font-sans text-xs shrink-0 transform origin-top-right transition-all">
                            <button
                              type="button"
                              onClick={() => {
                                handlePrint();
                                setIsExportDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5 text-indigo-500" />
                              <span>បោះពុម្ពឬរក្សាទុកជា PDF</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleExportCSV();
                                setIsExportDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2 cursor-pointer border-t border-slate-100"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-500" />
                              <span>ទាញយកជា Excel/CSV</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleExportJSON();
                                setIsExportDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2 cursor-pointer border-t border-slate-100"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-500" />
                              <span>រក្សាទុកជា JSON Backup</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main A4 Styled Sheet */}
                <div className="bg-slate-200 p-2 sm:p-5 rounded-3xl border border-slate-300 overflow-x-auto w-full">
                  <div 
                    className="bg-white border border-slate-400 p-8 sm:p-[0.8in] relative font-sans mx-auto flex flex-col justify-between text-slate-900 shadow-2xl space-y-6"
                    style={{ maxWidth: '800px', width: '100%', minHeight: '1050px' }}
                    id="report-sheet"
                  >
                    
                    {/* Header: School and Ministry Details */}
                    <div className="flex flex-col sm:flex-row justify-between items-start text-xs border-b border-slate-200 pb-4 font-sans gap-4">
                      <div className="flex items-center gap-3">
                        {logo && (
                          <img 
                            src={logo} 
                            alt="Western International School Logo" 
                            className="object-contain h-14 w-14 shrink-0 transition-all duration-300" 
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="space-y-1">
                          <h2 className="text-[12px] font-black text-[#0d5c5a] font-moul leading-tight">
                            សាលាអន្តរជាតិ វេសស្ទើន សាខាកាឌី២
                          </h2>
                          <p className="text-[9.5px] text-[#0d5c5a] font-moul">
                            ការិយាល័យរដ្ឋបាល និងបច្ចេកវិទ្យាព័ត៌មាន
                          </p>
                          <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">
                            WESTERN INTERNATIONAL SCHOOL • CKD2
                          </p>
                        </div>
                      </div>

                      <div className="text-center sm:text-right mt-2 sm:mt-0 space-y-0.5 animate-fadeIn">
                        <p className="font-moul text-[10px] leading-tight text-slate-900 tracking-wide">
                          ព្រះរាជាណាចក្រកម្ពុជា
                        </p>
                        <p className="font-moul text-[8.5px] leading-tight text-slate-800 tracking-wide">
                          ជាតិ សាសនា ព្រះមហាក្សត្រ
                        </p>
                        <div className="flex items-center justify-center sm:justify-end gap-1 mt-1">
                          <span className="text-amber-500 text-[8px] font-black">✦</span>
                          <span className="w-14 border-t-2 border-rose-500"></span>
                          <span className="text-amber-500 text-[8px] font-black">✦</span>
                        </div>
                      </div>
                    </div>

                    {/* Memo Title Header */}
                    <div className="text-center py-4 px-6 bg-[#f8fafc] border border-slate-200 rounded-2xl relative overflow-hidden my-4">
                      {selectedReport.pinned && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-amber-750 bg-amber-50/80 border border-amber-200/50 py-0.5 px-2 rounded-lg text-[10px] font-black uppercase no-print">
                          <Pin className="w-2.5 h-2.5 fill-current text-amber-600 animate-bounce" />
                          <span>Pinned</span>
                        </div>
                      )}
                      <h1 className="text-[14.5px] font-black text-[#073B3A] font-moul leading-relaxed tracking-wide">
                        របាយការណ៍ប្រតិបត្តិការប្រចាំថ្ងៃ (Daily Report)
                      </h1>
                    </div>

                    {/* Basic Meta Details Box */}
                    <div className="grid grid-cols-2 gap-6 p-4 sm:p-5 border border-slate-200 bg-white rounded-2xl text-[11.5px] font-sans text-slate-650 my-4 shadow-3xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500 shrink-0">Date (កាលបរិច្ឆេទ) :</span>
                        <div className="font-bold text-slate-800 font-mono block">
                          {renderEditableBlock('date', 'កាលបរិច្ឆេទ', selectedReport.date, (val) => {
                            handleUpdateInlineField(selectedReport.id, 'date', val);
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-500 shrink-0">Department (ផ្នែក) :</span>
                        <div className="font-bold text-slate-800 col-span-1">
                          {renderEditableBlock('department', 'ផ្នែក', selectedReport.department || 'Operations', (val) => {
                            handleUpdateInlineField(selectedReport.id, 'department', val);
                          })}
                        </div>
                      </div>
                    </div>
 
                    {/* Executive Operations Overview Dashboard */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2 border border-slate-300 rounded-2xl p-4 bg-slate-50/50 print:bg-white print:border-slate-400">
                      
                      {/* Attendance Summary Panel */}
                      <div className="space-y-2 border-b sm:border-b-0 sm:border-r border-slate-200 sm:pr-4 print:border-slate-350">
                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-850 uppercase tracking-wide">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 no-print" />
                          <span>Staff Attendance Summary</span>
                        </div>
                        <p className="font-moul text-[9px] text-[#0d5c5a] leading-tight mt-0.5">
                          សេចក្តីសង្ខេបវត្តមានបុគ្គលិកប្រចាំថ្ងៃ
                        </p>
                        
                        {/* Attendance Stats Grid */}
                        <div className="grid grid-cols-4 gap-1.5 pt-2 text-center">
                          <div className="bg-emerald-50/60 p-2 rounded-xl border border-emerald-200/50 print:bg-white print:border-slate-300">
                            <span className="text-[8px] font-black text-emerald-800 uppercase block tracking-wider">Present</span>
                            <span className="text-xs font-black text-emerald-700 font-mono block mt-1">{attendanceStats.present}</span>
                          </div>
                          <div className="bg-amber-50/60 p-2 rounded-xl border border-amber-200/50 print:bg-white print:border-slate-300">
                            <span className="text-[8px] font-black text-amber-800 uppercase block tracking-wider">Excused</span>
                            <span className="text-xs font-black text-amber-700 font-mono block mt-1">{attendanceStats.excused}</span>
                          </div>
                          <div className="bg-rose-50/60 p-2 rounded-xl border border-rose-200/50 print:bg-white print:border-slate-300">
                            <span className="text-[8px] font-black text-rose-800 uppercase block tracking-wider">Absent</span>
                            <span className="text-xs font-black text-rose-700 font-mono block mt-1">{attendanceStats.absent}</span>
                          </div>
                          <div className="bg-indigo-50/60 p-2 rounded-xl border border-indigo-200/50 print:bg-white print:border-slate-300">
                            <span className="text-[8px] font-black text-indigo-800 uppercase block tracking-wider">Rate</span>
                            <span className="text-xs font-black text-indigo-700 font-mono block mt-1">{attendanceStats.rate}%</span>
                          </div>
                        </div>

                        {/* Headcount Subtitle Info */}
                        <div className="text-[9.5px] text-slate-500 font-medium pt-1">
                          Total Logged Staff: <span className="font-bold text-slate-800 font-mono">{attendanceStats.total}</span>
                        </div>
                      </div>

                      {/* Tasks/Activities Summary Panel */}
                      <div className="space-y-2 sm:pl-4">
                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-855 uppercase tracking-wide">
                          <ClipboardList className="w-3.5 h-3.5 text-indigo-600 shrink-0 no-print" />
                          <span>Daily Tasks Summary</span>
                        </div>
                        <p className="font-moul text-[9px] text-[#0d5c5a] leading-tight mt-0.5">
                          សេចក្តីសង្ខេបស្ថានភាពសកម្មភាពការងារ
                        </p>

                        {/* Tasks Stats Grid */}
                        <div className="grid grid-cols-4 gap-1.5 pt-2 text-center">
                          <div className="bg-emerald-50/60 p-2 rounded-xl border border-emerald-200/50 print:bg-white print:border-slate-300">
                            <span className="text-[8px] font-black text-emerald-800 uppercase block tracking-wider">Done</span>
                            <span className="text-xs font-black text-emerald-700 font-mono block mt-1">{taskStats.completed}</span>
                          </div>
                          <div className="bg-purple-50/60 p-2 rounded-xl border border-purple-200/50 print:bg-white print:border-slate-300">
                            <span className="text-[8px] font-black text-purple-800 uppercase block tracking-wider">Active</span>
                            <span className="text-xs font-black text-purple-700 font-mono block mt-1">{taskStats.inProgress}</span>
                          </div>
                          <div className="bg-amber-50/60 p-2 rounded-xl border border-amber-200/50 print:bg-white print:border-slate-300">
                            <span className="text-[8px] font-black text-amber-800 uppercase block tracking-wider">Pending</span>
                            <span className="text-xs font-black text-amber-700 font-mono block mt-1">{taskStats.pending + taskStats.followUp}</span>
                          </div>
                          <div className="bg-slate-100 p-2 rounded-xl border border-slate-200 print:bg-white print:border-slate-300">
                            <span className="text-[8px] font-black text-slate-800 uppercase block tracking-wider">Total</span>
                            <span className="text-xs font-black text-slate-800 font-mono block mt-1">{taskStats.total}</span>
                          </div>
                        </div>

                        {/* Completion Subtitle Info */}
                        <div className="text-[9.5px] text-slate-500 font-medium pt-1">
                          Tasks Completion Rate: <span className="font-bold text-slate-800 font-mono">
                            {taskStats.total > 0 ? ((taskStats.completed / taskStats.total) * 100).toFixed(0) : 0}%
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* 1. Summary of Activities (No, Date, Description, Status) */}
                    <div className="space-y-3 mt-6">
                      <h3 className="text-[11.5px] font-extrabold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-1">
                        <span className="inline-flex items-center justify-center bg-[#0d5c5a] text-white rounded-full w-5 h-5 text-[10px] font-black font-sans shrink-0 mr-1">1</span>
                        <span className="font-sans font-bold">Summary of Activities</span>
                        <span className="font-moul text-[10.5px] text-[#0d5c5a] font-normal ml-1">
                          ( បញ្ជីការងារ និងសកម្មភាពលម្អិត )
                        </span>
                      </h3>

                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-3xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#f8fafc] text-[10px] font-black text-slate-700 border-b border-slate-200 uppercase">
                              <th className="p-3 text-center border-r border-slate-200 w-16 text-slate-600">NO</th>
                              <th className="p-3 text-center border-r border-slate-200 w-36 text-slate-600">DATE ( កាលបរិច្ឆេទ )</th>
                              <th className="p-3 text-center border-r border-slate-200 text-slate-600">DESCRIPTION OF WORK ( ការពិពណ៌នាការងារ )</th>
                              <th className="p-3 text-center w-64 text-slate-600">STATUS ( ស្ថានភាពការងារ )</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white text-[11px] font-medium text-slate-800">
                            {selectedReport.hourlyLogs.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="p-6 text-center text-slate-400 italic">
                                  មិនមានបញ្ជីសកម្មភាពប្រចាំថ្ងៃត្រូវបានបញ្ចូលឡើយ។
                                </td>
                              </tr>
                            ) : (
                              selectedReport.hourlyLogs.map((log, index) => (
                                <tr key={log.id} className="border-b border-slate-150 hover:bg-slate-50/50">
                                  
                                  {/* No. */}
                                  <td className="p-3 border-r border-slate-200 text-center font-mono text-xs text-slate-400 bg-slate-50/20">
                                    {index + 1}
                                  </td>

                                  {/* Date */}
                                  <td className="p-3 border-r border-slate-200 text-center font-mono font-bold text-slate-600">
                                    {renderEditableBlock(`log-date-${log.id}`, 'កាលបរិច្ឆេទ', log.date || selectedReport.date, (val) => {
                                      const updated = selectedReport.hourlyLogs.map(l => l.id === log.id ? { ...l, date: val } : l);
                                      handleUpdateInlineField(selectedReport.id, 'hourlyLogs', updated);
                                    }, true)}
                                  </td>

                                  {/* Description of Work */}
                                  <td className="p-3 border-r border-slate-200 font-medium text-slate-800 max-w-sm whitespace-pre-line leading-relaxed text-left">
                                    {renderEditableBlock(`log-activity-${log.id}`, 'កិច្ចការ', log.activity, (val) => {
                                      const updated = selectedReport.hourlyLogs.map(l => l.id === log.id ? { ...l, activity: val } : l);
                                      handleUpdateInlineField(selectedReport.id, 'hourlyLogs', updated);
                                    })}
                                  </td>

                                  {/* Status Selectors */}
                                  <td className="p-3 text-center w-52">
                                    {/* Non-print: beautiful custom-styled select badge */}
                                    <div className="relative inline-block no-print mx-auto">
                                      <select
                                        value={log.status}
                                        onChange={(e) => {
                                          const st = e.target.value as any;
                                          const updated = selectedReport.hourlyLogs.map(l => l.id === log.id ? { ...l, status: st } : l);
                                          handleUpdateInlineField(selectedReport.id, 'hourlyLogs', updated);
                                        }}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold cursor-pointer transition-all border duration-150 outline-none text-center pr-8 appearance-none hover:shadow-xs shadow-2xs ${
                                          log.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 focus:ring-1 focus:ring-emerald-400'
                                            : log.status === 'In progress' ? 'bg-purple-50 text-purple-700 border-purple-300 focus:ring-1 focus:ring-purple-400'
                                            : log.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-300 focus:ring-1 focus:ring-amber-400'
                                            : log.status === 'Follow up' ? 'bg-blue-50 text-blue-700 border-blue-300 focus:ring-1 focus:ring-blue-400'
                                            : 'bg-rose-50 text-rose-700 border-rose-300 focus:ring-1 focus:ring-rose-400'
                                        }`}
                                      >
                                        <option value="Completed" className="text-emerald-700 font-bold">Completed</option>
                                        <option value="In progress" className="text-purple-700 font-bold">In progress</option>
                                        <option value="Pending" className="text-amber-700 font-bold">Pending</option>
                                        <option value="Follow up" className="text-blue-700 font-bold">Follow up</option>
                                        <option value="Cancelled" className="text-rose-700 font-bold">Cancelled</option>
                                      </select>
                                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                                        <ChevronDown className={`w-3.5 h-3.5 opacity-80 ${
                                          log.status === 'Completed' ? 'text-emerald-600'
                                            : log.status === 'In progress' ? 'text-purple-600'
                                            : log.status === 'Pending' ? 'text-amber-600'
                                            : log.status === 'Follow up' ? 'text-blue-600'
                                            : 'text-rose-600'
                                        }`} />
                                      </div>
                                    </div>

                                    {/* Print-only: static elegant badge */}
                                    <span className={`hidden print:inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${
                                      log.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                        : log.status === 'In progress' ? 'bg-purple-50 text-purple-700 border-purple-300'
                                        : log.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-300'
                                        : log.status === 'Follow up' ? 'bg-blue-50 text-blue-700 border-blue-300'
                                        : 'bg-rose-50 text-rose-700 border-rose-300'
                                    }`}>
                                      {log.status}
                                    </span>
                                  </td>

                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 2. Detailed Staff Attendance & Absences (Department Headcounts & Leave Registry) */}
                    <div className="space-y-4 mt-6 page-break-inside-avoid">
                      <h3 className="text-[11.5px] font-extrabold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-1">
                        <span className="inline-flex items-center justify-center bg-[#0d5c5a] text-white rounded-full w-5 h-5 text-[10px] font-black font-sans shrink-0 mr-1">2</span>
                        <span className="font-sans font-bold">Staff Attendance Breakdown</span>
                        <span className="font-moul text-[10.5px] text-[#0d5c5a] font-normal ml-1">
                          ( របាយការណ៍វត្តមានបុគ្គលិកលម្អិត )
                        </span>
                      </h3>

                      {dateAttendance.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic py-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                          មិនមានទិន្នន័យវត្តមានសម្រាប់ថ្ងៃនេះត្រូវបានកត់ត្រាក្នុងប្រព័ន្ធឡើយ។ (No attendance records logged for this date.)
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {/* Department Headcount Breakdown Table */}
                          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-3xs">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-[#f8fafc] text-[9.5px] font-black text-slate-700 border-b border-slate-200 uppercase">
                                  <th className="p-2.5 text-left pl-4 border-r border-slate-200 text-slate-600">DEPARTMENT ( ផ្នែក )</th>
                                  <th className="p-2.5 text-center border-r border-slate-200 text-slate-600 w-24">TOTAL ( សរុប )</th>
                                  <th className="p-2.5 text-center border-r border-slate-200 text-slate-600 w-28">PRESENT ( មក )</th>
                                  <th className="p-2.5 text-center border-r border-slate-200 text-slate-600 w-28">EXCUSED ( ច្បាប់ )</th>
                                  <th className="p-2.5 text-center text-slate-600 w-28">ABSENT ( អត់ច្បាប់ )</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white text-[10.5px] font-medium text-slate-800">
                                {Object.entries(departmentBreakdown).map(([deptKey, stats]: [string, any]) => (
                                  <tr key={deptKey} className="border-b border-slate-150 last:border-b-0 hover:bg-slate-50/30">
                                    <td className="p-2.5 border-r border-slate-200 font-bold text-slate-700 text-left pl-4">
                                      {DEPARTMENT_NAMES_KM[deptKey as any] || deptKey}
                                    </td>
                                    <td className="p-2.5 border-r border-slate-200 text-center font-mono font-bold text-slate-600 bg-slate-50/10">
                                      {stats.total}
                                    </td>
                                    <td className="p-2.5 border-r border-slate-200 text-center font-mono font-black text-emerald-600 bg-emerald-50/5">
                                      {stats.present}
                                    </td>
                                    <td className="p-2.5 border-r border-slate-200 text-center font-mono font-bold text-amber-600 bg-amber-50/5">
                                      {stats.excused}
                                    </td>
                                    <td className="p-2.5 text-center font-mono font-bold text-rose-600 bg-rose-50/5">
                                      {stats.absent}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Excused & Absent Staff Members List */}
                          {absentOrExcusedStaff.length > 0 && (
                            <div className="space-y-2 mt-3 page-break-inside-avoid">
                              <h4 className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider flex items-center gap-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                                <span>Absence & Leave Registry (បញ្ជីឈ្មោះបុគ្គលិកសុំច្បាប់ និងអវត្តមាន)</span>
                              </h4>
                              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-3xs">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-slate-50 text-[9px] font-black text-slate-600 border-b border-slate-200 uppercase">
                                      <th className="p-2 pl-3 border-r border-slate-150 w-24 text-center">Staff ID</th>
                                      <th className="p-2 pl-3 border-r border-slate-150">Name ( ឈ្មោះ )</th>
                                      <th className="p-2 pl-3 border-r border-slate-150">Department ( ផ្នែក )</th>
                                      <th className="p-2 pl-3 border-r border-slate-150 w-36 text-center">Status ( ស្ថានភាព )</th>
                                      <th className="p-2 pl-3">Notes/Reason ( មូលហេតុ )</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white text-[10px] text-slate-700">
                                    {absentOrExcusedStaff.map((r: any) => (
                                      <tr key={r.id} className="border-b border-slate-150 last:border-b-0 hover:bg-slate-50/40">
                                        <td className="p-2 border-r border-slate-150 font-mono text-slate-500 text-center">{r.staffId}</td>
                                        <td className="p-2 pl-3 border-r border-slate-150 font-bold text-slate-800 text-left">{r.staffName}</td>
                                        <td className="p-2 pl-3 border-r border-slate-150 text-left">
                                          {DEPARTMENT_NAMES_KM[r.department] || r.department}
                                        </td>
                                        <td className="p-2 border-r border-slate-150 text-center font-bold">
                                          <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                                            r.status === 'Excused' 
                                              ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                                          }`}>
                                            {r.status === 'Excused' ? 'Excused (ច្បាប់)' : 'Absent (អវត្តមាន)'}
                                          </span>
                                        </td>
                                        <td className="p-2 pl-3 text-slate-500 text-left italic">
                                          {r.notes || <span className="text-slate-300">-</span>}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Signatures Block */}
                    <div className="signature-section relative mt-10 pt-6 border-t border-slate-200 grid grid-cols-2 gap-6 text-center text-xs">
                      
                      {/* Seal element */}
                      <div className="absolute right-12 bottom-0 w-24 h-24 border-4 border-double border-rose-600 rounded-full flex flex-col items-center justify-center text-center opacity-75 select-none pointer-events-none rotate-6 shadow-[inset_0_0_6px_rgba(225,29,72,0.05)] z-20">
                        <div className="text-[6.5px] font-black text-rose-650 tracking-widest uppercase mb-0.5">WESTERN INT. WIS_SCHOOL</div>
                        <div className="border-t border-b border-rose-600/50 py-0.5 px-1 font-moul text-[6px] text-rose-600">យល់ព្រមអនុម័ត</div>
                        <div className="text-[6.5px] font-black text-rose-650 tracking-wider">APPROVED</div>
                      </div>

                      {/* Signatory A: Submitted/Prepared by */}
                      <div>
                        <p className="font-extrabold text-slate-500 text-[10px] uppercase tracking-wide">Prepared By (រៀបចំដោយ)</p>
                        <div className="h-10 flex items-end justify-center font-mono text-[11px] text-indigo-700 italic select-none pb-1">
                          {selectedReport.reporterName}
                        </div>
                        <div className="font-moul text-[9px] text-[#0d5c5a] border-t border-slate-200 pt-1">
                          {renderEditableBlock('reporterName', 'Prepared By', selectedReport.reporterName, (val) => {
                            handleUpdateInlineField(selectedReport.id, 'reporterName', val);
                          }, true)}
                        </div>
                      </div>

                      {/* Signatory B: Approved by */}
                      <div>
                        <p className="font-extrabold text-slate-500 text-[10px] uppercase tracking-wide">Approved By (ពិនិត្យ & យល់ព្រម)</p>
                        <div className="h-10 flex items-center justify-center font-mono text-xs text-slate-350 select-none pb-1">
                          (ហត្ថលេខា ប្រធានការិយាល័យ)
                        </div>
                        <p className="font-moul text-[9px] text-slate-700 border-t border-slate-200 pt-1">
                          _________________________________
                        </p>
                        <p className="text-[8px] text-slate-450 mt-1 uppercase tracking-wider font-semibold">
                          Western International School Operations Board
                        </p>
                      </div>

                    </div>

                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Modern Pop-up Creation Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/70 z-[110] flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#073B3A] text-white p-4.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-black">
                    {editingReport ? 'កែសម្រួលរបាយការណ៍ប្រចាំថ្ងៃ' : 'បំពេញរបាយការណ៍ប្រតិបត្តិការប្រចាំថ្ងៃថ្មី'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveReport} className="overflow-y-auto p-5 space-y-4 flex-1 scrollbar-thin">
                
                {/* Meta properties */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-600 block">Date (កាលបរិច្ឆេទ) *</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-600 block">Department (ផ្នែក) *</label>
                    <input
                      type="text"
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-black outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-600 block">Prepared By (រៀបចំដោយ) *</label>
                    <input
                      type="text"
                      value={formReporter}
                      onChange={(e) => setFormReporter(e.target.value)}
                      className="w-full bg-white border border-slate-200 p-2 rounded-xl text-xs font-black outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Pin report option status */}
                <div className="flex items-center gap-2.5 bg-amber-50/50 border border-amber-200/70 p-3.5 rounded-2xl no-print">
                  <input
                    type="checkbox"
                    id="formPinned"
                    checked={formPinned}
                    onChange={(e) => setFormPinned(e.target.checked)}
                    className="w-4 w-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="formPinned" className="text-xs font-black text-amber-900 cursor-pointer flex items-center gap-1.5 select-none">
                    <Pin className={`w-4 h-4 ${formPinned ? 'fill-current text-amber-500' : 'text-slate-400'}`} />
                    <span>ខ្ទាស់ទុកជាកំណត់ត្រាសំខាន់ (Pin as Important Daily Note/Report at top of the list)</span>
                  </label>
                </div>

                {/* Activities custom log builder representation */}
                <div className="border border-indigo-150 bg-indigo-50/20 p-4.5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-100 pb-2">
                    <span className="bg-indigo-600 text-white rounded px-1.5 py-0.5 text-[9px] font-black">1</span>
                    Summary of Activities (បន្ថែមសកម្មភាពការងារ)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                    
                    {/* Activity Date */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[10px] font-black text-indigo-900 block uppercase">Date (កាលបរិច្ឆេទ) *</label>
                      <input
                        type="date"
                        value={currentLogDate}
                        onChange={(e) => setCurrentLogDate(e.target.value)}
                        className="w-full bg-white border border-indigo-200 p-2 rounded-xl text-xs font-bold font-mono outline-none focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    {/* Activity Status */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[10px] font-black text-indigo-900 block uppercase">Status (ស្ថានភាព) *</label>
                      <select
                        value={currentStatus}
                        onChange={(e) => setCurrentStatus(e.target.value as any)}
                        className="w-full bg-white border border-indigo-200 p-2 rounded-xl text-xs font-black outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        required
                      >
                        <option value="Completed">Completed (រួចរាល់)</option>
                        <option value="In progress">In progress (កំពុងដំណើរការ)</option>
                        <option value="Pending">Pending (ពន្យារពេល)</option>
                        <option value="Follow up">Follow up (តាមដានបន្ថែម)</option>
                        <option value="Cancelled">Cancelled (លុបចោល)</option>
                      </select>
                    </div>

                    {/* Work Description Input */}
                    <div className="sm:col-span-12 space-y-1">
                      <label className="text-[10px] font-black text-indigo-950 block uppercase">Description of Work (សេចក្តីពិពណ៌នាការងារ) *</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="ឧ. ត្រួតពិនិត្យវត្តមានបុគ្គលិកសន្តិសុខ និងកម្លាំងល្បាត..."
                          value={currentActivity}
                          onChange={(e) => setCurrentActivity(e.target.value)}
                          className="flex-1 bg-white border border-indigo-200 p-2.5 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddHourlyLog}
                          className="bg-indigo-600 hover:bg-indigo-750 text-white font-black text-xs px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                        >
                          <Plus className="w-4 h-4 shrink-0" />
                          <span>បន្ថែម (Add)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Flow list representation */}
                  <div className="space-y-2 pt-2 border-t border-indigo-100/50">
                    <label className="text-[10px] font-black text-slate-500 block uppercase">Added Activities ({formHourlyLogs.length})</label>
                    {formHourlyLogs.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic text-center py-2">មិនទាន់មានសកម្មភាពត្រូវបានបន្ថែមនៅឡើយទេ</p>
                    ) : (
                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                        {formHourlyLogs.map((log, index) => (
                          <div key={log.id} className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs gap-3">
                            <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                              <span className="font-mono text-[9px] bg-indigo-50 text-indigo-900 px-2 py-0.5 rounded font-bold shrink-0">
                                {index + 1}
                              </span>
                              <span className="font-mono text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold shrink-0">
                                {log.date}
                              </span>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                                log.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : log.status === 'In progress' ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                  : log.status === 'Pending' ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : log.status === 'Follow up' ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}>
                                {log.status}
                              </span>
                              <span className="font-bold text-slate-800 truncate block">{log.activity}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveHourlyLog(log.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded shrink-0 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl shadow-3xs transition cursor-pointer"
                  >
                    បោះបង់ (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#073B3A] hover:bg-[#0c5352] text-white font-black text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>រក្សាទុករបាយការណ៍ (Save Report)</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
