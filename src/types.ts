/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Department = 'Security' | 'Cleaner' | 'Librarian' | 'Nurse' | 'Customer Service' | 'Lab Assistant' | 'Admin Head';

export const ALL_DEPARTMENTS: Department[] = ['Security', 'Cleaner', 'Librarian', 'Nurse', 'Customer Service', 'Lab Assistant', 'Admin Head'];

export const DEPARTMENT_NAMES_KM: Record<Department, string> = {
  Security: 'ផ្នែកសន្តិសុខ',
  Cleaner: 'ផ្នែកអ្នកអនាម័យ',
  Librarian: 'ផ្នែកបណ្ណារ័ក្ស',
  Nurse: 'ផ្នែកគិលានុបដ្ឋាយិកា (Nurse)',
  'Customer Service': 'ផ្នែកបម្រើសេវាកម្មអតិថិជន',
  'Lab Assistant': 'ផ្នែកជំនួយការបន្ទប់ពិសោធន៍',
  'Admin Head': 'ប្រធានផ្នែករដ្ឋបាល'
};

export interface Staff {
  id: string; // Unique generated or imported ID (e.g. WIS-001)
  no: number;
  staffId: string;
  name: string;
  gender: 'ប្រុស' | 'ស្រី' | 'លី' | 'Male' | 'Female'; // Supports Khmer and English import
  dob: string;
  phoneNumber: string;
  photo: string; // Base64 Data URL or URL or generated clean initials-avatar
  department: Department;
  icom?: string; // មុខងារ អាយកូម (Icom) - e.g. "មាន (Yes)" or custom label
  responsibleLocation?: string; // ទីតាំងទទួលខុសត្រូវ (Responsible Location)
  joinDate?: string; // ថ្ងៃខែឆ្នាំចូលធ្វើការ (Hire Date)
  contractStatus?: string; // ស្ថានភាពកិច្ចសន្យា (Contract Status) e.g. "ពេញសិទ្ធិ", "សាកល្បង"
  email?: string; // អ៊ីមែល (Email)
  attachments?: { id: string; name: string; size: string; type: string; dataUrl: string }[];
}

export type AttendanceStatus = 'Present' | 'Excused' | 'Absent'; // មក, ច្បាប់, អវត្តមាន

export const ATTENDANCE_STATUS_KM: Record<AttendanceStatus, { label: string; color: string; bg: string }> = {
  Present: { label: 'វត្តមាន (មក)', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  Excused: { label: 'ច្បាប់ (ច្បាប់)', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  Absent: { label: 'អវត្តមាន (អត់ច្បាប់)', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' }
};

export interface AttendanceRecord {
  id: string; // dept_date_staffId
  staffId: string;
  staffName: string;
  department: Department;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
}

export interface CleaningTask {
  id: string;
  date: string; // YYYY-MM-DD
  areaName: string; // e.g. "បន្ទប់ទឹកជាន់ទី១", "ទីធ្លាសាលា"
  cleanerId: string; // ID of the Cleaner Staff
  cleanerName: string;
  timeOfDay: 'Morning' | 'Afternoon'; // ព្រឹក | រសៀល
  status: 'Completed' | 'Pending'; // រួចរាល់ | កំពុងធ្វើ
  completedAt?: string;
  notes?: string;
}

export const CLEANING_AREAS_DEFAULT = [
  'បន្ទប់ទឹកប្រុស-ស្រី ជាន់ទី១',
  'បន្ទប់ទឹកប្រុស-ស្រី ជាន់ទី២',
  'បន្ទប់ទឹកប្រុស-ស្រី ជាន់ទី៣',
  'ការិយាល័យរដ្ឋបាល & ទទួលភ្ញៀវ',
  'បណ្ណាល័យសាលា',
  'បន្ទប់គិលានុបដ្ឋាន (Nurse Room)',
  'ទីធ្លារត់លេង & សួនច្បារសាលា',
  'ថ្នាក់រៀនជាន់ទី១',
  'ថ្នាក់រៀនជាន់ទី២',
  'បន្ទប់ប្រជុំបុគ្គលិក & គ្រូបង្រៀន',
  'អាហារដ្ឋាន & កន្លែងញ៉ាំអាហារ'
];

export interface ElectricityRecord {
  id: string;
  monthYear: string; // format "YYYY-MM"
  costBeforeUsd: number; // ការប្រើប្រាស់ខែមុន (តម្លៃគិតជា $)
  costAfterUsd: number; // ការប្រើប្រាស់ខែបន្ទាប់ (តម្លៃគិតជា $)
  differenceUsd: number; // គម្លាតគណនា ($)
  differencePercent: number; // ភាគរយគណនាល្អ/កើន (%)
  recordedAt: string;
  recordedBy: string; // អ្នកស្រង់
  notes?: string;
}

export interface WaterRecord {
  id: string;
  monthYear: string; // format "YYYY-MM"
  costBeforeUsd: number; // ការប្រើប្រាស់ខែមុន (តម្លៃគិតជា $)
  costAfterUsd: number; // ការប្រើប្រាស់ខែបន្ទាប់ (តម្លៃគិតជា $)
  differenceUsd: number; // គម្លាតគណនា ($)
  differencePercent: number; // ភាគរយគណនាល្អ/កើន (%)
  recordedAt: string;
  recordedBy: string; // អ្នកស្រង់
  notes?: string;
}

export type AssetCategory = 'Computer' | 'Laptop' | 'Projector' | 'Camera' | 'TV' | 'Other';

export const ASSET_CATEGORIES_KM: Record<AssetCategory, string> = {
  Computer: 'កុំព្យូទ័រ (Desktop PC)',
  Laptop: 'ឡេបថប (Laptop)',
  Projector: 'ម៉ាស៊ីនបញ្ចាំង (Projector)',
  Camera: 'កាមេរ៉ា (Camera)',
  TV: 'ទូរទស្សន៍ (Smart TV)',
  Other: 'ឧបករណ៍ផ្សេងៗ (Other Equipment)'
};

export type AssetStatus = 'Operational' | 'Maintenance' | 'Broken';

export const ASSET_STATUSES_KM: Record<AssetStatus, { label: string; color: string; bg: string }> = {
  Operational: { label: 'អាចប្រើប្រាស់បាន عادی/ល្អ', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', bg: 'bg-emerald-500' },
  Maintenance: { label: 'កំពុងជួសជុល/ថែទាំ', color: 'text-amber-700 bg-amber-50 border-amber-200', bg: 'bg-amber-500' },
  Broken: { label: 'ខូច/មិនអាចប្រើបាន', color: 'text-rose-700 bg-rose-50 border-rose-200', bg: 'bg-rose-500' }
};

export interface FixedAsset {
  id: string; // Unique ID (e.g. WIS-AST-001)
  name: string; // Asset description or name
  category: AssetCategory;
  brand: string; // Brand (e.g., Lenovo, Dell, Canon, Epson)
  model: string; // Model (e.g., ThinkPad T14, EB-X06)
  serialNumber: string; // Serial number (S/N)
  location: string; // Assigned location (e.g., Room A203, Lab Room)
  assignedTo: string; // Supervisor or user name
  status: AssetStatus;
  purchaseDate: string; // Purchase date (YYYY-MM-DD)
  costUsd: number; // Purchase price in USD
  notes?: string;
}

export type InsuranceStatus = 'Pending' | 'Approved' | 'Rejected' | 'None';

export interface StudentInsurance {
  id: string; // Unique policy key/ID e.g. WIS-INS-001
  campusBranch?: string; // ឈ្មោះសាខា Campus/Branch
  
  // 1. Student Information (ព័ត៌មានសិស្ស) / Insured's details
  studentName: string; // ឈ្មោះសិស្ស / Name of insured
  studentId: string;
  gender: 'ប្រុស' | 'ស្រី' | 'Male' | 'Female';
  dob: string; // ថ្ងៃខែឆ្នាំកំណើតសិស្ស / Date of Birth (Student)
  gradeClass: string; // ថ្នាក់ទី / Grade
  academicYear: string;
  nationality: string;
  photo?: string; // base64 or link or initials

  // 2. Parent/Guardian Information (ព័ត៌មានអាណាព្យាបាល)
  guardianName: string; // ឈ្មោះអាណាព្យាបាល / Parent's Name
  guardianRelationship: string;
  guardianPhone: string; // លេខទូរស័ព្ទអាណាព្យាបាល / Parent's number
  guardianAddress: string; // អាស័យដ្ឋាន / Address
  guardianOccupation: string; // មុខរបរ / Occupation (Guardian)

  // 3. Insurance Information (ព័ត៌មានធានារ៉ាប់រង) - optional or kept as background info
  policyNumber: string;
  provider: string; // e.g. Forte, AIA, Prudential, Camlife
  coverageType: string;
  effectiveDate: string;
  expiryDate: string;
  premiumAmount: number; // Cost in USD

  // 4. Emergency Contact (អ្នកទំនាក់ទំនងបន្ទាន់)
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  emergencyAltPhone?: string;

  // 5. Medical Information (ព័ត៌មានសុខភាព)
  bloodType: string; // A, B, AB, O, etc.
  allergies: string;
  medicalConditions: string;
  currentMedications: string;

  // 6. Claim Information & Accident Details (ព័ត៌មានលំអិតនៃគ្រោះថ្នាក់)
  claimDate?: string; // កាលបរិច្ឆេទ Date
  claimTime?: string; // ពេលវេលា Time
  claimTimeAmPm?: 'am' | 'pm'; // am/pm
  claimPlace?: string; // ទីកន្លែងគ្រោះថ្នាក់ Where the accident occurred
  claimHospital?: string; // មន្ទីរពេទ្យសម្រាកព្យាបាល Hospital used
  claimDescription?: string; // គ្រោះថ្នាក់កើតឡើងយ៉ាងដូចម្តេច How the accident occurred
  injuryCircumstances?: string; // ព័ត៌មានលម្អិតហេតុការណ៍ដែលនាំអោយមានរបួស Give detail of circumstances in which injury was sustained
  
  // Claim Amount
  claimAmountRiel?: string; // ចំនួនទឹកប្រាក់ជាលុយខ្មែរ (Khmer, Riel)
  claimExpenseAmount?: number; // ចំនួនទឹកប្រាក់ជាលុយដុល្លារអាមេរិក (US Dollar, $)
  claimDocuments?: string;

  // Prior claim history
  previouslyClaimed?: 'Yes' | 'No'; // តើធ្លាប់ធ្វើការទាមទារសំណងបែបនេះទេ? Have you previously claimed?
  previouslyClaimedDetails?: string; // បើធ្លាប់សូមផ្តល់ព័ត៌មានលម្អិត If yes, please give details

  // 7. Supporting documents checklist
  docStudentInsuranceCard?: boolean; // 1. Student Insurance Card
  docPoliceReport?: boolean; // 2. Police report of accident (Seriously Traffic Accident)
  docDeathCertificate?: boolean; // 3. Death certificate by Officer of Government (For death benefit claim)
  docMedicalReport?: boolean; // 4. Medical report on Student's illness by Legal Doctor (to certify disablement)
  docMedicalInvoice?: boolean; // 5. Medical certificate and original invoice (for claiming medical expense reimbursement)

  // 8. Declaration & Claimant Signature
  studentSigned: boolean;
  studentSignatureName?: string;
  parentSigned: boolean;
  parentSignatureName?: string;
  schoolRepresentativeSigned: boolean;
  schoolRepresentativeName?: string;
  declarationDate: string; // Date of Claimant signature

  claimantSignatureName?: string; // ហត្ថលេខាអ្នកទាមទារសំណង Name
  claimantSignatureDate?: string; // កាលបរិច្ឆេទ Date

  // 9. Central Office / Administration Routing & Approvals
  dateSubmittedToCentral?: string; // ថ្ងៃខែឆ្នាំបញ្ជូនមកការិយាល័យរដ្ឋបាលកណ្តាល
  dateReceivedByCentral?: string; // ថ្ងៃខែឆ្នាំបានទទួលដោយការិយាល័យរដ្ឋបាលកណ្តាល
  
  // Sent by (បញ្ជូនដោយ)
  sentByName?: string;
  sentByPosition?: string;
  sentBySigned?: boolean;

  // Received by (ទទួលដោយ)
  receivedBy: string; // ឈ្មោះ (keep name receivedBy compatibility)
  receivedByPosition?: string;
  receivedBySigned?: boolean;
  dateReceived: string; // compatibility

  // Approved by 1 (អនុម័តដោយ)
  approved1Name?: string;
  approved1Position?: string;
  approved1Signed?: boolean;

  // Approved by 2 (អនុម័តដោយ)
  approved2Name?: string;
  approved2Position?: string;
  approved2Signed?: boolean;

  claimStatus: InsuranceStatus;
  officeRemarks?: string;
}


export type ACType = 'Split' | 'Cassette' | 'Standing' | 'Ceiling Concealed';

export interface ACMaintenanceItem {
  id: string; // unique ID
  issueFound: string; // បញ្ហាដែលរកឃើញ
  repairAction: string; // សកម្មភាពជួសជុល
  materialsUsed: string; // សម្ភារៈប្រើប្រាស់
  quantity: string; // បរិមាណ
  notes: string; // កំណត់សម្គាល់
}

export interface AirConditionerInspection {
  id: string; // លេខ Form (e.g., WIS-AC-001)
  inspectionDate: string; // កាលបរិច្ឆេទត្រួតពិនិត្យ
  location: string; // ទីតាំង / បន្ទប់
  assetCode: string; // លេខសម្គាល់ម៉ាស៊ីន (Asset Code)
  brandModel: string; // ម៉ាក / Model
  acType: ACType; // ប្រភេទម៉ាស៊ីនត្រជាក់
  powerHpBtu: string; // កម្លាំងម៉ាស៊ីន (HP / BTU)
  inspectorName: string; // អ្នកត្រួតពិនិត្យ
  department: string; // ផ្នែក / Department

  // 2. តារាងត្រួតពិនិត្យម៉ាស៊ីនត្រជាក់ (ល្អ, មធ្យម, ខូច)
  checkMachine: 'ល្អ' | 'មធ្យម' | 'ខូច';
  checkTemp: 'ល្អ' | 'មធ្យម' | 'ខូច';
  checkNoise: 'ល្អ' | 'មធ្យម' | 'ខូច';
  checkFanIndoor: 'ល្អ' | 'មធ្យម' | 'ខូច';
  checkFanOutdoor: 'ល្អ' | 'មធ្យម' | 'ខូច';
  checkWaterFlow: 'ល្អ' | 'មធ្យម' | 'ខូច';
  checkWaterPipe: 'ល្អ' | 'មធ្យម' | 'ខូច';
  checkWiring: 'ល្អ' | 'មធ្យម' | 'ខូច';
  checkBreaker: 'ល្អ' | 'មធ្យម' | 'ខូច';
  checkGasRefrigerant: 'ល្អ' | 'មធ្យម' | 'ខូច';
  cleanFilter: 'ល្អ' | 'មធ្យម' | 'ខូច';
  cleanCondenser: 'ល្អ' | 'មធ្យម' | 'ខូច';
  cleanEvaporator: 'ល្អ' | 'មធ្យម' | 'ខូច';
  checkCompressor: 'ល្អ' | 'មធ្យម' | 'ខូច';
  checkRemote: 'ល្អ' | 'មធ្យម' | 'ខូច';

  // Notes for each checkpoint
  checkMachineNote?: string;
  checkTempNote?: string;
  checkNoiseNote?: string;
  checkFanIndoorNote?: string;
  checkFanOutdoorNote?: string;
  checkWaterFlowNote?: string;
  checkWaterPipeNote?: string;
  checkWiringNote?: string;
  checkBreakerNote?: string;
  checkGasRefrigerantNote?: string;
  cleanFilterNote?: string;
  cleanCondenserNote?: string;
  cleanEvaporatorNote?: string;
  checkCompressorNote?: string;
  checkRemoteNote?: string;

  // 3. ការជួសជុល / Maintenance & Repair
  repairs: ACMaintenanceItem[];

  // 4. ផែនការថែទាំ
  planCleanNormal: boolean; // សម្អាតធម្មតា
  planAddGas: boolean; // បន្ថែម Gas
  planChangeParts: boolean; // ប្តូរគ្រឿងបន្លាស់
  planRepairWiring: boolean; // ជួសជុលខ្សែភ្លើង
  planRepairWaterPipe: boolean; // ជួសជុលបំពង់ទឹក
  planSendBigRepair: boolean; // ផ្ញើទៅជួសជុលធំ
  planOther: boolean; // ផ្សេងៗ
  planOtherDetail: string; // ផ្សេងៗ spec

  // 5. លទ្ធផលបន្ទាប់ពីជួសជុល
  repairOutcome: 'ដំណើរការល្អ' | 'ត្រូវត្រួតពិនិត្យបន្ថែម' | 'មិនអាចប្រើប្រាស់បាន';
  outcomeNotes?: string;

  // 6. ហត្ថលេខា
  inspectorSigName: string;
  inspectorSigDate: string;
  technicianSigName: string;
  technicianSigDate: string;
  approverSigName: string;
  approverSigDate: string;
}export type StudentGrade = 'Kindergarten' | 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4' | 'Grade 5' | 'Grade 6' | 'Grade 7' | 'Grade 8' | 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12';

export const ALL_GRADES: StudentGrade[] = ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

export const GRADE_NAMES_KM: Record<StudentGrade, string> = {
  Kindergarten: 'ថ្នាក់មត្តេយ្យ (Kindergarten)',
  'Grade 1': 'ថ្នាក់ទី ១ (Grade 1)',
  'Grade 2': 'ថ្នាក់ទី ២ (Grade 2)',
  'Grade 3': 'ថ្នាក់ទី ៣ (Grade 3)',
  'Grade 4': 'ថ្នាក់ទី ៤ (Grade 4)',
  'Grade 5': 'ថ្នាក់ទី ៥ (Grade 5)',
  'Grade 6': 'ថ្នាក់ទី ៦ (Grade 6)',
  'Grade 7': 'ថ្នាក់ទី ៧ (Grade 7)',
  'Grade 8': 'ថ្នាក់ទី ៨ (Grade 8)',
  'Grade 9': 'ថ្នាក់ទី ៩ (Grade 9)',
  'Grade 10': 'ថ្នាក់ទី ១០ (Grade 10)',
  'Grade 11': 'ថ្នាក់ទី ១១ (Grade 11)',
  'Grade 12': 'ថ្នាក់ទី ១២ (Grade 12)'
};

export interface Student {
  id: string; // Unique student ID
  no: number;
  studentId: string;
  name: string;
  gender: 'ប្រុស' | 'ស្រី' | 'Male' | 'Female';
  dob: string;
  phoneNumber: string; // Parent/guardian contact
  photo: string;
  grade: StudentGrade;
  enrollmentDate?: string;
  responsibleLocation?: string; // Classroom room number, e.g., "Room 102"
  icom?: string; // Optionally keep same structure " walkie / extra card " or status
  attachments?: { id: string; name: string; size: string; type: string; dataUrl: string }[];
}

export interface HourlyLog {
  id: string;
  timeSlot: string; // e.g. "08:00 - 09:00"
  activity: string; // Detail of the hour's record/task
  status: 'Completed' | 'In Progress' | 'Pending' | 'Delayed';
  remarks?: string;
}

export interface DailyReport {
  id: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // entry time e.g., "07:30"
  checkOutTime: string; // exit time e.g., "17:00"
  reporterName: string; // Name of person who records it
  overallSummary: string;
  hourlyLogs: HourlyLog[];
  createdAt: string;
}

