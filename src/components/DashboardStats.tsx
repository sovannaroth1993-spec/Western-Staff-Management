/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { Staff, AttendanceRecord, DEPARTMENT_NAMES_KM, Department, ElectricityRecord, WaterRecord, ALL_DEPARTMENTS } from '../types';
import { 
  Shield, Brush, BookOpen, HeartPulse, UserCheck, Users, HelpCircle, 
  Clock, Zap, Droplet, ArrowUpRight, ArrowDownRight, Info, AlertCircle,
  TrendingUp, Send, Share2, Key, CheckCircle, MessageSquare, Eye, EyeOff,
  FlaskConical, FileSpreadsheet, RefreshCw, LogOut, ExternalLink, Loader2, Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  initAuth, 
  googleSignIn, 
  googleSignOut, 
  createMasterSpreadsheet, 
  checkSpreadsheetExists, 
  syncDataToSpreadsheet 
} from '../utils/googleSheetsHelper';

interface DashboardStatsProps {
  staffList: Staff[];
  attendanceRecords: AttendanceRecord[];
  selectedDate: string;
  electricityRecords: ElectricityRecord[];
  waterRecords: WaterRecord[];
}

const DEPT_ICONS: Record<Department, any> = {
  Security: Shield,
  Cleaner: Brush,
  Librarian: BookOpen,
  Nurse: HeartPulse,
  'Customer Service': UserCheck,
  'Lab Assistant': FlaskConical,
  'Admin Head': Users
};

const DEPT_COLORS: Record<Department, { bg: string; text: string; iconBg: string; border: string }> = {
  Security: { bg: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-800', iconBg: 'bg-indigo-600', border: 'border-indigo-200' },
  Cleaner: { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-800', iconBg: 'bg-emerald-600', border: 'border-emerald-200' },
  Librarian: { bg: 'bg-sky-50 border-sky-100', text: 'text-sky-800', iconBg: 'bg-sky-600', border: 'border-sky-200' },
  Nurse: { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-800', iconBg: 'bg-rose-600', border: 'border-rose-200' },
  'Customer Service': { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-800', iconBg: 'bg-amber-600', border: 'border-amber-200' },
  'Lab Assistant': { bg: 'bg-teal-50 border-teal-100', text: 'text-teal-800', iconBg: 'bg-teal-600', border: 'border-teal-200' },
  'Admin Head': { bg: 'bg-purple-50 border-purple-100', text: 'text-purple-800', iconBg: 'bg-purple-600', border: 'border-purple-200' }
};

const formatKhmerMonth = (monthYearStr: string) => {
  if (!monthYearStr) return '';
  const [year, month] = monthYearStr.split('-');
  const khmerMonths = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];
  const monthIndex = parseInt(month, 10) - 1;
  const khmerMonthName = khmerMonths[monthIndex] || month;
  return `${khmerMonthName} ${year}`;
};

const formatKhmerMonthShort = (monthStr: string) => {
  if (!monthStr) return '';
  const parts = monthStr.split('-');
  if (parts.length < 2) return monthStr;
  const month = parts[1];
  const khmerMonths = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];
  const idx = parseInt(month, 10) - 1;
  return khmerMonths[idx] || month;
};

const formatUSD = (num: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
};

export default function DashboardStats({ 
  staffList, 
  attendanceRecords, 
  selectedDate,
  electricityRecords = [],
  waterRecords = []
}: DashboardStatsProps) {

  // Google Sheets Integration State
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem('wis_google_spreadsheet_id');
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(() => {
    return localStorage.getItem('wis_google_spreadsheet_url');
  });
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem('wis_google_spreadsheet_last_sync');
  });

  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize Auth on Component mount
  useEffect(() => {
    const unsub = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        setAuthInitialized(true);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
        setAuthInitialized(true);
      }
    );
    return () => unsub();
  }, []);

  // Validate spreadsheet state when authenticated
  useEffect(() => {
    if (googleToken && spreadsheetId) {
      checkSpreadsheetExists(googleToken, spreadsheetId).then((exists) => {
        if (!exists) {
          localStorage.removeItem('wis_google_spreadsheet_id');
          localStorage.removeItem('wis_google_spreadsheet_url');
          setSpreadsheetId(null);
          setSpreadsheetUrl(null);
        }
      }).catch(() => {
        // Safe failover
      });
    }
  }, [googleToken, spreadsheetId]);

  // Auth & Connection Actions
  const handleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'ការលម្អិតគណនី Google មានបញ្ហា។ សូមសាកល្បងម្ដងទៀត។');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await googleSignOut();
      setGoogleUser(null);
      setGoogleToken(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'ការចាកចេញពីគណនីមានបញ្ហា។');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpreadsheet = async () => {
    if (!googleToken) return;
    setIsLoading(true);
    setErrorMessage(null);
    setSyncStatus('syncing');
    try {
      const formattedDate = new Date().toLocaleDateString('km-KH');
      const sheetTitle = `WIS School Management Master - ${formattedDate}`;
      const res = await createMasterSpreadsheet(googleToken, sheetTitle);
      
      localStorage.setItem('wis_google_spreadsheet_id', res.spreadsheetId);
      localStorage.setItem('wis_google_spreadsheet_url', res.spreadsheetUrl);
      setSpreadsheetId(res.spreadsheetId);
      setSpreadsheetUrl(res.spreadsheetUrl);
      
      // Perform immediate sync of records
      await syncDataToSpreadsheet(googleToken, res.spreadsheetId, {
        staffList,
        attendanceRecords,
        electricityRecords,
        waterRecords
      });

      const nowStr = new Date().toLocaleString('km-KH', { dateStyle: 'medium', timeStyle: 'short' });
      localStorage.setItem('wis_google_spreadsheet_last_sync', nowStr);
      setLastSyncedAt(nowStr);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'ការបង្កើត Google Sheet ស្វ័យប្រវត្តិបរាជ័យ។');
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncData = async () => {
    if (!googleToken || !spreadsheetId) return;
    setIsLoading(true);
    setSyncStatus('syncing');
    setErrorMessage(null);
    try {
      await syncDataToSpreadsheet(googleToken, spreadsheetId, {
        staffList,
        attendanceRecords,
        electricityRecords,
        waterRecords
      });

      const nowStr = new Date().toLocaleString('km-KH', { dateStyle: 'medium', timeStyle: 'short' });
      localStorage.setItem('wis_google_spreadsheet_last_sync', nowStr);
      setLastSyncedAt(nowStr);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'ការសរសេរទិន្នន័យចូល Google Sheets បរាជ័យ។');
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  };


  
  // Counts by department
  const getDeptCount = (dept: Department) => staffList.filter(s => s.department === dept).length;

  // Key stats calculations for Selected Date
  const currentAttendance = attendanceRecords.filter(r => r.date === selectedDate);
  const totalPresent = currentAttendance.filter(r => r.status === 'Present').length;
  const totalExcused = currentAttendance.filter(r => r.status === 'Excused').length;
  const totalAbsent = currentAttendance.filter(r => r.status === 'Absent').length;
  
  const presentRate = staffList.length > 0 ? Math.round((totalPresent / staffList.length) * 100) : 0;

  // Department-wise attendance lookup
  const getDeptAttendance = (dept: Department) => {
    const deptStaff = staffList.filter(s => s.department === dept);
    const deptStaffIds = deptStaff.map(s => s.staffId);
    const deptRecords = currentAttendance.filter(r => deptStaffIds.includes(r.staffId));
    
    const countPresent = deptRecords.filter(r => r.status === 'Present').length;
    return {
      total: deptStaff.length,
      present: countPresent,
      rate: deptStaff.length > 0 ? Math.round((countPresent / deptStaff.length) * 100) : 0
    };
  };

  // HTML format helper (for Bot API which supports bold, code, tags)
  const latestElec = useMemo(() => {
    if (!electricityRecords || electricityRecords.length === 0) return null;
    return [...electricityRecords].sort((a, b) => b.monthYear.localeCompare(a.monthYear))[0];
  }, [electricityRecords]);

  const latestWater = useMemo(() => {
    if (!waterRecords || waterRecords.length === 0) return null;
    return [...waterRecords].sort((a, b) => b.monthYear.localeCompare(a.monthYear))[0];
  }, [waterRecords]);

  const reportTextHtml = useMemo(() => {
    const presentCount = totalPresent;
    const excusedCount = totalExcused;
    const absentCount = totalAbsent;
    const totalStaffCount = staffList.length;

    let text = `🏫 <b>របាយការណ៍វត្តមានបុគ្គលិក - សាលាវេស្ទើនអន្តរជាតិ</b>\n`;
    text += `📅 <b>ថ្ងៃទី៖</b> ${selectedDate}\n`;
    text += `━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📊 <b>ស្ថិតិសរុបប្រចាំថ្ងៃ៖</b>\n`;
    text += `• ចំនួនបុគ្គលិកសរុប៖ <b>${totalStaffCount} នាក់</b>\n`;
    text += `• វត្តមានថ្ងៃនេះ ៖ <b>${presentCount} នាក់</b> (${presentRate}%)\n`;
    text += `• ច្បាប់ (Excused) ៖ <b>${excusedCount} នាក់</b>\n`;
    text += `• អវត្តមាន (Absent) ៖ <b>${absentCount} នាក់</b>\n\n`;

    text += `🏢 <b>ស្ថានភាពតាមផ្នែកនីមួយៗ៖</b>\n`;
    ALL_DEPARTMENTS.forEach(dept => {
      const count = getDeptCount(dept);
      const att = getDeptAttendance(dept);
      text += `• ${DEPARTMENT_NAMES_KM[dept]} (<b>${dept}</b>) ៖ មក <b>${att.present}</b> / ${count} នាក់ (${att.rate}%)\n`;
    });

    // Add info of absent staff if any
    const todayRecords = attendanceRecords.filter(r => r.date === selectedDate);
    const absentRecords = todayRecords.filter(r => r.status === 'Absent' || r.status === 'Excused');
    
    if (absentRecords.length > 0) {
      text += `\n📋 <b>បញ្ជីឈ្មោះបុគ្គលិកអវត្តមាន/ច្បាប់ ៖</b>\n`;
      absentRecords.forEach((r, idx) => {
        const staff = staffList.find(s => s.staffId === r.staffId);
        if (staff) {
          const statusKm = r.status === 'Excused' ? 'ច្បាប់' : 'អត់ច្បាប់';
          text += `${idx + 1}. <b>${staff.name}</b> (${DEPARTMENT_NAMES_KM[staff.department]}) - <i>${statusKm}</i>${r.notes ? ` / មូលហេតុ: ${r.notes}` : ''}\n`;
        }
      });
    }

    if (latestElec || latestWater) {
      text += `\n💧⚡️ <b>ការប្រើប្រាស់ទឹក & ភ្លើងលម្អិត៖</b>\n`;
      if (latestElec) {
        const trendEmoji = latestElec.differenceUsd <= 0 ? '🟢' : '🔴';
        const trendText = latestElec.differenceUsd <= 0 ? 'ថយចុះ' : 'កើនឡើង';
        const pctText = Math.abs(latestElec.differencePercent);
        text += `• <b>ការប្រើប្រាស់ភ្លើង (Electricity)៖</b> ខែ ${formatKhmerMonth(latestElec.monthYear)} ចំណាយ <b>${formatUSD(latestElec.costAfterUsd)}</b> (${trendEmoji} ${trendText} ${pctText}%)\n`;
      }
      if (latestWater) {
        const trendEmoji = latestWater.differenceUsd <= 0 ? '🟢' : '🔴';
        const trendText = latestWater.differenceUsd <= 0 ? 'ថយចុះ' : 'កើនឡើង';
        const pctText = Math.abs(latestWater.differencePercent);
        text += `• <b>ការប្រើប្រាស់ទឹក (Water Supply)៖</b> ខែ ${formatKhmerMonth(latestWater.monthYear)} ចំណាយ <b>${formatUSD(latestWater.costAfterUsd)}</b> (${trendEmoji} ${trendText} ${pctText}%)\n`;
      }
    }

    text += `\n✍️ <i>របាយការណ៍បញ្ជូនដោយស្វ័យប្រវត្តិតាមរយៈ WIS Management System</i>`;
    return text;
  }, [staffList, attendanceRecords, selectedDate, presentRate, totalPresent, totalExcused, totalAbsent, latestElec, latestWater]);

  // Plain Text helper (for t.me share link)
  const reportTextPlain = useMemo(() => {
    const presentCount = totalPresent;
    const excusedCount = totalExcused;
    const absentCount = totalAbsent;
    const totalStaffCount = staffList.length;

    let text = `🏫 របាយការណ៍វត្តមានបុគ្គលិក - សាលាវេស្ទើនអន្តរជាតិ\n`;
    text += `📅 ថ្ងៃទី៖ ${selectedDate}\n`;
    text += `━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📊 ស្ថិតិសរុបប្រចាំថ្ងៃ៖\n`;
    text += `• ចំនួនបុគ្គលិកសរុប៖ ${totalStaffCount} នាក់\n`;
    text += `• វត្តមានថ្ងៃនេះ ៖ ${presentCount} នាក់ (${presentRate}%)\n`;
    text += `• ច្បាប់ (Excused) ៖ ${excusedCount} នាក់\n`;
    text += `• អវត្តមាន (Absent) ៖ ${absentCount} នាក់\n\n`;

    text += `🏢 ស្ថានភាពតាមផ្នែកនីមួយៗ៖\n`;
    ALL_DEPARTMENTS.forEach(dept => {
      const count = getDeptCount(dept);
      const att = getDeptAttendance(dept);
      text += `• ${DEPARTMENT_NAMES_KM[dept]} (${dept}) ៖ មក ${att.present} / ${count} នាក់ (${att.rate}%)\n`;
    });

    const todayRecords = attendanceRecords.filter(r => r.date === selectedDate);
    const absentRecords = todayRecords.filter(r => r.status === 'Absent' || r.status === 'Excused');
    
    if (absentRecords.length > 0) {
      text += `\n📋 បញ្ជីឈ្មោះបុគ្គលិកអវត្តមាន/ច្បាប់ ៖\n`;
      absentRecords.forEach((r, idx) => {
        const staff = staffList.find(s => s.staffId === r.staffId);
        if (staff) {
          const statusKm = r.status === 'Excused' ? 'ច្បាប់' : 'អត់ច្បាប់';
          text += `${idx + 1}. ${staff.name} (${DEPARTMENT_NAMES_KM[staff.department]}) - ${statusKm}${r.notes ? ` / មូលហេតុ: ${r.notes}` : ''}\n`;
        }
      });
    }

    if (latestElec || latestWater) {
      text += `\n💧⚡️ ការប្រើប្រាស់ទឹក & ភ្លើងលម្អិត៖\n`;
      if (latestElec) {
        const trendEmoji = latestElec.differenceUsd <= 0 ? '🟢' : '🔴';
        const trendText = latestElec.differenceUsd <= 0 ? 'ថយចុះ' : 'កើនឡើង';
        const pctText = Math.abs(latestElec.differencePercent);
        text += `• ការប្រើប្រាស់ភ្លើង (Electricity)៖ ខែ ${formatKhmerMonth(latestElec.monthYear)} ចំណាយ ${formatUSD(latestElec.costAfterUsd)} (${trendEmoji} ${trendText} ${pctText}%)\n`;
      }
      if (latestWater) {
        const trendEmoji = latestWater.differenceUsd <= 0 ? '🟢' : '🔴';
        const trendText = latestWater.differenceUsd <= 0 ? 'ថយចុះ' : 'កើនឡើង';
        const pctText = Math.abs(latestWater.differencePercent);
        text += `• ការប្រើប្រាស់ទឹក (Water Supply)៖ ខែ ${formatKhmerMonth(latestWater.monthYear)} ចំណាយ ${formatUSD(latestWater.costAfterUsd)} (${trendEmoji} ${trendText} ${pctText}%)\n`;
      }
    }

    text += `\n✍️ របាយការណ៍បញ្ជូនដោយស្វ័យប្រវត្តិតាមរយៈ WIS Management System`;
    return text;
  }, [staffList, attendanceRecords, selectedDate, presentRate, totalPresent, totalExcused, totalAbsent, latestElec, latestWater]);



  // Utilities Calculations
  const [hoveredElecIdx, setHoveredElecIdx] = useState<number | null>(null);
  const [hoveredWaterIdx, setHoveredWaterIdx] = useState<number | null>(null);

  const sortedElec = useMemo(() => {
    return [...electricityRecords].sort((a, b) => a.monthYear.localeCompare(b.monthYear)).slice(-6);
  }, [electricityRecords]);

  const sortedWater = useMemo(() => {
    return [...waterRecords].sort((a, b) => a.monthYear.localeCompare(b.monthYear)).slice(-6);
  }, [waterRecords]);

  const elecMax = useMemo(() => {
    if (sortedElec.length === 0) return 100;
    return Math.max(...sortedElec.map(r => Math.max(r.costBeforeUsd, r.costAfterUsd, 20)), 100) * 1.15;
  }, [sortedElec]);

  const waterMax = useMemo(() => {
    if (sortedWater.length === 0) return 100;
    return Math.max(...sortedWater.map(r => Math.max(r.costBeforeUsd, r.costAfterUsd, 20)), 100) * 1.15;
  }, [sortedWater]);

  // Dimensions for reusable calculation inside SVG
  const svgWidth = 500;
  const svgHeight = 240;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const singleBarWidth = Math.max(10, Math.min(18, (chartWidth / Math.max(1, sortedElec.length)) * 0.25));

  const elecTrendPath = useMemo(() => {
    if (sortedElec.length === 0) return '';
    let path = '';
    sortedElec.forEach((r, i) => {
      const xCenter = paddingLeft + (i + 0.5) * (chartWidth / sortedElec.length);
      const yAfter = svgHeight - paddingBottom - (r.costAfterUsd / elecMax) * chartHeight;
      if (i === 0) path += `M ${xCenter} ${yAfter}`;
      else path += ` L ${xCenter} ${yAfter}`;
    });
    return path;
  }, [sortedElec, elecMax, chartWidth, chartHeight]);

  const waterTrendPath = useMemo(() => {
    if (sortedWater.length === 0) return '';
    let path = '';
    sortedWater.forEach((r, i) => {
      const xCenter = paddingLeft + (i + 0.5) * (chartWidth / sortedWater.length);
      const yAfter = svgHeight - paddingBottom - (r.costAfterUsd / waterMax) * chartHeight;
      if (i === 0) path += `M ${xCenter} ${yAfter}`;
      else path += ` L ${xCenter} ${yAfter}`;
    });
    return path;
  }, [sortedWater, waterMax, chartWidth, chartHeight]);

  // Find active items
  const activeElecIdx = hoveredElecIdx !== null ? hoveredElecIdx : (sortedElec.length > 0 ? sortedElec.length - 1 : null);
  const activeElecRecord = activeElecIdx !== null && sortedElec[activeElecIdx] ? sortedElec[activeElecIdx] : null;

  const activeWaterIdx = hoveredWaterIdx !== null ? hoveredWaterIdx : (sortedWater.length > 0 ? sortedWater.length - 1 : null);
  const activeWaterRecord = activeWaterIdx !== null && sortedWater[activeWaterIdx] ? sortedWater[activeWaterIdx] : null;

  return (
    <div className="space-y-6">
      
      {/* 3 Summary Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Total Staff */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">ចំនួនបុគ្គលិកសរុប</p>
              <h3 className="text-4xl font-black text-slate-800 mt-2">{staffList.length} នាក់</h3>
              <p className="text-xs md:text-sm font-medium text-slate-455 text-slate-500 mt-2.5">កំពុងបំពេញការងារប្រចាំថ្ងៃ</p>
            </div>
            <div className="bg-slate-100 p-4 rounded-xl text-slate-700">
              <Users className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500" />
        </div>

        {/* Card 2: Presence Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">អត្រាវត្តមានសរុបថ្ងៃនេះ</p>
              <h3 className="text-4xl font-black text-emerald-650 text-emerald-600 mt-2">{presentRate}%</h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-xs md:text-sm font-bold text-slate-600">
                <span className="text-emerald-600">✓ {totalPresent} មក</span>
                <span>•</span>
                <span className="text-amber-600">{totalExcused} ច្បាប់</span>
                <span>•</span>
                <span className="text-red-650 text-rose-600">{totalAbsent} អត់ច្បាប់</span>
              </div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600">
              <UserCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500" />
        </div>

        {/* Card 3: Date Display Banner */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-md text-slate-100 relative overflow-hidden">
          <div>
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase">កាលបរិច្ឆេទស្រង់</span>
            <h4 className="text-xl font-extrabold text-white mt-2">{selectedDate}</h4>
            <p className="text-xs md:text-sm font-semibold text-slate-400 mt-1">រៀងរាល់ថ្ងៃធ្វើការ (ច័ន្ទ - សុក្រ)</p>
            <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-amber-400/90 mt-2.5">
              <Clock className="w-4 h-4" /> ស្រង់ដោយ៖ LOUNG Veasna
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-400" />
        </div>

      </div>

      {/* Grid of Department Capacities & Presence Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department lists cards */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-lg p-6 space-y-4">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
            ស្ថិតិបុគ្គលិកតាមផ្នែកនីមួយៗ (Department Resources & Status)
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_DEPARTMENTS.map((dept) => {
              const count = getDeptCount(dept);
              const att = getDeptAttendance(dept);
              const IconComp = DEPT_ICONS[dept];
              const theme = DEPT_COLORS[dept];

              return (
                <div key={dept} className={`p-4 rounded-xl border ${theme.bg} ${theme.border} flex flex-col justify-between min-h-[144px]`}>
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">
                      {dept.toUpperCase()}
                    </span>
                    <div className={`${theme.iconBg} text-white p-2 rounded-lg`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h5 className="text-[14px] sm:text-base font-black text-slate-900 mt-1 leading-snug">
                      {DEPARTMENT_NAMES_KM[dept]}
                    </h5>
                    <div className="flex items-center justify-between mt-2 text-xs font-bold text-slate-600">
                      <div>បុគ្គលិក: <span className="font-extrabold text-slate-800">{count}</span></div>
                      {count > 0 && (
                        <div className="bg-white/80 border border-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-700 font-extrabold">
                          វត្តមាន: {att.rate}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Presence breakdown visualization in standard geometric elements */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
              របាយវត្តមានថ្ងៃនេះ ({totalPresent + totalExcused + totalAbsent} នាក់)
            </h4>

            {staffList.length === 0 ? (
              <div className="py-12 text-center text-xs font-semibold text-slate-400">
                មិនទាន់មានទិន្នន័យបុគ្គលិកដើម្បីគណនា
              </div>
            ) : (
              <div className="space-y-4">
                {/* Present Bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> មក (Present)</span>
                    <span>{totalPresent} នាក់ ({Math.round((totalPresent / (staffList.length || 1)) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(totalPresent / (staffList.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Excused Bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> ច្បាប់ (Excused)</span>
                    <span>{totalExcused} នាក់ ({Math.round((totalExcused / (staffList.length || 1)) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(totalExcused / (staffList.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Absent Bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> អត់ច្បាប់ (Absent)</span>
                    <span>{totalAbsent} នាក់ ({Math.round((totalAbsent / (staffList.length || 1)) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(totalAbsent / (staffList.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-slate-500 text-[11px] font-semibold mt-6 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 text-slate-400" />
            <div>
              អ្នកអាចទាញយករបាយការណ៍វត្តមាន និងកិច្ចការងារអនាម័យជាប្រភេទឯកសារ Excel និង PDF តាមរយៈផ្នែកនីមួយៗខាងក្រោម។
            </div>
          </div>
        </div>

      </div>



      {/* Utilities Trends & Analysis Panels */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>ប្រៀបធៀបចំណាយទឹក និងភ្លើងប្រចាំខែ (Electricity & Water Supply Trends)</span>
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              ក្រាហ្វបង្ហាញពីគម្លាតនៃការចំណាយរវាងខែមុន និងខែបច្ចុប្បន្ន ដើម្បីសិក្សាពីនិន្នាការប្រើប្រាស់ថាមពល
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-slate-205 border border-slate-300" style={{ backgroundColor: '#cbd5e1' }} />
              <span className="text-slate-600 text-[11px]">ខែមុន (Previous)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-500" />
              <span className="text-slate-600 text-[11px]">ភ្លើង (Electricity)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-sky-500" />
              <span className="text-slate-600 text-[11px]">ទឹក (Water Supply)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: Electricity Analytics */}
          <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-2 text-sm font-black text-slate-800 font-sans">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500/10" />
                  <span>ថាមពលអគ្គិសនី (Electricity Expense)</span>
                </span>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  គិតជាដុល្លារ ($)
                </span>
              </div>

              {sortedElec.length === 0 ? (
                <div className="py-14 text-center text-xs font-bold text-slate-400 flex flex-col items-center justify-center gap-2">
                  <AlertCircle className="w-8 h-8 text-slate-300" />
                  <span>មិនទាន់មានទិន្នន័យចំណាយអគ្គិសនីដើម្បីបង្ហាញទេ</span>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1 max-w-[220px]">
                    សូមចូលទៅកាន់ផ្នែក "ការប្រើប្រាស់អគ្គិសនីប្រចាំខែ" ដើម្បីបំពេញទិន្នន័យដំបូង!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* SVG Chart */}
                  <div className="relative w-full overflow-hidden bg-white/75 backdrop-blur-sm border border-slate-100 p-2 rounded-xl">
                    <svg viewBox="0 0 500 240" className="w-full h-auto">
                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                        const yVal = pct * elecMax;
                        const yPos = 240 - 40 - pct * (240 - 40 - 30);
                        return (
                          <g key={`elec-grid-${idx}`}>
                            <line 
                              x1={50} 
                              y1={yPos} 
                              x2={500 - 20} 
                              y2={yPos} 
                              stroke="#f1f5f9" 
                              strokeWidth="1"
                              strokeDasharray="4,4" 
                            />
                            <text 
                              x={42} 
                              y={yPos + 3.5} 
                              textAnchor="end" 
                              className="text-[10px] font-black fill-slate-400 font-mono"
                            >
                              ${Math.round(yVal)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Bar groups */}
                      {sortedElec.map((r, i) => {
                        const xCenter = 50 + (i + 0.5) * (chartWidth / sortedElec.length);
                        const xBefore = xCenter - singleBarWidth - 1.5;
                        const xAfter = xCenter + 1.5;

                        const yBefore = 240 - 40 - (r.costBeforeUsd / elecMax) * chartHeight;
                        const yAfter = 240 - 40 - (r.costAfterUsd / elecMax) * chartHeight;

                        const hBefore = Math.max(3, (r.costBeforeUsd / elecMax) * chartHeight);
                        const hAfter = Math.max(3, (r.costAfterUsd / elecMax) * chartHeight);

                        const isHovered = hoveredElecIdx === i;

                        return (
                          <g key={`elec-bar-group-${r.id}`}>
                            {/* Bar Before */}
                            <rect
                              x={xBefore}
                              y={yBefore}
                              width={singleBarWidth}
                              height={hBefore}
                              fill="#cbd5e1"
                              rx="2.5"
                              opacity={isHovered ? 0.9 : 0.6}
                              className="transition-all duration-200"
                            />
                            {/* Bar After */}
                            <rect
                              x={xAfter}
                              y={yAfter}
                              width={singleBarWidth}
                              height={hAfter}
                              fill="#f59e0b"
                              rx="2.5"
                              opacity={isHovered ? 1 : 0.85}
                              className="transition-all duration-200"
                            />
                            
                            {/* Month labels */}
                            <text
                              x={xCenter}
                              y={240 - 40 + 18}
                              textAnchor="middle"
                              className={`text-[10px] font-black transition-all ${
                                isHovered ? 'fill-slate-900 font-extrabold' : 'fill-slate-400'
                              }`}
                            >
                              {formatKhmerMonthShort(r.monthYear)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Connect Trendline for costAfterUsd */}
                      <path 
                        d={elecTrendPath} 
                        fill="none" 
                        stroke="#d97706" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="opacity-70"
                      />

                      {/* Trendline Connection Dots */}
                      {sortedElec.map((r, i) => {
                        const xCenter = 50 + (i + 0.5) * (chartWidth / sortedElec.length);
                        const yAfter = 240 - 40 - (r.costAfterUsd / elecMax) * chartHeight;
                        const isHovered = hoveredElecIdx === i;

                        return (
                          <circle
                            key={`elec-point-${r.id}`}
                            cx={xCenter}
                            cy={yAfter}
                            r={isHovered ? 6 : 4}
                            fill="#f59e0b"
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="transition-all duration-200 cursor-pointer"
                          />
                        );
                      })}

                      {/* Vertical line indicator */}
                      {hoveredElecIdx !== null && (
                        (() => {
                          const xCenter = 50 + (hoveredElecIdx + 0.5) * (chartWidth / sortedElec.length);
                          return (
                            <line
                              x1={xCenter}
                              y1={30}
                              x2={xCenter}
                              y2={240 - 40}
                              stroke="#cbd5e1"
                              strokeWidth="1"
                              strokeDasharray="3,3"
                              pointerEvents="none"
                            />
                          );
                        })()
                      )}

                      {/* Hover Trigger zones */}
                      {sortedElec.map((r, i) => {
                        const xLeft = 50 + i * (chartWidth / sortedElec.length);
                        const widthOfBucket = chartWidth / sortedElec.length;
                        return (
                          <rect
                            key={`elec-trigger-${r.id}`}
                            x={xLeft}
                            y={30}
                            width={widthOfBucket}
                            height={chartHeight}
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredElecIdx(i)}
                            onMouseLeave={() => setHoveredElecIdx(null)}
                          />
                        );
                      })}
                    </svg>
                  </div>

                  {/* Active Month Detailed Info Overlay */}
                  {activeElecRecord && (
                    <div className="bg-white border border-slate-105 border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-150">
                      <div>
                        <div className="flex items-center flex-wrap gap-2 text-sans">
                          <span className="text-xs font-black text-slate-800">
                            ខែ {formatKhmerMonth(activeElecRecord.monthYear)}
                          </span>
                          {/* Saving / Spurge badge */}
                          {activeElecRecord.differenceUsd < 0 ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-100">
                              <ArrowDownRight className="w-3.5 h-3.5" />
                              <span>សន្សំបាន {formatUSD(Math.abs(activeElecRecord.differenceUsd))} ({Math.abs(activeElecRecord.differencePercent).toFixed(1)}%)</span>
                            </span>
                          ) : activeElecRecord.differenceUsd > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded border border-rose-100">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>កើនឡើង {formatUSD(activeElecRecord.differenceUsd)} (+{activeElecRecord.differencePercent.toFixed(1)}%)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded border border-slate-200">
                              <span>ស្មើខែមុន</span>
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase">ការប្រើប្រាស់ខែមុន</span>
                            <p className="font-extrabold text-slate-700 font-mono mt-0.5">{formatUSD(activeElecRecord.costBeforeUsd)}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase">ការប្រើប្រាស់ខែនេះ</span>
                            <p className="font-extrabold text-amber-600 font-mono mt-0.5">{formatUSD(activeElecRecord.costAfterUsd)}</p>
                          </div>
                        </div>
                      </div>

                      {activeElecRecord.notes && (
                        <div className="bg-amber-50/40 border border-amber-100/30 rounded-lg p-2.5 max-w-xs text-[11px] font-medium text-slate-600">
                          <span className="block text-amber-800 uppercase tracking-wide text-[9px] font-black mb-0.5">សម្គាល់ (Notes)</span>
                          {activeElecRecord.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Water Analytics */}
          <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-2 text-sm font-black text-slate-800 font-sans">
                  <Droplet className="w-4 h-4 text-sky-500 fill-sky-500/10" />
                  <span>ទឹកប្រើប្រាស់ (Water Supply Expense)</span>
                </span>
                <span className="text-[10px] bg-sky-50 text-sky-700 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  គិតជាដុល្លារ ($)
                </span>
              </div>

              {sortedWater.length === 0 ? (
                <div className="py-14 text-center text-xs font-bold text-slate-400 flex flex-col items-center justify-center gap-2">
                  <AlertCircle className="w-8 h-8 text-slate-300" />
                  <span>មិនទាន់មានទិន្នន័យចំណាយទឹកដើម្បីបង្ហាញទេ</span>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1 max-w-[220px]">
                    សូមចូលទៅកាន់ផ្នែក "ការប្រើប្រាស់ទឹកប្រចាំខែ" ដើម្បីបំពេញទិន្នន័យដំបូង!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* SVG Chart */}
                  <div className="relative w-full overflow-hidden bg-white/75 backdrop-blur-sm border border-slate-100 p-2 rounded-xl">
                    <svg viewBox="0 0 500 240" className="w-full h-auto">
                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                        const yVal = pct * waterMax;
                        const yPos = 240 - 40 - pct * (240 - 40 - 30);
                        return (
                          <g key={`water-grid-${idx}`}>
                            <line 
                              x1={50} 
                              y1={yPos} 
                              x2={500 - 20} 
                              y2={yPos} 
                              stroke="#f1f5f9" 
                              strokeWidth="1"
                              strokeDasharray="4,4" 
                            />
                            <text 
                              x={42} 
                              y={yPos + 3.5} 
                              textAnchor="end" 
                              className="text-[10px] font-black fill-slate-400 font-mono"
                            >
                              ${Math.round(yVal)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Bar groups */}
                      {sortedWater.map((r, i) => {
                        const xCenter = 50 + (i + 0.5) * (chartWidth / sortedWater.length);
                        const xBefore = xCenter - singleBarWidth - 1.5;
                        const xAfter = xCenter + 1.5;

                        const yBefore = 240 - 40 - (r.costBeforeUsd / waterMax) * chartHeight;
                        const yAfter = 240 - 40 - (r.costAfterUsd / waterMax) * chartHeight;

                        const hBefore = Math.max(3, (r.costBeforeUsd / waterMax) * chartHeight);
                        const hAfter = Math.max(3, (r.costAfterUsd / waterMax) * chartHeight);

                        const isHovered = hoveredWaterIdx === i;

                        return (
                          <g key={`water-bar-group-${r.id}`}>
                            {/* Bar Before */}
                            <rect
                              x={xBefore}
                              y={yBefore}
                              width={singleBarWidth}
                              height={hBefore}
                              fill="#cbd5e1"
                              rx="2.5"
                              opacity={isHovered ? 0.9 : 0.6}
                              className="transition-all duration-200"
                            />
                            {/* Bar After */}
                            <rect
                              x={xAfter}
                              y={yAfter}
                              width={singleBarWidth}
                              height={hAfter}
                              fill="#0ea5e9"
                              rx="2.5"
                              opacity={isHovered ? 1 : 0.85}
                              className="transition-all duration-200"
                            />
                            
                            {/* Month labels */}
                            <text
                              x={xCenter}
                              y={240 - 40 + 18}
                              textAnchor="middle"
                              className={`text-[10px] font-black transition-all ${
                                isHovered ? 'fill-slate-900 font-extrabold' : 'fill-slate-400'
                              }`}
                            >
                              {formatKhmerMonthShort(r.monthYear)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Connect Trendline for costAfterUsd */}
                      <path 
                        d={waterTrendPath} 
                        fill="none" 
                        stroke="#0284c7" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="opacity-70"
                      />

                      {/* Trendline Connection Dots */}
                      {sortedWater.map((r, i) => {
                        const xCenter = 50 + (i + 0.5) * (chartWidth / sortedWater.length);
                        const yAfter = 240 - 40 - (r.costAfterUsd / waterMax) * chartHeight;
                        const isHovered = hoveredWaterIdx === i;

                        return (
                          <circle
                            key={`water-point-${r.id}`}
                            cx={xCenter}
                            cy={yAfter}
                            r={isHovered ? 6 : 4}
                            fill="#38bdf8"
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="transition-all duration-200 cursor-pointer"
                          />
                        );
                      })}

                      {/* Vertical line indicator */}
                      {hoveredWaterIdx !== null && (
                        (() => {
                          const xCenter = 50 + (hoveredWaterIdx + 0.5) * (chartWidth / sortedWater.length);
                          return (
                            <line
                              x1={xCenter}
                              y1={30}
                              x2={xCenter}
                              y2={240 - 40}
                              stroke="#cbd5e1"
                              strokeWidth="1"
                              strokeDasharray="3,3"
                              pointerEvents="none"
                            />
                          );
                        })()
                      )}

                      {/* Hover Trigger zones */}
                      {sortedWater.map((r, i) => {
                        const xLeft = 50 + i * (chartWidth / sortedWater.length);
                        const widthOfBucket = chartWidth / sortedWater.length;
                        return (
                          <rect
                            key={`water-trigger-${r.id}`}
                            x={xLeft}
                            y={30}
                            width={widthOfBucket}
                            height={chartHeight}
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredWaterIdx(i)}
                            onMouseLeave={() => setHoveredWaterIdx(null)}
                          />
                        );
                      })}
                    </svg>
                  </div>

                  {/* Active Month Detailed Info Overlay */}
                  {activeWaterRecord && (
                    <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-150">
                      <div>
                        <div className="flex items-center flex-wrap gap-2 text-sans">
                          <span className="text-xs font-black text-slate-800">
                            ខែ {formatKhmerMonth(activeWaterRecord.monthYear)}
                          </span>
                          {/* Saving / Spurge badge */}
                          {activeWaterRecord.differenceUsd < 0 ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-100">
                              <ArrowDownRight className="w-3.5 h-3.5" />
                              <span>សន្សំបាន {formatUSD(Math.abs(activeWaterRecord.differenceUsd))} ({Math.abs(activeWaterRecord.differencePercent).toFixed(1)}%)</span>
                            </span>
                          ) : activeWaterRecord.differenceUsd > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded border border-rose-100">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>កើនឡើង {formatUSD(activeWaterRecord.differenceUsd)} (+{activeWaterRecord.differencePercent.toFixed(1)}%)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded border border-slate-200">
                              <span>ស្មើខែមុន</span>
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase">ការប្រើប្រាស់ខែមុន</span>
                            <p className="font-extrabold text-slate-700 font-mono mt-0.5">{formatUSD(activeWaterRecord.costBeforeUsd)}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase">ការប្រើប្រាស់ខែនេះ</span>
                            <p className="font-extrabold text-sky-600 font-mono mt-0.5">{formatUSD(activeWaterRecord.costAfterUsd)}</p>
                          </div>
                        </div>
                      </div>

                      {activeWaterRecord.notes && (
                        <div className="bg-sky-50/40 border border-sky-100/30 rounded-lg p-2.5 max-w-xs text-[11px] font-medium text-slate-600">
                          <span className="block text-sky-700 uppercase tracking-wide text-[9px] font-black mb-0.5">សម្គាល់ (Notes)</span>
                          {activeWaterRecord.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Google Sheets Integration Panel */}
      <div id="google-sheets-sync-panel" className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 animate-pulse" />
              <span>សមកាលកម្មទិន្នន័យទៅកាន់ Google Sheets (Google Sheets Sync)</span>
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              ភ្ជាប់ប្រព័ន្ធគ្រប់គ្រងសាលាទៅកាន់បន្ទះការងារ Google Sheets ដើម្បីបម្រុងទុកទិន្នន័យបុគ្គលិក វត្តមាន និងការចំណាយដោយស្វ័យប្រវត្ត
            </p>
          </div>
          {googleToken && (
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="text-xs font-black text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-rose-100 disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ផ្តាច់គណនី (Disconnect)</span>
            </button>
          )}
        </div>

        {!authInitialized ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : !googleToken ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <h5 className="text-sm font-extrabold text-slate-800">ហេតុអ្វីបានជាត្រូវប្រើការសមកាលកម្ម Google Sheets?</h5>
              <ul className="text-xs text-slate-600 space-y-2 list-none">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><b>បម្រុងទុកដោយស្វ័យប្រវត្តិ៖</b> មិនបារម្ភពីការបាត់បង់ទិន្នន័យ ប្រព័ន្ធរក្សាទិន្នន័យនៅលើ Google Drive ផ្ទាល់ខ្លួនរបស់អ្នក។</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><b>ងាយស្រួលចែករំលែក៖</b> អ្នកអាចចែករំលែកតារាងវត្តមាន និងចំណាយទៅកាន់គណៈគ្រប់គ្រងសាលាបានរហ័ស។</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><b>ទាញយករបាយការណ៍ស្អាតៗ៖</b> ទិន្នន័យត្រូវបានរៀបចំជា ៤ សន្លឹកបន្ទះការងារ (Sheets) ផ្សេងគ្នាស្អាតជានិច្ច។</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col items-center justify-center border border-slate-100 bg-slate-50/50 p-6 rounded-2xl text-center space-y-4">
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <p className="text-xs text-slate-500 font-semibold max-w-[280px]">
                ភ្ជាប់គណនី Google របស់អ្នកឥឡូវនេះ ដើម្បីបើកដំណើរការមុខងារបង្កើត និងធ្វើសមកាលកម្ម Google Sheets។
              </p>
              
              <button 
                onClick={handleSignIn}
                disabled={isLoading}
                className="gni-button-wrapper gsi-material-button text-xs select-none disabled:opacity-50"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">Sign in with Google</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            {/* User Meta Information */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-emerald-100 bg-emerald-50/20 p-4 rounded-xl gap-4">
              <div className="flex items-center gap-3">
                {googleUser?.photoURL ? (
                  <img 
                    src={googleUser.photoURL} 
                    alt={googleUser.displayName || 'Google Profile'} 
                    className="w-10 h-10 rounded-full border-2 border-emerald-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-150 bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                    {googleUser?.displayName?.charAt(0) || 'G'}
                  </div>
                )}
                <div>
                  <h6 className="text-[13px] font-black text-slate-800">{googleUser?.displayName}</h6>
                  <p className="text-[11px] text-slate-500 font-mono leading-none mt-1">{googleUser?.email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-150/65 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>គណនីបានភ្ជាប់ជោគជ័យ</span>
                </span>
              </div>
            </div>

            {/* Sheets Status Section */}
            <div className="border border-slate-100 rounded-xl p-4 sm:p-6 bg-slate-50/35">
              {!spreadsheetId ? (
                <div className="text-center py-4 space-y-4">
                  <div className="text-slate-400">
                    <FileSpreadsheet className="w-12 h-12 mx-auto stroke-[1.5]" />
                  </div>
                  <div>
                    <h6 className="text-xs sm:text-sm font-extrabold text-slate-800">មិនទាន់មានបន្ទះការងារ Google Sheet ដែលតភ្ជាប់ឡើយ</h6>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                      ចុចប៊ូតុងខាងក្រោម ដើម្បីបង្កើត Google Spreadsheet ថ្មីមួយដោយស្វ័យប្រវត្ត។ ប្រព័ន្ធនឹងរៀបចំសន្លឹកកិច្ចការទាំង ៤ ផ្សេងគ្នា៖ ព័ត៌មានបុគ្គលិក, វត្តមានបុគ្គលិក, ការចំណាយភ្លើង, និងការចំណាយទឹក ជូនលោកអ្នកភ្លាមៗ។
                    </p>
                  </div>
                  <button
                    onClick={handleCreateSpreadsheet}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4" />
                    )}
                    <span>បង្កើតបន្ទះការងារ Google Sheet ថ្មី (Create & Sync)</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-3">
                    <span className="bg-emerald-100 text-emerald-850 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                      បន្ទះការងារសកម្ម (Active Spreadsheet)
                    </span>
                    <h6 className="text-sm font-black text-slate-800">
                      WIS School Management System Master
                    </h6>
                    <div className="text-[11px] space-y-1.5 font-semibold text-slate-500">
                      <p><b>Spreadsheet ID:</b> <code className="bg-slate-100 text-[10px] px-1 py-0.5 rounded font-mono">{spreadsheetId.substring(0, 16)}...</code></p>
                      <p><b>សន្លឹកការងារ៖</b> ព័ត៌មានបុគ្គលិក, វត្តមានវត្តមាន, ការចាយវាយអគ្គិសនី, ការចាយវាយទឹក</p>
                      {lastSyncedAt && (
                        <p className="text-emerald-700 flex items-center gap-1.5 mt-2">
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>សមកាលកម្មជោគជ័យចុងក្រោយ៖ <b>{lastSyncedAt}</b></span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
                    {spreadsheetUrl && (
                      <a
                        href={spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-extrabold text-xs px-4 py-2.5 rounded-lg transition-colors text-center"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>បើកមើលលើ Sheets (View Sheet)</span>
                      </a>
                    )}

                    <button
                      onClick={handleSyncData}
                      disabled={isLoading}
                      className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span>ធ្វើសមកាលកម្មឥឡូវនេះ (Sync Now)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Dialog Banner */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-100 text-rose-800 text-xs px-4 py-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <p className="font-semibold">{errorMessage}</p>
          </div>
        )}

        {/* Sync Success micro feedback */}
        {syncStatus === 'success' && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-start gap-2 shadow-inner">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 animate-bounce" />
            <p className="font-extrabold">ទិន្នន័យត្រូវបានបញ្ជូនទៅកាន់គណនី Google Sheets របស់លោកអ្នកប្រកបដោយជោគជ័យ!</p>
          </div>
        )}
      </div>

    </div>
  );
}
