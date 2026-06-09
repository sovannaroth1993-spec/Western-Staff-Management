/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Search, PlusCircle, Edit, Trash2, X, Check, AlertTriangle, 
  User, HeartPulse, FileText, Phone, Landmark, Signpost, HelpCircle, Download, Upload, Eye,
  Send, Key, MessageSquare, AlertCircle, Settings2, Info
} from 'lucide-react';
import { StudentInsurance, InsuranceStatus } from '../types';
import { StudentInsuranceViewModal } from './StudentInsuranceViewModal';
import { StudentInsuranceFormModal } from './StudentInsuranceFormModal';

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

  // Delete / Reset Confirmation Modal States
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // States for Student Insurance Fields
  const [id, setId] = useState('');
  const [campusBranch, setCampusBranch] = useState('Western Phnom Penh (WPP)');
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

  // Accident, Claim Details
  const [claimDate, setClaimDate] = useState('');
  const [claimTime, setClaimTime] = useState('');
  const [claimTimeAmPm, setClaimTimeAmPm] = useState<'am' | 'pm'>('am');
  const [claimPlace, setClaimPlace] = useState('');
  const [claimDescription, setClaimDescription] = useState('');
  const [injuryCircumstances, setInjuryCircumstances] = useState('');
  
  // Amounts
  const [claimAmountRiel, setClaimAmountRiel] = useState('');
  const [claimExpenseAmount, setClaimExpenseAmount] = useState(0);
  const [claimDocuments, setClaimDocuments] = useState('');

  // History claim
  const [previouslyClaimed, setPreviouslyClaimed] = useState<'Yes' | 'No'>('No');
  const [previouslyClaimedDetails, setPreviouslyClaimedDetails] = useState('');

  // Supporting Documents checklists
  const [docStudentInsuranceCard, setDocStudentInsuranceCard] = useState(false);
  const [docPoliceReport, setDocPoliceReport] = useState(false);
  const [docDeathCertificate, setDocDeathCertificate] = useState(false);
  const [docMedicalReport, setDocMedicalReport] = useState(false);
  const [docMedicalInvoice, setDocMedicalInvoice] = useState(false);

  const [studentSigned, setStudentSigned] = useState(true);
  const [studentSignatureName, setStudentSignatureName] = useState('');
  const [parentSigned, setParentSigned] = useState(true);
  const [parentSignatureName, setParentSignatureName] = useState('');
  const [schoolRepresentativeSigned, setSchoolRepresentativeSigned] = useState(true);
  const [schoolRepresentativeName, setSchoolRepresentativeName] = useState('');
  const [declarationDate, setDeclarationDate] = useState('');

  // Claimant Signature
  const [claimantSignatureName, setClaimantSignatureName] = useState('');
  const [claimantSignatureDate, setClaimantSignatureDate] = useState('');

  // Office route tracking
  const [dateSubmittedToCentral, setDateSubmittedToCentral] = useState('');
  const [dateReceivedByCentral, setDateReceivedByCentral] = useState('');

  const [sentByName, setSentByName] = useState('');
  const [sentByPosition, setSentByPosition] = useState('');
  const [sentBySigned, setSentBySigned] = useState(false);

  const [receivedBy, setReceivedBy] = useState('');
  const [receivedByPosition, setReceivedByPosition] = useState('');
  const [receivedBySigned, setReceivedBySigned] = useState(false);
  const [dateReceived, setDateReceived] = useState('');

  const [approved1Name, setApproved1Name] = useState('');
  const [approved1Position, setApproved1Position] = useState('');
  const [approved1Signed, setApproved1Signed] = useState(false);

  const [approved2Name, setApproved2Name] = useState('');
  const [approved2Position, setApproved2Position] = useState('');
  const [approved2Signed, setApproved2Signed] = useState(false);

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
    setCampusBranch('Western Phnom Penh (WPP)');
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
    setClaimTime('');
    setClaimTimeAmPm('am');
    setClaimPlace('');
    setClaimDescription('');
    setInjuryCircumstances('');
    setClaimAmountRiel('');
    setClaimExpenseAmount(0);
    setClaimDocuments('');
    
    setPreviouslyClaimed('No');
    setPreviouslyClaimedDetails('');
    
    setDocStudentInsuranceCard(false);
    setDocPoliceReport(false);
    setDocDeathCertificate(false);
    setDocMedicalReport(false);
    setDocMedicalInvoice(false);
    
    setStudentSigned(true);
    setStudentSignatureName('');
    setParentSigned(true);
    setParentSignatureName('');
    setSchoolRepresentativeSigned(true);
    setSchoolRepresentativeName('ហេង សំបូរ (នាយកសាលា)');
    setDeclarationDate(new Date().toISOString().split('T')[0]);
    
    setClaimantSignatureName('');
    setClaimantSignatureDate(new Date().toISOString().split('T')[0]);
    
    setDateSubmittedToCentral('');
    setDateReceivedByCentral('');
    setSentByName('');
    setSentByPosition('');
    setSentBySigned(false);
    
    setReceivedBy('លី សូដា (រដ្ឋបាល)');
    setReceivedByPosition('ប្រធានផ្នែករដ្ឋបាល');
    setReceivedBySigned(false);
    setDateReceived(new Date().toISOString().split('T')[0]);
    
    setApproved1Name('ហេង សំបូរ (នាយកសាលា)');
    setApproved1Position('នាយកសាលា');
    setApproved1Signed(false);
    
    setApproved2Name('ជា វណ្ណា (ប្រធានប្រតិបត្តិ)');
    setApproved2Position('ប្រធានប្រតិបត្តិការ');
    setApproved2Signed(false);
    
    setClaimStatus('Approved');
    setOfficeRemarks('សំណុំឯកសារត្រូវបានរួមបញ្ចូលស្វ័យប្រវត្តិ។');
    
    setIsModalOpen(true);
  };

  const openEditModal = (item: StudentInsurance) => {
    setEditingPolicy(item);
    setViewingPolicy(null);
    
    setId(item.id);
    setCampusBranch(item.campusBranch || 'Western Phnom Penh (WPP)');
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
    setClaimTime(item.claimTime || '');
    setClaimTimeAmPm(item.claimTimeAmPm || 'am');
    setClaimPlace(item.claimPlace || '');
    setClaimDescription(item.claimDescription || '');
    setInjuryCircumstances(item.injuryCircumstances || '');
    setClaimAmountRiel(item.claimAmountRiel || '');
    setClaimExpenseAmount(item.claimExpenseAmount || 0);
    setClaimDocuments(item.claimDocuments || '');
    
    setPreviouslyClaimed(item.previouslyClaimed || 'No');
    setPreviouslyClaimedDetails(item.previouslyClaimedDetails || '');
    
    setDocStudentInsuranceCard(!!item.docStudentInsuranceCard);
    setDocPoliceReport(!!item.docPoliceReport);
    setDocDeathCertificate(!!item.docDeathCertificate);
    setDocMedicalReport(!!item.docMedicalReport);
    setDocMedicalInvoice(!!item.docMedicalInvoice);
    
    setStudentSigned(item.studentSigned);
    setStudentSignatureName(item.studentSignatureName || '');
    setParentSigned(item.parentSigned);
    setParentSignatureName(item.parentSignatureName || '');
    setSchoolRepresentativeSigned(item.schoolRepresentativeSigned);
    setSchoolRepresentativeName(item.schoolRepresentativeName || '');
    setDeclarationDate(item.declarationDate);
    
    setClaimantSignatureName(item.claimantSignatureName || '');
    setClaimantSignatureDate(item.claimantSignatureDate || '');
    
    setDateSubmittedToCentral(item.dateSubmittedToCentral || '');
    setDateReceivedByCentral(item.dateReceivedByCentral || '');
    setSentByName(item.sentByName || '');
    setSentByPosition(item.sentByPosition || '');
    setSentBySigned(!!item.sentBySigned);
    
    setReceivedBy(item.receivedBy);
    setReceivedByPosition(item.receivedByPosition || 'ប្រធានផ្នែករដ្ឋបាល');
    setReceivedBySigned(!!item.receivedBySigned);
    setDateReceived(item.dateReceived);
    
    setApproved1Name(item.approved1Name || 'ហេង សំបូរ (នាយកសាលា)');
    setApproved1Position(item.approved1Position || 'នាយកសាលា');
    setApproved1Signed(!!item.approved1Signed);
    
    setApproved2Name(item.approved2Name || 'ជា វណ្ណា (ប្រធានប្រតិបត្តិ)');
    setApproved2Position(item.approved2Position || 'ប្រធានប្រតិបត្តិការ');
    setApproved2Signed(!!item.approved2Signed);
    
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
      campusBranch,
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
      claimTime,
      claimTimeAmPm,
      claimPlace,
      claimDescription,
      injuryCircumstances,
      claimAmountRiel,
      claimExpenseAmount,
      claimDocuments,
      
      previouslyClaimed,
      previouslyClaimedDetails,
      
      docStudentInsuranceCard,
      docPoliceReport,
      docDeathCertificate,
      docMedicalReport,
      docMedicalInvoice,
      
      studentSigned,
      studentSignatureName: studentSignatureName || studentName.split(' ')[0],
      parentSigned,
      parentSignatureName: parentSignatureName || guardianName,
      schoolRepresentativeSigned,
      schoolRepresentativeName,
      declarationDate,
      
      claimantSignatureName,
      claimantSignatureDate,
      
      dateSubmittedToCentral,
      dateReceivedByCentral,
      sentByName,
      sentByPosition,
      sentBySigned,
      
      receivedBy,
      receivedByPosition,
      receivedBySigned,
      dateReceived,
      
      approved1Name,
      approved1Position,
      approved1Signed,
      
      approved2Name,
      approved2Position,
      approved2Signed,
      
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
    setDeleteTargetId(recordId);
  };

  const confirmDeleteRecord = () => {
    if (!deleteTargetId) return;
    const remaining = insurances.filter(ins => ins.id !== deleteTargetId);
    saveAndSyncInsurances(remaining);
    showToastMsg(`បានលុបទម្រង់ធានារ៉ាប់រង [${deleteTargetId}] ចេញពីប្រព័ន្ធរួចរាល់!`, 'info');
    setDeleteTargetId(null);
  };

  // Restore defaults
  const handleResetDefaults = () => {
    setIsResetConfirmOpen(true);
  };

  const confirmResetDefaults = () => {
    saveAndSyncInsurances(DEFAULT_INSURANCES);
    showToastMsg('បានកំណត់ឡើងវិញនូវប្រព័ន្ធធានារ៉ាប់រងសិស្សគំរូរួចរាល់!', 'success');
    setIsResetConfirmOpen(false);
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
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/10 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-moul tracking-normal text-slate-900 flex items-center gap-2">
                សន្លឹកគ្រប់គ្រងធានារ៉ាប់រងសិស្ស (Western Student Insurance Register)
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">Auto Recorded ✔</span>
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
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-805 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm shadow-emerald-700/15"
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
              
              {/* Advanced Option: Bot Setup */}
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      ប្រព័ន្ធស្វ័យប្រវត្ត (Bot Agent)
                    </span>
                    <h4 className="text-sm font-black text-slate-800">
                      ផ្ញើដោយស្វ័យប្រវត្តិតាមរយៈ Telegram Bot API
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowTelegramSettings(!showTelegramSettings)}
                    className="text-xs font-black text-slate-600 hover:text-emerald-600 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl transition flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    {showTelegramSettings ? 'លាក់ការកំណត់' : 'កំណត់អត្តសញ្ញាណ'}
                  </button>
                </div>

                {/* Configuration Fields */}
                {(showTelegramSettings || (!telegramBotToken || !telegramChatId)) && (
                  <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-4 text-xs animate-fade-in">
                    <div className="space-y-1 bg-emerald-50/50 border border-emerald-100/60 p-3 rounded-lg">
                      <p className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                        <Key className="w-4 h-4 text-emerald-600" /> ជំនួយណែនាំ៖
                      </p>
                      <ol className="list-decimal pl-4 mt-1 space-y-1.5 font-medium text-slate-600 text-[11px] leading-relaxed">
                        <li>ផ្ញើរសារទៅកាន់ <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline">@BotFather</a> ដើម្បីទទួលបាន <b>Bot Token</b></li>
                        <li>បង្កើត Telegram Group / Channel រួចបន្ថែម Bot នេះចូល</li>
                        <li>ស្វែងរក Chat ID (ដូចជាប្រើប្រាស់ <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline">@userinfobot</a>)</li>
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-[11px] focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-700 mb-1">Telegram Chat ID</label>
                        <input
                          type="text"
                          placeholder="ឧ. -100123456789"
                          value={telegramChatId}
                          onChange={(e) => handleSaveTelegramConfig(telegramBotToken, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono text-[11px] focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
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
                      <span className="text-[11px] font-bold text-emerald-650 animate-pulse flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
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
                    className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs px-6 py-3 rounded-xl border border-emerald-500 shadow-md transition-all scale-100 active:scale-95 cursor-pointer"
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

        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-emerald-950 to-slate-900 p-4 rounded-2xl text-white shadow-xs">
          <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest text-emerald-200/80">បុព្វលាភសរុប (Premiums)</p>
          <div className="flex items-baseline gap-0.5 mt-1">
            <span className="text-2xl font-mono font-black text-amber-400">${totalValueSumUsd}</span>
            <span className="text-[10px] text-emerald-300 font-bold">USD</span>
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
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 transition"
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
            <option value="All">សាលាវេស្ទើនអន្តរជាតិ</option>
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
                            ID: <span className="font-bold text-slate-700">{item.studentId}</span> • ភេទ៖ <span className="font-bold text-slate-700">{item.gender}</span> • Class: <span className="font-semibold text-emerald-700">{item.gradeClass}</span>
                          </p>
                          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
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
                          <p className="font-bold text-emerald-950 font-mono text-[11px]">{item.policyNumber}</p>
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

      <StudentInsuranceViewModal
        isOpen={!!viewingPolicy}
        onClose={() => setViewingPolicy(null)}
        viewingPolicy={viewingPolicy}
      />

      <StudentInsuranceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingPolicy={editingPolicy}
        showToastMsg={showToastMsg}
        onSave={(payload) => {
          if (editingPolicy) {
            const updated = insurances.map(ins => ins.id === editingPolicy.id ? payload : ins);
            saveAndSyncInsurances(updated);
            showToastMsg(`ព័ត៌មានធានារ៉ាប់រងសិស្ស ${payload.studentName} ត្រូវបានកែប្រែស្វ័យប្រវត្ត (Auto-Saved)`, 'success');
          } else {
            const exists = insurances.some(ins => ins.id === payload.id);
            if (exists) {
              showToastMsg(`កូដសម្គាល់ធានារ៉ាប់រង "${payload.id}" នេះមានរួចរាល់ហើយក្នុងប្រព័ន្ធ។`, 'danger');
              return;
            }
            const updated = [payload, ...insurances];
            saveAndSyncInsurances(updated);
            showToastMsg(`បានបង្កើតទម្រង់ធានារ៉ាប់រងសិស្សថ្មី [${payload.id}] រួចរាល់!`, 'success');
          }
          setIsModalOpen(false);
        }}
      />

      {/* Embedded Floating Toast notification container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce duration-300">
          <div className="px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-2.5 border text-xs font-black text-white bg-slate-900 border-slate-700 shadow-slate-950/20">
            <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <div>{toast.message}</div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-250 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="text-sm font-black font-moul">បញ្ជាក់ការលុបព័ត៌មាន (Confirm Delete)</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              តើលោកអ្នកប្រាកដជាចង់លុបចោលទិន្នន័យធានារ៉ាប់រងកូដ <span className="font-mono font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">{deleteTargetId}</span> នេះមែនទេ? រាល់ការលុបនឹងមិនអាចត្រឡប់ថយក្រោយវិញបានទេ ហើយប្រព័ន្ធនឹងកត់ត្រាស្វ័យប្រវត្ត!
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 border border-slate-250 text-slate-550 rounded-xl hover:bg-slate-50 transition text-[11.5px] font-bold cursor-pointer"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                onClick={confirmDeleteRecord}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition text-[11.5px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>បាទ/ចាស លុបចោល (Yes, Delete)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-250 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black font-moul">ការកំណត់ឡើងវិញ (Restore Defaults)</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              តើលោកអ្នកពិតជាចង់លុបទិន្នន័យចាស់ទាំងអស់ ហើយកែប្រែទៅទិន្នន័យគំរូធានារ៉ាប់រងដើមរបស់សាលាវិញមែនទេ?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 border border-slate-250 text-slate-550 rounded-xl hover:bg-slate-50 transition text-[11.5px] font-bold cursor-pointer"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                onClick={confirmResetDefaults}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition text-[11.5px] font-bold cursor-pointer"
              >
                យល់ព្រម (Yes, Reset)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
