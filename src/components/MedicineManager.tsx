/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Medicine, MedicineStockIn, MedicineUsageLog, UserAccount } from '../types';
import { 
  Plus, Edit2, Trash2, Search, Filter, Calendar, 
  CheckCircle, Clock, AlertTriangle, AlertCircle, HelpCircle, XCircle, 
  FileSpreadsheet, Printer, ArrowUpRight, ChevronDown, Check, RefreshCw,
  Layers, FileText, Info, Package, ShieldAlert, DollarSign, Activity, Upload, Eye, X, Pill
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  initAuth, 
  googleSignIn, 
  googleSignOut, 
  checkSpreadsheetExists, 
  syncMedicinesToSpreadsheet 
} from '../utils/googleSheetsHelper';


interface MedicineManagerProps {
  currentUser?: UserAccount | null;
  lang?: 'kh' | 'en';
}

// 1. Initial Mock Datasets representing correct Khmer/English structures
const DEFAULT_MEDICINES: Medicine[] = [
  {
    id: 'MED001',
    photo: '', // Empty triggers fallback stylized medical box SVG
    name: 'Paracetamol',
    category: 'Tablet',
    strength: '500mg',
    stock: 200,
    purchaseDate: '2026-01-01',
    expiryDate: '2028-01-01',
    location: 'Cabinet A',
    status: 'Active',
    unitPrice: 0.05,
    reorderPoint: 50
  },
  {
    id: 'MED002',
    photo: '',
    name: 'Ibuprofen',
    category: 'Tablet',
    strength: '400mg',
    stock: 100,
    purchaseDate: '2026-02-15',
    expiryDate: '2028-02-15',
    location: 'Cabinet A',
    status: 'Active',
    unitPrice: 0.12,
    reorderPoint: 30
  },
  {
    id: 'MED003',
    photo: '',
    name: 'Cough Syrup',
    category: 'Syrup',
    strength: '120ml',
    stock: 45,
    purchaseDate: '2026-03-10',
    expiryDate: '2026-08-15', // Expires soon! ~55 days from June-2026
    location: 'Cabinet B',
    status: 'Active',
    unitPrice: 1.50,
    reorderPoint: 50
  },
  {
    id: 'MED004',
    photo: '',
    name: 'Amoxicillin',
    category: 'Capsule',
    strength: '250mg',
    stock: 80,
    purchaseDate: '2026-04-12',
    expiryDate: '2026-07-15', // Expires very soon! ~24 days left
    location: 'Cabinet B',
    status: 'Active',
    unitPrice: 0.18,
    reorderPoint: 40
  },
  {
    id: 'MED005',
    photo: '',
    name: 'Antacid Liquid',
    category: 'Suspension',
    strength: '200ml',
    stock: 15,
    purchaseDate: '2026-05-18',
    expiryDate: '2026-09-10', // Expires in 81 days
    location: 'Cabinet C',
    status: 'Active',
    unitPrice: 2.20,
    reorderPoint: 20
  }
];

const DEFAULT_STOCK_INS: MedicineStockIn[] = [
  {
    id: 'STKIN_1',
    date: '2026-06-01',
    medicineId: 'MED001',
    medicineName: 'Paracetamol',
    qtyIn: 100,
    supplier: 'ABC Pharma Co., Ltd',
    batchNo: 'B001',
    expiryDate: '2028-06-01',
    receivedBy: 'Nurse Srey Roth'
  },
  {
    id: 'STKIN_2',
    date: '2026-06-15',
    medicineId: 'MED002',
    medicineName: 'Ibuprofen',
    qtyIn: 50,
    supplier: 'MediCare Cambodia Depot',
    batchNo: 'B220',
    expiryDate: '2028-06-15',
    receivedBy: 'Nurse Srey Roth'
  }
];

const DEFAULT_USAGE_LOGS: MedicineUsageLog[] = [
  {
    id: 'USG_1',
    date: '2026-06-10',
    studentName: 'សួង ចាន់ត្រា (Student A)',
    grade: 'Grade 5B',
    medicineId: 'MED001',
    medicineName: 'Paracetamol',
    qtyUsed: 2,
    reason: 'Fever (ក្តៅខ្លួនខ្លាំង)',
    nurse: 'Nurse Srey Roth'
  },
  {
    id: 'USG_2',
    date: '2026-06-18',
    studentName: 'លី ម៉ាណា (Student B)',
    grade: 'Grade 8C',
    medicineId: 'MED002',
    medicineName: 'Ibuprofen',
    qtyUsed: 1,
    reason: 'Severe Toothache (ឈឺធ្មេញខ្លាំង)',
    nurse: 'Nurse Srey Roth'
  }
];

export default function MedicineManager({ currentUser, lang = 'kh' }: MedicineManagerProps) {
  // Sub-tabs: 'dashboard' | 'master' | 'stockin' | 'usage' | 'report'
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'master' | 'stockin' | 'usage' | 'report'>('dashboard');

  // Core medicine states loaded from localStorage or fallback
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    try {
      const saved = localStorage.getItem('wis_medicines');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_MEDICINES;
  });

  const [stockIns, setStockIns] = useState<MedicineStockIn[]>(() => {
    try {
      const saved = localStorage.getItem('wis_medicine_stock_ins');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_STOCK_INS;
  });

  const [usageLogs, setUsageLogs] = useState<MedicineUsageLog[]>(() => {
    try {
      const saved = localStorage.getItem('wis_medicine_usage_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_USAGE_LOGS;
  });

  // Local Storage persistence hooks
  useEffect(() => {
    localStorage.setItem('wis_medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('wis_medicine_stock_ins', JSON.stringify(stockIns));
  }, [stockIns]);

  useEffect(() => {
    localStorage.setItem('wis_medicine_usage_logs', JSON.stringify(usageLogs));
  }, [usageLogs]);

  // Toast notifications
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3000);
  };

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
    return localStorage.getItem('wis_google_spreadsheet_last_sync_medicines');
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [customSpreadsheetUrlInput, setCustomSpreadsheetUrlInput] = useState('');
  const [showSheetSetup, setShowSheetSetup] = useState(false);

  // Initialize Google Auth Connection
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

  // Validate Spreadsheet if it exists
  useEffect(() => {
    if (googleToken && spreadsheetId) {
      checkSpreadsheetExists(googleToken, spreadsheetId).then((exists) => {
        if (!exists) {
          localStorage.removeItem('wis_google_spreadsheet_id');
          localStorage.removeItem('wis_google_spreadsheet_url');
          setSpreadsheetId(null);
          setSpreadsheetUrl(null);
        }
      }).catch(() => {});
    }
  }, [googleToken, spreadsheetId]);

  const handleGoogleSignIn = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        triggerToast('បានភ្ជាប់គណនី Google ជោគជ័យ!');
      }
    } catch (err: any) {
      setSyncError(err.message || 'ការតភ្ជាប់គណនី Google បរាជ័យ។');
      triggerToast('ការតភ្ជាប់គណនី Google បរាជ័យ');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleSignOut = async () => {
    setIsSyncing(true);
    try {
      await googleSignOut();
      setGoogleUser(null);
      setGoogleToken(null);
      triggerToast('បានចាកចេញពីគណនី Google!');
    } catch (err: any) {
      setSyncError(err.message || 'ការចាកចេញបរាជ័យ។');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLinkCustomSpreadsheet = () => {
    if (!customSpreadsheetUrlInput.trim()) {
      triggerToast('សូមបញ្ចូលតំណភ្ជាប់ Google Sheets ជាមុនសិន!');
      return;
    }
    let extractedId = customSpreadsheetUrlInput.trim();
    const match = customSpreadsheetUrlInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      extractedId = match[1];
    }

    const url = `https://docs.google.com/spreadsheets/d/${extractedId}/edit`;
    localStorage.setItem('wis_google_spreadsheet_id', extractedId);
    localStorage.setItem('wis_google_spreadsheet_url', url);
    setSpreadsheetId(extractedId);
    setSpreadsheetUrl(url);
    setCustomSpreadsheetUrlInput('');
    triggerToast('បានតភ្ជាប់បន្ទះកិច្ចការគណនី Google Sheets រួចរាល់!');
  };

  const handleSyncToSheets = async () => {
    if (!googleToken) {
      try {
        const res = await googleSignIn();
        if (res) {
          setGoogleUser(res.user);
          setGoogleToken(res.accessToken);
          await performSync(res.accessToken, spreadsheetId);
        }
      } catch (err: any) {
        setSyncError(err.message || 'ការសមកាលកម្មបរាជ័យ។');
      }
      return;
    }
    await performSync(googleToken, spreadsheetId);
  };

  const performSync = async (token: string, currentSheetId: string | null) => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccess(false);

    try {
      let sheetId = currentSheetId;
      if (!sheetId) {
        const savedSheetId = localStorage.getItem('wis_google_spreadsheet_id');
        if (savedSheetId) {
          sheetId = savedSheetId;
          setSpreadsheetId(sheetId);
        } else {
          throw new Error('សូមមេត្តាបង្កើតបន្ទះកិច្ចការ Master Google Sheet នៅក្នុង Dashboard ជាមុនសិន ឬភ្ជាប់ដោយសរសេរ Link ផ្ទាល់។');
        }
      }

      await syncMedicinesToSpreadsheet(
        token, 
        sheetId, 
        medicines, 
        stockIns, 
        usageLogs
      );

      const nowStr = new Date().toLocaleString('km-KH', { dateStyle: 'medium', timeStyle: 'short' });
      localStorage.setItem('wis_google_spreadsheet_last_sync_medicines', nowStr);
      setLastSyncedAt(nowStr);
      setSyncSuccess(true);
      triggerToast('សមកាលកម្មប្រព័ន្ធឱសថទៅកាន់ Google Sheets រួចរាល់!');
      setTimeout(() => setSyncSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      setSyncError(err.message || 'សូមពិនិត្យមើលសិទ្ធិតភ្ជាប់ ឬតំណភ្ជាប់ Google Sheets របស់អ្នកឡើងវិញ។');
      triggerToast('ការសមកាលកម្មតាមដានការងារបរាជ័យ');
    } finally {
      setIsSyncing(false);
    }
  };

  // Image zoom preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('2026-06'); // matching baseline mock data date

  // Medicine Form state registers
  const [isMedFormOpen, setIsMedFormOpen] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [deleteMedId, setDeleteMedId] = useState<string | null>(null);
  const [deleteStockInId, setDeleteStockInId] = useState<string | null>(null);
  const [deleteUsageLogId, setDeleteUsageLogId] = useState<string | null>(null);

  const [formMedName, setFormMedName] = useState('');
  const [formMedCategory, setFormMedCategory] = useState('Tablet');
  const [formMedStrength, setFormMedStrength] = useState('');
  const [formMedStock, setFormMedStock] = useState<number>(0);
  const [formMedPurchaseDate, setFormMedPurchaseDate] = useState('');
  const [formMedExpiryDate, setFormMedExpiryDate] = useState('');
  const [formMedLocation, setFormMedLocation] = useState('');
  const [formMedStatus, setFormMedStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formMedPrice, setFormMedPrice] = useState<number>(0.10);
  const [formMedReorderPoint, setFormMedReorderPoint] = useState<number>(30);
  const [formMedPhoto, setFormMedPhoto] = useState<string>('');

  // Stock In Form states
  const [isStockFormOpen, setIsStockFormOpen] = useState(false);
  const [formStockMedId, setFormStockMedId] = useState('');
  const [formStockQty, setFormStockQty] = useState<number>(50);
  const [formStockSupplier, setFormStockSupplier] = useState('');
  const [formStockBatch, setFormStockBatch] = useState('');
  const [formStockExpiry, setFormStockExpiry] = useState('');
  const [formStockDate, setFormStockDate] = useState('');
  const [formStockReceiver, setFormStockReceiver] = useState('');

  // Usage Log Form states
  const [isUsageFormOpen, setIsUsageFormOpen] = useState(false);
  const [formUsgStudent, setFormUsgStudent] = useState('');
  const [formUsgGrade, setFormUsgGrade] = useState('');
  const [formUsgMedId, setFormUsgMedId] = useState('');
  const [formUsgQty, setFormUsgQty] = useState<number>(1);
  const [formUsgReason, setFormUsgReason] = useState('');
  const [formUsgNurse, setFormUsgNurse] = useState('');

  // Fixed Date constant reference representing current system local date: 2026-06-21
  const SYSTEM_DATE_REF = useMemo(() => new Date('2026-06-21'), []);

  // Utility to determine days left and coloring for expiration alerts
  const getExpiryDetails = (expiryDateStr: string) => {
    if (!expiryDateStr) return { days: 999, status: 'Normal', color: 'text-slate-500 bg-slate-50', badge: 'bg-emerald-500' };
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - SYSTEM_DATE_REF.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return { days, status: 'Expired', color: 'text-rose-700 bg-rose-50 border-rose-200', text: lang === 'kh' ? 'ហួសកំណត់' : 'Expired', label: 'Critical' };
    } else if (days <= 30) {
      return { days, status: 'Critical', color: 'text-rose-700 bg-rose-100 border-rose-300 font-extrabold animate-pulse', text: lang === 'kh' ? 'គ្រោះថ្នាក់ (≤ ៣០ ថ្ងៃ)' : 'Critical (≤ 30 Days)', label: 'Critical' };
    } else if (days <= 60) {
      return { days, status: 'Warning60', color: 'text-amber-700 bg-amber-100 border-amber-300 font-bold', text: lang === 'kh' ? 'ប្រុងប្រយ័ត្នខ្លាំង (≤ ៦០ ថ្ងៃ)' : 'Orange Warning (≤ 60 Days)', label: 'Warning 60' };
    } else if (days <= 90) {
      return { days, status: 'Warning90', color: 'text-yellow-800 bg-yellow-100 border-yellow-250', text: lang === 'kh' ? 'ប្រុងប្រយ័ត្ន (≤ ៩០ ថ្ងៃ)' : 'Yellow Alert (≤ 90 Days)', label: 'Warning 90' };
    } else {
      return { days, status: 'Normal', color: 'text-emerald-700 bg-emerald-50/70 border-emerald-100', text: lang === 'kh' ? 'សុវត្ថិភាព' : 'Normal/Safe', label: 'Normal' };
    }
  };

  // 300x300 Image Compressor function using a canvas to bypass localStorage quota errors of raw data
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert(lang === 'kh' ? 'សូមជ្រើសរើសប្រភេទរូបភាព JPG ឬ PNG!' : 'Please choose JPG or PNG format only!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 300, 300);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85); // 85% high definition jpeg
          setFormMedPhoto(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Computed dashboard statistics
  const dashboardStats = useMemo(() => {
    let totalItems = medicines.length;
    let totalStockQty = medicines.reduce((sum, m) => sum + m.stock, 0);
    let totalStockValue = medicines.reduce((sum, m) => sum + (m.stock * (m.unitPrice || 0.10)), 0);

    // Expiry warnings (<= 90 days)
    let nearExpiryCount = medicines.filter(m => {
      const details = getExpiryDetails(m.expiryDate);
      return details.days <= 90;
    }).length;

    // Most used medicine
    const useCounts: Record<string, number> = {};
    usageLogs.forEach(log => {
      useCounts[log.medicineName] = (useCounts[log.medicineName] || 0) + log.qtyUsed;
    });

    let topUsedName = '-';
    let topUsedQty = 0;
    Object.keys(useCounts).forEach(name => {
      if (useCounts[name] > topUsedQty) {
        topUsedQty = useCounts[name];
        topUsedName = name;
      }
    });

    return {
      totalItems,
      totalStockQty,
      totalStockValue,
      nearExpiryCount,
      topUsedName: topUsedQty > 0 ? `${topUsedName} (${topUsedQty})` : '-'
    };
  }, [medicines, usageLogs, lang]);

  // Expiry alerts array derived for Expiry Alert UI
  const expiryAlertsList = useMemo(() => {
    return medicines
      .map(m => {
        const alertInfo = getExpiryDetails(m.expiryDate);
        return {
          id: m.id,
          name: m.name,
          category: m.category,
          strength: m.strength,
          expiryDate: m.expiryDate,
          daysLeft: alertInfo.days,
          statusText: alertInfo.text,
          statusLabel: alertInfo.label,
          badgeColor: alertInfo.color
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [medicines]);

  // Monthly Report Calculations for a selected Month (YYYY-MM)
  const monthlyUsageReport = useMemo(() => {
    return medicines.map(med => {
      // Filter logs during this month
      const receivedInMonth = stockIns
        .filter(stk => stk.medicineId === med.id && stk.date.startsWith(selectedMonth))
        .reduce((sum, stk) => sum + stk.qtyIn, 0);

      const usedInMonth = usageLogs
        .filter(usg => usg.medicineId === med.id && usg.date.startsWith(selectedMonth))
        .reduce((sum, usg) => sum + usg.qtyUsed, 0);

      // Simple calculation: Current Balance is the Medicine current stock.
      // Opening Stock = Current Stock - Total Stock In added after this month starts + Total Usage deducted after this month starts.
      // For standard local persistence, lets model: Opening Stock = Current Balance in selectedMonth context.
      const currentBalance = med.stock;
      const openingStock = Math.max(0, currentBalance - receivedInMonth + usedInMonth);

      return {
        id: med.id,
        name: med.name,
        strength: med.strength,
        category: med.category,
        openingStock,
        received: receivedInMonth,
        used: usedInMonth,
        balance: currentBalance,
        unitPrice: med.unitPrice || 0.10,
        value: currentBalance * (med.unitPrice || 0.10)
      };
    });
  }, [medicines, stockIns, usageLogs, selectedMonth]);

  // Active listings filters
  const filteredMedicines = useMemo(() => {
    return medicines.filter(m => {
      const matchesSearch = 
        m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.strength.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = categoryFilter === 'All' ? true : m.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [medicines, searchTerm, categoryFilter]);

  const filteredStockIns = useMemo(() => {
    return stockIns.filter(s => {
      return (
        s.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.batchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.receivedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }).sort((a,b) => b.date.localeCompare(a.date));
  }, [stockIns, searchTerm]);

  const filteredUsageLogs = useMemo(() => {
    return usageLogs.filter(u => {
      return (
        u.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.nurse.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }).sort((a,b) => b.date.localeCompare(a.date));
  }, [usageLogs, searchTerm]);

  // Event Handlers: 1. Medicine Master List CRUD
  const handleOpenMedForm = (existing?: Medicine) => {
    if (existing) {
      setEditingMedId(existing.id);
      setFormMedName(existing.name);
      setFormMedCategory(existing.category);
      setFormMedStrength(existing.strength);
      setFormMedStock(existing.stock);
      setFormMedPurchaseDate(existing.purchaseDate);
      setFormMedExpiryDate(existing.expiryDate);
      setFormMedLocation(existing.location);
      setFormMedStatus(existing.status);
      setFormMedPrice(existing.unitPrice || 0.10);
      setFormMedReorderPoint(existing.reorderPoint !== undefined ? existing.reorderPoint : 30);
      setFormMedPhoto(existing.photo || '');
    } else {
      setEditingMedId(null);
      // Auto-increment ID based on count
      const genericId = `MED${String(medicines.length + 1).padStart(3, '0')}`;
      setEditingMedId(null);
      setFormMedName('');
      setFormMedCategory('Tablet');
      setFormMedStrength('');
      setFormMedStock(0);
      const today = new Date().toISOString().split('T')[0];
      setFormMedPurchaseDate(today);
      setFormMedExpiryDate(new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // default 2 years expiration
      setFormMedLocation('Cabinet A');
      setFormMedStatus('Active');
      setFormMedPrice(0.10);
      setFormMedReorderPoint(30);
      setFormMedPhoto('');
    }
    setIsMedFormOpen(true);
  };

  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMedName.trim() || !formMedStrength.trim() || !formMedLocation.trim()) {
      alert(lang === 'kh' ? 'សូមបំពេញព័ត៌មានដែលចាំបាច់ឱ្យបានគ្រប់គ្រាន់!' : 'Please fill in name, strength and storage location!');
      return;
    }

    if (editingMedId) {
      const updated = medicines.map(m => {
        if (m.id === editingMedId) {
          return {
            ...m,
            name: formMedName.trim(),
            category: formMedCategory,
            strength: formMedStrength.trim(),
            stock: Number(formMedStock),
            purchaseDate: formMedPurchaseDate,
            expiryDate: formMedExpiryDate,
            location: formMedLocation.trim(),
            status: formMedStatus,
            unitPrice: Number(formMedPrice),
            reorderPoint: Number(formMedReorderPoint),
            photo: formMedPhoto
          };
        }
        return m;
      });
      setMedicines(updated);
      triggerToast(lang === 'kh' ? 'កែប្រែព័ត៌មានឱសថបានសម្រេច!' : 'Medicine details updated!');
    } else {
      const newId = `MED${String(medicines.length + 1).padStart(3, '0')}`;
      // Double check ID uniqueness
      const isUnique = !medicines.some(m => m.id === newId);
      const finalId = isUnique ? newId : `MED${Date.now().toString().slice(-3)}`;

      const newMed: Medicine = {
        id: finalId,
        name: formMedName.trim(),
        category: formMedCategory,
        strength: formMedStrength.trim(),
        stock: Number(formMedStock),
        purchaseDate: formMedPurchaseDate,
        expiryDate: formMedExpiryDate,
        location: formMedLocation.trim(),
        status: formMedStatus,
        unitPrice: Number(formMedPrice),
        reorderPoint: Number(formMedReorderPoint),
        photo: formMedPhoto
      };
      setMedicines([...medicines, newMed]);
      triggerToast(lang === 'kh' ? 'បានបន្ថែមឱសថថ្មីក្នុងបញ្ជីមេជោគជ័យ!' : 'New compound added to master list!');
    }
    setIsMedFormOpen(false);
  };

  const handleDeleteMedicine = () => {
    if (!deleteMedId) return;
    setMedicines(medicines.filter(m => m.id !== deleteMedId));
    setDeleteMedId(null);
    triggerToast(lang === 'kh' ? 'លុបឱសថចេញពីប្រព័ន្ធរួចរាល់!' : 'Medicine record deleted!');
  };

  const handleDeleteStockIn = () => {
    if (!deleteStockInId) return;
    const target = stockIns.find(s => s.id === deleteStockInId);
    if (target) {
      // Revert added stock
      const updatedMeds = medicines.map(m => {
        if (m.id === target.medicineId) {
          return {
            ...m,
            stock: Math.max(0, m.stock - target.qtyIn)
          };
        }
        return m;
      });
      setMedicines(updatedMeds);
      setStockIns(stockIns.filter(s => s.id !== deleteStockInId));
      triggerToast(lang === 'kh' ? 'បានលុបកំណត់ត្រានាំចូលស្តុក និងកាត់បន្ថយចំនួនស្តុកវិញរួចរាល់!' : 'Stock-in receipt deleted and stock quantity reverted!');
    }
    setDeleteStockInId(null);
  };

  const handleDeleteUsageLog = () => {
    if (!deleteUsageLogId) return;
    const target = usageLogs.find(u => u.id === deleteUsageLogId);
    if (target) {
      // Revert subtracted stock (add it back!)
      const updatedMeds = medicines.map(m => {
        if (m.id === target.medicineId) {
          return {
            ...m,
            stock: m.stock + target.qtyUsed
          };
        }
        return m;
      });
      setMedicines(updatedMeds);
      setUsageLogs(usageLogs.filter(u => u.id !== deleteUsageLogId));
      triggerToast(lang === 'kh' ? 'បានលុបកំណត់ត្រាប្រើប្រាស់ និងសងចំនួនស្តុកត្រឡប់មកវិញរួចរាល់!' : 'Usage log deleted and stock units returned!');
    }
    setDeleteUsageLogId(null);
  };

  // Event Handlers: 2. Stock In Log + AUTO-ADD STOCK
  const handleOpenStockForm = () => {
    if (medicines.length === 0) {
      alert(lang === 'kh' ? 'សូមបង្កើតបញ្ជីថ្នាំមេ ជាមុនសិន!' : 'Please add a medicine to master list first!');
      return;
    }
    setFormStockMedId(medicines[0].id);
    setFormStockQty(50);
    setFormStockSupplier('ABC Pharma');
    setFormStockBatch(`B${String(stockIns.length + 101)}`);
    const today = new Date().toISOString().split('T')[0];
    setFormStockDate(today);
    setFormStockExpiry(new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setFormStockReceiver(currentUser?.fullName || currentUser?.username || 'Nurse Manager');
    setIsStockFormOpen(true);
  };

  const handleSaveStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStockBatch.trim() || !formStockSupplier.trim() || !formStockReceiver.trim()) {
      alert(lang === 'kh' ? 'សូមបំពេញព័ត៌មានដែលចាំបាច់!' : 'Please fill in batch, supplier and receiver name!');
      return;
    }

    const selectedMed = medicines.find(m => m.id === formStockMedId);
    if (!selectedMed) return;

    const newStock: MedicineStockIn = {
      id: `STKIN_${Date.now()}`,
      date: formStockDate,
      medicineId: formStockMedId,
      medicineName: selectedMed.name,
      qtyIn: Number(formStockQty),
      supplier: formStockSupplier.trim(),
      batchNo: formStockBatch.trim(),
      expiryDate: formStockExpiry,
      receivedBy: formStockReceiver.trim()
    };

    // Incremental Stock Add-on (កាត់ស្តុកស្វ័យប្រវត្តិកើន)
    const updatedMeds = medicines.map(m => {
      if (m.id === formStockMedId) {
        return {
          ...m,
          stock: m.stock + Number(formStockQty),
          expiryDate: formStockExpiry // Update main expiry date to newest batch expiry
        };
      }
      return m;
    });

    setMedicines(updatedMeds);
    setStockIns([newStock, ...stockIns]);
    setIsStockFormOpen(false);
    triggerToast(lang === 'kh' ? `បានបញ្ចូលថ្នាំ ${selectedMed.name} ចំនួន +${formStockQty} គ្រាប់/ដប ជោគជ័យ!` : `Stock increased for ${selectedMed.name} by +${formStockQty}!`);
  };

  // Event Handlers: 3. Usage Logs + AUTO-DEDUCT STOCK
  const handleOpenUsageForm = () => {
    const activeMeds = medicines.filter(m => m.stock > 0 && m.status === 'Active');
    if (activeMeds.length === 0) {
      alert(lang === 'kh' ? 'គ្មានឱសថសេសសល់ក្នុងស្តុកដែលអាចប្រើប្រាស់បានទេ!' : 'No medicines available in stock to dispense!');
      return;
    }
    setFormUsgStudent('');
    setFormUsgGrade('Grade 5');
    setFormUsgMedId(activeMeds[0].id);
    setFormUsgQty(1);
    setFormUsgReason('Headache (ឈឺក្បាល)');
    setFormUsgNurse(currentUser?.fullName || currentUser?.username || 'Nurse Manager');
    setIsUsageFormOpen(true);
  };

  const handleSaveUsageLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsgStudent.trim() || !formUsgReason.trim() || !formUsgNurse.trim()) {
      alert(lang === 'kh' ? 'សូមបំពេញឈ្មោះសិស្ស ថ្នាក់ និងមូលហេតុធូរស្រាលលោត!' : 'Please fill in student name, doctor reason and treating nurse!');
      return;
    }

    const selectedMed = medicines.find(m => m.id === formUsgMedId);
    if (!selectedMed) return;

    if (selectedMed.stock < Number(formUsgQty)) {
      alert(lang === 'kh' 
        ? `មិនអាចកាត់ស្តុកបានឡើយ! ស្តុកថ្នាំ ${selectedMed.name} មានត្រឹមតែ ${selectedMed.stock} ប៉ុណ្ណោះ!` 
        : `Insufficient Stock! ${selectedMed.name} only has ${selectedMed.stock} units available.`);
      return;
    }

    const newUsage: MedicineUsageLog = {
      id: `USG_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      studentName: formUsgStudent.trim(),
      grade: formUsgGrade.trim(),
      medicineId: formUsgMedId,
      medicineName: selectedMed.name,
      qtyUsed: Number(formUsgQty),
      reason: formUsgReason.trim(),
      nurse: formUsgNurse.trim()
    };

    // Auto-deduct stock quantity (កាត់ស្តុកស្វ័យប្រវត្ត)
    const updatedMeds = medicines.map(m => {
      if (m.id === formUsgMedId) {
        return {
          ...m,
          stock: Math.max(0, m.stock - Number(formUsgQty))
        };
      }
      return m;
    });

    setMedicines(updatedMeds);
    setUsageLogs([newUsage, ...usageLogs]);
    setIsUsageFormOpen(false);
    triggerToast(lang === 'kh' ? `បានកាត់ដកស្តុកថ្នាំ ${selectedMed.name} ចំនួន -${formUsgQty} គ្រាប់ រួចរាល់!` : `Dispensed ${formUsgQty} units of ${selectedMed.name}. Stock updated.`);
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-xs space-y-8 font-sans transition-all duration-300">
      
      {/* Toast Announcement */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 bg-slate-900 border border-slate-800 text-amber-300 font-extrabold px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 text-xs tracking-wide"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>{showNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Large Modal */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setPreviewImage(null)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl flex flex-col items-center gap-4 relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{lang === 'kh' ? 'រូបភាពបង្ហាញពេញលេញ (300px)' : 'Full Details Preview (300px)'}</h4>
              <img src={previewImage} alt="Medicine Detail" className="w-[300px] h-[300px] object-cover rounded-2xl border border-slate-100 shadow-inner" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#052C2B] text-amber-300 rounded-2xl">
            <Pill className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {lang === 'kh' ? 'ប្រព័ន្ធគ្រប់គ្រងថ្នាំពេទ្យសាលា (Medicine Management)' : 'School Health & Medicine Registry'}
            </h2>
            <p className="text-xs text-slate-400 font-bold mt-1">
              {lang === 'kh' ? 'គ្រប់គ្រងស្តុកថ្នាំ ថ្ងៃផុតកំណត់ ការបញ្ចូលថ្នាំបន្ថែម និងការប្រើប្រាស់របស់សិស្សានុសិស្ស' : 'Dispensation logs, active batch expirations, stock-in records, and monthly statistics.'}
            </p>
          </div>
        </div>

        {/* Global actions context */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (activeSubTab === 'master') handleOpenMedForm();
              else if (activeSubTab === 'stockin') handleOpenStockForm();
              else if (activeSubTab === 'usage') handleOpenUsageForm();
              else handleOpenMedForm();
            }}
            className="bg-[#052C2B] hover:bg-[#073B3A] text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl transition duration-150 cursor-pointer shadow-xs active:scale-97 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>
              {activeSubTab === 'usage' 
                ? (lang === 'kh' ? 'កត់ត្រាការប្រើប្រាស់ថ្នាំ' : 'Log Patient Intake') 
                : activeSubTab === 'stockin'
                ? (lang === 'kh' ? 'បញ្ចូលឱសថថ្មី' : 'Log Stock Intake')
                : (lang === 'kh' ? 'បន្ថែមឱសថបញ្ជីមេ' : 'Add Medicine Master')}
            </span>
          </button>
        </div>
      </div>

      {/* Subsection Tab Toggles */}
      <div className="flex overflow-x-auto pb-1 border-b border-slate-200 gap-1.5 no-scrollbar">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-4.5 py-2.5 text-xs sm:text-sm font-black rounded-lg transition duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'dashboard'
              ? 'bg-[#0d5c5a] text-white shadow-xs'
              : 'text-slate-500 hover:text-[#0d5c5a] hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{lang === 'kh' ? 'ផ្ទាំងគ្រប់គ្រង (Dashboard)' : 'Dashboard'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('master')}
          className={`px-4.5 py-2.5 text-xs sm:text-sm font-black rounded-lg transition duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'master'
              ? 'bg-[#0d5c5a] text-white shadow-xs'
              : 'text-slate-500 hover:text-[#0d5c5a] hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{lang === 'kh' ? '១. បញ្ជីឱសថមេ (Medicine Master)' : '1. Medicine Registry'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('stockin')}
          className={`px-4.5 py-2.5 text-xs sm:text-sm font-black rounded-lg transition duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'stockin'
              ? 'bg-[#0d5c5a] text-white shadow-xs'
              : 'text-slate-500 hover:text-[#0d5c5a] hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{lang === 'kh' ? '២. បញ្ចូលឱសថ (Medicine Stock In)' : '2. Stock Shipment In'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('usage')}
          className={`px-4.5 py-2.5 text-xs sm:text-sm font-black rounded-lg transition duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'usage'
              ? 'bg-[#0d5c5a] text-white shadow-xs'
              : 'text-slate-500 hover:text-[#0d5c5a] hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{lang === 'kh' ? '៣. ប្រើប្រាស់ថ្នាំ (Medicine Use Logs)' : '3. Patient Dispense Log'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('report')}
          className={`px-4.5 py-2.5 text-xs sm:text-sm font-black rounded-lg transition duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'report'
              ? 'bg-[#0d5c5a] text-white shadow-xs'
              : 'text-slate-500 hover:text-[#0d5c5a] hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{lang === 'kh' ? '៤. របាយការណ៍ & ផុតកំណត់ (Report / Alerts)' : '4. Report & Expiration'}</span>
        </button>
      </div>

      {/* Google Sheets Medicine Sync Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4.5 shadow-2xs">
        <div 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
          onClick={() => setShowSheetSetup(!showSheetSetup)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-150 shrink-0">
              <FileSpreadsheet className={`w-5 h-5 shrink-0 ${isSyncing ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center flex-wrap gap-2 leading-relaxed">
                <span className="font-moul text-[11px] font-normal tracking-wide text-[#073B3A]">📊 សមកាលកម្មប្រព័ន្ធគ្រប់គ្រងឱសថទៅ Google Sheets</span>
                <span className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider">(Google Sheets Medicine Inventory Sync)</span>
                {lastSyncedAt && (
                  <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2.5 py-1.5 rounded-full border border-emerald-250">
                    សមកាលកម្មចុងក្រោយ៖ {lastSyncedAt}
                  </span>
                )}
              </h4>
              <p className="text-[11.5px] text-slate-500 font-medium mt-1 leading-relaxed">
                បម្រុងទុក និងធ្វើសមកាលកម្មទិន្នន័យឱសថ បញ្ជីនាំចូល និងប្រវត្តិប្រើប្រាស់ទាំងអស់ទៅកាន់ Google Drive ផ្ទាល់ខ្លួន <span className="text-slate-400 font-sans">| Back up & sync medicine inventory, stock logs, and dispense history to Google Sheets</span>
              </p>
            </div>
          </div>
          
          <button
            type="button"
            className="text-[10.5px] font-black text-emerald-755 hover:text-emerald-900 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl transition cursor-pointer shrink-0 self-end sm:self-auto shadow-2xs"
          >
            {showSheetSetup ? 'លាក់ការតភ្ជាប់ (Hide Settings)' : 'គ្រប់គ្រងការតភ្ជាប់ (Manage Connection)'}
          </button>
        </div>

        <AnimatePresence>
          {showSheetSetup && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5.5 items-start">
                  
                  {/* Account Status */}
                  <div className="md:col-span-12 lg:col-span-5 space-y-3.5">
                    <h5 className="text-[11.5px] font-bold text-[#0d5c5a] tracking-wider uppercase">
                      គណនីតភ្ជាប់ Google (Google Auth Connection)
                    </h5>
                    
                    {!googleUser ? (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                        <p className="text-[11.5px] text-slate-500 font-semibold leading-relaxed">
                          មិនទាន់មានការតភ្ជាប់គណនី Google នៅឡើយទេ។ សូមភ្ជាប់គណនីដើម្បីអនុញ្ញាតឱ្យប្រព័ន្ធសរសេរទិន្នន័យចូល។
                        </p>
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={isSyncing}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-4 py-2 rounded-xl transition hover:scale-[1.01] active:scale-[0.99] flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                        >
                          {isSyncing ? 'កំពុងភ្ជាប់...' : 'ភ្ជាប់គណនី Google (Connect Google Account)'}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-slate-50/50 border border-slate-200 p-4 rounded-2xl space-y-3.5">
                        <div className="flex items-center gap-3">
                          {googleUser.photoURL ? (
                            <img 
                              src={googleUser.photoURL} 
                              alt="Google Profile" 
                              className="w-10 h-10 rounded-full border-2 border-emerald-400"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                              {googleUser.displayName?.charAt(0) || 'G'}
                            </div>
                          )}
                          <div>
                            <h6 className="text-xs font-black text-slate-800 leading-tight">{googleUser.displayName}</h6>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{googleUser.email}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleGoogleSignOut}
                            disabled={isSyncing}
                            className="text-[10.5px] font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-100 bg-white px-3 py-1.5 rounded-xl cursor-pointer transition disabled:opacity-50 shadow-xs"
                          >
                            ផ្តាច់ការតភ្ជាប់ (Disconnect Account)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Spreadsheet Settings & Actions */}
                  <div className="md:col-span-12 lg:col-span-7 space-y-3.5">
                    <h5 className="text-[11.5px] font-bold text-[#0d5c5a] tracking-wider uppercase">
                      ការសមកាលកម្មបន្ទះកិច្ចការ (Spreadsheet Configuration & Sync)
                    </h5>

                    {/* Existing Spreadsheet Info or Link Input */}
                    <div className="bg-slate-50/50 border border-slate-200 p-4 rounded-2xl space-y-4">
                      {spreadsheetId ? (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-455 uppercase block">បន្ទះកិច្ចការដែលកំពុងភ្ជាប់ (Connected Sheet)</span>
                            <div className="flex items-center justify-between gap-2 bg-white border border-slate-200 p-2.5 rounded-xl">
                              <div className="truncate">
                                <span className="text-xs font-bold text-slate-800 block truncate">WIS School Management Master Sheet</span>
                                <span className="text-[9.5px] font-mono text-slate-400">ID: {spreadsheetId}</span>
                              </div>
                              <a 
                                href={spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[10px] uppercase font-black tracking-wider text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 transition shrink-0 shadow-3xs"
                              >
                                បើកសន្លឹកកិច្ចការ (Open Sheet)
                              </a>
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap pt-1">
                            <button
                              type="button"
                              onClick={handleSyncToSheets}
                              disabled={isSyncing}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-4.5 py-2.5 rounded-xl transition hover:scale-[1.01] active:scale-[0.99] flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                            >
                              <FileSpreadsheet className="w-4 h-4 shrink-0" />
                              <span>{isSyncing ? 'កំពុងសមកាលកម្ម...' : 'ធ្វើសមកាលកម្មឥឡូវនេះ (Sync All Tab Registries)'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('តើអ្នកពិតជាចង់ផ្តាច់តំណភ្ជាប់សន្លឹកកិច្ចការនេះមែនទេ?')) {
                                  localStorage.removeItem('wis_google_spreadsheet_id');
                                  localStorage.removeItem('wis_google_spreadsheet_url');
                                  setSpreadsheetId(null);
                                  setSpreadsheetUrl(null);
                                  triggerToast('បានផ្តាច់សន្លឹកកិច្ចការ!');
                                }
                              }}
                              className="text-[10px] font-bold text-slate-500 hover:text-slate-850 hover:bg-slate-100 px-3 py-2 rounded-xl border border-transparent transition cursor-pointer"
                            >
                              ប្តូរសន្លឹកកិច្ចការ (Change Sheet Connection)
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          <div>
                            <span className="text-xs font-extrabold text-[#073B3A] block">មិនទាន់មានបន្ទះកិច្ចការ Google Sheets ភ្ជាប់ឡើយ</span>
                            <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                              លោកអ្នកអាចប្រើប្រាស់សន្លឹកកិច្ចការ Master ដូចគ្នានៅលើ Dashboard ឬបញ្ចូល Link សន្លឹកកិច្ចការផ្ទាល់ខ្លួនដើម្បីសមកាលកម្ម៖
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const masterId = localStorage.getItem('wis_google_spreadsheet_id');
                                const masterUrl = localStorage.getItem('wis_google_spreadsheet_url');
                                if (masterId) {
                                  setSpreadsheetId(masterId);
                                  setSpreadsheetUrl(masterUrl);
                                  triggerToast('បានតភ្ជាប់ទៅកាន់បន្ទះកិច្ចការ Master ជោគជ័យ!');
                                } else {
                                  triggerToast('រកមិនឃើញសន្លឹកកិច្ចការ Master ឡើយ។ សូមបង្កើតវានៅលើ Dashboard ឬភ្ជាប់ដោយបញ្ចូល Link ផ្ទាល់!');
                                }
                              }}
                              className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-[10.5px] px-3 py-2 rounded-xl transition cursor-pointer"
                            >
                              🔗 ប្រើសន្លឹកកិច្ចការ Master របស់សាលា
                            </button>
                          </div>

                          <div className="border-t border-slate-200/60 pt-3 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-455 block">តភ្ជាប់ដោយ Link ផ្ទាល់ (Link a Custom Spreadsheet URL)</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={customSpreadsheetUrlInput}
                                onChange={(e) => setCustomSpreadsheetUrlInput(e.target.value)}
                                placeholder="https://docs.google.com/spreadsheets/d/your-id..."
                                className="flex-1 bg-white border border-slate-200 focus:border-[#0d5c5a] rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-inner"
                              />
                              <button
                                type="button"
                                onClick={handleLinkCustomSpreadsheet}
                                className="bg-[#052C2B] hover:bg-[#073B3A] text-white font-black text-xs px-3.5 py-1.5 rounded-xl cursor-pointer shadow-xs"
                              >
                                តភ្ជាប់ (Link)
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {syncError && (
                        <div className="p-3 bg-rose-50 border border-rose-250 text-rose-800 text-[11px] font-semibold rounded-xl leading-relaxed">
                          ⚠️ {syncError}
                        </div>
                      )}

                      {syncSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-[11px] font-semibold rounded-xl leading-relaxed">
                          ✅ សមកាលកម្មបានជោគជ័យឥតខ្ចោះ! បន្ទះកិច្ចការ Google Sheets របស់អ្នក ត្រូវបានបង្កើត/ធ្វើបច្ចុប្បន្នភាពសន្លឹកការងារចំនួន ៣ ផ្សេងគ្នា។
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SUBTAB CONTENT 1: DASHBOARD PANEL */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total items style box */}
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{lang === 'kh' ? 'ឱសថសរុប (Varieties)' : 'Varying Drugs'}</span>
                <div className="p-1.5 bg-[#052C2B]/10 text-[#0d5c5a] rounded-lg">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{dashboardStats.totalItems}</span>
                <span className="text-[10px] text-slate-400 font-bold">{dashboardStats.totalStockQty} {lang === 'kh' ? 'គ្រាប់/ដប' : 'units'}</span>
              </div>
            </div>

            {/* Expiring Alert */}
            <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-800 uppercase tracking-widest">{lang === 'kh' ? 'ជិតផុតកំណត់ (≤៩០ ថ្ងៃ)' : 'Near Expiry (≤90 Days)'}</span>
                <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-amber-900">{dashboardStats.nearExpiryCount}</span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-sm">
                  {lang === 'kh' ? 'គួរពិនិត្យខ្លាំង' : 'Action Required'}
                </span>
              </div>
            </div>

            {/* Top utilized drug */}
            <div className="bg-teal-50 border border-teal-100 p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-teal-800 uppercase tracking-widest">{lang === 'kh' ? 'ប្រើប្រាស់ច្រើនជាងគេ' : 'Most Dispensed'}</span>
                <div className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-lg sm:text-xl font-black text-teal-950 truncate max-w-[150px]" title={dashboardStats.topUsedName}>
                  {dashboardStats.topUsedName}
                </span>
                <span className="text-[10px] text-teal-600 font-bold uppercase">{lang === 'kh' ? 'ខែមិថុនា' : 'June Log'}</span>
              </div>
            </div>

            {/* Total Stock valuation */}
            <div className="bg-[#052C2B] text-emerald-100 p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 uppercase tracking-widest">{lang === 'kh' ? 'តម្លៃស្តុកសរុប (Value)' : 'Stock Valuation'}</span>
                <div className="p-1.5 bg-emerald-800 text-amber-300 rounded-lg">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-white">${dashboardStats.totalStockValue.toFixed(2)}</span>
                <span className="text-[10px] font-bold text-emerald-300">USD</span>
              </div>
            </div>

          </div>

          {/* Quick alert overview from critical warnings */}
          <div className="border border-slate-150 rounded-2xl p-5 bg-white space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>{lang === 'kh' ? 'ស្ថានភាពផុតកំណត់ឱសថប្រុងប្រយ័ត្ន (Active Expiry Reminders)' : 'Active Expiration Reminders (Live Tracker)'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {expiryAlertsList.slice(0, 4).map((alert) => {
                const badgeStyle = 
                  alert.daysLeft <= 30
                    ? 'border-l-4 border-rose-500 bg-rose-50/50 text-rose-900'
                    : alert.daysLeft <= 60
                    ? 'border-l-4 border-amber-500 bg-amber-50/50 text-amber-900'
                    : alert.daysLeft <= 90
                    ? 'border-l-4 border-yellow-400 bg-yellow-50/30 text-yellow-900'
                    : 'border-l-4 border-emerald-400 bg-emerald-50/20 text-slate-700';

                return (
                  <div key={alert.id} className={`p-3.5 rounded-xl border border-slate-100 flex items-center justify-between gap-4 ${badgeStyle}`}>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black">{alert.name} <span className="font-mono text-[10px] text-slate-400 px-1 rounded-sm bg-slate-100">{alert.strength}</span></h4>
                      <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{lang === 'kh' ? `ផុតកំណត់៖ ${alert.expiryDate}` : `Expires: ${alert.expiryDate}`}</span>
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <span className="block text-xs font-extrabold">
                        {alert.daysLeft <= 0 
                          ? (lang === 'kh' ? 'ហួសកំណត់' : 'Expired')
                          : `${alert.daysLeft} ${lang === 'kh' ? 'ថ្ងៃទៀត' : 'Days Left'}`}
                      </span>
                      <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 bg-white/70 border border-slate-200">
                        {alert.daysLeft <= 30 ? '🔴 Critical' : alert.daysLeft <= 60 ? '🟠 Warning' : alert.daysLeft <= 90 ? '🟡 Alert' : '🟢 Safe'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {expiryAlertsList.length > 4 && (
              <button 
                onClick={() => setActiveSubTab('report')}
                className="text-xs font-black text-[#0d5c5a] hover:underline flex items-center gap-1 cursor-pointer mt-2"
              >
                <span>{lang === 'kh' ? `មើលបន្ថែមការលម្អិតទាំងអស់ (${expiryAlertsList.length}) »` : `View all ${expiryAlertsList.length} alert records »`}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT 2: MEDICINE MASTER REGISTRY */}
      {activeSubTab === 'master' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3 py-1">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder={lang === 'kh' ? 'ស្វែងរកឈ្មោះឱសថ ប្រភេទ ឬទីតាំងលាក់ទុក...' : 'Search medicine name, strength, category or drawer location...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c5a] focus:border-transparent font-normal bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-400 font-bold whitespace-nowrap">
                <Filter className="w-3.5 h-3.5" />
                <span>{lang === 'kh' ? 'ប្រភេទ៖' : 'Type:'}</span>
              </div>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-1 focus:ring-[#0d5c5a] font-bold"
              >
                <option value="All">{lang === 'kh' ? 'ទាំងអស់ (All Types)' : 'All Types'}</option>
                <option value="Tablet">{lang === 'kh' ? 'គ្រាប់ណែន (Tablet)' : 'Tablet'}</option>
                <option value="Capsule">{lang === 'kh' ? 'គ្រាប់កន្សោម (Capsule)' : 'Capsule'}</option>
                <option value="Syrup">{lang === 'kh' ? 'ទឹកស៊ីរ៉ូ (Syrup)' : 'Syrup'}</option>
                <option value="Suspension">{lang === 'kh' ? 'ទឹកល្បាយ (Suspension)' : 'Suspension'}</option>
                <option value="Cream/Ointment">{lang === 'kh' ? 'រឹតលាប (Cream/Ointment)' : 'Cream/Ointment'}</option>
              </select>
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500 border-collapse">
                <thead className="text-[11px] uppercase tracking-wider text-slate-700 bg-slate-50 border-b border-slate-150">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 font-black">{lang === 'kh' ? 'លេខកូដ (ID)' : 'Med Code'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black">{lang === 'kh' ? 'រូបភាព' : 'Drug Photo'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black">{lang === 'kh' ? 'ឈ្មោះឱសថ' : 'Medicine Name'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black">{lang === 'kh' ? 'ប្រភេទ / កម្លាំង' : 'Category / Strength'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black text-center">{lang === 'kh' ? 'ចំនួនស្តុក' : 'Stock Qty'}</th>
                    <th scope="col" className="px-3 py-3.5 font-black">{lang === 'kh' ? 'ថ្ងៃផុតកំណត់' : 'Expiry Date'}</th>
                    <th scope="col" className="px-3 py-3.5 font-black">{lang === 'kh' ? 'ទូសាលា' : 'Cabinet'}</th>
                    <th scope="col" className="px-3 py-3.5 font-black">{lang === 'kh' ? 'តម្លៃមធ្យម' : 'Est. Price'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black text-right">{lang === 'kh' ? 'សកម្មភាព' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMedicines.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-400 font-bold">
                        <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        {lang === 'kh' ? 'មិនឃើញមានទិន្នន័យឱសថឡើយ' : 'No medicine logs found for this filter.'}
                      </td>
                    </tr>
                  ) : (
                    filteredMedicines.map((med) => {
                      const expDetails = getExpiryDetails(med.expiryDate);
                      const isLowStock = med.stock <= (med.reorderPoint ?? 30);
                      return (
                        <tr 
                          key={med.id} 
                          className={`${
                            isLowStock 
                              ? 'bg-rose-50/60 hover:bg-rose-100/60 border-l-4 border-rose-500' 
                              : 'hover:bg-slate-50/50'
                          } transition`}
                        >
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">
                            <div className="flex items-center gap-1">
                              {isLowStock && (
                                <span className="inline-block text-rose-600 animate-pulse" title={lang === 'kh' ? 'ស្តុកក្រោមកម្រិតកំណត់ (Below Reorder Point)' : 'Below Reorder Point'}>
                                  <AlertCircle className="w-3.5 h-3.5" />
                                </span>
                              )}
                              {med.id}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {med.photo ? (
                              <div className="relative group cursor-pointer" onClick={() => setPreviewImage(med.photo)}>
                                <img src={med.photo} alt={med.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                                <div className="absolute inset-0 bg-black/40 text-white rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                  <Eye className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-emerald-50 text-[#0d5c5a] border border-emerald-100 rounded-lg flex items-center justify-center font-black">
                                <Pill className="w-5 h-5 text-emerald-600/80" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-extrabold text-slate-800 text-sm block">{med.name}</span>
                            {med.status === 'Inactive' && (
                              <span className="inline-block px-1.5 py-0.5 text-[8px] font-bold text-slate-400 bg-slate-100 rounded-full mt-0.5">Inactive</span>
                            )}
                          </td>
                          <td className="px-4 py-3 space-y-0.5">
                            <span className="text-slate-700 font-medium text-xs block">{med.category}</span>
                            <span className="text-slate-400 font-mono text-[10px] block">{med.strength}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center justify-center gap-0.5">
                              <span className={`inline-block font-black text-xs px-2.5 py-1 rounded-full ${
                                isLowStock 
                                  ? 'text-rose-700 bg-rose-100 border border-rose-300' 
                                  : med.stock <= (med.reorderPoint ? med.reorderPoint * 1.5 : 50) 
                                  ? 'text-amber-700 bg-amber-50 border border-amber-100' 
                                  : 'text-slate-900 bg-slate-50'
                              }`}>
                                {med.stock}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400">
                                {lang === 'kh' ? `លីមីត៖ ${med.reorderPoint ?? 30}` : `Limit: ${med.reorderPoint ?? 30}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${expDetails.color}`}>
                              {med.expiryDate}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-medium text-slate-700">{med.location}</td>
                          <td className="px-3 py-3 font-mono font-bold text-slate-600">${(med.unitPrice || 0.10).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenMedForm(med)}
                                className="p-1 text-slate-500 hover:text-[#0d5c5a] hover:bg-slate-100 rounded transition cursor-pointer"
                                title="Edit Medicine"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteMedId(med.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                                title="Delete Medicine"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT 3: MEDICINE STOCK IN */}
      {activeSubTab === 'stockin' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              {lang === 'kh' ? 'បញ្ជីដឹកជញ្ជូនចូលស្តុកឱសថ (Stock In Shipment Registry)' : 'Bulk Medicine Stock Receipts'}
            </h3>
            
            <div className="relative max-w-xs w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder={lang === 'kh' ? 'ស្វែងរកលេខ Batch ឬអ្នកផ្គត់ផ្គង់...' : 'Search logs, batch numbers or supplier...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0d5c5a] bg-slate-50/50"
              />
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="text-[11px] uppercase tracking-wider text-slate-700 bg-slate-50 border-b border-slate-150">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 font-black">{lang === 'kh' ? 'ថ្ងៃខែឆ្នាំបញ្ចូល' : 'Date Stock In'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black">{lang === 'kh' ? 'ឈ្មោះឱសថ' : 'Medicine'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black text-center">{lang === 'kh' ? 'បរិមាណបញ្ចូល' : 'Qty Received'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black">{lang === 'kh' ? 'លេខ Batch No.' : 'Batch No.'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black">{lang === 'kh' ? 'ក្រុមហ៊ុនផ្គត់ផ្គង់' : 'Supplier'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black">{lang === 'kh' ? 'ថ្ងៃផុតកំណត់' : 'Expiry Date'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black">{lang === 'kh' ? 'អ្នកទទួល' : 'Received By'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black text-center">{lang === 'kh' ? 'សកម្មភាព' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStockIns.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-slate-400 font-bold">
                        {lang === 'kh' ? 'មិនឃើញមានទិន្នន័យបញ្ចូលថ្នាំថ្មីទេ' : 'No stock receipts found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredStockIns.map((stk) => (
                      <tr key={stk.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{stk.date}</td>
                        <td className="px-4 py-3 font-extrabold text-slate-800">{stk.medicineName}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-black text-[#0d5c5a] bg-teal-50 px-2 py-0.5 rounded border border-teal-100/85">
                            +{stk.qtyIn}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-indigo-700">{stk.batchNo}</td>
                        <td className="px-4 py-3 font-medium text-slate-700">{stk.supplier}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{stk.expiryDate}</td>
                        <td className="px-4 py-3 font-medium text-slate-600">{stk.receivedBy}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setDeleteStockInId(stk.id)}
                            className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer inline-flex items-center"
                            title={lang === 'kh' ? 'លុបកំណត់ត្រានាំចូលស្តុក' : 'Delete Stock Receipt'}
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
        </div>
      )}

      {/* SUBTAB CONTENT 4: MEDICINE USAGE LOG */}
      {activeSubTab === 'usage' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              {lang === 'kh' ? 'កម្មវិធីតាមដានសិស្សកាត់ស្តុកប្រចាំថ្ងៃ (Daily Student Dispensation Logs)' : 'Dispensed Remedies History log'}
            </h3>
            
            <div className="relative max-w-xs w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder={lang === 'kh' ? 'ស្វែងរកសិស្ស ថ្នាក់ ឬមូលហេតុប្រើប្រាស់...' : 'Search student, medicine or symptoms...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0d5c5a] bg-slate-50/50"
              />
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="text-[11px] uppercase tracking-wider text-slate-700 bg-slate-50 border-b border-slate-150">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 font-black">{lang === 'kh' ? 'ថ្ងៃខែឆ្នាំ' : 'Intake Date'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black">{lang === 'kh' ? 'ឈ្មោះសិស្ស' : 'Student Name'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black">{lang === 'kh' ? 'ថ្នាក់/បន្ទប់' : 'Grade / Class'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black">{lang === 'kh' ? 'ឱសថប្រើប្រាស់' : 'Remedy (Medicine)'}</th>
                    <th scope="col" className="px-4 py-3.5 text-center font-black">{lang === 'kh' ? 'បរិមាណ' : 'Qty Used'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black">{lang === 'kh' ? 'រោគសញ្ញា ឬមូលហេតុ' : 'Symptom / Reason'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black">{lang === 'kh' ? 'គ្រូពេទ្យ/គិលានុបដ្ឋាយិកា' : 'Admin Nurse'}</th>
                    <th scope="col" className="px-4 py-3.5 font-black text-center">{lang === 'kh' ? 'សកម្មភាព' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsageLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-slate-400 font-bold">
                        {lang === 'kh' ? 'មិនមានកម្រងព័ត៌មានប្រើប្រាស់ឱសថថ្នាក់រៀនទេ' : 'No patients intake logged.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsageLogs.map((usg) => (
                      <tr key={usg.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{usg.date}</td>
                        <td className="px-4 py-3 font-extrabold text-slate-800">{usg.studentName}</td>
                        <td className="px-4 py-3 font-medium text-indigo-700">{usg.grade}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{usg.medicineName}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-100">
                            -{usg.qtyUsed} {lang === 'kh' ? 'គ្រាប់/ដប' : 'Tablets'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-600">{usg.reason}</td>
                        <td className="px-4 py-3 font-medium text-slate-700">{usg.nurse}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setDeleteUsageLogId(usg.id)}
                            className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer inline-flex items-center"
                            title={lang === 'kh' ? 'លុបកំណត់ត្រាប្រើប្រាស់' : 'Delete Usage Log'}
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
        </div>
      )}

      {/* SUBTAB CONTENT 5: REPORTS & ALERTS */}
      {activeSubTab === 'report' && (
        <div className="space-y-8">
          
          {/* Monthly usage report table */}
          <div className="border border-slate-150 rounded-2xl p-5 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase text-[#0d5c5a] tracking-tight">
                  {lang === 'kh' ? 'របាយការណ៍បម្រែបម្រួលឱសថប្រចាំខែ (Monthly Usage Summary Report)' : 'Monthly Drug Reconciliation Records'}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {lang === 'kh' ? 'បង្ហាញពីស្តុកដើមគ្រា បរិមាណចូល កាត់ប្រើប្រាស់ និងស្តុកចុងក្រោយ' : 'Compare stock opening balances, total incoming, used, and remaining.'}
                </p>
              </div>

              {/* Month selector pick */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">{lang === 'kh' ? 'ជ្រើសរើសខែ៖' : 'Month:'}</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-black text-slate-800"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="bg-[#052C2B] text-emerald-100 text-[10.5px] uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 font-bold rounded-l-xl">{lang === 'kh' ? 'ឈ្មោះថ្នាំពេទ្យ' : 'Medicine'}</th>
                    <th scope="col" className="px-4 py-3.5 font-bold text-center">{lang === 'kh' ? 'ស្តុកដើមគ្រា (Opening)' : 'Opening Stock'}</th>
                    <th scope="col" className="px-4 py-3.5 font-bold text-center">{lang === 'kh' ? 'បញ្ចូលបន្ថែម (Received)' : 'Received'}</th>
                    <th scope="col" className="px-4 py-3.5 font-bold text-center">{lang === 'kh' ? 'បានប្រើប្រាស់ (Used)' : 'Used'}</th>
                    <th scope="col" className="px-4 py-3.5 font-bold text-center">{lang === 'kh' ? 'ស្តុកចុងក្រោយ (Balance)' : 'Balance'}</th>
                    <th scope="col" className="px-4 py-3.5 font-bold text-right rounded-r-xl">{lang === 'kh' ? 'តម្លៃស្តុកដែលសល់' : 'Stock Value'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyUsageReport.map(rep => (
                    <tr key={rep.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3.5">
                        <span className="font-extrabold text-slate-800 block text-sm">{rep.name}</span>
                        <span className="font-mono text-[9px] text-slate-400 block">{rep.strength} • {rep.category}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-700">{rep.openingStock}</td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-teal-600">+{rep.received}</td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-rose-600">-{rep.used}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                          {rep.balance}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                        ${rep.value.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Alert System */}
          <div className="border border-slate-150 rounded-2xl p-5 bg-white space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase text-rose-900 tracking-tight flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>{lang === 'kh' ? 'ប្រព័ន្ធប្រកាសផុតកំណត់ និងតាមដានសុវត្ថិភាពឱសថ (Expiring Safety System Panel)' : 'Active Medicine Safety Warning Registers'}</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {lang === 'kh' ? 'ការជូនដំណឹង៖ 🟡 ប្រុងប្រយ័ត្ន (ក្នុង ៩០ ថ្ងៃ) • 🟠 ទឹកក្រូច (ក្នុង ៦០ ថ្ងៃ) • 🔴 គ្រោះថ្នាក់ (ក្នុង ៣០ ថ្ងៃ)' : 'Highlighting key safety color code alarms: 🟡 Alert (90 days) • 🟠 Urgent Alert (60 days) • 🔴 Critical Urgent Action (30 days)'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="bg-[#6B0404]/5 text-[#6B0404] text-[10.5px] uppercase tracking-wider border-b border-[#6B0404]/10">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-bold">{lang === 'kh' ? 'ឱសថ' : 'Medicine (Entity)'}</th>
                    <th scope="col" className="px-4 py-3 font-bold">{lang === 'kh' ? 'ថ្ងៃផុតកំណត់' : 'Expiry Date'}</th>
                    <th scope="col" className="px-4 py-3 text-center font-bold">{lang === 'kh' ? 'រយៈពេលនៅសល់' : 'Days Leeway Left'}</th>
                    <th scope="col" className="px-4 py-3 text-right font-bold">{lang === 'kh' ? 'ស្ថានភាពសុវត្ថិភាព' : 'Safety Status Alert'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {expiryAlertsList.map(item => {
                    const statusClass = 
                      item.daysLeft <= 30
                        ? 'text-red-700 bg-red-100 font-black px-2.5 py-1 rounded inline-block uppercase animate-pulse'
                        : item.daysLeft <= 60
                        ? 'text-orange-700 bg-orange-100 font-black px-2.5 py-1 rounded inline-block uppercase'
                        : item.daysLeft <= 90
                        ? 'text-yellow-800 bg-yellow-100 font-black px-2.5 py-1 rounded inline-block uppercase'
                        : 'text-emerald-700 bg-emerald-100 font-bold px-2.5 py-1 rounded inline-block';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3.5">
                          <span className="font-extrabold text-slate-800 block text-sm">{item.name}</span>
                          <span className="text-slate-400 text-[10px] block">{item.category} • {item.strength}</span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-700">{item.expiryDate}</td>
                        <td className="px-4 py-3.5 text-center font-mono font-extrabold text-sm text-slate-900">
                          {item.daysLeft <= 0 ? (
                            <span className="text-rose-600 font-black">{lang === 'kh' ? 'ហួសកំណត់' : 'Expired / Due'}</span>
                          ) : (
                            `${item.daysLeft} ${lang === 'kh' ? 'ថ្ងៃ' : 'Days'}`
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`text-[10px] tracking-wide ${statusClass}`}>
                            {item.daysLeft <= 0 
                              ? '🔴 CRITICAL/EXPIRED'
                              : item.daysLeft <= 30
                              ? '🔴 RED EXTREME WARNING'
                              : item.daysLeft <= 60
                              ? '🟠 ORANGE URGENT'
                              : item.daysLeft <= 90
                              ? '🟡 YELLOW NOTICE'
                              : '🟢 SAFE'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* RENDER MODAL: MEDICINE MASTER CREATE & EDIT FORM */}
      {isMedFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-[#052C2B] tracking-tight">
                {editingMedId 
                  ? (lang === 'kh' ? `កែប្រែឱសថ៖ ${formMedName}` : `Update Medicine: ${formMedName}`) 
                  : (lang === 'kh' ? 'បន្ថែមឱសថថ្មីក្នុងបញ្ជីមេ' : 'Add New Medicine to Master Registry')}
              </h3>
              <button 
                onClick={() => setIsMedFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 bg-slate-100 rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMedicine} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'ឈ្មោះឱសថ (Medicine Name) *' : 'Medicine Name'}</label>
                  <input
                    type="text"
                    required
                    value={formMedName}
                    onChange={e => setFormMedName(e.target.value)}
                    placeholder="e.g. Paracetamol"
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3 py-2 focus:ring-1 focus:ring-[#0d5c5a]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'ប្រភេទគ្រាប់/ទឹក (Category)' : 'Category'}</label>
                  <select
                    value={formMedCategory}
                    onChange={e => setFormMedCategory(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3 py-2 bg-white"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Cream/Ointment">Cream/Ointment</option>
                    <option value="Drops">Drops</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-wider leading-tight">{lang === 'kh' ? 'កម្លាំង (Strength) *' : 'Strength'}</label>
                  <input
                    type="text"
                    required
                    value={formMedStrength}
                    onChange={e => setFormMedStrength(e.target.value)}
                    placeholder="500mg, 120ml"
                    className="w-full text-xs border border-slate-300 rounded-xl px-2.5 py-2 font-bold"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-wider leading-tight">{lang === 'kh' ? 'ចំនួនសរុប (Stock)' : 'Qty'}</label>
                  <input
                    type="number"
                    min="0"
                    value={formMedStock}
                    onChange={e => setFormMedStock(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-xl px-2.5 py-2 font-mono font-bold"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-wider leading-tight">{lang === 'kh' ? 'តម្លៃមធ្យម ($)' : 'Unit Cost'}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formMedPrice}
                    onChange={e => setFormMedPrice(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-xl px-2.5 py-2 font-mono font-bold"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-wider leading-tight text-rose-600">{lang === 'kh' ? 'កម្រិតប្រកាស (Reorder)' : 'Reorder Limit'}</label>
                  <input
                    type="number"
                    min="0"
                    value={formMedReorderPoint}
                    onChange={e => setFormMedReorderPoint(Number(e.target.value))}
                    className="w-full text-xs border border-rose-300 bg-rose-50/20 text-rose-700 rounded-xl px-2.5 py-2 font-mono font-bold focus:ring-1 focus:ring-rose-500"
                    placeholder="20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'ថ្ងៃទិញចូល (Purchase Date)' : 'Purchase Date'}</label>
                  <input
                    type="date"
                    required
                    value={formMedPurchaseDate}
                    onChange={e => setFormMedPurchaseDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'ថ្ងៃផុតកំណត់ (Expiry Date)' : 'Expiry Date'}</label>
                  <input
                    type="date"
                    required
                    value={formMedExpiryDate}
                    onChange={e => setFormMedExpiryDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'ទីតាំងរក្សាទុក (Cabinet) *' : 'Location'}</label>
                  <input
                    type="text"
                    required
                    value={formMedLocation}
                    onChange={e => setFormMedLocation(e.target.value)}
                    placeholder="Cabinet A, Fridge B"
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'ស្ថានភាពឱសថ' : 'Status'}</label>
                  <select
                    value={formMedStatus}
                    onChange={e => setFormMedStatus(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Upload image container */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  {lang === 'kh' ? 'រូបថតឱសថព័ត៌មាន (Drug Photo - JPG/PNG) 300px' : 'Remedy Image (JPG / PNG) 300px'}
                </label>
                
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                    {formMedPhoto ? (
                      <img src={formMedPhoto} alt="Upload thumb" className="w-full h-full object-cover" />
                    ) : (
                      <Pill className="w-6 h-6 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      type="file"
                      id="med-photo-input"
                      accept="image/png, image/jpeg"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label 
                      htmlFor="med-photo-input"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-black rounded-xl transition cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>{lang === 'kh' ? 'ជ្រើសរើសរូបថត' : 'Select Photo'}</span>
                    </label>
                    <p className="text-[9px] text-slate-400 mt-1 font-bold">
                      {lang === 'kh' ? 'ទំហំរូបថត ១៥០px-៣០០px JPG/PNG • បង្រួមស្វ័យប្រវត្តិដើម្បីសន្សំទិន្នន័យ' : 'Thumbnail 150px, Preview 300px. Auto-resizing applied.'}
                    </p>
                  </div>

                  {formMedPhoto && (
                    <button 
                      type="button"
                      onClick={() => setFormMedPhoto('')}
                      className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      {lang === 'kh' ? 'លុបរូប' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsMedFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-[#052C2B] hover:bg-[#073B3A] rounded-xl cursor-pointer transition shadow-xs"
                >
                  {lang === 'kh' ? 'រក្សាទុក' : 'Save Medicine'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* RENDER MODAL: MEDICINE STOCK IN FORM */}
      {isStockFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-[#052C2B] tracking-tight">
                {lang === 'kh' ? 'បញ្ចូលឱសថថ្មីទៅក្នុងស្តុក (Medicine Stock Intake)' : 'Log New Stock Receipt'}
              </h3>
              <button onClick={() => setIsStockFormOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockIn} className="space-y-4">
              
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'ជ្រើសរើសឱសថមេ (Select Remedy) *' : 'Select Remedy'}</label>
                <select
                  value={formStockMedId}
                  onChange={e => setFormStockMedId(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3 py-2 bg-white"
                >
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.strength}) - Stock: {m.stock}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'បរិមាណនាំចូល *' : 'Qty Received'}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formStockQty}
                    onChange={e => setFormStockQty(Number(e.target.value))}
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'លេខកូដបាច់ (Batch No.) *' : 'Batch No.'}</label>
                  <input
                    type="text"
                    required
                    value={formStockBatch}
                    onChange={e => setFormStockBatch(e.target.value)}
                    placeholder="B001"
                    className="w-full text-xs font-mono font-bold text-indigo-800 border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'ក្រុមហ៊ុន ឬអ្នកចែកចាយ (Supplier) *' : 'Supplier Distributor'}</label>
                <input
                  type="text"
                  required
                  value={formStockSupplier}
                  onChange={e => setFormStockSupplier(e.target.value)}
                  placeholder="e.g. ABC Pharma, Pfizer Depot"
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'ថ្ងៃខែឆ្នាំបញ្ចូល' : 'Stock In Date'}</label>
                  <input
                    type="date"
                    required
                    value={formStockDate}
                    onChange={e => setFormStockDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'ថ្ងៃផុតកំណត់ (Expiry Date)' : 'Expiry Date'}</label>
                  <input
                    type="date"
                    required
                    value={formStockExpiry}
                    onChange={e => setFormStockExpiry(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'អ្នកត្រួតពិនិត្យ និងទទួលយក' : 'Received & Inspected By'}</label>
                <input
                  type="text"
                  required
                  value={formStockReceiver}
                  onChange={e => setFormStockReceiver(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsStockFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-[#052C2B] hover:bg-[#073B3A] rounded-xl cursor-pointer shadow-xs transition"
                >
                  {lang === 'kh' ? 'រក្សាស្តុកចូល' : 'Confirm Stock Intake'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* RENDER MODAL: MEDICINE DAILY USAGE LOG FORM */}
      {isUsageFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-[#052C2B] tracking-tight">
                {lang === 'kh' ? 'កត់ត្រាការផ្តល់ថ្នាំជូនសិស្ស (Patient Dispense Entry)' : 'Log Remedy Given To Student'}
              </h3>
              <button onClick={() => setIsUsageFormOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUsageLog} className="space-y-4">
              
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'ឈ្មោះសិស្សទទួលឱសថ *' : 'Student Name'}</label>
                  <input
                    type="text"
                    required
                    value={formUsgStudent}
                    onChange={e => setFormUsgStudent(e.target.value)}
                    placeholder="e.g. Student A"
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'បន្ទប់/ថ្នាក់ *' : 'Grade'}</label>
                  <select
                    value={formUsgGrade}
                    onChange={e => setFormUsgGrade(e.target.value)}
                    className="w-full text-xs font-bold border border-slate-300 rounded-xl px-2 py-2 bg-white"
                  >
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'ឱសថដែលប្រើប្រាស់ (Medicine Log)' : 'Remedy Brand'}</label>
                <select
                  value={formUsgMedId}
                  onChange={e => setFormUsgMedId(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3 py-2 bg-white"
                >
                  {medicines.filter(m => m.stock > 0 && m.status === 'Active').map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.strength}) - Available Stock: {m.stock}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'ចំនួនប្រើប្រាស់ (Qty Dispensed) *' : 'Dispense Qty'}</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formUsgQty}
                  onChange={e => setFormUsgQty(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'មូលហេតុ ឬរោគសញ្ញា *' : 'Symptom & Reason Given'}</label>
                <textarea
                  required
                  rows={2}
                  value={formUsgReason}
                  onChange={e => setFormUsgReason(e.target.value)}
                  placeholder="e.g. Fever (គ្រុនក្តៅខ្លាំង), Headache"
                  className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1 tracking-wider">{lang === 'kh' ? 'គិលានុបដ្ឋាយិកា/អ្នកផ្តល់ឱ្យ' : 'Treating Staff (Nurse Name)'}</label>
                <input
                  type="text"
                  required
                  value={formUsgNurse}
                  onChange={e => setFormUsgNurse(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsUsageFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-[#052C2B] hover:bg-[#073B3A] rounded-xl cursor-pointer shadow-xs transition"
                >
                  {lang === 'kh' ? 'កាត់ដកស្តុក & រក្សាទុក' : 'Dispense & Deduct Stock'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* DELETE DIALOG MODALS TYPE */}
      {deleteMedId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full border text-center space-y-4">
            <h4 className="text-sm font-black text-slate-900">{lang === 'kh' ? 'តើអ្នកប្រាកដជាចង់លុបឱសថនេះចេញឬ?' : 'Are you sure you want to remove this medicine?'}</h4>
            <p className="text-xs text-slate-400 font-bold">{lang === 'kh' ? 'ទិន្នន័យស្តុកនឹងរូបភាពឱសថទាំងអស់នឹងត្រូវបាត់បង់ជារៀងរហូត។' : 'All specific stock indices, alerts, and photo paths will revert irreversibly.'}</p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => setDeleteMedId(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 cursor-pointer">{lang === 'kh' ? 'បោះបង់' : 'Cancel'}</button>
              <button onClick={handleDeleteMedicine} className="px-4 py-2 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 cursor-pointer">{lang === 'kh' ? 'លុបចោល' : 'Confirm Delete'}</button>
            </div>
          </motion.div>
        </div>
      )}

      {deleteStockInId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full border text-center space-y-4">
            <h4 className="text-sm font-black text-slate-900">{lang === 'kh' ? 'តើអ្នកប្រាកដជាចង់លុបកំណត់ត្រានាំចូលនេះឬ?' : 'Are you sure you want to delete this stock-in record?'}</h4>
            <p className="text-xs text-slate-400 font-bold">
              {lang === 'kh' 
                ? 'ចំនួនថ្នាំដែលបានបញ្ចូលពីមុននឹងត្រូវបានដកចេញពីស្តុកមេវិញដោយស្វ័យប្រវត្តិ។' 
                : 'The previously added quantity will be subtracted from the master stock automatically.'}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => setDeleteStockInId(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 cursor-pointer">{lang === 'kh' ? 'បោះបង់' : 'Cancel'}</button>
              <button onClick={handleDeleteStockIn} className="px-4 py-2 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 cursor-pointer">{lang === 'kh' ? 'លុបចោល' : 'Confirm Delete'}</button>
            </div>
          </motion.div>
        </div>
      )}

      {deleteUsageLogId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full border text-center space-y-4">
            <h4 className="text-sm font-black text-slate-900">{lang === 'kh' ? 'តើអ្នកប្រាកដជាចង់លុបកំណត់ត្រាប្រើប្រាស់នេះឬ?' : 'Are you sure you want to delete this usage log?'}</h4>
            <p className="text-xs text-slate-400 font-bold">
              {lang === 'kh' 
                ? 'ចំនួនថ្នាំដែលបានដកប្រើប្រាស់នឹងត្រូវបានសងត្រឡប់ទៅក្នុងស្តុកមេវិញដោយស្វ័យប្រវត្តិ។' 
                : 'The previously dispensed quantity will be returned back to the master stock automatically.'}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => setDeleteUsageLogId(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 cursor-pointer">{lang === 'kh' ? 'បោះបង់' : 'Cancel'}</button>
              <button onClick={handleDeleteUsageLog} className="px-4 py-2 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 cursor-pointer">{lang === 'kh' ? 'លុបចោល' : 'Confirm Delete'}</button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
