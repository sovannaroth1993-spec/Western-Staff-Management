import React from 'react';
import { 
  X, ShieldCheck, User, HeartPulse, FileText, Phone, Landmark, Check
} from 'lucide-react';
import { StudentInsurance } from '../types';

interface StudentInsuranceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewingPolicy: StudentInsurance | null;
}

export const StudentInsuranceViewModal: React.FC<StudentInsuranceViewModalProps> = ({
  isOpen,
  onClose,
  viewingPolicy
}) => {
  if (!isOpen || !viewingPolicy) return null;

  const data = viewingPolicy;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-40">
      <div className="bg-white border text-left border-slate-200 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-450" />
            <div>
              <h3 className="font-moul text-xs md:text-sm text-white tracking-normal leading-relaxed">
                មើលព័ត៌មានលម្អិតបែបបទធានារ៉ាប់រង ID: {data.id}
              </h3>
              <p className="text-[10px] text-slate-400 font-sans tracking-wide">
                Campus: {data.campusBranch} • Status: {data.claimStatus || 'Pending'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition font-sans text-xs font-bold leading-none cursor-pointer"
          >
            បិទ Close
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-xs text-slate-800">
          
          {/* Section 1: Insured's Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-[12px] text-indigo-950 font-moul tracking-normal border-b border-slate-200 pb-2.5 flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-indigo-600" />
              <span>១. ព័ត៌មានលម្អិតអ្នកត្រូវបានធានារ៉ាប់រង (Insured's Details)</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-4">
              <div>
                <span className="text-slate-500 block">ឈ្មោះសិស្ស (Student Name)</span>
                <span className="font-bold text-slate-900 text-sm">{data.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">លេខអត្តសញ្ញាណ (Student ID)</span>
                <span className="font-bold text-slate-900">{data.studentId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ភេទ (Gender) / ថ្ងៃខែឆ្នាំកំណើត (DOB)</span>
                <span className="font-bold text-slate-900">{data.gender} • {data.dob}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ថ្នាក់ទី (Grade / Class)</span>
                <span className="font-bold text-slate-900">{data.gradeClass}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ឆ្នាំសិក្សា (Academic Year)</span>
                <span className="font-bold text-slate-900">{data.academicYear}</span>
              </div>
              <div>
                <span className="text-slate-500 block">សញ្ជាតិ (Nationality)</span>
                <span className="font-bold text-slate-900">{data.nationality}</span>
              </div>
              <div className="md:col-span-3 border-t border-slate-100 pt-2.5 grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-4">
                <div>
                  <span className="text-slate-500 block">អាណាព្យាបាល (Guardian Name)</span>
                  <span className="font-bold text-indigo-950">{data.guardianName} ({data.guardianRelationship})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">លេខទូរស័ព្ទ (Guardian Phone)</span>
                  <span className="font-mono font-bold text-slate-900">{data.guardianPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">មុខរបរ (Guardian Occupation)</span>
                  <span className="font-bold text-slate-900">{data.guardianOccupation}</span>
                </div>
                <div className="md:col-span-3">
                  <span className="text-slate-500 block">អាសយដ្ឋាន (Guardian Address)</span>
                  <span className="font-semibold text-slate-900 block">{data.guardianAddress}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Policy Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-[12px] text-indigo-950 font-moul tracking-normal border-b border-slate-200 pb-2.5 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
              <span>២. ព័ត៌មានលម្អិតប័ណ្ណធានារ៉ាប់រង (Insurance Policy Details)</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-4">
              <div>
                <span className="text-slate-500 block">លេខប័ណ្ណសន្យារ៉ាប់រង (Policy Number)</span>
                <span className="font-mono font-bold text-blue-600 text-[13px]">{data.policyNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ក្រុមហ៊ុនធានា (Provider)</span>
                <span className="font-bold text-slate-905">{data.provider}</span>
              </div>
              <div>
                <span className="text-slate-500 block">គ្របដណ្តប់ (Coverage Type)</span>
                <span className="font-medium text-slate-800">{data.coverageType}</span>
              </div>
              <div>
                <span className="text-slate-500 block">កាលបរិច្ឆេទធានា (Effective Date)</span>
                <span className="font-mono font-semibold text-slate-900">{data.effectiveDate || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">កាលបរិច្ឆេទផុតកំណត់ (Expiry Date)</span>
                <span className="font-mono font-semibold text-rose-600">{data.expiryDate || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">តម្លៃបុព្វលាភធានា (Premium Amount)</span>
                <span className="font-bold text-emerald-600 font-mono">${data.premiumAmount} USD</span>
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Contacts */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-[12px] text-indigo-950 font-moul tracking-normal border-b border-slate-200 pb-2.5 flex items-center gap-2">
              <Phone className="w-4.5 h-4.5 text-indigo-600" />
              <span>៣. ព័ត៌មានទំនាក់ទំនងអាសន្ន (Emergency Contacts)</span>
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500 block">ឈ្មោះអ្នកទាក់ទង (Emergency Contact)</span>
                <span className="font-bold text-slate-900">{data.emergencyName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ត្រូវជា (Relationship)</span>
                <span className="font-bold text-slate-900">{data.emergencyRelationship}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ទូរស័ព្ទ (Contact Phone)</span>
                <span className="font-mono font-bold text-indigo-600">{data.emergencyPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ទូរស័ព្ទជំនួស (Alt Phone)</span>
                <span className="font-mono text-slate-700">{data.emergencyAltPhone || '—'}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Required Supporting Documents & Medical Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Supporting Documents Checklists */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-[12px] text-indigo-950 font-moul tracking-normal border-b border-slate-200 pb-2 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-indigo-600" />
                <span>៤. ឯកសារភស្តុតាងភ្ជាប់មកជាមួយ (Required Supporting Docs)</span>
              </h4>
              <ul className="space-y-2 mt-1.5">
                <li className="flex items-center gap-2.5">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${data.docStudentInsuranceCard ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-100 text-slate-300 border-slate-200'}`}>✓</span>
                  <span className={data.docStudentInsuranceCard ? 'text-slate-900 font-semibold' : 'text-slate-400'}>1. Copy of student's insurance card</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${data.docPoliceReport ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-100 text-slate-300 border-slate-200'}`}>✓</span>
                  <span className={data.docPoliceReport ? 'text-slate-900 font-semibold' : 'text-slate-400'}>2. Police report (if due to traffic accident)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${data.docDeathCertificate ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-100 text-slate-300 border-slate-200'}`}>✓</span>
                  <span className={data.docDeathCertificate ? 'text-slate-900 font-semibold' : 'text-slate-400'}>3. Official death certificate (if death case)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${data.docMedicalReport ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-100 text-slate-300 border-slate-200'}`}>✓</span>
                  <span className={data.docMedicalReport ? 'text-slate-900 font-semibold' : 'text-slate-400'}>4. Medical report / certificate of treatment</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${data.docMedicalInvoice ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-100 text-slate-300 border-slate-200'}`}>✓</span>
                  <span className={data.docMedicalInvoice ? 'text-slate-900 font-semibold' : 'text-slate-400'}>5. Medical certificate and original invoices</span>
                </li>
              </ul>
            </div>

            {/* Medical Info */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-[12px] text-indigo-950 font-moul tracking-normal border-b border-slate-200 pb-2 flex items-center gap-2">
                <HeartPulse className="w-4.5 h-4.5 text-rose-600" />
                <span>៥. ព័ត៌មានសុខភាព (Medical Information)</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-500 block">ក្រុមឈាម (Blood Type)</span>
                  <span className="text-slate-950 font-bold text-sm bg-rose-50 border border-rose-150 px-2.5 py-0.5 rounded-lg inline-block">{data.bloodType || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">អាលែកស៊ី (Allergies)</span>
                  <span className="text-slate-900 font-semibold">{data.allergies || 'គ្មាន (None)'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">ជំងឺប្រចាំកាយ (Existing Conditions)</span>
                  <span className="text-slate-900 font-semibold">{data.medicalConditions || 'គ្មាន (None)'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">ថ្នាំកំពុងប្រើ (Current Medication)</span>
                  <span className="text-slate-900 font-semibold">{data.currentMedications || 'គ្មាន (None)'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Section 6: Claim Information */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-[12px] text-indigo-950 font-moul tracking-normal border-b border-slate-200 pb-2.5 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-indigo-600" />
              <span>៦. ព័ត៌មានស្នើសុំសំណង (Claim Information - បំពេញពេលកើតហេតុ)</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-4">
              <div>
                <span className="text-slate-500 block">ថ្ងៃកន្លែងកើតហេតុ (Date / Place)</span>
                <span className="font-bold text-slate-900">{data.claimDate || '—'} {data.claimTime ? `@ ${data.claimTime} ${data.claimTimeAmPm || ''}` : ''} • {data.claimPlace || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ចំណាយថ្លៃព្យាបាល ($ USD)</span>
                <span className="font-bold text-indigo-700 font-mono">${data.claimExpenseAmount || 0} USD</span>
              </div>
              <div>
                <span className="text-slate-500 block">ទឹកប្រាក់សំណងគ្រោងទាមទារ (Claim Amount Riel)</span>
                <span className="font-bold text-slate-900 font-mono">{data.claimAmountRiel || '—'} ៛</span>
              </div>
              <div className="col-span-1 md:col-span-3">
                <span className="text-slate-500 block">ស្ថានភាពរបួស និងដំណើរហេតុការណ៍ (Injury State & Accident Circumstance)</span>
                <div className="p-2.5 bg-white border border-slate-150 rounded-xl font-medium text-slate-800 space-y-1 mt-1">
                  <p><strong className="text-indigo-950 font-sans">ដំណើរហេតុការណ៍:</strong> {data.claimDescription || 'គ្មាន'}</p>
                  <p><strong className="text-indigo-950 font-sans">ស្ថានភាពរបួស:</strong> {data.injuryCircumstances || 'គ្មាន'}</p>
                </div>
              </div>
              <div className="col-span-1 md:col-span-3 border-t border-slate-100 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block">ធ្លាប់ទាមទារពីមុនដែរឬទេ? (Previously Claimed?)</span>
                  <span className={`font-bold inline-block px-2 py-0.5 rounded text-[10px] mt-1 ${data.previouslyClaimed === 'Yes' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    {data.previouslyClaimed === 'Yes' ? 'ធ្លាប់ទាមទារ (Yes)' : 'មិនធ្លាប់ (No)'}
                  </span>
                  {data.previouslyClaimed === 'Yes' && (
                    <span className="block text-slate-700 mt-1 pl-1">ព័ត៌មានបន្ថែម៖ {data.previouslyClaimedDetails || 'គ្មាន'}</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block">ឯកសារពិគ្រោះ/វេជ្ជបញ្ជាភ្ជាប់ (Attached Receipts File name)</span>
                  <span className="font-mono text-indigo-800 font-semibold break-all leading-tight mt-1 block">{data.claimDocuments || 'គ្មាន'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Declaration / signatures */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-[12px] text-indigo-950 font-moul tracking-normal border-b border-slate-200 pb-2.5 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-indigo-600" />
              <span>៧. ការបញ្ជាក់ និងហត្ថលេខា (Declaration & Signatures)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-2 bg-white rounded-xl border border-slate-150">
                <span className="text-slate-500 block text-[10px]">សាមីសិស្ស (Student)</span>
                <div className="py-2 inline-flex items-center gap-1">
                  <span className={data.studentSigned !== false ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                    {data.studentSigned !== false ? "✓ បានយល់ព្រម" : "Pending"}
                  </span>
                </div>
                <strong className="block text-slate-800 border-t border-slate-100 pt-1.5 text-[11px] font-moul">{data.studentSignatureName || '—'}</strong>
              </div>

              <div className="p-2 bg-white rounded-xl border border-slate-150">
                <span className="text-slate-500 block text-[10px]">អាណាព្យាបាល (Parent)</span>
                <div className="py-2 inline-flex items-center gap-1">
                  <span className={data.parentSigned !== false ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                    {data.parentSigned !== false ? "✓ បានយល់ព្រម" : "Pending"}
                  </span>
                </div>
                <strong className="block text-slate-800 border-t border-slate-100 pt-1.5 text-[11px] font-moul">{data.parentSignatureName || '—'}</strong>
              </div>

              <div className="p-2 bg-white rounded-xl border border-slate-150">
                <span className="text-slate-500 block text-[10px]">តំណាងសាលា (School Rep)</span>
                <div className="py-2 inline-flex items-center gap-1">
                  <span className={data.schoolRepresentativeSigned !== false ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                    {data.schoolRepresentativeSigned !== false ? "✓ បានយល់ព្រម" : "Pending"}
                  </span>
                </div>
                <strong className="block text-slate-800 border-t border-slate-100 pt-1.5 text-[11px] font-moul">{data.schoolRepresentativeName || '—'}</strong>
              </div>

              <div className="p-2 bg-white rounded-xl border border-slate-150 text-left">
                <span className="text-slate-500 block text-[10px]">ថ្ងៃបញ្ជាក់ការចុះហត្ថលេខា</span>
                <span className="font-mono text-slate-900 block font-bold text-sm mt-3">{data.declarationDate || '—'}</span>
              </div>
            </div>
          </div>

          {/* Section 8: Office route tracking */}
          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-150 space-y-4">
            <h4 className="font-extrabold text-[12px] text-indigo-950 font-moul tracking-normal border-b border-indigo-200 pb-2.5 flex items-center gap-2">
              <Landmark className="w-4.5 h-4.5 text-indigo-900" />
              <span>៨. សម្រាប់ការិយាល័យសាលា (Office Use Only)</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-slate-400 font-extrabold block mb-1">១. តម្លៃ និងការបញ្ជូន (Forwarding)</span>
                <span className="text-slate-500 block text-[10px] mb-0.5">ថ្ងៃបញ្ជូនទៅការិយាល័យកណ្តាល Central:</span>
                <strong className="text-slate-800 block font-mono mb-1">{data.dateSubmittedToCentral || '—'}</strong>
                <span className="text-slate-500 block text-[10px] mb-0.5">ថ្ងៃទទួលសាលសន្និបាត Central Received:</span>
                <strong className="text-slate-800 block font-mono">{data.dateReceivedByCentral || '—'}</strong>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-slate-400 font-extrabold block mb-1">២. ស្នើដោយសាខា (Sent By)</span>
                <strong className="text-slate-800 block mb-0.5 font-moul">{data.sentByName || 'លី សូដា'}</strong>
                <span className="text-slate-500 text-[9px] block">តួនាទី: {data.sentByPosition || 'រដ្ឋបាល'}</span>
                <div className="mt-1.5 inline-block text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                  {data.sentBySigned !== false ? '✓ Signed' : '✗ Pending'}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-slate-400 font-extrabold block mb-1">៣. ពិនិត្យដោយ (Received By)</span>
                <strong className="text-slate-800 block mb-0.5 font-moul">{data.receivedBy || 'ជា វណ្ណា'}</strong>
                <span className="text-slate-500 text-[9px] block">តួនាទី: {data.receivedByPosition || 'ប្រធានរដ្ឋបាល'}</span>
                <div className="mt-1.5 inline-block text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                  {data.receivedBySigned !== false ? '✓ Signed' : '✗ Pending'}
                </div>
                {data.dateReceived && (
                  <span className="block font-mono text-[9px] text-slate-400 mt-1">ថ្ងៃទី: {data.dateReceived}</span>
                )}
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                <span className="text-slate-400 font-extrabold block mb-1">៤. នាយកសាលា (Approved 1)</span>
                <strong className="text-slate-800 block mb-0.5 font-moul">{data.approved1Name || 'ហេង សំបូរ'}</strong>
                <span className="text-slate-500 text-[9px] block">តួនាទី: {data.approved1Position || 'នាយកសាលា'}</span>
                <div className="mt-1.5 inline-block text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                  {data.approved1Signed !== false ? '✓ Approved' : '✗ Pending'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 md:col-span-1">
                <span className="text-slate-400 font-extrabold block mb-1">៥. អភិបាលប្រតិបត្តិ (Approved 2)</span>
                <strong className="text-slate-800 block mb-0.5 font-moul">{data.approved2Name || 'សាយ ផល្លា'}</strong>
                <span className="text-slate-500 text-[9px] block">តួនាទី: {data.approved2Position || 'ប្រធានប្រតិបត្តិ'}</span>
                <div className="mt-1.5 inline-block text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                  {data.approved2Signed !== false ? '✓ Approved' : '✗ Pending'}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 md:col-span-3">
                <span className="text-indigo-900 font-extrabold block mb-1 font-moul text-[10px]">សម្គាល់ការិយាល័យ / Office Remarks</span>
                <p className="text-slate-700 italic pr-2 font-medium min-h-[36px]">{data.officeRemarks || '— គ្មានកំណត់សំគាល់បន្ថែម —'}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 shrink-0 flex items-center justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold transition focus:outline-hidden cursor-pointer"
          >
            បិទលម្អិត (Alright, Close)
          </button>
        </div>

      </div>
    </div>
  );
};
