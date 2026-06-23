import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, Cloud, HardDrive, ShieldAlert, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SyncEventDetail {
  status: 'syncing' | 'success' | 'error';
  action: 'write' | 'delete';
  key: string;
}

interface ToastItem {
  id: string;
  keyName: string;
  status: 'success' | 'error';
  message: string;
  timestamp: Date;
}

// Map database technical keys to Khmer user-friendly names
const keyFriendlyNames: Record<string, string> = {
  wis_staff_list: 'បញ្ជីរាយនាមបុគ្គលិក',
  wis_attendance_records: 'វត្តមានមន្ត្រីបុគ្គលិក',
  wis_electricity_records: 'ការប្រើប្រាស់អគ្គិសនី',
  wis_water_records: 'ការប្រើប្រាស់ទឹកស្អាត',
  wis_fixed_assets: 'បញ្ជីសារពើភ័ណ្ឌទ្រព្យសកម្ម',
  wis_student_insurances: 'បញ្ជីធានារ៉ាប់រងសិស្ស',
  school_admin_docs_files_v1: 'ឯកសាររដ្ឋបាល PDFs',
  school_admin_docs_status_v1: 'ស្ថានភាពឯកសាររដ្ឋបាល',
  wis_profile_name: 'ព័ត៌មានគណនីប្រើប្រាស់',
  wis_profile_role: 'តួនាទីគណនីក្នុងប្រព័ន្ធ',
  wis_telegram_bot_token: 'តំណភ្ជាប់ bot telegram',
  wis_telegram_chat_id: 'chat ID ក្រុម Telegram',
  wis_school_events: 'កាលវិភាគព្រឹត្តិការណ៍សាលា',
  wis_monthly_reports: 'របាយការណ៍ហិរញ្ញវត្ថុប្រចាំខែ',
  wis_khmer_calendar_notes: 'កំណត់ត្រាក្រឡាប្រតិទិនខ្មែរ',
  wis_student_list: 'បញ្ជីឈ្មោះសិស្សានុសិស្ស',
  wis_student_grade_statistics: 'ស្ថិតិពិន្ទុសិស្ស',
  wis_cctv_records: 'ស្ថានភាពកាមេរ៉ាសុវត្ថិភាព',
  wis_daily_reports: 'របាយការណ៍ប្រចាំថ្ងៃរបស់សាលា',
  wis_followup_tasks: 'កិច្ចការងាររដ្ឋបាលដែលត្រូវដោះស្រាយ',
  wis_medicines: 'ស្តុកថ្នាំពេទ្យសាលា',
  wis_medicine_usage_logs: 'កំណត់ត្រាផ្តល់ថ្នាំព្យាបាល',
  wis_medicine_stock_ins: 'ការនាំចូលថ្នាំពេទ្យថ្មី'
};

export const SyncStatusToast: React.FC = () => {
  const [showSuccessToasts, setShowSuccessToasts] = useState<boolean>(() => {
    return localStorage.getItem('wis_show_sync_success_toasts') === 'true';
  });
  const [activeSyncs, setActiveSyncs] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const isHydratingRef = useRef(true);

  // Listen to local storage changes to keep state in sync
  useEffect(() => {
    const checkSettings = () => {
      const val = localStorage.getItem('wis_show_sync_success_toasts') === 'true';
      setShowSuccessToasts(val);
    };
    window.addEventListener('storage', checkSettings);
    // Custom event check
    window.addEventListener('wis-sync-settings-changed', checkSettings);
    return () => {
      window.removeEventListener('storage', checkSettings);
      window.removeEventListener('wis-sync-settings-changed', checkSettings);
    };
  }, []);

  // Silent first second of loading to prevent heavy burst of hydration notifications
  useEffect(() => {
    const timer = setTimeout(() => {
      isHydratingRef.current = false;
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleSyncStatus = (e: Event) => {
      const customEvent = e as CustomEvent<SyncEventDetail>;
      const { status, action, key } = customEvent.detail;

      // Update active sync indicators
      if (status === 'syncing') {
        setActiveSyncs(prev => {
          const next = new Set(prev);
          next.add(key);
          return next;
        });
      } else {
        setActiveSyncs(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });

        // Skip adding temporary slide-up success toasts during initial app-load hydration
        if (isHydratingRef.current) return;

        // Skip success toasts if deactivated (to prevent UI interruptions, as requested)
        if (status === 'success' && !showSuccessToasts) {
          return;
        }

        // Resolve display name
        const prefix = key.replace(/^(wis_|school_)/, '').replace(/_/g, ' ');
        const friendlyName = keyFriendlyNames[key] || prefix;
        
        const id = `${key}-${Date.now()}-${Math.random()}`;
        const message = status === 'success' 
          ? `បានរក្សាទុក និងសមកាលកម្ម "${friendlyName}" ជាមួយ Server ជោគជ័យ!`
          : `មិនអាចសមកាលកម្ម "${friendlyName}" ទៅកាន់ Server (ខ្វះអ៊ីនធឺណិត ឬម៉ាស៊ីនរវល់)`;

        const newToast: ToastItem = {
          id,
          keyName: key,
          status: status === 'success' ? 'success' : 'error',
          message,
          timestamp: new Date()
        };

        // Add toast
        setToasts(prev => [newToast, ...prev].slice(0, 4));

        // Auto remove toast after 3.5s
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
      }
    };

    window.addEventListener('wis-sync-status', handleSyncStatus);
    return () => {
      window.removeEventListener('wis-sync-status', handleSyncStatus);
    };
  }, [showSuccessToasts]);

  const hasActiveSync = activeSyncs.size > 0;

  return (
    <div className="fixed bottom-5 right-5 z-250 flex flex-col items-end gap-2 max-w-sm w-full pointer-events-none select-none">
      
      {/* 1. Global Processing Status Bar Indicator (Subtle, professional) */}
      <AnimatePresence>
        {hasActiveSync && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700/50"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
            </div>
            <div>
              <span className="text-[11.5px] font-bold text-slate-100 flex items-center gap-1.5 leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                <span className="font-moul tracking-wide text-[10px] text-amber-200">សមកាលកម្ម... (Cloud Sync active)</span>
              </span>
              <span className="text-[9.5px] text-slate-400 font-mono block mt-1">
                Updating {activeSyncs.size} database partition{activeSyncs.size > 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. List of successful or unsuccessful temporary toasted indicators */}
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className={`pointer-events-auto w-full p-3.5 rounded-2xl shadow-lg border flex items-start gap-3 backdrop-blur-xs ${
              toast.status === 'success'
                ? 'bg-emerald-950/90 text-white border-emerald-500/30 shadow-emerald-950/10'
                : 'bg-rose-950/90 text-white border-rose-500/30 shadow-rose-950/10'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.status === 'success' ? (
                <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                </div>
              ) : (
                <div className="p-1.5 bg-rose-500/20 text-rose-300 rounded-lg border border-rose-500/30">
                  <ShieldAlert className="w-4 h-4 shrink-0 animate-bounce" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  toast.status === 'success' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {toast.status === 'success' ? 'Cloud Saved' : 'Sync Offline'}
                </span>
                <span className="text-[9px] text-white/40 font-mono font-medium">
                  {toast.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-[11.5px] font-semibold leading-relaxed text-white/95">
                {toast.message}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

    </div>
  );
};
