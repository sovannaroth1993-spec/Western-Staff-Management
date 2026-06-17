import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, User, ClipboardList, Plus, Trash2, Eye, Printer, 
  Edit3, Save, X, Check, FileText, ChevronRight, Search, Activity, 
  Sparkles, Filter, CheckCircle, AlertTriangle, Play, HelpCircle, Download,
  Building, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DailyReport, HourlyLog } from '../types';

// Standard English & Khmer default activities preset
const DEFAULT_HOURLY_LOGS_DEMO: HourlyLog[] = [
  {
    id: 'hl-1',
    timeSlot: '07:30 - 08:30',
    activity: 'អញ្ជើញត្រួតពិនិត្យវត្តមានបុគ្គលិកសន្តិសុខ និងកម្លាំងយាមល្បាតតាមច្រកទ្វារសាលា (Inspect security guard assembly and gate operations)',
    status: 'Completed',
    remarks: 'គ្រប់គ្នាមកទាន់ពេល និងរៀបរយល្អ'
  },
  {
    id: 'hl-2',
    timeSlot: '08:30 - 10:30',
    activity: 'ដើរត្រួតពិនិត្យប្រព័ន្ធម៉ាស៊ីនត្រជាក់ (AC) និងឧបករណ៍អគ្គិសនីតាមបណ្តាបន្ទប់រៀនជាន់ទី១ និងជាន់ទី២ (Audit room ACs and electricity on 1st & 2nd floors)',
    status: 'Completed',
    remarks: 'រកឃើញម៉ាស៊ីនត្រជាក់បន្ទប់ ២០១ មិនសូវត្រជាក់'
  },
  {
    id: 'hl-3',
    timeSlot: '10:30 - 12:30',
    activity: 'ពិនិត្យដំណើរការកាមេរ៉ាសុវត្ថិភាព CCTV ក្នុងមជ្ឈមណ្ឌលបញ្ជា និងផ្ទៀងផ្ទាត់ការថត (Verify CCTV control feed integrity and hard drive backup)',
    status: 'Completed',
    remarks: 'កាមេរ៉ាទាំងអស់៥៦គ្រាប់ ដំណើរការល្អ'
  },
  {
    id: 'hl-4',
    timeSlot: '13:30 - 15:30',
    activity: 'រៀបចំរបាយការណ៍រួមប្រចាំថ្ងៃ និងត្រួតពិនិត្យច្រកចេញ-ចូល ធានាសុវត្ថិភាពសិស្ស (Construct overall daily report and monitor security dismissals)',
    status: 'In Progress',
    remarks: 'កំពុងបន្តអនុវត្ត'
  }
];

const INITIAL_REPORTS_MOCK: DailyReport[] = [
  {
    id: 'dr-1',
    date: '2026-06-10',
    checkInTime: '07:30',
    checkOutTime: '17:30',
    reporterName: 'LOUNG Veasna (Admin Supervisor)',
    overallSummary: 'ថ្ងៃនេះសកម្មភាពការងារទូទៅរបស់សាលាប្រព្រឹត្តទៅបានយ៉ាងរលូនល្អប្រសើរ។ ប្រព័ន្ធអគ្គិសនី និងទឹកមានស្ថិរភាព។',
    hourlyLogs: DEFAULT_HOURLY_LOGS_DEMO,
    createdAt: '2026-06-10T10:00:00.000Z',
    department: 'Operations',
    issuesEncountered: 'រកឃើញម៉ាស៊ីនត្រជាក់បន្ទប់ ២០១ មិនសូវត្រជាក់ និងមានបញ្ហាហូរទឹកបន្តិចបន្តួច។',
    actionsTaken: 'បានកត់ត្រាចូលប្រព័ន្ធស្នើសុំ និងទាក់ទងជាងបច្ចេកទេសឱ្យចុះមកពិនិត្យ និងសម្អាតខ្សែកាបម៉ាស៊ីនភ្លាមៗ។',
    planForTomorrow: 'បន្តតាមដានការជួសជុលម៉ាស៊ីនត្រជាក់បន្ទប់ ២០១ និងត្រួតពិនិត្យកាមេរ៉ា CCTV នៅខាងក្រោយសាលាបន្ថែមទៀត។',
    remarks: 'ការងារទូទៅរបស់សាលារៀបរយល្អ គ្មានការរអាក់រអួលធំដុំនោះទេ។'
  },
  {
    id: 'dr-2',
    date: '2026-06-09',
    checkInTime: '07:30',
    checkOutTime: '17:30',
    reporterName: 'LOUNG Veasna (Admin Supervisor)',
    overallSummary: 'ការងារបង្រួបបង្រួមឯកសាររដ្ឋបាល និងការតាមដានការប្រើប្រាស់អគ្គិសនីប្រចាំខែត្រូវបានបញ្ចប់។',
    hourlyLogs: [
      {
        id: 'hl-b1',
        timeSlot: '07:30 - 10:30',
        activity: 'ទទួលវត្តមានបុគ្គលិក និងរៀបចំផែនការការងារប្រចាំថ្ងៃ (Staff check-in & setup daily checklist)',
        status: 'Completed'
      },
      {
        id: 'hl-b2',
        timeSlot: '10:30 - 15:30',
        activity: 'ចុះពិនិត្យប្រព័ន្ធដកដង្ហើម និងម៉ាស៊ីនត្រជាក់ទូទាំងវិទ្យាល័យ (Full school AC & ventilation sanity checks)',
        status: 'Completed',
        remarks: 'បានសំអាតបរិក្ខារបន្ទប់កុំព្យូទ័រ'
      },
      {
        id: 'hl-b3',
        timeSlot: '15:30 - 17:30',
        activity: 'សម្របសម្រួលជាមួយក្រុមសន្តិសុខក្នុងការបញ្ជូនសិស្សត្រឡប់ទៅផ្ទះ (Manage dismissal gate operations and secure premises)',
        status: 'Completed'
      }
    ],
    createdAt: '2026-06-09T10:05:00.000Z',
    department: 'Operations',
    issuesEncountered: 'កម្លាំងយាមល្បាតខាងមុខខ្វះអាយកូម (Icom) ១គ្រឿងសម្រាប់ការសម្របសម្រួលពេលសិស្សចេញ។',
    actionsTaken: 'បានស្នើសុំបន្ទាន់ទៅកាន់ប្រធានផ្នែកដើម្បីផ្គត់ផ្គង់អាយកូមបន្ថែម។',
    planForTomorrow: 'ត្រួតពិនិត្យឧបករណ៍យាមល្បាតរបស់ក្រុមការងារសន្តិសុខទូទៅ។',
    remarks: 'សិស្សានុសិស្សទាំងអស់គោរពវិន័យសណ្តាប់ធ្នាប់បានល្អល្អះ។'
  }
];

interface DailyReportManagerProps {
  initialDate?: string | null;
  onClearInitialDate?: () => void;
}

export default function DailyReportManager({ initialDate, onClearInitialDate }: DailyReportManagerProps = {}) {
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

  // Hourly log listings in Form
  const [formHourlyLogs, setFormHourlyLogs] = useState<HourlyLog[]>([]);

  // Time slot building in Form
  const [currentSlotText, setCurrentSlotText] = useState('07:30 - 08:30');
  const [currentActivity, setCurrentActivity] = useState('');
  const [currentStatus, setCurrentStatus] = useState<'Completed' | 'In Progress'>('Completed');

  // Load standard date
  useEffect(() => {
    const today = new Date().toISOString().substring(0, 10);
    setFormDate(today);
  }, []);

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
        setFormReporter('LOUNG Veasna (Admin Supervisor)');
        setFormDepartment('Operations');
        setFormIssuesEncountered('');
        setFormActionsTaken('');
        setFormPlanForTomorrow('');
        setFormRemarks('');
        setFormHourlyLogs([...DEFAULT_HOURLY_LOGS_DEMO.map(l => ({ ...l, id: Math.random().toString() }))]);
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
    setFormReporter('LOUNG Veasna (Admin Supervisor)');
    setFormDepartment('Operations');
    setFormIssuesEncountered('');
    setFormActionsTaken('');
    setFormPlanForTomorrow('');
    setFormRemarks('');
    setFormHourlyLogs([...DEFAULT_HOURLY_LOGS_DEMO.map(l => ({ ...l, id: Math.random().toString() }))]);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (report: DailyReport) => {
    setEditingReport(report);
    setFormDate(report.date);
    setFormReporter(report.reporterName);
    setFormDepartment(report.department || 'Operations');
    setFormIssuesEncountered(report.issuesEncountered || '');
    setFormActionsTaken(report.actionsTaken || '');
    setFormPlanForTomorrow(report.planForTomorrow || '');
    setFormRemarks(report.remarks || '');
    setFormHourlyLogs([...report.hourlyLogs]);
    setIsFormOpen(true);
  };

  const handleAddHourlyLog = () => {
    if (!currentActivity.trim()) return;

    const newLog: HourlyLog = {
      id: 'hl-' + Date.now() + Math.random().toString(36).substring(2, 5),
      timeSlot: currentSlotText.trim() || '08:00 - 09:00',
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
      remarks: formRemarks
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

  const filteredReports = reports.filter(r => {
    const q = searchTerm.toLowerCase();
    return (
      r.date.includes(q) ||
      (r.department || '').toLowerCase().includes(q) ||
      r.reporterName.toLowerCase().includes(q) ||
      (r.issuesEncountered || '').toLowerCase().includes(q) ||
      r.hourlyLogs.some(log => log.activity.toLowerCase().includes(q))
    );
  });

  const handleExportCSV = () => {
    if (!selectedReport) return;
    
    // Prepare header lines with UTF-8 BOM for perfect Khmer character sets support in MS Excel
    let csvContent = "\uFEFF"; 
    csvContent += "Western International School - Daily Operations Report\n";
    csvContent += `Date: ${selectedReport.date}\n`;
    csvContent += `Department: ${selectedReport.department || 'Operations'}\n`;
    csvContent += `Prepared By: ${selectedReport.reporterName}\n\n`;
    
    // Headers for hourly tasks
    csvContent += "No,Time Slot,Activity,Status\n";
    selectedReport.hourlyLogs.forEach((log, idx) => {
      const cleanActivity = log.activity.replace(/"/g, '""');
      csvContent += `${idx + 1},"${log.timeSlot || '08:00 - 09:00'}","${cleanActivity}","${log.status}"\n`;
    });
    
    csvContent += "\n";
    csvContent += `Issues Encountered (បញ្ហាប្រឈម),"${(selectedReport.issuesEncountered || '').replace(/"/g, '""')}"\n`;
    csvContent += `Actions Taken (ដំណោះស្រាយ),"${(selectedReport.actionsTaken || '').replace(/"/g, '""')}"\n`;
    csvContent += `Plan for Tomorrow (ផែនការបន្ទាប់),"${(selectedReport.planForTomorrow || '').replace(/"/g, '""')}"\n`;
    csvContent += `Remarks (កំណត់សម្គាល់ផ្សេងៗ),"${(selectedReport.remarks || '').replace(/"/g, '""')}"\n`;

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
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(selectedReport, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `WIS_Daily_Report_${selectedReport.date}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
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
              font-family: 'Inter', 'Noto Sans Khmer', sans-serif !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* Explicit high-contrast rules for Moul (Traditional Khmer Title Script) */
            .font-moul {
              font-family: 'Moul', serif !important;
              text-shadow: none !important;
              font-weight: normal !important;
            }
            
            .font-sans {
              font-family: 'Inter', 'Noto Sans Khmer', sans-serif !important;
            }

            /* Prevent browser options from masking background colors or borders */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }

            /* Optimize container footprint for printing */
            #printable-scope {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              background-color: white !important;
            }

            #report-sheet {
              border: none !important;
              box-shadow: none !important;
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              background-color: white !important;
              min-height: auto !important;
            }

            /* Guard against clumsy page-breaks on tables and signature areas */
            tr, .signature-section, .signature-section * {
              page-break-inside: avoid !important;
            }

            thead {
              display: table-header-group !important;
            }
            
            /* Render input checklists in uniform size */
            input[type="checkbox"] {
              vertical-align: middle !important;
            }

            /* Hide general interactive helper components or editing widgets in vectors */
            .no-print, [title="Upload custom logo"], .group\\/edit:hover svg {
              display: none !important;
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
    customSave?: (newValue: string) => void
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
              className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-705 rounded-md cursor-pointer"
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
        className="group/edit cursor-pointer hover:bg-amber-50/50 px-2 py-1 rounded-lg border border-transparent hover:border-amber-200/40 flex items-start justify-between gap-2 mt-1 min-h-[1.5rem]"
      >
        <p className="text-xs text-slate-850 font-medium leading-relaxed whitespace-pre-wrap">
          {currentValue || <span className="text-slate-400 italic">ចុចត្រង់នេះដើម្បីបំពេញព័ត៌មាន...</span>}
        </p>
        <Edit3 className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover/edit:opacity-100 transition shrink-0 no-print" />
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

          <div className="relative mb-4 shrink-0">
            <input
              type="text"
              placeholder="ស្វែងរកតាមកាលបរិច្ឆេទ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-205 pl-9.5 pr-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-[500px] pr-1 scrollbar-thin">
            {filteredReports.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs py-12">
                <FileText className="w-8 h-8 mx-auto text-slate-350 mb-2" />
                <p>រកមិនឃើញរបាយការណ៍ទេ</p>
              </div>
            ) : (
              filteredReports.map((report) => {
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
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-xs font-extrabold text-slate-800 font-mono">
                          {report.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditForm(report);
                          }}
                          className="p-1 hover:bg-slate-100 hover:text-emerald-700 rounded transition text-slate-400"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteReport(report.id, e)}
                          className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded transition text-slate-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-[10px] font-bold text-slate-500 mt-1 flex justify-between">
                      <span className="text-slate-650">🏢 {report.department || 'Operations'}</span>
                      <span>✍️ {report.reporterName.split(' ')[0]}</span>
                    </div>

                    {report.issuesEncountered && (
                      <p className="text-[11px] text-slate-600 font-medium mt-1.5 line-clamp-1 italic">
                        ⚠️ បញ្ហា៖ {report.issuesEncountered}
                      </p>
                    )}

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
                      size: A4;
                      margin: 1.5cm 1.2cm;
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
                  }
                `}} />

                {/* Print Controls Top Ribbon */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 border border-slate-205 p-4 rounded-2xl no-print">
                  <div className="text-xs text-slate-500 font-bold flex items-center gap-1">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>ចុចលើប្រអប់ព័ត៌មានខាងក្រោមក្រដាស A4 ផ្ទាល់ ដើម្បីកែសម្រួលរហ័ស។</span>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end flex-wrap">
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
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-205 rounded-xl shadow-xl py-1.5 z-[90] font-sans text-xs shrink-0 transform origin-top-right transition-all">
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
                    <div className="flex flex-col sm:flex-row justify-between items-start text-xs border-b border-slate-300 pb-3 font-sans gap-4">
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
                          <h2 className="text-[11.5px] font-black text-[#073B3A] font-moul leading-tight">
                            សាលាវេស្ទើនអន្តរជាតិ សាខាចំការដូង
                          </h2>
                          <p className="text-[9.5px] text-[#0d5c5a] font-moul">
                            ការិយាល័យរដ្ឋបាល និងត្រួតពិនិត្យប្រតិបត្តិការ
                          </p>
                          <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">
                            WESTERN INTERNATIONAL SCHOOL • OPERATIONS
                          </p>
                        </div>
                      </div>

                      <div className="text-center sm:text-right mt-2 sm:mt-0">
                        <p className="font-moul text-[10px] leading-tight text-slate-900">
                          ព្រះរាជាណាចក្រកម្ពុជា
                        </p>
                        <p className="font-moul text-[9px] leading-tight text-slate-800">
                          ជាតិ សាសនា ព្រះមហាក្សត្រ
                        </p>
                        <div className="flex items-center justify-center sm:justify-end gap-1 mt-1 text-[7px] text-rose-600">
                          <span>⚜️</span>
                          <span className="w-8 border-t border-rose-500"></span>
                          <span>⚜️</span>
                        </div>
                      </div>
                    </div>

                    {/* Memo Title Header */}
                    <div className="text-center space-y-1 my-2 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                      <h1 className="text-[14px] font-black text-[#073B3A] font-moul leading-relaxed">
                        របាយការណ៍ប្រតិបត្តិការប្រចាំថ្ងៃ (Daily Report)
                      </h1>
                    </div>

                    {/* Basic Meta Details Box */}
                    <div className="grid grid-cols-2 gap-4 p-3 border border-slate-300 bg-slate-50/50 rounded-xl text-[11px] font-sans">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-500 shrink-0">Date (កាលបរិច្ឆេទ) :</span>
                        <div className="font-extrabold text-slate-800 font-mono block flex-1">
                          {renderEditableBlock('date', 'កាលបរិច្ឆេទ', selectedReport.date, (val) => {
                            handleUpdateInlineField(selectedReport.id, 'date', val);
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-500 shrink-0">Department (ផ្នែក) :</span>
                        <div className="font-extrabold text-slate-800 flex-1 col-span-1">
                          {renderEditableBlock('department', 'ផ្នែក', selectedReport.department || 'Operations', (val) => {
                            handleUpdateInlineField(selectedReport.id, 'department', val);
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 1. Summary of Activities (No, Description, Status) */}
                    <div className="space-y-2">
                      <h3 className="text-[11px] font-black text-slate-900 font-moul border-b border-slate-300 pb-1 flex items-center gap-1">
                        <span className="bg-emerald-700 text-white rounded px-1.5 font-sans font-black mr-1 text-[8px]">1</span>
                        Summary of Activities (បញ្ជីការងារ និងសកម្មភាពលម្អិត)
                      </h3>

                      <div className="border border-slate-300 rounded-xl overflow-hidden shadow-3xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-[10px] font-extrabold text-slate-700 border-b border-slate-300 uppercase">
                              <th className="p-2 text-center border-r border-slate-300 w-11">No</th>
                              <th className="p-2 border-r border-slate-300">Description of Work (បញ្ជីការងារលម្អិតតាមម៉ោង)</th>
                              <th className="p-2 text-center w-40">Status (ស្ថានភាពការងារ)</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white text-[11px] font-medium text-slate-800">
                            {selectedReport.hourlyLogs.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="p-6 text-center text-slate-400 italic">
                                  មិនមានបញ្ជីសកម្មភាពប្រចាំថ្ងៃត្រូវបានបញ្ចូលឡើយ។
                                </td>
                              </tr>
                            ) : (
                              selectedReport.hourlyLogs.map((log, index) => (
                                <tr key={log.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                                  
                                  {/* No. */}
                                  <td className="p-2 border-r border-slate-300 text-center font-mono font-bold text-slate-400 bg-slate-50/10">
                                    {index + 1}
                                  </td>

                                  {/* Description of Work */}
                                  <td className="p-2 border-r border-slate-300 text-[11px] font-bold text-slate-800">
                                    <div className="font-mono text-[9px] text-[#0d5c5a] font-normal mb-0.5">
                                      {log.timeSlot || '08:00 - 09:00'}
                                    </div>
                                    {renderEditableBlock(`log-activity-${log.id}`, 'កិច្ចការ', log.activity, (val) => {
                                      const updated = selectedReport.hourlyLogs.map(l => l.id === log.id ? { ...l, activity: val } : l);
                                      handleUpdateInlineField(selectedReport.id, 'hourlyLogs', updated);
                                    })}
                                  </td>

                                  {/* Status Checkboxes: ☐ Completed ☐ In Progress */}
                                  <td className="p-2 text-center">
                                    <div className="flex justify-center items-center gap-3">
                                      {/* Completed Option */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = selectedReport.hourlyLogs.map(l => l.id === log.id ? { ...l, status: 'Completed' as const } : l);
                                          handleUpdateInlineField(selectedReport.id, 'hourlyLogs', updated);
                                        }}
                                        className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 hover:scale-105 transition cursor-pointer"
                                      >
                                        <span className="text-sm font-semibold">
                                          {log.status === 'Completed' ? '☑' : '☐'}
                                        </span>
                                        <span>Completed</span>
                                      </button>

                                      {/* In Progress Option */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = selectedReport.hourlyLogs.map(l => l.id === log.id ? { ...l, status: 'In Progress' as const } : l);
                                          handleUpdateInlineField(selectedReport.id, 'hourlyLogs', updated);
                                        }}
                                        className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:scale-105 transition cursor-pointer"
                                      >
                                        <span className="text-sm font-semibold">
                                          {log.status === 'In Progress' ? '☑' : '☐'}
                                        </span>
                                        <span>In Progress</span>
                                      </button>
                                    </div>
                                  </td>

                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="border border-slate-300 rounded-xl divide-y divide-slate-350 bg-slate-50/20 text-slate-800 p-4 space-y-4">
                      
                      {/* 2. Issues / Problems Encountered */}
                      <div>
                        <h4 className="text-[11px] font-black text-slate-900 font-moul flex items-center gap-1 border-b border-slate-200 pb-1">
                          <span className="bg-amber-600 text-white rounded px-1.5 font-sans font-black mr-1 text-[8px]">2</span>
                          Issues / Problems Encountered (បញ្ហាប្រឈម)
                        </h4>
                        <div className="mt-1 font-sans">
                          {renderEditableBlock('issuesEncountered', 'បញ្ហាប្រឈម', selectedReport.issuesEncountered || '', (val) => {
                            handleUpdateInlineField(selectedReport.id, 'issuesEncountered', val);
                          })}
                        </div>
                      </div>

                      {/* 3. Actions Taken */}
                      <div className="pt-3">
                        <h4 className="text-[11px] font-black text-slate-900 font-moul flex items-center gap-1 border-b border-slate-200 pb-1">
                          <span className="bg-blue-600 text-white rounded px-1.5 font-sans font-black mr-1 text-[8px]">3</span>
                          Actions Taken (ដំណោះស្រាយដែលបានអនុវត្ត)
                        </h4>
                        <div className="mt-1 font-sans">
                          {renderEditableBlock('actionsTaken', 'ដំណោះស្រាយដែលបានអនុវត្ត', selectedReport.actionsTaken || '', (val) => {
                            handleUpdateInlineField(selectedReport.id, 'actionsTaken', val);
                          })}
                        </div>
                      </div>

                      {/* 4. Plan for Tomorrow */}
                      <div className="pt-3">
                        <h4 className="text-[11px] font-black text-slate-900 font-moul flex items-center gap-1 border-b border-slate-200 pb-1">
                          <span className="bg-[#073B3A] text-white rounded px-1.5 font-sans font-black mr-1 text-[8px]">4</span>
                          Plan for Tomorrow (ផែនការសម្រាប់နေ့ស្អែក)
                        </h4>
                        <div className="mt-1 font-sans">
                          {renderEditableBlock('planForTomorrow', 'ផែនការសម្រាប់ស្អែក', selectedReport.planForTomorrow || '', (val) => {
                            handleUpdateInlineField(selectedReport.id, 'planForTomorrow', val);
                          })}
                        </div>
                      </div>

                      {/* 5. Remarks */}
                      <div className="pt-3">
                        <h4 className="text-[11px] font-black text-slate-900 font-moul flex items-center gap-1 border-b border-slate-200 pb-1">
                          <span className="bg-[#0d5c5a] text-white rounded px-1.5 font-sans font-black mr-1 text-[8px]">5</span>
                          Remarks (កំណត់សម្គាល់ផ្សេងៗ)
                        </h4>
                        <div className="mt-1 font-sans">
                          {renderEditableBlock('remarks', 'កំណត់សម្គាល់', selectedReport.remarks || '', (val) => {
                            handleUpdateInlineField(selectedReport.id, 'remarks', val);
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Bottom Signatures Block */}
                    <div className="signature-section relative mt-8 pt-6 border-t border-slate-300 grid grid-cols-2 gap-4 text-center text-xs">
                      
                      {/* Seal element */}
                      <div className="absolute right-12 bottom-0 w-24 h-24 border-4 border-double border-rose-600 rounded-full flex flex-col items-center justify-center text-center opacity-75 select-none pointer-events-none rotate-6 shadow-[inset_0_0_6px_rgba(225,29,72,0.05)] z-20">
                        <div className="text-[6.5px] font-black text-rose-650 tracking-widest uppercase mb-0.5">WESTERN INT. SCHOOL</div>
                        <div className="border-t border-b border-rose-600/50 py-0.5 px-1 font-moul text-[6px] text-rose-600">យល់ព្រមអនុម័ត</div>
                        <div className="text-[6.5px] font-black text-rose-650 tracking-wider">APPROVED</div>
                      </div>

                      {/* Signatory A: Submitted/Prepared by */}
                      <div>
                        <p className="font-extrabold text-slate-500 text-[10px] uppercase">Prepared By (រៀបចំដោយ)</p>
                        <div className="h-10 flex items-end justify-center font-mono text-[11px] text-indigo-700 italic select-none pb-1">
                          {selectedReport.reporterName}
                        </div>
                        <div className="font-moul text-[9px] text-[#073B3A] border-t border-slate-300/40 pt-1">
                          {renderEditableBlock('reporterName', 'Prepared By', selectedReport.reporterName, (val) => {
                            handleUpdateInlineField(selectedReport.id, 'reporterName', val);
                          })}
                        </div>
                      </div>

                      {/* Signatory B: Approved by */}
                      <div>
                        <p className="font-extrabold text-slate-500 text-[10px] uppercase">Approved By (ពិនិត្យ & យល់ព្រម)</p>
                        <div className="h-10 flex items-center justify-center font-mono text-xs text-slate-350 select-none pb-1">
                          (ហត្ថលេខា ប្រធានការិយាល័យ)
                        </div>
                        <p className="font-moul text-[9px] text-slate-705 border-t border-slate-300/40 pt-1">
                          _________________________________
                        </p>
                        <p className="text-[8px] text-slate-450 mt-1">
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
                  <ClipboardList className="w-5 h-5 text-amber-305" />
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
                      className="w-full bg-white border border-slate-220 p-2 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-600 block">Department (ផ្នែក) *</label>
                    <input
                      type="text"
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="w-full bg-white border border-slate-220 p-2 rounded-xl text-xs font-black outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-600 block">Prepared By (រៀបចំដោយ) *</label>
                    <input
                      type="text"
                      value={formReporter}
                      onChange={(e) => setFormReporter(e.target.value)}
                      className="w-full bg-white border border-slate-220 p-2 rounded-xl text-xs font-black outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* hourly / weekly custom log builder representation */}
                <div className="border border-indigo-100 bg-indigo-50/30 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider">
                    1. Summary of Activities Flow (បន្ថែមសកម្មភាពការងារ)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-6 space-y-1">
                      <label className="text-[10px] font-bold text-indigo-900 block">ម៉ោង (Time Slot) e.g. 07:30 - 08:30</label>
                      <input
                        type="text"
                        placeholder="07:30 - 08:30"
                        value={currentSlotText}
                        onChange={(e) => setCurrentSlotText(e.target.value)}
                        className="w-full bg-white border border-indigo-200 p-2 rounded-xl text-xs font-bold font-mono outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="sm:col-span-6 space-y-1">
                      <label className="text-[10px] font-bold text-indigo-900 block">ស្ថានភាព (Status)</label>
                      <select
                        value={currentStatus}
                        onChange={(e) => setCurrentStatus(e.target.value as any)}
                        className="w-full bg-white border border-indigo-200 p-2 rounded-xl text-xs font-black outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="Completed">Completed (រួចរាល់)</option>
                        <option value="In Progress">In Progress (កំពុងធ្វើ)</option>
                      </select>
                    </div>
                    <div className="col-span-12 space-y-1">
                      <label className="text-[10px] font-black text-indigo-950 block">សេចក្តីពិពណ៌នាការងារ (Work Description) *</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="ឧ. ត្រួតពិនិត្យវត្តមានបុគ្គលិកសន្តិសុខ និងកម្លាំងยាមល្បាតតាមច្រកទ្វារ..."
                          value={currentActivity}
                          onChange={(e) => setCurrentActivity(e.target.value)}
                          className="flex-1 bg-white border border-indigo-200 p-2.5 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddHourlyLog}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                        >
                          <Plus className="w-4 h-4 shrink-0" />
                          <span>បន្ថែម (Add)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Flow list table */}
                  <div className="space-y-1.5 pt-1">
                    {formHourlyLogs.map((log, index) => (
                      <div key={log.id} className="bg-white border rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] bg-indigo-50 text-indigo-900 px-2 py-0.5 rounded font-bold">
                            {index + 1}. {log.timeSlot}
                          </span>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${log.status === 'Completed' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                            {log.status}
                          </span>
                          <span className="font-extrabold text-slate-700">{log.activity}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveHourlyLog(log.id)}
                          className="text-slate-400 hover:text-rose-605 p-1 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Issues Encountered */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 block">2. Issues / Problems Encountered (បញ្ហាប្រឈម)</label>
                  <textarea
                    rows={2}
                    value={formIssuesEncountered}
                    onChange={(e) => setFormIssuesEncountered(e.target.value)}
                    placeholder="ឧ. គ្មានបញ្ហាកើតឡើង ឬ ម៉ាស៊ីនត្រជាក់បន្ទប់ ២០១ មិនត្រជាក់..."
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* 3. Actions Taken */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 block">3. Actions Taken (ដំណោះស្រាយដែលបានអនុវត្ត)</label>
                  <textarea
                    rows={2}
                    value={formActionsTaken}
                    onChange={(e) => setFormActionsTaken(e.target.value)}
                    placeholder="ឧ. បានទាក់ទងជាងបច្ចេកទេសឱ្យមកពិនិត្យ និងសម្អាតខ្យែកាបភ្លាមៗ..."
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* 4. Plan for Tomorrow */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 block">4. Plan for Tomorrow (ផែនការសម្រាប់ថ្ងៃស្អែក)</label>
                  <textarea
                    rows={2}
                    value={formPlanForTomorrow}
                    onChange={(e) => setFormPlanForTomorrow(e.target.value)}
                    placeholder="ឧ. តាមដានការជួសជុល និងសម្អាត AC បន្ថែម..."
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* 5. Remarks */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 block">5. Remarks (កំណត់សម្គាល់ផ្សេងៗ)</label>
                  <textarea
                    rows={2}
                    value={formRemarks}
                    onChange={(e) => setFormRemarks(e.target.value)}
                    placeholder="ឧ. ការងារទូទៅក្នុងសាលាល្អប្រសើរ..."
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500"
                  />
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
                    <Save className="w-4 h-4 text-amber-305" />
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
