import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, User, Phone, HeartPulse, FileText, Landmark, Check, AlertTriangle
} from 'lucide-react';
import { StudentInsurance, InsuranceStatus } from '../types';

interface StudentInsuranceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPolicy: StudentInsurance | null;
  onSave: (payload: StudentInsurance) => void;
  showToastMsg: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export const StudentInsuranceFormModal: React.FC<StudentInsuranceFormModalProps> = ({
  isOpen,
  onClose,
  editingPolicy,
  onSave,
  showToastMsg
}) => {
  // Local Form state variables
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
  const [premiumAmount, setPremiumAmount] = useState<number>(85);

  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyAltPhone, setEmergencyAltPhone] = useState('');

  const [bloodType, setBloodType] = useState('O');
  const [allergies, setAllergies] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');

  // Incident & Claim Details
  const [claimDate, setClaimDate] = useState('');
  const [claimTime, setClaimTime] = useState('');
  const [claimTimeAmPm, setClaimTimeAmPm] = useState<'am' | 'pm'>('am');
  const [claimPlace, setClaimPlace] = useState('');
  const [claimHospital, setClaimHospital] = useState('');
  const [claimDescription, setClaimDescription] = useState('');
  const [injuryCircumstances, setInjuryCircumstances] = useState('');
  const [claimExpenseAmount, setClaimExpenseAmount] = useState<number>(0);
  const [claimAmountRiel, setClaimAmountRiel] = useState('');
  const [claimDocuments, setClaimDocuments] = useState('');

  const [previouslyClaimed, setPreviouslyClaimed] = useState<'Yes' | 'No'>('No');
  const [previouslyClaimedDetails, setPreviouslyClaimedDetails] = useState('');

  // Required Supporting Documents Supplied checklists
  const [docStudentInsuranceCard, setDocStudentInsuranceCard] = useState(false);
  const [docPoliceReport, setDocPoliceReport] = useState(false);
  const [docDeathCertificate, setDocDeathCertificate] = useState(false);
  const [docMedicalReport, setDocMedicalReport] = useState(false);
  const [docMedicalInvoice, setDocMedicalInvoice] = useState(false);

  // Signatures State
  const [studentSigned, setStudentSigned] = useState(true);
  const [studentSignatureName, setStudentSignatureName] = useState('');
  const [parentSigned, setParentSigned] = useState(true);
  const [parentSignatureName, setParentSignatureName] = useState('');
  const [schoolRepresentativeSigned, setSchoolRepresentativeSigned] = useState(true);
  const [schoolRepresentativeName, setSchoolRepresentativeName] = useState('ហេង សំបូរ (នាយកសាលា)');
  const [declarationDate, setDeclarationDate] = useState('');

  const [claimantSignatureName, setClaimantSignatureName] = useState('');
  const [claimantSignatureDate, setClaimantSignatureDate] = useState('');

  // Office route tracking
  const [dateSubmittedToCentral, setDateSubmittedToCentral] = useState('');
  const [dateReceivedByCentral, setDateReceivedByCentral] = useState('');

  const [sentByName, setSentByName] = useState('លី សូដា (រដ្ឋបាល)');
  const [sentByPosition, setSentByPosition] = useState('មន្ត្រីរដ្ឋបាលសាខា');
  const [sentBySigned, setSentBySigned] = useState(true);

  const [receivedBy, setReceivedBy] = useState('ជា វណ្ណា (ប្រធានផ្នែករដ្ឋបាល)');
  const [receivedByPosition, setReceivedByPosition] = useState('ប្រធានផ្នែករដ្ឋបាល');
  const [receivedBySigned, setReceivedBySigned] = useState(true);
  const [dateReceived, setDateReceived] = useState('');

  const [approved1Name, setApproved1Name] = useState('ហេង សំបូរ');
  const [approved1Position, setApproved1Position] = useState('នាយកសាលា');
  const [approved1Signed, setApproved1Signed] = useState(true);

  const [approved2Name, setApproved2Name] = useState('សាយ ផល្លា');
  const [approved2Position, setApproved2Position] = useState('ប្រធានប្រតិបត្តិ');
  const [approved2Signed, setApproved2Signed] = useState(false);

  const [claimStatus, setClaimStatus] = useState<InsuranceStatus>('Approved');
  const [officeRemarks, setOfficeRemarks] = useState('សំណុំឯកសារធានារ៉ាប់រងសិស្សត្រូវបានផ្ទៀងផ្ទាត់ និងកត់ត្រាជោគជ័យ។');

  // Trigger load if editing policy changes
  useEffect(() => {
    if (editingPolicy) {
      setId(editingPolicy.id);
      setCampusBranch(editingPolicy.campusBranch || 'Western Phnom Penh (WPP)');
      setStudentName(editingPolicy.studentName || '');
      setStudentId(editingPolicy.studentId || '');
      setGender(editingPolicy.gender || 'ប្រុស');
      setDob(editingPolicy.dob || '');
      setGradeClass(editingPolicy.gradeClass || '');
      setAcademicYear(editingPolicy.academicYear || '2025-2026');
      setNationality(editingPolicy.nationality || 'ខ្មែរ (Khmer)');
      setPhoto(editingPolicy.photo || '');

      setGuardianName(editingPolicy.guardianName || '');
      setGuardianRelationship(editingPolicy.guardianRelationship || '');
      setGuardianPhone(editingPolicy.guardianPhone || '');
      setGuardianAddress(editingPolicy.guardianAddress || '');
      setGuardianOccupation(editingPolicy.guardianOccupation || '');

      setPolicyNumber(editingPolicy.policyNumber || '');
      setProvider(editingPolicy.provider || 'Forte Insurance');
      setCoverageType(editingPolicy.coverageType || 'គ្រោះថ្នាក់បុគ្គល និងការព្យាបាលជំងឺ (Personal Accident & Medical)');
      setEffectiveDate(editingPolicy.effectiveDate || '');
      setExpiryDate(editingPolicy.expiryDate || '');
      setPremiumAmount(editingPolicy.premiumAmount || 85);

      setEmergencyName(editingPolicy.emergencyName || '');
      setEmergencyRelationship(editingPolicy.emergencyRelationship || '');
      setEmergencyPhone(editingPolicy.emergencyPhone || '');
      setEmergencyAltPhone(editingPolicy.emergencyAltPhone || '');

      setBloodType(editingPolicy.bloodType || 'O');
      setAllergies(editingPolicy.allergies || '');
      setMedicalConditions(editingPolicy.medicalConditions || '');
      setCurrentMedications(editingPolicy.currentMedications || '');

      setClaimDate(editingPolicy.claimDate || '');
      setClaimTime(editingPolicy.claimTime || '');
      setClaimTimeAmPm(editingPolicy.claimTimeAmPm || 'am');
      setClaimPlace(editingPolicy.claimPlace || '');
      setClaimHospital(editingPolicy.claimHospital || '');
      setClaimDescription(editingPolicy.claimDescription || '');
      setInjuryCircumstances(editingPolicy.injuryCircumstances || '');
      setClaimExpenseAmount(editingPolicy.claimExpenseAmount || 0);
      setClaimAmountRiel(editingPolicy.claimAmountRiel || '');
      setClaimDocuments(editingPolicy.claimDocuments || '');

      setPreviouslyClaimed(editingPolicy.previouslyClaimed || 'No');
      setPreviouslyClaimedDetails(editingPolicy.previouslyClaimedDetails || '');

      setDocStudentInsuranceCard(!!editingPolicy.docStudentInsuranceCard);
      setDocPoliceReport(!!editingPolicy.docPoliceReport);
      setDocDeathCertificate(!!editingPolicy.docDeathCertificate);
      setDocMedicalReport(!!editingPolicy.docMedicalReport);
      setDocMedicalInvoice(!!editingPolicy.docMedicalInvoice);

      setStudentSigned(editingPolicy.studentSigned !== false);
      setStudentSignatureName(editingPolicy.studentSignatureName || '');
      setParentSigned(editingPolicy.parentSigned !== false);
      setParentSignatureName(editingPolicy.parentSignatureName || '');
      setSchoolRepresentativeSigned(editingPolicy.schoolRepresentativeSigned !== false);
      setSchoolRepresentativeName(editingPolicy.schoolRepresentativeName || 'ហេង សំបូរ (នាយកសាលា)');
      setDeclarationDate(editingPolicy.declarationDate || '');

      setClaimantSignatureName(editingPolicy.claimantSignatureName || '');
      setClaimantSignatureDate(editingPolicy.claimantSignatureDate || '');

      setDateSubmittedToCentral(editingPolicy.dateSubmittedToCentral || '');
      setDateReceivedByCentral(editingPolicy.dateReceivedByCentral || '');

      setSentByName(editingPolicy.sentByName || 'លី សូដា (រដ្ឋបាល)');
      setSentByPosition(editingPolicy.sentByPosition || 'មន្ត្រីរដ្ឋបាលសាខា');
      setSentBySigned(editingPolicy.sentBySigned !== false);

      setReceivedBy(editingPolicy.receivedBy || 'ជា វណ្ណា (ប្រធានផ្នែករដ្ឋបាល)');
      setReceivedByPosition(editingPolicy.receivedByPosition || 'ប្រធានផ្នែករដ្ឋបាល');
      setReceivedBySigned(editingPolicy.receivedBySigned !== false);
      setDateReceived(editingPolicy.dateReceived || '');

      setApproved1Name(editingPolicy.approved1Name || 'ហេង សំបូរ');
      setApproved1Position(editingPolicy.approved1Position || 'នាយកសាលា');
      setApproved1Signed(editingPolicy.approved1Signed !== false);

      setApproved2Name(editingPolicy.approved2Name || 'សាយ ផល្លា');
      setApproved2Position(editingPolicy.approved2Position || 'ប្រធានប្រតិបត្តិ');
      setApproved2Signed(!!editingPolicy.approved2Signed);

      setClaimStatus(editingPolicy.claimStatus || 'Approved');
      setOfficeRemarks(editingPolicy.officeRemarks || 'សំណុំឯកសារធានារ៉ាប់រងសិស្សត្រូវបានផ្ទៀងផ្ទាត់ និងកត់ត្រាជោគជ័យ។');
    } else {
      // Clear fields for a brand new claimant policy form
      const newId = `WIS-INS-${Math.floor(100 + Math.random() * 900)}`;
      setId(newId);
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

      setPolicyNumber(`WIS-FORTE-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      setProvider('Forte Insurance');
      setCoverageType('គ្រោះថ្នាក់បុគ្គល និងការព្យាបាលជំងឺ (Personal Accident & Medical)');
      setEffectiveDate(new Date().toISOString().split('T')[0]);
      // set expiry 1 year later
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      setExpiryDate(d.toISOString().split('T')[0]);
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
      setClaimHospital('');
      setClaimDescription('');
      setInjuryCircumstances('');
      setClaimExpenseAmount(0);
      setClaimAmountRiel('');
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

      setSentByName('លី សូដា (រដ្ឋបាល)');
      setSentByPosition('មន្ត្រីរដ្ឋបាលសាខា');
      setSentBySigned(true);

      setReceivedBy('ជា វណ្ណា (ប្រធានផ្នែករដ្ឋបាល)');
      setReceivedByPosition('ប្រធានផ្នែករដ្ឋបាល');
      setReceivedBySigned(true);
      setDateReceived(new Date().toISOString().split('T')[0]);

      setApproved1Name('ហេង សំបូរ');
      setApproved1Position('នាយកសាលា');
      setApproved1Signed(true);

      setApproved2Name('សាយ ផល្លា');
      setApproved2Position('ប្រធានប្រតិបត្តិ');
      setApproved2Signed(false);

      setClaimStatus('Approved');
      setOfficeRemarks('សំណុំឯកសារត្រូវបានបញ្ចូលថ្មីក្នុងប្រព័ន្ធ។');
    }
  }, [editingPolicy, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
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
      claimHospital,
      claimDescription,
      injuryCircumstances,
      claimExpenseAmount,
      claimAmountRiel,
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

      claimantSignatureName: claimantSignatureName || studentName.split(' ')[0],
      claimantSignatureDate: claimantSignatureDate || new Date().toISOString().split('T')[0],

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

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-40">
      <div className="bg-white border text-left border-slate-200 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-indigo-400">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-moul text-xs md:text-sm text-white tracking-normal leading-relaxed">
              {editingPolicy ? `កែប្រែបែបបទធានារ៉ាប់រង ID: ${id}` : 'បន្ថែមបែបបទស្នើសុំសំណងធានារ៉ាប់រងថ្មី (New Claim Form)'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition cursor-pointer text-xs font-semibold px-2 py-1 bg-slate-800 rounded-lg"
          >
            បិទ (Close)
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto space-y-6 text-xs font-semibold">
          
          {/* Top Banner Campus Selection */}
          <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-slate-800 font-extrabold text-[12px] font-sans">សាខាសាលា (Campus / Branch):</span>
            <select
              value={campusBranch}
              onChange={(e) => setCampusBranch(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Western Phnom Penh (WPP)">Western Phnom Penh (WPP) - សាខាភ្នំពេញ</option>
              <option value="Western Siem Reap (WSR)">Western Siem Reap (WSR) - សាខាសៀមរាប</option>
              <option value="Western Battambang (WBB)">Western Battambang (WBB) - សាខាបាត់ដំបង</option>
              <option value="Western Sihanoukville (WSH)">Western Sihanoukville (WSH) - សាខាព្រះសីហនុ</option>
            </select>
          </div>

          {/* Section 1: Insured's Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="font-extrabold text-[12px] text-slate-900 font-moul tracking-normal border-b border-slate-250 pb-2 flex items-center gap-1.5 text-indigo-950">
              <User className="w-4 h-4 text-indigo-700" />
              <span>១. ព័ត៌មានលម្អិតអ្នកត្រូវបានធានារ៉ាប់រង (Insured's Details)</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-500 mb-1">ឈ្មោះអ្នកត្រូវបានធានារ៉ាប់រង Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. សុក សាន"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">លេខសម្គាល់សិស្ស Student ID *</label>
                <input
                  type="text"
                  required
                  placeholder="WIS-STU-XXXX"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 focus:outline-hidden font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">ភេទ Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                >
                  <option value="ប្រុស">ប្រុស (Male)</option>
                  <option value="ស្រី">ស្រី (Female)</option>
                  <option value="Male">Male(EN)</option>
                  <option value="Female">Female(EN)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">ថ្ងៃខែឆ្នាំកំណើត DOB *</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 font-mono focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">ថ្នាក់ទី Grade *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. Grade 8A"
                  value={gradeClass}
                  onChange={(e) => setGradeClass(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">ឆ្នាំសិក្សា Academic Year *</label>
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-855 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">សញ្ជាតិ Nationality *</label>
                <input
                  type="text"
                  required
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">តំណភ្ជាប់រូបថតសិស្ស Student Photo URL</label>
                <input
                  type="text"
                  placeholder="https://image-url"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-700 font-mono focus:outline-hidden"
                />
              </div>
            </div>

            {/* Parent/Guardian Details Subsection */}
            <div className="border-t border-slate-200 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-500 mb-1">ឈ្មោះអាណាព្យាបាល Guardian Name *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. សុកជា"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">ត្រូវជា (Relationship) *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. ឪពុក"
                  value={guardianRelationship}
                  onChange={(e) => setGuardianRelationship(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">លេខទូរស័ព្ទទាក់ទង Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. 012 345 678"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">មុខរបរអាណាព្យាបាល Occupation *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. អាជីវករ"
                  value={guardianOccupation}
                  onChange={(e) => setGuardianOccupation(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-500 mb-1">អាសយដ្ឋានបច្ចុប្បន្ន Current Address *</label>
                <input
                  type="text"
                  required
                  placeholder="ផ្ទះលេខ ផ្លូវ សង្កាត់ ខណ្ឌ..."
                  value={guardianAddress}
                  onChange={(e) => setGuardianAddress(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Policy Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/85 space-y-4">
            <h4 className="font-extrabold text-[12px] text-slate-900 font-moul tracking-normal border-b border-slate-250 pb-2 flex items-center gap-1.5 text-indigo-950">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>២. ព័ត៌មានលម្អិតប័ណ្ណធានារ៉ាប់រង (Insurance Policy Details)</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-500 mb-1">លេខប័ណ្ណសន្យារ៉ាប់រង Policy Number *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. WIS-FORTE-XXXX"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 font-bold font-mono focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">ក្រុមហ៊ុនធានា Provider *</label>
                <input
                  type="text"
                  required
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">ប្រភេទធានា Coverage Type *</label>
                <input
                  type="text"
                  required
                  value={coverageType}
                  onChange={(e) => setCoverageType(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">ថ្ងៃចាប់ផ្តើមធានា Effective Date *</label>
                <input
                  type="date"
                  required
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">ថ្ងៃផុតកំណត់ធានា Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">តម្លៃបុព្វលាភ Premium Fee ($ USD)</label>
                <input
                  type="number"
                  required
                  value={premiumAmount}
                  onChange={(e) => setPremiumAmount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-emerald-600 font-bold font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Contacts */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
            <h4 className="font-extrabold text-[12px] text-slate-900 font-moul tracking-normal border-b border-slate-250 pb-2 flex items-center gap-1.5 text-indigo-950">
              <Phone className="w-4 h-4 text-indigo-700" />
              <span>៣. ព័ត៌មានទំនាក់ទំនងអាសន្ន (Emergency Contacts)</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-500 mb-1">ឈ្មោះអ្នកទាក់ទង Name *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. សុកជា"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">ត្រូវជា (Relationship) *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. ឪពុក"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">លេខទូរស័ព្ទចម្បង Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. 012 345 678"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">ទូរស័ព្ទបន្ថែម Alt Phone</label>
                <input
                  type="text"
                  placeholder="098 XX XX XX"
                  value={emergencyAltPhone}
                  onChange={(e) => setEmergencyAltPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850"
                />
              </div>
            </div>
          </div>

          {/* Section 4 & 5 Grid: Supporting Documents Checklists & Medical Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Required Supporting Documents checklist (Section 4) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <h4 className="font-extrabold text-[12px] text-slate-900 font-moul tracking-normal border-b border-slate-250 pb-2 flex items-center gap-1.5 text-indigo-950">
                <FileText className="w-4 h-4 text-indigo-700" />
                <span>៤. ឯកសារភស្តុតាងដែលបានផ្តល់ជូន (Supporting Docs Checklist)</span>
              </h4>
              <div className="flex flex-col gap-2 pt-1.5">
                <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-250 hover:bg-indigo-50/20 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={docStudentInsuranceCard}
                    onChange={(e) => setDocStudentInsuranceCard(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>1. Copy of student's insurance card (ច្បាប់ថតចម្លងបណ្ណធានារ៉ាប់រង)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 hover:bg-indigo-50/20 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={docPoliceReport}
                    onChange={(e) => setDocPoliceReport(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>2. Police report (if due to traffic accident / ឯកសារប៉ូលីស)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 hover:bg-indigo-50/20 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={docDeathCertificate}
                    onChange={(e) => setDocDeathCertificate(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>3. Official death certificate (if death case / វិញ្ញាបនបត្រមរណភាព)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 hover:bg-indigo-50/20 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={docMedicalReport}
                    onChange={(e) => setDocMedicalReport(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>4. Medical report / certificate of treatment (លិខិតបញ្ជាក់ពេទ្យ)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 hover:bg-indigo-50/20 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={docMedicalInvoice}
                    onChange={(e) => setDocMedicalInvoice(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>5. Medical certificate and original treatment invoices (វិក្កយបត្រច្បាប់ដើម)</span>
                </label>
              </div>
            </div>

            {/* Medical Info Section (Section 5) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
              <h4 className="font-extrabold text-[12px] text-slate-900 font-moul tracking-normal border-b border-slate-250 pb-2 flex items-center gap-1.5 text-indigo-950">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <span>៥. ព័ត៌មានសុខភាព (Medical Information)</span>
              </h4>
              
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-500 mb-1">ក្រុមឈាម Blood Type *</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-hidden"
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
                    placeholder="ឧ. គ្មាន"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-500 mb-1">ជំងឺប្រចាំកាយ (Existing Conditions)</label>
                  <input
                    type="text"
                    placeholder="ឧ. គ្មាន"
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-500 mb-1">ថ្នាំកំពុងប្រើប្រចាំថ្ងៃ (Medication)</label>
                  <input
                    type="text"
                    placeholder="ឧ. គ្មាន"
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Claim Information */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
            <h4 className="font-extrabold text-[12px] text-slate-900 font-moul tracking-normal border-b border-slate-250 pb-2 flex items-center gap-1.5 text-indigo-950">
              <FileText className="w-4 h-4 text-indigo-755" />
              <span>៦. ព័ត៌មានស្នើសុំសំណង (Claim Information - បំពេញពេលកើតហេតុ)</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-500 mb-1">ថ្ងៃកើតហេតុ Date *</label>
                <input
                  type="date"
                  value={claimDate}
                  onChange={(e) => setClaimDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">ម៉ោងកើតហេតុ Time</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="ឧ. 10:30"
                    value={claimTime}
                    onChange={(e) => setClaimTime(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-center"
                  />
                  <select
                    value={claimTimeAmPm}
                    onChange={(e) => setClaimTimeAmPm(e.target.value as any)}
                    className="bg-white border border-slate-300 rounded-xl text-slate-800 px-2"
                  >
                    <option value="am">AM</option>
                    <option value="pm">PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">ទីកន្លែងកើតហេតុ Place</label>
                <input
                  type="text"
                  placeholder="ឧ. ទីធ្លារត់លេងសាលា"
                  value={claimPlace}
                  onChange={(e) => setClaimPlace(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">សម្រាកព្យាបាលនៅ Hospital</label>
                <input
                  type="text"
                  placeholder="ឧ. មន្ទីរពេទ្យព្រះកុសុមៈ"
                  value={claimHospital}
                  onChange={(e) => setClaimHospital(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">ចំណាយថ្លៃព្យាបាល ($ USD)</label>
                <input
                  type="number"
                  value={claimExpenseAmount}
                  onChange={(e) => setClaimExpenseAmount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-indigo-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">សំណងស្នើនឹងរៀល Claim Amount Riel</label>
                <input
                  type="text"
                  placeholder="ឧ. 500,000 ៛"
                  value={claimAmountRiel}
                  onChange={(e) => setClaimAmountRiel(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-500 mb-1">ស្ថានភាពរបួស/ស្ថានភាពគ្រោះថ្នាក់ (Injury State)</label>
                <input
                  type="text"
                  placeholder="ឧ. មុតកញ្ចក់របួសដៃស្តាំ ដេរ៥ថ្នេរ..."
                  value={injuryCircumstances}
                  onChange={(e) => setInjuryCircumstances(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-500 mb-1">ពិពណ៌នាហេតុការណ៍លម្អិត (Incident Description)</label>
                <textarea
                  rows={2}
                  placeholder="ពន្យល់ពីរបៀបកើតហេតុ បណ្តាលមកពីអ្វីលម្អិត..."
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-slate-500 mb-1">ធ្លាប់ទាមទារសំណងពីមុន?</label>
                <select
                  value={previouslyClaimed}
                  onChange={(e) => setPreviouslyClaimed(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800"
                >
                  <option value="No">ទេ (No)</option>
                  <option value="Yes">បាទ/ចាស (Yes)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-500 mb-1">ព័ត៌មានបន្ថែមនៃការធ្លាប់ទាមទារសំណងពីមុន</label>
                <input
                  type="text"
                  disabled={previouslyClaimed === 'No'}
                  placeholder="បញ្ចូលកាលបរិច្ឆេទ ឬទឹកប្រាក់..."
                  value={previouslyClaimedDetails}
                  onChange={(e) => setPreviouslyClaimedDetails(e.target.value)}
                  className="w-full bg-white disabled:bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-500 mb-1">ឈ្មោះឯកសារភ្ជាប់ / វិក្កយបត្រ (Supporting uploaded documents list)</label>
                <input
                  type="text"
                  placeholder="ឧ. bills_receipts.pdf, injury.jpg"
                  value={claimDocuments}
                  onChange={(e) => setClaimDocuments(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-indigo-750 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 7: Declaration / signatures */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
            <h4 className="font-extrabold text-[12px] text-slate-900 font-moul tracking-normal border-b border-slate-250 pb-2 flex items-center gap-1.5 text-indigo-950">
              <FileText className="w-4.5 h-4.5 text-indigo-750" />
              <span>៧. ការបញ្ជាក់ និងហត្ថលេខា (Declaration & Signatures)</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 mb-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={studentSigned}
                    onChange={(e) => setStudentSigned(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>សាមីខ្លួនយល់ព្រម</span>
                </label>
                <input
                  type="text"
                  placeholder="ឈ្មោះសាមីខ្លួន"
                  value={studentSignatureName}
                  onChange={(e) => setStudentSignatureName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px]"
                />
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 mb-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parentSigned}
                    onChange={(e) => setParentSigned(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>អាណាព្យាបាលយល់ព្រម</span>
                </label>
                <input
                  type="text"
                  placeholder="ឈ្មោះអាណាព្យាបាល"
                  value={parentSignatureName}
                  onChange={(e) => setParentSignatureName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px]"
                />
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 mb-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={schoolRepresentativeSigned}
                    onChange={(e) => setSchoolRepresentativeSigned(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>តំណាងសាលាយល់ព្រម</span>
                </label>
                <input
                  type="text"
                  placeholder="ឈ្មោះតំណាងសាលា"
                  value={schoolRepresentativeName}
                  onChange={(e) => setSchoolRepresentativeName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">កាលបរិច្ឆេទការបញ្ជាក់ Date</label>
                <input
                  type="date"
                  value={declarationDate}
                  onChange={(e) => setDeclarationDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-850 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 mb-1">ហត្ថលេខាអ្នកទាមទារ (Claimant Signature/Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="បញ្ចូលឈ្មោះអ្នកបំពេញបែបបទ"
                  value={claimantSignatureName}
                  onChange={(e) => setClaimantSignatureName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">ថ្ងៃចុះហត្ថលេខាអ្នកទាមទារ Date Claimant Signed</label>
                <input
                  type="date"
                  value={claimantSignatureDate}
                  onChange={(e) => setClaimantSignatureDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-850 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 8: Office Use Only */}
          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-150 space-y-4">
            <h4 className="font-extrabold text-[12px] text-indigo-950 font-moul tracking-normal border-b border-indigo-200 pb-2 flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-indigo-900" />
              <span>៨. សម្រាប់ការិយាល័យសាលា (Office Use Only)</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-indigo-955 mb-1">មន្ត្រីទទួលឯកសារ (Received By) *</label>
                <input
                  type="text"
                  required
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-indigo-955 mb-1">ថ្ងៃទីទទួលឯកសារ Date Received *</label>
                <input
                  type="date"
                  required
                  value={dateReceived}
                  onChange={(e) => setDateReceived(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-850 font-mono"
                />
              </div>

              <div>
                <label className="block text-indigo-955 mb-1">ស្ថានភាពសំណង (Claim Status) *</label>
                <select
                  value={claimStatus}
                  onChange={(e) => setClaimStatus(e.target.value as InsuranceStatus)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 font-bold"
                >
                  <option value="Approved">យល់ព្រមសំណង (Approved)</option>
                  <option value="Pending">កំពុងត្រួតពិនិត្យ (Pending)</option>
                  <option value="Rejected">បដិសេធចោល (Rejected)</option>
                  <option value="None">គ្មានសំណើ (None)</option>
                </select>
              </div>

              <div>
                <label className="block text-indigo-955 mb-1">ថ្ងៃបញ្ជូនទៅការិយាល័យកណ្តាល Date Submitted</label>
                <input
                  type="date"
                  value={dateSubmittedToCentral}
                  onChange={(e) => setDateSubmittedToCentral(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-850 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-indigo-200/50 pt-2.5">
              <div>
                <label className="block text-indigo-900 mb-1">អាណត្តិបញ្ជាក់ ១ (Approved by Principal) *</label>
                <input
                  type="text"
                  required
                  value={approved1Name}
                  onChange={(e) => setApproved1Name(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-indigo-900 mb-1">អាណត្តិបញ្ជាក់ ២ (Approved by Executive) *</label>
                <input
                  type="text"
                  required
                  value={approved2Name}
                  onChange={(e) => setApproved2Name(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800"
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="appr1sig"
                  checked={approved1Signed}
                  onChange={(e) => setApproved1Signed(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="appr1sig" className="text-indigo-950 font-bold select-none cursor-pointer">នាយកសាលាបានចុះហត្ថលេខា</label>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-indigo-900 mb-1">ចំណារចំណាំមន្ត្រីរដ្ឋបាល (Office Remarks / Notes)</label>
              <textarea
                rows={2}
                placeholder="បញ្ចូលការសម្រេចចិត្ត សម្គាល់លម្អិត..."
                value={officeRemarks}
                onChange={(e) => setOfficeRemarks(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-850"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-150">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl font-bold cursor-pointer transition select-none"
            >
              បោះបង់ (Cancel)
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-700 hover:bg-indigo-805 text-white rounded-xl font-bold cursor-pointer transition select-none flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>រក្សាទុកបែបបទធានារ៉ាប់រង (Save Form)</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
