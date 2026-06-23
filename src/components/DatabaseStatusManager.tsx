import React, { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, Trash2, ArrowUpCircle, ArrowDownCircle, CheckCircle, 
  AlertTriangle, Search, Info, Shield, Download, Upload, Server, HardDrive, AlertCircle
} from 'lucide-react';

interface KeyStatus {
  key: string;
  nameKh: string;
  description: string;
  localSize: number; // in bytes
  serverSize: number; // in bytes
  localType: string;
  serverType: string;
  localPreview: string;
  serverPreview: string;
  isInSync: boolean;
  status: 'synchronized' | 'mismatch' | 'local_only' | 'server_only' | 'empty';
}

const keyMetadata: Record<string, { kh: string; desc: string }> = {
  wis_staff_list: { kh: '📋 បញ្ជីរាយនាមបុគ្គលិក', desc: 'ព័ត៌មានលម្អិតរបស់គ្រូបង្រៀន និងបុគ្គលិកទាំងអស់' },
  wis_attendance_records: { kh: '✅ កំណត់ត្រាវត្តមានមន្ត្រី', desc: 'របាយការណ៍វត្តមានប្រចាំថ្ងៃ និងច្បាប់ឈប់សម្រាករបស់បុគ្គលិក' },
  wis_electricity_records: { kh: '⚡ កំណត់ត្រាប្រើប្រាស់អគ្គិសនី', desc: 'លេខកុងទ័រ អានុភាពសរុប និងការប្រើប្រាស់អគ្គិសនីប្រចាំខែ' },
  wis_water_records: { kh: '💧 កំណត់ត្រាប្រើប្រាស់ទឹក', desc: 'កំណត់ត្រាចំណុះប្រើប្រាស់ទឹកស្អាត និងការចំណាយប្រចាំខែ' },
  wis_fixed_assets: { kh: '🏫 បញ្ជីសារពើភ័ណ្ឌទ្រព្យសកម្ម', desc: 'បញ្ជីសម្ភារៈ គ្រឿងសង្ហារិម និងទ្រព្យសម្បត្តិថេររបស់សាលា' },
  wis_student_insurances: { kh: '🛡️ បញ្ជីធានារ៉ាប់រងសិស្សានុសិស្ស', desc: 'ព័ត៌មានអំពីក្រុមហ៊ុន និងកញ្ចប់ធានារ៉ាប់រងរបស់សិស្ស' },
  wis_fe_inspections: { kh: '🧯 កំណត់ត្រាត្រួតពិនិត្យបំពង់ពន្លត់អគ្គិភ័យ', desc: 'កំណត់ត្រាសុវត្ថិភាព និងការត្រួតពិនិត្យបំពង់ការពន្លត់អគ្គិភ័យ' },
  wis_ac_inspections: { kh: '❄️ កំណត់ត្រាត្រួតពិនិត្យម៉ាស៊ីនត្រជាក់', desc: 'ការលាងសម្អាត ជួសជុល និងគម្រោងត្រួតពិនិត្យម៉ាស៊ីនត្រជាក់' },
  school_admin_docs_files_v1: { kh: '📁 ឯកសារច្បាប់ និងលិខិតរដ្ឋបាល', desc: 'ឯកសាររដ្ឋបាល PDFs, ពាក្យស្នើសុំ និងលិខិតបទដ្ឋានរដ្ឋបាល' },
  school_admin_docs_status_v1: { kh: '⚙️ ស្ថានភាពឯកសាររដ្ឋបាល', desc: 'ព័ត៌មានលម្អិត និងកាលបរិច្ឆេទបង្កើតឯកសាររដ្ឋបាល' },
  wis_profile_name: { kh: '👤 ឈ្មោះគណនីបច្ចុប្បន្ន', desc: 'ឈ្មោះបង្ហាញចម្បងរបស់អ្នកប្រើប្រាស់ដែលកំពុងចូលប្រព័ន្ធ' },
  wis_profile_role: { kh: '🔑 តួនាទីគណនីក្នុងប្រព័ន្ធ', desc: 'កម្រិតសិទ្ធិប្រើប្រាស់ (Admin ឬ Standard)' },
  wis_profile_avatar: { kh: '🖼️ រូបភាពកម្រងព័ត៌មាន', desc: 'រូបភាពកម្រងព័ត៌មាន Base64 របស់អ្នកប្រើប្រាស់ចរន្ត' },
  wis_school_logo: { kh: '🏫 ឡូហ្គោសាលា', desc: 'រូបភាពឡូហ្គោរបស់សាលារៀនដែលបានកែសម្រួល' },
  wis_telegram_bot_token: { kh: '🤖 Token របស់ Bot Telegram', desc: 'កូដតភ្ជាប់ API Bot សម្រាប់ផ្ញើរបាយការណ៍ចូលក្រុម' },
  wis_telegram_chat_id: { kh: '💬 Chat ID ក្រុម Telegram', desc: 'លេខសម្គាល់លេខក្រុម Telegram ដែលត្រូវទទួលរបាយការណ៍' },
  wis_users_list: { kh: '👥 គណនីប្រើប្រាស់ទាំងអស់', desc: 'បញ្ជីគណនីដែលមានសិទ្ធិចូលប្រើប្រាស់ប្រព័ន្ធ' },
  wis_user_requests: { kh: '📥 សំណើសុំចុះឈ្មោះ', desc: 'បញ្ជីសំណើសុំបង្កើតគណនីថ្មីរង់ចាំការអនុម័ត' },
  wis_school_events: { kh: '📅 កាលវិភាគព្រឹត្តិការណ៍សាលា', desc: 'ពិធីបុណ្យ បេសកកម្ម និងសកម្មភាពផ្សេងៗរបស់សាលា' },
  wis_monthly_reports: { kh: '📊 កំណត់ត្រារបាយការណ៍ប្រចាំខែ', desc: 'របាយការណ៍ហិរញ្ញវត្ថុ និងសកម្មភាពរួមប្រចាំខែនីមួយៗ' },
  wis_active_academic_year: { kh: '🏫 ឆ្នាំសិក្សាដែលកំពុងដំណើរការ', desc: 'ឆ្នាំសិក្សាចម្បងដែលកំពុងជ្រើសរើសសម្រាប់ទិន្នន័យ' },
  wis_academic_years: { kh: '📅 បញ្ជីឆ្នាំសិក្សាចរន្ត', desc: 'បញ្ជីឆ្នាំសិក្សាដែលមានស្រាប់ និងប្រព័ន្ធគ្រប់គ្រង' },
  wis_khmer_calendar_notes: { kh: '🇰🇭 កំណត់ត្រាក្រឡាប្រតិទិនខ្មែរ', desc: 'កំណត់ត្រា និងកិច្ចការផ្សេងៗដែលកត់ចំណាំតាមថ្ងៃនីមួយៗ' },
  wis_remotescan_channel: { kh: '📡 ប៉ុស្តិ៍ស្កេនពីចម្ងាយ', desc: 'លេខឆានែលសម្រាប់ស្កេនកាតព័ត៌មានពីទូរស័ព្ទដៃ' },
  wis_student_list: { kh: '🎓 បញ្ជីរាយនាមសិស្សានុសិស្ស', desc: 'ព័ត៌មានសិស្ស ថ្នាក់សិក្សា និងប្រវត្តិសិក្សាទូទៅ' },
  wis_student_grade_statistics: { kh: '📈 ស្ថិតិពិន្ទុ និងប្រឡងសិស្ស', desc: 'ការវិភាគស្ថិតិនិទ្ទេសជោគជ័យតាមកម្រិតថ្នាក់នីមួយៗ' },
  wis_student_statistics_academic_year: { kh: '📅 ឆ្នាំសិក្សាស្ថិតិសិស្ស', desc: 'ជម្រើសតម្រងផ្អែកលើឆ្នាំសិក្សាសម្រាប់ស្ថិតិពិន្ទុ' },
  wis_cctv_records: { kh: '📹 បញ្ជីត្រួតពិនិត្យប្រព័ន្ធកាមេរ៉ា', desc: 'សកម្មភាព និងស្ថានភាពដំណើរការរបស់កាមេរ៉ាសុវត្ថិភាពសាលា' },
  wis_daily_reports: { kh: '📝 របាយការណ៍ប្រចាំថ្ងៃរបស់សាលា', desc: 'កំណត់ត្រារបាយការណ៍សង្ខេបប្រចាំថ្ងៃរបស់សាលា' },
  wis_weekly_staff_followups: { kh: '📋 កំណត់ត្រាតាមដានការងារប្រចាំសប្ដាហ៍', desc: 'របាយការណ៍ស្ទាបស្ទង់តាមដានកិច្ចការងាររបស់បុគ្គលិក' },
  wis_monthly_staff_evaluations: { kh: '📊 កំណត់ត្រាវាយតម្លៃបុគ្គលិកប្រចាំខែ', desc: 'របាយការណ៍លទ្ធផលការងារ និងការវាយតម្លៃលំអិតប្រចាំខែ' },
  wis_cleaner_security_evaluations: { kh: '🧹 កំណត់ត្រាវាយតម្លៃអនាម័យនិងសន្តិសុខ', desc: 'ការត្រួតពិនិត្យការងាររបស់ផ្នែកសម្អាត និងផ្នែកសន្តិសុខ' },
  wis_followup_tasks: { kh: '📌 បញ្ជីកិច្ចការងារដែលត្រូវតាមដាន', desc: 'កិច្ចការងាររដ្ឋបាលទូទៅ កំពុងដោះស្រាយ និងបានជោគជ័យ' },
  wis_insurance_followup_records: { kh: '🛡️ កំណត់ត្រាធានារ៉ាប់រងតាមដាន', desc: 'ការតាមដានសំណុំឯកសារធានារ៉ាប់រងសិស្សានុសិស្ស' },
  wis_medicines: { kh: '💊 បញ្ជីស្តុកឱសថបន្ទប់សង្គ្រោះបឋម', desc: 'បញ្ជីថ្នាំព្យាបាល និងសម្ភារៈបន្ទប់សុខភាពបុគ្គលិកសាលា' },
  wis_medicine_usage_logs: { kh: '📝 កំណត់ត្រាប្រើប្រាស់ថ្នាំព្យាបាល', desc: 'ការផ្ដល់ថ្នាំជូនសិស្ស ឬបុគ្គលិកដែលមានបញ្ហាសុខភាព' },
  wis_medicine_stock_ins: { kh: '📥 កំណត់ត្រានាំចូលថ្នាំពេទ្យ', desc: 'កំណត់ត្រានាំចូល និងកាលបរិច្ឆេទផុតកំណត់របស់ឱសថ' },
};

interface DatabaseStatusManagerProps {
  currentUser: any;
  lang?: 'en' | 'kh';
}

export const DatabaseStatusManager: React.FC<DatabaseStatusManagerProps> = ({ currentUser, lang = 'kh' }) => {
  const [dbKeys, setDbKeys] = useState<KeyStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedKey, setSelectedKey] = useState<KeyStatus | null>(null);

  const [showSuccessToasts, setShowSuccessToastsState] = useState<boolean>(() => {
    return localStorage.getItem('wis_show_sync_success_toasts') === 'true';
  });

  const toggleSuccessToasts = (val: boolean) => {
    localStorage.setItem('wis_show_sync_success_toasts', val ? 'true' : 'false');
    setShowSuccessToastsState(val);
    window.dispatchEvent(new CustomEvent('wis-sync-settings-changed'));
  };

  const fetchKeysStatus = async () => {
    setIsLoading(true);
    setGlobalMessage(null);
    try {
      const res = await fetch('/api/db/all');
      if (!res.ok) {
        throw new Error('Failed to load server database.');
      }
      const data = await res.json();
      const serverDb = data && data.db ? data.db : {};

      // Build listing of keys from server and local storage
      const keysSet = new Set<string>();
      Object.keys(serverDb).forEach(k => {
        if (k.startsWith('wis_') || k.startsWith('school_') || k.includes('docs_')) {
          keysSet.add(k);
        }
      });
      // Add all from localStorage
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && (k.startsWith('wis_') || k.startsWith('school_') || k.includes('docs_'))) {
          keysSet.add(k);
        }
      }

      // Add default tracking keys from metadata if they don't exist
      Object.keys(keyMetadata).forEach(k => keysSet.add(k));

      const compiledList: KeyStatus[] = Array.from(keysSet).map(key => {
        const localValRaw = window.localStorage.getItem(key);
        const serverVal = serverDb[key];

        let localVal: any = null;
        if (localValRaw) {
          try {
            localVal = JSON.parse(localValRaw);
          } catch {
            localVal = localValRaw;
          }
        }

        const localSize = localValRaw ? new Blob([localValRaw]).size : 0;
        const serverSize = serverVal ? new Blob([JSON.stringify(serverVal)]).size : 0;
        
        let localType = 'empty';
        if (localVal !== null && localVal !== undefined) {
          localType = Array.isArray(localVal) ? 'array' : typeof localVal;
        }

        let serverType = 'empty';
        if (serverVal !== null && serverVal !== undefined) {
          serverType = Array.isArray(serverVal) ? 'array' : typeof serverVal;
        }

        const getPreviewText = (val: any) => {
          if (val === null || val === undefined) return lang === 'kh' ? 'គ្មានទិន្នន័យ (No Data)' : 'No Data';
          if (Array.isArray(val)) {
            return lang === 'kh' ? `តារាងមាន ${val.length} ជួរ (Array list)` : `List with ${val.length} entries`;
          }
          if (typeof val === 'object') {
            return lang === 'kh' ? `ផ្ទាំងព័ត៌មាន (Object: ${Object.keys(val).join(', ')})` : `Object attrs: ${Object.keys(val).join(', ')}`;
          }
          const str = String(val);
          return str.length > 60 ? str.substring(0, 57) + '...' : str;
        };

        const localPreview = getPreviewText(localVal);
        const serverPreview = getPreviewText(serverVal);

        // Check synchronization status
        let isInSync = false;
        let status: KeyStatus['status'] = 'empty';

        if (localValRaw && serverVal !== undefined && serverVal !== null) {
          const localStringified = typeof localVal === 'object' ? JSON.stringify(localVal) : String(localVal);
          const serverStringified = JSON.stringify(serverVal);
          
          isInSync = localStringified === serverStringified;
          status = isInSync ? 'synchronized' : 'mismatch';
        } else if (localValRaw) {
          status = 'local_only';
        } else if (serverVal !== undefined && serverVal !== null) {
          status = 'server_only';
        }

        const fallbackKh = key.replace(/^(wis_|school_)/, '').replace(/_/g, ' ');
        const meta = keyMetadata[key] || { kh: `📦 ${fallbackKh}`, desc: 'តារាងផ្ទុកទិន្នន័យចាំបាច់របស់ប្រព័ន្ធ' };

        return {
          key,
          nameKh: meta.kh,
          description: meta.desc,
          localSize,
          serverSize,
          localType,
          serverType,
          localPreview,
          serverPreview,
          isInSync,
          status
        };
      });

      compiledList.sort((a, b) => a.key.localeCompare(b.key));
      setDbKeys(compiledList);
    } catch (err: any) {
      setGlobalMessage({
        text: lang === 'kh' ? 'ការទាញយកស្ថានភាពទិន្នន័យបានបរាជ័យ៖ ' + err.message : 'Failed to fetch database status: ' + err.message,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeysStatus();
  }, []);

  const handlePushKey = async (key: string) => {
    const item = dbKeys.find(k => k.key === key);
    if (!item) return;

    const valRaw = window.localStorage.getItem(key);
    if (!valRaw) {
      setGlobalMessage({
        text: lang === 'kh' ? `រកមិនឃើញទិន្នន័យឧបករណ៍សម្រាប់ ${key} ឡើយ!` : `No local storage value found for key ${key}`,
        type: 'error'
      });
      return;
    }

    let parsedValue = valRaw;
    try {
      parsedValue = JSON.parse(valRaw);
    } catch {}

    window.dispatchEvent(new CustomEvent('wis-sync-status', { detail: { status: 'syncing', action: 'write', key } }));
    try {
      const res = await fetch(`/api/db/${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: parsedValue })
      });
      if (!res.ok) {
        window.dispatchEvent(new CustomEvent('wis-sync-status', { detail: { status: 'error', action: 'write', key } }));
        throw new Error('Network error during upload');
      }
      
      window.dispatchEvent(new CustomEvent('wis-sync-status', { detail: { status: 'success', action: 'write', key } }));
      setGlobalMessage({
        text: lang === 'kh' ? `បានដោនឡូត និងរុញទិន្នន័យ ${key} ទៅកាន់ Server ជោគជ័យ!` : `Successfully pushed key ${key} to remote server!`,
        type: 'success'
      });
      fetchKeysStatus();
    } catch (err: any) {
      setGlobalMessage({
        text: lang === 'kh' ? 'ការរុញទិន្នន័យបរាជ័យ៖ ' + err.message : 'Failed to push key: ' + err.message,
        type: 'error'
      });
    }
  };

  const handlePullKey = async (key: string) => {
    try {
      const res = await fetch('/api/db/all');
      if (!res.ok) throw new Error('Database server loading error');
      const data = await res.json();
      const serverDb = data && data.db ? data.db : {};
      const serverVal = serverDb[key];

      if (serverVal === undefined || serverVal === null) {
        setGlobalMessage({
          text: lang === 'kh' ? `រកមិនឃើញទិន្នន័យរបស់ ${key} នៅលើ Server ឡើយ!` : `Server database contains no data for ${key}`,
          type: 'error'
        });
        return;
      }

      const stringified = typeof serverVal === 'object' ? JSON.stringify(serverVal) : String(serverVal);
      window.localStorage.setItem(key, stringified);
      
      setGlobalMessage({
        text: lang === 'kh' ? `បានទាញទិន្នន័យ ${key} មកជំនួសលើឧបករណ៍គណនីរបស់អ្នករួចរាល់!` : `Successfully pulled key ${key} from server to local storage!`,
        type: 'success'
      });
      fetchKeysStatus();
    } catch (err: any) {
      setGlobalMessage({
        text: lang === 'kh' ? 'ការទាញទិន្នន័យបរាជ័យ៖ ' + err.message : 'Failed to pull key: ' + err.message,
        type: 'error'
      });
    }
  };

  const handleDeleteKey = async (key: string) => {
    if (!confirm(lang === 'kh' 
      ? `🚨 ប្រុងប្រយ័ត្នខ្ពស់៖ តើអ្នកពិតជាចង់លុបទិន្នន័យកូនសោ "${key}" នេះចេញទាំងស្រុងមែនទេ? សកម្មភាពនេះនឹងលុបចោលទាំងនៅលើឧបករណ៍នេះ និងនៅលើ Server ជារៀងរហូត!` 
      : `CRITICAL ACTION: Do you really want to delete key "${key}" permanently? This deletes all data both locally and on the server.`
    )) {
      return;
    }

    try {
      // 1. Delete server
      await fetch(`/api/db/${key}`, {
        method: "DELETE"
      });
      
      // 2. Delete local
      window.localStorage.removeItem(key);

      setGlobalMessage({
        text: lang === 'kh' ? `បានលុបកូនសោទិន្នន័យ "${key}" បានសម្រេច!` : `Deleted database key "${key}" successfully!`,
        type: 'success'
      });
      fetchKeysStatus();
    } catch (err: any) {
      setGlobalMessage({
        text: lang === 'kh' ? 'ការលុបបរាជ័យ៖ ' + err.message : 'Failed to delete key: ' + err.message,
        type: 'error'
      });
    }
  };

  const handleSyncAll = async () => {
    setIsLoading(true);
    setGlobalMessage(null);
    try {
      const res = await fetch('/api/db/all');
      if (!res.ok) throw new Error('Unreachable server DB');
      const data = await res.json();
      const serverDb = data && data.db ? data.db : {};

      // Resolve keys
      const allKeys = new Set<string>();
      Object.keys(serverDb).forEach(k => {
        if (k.startsWith('wis_') || k.startsWith('school_') || k.includes('docs_')) allKeys.add(k);
      });
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && (k.startsWith('wis_') || k.startsWith('school_') || k.includes('docs_'))) allKeys.add(k);
      }

      let syncCount = 0;
      for (const key of Array.from(allKeys)) {
        const localValRaw = window.localStorage.getItem(key);
        const serverVal = serverDb[key];

        let localVal: any = null;
        if (localValRaw) {
          try { localVal = JSON.parse(localValRaw); } catch { localVal = localValRaw; }
        }

        // Run full master-resolution logic
        let resolvedValue: any = null;
        let direction: 'push' | 'pull' | 'none' = 'none';

        if (serverVal !== undefined && serverVal !== null && localVal !== undefined && localVal !== null) {
          if (Array.isArray(serverVal) && Array.isArray(localVal)) {
            if (localVal.length > serverVal.length) {
              resolvedValue = localVal;
              direction = 'push';
            } else if (serverVal.length > localVal.length) {
              resolvedValue = serverVal;
              direction = 'pull';
            }
          } else if (typeof serverVal === 'object' && typeof localVal === 'object') {
            const serverK = Object.keys(serverVal).length;
            const localK = Object.keys(localVal).length;
            if (localK > serverK) {
              resolvedValue = localVal;
              direction = 'push';
            } else if (serverK > localK) {
              resolvedValue = serverVal;
              direction = 'pull';
            }
          }
        } else if (serverVal !== undefined && serverVal !== null) {
          resolvedValue = serverVal;
          direction = 'pull';
        } else if (localVal !== undefined && localVal !== null) {
          resolvedValue = localVal;
          direction = 'push';
        }

        if (direction === 'push' && resolvedValue !== null) {
          await fetch(`/api/db/${key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: resolvedValue })
          });
          syncCount++;
        } else if (direction === 'pull' && resolvedValue !== null) {
          const stringified = typeof resolvedValue === 'object' ? JSON.stringify(resolvedValue) : String(resolvedValue);
          window.localStorage.setItem(key, stringified);
          syncCount++;
        }
      }

      setGlobalMessage({
        text: lang === 'kh' 
          ? `បានបញ្ចប់សមកាលកម្មទូទៅរួចរាល់! កូនសោសរុបចំនួន ${syncCount} ត្រូវបានកែតម្រូវឱ្យស៊ីគ្នាជាមួយម៉ាស៊ីនបម្រើ។`
          : `Full re-sync completed successfully! Synced ${syncCount} outdated keys.`,
        type: 'success'
      });
      fetchKeysStatus();
    } catch (err: any) {
      setGlobalMessage({
        text: lang === 'kh' ? 'ការសមកាលកម្មបរាជ័យ៖ ' + err.message : 'Global sync failure: ' + err.message,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWipeLocalCache = () => {
    if (!confirm(lang === 'kh'
      ? '⚠️ ការសម្អាតឧបករណ៍៖ តើអ្នកចង់សម្អាត Cache ទាំងអស់ពីឧបករណ៍របស់អ្នកមែនទេ? ទិន្នន័យរបស់អ្នកនឹងមិនបាត់បង់ទេ វានឹងត្រូវទាញឡើងវិញពី Server ម៉ាស៊ីនបម្រើទាំងស្រុងភ្លាមៗ!'
      : 'Wipe Cache: Do you want to clear your browser local cache? This will not lose data since it immediately pulls from the server.'
    )) {
      return;
    }

    try {
      const keysToClear: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && (k.startsWith('wis_') || k.startsWith('school_') || k.includes('docs_'))) {
          keysToClear.push(k);
        }
      }

      keysToClear.forEach(k => window.localStorage.removeItem(k));
      setGlobalMessage({
        text: lang === 'kh' ? 'បានសម្អាត Cache ប្រព័ន្ធរួចរាល់! ប្រព័ន្ធកំពុងទាញទិន្នន័យឡើងវិញ...' : 'Local Cache cleared! Reloading system...',
        type: 'success'
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setGlobalMessage({
        text: err.message,
        type: 'error'
      });
    }
  };

  const filteredKeys = dbKeys.filter(k => 
    k.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.nameKh.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = 2;
    const sizes = ['bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full bg-slate-55 pb-12">
      {/* Visual Title Header Section */}
      <div className="bg-gradient-to-r from-[#073B4A] to-[#012A36] text-white rounded-3xl p-6.5 mb-6.5 shadow-md border-b-4 border-amber-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4.5">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 text-amber-300 shadow-inner">
              <Database className="w-8 h-8 animate-pulse shrink-0" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC]">
                <span className="font-moul text-base font-normal block leading-relaxed tracking-wide text-amber-200">🛡️ ស្ថានភាពឃ្លាំងទិន្នន័យ & សមកាលកម្មម៉ាស៊ីនមេ</span>
                <span className="font-sans text-lg sm:text-xl uppercase tracking-wider block mt-1 dark:text-slate-100">Database Status & Server Synchronizer</span>
              </h2>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed mt-2.5 max-w-xl">
                ធានាថារាល់ទិន្នន័យគ្រប់គ្រងសាលាទាំងអស់ ត្រូវបានការពារទ្វេដង (Double-Layered Safeguarded) ទាំងនៅក្នុងឧបករណ៍ (Local cache) និង Cloud Database ធានាមិនបាត់បង់សូម្បី១ឃ្លា។
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2.5 shrink-0 self-stretch md:self-auto justify-end">
            <button
              onClick={handleSyncAll}
              disabled={isLoading}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-3 rounded-xl transition duration-200 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-55"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{lang === 'kh' ? 'សមកាលកម្មរួម (Sync All Values)' : 'Global Re-Sync'}</span>
            </button>
            <button
              onClick={handleWipeLocalCache}
              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-4 py-3 rounded-xl transition duration-200 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{lang === 'kh' ? 'សម្អាត Cache ឧបករណ៍ (Wipe Cache)' : 'Wipe Cache'}</span>
            </button>
          </div>
        </div>
      </div>

      {globalMessage && (
        <div className={`p-4.5 rounded-2xl mb-5 shadow-inner flex items-start gap-3 border ${
          globalMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-350' 
            : globalMessage.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-350'
              : 'bg-blue-50 text-blue-900 border-blue-350'
        }`}>
          <div className="shrink-0 mt-0.5">
            {globalMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold leading-relaxed">{globalMessage.text}</p>
          </div>
        </div>
      )}

      {/* Visual Stats Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-205 p-4.5 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-150">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-sans block font-extrabold uppercase">Synchronized keys</span>
            <span className="text-xl font-black text-slate-800 leading-none">
              {dbKeys.filter(k => k.status === 'synchronized').length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-205 p-4.5 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-150">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-sans block font-extrabold uppercase">Mismatched keys</span>
            <span className="text-xl font-black text-slate-800 leading-none">
              {dbKeys.filter(k => k.status === 'mismatch').length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-205 p-4.5 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-150">
            <ArrowUpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-sans block font-extrabold uppercase">Local-only keys</span>
            <span className="text-xl font-black text-slate-800 leading-none">
              {dbKeys.filter(k => k.status === 'local_only').length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-205 p-4.5 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-150">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-sans block font-extrabold uppercase">Database totals</span>
            <span className="text-xl font-black text-slate-800 leading-none">
              {dbKeys.length} keys
            </span>
          </div>
        </div>
      </div>

      {/* Main Database keys list container */}
      <div className="bg-white border border-slate-200 shadow-2xs rounded-3xl overflow-hidden p-5 space-y-4">
        
        {/* Toggle Switch helper for quiet/loud background sync notification as requested by user */}
        <div className="bg-slate-50 border border-slate-150 p-4 rounded-2.5xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#073B3A] flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${showSuccessToasts ? 'bg-amber-400 animate-pulse' : 'bg-slate-400'}`}></span>
              <span className="font-moul text-[10.5px] font-normal tracking-wide">🔔 របាំងកំណត់ការជូនដំណឹងសមកាលកម្មទិន្នន័យ (Sync Notification Preference)</span>
            </span>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              {lang === 'kh' 
                ? 'លាក់ ឬបង្ហាញសន្លឹកការងារលោតប្លុក "Cloud Saved" ពណ៌បៃតង រាល់ពេលប្រព័ន្ធធ្វើបច្ចុប្បន្នភាពទិន្នន័យទៅកាន់ Server ស្វ័យប្រវត្ត' 
                : 'Hide or show the green "Cloud Saved" success slide-up toasts at the bottom right corner during background autosaves.'}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] font-black uppercase text-slate-600">
              {lang === 'kh' ? (showSuccessToasts ? 'បង្ហាញ (Always Show)' : 'លាក់ស្ងាត់ (Quiet Mode) 🤫') : (showSuccessToasts ? 'Always Show' : 'Quiet Mode 🤫')}
            </span>
            <div className="relative inline-flex items-center">
              <input 
                id="toggle-sync-toast"
                type="checkbox" 
                checked={showSuccessToasts}
                onChange={(e) => toggleSuccessToasts(e.target.checked)}
                className="sr-only peer" 
              />
              <label 
                htmlFor="toggle-sync-toast"
                className="w-11 h-6 bg-slate-200 hover:bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d5c5a] cursor-pointer"
              ></label>
            </div>
          </div>
        </div>

        {/* Search header bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between pb-1">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'kh' ? 'ស្វែងរកកូនសោ ឬឈ្មោះទិន្នន័យ...' : 'Filter key, name or description...'}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#0d5c5a] focus:bg-white rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 transition shadow-inner"
            />
          </div>
          <div className="text-[10px] text-slate-400 font-mono font-black shrink-0">
            Showing {filteredKeys.length} of {dbKeys.length} system data keys
          </div>
        </div>

        {/* List mapping */}
        <div className="border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-150 bg-slate-50/20">
          {filteredKeys.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-bold text-xs leading-relaxed">
              🔍 មិនរកឃើញទិន្នន័យត្រូវគ្នានឹងការស្វែងរកឡើយ!
            </div>
          ) : (
            filteredKeys.map((item) => {
              const getStatusBadge = () => {
                switch (item.status) {
                  case 'synchronized':
                    return (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 shrink-0" />
                        <span>{lang === 'kh' ? 'ស៊ីគ្នា' : 'In Sync'}</span>
                      </span>
                    );
                  case 'mismatch':
                    return (
                      <span className="bg-amber-50 text-amber-800 border border-amber-250 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0 animate-bounce" />
                        <span>{lang === 'kh' ? 'ផ្ទុយគ្នា' : 'Conflict'}</span>
                      </span>
                    );
                  case 'local_only':
                    return (
                      <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <ArrowUpCircle className="w-3 h-3 shrink-0" />
                        <span>{lang === 'kh' ? 'ឧបករណ៍ថ្មី' : 'Local Only'}</span>
                      </span>
                    );
                  case 'server_only':
                    return (
                      <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <ArrowDownCircle className="w-3 h-3 shrink-0" />
                        <span>{lang === 'kh' ? 'ម៉ាស៊ីនថ្មី' : 'Server Only'}</span>
                      </span>
                    );
                  default:
                    return (
                      <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                        EMPTY
                      </span>
                    );
                }
              };

              return (
                <div key={item.key} className="p-4 hover:bg-slate-50/50 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Information block */}
                    <div className="space-y-1 max-w-2xl flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-black text-slate-800">
                          {item.nameKh}
                        </h4>
                        <span className="text-[10px] text-slate-450 font-mono font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          {item.key}
                        </span>
                        {getStatusBadge()}
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                        {item.description}
                      </p>
                      
                      {/* Previews under the description */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                        {/* Local side */}
                        <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-[10.5px]">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <HardDrive className="w-3.5 h-3.5" />
                            <span>ឧបករណ៍នេះ (Local Storage | {formatSize(item.localSize)})</span>
                          </span>
                          <span className="font-mono text-slate-700 font-bold block truncate mt-1">
                            {item.localPreview}
                          </span>
                        </div>

                        {/* Server side */}
                        <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-[10.5px]">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Server className="w-3.5 h-3.5" />
                            <span>ម៉ាស៊ីនមេ (Cloud Run | {formatSize(item.serverSize)})</span>
                          </span>
                          <span className="font-mono text-emerald-800 font-black block truncate mt-1">
                            {item.serverPreview}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions block */}
                    <div className="flex items-center gap-1.5 shrink-0 self-start lg:self-center">
                      <button
                        onClick={() => handlePushKey(item.key)}
                        disabled={item.status === 'server_only' || item.status === 'synchronized'}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 hover:border-emerald-300 font-bold text-[10.5px] px-3.5 py-2 rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-3xs"
                        title={lang === 'kh' ? 'រុញទិន្នន័យពីឧបករណ៍ទៅម៉ាស៊ីនមេ' : 'Push local state up to Cloud DB'}
                      >
                        <ArrowUpCircle className="w-3.5 h-3.5" />
                        <span>រុញឡើង (Push)</span>
                      </button>

                      <button
                        onClick={() => handlePullKey(item.key)}
                        disabled={item.status === 'local_only' || item.status === 'synchronized'}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 hover:border-indigo-300 font-bold text-[10.5px] px-3.5 py-2 rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-3xs"
                        title={lang === 'kh' ? 'ទាញទិន្នន័យពីម៉ាស៊ីនមេមកជំនួសឧបករណ៍វិញ' : 'Pull server state down to Local Storage'}
                      >
                        <ArrowDownCircle className="w-3.5 h-3.5" />
                        <span>ទាញចុះ (Pull)</span>
                      </button>

                      <button
                        onClick={() => handleDeleteKey(item.key)}
                        className="bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-800 border border-slate-200 hover:border-rose-200 p-2 rounded-xl transition cursor-pointer shadow-3xs"
                        title={lang === 'kh' ? 'លុបចោលទាំងនៅលើឧបករណ៍និងម៉ាស៊ីនថតចម្លង' : 'Clear this key entirely from DB/Cache'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Safety Instructions card */}
      <div className="mt-6 bg-[#FEF3C7] border-l-4 border-[#D97706] rounded-3xl p-5 text-amber-950 flex gap-4">
        <div className="text-amber-700 mt-1 shrink-0">
          <Shield className="w-6 h-6 shrink-0" />
        </div>
        <div>
          <h5 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-900 leading-relaxed">
            💡 ការយល់ដឹងពីប្រព័ន្ធសុវត្ថិភាពទិន្នន័យស្វ័យប្រវត្តិ (Automatic Backup & Fault-Tolerance Information)
          </h5>
          <p className="text-[11.5px] text-amber-900/90 font-medium leading-relaxed mt-2.5 space-y-2">
            ប្រព័ន្ធគ្រប់គ្រងសាលាគរុកោសល្យ WIS (Western International School Manager) មានភ្ជាប់មកជាមួយនូវប្រព័ន្ធ <b>Cloud Ingress Sync Protocol</b> ថ្នាក់ខ្ពស់។ រាល់ពេលដែលលោកអ្នកចុចរក្សាទុក ឬកែប្រែទិន្នន័យអ្វីមួយ (ដូចជាវត្តមាន គណនេយ្យ ម៉ាស៊ីនត្រជាក់ របាយការណ៍ប្រចាំខែ) ប្រព័ន្ធនឹងបញ្ចូលវាទៅក្នុង Cache របស់កុំព្យូទ័រជាបណ្ដោះអាសន្ន ហើយធ្វើសមកាលកម្ម (Background Syncing) ភ្លាមៗទៅកាន់ Cloud Server។ 
            ប្រសិនបើឧបករណ៍របស់អ្នកជួបប្រទះការបាត់ទិន្នន័យដោយសារការលុប Browser Cache លោកអ្នកគ្រាន់តែចូលមកកន្លែងនេះ ហើយទាញទិន្នន័យ <b>(Pull State)</b> ត្រឡប់មកវិញគឺរួចជាការស្រេច។
          </p>
        </div>
      </div>
    </div>
  );
};
