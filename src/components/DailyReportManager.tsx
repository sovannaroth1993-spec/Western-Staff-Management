import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, User, ClipboardList, Plus, Trash2, Eye, Printer, 
  Edit3, Save, X, Check, FileText, ChevronRight, Search, Activity, 
  Sparkles, Filter, CheckCircle, AlertTriangle, Play, HelpCircle, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DailyReport, HourlyLog } from '../types';

// Standard English & Khmer time slots preset to make logging fast
const TIME_BLOCK_PRESETS = [
  '07:30 - 08:30',
  '08:30 - 09:30',
  '09:30 - 10:30',
  '10:30 - 11:30',
  '11:30 - 12:30',
  '12:30 - 13:30',
  '13:30 - 14:30',
  '14:30 - 15:30',
  '15:30 - 16:30',
  '16:30 - 17:30'
];

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
    timeSlot: '08:30 - 09:30',
    activity: 'ដើរត្រួតពិនិត្យប្រព័ន្ធម៉ាស៊ីនត្រជាក់ (AC) និងឧបករណ៍អគ្គិសនីតាមបណ្តាបន្ទប់រៀនជាន់ទី១ និងជាន់ទី២ (Audit room ACs and electricity on 1st & 2nd floors)',
    status: 'Completed',
    remarks: 'រកឃើញម៉ាស៊ីនត្រជាក់បន្ទប់ ២០១ មិនសូវត្រជាក់ បានកត់ត្រាចូលប្រព័ន្ធជួសជុល'
  },
  {
    id: 'hl-3',
    timeSlot: '09:30 - 10:30',
    activity: 'ពិនិត្យដំណើរការកាមេរ៉ាសុវត្ថិភាព CCTV ក្នុងមជ្ឈមណ្ឌលបញ្ជា និងផ្ទៀងផ្ទាត់ការថត (Verify CCTV control feed integrity and hard drive backup)',
    status: 'Completed',
    remarks: 'កាមេរ៉ាទាំងអស់៥៦គ្រាប់ ដំណើរការល្អធម្មតាគ្មានការរអាក់រអួល'
  },
  {
    id: 'hl-4',
    timeSlot: '10:30 - 11:30',
    activity: 'សម្របសម្រួល និងត្រួតពិនិត្យសំណុំឯកសារធានារ៉ាប់រងគ្រោះថ្នាក់សិស្សសម្រាប់បញ្ជូនទៅកាន់ Forte Insurance (Coordinate insurance documentation for claims)',
    status: 'Completed',
    remarks: 'បានរៀបចំសំណុំឯកសារសិស្សចំនួន ០២ នាក់ដាក់ជូន Admin Supervisor ពិនិត្យ'
  },
  {
    id: 'hl-5',
    timeSlot: '11:30 - 12:30',
    activity: 'ចុះពិនិត្យការសម្អាត និងសណ្តាប់ធ្នាប់អនាម័យក្នុងអាហារដ្ឋានសាលាមុនម៉ោងសិស្សសម្រាកញ៉ាំអាហារ (Supervise canteen hygiene and dining space order)',
    status: 'Completed'
  },
  {
    id: 'hl-6',
    timeSlot: '13:30 - 14:30',
    activity: 'ប្រជុំខ្លីប្រចាំថ្ងៃជាមួយក្រុមការងារបច្ចេកទេស និងជំនួយការបន្ទប់ពិសោធន៍ដើម្បើបែងចែកភារកិច្ច (Daily sync-up meeting with Tech/Lab assistants)',
    status: 'Completed',
    remarks: 'បានប្រគល់ភារកិច្ចសម្អាតសម្ភារៈពិសោធន៍ជីវវិទ្យា'
  },
  {
    id: 'hl-7',
    timeSlot: '14:30 - 15:30',
    activity: 'ធ្វើបច្ចុប្បន្នភាពបញ្ជីទ្រព្យសម្បត្តិថេររបស់សាលា និងផ្ទៀងផ្ទាត់លេខកូដបារកូដ (Update fixed asset ledger and verify new hardware tags)',
    status: 'In Progress',
    remarks: 'កំពុងវាយបញ្ចូលទិន្នន័យ Dell Pro Laptops ចំនួន ៥ គ្រឿងទើបនឹងទិញចូល'
  },
  {
    id: 'hl-8',
    timeSlot: '15:30 - 16:30',
    activity: 'តាមដានស្ថានភាពការងាររដ្ឋបាលទូទៅ និងពិនិត្យការបញ្ជូនសំណើផ្សេងៗតាមអ៊ីមែល (Follow up general admin tickets and review email responses)',
    status: 'Completed'
  },
  {
    id: 'hl-9',
    timeSlot: '16:30 - 17:30',
    activity: 'រៀបចំរបាយការណ៍រួមប្រចាំថ្ងៃ និងត្រួតពិនិត្យច្រកចេញ-ចូល ធានាសុវត្ថិភាពសិស្សពេលចេញពីសាលា (Construct overall daily report and monitor security dismissals)',
    status: 'Pending',
    remarks: 'ត្រៀមចាក់សោរបន្ទប់ការិយាល័យ និងបិទប្រព័ន្ធភ្លើងមុនត្រឡប់ទៅផ្ទះ'
  }
];

const INITIAL_REPORTS_MOCK: DailyReport[] = [
  {
    id: 'dr-1',
    date: '2026-06-10',
    checkInTime: '07:30',
    checkOutTime: '17:30',
    reporterName: 'LOUNG Veasna (Admin Supervisor)',
    overallSummary: 'ថ្ងៃនេះសកម្មភាពការងារទូទៅរបស់សាលាប្រព្រឹត្តទៅបានយ៉ាងរលូនល្អប្រសើរ។ ប្រព័ន្ធអគ្គិសនី និងទឹកមានស្ថិរភាព។ សន្តិសុខ និងអនាម័យត្រូវបានធានាខ្ពស់។ សំណុំឯកសារធានារ៉ាប់រង Forte ត្រូវបានត្រួតពិនិត្យរួចរាល់ ឯសម្ភារៈបន្ទប់រៀនត្រូវបានថែទាំជាប្រចាំ។',
    hourlyLogs: DEFAULT_HOURLY_LOGS_DEMO,
    createdAt: '2026-06-10T10:00:00.000Z'
  },
  {
    id: 'dr-2',
    date: '2026-06-09',
    checkInTime: '07:25',
    checkOutTime: '17:40',
    reporterName: 'LOUNG Veasna (Admin Supervisor)',
    overallSummary: 'ការងារបង្រួបបង្រួមឯកសាររដ្ឋបាល និងការតាមដានការប្រើប្រាស់អគ្គិសនីប្រចាំខែត្រូវបានបញ្ចប់។ បានសហការជាមួយក្រុមការងារអគ្គិសនីជួសជុលខ្សែភ្លើងនៅជាន់ទី៣។ សិស្សានុសិស្សទាំងអស់គោរពវិន័យសណ្តាប់ធ្នាប់បានល្អ។',
    hourlyLogs: [
      {
        id: 'hl-b1',
        timeSlot: '07:30 - 08:30',
        activity: 'ទទួលវត្តមានបុគ្គលិក និងរៀបចំផែនការការងារប្រចាំថ្ងៃ (Staff check-in & setup daily checklist)',
        status: 'Completed'
      },
      {
        id: 'hl-b2',
        timeSlot: '08:30 - 11:30',
        activity: 'ចុះពិនិត្យប្រព័ន្ធដកដង្ហើម និងម៉ាស៊ីនត្រជាក់ទូទាំងវិទ្យាល័យ (Full school AC & ventilation sanity checks)',
        status: 'Completed',
        remarks: 'បានសំអាតបរិក្ខារបន្ទប់កុំព្យូទ័រ'
      },
      {
        id: 'hl-b3',
        timeSlot: '13:30 - 15:30',
        activity: 'រៀបចំរបាយការណ៍ហិរញ្ញវត្ថុអំពីការចំណាយទឹកភ្លើងខែមុន (Draft water and electricity expense ledger calculations)',
        status: 'Completed',
        remarks: 'រក្សាទុកទិន្នន័យចូលប្រព័ន្ធ'
      },
      {
        id: 'hl-b4',
        timeSlot: '15:30 - 17:30',
        activity: 'សម្របសម្រួលជាមួយក្រុមសន្តិសុខក្នុងការបញ្ជូនសិស្សត្រឡប់ទៅផ្ទះ (Manage dismissal gate operations and secure premises)',
        status: 'Completed'
      }
    ],
    createdAt: '2026-06-09T10:05:00.000Z'
  }
];

export default function DailyReportManager() {
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

  // State managers
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);

  // Form Fields
  const [formDate, setFormDate] = useState('2026-06-10');
  const [formCheckIn, setFormCheckIn] = useState('07:30');
  const [formCheckOut, setFormCheckOut] = useState('17:30');
  const [formReporter, setFormReporter] = useState('LOUNG Veasna (Admin Supervisor)');
  const [formSummary, setFormSummary] = useState('');

  // Hourly list creator in Form
  const [formHourlyLogs, setFormHourlyLogs] = useState<HourlyLog[]>([]);

  // Individual hour log being added in form
  const [currentSlotPreset, setCurrentSlotPreset] = useState('07:30 - 08:30');
  const [currentSlotCustom, setCurrentSlotCustom] = useState('');
  const [isCustomSlot, setIsCustomSlot] = useState(false);
  const [currentActivity, setCurrentActivity] = useState('');
  const [currentStatus, setCurrentStatus] = useState<'Completed' | 'In Progress' | 'Pending' | 'Delayed'>('Completed');
  const [currentRemarks, setCurrentRemarks] = useState('');

  // Save reports to localStorage
  useEffect(() => {
    localStorage.setItem('wis_daily_reports', JSON.stringify(reports));
  }, [reports]);

  // Set today's date on initial load if not already set
  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().substring(0, 10);
    setFormDate(formatted);
  }, []);

  const handleOpenNewForm = () => {
    setEditingReport(null);
    const today = new Date().toISOString().substring(0, 10);
    setFormDate(today);
    setFormCheckIn('07:30');
    setFormCheckOut('17:30');
    setFormReporter('LOUNG Veasna (Admin Supervisor)');
    setFormSummary('');
    setFormHourlyLogs([...DEFAULT_HOURLY_LOGS_DEMO.map(l => ({ ...l, id: Math.random().toString() }))]);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (report: DailyReport) => {
    setEditingReport(report);
    setFormDate(report.date);
    setFormCheckIn(report.checkInTime);
    setFormCheckOut(report.checkOutTime);
    setFormReporter(report.reporterName);
    setFormSummary(report.overallSummary);
    setFormHourlyLogs([...report.hourlyLogs]);
    setIsFormOpen(true);
  };

  const handleAddHourlyLog = () => {
    if (!currentActivity.trim()) return;

    const timeSlot = isCustomSlot ? currentSlotCustom.trim() : currentSlotPreset;
    if (!timeSlot) return;

    const newLog: HourlyLog = {
      id: 'hl-' + Date.now() + Math.random().toString(36).substring(2, 5),
      timeSlot,
      activity: currentActivity.trim(),
      status: currentStatus,
      remarks: currentRemarks.trim() || undefined
    };

    setFormHourlyLogs([...formHourlyLogs, newLog]);
    setCurrentActivity('');
    setCurrentRemarks('');
    // Advance preset slot automatically for ease of entry
    const currentIndex = TIME_BLOCK_PRESETS.indexOf(timeSlot);
    if (currentIndex !== -1 && currentIndex < TIME_BLOCK_PRESETS.length - 1) {
      setCurrentSlotPreset(TIME_BLOCK_PRESETS[currentIndex + 1]);
    }
  };

  const handleRemoveHourlyLog = (id: string) => {
    setFormHourlyLogs(formHourlyLogs.filter(l => l.id !== id));
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();

    if (formHourlyLogs.length === 0) {
      alert('សូមបញ្ចូលការកត់ត្រាសកម្មភាពតាមម៉ោងយ៉ាងហោចណាស់ ១ ជួរ! (Please add at least 1 hourly log slot)');
      return;
    }

    const reportData: DailyReport = {
      id: editingReport ? editingReport.id : 'dr-' + Date.now(),
      date: formDate,
      checkInTime: formCheckIn,
      checkOutTime: formCheckOut,
      reporterName: formReporter,
      overallSummary: formSummary || 'គ្មានសេចក្តីសង្ខេបឡើយ។',
      hourlyLogs: formHourlyLogs,
      createdAt: editingReport ? editingReport.createdAt : new Date().toISOString()
    };

    if (editingReport) {
      setReports(reports.map(r => r.id === editingReport.id ? reportData : r));
    } else {
      // Check if duplicate date
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
    if (confirm('តើអ្នកពិតជាចង់លុបរបាយការណ៍ប្រចាំថ្ងៃនេះមែនទេ? (Are you sure you want to delete this daily report?)')) {
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
      r.reporterName.toLowerCase().includes(q) ||
      r.overallSummary.toLowerCase().includes(q) ||
      r.hourlyLogs.some(log => log.activity.toLowerCase().includes(q))
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending': return 'bg-amber-100 text-amber-850 border-amber-200';
      case 'Delayed': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusLabelKh = (status: string) => {
    switch (status) {
      case 'Completed': return '✅ រួចរាល់';
      case 'In Progress': return '⚡ កំពុងធ្វើ';
      case 'Pending': return '⏳ ត្រៀមធ្វើ';
      case 'Delayed': return '❌ ពន្យារពេល';
      default: return status;
    }
  };

  const calculateHours = (start: string, end: string) => {
    try {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      if (isNaN(sh) || isNaN(eh)) return 8;
      const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
      return Math.max(0, parseFloat((totalMinutes / 60).toFixed(1)));
    } catch {
      return 10;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden font-sans text-slate-800">
      
      {/* Visual Header Grid Accent */}
      <div className="bg-gradient-to-r from-[#073B3A] to-[#0d5c5a] p-6 text-white relative">
        <div className="absolute right-6 top-6 opacity-10 shrink-0">
          <ClipboardList className="w-24 h-24" />
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-400 hover:scale-105 transition rounded-2xl text-slate-900 shadow-lg">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] bg-teal-900/40 text-emerald-300 font-extrabold uppercase px-2.5 py-1 rounded-full border border-teal-800/50">
              SCHOOL OPERATIONS TRACKER
            </span>
            <h1 className="text-xl sm:text-2xl font-black mt-1 text-slate-100 font-moul">
              របាយការណ៍សកម្មភាពប្រចាំថ្ងៃ (Daily Activity Flow & Hour Logs)
            </h1>
            <p className="text-xs text-slate-200 mt-1 font-medium max-w-2xl">
              កត់ត្រា និងតាមដានរំហូរការងារយ៉ាងលម្អិត ចាប់តាំងពីម៉ោងចូលរហូតដល់ម៉ោងចេញ (Hour-by-hour activity documentation tracking check-ins and exit routines).
            </p>
          </div>
        </div>
      </div>

      {/* Screen Layout: Split List on left and detail/active view on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[600px] divide-y lg:divide-y-0 lg:divide-x divide-slate-150">
        
        {/* Left Column: List of saved reports (Cols: 4) */}
        <div className="lg:col-span-4 p-5 flex flex-col bg-slate-50/50">
          
          <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>បញ្ជីរបាយការណ៍រក្សាទុក ({filteredReports.length})</span>
            </h3>
            
            <button
              onClick={handleOpenNewForm}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-850 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>កត់ត្រាថ្មី</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative mb-4 shrink-0 shadow-2xs">
            <input
              type="text"
              placeholder="ស្វែងរកតាមកាលបរិច្ឆេទ ខ្លឹមសារ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-9.5 pr-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Historical List */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[500px] pr-1.5 scrollbar-thin">
            {filteredReports.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center text-slate-405 text-xs font-medium py-12">
                <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p>មិនមានរបាយការណ៍រកឃើញទេ</p>
                <p className="text-[10px] text-slate-400 mt-1">សូមបំពេញ ឬចុចប៊ូតុងខាងលើដើម្បីចាប់ផ្តើម</p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const totalHrs = calculateHours(report.checkInTime, report.checkOutTime);
                const taskCount = report.hourlyLogs.length;
                const doneCount = report.hourlyLogs.filter(l => l.status === 'Completed').length;
                const isSelected = selectedReport?.id === report.id;

                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer text-left relative ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-400 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
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
                          className="p-1 hover:bg-slate-100 hover:text-blue-600 rounded-md transition text-slate-450"
                          title="កែសម្រួល"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteReport(report.id, e)}
                          className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-md transition text-slate-400"
                          title="លុបចោល"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[10.5px] font-bold text-slate-450 mt-1 lines-clamp-1 italic">
                      👤 {report.reporterName}
                    </p>

                    <p className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                      {report.overallSummary}
                    </p>

                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-semibold font-mono">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{report.checkInTime} - {report.checkOutTime}</span>
                        <span className="text-indigo-650 bg-indigo-50 px-1 py-0.5 rounded">
                          ({totalHrs}h)
                        </span>
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                        {doneCount}/{taskCount} រួចរាល់
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1.5 w-1 h-8 bg-emerald-600 rounded-l" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Stats Helper */}
          <div className="mt-4 pt-4 border-t border-slate-200/60 text-[11px] text-slate-500 leading-relaxed font-medium bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100">
            💡 <b>ការណែនាំ៖</b> រាល់កំណត់ត្រានឹងត្រូវរក្សាទុកស្វ័យប្រវត្តក្នុងកម្មវិធីរុករក (Browser Index/Storage)។ អ្នកអាចបន្ថែមសកម្មភាពការងារលម្អិតតាមម៉ោងនីមួយៗបានយ៉ាងងាយស្រួល។
          </div>

        </div>

        {/* Right Column: Active presentation / Print preview / Editing Panel (Cols: 8) */}
        <div className="lg:col-span-8 p-6 flex flex-col justify-between">
          
          <AnimatePresence mode="wait">
            {!selectedReport ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center py-20 min-h-[450px]"
              >
                <div className="p-4 bg-slate-100 rounded-full text-slate-350 mb-3 animate-bounce" style={{ animationDuration: '3s' }}>
                  <ClipboardList className="w-12 h-12" />
                </div>
                <h4 className="text-sm font-black text-slate-700">សូមជ្រើសរើសរបាយការណ៍ប្រចាំថ្ងៃមួយ</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  ចុចលើបញ្ជីរបាយការណ៍ខាងឆ្វេង ដើម្បីមើលរំហូរការងារលម្អិតតាមម៉ោង ឬចុច "កត់ត្រាថ្មី" បង្កើតថ្មី។
                </p>
                <button
                  onClick={handleOpenNewForm}
                  className="mt-4 px-4.5 py-2.5 bg-[#073B3A] hover:bg-[#0c5352] text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition active:scale-95"
                >
                  📝 ចាប់ផ្តើមសរសេររបាយការណ៍ថ្មី
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={selectedReport.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left"
                id="printable-report-area"
              >
                {/* Print/Control Headers */}
                <div id="no-print-controls" className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-extrabold">
                    <span>សកម្មភាពរបាយការណ៍៖</span>
                    <span className="font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {selectedReport.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditForm(selectedReport)}
                      className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-750 font-black text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>កែសម្រួល (Edit)</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-650 text-white font-black text-xs rounded-xl flex items-center gap-1 transition cursor-pointer shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>បោះពុម្ព (Print)</span>
                    </button>
                  </div>
                </div>

                {/* Main Printable Layout */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-3xs relative overflow-hidden" id="report-sheet">
                  
                  {/* Watermark/Layout Brand for Print accuracy */}
                  <div className="absolute right-6 top-6 opacity-5 border-slate-800 select-none pointer-events-none">
                    <Clock className="w-36 h-36" />
                  </div>

                  {/* Header Letterhead */}
                  <div className="pb-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-base font-black text-[#073B3A] font-moul">
                        សាលាវេស្ទើនអន្តរជាតិ (Western International School)
                      </h2>
                      <p className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase mt-0.5">
                        Chamkar Doung Branch • School Administration Department
                      </p>
                    </div>
                    <div className="bg-slate-100/80 border border-slate-200 text-right px-4 py-2.5 rounded-2xl">
                      <p className="text-[10px] text-slate-550 font-black">កាលបរិច្ឆេទរបាយការណ៍ / REPORT DATE</p>
                      <p className="text-sm font-extrabold text-slate-800 font-mono mt-0.5">{selectedReport.date}</p>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-150 my-4">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-black">អ្នករាយការណ៍ / REPORTER</span>
                      <span className="text-xs font-black text-slate-800">{selectedReport.reporterName}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-black">ម៉ោងចូល / CHECK-IN TIME</span>
                      <span className="text-xs font-black text-emerald-700 font-mono flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{selectedReport.checkInTime} AM</span>
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-black">ម៉ោងចេញ / CHECK-OUT TIME</span>
                      <span className="text-xs font-black text-amber-700 font-mono flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{selectedReport.checkOutTime} PM</span>
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-black">សរុបម៉ោងបំពេញការងារ / HOURS</span>
                      <span className="text-xs font-black text-indigo-750 font-mono flex items-center gap-1 mt-0.5">
                        <span className="px-2 py-0.5 bg-indigo-100 rounded">
                          {calculateHours(selectedReport.checkInTime, selectedReport.checkOutTime)} ម៉ោង
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Executive Summary Section */}
                  <div className="mb-6">
                    <h3 className="text-xs font-black text-[#073B3A] border-b border-slate-150 pb-2 mb-2 flex items-center gap-1.5 uppercase">
                      <ClipboardList className="w-4 h-4 text-emerald-600" />
                      <span>សេចក្តីសង្ខេបសកម្មភាពរួមប្រចាំថ្ងៃ (Executive Summary of Today's Flow)</span>
                    </h3>
                    <p className="text-xs text-slate-650 font-bold leading-relaxed bg-amber-50/30 p-3.5 rounded-2xl border border-amber-900/10 whitespace-pre-line italic">
                      " {selectedReport.overallSummary} "
                    </p>
                  </div>

                  {/* Hourly Logs Timeline */}
                  <div>
                    <h3 className="text-xs font-black text-[#073B3A] border-b border-slate-150 pb-2 mb-4 flex items-center gap-1.5 uppercase">
                      <Activity className="w-4 h-4 text-indigo-600" />
                      <span>របាយការណ៍កត់ត្រាលម្អិតតាមម៉ោង (Detailed Hourly Activity Logs)</span>
                    </h3>

                    {/* Timeline representation */}
                    <div className="relative border-l-2 border-slate-150 pl-5.5 space-y-5 ml-2 pt-1 text-left">
                      {selectedReport.hourlyLogs.map((log, index) => (
                        <div key={log.id} className="relative">
                          {/* Circle dot on line */}
                          <div className={`absolute -left-8 top-1.5 w-3.5 h-3.5 rounded-full border bg-white flex items-center justify-center ${
                            log.status === 'Completed' ? 'border-emerald-500 scale-110' : 'border-slate-300'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              log.status === 'Completed' ? 'bg-emerald-600' : 'bg-slate-400'
                            }`} />
                          </div>

                          <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-200/80 hover:bg-slate-50 transition">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-1.5 mb-1.5">
                              <span className="text-[11px] font-extrabold text-indigo-750 font-mono tracking-wide flex items-center gap-1 bg-indigo-50/80 px-2 py-0.5 rounded-lg border border-indigo-100 w-fit">
                                <Clock className="w-3 h-3 text-indigo-500" />
                                <span>{log.timeSlot}</span>
                              </span>
                              
                              <span className={`text-[9px] font-black font-sans border px-2 py-0.5 rounded-full ${getStatusColor(log.status)}`}>
                                {getStatusLabelKh(log.status)}
                              </span>
                            </div>

                            <p className="text-[11.5px] font-black text-slate-700 leading-normal">
                              {log.activity}
                            </p>

                            {log.remarks && (
                              <p className="text-[10px] text-slate-500 font-bold mt-1.5 bg-white border border-slate-100 p-1.5 rounded-lg italic flex items-center gap-1">
                                <span>✍️ <b>កត់សម្គាល់៖</b> {log.remarks}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Signatures Area for school management audit */}
                  <div className="mt-12 pt-8 border-t border-dashed border-slate-350 grid grid-cols-2 gap-8 text-center text-xs">
                    <div>
                      <p className="font-extrabold text-slate-500">អ្នករៀបចំរបាយការណ៍ / Prepared By</p>
                      <div className="h-14 flex items-center justify-center font-mono text-xs text-slate-300 select-none italic">
                        (ហត្ថលេខា / Loung Veasna)
                      </div>
                      <p className="font-black text-[#073B3A]">{selectedReport.reporterName}</p>
                      <p className="text-[10px] text-slate-400">Admin Supervisor • Western International School</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-500">ការិយាល័យរដ្ឋបាលកណ្តាល / Verified By</p>
                      <div className="h-14 flex items-center justify-center font-mono text-xs text-slate-300 select-none italic">
                        (ការពិនិត្យ & យល់ព្រម)
                      </div>
                      <p className="font-black text-slate-700">___________________________</p>
                      <p className="text-[10px] text-slate-400">School Admin Director / Principal</p>
                    </div>
                  </div>

                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* Editing / Creating Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/70 z-[110] flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Header */}
              <div className="bg-[#073B3A] text-white p-4.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span className="text-sm font-black">
                    {editingReport ? 'កែសម្រួលរបាយការណ៍ប្រចាំថ្ងៃ (Edit Daily Report)' : 'បង្កើតរបាយការណ៍ប្រចាំថ្ងៃថ្មី (New Hourly Daily Log)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-teal-900/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Scrollable Body */}
              <form onSubmit={handleSaveReport} className="overflow-y-auto p-5 space-y-5 flex-1 scrollbar-thin text-left">
                
                {/* School Letterhead metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-slate-600 block">កាលបរិច្ឆេទ (Date) *</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-white border border-slate-250 p-2 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500 shadow-3xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-slate-600 block">ម៉ោងចូលរៀន/ការងារ (Check-In) *</label>
                    <input
                      type="time"
                      value={formCheckIn}
                      onChange={(e) => setFormCheckIn(e.target.value)}
                      className="w-full bg-white border border-slate-250 p-2 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500 font-mono shadow-3xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-slate-600 block">ម៉ោងចេញ/បញ្ចប់ (Check-Out) *</label>
                    <input
                      type="time"
                      value={formCheckOut}
                      onChange={(e) => setFormCheckOut(e.target.value)}
                      className="w-full bg-white border border-slate-250 p-2 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500 font-mono shadow-3xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-slate-600 block">ឈ្មោះអ្នករាយការណ៍ (Reporter) *</label>
                    <input
                      type="text"
                      value={formReporter}
                      onChange={(e) => setFormReporter(e.target.value)}
                      className="w-full bg-white border border-slate-250 p-2 rounded-xl text-xs font-black text-slate-705 outline-none focus:ring-1 focus:ring-emerald-500 shadow-3xs"
                      required
                    />
                  </div>
                </div>

                {/* Overall Summary Description */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 block">សេចក្តីសង្ខេបលទ្ធផលទូទៅប្រចាំថ្ងៃ (Overall Daily Executive Summary / Outcomes)</label>
                  <textarea
                    rows={2.5}
                    placeholder="ឧ. ថ្ងៃនេះសកម្មភាពការងារទូទៅរបស់សាលាប្រព្រឹត្តទៅបានយ៉ាងរលូន ល្អប្រសើរ សណ្តាប់ធ្នាប់ត្រូវបានរក្សានៅគ្រប់ជាន់..."
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-emerald-500 shadow-3xs"
                  />
                </div>

                {/* Hour-By-Hour Logs Creator section */}
                <div className="border-t border-slate-200/80 pt-4">
                  <h4 className="text-xs font-black text-[#073B3A] mb-3 flex items-center gap-1.5 uppercase">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>រៀបចំតារាងសកម្មភាពលម្អិតតាមម៉ោង (Hourly Flow Builder)</span>
                  </h4>

                  {/* Log input inline box */}
                  <div className="bg-indigo-50/50 border border-indigo-150 p-4 rounded-2xl mb-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      
                      {/* Time slot select preset or custom input */}
                      <div className="sm:col-span-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-indigo-900 block">ជ្រើសរើសម៉ោង (Time Slot)</label>
                          <button
                            type="button"
                            onClick={() => setIsCustomSlot(!isCustomSlot)}
                            className="text-[9.5px] font-black text-indigo-700 hover:underline cursor-pointer"
                          >
                            {isCustomSlot ? 'ប្រើម៉ោងស្តង់ដារ' : 'វាយម៉ោងដោយខ្លួនឯង'}
                          </button>
                        </div>
                        {isCustomSlot ? (
                          <input
                            type="text"
                            placeholder="ឧ. 07:30 - 08:30"
                            value={currentSlotCustom}
                            onChange={(e) => setCurrentSlotCustom(e.target.value)}
                            className="w-full bg-white border border-indigo-200 p-2 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 font-mono shadow-px"
                          />
                        ) : (
                          <select
                            value={currentSlotPreset}
                            onChange={(e) => setCurrentSlotPreset(e.target.value)}
                            className="w-full bg-white border border-indigo-200 p-2 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-px"
                          >
                            {TIME_BLOCK_PRESETS.map(preset => (
                              <option key={preset} value={preset}>{preset}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Status select */}
                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[10px] font-black text-indigo-900 block">ស្ថានភាពការងារ (Status)</label>
                        <select
                          value={currentStatus}
                          onChange={(e) => setCurrentStatus(e.target.value as any)}
                          className="w-full bg-white border border-indigo-200 p-2 rounded-xl text-xs font-black outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-px text-slate-700"
                        >
                          <option value="Completed">✅ រួចរាល់ (Completed)</option>
                          <option value="In Progress">⚡ កំពុងធ្វើ (In Progress)</option>
                          <option value="Pending">⏳ ត្រៀមធ្វើ (Pending)</option>
                          <option value="Delayed">❌ ពន្យារពេល (Delayed)</option>
                        </select>
                      </div>

                      {/* Add button */}
                      <div className="sm:col-span-5 text-right">
                        <button
                          type="button"
                          onClick={handleAddHourlyLog}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <Plus className="w-4 h-4" />
                          <span>បន្ថែមចូលក្នុងតារាង (Add Hour Slot)</span>
                        </button>
                      </div>

                    </div>

                    {/* Activity detail row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-indigo-900 block">ពិពណ៌នាការងារលម្អិតក្នុងម៉ោងនេះ (Activity Detail) *</label>
                        <input
                          type="text"
                          placeholder="ឧ. ដើរពិនិត្យវត្តមានបុគ្គលិកសន្តិសុខ និងកម្លាំងយាមល្បាតតាមច្រកទ្វារ..."
                          value={currentActivity}
                          onChange={(e) => setCurrentActivity(e.target.value)}
                          className="w-full bg-white border border-indigo-200 p-2.5 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-indigo-500 shadow-px"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-indigo-900 block">កំណត់សម្គាល់បន្ថែម (Hour Remarks) - ស្រេចចិត្ត</label>
                        <input
                          type="text"
                          placeholder="ឧ. រកឃើញកាមេរ៉ាបិទជិត ១គ្រាប់, បញ្ជូនឯកសាររួចរាល់..."
                          value={currentRemarks}
                          onChange={(e) => setCurrentRemarks(e.target.value)}
                          className="w-full bg-white border border-indigo-200 p-2.5 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-indigo-500 shadow-px"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live list of Hourly log lines inside Form */}
                  <div className="space-y-2 max-h-[220px] overflow-y-auto border border-slate-200 p-2.5 rounded-2xl bg-slate-50/50">
                    <p className="text-[10px] text-slate-450 font-black mb-1 px-1 flex justify-between">
                      <span>បញ្ជីការងាររៀបចំដោយម៉ោង ({formHourlyLogs.length} ជួរ)</span>
                      <span className="text-rose-600 font-medium">ចុចលើរូបសម្រាមដើម្បីលុបចេញ</span>
                    </p>
                    
                    {formHourlyLogs.length === 0 ? (
                      <div className="bg-white border rounded-xl py-6 text-center text-slate-400 text-xs font-medium italic">
                        មិនទាន់មានលំហូរម៉ោងណាមួយត្រូវបានបន្ថែមនៅឡើយទេ! សូមបំពេញទិន្នន័យបន្ថែមខាងលើ។
                      </div>
                    ) : (
                      formHourlyLogs.map((log, index) => (
                        <div key={log.id} className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs text-left shadow-3xs">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-indigo-750 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">
                                {log.timeSlot}
                              </span>
                              <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full ${getStatusColor(log.status)}`}>
                                {getStatusLabelKh(log.status)}
                              </span>
                            </div>
                            <p className="font-bold text-slate-700 mt-1 leading-normal truncate">
                              {log.activity}
                            </p>
                            {log.remarks && (
                              <p className="text-[9.5px] font-medium text-slate-500 mt-0.5 italic">
                                ✍️ កំណត់សម្គាល់៖ {log.remarks}
                              </p>
                            )}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleRemoveHourlyLog(log.id)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                            title="លុបចោលជួរនេះ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Control Footer */}
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
                    <span>រក្សាទុករួចរាល់ (Save Log)</span>
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
