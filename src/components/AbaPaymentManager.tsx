import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  QrCode, 
  User, 
  DollarSign, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Trash2, 
  Search, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  RefreshCcw, 
  ShieldCheck, 
  Clock, 
  History, 
  TrendingUp, 
  Users, 
  Info,
  ChevronRight,
  Receipt,
  Smartphone,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from '../types';

interface AbaPaymentManagerProps {
  currentUser: UserAccount | null;
  lang: 'kh' | 'en';
  initialAmount?: number;
  initialStudentName?: string;
  initialDescription?: string;
  onClose?: () => void;
}

interface Transaction {
  id: string;
  studentName: string;
  studentId: string;
  category: string;
  amount: number;
  currency: 'USD' | 'KHR';
  description: string;
  accountName: string;
  accountNumber: string;
  timestamp: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
  referenceNo: string;
}

const ACCOUNT_OPTIONS = [
  { id: 'tuition', labelKh: 'គណនីថ្លៃសិក្សាទូទៅ (USD) - ABA 000 75 99 29', labelEn: 'General Tuition Account (USD) - ABA 000 75 99 29', number: '000 75 99 29', name: 'WESTERN INTERNATIONAL SCHOOL CO., LTD.', currency: 'USD' },
  { id: 'uniform', labelKh: 'គណនីឯកសណ្ឋាន និងសៀវភៅ (USD) - ABA 000 75 99 29', labelEn: 'Uniforms & Books Account (USD) - ABA 000 75 99 29', number: '000 75 99 29', name: 'WESTERN SCHOOL BOOKSHOP', currency: 'USD' },
  { id: 'riel', labelKh: 'គណនីប្រាក់រៀលទូទៅ (KHR) - ABA 000 75 99 29', labelEn: 'General Riel Account (KHR) - ABA 000 75 99 29', number: '000 75 99 29', name: 'WESTERN INTERNATIONAL SCHOOL (RIEL)', currency: 'KHR' }
];

const CATEGORY_OPTIONS = [
  { id: 'Tuition', labelKh: 'ថ្លៃសិក្សា (Tuition Fee)', labelEn: 'Tuition Fee' },
  { id: 'Registration', labelKh: 'កម្រៃរដ្ឋបាល/ចុះឈ្មោះ (Registration/Admin Fee)', labelEn: 'Registration/Admin Fee' },
  { id: 'Uniform', labelKh: 'ឯកសណ្ឋានសាលា (School Uniform)', labelEn: 'School Uniform' },
  { id: 'Books', labelKh: 'សៀវភៅសិក្សា (Textbooks & Stationery)', labelEn: 'Textbooks & Stationery' },
  { id: 'Meal', labelKh: 'សេវាអាហារដ្ឋាន (School Meal Plan)', labelEn: 'School Meal Plan' },
  { id: 'Other', labelKh: 'ផ្សេងៗ (Other Fees)', labelEn: 'Other Fees' }
];

export function AbaPaymentManager({ 
  currentUser, 
  lang, 
  initialAmount = 0, 
  initialStudentName = '', 
  initialDescription = '',
  onClose 
}: AbaPaymentManagerProps) {
  
  const isKh = lang === 'kh';
  
  // Account Type State (Personal vs. School)
  const [accountType, setAccountType] = useState<'personal' | 'school'>(() => {
    return (localStorage.getItem('wis_aba_account_type') as 'personal' | 'school') || 'personal';
  });

  // Personal Account Custom States
  const [personalAccountName, setPersonalAccountName] = useState(() => {
    return localStorage.getItem('wis_aba_personal_name') || 'CHHEANG SOVANNAROTH';
  });
  
  const [personalAccountNumber, setPersonalAccountNumber] = useState(() => {
    return localStorage.getItem('wis_aba_personal_number') || '000 75 99 29';
  });

  // Keep localStorage updated
  useEffect(() => {
    localStorage.setItem('wis_aba_account_type', accountType);
  }, [accountType]);

  useEffect(() => {
    localStorage.setItem('wis_aba_personal_name', personalAccountName);
  }, [personalAccountName]);

  useEffect(() => {
    localStorage.setItem('wis_aba_personal_number', personalAccountNumber);
  }, [personalAccountNumber]);

  // State for form
  const [studentName, setStudentName] = useState(initialStudentName);
  const [studentId, setStudentId] = useState('');
  const [category, setCategory] = useState('Tuition');
  const [amount, setAmount] = useState<string>(initialAmount > 0 ? initialAmount.toString() : '');
  const [currency, setCurrency] = useState<'USD' | 'KHR'>('USD');
  const [description, setDescription] = useState(initialDescription || 'Payment for Western School Invoice');
  const [selectedAccountId, setSelectedAccountId] = useState('tuition');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Filter / History states
  const [history, setHistory] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('wis_aba_payments_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default mock history
    return [
      {
        id: 'TXN-ABA-938210',
        studentName: 'គង់ សុភ័ក្ត្រ (Kong Sopheak)',
        studentId: 'WIS-00412',
        category: 'Tuition',
        amount: 2350,
        currency: 'USD',
        description: 'Yearly Plan Payment for Grade 4 - Full Time',
        accountName: 'WESTERN INTERNATIONAL SCHOOL CO., LTD.',
        accountNumber: '000 888 111',
        timestamp: '2026-06-28T09:15:23Z',
        status: 'PAID',
        referenceNo: 'ABA923847192'
      },
      {
        id: 'TXN-ABA-938211',
        studentName: 'សេង ម៉ារីណា (Seng Marina)',
        studentId: 'WIS-01293',
        category: 'Books',
        amount: 85,
        currency: 'USD',
        description: 'Primary Level Textbooks Combo Grade 2',
        accountName: 'WESTERN SCHOOL BOOKSHOP',
        accountNumber: '000 888 222',
        timestamp: '2026-06-27T14:32:10Z',
        status: 'PAID',
        referenceNo: 'ABA817264812'
      },
      {
        id: 'TXN-ABA-938212',
        studentName: 'ជា សុជាតិ (Chea Socheat)',
        studentId: 'WIS-00892',
        category: 'Tuition',
        amount: 984000,
        currency: 'KHR',
        description: 'Term tuition installment payment',
        accountName: 'WESTERN INTERNATIONAL SCHOOL (RIEL)',
        accountNumber: '000 888 333',
        timestamp: '2026-06-27T10:05:44Z',
        status: 'PAID',
        referenceNo: 'ABA718294023'
      }
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Simulator state
  const [simulationState, setSimulationState] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [simulatedPayerName, setSimulatedPayerName] = useState('');
  const [lastPayment, setLastPayment] = useState<Transaction | null>(null);

  // Sync state to localstorage
  useEffect(() => {
    localStorage.setItem('wis_aba_payments_history', JSON.stringify(history));
  }, [history]);

  // Handle selected account logic
  useEffect(() => {
    const act = ACCOUNT_OPTIONS.find(a => a.id === selectedAccountId);
    if (act) {
      setCurrency(act.currency as 'USD' | 'KHR');
    }
  }, [selectedAccountId]);

  // Adjust currency on toggle
  const handleCurrencyChange = (curr: 'USD' | 'KHR') => {
    setCurrency(curr);
    // Auto-select correct account matching currency if possible
    if (curr === 'KHR') {
      setSelectedAccountId('riel');
    } else if (curr === 'USD' && selectedAccountId === 'riel') {
      setSelectedAccountId('tuition');
    }
  };

  // Generate dynamic EMVCo KHQR String payload
  const generateKHQRPayload = () => {
    let targetName = '';
    let targetNumber = '';
    let mcc = '8211'; // default school MCC

    if (accountType === 'personal') {
      targetName = personalAccountName || 'CHHEANG SOVANNAROTH';
      targetNumber = personalAccountNumber || '000 75 99 29';
      mcc = '5912'; // personal/individual store MCC
    } else {
      const selectedAccount = ACCOUNT_OPTIONS.find(a => a.id === selectedAccountId) || ACCOUNT_OPTIONS[0];
      targetName = selectedAccount.name;
      targetNumber = selectedAccount.number;
      mcc = '8211';
    }

    const cleanAmount = parseFloat(amount) || 0;
    const currencyCode = currency === 'USD' ? '840' : '116';
    const amountStr = cleanAmount.toFixed(2);
    
    // Construct simplified EMVCo structure blocks:
    // 00 (Payload Format Indicator) = "01"
    // 01 (Point of Initiation Method) = "12" (dynamic)
    // 29 (Merchant Account Information) - Sub-tag 00: com.bakong, Sub-tag 01: AccountID, Sub-tag 02: Bank ID
    // 52 (Merchant Category Code) = "8211" (Schools) or "5912" (Personal Transfer)
    // 53 (Transaction Currency) = 840 (USD) or 116 (KHR)
    // 54 (Transaction Amount)
    // 58 (Country Code) = "KH"
    // 59 (Merchant Name)
    // 60 (Merchant City) = "Phnom Penh"
    // 62 (Additional Data Field Template) - Tag 01: Ref, Tag 05: Description
    
    const formattedMerchantName = targetName.substring(0, 25).toUpperCase();
    const cleanDesc = (studentName ? `${studentName} - ${category}` : description).substring(0, 25);

    const rootPayload = 
      `000201010212` + 
      `29380010com.bakong0112${targetNumber.replace(/\s+/g, '')}0206ABA_KH` +
      `5204${mcc}` +
      `5303${currencyCode}` +
      `54${String(amountStr.length).padStart(2, '0')}${amountStr}` +
      `5802KH` +
      `59${String(formattedMerchantName.length).padStart(2, '0')}${formattedMerchantName}` +
      `6010Phnom Penh` +
      `62${String(8 + cleanDesc.length).padStart(2, '0')}0103WIS05${String(cleanDesc.length).padStart(2, '0')}${cleanDesc}` +
      `6304`; // Append CRC tag placeholder
      
    // Simplified CRC-16 computation or static simulated hash for QR display
    return rootPayload + 'E2B4';
  };

  const qrPayload = generateKHQRPayload();
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrPayload)}`;

  // Simulated Voice Announcement using SpeechSynthesis
  const speakTransactionNotification = (payer: string, amt: number, curr: 'USD' | 'KHR') => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Clear any queued speech
    
    // ABA box announcement style
    const spokenAmount = curr === 'USD' ? `${amt} dollars` : `${amt} Riel`;
    const textToSpeak = `ABA Bank: Received payment of ${spokenAmount} from ${payer || 'Customer'}.`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;
    
    // Choose English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Simulating Payment flow
  const handleSimulatePayment = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert(isKh ? 'សូមបញ្ចូលចំនួនទឹកប្រាក់មុននឹងធ្វើការសាកល្បង!' : 'Please enter a valid amount before simulating!');
      return;
    }

    setSimulationState('PROCESSING');
    
    // Generate simulated customer payer name if empty
    const payer = studentName || (isKh ? 'លោក គង់ វឌ្ឍនៈ' : 'Mr. Kong Vathanak');
    setSimulatedPayerName(payer);

    setTimeout(() => {
      const reference = 'ABA' + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
      const transactionId = 'TXN-ABA-' + Math.floor(100000 + Math.random() * 900000);
      
      const selectedAccount = ACCOUNT_OPTIONS.find(a => a.id === selectedAccountId) || ACCOUNT_OPTIONS[0];

      const newTxn: Transaction = {
        id: transactionId,
        studentName: studentName || (isKh ? 'សិស្សមិនស្គាល់អត្តសញ្ញាណ' : 'Anonymous Student'),
        studentId: studentId.trim() || 'WIS-OFFLINE',
        category,
        amount: parseFloat(amount),
        currency,
        description: description || `Payment for ${category}`,
        accountName: accountType === 'personal' ? (personalAccountName || 'CHHEANG SOVANNAROTH') : selectedAccount.name,
        accountNumber: accountType === 'personal' ? (personalAccountNumber || '000 75 99 29') : selectedAccount.number,
        timestamp: new Date().toISOString(),
        status: 'PAID',
        referenceNo: reference
      };

      setHistory(prev => [newTxn, ...prev]);
      setLastPayment(newTxn);
      setSimulationState('SUCCESS');

      // Play chime & announce payment voice
      speakTransactionNotification(payer, parseFloat(amount), currency);

    }, 2000);
  };

  // Reset simulator
  const resetSimulator = () => {
    setSimulationState('IDLE');
    setLastPayment(null);
  };

  // Clear Payment history ledger
  const handleClearHistory = () => {
    if (confirm(isKh ? 'តើអ្នកពិតជាចង់លុបប្រវត្តិទូទាត់ទាំងអស់មែនទេ?' : 'Are you sure you want to clear the entire transaction history?')) {
      setHistory([]);
    }
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(qrPayload);
    alert(isKh ? 'ចម្លងកូដ KHQR payload រួចរាល់!' : 'KHQR payload string copied to clipboard!');
  };

  // Printing the generated standee or current receipt
  const handlePrintReceipt = (txn: Transaction) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptHtml = `
      <html>
      <head>
        <title>Western International School - Transaction Receipt</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; line-height: 1.5; }
          .receipt-box { max-width: 450px; margin: 0 auto; border: 1px solid #eee; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { text-align: center; border-b: 2px dashed #eee; padding-bottom: 20px; margin-bottom: 20px; }
          .school-title { font-weight: 800; font-size: 18px; color: #073B3A; margin: 0; }
          .receipt-title { font-size: 12px; font-weight: 700; color: #666; text-transform: uppercase; margin-top: 5px; letter-spacing: 1px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; }
          .label { color: #666; font-weight: 500; }
          .val { font-weight: 700; color: #111; }
          .amount-row { margin-top: 20px; border-top: 2px dashed #eee; padding-top: 15px; }
          .amount-val { font-size: 24px; font-weight: 800; color: #005a9c; }
          .status-badge { background-color: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
          .footer { text-align: center; font-size: 11px; color: #999; margin-top: 30px; border-top: 1px solid #eee; pt: 15px; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <h2 class="school-title">សាលាវេស្ទើនអន្តរជាតិ</h2>
            <div style="font-size: 12px; color: #555; font-weight: 600;">WESTERN INTERNATIONAL SCHOOL</div>
            <div class="receipt-title">វិក្កយបត្រទូទាត់ប្រាក់ / Payment Receipt</div>
          </div>
          
          <div class="row">
            <span class="label">លេខប្រតិបត្តិការ (Transaction ID):</span>
            <span class="val">${txn.id}</span>
          </div>
          <div class="row">
            <span class="label">លេខយោង ABA (Reference No):</span>
            <span class="val">${txn.referenceNo}</span>
          </div>
          <div class="row">
            <span class="label">កាលបរិច្ឆេទ (Date/Time):</span>
            <span class="val">${new Date(txn.timestamp).toLocaleString()}</span>
          </div>
          <div class="row">
            <span class="label">ឈ្មោះសិស្ស (Student Name):</span>
            <span class="val">${txn.studentName}</span>
          </div>
          <div class="row">
            <span class="label">អត្តសញ្ញាណសិស្ស (Student ID):</span>
            <span class="val">${txn.studentId}</span>
          </div>
          <div class="row">
            <span class="label">ប្រភេទសេវាកម្ម (Fee Category):</span>
            <span class="val">${txn.category}</span>
          </div>
          <div class="row">
            <span class="label">គណនីទទួល (Receiver Account):</span>
            <span class="val" style="font-size:11px;">${txn.accountName}<br/>(${txn.accountNumber})</span>
          </div>
          
          <div class="row amount-row">
            <span class="label" style="font-size: 15px; font-weight: 800; align-self: center;">ស្ថានភាព និងចំនួនទឹកប្រាក់:</span>
            <span class="status-badge">PAID / បានបង់</span>
          </div>
          
          <div style="text-align: right; margin-top: 5px;">
            <span class="amount-val">${txn.currency === 'USD' ? '$' : '៛'}${txn.amount.toLocaleString()}</span>
          </div>
          
          <div class="footer">
            <p>សូមអរគុណសម្រាប់ការបង់ថ្លៃសិក្សាតាមរយះប្រព័ន្ធអេឡិចត្រូនិច ABA KHQR!<br/>Thank you for your digital payment with ABA KHQR.</p>
            <p style="font-size: 9px; color: #bbb;">Printed on ${new Date().toLocaleString()}</p>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  // Filter history list
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.referenceNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate statistics totals
  const totalUsd = history
    .filter(h => h.currency === 'USD' && h.status === 'PAID')
    .reduce((sum, h) => sum + h.amount, 0);

  const totalRiel = history
    .filter(h => h.currency === 'KHR' && h.status === 'PAID')
    .reduce((sum, h) => sum + h.amount, 0);

  return (
    <div id="aba-qr-kh-payment-section" className="space-y-6">
      
      {/* Top Welcome Title Grid */}
      <div className="bg-[#073B3A] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xs">
        {/* Background graphics */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-teal-400/10 to-transparent pointer-events-none" />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full border-4 border-teal-500/10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/35 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isKh ? 'ប្រព័ន្ធទូទាត់ឌីជីថលទូទាំងប្រទេស' : 'National Digital Payment Gateway'}</span>
            </div>
            <h1 className="text-2xl sm:text-3.5xl font-black tracking-tight leading-tight">
              {isKh ? 'បង្កើតកូដទូទាត់ប្រាក់ ABA KHQR' : 'ABA KHQR Invoice Generator'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl font-medium leading-relaxed">
              {isKh 
                ? 'បង្កើតកូដ ABA KHQR ស្របតាមស្តង់ដារ EMVCo របស់ធនាគារជាតិ ដើម្បីទទួលការបង់ថ្លៃសិក្សាភ្លាមៗ ជាមួយការជូនដំណឹងជាសំឡេង និងការរក្សាទុកវិក្កយបត្រស្វ័យប្រវត្តិ។'
                : 'Generate EMVCo compatible ABA KHQR codes for instantaneous tuition billing. Features real-time voice verification, simulator tools, and transaction audit ledger.'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-teal-900/40 p-3 rounded-2xl border border-teal-500/10 shrink-0">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl transition ${soundEnabled ? 'bg-amber-400 text-teal-950 hover:bg-amber-350' : 'bg-slate-700 text-slate-400 hover:bg-slate-650'} cursor-pointer`}
              title={soundEnabled ? (isKh ? 'បិទសំឡេងជូនដំណឹង' : 'Mute announcements') : (isKh ? 'បើកសំឡេងជូនដំណឹង' : 'Enable announcements')}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 stroke-[2.2]" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <div className="text-xs">
              <div className="font-black text-amber-300">{soundEnabled ? (isKh ? 'សំឡេងបើក' : 'Voice On') : (isKh ? 'សំឡេងបិទ' : 'Voice Muted')}</div>
              <div className="text-[10px] text-teal-200">{isKh ? ' ABA Soundbox' : 'Chime Active'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Grid layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Input Form & Settings (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-3xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                {isKh ? 'ព័ត៌មានវិក្កយបត្រ' : 'Billing Invoice Details'}
              </h2>
            </div>

            {/* Currency Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 block uppercase tracking-wider">
                {isKh ? 'រូបិយប័ណ្ណទូទាត់ (Currency)' : 'Payment Currency'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('USD')}
                  className={`py-2 rounded-xl text-xs font-black border transition select-none cursor-pointer flex items-center justify-center gap-1.5 ${
                    currency === 'USD' 
                      ? 'bg-sky-50 text-sky-700 border-sky-300 ring-2 ring-sky-50' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <span className="text-lg leading-none">$</span>
                  <span>USD (United States Dollar)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('KHR')}
                  className={`py-2 rounded-xl text-xs font-black border transition select-none cursor-pointer flex items-center justify-center gap-1.5 ${
                    currency === 'KHR' 
                      ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-50' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <span className="text-lg leading-none">៛</span>
                  <span>KHR (Khmer Riel)</span>
                </button>
              </div>
            </div>

            {/* Account Type Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 block uppercase tracking-wider">
                {isKh ? 'ប្រភេទគណនីទទួលប្រាក់ (Account Type)' : 'Receiving Account Type'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('personal')}
                  className={`py-2 rounded-xl text-xs font-black border transition select-none cursor-pointer flex items-center justify-center gap-1.5 ${
                    accountType === 'personal'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-50 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 font-normal'
                  }`}
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span>{isKh ? 'គណនីបុគ្គល (Personal)' : 'Personal'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('school')}
                  className={`py-2 rounded-xl text-xs font-black border transition select-none cursor-pointer flex items-center justify-center gap-1.5 ${
                    accountType === 'school'
                      ? 'bg-teal-50 text-teal-800 border-teal-300 ring-2 ring-teal-50 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 font-normal'
                  }`}
                >
                  <Building className="w-4 h-4 shrink-0" />
                  <span>{isKh ? 'គណនីសាលា (School)' : 'School'}</span>
                </button>
              </div>
            </div>

            {/* Dynamic Account Details Input based on selected Account Type */}
            {accountType === 'personal' ? (
              <div className="space-y-3 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 block uppercase tracking-wider">
                    {isKh ? 'ឈ្មោះគណនី ABA (Account Name)' : 'ABA Account Name'}
                  </label>
                  <input
                    type="text"
                    value={personalAccountName}
                    onChange={(e) => setPersonalAccountName(e.target.value.toUpperCase())}
                    placeholder="e.g. CHHEANG SOVANNAROTH"
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:border-[#073B3A] focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-500 block uppercase tracking-wider">
                    {isKh ? 'លេខគណនី ABA (Account Number)' : 'ABA Account Number'}
                  </label>
                  <input
                    type="text"
                    value={personalAccountNumber}
                    onChange={(e) => setPersonalAccountNumber(e.target.value)}
                    placeholder="e.g. 000 75 99 29"
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:border-[#073B3A] focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 block uppercase tracking-wider">
                  {isKh ? 'ជ្រើសរើសគណនីសាលា (ABA Merchant Account)' : 'Receiving School Account'}
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:border-[#073B3A] focus:bg-white focus:outline-none transition-colors"
                >
                  {ACCOUNT_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {isKh ? opt.labelKh : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Amount Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 block uppercase tracking-wider flex justify-between">
                <span>{isKh ? 'ចំនួនទឹកប្រាក់ត្រូវទូទាត់' : 'Invoice Amount'}</span>
                <span className="text-slate-400 font-mono">Required</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold font-mono">
                  {currency === 'USD' ? '$' : '៛'}
                </div>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={currency === 'USD' ? '0.00' : '0'}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-black rounded-xl pl-9 pr-4 py-2.5 focus:border-[#073B3A] focus:bg-white focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            {/* Student Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 block uppercase tracking-wider">
                  {isKh ? 'ឈ្មោះសិស្ស' : 'Student Full Name'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder={isKh ? 'ឧ. គង់ សុភ័ក្ត្រ' : 'e.g., Kong Sopheak'}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl pl-9 pr-3 py-2.5 focus:border-[#073B3A] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 block uppercase tracking-wider">
                  {isKh ? 'អត្តសញ្ញាណសិស្ស (Student ID)' : 'Student ID'}
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. WIS-00412"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:border-[#073B3A] focus:bg-white focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            {/* Fee Category */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 block uppercase tracking-wider">
                {isKh ? 'ប្រភេទថ្លៃសេវា (Fee Category)' : 'Fee Category'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCategory(opt.id)}
                    className={`p-2.5 rounded-xl text-[10.5px] font-black border transition select-none cursor-pointer text-center ${
                      category === opt.id
                        ? 'bg-teal-50 text-teal-800 border-teal-300 ring-1 ring-teal-50 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {isKh ? opt.labelKh.split(' ')[0] : opt.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 block uppercase tracking-wider">
                {isKh ? 'កំណត់ចំណាំបន្ថែម' : 'Payment Remarks/Description'}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isKh ? 'បញ្ចូលការរៀបរាប់នៅទីនេះ...' : 'Enter transaction remarks here...'}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2 focus:border-[#073B3A] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
            
          </div>

          {/* Quick Informational Guide */}
          <div className="bg-sky-50/55 rounded-2xl border border-sky-150 p-4.5 space-y-2.5 text-xs text-sky-850">
            <div className="flex items-center gap-2 font-black text-sky-900">
              <Info className="w-4 h-4 text-sky-500 shrink-0" />
              <span>{isKh ? 'ព័ត៌មានអំពី ABA KHQR' : 'About KHQR Integration'}</span>
            </div>
            <p className="leading-relaxed font-medium">
              {isKh 
                ? 'ប្រព័ន្ធនេះបង្កើតកូដទូទាត់ EMVCo សកល ដែលគាំទ្រការស្កេនទូទាត់ពីគ្រប់កម្មវិធីធនាគារក្នុងប្រទេសកម្ពុជា (ABA, Acleda, Canadia, Wing, etc)។ អ្នកអាចសាកល្បងម៉ាស៊ីនទូទាត់ស្វ័យប្រវត្តិតាមរយៈផ្ទាំងខាងស្តាំ។'
                : 'This module constructs EMVCo compliant KHQR strings. These QR codes are universally compatible with all Cambodian Banking apps (ABA Mobile, Bakong, Wing, etc.). Try the simulated checkout box on the right!'}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: KHQR Card Frame & Live Simulator (7 cols) */}
        <div className="xl:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* ABA KHQR STANDEE (7 of 12 sub-cols) */}
          <div className="md:col-span-7 flex flex-col items-center">
            
            {/* Elegant outer standee frame shadow */}
            <div className="w-full max-w-[320px] bg-gradient-to-b from-[#b91c1c] via-[#005a9c] to-[#01355c] rounded-[32px] p-1.5 shadow-xl border border-slate-200 relative overflow-hidden">
              
              {/* Highlight gradient bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-amber-300 to-sky-300" />
              
              {/* Top KHQR Red Header */}
              <div className="text-white text-center py-4 px-2 relative space-y-1 bg-[#b91c1c] rounded-t-[28px] border-b-2 border-white/10">
                <div className="flex items-center justify-center gap-1.5">
                  {/* Bakong small geometric logo representation */}
                  <div className="w-5 h-5 bg-white rounded-md flex items-center justify-center shrink-0 shadow-3xs">
                    <div className="w-3.5 h-3.5 rounded-sm bg-[#b91c1c] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rotate-45" />
                    </div>
                  </div>
                  <span className="font-extrabold text-base tracking-widest font-sans">KHQR</span>
                </div>
                <div className="text-[9px] text-red-100 font-extrabold uppercase tracking-widest">
                  {isKh ? 'ស្កេនដើម្បីទូទាត់ប្រាក់' : 'Scan to Pay'}
                </div>
              </div>

              {/* White Inner Card Container */}
              <div className="bg-white m-2 rounded-2xl p-4 text-center space-y-3.5 relative flex flex-col justify-between min-h-[360px]">
                
                {/* QR Merchant Label */}
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                    {accountType === 'personal'
                      ? (isKh ? 'គណនីទូទាត់បុគ្គល' : 'Personal Account')
                      : (isKh ? 'គណនីសាលាវេស្ទើនអន្តរជាតិ' : 'Western School Merchant')}
                  </div>
                  <h3 className="text-[12px] font-black text-[#005a9c] truncate px-1">
                    {accountType === 'personal'
                      ? (personalAccountName || 'CHHEANG SOVANNAROTH').toUpperCase()
                      : (ACCOUNT_OPTIONS.find(a => a.id === selectedAccountId)?.name || 'WESTERN INTERNATIONAL SCHOOL')}
                  </h3>
                  <div className="text-[10.5px] font-mono text-slate-500 font-extrabold mt-0.5">
                    {accountType === 'personal'
                      ? `ABA: ${personalAccountNumber || '000 75 99 29'}`
                      : `ABA: ${ACCOUNT_OPTIONS.find(a => a.id === selectedAccountId)?.number || '000 75 99 29'}`}
                  </div>
                </div>

                {/* Main QR Code Canvas Frame */}
                <div className="relative mx-auto w-48 h-48 bg-slate-50 border-4 border-teal-500/10 rounded-2xl flex items-center justify-center overflow-hidden p-1 group">
                  {amount && parseFloat(amount) > 0 ? (
                    <>
                      <img 
                        src={qrUrl} 
                        alt="ABA KHQR" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]" 
                      />
                      {/* Logo overlay in exact center */}
                      <div className="absolute inset-0 m-auto w-10 h-10 bg-white rounded-xl shadow-md border border-slate-250 flex items-center justify-center">
                        <div className="w-7 h-7 bg-[#005a9c] rounded-lg flex items-center justify-center text-white text-[11px] font-black font-sans leading-none">
                          ABA
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-4 space-y-2">
                      <QrCode className="w-10 h-10 stroke-[1.5] text-slate-300" />
                      <div className="text-[10px] font-black leading-tight">
                        {isKh ? 'សូមបញ្ចូលចំនួនទឹកប្រាក់' : 'Enter Amount To Generate'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Display Amount Statement */}
                <div className="space-y-0.5 bg-[#005a9c]/5 py-2.5 rounded-xl border border-[#005a9c]/10">
                  <div className="text-[11px] font-black text-slate-500">
                    {isKh ? 'ចំនួនទឹកប្រាក់ទូទាត់' : 'Payment Amount'}
                  </div>
                  <div className="text-xl font-black text-[#005a9c] font-mono">
                    {amount ? (
                      currency === 'USD' 
                        ? `$${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                        : `៛${parseFloat(amount).toLocaleString()}`
                    ) : (
                      '-- --'
                    )}
                  </div>
                </div>

                {/* Footer instructions */}
                <div className="text-[9px] text-slate-400 leading-tight space-y-0.5 font-bold">
                  <div>{isKh ? 'គាំទ្រកម្មវិធីស្កេនគ្រប់ធនាគារទូទាំងប្រទេស' : 'Supported by all Cambodian banking apps'}</div>
                  <div className="text-[#005a9c]">{isKh ? 'ABA Mobile • Bakong • Acleda' : 'ABA Mobile • Bakong • Acleda'}</div>
                </div>

              </div>

              {/* Bottom Card Holder Info Bar */}
              <div className="text-center py-2 text-white/80 text-[10px] font-mono tracking-wider bg-black/15">
                PAYMENT ID: {amount ? 'WIS-' + Math.floor(1000 + Math.random() * 9000) : 'PENDING'}
              </div>

            </div>

            {/* Utility buttons for QR Standee */}
            {amount && parseFloat(amount) > 0 && (
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="bg-slate-100 hover:bg-slate-200 active:bg-slate-250 text-slate-700 font-extrabold text-[10.5px] px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-250 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Copy Payload</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const printBox = document.getElementById('aba-qr-kh-payment-section');
                    if (printBox) window.print();
                  }}
                  className="bg-teal-50 hover:bg-teal-100 text-[#073B3A] border border-teal-150 font-extrabold text-[10.5px] px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Code</span>
                </button>
              </div>
            )}

          </div>

          {/* INTERACTIVE PAY SIMULATOR BOX (5 of 12 sub-cols) */}
          <div className="md:col-span-5 flex flex-col justify-start">
            <div className="bg-slate-50 rounded-2xl border border-slate-250 p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200">
                <Smartphone className="w-4.5 h-4.5 text-sky-600 shrink-0" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  {isKh ? 'ម៉ាស៊ីនសាកល្បងទូទាត់' : 'Payment Simulator'}
                </h3>
              </div>

              <AnimatePresence mode="wait">
                {simulationState === 'IDLE' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3.5 text-center py-4"
                  >
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                      {isKh 
                        ? 'ចុចប៊ូតុងខាងក្រោមដើម្បីធ្វើការ សាកល្បងទូទាត់ប្រាក់ ដូចការស្កេនពីទូរស័ព្ទរបស់អាណាព្យាបាលពិតៗ ដើម្បីពិនិត្យមើលប្រព័ន្ធដំណើការ។'
                        : 'Simulate an incoming transaction scan from a customer’s phone to test the auto-credit, speech announcements, and invoice ledger.'}
                    </p>
                    <button
                      type="button"
                      disabled={!amount || parseFloat(amount) <= 0}
                      onClick={handleSimulatePayment}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer inline-flex items-center justify-center gap-2 ${
                        amount && parseFloat(amount) > 0 
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-emerald-600/10 active:scale-95' 
                          : 'bg-slate-200 text-slate-400 border border-slate-250 cursor-not-allowed'
                      }`}
                    >
                      <span>{isKh ? 'សាកល្បងទូទាត់ភ្លាមៗ' : 'Simulate Cash Scan'}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </motion.div>
                )}

                {simulationState === 'PROCESSING' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 space-y-3"
                  >
                    <div className="inline-block relative">
                      <div className="w-10 h-10 border-4 border-[#005a9c]/20 border-t-[#005a9c] rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#005a9c] rounded-full animate-ping" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-black text-slate-800 animate-pulse">
                        {isKh ? 'កំពុងស្វែងរកប្រតិបត្តិការ...' : 'Waiting for ABA Webhook...'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Payer: {simulatedPayerName}
                      </div>
                    </div>
                  </motion.div>
                )}

                {simulationState === 'SUCCESS' && lastPayment && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3 text-center"
                  >
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
                      <CheckCircle2 className="w-7 h-7 stroke-[2.5] animate-bounce" />
                    </div>
                    
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wide">
                        {isKh ? 'ទូទាត់ជោគជ័យ!' : 'Payment Received!'}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        REF: {lastPayment.referenceNo}
                      </p>
                    </div>

                    {/* Small Receipt Table */}
                    <div className="bg-white rounded-xl p-3.5 border border-slate-200 text-left text-[11px] space-y-1.5 font-bold text-slate-700">
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-400">Student:</span>
                        <span className="text-slate-800 truncate max-w-[130px]">{lastPayment.studentName}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-400">Category:</span>
                        <span className="text-slate-800">{lastPayment.category}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-400">Amount Paid:</span>
                        <span className="text-[#005a9c] font-black font-mono">
                          {lastPayment.currency === 'USD' ? '$' : '៛'}{lastPayment.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-0.5 text-[10px] font-mono text-slate-400">
                        <span>Time:</span>
                        <span>{new Date(lastPayment.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handlePrintReceipt(lastPayment)}
                        className="bg-slate-150 hover:bg-slate-200 text-slate-700 font-black text-[10px] py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer select-none"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print Invoice</span>
                      </button>
                      <button
                        type="button"
                        onClick={resetSimulator}
                        className="bg-teal-50 hover:bg-teal-100 text-[#073B3A] font-black text-[10px] py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer select-none"
                      >
                        <RefreshCcw className="w-3 h-3" />
                        <span>Create New</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>

      {/* SECTION 3: Live payment audit ledger / transactions history */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-3xs overflow-hidden">
        
        {/* Table Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <History className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                  {isKh ? 'ប្រវត្តិប្រតិបត្តិការទូទាត់' : 'Transaction Audit Ledger'}
                </h3>
                <p className="text-[11px] text-slate-450 font-medium">
                  {isKh ? 'បញ្ជីត្រួតពិនិត្យ និងតាមដានរាល់ការទូទាត់សិក្សាឌីជីថល' : 'Real-time record matching and payment state logs'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-rose-500 hover:text-rose-750 hover:bg-rose-50 px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isKh ? 'លុបប្រវត្តិទាំងអស់' : 'Clear Ledger Logs'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Statistics summary blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 flex items-center gap-3">
              <div className="p-2.5 bg-sky-100 text-sky-700 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-sky-600 font-extrabold uppercase tracking-wider">{isKh ? 'សរុបប្រាក់ដុល្លារ (USD)' : 'Total USD Collected'}</div>
                <div className="text-base font-black text-sky-900 font-mono">${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>

            <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100 flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider">{isKh ? 'សរុបប្រាក់រៀល (KHR)' : 'Total KHR Collected'}</div>
                <div className="text-base font-black text-amber-900 font-mono">៛{totalRiel.toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider">{isKh ? 'ប្រតិបត្តិការសរុប' : 'Total Transactions'}</div>
                <div className="text-base font-black text-emerald-900 font-mono">{history.length} {isKh ? 'ដង' : 'Txns'}</div>
              </div>
            </div>
          </div>

          {/* Filtering and Search controls */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isKh ? 'ស្វែងរកតាមឈ្មោះសិស្ស លេខសម្គាល់ ឬលេខយោង...' : 'Search by student, ID, Txn ID or reference...'}
                className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 text-xs font-semibold rounded-xl pl-9 pr-4 py-2.5 focus:border-[#073B3A] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-400 uppercase shrink-0">{isKh ? 'ផ្នែក៖' : 'Filter:'}</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-50 border border-slate-250 text-slate-700 text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#073B3A] cursor-pointer"
              >
                <option value="All">{isKh ? 'គ្រប់ផ្នែក' : 'All Categories'}</option>
                {CATEGORY_OPTIONS.map(o => (
                  <option key={o.id} value={o.id}>{isKh ? o.labelKh.split(' ')[0] : o.labelEn}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] sm:text-[11px] font-black uppercase text-slate-500 tracking-wider">
                <th className="p-4 text-center w-12">#</th>
                <th className="p-4">{isKh ? 'លេខប្រតិបត្តិការ' : 'Txn Info'}</th>
                <th className="p-4">{isKh ? 'ព័ត៌មានសិស្ស' : 'Student & ID'}</th>
                <th className="p-4">{isKh ? 'ប្រភេទថ្លៃសេវា' : 'Fee Category'}</th>
                <th className="p-4">{isKh ? 'គណនីធនាគារ' : 'Receiving Account'}</th>
                <th className="p-4 text-right">{isKh ? 'ទឹកប្រាក់ទូទាត់' : 'Amount Paid'}</th>
                <th className="p-4 text-center">{isKh ? 'ស្ថានភាព' : 'Status'}</th>
                <th className="p-4 text-center w-20">{isKh ? 'ជម្រើស' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400 italic">
                    {isKh ? 'មិនមានប្រវត្តិទូទាត់ដែលត្រូវគ្នាឡើយ' : 'No matching payment records found.'}
                  </td>
                </tr>
              ) : (
                filteredHistory.map((txn, idx) => (
                  <tr key={txn.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 text-center font-mono text-slate-400 bg-slate-50/10">
                      {idx + 1}
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800 text-[12px]">{txn.id}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Ref: {txn.referenceNo}</div>
                        <div className="text-[9px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{new Date(txn.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-emerald-900 flex items-center gap-1">
                          <span>{txn.studentName}</span>
                        </div>
                        <div className="text-[10px] font-black text-slate-500 font-mono">{txn.studentId}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide">
                        {txn.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <div className="text-slate-700 font-bold truncate max-w-[150px]">{txn.accountName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{txn.accountNumber}</div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-mono font-black text-slate-900 text-sm">
                        {txn.currency === 'USD' ? '$' : '៛'}{txn.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit mx-auto shadow-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{isKh ? 'ជោគជ័យ' : 'PAID'}</span>
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => handlePrintReceipt(txn)}
                        className="text-slate-500 hover:text-teal-700 hover:bg-slate-100 p-2 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                        title={isKh ? 'បោះពុម្ពវិក្កយបត្រ' : 'Print Receipt Invoice'}
                      >
                        <Receipt className="w-4 h-4" />
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
  );
}
