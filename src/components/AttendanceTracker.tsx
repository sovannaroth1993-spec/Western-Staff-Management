/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Staff, Department, AttendanceRecord, AttendanceStatus, DEPARTMENT_NAMES_KM, ATTENDANCE_STATUS_KM, ALL_DEPARTMENTS } from '../types';
import { exportAttendanceToExcel } from '../utils/excelHelper';
import { exportAttendanceToPdf } from '../utils/pdfHelper';
import { 
  Users, Calendar, CheckSquare, ShieldAlert, FileSpreadsheet, 
  FileText, ArrowRight, UserCheck, AlertCircle, Save, HelpCircle, X,
  Search, BarChart3, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

        {/* Date Field & Quick Switcher */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl">
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
