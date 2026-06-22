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
import SelfCheckinPortal from './components/SelfCheckinPortal';
import DailyReportManager from './components/DailyReportManager';
import StudentStatistics from './components/StudentStatistics';
import WesternSchoolInfo from './components/WesternSchoolInfo';
import { SchoolEventsManager } from './components/SchoolEventsManager';
import { MonthlyReportManager } from './components/MonthlyReportManager';
import TaskFollowupManager from './components/TaskFollowupManager';
import MedicineManager from './components/MedicineManager';

import { Staff, AttendanceRecord, ElectricityRecord, WaterRecord, Student, UserAccount, UserRequest } from './types';
import { DEFAULT_STAFF } from './data/defaultStaff';
import { DEFAULT_STUDENTS } from './data/defaultStudents';
import { 
  Building, LayoutDashboard, Users, UserCheck, 
  HelpCircle, Sparkles, LogOut, CheckCircle, Smartphone, Zap, Droplet, Send, Map, HardDrive, ShieldCheck, Wind, FolderOpen, School, Layers, Coffee, Link2, Calendar, GraduationCap, Video, Clock, BarChart2, Shield, UserX, FileText,
  Monitor, Laptop, Tablet, RefreshCw, Pill
} from 'lucide-react';
import LoginScreen from './components/LoginScreen';
import UserManager from './components/UserManager';
import UserDashboard from './components/UserDashboard';
import ForcePasswordChange from './components/ForcePasswordChange';
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
    const initialDb = (window as any).__INITIAL_SERVER_DB__;
    if (initialDb && initialDb['wis_lang']) {
      const dbLang = initialDb['wis_lang'];
      return (dbLang === 'en' || dbLang === 'kh') ? dbLang : 'kh';
    }
    try {
      const savedLang = localStorage.getItem('wis_lang');
      return (savedLang === 'en' || savedLang === 'kh') ? savedLang : 'kh';
    } catch {
      return 'kh';
    }
  });

  const t = translations[lang];

  // Tab Selection State
  const [activeTab, setActiveTab ] = useState<'dashboard' | 'electricity' | 'water' | 'fixedassets' | 'insurance' | 'admindocs' | 'otherlinks' | 'staff' | 'students' | 'studentstatistics' | 'schoolinfo' | 'attendance' | 'telegram' | 'khmercalendar' | 'cctv' | 'classroomequipment' | 'dailyreport' | 'usermanager' | 'staff-portal' | 'schoolevents' | 'monthlyreport' | 'followup' | 'medicine'>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab');
      const validTabs = ['dashboard', 'electricity', 'water', 'fixedassets', 'insurance', 'admindocs', 'otherlinks', 'staff', 'students', 'studentstatistics', 'schoolinfo', 'attendance', 'telegram', 'khmercalendar', 'cctv', 'classroomequipment', 'dailyreport', 'usermanager', 'staff-portal', 'schoolevents', 'monthlyreport', 'followup', 'medicine'];
      if (tabParam && validTabs.includes(tabParam)) {
        return tabParam as any;
      }
    } catch {}
    return 'dashboard';
  });
  const [pendingReportDate, setPendingReportDate] = useState<string | null>(null);
  const [viewportMode, setViewportMode] = useState<'monitor' | 'web' | 'tablet' | 'phone'>('monitor');

  // Authentication & Role-based Access States
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const initialDb = (window as any).__INITIAL_SERVER_DB__;
    if (initialDb && initialDb['wis_current_user']) {
      return initialDb['wis_current_user'];
    }
    try {
      const savedUser = sessionStorage.getItem('wis_current_user') || localStorage.getItem('wis_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [usersList, setUsersList] = useState<UserAccount[]>(() => {
    const initialDb = (window as any).__INITIAL_SERVER_DB__;
    if (initialDb && initialDb['wis_users_list']) {
      return initialDb['wis_users_list'];
    }
    try {
      const savedUsersList = localStorage.getItem('wis_users_list');
      if (savedUsersList) {
        const parsed = JSON.parse(savedUsersList) as UserAccount[];
        const filtered = parsed.filter(u => u.username !== 'user01' && u.username !== 'teacher01' && u.username !== 'staff01');
        localStorage.setItem('wis_users_list', JSON.stringify(filtered));
        return filtered;
      }
    } catch (e) {
      console.error(e);
    }
    const defaultAccounts: UserAccount[] = [
      {
        id: 'usr_admin',
        username: 'admin',
        password: '123456',
        fullName: 'System Administrator',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];
    try {
      localStorage.setItem('wis_users_list', JSON.stringify(defaultAccounts));
    } catch {}
    return defaultAccounts;
  });

  const [userRequests, setUserRequests] = useState<UserRequest[]>(() => {
    const initialDb = (window as any).__INITIAL_SERVER_DB__;
    if (initialDb && initialDb['wis_user_requests']) {
      return initialDb['wis_user_requests'];
    }
    try {
      const savedReqs = localStorage.getItem('wis_user_requests');
      if (savedReqs) {
        const parsed = JSON.parse(savedReqs) as UserRequest[];
        const filtered = parsed.filter(r => r.username !== 'user01' && r.username !== 'teacher01' && r.username !== 'staff01');
        localStorage.setItem('wis_user_requests', JSON.stringify(filtered));
        return filtered;
      }
    } catch {}
    const sampleReqs: UserRequest[] = [];
    try {
      localStorage.setItem('wis_user_requests', JSON.stringify(sampleReqs));
    } catch {}
    return sampleReqs;
  });

  useEffect(() => {
    try {
      localStorage.setItem('wis_users_list', JSON.stringify(usersList));
    } catch (err) {
      console.error(err);
    }
  }, [usersList]);

  useEffect(() => {
    try {
      localStorage.setItem('wis_user_requests', JSON.stringify(userRequests));
    } catch (err) {
      console.error(err);
    }
  }, [userRequests]);

  const handleLoginSuccess = (user: UserAccount, rememberMe: boolean) => {
    try {
      // Always store in sessionStorage for active tab/window session logic
      sessionStorage.setItem('wis_current_user', JSON.stringify(user));
      
      if (rememberMe) {
        localStorage.setItem('wis_current_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('wis_current_user');
      }
      
      sessionStorage.setItem('wis_profile_name', user.fullName);
      sessionStorage.setItem('wis_profile_role', user.role === 'admin' ? (lang === 'kh' ? 'អ្នកគ្រប់គ្រងប្រព័ន្ធ' : 'System Administrator') : (lang === 'kh' ? 'បុគ្គលិកធម្មតា' : 'Standard User'));
      localStorage.setItem('wis_profile_name', user.fullName);
      localStorage.setItem('wis_profile_role', user.role === 'admin' ? (lang === 'kh' ? 'អ្នកគ្រប់គ្រងប្រព័ន្ធ' : 'System Administrator') : (lang === 'kh' ? 'បុគ្គលិកធម្មតា' : 'Standard User'));
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(user);

    // Read optional target redirect tab from query param (Deep Link support)
    let targetTab = activeTab;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get('tab');
      if (tabParam) {
        targetTab = tabParam as any;
      }
    } catch {}

    if (user.role === 'admin') {
      setActiveTab(targetTab === 'staff-portal' ? 'dashboard' : targetTab);
    } else {
      const canAccessTarget = user.permissions?.includes(targetTab) || false;
      if (targetTab === 'staff-portal') {
        setActiveTab('staff-portal');
      } else if (canAccessTarget) {
        setActiveTab(targetTab);
      } else if (user.permissions && user.permissions.includes('dashboard')) {
        setActiveTab('dashboard');
      } else {
        setActiveTab('staff-portal');
      }
    }

    // Clean up query parameters from URL for aesthetics and secure bookmark sharing
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch {}
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('wis_current_user');
      sessionStorage.removeItem('wis_profile_name');
      sessionStorage.removeItem('wis_profile_role');
      sessionStorage.removeItem('wis_profile_avatar');

      localStorage.removeItem('wis_current_user');
      localStorage.removeItem('wis_profile_name');
      localStorage.removeItem('wis_profile_role');
      localStorage.removeItem('wis_profile_avatar');
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
  };

  const hasPermission = (tabKey: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (tabKey === 'staff-portal') return true;
    return currentUser.permissions?.includes(tabKey) || false;
  };

  // Redirect standard users to staff-portal if they try to access unauthorized tabs on page load or state shift
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      if (activeTab !== 'staff-portal' && (!currentUser.permissions || !currentUser.permissions.includes(activeTab))) {
        setActiveTab('staff-portal');
      }
    }
  }, [currentUser, activeTab]);

  // Intercept Remote Scanner URL parameter on mobile devices
  const [remoteScanChannel, setRemoteScanChannel] = useState<string | null>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get('remote_scan');
    } catch {
      return null;
    }
  });

  // Intercept self-checkin routing for QR scan direct access
  const [selfCheckinMode, setSelfCheckinMode] = useState<boolean>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get('self_checkin') === 'true' || searchParams.get('tab') === 'self-checkin';
    } catch {
      return false;
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
    const initialDb = (window as any).__INITIAL_SERVER_DB__;
    if (initialDb && initialDb['wis_staff_list']) {
      return initialDb['wis_staff_list'];
    }
    try {
      const saved = localStorage.getItem('wis_staff_list');
      return saved ? JSON.parse(saved) : DEFAULT_STAFF;
    } catch {
      return DEFAULT_STAFF;
    }
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const initialDb = (window as any).__INITIAL_SERVER_DB__;
    if (initialDb && initialDb['wis_attendance_records']) {
      return initialDb['wis_attendance_records'];
    }
    try {
      const saved = localStorage.getItem('wis_attendance_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [electricityRecords, setElectricityRecords] = useState<ElectricityRecord[]>(() => {
    const initialDb = (window as any).__INITIAL_SERVER_DB__;
    if (initialDb && initialDb['wis_electricity_records']) {
      return initialDb['wis_electricity_records'];
    }
    try {
      const saved = localStorage.getItem('wis_electricity_records');
      return saved ? JSON.parse(saved) : DEFAULT_ELECTRICITY;
    } catch {
      return DEFAULT_ELECTRICITY;
    }
  });

  const [waterRecords, setWaterRecords] = useState<WaterRecord[]>(() => {
    const initialDb = (window as any).__INITIAL_SERVER_DB__;
    if (initialDb && initialDb['wis_water_records']) {
      return initialDb['wis_water_records'];
    }
    try {
      const saved = localStorage.getItem('wis_water_records');
      return saved ? JSON.parse(saved) : DEFAULT_WATER;
    } catch {
      return DEFAULT_WATER;
    }
  });

  const [studentList, setStudentList] = useState<Student[]>(() => {
    const initialDb = (window as any).__INITIAL_SERVER_DB__;
    if (initialDb && initialDb['wis_student_list']) {
      return initialDb['wis_student_list'];
    }
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

  // Bypass to Public Self-Service Check-In Portal
  if (selfCheckinMode) {
    return (
      <SelfCheckinPortal 
        staffList={staffList}
        attendanceRecords={attendanceRecords}
        lang={lang === 'en' ? 'en' : 'kh'}
        onCheckinSuccess={(record) => {
          setAttendanceRecords(prev => {
            const exists = prev.some(r => r.date === record.date && r.staffId === record.staffId);
            if (exists) {
              return prev.map(r => r.date === record.date && r.staffId === record.staffId ? record : r);
            }
            return [record, ...prev];
          });
        }}
        onExit={() => {
          try {
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch {}
          setSelfCheckinMode(false);
          setActiveTab('dashboard');
        }}
      />
    );
  }

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

  // 1. Force authentication barrier if not logged in
  if (!currentUser) {
    return (
      <LoginScreen 
        usersList={usersList} 
        onLoginSuccess={handleLoginSuccess} 
        lang={lang === 'en' ? 'en' : 'kh'} 
        setLang={(newLang) => setLang(newLang as Language)} 
      />
    );
  }

  // 1b. Force password change if requested from administration reset
  if (currentUser.forcePasswordChange) {
    return (
      <ForcePasswordChange 
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        usersList={usersList}
        setUsersList={setUsersList}
        lang={lang === 'en' ? 'en' : 'kh'}
        onLogout={handleLogout}
      />
    );
  }

  const workspaceView = (
    <div className="flex-grow flex flex-col min-h-0 w-full">
      {/* Header Area - Completely frozen/sticky on desktop, only visible on Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="max-w-full w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-6 shrink-0 z-10">
          <Header totalStaff={staffList.length} totalPresentToday={totalPresentToday} lang={lang} />
        </div>
      )}

      {/* Scrollable Work Area containing active dynamic views and the brand footer */}
      <div 
        ref={workspaceScrollRef}
        className="flex-grow overflow-y-auto min-h-0 px-4 sm:px-6 lg:px-8 xl:px-12 mt-2 flex flex-col pr-1 relative z-10"
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
                currentUser={currentUser}
              />
            )}

            {activeTab === 'water' && (
              <WaterTracker 
                waterRecords={waterRecords}
                setWaterRecords={setWaterRecords}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'khmercalendar' && (
              <KhmerCalendarManager 
                onNavigateToDailyReport={(date) => {
                  setPendingReportDate(date);
                  setActiveTab('dailyreport');
                }}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'fixedassets' && (
              <FixedAssetManager currentUser={currentUser} />
            )}

            {activeTab === 'insurance' && (
              <StudentInsuranceManager currentUser={currentUser} />
            )}

            {activeTab === 'admindocs' && (
              <AdminDocumentationManager currentUser={currentUser} />
            )}

            {activeTab === 'otherlinks' && (
              <OtherLinksManager currentUser={currentUser} />
            )}

            {activeTab === 'schoolevents' && (
              <SchoolEventsManager currentUser={currentUser} />
            )}

            {activeTab === 'monthlyreport' && (
              <MonthlyReportManager currentUser={currentUser} />
            )}

            {activeTab === 'followup' && (
              <TaskFollowupManager currentUser={currentUser} lang={lang} />
            )}

            {activeTab === 'medicine' && (
              <MedicineManager currentUser={currentUser} lang={lang} />
            )}

            {activeTab === 'staff' && (
              <StaffManager 
                staffList={staffList} 
                setStaffList={setStaffList} 
                currentUser={currentUser}
              />
            )}

            {activeTab === 'students' && (
              <StudentManager 
                studentList={studentList} 
                setStudentList={setStudentList} 
                lang={lang}
                currentUser={currentUser}
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
                currentUser={currentUser}
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
              <CctvManager currentUser={currentUser} />
            )}

            {activeTab === 'classroomequipment' && (
              <ClassroomEquipmentManager currentUser={currentUser} />
            )}

            {activeTab === 'dailyreport' && (
              <DailyReportManager 
                initialDate={pendingReportDate}
                onClearInitialDate={() => setPendingReportDate(null)}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'staff-portal' && (
              <UserDashboard 
                currentUser={currentUser!}
                usersList={usersList}
                setUsersList={setUsersList}
                userRequests={userRequests}
                setUserRequests={setUserRequests}
                staffList={staffList}
                onLogout={handleLogout}
                lang={lang === 'en' ? 'en' : 'kh'}
              />
            )}

            {activeTab === 'usermanager' && (
              <UserManager 
                usersList={usersList}
                setUsersList={setUsersList}
                userRequests={userRequests}
                setUserRequests={setUserRequests}
                currentUser={currentUser}
                lang={lang === 'en' ? 'en' : 'kh'}
              />
            )}
          </div>
        </main>

        {/* Footer Branding credits */}
        <footer className="mt-16 text-center border-t border-slate-200 pt-8 max-w-full mx-auto w-full px-6 xl:px-12 flex flex-col md:flex-row md:items-center md:justify-between text-xs text-slate-400 font-semibold gap-4 pb-12 font-sans shrink-0">
          <div>
            © {new Date().getFullYear()} {lang === 'en' ? 'Western International School' : 'សាលាវេស្ទើនអន្តរជាតិ'}. {t.footerCopyright}
          </div>
          <div className="flex items-center justify-center gap-4 text-slate-500 font-medium font-sans">
            <span>{t.footerMotto}</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold hover:underline cursor-pointer">{t.footerSystem}</span>
          </div>
        </footer>
      </div>
    </div>
  );

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
          {/* Always Visible: Personal / Staff Portal */}
          <button
            onClick={() => setActiveTab('staff-portal')}
            className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
              activeTab === 'staff-portal'
                ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
            }`}
          >
            <UserCheck className="w-4.5 h-4.5 text-amber-305" />
            <span>{t.staffPortal}</span>
          </button>

          {/* Tab 1: Dashboard */}
          {hasPermission('dashboard') && (
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
          )}

          {/* Tab 1.5: Electricity Analysis */}
          {hasPermission('electricity') && (
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
          )}

          {/* Tab 1.6: Water Analysis */}
          {hasPermission('water') && (
            <button
              onClick={() => setActiveTab('water')}
              className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
                activeTab === 'water'
                  ? 'bg-[#0d5c5a] text-amber-305 text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                  : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
              }`}
            >
              <Droplet className="w-4.5 h-4.5 text-sky-400 fill-sky-500/15" />
              <span className="flex-1">{t.water}</span>
            </button>
          )}

          {/* Tab 1.75: Khmer Calendar */}
          {hasPermission('khmercalendar') && (
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
          )}

          {/* Tab 1.8: Fixed Asset Manager */}
          {hasPermission('fixedassets') && (
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
          )}

          {/* Tab 1.9: Student Insurance */}
          {hasPermission('insurance') && (
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
          )}

          {/* Tab 1.10: CCTV Management */}
          {hasPermission('cctv') && (
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
          )}

          {/* Tab 1.11: Classroom Equipment Management */}
          {hasPermission('classroomequipment') && (
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
          )}



          {/* Tab 1.12: Admin Documentation */}
          {hasPermission('admindocs') && (
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
          )}

          {/* Tab 1.13: Annual School Events Plan */}
          {hasPermission('schoolevents') && (
            <button
              onClick={() => setActiveTab('schoolevents')}
              className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
                activeTab === 'schoolevents'
                  ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                  : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
              }`}
            >
              <Calendar className="w-4.5 h-4.5 text-emerald-400" />
              <span className="flex-1">{t.schoolEvents}</span>
            </button>
          )}

          {/* Tab 1.13.5: Monthly Performance Report */}
          {hasPermission('monthlyreport') && (
            <button
              onClick={() => setActiveTab('monthlyreport')}
              className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
                activeTab === 'monthlyreport'
                  ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                  : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
              }`}
            >
              <FileText className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <span className="flex-1">{t.monthlyReport}</span>
            </button>
          )}

          {/* Tab 1.13.6: Daily Operations Report */}
          {hasPermission('dailyreport') && (
            <button
              onClick={() => setActiveTab('dailyreport')}
              className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
                activeTab === 'dailyreport'
                  ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                  : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
              }`}
            >
              <Clock className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <span className="flex-1">{t.dailyReport}</span>
            </button>
          )}

          {/* Tab 1.13.7: Follow-up Tasks */}
          {hasPermission('followup') && (
            <button
              onClick={() => setActiveTab('followup')}
              className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
                activeTab === 'followup'
                  ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                  : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
              }`}
            >
              <RefreshCw className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <span className="flex-1">{t.followup}</span>
            </button>
          )}

          {/* Medicine Management (Nurse Room) */}
          {hasPermission('medicine') && (
            <button
              onClick={() => setActiveTab('medicine')}
              className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
                activeTab === 'medicine'
                  ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                  : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
              }`}
            >
              <Pill className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <span className="flex-1">{t.medicine}</span>
            </button>
          )}

          {/* Tab 1.14: Other Web Links (Other) */}
          {hasPermission('otherlinks') && (
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
          )}

          {/* Separator */}
          {(hasPermission('staff') || hasPermission('students') || hasPermission('studentstatistics') || hasPermission('schoolinfo')) && (
            <div className="h-px bg-[#0d5c5a]/40 my-2" />
          )}

          {/* Tab 2: Staff setups */}
          {hasPermission('staff') && (
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
          )}

          {/* Tab 2.5: Student setups */}
          {hasPermission('students') && (
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
          )}

          {/* Tab 2.6: Student Statistics */}
          {hasPermission('studentstatistics') && (
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
          )}

          {/* Tab 2.7: Western School Info */}
          {hasPermission('schoolinfo') && (
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
          )}

          {/* Tab 3: Attendance registration */}
          {hasPermission('attendance') && (
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
          )}

          {/* Tab 4: Telegram forwarding */}
          {hasPermission('telegram') && (
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
          )}

          {/* Separator */}
          {hasPermission('usermanager') && (
            <div className="h-px bg-[#0d5c5a]/40 my-2" />
          )}

          {/* User Management tab (Admin only) */}
          {hasPermission('usermanager') && (
            <button
              onClick={() => setActiveTab('usermanager')}
              className={`w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-normal tracking-wide transition-all duration-250 cursor-pointer ${
                activeTab === 'usermanager'
                  ? 'bg-[#0d5c5a] text-amber-300 font-bold border-l-4 border-amber-400 pl-3 shadow-md'
                  : 'text-emerald-100/95 hover:text-white hover:bg-[#0c5352]/50 pl-4'
              }`}
            >
              <Shield className="w-4.5 h-4.5 text-amber-400" />
              <span className="flex-1">{lang === 'kh' ? 'គ្រប់គ្រងអ្នកប្រើប្រាស់' : 'User Accounts'}</span>
              {userRequests.filter(r => r.status === 'Pending').length > 0 && (
                <span className="bg-rose-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full animate-pulse mr-2">
                  {userRequests.filter(r => r.status === 'Pending').length}
                </span>
              )}
            </button>
          )}

          {/* Separator */}
          <div className="h-px bg-[#0d5c5a]/40 my-2 mt-auto" />

          {/* Sign Out (Logout) button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 py-3 rounded-xl text-left text-xs sm:text-sm font-semibold tracking-wide text-rose-350 hover:text-white hover:bg-rose-955/20 pl-4 cursor-pointer transition duration-200"
          >
            <LogOut className="w-4.5 h-4.5 text-rose-450" />
            <span>{lang === 'kh' ? 'ចាកចេញពីប្រព័ន្ធ' : 'Sign Out Dashboard'}</span>
          </button>
        </nav>
      </aside>

          {/* Right Column Layout containing the Top info strip, Brand Header, and active workspace views */}
          <div className="flex-grow flex flex-col min-w-0 pb-1 z-10 font-sans bg-slate-900/5 relative">
            
            {/* Upper color accents block with premium viewport switcher */}
            <div className="bg-slate-950 text-slate-400 py-2.5 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 border-b border-slate-800 shrink-0 gap-3 select-none relative z-20">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-amber-300 font-extrabold">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                <span className="truncate tracking-wide">{t.topStrip}</span>
              </div>
              
              {/* Specialized Interactive Viewport Switcher */}
              <div className="flex items-center gap-1 bg-slate-900/95 p-1 rounded-xl border border-slate-800 text-xs shadow-inner">
                <span className="text-[10px] text-slate-500 font-bold uppercase px-2 hidden lg:inline border-r border-slate-800 mr-1 pb-0.5">
                  {lang === 'kh' ? 'ទម្រង់បន្ទះបង្ហាញ' : 'Layout Mode'}
                </span>
                
                {/* Widescreen Monitor Button */}
                <button
                  type="button"
                  onClick={() => setViewportMode('monitor')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer text-[11px] font-bold ${
                    viewportMode === 'monitor'
                      ? 'bg-amber-400 text-slate-950 shadow-md transform scale-[1.03]'
                      : 'hover:text-slate-100 text-slate-400 hover:bg-slate-800/60'
                  }`}
                  title={lang === 'kh' ? 'អេក្រង់ធំ (Monitor)' : 'Widescreen Monitor'}
                >
                  <Monitor className="w-3.5 h-3.5 shrink-0" />
                  <span>{lang === 'kh' ? 'អេក្រង់ធំ' : 'Monitor'}</span>
                </button>

                {/* Laptop / Web Button */}
                <button
                  type="button"
                  onClick={() => setViewportMode('web')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer text-[11px] font-bold ${
                    viewportMode === 'web'
                      ? 'bg-amber-400 text-slate-950 shadow-md transform scale-[1.03]'
                      : 'hover:text-slate-100 text-slate-400 hover:bg-slate-800/60'
                  }`}
                  title={lang === 'kh' ? 'កុំព្យូទ័រយួរដៃ (Desktop Web)' : 'Web Layout'}
                >
                  <Laptop className="w-3.5 h-3.5 shrink-0" />
                  <span>{lang === 'kh' ? 'កុំព្យូទ័រ' : 'Web'}</span>
                </button>

                {/* Tablet Button */}
                <button
                  type="button"
                  onClick={() => setViewportMode('tablet')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer text-[11px] font-bold ${
                    viewportMode === 'tablet'
                      ? 'bg-amber-400 text-slate-950 shadow-md transform scale-[1.03]'
                      : 'hover:text-slate-100 text-slate-400 hover:bg-slate-800/60'
                  }`}
                  title={lang === 'kh' ? 'ថេប្លេត (Tablet Pro)' : 'iPad Tablet'}
                >
                  <Tablet className="w-3.5 h-3.5 shrink-0" />
                  <span>{lang === 'kh' ? 'ថេប្លេត' : 'Tablet'}</span>
                </button>

                {/* Phone Button */}
                <button
                  type="button"
                  onClick={() => setViewportMode('phone')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer text-[11px] font-bold ${
                    viewportMode === 'phone'
                      ? 'bg-amber-400 text-slate-950 shadow-md transform scale-[1.03]'
                      : 'hover:text-slate-100 text-slate-400 hover:bg-slate-800/60'
                  }`}
                  title={lang === 'kh' ? 'ទូរស័ព្ទ (Smart Phone)' : 'Mobile Phone'}
                >
                  <Smartphone className="w-3.5 h-3.5 shrink-0" />
                  <span>{lang === 'kh' ? 'ទូរស័ព្ទ' : 'Phone'}</span>
                </button>
              </div>

              <div className="text-[10px] text-slate-500 font-bold tracking-widest hidden xl:block uppercase font-mono">
                {t.versionLabel}
              </div>
            </div>

            {/* Inner viewport container - dynamically styled according to layout state selection */}
            <div className={`flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900/5 transition-all duration-300 relative ${
              viewportMode !== 'monitor' ? 'p-4 sm:p-6 md:p-8 overflow-y-auto bg-slate-900/10' : ''
            }`}>
              
              {/* Case 1: Standard Full screen Monitor layout */}
              {viewportMode === 'monitor' && workspaceView}

              {/* Case 2: Web / Laptop simulated browser window mockup frame */}
              {viewportMode === 'web' && (
                <div className="max-w-[1240px] w-full mx-auto bg-white border border-slate-200 shadow-2xl rounded-2xl flex flex-col h-full min-h-[600px] overflow-hidden transition-all duration-300">
                  {/* Browser simulated navigation chrome */}
                  <div className="bg-slate-100 border-b border-slate-250/70 px-4 py-2.5 flex items-center justify-between text-xs text-slate-550 rounded-t-xl select-none shrink-0 font-sans">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-400 inline-block shadow-xs" />
                      <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-xs" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-xs" />
                    </div>
                    {/* Simulated address bar */}
                    <div className="bg-white border border-slate-250 px-4 py-0.5 rounded-lg text-[11px] font-mono w-2/3 max-w-[500px] h-7 flex items-center justify-between text-slate-500 shadow-xs">
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="text-emerald-600 text-xs shadow-2xs">🔒</span>
                        <span className="text-[10.5px]">secured-admin.western.edu.kh/{activeTab}</span>
                      </span>
                      <button 
                        type="button"
                        onClick={() => window.location.reload()} 
                        className="hover:text-slate-900 hover:bg-slate-100 p-0.5 rounded cursor-pointer transition duration-150"
                        title="Refresh"
                      >
                        🔄
                      </button>
                    </div>
                    <div className="text-[9px] font-extrabold text-emerald-600 font-mono">
                      SECURE WEB
                    </div>
                  </div>
                  {/* Web viewport body */}
                  <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden relative">
                    {workspaceView}
                  </div>
                </div>
              )}

              {/* Case 3: Tablet iPad simulated frame with camera bezel */}
              {viewportMode === 'tablet' && (
                <div className="max-w-[768px] w-full mx-auto my-auto bg-white border-[14px] border-slate-950 rounded-[38px] shadow-2xl overflow-hidden ring-4 ring-slate-800/15 flex flex-col h-[880px] min-h-0 shrink-0 transition-all duration-300">
                  {/* Simulated iOS iPad status bar */}
                  <div className="bg-slate-950 text-slate-400 text-[10.5px] px-6 py-2 flex items-center justify-between font-mono shrink-0 select-none border-b border-slate-900">
                    <span className="font-extrabold text-slate-300">Western International School (Tablet preview)</span>
                    <div className="flex items-center gap-3">
                      <span>📶 Wi-Fi 6</span>
                      <span>🔋 99%</span>
                      <span className="font-bold text-slate-100">09:41 AM</span>
                    </div>
                  </div>
                  {/* iPad scroll frame contents */}
                  <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden relative">
                    {workspaceView}
                  </div>
                  {/* Bottom micro-speaker slot indicator line */}
                  <div className="bg-slate-950 py-1 flex items-center justify-center shrink-0">
                    <div className="w-24 h-1 bg-slate-800 rounded-full" />
                  </div>
                </div>
              )}

              {/* Case 4: Smart phone Portrait mockup frame with Dynamic Island and indicator notch */}
              {viewportMode === 'phone' && (
                <div className="max-w-[390px] w-full mx-auto my-auto bg-white border-[14px] border-slate-950 rounded-[48px] shadow-2xl overflow-hidden ring-4 ring-slate-800/15 flex flex-col h-[740px] min-h-0 shrink-0 relative transition-all duration-300 select-none">
                  {/* Simulated top camera slot (Dynamic Island Notch) */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-slate-950 rounded-full z-50 flex items-center justify-between px-4 select-none shrink-0 shadow-inner">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-850" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-850" />
                  </div>

                  {/* simulated Smartphone Header and battery status bar */}
                  <div className="bg-slate-950 text-slate-400 text-[9.5px] px-6 pt-3.5 pb-1 flex items-center justify-between font-mono shrink-0 select-none z-40 border-b border-slate-900">
                    <span className="font-bold text-slate-205">09:41</span>
                    <div className="flex items-center gap-1.5">
                      <span>📶 5G</span>
                      <span>🔋 100%</span>
                    </div>
                  </div>

                  {/* internal smartphone content sandbox with enabled viewport scrolling */}
                  <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden relative">
                    {workspaceView}
                  </div>

                  {/* Smartphone Home Indicator bar */}
                  <div className="bg-slate-950 py-1.5 flex items-center justify-center shrink-0 select-none z-40">
                    <div className="w-28 h-1.2 bg-slate-800 rounded-full" />
                  </div>
                </div>
              )}

            </div>

          </div>

    </div>
  );
}
