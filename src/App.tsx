/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import DashboardStats from './components/DashboardStats';
import StaffManager from './components/StaffManager';
import AttendanceTracker from './components/AttendanceTracker';
import ElectricityTracker from './components/ElectricityTracker';
import WaterTracker from './components/WaterTracker';
import TelegramReporter from './components/TelegramReporter';
import SchoolMap from './components/SchoolMap';
import FixedAssetManager from './components/FixedAssetManager';
import StudentInsuranceManager from './components/StudentInsuranceManager';
import FireExtinguisherInspectionManager from './components/FireExtinguisherInspectionManager';
import AdminDocumentationManager from './components/AdminDocumentationManager';
import OtherAssetsManager from './components/OtherAssetsManager';
import CanteenAttendanceManager from './components/CanteenAttendanceManager';
import OtherLinksManager from './components/OtherLinksManager';
import KhmerCalendarManager from './components/KhmerCalendarManager';
// @ts-ignore
import schoolWp from './assets/images/school_wp_1780900876524.png';

import { Staff, AttendanceRecord, ElectricityRecord, WaterRecord } from './types';
import { DEFAULT_STAFF } from './data/defaultStaff';
import { 
  Building, LayoutDashboard, Users, UserCheck, 
  HelpCircle, Sparkles, LogOut, CheckCircle, Smartphone, Zap, Droplet, Send, Map, HardDrive, ShieldCheck, Flame, Wind, FolderOpen, School, Layers, Coffee, Link2, Calendar
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
  // Tab Selection State
  const [activeTab, setActiveTab ] = useState<'dashboard' | 'electricity' | 'water' | 'schoolmap' | 'fixedassets' | 'otherassets' | 'insurance' | 'fireextinguisher' | 'admindocs' | 'canteen_attendance' | 'otherlinks' | 'staff' | 'attendance' | 'telegram' | 'khmercalendar'>('dashboard');

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

  // Selected audit date
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Save changes to localStorage immediately on updates
  useEffect(() => {
    if (staffList.length > 0) {
      localStorage.setItem('wis_staff_list', JSON.stringify(staffList));
    }
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('wis_attendance_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('wis_electricity_records', JSON.stringify(electricityRecords));
  }, [electricityRecords]);

  useEffect(() => {
    localStorage.setItem('wis_water_records', JSON.stringify(waterRecords));
  }, [waterRecords]);

  // Quick statistics for Header
  const todayAttendance = attendanceRecords.filter(r => r.date === selectedDate);
  const totalPresentToday = todayAttendance.filter(r => r.status === 'Present').length;

  return (
    <div className="min-h-screen md:h-screen text-slate-800 flex flex-col md:flex-row font-sans selection:bg-amber-100 selection:text-slate-900 relative md:overflow-hidden">
      {/* Perfect static full-viewport background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{ backgroundImage: `url(${schoolWp})` }}
      />
      {/* Perfect contrast blur overlay to keep content highly readable */}
      <div className="fixed inset-0 bg-slate-50/85 backdrop-blur-[4px] pointer-events-none z-0" />
      
      {/* Left Navigation Sidebar (System Menu) - Relocated to viewport left corner */}
      <aside className="w-full md:w-[270px] lg:w-[290px] shrink-0 bg-white/90 backdrop-blur-md border-b md:border-b-0 md:border-r border-slate-200 p-4 lg:p-6 md:sticky md:top-0 md:h-screen flex flex-col gap-2 z-30 overflow-y-auto font-nitean shadow-sm relative">
        <div className="px-3 py-1.5 border-b border-slate-200/70 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            បញ្ជីគ្រប់គ្រងសាលា (System Menu)
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

            <nav className="flex flex-col gap-1.5 mt-2">
              {/* Tab 1: Dashboard */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                }`}
              >
                <LayoutDashboard className="w-4.5 h-4.5" />
                <span>ផ្ទាំងគ្រប់គ្រង (Dashboard)</span>
              </button>

              {/* Tab 1.5: Electricity Analysis */}
              <button
                onClick={() => setActiveTab('electricity')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-colors ${
                  activeTab === 'electricity'
                    ? 'bg-slate-900 text-amber-400 shadow-md shadow-slate-900/10'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70'
                }`}
              >
                <Zap className="w-4.5 h-4.5 text-amber-500 fill-amber-500/15" />
                <span className="flex-1">ការប្រើប្រាស់អគ្គិសនី (Electricity)</span>
              </button>

              {/* Tab 1.6: Water Analysis */}
              <button
                onClick={() => setActiveTab('water')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-colors ${
                  activeTab === 'water'
                    ? 'bg-slate-900 text-sky-400 shadow-md shadow-slate-900/10'
                    : 'text-slate-700 hover:text-slate-955 hover:bg-slate-100/70'
                }`}
              >
                <Droplet className="w-4.5 h-4.5 text-sky-500 fill-sky-500/15" />
                <span className="flex-1">ការប្រើប្រាស់ទឹក (Water Supply)</span>
              </button>

              {/* Tab 1.7: School Map Viewer */}
              <button
                onClick={() => setActiveTab('schoolmap')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-colors ${
                  activeTab === 'schoolmap'
                    ? 'bg-slate-900 text-teal-400 shadow-md shadow-slate-900/10'
                    : 'text-slate-700 hover:text-slate-955 hover:bg-slate-100/70'
                }`}
              >
                <Map className="w-4.5 h-4.5 text-teal-505" />
                <span className="flex-1">ប្លង់សាលារៀន (School Map)</span>
              </button>

              {/* Tab 1.75: Khmer Calendar */}
              <button
                onClick={() => setActiveTab('khmercalendar')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-colors ${
                  activeTab === 'khmercalendar'
                    ? 'bg-slate-900 text-rose-400 shadow-md shadow-slate-900/10'
                    : 'text-slate-700 hover:text-slate-955 hover:bg-slate-100/70'
                }`}
              >
                <Calendar className="w-4.5 h-4.5 text-rose-500" />
                <span className="flex-1">ប្រតិទិនខ្មែរ (Khmer Calendar)</span>
              </button>

              {/* Tab 1.8: Fixed Asset Manager */}
              <button
                onClick={() => setActiveTab('fixedassets')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-colors ${
                  activeTab === 'fixedassets'
                    ? 'bg-slate-900 text-emerald-400 shadow-md shadow-slate-900/10'
                    : 'text-slate-700 hover:text-slate-955 hover:bg-slate-100/70'
                }`}
              >
                <HardDrive className="w-4.5 h-4.5 text-emerald-500 fill-emerald-500/15" />
                <span className="flex-1">បញ្ជីទ្រព្យសម្បត្តិ (Fixed Asset)</span>
              </button>

              {/* Tab 1.85: Other Classroom & Specialty Room Material & Assets */}
              <button
                onClick={() => setActiveTab('otherassets')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-colors ${
                  activeTab === 'otherassets'
                    ? 'bg-slate-900 text-indigo-400 shadow-md shadow-slate-900/10'
                    : 'text-slate-700 hover:text-slate-955 hover:bg-slate-100/70'
                }`}
              >
                <School className="w-4.5 h-4.5 text-indigo-500 fill-indigo-500/15" />
                <span className="flex-1">សម្ភារៈបន្ទប់រៀន</span>
              </button>

              {/* Tab 1.9: Student Insurance */}
              <button
                onClick={() => setActiveTab('insurance')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-colors ${
                  activeTab === 'insurance'
                    ? 'bg-slate-900 text-indigo-400 shadow-md shadow-slate-900/10'
                    : 'text-slate-700 hover:text-slate-955 hover:bg-slate-100/70'
                }`}
              >
                <ShieldCheck className="w-4.5 h-4.5 text-indigo-550 fill-indigo-500/15" />
                <span className="flex-1">ធានារ៉ាប់រងសិស្ស (Student Insurance)</span>
              </button>

              {/* Tab 1.10: Fire Extinguisher Inspection */}
              <button
                onClick={() => setActiveTab('fireextinguisher')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-colors ${
                  activeTab === 'fireextinguisher'
                    ? 'bg-slate-900 text-rose-500 shadow-md shadow-slate-900/10'
                    : 'text-slate-700 hover:text-slate-955 hover:bg-slate-100/70'
                }`}
              >
                <Flame className="w-4.5 h-4.5 text-rose-550 fill-rose-505/15 animate-pulse" />
                <span className="flex-1">បំពង់ពន្លត់អគ្គិភ័យ (Fire Extinguishers)</span>
              </button>

              {/* Tab 1.12: Admin Documentation */}
              <button
                onClick={() => setActiveTab('admindocs')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-colors ${
                  activeTab === 'admindocs'
                    ? 'bg-slate-900 text-cyan-400 shadow-md shadow-slate-900/10'
                    : 'text-slate-700 hover:text-slate-955 hover:bg-slate-100/70'
                }`}
              >
                <FolderOpen className="w-4.5 h-4.5 text-indigo-500 animate-bounce" />
                <span className="flex-1">ឯកសារគ្រប់គ្រងរដ្ឋបាល (Admin Docs)</span>
              </button>

              {/* Tab 1.13: Canteen Attendance */}
              <button
                onClick={() => setActiveTab('canteen_attendance')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-colors ${
                  activeTab === 'canteen_attendance'
                    ? 'bg-slate-900 text-teal-400 shadow-md shadow-slate-900/10'
                    : 'text-slate-700 hover:text-slate-955 hover:bg-slate-100/70'
                }`}
              >
                <Coffee className="w-4.5 h-4.5 text-teal-500" />
                <span className="flex-1">វត្តមានសិស្សអាហារដ្ឋាន (Canteen)</span>
              </button>

              {/* Tab 1.14: Other Web Links (Other) */}
              <button
                onClick={() => setActiveTab('otherlinks')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-colors ${
                  activeTab === 'otherlinks'
                    ? 'bg-slate-900 text-indigo-400 shadow-md shadow-slate-900/10'
                    : 'text-slate-700 hover:text-slate-955 hover:bg-slate-100/70'
                }`}
              >
                <Link2 className="w-4.5 h-4.5 text-indigo-500" />
                <span className="flex-1">តំណភ្ជាប់ផ្សេងៗ (Other Web Links)</span>
              </button>

              {/* Separator */}
              <div className="h-px bg-slate-200/80 my-2" />

              {/* Tab 2: Staff setups */}
              <button
                onClick={() => setActiveTab('staff')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-colors ${
                  activeTab === 'staff'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-700 hover:text-slate-955 hover:bg-slate-100/70'
                }`}
              >
                <Users className="w-4.5 h-4.5" />
                <span>គ្រប់គ្រងបុគ្គលិក (Staff Manager)</span>
              </button>

              {/* Tab 3: Attendance registration */}
              <button
                onClick={() => setActiveTab('attendance')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-colors ${
                  activeTab === 'attendance'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-700 hover:text-slate-955 hover:bg-slate-100/70'
                }`}
              >
                <UserCheck className="w-4.5 h-4.5" />
                <span>ស្រង់វត្តមានប្រចាំថ្ងៃ (Daily Attendance)</span>
              </button>

              {/* Tab 4: Telegram forwarding */}
              <button
                onClick={() => setActiveTab('telegram')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-colors ${
                  activeTab === 'telegram'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-700 hover:text-slate-955 hover:bg-slate-100/70'
                }`}
              >
                <Send className="w-4.5 h-4.5" />
                <span>បញ្ជូនទៅ Telegram (Telegram Bot)</span>
              </button>
            </nav>
          </aside>

          {/* Right Column Layout containing the Top info strip, Brand Header, and active workspace views */}
          <div className="flex-1 flex flex-col min-w-0 pb-12 relative z-10">
            
            {/* Upper color accents block */}
            <div className="bg-slate-900 text-slate-400 py-1 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                <span>ប្រព័ន្ធគ្រប់គ្រងសម្រាប់បុគ្គលិកសាលាវេស្ទើនអន្តរជាតិ (Western International School)</span>
              </div>
              <div className="text-[10px] text-slate-500 font-bold tracking-widest hidden sm:block uppercase">
                Desktop Environment v2.1.0 • Live Sandbox
              </div>
            </div>

            {/* Header Area - Completely frozen/sticky on desktop, only visible on Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="max-w-full w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-6 shrink-0 z-10">
                <Header totalStaff={staffList.length} totalPresentToday={totalPresentToday} />
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

              {activeTab === 'schoolmap' && (
                <SchoolMap />
              )}

              {activeTab === 'khmercalendar' && (
                <KhmerCalendarManager />
              )}

              {activeTab === 'fixedassets' && (
                <FixedAssetManager />
              )}

              {activeTab === 'otherassets' && (
                <OtherAssetsManager />
              )}

              {activeTab === 'insurance' && (
                <StudentInsuranceManager />
              )}

              {activeTab === 'fireextinguisher' && (
                <FireExtinguisherInspectionManager />
              )}

              {activeTab === 'admindocs' && (
                <AdminDocumentationManager />
              )}

              {activeTab === 'canteen_attendance' && (
                <CanteenAttendanceManager />
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
            </div>
          </main>

          {/* Footer Branding credits */}
          <footer className="mt-16 text-center border-t border-slate-200 pt-8 max-w-full mx-auto w-full px-6 xl:px-12 flex flex-col md:flex-row md:items-center md:justify-between text-xs text-slate-400 font-semibold gap-4 pb-12">
            <div>
              © {new Date().getFullYear()} សាលាវេស្ទើនអន្តរជាតិ (Western International School). រក្សាសិទ្ធិគ្រប់យ៉ាងដោយ LOUNG Veasna (Admin Supervisor)។
            </div>
            <div className="flex items-center justify-center gap-4 text-slate-500">
              <span>អនាម័យ • សណ្តាប់ធ្នាប់ • គុណធម៌</span>
              <span>•</span>
              <span className="text-indigo-500 font-bold hover:underline cursor-pointer">ប្រព័ន្ធគ្រប់គ្រងសាលា (Desktop-Ready)</span>
            </div>
          </footer>

        </div>

      </div>

    </div>
  );
}
