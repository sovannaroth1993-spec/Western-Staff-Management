import { useState, useMemo } from 'react';
import { Staff, AttendanceRecord, DEPARTMENT_NAMES_KM, Department, ElectricityRecord, WaterRecord, ALL_DEPARTMENTS } from '../types';
import { 
  Send, Share2, Key, CheckCircle, MessageSquare, AlertCircle, Eye, EyeOff, LayoutDashboard, Settings2, Info
} from 'lucide-react';

interface TelegramReporterProps {
  staffList: Staff[];
  attendanceRecords: AttendanceRecord[];
  selectedDate: string;
  electricityRecords: ElectricityRecord[];
  waterRecords: WaterRecord[];
}

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

const formatUSD = (num: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
};

export default function TelegramReporter({
  staffList,
  attendanceRecords,
  selectedDate,
  electricityRecords = [],
  waterRecords = []
}: TelegramReporterProps) {
  // Telegram Integration State
  const [telegramBotToken, setTelegramBotToken] = useState(() => localStorage.getItem('wis_telegram_bot_token') || '');
  const [telegramChatId, setTelegramChatId] = useState(() => localStorage.getItem('wis_telegram_chat_id') || '');
  const [telegramSendStatus, setTelegramSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [telegramSendError, setTelegramSendError] = useState('');
  const [showTelegramSettings, setShowTelegramSettings] = useState(false);
  const [showTelegramPreview, setShowTelegramPreview] = useState(true);

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

  const latestElec = useMemo(() => {
    if (!electricityRecords || electricityRecords.length === 0) return null;
    return [...electricityRecords].sort((a, b) => b.monthYear.localeCompare(a.monthYear))[0];
  }, [electricityRecords]);

  const latestWater = useMemo(() => {
    if (!waterRecords || waterRecords.length === 0) return null;
    return [...waterRecords].sort((a, b) => b.monthYear.localeCompare(a.monthYear))[0];
  }, [waterRecords]);

  // HTML format helper (for Bot API which supports bold, code, tags)
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

  const sendToTelegramBot = async () => {
    if (!telegramBotToken.trim() || !telegramChatId.trim()) {
      setTelegramSendStatus('error');
      setTelegramSendError('សូមបញ្ចូល Telegram Bot Token និង Chat ID ជាមុនសិន!');
      setShowTelegramSettings(true);
      return;
    }

    setTelegramSendStatus('sending');
    setTelegramSendError('');

    try {
      const url = `https://api.telegram.org/bot${telegramBotToken.trim()}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramChatId.trim(),
          text: reportTextHtml,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();
      if (response.ok && data.ok) {
        setTelegramSendStatus('success');
        setTimeout(() => {
          setTelegramSendStatus('idle');
        }, 5000);
      } else {
        setTelegramSendStatus('error');
        setTelegramSendError(data.description || 'ការផ្ញើសារបានបរាជ័យ។ សូមពិនិត្យមើលព័ត៌មានដែលបានបំពេញរួចព្យាយាមម្តងទៀត!');
      }
    } catch (err: any) {
      setTelegramSendStatus('error');
      setTelegramSendError(err.message || 'មិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេ Telegram បានទេ!');
    }
  };

  const handleSaveTelegramConfig = (token: string, chatId: string) => {
    setTelegramBotToken(token);
    setTelegramChatId(chatId);
    localStorage.setItem('wis_telegram_bot_token', token);
    localStorage.setItem('wis_telegram_chat_id', chatId);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      
      {/* Title & Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-start gap-4">
          <div className="bg-sky-50 text-sky-600 p-3 rounded-2xl border border-sky-100 shrink-0">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.66-.52.36-.97.53-1.35.52-.42-.01-1.23-.24-1.83-.44-.74-.24-1.33-.37-1.28-.79.03-.22.33-.45.91-.69 3.56-1.55 5.93-2.57 7.12-3.06 3.39-1.4 4.09-1.64 4.55-1.65.1 0 .33.03.48.15.12.1.15.24.17.34 0 .07.01.21 0 .28z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-wide uppercase">
              ប្រព័ន្ធបញ្ជូនព័ត៌មានទៅ Telegram
            </h3>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Telegram Report Center — បញ្ជូនរបាយការណ៍សង្ខេបវត្តមានប្រចាំថ្ងៃ និងទិន្នន័យអគ្គិសនី-ទឹកទៅកាន់គ្រុបការងារ
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowTelegramPreview(!showTelegramPreview)}
          className="text-xs font-extrabold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-xl border border-sky-200 flex items-center gap-1.5 transition self-start sm:self-center"
        >
          <MessageSquare className="w-4 h-4" />
          {showTelegramPreview ? 'លាក់គំរូអត្ថបទ' : 'បង្ហាញគំរូអត្ថបទ (Preview)'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Hand: Controls & Settings */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Quick Option: Direct Web Link */}
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ផ្ញើផ្ទាល់ (No Bot Request)
              </span>
              <h4 className="text-sm font-black text-slate-800">
                ផ្ញើដោយផ្ទាល់តាមរយៈតំណភ្ជាប់ Telegram (Share Link)
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                ចុចប៊ូតុងខាងក្រោមដើម្បីបង្កើតតំណភ្ជាប់ (Share Link) រួចដំណើរការផ្ញើចូលទៅកាន់គ្រុប ឬឆានែលការងាររបស់អ្នកដោយសេរី ដោយមិនចាំបាច់ឆ្លងកាត់ការកំណត់ Bot API ឡើយ។
              </p>
            </div>
            
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(reportTextPlain)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl border border-sky-500 shadow-md transition-all scale-100 active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" /> Sharing Link (.t.me)
            </a>
          </div>

          {/* Advanced Option: Bot Setup */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[9px] bg-indigo-100 text-indigo-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  ប្រព័ន្ធស្វ័យប្រវត្ត (Bot Agent)
                </span>
                <h4 className="text-sm font-black text-slate-800">
                  ផ្ញើដោយស្វ័យប្រវត្តិតាមរយៈ Telegram Bot API
                </h4>
              </div>
              <button
                onClick={() => setShowTelegramSettings(!showTelegramSettings)}
                className="text-xs font-black text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl transition flex items-center gap-1 shrink-0"
              >
                <Settings2 className="w-3.5 h-3.5" />
                {showTelegramSettings ? 'លាក់ការកំណត់' : 'កំណត់អត្តសញ្ញាណ'}
              </button>
            </div>

            {/* Help guidelines and configurations */}
            {(showTelegramSettings || (!telegramBotToken || !telegramChatId)) && (
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-4 text-xs animate-fade-in">
                <div className="space-y-1 bg-indigo-50/50 border border-indigo-100/60 p-3 rounded-lg">
                  <p className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-indigo-600" /> ជំនួយណែនាំ៖
                  </p>
                  <ol className="list-decimal pl-4 mt-1 space-y-1.5 font-medium text-slate-600 text-[11px] leading-relaxed">
                    <li>ផ្ញើរសារទៅកាន់ <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">@BotFather</a> រួចវាយ <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-700">/newbot</code> ដើម្បីទទួលបាន <b>Bot Token</b></li>
                    <li>បង្កើនក្រុម (Group) ឬឆានែលការងារ ហើយបន្ថែម Bot នោះចូលទៅក្នុងនោះ</li>
                    <li>ស្វែងរក Chat ID នៃក្រុមនោះ (ដោយប្រើ Bot បន្ថែមដូចជា <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">@userinfobot</a> រួចបញ្ជូនសារទៅកាន់វា)</li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">Telegram Bot Token</label>
                    <input
                      type="text"
                      placeholder="ឧ. 123456:ABC-DEF..."
                      value={telegramBotToken}
                      onChange={(e) => handleSaveTelegramConfig(e.target.value, telegramChatId)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-[11px] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">Telegram Chat ID (ឆានែល/Group ID)</label>
                    <input
                      type="text"
                      placeholder="ឧ. -100123456789"
                      value={telegramChatId}
                      onChange={(e) => handleSaveTelegramConfig(telegramBotToken, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-[11px] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Send status & fire triggers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-slate-400">ស្ថានភាព៖ </span>
                {telegramSendStatus === 'idle' && (
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">រួចរាល់សម្រាប់ការផ្ញើ</span>
                )}
                {telegramSendStatus === 'sending' && (
                  <span className="text-[11px] font-bold text-indigo-600 animate-pulse flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                    កំពុងបញ្ជូនទៅ Telegram...
                  </span>
                )}
                {telegramSendStatus === 'success' && (
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 animate-pulse bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    បញ្ជូនរបាយការណ៍ជោគជ័យ!
                  </span>
                )}
                {telegramSendStatus === 'error' && (
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                    បរាជ័យ៖ {telegramSendError.slice(0, 40)}...
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={sendToTelegramBot}
                disabled={telegramSendStatus === 'sending'}
                className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs px-6 py-3 rounded-xl border border-indigo-500 shadow-md transition-all scale-100 active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {telegramSendStatus === 'sending' ? 'កំពុងផ្ញើ...' : 'ផ្ញើរបាយការណ៍ភ្លាមៗ (Bot)'}
              </button>
            </div>

            {telegramSendStatus === 'error' && telegramSendError && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-rose-700 text-[11px] font-semibold flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <div>
                  <span className="block font-extrabold text-rose-800">កំហុសឆ្គងពីប្រព័ន្ធ Telegram ៖</span>
                  {telegramSendError}
                </div>
              </div>
            )}

          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-950 font-medium leading-relaxed">
              <span className="font-extrabold block mb-1">ព័ត៌មានបន្ថែម៖</span>
              របាយការណ៍ដែលបម្រុងនឹងបញ្ជូនទៅកាន់ Telegram នឹងផ្អែកលើការស្រង់វត្តមានប្រចាំថ្ងៃ និងកំណត់ត្រាប្រើប្រាស់ទឹកភ្លើងចុងក្រោយរបស់សាលាវេស្ទើនអន្តរជាតិ។ អ្នកអាចជ្រើសរើស ថ្ងៃខែឆ្មាំស្រង់វត្តមាន នៅក្នុងផ្នែក <b>ស្រង់វត្តមានប្រចាំថ្ងៃ</b> ដើម្បីផ្លាស់ប្តូរកាលបរិច្ឆេទរបាយការណ៍។
            </div>
          </div>

        </div>

        {/* Right Hand: Text Preview */}
        {showTelegramPreview && (
          <div className="lg:col-span-6 flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden min-h-[420px]">
            {/* Custom Telegram chat style bar */}
            <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-black flex items-center justify-center text-xs shadow-inner">
                  TG
                </div>
                <div>
                  <h5 className="text-xs font-black text-white leading-tight">Telegram Group Report</h5>
                  <span className="text-[9px] text-emerald-400 font-bold">bot is typing...</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 font-extrabold pr-1">
                PREVIEW ({selectedDate})
              </div>
            </div>

            {/* Telegram simulated message preview bubbles */}
            <div className="p-4 flex-1 overflow-auto bg-slate-950 flex flex-col justify-end">
              <div className="bg-slate-800/90 border border-slate-700/50 rounded-2xl rounded-tr-none text-slate-100 text-[11px] font-medium leading-relaxed p-4 ml-6 self-end max-w-md shadow-xl whitespace-pre-wrap font-sans">
                {reportTextPlain}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
