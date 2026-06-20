import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize a robust, virtual in-memory fallback store to bypass localStorage 5MB browser quota limits
(window as any).__INITIAL_SERVER_DB__ = {};

// 1. Intercept window.localStorage.setItem to sync automatically to server with quota exception safety
const originalSetItem = window.localStorage.setItem;
window.localStorage.setItem = function (key, value) {
  // Update virtual in-memory fallback store
  try {
    (window as any).__INITIAL_SERVER_DB__[key] = JSON.parse(value);
  } catch {
    (window as any).__INITIAL_SERVER_DB__[key] = value;
  }

  // Write through to localStorage with quota safety
  try {
    originalSetItem.call(window.localStorage, key, value);
  } catch (err) {
    console.warn(`[Local Storage Cache Quota Exceeded] Failed to cache key "${key}" locally. Keeping it in memory-fallback store and sync with remote database:`, err);
  }
  
  // Synchronize keys relating to school administration system
  if (
    key.startsWith('wis_') || 
    key.startsWith('school_') || 
    key.includes('docs_')
  ) {
    let parsedValue = value;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      // Keep as string if it is not valid JSON
    }
    
    fetch(`/api/db/${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: parsedValue })
    }).catch(err => {
      console.error("[BG Database Sync Error]:", err);
    });
  }
};

// 2. Intercept window.localStorage.removeItem to sync deletions
const originalRemoveItem = window.localStorage.removeItem;
window.localStorage.removeItem = function (key) {
  originalRemoveItem.call(window.localStorage, key);
  
  if (
    key.startsWith('wis_') || 
    key.startsWith('school_') || 
    key.includes('docs_')
  ) {
    fetch(`/api/db/${key}`, {
      method: "DELETE"
    }).catch(err => {
      console.error("[BG Database Delete Error]:", err);
    });
  }
};

// 3. Immediately fetch whole backend database and hydrate localStorage BEFORE mounting React app
async function startAppWithHydration() {
  try {
    const response = await fetch("/api/db/all");
    if (response.ok) {
      const data = await response.json();
      const serverDb = data && data.db ? data.db : {};
      
      console.log("[WIS Database Hydration] Loaded server-side entries:", Object.keys(serverDb));
      
      // Crucial keys we wish to protect/synchronize
      const syncKeys = [
        'wis_staff_list',
        'wis_attendance_records',
        'wis_electricity_records',
        'wis_water_records',
        'wis_fixed_assets',
        'wis_student_insurances',
        'wis_fe_inspections',
        'wis_ac_inspections',
        'school_admin_docs_files_v1',
        'school_admin_docs_status_v1',
        'wis_profile_name',
        'wis_profile_role',
        'wis_profile_avatar',
        'wis_school_logo',
        'wis_telegram_bot_token',
        'wis_telegram_chat_id',
        'wis_users_list',
        'wis_user_requests',
        'wis_school_events',
        'wis_monthly_reports',
        'wis_active_academic_year',
        'wis_academic_years'
      ];

      for (const key of syncKeys) {
        const serverVal = serverDb[key];
        const localValRaw = window.localStorage.getItem(key);
        
        let localVal: any = null;
        if (localValRaw) {
          try {
            localVal = JSON.parse(localValRaw);
          } catch {
            localVal = localValRaw;
          }
        }

        // Determine which value is richer or newer to resolve conflicts safely
        let resolvedValue: any = null;
        let source: 'server' | 'local' | 'default' = 'default';

        if (serverVal !== undefined && serverVal !== null && localVal !== undefined && localVal !== null) {
          if (Array.isArray(serverVal) && Array.isArray(localVal)) {
            // Keep the longer list to prevent losing records
            if (localVal.length > serverVal.length) {
              resolvedValue = localVal;
              source = 'local';
            } else {
              resolvedValue = serverVal;
              source = 'server';
            }
          } else if (typeof serverVal === 'object' && typeof localVal === 'object') {
            // Keep whichever object has more attributes
            const serverKeysCount = Object.keys(serverVal).length;
            const localKeysCount = Object.keys(localVal).length;
            if (localKeysCount > serverKeysCount) {
              resolvedValue = localVal;
              source = 'local';
            } else {
              resolvedValue = serverVal;
              source = 'server';
            }
          } else {
            // Primitives: Prefer server master, except if local is richer/longer
            if (typeof localVal === 'string' && typeof serverVal === 'string' && localVal.length > serverVal.length && key.includes('avatar')) {
              resolvedValue = localVal;
              source = 'local';
            } else {
              resolvedValue = serverVal;
              source = 'server';
            }
          }
        } else if (serverVal !== undefined && serverVal !== null) {
          resolvedValue = serverVal;
          source = 'server';
        } else if (localVal !== undefined && localVal !== null) {
          resolvedValue = localVal;
          source = 'local';
        }

        // Apply resolution
        if (resolvedValue !== null && resolvedValue !== undefined) {
          // Store in our virtual fallback database
          (window as any).__INITIAL_SERVER_DB__[key] = resolvedValue;

          const stringified = typeof resolvedValue === 'object' ? JSON.stringify(resolvedValue) : String(resolvedValue);
          try {
            originalSetItem.call(window.localStorage, key, stringified);
          } catch (err) {
            console.warn(`[WIS Hydration Cache Quota Exceeded] Key "${key}" failed to cache locally. Retaining in-memory master state:`, err);
          }
          
          if (source === 'local') {
            console.log(`[WIS Database Sync] Uploading local newer state for: ${key}`);
            fetch(`/api/db/${key}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ value: resolvedValue })
            }).catch(err => console.error(`[WIS Sync Error for ${key}]:`, err));
          }
        }
      }

      // Hydrate all other non-tracked keys directly from the server
      for (const [key, val] of Object.entries(serverDb)) {
        if (!syncKeys.includes(key) && val !== null && val !== undefined) {
          (window as any).__INITIAL_SERVER_DB__[key] = val;
          const stringified = typeof val === 'object' ? JSON.stringify(val) : String(val);
          try {
            originalSetItem.call(window.localStorage, key, stringified);
          } catch (err) {
            console.warn(`[WIS Hydration Cache Quota Exceeded] Non-tracked key "${key}" failed to cache locally:`, err);
          }
        }
      }
    }
  } catch (err) {
    console.error("[WIS Database Hydration Error]:", err);
  } finally {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
}

startAppWithHydration();
