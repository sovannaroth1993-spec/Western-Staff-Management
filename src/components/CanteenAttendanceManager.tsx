import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Calendar, CheckCircle2, AlertCircle, XCircle, 
  Trash2, Plus, Download, Printer, Save, Undo, Search, Check, 
  FileSpreadsheet, ClipboardCheck, Edit2, ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';

export interface CanteenStudentRow {
  no: number;
  fullName: string;
  sex: 'ប្រុស' | 'ស្រី' | 'Male' | 'Female';
  studentId: string;
  startDate: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Excused';
  workingDay: string; // ddd-mmm-yyyy format, e.g. "Mon 01-May-2026"
}

export interface CanteenAttendanceSheet {
  id: string; // Unique Sheet ID
  campus: string;
  className: string; // Class (N-12)
  workingDay: string; // Mon 01-May-2026, Tue...
  controlledBy: string;
  controlledOn: string;
  reportedBy: string;
  reportedOn: string;
  students: CanteenStudentRow[];
}

// Default initial boilerplate data to make sure it looks stunning and populated immediately
const DEFAULT_SHEETS: CanteenAttendanceSheet[] = [
  {
    id: 'cant_sheet_1',
    campus: 'ចំការដូង (Chamkar Doung)',
    className: 'Grade 7A',
    workingDay: 'Mon 01-Jun-2026',
    controlledBy: 'ឃាង សុភក្តិ (KHEANG Sopheak)',
    controlledOn: '2026-06-01',
    reportedBy: 'លួង វាសនា (LOUNG Veasna)',
    reportedOn: '2026-06-01',
    students: [
      { no: 1, studentName: 'លីវ ម៉េងហ៊ួ', sex: 'ប្រុស', studentId: 'WIS-STD-4091', startDate: '2025-09-01', status: 'Present', workingDay: 'Mon 01-Jun-2026' },
      { no: 2, studentName: 'សុខ គឹមហួរ', sex: 'ស្រី', studentId: 'WIS-STD-4092', startDate: '2025-09-01', status: 'Present', workingDay: 'Mon 01-Jun-2026' },
      { no: 3, studentName: 'ចាន់ ដារ៉ា', sex: 'ប្រុស', studentId: 'WIS-STD-4093', startDate: '2025-09-01', status: 'Excused', workingDay: 'Mon 01-Jun-2026' },
      { no: 4, studentName: 'ភី រ៉ាឌី', sex: 'ប្រុស', studentId: 'WIS-STD-4094', startDate: '2025-10-15', status: 'Present', workingDay: 'Mon 01-Jun-2026' },
      { no: 5, studentName: 'ឡាយ ស្រីនី', sex: 'ស្រី', studentId: 'WIS-STD-4095', startDate: '2025-09-01', status: 'Absent', workingDay: 'Mon 01-Jun-2026' },
      { no: 6, studentName: 'ជា សុភក្រ្ត', sex: 'ស្រី', studentId: 'WIS-STD-4096', startDate: '2025-11-01', status: 'Present', workingDay: 'Mon 01-Jun-2026' },
    ].map(s => ({
      no: s.no,
      fullName: s.studentName,
      sex: s.sex as 'ប្រុស' | 'ស្រី',
      studentId: s.studentId,
      startDate: s.startDate,
      status: s.status as 'Present' | 'Absent' | 'Excused',
      workingDay: s.workingDay
    }))
  },
  {
    id: 'cant_sheet_2',
    campus: 'ចំការដូង (Chamkar Doung)',
    className: 'Grade 12B',
    workingDay: 'Tue 02-Jun-2026',
    controlledBy: 'សេង ធារ៉ា (SENG Theara)',
    controlledOn: '2026-06-02',
    reportedBy: 'លួង វាសនា (LOUNG Veasna)',
    reportedOn: '2026-06-02',
    students: [
      { no: 1, fullName: 'ម៉ៅ សុជាតា', sex: 'ស្រី', studentId: 'WIS-STD-5001', startDate: '2024-09-01', status: 'Present', workingDay: 'Tue 02-Jun-2026' },
      { no: 2, fullName: 'គឹម ផល្លា', sex: 'ស្រី', studentId: 'WIS-STD-5002', startDate: '2024-09-01', status: 'Present', workingDay: 'Tue 02-Jun-2026' },
      { no: 3, fullName: 'អ៊ុំ រតនា', sex: 'ប្រុស', studentId: 'WIS-STD-5003', startDate: '2024-09-01', status: 'Present', workingDay: 'Tue 02-Jun-2026' },
      { no: 4, fullName: 'តែ ម៉េងលី', sex: 'ប្រុស', studentId: 'WIS-STD-5004', startDate: '2024-09-01', status: 'Absent', workingDay: 'Tue 02-Jun-2026' },
    ]
  }
];

export default function CanteenAttendanceManager() {
  // Store all sheets in persistent storage
  const [sheets, setSheets] = useState<CanteenAttendanceSheet[]>(() => {
    try {
      const saved = localStorage.getItem('wis_canteen_sheets_v1');
      return saved ? JSON.parse(saved) : DEFAULT_SHEETS;
    } catch {
      return DEFAULT_SHEETS;
    }
  });

  // Active operating Sheet ID or 'new'
  const [selectedSheetId, setSelectedSheetId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('wis_canteen_sheets_v1');
      const loaded = saved ? JSON.parse(saved) : DEFAULT_SHEETS;
      return loaded.length > 0 ? loaded[0].id : '';
    } catch {
      return DEFAULT_SHEETS[0]?.id || '';
    }
  });

  // Current Working Sheet values
  const [campus, setCampus] = useState('ចំការដូង (Chamkar Doung)');
  const [className, setClassName] = useState('Grade 7A');
  const [workingDay, setWorkingDay] = useState('Mon 01-Jun-2026');
  const [controlledBy, setControlledBy] = useState('ឃាង សុភក្តិ (KHEANG Sopheak)');
  const [controlledOn, setControlledOn] = useState('2026-06-01');
  const [reportedBy, setReportedBy] = useState('លួង វាសនា (LOUNG Veasna)');
  const [reportedOn, setReportedOn] = useState('2026-06-01');

  // Student list inside the working sheet
  const [students, setStudents] = useState<CanteenStudentRow[]>([]);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Toast message
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'warn' | 'danger' } | null>(null);

  // Sync state whenever sheets list gets updated
  useEffect(() => {
    localStorage.setItem('wis_canteen_sheets_v1', JSON.stringify(sheets));
  }, [sheets]);

  // Load active sheet values into working states
  useEffect(() => {
    const sheet = sheets.find(s => s.id === selectedSheetId);
    if (sheet) {
      setCampus(sheet.campus);
      setClassName(sheet.className);
      setWorkingDay(sheet.workingDay);
      setControlledBy(sheet.controlledBy);
      setControlledOn(sheet.controlledOn || '');
      setReportedBy(sheet.reportedBy);
      setReportedOn(sheet.reportedOn || '');
      setStudents(sheet.students || []);
    }
  }, [selectedSheetId, sheets]);

  const showToast = (msg: string, type: 'success' | 'warn' | 'danger' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Automatically formulate day string from typical date select if user wants help compiling ddd-mmm-yyyy
  const formatWorkingDayStr = (dateVal: string): string => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '';
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dStr = days[d.getDay()];
      const mStr = months[d.getMonth()];
      const dayNum = String(d.getDate()).padStart(2, '0');
      const yr = d.getFullYear();
      return `${dStr} ${dayNum}-${mStr}-${yr}`;
    } catch {
      return '';
    }
  };

  const handleUpdateDateFromCalendar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formDay = formatWorkingDayStr(e.target.value);
    if (formDay) {
      setWorkingDay(formDay);
      // Also update workingDay for students having matches
      setStudents(prev => prev.map(s => ({ ...s, workingDay: formDay })));
      showToast(`បានកំណត់ថ្ងៃធ្វើការទៅជា៖ "${formDay}"`, 'success');
    }
  };

  // Add standard student row
  const handleAddStudentRow = () => {
    const nextNo = students.length > 0 ? Math.max(...students.map(s => s.no)) + 1 : 1;
    const nextStdId = `WIS-STD-${4000 + nextNo}`;
    
    const newRow: CanteenStudentRow = {
      no: nextNo,
      fullName: '',
      sex: 'ប្រុស',
      studentId: nextStdId,
      startDate: new Date().toISOString().split('T')[0],
      status: 'Present',
      workingDay: workingDay || 'Mon 01-Jun-2026'
    };

    setStudents([...students, newRow]);
    showToast('បានបន្ថែមដងជួរិសិស្ស្ថ្មី (Added new student row)', 'success');
  };

  // Batch status update action
  const handleBatchStatus = (status: 'Present' | 'Absent' | 'Excused') => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
    showToast(`វត្តមានរបស់សិស្សទាំងអស់ត្រូវបានប្តូរទៅជា៖ "${status === 'Present' ? 'វត្តមាន' : status === 'Absent' ? 'អវត្តមាន' : 'ច្បាប់'}"`, 'success');
  };

  // Remove specific student row
  const handleDeleteStudentRow = (no: number) => {
    const filtered = students.filter(s => s.no !== no).map((s, idx) => ({
      ...s,
      no: idx + 1 // Re-index No
    }));
    setStudents(filtered);
    showToast('បានលុបជួរិសិស្សជោគជ័យ (Row removed)', 'warn');
  };

  // Handle student info inline changes
  const handleStudentCellChange = (no: number, field: keyof CanteenStudentRow, value: any) => {
    setStudents(prev => prev.map(s => {
      if (s.no === no) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  // Save current states into active sheet in the list
  const handleSaveActiveSheet = () => {
    if (!campus.trim()) {
      showToast('សូមបំពេញឈ្មោះ សាខា Campus!', 'danger');
      return;
    }
    if (!className.trim()) {
      showToast('សូមបំពេញថ្នាក់រៀន Class!', 'danger');
      return;
    }
    if (!workingDay.trim()) {
      showToast('សូមបំពេញថ្ងៃធ្វើការ Working Day!', 'danger');
      return;
    }

    const updated = sheets.map(s => {
      if (s.id === selectedSheetId) {
        return {
          ...s,
          campus,
          className,
          workingDay,
          controlledBy,
          controlledOn,
          reportedBy,
          reportedOn,
          students
        };
      }
      return s;
    });

    setSheets(updated);
    showToast('បានរក្សាទុករបាយការណ៍វត្តមានអាហារដ្ឋានរួចរាល់ (Saved to database)!', 'success');
  };

  // Create a brand new clean sheet
  const handleCreateNewSheet = () => {
    const newId = `cant_sheet_${Date.now()}`;
    const newSheet: CanteenAttendanceSheet = {
      id: newId,
      campus: 'ចំការដូង (Chamkar Doung)',
      className: 'Grade 10A',
      workingDay: formatWorkingDayStr(new Date().toISOString().split('T')[0]) || 'Mon 01-Jun-2026',
      controlledBy: 'ឃាង សុភក្តិ (KHEANG Sopheak)',
      controlledOn: new Date().toISOString().split('T')[0],
      reportedBy: 'លួង វាសនា (LOUNG Veasna)',
      reportedOn: new Date().toISOString().split('T')[0],
      students: [
        { no: 1, fullName: 'ជា លីណា', sex: 'ស្រី', studentId: 'WIS-STD-6001', startDate: '2025-09-01', status: 'Present', workingDay: 'Mon 01-Jun-2026' },
        { no: 2, fullName: 'ធន់ វុឌ្ឍី', sex: 'ប្រុស', studentId: 'WIS-STD-6002', startDate: '2025-09-01', status: 'Present', workingDay: 'Mon 01-Jun-2026' }
      ]
    };

    setSheets([newSheet, ...sheets]);
    setSelectedSheetId(newId);
    showToast('បានបង្កើតទម្រង់របាយការណ៍ថ្មីទទេរួចរាល់!', 'success');
  };

  // Delete whole sheet
  const handleDeleteSheet = (idToDelete: string) => {
    if (confirm('តើអ្នកពិតជាចង់លុបទំរង់វត្តមានអាហារដ្ឋាននេះមែនទេ?')) {
      const filtered = sheets.filter(s => s.id !== idToDelete);
      setSheets(filtered);
      if (selectedSheetId === idToDelete && filtered.length > 0) {
        setSelectedSheetId(filtered[0].id);
      }
      showToast('បានលុបទម្រង់របាយការណ៍វត្តមានអាហារដ្ឋានចោលរួចរាល់!', 'warn');
    }
  };

  // Filtered students for quick local searching
  const filteredStudents = students.filter(s => {
    const query = searchQuery.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(query) ||
      s.studentId.toLowerCase().includes(query) ||
      s.workingDay.toLowerCase().includes(query) ||
      s.status.toLowerCase().includes(query)
    );
  });

  // Calculate high-level stats for the active sheet
  const presentCount = students.filter(s => s.status === 'Present').length;
  const absentCount = students.filter(s => s.status === 'Absent').length;
  const excusedCount = students.filter(s => s.status === 'Excused').length;
  const totalCount = students.length;

  const exportToExcelOrCsv = () => {
    // Generate simple readable CSV text
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += `របាយការណ៍វត្តមានសិស្សនៅអាហារដ្ឋាន (Attendance of Students at the Canteen)\n`;
    csvContent += `ទីតាំងសាលា (Campus),${campus}\n`;
    csvContent += `ថ្នាក់រៀន (Class),${className}\n`;
    csvContent += `ថ្ងៃធ្វើការ (Working Day),${workingDay}\n`;
    csvContent += `ត្រួតពិនិត្យដោយ (Controlled by),${controlledBy},កាលបរិច្ឆេទ (Controlled on),${controlledOn}\n`;
    csvContent += `រាយការណ៍ដោយ (Reported by),${reportedBy},កាលបរិច្ឆេទ (Reported on),${reportedOn}\n\n`;
    
    csvContent += "ល.រ (No),ឈ្មោះពេញ (Full Name),ភេទ (Sex),លេខសម្គាល់ (ID),ថ្ងៃចាប់ផ្តើម (Start Date),ស្ថានភាព (Status),ថ្ងៃធ្វើការ (Working day)\n";
    
    students.forEach((s) => {
      csvContent += `"${s.no}","${s.fullName}","${s.sex}","${s.studentId}","${s.startDate}","${s.status}","${s.workingDay}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Canteen_Attendance_${className}_${workingDay.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('បានទាញយកឯកសាររបាយការណ៍ CSV (Excel) រួចរាល់!', 'success');
  };

  const printDocument = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-4 sm:p-6 lg:p-8" id="canteen-attendance-section">
      
      {/* Dynamic Toast Alerts */}
      {toast && (
        <div className="fixed top-5 right-5 z-55 max-w-sm animate-bounce shadow-2xl">
          <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 font-bold text-xs ${
            toast.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' :
            toast.type === 'warn' ? 'bg-amber-500 text-slate-900 border-amber-400' :
            'bg-rose-600 text-white border-rose-500'
          }`}>
            <ClipboardCheck className="w-5 h-5 shrink-0" />
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Hero & Section Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-md shadow-indigo-500/20">
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-moul text-slate-900 tracking-normal leading-normal">
              វត្តមានសិស្សនៅអាហារដ្ឋាន (Canteen Student Attendance)
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-semibold mt-1">
              គ្រប់គ្រងវត្តមានសិស្សានុសិស្សដែលទទួលទានអាហារនៅអាហារដ្ឋានសាលា (Western International School)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleCreateNewSheet}
            className="bg-indigo-650 bg-indigo-600 text-white text-xs font-black px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>បង្កើតសន្លឹកថ្មី</span>
          </button>
          
          <button 
            onClick={exportToExcelOrCsv}
            className="bg-emerald-600 text-white text-xs font-black px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ទាញយក Excel / CSV</span>
          </button>

          <button 
            onClick={printDocument}
            className="bg-slate-800 text-white text-xs font-black px-4 py-2.5 rounded-xl hover:bg-slate-900 transition flex items-center gap-2 shadow-sm print:hidden"
          >
            <Printer className="w-4 h-4" />
            <span>បោះពុម្ព (Print)</span>
          </button>
        </div>
      </div>

      {/* Screen Layout Grid for Selection and Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        
        {/* Left selector menu column */}
        <div className="bg-slate-50 border border-slate-200/65 rounded-2xl p-4 flex flex-col gap-3.5">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>ជ្រើសរើសរបាយការណ៍ Canteen</span>
          </h3>
          
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {sheets.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold text-center py-4">គ្មានសន្លឹកទិន្នន័យទេ</p>
            ) : (
              sheets.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSheetId(s.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-start ${
                    selectedSheetId === s.id 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                      : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-moul tracking-normal text-[11px] leading-relaxed truncate">
                      {s.className} ({s.campus.split(' ')[0]})
                    </div>
                    <div className="text-[10px] font-bold mt-1 opacity-75 font-sans">
                      {s.workingDay}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSheet(s.id);
                    }}
                    className={`p-1 rounded-md transition hover:bg-rose-550 shrink-0 ${
                      selectedSheetId === s.id ? 'text-slate-400 hover:text-red-300' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title="លុបរបាយការណ៍នេះ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </button>
              ))
            )}
          </div>

          <div className="h-px bg-slate-200" />
          <div className="text-[10px] font-semibold text-slate-400">
            * របាយការណ៍នីមួយៗរក្សាបណ្ណសារវត្តមានសិស្សដាច់ដោយឡែកពីគ្នា តាមថ្ងៃ និងថ្នាក់។
          </div>
        </div>

        {/* Dynamic Interactive Metadata Card */}
        <div className="lg:col-span-3 bg-slate-50 border border-slate-200/65 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">ទីតាំងសាលា / Campus branch *</label>
              <input
                type="text"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                placeholder="សាខាចំការដូង ជាដើម..."
                className="w-full bg-white text-xs font-extrabold text-slate-800 p-2.5 border border-slate-200 rounded-xl mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">ថ្នាក់រៀន / Class (N-12) *</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="K3 / Grade 7A / Grade 11B..."
                className="w-full bg-white text-xs font-extrabold text-slate-800 p-2.5 border border-slate-200 rounded-xl mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">ថ្ងៃបំពេញការងារ / Working Day *</label>
              <input
                type="text"
                value={workingDay}
                onChange={(e) => setWorkingDay(e.target.value)}
                placeholder="Mon 01-May-2026 ជាដើម..."
                className="w-full bg-white text-xs font-extrabold text-slate-850 p-2.5 border border-slate-200 rounded-xl mt-1 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">ជ្រើសរើសថ្ងៃខែពីប្រតិទិន (Calender Helper)</label>
              <input
                type="date"
                onChange={handleUpdateDateFromCalendar}
                className="w-full bg-white text-xs font-bold text-slate-500 p-2 border border-slate-200 rounded-xl mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Canteen statistics cards */}
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">ស្ថិតិវត្តមានអាហារដ្ឋាន</span>
              <div className="text-xs font-bold text-slate-500 mt-1">ថ្នាក់៖ <span className="font-extrabold text-slate-800">{className}</span> • ថ្ងៃ៖ <span className="font-extrabold text-slate-800 font-sans">{workingDay}</span></div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center mt-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg py-1.5 px-1">
                <span className="text-[10px] text-emerald-600 block font-bold">មក</span>
                <span className="text-base font-sans font-black text-emerald-700">{presentCount}</span>
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-lg py-1.5 px-1">
                <span className="text-[10px] text-rose-600 block font-bold">អវត្តមាន</span>
                <span className="text-base font-sans font-black text-rose-700">{absentCount}</span>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg py-1.5 px-1">
                <span className="text-[10px] text-amber-600 block font-bold">ច្បាប់</span>
                <span className="text-base font-sans font-black text-amber-700">{excusedCount}</span>
              </div>
            </div>

            <div className="text-[10px] font-bold text-center text-slate-400 mt-2 bg-slate-100 rounded py-0.5 font-sans">
              សរុបសិស្ស៖ {totalCount} នាក់
            </div>
          </div>

        </div>

      </div>

      {/* Control Audit Columns info */}
      <div className="bg-amber-50/70 border border-amber-100 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Controlled by (Name):</label>
          <input
            type="text"
            value={controlledBy}
            onChange={(e) => setControlledBy(e.target.value)}
            placeholder="ឈ្មោះបុគ្គលិកត្រួតពិនិត្យ..."
            className="w-full bg-white text-xs font-bold text-slate-800 p-2 border border-slate-200 rounded-xl mt-1 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Controlled on (date):</label>
          <input
            type="date"
            value={controlledOn}
            onChange={(e) => setControlledOn(e.target.value)}
            className="w-full bg-white text-xs font-bold text-slate-800 p-2 border border-slate-200 rounded-xl mt-1 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Reported by (Name):</label>
          <input
            type="text"
            value={reportedBy}
            onChange={(e) => setReportedBy(e.target.value)}
            placeholder="ឈ្មោះបុគ្គលិករាយការណ៍..."
            className="w-full bg-white text-xs font-bold text-slate-800 p-2 border border-slate-200 rounded-xl mt-1 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Reported on (date):</label>
          <input
            type="date"
            value={reportedOn}
            onChange={(e) => setReportedOn(e.target.value)}
            className="w-full bg-white text-xs font-bold text-slate-800 p-2 border border-slate-200 rounded-xl mt-1 focus:outline-none"
          />
        </div>
      </div>

      {/* Database control panel, Search and quick status helpers */}
      <div className="flex flex-col md:flex-row items-center justify-between pb-4 gap-4">
        
        {/* Local Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ស្វែងរកផ្អែកលើឈ្មោះ លេខសម្គាល់..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:justify-end">
          <span className="text-xs font-black text-slate-400 mr-1 hidden sm:inline">វត្តមានរហ័ស៖</span>
          
          <button
            onClick={() => handleBatchStatus('Present')}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-black px-3.5 py-1.5 rounded-lg border border-emerald-200 transition"
            title="កំណត់ជាមកទាំងអស់"
          >
            មកទាំងអស់ (Set All Present)
          </button>
          
          <button
            onClick={() => handleBatchStatus('Absent')}
            className="bg-rose-50 hover:bg-rose-100 text-rose-800 text-[10px] sm:text-xs font-black px-3.5 py-1.5 rounded-lg border border-rose-200 transition"
            title="កំណត់ជាអត់ច្បាប់ទាំងអស់"
          >
            អវត្តមានទាំងអស់ (Set All Absent)
          </button>

          <button
            onClick={() => handleBatchStatus('Excused')}
            className="bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] sm:text-xs font-black px-3.5 py-1.5 rounded-lg border border-amber-200 transition"
            title="កំណត់ជាច្បាប់ទាំងអស់"
          >
            ច្បាប់ទាំងអស់ (Set All Excused)
          </button>

          <button
            onClick={handleAddStudentRow}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] sm:text-xs font-black px-3.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>បន្ថែមសិស្ស</span>
          </button>
        </div>

      </div>

      {/* Interactive Attendance Log Sheet Spreadsheet */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold text-xs border-b border-slate-800">
                <th className="py-3 px-4 text-center w-12">ល.រ (No)</th>
                <th className="py-3 px-4 min-w-[180px]">ឈ្មោះពេញរបស់សិស្ស (Full Name) *</th>
                <th className="py-3 px-4 w-28 text-center">ភេទ (Sex)</th>
                <th className="py-3 px-4 w-36">កូដសម្គាល់សិស្ស (ID) *</th>
                <th className="py-3 px-4 w-36">ថ្ងៃចាប់ផ្តើម (Start Date)</th>
                <th className="py-3 px-4 w-44">ស្ថានភាព (Status)</th>
                <th className="py-3 px-4 w-44">ថ្ងៃធ្វើការ (Working Day) *</th>
                <th className="py-3 px-4 text-center w-16">ជម្រើស</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 px-4 text-center text-xs text-slate-400 font-bold">
                    មិនរកឃើញទិន្នន័យសិស្សឡើយ (សូមបន្ថែមជួរថ្មី ឬផ្លាស់ប្តូរតម្រងស្វែងរក)
                  </td>
                </tr>
              ) : (
                filteredStudents.map((row) => (
                  <tr 
                    key={row.no}
                    className={`text-xs hover:bg-slate-50/60 transition-colors ${
                      row.status === 'Absent' ? 'bg-rose-50/20' : 
                      row.status === 'Excused' ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    {/* No */}
                    <td className="py-2.5 px-4 text-center font-extrabold text-slate-500">
                      {row.no}
                    </td>

                    {/* Full Name */}
                    <td className="py-2.5 px-4 font-bold text-slate-800">
                      <input
                        type="text"
                        value={row.fullName}
                        onChange={(e) => handleStudentCellChange(row.no, 'fullName', e.target.value)}
                        placeholder="បញ្ចូលឈ្មោះសិស្ស..."
                        className="w-full bg-slate-55 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-xs font-bold p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                      />
                    </td>

                    {/* Sex */}
                    <td className="py-2.5 px-4">
                      <select
                        value={row.sex}
                        onChange={(e) => handleStudentCellChange(row.no, 'sex', e.target.value)}
                        className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-xs font-bold p-1.5 border border-slate-200 rounded-lg focus:outline-none"
                      >
                        <option value="ប្រុស">ប្រុស (M)</option>
                        <option value="ស្រី">ស្រី (F)</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </td>

                    {/* Student ID */}
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        value={row.studentId}
                        onChange={(e) => handleStudentCellChange(row.no, 'studentId', e.target.value)}
                        placeholder="WIS-STD-xxxx"
                        className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-xs font-mono font-bold p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                      />
                    </td>

                    {/* Start Date */}
                    <td className="py-2.5 px-4">
                      <input
                        type="date"
                        value={row.startDate}
                        onChange={(e) => handleStudentCellChange(row.no, 'startDate', e.target.value)}
                        className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-[11px] font-bold p-1 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </td>

                    {/* Status Select with pill colours */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1">
                        <select
                          value={row.status}
                          onChange={(e) => handleStudentCellChange(row.no, 'status', e.target.value)}
                          className={`w-full text-xs font-extrabold p-1.5 border rounded-lg focus:outline-none ${
                            row.status === 'Present' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            row.status === 'Absent' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                            'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <option value="Present">វត្តមាន (Present)</option>
                          <option value="Absent">អវត្តមាន (Absent)</option>
                          <option value="Excused">ច្បាប់ (Excused)</option>
                        </select>
                      </div>
                    </td>

                    {/* Student individual working day */}
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        value={row.workingDay}
                        onChange={(e) => handleStudentCellChange(row.no, 'workingDay', e.target.value)}
                        placeholder="e.g. Mon 01-Jun-2026"
                        className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-xs font-semibold p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/25 font-sans"
                      />
                    </td>

                    {/* Row delete action */}
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => handleDeleteStudentRow(row.no)}
                        className="p-1 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 rounded-lg text-rose-500 hover:text-rose-700 transition"
                        title="លុបជួរិសិស្សនេះ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action panel bottom - Save state */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 mt-6 pt-5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-505 text-slate-550 text-slate-550 text-slate-500">
          <ShieldAlert className="w-4 h-4 text-indigo-500" />
          <span>ទិន្នន័យត្រូវបានរក្សាទុកក្នុងកុំព្យូទ័ររបស់អ្នកដោយស្វ័យប្រវត្តិ។</span>
        </div>

        <button
          onClick={handleSaveActiveSheet}
          className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 text-sm font-black px-8 py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl cursor-pointer"
        >
          <Save className="w-4.5 h-4.5 text-emerald-400" />
          <span>រក្សាទុករបាយការណ៍បច្ចុប្បន្ន (Save Canteen Audit Sheet)</span>
        </button>
      </div>

      {/* Printable Report Layout block (Hidden on screen, shown in print only) */}
      <div className="hidden print:block font-sans p-10 max-w-full text-slate-900" style={{ fontFamily: 'Khmer OS Battambang, sans-serif' }}>
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl font-bold font-moul">សាលាវេស្ទើនអន្តរជាតិ (Western International School)</h1>
          <h2 className="text-xl font-bold">របាយការណ៍វត្តមានសិស្សនៅអាហារដ្ឋាន (Attendance of Students at the Canteen)</h2>
          <div className="text-sm border-t border-b border-slate-400 py-2 inline-block px-12 font-bold select-none text-slate-700 mt-3 space-x-8">
            <span>ទីតាំងសាលា (Campus): <strong>{campus}</strong></span>
            <span>ថ្នាក់រៀន (Class): <strong>{className}</strong></span>
            <span>ថ្ងៃធ្វើការ (Working Day): <strong>{workingDay}</strong></span>
          </div>
        </div>

        <table className="w-full text-xs border border-collapse border-slate-400 text-left my-6 leading-relaxed">
          <thead>
            <tr className="bg-slate-100 border border-slate-400 font-extrabold text-slate-800">
              <th className="border border-slate-400 p-2 text-center w-12">ល.រ (No)</th>
              <th className="border border-slate-400 p-2">ឈ្មោះពេញរបស់សិស្ស (Full Name)</th>
              <th className="border border-slate-400 p-2 text-center w-16">ភេទ (Sex)</th>
              <th className="border border-slate-400 p-2 w-28">កូដសិស្ស (ID)</th>
              <th className="border border-slate-400 p-2 w-28">ថ្ងៃចូល (Start Date)</th>
              <th className="border border-slate-400 p-2 w-28">ស្ថានភាព (Status)</th>
              <th className="border border-slate-400 p-2 w-32">ថ្ងៃធ្វើការ (Working Day)</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, index) => (
              <tr key={index} className="border border-slate-400">
                <td className="border border-slate-400 p-2 text-center font-bold">{s.no}</td>
                <td className="border border-slate-400 p-2 font-bold">{s.fullName || '---'}</td>
                <td className="border border-slate-400 p-2 text-center">{s.sex}</td>
                <td className="border border-slate-400 p-2 font-mono font-bold">{s.studentId}</td>
                <td className="border border-slate-400 p-2 font-mono">{s.startDate}</td>
                <td className="border border-slate-400 p-2 font-extrabold">
                  {s.status === 'Present' ? 'វត្តមាន (មក)' : s.status === 'Absent' ? 'អវត្តមាន' : 'ច្បាប់'}
                </td>
                <td className="border border-slate-400 p-2 text-[11px] font-mono">{s.workingDay}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Audit footer signs of the template */}
        <div className="grid grid-cols-2 gap-10 mt-12 text-xs font-bold leading-relaxed">
          <div className="space-y-4 border border-slate-200 p-4 rounded-xl">
            <h4 className="text-slate-800 font-extrabold pb-1 border-b border-dashed">ការត្រួតពិនិត្យ (Controlled Information)</h4>
            <div>Controlled by (Name): <strong className="text-slate-800">{controlledBy || '---'}</strong></div>
            <div>Controlled on (date): <span className="font-mono">{controlledOn || '---'}</span></div>
            <div className="pt-8 text-center text-slate-400 italic font-normal">ហត្ថលេខា / Signature</div>
          </div>

          <div className="space-y-4 border border-slate-200 p-4 rounded-xl">
            <h4 className="text-slate-800 font-extrabold pb-1 border-b border-dashed">ការរាយការណ៍ (Reported Information)</h4>
            <div>Reported by (Name): <strong className="text-slate-800">{reportedBy || '---'}</strong></div>
            <div>Reported on (date): <span className="font-mono">{reportedOn || '---'}</span></div>
            <div className="pt-8 text-center text-slate-400 italic font-normal">ហត្ថលេខា / Signature</div>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400 font-semibold mt-16 border-t border-dotted pt-4">
          របាយការណ៍បង្កើតដោយស្វ័យប្រវត្តតាមរយៈ AI Studio Systems • សាលាវេស្ទើនអន្តរជាតិ (Western International School)
        </div>
      </div>

    </div>
  );
}
