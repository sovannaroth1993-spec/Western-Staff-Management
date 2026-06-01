/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Search, PlusCircle, Edit, Trash2, X, Check, AlertTriangle, 
  User, HeartPulse, FileText, Phone, Landmark, Signpost, HelpCircle, Download, Upload, Eye,
  Send, Share2, Key, MessageSquare, AlertCircle, Settings2, Info
} from 'lucide-react';
import { StudentInsurance, InsuranceStatus } from '../types';

const DEFAULT_INSURANCES: StudentInsurance[] = [
  {
    id: 'WIS-INS-001',
    studentName: 'សុក សាន (SOK San)',
    studentId: 'WIS-STU-1025',
    gender: 'ប្រុស',
    dob: '2012-05-14',
    gradeClass: 'Grade 8A',
    academicYear: '2025-2026',
    nationality: 'ខ្មែរ (Khmer)',
    photo: '',
    
    guardianName: 'សុកជា (SOK Chea)',
    guardianRelationship: 'ឪពុក (Father)',
    guardianPhone: '012 345 678',
    guardianAddress: 'ផ្ទះលេខ ២៤ ផ្លូវលេខ ៣៧១ សង្កាត់ចាក់អង្រែលើ ខណ្ឌមានជ័យ ភ្នំពេញ',
    guardianOccupation: 'អាជីវករ (Merchant)',
    
    policyNumber: 'WIS-FORTE-2026-9042',
    provider: 'Forte Insurance',
    coverageType: 'គ្រោះថ្នាក់បុគ្គល និងការព្យាបាលជំងឺ (Personal Accident & Medical)',
    effectiveDate: '2025-09-01',
    expiryDate: '2026-08-31',
    premiumAmount: 85,
    
    emergencyName: 'សុកជា (SOK Chea)',
    emergencyRelationship: 'ឪពុក (Father)',
    emergencyPhone: '012 345 678',
    emergencyAltPhone: '098 765 432',
    
    bloodType: 'O',
    allergies: 'គ្មាន (None)',
    medicalConditions: 'គ្មាន (None)',
    currentMedications: 'គ្មាន (None)',
    
    claimDate: '',
    claimDescription: '',
    claimPlace: '',
    claimHospital: '',
    claimExpenseAmount: 0,
    claimDocuments: '',
    
    studentSigned: true,
    studentSignatureName: 'សុក សាន',
    parentSigned: true,
    parentSignatureName: 'សុកជា',
    schoolRepresentativeSigned: true,
    schoolRepresentativeName: 'ហេង សំបូរ',
    declarationDate: '2025-08-25',
    
    receivedBy: 'លី សូដា',
    dateReceived: '2025-08-25',
    claimStatus: 'Approved',
    officeRemarks: 'ឯកសារគ្រប់គ្រាន់ ការបង់បុព្វលាភធានារ៉ាប់រងបានបញ្ចប់រួចរាល់។'
  },
  {
    id: 'WIS-INS-002',
    studentName: 'ចាន់ ស្រីលក្ខណ៍ (CHAN Srey Leak)',
    studentId: 'WIS-STU-1049',
    gender: 'ស្រី',
    dob: '2014-08-20',
    gradeClass: 'Grade 6B',
    academicYear: '2025-2026',
    nationality: 'ខ្មែរ (Khmer)',
    photo: '',
    
    guardianName: 'ចាន់ ធារ៉ា (CHAN Theara)',
    guardianRelationship: 'ម្តាយ (Mother)',
    guardianPhone: '016 778 991',
    guardianAddress: 'ផ្ទះលេខ ១៥បេ ផ្លូវបេតុង សង្កាត់ព្រៃស ខណ្ឌដង្កោ ភ្នំពេញ',
    guardianOccupation: 'បុគ្គលិកក្រុមហ៊ុន (Office Staff)',
    
    policyNumber: 'WIS-AIA-2026-8812',
    provider: 'AIA Cambodia',
    coverageType: 'គ្រោះថ្នាក់បុគ្គលជាចម្បង (Personal Accident Only)',
    effectiveDate: '2025-09-01',
    expiryDate: '2026-08-31',
    premiumAmount: 60,
    
    emergencyName: 'ចាន់ ធារ៉ា (CHAN Theara)',
    emergencyRelationship: 'ម្តាយ (Mother)',
    emergencyPhone: '016 778 991',
    emergencyAltPhone: '012 990 112',
    
    bloodType: 'AB',
    allergies: 'អាឡែកស៊ីត្រីសមុទ្រ (Seafood Allergy)',
    medicalConditions: 'ហឺតកម្រិតស្រាល (Mild Asthma)',
    currentMedications: 'បាញ់ថ្នាំ Albuterol ពេលហត់',
    
    claimDate: '2026-05-18',
    claimDescription: 'រអិលដួលគ្រិចកជើងនៅទីធ្លារត់លេងក្នុងម៉ោងកីឡា (Slipped and twisted ankle in playground during sports)',
    claimPlace: 'ទីធ្លារត់លេងសាលា (School Playground)',
    claimHospital: 'មន្ទីរពេទ្យព្រះកុសុមៈ (Kossamak Hospital)',
    claimExpenseAmount: 125,
    claimDocuments: 'medical_receipt_125.pdf, x_ray_report.jpg',
    
    studentSigned: true,
    studentSignatureName: 'ចាន់ ស្រីលក្ខណ៍',
    parentSigned: true,
    parentSignatureName: 'ចាន់ ធារ៉ា',
    schoolRepresentativeSigned: true,
    schoolRepresentativeName: 'ហេង សំបូរ',
    declarationDate: '2025-08-28',
    
    receivedBy: 'លី សូដា',
    dateReceived: '2026-05-19',
    claimStatus: 'Pending',
    officeRemarks: 'កំពុងវាយតម្លៃសំណងពី AIA សម្រាប់ការចំណាយព្យាបាលចំនួន $125។'
  },
  {
    id: 'WIS-INS-003',
    studentName: 'ហេង ដាវីត (HENG Davit)',
    studentId: 'WIS-STU-1090',
    gender: 'ប្រុស',
    dob: '2010-11-02',
    gradeClass: 'Grade 10A',
    academicYear: '2025-2026',
    nationality: 'ខ្មែរ (Khmer)',
    photo: '',
    
    guardianName: 'ហេង សំណាង (HENG Samnang)',
    guardianRelationship: 'ឪពុក (Father)',
    guardianPhone: '093 456 123',
    guardianAddress: 'បុរីពិភពថ្មីចំការដូង ផ្ទះលេខ ៩២ ភ្នំពេញ',
    guardianOccupation: 'វិស្វករ (Engineer)',
    
    policyNumber: 'WIS-PRU-2026-1023',
    provider: 'Prudential Cambodia',
    coverageType: 'ការព្យាបាលពេញលេញ និងសុខភាព (Comprehensive Medical & Health)',
    effectiveDate: '2025-09-01',
    expiryDate: '2026-08-31',
    premiumAmount: 120,
    
    emergencyName: 'ហេង សំណាង (HENG Samnang)',
    emergencyRelationship: 'ឪពុក (Father)',
    emergencyPhone: '093 456 123',
    emergencyAltPhone: '015 224 466',
    
    bloodType: 'A',
    allergies: 'គ្មាន (None)',
    medicalConditions: 'គ្មាន (None)',
    currentMedications: 'គ្មាន (None)',
    
    claimDate: '',
    claimDescription: '',
    claimPlace: '',
    claimHospital: '',
    claimExpenseAmount: 0,
    claimDocuments: '',
    
    studentSigned: true,
    studentSignatureName: 'ហេង ដាវីត',
    parentSigned: true,
    parentSignatureName: 'ហេង សំណាង',
    schoolRepresentativeSigned: true,
    schoolRepresentativeName: 'ហេង សំបូរ',
    declarationDate: '2025-08-20',
    
    receivedBy: 'លី សូដា',
    dateReceived: '2025-08-20',
    claimStatus: 'Approved',
    officeRemarks: 'កិច្ចសន្យាសកម្ម គ្មានប្រវត្តិកើតហេតុ/ទាមទារសំណងឆ្នាំនេះទេ'
  }
];

export default function StudentInsuranceManager() {
  const [insurances, setInsurances] = useState<StudentInsurance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<InsuranceStatus | 'All'>('All');
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'info' } | null>(null);

  // Form Modals Management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<StudentInsurance | null>(null);
  const [viewingPolicy, setViewingPolicy] = useState<StudentInsurance | null>(null);

  // States for Student Insurance Fields
  const [id, setId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [gender, setGender] = useState<'ប្រុស' | 'ស្រី' | 'Male' | 'Female'>('ប្រុស');
  const [dob, setDob] = useState('');
  const [gradeClass, setGradeClass] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [nationality, setNationality] = useState('ខ្មែរ (Khmer)');
  const [photo, setPhoto] = useState('');

  const [guardianName, setGuardianName] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianAddress, setGuardianAddress] = useState('');
  const [guardianOccupation, setGuardianOccupation] = useState('');

  const [policyNumber, setPolicyNumber] = useState('');
  const [provider, setProvider] = useState('Forte Insurance');
  const [coverageType, setCoverageType] = useState('គ្រោះថ្នាក់បុគ្គល និងការព្យាបាលជំងឺ (Personal Accident & Medical)');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [premiumAmount, setPremiumAmount] = useState(0);

  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyAltPhone, setEmergencyAltPhone] = useState('');

  const [bloodType, setBloodType] = useState('O');
  const [allergies, setAllergies] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');

  const [claimDate, setClaimDate] = useState('');
  const [claimDescription, setClaimDescription] = useState('');
  const [claimPlace, setClaimPlace] = useState('');
  const [claimHospital, setClaimHospital] = useState('');
  const [claimExpenseAmount, setClaimExpenseAmount] = useState(0);
  const [claimDocuments, setClaimDocuments] = useState('');

  const [studentSigned, setStudentSigned] = useState(true);
  const [studentSignatureName, setStudentSignatureName] = useState('');
  const [parentSigned, setParentSigned] = useState(true);
  const [parentSignatureName, setParentSignatureName] = useState('');
  const [schoolRepresentativeSigned, setSchoolRepresentativeSigned] = useState(true);
  const [schoolRepresentativeName, setSchoolRepresentativeName] = useState('');
  const [declarationDate, setDeclarationDate] = useState('');

  const [receivedBy, setReceivedBy] = useState('');
  const [dateReceived, setDateReceived] = useState('');
  const [claimStatus, setClaimStatus] = useState<InsuranceStatus>('Approved');
  const [officeRemarks, setOfficeRemarks] = useState('');

  // Telegram Integration States
  const [telegramBotToken, setTelegramBotToken] = useState(() => localStorage.getItem('wis_telegram_bot_token') || '');
  const [telegramChatId, setTelegramChatId] = useState(() => localStorage.getItem('wis_telegram_chat_id') || '');
  const [telegramSendStatus, setTelegramSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [telegramSendError, setTelegramSendError] = useState('');
  const [showTelegramPanel, setShowTelegramPanel] = useState(false);
  const [showTelegramSettings, setShowTelegramSettings] = useState(false);
  const [showTelegramPreview, setShowTelegramPreview] = useState(true);

  const handleSaveTelegramConfig = (token: string, chatId: string) => {
    setTelegramBotToken(token);
    setTelegramChatId(chatId);
    localStorage.setItem('wis_telegram_bot_token', token);
    localStorage.setItem('wis_telegram_chat_id', chatId);
  };

  const buildStudentTelegramText = (item: StudentInsurance) => {
    let text = `📋 <b>របាយការណ៍ធានារ៉ាប់រងសិស្ស - សាលាវេស្ទើនអន្តរជាតិ</b>\n`;
    text += `🆔 <b>លេខប័ណ្ណធានា៖</b> <code>${item.id}</code>\n`;
    text += `━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `👤 <b>ព័ត៌មានសិស្ស៖</b>\n`;
    text += `• ឈ្មោះសិស្ស៖ <b>${item.studentName}</b>\n`;
    text += `• អត្តសញ្ញាណសិស្ស (ID)៖ <b>${item.studentId}</b>\n`;
    text += `• ភេទ/ថ្នាក់៖ <b>${item.gender} / ${item.gradeClass}</b>\n`;
    text += `• ឆ្នាំសិក្សា៖ <b>${item.academicYear}</b>\n\n`;
    
    text += `🛡️ <b>ព័ត៌មានធានារ៉ាប់រង៖</b>\n`;
    text += `• លេខកិច្ចសន្យា៖ <code>${item.policyNumber}</code>\n`;
    text += `• ក្រុមហ៊ុនធានា៖ <b>${item.provider}</b>\n`;
    text += `• ប្រភេទធានា៖ <b>${item.coverageType}</b>\n`;
    text += `• ថ្ងៃផុតកំណត់៖ <b>${item.expiryDate}</b>\n`;
    text += `• តម្លៃបុព្វលាភ (Premium)៖ <b>$${item.premiumAmount} USD</b>\n\n`;

    text += `👨‍👩‍👦 <b>អាណាព្យាបាល៖</b>\n`;
    text += `• អាណាព្យាបាល៖ <b>${item.guardianName} (${item.guardianRelationship})</b>\n`;
    text += `• ទូរស័ព្ទ៖ <code>${item.guardianPhone}</code>\n\n`;

    text += `🏢 <b>ស្ថានភាពការិយាល័យ៖</b>\n`;
    const statusKm = item.claimStatus === 'Approved' ? 'បានយល់ព្រម' : item.claimStatus === 'Pending' ? 'កំពុងត្រួតពិនិត្យ' : item.claimStatus === 'Rejected' ? 'បដិសេធ' : 'គ្មាន';
    text += `• ស្ថានភាព៖ <b>${statusKm}</b>\n`;
    if (item.officeRemarks) {
      text += `• មតិចំណាំ៖ <i>${item.officeRemarks}</i>\n`;
    }
    text += `\n✍️ <i>របាយការណ៍បញ្ជូនដោយស្វ័យប្រវត្តិតាមរយៈ WIS Insurance System</i>`;
    return text;
  };

  const buildStudentTelegramTextPlain = (item: StudentInsurance) => {
    let text = `📋 របាយការណ៍ធានារ៉ាប់រងសិស្ស - សាលាវេស្ទើនអន្តរជាតិ\n`;
    text += `🆔 លេខប័ណ្ណធានា៖ ${item.id}\n`;
    text += `━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `👤 ព័ត៌មានសិស្ស៖\n`;
    text += `• ឈ្មោះសិស្ស៖ ${item.studentName}\n`;
    text += `• អត្តសញ្ញាណសិស្ស (ID)៖ ${item.studentId}\n`;
    text += `• ភេទ/ថ្នាក់៖ ${item.gender} / ${item.gradeClass}\n`;
    text += `• ឆ្នាំសិក្សា៖ ${item.academicYear}\n\n`;
    
    text += `🛡️ ព័ត៌មានធានារ៉ាប់រង៖\n`;
    text += `• លេខកិច្ចសន្យា៖ ${item.policyNumber}\n`;
    text += `• ក្រុមហ៊ុនធានា៖ ${item.provider}\n`;
    text += `• ប្រភេទគ្របដណ្តប់៖ ${item.coverageType}\n`;
    text += `• ថ្ងៃផុតកំណត់៖ ${item.expiryDate}\n`;
    text += `• តម្លៃបុព្វលាភ៖ $${item.premiumAmount} USD\n\n`;

    text += `👨‍👩‍👦 អាណាព្យាបាល៖\n`;
    text += `• អាណាព្យាបាល៖ ${item.guardianName} (${item.guardianRelationship})\n`;
    text += `• ទូរស័ព្ទ៖ ${item.guardianPhone}\n\n`;

    text += `🏢 ស្ថានភាពការិយាល័យ៖\n`;
    const statusKm = item.claimStatus === 'Approved' ? 'បានយល់ព្រម' : item.claimStatus === 'Pending' ? 'កំពុងត្រួតពិនិត្យ' : item.claimStatus === 'Rejected' ? 'បដិសេធ' : 'គ្មាន';
    text += `• ស្ថានភាព៖ ${statusKm}\n`;
    text += `\n✍️ របាយការណ៍បញ្ជូនដោយស្វ័យប្រវត្តិតាមរយៈ WIS Insurance System`;
    return text;
  };

  const buildSummaryTelegramText = (list: StudentInsurance[]) => {
    const total = list.length;
    const approved = list.filter(i => i.claimStatus === 'Approved').length;
    const pending = list.filter(i => i.claimStatus === 'Pending').length;
    const rejected = list.filter(i => i.claimStatus === 'Rejected').length;
    const totalPremiums = list.reduce((sum, item) => sum + (Number(item.premiumAmount) || 0), 0);

    let text = `🛡️ <b>របាយការណ៍សង្ខេបធានារ៉ាប់រងសិស្ស - សាលាវេស្ទើនអន្តរជាតិ</b>\n`;
    text += `📅 <b>កាលបរិច្ឆេទរបាយការណ៍៖</b> ${new Date().toLocaleDateString('km-KH') || new Date().toISOString().slice(0, 10)}\n`;
    text += `━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📊 <b>ស្ថិតិសរុប៖</b>\n`;
    text += `• សិស្សចុះឈ្មោះធានារ៉ាប់រងសរុប៖ <b>${total} នាក់</b>\n`;
    text += `• បានយល់ព្រម (Active)៖ <b>${approved} នាក់</b>\n`;
    text += `• កំពុងរង់ចាំ (Pending)៖ <b>${pending} នាក់</b>\n`;
    text += `• បានបដិសេធ (Rejected)៖ <b>${rejected} នាក់</b>\n`;
    text += `• ទឹកប្រាក់បុព្វលាភសរុប៖ <b>$${totalPremiums} USD</b>\n\n`;

    text += `📋 <b>បញ្ជីឈ្មោះសិស្ស និងក្រុមហ៊ុនធានារ៉ាប់រង៖</b>\n`;
    list.slice(0, 15).forEach((item, index) => {
      const statusEmoji = item.claimStatus === 'Approved' ? '🟢' : item.claimStatus === 'Pending' ? '🟡' : '🔴';
      text += `${index + 1}. <b>${item.studentName}</b> [ID: ${item.studentId}] (${item.gradeClass}) - ${item.provider} ${statusEmoji}\n`;
    });
    
    if (list.length > 15) {
      text += `• និងសិស្សផ្សេងទៀតចំនួន <b>${list.length - 15}</b> នាក់ទៀត...\n`;
    }

    text += `\n✍️ <i>របាយការណ៍សង្ខេបផ្ញើចេញពីប្រព័ន្ធគ្រប់គ្រង WIS Management System</i>`;
    return text;
  };

  const buildSummaryTelegramTextPlain = (list: StudentInsurance[]) => {
    const total = list.length;
    const approved = list.filter(i => i.claimStatus === 'Approved').length;
    const pending = list.filter(i => i.claimStatus === 'Pending').length;
    const rejected = list.filter(i => i.claimStatus === 'Rejected').length;
    const totalPremiums = list.reduce((sum, item) => sum + (Number(item.premiumAmount) || 0), 0);

    let text = `🛡️ របាយការណ៍សង្ខេបធានារ៉ាប់រងសិស្ស - សាលាវេស្ទើនអន្តរជាតិ\n`;
    text += `📅 កាលបរិច្ឆេទរបាយការណ៍៖ ${new Date().toLocaleDateString('km-KH') || new Date().toISOString().slice(0, 10)}\n`;
    text += `━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📊 ស្ថិតិសរុប៖\n`;
    text += `• សិស្សចុះឈ្មោះធានារ៉ាប់រងសរុប៖ ${total} នាក់\n`;
    text += `• បានយល់ព្រម (Active)៖ ${approved} នាក់\n`;
    text += `• កំពុងរង់ចាំ (Pending)៖ ${pending} នាក់\n`;
    text += `• បានបដិសេធ (Rejected)៖ ${rejected} នាក់\n`;
    text += `• ទឹកប្រាក់បុព្វលាភសរុប៖ $${totalPremiums} USD\n\n`;

    text += `📋 បញ្ជីឈ្មោះសិស្ស និងក្រុមហ៊ុនធានារ៉ាប់រង៖\n`;
    list.slice(0, 15).forEach((item, index) => {
      const statusEmoji = item.claimStatus === 'Approved' ? '🟢' : item.claimStatus === 'Pending' ? '🟡' : '🔴';
      text += `${index + 1}. ${item.studentName} [ID: ${item.studentId}] (${item.gradeClass}) - ${item.provider} ${statusEmoji}\n`;
    });
    
    if (list.length > 15) {
      text += `• និងសិស្សផ្សេងទៀតចំនួន ${list.length - 15} នាក់ទៀត...\n`;
    }

    text += `\n✍️ របាយការណ៍សង្ខេបផ្ញើចេញពីប្រព័ន្ធគ្រប់គ្រង WIS Management System`;
    return text;
  };

  const sendSummaryToTelegram = async () => {
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
      const htmlText = buildSummaryTelegramText(insurances);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramChatId.trim(),
          text: htmlText,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();
      if (response.ok && data.ok) {
        setTelegramSendStatus('success');
        showToastMsg('បានបញ្ជូនរបាយការណ៍សង្ខេបទៅ Telegram ដោយជោគជ័យ!', 'success');
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

  const sendSingleRecordToTelegram = async (item: StudentInsurance) => {
    if (!telegramBotToken.trim() || !telegramChatId.trim()) {
      setTelegramSendStatus('error');
      setTelegramSendError('សូមបញ្ចូល Telegram Bot Token និង Chat ID ជាមុនសិន!');
      setShowTelegramPanel(true);
      setShowTelegramSettings(true);
      return;
    }

    setTelegramSendStatus('sending');
    setTelegramSendError('');

    try {
      const url = `https://api.telegram.org/bot${telegramBotToken.trim()}/sendMessage`;
      const htmlText = buildStudentTelegramText(item);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramChatId.trim(),
          text: htmlText,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();
      if (response.ok && data.ok) {
        setTelegramSendStatus('success');
        showToastMsg(`បានបញ្ជូនទិន្នន័យរបស់ ${item.studentName} ទៅ Telegram ដោយជោគជ័យ!`, 'success');
        setTimeout(() => {
          setTelegramSendStatus('idle');
        }, 3000);
      } else {
        setTelegramSendStatus('error');
        setTelegramSendError(data.description || 'ការផ្ញើសារបានបរាជ័យ។');
      }
    } catch (err: any) {
      setTelegramSendStatus('error');
      setTelegramSendError(err.message || 'មិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេ Telegram បានទេ!');
    }
  };

  // Initial Data Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wis_student_insurances');
      if (saved) {
        setInsurances(JSON.parse(saved));
      } else {
        setInsurances(DEFAULT_INSURANCES);
        localStorage.setItem('wis_student_insurances', JSON.stringify(DEFAULT_INSURANCES));
      }
    } catch (err) {
      console.error('Failed to load student insurances', err);
      setInsurances(DEFAULT_INSURANCES);
    }
  }, []);

  // Instant Auto Sync helper
  const saveAndSyncInsurances = (updated: StudentInsurance[]) => {
    setInsurances(updated);
    localStorage.setItem('wis_student_insurances', JSON.stringify(updated));
  };

  const showToastMsg = (msg: string, type: 'success' | 'danger' | 'info') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Auto incremental form key generator
  const openAddModal = () => {
    setEditingPolicy(null);
    setViewingPolicy(null);
    
    const nextSeqNum = insurances.length > 0 
      ? Math.max(...insurances.map(i => {
          const m = i.id.match(/\d+$/);
          return m ? parseInt(m[0]) : 0;
        })) + 1 
      : 1;
    const formatted = String(nextSeqNum).padStart(3, '0');
    
    setId(`WIS-INS-${formatted}`);
    setStudentName('');
    setStudentId('');
    setGender('ប្រុស');
    setDob('');
    setGradeClass('');
    setAcademicYear('2025-2026');
    setNationality('ខ្មែរ (Khmer)');
    setPhoto('');
    
    setGuardianName('');
    setGuardianRelationship('');
    setGuardianPhone('');
    setGuardianAddress('');
    setGuardianOccupation('');
    
    setPolicyNumber(`POL-FORTE-${Math.floor(100000 + Math.random() * 900000)}`);
    setProvider('Forte Insurance');
    setCoverageType('គ្រោះថ្នាក់បុគ្គល និងការព្យាបាលជំងឺ (Personal Accident & Medical)');
    setEffectiveDate(new Date().toISOString().split('T')[0]);
    // 1 Year expiry automatically setup
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setExpiryDate(nextYear.toISOString().split('T')[0]);
    setPremiumAmount(85);
    
    setEmergencyName('');
    setEmergencyRelationship('');
    setEmergencyPhone('');
    setEmergencyAltPhone('');
    
    setBloodType('O');
    setAllergies('');
    setMedicalConditions('');
    setCurrentMedications('');
    
    setClaimDate('');
    setClaimDescription('');
    setClaimPlace('');
    setClaimHospital('');
    setClaimExpenseAmount(0);
    setClaimDocuments('');
    
    setStudentSigned(true);
    setStudentSignatureName('');
    setParentSigned(true);
    setParentSignatureName('');
    setSchoolRepresentativeSigned(true);
    setSchoolRepresentativeName('ហេង សំបូរ (នាយកសាលា)');
    setDeclarationDate(new Date().toISOString().split('T')[0]);
    
    setReceivedBy('លី សូដា (រដ្ឋបាល)');
    setDateReceived(new Date().toISOString().split('T')[0]);
    setClaimStatus('Approved');
    setOfficeRemarks('សំណុំឯកសារត្រូវបានរួមបញ្ចូលស្វ័យប្រវត្តិ។');
    
    setIsModalOpen(true);
  };

  const openEditModal = (item: StudentInsurance) => {
    setEditingPolicy(item);
    setViewingPolicy(null);
    
    setId(item.id);
    setStudentName(item.studentName);
    setStudentId(item.studentId);
    setGender(item.gender);
    setDob(item.dob);
    setGradeClass(item.gradeClass);
    setAcademicYear(item.academicYear);
    setNationality(item.nationality);
    setPhoto(item.photo || '');
    
    setGuardianName(item.guardianName);
    setGuardianRelationship(item.guardianRelationship);
    setGuardianPhone(item.guardianPhone);
    setGuardianAddress(item.guardianAddress);
    setGuardianOccupation(item.guardianOccupation);
    
    setPolicyNumber(item.policyNumber);
    setProvider(item.provider);
    setCoverageType(item.coverageType);
    setEffectiveDate(item.effectiveDate);
    setExpiryDate(item.expiryDate);
    setPremiumAmount(item.premiumAmount);
    
    setEmergencyName(item.emergencyName);
    setEmergencyRelationship(item.emergencyRelationship);
    setEmergencyPhone(item.emergencyPhone);
    setEmergencyAltPhone(item.emergencyAltPhone || '');
    
    setBloodType(item.bloodType);
    setAllergies(item.allergies);
    setMedicalConditions(item.medicalConditions);
    setCurrentMedications(item.currentMedications);
    
    setClaimDate(item.claimDate || '');
    setClaimDescription(item.claimDescription || '');
    setClaimPlace(item.claimPlace || '');
    setClaimHospital(item.claimHospital || '');
    setClaimExpenseAmount(item.claimExpenseAmount || 0);
    setClaimDocuments(item.claimDocuments || '');
    
    setStudentSigned(item.studentSigned);
    setStudentSignatureName(item.studentSignatureName || '');
    setParentSigned(item.parentSigned);
    setParentSignatureName(item.parentSignatureName || '');
    setSchoolRepresentativeSigned(item.schoolRepresentativeSigned);
    setSchoolRepresentativeName(item.schoolRepresentativeName || '');
    setDeclarationDate(item.declarationDate);
    
    setReceivedBy(item.receivedBy);
    setDateReceived(item.dateReceived);
    setClaimStatus(item.claimStatus);
    setOfficeRemarks(item.officeRemarks || '');
    
    setIsModalOpen(true);
  };

  const openViewOnlyModal = (item: StudentInsurance) => {
    setViewingPolicy(item);
  };

  // Submit and Save record (Auto)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim() || !studentId.trim() || !policyNumber.trim() || !guardianPhone.trim()) {
      showToastMsg('សូមបំពេញព័ត៌មានដែលចាំបាច់ដាច់ខាត (ឈ្មោះពេញ លេខសម្គាល់សិស្ស ប័ណ្ណធានា និងទូរស័ព្ទ)', 'danger');
      return;
    }

    const payload: StudentInsurance = {
      id,
      studentName,
      studentId: studentId.toUpperCase().trim(),
      gender,
      dob,
      gradeClass,
      academicYear,
      nationality,
      photo,
      
      guardianName,
      guardianRelationship,
      guardianPhone,
      guardianAddress,
      guardianOccupation,
      
      policyNumber,
      provider,
      coverageType,
      effectiveDate,
      expiryDate,
      premiumAmount,
      
      emergencyName,
      emergencyRelationship,
      emergencyPhone,
      emergencyAltPhone,
      
      bloodType,
      allergies: allergies || 'គ្មាន (None)',
      medicalConditions: medicalConditions || 'គ្មាន (None)',
      currentMedications: currentMedications || 'គ្មាន (None)',
      
      claimDate,
      claimDescription,
      claimPlace,
      claimHospital,
      claimExpenseAmount,
      claimDocuments,
      
      studentSigned,
      studentSignatureName: studentSignatureName || studentName.split(' ')[0],
      parentSigned,
      parentSignatureName: parentSignatureName || guardianName,
      schoolRepresentativeSigned,
      schoolRepresentativeName,
      declarationDate,
      
      receivedBy,
      dateReceived,
      claimStatus,
      officeRemarks
    };

    if (editingPolicy) {
      // update
      const updated = insurances.map(ins => ins.id === editingPolicy.id ? payload : ins);
      saveAndSyncInsurances(updated);
      showToastMsg(`ព័ត៌មានធានារ៉ាប់រងសិស្ស ${payload.studentName} ត្រូវបានកែប្រែនឹងកត់ត្រាស្វ័យប្រវត្ត (Auto-Saved)`, 'success');
    } else {
      // create
      const exists = insurances.some(ins => ins.id === payload.id);
      if (exists) {
        showToastMsg(`កូដសម្គាល់ធានារ៉ាប់រង "${payload.id}" នេះមានរួចរាល់ហើយក្នុងប្រព័ន្ធ។`, 'danger');
        return;
      }
      const updated = [payload, ...insurances];
      saveAndSyncInsurances(updated);
      showToastMsg(`បានបង្កើតទម្រង់ធានារ៉ាប់រងសិស្សថ្មី [${payload.id}] រួចរាល់ និងបានកត់ត្រាស្វ័យប្រវត្ត!`, 'success');
    }

    setIsModalOpen(false);
  };

  // Delete insurance record
  const handleDeleteRecord = (recordId: string) => {
    const isConfirmed = window.confirm(`តើលោកអ្នកប្រាកដជាចង់លុបចោលទិន្នន័យធានារ៉ាប់រងកូដ [${recordId}] នេះមែនទេ?\nរាល់ការផ្លាស់ប្តូរនឹងធ្វើការកត់ត្រាស្វ័យប្រវត្តិ!`);
    if (!isConfirmed) return;

    const remaining = insurances.filter(ins => ins.id !== recordId);
    saveAndSyncInsurances(remaining);
    showToastMsg(`បានលុបទម្រង់ធានារ៉ាប់រង [${recordId}] ចេញពីប្រព័ន្ធរួចរាល់!`, 'info');
  };

  // Restore defaults
  const handleResetDefaults = () => {
    const check = window.confirm('តើអ្នកចង់កំណត់ឡើងវិញ ទៅកាន់ទិន្នន័យគំរូធានារ៉ាប់រងដើមរបស់សាលាមែនទេ?');
    if (!check) return;

    saveAndSyncInsurances(DEFAULT_INSURANCES);
    showToastMsg('បានកំណត់ឡើងវិញនូវប្រព័ន្ធធានារ៉ាប់រងសិស្សគំរូរួចរាល់!', 'success');
  };

  // Stats
  const totalCount = insurances.length;
  const approvedClaimsCount = insurances.filter(ins => ins.claimStatus === 'Approved').length;
  const pendingClaimsCount = insurances.filter(ins => ins.claimStatus === 'Pending').length;
  const rejectedClaimsCount = insurances.filter(ins => ins.claimStatus === 'Rejected').length;
  const totalValueSumUsd = insurances.reduce((sum, item) => sum + (Number(item.premiumAmount) || 0), 0);

  // Filter list
  const filteredList = insurances.filter(item => {
    const statusMatch = selectedStatusTab === 'All' || item.claimStatus === selectedStatusTab;
    const providerMatch = selectedProvider === 'All' || item.provider === selectedProvider;
    
    const query = searchQuery.trim().toLowerCase();
    const searchMatch = !query ||
      item.id.toLowerCase().includes(query) ||
      item.studentName.toLowerCase().includes(query) ||
      item.studentId.toLowerCase().includes(query) ||
      item.policyNumber.toLowerCase().includes(query) ||
      item.provider.toLowerCase().includes(query) ||
      item.gradeClass.toLowerCase().includes(query) ||
      item.guardianName.toLowerCase().includes(query) ||
      item.guardianPhone.toLowerCase().includes(query);

    return statusMatch && providerMatch && searchMatch;
  });

  return (
    <div className="space-y-6">
      
      {/* Intro visual header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/10 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-moul tracking-normal text-slate-900 flex items-center gap-2">
                សន្លឹកគ្រប់គ្រងធានារ៉ាប់រងសិស្ស (Western Student Insurance Register)
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-bold">Auto Recorded ✔</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                គ្រប់គ្រងឯកសារធានារ៉ាប់រង កំណត់ត្រាសុខភាព ការស្នើសុំសំណងមន្ទីរពេទ្យ និងព័ត៌មានអាណាព្យាបាលសិស្សសាលា។
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2 hover:bg-slate-100 transition border rounded-xl text-slate-500 text-xs font-bold cursor-pointer"
            >
              កំណត់ឡើងវិញ
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm shadow-indigo-700/15"
            >
              <PlusCircle className="w-4 h-4" />
              <span>បញ្ចូលធានារ៉ាប់រងថ្មី (Add Insurance)</span>
            </button>
            <button
              onClick={() => setShowTelegramPanel(!showTelegramPanel)}
              className={`inline-flex items-center gap-1.5 font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer border ${
                showTelegramPanel 
                  ? 'bg-sky-600 text-white border-sky-600' 
                  : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>បញ្ជូនទៅ Telegram (Telegram Bot)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auto Logging Informative Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100/90 rounded-2xl px-5 py-3 text-xs text-teal-900 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 font-bold text-teal-950">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse shrink-0" />
            <span>ប្រព័ន្ធម៉ាស៊ីនរក្សាទុកទិន្នន័យស្វ័យប្រវត្ត៖ រាល់ការបន្ថែម កែប្រែ ឬការផ្លាស់ប្តូរស្ថានភាពប័ណ្ណធានា នឹងត្រូវរក្សាទុក Auto-Storage។</span>
          </div>
          <span className="text-[10px] uppercase font-black bg-teal-200 text-teal-800 px-2 py-0.5 rounded-lg">
            Active Real-time Sync
          </span>
        </div>
      </div>

      {/* Telegram Control Panel */}
      {showTelegramPanel && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-start gap-4">
              <div className="bg-sky-50 text-sky-600 p-3 rounded-2xl border border-sky-100 shrink-0">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.66-.52.36-.97.53-1.35.52-.42-.01-1.23-.24-1.83-.44-.74-.24-1.33-.37-1.28-.79.03-.22.33-.45.91-.69 3.56-1.55 5.93-2.57 7.12-3.06 3.39-1.4 4.09-1.64 4.55-1.65.1 0 .33.03.48.15.12.1.15.24.17.34 0 .07.01.21 0 .28z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-wide uppercase">
                  ប្រព័ន្ធបញ្ជូនរបាយការណ៍ធានារ៉ាប់រងទៅ Telegram
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  Telegram Report Center — បញ្ជូនរបាយការណ៍សង្ខេបពីការចុះឈ្មោះធានារ៉ាប់រងសិស្សទាំងស្ថាប័នទៅកាន់គ្រុបការងារ
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowTelegramPreview(!showTelegramPreview)}
              className="text-xs font-extrabold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-xl border border-sky-200 flex items-center gap-1.5 transition self-start sm:self-center cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              {showTelegramPreview ? 'លាក់គំរូអត្ថបទ' : 'បង្ហាញគំរូអត្ថបទ (Preview)'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Control Column */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Option 1: Direct Link */}
              <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    ផ្ញើផ្ទាល់ (No Bot Configuration)
                  </span>
                  <h4 className="text-sm font-black text-slate-800">
                    ផ្ញើដោយផ្ទាល់តាមរយៈតំណភ្ជាប់ Telegram (Share Link)
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    ចុចប៊ូតុងខាងក្រោមដើម្បីបង្កើតតំណភ្ជាប់ (Share Link) រួចដំណើរការផ្ញើចូលទៅកាន់គ្រុប ឬឆានែលការងាររបស់អ្នកដោយសេរី ដោយមិនបាច់កំណត់ Bot ឡើយ។
                  </p>
                </div>
                
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(buildSummaryTelegramTextPlain(insurances))}`}
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
                    className="text-xs font-black text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl transition flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    {showTelegramSettings ? 'លាក់ការកំណត់' : 'កំណត់អត្តសញ្ញាណ'}
                  </button>
                </div>

                {/* Configuration Fields */}
                {(showTelegramSettings || (!telegramBotToken || !telegramChatId)) && (
                  <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-4 text-xs animate-fade-in">
                    <div className="space-y-1 bg-indigo-50/50 border border-indigo-100/60 p-3 rounded-lg">
                      <p className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                        <Key className="w-4 h-4 text-indigo-600" /> ជំនួយណែនាំ៖
                      </p>
                      <ol className="list-decimal pl-4 mt-1 space-y-1.5 font-medium text-slate-600 text-[11px] leading-relaxed">
                        <li>ផ្ញើរសារទៅកាន់ <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">@BotFather</a> ដើម្បីទទួលបាន <b>Bot Token</b></li>
                        <li>បង្កើត Telegram Group / Channel រួចបន្ថែម Bot នេះចូល</li>
                        <li>ស្វែងរក Chat ID (ដូចជាប្រើប្រាស់ <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">@userinfobot</a>)</li>
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
                        <label className="block text-[11px] font-black text-slate-700 mb-1">Telegram Chat ID</label>
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

                {/* Send action and status */}
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
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
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
                    onClick={sendSummaryToTelegram}
                    disabled={telegramSendStatus === 'sending'}
                    className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs px-6 py-3 rounded-xl border border-indigo-500 shadow-md transition-all scale-100 active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {telegramSendStatus === 'sending' ? 'កំពុងផ្ញើ...' : 'ផ្ញើរបាយការណ៍សង្ខេបភ្លាមៗ (Bot)'}
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
            </div>

            {/* Preview Column */}
            {showTelegramPreview && (
              <div className="lg:col-span-6 flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden min-h-[350px]">
                <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-black flex items-center justify-center text-xs shadow-inner">
                      WIS
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-white leading-tight">Telegram Insurance Channel</h5>
                      <span className="text-[9px] text-emerald-400 font-bold">bot is online</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-extrabold pr-1">
                    SUMMARY PREVIEW
                  </div>
                </div>

                <div className="p-4 flex-1 overflow-auto bg-slate-950 flex flex-col justify-end">
                  <div className="bg-slate-800/90 border border-slate-700/50 rounded-2xl rounded-tr-none text-slate-100 text-[11px] font-medium leading-relaxed p-4 ml-6 self-end max-w-md shadow-xl whitespace-pre-wrap font-sans">
                    {buildSummaryTelegramTextPlain(insurances)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics board widgets */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest">ធានារ៉ាប់រងសរុប</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-black text-slate-800">{totalCount}</span>
            <span className="text-xs text-slate-400 font-bold">នាក់</span>
          </div>
          <p className="text-[9.5px] text-slate-400 mt-1 font-semibold">សន្លឹកព័ត៌មានចុះឈ្មោះ</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-[10.5px] font-black text-emerald-600 uppercase tracking-widest">បានអនុម័ត (Active)</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-black text-emerald-600">{approvedClaimsCount}</span>
            <span className="text-xs text-emerald-400 font-bold">នាក់</span>
          </div>
          <span className="inline-block text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md mt-1 font-bold">
            ធានាសពលភាព
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-[10.5px] font-black text-amber-600 uppercase tracking-widest">កំពុងរង់ចាំ (Claims/Pending)</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-black text-amber-600">{pendingClaimsCount}</span>
            <span className="text-xs text-amber-400 font-bold">នាក់</span>
          </div>
          <span className="inline-block text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md mt-1 font-bold animate-pulse">
            រង់ចាំត្រួតពិនិត្យសំណង
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-[10.5px] font-black text-rose-600 uppercase tracking-widest">បានបដិសេធ (Rejected)</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-black text-rose-600">{rejectedClaimsCount}</span>
            <span className="text-xs text-rose-400 font-bold">នាក់</span>
          </div>
          <span className="inline-block text-[9px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md mt-1 font-bold">
            ឯកសារខ្វះចន្លោះ
          </span>
        </div>

        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-indigo-950 to-slate-900 p-4 rounded-2xl text-white shadow-xs">
          <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest text-indigo-200/80">បុព្វលាភសរុប (Premiums)</p>
          <div className="flex items-baseline gap-0.5 mt-1">
            <span className="text-2xl font-mono font-black text-amber-400">${totalValueSumUsd}</span>
            <span className="text-[10px] text-indigo-300 font-bold">USD</span>
          </div>
          <p className="text-[9.5px] text-slate-400 mt-2 font-mono">គិតជាមធ្យមគ្របដណ្តប់</p>
        </div>
      </div>

      {/* Filter and control panel */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        
        {/* Dynamic input search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ស្វែងរក៖ ឈ្មោះសិស្ស លេខសម្គាល់ ប័ណ្ណធានា អាណាព្យាបាល... "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              សម្អាត
            </button>
          )}
        </div>

        {/* Tab filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-extrabold">ស្ថានភាពការិយាល័យ (Office Status):</span>
          <button
            onClick={() => setSelectedStatusTab('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              selectedStatusTab === 'All'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ទាំងអស់ ({totalCount})
          </button>
          
          <button
            onClick={() => setSelectedStatusTab('Approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              selectedStatusTab === 'Approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-50 text-emerald-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            បានយល់ព្រម ({insurances.filter(i => i.claimStatus === 'Approved').length})
          </button>

          <button
            onClick={() => setSelectedStatusTab('Pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              selectedStatusTab === 'Pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-50 text-amber-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            រង់ចាំ ({insurances.filter(i => i.claimStatus === 'Pending').length})
          </button>

          <button
            onClick={() => setSelectedStatusTab('Rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              selectedStatusTab === 'Rejected'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-50 text-rose-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            បដិសេធ ({insurances.filter(i => i.claimStatus === 'Rejected').length})
          </button>
        </div>

        {/* Insurance provider simple filter selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-extrabold shrink-0">ក្រុមហ៊ុន៖</span>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="All">បង្ហាញទាំងអស់</option>
            <option value="Forte Insurance">Forte Insurance</option>
            <option value="AIA Cambodia">AIA Cambodia</option>
            <option value="Prudential Cambodia">Prudential Cambodia</option>
          </select>
        </div>
      </div>

      {/* Main Database Grid */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full border-collapse text-left text-xs text-slate-705">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black">
                <th className="px-4 py-3.5 text-center w-12 font-mono">№</th>
                <th className="px-4 py-3.5">កូដធានារ៉ាប់រង (ID)</th>
                <th className="px-4 py-3.5">ព័ត៌មានសិស្ស (Student Info)</th>
                <th className="px-4 py-3.5">អាណាព្យាបាល (Guardian Info)</th>
                <th className="px-4 py-3.5">ព័ត៌មានធានារ៉ាប់រង (Policy Cover)</th>
                <th className="px-4 py-3.5">ព័ត៌មានសុខភាព (Health Status)</th>
                <th className="px-4 py-3.5 text-center">ស្ថានភាពការិយាល័យ</th>
                <th className="px-4 py-3.5 text-center w-36">សកម្មភាព (Actions)</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-bold">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <ShieldCheck className="w-12 h-12 text-slate-200 animate-bounce mb-2" />
                      <p className="text-xs text-slate-500">រកមិនឃើញទិន្នន័យធានារ៉ាប់រងសិស្សទេ</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((item, index) => {
                  const statusColors = 
                    item.claimStatus === 'Approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    item.claimStatus === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    item.claimStatus === 'Rejected' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                    'bg-slate-50 text-slate-800 border-slate-200';

                  const statusText = 
                    item.claimStatus === 'Approved' ? 'បានយល់ព្រម' :
                    item.claimStatus === 'Pending' ? 'កំពុងត្រួតពិនិត្យ' :
                    item.claimStatus === 'Rejected' ? 'បដិសេធ' : 'គ្មាន';

                  return (
                    <tr key={item.id} className="border-b border-slate-150 hover:bg-slate-50/50 transition-colors">
                      {/* number */}
                      <td className="px-4 py-3 text-center text-slate-400 font-mono font-bold">{index + 1}</td>
                      
                      {/* Policy ID code banner */}
                      <td className="px-4 py-3 font-mono font-bold text-slate-800 select-all">
                        <span className="bg-slate-100 border border-slate-155 px-2 py-0.5 rounded">
                          {item.id}
                        </span>
                      </td>

                      {/* Student info */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-extrabold text-slate-900 text-[12.5px]">{item.studentName}</p>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            ID: <span className="font-bold text-slate-700">{item.studentId}</span> • ភេទ៖ <span className="font-bold text-slate-700">{item.gender}</span> • Class: <span className="font-semibold text-indigo-700">{item.gradeClass}</span>
                          </p>
                          <p className="text-[10px] text-indigo-500 font-bold mt-0.5">
                            ឆ្នាំសិក្សា៖ {item.academicYear}
                          </p>
                        </div>
                      </td>

                      {/* parents info */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-slate-800">{item.guardianName} ({item.guardianRelationship})</p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {item.guardianPhone}
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[180px]" title={item.guardianAddress}>
                            {item.guardianAddress}
                          </p>
                        </div>
                      </td>

                      {/* Policy cover details */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-indigo-950 font-mono text-[11px]">{item.policyNumber}</p>
                          <p className="text-[11px] text-emerald-800 font-extrabold">
                            {item.provider}
                          </p>
                          <p className="text-[10px] text-slate-500 line-clamp-1 max-w-[180px]" title={item.coverageType}>
                            {item.coverageType}
                          </p>
                        </div>
                      </td>

                      {/* Health medical */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-slate-800">
                            ក្រុមឈាម៖ <span className="text-rose-600 font-black">{item.bloodType}</span>
                          </p>
                          {item.allergies && item.allergies !== 'គ្មាន (None)' ? (
                            <p className="text-[10px] text-rose-600 font-bold max-w-[140px] truncate" title={item.allergies}>
                              អាឡែកស៊ី៖ {item.allergies}
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-400">គ្មានប្រតិកម្មអាឡែកស៊ី</p>
                          )}
                        </div>
                      </td>

                      {/* Status office */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 font-black text-[11px] rounded-md border ${statusColors}`}>
                          {statusText}
                        </span>
                      </td>

                      {/* Actions edit / delete / view */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openViewOnlyModal(item)}
                            title="មើលពេញទំព័រ (View Full Form)"
                            className="p-1 px-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 transition text-[11.5px] font-bold cursor-pointer inline-flex items-center gap-0.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => sendSingleRecordToTelegram(item)}
                            title="បញ្ជូនទៅ Telegram (Send to Telegram Bot)"
                            className="p-1 px-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-100 transition text-[11.5px] font-bold cursor-pointer inline-flex items-center"
                          >
                            <Send className="w-3.5 h-3.5 text-sky-600" />
                          </button>

                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1 px-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition text-[11px] font-bold cursor-pointer inline-flex items-center gap-0.5"
                          >
                            <Edit className="w-3 h-3" />
                            <span>កែ</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteRecord(item.id)}
                            className="p-1 px-1.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-550 hover:text-white rounded-lg transition text-[11px] font-bold cursor-pointer inline-flex items-center"
                          >
                            <Trash2 className="w-3 h-3" />
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
        
        {/* paging counts */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-slate-400 font-bold text-[10.5px]">
          <span>បង្ហាញ {filteredList.length} ក្នុងចំណោម {totalCount} សន្លឹកធានារ៉ាប់រង</span>
          <span>Western International School (WIS)</span>
        </div>
      </div>

      {/* View Only Full Form sheet modal (Displays 8 formatted elements nicely) */}
      {viewingPolicy && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-indigo-950 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-indigo-400">
                <ShieldCheck className="w-5.5 h-5.5 text-amber-500 fill-amber-500/10" />
                <div>
                  <h3 className="font-moul text-sm md:text-base text-white tracking-normal leading-relaxed">
                    ទម្រង់ធានារ៉ាប់រងសិស្សផ្លូវការ (Official Form)
                  </h3>
                  <p className="text-[11px] text-indigo-300 font-bold mt-0.5">លេខប័ណ្ណ៖ {viewingPolicy.id} • {viewingPolicy.studentName}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingPolicy(null)}
                className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Content divided in requested sections */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-xs text-slate-700">
              
              {/* Profile card topper */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-5 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 shadow-inner text-2xl font-black font-mono shrink-0 select-none">
                  {viewingPolicy.studentName.charAt(0)}
                </div>
                <div className="text-center sm:text-left space-y-0.5">
                  <h4 className="text-base font-extrabold text-slate-800 font-moul leading-normal">{viewingPolicy.studentName}</h4>
                  <p className="text-slate-500 font-extrabold">Student ID: <span className="text-indigo-800 font-black">{viewingPolicy.studentId}</span></p>
                  <p className="text-[11px] text-slate-400">ថ្នាក់រៀន៖ {viewingPolicy.gradeClass} • ឆ្នាំសិក្សា៖ {viewingPolicy.academicYear}</p>
                </div>
                
                {/* Office stamp indicator */}
                <div className="sm:ml-auto select-none border-4 border-dashed border-emerald-500/30 text-emerald-600/80 rounded-2xl p-2 px-4 flex flex-col items-center justify-center -rotate-3 text-center">
                  <span className="text-[10px] font-black tracking-widest uppercase">OFFICIAL APPROVED</span>
                  <span className="text-sm font-moul tracking-normal shrink-0">ការិយាល័យសាលា</span>
                </div>
              </div>

              {/* Grid 1 & 2: Student & Parent info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* 1. Student Information */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-200/60">
                  <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <User className="w-4 h-4 text-indigo-700" />
                    <span className="font-extrabold text-[12.5px] text-slate-800 font-moul tracking-normal">១. ព័ត៌មានសិស្ស (Student Information)</span>
                  </div>
                  <div className="space-y-1.5 text-[11.5px]">
                    <p><span className="text-slate-400 font-bold">ឈ្មោះពេញ៖</span> <strong className="text-slate-800">{viewingPolicy.studentName}</strong></p>
                    <p><span className="text-slate-400 font-bold">លេខសម្គាល់សិស្ស៖</span> <strong className="text-slate-800 font-mono">{viewingPolicy.studentId}</strong></p>
                    <p><span className="text-slate-400 font-bold">ភេទ៖</span> <strong className="text-slate-800">{viewingPolicy.gender}</strong></p>
                    <p><span className="text-slate-400 font-bold">ថ្ងៃខែឆ្នាំកំណើត៖</span> <strong className="text-slate-800 font-mono">{viewingPolicy.dob}</strong></p>
                    <p><span className="text-slate-400 font-bold">សញ្ជាតិ៖</span> <strong className="text-slate-800">{viewingPolicy.nationality}</strong></p>
                    <p><span className="text-slate-400 font-bold">ថ្នាក់រៀន៖</span> <strong className="text-slate-800">{viewingPolicy.gradeClass}</strong></p>
                  </div>
                </div>

                {/* 2. Parent/Guardian Information */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-200/60">
                  <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <Phone className="w-4 h-4 text-indigo-700" />
                    <span className="font-extrabold text-[12.5px] text-slate-800 font-moul tracking-normal">២. ព័ត៌មានអាណាព្យាបាល (Parent Info)</span>
                  </div>
                  <div className="space-y-1.5 text-[11.5px]">
                    <p><span className="text-slate-400 font-bold">អាណាព្យាបាល៖</span> <strong className="text-slate-800">{viewingPolicy.guardianName}</strong></p>
                    <p><span className="text-slate-400 font-bold">ត្រូវជា៖</span> <strong className="text-indigo-800">{viewingPolicy.guardianRelationship}</strong></p>
                    <p><span className="text-slate-400 font-bold">លេខទូរស័ព្ទ៖</span> <strong className="text-slate-800 font-mono">{viewingPolicy.guardianPhone}</strong></p>
                    <p><span className="text-slate-400 font-bold">មុខរបរ៖</span> <strong className="text-slate-800">{viewingPolicy.guardianOccupation}</strong></p>
                    <p><span className="text-slate-400 font-bold">អាសយដ្ឋាន៖</span> <span className="text-slate-600 font-medium">{viewingPolicy.guardianAddress}</span></p>
                  </div>
                </div>

                {/* 3. Insurance Information */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/30 to-slate-50 border border-indigo-100">
                  <div className="flex items-center gap-1.5 border-b border-indigo-100 pb-1.5">
                    <Landmark className="w-4 h-4 text-indigo-700" />
                    <span className="font-extrabold text-[12.5px] text-slate-800 font-moul tracking-normal">៣. ព័ត៌មានធានារ៉ាប់រង (Insurance Info)</span>
                  </div>
                  <div className="space-y-1.5 text-[11.5px]">
                    <p><span className="text-slate-400 font-bold">លេខប័ណ្ណធានា៖</span> <strong className="text-indigo-950 font-mono">{viewingPolicy.policyNumber}</strong></p>
                    <p><span className="text-slate-400 font-bold">ក្រុមហ៊ុនធានា៖</span> <strong className="text-emerald-700 font-extrabold">{viewingPolicy.provider}</strong></p>
                    <p><span className="text-slate-400 font-bold">ប្រភេទការធានា៖</span> <strong className="text-slate-700">{viewingPolicy.coverageType}</strong></p>
                    <p><span className="text-slate-400 font-bold">ថ្ងៃចាប់ផ្តើម៖</span> <span className="text-slate-600 font-mono">{viewingPolicy.effectiveDate}</span></p>
                    <p><span className="text-slate-400 font-bold">ថ្ងៃផុតកំណត់៖</span> <span className="text-rose-600 font-mono font-bold">{viewingPolicy.expiryDate}</span></p>
                    <p><span className="text-slate-400 font-bold">តម្លៃបុព្វលាភ៖</span> <strong className="text-emerald-700 font-mono font-black">${viewingPolicy.premiumAmount} USD</strong></p>
                  </div>
                </div>

                {/* 4. Emergency Contact */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-200/60">
                  <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span className="font-extrabold text-[12.5px] text-slate-800 font-moul tracking-normal">៤. អ្នកទំនាក់ទំនងបន្ទាន់ (Emergency)</span>
                  </div>
                  <div className="space-y-1.5 text-[11.5px]">
                    <p><span className="text-slate-400 font-bold">ឈ្មោះទាក់ទង៖</span> <strong className="text-slate-800">{viewingPolicy.emergencyName}</strong></p>
                    <p><span className="text-slate-400 font-bold">ត្រូវជា៖</span> <strong className="text-slate-700">{viewingPolicy.emergencyRelationship}</strong></p>
                    <p><span className="text-slate-400 font-bold">ទូរស័ព្ទ៖</span> <strong className="text-slate-800 font-mono">{viewingPolicy.emergencyPhone}</strong></p>
                    {viewingPolicy.emergencyAltPhone && (
                      <p><span className="text-slate-400 font-bold">លេខជំនួស៖</span> <strong className="text-slate-800 font-mono">{viewingPolicy.emergencyAltPhone}</strong></p>
                    )}
                  </div>
                </div>

                {/* 5. Medical Information */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50/50 border border-slate-200/60">
                  <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    <span className="font-extrabold text-[12.5px] text-slate-800 font-moul tracking-normal">៥. ព័ត៌មានសុខភាព (Medical Information)</span>
                  </div>
                  <div className="space-y-1.5 text-[11.5px]">
                    <p><span className="text-slate-400 font-bold">ក្រុមឈាម (Blood):</span> <strong className="text-rose-600 font-black">{viewingPolicy.bloodType}</strong></p>
                    <p><span className="text-slate-400 font-bold">ប្រតិកម្មអាឡែកស៊ី៖</span> <span className="text-slate-700 font-bold">{viewingPolicy.allergies || 'គ្មាន (None)'}</span></p>
                    <p><span className="text-slate-400 font-bold">ជំងឺប្រចាំកាយ៖</span> <span className="text-slate-700 font-bold">{viewingPolicy.medicalConditions || 'គ្មាន (None)'}</span></p>
                    <p><span className="text-slate-400 font-bold">ថ្នាំកំពុងប្រើ៖</span> <span className="text-slate-750 font-bold">{viewingPolicy.currentMedications || 'គ្មាន (None)'}</span></p>
                  </div>
                </div>

                {/* 6. Claim Information */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-amber-50/25 border border-amber-200/80">
                  <div className="flex items-center gap-1.5 border-b border-amber-200 pb-1.5">
                    <FileText className="w-4 h-4 text-amber-700" />
                    <span className="font-extrabold text-[12.5px] text-slate-800 font-moul tracking-normal">៦. ព័ត៌មានស្នើសុំសំណង (Claims Info)</span>
                  </div>
                  {viewingPolicy.claimDate ? (
                    <div className="space-y-1.5 text-[11.5px]">
                      <p><span className="text-slate-400 font-bold">កាលបរិច្ឆេទកើតហេតុ៖</span> <strong className="text-slate-800 font-mono">{viewingPolicy.claimDate}</strong></p>
                      <p><span className="text-slate-400 font-bold">ទីកន្លែងកើតហេតុ៖</span> <strong className="text-slate-700">{viewingPolicy.claimPlace}</strong></p>
                      <p><span className="text-slate-400 font-bold">មន្ទីរពេទ្យព្យាបាល៖</span> <strong className="text-slate-705">{viewingPolicy.claimHospital}</strong></p>
                      <p><span className="text-slate-400 font-bold">ចំណាយសរុប៖</span> <strong className="text-amber-800 font-mono">${viewingPolicy.claimExpenseAmount} USD</strong></p>
                      <p><span className="text-slate-400 font-bold">ហេតុការណ៍៖</span> <span className="text-slate-600 block bg-white p-2 border border-slate-150 rounded-lg">{viewingPolicy.claimDescription}</span></p>
                      {viewingPolicy.claimDocuments && (
                        <p><span className="text-slate-400 font-bold">ឯកសារភ្ជាប់៖</span> <span className="text-indigo-600 font-mono font-bold">{viewingPolicy.claimDocuments}</span></p>
                      )}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400 font-bold">
                      <p>មិនទាន់មានការស្នើសុំសំណងនៅឡើយ (No Claims Recorded)</p>
                    </div>
                  )}
                </div>

              </div>

              {/* 7. Declaration & Signatures */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <FileText className="w-4.5 h-4.5 text-slate-700" />
                  <span className="font-extrabold text-[12.5px] text-slate-800 font-moul tracking-normal">៧. ការបញ្ជាក់ និងហត្ថលេខា (Declaration & Signature)</span>
                </div>
                
                <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                  យើងខ្ញុំជាសាមីខ្លួន និងអាណាព្យាបាលសិស្ស សូមបញ្ជាក់ថាព័ត៌មានខាងលើនេះពិតជាត្រឹមត្រូវពិតប្រាកដមែន ហើយយល់ព្រមតាមការកំណត់របស់ក្រុមហ៊ុនធានារ៉ាប់រង។
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center pt-3 select-none">
                  <div className="border border-slate-200/60 p-3 rounded-xl bg-white space-y-2">
                    <p className="text-slate-400 font-bold">សាមីសិស្ស (Student)</p>
                    <div className="h-10 flex items-center justify-center font-mono italic text-[13px] text-indigo-700 font-black">
                      {viewingPolicy.studentSigned ? `[ Signed / ${viewingPolicy.studentSignatureName} ]` : 'មិនទាន់ចុះហត្ថលេខា'}
                    </div>
                    <div className="h-px bg-slate-100" />
                    <p className="text-slate-700 font-extrabold font-mono mt-1 text-[11px]">{viewingPolicy.studentSignatureName}</p>
                  </div>

                  <div className="border border-slate-200/60 p-3 rounded-xl bg-white space-y-2">
                    <p className="text-slate-400 font-bold">អាណាព្យាបាល (Parent / Guardian)</p>
                    <div className="h-10 flex items-center justify-center font-mono italic text-[13px] text-indigo-700 font-black">
                      {viewingPolicy.parentSigned ? `[ Signed / ${viewingPolicy.parentSignatureName} ]` : 'មិនទាន់ចុះហត្ថលេខា'}
                    </div>
                    <div className="h-px bg-slate-100" />
                    <p className="text-slate-700 font-extrabold font-mono mt-1 text-[11px]">{viewingPolicy.parentSignatureName}</p>
                  </div>

                  <div className="border border-slate-200/60 p-3 rounded-xl bg-white space-y-2">
                    <p className="text-slate-400 font-bold">តំណាងសាលា (School Rep)</p>
                    <div className="h-10 flex items-center justify-center font-mono italic text-[13px] text-emerald-700 font-black">
                      {viewingPolicy.schoolRepresentativeSigned ? `[ Signed / Authorized ]` : 'មិនទាន់ចុះហត្ថលេខា'}
                    </div>
                    <div className="h-px bg-slate-100" />
                    <p className="text-slate-700 font-extrabold font-mono mt-1 text-[11px]">{viewingPolicy.schoolRepresentativeName}</p>
                  </div>
                </div>

                <div className="text-right text-slate-400 font-mono text-[10.5px]">
                  កាលបរិច្ឆេទចុះហត្ថលេខា៖ <strong>{viewingPolicy.declarationDate}</strong>
                </div>
              </div>

              {/* 8. Office Use Only */}
              <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between border-b border-indigo-150 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-indigo-900" />
                    <span className="font-extrabold text-[12.5px] text-indigo-950 font-moul tracking-normal">៨. សម្រាប់ការិយាល័យសាលា (Office Use Only)</span>
                  </div>
                  <span className="text-[10px] bg-slate-900 text-amber-400 px-3 py-1 font-black rounded-lg">
                    STATUS: {viewingPolicy.claimStatus.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11.5px] text-indigo-950">
                  <p><span className="text-indigo-700 font-bold">ទទួលពាក្យដោយ៖</span> <strong className="font-mono">{viewingPolicy.receivedBy}</strong></p>
                  <p><span className="text-indigo-700 font-bold">ថ្ងៃទីទទួលបាន៖</span> <strong className="font-mono">{viewingPolicy.dateReceived}</strong></p>
                  <div className="sm:col-span-2">
                    <p className="text-indigo-700 font-bold mb-1">ចំណាំចំណាររដ្ឋបាល (Office Remarks & Policy validation):</p>
                    <div className="bg-white/80 p-3 rounded-xl border border-indigo-100 font-semibold leading-relaxed text-slate-800">
                      {viewingPolicy.officeRemarks || 'គ្មានព័ត៌មានបន្ថែមពីការិយាល័យ។'}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal footer buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => viewingPolicy && sendSingleRecordToTelegram(viewingPolicy)}
                className="px-5 py-2 bg-sky-550 hover:bg-sky-600 text-white transition border border-sky-600 rounded-xl text-xs font-black cursor-pointer inline-flex items-center gap-1.5 shadow-sm overflow-hidden"
              >
                <Send className="w-4 h-4" />
                <span>ផ្ញើទៅ Telegram (Send Telegram)</span>
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 hover:bg-slate-100 transition border rounded-xl text-slate-600 text-xs font-black cursor-pointer inline-flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                <span>បោះពុម្ពទម្រង់ធានារ៉ាប់រង (Print Form)</span>
              </button>
              <button
                onClick={() => setViewingPolicy(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 transition text-white rounded-xl text-xs font-black cursor-pointer"
              >
                យល់ព្រម (Done)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Form editing modal popup mapping all requested 8 fields */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="bg-white border text-left border-slate-200 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-indigo-400">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <h3 className="font-moul text-sm md:text-base text-white tracking-normal leading-relaxed">
                  {editingPolicy ? `កែប្រែព័ត៌មាន៖ ${id}` : 'បន្ថែមព័ត៌មានធានារ៉ាប់រងសិស្សថ្មី (New Insurance Record)'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable form */}
            <form onSubmit={handleFormSubmit} className="p-6 md:p-8 overflow-y-auto space-y-6 text-xs font-semibold">
              
              {/* 1. Student Information */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
                <h4 className="font-extrabold text-[12px] text-slate-900 font-moul tracking-normal border-b border-slate-250 pb-2 flex items-center gap-1 text-indigo-950">
                  <User className="w-4 h-4 text-indigo-700" />
                  <span>១. ព័ត៌មានសិស្ស (Student Information)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-500 mb-1">កូដចុះឈ្មោះ (Register ID)</label>
                    <input
                      type="text"
                      disabled
                      value={id}
                      className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">ឈ្មោះពេញសិស្ស (Full Name) *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. សុក សាន"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">លេខសម្គាល់សិស្ស (Student ID) *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. WIS-STU-1025"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">ភេទ (Gender) *</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-hidden"
                    >
                      <option value="ប្រុស">ប្រុស (Male)</option>
                      <option value="ស្រី">ស្រី (Female)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">ថ្ងៃខែឆ្នាំកំណើត (DOB) *</label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 font-mono focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">ថ្នាក់បង្រៀន (Grade/Class) *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. Grade 8A"
                      value={gradeClass}
                      onChange={(e) => setGradeClass(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">ឆ្នាំសិក្សា (Academic Year) *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. 2025-2026"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">សញ្ជាតិ (Nationality) *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. ខ្មែរ (Khmer)"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Parent/Guardian Information */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
                <h4 className="font-extrabold text-[12px] text-slate-900 font-moul tracking-normal border-b border-slate-250 pb-2 flex items-center gap-1 text-indigo-950">
                  <Phone className="w-4 h-4 text-indigo-750" />
                  <span>២. ព័ត៌មានអាណាព្យាបាល (Parent/Guardian Information)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-500 mb-1">ឈ្មោះពេញអាណាព្យាបាល *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. សុកជា"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">ត្រូវជាសិស្ស (Relationship) *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. ឪពុក, ម្តាយ, ជីដូន"
                      value={guardianRelationship}
                      onChange={(e) => setGuardianRelationship(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">លេខទូរស័ព្ទអាណាព្យាបាល *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. 012 345 678"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">មុខរបរអាណាព្យាបាល *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. អាជីវករ, វិស្វករ"
                      value={guardianOccupation}
                      onChange={(e) => setGuardianOccupation(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 mb-1">អាសយដ្ឋានបច្ចុប្បន្ន *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. ផ្ទះលេខ ២៤ ផ្លូវលេខ ៣៧១..."
                      value={guardianAddress}
                      onChange={(e) => setGuardianAddress(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Insurance Register Information */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
                <h4 className="font-extrabold text-[12px] text-slate-900 font-moul tracking-normal border-b border-slate-250 pb-2 flex items-center gap-1 text-indigo-950">
                  <Landmark className="w-4 h-4 text-indigo-750" />
                  <span>៣. ព័ត៌មានធានារ៉ាប់រង (Insurance Information)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-500 mb-1">លេខប័ណ្ណធានារ៉ាប់រង *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. WIS-FORTE-2026-9042"
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">ក្រុមហ៊ុនធានារ៉ាប់រង *</label>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-hidden"
                    >
                      <option value="Forte Insurance">Forte Insurance</option>
                      <option value="AIA Cambodia">AIA Cambodia</option>
                      <option value="Prudential Cambodia">Prudential Cambodia</option>
                      <option value="Camlife Insurance">Camlife Insurance</option>
                      <option value="Other">ក្រុមហ៊ុនផ្សេងទៀត</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">តម្លៃបង់ធានា ($ USD) *</label>
                    <input
                      type="number"
                      required
                      placeholder="ឧ. 85"
                      value={premiumAmount}
                      onChange={(e) => setPremiumAmount(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-slate-500 mb-1">ប្រភេទការធានា (Coverage Type) *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. គ្រោះថ្នាក់បុគ្គល និងការព្យាបាលជំងឺ (Personal Accident & Medical)"
                      value={coverageType}
                      onChange={(e) => setCoverageType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">ថ្ងៃចាប់ផ្តើម (Effective Date) *</label>
                    <input
                      type="date"
                      required
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">ថ្ងៃផុតកំណត់ (Expiry Date) *</label>
                    <input
                      type="date"
                      required
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Emergency Contact */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
                <h4 className="font-extrabold text-[12px] text-slate-900 font-moul tracking-normal border-b border-slate-250 pb-2 flex items-center gap-1 text-indigo-950">
                  <Phone className="w-4 h-4 text-indigo-750" />
                  <span>៤. អ្នកទំនាក់ទំនងបន្ទាន់ (Emergency Contact)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 mb-1">ឈ្មោះអ្នកទាក់ទងបន្ទាន់ *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. សុកជា"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">ត្រូវជា (Relationship) *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. ឪពុក, ម្តាយ"
                      value={emergencyRelationship}
                      onChange={(e) => setEmergencyRelationship(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">លេខទូរស័ព្ទ *</label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. 012 345 678"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 mb-1">លេខទូរស័ព្ទជំនួសល្បឿនលឿន</label>
                    <input
                      type="text"
                      placeholder="ឧ. 098 765 432"
                      value={emergencyAltPhone}
                      onChange={(e) => setEmergencyAltPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Medical Information */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
                <h4 className="font-extrabold text-[12px] text-slate-900 font-moul tracking-normal border-b border-slate-250 pb-2 flex items-center gap-1 text-indigo-950">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  <span>៥. ព័ត៌មានសុខភាព (Medical Information)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 mb-1">ក្រុមឈាម (Blood Type) *</label>
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold"
                    >
                      <option value="O">O</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">ប្រតិកម្មអាឡែកស៊ី (Allergies)</label>
                    <input
                      type="text"
                      placeholder="ឧ. អាលែកស៊ីត្រីសមុទ្រ..."
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">ជំងឺប្រចាំកាយ (Existing Conditions)</label>
                    <input
                      type="text"
                      placeholder="ឧ. គ្មាន (None)"
                      value={medicalConditions}
                      onChange={(e) => setMedicalConditions(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">ថ្នាំកំពុងប្រើប្រចាំថ្ងៃ (Current Medication)</label>
                    <input
                      type="text"
                      placeholder="ឧ. គ្មាន (None)"
                      value={currentMedications}
                      onChange={(e) => setCurrentMedications(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Claim Information */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
                <h4 className="font-extrabold text-[12px] text-slate-900 font-moul tracking-normal border-b border-slate-250 pb-2 flex items-center gap-1 text-indigo-950">
                  <FileText className="w-4 h-4 text-indigo-755" />
                  <span>៦. ព័ត៌មានស្នើសុំសំណង (Claim Information - បំពេញពេលកើតហេតុ)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-500 mb-1">ថ្ងៃកើតហេតុ (Date of Incident)</label>
                    <input
                      type="date"
                      value={claimDate}
                      onChange={(e) => setClaimDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">ទីកន្លែងកើតហេតុ (Place of Incident)</label>
                    <input
                      type="text"
                      placeholder="ឧ. ទីធ្លារត់លេងសាលា"
                      value={claimPlace}
                      onChange={(e) => setClaimPlace(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">ឈ្មោះមន្ទីរពេទ្យចូលសម្រាកព្យាបាល</label>
                    <input
                      type="text"
                      placeholder="ឧ. មន្ទីរពេទ្យព្រះកុសុមៈ"
                      value={claimHospital}
                      onChange={(e) => setClaimHospital(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">ចំណាយថ្លៃព្យាបាល ($ USD)</label>
                    <input
                      type="number"
                      placeholder="ឧ. 125"
                      value={claimExpenseAmount}
                      onChange={(e) => setClaimExpenseAmount(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 mb-1">ភ្ជាប់ឯកសារពិគ្រោះ/វេជ្ជបញ្ជា (Supporting Doc files info)</label>
                    <input
                      type="text"
                      placeholder="ឧ. medical_receipt.pdf, clinic_report.jpg"
                      value={claimDocuments}
                      onChange={(e) => setClaimDocuments(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-indigo-700 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-slate-500 mb-1">ពិពណ៌នាហេតុការណ៍លម្អិត (Incident Description)</label>
                    <textarea
                      rows={2}
                      placeholder="ពន្យល់ពីដំណើរដើមទងនៃគ្រោះថ្នាក់..."
                      value={claimDescription}
                      onChange={(e) => setClaimDescription(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* 7. Declaration & Signatures */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
                <h4 className="font-extrabold text-[12px] text-slate-900 font-moul tracking-normal border-b border-slate-250 pb-2 flex items-center gap-1 text-indigo-950">
                  <FileText className="w-4.5 h-4.5 text-indigo-750" />
                  <span>៧. ការបញ្ជាក់ និងហត្ថលេខា (Declaration & Signatures)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="stSigned"
                      checked={studentSigned}
                      onChange={(e) => setStudentSigned(e.target.checked)}
                      className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded"
                    />
                    <label htmlFor="stSigned" className="text-slate-700 font-bold">សាមីខ្លួនយល់ព្រម</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="ptSigned"
                      checked={parentSigned}
                      onChange={(e) => setParentSigned(e.target.checked)}
                      className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded"
                    />
                    <label htmlFor="ptSigned" className="text-slate-700 font-bold">អាណាព្យាបាលយល់ព្រម</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="schSigned"
                      checked={schoolRepresentativeSigned}
                      onChange={(e) => setSchoolRepresentativeSigned(e.target.checked)}
                      className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded"
                    />
                    <label htmlFor="schSigned" className="text-slate-700 font-bold">តំណាងសាលាយល់ព្រម</label>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">កាលបរិច្ឆេទចុះហត្ថលេខា</label>
                    <input
                      type="date"
                      value={declarationDate}
                      onChange={(e) => setDeclarationDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-slate-850 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 8. Office Use Only */}
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-150 space-y-4">
                <h4 className="font-extrabold text-[12px] text-indigo-950 font-moul tracking-normal border-b border-indigo-200 pb-2 flex items-center gap-1">
                  <Landmark className="w-4 h-4 text-indigo-900" />
                  <span>៨. សម្រាប់ការិយាល័យសាលា (Office Use Only)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-indigo-900 mb-1">មន្ត្រីទទួលឯកសារ (Received By) *</label>
                    <input
                      type="text"
                      required
                      value={receivedBy}
                      onChange={(e) => setReceivedBy(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-indigo-900 mb-1">ថ្ងៃទីទទួលបាន (Date Received) *</label>
                    <input
                      type="date"
                      required
                      value={dateReceived}
                      onChange={(e) => setDateReceived(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-indigo-900 mb-1">ស្ថានភាពស្នើសុំសំណង (Status) *</label>
                    <select
                      value={claimStatus}
                      onChange={(e) => setClaimStatus(e.target.value as InsuranceStatus)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold"
                    >
                      <option value="Approved">យល់ព្រមស្គាល់ (Approved)</option>
                      <option value="Pending">កំពុងត្រួតពិនិត្យ (Pending)</option>
                      <option value="Rejected">បដិសេធចោល (Rejected)</option>
                      <option value="None">គ្មានសំណើ (None)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-indigo-900 mb-1">ចំណារចំណាំមន្ត្រីរដ្ឋបាល (Office Remarks / Notes)</label>
                    <textarea
                      rows={2}
                      placeholder="បញ្ចូលចំណាំលម្អិត..."
                      value={officeRemarks}
                      onChange={(e) => setOfficeRemarks(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850"
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-250 text-slate-500 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-700 hover:bg-indigo-850 text-white rounded-xl font-bold cursor-pointer select-none"
                >
                  រក្សាទុក Auto-Submit
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Embedded Floating Toast notification container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce duration-300">
          <div className="px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-2.5 border text-xs font-black text-white bg-slate-900 border-slate-700 shadow-slate-950/20">
            <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <div>{toast.message}</div>
          </div>
        </div>
      )}

    </div>
  );
}
