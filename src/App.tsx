/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import { translations, Language } from './lib/translations';
import DashboardStats from './components/DashboardStats';
import StaffManager from './components/StaffManager';
import StudentManager from './components/StudentManager';
import AttendanceTracker from './components/AttendanceTracker';
import ElectricityTracker from './components/ElectricityTracker';
import WaterTracker from './components/WaterTracker';
import TelegramReporter from './components/TelegramReporter';
import FixedAssetManager from './components/FixedAssetManager';
import StudentInsuranceManager from './components/StudentInsuranceManager';
import AdminDocumentationManager from './components/AdminDocumentationManager';
import OtherLinksManager from './components/OtherLinksManager';
import KhmerCalendarManager from './components/KhmerCalendarManager';
import CctvManager from './components/CctvManager';
import ClassroomEquipmentManager from './components/ClassroomEquipmentManager';
import RemoteScannerMobile from './components/RemoteScannerMobile';
import DailyReportManager from './components/DailyReportManager';
import StudentStatistics from './components/StudentStatistics';
import WesternSchoolInfo from './components/WesternSchoolInfo';

import { Staff, AttendanceRecord, ElectricityRecord, WaterRecord, Student } from './types';
import { DEFAULT_STAFF } from './data/defaultStaff';
import { DEFAULT_STUDENTS } from './data/defaultStudents';
import { 
  Building, LayoutDashboard, Users, UserCheck, 
  HelpCircle, Sparkles, LogOut, CheckCircle, Smartphone, Zap, Droplet, Send, Map, HardDrive, ShieldCheck, Wind, FolderOpen, School, Layers, Coffee, Link2, Calendar, GraduationCap, Video, Clock, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Default initial entries for water analysis comparison demonstration
const DEFAULT_WATER: WaterRecord[] = [
  {
    id: 'wat_1',
    monthYear: '2026-01',
    costBeforeUsd: 150,
    costAfterUsd: 140,
    differenceUsd: -10,
    differencePercent: -6.67,
    recordedAt: '2026-01-31T17:00:00.000Z',
    recordedBy: 'LOUNG Veasna',
    notes: 'ការគ្រប់គ្រងបរិមាណទឹកប្រើប្រាស់បានល្អដើមឆ្នាំ'
  },
  {
    id: 'wat_2',
    monthYear: '2026-02',
    costBeforeUsd: 140,
    costAfterUsd: 165,
    differenceUsd: 25,
    differencePercent: 17.86,
    recordedAt: '2026-02-28T17:00:00.000Z',
    recordedBy: 'LOUNG Veasna',
    notes: 'កើនឡើងដោយសារការលាងសម្អាតអាងទឹកសាលា'
  },
  {
    id: 'wat_3',
    monthYear: '2026-03',
    costBeforeUsd: 165,
    costAfterUsd: 150,
    differenceUsd: -15,
    differencePercent: -9.09,
    recordedAt: '2026-03-31T17:00:00.000Z',
    recordedBy: 'LOUNG Veasna',
    notes: 'ត្រួតពិនិត្យការលេចធ្លាយ និងកាត់បន្ថយការបង្ហូរចោល'
  }
];

// Default initial entries for electricity analysis comparison demonstration
const DEFAULT_ELECTRICITY: ElectricityRecord[] = [
  {
    id: 'ele_1',
    monthYear: '2026-01',
    costBeforeUsd: 500,
    costAfterUsd: 480,
    differenceUsd: -20,
    differencePercent: -4,
    recordedAt: '2026-01-31T17:00:00.000Z',
    recordedBy: 'LOUNG Veasna',
    notes: 'ទូទាត់សម្រាប់សន្សំសំចៃការស្នាក់នៅដើមឆ្នាំ ២០២៦'
  },
  {
    id: 'ele_2',
    monthYear: '2026-02',
    costBeforeUsd: 480,
    costAfterUsd: 530,
    differenceUsd: 50,
    differencePercent: 10.42,
    recordedAt: '2026-02-28T17:00:00.000Z',
    recordedBy: 'LOUNG Veasna',
    notes: 'កើនឡើងដោយសារការបើកប្រព័ន្ធម៉ាស៊ីនត្រជាក់បន្ថែម'
  },
  {
    id: 'ele_3',
    monthYear: '2026-03',
    costBeforeUsd: 530,
    costAfterUsd: 490,
    differenceUsd: -40,
    differencePercent: -7.55,
    recordedAt: '2026-03-31T17:00:00.000Z',
    recordedBy: 'LOUNG Veasna',
    notes: 'សន្សំសំចៃល្អដោយគម្រោងបិទភ្លើងពេលមិនប្រើប្រាស់'
  },
  {
    id: 'ele_4',
    monthYear: '2026-04',
    costBeforeUsd: 490,
    costAfterUsd: 450,
    differenceUsd: -40,
    differencePercent: -8.16,
    recordedAt: '2026-04-30T17:00:00.000Z',
    recordedBy: 'LOUNG Veasna',
    notes: 'កាត់បន្ថយការប្រើប្រាស់បន្ថែមតាមការណែនាំថ្មី'
  }
];

export default function App() {
  // Language switcher state (loaded from or saved to localStorage)
  const [lang, setLang] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem('wis_lang');
      return (savedLang === 'en' || savedLang === 'kh') ? savedLang : 'kh';
    } catch {
      return 'kh';
    }
  });

  const t = translations[lang];

  // Tab Selection State
  const [activeTab, setActiveTab ] = useState<'dashboard' | 'electricity' | 'water' | 'fixedassets' | 'insurance' | 'admindocs' | 'otherlinks' | 'staff' | 'students' | 'studentstatistics' | 'schoolinfo' | 'attendance' | 'telegram' | 'khmercalendar' | 'cctv' | 'classroomequipment' | 'dailyreport'>('dashboard');
  const [pendingReportDate, setPendingReportDate] = useState<string | null>(null);

  // Intercept Remote Scanner URL parameter on mobile devices
  const [remoteScanChannel, setRemoteScanChannel] = useState<string | null>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get('remote_scan');
    } catch {
      return null;
    }
  });

  // Save language to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('wis_lang', lang);
    } catch (e) {
      console.error(e);
    }
  }, [lang]);

  const workspaceScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when tab changes to ensure Header is always visible immediately
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (workspaceScrollRef.current) {
      workspaceScrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Key Global states representing the workspace data - Hydrated immediately from pre-populated localStorage
  const [staffList, setStaffList] = useState<Staff[]>(() => {
    try {
      const saved = localStorage.getItem('wis_staff_list');
      return saved ? JSON.parse(saved) : DEFAULT_STAFF;
    } catch {
      return DEFAULT_STAFF;
    }
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('wis_attendance_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [electricityRecords, setElectricityRecords] = useState<ElectricityRecord[]>(() => {
    try {
      const saved = localStorage.getItem('wis_electricity_records');
      return saved ? JSON.parse(saved) : DEFAULT_ELECTRICITY;
    } catch {
      return DEFAULT_ELECTRICITY;
    }
  });

  const [waterRecords, setWaterRecords] = useState<WaterRecord[]>(() => {
    try {
      const saved = localStorage.getItem('wis_water_records');
      return saved ? JSON.parse(saved) : DEFAULT_WATER;
    } catch {
      return DEFAULT_WATER;
    }
  });

  const [studentList, setStudentList] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('wis_student_list');
      return saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
    } catch {
      return DEFAULT_STUDENTS;
    }
  });

  // Selected audit date
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Save changes to localStorage immediately on updates
  useEffect(() => {
    if (staffList.length > 0) {
      try {
        localStorage.setItem('wis_staff_list', JSON.stringify(staffList));
      } catch (err) {
        console.error('[WIS Sync] Local storage quota limit or write disallowed:', err);
      }
    }
  }, [staffList]);

  useEffect(() => {
    if (studentList.length > 0) {
      try {
        localStorage.setItem('wis_student_list', JSON.stringify(studentList));
      } catch (err) {
        console.error('[WIS Sync] Local storage quota limit or write disallowed:', err);
      }
    }
  }, [studentList]);

  useEffect(() => {
    try {
      localStorage.setItem('wis_attendance_records', JSON.stringify(attendanceRecords));
    } catch (err) {
      console.error('[WIS Sync] Local storage write disallowed:', err);
    }
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('wis_electricity_records', JSON.stringify(electricityRecords));
    } catch (err) {
      console.error('[WIS Sync] Local storage write disallowed:', err);
    }
  }, [electricityRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('wis_water_records', JSON.stringify(waterRecords));
    } catch (err) {
      console.error('[WIS Sync] Local storage write disallowed:', err);
    }
  }, [waterRecords]);

  // Quick statistics for Header
  const todayAttendance = attendanceRecords.filter(r => r.date === selectedDate);
  const totalPresentToday = todayAttendance.filter(r => r.status === 'Present').length;

  // Bypass to Mobile QR Camera Scanner client
  if (remoteScanChannel) {
    return (
      <RemoteScannerMobile 
        staffList={staffList} 
        channelId={remoteScanChannel} 
        onExit={() => {
          try {
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch {}
          setRemoteScanChannel(null);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen md:h-screen text-slate-800 flex flex-col md:flex-row font-sans selection:bg-amber-100 selection:text-slate-900 relative md:overflow-hidden bg-slate-50">
      
      {/* Left Navigation Sidebar (System Menu) - Relocated to viewport left corner */}
      <aside className="w-full md:w-[270px] lg:w-[290px] shrink-0 bg-[#073B3A]/95 backdrop-blur-md border-b md:border-b-0 md:border-r border-[#052c2b]/60 p-4 lg:p-6 md:sticky md:top-0 md:h-screen flex flex-col gap-2 z-30 overflow-y-auto font-sans shadow-sm relative text-emerald-100">
        <div className="px-3 py-1.5 border-b border-[#0d5c5a]/40 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
            {t.systemMenu}
          </span>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </div>

        {/* Modern Interactive Language Toggler */}
        <div className="mx-1 my-1 px-3 py-2 bg-[#052c2b]/50 rounded-xl border border-[#0d5c5a]/20 flex items-center justify-between">
          <span className="text-[10px] font-bold text-emerald-200/95 uppercase tracking-wider flex items-center gap-1.5">
            <span>{t.langLabel}</span>
          </span>
          <div className="flex bg-[#04201f] p-0.5 rounded-lg border border-emerald-800/15">
            <button
              onClick={() => setLang('kh')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md shadow-xs transition-all duration-200 cursor-pointer ${
                lang === 'kh'
                  ? 'bg-amber-400 text-slate-900 font-extrabold'
                  : 'text-emerald-300/80 hover:text-white hover:bg-emerald-900/30'
              }`}
            >
              KH
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md shadow-xs transition-all duration-200 cursor-pointer ${
                lang === 'en'
                  ? 'bg-amber-400 text-slate-900 font-extrabold'
                  : 'text-emerald-300/80 hover:text-white hover:bg-emerald-900/30'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 mt-2">
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5 text-amber-305" />
            <span>{t.dashboard}</span>
          </button>

          {/* Tab 1.5: Electricity Analysis */}
          <button
            onClick={() => setActiveTab('electricity')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'electricity'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <Zap className="w-4.5 h-4.5 text-amber-400 fill-amber-400/15" />
            <span className="flex-1">{t.electricity}</span>
          </button>

          {/* Tab 1.6: Water Analysis */}
          <button
            onClick={() => setActiveTab('water')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'water'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <Droplet className="w-4.5 h-4.5 text-sky-400 fill-sky-500/15" />
            <span className="flex-1">{t.water}</span>
          </button>

          {/* Tab 1.75: Khmer Calendar */}
          <button
            onClick={() => setActiveTab('khmercalendar')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'khmercalendar'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <Calendar className="w-4.5 h-4.5 text-rose-405" />
            <span className="flex-1">{t.khmercalendar}</span>
          </button>

          {/* Tab 1.8: Fixed Asset Manager */}
          <button
            onClick={() => setActiveTab('fixedassets')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'fixedassets'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <HardDrive className="w-4.5 h-4.5 text-emerald-400 fill-emerald-500/15" />
            <span className="flex-1">{t.fixedassets}</span>
          </button>

          {/* Tab 1.9: Student Insurance */}
          <button
            onClick={() => setActiveTab('insurance')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'insurance'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 fill-emerald-500/15" />
            <span className="flex-1">{t.insurance}</span>
          </button>

          {/* Tab 1.10: CCTV Management */}
          <button
            onClick={() => setActiveTab('cctv')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'cctv'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <Video className="w-4.5 h-4.5 text-emerald-400" />
            <span className="flex-1">{t.cctv}</span>
          </button>

          {/* Tab 1.11: Classroom Equipment Management */}
          <button
            onClick={() => setActiveTab('classroomequipment')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'classroomequipment'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <School className="w-4.5 h-4.5 text-emerald-400" />
            <span className="flex-1">{t.classroomequipment}</span>
          </button>

          {/* Tab 1.115: Daily Report */}
          <button
            onClick={() => setActiveTab('dailyreport')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'dailyreport'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <Clock className="w-4.5 h-4.5 text-emerald-400" />
            <span className="flex-1">{t.dailyReport}</span>
          </button>




          {/* Tab 1.12: Admin Documentation */}
          <button
            onClick={() => setActiveTab('admindocs')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'admindocs'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <FolderOpen className="w-4.5 h-4.5 text-emerald-400 animate-bounce" />
            <span className="flex-1">{t.admindocs}</span>
          </button>

          {/* Tab 1.14: Other Web Links (Other) */}
          <button
            onClick={() => setActiveTab('otherlinks')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'otherlinks'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <Link2 className="w-4.5 h-4.5 text-emerald-400" />
            <span className="flex-1">{t.otherlinks}</span>
          </button>

          {/* Separator */}
          <div className="h-px bg-[#0d5c5a]/40 my-2" />

          {/* Tab 2: Staff setups */}
          <button
            onClick={() => setActiveTab('staff')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <Users className="w-4.5 h-4.5 text-slate-100" />
            <span>{t.staff}</span>
          </button>

          {/* Tab 2.5: Student setups */}
          <button
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <GraduationCap className="w-4.5 h-4.5 text-slate-100" />
            <span>{t.students}</span>
          </button>

          {/* Tab 2.6: Student Statistics */}
          <button
            onClick={() => setActiveTab('studentstatistics')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'studentstatistics'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <BarChart2 className="w-4.5 h-4.5 text-slate-100" />
            <span>{t.studentStatistics}</span>
          </button>

          {/* Tab 2.7: Western School Info */}
          <button
            onClick={() => setActiveTab('schoolinfo')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'schoolinfo'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <Building className="w-4.5 h-4.5 text-slate-100" />
            <span>{t.schoolInfo}</span>
          </button>

          {/* Tab 3: Attendance registration */}
          <button
            onClick={() => setActiveTab('attendance')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <UserCheck className="w-4.5 h-4.5 text-slate-100" />
            <span>{t.attendance}</span>
          </button>

          {/* Tab 4: Telegram forwarding */}
          <button
            onClick={() => setActiveTab('telegram')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'telegram'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <Send className="w-4.5 h-4.5 text-slate-100" />
            <span>{t.telegram}</span>
          </button>
        </nav>
      </aside>

          {/* Right Column Layout containing the Top info strip, Brand Header, and active workspace views */}
          <div className="flex-1 flex flex-col min-w-0 pb-12 relative z-10 font-sans">
            
            {/* Upper color accents block */}
            <div className="bg-slate-900 text-slate-400 py-1 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                <span>{t.topStrip}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-bold tracking-widest hidden sm:block uppercase font-mono">
                {t.versionLabel}
              </div>
            </div>

            {/* Header Area - Completely frozen/sticky on desktop, only visible on Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="max-w-full w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-6 shrink-0 z-10">
                <Header totalStaff={staffList.length} totalPresentToday={totalPresentToday} lang={lang} />
              </div>
            )}

            {/* Scrollable Work Area containing active dynamic views and the brand footer */}
            <div 
              ref={workspaceScrollRef}
              className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 lg:px-8 xl:px-12 mt-2 flex flex-col pr-1 relative z-10"
            >
              <main className="min-w-0 w-full flex-grow">
                <div className="w-full">
              {activeTab === 'dashboard' && (
                <DashboardStats 
                  staffList={staffList} 
                  attendanceRecords={attendanceRecords}
                  selectedDate={selectedDate}
                  electricityRecords={electricityRecords}
                  waterRecords={waterRecords}
                />
              )}

              {activeTab === 'electricity' && (
                <ElectricityTracker 
                  electricityRecords={electricityRecords}
                  setElectricityRecords={setElectricityRecords}
                />
              )}

              {activeTab === 'water' && (
                <WaterTracker 
                  waterRecords={waterRecords}
                  setWaterRecords={setWaterRecords}
                />
              )}

              {activeTab === 'khmercalendar' && (
                <KhmerCalendarManager 
                  onNavigateToDailyReport={(date) => {
                    setPendingReportDate(date);
                    setActiveTab('dailyreport');
                  }}
                />
              )}

              {activeTab === 'fixedassets' && (
                <FixedAssetManager />
              )}

              {activeTab === 'insurance' && (
                <StudentInsuranceManager />
              )}

              {activeTab === 'admindocs' && (
                <AdminDocumentationManager />
              )}

              {activeTab === 'otherlinks' && (
                <OtherLinksManager />
              )}

              {activeTab === 'staff' && (
                <StaffManager 
                  staffList={staffList} 
                  setStaffList={setStaffList} 
                />
              )}

              {activeTab === 'students' && (
                <StudentManager 
                  studentList={studentList} 
                  setStudentList={setStudentList} 
                  lang={lang}
                />
              )}

              {activeTab === 'studentstatistics' && (
                <StudentStatistics />
              )}

              {activeTab === 'schoolinfo' && (
                <WesternSchoolInfo />
              )}

              {activeTab === 'attendance' && (
                <AttendanceTracker 
                  staffList={staffList}
                  attendanceRecords={attendanceRecords}
                  setAttendanceRecords={setAttendanceRecords}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              )}

              {activeTab === 'telegram' && (
                <TelegramReporter 
                  staffList={staffList}
                  attendanceRecords={attendanceRecords}
                  selectedDate={selectedDate}
                  electricityRecords={electricityRecords}
                  waterRecords={waterRecords}
                />
              )}

              {activeTab === 'cctv' && (
                <CctvManager />
              )}

              {activeTab === 'classroomequipment' && (
                <ClassroomEquipmentManager />
              )}

              {activeTab === 'dailyreport' && (
                <DailyReportManager 
                  initialDate={pendingReportDate}
                  onClearInitialDate={() => setPendingReportDate(null)}
                />
              )}
            </div>
          </main>

          {/* Footer Branding credits */}
          <footer className="mt-16 text-center border-t border-slate-200 pt-8 max-w-full mx-auto w-full px-6 xl:px-12 flex flex-col md:flex-row md:items-center md:justify-between text-xs text-slate-400 font-semibold gap-4 pb-12 font-sans">
            <div>
              © {new Date().getFullYear()} {lang === 'en' ? 'Western International School' : 'សាលាវេស្ទើនអន្តរជាតិ'}. {t.footerCopyright}
            </div>
            <div className="flex items-center justify-center gap-4 text-slate-500 font-medium">
              <span>{t.footerMotto}</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold hover:underline cursor-pointer">{t.footerSystem}</span>
            </div>
          </footer>

        </div>

      </div>

    </div>
  );
}
