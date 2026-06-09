/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Staff, Department, AttendanceRecord, AttendanceStatus, DEPARTMENT_NAMES_KM, ATTENDANCE_STATUS_KM, ALL_DEPARTMENTS } from '../types';
import { exportAttendanceToExcel } from '../utils/excelHelper';
import { exportAttendanceToPdf } from '../utils/pdfHelper';
import { 
  Users, Calendar, CheckSquare, ShieldAlert, FileSpreadsheet, 
  FileText, ArrowRight, UserCheck, AlertCircle, Save, HelpCircle, X,
  Search, BarChart3, ChevronDown, ChevronUp, QrCode, Printer, Camera, 
  Upload, Play, Sparkles, CheckCircle2, RefreshCw, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScanLog {
  id: string;
  staffName: string;
  staffId: string;
  photo?: string;
  departmentName: string;
  time: string;
  status: 'success' | 'warning' | 'error';
  message: string;
}

interface AttendanceTrackerProps {
  staffList: Staff[];
  attendanceRecords: AttendanceRecord[];
  setAttendanceRecords: (records: AttendanceRecord[]) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export default function AttendanceTracker({
  staffList,
  attendanceRecords,
  setAttendanceRecords,
  selectedDate,
  setSelectedDate
}: AttendanceTrackerProps) {
  
  const [activeDept, setActiveDept] = useState<Department>('Security');
  const [localRecords, setLocalRecords] = useState<Record<string, { status: AttendanceStatus; notes: string }>>({});

  // QR Check-In Station states
  const [isQrStationOpen, setIsQrStationOpen] = useState(false);
  const [isQrGeneratorOpen, setIsQrGeneratorOpen] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanState, setScanState] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    staffName?: string;
    staffId?: string;
    photo?: string;
    dept?: string;
    time?: string;
  }>({ status: 'idle', message: '' });
  
  const [qrScanLogs, setQrScanLogs] = useState<QrScanLog[]>([]);
  const [selectedSimStaffId, setSelectedSimStaffId] = useState('');
  const [selectedBadgeStaffId, setSelectedBadgeStaffId] = useState('');

  // Monthly Summary View states
  const [summarySearch, setSummarySearch] = useState('');
  const [summaryDept, setSummaryDept] = useState<string>('All');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  // Helper to resolve Khmer name of selected month and year
  const currentMonthYear = selectedDate ? selectedDate.substring(0, 7) : '';

  const getKhmerMonthYear = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 2) return '';
    const year = parts[0];
    const month = parts[1];
    const khmerMonths: Record<string, string> = {
      '01': 'មករា (January)',
      '02': 'កុម្ភៈ (February)',
      '03': 'មីនា (March)',
      '04': 'មេសា (April)',
      '05': 'ឧសភា (May)',
      '06': 'មិថុនា (June)',
      '07': 'កក្កដា (July)',
      '08': 'សីហា (August)',
      '09': 'កញ្ញា (September)',
      '10': 'តុលា (October)',
      '11': 'វិច្ឆិកា (November)',
      '12': 'ធ្នូ (December)',
    };
    return `${khmerMonths[month] || month} ${year}`;
  };

  // Get monthly stats for a specific staff member
  const getMonthlyStatsForStaff = (staffId: string, monthYear: string) => {
    const monthRecords = attendanceRecords.filter(
      r => r.staffId === staffId && r.date.startsWith(monthYear)
    );
    
    const presentCount = monthRecords.filter(r => r.status === 'Present').length;
    const excusedCount = monthRecords.filter(r => r.status === 'Excused').length;
    const absentCount = monthRecords.filter(r => r.status === 'Absent').length;
    const totalChecked = monthRecords.length;
    const attendanceRate = totalChecked > 0 ? Math.round((presentCount / totalChecked) * 100) : 100;
    
    return {
      present: presentCount,
      excused: excusedCount,
      absent: absentCount,
      total: totalChecked,
      rate: attendanceRate
    };
  };

  // Filter staff members for the summary view
  const summaryFilteredStaff = staffList.filter(staff => {
    const matchesDept = summaryDept === 'All' || staff.department === summaryDept;
    const matchesSearch = 
      staff.name.toLowerCase().includes(summarySearch.toLowerCase()) ||
      staff.staffId.toLowerCase().includes(summarySearch.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // Calculate aggregation stats for selected month & filters
  const summaryAggregate = {
    totalPresent: 0,
    totalExcused: 0,
    totalAbsent: 0,
    totalChecked: 0
  };

  summaryFilteredStaff.forEach(staff => {
    const stats = getMonthlyStatsForStaff(staff.staffId, currentMonthYear);
    summaryAggregate.totalPresent += stats.present;
    summaryAggregate.totalExcused += stats.excused;
    summaryAggregate.totalAbsent += stats.absent;
    summaryAggregate.totalChecked += stats.total;
  });

  const overallAttendanceRate = summaryAggregate.totalChecked > 0 
    ? Math.round((summaryAggregate.totalPresent / summaryAggregate.totalChecked) * 100) 
    : 100;

  
  // Floating status toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Filter staff for the active department
  const deptStaff = staffList.filter(s => s.department === activeDept);

  // Load existing records for the active date & department from parent state
  useEffect(() => {
    const recordsMap: Record<string, { status: AttendanceStatus; notes: string }> = {};
    
    // Default everyone to 'Present' unless a record already exists
    deptStaff.forEach(staff => {
      const match = attendanceRecords.find(r => r.date === selectedDate && r.staffId === staff.staffId);
      if (match) {
        recordsMap[staff.staffId] = { status: match.status, notes: match.notes || '' };
      } else {
        recordsMap[staff.staffId] = { status: 'Present', notes: '' };
      }
    });
    
    setLocalRecords(recordsMap);
  }, [activeDept, selectedDate, staffList]);

  // Helper to instantly save changes to the parent registry (updates localStorage in App)
  const syncToParentInstant = (updatedLocal: Record<string, { status: AttendanceStatus; notes: string }>) => {
    const otherRecords = attendanceRecords.filter(
      r => !(r.date === selectedDate && r.department === activeDept)
    );

    const newRecords: AttendanceRecord[] = deptStaff.map(staff => {
      const state = updatedLocal[staff.staffId] || { status: 'Present', notes: '' };
      return {
        id: `${activeDept}_${selectedDate}_${staff.staffId}`,
        staffId: staff.staffId,
        staffName: staff.name,
        department: activeDept,
        date: selectedDate,
        status: state.status,
        notes: state.notes
      };
    });

    setAttendanceRecords([...otherRecords, ...newRecords]);
  };

  // Handle single attendance toggle
  const handleStatusChange = (staffId: string, status: AttendanceStatus) => {
    setLocalRecords(prev => {
      const next = {
        ...prev,
        [staffId]: {
          ...prev[staffId],
          status
        }
      };
      syncToParentInstant(next);
      return next;
    });
  };

  // Handle commentary note changes
  const handleNoteChange = (staffId: string, notes: string) => {
    setLocalRecords(prev => {
      const next = {
        ...prev,
        [staffId]: {
          ...prev[staffId],
          notes
        }
      };
      syncToParentInstant(next);
      return next;
    });
  };

  // Core handler for successful barcode/QR-code decodes
  const handleDecodedCode = (scannedText: string) => {
    if (!scannedText) return;
    
    // Parse potential ID
    let cleaned = scannedText.trim();
    // Match WIS-XXX, STAFF-XXX, AST-XXX, etc., or use the whole text fallback
    const match = cleaned.match(/(WIS-\d+|STAFF-\d+|[A-Z0-9-]+)/i);
    const codeToSearch = match ? match[0].toUpperCase() : cleaned.toUpperCase();

    const staff = staffList.find(s => 
      s.staffId.trim().toUpperCase() === codeToSearch ||
      s.name.trim().toUpperCase() === cleaned.toUpperCase()
    );

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: true 
    });

    if (staff) {
      // Create new record
      const recordId = `${staff.department}_${selectedDate}_${staff.staffId}`;
      
      // Filter out existing record
      const otherRecords = attendanceRecords.filter(
        r => !(r.date === selectedDate && r.staffId === staff.staffId)
      );

      const displayTimeLog = `[ស្កេន QR @ ${timeStr}]`;
      const newRecord: AttendanceRecord = {
        id: recordId,
        staffId: staff.staffId,
        staffName: staff.name,
        department: staff.department,
        date: selectedDate,
        status: 'Present',
        notes: displayTimeLog
      };

      // Set parent state
      setAttendanceRecords([...otherRecords, newRecord]);

      // If active department matches staff department, update localRecords as well
      if (staff.department === activeDept) {
        setLocalRecords(prev => ({
          ...prev,
          [staff.staffId]: { status: 'Present', notes: displayTimeLog }
        }));
      }

      // Success scan effect
      setScanState({
        status: 'success',
        message: 'វត្តមានត្រូវបានចុះឈ្មោះដោយស្វ័យប្រវត្តិតាមរយៈ QR Code!',
        staffName: staff.name,
        staffId: staff.staffId,
        photo: staff.photo,
        dept: DEPARTMENT_NAMES_KM[staff.department],
        time: timeStr
      });

      // Add to session logs
      const logEntry: QrScanLog = {
        id: Math.random().toString(),
        staffName: staff.name,
        staffId: staff.staffId,
        photo: staff.photo,
        departmentName: DEPARTMENT_NAMES_KM[staff.department],
        time: timeStr,
        status: 'success',
        message: 'ឆែកចូលជោគជ័យ (Check-In OK)'
      };
      setQrScanLogs(prev => [logEntry, ...prev].slice(0, 5));
      showToast(`ស្កេនជោគជ័យ៖ ${staff.name} បានឆែកចូលវត្តមាន!`, 'success');

      // Play sound synthesis notification
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const speech = new SpeechSynthesisUtterance(`${staff.name} checked in.`);
          speech.rate = 1.0;
          speech.pitch = 1.1;
          speech.volume = 0.5;
          window.speechSynthesis.speak(speech);
        }
      } catch (e) {
        // silent fail
      }
    } else {
      // Error
      setScanState({
        status: 'error',
        message: `រកមិនឃើញលេខកូដ "${cleaned}" ក្នុងប្រព័ន្ធបុគ្គលិកឡើយ។`
      });

      const logEntry: QrScanLog = {
        id: Math.random().toString(),
        staffName: 'មិនស្គាល់អត្តសញ្ញាណ',
        staffId: codeToSearch,
        departmentName: 'រកមិនឃើញផ្នែក',
        time: timeStr,
        status: 'error',
        message: `កូដមិនត្រឹមត្រូវ: "${cleaned}"`
      };
      setQrScanLogs(prev => [logEntry, ...prev].slice(0, 5));
      showToast(`រកមិនឃើញកូដបុគ្គលិក៖ ${cleaned}`, 'error');
    }
  };

  // Process manual image files scanned via html5-qrcode
  const handleFileScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanState({ status: 'idle', message: 'កំពុងអានឯកសាររូបភាព...' });

    // Use a temporary Html5Qrcode instance
    const html5QrCode = new Html5Qrcode("qr-reader-hidden-temp");
    html5QrCode.scanFile(file, true)
      .then(decodedText => {
        handleDecodedCode(decodedText);
        // Clean up input element
        e.target.value = '';
      })
      .catch(err => {
        console.error("Error scanning file", err);
        setScanState({
          status: 'error',
          message: 'មិនអាចស្កេនរកកូដ ឬ QR ក្នុងរូបភាពនេះឃើញទេ! សូមជ្រើសរើសរូបភាពដែលមាន QR Code ច្បាស់។'
        });
        showToast("បរាជ័យក្នុងការស្កេនរូបភាព QR!", "error");
        e.target.value = '';
      });
  };

  // Camera scanning hook
  useEffect(() => {
    let html5QrCode: any = null;
    
    if (scannerActive) {
      try {
        const qrContainer = document.getElementById("qr-reader");
        if (qrContainer) {
          html5QrCode = new Html5Qrcode("qr-reader");
          html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: (width: number, height: number) => {
                const size = Math.min(width, height) * 0.7;
                return { width: size, height: size };
              }
            },
            (decodedText: string) => {
              handleDecodedCode(decodedText);
              setScannerActive(false);
            },
            (errorMessage: string) => {
              // passive error callback
            }
          ).catch((err: any) => {
            console.error("Camera scanner start failed", err);
            showToast("មិនអាចកំណត់កាមេរ៉ាបានទេ! (សូមប្រើ File scan ឬ Simulation)", "error");
            setScannerActive(false);
          });
        }
      } catch (e) {
        console.error("Scanner exception", e);
        setScannerActive(false);
      }
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        try {
          html5QrCode.stop().then(() => {
            html5QrCode.clear();
          }).catch((err: any) => console.error("Scanner clear error", err));
        } catch (err) {
          // fallback
        }
      }
    };
  }, [scannerActive]);

  // Fast Bulk Register: Mark all in active department as Present / Excused / Absent
  const handleBulkMark = (status: AttendanceStatus) => {
    const updated = { ...localRecords };
    deptStaff.forEach(staff => {
      updated[staff.staffId] = {
        ...updated[staff.staffId],
        status
      };
    });
    setLocalRecords(updated);
    syncToParentInstant(updated);
    showToast(`បានកត់ត្រាស្វ័យប្រវត្តិ៖ បញ្ចូលសម្រាប់រាល់បុគ្គលិកទាំងអស់ជា "${ATTENDANCE_STATUS_KM[status].label}"!`, 'success');
  };

  // Quietly save changes to the parent registry (updates localStorage in App)
  const commitToRegistrySilent = () => {
    const otherRecords = attendanceRecords.filter(
      r => !(r.date === selectedDate && r.department === activeDept)
    );

    const newRecords: AttendanceRecord[] = deptStaff.map(staff => {
      const state = localRecords[staff.staffId] || { status: 'Present', notes: '' };
      return {
        id: `${activeDept}_${selectedDate}_${staff.staffId}`,
        staffId: staff.staffId,
        staffName: staff.name,
        department: activeDept,
        date: selectedDate,
        status: state.status,
        notes: state.notes
      };
    });

    setAttendanceRecords([...otherRecords, ...newRecords]);
  };

  // Save changes to the parent registry with a toast (as manual confirmation)
  const handleSaveToRegistry = () => {
    commitToRegistrySilent();
    showToast(`បានរក្សាទុករបាយការណ៍វត្តមានផ្នែក "${DEPARTMENT_NAMES_KM[activeDept]}" ដោយជោគជ័យ!`, 'success');
  };

  // Counts of current local buffer
  const countState = (status: AttendanceStatus) => {
    return Object.values(localRecords).filter((v: any) => v.status === status).length;
  };

  // EXPORTS
  const handleExcelExport = () => {
    // Save to database first
    commitToRegistrySilent();

    const currentRecordsForExport: AttendanceRecord[] = deptStaff.map(s => {
      const statusObj = localRecords[s.staffId] || { status: 'Present', notes: '' };
      return {
        id: '',
        staffId: s.staffId,
        staffName: s.name,
        department: activeDept,
        date: selectedDate,
        status: statusObj.status,
        notes: statusObj.notes
      };
    });
    exportAttendanceToExcel(currentRecordsForExport, staffList, selectedDate, activeDept);
    showToast(`បានរក្សាទុក និងទាញយកឯកសារ Excel ផ្នែក "${DEPARTMENT_NAMES_KM[activeDept]}" ស្វ័យប្រវត្តិចូលកុំព្យូទ័រ!`, 'success');
  };

  const handlePdfExport = () => {
    // Automatically save to local database first
    commitToRegistrySilent();

    const currentRecordsForExport: AttendanceRecord[] = deptStaff.map(s => {
      const statusObj = localRecords[s.staffId] || { status: 'Present', notes: '' };
      return {
        id: '',
        staffId: s.staffId,
        staffName: s.name,
        department: activeDept,
        date: selectedDate,
        status: statusObj.status,
        notes: statusObj.notes
      };
    });
    exportAttendanceToPdf(currentRecordsForExport, staffList, selectedDate, activeDept);
    showToast(`បានរក្សាទុក និងទាញយកឯកសារ PDF ផ្នែក "${DEPARTMENT_NAMES_KM[activeDept]}" ស្វ័យប្រវត្តិចូល Downloads!`, 'success');
  };

  return (
    <div id="attendance-tracker-container" className="bg-white rounded-2xl border border-slate-100 shadow-xl p-6">
      
      {/* Upper Tracker Title & Meta controls */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><UserCheck className="w-5 h-5" /></span>
            ស្រង់វត្តមានបុគ្គលិកប្រចាំថ្ងៃ (Daily Attendance Tracking)
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            ជ្រើសរើសផ្នែកការងារ បញ្ចូលកាលបរិច្ឆេទ រួចស្រង់វត្តមានប្រចាំថ្ងៃឲ្យបានត្រឹមត្រូវ
          </p>
        </div>

        {/* Date Field & Action Stations Switchers */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsQrStationOpen(!isQrStationOpen);
              if (isQrGeneratorOpen) setIsQrGeneratorOpen(false);
            }}
            className={`flex items-center gap-2 text-xs font-black px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer shadow-sm ${
              isQrStationOpen 
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-200/40' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <QrCode className={`w-4 h-4 ${isQrStationOpen ? 'animate-pulse text-amber-300' : 'text-emerald-600'}`} />
            <span>ស្កេន QR វត្តមាន (QR Check-In)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsQrGeneratorOpen(!isQrGeneratorOpen);
              if (isQrStationOpen) {
                setIsQrStationOpen(false);
                setScannerActive(false);
              }
            }}
            className={`flex items-center gap-2 text-xs font-black px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer shadow-sm ${
              isQrGeneratorOpen 
                ? 'bg-amber-500 border-amber-400 text-white shadow-amber-150/40' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <Printer className={`w-4 h-4 ${isQrGeneratorOpen ? 'text-slate-900' : 'text-amber-500'}`} />
            <span>កាត QR បុគ្គលិក (Staff QR Badges)</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500">កាលបរិច្ឆេទ៖</span>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-black text-slate-700 outline-none cursor-pointer" 
            />
          </div>
        </div>
      </div>

      {/* Main interactive Tab layout: Active Departments */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 my-6">
        {ALL_DEPARTMENTS.map(dept => {
          const isActive = activeDept === dept;
          const count = staffList.filter(s => s.department === dept).length;
          
          return (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={`p-3 rounded-xl border text-center transition duration-200 relative flex flex-col items-center justify-between min-h-[92px] cursor-pointer ${
                isActive 
                  ? 'bg-slate-900 border-amber-500 text-white shadow-lg' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="text-xs font-black tracking-tight leading-snug flex-1 flex items-center justify-center text-center px-1">
                {DEPARTMENT_NAMES_KM[dept]}
              </div>
              <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-md mt-1 shrink-0 ${
                isActive ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-600'
              }`}>
                {count} នាក់
              </span>
            </button>
          );
        })}
      </div>

      {/* 🔍 QR Code Check-In Station Drawer */}
      <AnimatePresence>
        {isQrStationOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-slate-905 bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 md:p-6 shadow-xl relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              {/* Header Title inside drawer */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <QrCode className="w-5 h-5 animate-pulse" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-rose-50 font-sans tracking-tight">
                      ម៉ាស៊ីនស្កេន QR កូដ (QR Code Check-In Station)
                    </h3>
                    <p className="text-[10.5px] font-bold text-slate-400 mt-0.5">
                      ឆែកវត្តមានស្វ័យប្រវត្តិតាមរយៈការស្កេនកាតកូដបុគ្គលិក • Timestamp Auto Recorder
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsQrStationOpen(false);
                    setScannerActive(false);
                  }}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main content grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left block - Interactive Scan Screen & File Upload */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-slate-950 rounded-2xl p-4.5 border border-slate-800/80">
                    
                    {/* Live Scanner Screen Container */}
                    <div className="relative aspect-video max-w-md mx-auto bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center text-center p-4">
                      {scannerActive ? (
                        <div id="qr-reader" className="w-full h-full overflow-hidden" />
                      ) : (
                        <div className="space-y-3">
                          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                            <Camera className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-300">កាមេរ៉ាមិនទាន់បើកដំណើរការ</p>
                            <p className="text-[9.5px] text-slate-500 max-w-xs leading-normal mt-1">
                              ផ្ដើសិទ្ធិកាមេរ៉ាក្នុង Browser រួចចុចខាងក្រោមដើម្បីបើកកាមេរ៉ាស្កេន
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Decoded/Loading indicator overlay */}
                      {scanState.status === 'success' && (
                        <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center text-center p-4 animate-fade-in z-10">
                          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shadow-lg mb-3">
                            <CheckCircle2 className="w-7 h-7" />
                          </div>
                          <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">ស្កេនជោគជ័យ (Check-In Success)</p>
                          <h4 className="text-base font-black text-white mt-1">{scanState.staffName}</h4>
                          <p className="text-xs text-slate-300">{scanState.dept} ({scanState.staffId})</p>
                          <p className="text-[10px] bg-slate-900 text-amber-400 px-3 py-1 rounded-full font-mono mt-3 border border-slate-800 font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            {scanState.time}
                          </p>

                          <button
                            type="button"
                            onClick={() => {
                              setScanState({ status: 'idle', message: '' });
                              setScannerActive(true);
                            }}
                            className="mt-4 px-3.5 py-1.5 text-[10px] bg-white text-slate-950 font-black rounded-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            ស្កេនបន្តទៀត (Scan Next)
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Scanner Controls block */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Toggle Camera Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (scannerActive) {
                            setScannerActive(false);
                            setScanState({ status: 'idle', message: '' });
                          } else {
                            setScanState({ status: 'idle', message: '' });
                            setScannerActive(true);
                          }
                        }}
                        className={`py-2.5 rounded-xl font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow ${
                          scannerActive
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/10'
                        }`}
                      >
                        {scannerActive ? (
                          <>
                            <X className="w-4 h-4" />
                            <span>បិទកាមេរ៉ា (Stop Scanner)</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 animate-pulse" />
                            <span>បើកកាមេរ៉ាស្កេន (Start Scanner)</span>
                          </>
                        )}
                      </button>

                      {/* File Upload Scan Button */}
                      <div className="relative">
                        <label className="flex items-center justify-center gap-2 bg-slate-805 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-black py-2.5 rounded-xl transition-colors cursor-pointer">
                          <Upload className="w-4 h-4 text-emerald-400" />
                          <span>ស្កេនរូបភាព QR (Upload Photo)</span>
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={handleFileScan}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Warning detail label */}
                  {scanState.status === 'error' && (
                    <div className="p-3.5 bg-rose-950/70 border border-rose-900/50 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 leading-relaxed font-semibold">
                      <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                      <div>{scanState.message}</div>
                    </div>
                  )}
                </div>

                {/* Right block - Testing Simulation Hub & Log ledger */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Simulation Helper */}
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 space-y-3.5">
                    <div className="flex items-center gap-2 text-rose-100">
                      <Sparkles className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
                      <h4 className="text-xs font-black text-amber-400">សេវាកម្មត្រាប់ស្កេន (QR Simulation Helper)</h4>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-normal font-medium">
                      ប្រសិនបើ Browser បដិសេធសិទ្ធិកាមេរ៉ាក្នុង Iframe លោកអ្នកអាចជ្រើសរើសអត្តសញ្ញាណបុគ្គលិកខាងក្រោម ដើម្បីធ្វើត្រាប់ស្កេន QR និងពិនិត្យទិន្នន័យ៖
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <select
                          value={selectedSimStaffId}
                          onChange={(e) => setSelectedSimStaffId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-black text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="">-- ជ្រើសរើសបុគ្គលិកដើម្បីសាកល្បង --</option>
                          {staffList.map(s => (
                            <option key={s.staffId} value={s.staffId}>
                              [{s.staffId}] {s.name} - {DEPARTMENT_NAMES_KM[s.department]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedSimStaffId) {
                            showToast("សូមជ្រើសរើសបុគ្គលិកសម្រាប់សាកល្បងជាមុនសិន!", "info");
                            return;
                          }
                          setScannerActive(false);
                          handleDecodedCode(selectedSimStaffId);
                        }}
                        className="w-full bg-white hover:bg-slate-150 hover:bg-slate-105 text-slate-950 font-black text-[11px] py-2 px-3 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer shadow"
                      >
                        <Play className="w-3.5 h-3.5 text-emerald-600" />
                        <span>សាកល្បងឆែកវត្តមាន (Simulate QR Scan)</span>
                      </button>
                    </div>
                  </div>

                  {/* Rolling Transaction Ledger */}
                  <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-850 border-slate-800 space-y-3">
                    <h4 className="text-xs font-black text-slate-300">ប្រវត្តិនៃការស្កេនក្នុង Session នេះ (Scan Logs)</h4>
                    
                    {qrScanLogs.length === 0 ? (
                      <div className="text-center py-5 border border-dashed border-slate-800 rounded-xl text-[10px] text-slate-500 font-bold">
                        មិនទាន់មានការស្កេនវត្តមាននៅឡើយទេ
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto">
                        {qrScanLogs.map(log => (
                          <div 
                            key={log.id} 
                            className={`p-2 rounded-xl border flex items-center justify-between gap-3 text-[11px] ${
                              log.status === 'success' 
                                ? 'bg-slate-900/60 border-slate-800' 
                                : 'bg-rose-950/30 border-rose-900/40'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 bg-slate-800 rounded overflow-hidden flex items-center justify-center shrink-0">
                                {log.photo ? (
                                  <img src={log.photo} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[10px] font-black">{log.staffName.substring(0, 1)}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-extrabold text-slate-200 truncate">{log.staffName}</p>
                                <p className="text-[9.5px] text-slate-500 truncate">{log.staffId} • {log.departmentName}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-mono text-[9px] text-amber-500 font-extrabold">{log.time}</p>
                              <p className={`text-[9px] font-black ${log.status === 'success' ? 'text-emerald-400' : 'text-rose-455'}`}>
                                {log.message}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div id="qr-reader-hidden-temp" className="hidden" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. 🖨️ Staff QR badges generator drawer */}
      <AnimatePresence>
        {isQrGeneratorOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-slate-50 text-slate-800 rounded-2xl border border-slate-200 p-5 shadow-xl relative">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
                    <Printer className="w-5 h-5 animate-pulse" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 font-sans tracking-tight">
                      បង្កើតកាតសម្គាល់បុគ្គលិក & QR Code (Staff ID Badge Maker)
                    </h3>
                    <p className="text-[10.5px] font-bold text-slate-500 mt-0.5">
                      ជ្រើសរើសបុគ្គលិក ដើម្បីទាញយក ឬបោះពុម្ពប័ណ្ណសម្គាល់ខ្លួនដែលមាន QR Code ម៉ាស៊ីនស្កេន
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsQrGeneratorOpen(false)}
                  className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Left Controller Panel */}
                <div className="md:col-span-5 space-y-4">
                  <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 space-y-3 shadow-xs">
                    <label className="block text-xs font-black text-slate-700">ជ្រើសរើសបុគ្គលិក (Select Staff)៖</label>
                    <select
                      value={selectedBadgeStaffId}
                      onChange={(e) => setSelectedBadgeStaffId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-black text-slate-700 outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">-- ជ្រើសរើសបុគ្គលិក --</option>
                      {staffList.map(s => (
                        <option key={s.staffId} value={s.staffId}>
                          [{s.staffId}] {s.name} ({DEPARTMENT_NAMES_KM[s.department]})
                        </option>
                      ))}
                    </select>

                    {selectedBadgeStaffId && (
                      <div className="pt-2 space-y-2">
                        {/* Direct Print Badge */}
                        <button
                          type="button"
                          onClick={() => {
                            const badgeEl = document.getElementById("staff-printable-badge");
                            if (badgeEl) {
                              const printWindow = window.open('', '', 'width=600,height=800');
                              if (printWindow) {
                                printWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>Print Staff Card - ${selectedBadgeStaffId}</title>
                                      <style>
                                        body { font-family: 'Inter', system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 95vh; margin: 0; background: #fafafa; }
                                        .card { background: white; border: 1px solid #ddd; border-radius: 16px; width: 340px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center; }
                                        .header { background: #059669; color: white; border-radius: 12px; padding: 12px; margin-bottom: 20px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
                                        .photo { width: 90px; height: 110px; border-radius: 8px; border: 2px solid #ddd; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; font-size: 24px; font-weight: bold; color: #6b7280; overflow: hidden; }
                                        .photo img { width: 100%; height: 100%; object-fit: cover; }
                                        .name { font-size: 18px; font-weight: 800; color: #111827; margin: 0 0 4px 0; }
                                        .dept { font-size: 12px; font-weight: 700; color: #047857; margin: 0 0 16px 0; }
                                        .details { border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 12px 0; margin-bottom: 16px; font-size: 11px; text-align: left; color: #4b5563; line-height: 1.6; }
                                        .details child { margin-bottom: 3px; }
                                        .details strong { color: #111827; }
                                        .qr-box { background: #f9fafb; border: 1px solid #eee; border-radius: 12px; padding: 12px; display: inline-block; margin-bottom: 8px; }
                                        .qr-img { width: 130px; height: 130px; display: block; }
                                        .footer-note { font-size: 9px; color: #9ca3af; font-weight: 600; text-transform: uppercase; margin-top: 5px; }
                                      </style>
                                    </head>
                                    <body>
                                      <div class="card">
                                        <div class="header">Western International School</div>
                                        <div class="photo">
                                          ${(() => {
                                            const sObj = staffList.find(st => st.staffId === selectedBadgeStaffId);
                                            return sObj?.photo 
                                              ? `<img src="${sObj.photo}" />` 
                                              : `<div>${sObj?.name.split(' ').pop()?.substring(0, 1)}</div>`;
                                          })()}
                                        </div>
                                        <div class="name">${staffList.find(st => st.staffId === selectedBadgeStaffId)?.name}</div>
                                        <div class="dept">${DEPARTMENT_NAMES_KM[staffList.find(st => st.staffId === selectedBadgeStaffId)?.department || 'Security']}</div>
                                        <div class="details">
                                          <div><strong>លេខសម្គាល់ / ID:</strong> ${selectedBadgeStaffId}</div>
                                          <div><strong>ភេទ / Gender:</strong> ${staffList.find(st => st.staffId === selectedBadgeStaffId)?.gender}</div>
                                          <div><strong>ទូរស័ព្ទ / Phone:</strong> ${staffList.find(st => st.staffId === selectedBadgeStaffId)?.phoneNumber || 'N/A'}</div>
                                          <div><strong>ទីតាំង / Area:</strong> ${staffList.find(st => st.staffId === selectedBadgeStaffId)?.responsibleLocation || 'School Campus'}</div>
                                        </div>
                                        <div class="qr-box">
                                          <img class="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${selectedBadgeStaffId}" />
                                        </div>
                                        <div class="footer-note">Staff NFC & QR ID Badge</div>
                                      </div>
                                      <script>
                                        window.onload = function() { window.print(); window.close(); }
                                      </script>
                                    </body>
                                  </html>
                                `);
                                printWindow.document.close();
                              }
                            }
                          }}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                        >
                          <Printer className="w-4 h-4 text-amber-400" />
                          <span>បោះពុម្ពប័ណ្ណសម្គាល់ (Print ID Badge)</span>
                        </button>

                        {/* Download QR Image directly */}
                        <a
                          href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${selectedBadgeStaffId}`}
                          target="_blank"
                          rel="noreferrer"
                          download={`QR_${selectedBadgeStaffId}.png`}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
                        >
                          <Download className="w-4 h-4 text-emerald-600" />
                          <span>ទាញយករូបភាព QR (Download QR Image)</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Preview Card Panel */}
                <div className="md:col-span-7 flex justify-center">
                  {selectedBadgeStaffId ? (
                    (() => {
                      const staff = staffList.find(st => st.staffId === selectedBadgeStaffId);
                      if (!staff) return null;

                      return (
                        <div 
                          id="staff-printable-badge" 
                          className="bg-white border-2 border-slate-200 p-6 rounded-3xl w-full max-w-[340px] shadow-lg text-center relative overflow-hidden transition-all hover:shadow-xl"
                        >
                          {/* Card green head banner */}
                          <div className="bg-emerald-600 border border-emerald-550 text-white rounded-2xl py-3 px-4 mb-4 text-center font-black tracking-wider text-xs">
                            WESTERN INTERNATIONAL SCHOOL
                          </div>
                          
                          {/* Staff Photo */}
                          <div className="w-24 h-28 bg-slate-50 border border-slate-200 rounded-xl mx-auto mb-3.5 overflow-hidden flex items-center justify-center shadow-xs">
                            {staff.photo ? (
                              <img src={staff.photo} alt={staff.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl font-black text-slate-400 uppercase">{staff.name.split(' ').pop()?.substring(0, 1)}</span>
                            )}
                          </div>

                          {/* Profile metadata */}
                          <h4 className="text-base font-black text-slate-900">{staff.name}</h4>
                          <p className="text-xs font-extrabold text-emerald-600 mt-0.5">{DEPARTMENT_NAMES_KM[staff.department]}</p>

                          {/* Detail Grid */}
                          <div className="border-t border-b border-dashed border-slate-200/80 py-3 my-4 text-left text-[11px] font-semibold text-slate-500 space-y-1">
                            <div className="flex justify-between"><span className="text-slate-400">អត្តសញ្ញាណប័ណ្ណ (ID):</span> <span className="font-mono font-black text-slate-800">{staff.staffId}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">ភេទ / Gender:</span> <span className="font-bold text-slate-800">{staff.gender}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">ល.ទូរស័ព្ទ / Phone:</span> <span className="font-bold text-slate-800">{staff.phoneNumber || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">ទីតាំងការងារ / Location:</span> <span className="font-bold text-slate-800 truncate max-w-[130px]">{staff.responsibleLocation || 'School Campus'}</span></div>
                          </div>

                          {/* API generated QR code frame */}
                          <div className="inline-block p-2 bg-slate-50 border border-slate-150 rounded-2xl self-center mx-auto mb-1 shadow-inner-sm">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${staff.staffId}`} 
                              alt="Staff QR Code" 
                              className="w-32 h-32 object-contain block mx-auto rounded-lg"
                            />
                          </div>
                          
                          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">
                            Western Attendance QR Badge
                          </p>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="bg-slate-100 border border-dashed border-slate-300 rounded-2xl p-10 text-center w-full max-w-sm flex flex-col justify-center items-center">
                      <Printer className="w-10 h-10 text-slate-400 mb-2.5 bg-slate-200 p-2 rounded-xl" />
                      <p className="text-xs font-black text-slate-500">មិនទាន់មានការជ្រើសរើសបុគ្គលិក</p>
                      <p className="text-[10px] text-slate-400 max-w-[200px] mt-1 mx-auto leading-relaxed">
                        សូមជ្រើសរើសបុគ្គលិកពីប្រអប់ខាងឆ្វេង ដើម្បីមើលគំរូកាតសម្គាល់ខ្លួន និងទាញយក QR Code។
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning/Guideline for Empty staff list */}
      {deptStaff.length === 0 ? (
        <div className="text-center py-20 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-6">
          <AlertCircle className="w-12 h-12 text-slate-350 mx-auto text-slate-300 mb-2" />
          <h4 className="text-sm font-extrabold text-slate-700">មិនទាន់មានទិន្នន័យបុគ្គលិកក្នុងផ្នែកនេះនៅឡើយទេ</h4>
          <p className="text-xs text-slate-400 font-semibold mt-1 max-w-sm mx-auto">
            សូមចូលទៅកាន់ផ្នែក <span className="underline text-indigo-600 font-bold">"រៀបចំបុគ្គលិក"</span> ខាងលើ ដើម្បីបញ្ចូលទិន្នន័យ ឬ បញ្ចូលឯកសារ Excel ដំបូងសិន!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Quick Mark Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-700">គ្រប់គ្រងរហ័ស (Bulk Select)៖</span>
              <button
                onClick={() => handleBulkMark('Present')}
                className="bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold px-3 py-1.5 rounded-lg transition"
              >
                វត្តមានទាំងអស់
              </button>
              <button
                onClick={() => handleBulkMark('Excused')}
                className="bg-white hover:bg-slate-50 text-amber-700 border border-amber-200 text-[11px] font-extrabold px-3 py-1.5 rounded-lg transition"
              >
                ច្បាប់ទាំងអស់
              </button>
              <button
                onClick={() => handleBulkMark('Absent')}
                className="bg-white hover:bg-slate-50 text-rose-700 border border-rose-200 text-[11px] font-extrabold px-3 py-1.5 rounded-lg transition"
              >
                អវត្តមានទាំងអស់
              </button>
            </div>

            {/* Local Stats inside department */}
            <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
              <span className="text-emerald-700">មកដល់៖ {countState('Present')}</span>
              <span>•</span>
              <span className="text-amber-700 font-bold">ច្បាប់៖ {countState('Excused')}</span>
              <span>•</span>
              <span className="text-rose-700 font-bold">អត់ច្បាប់៖ {countState('Absent')}</span>
            </div>
          </div>

          {/* List of Staff Members for Attendance registration */}
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
            {deptStaff.map((staff, idx) => {
              const currentVal = localRecords[staff.staffId] || { status: 'Present', notes: '' };
              const isPresent = currentVal.status === 'Present';
              const isExcused = currentVal.status === 'Excused';
              const isAbsent = currentVal.status === 'Absent';

              return (
                <div 
                  key={staff.staffId}
                  className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-slate-55 bg-white/70 hover:bg-slate-50/50 transition"
                >
                  {/* Left profile info */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 tracking-wider">{(idx + 1).toString().padStart(2, '0')}</span>
                    
                    {/* Tiny visual profile box */}
                    <div className="w-10 h-12 bg-slate-100 border border-slate-200 rounded overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                      {staff.photo ? (
                        <img src={staff.photo} alt={staff.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase">{staff.name.split(' ').pop()?.substring(0, 1) || 'W'}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800">{staff.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                        <span>លេខកូដ៖ <span className="font-extrabold text-slate-700">{staff.staffId}</span></span>
                        <span>•</span>
                        <span>ភេទ៖ <span className="font-extrabold text-slate-700">{staff.gender}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Middle and Right: Toggles and Commentary remarks */}
                  <div className="flex flex-wrap items-center gap-4">
                    
                    {/* Toggle States */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                      {/* Present Button */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(staff.staffId, 'Present')}
                        className={`px-3 py-1.5 rounded-md text-xs font-extrabold transition ${
                          isPresent 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        {ATTENDANCE_STATUS_KM.Present.label}
                      </button>

                      {/* Excused Button */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(staff.staffId, 'Excused')}
                        className={`px-3 py-1.5 rounded-md text-xs font-extrabold transition ${
                          isExcused 
                            ? 'bg-amber-500 text-white shadow-sm' 
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        {ATTENDANCE_STATUS_KM.Excused.label}
                      </button>

                      {/* Absent Button */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(staff.staffId, 'Absent')}
                        className={`px-3 py-1.5 rounded-md text-xs font-extrabold transition ${
                          isAbsent 
                            ? 'bg-rose-600 text-white shadow-sm' 
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        {ATTENDANCE_STATUS_KM.Absent.label}
                      </button>
                    </div>

                    {/* Annotation Note field */}
                    <div className="min-w-[150px] flex-grow">
                      <input 
                        type="text"
                        placeholder="សម្គាល់ (ឈឺ, ប្រជុំ...)"
                        value={currentVal.notes}
                        onChange={(e) => handleNoteChange(staff.staffId, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-medium p-2 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* 📊 Monthly Attendance Summary Card for Selected Month */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 mt-6 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-800 font-sans tracking-tight">
                    របាយការណ៍សង្ខេបវត្តមានប្រចាំខែ (Monthly Attendance Summary)
                  </h3>
                  <p className="text-[10.5px] font-bold text-indigo-600 mt-0.5">
                    គណនាសម្រាប់ខែ៖ <span className="underline">{getKhmerMonthYear(selectedDate)}</span>
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                className="p-1 px-2.5 rounded-lg border border-slate-250 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>{isSummaryExpanded ? 'លាក់ (Hide)' : 'បង្ហាញ (Show)'}</span>
                {isSummaryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {isSummaryExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 overflow-hidden"
                >
                  {/* Summary Filter and Search Controls */}
                  <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                    
                    {/* Search member */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="ស្វែងរកឈ្មោះ ឬលេខកូដសម្គាល់បុគ្គលិក..."
                        value={summarySearch}
                        onChange={(e) => setSummarySearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Department summary filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 whitespace-nowrap">ផ្នែកការងារ៖</span>
                      <select
                        value={summaryDept}
                        onChange={(e) => setSummaryDept(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer min-w-[140px]"
                      >
                        <option value="All">បង្ហាញទាំងអស់ (All)</option>
                        {ALL_DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{DEPARTMENT_NAMES_KM[dept]}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Aggregate Summary Widget Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3.5 border border-slate-200/80 rounded-xl">
                    <div className="p-2 border-r border-slate-100 flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-slate-400">វត្តមានសរុប (Selected Staff Present)</span>
                      <span className="text-lg font-black text-emerald-600 mt-1">{summaryAggregate.totalPresent} ថ្ងៃ</span>
                    </div>
                    <div className="p-2 border-r border-slate-100 flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-slate-400">ច្បាប់សរុប (Selected Staff Excused)</span>
                      <span className="text-lg font-black text-amber-500 mt-1">{summaryAggregate.totalExcused} ថ្ងៃ</span>
                    </div>
                    <div className="p-2 border-r border-slate-100 flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-slate-400">អវត្តមានសរុប (Selected Staff Absent)</span>
                      <span className="text-lg font-black text-rose-600 mt-1">{summaryAggregate.totalAbsent} ថ្ងៃ</span>
                    </div>
                    <div className="p-2 flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-slate-450 text-indigo-500">អត្រាមធ្យម (Avg Attendance Rate)</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className={`text-xl font-black ${overallAttendanceRate >= 90 ? 'text-emerald-600' : overallAttendanceRate >= 80 ? 'text-amber-500' : 'text-rose-600'}`}>
                          {overallAttendanceRate}%
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">ប្រចាំខែ</span>
                      </div>
                    </div>
                  </div>

                  {/* Staff List Statistics Container */}
                  {summaryFilteredStaff.length === 0 ? (
                    <div className="text-center py-8 bg-white border border-slate-150 rounded-xl">
                      <p className="text-xs text-slate-400 font-bold">រកមិនឃើញទិន្នន័យបុគ្គលិកត្រូវគ្នានឹងការស្វែងរកឡើយ</p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-[350px] overflow-y-auto shadow-inner-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                            <th className="py-2.5 px-3 font-black text-[11px] text-center w-12">ល.រ</th>
                            <th className="py-2.5 px-3 font-black text-[11px]">បុគ្គលិក (Staff Member)</th>
                            <th className="py-2.5 px-3 font-black text-[11px]">ផ្នែកការងារ (Dept)</th>
                            <th className="py-2.5 px-3 font-black text-[11px] text-center w-20 text-emerald-700">វត្តមាន (P)</th>
                            <th className="py-2.5 px-3 font-black text-[11px] text-center w-20 text-amber-600">ច្បាប់ (E)</th>
                            <th className="py-2.5 px-3 font-black text-[11px] text-center w-20 text-rose-600">អវត្តមាន (A)</th>
                            <th className="py-2.5 px-4 font-black text-[11px] w-48">អត្រាវត្តមាន (Rate %)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {summaryFilteredStaff.map((staff, index) => {
                            const stats = getMonthlyStatsForStaff(staff.staffId, currentMonthYear);
                            
                            // Highlighting color based on performance
                            let progressBg = 'bg-emerald-500';
                            let textStatusColor = 'text-emerald-700';
                            if (stats.rate < 80) {
                              progressBg = 'bg-rose-500';
                              textStatusColor = 'text-rose-600';
                            } else if (stats.rate < 90) {
                              progressBg = 'bg-amber-400';
                              textStatusColor = 'text-amber-605';
                            }

                            return (
                              <tr key={staff.staffId} className="hover:bg-slate-50/70 transition">
                                <td className="py-2 px-3 text-center text-slate-400 font-bold">{index + 1}</td>
                                <td className="py-2 px-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-8 rounded bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                      {staff.photo ? (
                                        <img src={staff.photo} alt={staff.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      ) : (
                                        <span className="text-[9px] font-black text-slate-400 uppercase">{staff.name.split(' ').pop()?.substring(0,1)}</span>
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-extrabold text-slate-800 leading-tight">{staff.name}</p>
                                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{staff.staffId}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-slate-500 font-bold text-[10.5px]">
                                  {DEPARTMENT_NAMES_KM[staff.department]}
                                </td>
                                <td className="py-2 px-3 text-center text-sm font-black text-emerald-600 bg-emerald-50/30">
                                  {stats.present}
                                </td>
                                <td className="py-2 px-3 text-center text-sm font-black text-amber-500 bg-amber-50/20">
                                  {stats.excused}
                                </td>
                                <td className="py-2 px-3 text-center text-sm font-black text-rose-600 bg-rose-50/20">
                                  {stats.absent}
                                </td>
                                <td className="py-2 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="flex-1 h-2 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${progressBg} rounded-full transition-all duration-500`}
                                        style={{ width: `${stats.rate}%` }}
                                      />
                                    </div>
                                    <span className={`font-mono text-[11px] font-black w-8 text-right ${textStatusColor}`}>
                                      {stats.rate}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-5 gap-4">
            
            {/* Export specific sheet buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={handleExcelExport}
                className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[11px] px-3.5 py-2.5 rounded-xl transition"
              >
                <FileSpreadsheet className="w-4 h-4" /> Excel ({DEPARTMENT_NAMES_KM[activeDept]})
              </button>
              <button 
                onClick={handlePdfExport}
                className="flex items-center gap-1.5 bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-[11px] px-3.5 py-2.5 rounded-xl transition"
              >
                <FileText className="w-4 h-4" /> PDF ({DEPARTMENT_NAMES_KM[activeDept]})
              </button>
            </div>

            {/* Registration save trigger with automatic save badge */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <span className="inline-flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-black px-3 py-2.5 rounded-xl border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>បានកត់ត្រាស្វ័យប្រវត្ត (Saved Auto ✔)</span>
              </span>
              <button
                onClick={handleSaveToRegistry}
                className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-3 rounded-xl border border-slate-800 hover:border-amber-500 transition shadow-lg shadow-slate-100 cursor-pointer whitespace-nowrap"
              >
                <Save className="w-4 h-4 text-amber-400" />
                រក្សាទុកដោយដៃ (Manual Save)
              </button>
            </div>
          </div>

          {/* Guidelines notes */}
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-start gap-2 text-[11px] font-semibold text-slate-500">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              ឯកសារដែលរក្សាទុកនឹងចាត់ចូលទិន្នន័យប្រវត្តិវត្តមានរបស់សាលា។ ក្រោយពីស្រង់វត្តមានរួច កម្រងឯកសារនីមួយៗនឹងត្រូវបែងចែកជា File Excel ផ្សេងៗគ្នាស្វ័យប្រវត្តិ ស្របទៅតាមការស្វែងរក និងកាលបរិច្ឆេទ។
            </div>
          </div>

        </div>
      )}

      {/* Modern High-Performance Floating Status Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3"
          >
            <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl shrink-0 flex items-center justify-center">
              <svg className="w-4 h-4 fill-none stroke-current stroke-[3px]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-slate-100 leading-snug pr-2">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
