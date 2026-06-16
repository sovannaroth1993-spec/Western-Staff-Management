import React, { useState } from 'react';
import { 
  Building2, 
  HelpCircle, 
  Search, 
  BookOpen, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Clock, 
  FileText, 
  ChevronDown, 
  Sparkles, 
  Copy, 
  Check, 
  Award, 
  ShieldAlert, 
  Users, 
  Layers, 
  UtensilsCrossed, 
  Car, 
  Printer, 
  Info,
  ExternalLink,
  BookMarked,
  Map,
  BadgePercent,
  Upload,
  Image,
  Plus,
  Trash2,
  Calculator,
  Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Define categories for a modern segmented layout
const CATEGORIES = [
  { id: 'all', name: 'ទាំងអស់ (All FAQs)', icon: BookOpen },
  { id: 'admissions', name: 'ការចុះឈ្មោះ & ការវាយតម្លៃ (Admissions & Tests)', icon: FileText },
  { id: 'fees', name: 'ថ្លៃសិក្សា & ការបញ្ចុះតម្លៃ (Tuition & Promo)', icon: DollarSign },
  { id: 'branches', name: 'សាខា & ផែនទីទីតាំង (Campuses & Map)', icon: MapPin },
  { id: 'services', name: 'សេវាកម្ម & រដ្ឋបាល (Services & Admin)', icon: UtensilsCrossed },
  { id: 'schedule', name: 'កាលវិភាគ & ការគ្រប់គ្រងវត្តមាន (Schedule & Attendance)', icon: Clock },
  { id: 'program', name: 'កម្មវិធីសិក្សា & សញ្ញាបត្រ (Curriculum & Diploma)', icon: Award }
];

interface TuitionSession {
  id: string;
  nameKh: string;
  nameEn: string;
  yearly: number;
  subAnnual: number; // Term for Kinder, Semester for Grades
  monthly: number;
  adminFee: number;
}

interface TuitionProgram {
  id: string;
  nameKh: string;
  nameEn: string;
  isKindergarten: boolean;
  sessions: TuitionSession[];
}

const TUITION_PROGRAMS: TuitionProgram[] = [
  {
    id: 'n-k2',
    nameKh: 'មត្តេយ្យ N-K2 (Kindergarten N-K2)',
    nameEn: 'Kindergarten N-K2',
    isKindergarten: true,
    sessions: [
      { id: 'afternoon', nameKh: 'រសៀល (Afternoon)', nameEn: 'Afternoon', yearly: 2000, subAnnual: 580, monthly: 200, adminFee: 250 },
      { id: 'morning', nameKh: 'ព្រឹក (Morning)', nameEn: 'Morning', yearly: 2200, subAnnual: 630, monthly: 220, adminFee: 250 },
      { id: 'fulltime', nameKh: 'ពេញមួយថ្ងៃ (Full Time)', nameEn: 'Full Time', yearly: 2400, subAnnual: 690, monthly: 240, adminFee: 250 }
    ]
  },
  {
    id: 'k3',
    nameKh: 'មត្តេយ្យ K3 (Kindergarten K3)',
    nameEn: 'Kindergarten K3',
    isKindergarten: true,
    sessions: [
      { id: 'afternoon', nameKh: 'រសៀល (Afternoon)', nameEn: 'Afternoon', yearly: 2100, subAnnual: 600, monthly: 210, adminFee: 250 },
      { id: 'morning', nameKh: 'ព្រឹក (Morning)', nameEn: 'Morning', yearly: 2300, subAnnual: 660, monthly: 230, adminFee: 250 },
      { id: 'fulltime', nameKh: 'ពេញមួយថ្ងៃ (Full Time)', nameEn: 'Full Time', yearly: 2500, subAnnual: 720, monthly: 250, adminFee: 250 }
    ]
  },
  {
    id: 'grades-1-3',
    nameKh: 'ថ្នាក់ទី១-៣ (Grades 1-3)',
    nameEn: 'Grades 1-3',
    isKindergarten: false,
    sessions: [
      { id: 'halfday', nameKh: 'ព្រឹក ឬ រសៀល (Morning / Afternoon)', nameEn: 'Morning / Afternoon', yearly: 2000, subAnnual: 1120, monthly: 240, adminFee: 250 },
      { id: 'fulltime', nameKh: 'ពេញមួយថ្ងៃ (Full Time)', nameEn: 'Full Time', yearly: 2300, subAnnual: 1290, monthly: 280, adminFee: 250 }
    ]
  },
  {
    id: 'grades-4-5',
    nameKh: 'ថ្នាក់ទី៤-៥ (Grades 4-5)',
    nameEn: 'Grades 4-5',
    isKindergarten: false,
    sessions: [
      { id: 'halfday', nameKh: 'ព្រឹក ឬ រសៀល (Morning / Afternoon)', nameEn: 'Morning / Afternoon', yearly: 2100, subAnnual: 1180, monthly: 250, adminFee: 250 },
      { id: 'fulltime', nameKh: 'ពេញមួយថ្ងៃ (Full Time)', nameEn: 'Full Time', yearly: 2400, subAnnual: 1340, monthly: 290, adminFee: 250 }
    ]
  },
  {
    id: 'grades-6-8',
    nameKh: 'ថ្នាក់ទី៦-៨ (Grades 6-8)',
    nameEn: 'Grades 6-8',
    isKindergarten: false,
    sessions: [
      { id: 'halfday', nameKh: 'ព្រឹក ឬ រសៀល (Morning / Afternoon)', nameEn: 'Morning / Afternoon', yearly: 2200, subAnnual: 1230, monthly: 260, adminFee: 250 },
      { id: 'fulltime', nameKh: 'ពេញមួយថ្ងៃ (Full Time)', nameEn: 'Full Time', yearly: 2500, subAnnual: 1400, monthly: 300, adminFee: 250 }
    ]
  },
  {
    id: 'grades-9-11',
    nameKh: 'ថ្នាក់ទី៩-១១ (Grades 9-11)',
    nameEn: 'Grades 9-11',
    isKindergarten: false,
    sessions: [
      { id: 'halfday', nameKh: 'ព្រឹក ឬ រសៀល (Morning / Afternoon)', nameEn: 'Morning / Afternoon', yearly: 2300, subAnnual: 1290, monthly: 280, adminFee: 250 },
      { id: 'fulltime', nameKh: 'ពេញមួយថ្ងៃ (Full Time)', nameEn: 'Full Time', yearly: 2600, subAnnual: 1460, monthly: 310, adminFee: 250 }
    ]
  },
  {
    id: 'grade-12',
    nameKh: 'ថ្នាក់ទី១២ (Grade 12)',
    nameEn: 'Grade 12',
    isKindergarten: false,
    sessions: [
      { id: 'halfday', nameKh: 'ព្រឹក ឬ រសៀល (Morning / Afternoon)', nameEn: 'Morning / Afternoon', yearly: 2400, subAnnual: 1340, monthly: 290, adminFee: 250 },
      { id: 'fulltime', nameKh: 'ពេញមួយថ្ងៃ (Full Time)', nameEn: 'Full Time', yearly: 2700, subAnnual: 1510, monthly: 320, adminFee: 250 }
    ]
  }
];

export default function WesternSchoolInfo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(1); // default expand the first Q&A
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  // States for tuition fee table 2026-2027 image upload and view
  const [tuitionImage, setTuitionImage] = useState<string>(() => {
    return localStorage.getItem('wis_tuition_fee_table_image') || '';
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Check if current user is admin
  const [isAdmin] = useState<boolean>(() => {
    try {
      const currentUserRaw = sessionStorage.getItem('wis_current_user') || localStorage.getItem('wis_current_user');
      if (currentUserRaw) {
        const u = JSON.parse(currentUserRaw);
        return u && u.role === 'admin';
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  });

  // Tuition Calculator State
  const [calcStudents, setCalcStudents] = useState<any[]>(() => {
    const saved = localStorage.getItem('wis_tuition_calc_students');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: '1',
        name: 'សិស្សទី ១',
        programId: 'grades-1-3',
        sessionId: 'halfday',
        paymentPeriod: 'yearly',
        discountPercent: 0,
        includesAdminFee: true,
        multiplyCount: 1,
      }
    ];
  });

  const [calcCopied, setCalcCopied] = useState(false);

  const calculateStudentDetails = (student: any) => {
    const program = TUITION_PROGRAMS.find(p => p.id === student.programId) || TUITION_PROGRAMS[0];
    const session = program.sessions.find(s => s.id === student.sessionId) || program.sessions[0];
    
    let basePrice = session.yearly;
    let termLabel = program.isKindergarten ? 'Term' : 'Semester';
    let termLabelKh = program.isKindergarten ? 'ត្រីមាស (Term)' : 'ឆមាស (Semester)';
    
    if (student.paymentPeriod === 'subAnnual') {
      basePrice = session.subAnnual;
    } else if (student.paymentPeriod === 'monthly') {
      basePrice = session.monthly;
    }

    const baseTotal = basePrice * student.multiplyCount;
    const discountAmount = Math.round(baseTotal * (student.discountPercent / 100));
    const netTuition = baseTotal - discountAmount;
    const adminFee = student.includesAdminFee ? (session.adminFee * student.multiplyCount) : 0;
    const total = netTuition + adminFee;

    return {
      programName: program.nameKh,
      sessionName: session.nameKh,
      periodLabel: student.paymentPeriod === 'yearly' ? 'ប្រចាំឆ្នាំ (Yearly)' : (student.paymentPeriod === 'subAnnual' ? termLabelKh : 'ប្រចាំខែ (Monthly)'),
      basePrice,
      baseTotal,
      discountAmount,
      netTuition,
      adminFee,
      total,
      isKinder: program.isKindergarten,
      termLabel
    };
  };

  const handleCopyCalcSummary = (totals: any, breakdowns: any[]) => {
    let text = `🏫 សាលាអន្តរជាតិ វេសស្ទើន (Western International School)\n`;
    text += `📋 តារាងគណនាតម្លៃសិក្សាព្យាករណ៍ ២០២៦-២០២៧ (Tuition Estimate)\n`;
    text += `-----------------------------------------------\n`;
    
    breakdowns.forEach((bd, idx) => {
      const s = calcStudents[idx];
      text += `🧒 សិស្ស៖ ${s.name || `សិស្សទី ${idx + 1}`} (${s.multiplyCount} នាក់)\n`;
      text += `   • កម្រិតសិក្សា៖ ${bd.programName}\n`;
      text += `   • ម៉ោងសិក្សា៖ ${bd.sessionName}\n`;
      text += `   • របៀបបង់ថ្លៃ៖ ${bd.periodLabel}\n`;
      text += `   • ថ្លៃសិក្សា៖ $${bd.basePrice} x ${s.multiplyCount} = $${bd.baseTotal}\n`;
      if (s.discountPercent > 0) {
        text += `   • ការបញ្ចុះតម្លៃ៖ -${s.discountPercent}% (-$${bd.discountAmount})\n`;
      }
      if (s.includesAdminFee) {
        text += `   • កម្រៃរដ្ឋបាល៖ $${bd.adminFee}\n`;
      }
      text += `   • សរុបម្នាក់៖ $${bd.total}\n\n`;
    });

    text += `-----------------------------------------------\n`;
    text += `💰 ថ្លៃសិក្សាសរុប (Total Tuition): $${totals.tuition}\n`;
    if (totals.discounts > 0) {
      text += `🎁 បញ្ចុះតម្លៃសរុប (Total Savings): -$${totals.discounts}\n`;
    }
    text += `📝 កម្រៃរដ្ឋបាលសរុប (Total Admin Fee): $${totals.adminFees}\n`;
    text += `💵 ចំនួនត្រូវបង់សរុប (GRAND TOTAL): $${totals.grandTotal} (${totals.grandTotalRiel.toLocaleString()} រៀល)\n`;
    text += `-----------------------------------------------\n`;
    text += `* បញ្ជាក់៖ នេះជាតម្លៃប៉ាន់ស្មានផ្អែកលើតារាងតម្លៃផ្លូវការឆ្នាំ ២០២៦-២០២៧។\n`;
    text += `* Exchange Rate: 1 USD = 4,100 KHR`;

    navigator.clipboard.writeText(text).then(() => {
      setCalcCopied(true);
      setTimeout(() => setCalcCopied(false), 2000);
    });
  };

  const handleAddStudent = () => {
    const newId = Date.now().toString();
    const studentCount = calcStudents.length + 1;
    const newStudent = {
      id: newId,
      name: `សិស្សទី ${studentCount}`,
      programId: 'grades-1-3',
      sessionId: 'halfday',
      paymentPeriod: 'yearly',
      discountPercent: 0,
      includesAdminFee: true,
      multiplyCount: 1,
    };
    const updated = [...calcStudents, newStudent];
    setCalcStudents(updated);
    localStorage.setItem('wis_tuition_calc_students', JSON.stringify(updated));
  };

  const handleRemoveStudent = (id: string) => {
    if (calcStudents.length <= 1) {
      alert('ត្រូវតែមានសិស្សយ៉ាងហោចណាស់ម្នាក់ដើម្បីគណនា! (Must have at least 1 student to calculate!)');
      return;
    }
    const updated = calcStudents.filter(s => s.id !== id);
    setCalcStudents(updated);
    localStorage.setItem('wis_tuition_calc_students', JSON.stringify(updated));
  };

  const handleUpdateStudent = (id: string, field: string, value: any) => {
    const updated = calcStudents.map(s => {
      if (s.id === id) {
        const updatedStudent = { ...s, [field]: value };
        
        // If program changed, make sure session exists in that program
        if (field === 'programId') {
          const prog = TUITION_PROGRAMS.find(p => p.id === value);
          if (prog && prog.sessions.length > 0) {
            const hasExistingSession = prog.sessions.some(sess => sess.id === s.sessionId);
            if (!hasExistingSession) {
              updatedStudent.sessionId = prog.sessions[0].id;
            }
          }
        }
        return updatedStudent;
      }
      return s;
    });
    setCalcStudents(updated);
    localStorage.setItem('wis_tuition_calc_students', JSON.stringify(updated));
  };

  const handleTuitionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed');
      }

      const data = await res.json();
      if (data && data.url) {
        setTuitionImage(data.url);
        localStorage.setItem('wis_tuition_fee_table_image', data.url);
      } else {
        throw new Error('No download URL returned from server.');
      }
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearTuitionImage = () => {
    if (window.confirm('តើអ្នកពិតជាចង់លុបរូបភាពតារាងតម្លៃសិក្សានេះមែនទេ? (Are you sure you want to delete this tuition fee table image?)')) {
      setTuitionImage('');
      localStorage.removeItem('wis_tuition_fee_table_image');
    }
  };

  // 15 branches details for quick referencing
  const branchDetails = [
    { id: 'std', code: 'STD', name: 'សាខាស្តេឌៀម (Stadium Campus)', grades: 'ថ្នាក់ទី៥ ដល់ទី១២', mapUrl: 'https://maps.app.goo.gl/Mi1SuPdztJM4FMYR6?g_st=it' },
    { id: 'bkk', code: 'BKK', name: 'សាខាបឹងកក់ (Boeung Kak Campus)', grades: 'Nursery ដល់ថ្នាក់ទី៣', mapUrl: 'https://maps.app.goo.gl/nQMhAKRmiGvnwWp67?g_st=it' },
    { id: 'tsk', code: 'TSK', name: 'សាខាទួលសង្កែ (Toul Sangke Campus)', grades: 'Nursery ដល់ថ្នាក់ទី១២', mapUrl: 'https://maps.app.goo.gl/EPYuby6wyc3nDKG99?g_st=it' },
    { id: 'btb1', code: 'BTB 1', name: 'សាខាបឹងត្របែក ១ (Boeung Trabek 1)', grades: 'Nursery ដល់ថ្នាក់K3', mapUrl: 'https://maps.app.goo.gl/pK5pVVaH7gjqjcWf8?g_st=it' },
    { id: 'btb2', code: 'BTB 2', name: 'សាខាបឹងត្របែក ២ (Boeung Trabek 2)', grades: 'ថ្នាក់ទី១ ដល់ទី៦', mapUrl: 'https://maps.app.goo.gl/LSrRtou37xZeEYLz9' },
    { id: 'btb3', code: 'BTB 3', name: 'សាខាបឹងត្របែក ៣ (Boeung Trabek 3)', grades: 'ថ្នាក់ទី៧ ដល់ថ្នាក់ទី១២', mapUrl: 'https://maps.app.goo.gl/dJ8z269zu5uhxRiN8?g_st=it' },
    { id: 'dng', code: 'DNG', name: 'សាខាដួងងៀប (Duong Ngiep Campus)', grades: 'Nursery ដល់ថ្នាក់ទី៣', mapUrl: 'https://maps.app.goo.gl/xCGaKSufQsNVFX2A7?g_st=it' },
    { id: 'sow', code: 'SOW', name: 'សាខាសៅវេស (South West Campus)', grades: 'ថ្នាក់ទី៤ ដល់ថ្នាក់ទី១១', mapUrl: 'https://maps.app.goo.gl/4V1r4eQ73gjGpvzWA?g_st=it' },
    { id: 'bch', code: 'BCH', name: 'សាខាបឹងឈូក (Boeung Chhouk Campus)', grades: 'Nursery ដល់ថ្នាក់ទី១២', mapUrl: 'https://maps.app.goo.gl/3J1HDQJRSWXY6LePA' },
    { id: 'ckd1', code: 'CKD 1', name: 'សាខាចំការដូង ១ (Chamkar Doung 1)', grades: 'ថ្នាក់ទី១ ដល់ថ្នាក់ទី១២ និង GEP', mapUrl: 'https://maps.app.goo.gl/ffZjGV4wfo2RUJdh6' },
    { id: 'ckd2', code: 'CKD 2', name: 'សាខាចំការដូង ២ (Chamkar Doung 2)', grades: 'Nursery ដល់ថ្នាក់ K3', mapUrl: 'https://maps.app.goo.gl/5yzqjc6c4RYuQc41A?g_st=atm' },
    { id: 'car', code: 'CAR', name: 'សាខាចាក់អង្រែ (Chak Angre Campus)', grades: 'Nursery ដល់ថ្នាក់ទី១១', mapUrl: 'https://maps.app.goo.gl/wnk7uTJ1zChhfiGG7' },
    { id: 'vsb', code: 'VSB', name: 'សាខាវាលស្បូវ (Veal Sbov Campus)', grades: 'Nursery ដល់ថ្នាក់ទី១២', mapUrl: 'https://maps.app.goo.gl/pK5pVVaH7gjqjcWf8?g_st=it' },
    { id: 'ssk', code: 'SSK', name: 'សាខាសែនសុខ (Sen Sok Campus)', grades: 'Nursery ដល់ថ្នាក់ទី៤', mapUrl: 'https://maps.app.goo.gl/a1Avt4hFdZrSpRps8' },
    { id: 'shv', code: 'SHV', name: 'សាខាព្រះសីហនុ (Sihanoukville Campus)', grades: 'Nursery ដល់ថ្នាក់ទី១០', mapUrl: 'https://maps.app.goo.gl/hfo926PscsZe3UGG7' }
  ];

  // Complete data of all 19 operational Q&As
  const faqData = [
    {
      id: 1,
      category: 'admissions',
      q: 'តើសាលាវេស្ទើនអន្តរជាតិទទួលសិស្សចាប់ពីអាយុប៉ុន្មាន? ថ្លៃសិក្សាតម្លៃប៉ុន្មានក្នុង១ឆ្នាំ?',
      q_en: 'What is the minimum age for admission at Western International School? And how much is the annual tuition fee?',
      a: 'សាលាទទួលសិស្សចាប់ពីអាយុ **២ឆ្នាំកន្លះ** ឡើងទៅសម្រាប់ការចុះឈ្មោះចូលរៀន។ ចំពោះថ្លៃសិក្សាប្រចាំឆ្នាំ គឺត្រូវបានបែងចែកទៅតាមកម្រិតថ្នាក់នីមួយៗ និងមានអត្ថប្រយោជន៍ផ្សេងៗសម្រាប់ការបង់ប្រាក់ជាឆ្នាំសិក្សា ឆមាស ឬត្រីមាស។\n\n*(សមាជិកបុគ្គលិករដ្ឋបាលអាចទាញយក ឬផ្ញើតារាងតម្លៃសិក្សាផ្លូវការជូនអាណាព្យាបាលគ្រប់ពេលតាមរយៈប្រព័ន្ធនេះ)*',
      hasAction: true,
      actionText: 'ផ្ញើតារាងតម្លៃសិក្សា (Send Price List Guide)'
    },
    {
      id: 2,
      category: 'program',
      q: 'តើសាលាវេស្ទើនអន្តរជាតិបង្រៀនប៉ុន្មានភាសារួមអ្វីខ្លះ? ពីថ្នាក់ណាដល់ថ្នាក់ណា?',
      q_en: 'How many languages does Western International School teach? What are the grade ranges?',
      a: 'សាលាវេស្ទើនអន្តរជាតិ ផ្តល់ការអប់រំពីរភាសាជាគោល (Bilingual Standard Program)៖\n\n' +
         '១. **កម្មវិធីសិក្សាភាសាខ្មែរ**៖ អនុវត្តស្របតាមសៀវភៅ និងកម្មវិធីសិក្សាច្បាស់លាស់របស់ក្រសួងអប់រំ យុវជន និងកីឡា។\n' +
         '២. **កម្មវិធីសិក្សាភាសាអង់គ្លេស**៖ ត្រូវបានរៀបចំឡើងស្របតាមស្តង់ដារអន្តរជាតិ ដោយប្រើប្រាស់សៀវភៅសិក្សាល្បីៗនាំចូលពី **ប្រទេសសិង្ហបុរី និងសហរដ្ឋអាមេរិក** ព្រមទាំងសៀវភៅដែលរៀបចំឡើងដោយក្រុមអ្នកជំនាញអប់រំជាតិ និងអន្តរជាតិផ្ទាល់របស់សាលាដែលមានគរុកោសល្យខ្ពស់។\n\n' +
         '• **សម្រាប់ថ្នាក់សិក្សា**៖ ទទួលសិស្សចាប់ពី **ថ្នាក់មត្តេយ្យសិក្សា (Nursery)** រហូតដល់ **ថ្នាក់ទី១២**។\n' +
         '• **កម្មវិធីបន្ថែមភាសាចិន**៖ មានការបង្រៀនបន្ថែមភាសាចិនចំនួន **២ម៉ោងក្នុងមួយសប្តាហ៍** សម្រាប់សិស្សចាប់ពីថ្នាក់ទី១ ដល់ថ្នាក់ទី៦ ដោយឥតគិតថ្លៃបន្ថែម។'
    },
    {
      id: 3,
      category: 'admissions',
      q: 'តើសាលាទទួលធ្វើតេស្តពីថ្ងៃណាដល់ថ្ងៃណា? តេស្តម្តងតម្លៃប៉ុន្មាន? តេស្តលើមុខវិជ្ជាអ្វីខ្លះ?',
      q_en: 'What are the schedules, fees, and subjects required for the school entrance examination?',
      a: '• **កាលវិភាគធ្វើតេស្ត**៖ សាលាទទួលធ្វើតេស្តរៀងរាល់ **ថ្ងៃចន្ទ ដល់ ថ្ងៃសុក្រ**។\n' +
         '• **តម្លៃសេវាតេស្ត**៖ ថ្លៃតេស្តម្តង **១០ដុល្លារ ($10)** (លទ្ធផលតេស្តវាស់ស្ទង់សមត្ថភាពមានសុពលភាពរយៈពេល ៦ខែ)។\n' +
         '• **មុខវិជ្ជា និងលក្ខខណ្ឌតេស្តតាមកម្រិតថ្នាក់**៖\n' +
         '  - **ថ្នាក់មត្តេយ្យកម្រិតដំបូង (Nursery)**៖ មិនតម្រូវឱ្យធ្វើតេស្តចូលរៀននោះទេ។\n' +
         '  - **ថ្នាក់ Kindergarten 1 to K3 (មត្តេយ្យជាន់ខ្ពស់)**៖ ធ្វើតេស្តសរសេរ និងវាស់ស្ទង់ជាភាសាអង់គ្លេសងាយៗ។\n' +
         '  - **ថ្នាក់ទី១ ដល់ ថ្នាក់ទី១២**៖ តម្រូវឱ្យធ្វើតេស្តសរសេរភាសាអង់គ្លេស, ភាសាខ្មែរ, គណិតវិទ្យាជាភាសាអង់គ្លេស និងការសម្ភាសន៍ផ្ទាល់មាត់ (Oral Test) ជាភាសាអង់គ្លេសជាមួយគ្រូបរទេស។'
    },
    {
      id: 4,
      category: 'fees',
      q: 'តើសាលាមានការបញ្ចុះតម្លៃ (Scholarship/Promotion) ដែរឬទេសម្រាប់ឆ្នាំសិក្សាថ្មី ២០២៦-២០២៧ នេះ?',
      q_en: 'Are there any school discounts, promotions, or relative sibling scholarships for the new Academic Year?',
      a: 'បាទ/ចាស! សាលាតែងតែផ្តល់អត្ថប្រយោជន៍ និងការលើកទឹកចិត្តជាច្រើនជូនអាណាព្យាបាល៖\n\n' +
         '១. **ការបញ្ចុះតម្លៃរហ័ស (Early Bird Discount)**៖ បញ្ចុះតម្លៃពិសេស **១០០ដុល្លារ ($100)** ភ្លាមៗ សម្រាប់ការបង់ថ្លៃសិក្សាប្រចាំឆ្នាំដែលបានបង់ **ត្រឹមថ្ងៃទី៣១ កក្កដា ២០២៦**។\n' +
         '២. **ការបញ្ចុះតម្លៃជូនបងប្អូនបង្កើត (Sibling Discount)**៖\n' +
         '  - **បញ្ចុះតម្លៃ ១០%** លើថ្លៃសិក្សាកូនទី២\n' +
         '  - **បញ្ចុះតម្លៃ ១៥%** លើថ្លៃសិក្សាកូនទី៣\n' +
         '  - **បញ្ចុះតម្លៃ ២០%** លើថ្លៃសិក្សាកូនទី៤ ឡើងទៅ\n\n' +
         '*សម្គាល់៖ ការបញ្ចុះតម្លៃបងប្អូនបង្កើតនេះ ត្រូវបានផ្តល់ជូនលើថ្លៃសិក្សាដែលបង់ជា «ឆ្នាំ» «ឆមាស» ឬ «ត្រីមាស»។*',
      hasAction: true,
      actionText: 'ទាញយក Poster បញ្ចុះតម្លៃ (View Promo Poster)'
    },
    {
      id: 5,
      category: 'branches',
      q: 'តើសាលាវេស្ទើនអន្តរជាតិមានសាខាណាខ្លះនៅកម្ពុជា?',
      q_en: 'How many operational campuses does Western International School currently have?',
      a: 'គិតត្រឹមឆ្នាំសិក្សា ២០២៦-២០២៧ នេះ សាលាវេស្ទើនអន្តរជាតិមានសរុប **១៥សាខាឆ្លងដែន និងរាជធានី** ដែលកំពុងដំណើរការយ៉ាងសកម្មជាមួយស្តង់ដារអប់រំ និងបរិក្ខារទំនើបៗដូចគ្នា។\n\n*(សមាជិកអាចពិនិត្យមើលបញ្ជីឈ្មោះសាខាទាំង ១៥ និងទីតាំងផែនទី Google Map នៅផ្ទាំងព័ត៌មានខាងក្រោម)*',
      hasAction: true,
      actionText: 'បង្ហាញតារាងសាខាទាំង១៥ (Open Campus List Grid)'
    },
    {
      id: 6,
      category: 'services',
      q: 'ហេតុអ្វីចាំបាច់ត្រូវបង់ថ្លៃសេវារដ្ឋបាលប្រចាំឆ្នាំរបស់សាលា? តើត្រូវចំណាយលើអ្វីខ្លះ?',
      q_en: 'Why is it mandatory to pay the annual administrative fee, and what expenses does it cover?',
      a: 'សេវារដ្ឋបាលប្រចាំឆ្នាំគឺត្រូវបង់ **តែម្តងគត់ក្នុងមួយឆ្នាំសិក្សា** ហើយត្រូវបានប្រើប្រាស់ដើម្បីធានានូវអត្ថប្រយោជន៍ និងសុវត្ថិភាពខ្ពស់បំផុតជូនសិស្សានុសិស្សពេញមួយឆ្នាំសិក្សា ដែលរួមមាន៖\n\n' +
         '• ផ្តល់សៀវភៅសិក្សាពណ៌ (Full-Color Textbooks) សម្ភារៈឧបទ្ទេសអប់រំ និងសៀវភៅសរសេរដល់សិស្សកម្រិតមត្តេយ្យសិក្សាដោយឥតគិតថ្លៃ។\n' +
         '• ការផ្តល់ជូន **សេវាធានារ៉ាប់រងគ្រោះថ្នាក់ចៃដន្យ ២៤ម៉ោងលើ២៤ម៉ោង** ពេញមួយឆ្នាំសិក្សា។\n' +
         '• ប្រព័ន្ធតាមដានវត្តមានសិស្ស និងការទំនាក់ទំនងរហ័សជូនអាណាព្យាបាលគ្រប់ពេលសិស្សអវត្តមាន។\n' +
         '• សេវាគិលានដ្ឋាន និងគិលានុបដ្ឋាយិកាជំនាញប្រចាំការរង់ចាំសង្គ្រោះបឋមកម្រិតខ្ពស់។\n' +
         '• សន្លឹកកិច្ចការ (Worksheets) ឯកសារមេរៀន ក្រដាសប្រលង និងតេស្តរង្វាយតម្លៃគ្រប់កម្រិតថ្នាក់។\n' +
         '• ដំណើរការបញ្ជូន និងរៀបចំឯកសារចុះឈ្មោះតាមច្បាប់ទៅកាន់ការិយាល័យអប់រំ មន្ទីរអប់រំ និងក្រសួងអប់រំ យុវជន និងកីឡា។\n' +
         '• សេវាកម្មទំនាក់ទំនងរវាងគ្រូបន្ទុកថ្នាក់ជាមួយអាណាព្យាបាលសិស្សជិតស្និទ្ធ។\n' +
         '• កម្មវិធីសិក្សាក្រៅសាលា/ទស្សនកិច្ចសិក្សា (Field Trips) ទៅតាមទីតាំងប្រវត្តិសាស្ត្រនានា (ពីថ្នាក់ទី១ ដល់ថ្នាក់ទី១២)។\n' +
         '• កម្មវិធីការតាំងពិពណ៌ស្នាដៃសិស្សានុសិស្ស និងកម្មវិធីប្រកួតកីឡាស្របតាមក្រសួងអប់រំ។\n' +
         '• កម្មវិធីប្រកួតប្រជែងសមត្ថភាពភាសាអង់គ្លេស និងភាសាខ្មែរប្រចាំឆ្នាំ (Speech Contest, Spelling Bee)។\n' +
         '• កម្មវិធីប្រគល់សញ្ញាបត្រផ្លូវការសម្រាប់សិស្សមត្តេយ្យសិក្សាឡើងថ្នាក់ទី១ និងសិស្សបញ្ចប់ថ្នាក់ទី១២។\n' +
         '• ការរៀបចំកម្មវិធីកម្សាន្ត និងវប្បធម៌ក្នុងពិធីបុណ្យធំៗដូចជា៖ ចូលឆ្នាំខ្មែរ បុណ្យភ្ជុំបិណ្ឌ បុណ្យណូអែល និងបុណ្យហាឡូវីន (Halloween) ។'
    },
    {
      id: 7,
      category: 'services',
      q: 'តើសាលាមានសេវាកម្មអាហារថ្ងៃត្រង់ដែរឬទេ? តម្លៃប៉ុន្មាន? មានកន្លែងសម្រាប់ក្មេងគេងពេលថ្ងៃត្រង់ដែរឬទេ?',
      q_en: 'Does the school provide lunch and nap-room services? What are the charges?',
      a: 'បាទ/ចាស! សាលាមានផ្តល់ជូននូវសេវាកម្មម្ហូបអាហារមានអនាម័យខ្ពស់ និងការផ្តល់កន្លែងសម្រាក៖\n\n' +
         '១. **សេវាកម្មអាហារថ្ងៃត្រង់ (Lunch Service)**៖\n' +
         '  - សម្រាប់ **សិស្សមត្តេយ្យសិក្សា**៖ តម្លៃ **៤៣ដុល្លារ ($43)** ក្នុងមួយខែ\n' +
         '  - សម្រាប់ **សិស្សថ្នាក់ទី១ ឡើងទៅ**៖ តម្លៃ **៥០ដុល្លារ ($50)** ក្នុងមួយខែ\n\n' +
         '២. **សេវាកម្មកន្លែងគេងថ្ងៃត្រង់ (Nap Room Service)**៖\n' +
         '  - សាលាមានបន្ទប់សម្រាកស្អាត មានម៉ាស៊ីនត្រជាក់ និងការថែទាំយ៉ាងហ្មត់ចត់ ដោយផ្តល់អាទិភាពខ្ពស់ដល់សិស្សកម្រិតមត្តេយ្យ។\n' +
         '  - តម្លៃសេវាកម្មគេងថ្ងៃត្រង់គឺ **២០ដុល្លារ ($20)** ក្នុងមួយខែ។'
    },
    {
      id: 8,
      category: 'services',
      q: 'តើសាលាមានសេវាកម្មរថយន្តដឹកជញ្ជូនសិស្ស (School Bus) ដែរឬទេ?',
      q_en: 'Does the school offer school bus transportation for students?',
      a: 'បច្ចុប្បន្ននេះ សាលាវេស្ទើនអន្តរជាតិមានផ្តល់សេវាកម្មរថយន្តដឹកជញ្ជូនសិស្សដែលមានសុវត្ថិភាពខ្ពស់សម្រាប់ **៣សាខា** ដូចជាខាងក្រោម៖\n\n' +
         '១. **សាខាស្តេឌៀម (Stadium Campus)**\n' +
         '២. **សាខាសែនសុខ (Sen Sok Campus)**\n' +
         '៣. **សាខាបឹងកក់ (Boeung Kak Campus)**\n\n' +
         '*ចំណាំ៖ សេវាកម្មរថយន្តដឹកសិស្សនេះ គឺទទួលផ្តល់ជូនតែចំពោះ **សិស្សានុសិស្សដែលសិក្សាពេញម៉ោង (Full-Time Students)** តែប៉ុណ្ណោះ។ (អាណាព្យាបាលអាចទាក់ទងមកការិយាល័យរដ្ឋបាល ដើម្បីផ្ញើតារាងតម្លៃឡានដឹកទៅតាមចម្ងាយជាក់ស្តែង)*',
      hasAction: true,
      actionText: 'ពិនិត្យតារាងតម្លៃឡានដឹក (Check Bus Fare)'
    },
    {
      id: 9,
      category: 'schedule',
      q: 'តើកាលវិភាគសិក្សារបស់សិស្សសាលាវេស្ទើនអន្តរជាតិ សិក្សាពីថ្ងៃណាដល់ថ្ងៃណា និងម៉ោងណាខ្លះ?',
      q_en: 'What are the school days, class shifts, and study hours for students?',
      a: 'ការសិក្សាត្រូវបានរៀបចំឡើងចាប់ពី **ថ្ងៃចន្ទ ដល់ ថ្ងៃសុក្រ** ទៅតាមកម្រិតថ្នាក់សិក្សា៖\n\n' +
         '១. **សម្រាប់ថ្នាក់ពេញមួយថ្ងៃ (Full-Day Shifts)**៖\n' +
         '  - **កម្រិតមត្តេយ្យដល់ថ្នាក់ទី៣**៖\n' +
         '    • ពេលព្រឹក៖ សិក្សាចាប់ពីម៉ោង **០៨:០០ ព្រឹក ដល់ម៉ោង ១០:៥០ ព្រឹក**\n' +
         '    • ពេលរសៀល៖ សិក្សាចាប់ពីម៉ោង **១៣:០០ រសៀល ដល់ម៉ោង ១៥:៥០ ល្ងាច**\n' +
         '  - **កម្រិតថ្នាក់ទី៤ ដល់ថ្នាក់ទី១២**៖\n' +
         '    • ពេលព្រឹក៖ សិក្សាចាប់ពីម៉ោង **០៨:០០ ព្រឹក ដល់ម៉ោង ១១:៥០ ព្រឹក**\n' +
         '    • ពេលរសៀល៖ សិក្សាចាប់ពីម៉ោង **១៣:០០ រសៀល ដល់ម៉ោង ១៥:៥០ ល្ងាច**\n\n' +
         '២. **សម្រាប់ថ្នាក់សិក្សាតែមួយវេន (Half-Day Shifts / Single Shift)**៖\n' +
         '  - **វេនព្រឹក**៖ សិក្សាចាប់ពីម៉ោង **០៨:០០ ព្រឹក ដល់ម៉ោង ១១:៥០ ថ្ងៃត្រង់**\n' +
         '  - **វេនរសៀល**៖ សិក្សាចាប់ពីម៉ោង **១៣:០០ រសៀល ដល់ម៉ោង ១៦:៥០ ល្ងាច**'
    },
    {
      id: 10,
      category: 'admissions',
      q: 'បើចង់ផ្ទេរការសិក្សាសិស្សពីសាលាចាស់ មកសាលាវេស្ទើនអន្តរជាតិ តើតម្រូវឱ្យមានឯកសាររដ្ឋបាលអ្វីខ្លះ?',
      q_en: 'What are the required documents for transferring a student from another school to WI School?',
      a: 'ដើម្បីសម្រួលដល់ការផ្ទេរការសិក្សាឱ្យបានត្រឹមត្រូវស្របតាមច្បាប់អប់រំ អាណាព្យាបាលត្រូវរៀបចំឯកសារដូចខាងក្រោម៖\n\n' +
         '១. **ព្រឹត្តបត្រពិន្ទុ ឬសៀវភៅតាមដានការសិក្សា** ចេញដោយសាលាចាស់ចុងក្រោយបង្អស់។\n' +
         '២. **សៀវភៅសិក្ខាគារិក** (សម្រាប់សិស្សផ្ទេរចូលចាប់ពីកម្រិត **ថ្នាក់ទី៤ ឡើងទៅ**)។\n' +
         '៣. សំណៅថតចម្លង **សំបុត្រកំណើត** ចំនួន ១សន្លឹក។\n' +
         '៤. **លិខិតផ្ទេរការសិក្សាចេញ** ពីសាលាដើមច្បាប់ដើម (Transfer Form signed by old principal)។\n\n' +
         '*បញ្ជាក់៖ រាល់សិស្សផ្ទេរថ្មីទាំងអស់គឺ តម្រូវឱ្យចូលរួមធ្វើតេស្តវាស់ស្ទង់សមត្ថភាពចំណេះដឹងទូទៅមុននឹងកំណត់ថ្នាក់សិក្សាឱ្យបានសមស្រប (ដោយយោងលើតារាង អាយុកម្រិតថ្នាក់សិក្សាជាឯកសារយោង)*។'
    },
    {
      id: 11,
      category: 'schedule',
      q: 'បើអាណាព្យាបាលចង់ឱ្យកូនសិក្សាតែមួយវេន (ព្រឹក ឬ រសៀល) តើសាលាទទួលដែរឬទេ?',
      q_en: 'Does WI School support single half-day shifts class assignment for students?',
      a: 'ការចុះឈ្មោះរៀនពេញមួយថ្ងៃ (Full-Day) គឺជាកម្មវិធីស្នូល។ ទោះជាយ៉ាងណា សាលាក៏មានបើកថ្នាក់សិក្សា **មួយវេន (Single Shift)** ទៅតាមលក្ខខណ្ឌជាក់លាក់ និងសាខាដែលបានកំណត់ (យោងតាម Class Assignment list for A-Y 2026-2027) ដូចខាងក្រោម៖\n\n' +
         '• **ថ្នាក់មត្តេយ្យសិក្សា ១វេន**៖ មានតែនៅ **សាខាបឹងកក់ (Boeung Kak)** តែប៉ុណ្ណោះ។\n' +
         '• **ថ្នាក់ទី៤ មួយវេន**៖ មានផ្តល់ជូនតែនៅ **សាខាសែនសុខ (Sen Sok)** តែប៉ុណ្ណោះ។\n' +
         '• **ថ្នាក់ទី៦ ដល់ ថ្នាក់ទី១២ មួយវេន**៖ មានផ្តល់ជូនតែនៅ **សាខាស្តេឌៀម (Stadium)** តែប៉ុណ្ណោះ។\n\n' +
         '*(ចំណាំ៖ ចំពោះកម្រិតថ្នាក់ទី១, ទី២, ទី៣ និងថ្នាក់ទី៥ គឺមិនមានបើកថ្នាក់សិក្សាមួយវេននោះឡើយ)*។'
    },
    {
      id: 12,
      category: 'branches',
      q: 'តើសាខានីមួយៗរបស់សាលាវេស្ទើនអន្តរជាតិ មានបើកបង្រៀនចាប់ពីថ្នាក់ណា ដល់ថ្នាក់ណាខ្លះ?',
      q_en: 'What are the specific grade ranges available at each of the 15 campuses?',
      a: 'សម្រង់កម្រិតថ្នាក់បង្រៀនសម្រាប់ឆ្នាំសិក្សា ២០២៦-២០២៧ តាមបណ្តាសាខានីមួយៗ៖\n\n' +
         '១. **សាខាបឹងកក់**៖ ចាប់ពី Nursery ដល់ថ្នាក់ទី៣\n' +
         '២. **សាខាសែនសុខ**៖ ចាប់ពី Nursery ដល់ថ្នាក់ទី៤\n' +
         '៣. **សាខាស្តេឌៀម**៖ ចាប់ពី ថ្នាក់ទី៥ ដល់ទី១២\n' +
         '៤. **សាខាដួងងៀប**៖ ចាប់ពី Nursery ដល់ថ្នាក់ទី៣\n' +
         '៥. **សាខាបឹងឈូក**៖ ចាប់ពី Nursery ដល់ថ្នាក់ទី១២\n' +
         '៦. **សាខាចំការដូង ១**៖ ចាប់ពី ថ្នាក់ទី១ ដល់ទី១២ និង GE Program\n' +
         '៧. **សាខាចំការដូង ២**៖ ចាប់ពី Nursery ដល់ថ្នាក់ K3\n' +
         '៨. **សាខាចាក់អង្រែ**៖ ចាប់ពី Nursery ដល់ថ្នាក់ទី១១\n' +
         '៩. **សាខាទួលសង្កែ**៖ ចាប់ពី Nursery ដល់ថ្នាក់ទី១២\n' +
         '១០. **សាខាវាលស្បូវ**៖ ចាប់ពី Nursery ដល់ថ្នាក់ទី១២\n' +
         '១១. **សាខាសៅវេស**៖ ចាប់ពី ថ្នាក់ទី៤ ដល់ថ្នាក់ទី១១\n' +
         '១២. **សាខាបឹងត្របែក ១**៖ ចាប់ពី Nursery ដល់ថ្នាក់ K3\n' +
         '1៣. **សាខាបឹងត្របែក ២**៖ ចាប់ពី ថ្នាក់ទី១ ដល់ថ្នាក់ទី៦\n' +
         '១៤. **សាខាបឹងត្របែក ៣**៖ ចាប់ពី ថ្នាក់ទី៧ ដល់ថ្នាក់ទី១២\n' +
         '១៥. **សាខាព្រះសីហនុ**៖ ចាប់ពី Nursery ដល់ថ្នាក់ទី១០'
    },
    {
      id: 13,
      category: 'program',
      q: 'តើសញ្ញាបត្របញ្ចប់ថ្នាក់ទី១២ ចេញដោយសាលាវេស្ទើនអន្តរជាតិ (WI High School Diploma) អាចប្រើប្រាស់ចុះឈ្មោះចូលរៀននៅតាមសាកលវិទ្យាល័យបានដែរឬទេ?',
      q_en: 'Can the high school diplomas issued by WI School be used to apply for all universities in Cambodia and abroad?',
      a: 'សិស្សានុសិស្សដែលបានបញ្ចប់ការសិក្សាកម្រិតថ្នាក់ទី១២ នៅសាលាវេស្ទើនអន្តរជាតិ នឹងទទួលបាននូវ **សញ្ញាបត្រពីរប្រភេទផ្សេងគ្នា**៖\n\n' +
         '១. **សញ្ញាបត្រទុតិយភូមិសាលា (High School Diploma)**៖ ចេញដោយសាកលវិទ្យាល័យ ឬសាលាវេស្ទើនអន្តរជាតិផ្ទាល់។ សញ្ញាបត្រនេះ **មិនអាច** ប្រើចុះឈ្មោះចូលរៀនមហាវិទ្យាល័យរដ្ឋ ឬរដ្ឋបាលក្នុងស្រុកមួយចំនួនបានដោយផ្ទាល់ឡើយ។ ប៉ុន្តែ សិស្សានុសិស្សអាចយកទៅប្រើប្រាស់ដាក់ពាក្យបន្តការសិក្សានៅសាកលវិទ្យាល័យនានានៅ **ក្រៅប្រទេសជុំវិញសកលលោក** បានយ៉ាងជោគជ័យតាមទម្លាប់ប្រវត្តិសិស្សចាស់កន្លងមក។\n\n' +
         '២. **សញ្ញាបត្រទុតិយភូមិថ្នាក់ជាតិ (MoEYS Bac II Certificate)**៖ សិស្សត្រូវតែចូលរួមប្រលងថ្នាក់ជាតិបញ្ចប់ទុតិយភូមិ (បាក់ឌុប) ឱ្យបានជោគជ័យ ដើម្បីទទួលបានសញ្ញាបត្រចេញដោយក្រសួងអប់រំ យុវជន និងកីឡា។ សញ្ញាបត្រនេះអាចប្រើចុះឈ្មោះចូលរៀនគ្រប់សាកលវិទ្យាល័យទាំងអស់ក្នុងប្រទេសកម្ពុជា។\n\n' +
         '*បញ្ជាក់៖ បច្ចុប្បន្នសាលាវេស្ទើនអន្តរជាតិមិនទាន់មានចុះកិច្ចព្រមព្រៀងដៃគូដែលអនុញ្ញាតឱ្យសិស្សឡើងរៀនសាកលវិទ្យាល័យក្រៅប្រទេសដោយស្វ័យប្រវត្តិនោះឡើយ។ សិស្សត្រូវដាក់ពាក្យ ស្នើសុំប្រឡងចូលរៀនដោយភ្ជាប់ជាមួយនឹងសញ្ញាបត្រ High School Diploma របស់ WIS*។'
    },
    {
      id: 14,
      category: 'branches',
      q: 'តើទីតាំងសាខានីមួយៗរបស់សាលាវេស្ទើនអន្តរជាតិមានទីតាំងនៅលើផែនទី Google Map នៅកន្លែងណាខ្លះ?',
      q_en: 'Where are the coordinates and Google Maps locations of each Western International School branches?',
      a: 'ខាងក្រោមនេះជាបញ្ជីទីតាំងផែនទីរហ័ស Google Maps ផ្លូវការរបស់សាខាទាំង ១៥ (អ្នកអាចចុចលើលីង ដើម្បីបើកកម្មវិធី Google Map បានភ្លាមៗ)៖\n\n' +
         '• 🏟️ **STD Campus** (Stadium): https://maps.app.goo.gl/Mi1SuPdztJM4FMYR6?g_st=it\n' +
         '• 🏙️ **BKK** (Boeung Kak): https://maps.app.goo.gl/nQMhAKRmiGvnwWp67?g_st=it\n' +
         '• 🏫 **TSK** (Toul Sangke): https://maps.app.goo.gl/EPYuby6wyc3nDKG99?g_st=it\n' +
         '• 📕 **BTB1** (Boeung Trabek 1): https://maps.app.goo.gl/pK5pVVaH7gjqjcWf8?g_st=it\n' +
         '• 📘 **BTB2** (Boeung Trabek 2): https://maps.app.goo.gl/LSrRtou37xZeEYLz9\n' +
         '• 📙 **BTB3** (Boeung Trabek 3): https://maps.app.goo.gl/dJ8z269zu5uhxRiN8?g_st=it\n' +
         '• 🌾 **DNG** (Duong Ngiep): https://maps.app.goo.gl/xCGaKSufQsNVFX2A7?g_st=it\n' +
         '• 🏛️ **SOW** (South West): https://maps.app.goo.gl/4V1r4eQ73gjGpvzWA?g_st=it\n' +
         '• 🏡 **BCH** (Boeung Chhouk): https://maps.app.goo.gl/3J1HDQJRSWXY6LePA\n' +
         '• 🏢 **CKD1** (Chamkar Doung 1): https://maps.app.goo.gl/ffZjGV4wfo2RUJdh6\n' +
         '• 🏬 **CKD2** (Chamkar Doung 2): https://maps.app.goo.gl/5yzqjc6c4RYuQc41A?g_st=atm\n' +
         '• 🌊 **CAR** (Chak Angre): https://maps.app.goo.gl/wnk7uTJ1zChhfiGG7\n' +
         '• 🏞️ **VSB** (Veal Sbov): https://maps.app.goo.gl/pK5pVVaH7gjqjcWf8?g_st=it\n' +
         '• 🌳 **SSK** (Sen Sok): https://maps.app.goo.gl/a1Avt4hFdZrSpRps8\n' +
         '• 🏖️ **SHV** (Preah Sihanouk): https://maps.app.goo.gl/hfo926PscsZe3UGG7',
      hasAction: true,
      actionText: 'បើកផែនទីគំនូររួម (Explore Branches on Map Container)'
    },
    {
      id: 15,
      category: 'schedule',
      q: 'តើសិស្សក្នុងមួយថ្នាក់មានកម្រិតកំណត់ប៉ុន្មាននាក់? ហើយមានចំនួនគ្រូបង្រៀន ឬគ្រូជំនួយប៉ុន្មាននាក់?',
      q_en: 'What is the student limit per classroom, and how many teachers are assigned per room?',
      a: 'ដើម្បីធានាបាននូវគុណភាពនៃការអប់រំ និងការយកចិត្តទុកដាក់ខ្ពស់បំផុត៖\n\n' +
         '• **ចំនួនសិស្ស**៖ សាលាកំណត់ចំនួនសិស្សជាមធ្យមត្រឹមតែ **២៥នាក់** ប៉ុណ្ណោះក្នុងមួយបន្ទប់សិក្សា។\n' +
         '• **ការរៀបចំគ្រូប្រចាំថ្នាក់**៖\n' +
         '  - **ថ្នាក់មត្តេយ្យ Nursery & K1**៖ មានគ្រូបន្ទុកថ្នាក់ចំនួន ១នាក់ និង **គ្រូជំនួយ (Assistant Teachers) ២នាក់** បន្ថែម។\n' +
         '  - **ថ្នាក់កម្រិត K2, K3 និង ថ្នាក់ទី១ ដល់ថ្នាក់ទី៣**៖ មានគ្រូបន្ទុកថ្នាក់ ១នាក់ និង **គ្រូជំនួយ ១នាក់** បន្ថែម។\n' +
         '  - **កម្រិតថ្នាក់បន្តផ្សេងទៀត**៖ មានគ្រូបន្ទុកថ្នាក់ប្រចាំការ និងមានគ្រូជំនាញផ្នែកអប់រំទៅតាមមុខវិជ្ជានីមួយៗថែមទៀតផង។'
    },
    {
      id: 16,
      category: 'services',
      q: 'តើការផ្តល់សេវាធានារ៉ាប់រងគ្រោះថ្នាក់ដល់សិស្ស ២៤ម៉ោង មានលក្ខខណ្ឌ គោលការណ៍ និងនីតិវិធីទាមទារបែបណា?',
      q_en: 'What are the emergency insurance coverage limits and compensation protocols?',
      a: 'សាលាផ្តល់សេវាធានារ៉ាប់រងគ្រោះថ្នាក់ចៃដន្យទូទាំងប្រទេសជូនសិស្សានុសិស្ស **២៤ម៉ោង/២៤ម៉ោង** ដែលរួមមានទំហំការពារការប៉ះទង្គិច ៨ ប្រភេទដូចជា៖\n' +
         '១. ករណីលង់ទឹក | ២. ការពុលអាហារ | ៣. ការសម្លាប់ ឬការវាយធ្វើបាប | ៤. សត្វទិច ចឹក ឬខាំ | ៥. ការបាត់ខ្លួនចៃដន្យ | ៦. គ្រោះថ្នាក់ចរាចរណ៍ ឬគ្រោះថ្នាក់ផ្សេងៗ | ៧. ការថប់ដង្ហើមដោយសារផ្សែង ឬឧស្ម័នពុល | ៨. ការរងរបួសពីការលេងកីឡាមិនអាជីពក្នុងសាលា។\n\n' +
         '• **នីតិវិធីនៃការផ្តល់សំណង និងការលម្អិត**៖\n' +
         '  - ត្រូវនាំយកសិស្សានុសិស្សដែលរងគ្រោះទៅកាន់មន្ទីរពេទ្យ ឬគ្លីនិកព្យាបាលស្របច្បាប់ដែលមានអាជ្ញាប័ណ្ណផ្លូវការ។\n' +
         '  - ទំហំសំណងគឺផ្តល់ជូនអតិបរិមា **៥០០ដុល្លារ ($500)** ក្នុងម្នាក់ ក្នុងមួយឆ្នាំសិក្សា។\n' +
         '  - អាណាព្យាបាលត្រូវផ្តល់វិក្កយបត្រថ្លៃព្យាបាល និងលិខិតបញ្ជាក់ជំងឺពីគ្រូពេទ្យផ្ញើមកកាន់ការិយាល័យរដ្ឋបាលនៃសាខារបស់ខ្លួន **មិនឱ្យហួសរយៈពេល ១ខែ** គិតចាប់ពីថ្ងៃកើតហេតុ។\n' +
         '  - បុគ្គលិកផ្នែករដ្ឋបាលនឹងរៀបចំសំណុំឯកសារទាមទារសំណង រួចបញ្ជូនទៅការិយាល័យកណ្តាលដើម្បីរៀបចំជូនថវិកាសងវិញយ៉ាងឆាប់រហ័ស។'
    },
    {
      id: 17,
      category: 'program',
      q: 'តើការសិក្សានៅសាលាវេស្ទើនអន្តរជាតិ សិស្សានុសិស្សនឹងទទួលបានអត្ថប្រយោជន៍ និងឧត្តមភាពអ្វីខ្លះ?',
      q_en: 'Why should parents choose Western International School for their children education development?',
      a: 'សាលាវេស្ទើនអន្តរជាតិ ផ្តល់នូវគុណតម្លៃស្នូល និងឧត្តមភាពអប់រំចំនួន ៧ ធំៗរួមមាន៖\n\n' +
         '១. **ប្រព័ន្ធអប់រំឈានមុខគេ**៖ ផ្តល់នូវបរិយាកាសសិក្សាដកស្រង់ចេញពីសៀវភៅស្តង់ដារល្បីៗ និងកម្មវិធីសម្បូរបែប។\n' +
         '២. **ការបណ្តុះវិន័យពិតប្រាកដ**៖ បង្កើតទម្លាប់ល្អ វិន័យ និងការគោរពពេលវេលាដែលជួយការអភិវឌ្ឍបុគ្គលិកលក្ខណៈជោគជ័យពេញមួយជីវិត។\n' +
         '៣. **ការបង្កើនភាពជឿជាក់**៖ ជំរុញឱ្យសិស្សមានការនិយាយជាសាធារណៈ (Public Speaking) ភាពក្លាហាន បញ្ចេញមតិ និងសមត្ថភាពដោះស្រាយបញ្ហា។\n' +
         '៤. **ចំណេះដឹងភាសាខ្លាំងពីរ**៖ ពង្រឹងសមត្ថភាពការសរសេរ អាន និងសន្ទនាភាសាខ្មែរ និងអង់គ្លេសស្ទាត់ជំនាញ។\n' +
         '៥. **បរិក្ខារថ្នាក់រៀនទំនើប**៖ បន្ទប់រៀនមានម៉ាស៊ីនត្រជាក់ សម្ភារៈជំនួយស្មារតី កន្លែងលេងកម្សាន្ត និងបណ្ណាល័យបំពង់បច្ចេកវិទ្យា។\n' +
         '៦. **ការធានាសុវត្ថិភាពល្អឥតខ្ចោះ**៖ ផ្តល់ជូនការធានារ៉ាប់រងអាយុជីវិត និងគ្រោះថ្នាក់ចៃដន្យ ២៤ម៉ោងរបស់សិស្ស។\n' +
         '៧. **ក្រុមគ្រូបង្រៀនវិជ្ជាជីវៈខ្ពស់**៖ គ្រូជាតិ និងអន្តរជាតិប្រកបដោយក្រមសីលធម៌ ស្និទ្ធស្នាល និងយកចិត្តទុកដាក់ខ្ពស់បំផុត។'
    },
    {
      id: 18,
      category: 'fees',
      q: 'តើត្រូវចំណាយលើថ្លៃទិញសៀវភៅសិក្សាអស់ចំនួនប៉ុន្មានក្នុងមួយឆ្នាំ?',
      q_en: 'What is the estimated textbook cost for students across different levels?',
      a: 'ការបែងចែកថ្លៃសៀវភៅសិក្សាត្រូវបានរៀបចំឡើងទៅតាមកម្រិតសិក្សា៖\n\n' +
         '• **កម្រិតមត្តេយ្យសិក្សា (Nursery to K3)**៖ ទទួលបាន **សៀវភៅសិក្សាផ្លូវការដោយឥតគិតថ្លៃ** (រួមបញ្ចូលជាមួយថ្លៃសេវារដ្ឋបាលរួចជាស្រេច)។\n' +
         '• **កម្រិតបឋមសិក្សា (ថ្នាក់ទី១ ដល់ ថ្នាក់ទី៦)**៖ សៀវភៅត្រូវបានបែងចែកលក់ជូនចំនួន ២ដង (ដើមឆ្នាំសិក្សាម្តង និងដើមឆមាសទី២ ម្តង) រួមមានសៀវភៅភាសាអង់គ្លេស និងភាសាចិន។ ចំពោះសៀវភៅភាសាខ្មែរ និងសៀវភៅសរសេរ អាណាព្យាបាលអាចរកទិញនៅបណ្ណាគារខាងក្រៅបាន។ **ការចំណាយតេស្តប្រចាំឆ្នាំសរុបប្រហែល ១៥០ដុល្លារ ($150)**។\n' +
         '• **កម្រិតអនុវិទ្យាល័យ និង វិទ្យាល័យ (ថ្នាក់ទី៧ ដល់ ទី១២)**៖ សិស្សសិក្សាតាមប្រព័ន្ធបច្ចេកវិទ្យាអេឡិចត្រូនិក **E-Book** ដោយសិស្សានុសិស្សគ្រាន់តែនាំយក Laptop ឬ Tablet មកសាលាដើម្បីសិក្សា និងត្រូវទិញបន្ថែមនូវសៀវភៅពុម្ពជាក្រដាសផ្នែកភាសាអង់គ្លេសចំនួន ២ក្បាលប៉ុណ្ណោះសម្រាប់ការសរសេរលំហាត់។'
    },
    {
      id: 19,
      category: 'schedule',
      q: 'តើនៅសាលាវេស្ទើនអន្តរជាតិមានរបៀបគ្រប់គ្រង និងតាមដានវត្តមានរបស់សិស្សានុសិស្សបែបណាខ្លះ?',
      q_en: 'How is student attendance monitored and parent notifications handled?',
      a: 'សាលាមានច្បាប់គ្រប់គ្រងវត្តមាន និងការពន្យាពេលយ៉ាងតឹងរ៉ឹងបំផុតដើម្បីធានាសុវត្ថិភាពសិស្ស៖\n\n' +
         '• សិស្សានុសិស្សត្រូវតែមានវត្តមាននៅក្នុងបរិវេណសាលាឱ្យបានមុនម៉ោងចូលរៀនផ្លូវការ។\n' +
         '• គ្រូបន្ទុកថ្នាក់ធ្វើការស្រង់វត្តមានសិស្សយ៉ាងហ្មត់ចត់រៀងរាល់ម៉ោងសិក្សា និងតាមមុខវិជ្ជានីមួយៗ។\n' +
         '• សាលា **មិនអនុញ្ញាត** ឱ្យសិស្សានុសិស្សចាកចេញក្រៅបរិវេណសាលាឡើយក្នុងអំឡុងម៉ោងសិក្សាជាដាច់ខាត។\n' +
         '• **ច្បាប់ពេលសម្រាកបាយថ្ងៃត្រង់**៖ ករណីសិស្សចង់ចេញទៅក្រៅបរិវេណសាលាពេលថ្ងៃត្រង់ លុះត្រាតែមានការយល់ព្រម ឬការស្នើសុំជាលាយលក្ខណ៍អក្សរពីអាណាព្យាបាល និងបំពេញបែបបទអនុញ្ញាតនៅការិយាល័យរដ្ឋបាលជាមុនសិន ទើបសន្តិសុខអនុញ្ញាតឱ្យចេញក្រៅបាន។\n' +
         '• ប្រព័ន្ធនឹងទាក់ទងដោយស្វ័យប្រវត្ត ឬបុគ្គលិករដ្ឋបាលទូរស័ព្ទផ្ទាល់ទៅកាន់អាណាព្យាបាលភ្លាមៗ ក្នុងករណីដែលសិស្សអវត្តមានគ្មានការអនុញ្ញាត។'
    }
  ];

  // Search and filter faq items
  const filteredFaq = faqData.filter(item => {
    const matchesSearch = 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.q_en && item.q_en.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (id: number, text: string) => {
    // Strip markdown formatting for cleaner telegram text copy
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const qrObj = faqData.find(f => f.id === id);
    const textToCopy = `❓ សំណួរ៖ ${qrObj?.q}\n\n📢 ចម្លើយ៖\n${cleanText}\n\n--- \nWestern International School • Campus Advisory Support Suite`;
    
    try {
      navigator.clipboard.writeText(textToCopy);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Calculator totals calculation
  const studentBreakdowns = calcStudents.map(s => calculateStudentDetails(s));
  const totals = studentBreakdowns.reduce((acc, curr) => {
    return {
      tuition: acc.tuition + curr.baseTotal,
      discounts: acc.discounts + curr.discountAmount,
      adminFees: acc.adminFees + curr.adminFee,
      grandTotal: acc.grandTotal + curr.total
    };
  }, { tuition: 0, discounts: 0, adminFees: 0, grandTotal: 0 });

  const totalsWithRiel = {
    ...totals,
    grandTotalRiel: totals.grandTotal * 4100
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Dynamic Header Block designed elegantly */}
      <div className="bg-gradient-to-r from-[#073B3A] via-[#052524] to-[#0d5c5a] rounded-3xl p-6 md:p-10 border border-teal-500/30 shadow-xl relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-start md:items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-amber-300 to-amber-500 rounded-2xl shadow-xl shrink-0 text-slate-900 mt-1 md:mt-0">
              <Building2 className="w-10 h-10 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-red-600 text-white text-[10px] sm:text-xs font-extrabold tracking-widest uppercase px-3 py-1 rounded-full shadow-md animate-pulse flex items-center gap-1.5">
                  <span className="text-amber-300">★</span> ឆ្នាំសិក្សា ២០២៦-២០២៧
                </span>
                <span className="bg-teal-905 border border-teal-500/40 text-teal-300 text-[10px] sm:text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full">
                  CAMPUS INFORMATION PORTAL
                </span>
              </div>
              <h2 className="text-2xl md:text-3.5xl lg:text-4xl font-extrabold font-moul tracking-wide text-[#FFEFD5] mt-3 drop-shadow-md leading-relaxed text-left">
                ព័ត៌មាននិងបទបញ្ជាផ្ទៃក្នុង សាលាវេស្ទើនអន្តរជាតិ
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/90 font-medium tracking-wider font-sans mt-2 text-left">
                Western International School • Official Academic Standard Operating Procedures & Parent Advisory Suite
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 bg-black/25 p-3 px-4.5 rounded-2xl border border-teal-500/20 shadow-inner">
            <div className="space-y-0.5 text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-widest">Active Standard</span>
              <span className="text-sm font-black text-amber-300 font-sans">A-Y 2026-2027</span>
            </div>
            <div className="w-10 h-10 bg-amber-400 text-slate-900 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-md animate-bounce">
              WIS
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Search Bar Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Search input */}
        <div className="md:col-span-6 lg:col-span-5 relative">
          <input
            type="text"
            placeholder="ស្វែងរកប្រធានបទ ថ្លៃសិក្សា ម៉ោងរៀន សាខា... (Search keywords...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm sm:text-base pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-inner-xs focus:outline-none focus:ring-2 focus:ring-[#073B3A]/30 focus:border-[#073B3A] font-medium text-slate-800 transition-all duration-200"
          />
          <Search className="absolute left-4 top-4.5 w-5 h-5 text-slate-400" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-[11px] bg-slate-205 hover:bg-slate-300 text-slate-700 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Dynamic prompt badge */}
        <div className="md:col-span-6 lg:col-span-7 flex flex-wrap items-center md:justify-end gap-2.5 text-xs font-semibold text-slate-500 select-none">
          <span className="text-xs uppercase font-extrabold text-[#073B3A]/60 tracking-wider">ឧបករណ៍ជំនួយ (Tools):</span>
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-xl text-[11px] inline-flex items-center gap-1.5 font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>Telegram Ready Messages</span>
          </span>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-xl text-[11px] inline-flex items-center gap-1.5 font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Google Maps Coordinates</span>
          </span>
        </div>
      </div>

      {/* Filter Tabs list */}
      <div className="flex flex-wrap gap-2.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 select-none overflow-x-auto scrollbar-none">
        {CATEGORIES.map(category => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-3 px-5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-2.5 shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#073B3A] to-[#0d5c5a] text-white shadow-lg shadow-teal-950/15 scale-[1.03] border border-teal-600/20'
                  : 'text-slate-700 bg-white hover:text-[#073B3A] hover:bg-slate-50 border border-slate-200/60 shadow-2xs'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-slate-500'}`} />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Q&A Accordion section & Branch location maps column */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Accordions containing the 19 Q&As */}
        <div className="xl:col-span-7 space-y-4 text-left">
          <div className="p-4 py-3 bg-slate-100/60 rounded-2xl flex justify-between items-center border border-slate-200 select-none">
            <div className="text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wide">
              📋 លទ្ធផលសំណួរ-ចម្លើយដែលស្វែងរកឃើញ &bull; MATCHED ({filteredFaq.length} Items)
            </div>
            {filteredFaq.length > 0 && (
              <button 
                onClick={() => setExpandedId(expandedId === null ? filteredFaq[0].id : null)}
                className="text-xs font-bold text-teal-700 hover:text-teal-950 transition-colors cursor-pointer bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs"
              >
                {expandedId === null ? '🔔 ពង្រីកទាំងអស់' : '🔕 បង្រួញទាំងអស់'}
              </button>
            )}
          </div>

          <div className="space-y-3.5">
            {/* 2026-2027 Tuition Fee Table Section */}
            {(selectedCategory === 'all' || selectedCategory === 'fees') && !searchQuery && (
              <div id="tuition-fees-2026-2027-card" className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-50 text-[#073B3A] rounded-2xl">
                      <DollarSign className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-800 leading-tight">
                        តារាងតម្លៃសិក្សាផ្លូវការ ២០២៦-២០២៧
                      </h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        Official Tuition Fees 2026-2027 Table
                      </p>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <label className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-2xs inline-flex items-center gap-1.5 shrink-0 select-none animate-none">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'កំពុងផ្ទុកឡើង...' : 'បញ្ចូលរូបភាពតារាងតម្លៃ'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        disabled={isUploading}
                        onChange={handleTuitionUpload} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>

                {uploadError && (
                  <div className="bg-rose-50 border border-rose-150 p-3 rounded-2xl text-xs font-bold text-rose-800 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Image display or placeholder */}
                {tuitionImage ? (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-150 bg-slate-50 group shadow-3xs">
                      <img 
                        src={tuitionImage} 
                        alt="តារាងតម្លៃសិក្សាឆ្នាំ ២០២៦-២០២៧" 
                        className="w-full max-h-[600px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                      <a 
                        href={`${tuitionImage}${tuitionImage.includes('?') ? '&' : '?'}preview=true`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1.5 font-bold text-[#073B3A] hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>មើលរូបភាពទំហំធំ (Open Original Image)</span>
                      </a>
                      
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={handleClearTuitionImage}
                          className="text-rose-650 hover:text-rose-800 font-extrabold transition cursor-pointer flex items-center gap-1"
                        >
                          លុបរូបភាពនេះចេញ (Delete Table Image)
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center space-y-4 bg-slate-50/50">
                    <div className="mx-auto w-16 h-16 bg-slate-100 text-slate-405 rounded-full flex items-center justify-center">
                      <Image className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-700">មិនទាន់មានរូបភាពតារាងតម្លៃឡើយ</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        {isAdmin 
                          ? 'សូមចុចប៊ូតុងខាងលើ ដើម្បីផ្ទុកឡើងរូបភាពតារាងតម្លៃសិក្សាផ្លូវការ ២០២៦-២០២៧ ថ្មីមួយដើម្បីឱ្យបុគ្គលិករបស់លោកអ្នកអាចមើលឃើញ និងប្រើប្រាស់បាន។'
                          : 'មិនទាន់មានរូបភាពតារាងតម្លៃសិក្សា ២០២៦-២០២៧ ត្រូវបានបញ្ចូលដោយអ្នកគ្រប់គ្រងនៅក្នុងប្រព័ន្ធនៅឡើយទេ។'}
                      </p>
                    </div>
                    {isAdmin && (
                      <div className="inline-flex items-center justify-center">
                        <label className="bg-white hover:bg-slate-50 border border-slate-250 text-[#073B3A] font-black text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-2xs inline-flex items-center gap-1.5 shrink-0 select-none animate-none">
                          <Upload className="w-3.5 h-3.5 text-[#073B3A]" />
                          <span>ផ្ទុកឡើងឥឡូវនេះ (Upload Image Now)</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            disabled={isUploading}
                            onChange={handleTuitionUpload} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tuition Calculator Section */}
            {(selectedCategory === 'all' || selectedCategory === 'fees') && !searchQuery && (
              <div id="tuition-calculator-card" className="bg-gradient-to-br from-slate-50 to-teal-50/20 border border-teal-500/10 rounded-3xl p-6 sm:p-8 space-y-6 mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-teal-500/15">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#073B3A] text-white rounded-2xl shadow-xs">
                      <Calculator className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-800 leading-tight">
                        គណនាតម្លៃសិក្សាព្យាករណ៍ និងការបញ្ចុះតម្លៃ ២០២៦-២០២៧
                      </h3>
                      <p className="text-xs text-slate-450 font-bold uppercase tracking-wider mt-0.5">
                        Tuition Fees & Discounts Estimate Calculator 2026-2027
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={handleAddStudent}
                    className="bg-[#073B3A] hover:bg-teal-900 active:scale-95 text-white font-extrabold text-xs px-4.5 py-3 rounded-xl transition shadow-2xs inline-flex items-center gap-2 select-none cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>បន្ថែមសិស្ស (Add Student)</span>
                  </button>
                </div>

                {/* Main grid columns */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left block: Students list editor */}
                  <div className="lg:col-span-7 space-y-4">
                    {calcStudents.map((student, idx) => {
                      const selectedProgram = TUITION_PROGRAMS.find(p => p.id === student.programId) || TUITION_PROGRAMS[0];
                      
                      return (
                        <div 
                          key={student.id}
                          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-3xs relative space-y-4 transition-all duration-200 hover:border-teal-500/25"
                        >
                          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2 flex-grow">
                              <span className="text-[10px] bg-slate-100 text-slate-500 font-black px-2.5 py-1 rounded-lg">
                                #{idx + 1}
                              </span>
                              <input 
                                type="text"
                                value={student.name}
                                onChange={(e) => handleUpdateStudent(student.id, 'name', e.target.value)}
                                placeholder="ឈ្មោះសិស្ស (Student Name)"
                                className="font-bold text-sm text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-[#073B3A] focus:outline-none transition px-1 py-0.5 w-full max-w-[220px]"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              {calcStudents.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStudent(student.id)}
                                  className="text-rose-500 hover:text-rose-750 hover:bg-rose-50 p-1.5 rounded-lg transition cursor-pointer"
                                  title="លុបសិស្សនេះ (Delete this student)"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Student selection fields */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            {/* Grade selection */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-black text-slate-500 block uppercase tracking-wider">
                                ថ្នាក់/កម្រិតសិក្សា (Grade Level)
                              </label>
                              <select
                                value={student.programId}
                                onChange={(e) => handleUpdateStudent(student.id, 'programId', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:border-[#073B3A] focus:bg-white focus:outline-none transition-colors"
                              >
                                {TUITION_PROGRAMS.map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.nameKh}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Session selection */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-black text-slate-500 block uppercase tracking-wider">
                                ម៉ោងសិក្សា/វេន (Session/Schedule)
                              </label>
                              <select
                                value={student.sessionId}
                                onChange={(e) => handleUpdateStudent(student.id, 'sessionId', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:border-[#073B3A] focus:bg-white focus:outline-none transition-colors"
                              >
                                {selectedProgram.sessions.map(s => (
                                  <option key={s.id} value={s.id}>
                                    {s.nameKh}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Payment Period */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-black text-slate-500 block uppercase tracking-wider">
                                របៀបបង់ថ្លៃ (Billing Period)
                              </label>
                              <select
                                value={student.paymentPeriod}
                                onChange={(e) => handleUpdateStudent(student.id, 'paymentPeriod', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:border-[#073B3A] focus:bg-white focus:outline-none transition-colors"
                              >
                                <option value="yearly">បង់ប្រចាំឆ្នាំ (Yearly Plan)</option>
                                <option value="subAnnual">
                                  {selectedProgram.isKindergarten ? 'បង់ប្រចាំត្រីមាស (Term Plan)' : 'បង់ប្រចាំឆមាស (Semester Plan)'}
                                </option>
                                <option value="monthly">បង់ប្រចាំខែ (Monthly Plan)</option>
                              </select>
                            </div>

                            {/* Discount Percent */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-black text-slate-500 block uppercase tracking-wider">
                                ការបញ្ចុះតម្លៃ (Discount Promo)
                              </label>
                              <select
                                value={student.discountPercent}
                                onChange={(e) => handleUpdateStudent(student.id, 'discountPercent', Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:border-[#073B3A] focus:bg-white focus:outline-none transition-colors"
                              >
                                <option value="0">គ្មានការបញ្ចុះតម្លៃ (No Discount)</option>
                                <option value="5">ប្រូម៉ូសិនពិសេស (Special Promo) - បញ្ចុះតម្លៃ ៥% (5% Off)</option>
                                <option value="10">កូនទី២/ប្រូម៉ូសិន (Sibling 2nd Child / Promo) - បញ្ចុះតម្លៃ ១០% (10% Off)</option>
                                <option value="15">កូនទី៣/បង់មុន (Sibling 3rd Child / Early Bird) - បញ្ចុះតម្លៃ ១៥% (15% Off)</option>
                                <option value="20">កូនទី៤+/ករណីពិសេស (Sibling 4th+ Child / Special) - បញ្ចុះតម្លៃ ២០% (20% Off)</option>
                                <option value="30">អាហារូបករណ៍ (Scholarship) - បញ្ចុះតម្លៃ ៣០% (30% Off)</option>
                                <option value="50">ដៃគូសហការ (Partner) - បញ្ចុះតម្លៃ ៥០% (50% Off)</option>
                              </select>
                            </div>

                            {/* Options block */}
                            <div className="sm:col-span-2 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-slate-50 mt-1">
                              <label className="flex items-center gap-2 font-bold text-slate-600 cursor-pointer select-none">
                                <input 
                                  type="checkbox"
                                  checked={student.includesAdminFee}
                                  onChange={(e) => handleUpdateStudent(student.id, 'includesAdminFee', e.target.checked)}
                                  className="w-4 h-4 rounded border-slate-300 text-[#073B3A] focus:ring-[#073B3A] cursor-pointer"
                                />
                                <span className="text-slate-500">រួមបញ្ចូលថ្លៃចុះឈ្មោះដំបូង/រដ្ឋបាល (Add $250 Admin Fee)</span>
                              </label>

                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-500">គុណនឹង (Multiply):</span>
                                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStudent(student.id, 'multiplyCount', Math.max(1, student.multiplyCount - 1))}
                                    className="px-2 py-1 hover:bg-slate-100 font-extrabold text-slate-600 transition cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="px-3 font-mono font-black text-slate-800 text-xs">{student.multiplyCount}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStudent(student.id, 'multiplyCount', Math.min(10, student.multiplyCount + 1))}
                                    className="px-2 py-1 hover:bg-slate-100 font-extrabold text-slate-600 transition cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="text-slate-400 font-bold">នាក់ (Student)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button 
                      type="button"
                      onClick={handleAddStudent}
                      className="w-full border-2 border-dashed border-teal-500/20 hover:border-teal-500/40 text-[#073B3A] bg-white hover:bg-slate-50/50 font-black text-xs py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-3xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>បន្ថែមសិស្សម្នាក់ទៀត (Add Another Student)</span>
                    </button>
                  </div>

                  {/* Right block: Receipt Preview & Combined Summary */}
                  <div className="lg:col-span-5">
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden sticky top-4 flex flex-col">
                      
                      {/* Receipt Header styling */}
                      <div className="bg-[#073B3A] text-white px-5 py-4 text-center relative border-b border-teal-900">
                        <h4 className="font-black text-sm uppercase tracking-wide">
                          វិក្កយបត្រសិក្សាប៉ាន់ស្មាន
                        </h4>
                        <p className="text-[10px] text-teal-200/90 font-extrabold tracking-wider uppercase">
                          Estimated School Invoice Statement
                        </p>
                      </div>

                      {/* Receipt body */}
                      <div className="p-5 flex-grow space-y-4 text-left">
                        
                        {/* Student breakdowns lists */}
                        <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                          {studentBreakdowns.map((bd, idx) => {
                            const name = calcStudents[idx]?.name || `សិស្សទី ${idx + 1}`;
                            const count = calcStudents[idx]?.multiplyCount || 1;
                            
                            return (
                              <div key={idx} className="text-xs p-3 bg-slate-50/70 rounded-xl space-y-1 border border-slate-200/35">
                                <div className="flex items-center justify-between font-black text-slate-800">
                                  <span className="truncate max-w-[70%]">🧒 {name} {count > 1 ? `(x${count})` : ''}</span>
                                  <span className="font-mono text-slate-900 shrink-0">${bd.total.toLocaleString()}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 pl-4 space-y-0.5">
                                  <div className="flex justify-between">
                                    <span className="truncate text-[10.5px]">កម្រិត៖ {bd.programName}</span>
                                    <span className="font-semibold">${bd.basePrice}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="truncate">របៀបបង់៖ {bd.periodLabel}</span>
                                    <span>{bd.isKinder ? '(K)' : '(G)'}</span>
                                  </div>
                                  {bd.discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                      <span>បញ្ចុះតម្លៃ (-{calcStudents[idx]?.discountPercent}%):</span>
                                      <span className="font-mono">-${bd.discountAmount.toLocaleString()}</span>
                                    </div>
                                  )}
                                  {bd.adminFee > 0 && (
                                    <div className="flex justify-between text-teal-800 font-medium">
                                      <span>កម្រៃរដ្ឋបាល/ចុះឈ្មោះ៖</span>
                                      <span className="font-mono">+${bd.adminFee.toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Dashed separator */}
                        <div className="border-t border-dashed border-slate-250 my-1"></div>

                        {/* Combined Financial Table */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between text-slate-600 font-bold">
                            <span>ថ្លៃសិក្សាសរុប (Tuition Subtotal):</span>
                            <span className="font-mono text-slate-800">${totalsWithRiel.tuition.toLocaleString()}</span>
                          </div>

                          {totalsWithRiel.discounts > 0 && (
                            <div className="flex justify-between text-emerald-600 font-extrabold">
                              <span>សន្សំបានសរុប (Combined Savings):</span>
                              <span className="font-mono">-${totalsWithRiel.discounts.toLocaleString()}</span>
                            </div>
                          )}

                          <div className="flex justify-between text-slate-600 font-bold">
                            <span>កម្រៃរដ្ឋបាលសាលា (Combined Admin Fee):</span>
                            <span className="font-mono text-slate-800">${totalsWithRiel.adminFees.toLocaleString()}</span>
                          </div>

                          <div className="border-t border-slate-100 my-2 pt-2"></div>

                          {/* Grand Total display */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-end">
                              <span className="font-black text-[#073B3A] text-[11.5px] uppercase tracking-wide">សរុបត្រូវបង់ (GRAND TOTAL):</span>
                              <span className="font-black text-[#073B3A] text-2xl font-mono leading-none">
                                ${totalsWithRiel.grandTotal.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-500 font-bold pl-1.5 border-l-2 border-teal-600/30">
                              <span>សរុបជាប្រាក់រៀល (Khmer Riel):</span>
                              <span className="font-mono font-black text-slate-700">
                                ៛{totalsWithRiel.grandTotalRiel.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Copy + Print Options */}
                        <div className="grid grid-cols-2 gap-2 pt-2.5">
                          <button
                            type="button"
                            onClick={() => handleCopyCalcSummary(totalsWithRiel, studentBreakdowns)}
                            className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-extrabold text-[10.5px] py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-250 select-none"
                          >
                            {calcCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                <span className="text-emerald-700 font-black">បានចម្លង! (Copied)</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500 font-bold" />
                                <span>ចម្លងព័ត៌មាន (Copy)</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              window.print();
                            }}
                            className="bg-teal-50 hover:bg-teal-100 active:bg-teal-200 text-[#073B3A] font-extrabold text-[10.5px] py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-teal-150 select-none"
                          >
                            <span>បោះពុម្ព (Print/PDF)</span>
                          </button>
                        </div>

                        {/* Footnote information badge */}
                        <div className="bg-slate-50 text-[10px] text-slate-500 leading-relaxed p-3 rounded-xl border border-slate-150 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <p>
                            អត្រាប្តូរប្រាក់ប៉ាន់ស្មាន <b>$1 = 4,100 រៀល</b>។ តម្លៃនេះសម្រាប់ការគណនាគ្រោងទុក និងជួយសម្រួលការពិភាក្សាជាមួយអាណាព្យាបាលប៉ុណ្ណោះ។
                          </p>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {filteredFaq.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-slate-300 space-y-3">
                <div className="mx-auto w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 animate-spin" />
                </div>
                <h3 className="text-sm font-black text-slate-705">មិនមានទិន្នន័យស្របគ្នាត្រូវបានរកឃើញឡើយ</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  សូមព្យាយាមវាយបញ្ចូលពាក្យគន្លឹះផ្សេងទៀតដូចជា <b>«ថ្លៃសិក្សា»</b>, <b>«សៀវភៅ»</b>, <b>«ធានារ៉ាប់រង»</b>, <b>«អាហារ»</b> ឬ <b>«កាលវិភាគ»</b>។
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="px-4 py-2 bg-[#073B3A] text-white text-xs font-black rounded-xl hover:bg-teal-850"
                >
                  បង្ហាញទាំងអស់ឡើងវិញ
                </button>
              </div>
            ) : (
              filteredFaq.map((item, index) => {
                const isExpanded = expandedId === item.id;
                
                return (
                  <div 
                    key={item.id} 
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isExpanded 
                        ? 'border-teal-500/40 shadow-md ring-1 ring-teal-500/10' 
                        : 'border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Header trigger button */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="w-full text-left p-5 sm:p-6 flex items-start gap-4.5 cursor-pointer focus:outline-none transition-colors hover:bg-slate-50/50"
                    >
                      <div className={`p-3 rounded-2xl shrink-0 transition-all duration-200 ${
                        isExpanded ? 'bg-[#073B3A]/10 text-[#073B3A] scale-110 shadow-sm' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <HelpCircle className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      
                      <div className="flex-grow space-y-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] font-extrabold font-mono tracking-wider bg-slate-105 text-slate-600 px-2.5 py-1 rounded-lg">
                            Q-{item.id}
                          </span>
                          <span className="text-[9.5px] font-black uppercase tracking-widest bg-teal-50/85 text-teal-800 px-2.5 py-1 rounded-lg border border-teal-100/50">
                            {item.category.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 font-sans leading-relaxed tracking-normal">
                          {item.q}
                        </h4>
                        {item.q_en && (
                          <p className="text-xs sm:text-sm text-slate-500 italic font-sans font-medium block leading-relaxed mt-1">
                            {item.q_en}
                          </p>
                        )}
                      </div>
                      
                      <div className="shrink-0 pt-2">
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                          isExpanded ? 'transform rotate-180 text-teal-700' : ''
                        }`} />
                      </div>
                    </button>

                    {/* Collapsible Answer block */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-6 sm:p-8 pt-0 border-t border-slate-100 bg-slate-50/40 space-y-5">
                            
                            {/* Rich text body conversion with clean layout */}
                            <div className="text-[14.5px] sm:text-[16px] text-slate-800 leading-relaxed font-sans whitespace-pre-line space-y-3.5 mt-5 text-left font-medium">
                              {item.a.split('\n\n').map((paragraph, pIdx) => {
                                // Match bold keywords **text**
                                const renderParagraph = (text: string) => {
                                  const parts = text.split(/(\*\*.*?\*\*)/g);
                                  return parts.map((part, partIdx) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                      return <strong key={partIdx} className="font-extrabold text-[#073B3A] bg-teal-55 px-1 rounded-md border-b-2 border-teal-500/20">{part.slice(2, -2)}</strong>;
                                    }
                                    return part;
                                  });
                                };
                                return (
                                  <p key={pIdx}>
                                    {renderParagraph(paragraph)}
                                  </p>
                                );
                              })}
                            </div>

                            {/* Action Row - Copy Answer & Dynamic features */}
                            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                              <span className="text-xs text-slate-450 italic font-medium">
                                Western International School • Campus Policy Advisory Support Suite
                              </span>

                              <div className="flex items-center gap-2">
                                {/* Auto copy button with real action indicator */}
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleCopy(item.id, item.a); }}
                                  className={`p-2.5 px-4 rounded-xl text-xs sm:text-sm font-black border transition-all duration-150 cursor-pointer flex items-center gap-2 ${
                                    copiedId === item.id
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'
                                      : 'bg-white hover:bg-slate-50 border-slate-200 text-[#073B3A] shadow-xs'
                                  }`}
                                >
                                  {copiedId === item.id ? (
                                    <>
                                      <Check className="w-4 h-4 stroke-[3]" />
                                      <span>ចម្លងជោគជ័យ! (Copied Telegram Friendly)</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-4 h-4 text-teal-600" />
                                      <span>ចម្លងសារព័ត៌មាន (Copy to Telegram Channel)</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side Column: Branch Locations & Contacts lookup card mapped visually */}
        <div className="xl:col-span-5 space-y-6 text-left">
          
          {/* Branch Overview lookup widget */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-7 space-y-6 transition-all duration-300 hover:border-slate-350">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-extrabold text-[#073B3A] flex items-center gap-2 uppercase tracking-wide font-sans">
                  <MapPin className="w-5 h-5 text-emerald-600 animate-bounce shrink-0" />
                  <span>បញ្ជីសាខាទាំង ១៥ និងផែនទីទីតាំង</span>
                </h3>
                <p className="text-xs text-slate-550 font-bold uppercase mt-1">
                  WIS Campuses & Google Maps Coordinates
                </p>
              </div>
              <span className="bg-amber-100/95 text-amber-950 border border-amber-200/60 text-xs font-black px-3 py-1.5 rounded-xl uppercase shrink-0">
                15 CAMPUSES
              </span>
            </div>

            {/* Grid of the 15 branch badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
              {branchDetails.map(branch => {
                const isFocused = selectedBranch === branch.id;
                return (
                  <div
                    key={branch.id}
                    onClick={() => setSelectedBranch(isFocused ? null : branch.id)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 relative ${
                      isFocused 
                        ? 'bg-teal-50/60 border-teal-500/50 shadow-sm scale-[1.01]' 
                        : 'bg-slate-50/50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-300/35">
                        {branch.code}
                      </span>
                      <a
                        href={branch.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-100 hover:text-teal-850 transition"
                        title="បើកទីតាំងផែនទី (Open Google Map)"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    
                    <div className="mt-2.5 space-y-1">
                      <h4 className="text-[13.5px] font-bold text-slate-900 leading-tight">
                        {branch.name}
                      </h4>
                      <p className="text-xs text-teal-850 font-extrabold flex items-center gap-1">
                        <span>🎯</span>
                        <span>{branch.grades}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map Info Box */}
            <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl space-y-1.5 text-xs text-slate-600 leading-relaxed select-none">
              <p className="font-extrabold text-slate-750 flex items-center gap-1.5 text-sm">
                <span>📍</span>
                <span>របៀបប្រើប្រាស់ផែនទីឆ្លាតវៃ៖</span>
              </p>
              <p>ចុចលើរូបសញ្ញា <ExternalLink className="w-3.5 h-3.5 inline text-teal-600" /> ដើម្បីបើកកូអរដោនេច្បាស់លាស់ពី Google Maps របស់សាខានីមួយៗ ដើម្បីផ្ញើទៅអាណាព្យាបាលសិស្ស ដែលចង់អញ្ជើញមកសួរព័ត៌មានដោយផ្ទាល់នៅតាមសាខានានា។</p>
            </div>
          </div>

          {/* Sibling Discounts Table Visualizer */}
          <div className="bg-gradient-to-br from-[#052524] to-slate-950 border border-teal-500/30 text-white rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden select-none">
            <div className="absolute top-0 right-0 w-44 h-44 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-4.5">
              <div className="p-3.5 bg-gradient-to-br from-teal-900/80 to-teal-950/90 border border-teal-600/40 text-amber-300 rounded-2xl shadow-md">
                <BadgePercent className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-lg md:text-xl lg:text-2xl font-black text-amber-305 font-sans uppercase tracking-wide leading-tight">
                  ការបញ្ចុះតម្លៃបងប្អូនបង្កើត (SIBLING PROMOTION)
                </h4>
                <p className="text-xs sm:text-sm text-teal-300/90 font-bold uppercase tracking-wider mt-1 font-mono">
                  OFFICIAL SCHOOL ADVISORY DISCOUNT RATE
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4.5 bg-white/5 border border-white/10 hover:border-teal-500/20 rounded-2xl transition duration-200">
                <div className="flex items-center gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-teal-800 text-teal-100 flex items-center justify-center font-black text-sm border border-teal-500/30">២</span>
                  <span className="text-base sm:text-lg font-bold text-slate-100">កូនទី២ ក្នុងគ្រួសារ (2nd Child)</span>
                </div>
                <span className="text-base sm:text-lg md:text-xl font-black text-[#FFD700] tracking-wide">-១០% DISCOUNT</span>
              </div>

              <div className="flex items-center justify-between p-4.5 bg-white/5 border border-white/10 hover:border-teal-500/20 rounded-2xl transition duration-200">
                <div className="flex items-center gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-teal-800 text-teal-100 flex items-center justify-center font-black text-sm border border-teal-500/30">៣</span>
                  <span className="text-base sm:text-lg font-bold text-slate-100">កូនទី៣ ក្នុងគ្រួសារ (3rd Child)</span>
                </div>
                <span className="text-base sm:text-lg md:text-xl font-black text-[#FFD700] tracking-wide">-១៥% DISCOUNT</span>
              </div>

              <div className="flex items-center justify-between p-4.5 bg-white/5 border border-white/10 hover:border-teal-500/20 rounded-2xl transition duration-200">
                <div className="flex items-center gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-teal-800 text-teal-100 flex items-center justify-center font-black text-sm border border-teal-500/30">៤+</span>
                  <span className="text-base sm:text-lg font-bold text-slate-100">កូនទី៤ ឡើងទៅ (4th+ Child)</span>
                </div>
                <span className="text-base sm:text-lg md:text-xl font-black text-[#FFD700] tracking-wide">-២០% DISCOUNT</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 text-center leading-relaxed italic select-none font-semibold">
              *ការបញ្ចុះតម្លៃផ្តល់ជូនលើថ្លៃសិក្សាដែលបង់ជា ឆ្នាំ, ឆមាស ឬជាត្រីមាស សម្រាប់ឆ្នាំសិក្សា ២០២៦-២០២៧។
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
