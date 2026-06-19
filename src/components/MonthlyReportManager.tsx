import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Printer, 
  X, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Info,
  ChevronDown,
  ChevronUp,
  FileText,
  CalendarDays,
  Utensils,
  Wind,
  Award,
  ShieldAlert,
  Users,
  HeartPulse,
  User,
  Settings,
  Download,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { 
  MonthlyReport, 
  LunchRecord, 
  MosquitoSpraySchedule, 
  AchievementRecord, 
  InsuranceClaimRecord, 
  StudentAbsentRecord, 
  StudentSickRecord,
  UserAccount
} from '../types';
import { exportMonthlyReportToPdf } from '../utils/pdfHelper';

// Let's configure beautiful default seeds for June-2026
const DEFAULT_LUNCH_SEEDS: LunchRecord[] = [
  {
    id: 'l-1',
    no: 1,
    description: 'កញ្ចប់បាយថ្ងៃត្រង់អាហារូបករណ៍សិស្សកម្រិតបឋម (Subsidized Primary Students Lunch)',
    count: 145,
    total: 145,
    note: 'New Academic Year: 2025-2026'
  },
  {
    id: 'l-2',
    no: 2,
    description: 'កញ្ចប់បាយថ្ងៃត្រង់សម្រាប់លោកគ្រូ-អ្នកគ្រូប្រចាំការ (WIS Core Faculty Afternoon Packs)',
    count: 48,
    total: 48,
    note: 'New Academic Year: 2025-2026'
  }
];

const DEFAULT_MOSQUITO_SEEDS: MosquitoSpraySchedule[] = [
  {
    id: 'm-1',
    date: '2026-06-15',
    day: 'Monday (ថ្ងៃចន្ទ)',
    time: '05:30 PM'
  }
];

const DEFAULT_ACHIEVEMENT_SEEDS: AchievementRecord[] = [
  {
    id: 'a-1',
    no: 1,
    description: 'ការតំឡើងនិងបន្ថែមម៉ាស៊ីនថត CCTV ចំនួន ៨ គ្រឿងបន្ថែមនៅជុំវិញរបងសាលាខាងក្រៅ (CCTV Outer Perimeter)',
    remarks: 'បានបញ្ចប់រួចរាល់ ១០០% និងដំណើរការបានធម្មតា (Ensured 100% outer safety)'
  },
  {
    id: 'a-2',
    no: 2,
    description: 'រៀបចំសិក្ខាសាលាស្ដីពីសុខភាពមាត់ធ្មេញជូនដល់សិស្សានុសិស្សមត្តេយ្យនិងបឋមសិក្សា (Dental Care Awareness)',
    remarks: 'សហការជាមួយគ្លីនិកធ្មេញដៃគូ និងបានចែកកញ្ចប់អនាម័យស្រោបធ្មេញដោយឥតគិតថ្លៃ'
  }
];

const DEFAULT_INSURANCE_SEEDS: InsuranceClaimRecord[] = [
  {
    id: 'ic-1',
    no: 1,
    name: 'ឈឿន វិច្ឆិកា (Chhoeun Vicheka)',
    grade: 'Grade 10B',
    sex: 'Female (ស្រី)',
    dateAccident: '2026-06-03',
    timeAccident: '10:15 AM',
    dateClaim: '2026-06-05',
    remarks: 'រអិលដួលនៅទីធ្លាលេងកម្សាន្ត។ បានបញ្ជូនទៅគ្លីនិកដៃគូ និងទូទាត់សំណងគិតជាប្រាក់ $65.00 រួចរាល់។'
  }
];

const DEFAULT_ABSENT_SEEDS: StudentAbsentRecord[] = [
  {
    id: 'ab-1',
    no: 1,
    date: '2026-06-01',
    male: 3,
    female: 2,
    total: 5,
    remarks: 'Excused via school Telegram helper and phone calls.'
  },
  {
    id: 'ab-2',
    no: 2,
    date: '2026-06-10',
    male: 4,
    female: 1,
    total: 5,
    remarks: 'Excused (Family event & personal leave)'
  }
];

const DEFAULT_SICK_SEEDS: StudentSickRecord[] = [
  {
    id: 's-1',
    no: 1,
    date: '2026-06-04',
    male: 1,
    female: 3,
    total: 4,
    remarks: 'អាការៈក្តៅខ្លួនស្រាល និងផ្តាសាយ។ បានសម្រាកនៅបន្ទប់ទិព្វសាលារង់ចាំអាណាព្យាបាលមកទទួល។'
  }
];

interface MonthlyReportManagerProps {
  currentUser?: UserAccount | null;
}

export const MonthlyReportManager: React.FC<MonthlyReportManagerProps> = ({ currentUser }) => {
  // Store all monthly reports keyed by month id, e.g. "2026-06"
  const [reportsMap, setReportsMap] = useState<Record<string, MonthlyReport>>({});
  
  // Currently selected month (year and month string, e.g. "2026-06")
  const [selectedMonthId, setSelectedMonthId] = useState('2026-06');
  
  // Modal controllers for adding/editing lines in specific tables
  const [activeFormSection, setActiveFormSection] = useState<'lunch' | 'mosquito' | 'achievement' | 'insurance' | 'absent' | 'sick' | null>(null);
  
  // Generic single record editing states
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Field states for various subsections
  // 1. Lunch
  const [lunchDesc, setLunchDesc] = useState('');
  const [lunchCount, setLunchCount] = useState<number>(0);
  const [lunchTotal, setLunchTotal] = useState<number>(0);
  const [lunchNote, setLunchNote] = useState('New Academic Year: 2025-2026');

  // 2. Mosquito Spray
  const [mosquitoDate, setMosquitoDate] = useState('');
  const [mosquitoDay, setMosquitoDay] = useState('');
  const [mosquitoTime, setMosquitoTime] = useState('');

  // 3. Achievements
  const [achieveDesc, setAchieveDesc] = useState('');
  const [achieveRemarks, setAchieveRemarks] = useState('');

  // 4. Insurance Claim
  const [insClaimName, setInsClaimName] = useState('');
  const [insClaimGrade, setInsClaimGrade] = useState('');
  const [insClaimSex, setInsClaimSex] = useState('Male (ប្រុស)');
  const [insClaimAccDate, setInsClaimAccDate] = useState('');
  const [insClaimAccTime, setInsClaimAccTime] = useState('');
  const [insClaimDate, setInsClaimDate] = useState('');
  const [insClaimRemarks, setInsClaimRemarks] = useState('');

  // 5. Absentees
  const [absentDate, setAbsentDate] = useState('');
  const [absentMale, setAbsentMale] = useState<number>(0);
  const [absentFemale, setAbsentFemale] = useState<number>(0);
  const [absentRemarks, setAbsentRemarks] = useState('');

  // 6. Sick
  const [sickDate, setSickDate] = useState('');
  const [sickMale, setSickMale] = useState<number>(0);
  const [sickFemale, setSickFemale] = useState<number>(0);
  const [sickRemarks, setSickRemarks] = useState('');

  // Prepared block signatures
  const [preparedBy, setPreparedBy] = useState('Mr. LOUNG Veasna');
  const [preparedTitle, setPreparedTitle] = useState('Admin Supervisor');

  // Load from local storage on mounted state
  useEffect(() => {
    const raw = window.localStorage.getItem('wis_monthly_reports');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // Verify if June-2026 exists, if not seed it beautifully
          if (!parsed['2026-06']) {
            parsed['2026-06'] = createDefaultMonthObject('2026-06', 'June-2026');
          }
          setReportsMap(parsed);
        } else {
          setupInitialState();
        }
      } catch {
        setupInitialState();
      }
    } else {
      setupInitialState();
    }
  }, []);

  const setupInitialState = () => {
    const fresh: Record<string, MonthlyReport> = {
      '2026-06': createDefaultMonthObject('2026-06', 'June-2026')
    };
    setReportsMap(fresh);
    window.localStorage.setItem('wis_monthly_reports', JSON.stringify(fresh));
  };

  const createDefaultMonthObject = (id: string, name: string): MonthlyReport => {
    return {
      id,
      month: name,
      lunchList: id === '2026-06' ? [...DEFAULT_LUNCH_SEEDS] : [],
      mosquitoList: id === '2026-06' ? [...DEFAULT_MOSQUITO_SEEDS] : [],
      achievementList: id === '2026-06' ? [...DEFAULT_ACHIEVEMENT_SEEDS] : [],
      insuranceClaimList: id === '2026-06' ? [...DEFAULT_INSURANCE_SEEDS] : [],
      absentList: id === '2026-06' ? [...DEFAULT_ABSENT_SEEDS] : [],
      sickList: id === '2026-06' ? [...DEFAULT_SICK_SEEDS] : [],
      preparedBy: 'Mr. LOUNG Veasna',
      preparedTitle: 'Admin Supervisor'
    };
  };

  // Get current active report object
  const rawActiveReport: MonthlyReport = reportsMap[selectedMonthId] || {
    id: selectedMonthId,
    month: getReadableMonthLabel(selectedMonthId),
    lunchList: [],
    mosquitoList: [],
    achievementList: [],
    insuranceClaimList: [],
    absentList: [],
    sickList: [],
    preparedBy: preparedBy,
    preparedTitle: preparedTitle
  };

  const isAdmin = currentUser?.role === 'admin';
  const activeReport = React.useMemo(() => {
    if (isAdmin) return rawActiveReport;
    if (rawActiveReport.createdBy && rawActiveReport.createdBy !== currentUser?.username) {
      return {
        id: selectedMonthId,
        month: getReadableMonthLabel(selectedMonthId),
        lunchList: [],
        mosquitoList: [],
        achievementList: [],
        insuranceClaimList: [],
        absentList: [],
        sickList: [],
        preparedBy: currentUser?.fullName || currentUser?.username || '',
        preparedTitle: 'User',
        createdBy: currentUser?.username
      };
    }
    return rawActiveReport;
  }, [rawActiveReport, currentUser, isAdmin, selectedMonthId]);

  // Update dynamic prepared by / title in active report on-the-fly
  useEffect(() => {
    if (reportsMap[selectedMonthId]) {
      setPreparedBy(activeReport.preparedBy || 'Mr. LOUNG Veasna');
      setPreparedTitle(activeReport.preparedTitle || 'Admin Supervisor');
    }
  }, [selectedMonthId, reportsMap]);

  const triggerSaveNotification = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdatePreparedDetails = (pBy: string, pTitle: string) => {
    setPreparedBy(pBy);
    setPreparedTitle(pTitle);

    const updated = {
      ...reportsMap,
      [selectedMonthId]: {
        ...activeReport,
        preparedBy: pBy,
        preparedTitle: pTitle,
        createdBy: activeReport.createdBy || currentUser?.username || 'admin'
      }
    };
    setReportsMap(updated);
    window.localStorage.setItem('wis_monthly_reports', JSON.stringify(updated));
  };

  // Save the modified reportMap to local storage
  const saveReportState = (newReport: MonthlyReport) => {
    const updated = {
      ...reportsMap,
      [selectedMonthId]: {
        ...newReport,
        createdBy: newReport.createdBy || currentUser?.username || 'admin'
      }
    };
    setReportsMap(updated);
    window.localStorage.setItem('wis_monthly_reports', JSON.stringify(updated));
  };

  // Utility to map "YYYY-MM" to readable "Month-YYYY"
  function getReadableMonthLabel(id: string): string {
    const [year, month] = id.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const index = parseInt(month, 10) - 1;
    return `${monthNames[index] || 'Month'}-${year}`;
  }

  // Handle building/switching the selected month
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // e.g. "2026-06"
    if (!val) return;
    setSelectedMonthId(val);

    // If month doesn't exist, seed an empty monthly structure for it!
    if (!reportsMap[val]) {
      const readable = getReadableMonthLabel(val);
      const newMonth = createDefaultMonthObject(val, readable);
      const updated = {
        ...reportsMap,
        [val]: newMonth
      };
      setReportsMap(updated);
      window.localStorage.setItem('wis_monthly_reports', JSON.stringify(updated));
      triggerSaveNotification(`បានបង្កើតរបាយការណ៍ថ្មីសម្រាប់ខែ ${readable} (Created new monthly structure) `, 'info');
    }
  };

  // Clear/Reset current active month to standard seed values
  const handleResetToSeeds = () => {
    if (window.confirm('តើអ្នកចង់កំណត់ឡើងវិញនូវទិន្នន័យខែបច្ចុប្បន្នទៅជាទិន្នន័យគំរូដើមរបស់សាលាឬទេ? (Reset current month to standard default templates?)')) {
      const resetReport = createDefaultMonthObject(selectedMonthId, getReadableMonthLabel(selectedMonthId));
      saveReportState(resetReport);
      triggerSaveNotification('បានកំណត់ឡើងវិញខែបច្ចុប្បន្នជោគជ័យ! (Restored current month seeds)', 'info');
    }
  };

  // Delete current month entirely
  const handleDeleteMonth = () => {
    if (Object.keys(reportsMap).length <= 1) {
      triggerSaveNotification('មិនអនុញ្ញាតឱ្យលុបទិន្នន័យទាំងអស់នៃខែគម្រោងនោះទេ! (Must retain at least 1 month representation)', 'error');
      return;
    }
    if (window.confirm(`តើអ្នកពិតជាចង់លុបចោលរបាយការណ៍ប្រចាំខែ [${activeReport.month}] នេះទាំងស្រុងចេញពីប្រព័ន្ធមែនទេ?`)) {
      const updated = { ...reportsMap };
      delete updated[selectedMonthId];
      // Switch back to the first available month
      const fallbackKey = Object.keys(updated)[0];
      setReportsMap(updated);
      setSelectedMonthId(fallbackKey);
      window.localStorage.setItem('wis_monthly_reports', JSON.stringify(updated));
      triggerSaveNotification('បានលុបរបាយការណ៍ប្រចាំខែដោយជោគជ័យ! (Deleted monthly report dataset)', 'success');
    }
  };

  // Functions to open forms for adding/editing lines
  const openFormForSection = (section: 'lunch' | 'mosquito' | 'achievement' | 'insurance' | 'absent' | 'sick', rowObj?: any) => {
    setActiveFormSection(section);
    setEditingRowId(rowObj ? rowObj.id : null);

    if (section === 'lunch') {
      setLunchDesc(rowObj ? rowObj.description : '');
      setLunchCount(rowObj ? rowObj.count : 0);
      setLunchTotal(rowObj ? rowObj.total : 0);
      setLunchNote(rowObj ? rowObj.note : 'New Academic Year: 2025-2026');
    } else if (section === 'mosquito') {
      setMosquitoDate(rowObj ? rowObj.date : '');
      setMosquitoDay(rowObj ? rowObj.day : 'Monday (ថ្ងៃចន្ទ)');
      setMosquitoTime(rowObj ? rowObj.time : '05:30 PM');
    } else if (section === 'achievement') {
      setAchieveDesc(rowObj ? rowObj.description : '');
      setAchieveRemarks(rowObj ? rowObj.remarks : '');
    } else if (section === 'insurance') {
      setInsClaimName(rowObj ? rowObj.name : '');
      setInsClaimGrade(rowObj ? rowObj.grade : '');
      setInsClaimSex(rowObj ? rowObj.sex : 'Male (ប្រុស)');
      setInsClaimAccDate(rowObj ? rowObj.dateAccident : '');
      setInsClaimAccTime(rowObj ? rowObj.timeAccident : '');
      setInsClaimDate(rowObj ? rowObj.dateClaim : '');
      setInsClaimRemarks(rowObj ? rowObj.remarks : '');
    } else if (section === 'absent') {
      setAbsentDate(rowObj ? rowObj.date : '');
      setAbsentMale(rowObj ? rowObj.male : 0);
      setAbsentFemale(rowObj ? rowObj.female : 0);
      setAbsentRemarks(rowObj ? rowObj.remarks : '');
    } else if (section === 'sick') {
      setSickDate(rowObj ? rowObj.date : '');
      setSickMale(rowObj ? rowObj.male : 0);
      setSickFemale(rowObj ? rowObj.female : 0);
      setSickRemarks(rowObj ? rowObj.remarks : '');
    }
  };

  // Submit operations for child table fields
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeFormSection === 'lunch') {
      let updatedLunch: LunchRecord[];
      if (editingRowId) {
        updatedLunch = activeReport.lunchList.map(item => item.id === editingRowId ? {
          ...item,
          description: lunchDesc,
          count: Number(lunchCount),
          total: Number(lunchTotal),
          note: lunchNote
        } : item);
      } else {
        const newRecord: LunchRecord = {
          id: 'l-' + Date.now(),
          no: activeReport.lunchList.length + 1,
          description: lunchDesc,
          count: Number(lunchCount),
          total: Number(lunchTotal),
          note: lunchNote
        };
        updatedLunch = [...activeReport.lunchList, newRecord];
      }
      // Re-order index No nicely
      updatedLunch = updatedLunch.map((item, idx) => ({ ...item, no: idx + 1 }));
      saveReportState({ ...activeReport, lunchList: updatedLunch });
      triggerSaveNotification('រក្សាកំណត់ត្រាអាហារថ្ងៃត្រង់ជោគជ័យ! (Saved lunch record)', 'success');

    } else if (activeFormSection === 'mosquito') {
      let updatedMosquito: MosquitoSpraySchedule[];
      if (editingRowId) {
        updatedMosquito = activeReport.mosquitoList.map(item => item.id === editingRowId ? {
          ...item,
          date: mosquitoDate,
          day: mosquitoDay,
          time: mosquitoTime
        } : item);
      } else {
        const newRecord: MosquitoSpraySchedule = {
          id: 'm-' + Date.now(),
          date: mosquitoDate,
          day: mosquitoDay,
          time: mosquitoTime
        };
        updatedMosquito = [...activeReport.mosquitoList, newRecord];
      }
      saveReportState({ ...activeReport, mosquitoList: updatedMosquito });
      triggerSaveNotification('រក្សាកាលវិភាគបាញ់ថ្នាំមូសជោគជ័យ! (Saved mosquito schedule)', 'success');

    } else if (activeFormSection === 'achievement') {
      let updatedAchieve: AchievementRecord[];
      if (editingRowId) {
        updatedAchieve = activeReport.achievementList.map(item => item.id === editingRowId ? {
          ...item,
          description: achieveDesc,
          remarks: achieveRemarks
        } : item);
      } else {
        const newRecord: AchievementRecord = {
          id: 'a-' + Date.now(),
          no: activeReport.achievementList.length + 1,
          description: achieveDesc,
          remarks: achieveRemarks
        };
        updatedAchieve = [...activeReport.achievementList, newRecord];
      }
      updatedAchieve = updatedAchieve.map((item, idx) => ({ ...item, no: idx + 1 }));
      saveReportState({ ...activeReport, achievementList: updatedAchieve });
      triggerSaveNotification('រក្សាកត់ត្រាស្នាដៃសម្រេចបានជោគជ័យ! (Saved achievement)', 'success');

    } else if (activeFormSection === 'insurance') {
      let updatedIns: InsuranceClaimRecord[];
      if (editingRowId) {
        updatedIns = activeReport.insuranceClaimList.map(item => item.id === editingRowId ? {
          ...item,
          name: insClaimName,
          grade: insClaimGrade,
          sex: insClaimSex,
          dateAccident: insClaimAccDate,
          timeAccident: insClaimAccTime,
          dateClaim: insClaimDate,
          remarks: insClaimRemarks
        } : item);
      } else {
        const newRecord: InsuranceClaimRecord = {
          id: 'ic-' + Date.now(),
          no: activeReport.insuranceClaimList.length + 1,
          name: insClaimName,
          grade: insClaimGrade,
          sex: insClaimSex,
          dateAccident: insClaimAccDate,
          timeAccident: insClaimAccTime,
          dateClaim: insClaimDate,
          remarks: insClaimRemarks
        };
        updatedIns = [...activeReport.insuranceClaimList, newRecord];
      }
      updatedIns = updatedIns.map((item, idx) => ({ ...item, no: idx + 1 }));
      saveReportState({ ...activeReport, insuranceClaimList: updatedIns });
      triggerSaveNotification('រក្សាកត់ត្រាសំណងធានារ៉ាប់រងជោគជ័យ! (Saved insurance claim)', 'success');

    } else if (activeFormSection === 'absent') {
      let updatedAbsent: StudentAbsentRecord[];
      const computedTotal = Number(absentMale) + Number(absentFemale);
      if (editingRowId) {
        updatedAbsent = activeReport.absentList.map(item => item.id === editingRowId ? {
          ...item,
          date: absentDate,
          male: Number(absentMale),
          female: Number(absentFemale),
          total: computedTotal,
          remarks: absentRemarks
        } : item);
      } else {
        const newRecord: StudentAbsentRecord = {
          id: 'ab-' + Date.now(),
          no: activeReport.absentList.length + 1,
          date: absentDate,
          male: Number(absentMale),
          female: Number(absentFemale),
          total: computedTotal,
          remarks: absentRemarks
        };
        updatedAbsent = [...activeReport.absentList, newRecord];
      }
      updatedAbsent = updatedAbsent
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((item, idx) => ({ ...item, no: idx + 1 }));
      saveReportState({ ...activeReport, absentList: updatedAbsent });
      triggerSaveNotification('រក្សាទិន្នន័យអវត្តមានសិស្សជោគជ័យ! (Saved student absent log)', 'success');

    } else if (activeFormSection === 'sick') {
      let updatedSick: StudentSickRecord[];
      const computedTotal = Number(sickMale) + Number(sickFemale);
      if (editingRowId) {
        updatedSick = activeReport.sickList.map(item => item.id === editingRowId ? {
          ...item,
          date: sickDate,
          male: Number(sickMale),
          female: Number(sickFemale),
          total: computedTotal,
          remarks: sickRemarks
        } : item);
      } else {
        const newRecord: StudentSickRecord = {
          id: 's-' + Date.now(),
          no: activeReport.sickList.length + 1,
          date: sickDate,
          male: Number(sickMale),
          female: Number(sickFemale),
          total: computedTotal,
          remarks: sickRemarks
        };
        updatedSick = [...activeReport.sickList, newRecord];
      }
      updatedSick = updatedSick
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((item, idx) => ({ ...item, no: idx + 1 }));
      saveReportState({ ...activeReport, sickList: updatedSick });
      triggerSaveNotification('រក្សាទិន្នន័យសិស្សឈឺជោគជ័យ! (Saved student sick log)', 'success');
    }

    setActiveFormSection(null);
    setEditingRowId(null);
  };

  // Handle deletions in child tables
  const handleDeleteRow = (section: 'lunch' | 'mosquito' | 'achievement' | 'insurance' | 'absent' | 'sick', rowId: string) => {
    if (window.confirm('តើអ្នកចង់លុបបន្ទាត់ទិន្នន័យនេះមែនទេ? (Are you sure you want to delete this row item?)')) {
      if (section === 'lunch') {
        const filtered = activeReport.lunchList.filter(item => item.id !== rowId).map((item, idx) => ({ ...item, no: idx + 1 }));
        saveReportState({ ...activeReport, lunchList: filtered });
      } else if (section === 'mosquito') {
        const filtered = activeReport.mosquitoList.filter(item => item.id !== rowId);
        saveReportState({ ...activeReport, mosquitoList: filtered });
      } else if (section === 'achievement') {
        const filtered = activeReport.achievementList.filter(item => item.id !== rowId).map((item, idx) => ({ ...item, no: idx + 1 }));
        saveReportState({ ...activeReport, achievementList: filtered });
      } else if (section === 'insurance') {
        const filtered = activeReport.insuranceClaimList.filter(item => item.id !== rowId).map((item, idx) => ({ ...item, no: idx + 1 }));
        saveReportState({ ...activeReport, insuranceClaimList: filtered });
      } else if (section === 'absent') {
        const filtered = activeReport.absentList.filter(item => item.id !== rowId).map((item, idx) => ({ ...item, no: idx + 1 }));
        saveReportState({ ...activeReport, absentList: filtered });
      } else if (section === 'sick') {
        const filtered = activeReport.sickList.filter(item => item.id !== rowId).map((item, idx) => ({ ...item, no: idx + 1 }));
        saveReportState({ ...activeReport, sickList: filtered });
      }
      triggerSaveNotification('បានលុបជោគជ័យ! (Row deleted successfully)', 'success');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getDayList = () => {
    return [
      'Monday (ថ្ងៃចន្ទ)', 'Tuesday (ថ្ងៃអង្គារ)', 'Wednesday (ថ្ងៃពុធ)', 'Thursday (ថ្ងៃព្រហស្បតិ៍)', 'Friday (ថ្ងៃសុក្រ)', 'Saturday (ថ្ងៃសៅរ៍)', 'Sunday (ថ្ងៃអាទិត្យ)'
    ];
  };

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans">
      
      {/* Toast Notice */}
      {toast && (
        <div 
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border transition-all duration-300 max-w-sm ${
            toast.type === 'error' 
              ? 'bg-rose-50 border-rose-200 text-rose-900 shadow-rose-100'
              : toast.type === 'info'
              ? 'bg-sky-50 border-sky-200 text-sky-900 shadow-sky-100'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-emerald-100'
          }`}
        >
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold leading-relaxed">{toast.text}</p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div id="print-area-wrapper" className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Top Banner section */}
        <div className="bg-gradient-to-r from-[#073B3A] to-[#042423] px-6 py-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-5 print:bg-white print:text-slate-900">
          <div className="flex items-center gap-4">
            <div className="bg-amber-400 p-3 rounded-2xl text-slate-950 shadow-md print:hidden">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider border border-amber-400/25 print:hidden">
                Comprehensive Admin Review
              </span>
              <h1 className="text-lg md:text-2xl font-bold tracking-tight mt-1 text-white font-moul leading-normal print:text-[#073B3A] print:text-center print:text-xl">
                របាយការណ៍សង្ខេបប្រចាំខែ (Monthly Performance Report)
              </h1>
              <p className="text-[11px] text-emerald-200/90 font-medium leading-relaxed mt-1">
                ការវាយតម្លៃលើលំហូរការងារយុទ្ធសាស្ត្រ កញ្ចប់អាហារសិស្ស បាញ់ថ្នាំសុខាភិបាល សំណងអវត្តមាន និងស្ថិតិសិស្សឈឺ
              </p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            
            {/* Quick Month Picker */}
            <div className="flex items-center bg-[#052827] border border-[#105d5b] text-emerald-100 rounded-xl px-3 py-1.5 focus-within:border-amber-400 transition">
              <span className="text-[10px] font-bold text-emerald-400 mr-2 whitespace-nowrap uppercase">ខែវាយតម្លៃ៖</span>
              <input 
                type="month"
                value={selectedMonthId}
                onChange={handleMonthChange}
                className="bg-transparent text-white text-xs font-bold font-mono border-0 outline-hidden focus:ring-0 p-0 cursor-pointer w-32"
              />
            </div>

            <button
              onClick={handlePrint}
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-900 stroke-[2.5px]" />
              <span>បោះពុម្ព (Print pdf)</span>
            </button>

            <button
              onClick={() => {
                exportMonthlyReportToPdf(activeReport);
                triggerSaveNotification('បានទាញយករបាយការណ៍ជា PDF ជោគជ័យ! (Exported PDF report)', 'success');
              }}
              className="bg-[#0b6b69] hover:bg-[#0c7a77] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-300 stroke-[2.5px]" />
              <span>ទាញយក PDF (Export PDF)</span>
            </button>

            <button
              onClick={handleResetToSeeds}
              title="កំណត់ទិន្នន័យគំរូឡើងវិញ"
              className="bg-[#0c5150] hover:bg-rose-950/40 text-emerald-200 hover:text-white font-semibold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1 transition cursor-pointer border border-[#0d5c5a]/40"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
              <span>កំណត់ដើមល្អ (Reset Month)</span>
            </button>

            <button
              onClick={handleDeleteMonth}
              title="លុបខែនេះចោល"
              className="bg-rose-900/30 hover:bg-rose-800/50 text-rose-300 hover:text-white font-semibold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>លុបខែ (Delete)</span>
            </button>

          </div>
        </div>

        {/* Selected Month Status card */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-600 print:bg-white">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#073B3A]" />
            <span className="text-xs font-bold">
              របាយការណ៍សកម្មភាពលម្អិតប្រចាំ៖ <span className="text-[#073B3A] underline underline-offset-4 decoration-amber-400 decoration-2 font-mono ml-1 font-extrabold text-sm">{activeReport.month}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-550 select-none">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-bold">Active Module</span>
            <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded font-bold">Standard Form A4</span>
          </div>
        </div>

        {/* PRINT HEADERS - Only visible on paper layout printing */}
        <div className="hidden print:block p-8 space-y-4 text-slate-900">
          <div className="flex justify-between items-start border-b-2 border-[#073B3A] pb-4">
            <div>
              <h2 className="text-xl font-bold font-moul text-[#073B3A] mb-1">សាលាវេស្ទើនអន្តរជាតិ សាខាចំការដូង</h2>
              <p className="text-xs text-slate-600 font-semibold font-mono">WESTERN INTERNATIONAL SCHOOL • SYSTEM REPORT</p>
            </div>
            <div className="text-right">
              <h3 className="text-xs font-bold font-moul">របាយការណ៍សង្ខេបប្រចាំខែ (Monthly performance summary)</h3>
              <p className="text-xs font-mono font-bold text-slate-700 mt-1">MONTH REFERENCE: {activeReport.month}</p>
            </div>
          </div>
        </div>

        {/* 6 REPORT CORES GRID SYSTEM */}
        <div className="p-6 space-y-8 print:p-8">
          
          {/* Section 1: Lunch */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between print:bg-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#073B3A]/10 text-[#073B3A] rounded-lg">
                  <Utensils className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 font-moul leading-normal">
                  ១. កញ្ចប់អាហារថ្ងៃត្រង់ (Lunch Records)
                </h3>
              </div>
              <button 
                onClick={() => openFormForSection('lunch')}
                className="bg-[#073B3A] hover:bg-[#0d5c5a] text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer print:hidden"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>បន្ថែមព័ត៌មាន (Add Row)</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <th className="px-4 py-2.5 text-center w-12 border-r border-slate-200">No</th>
                    <th className="px-4 py-2.5 text-left border-r border-slate-200">Description (ការពិពណ៌នាលម្អិត)</th>
                    <th className="px-4 py-2.5 text-center w-28 border-r border-slate-200">Count (ចំនួន)</th>
                    <th className="px-4 py-2.5 text-center w-28 border-r border-slate-200">Total (សរុបរួម)</th>
                    <th className="px-4 py-2.5 text-left">Note (New Academic Year: 2025-2026)</th>
                    <th className="px-4 py-2.5 text-center w-20 print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {activeReport.lunchList && activeReport.lunchList.length > 0 ? (
                    activeReport.lunchList.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-400 select-none bg-slate-50/20">{idx + 1}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900 border-r border-slate-150">{item.description}</td>
                        <td className="px-4 py-3 text-center border-r border-slate-150 font-bold font-mono text-emerald-800">{item.count}</td>
                        <td className="px-4 py-3 text-center border-r border-slate-150 font-bold font-mono text-slate-905">{item.total}</td>
                        <td className="px-4 py-3 text-slate-505 font-medium italic">{item.note || 'New Academic Year: 2025-2026'}</td>
                        <td className="px-4 py-3 text-center bg-slate-50/10 print:hidden">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => openFormForSection('lunch', item)} className="p-1 hover:bg-slate-100 text-slate-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteRow('lunch', item.id)} className="p-1 hover:bg-rose-50 text-rose-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400 italic">មិនទាន់មានទិន្នន័យ (No records added yet)</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Mosquitoes Spray */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between print:bg-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#073B3A]/10 text-[#073B3A] rounded-lg">
                  <Wind className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 font-moul leading-normal">
                  ២. ផែនការបាញ់ថ្នាំមូសសម្លាប់មេរោគដោយសន្តិសុខ (Mosquitoes Spray Schedule by Guards) <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded ml-2 print:hidden">ម្ដងក្នុងមួយខែ</span>
                </h3>
              </div>
              <button 
                onClick={() => openFormForSection('mosquito')}
                className="bg-[#073B3A] hover:bg-[#0d5c5a] text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer print:hidden"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>បន្ថែមការបាញ់ថ្នាំ (Add Log)</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <th className="px-4 py-2.5 text-center w-12 border-r border-slate-200">No</th>
                    <th className="px-4 py-2.5 text-left border-r border-slate-200">Date (កាលបរិច្ឆេទបាញ់)</th>
                    <th className="px-4 py-2.5 text-left border-r border-slate-200">Day (ថ្ងៃនៃសប្ដាហ៍)</th>
                    <th className="px-4 py-2.5 text-left border-r border-slate-200">Time (ម៉ោងអនុវត្តន៍)</th>
                    <th className="px-4 py-2.5 text-left">Guards Personnel SOP Status (ការណែនាំសុវត្ថិភាព)</th>
                    <th className="px-4 py-2.5 text-center w-20 print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {activeReport.mosquitoList && activeReport.mosquitoList.length > 0 ? (
                    activeReport.mosquitoList.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-400 select-none bg-slate-50/20">{idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-slate-900 border-r border-slate-150 font-mono">
                          <span className="bg-[#073B3A]/5 text-[#073B3A] px-2.5 py-1 rounded-md border border-[#073B3A]/10 inline-block">
                            {item.date}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800 border-r border-slate-150">{item.day}</td>
                        <td className="px-4 py-3 font-bold border-r border-slate-150 font-mono text-[#073B3A]">{item.time}</td>
                        <td className="px-4 py-3 text-slate-500 font-medium leading-relaxed">
                          ការបាញ់បំផ្លាញជម្រកមូសខ្លា បានដំណើរការដោយជោគជ័យតាមវិធានការការពារការរាលដាលជំងឺគ្រុនឈាមរបស់ WIS SOP។
                        </td>
                        <td className="px-4 py-3 text-center bg-slate-50/10 print:hidden">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => openFormForSection('mosquito', item)} className="p-1 hover:bg-slate-100 text-slate-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteRow('mosquito', item.id)} className="p-1 hover:bg-rose-50 text-rose-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400 italic">មិនទាន់មានទិន្នន័យបាញ់ថ្នាំមូសប្រចាំខែឡើយ (No mosquitoes spray log registered yet)</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Achievement */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between print:bg-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#073B3A]/10 text-[#073B3A] rounded-lg">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 font-moul leading-normal">
                  ៣. ស្នាដៃនិងសមិទ្ធផលសម្រេចបាន (Key School Achievements)
                </h3>
              </div>
              <button 
                onClick={() => openFormForSection('achievement')}
                className="bg-[#073B3A] hover:bg-[#0d5c5a] text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer print:hidden"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>បន្ថែមសមិទ្ធផល (Add Row)</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <th className="px-4 py-2.5 text-center w-12 border-r border-slate-200">No</th>
                    <th className="px-4 py-2.5 text-left border-r border-slate-200">Description (សមិទ្ធផលដែលសម្រេចបាន)</th>
                    <th className="px-4 py-2.5 text-left">Remarks (កំណត់សម្គាល់បន្ថែម/ដំណើរការអភិវឌ្ឍ)</th>
                    <th className="px-4 py-2.5 text-center w-20 print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {activeReport.achievementList && activeReport.achievementList.length > 0 ? (
                    activeReport.achievementList.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-400 select-none bg-slate-50/20">{idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-slate-900 border-r border-slate-150 leading-relaxed text-xs">{item.description}</td>
                        <td className="px-4 py-3 text-slate-600 font-semibold leading-relaxed font-sans text-xs">{item.remarks}</td>
                        <td className="px-4 py-3 text-center bg-slate-50/10 print:hidden">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => openFormForSection('achievement', item)} className="p-1 hover:bg-slate-100 text-slate-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteRow('achievement', item.id)} className="p-1 hover:bg-rose-50 text-rose-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-400 italic">មិនទាន់មានកត់ត្រាសមិទ្ធផលសម្រេចបានឡើយ (No achievements recorded yet)</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Insurance Claim */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between print:bg-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#073B3A]/10 text-[#073B3A] rounded-lg">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 font-moul leading-normal">
                  ៤. ករណីធានារ៉ាប់រងនិងការទាមទារសំណងសិស្ស (Insurance Claims Tracking)
                </h3>
              </div>
              <button 
                onClick={() => openFormForSection('insurance')}
                className="bg-[#073B3A] hover:bg-[#0d5c5a] text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer print:hidden"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>បន្ថែមសំណង (Add Claim)</span>
              </button>
            </div>
            
            <div className="overflow-x-auto overflow-y-hidden">
              <table className="min-w-full text-xs text-slate-700 border-collapse table-auto">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <th className="px-3 py-2.5 text-center w-12 border-r border-slate-200">No</th>
                    <th className="px-3 py-2.5 text-left border-r border-slate-200">Student Name (ឈ្មោះសិស្ស)</th>
                    <th className="px-3 py-2.5 text-center w-24 border-r border-slate-200">Grade (ថ្នាក់)</th>
                    <th className="px-3 py-2.5 text-center w-20 border-r border-slate-200">Sex (ភេទ)</th>
                    <th className="px-3 py-2.5 text-left border-r border-slate-200">Date Accident / Time</th>
                    <th className="px-3 py-2.5 text-left border-r border-slate-200">Date Claim (កាលបរិច្ឆេទស្នើសុំ)</th>
                    <th className="px-3 py-2.5 text-left">Remarks (ការណែនាំ/ការទូទាត់សំណងជំងឺ)</th>
                    <th className="px-3 py-2.5 text-center w-20 print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {activeReport.insuranceClaimList && activeReport.insuranceClaimList.length > 0 ? (
                    activeReport.insuranceClaimList.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-3 text-center font-mono font-bold text-slate-400 select-none bg-slate-50/20">{idx + 1}</td>
                        <td className="px-3 py-3 font-bold text-slate-900 border-r border-slate-150 leading-relaxed">{item.name}</td>
                        <td className="px-3 py-3 text-center font-bold text-slate-850 border-r border-slate-150">{item.grade}</td>
                        <td className="px-3 py-3 text-center font-bold text-slate-700 border-r border-slate-150">{item.sex}</td>
                        <td className="px-3 py-3 border-r border-slate-150 font-mono text-[11px] leading-relaxed">
                          <span className="block font-semibold text-rose-750">{item.dateAccident}</span>
                          <span className="text-[10px] text-slate-400">{item.timeAccident}</span>
                        </td>
                        <td className="px-3 py-3 border-r border-slate-150 leading-relaxed font-mono font-bold text-blue-800">
                          {item.dateClaim}
                        </td>
                        <td className="px-3 py-3 text-slate-600 font-medium leading-relaxed">{item.remarks}</td>
                        <td className="px-3 py-3 text-center bg-slate-50/10 print:hidden">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => openFormForSection('insurance', item)} className="p-1 hover:bg-slate-100 text-slate-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteRow('insurance', item.id)} className="p-1 hover:bg-rose-50 text-rose-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-6 text-slate-400 italic">មិនទាន់មានករណីគ្រោះថ្នាក់ ស្នើសុំធានារ៉ាប់រងឡើយ (No student claims registered this month)</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dual columns for Absent & Sick lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Section 5: Absent Students */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs flex flex-col justify-between">
              <div>
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between print:bg-white">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#073B3A]/10 text-[#073B3A] rounded-lg">
                      <Users className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs sm:text-xs font-bold text-slate-800 font-moul leading-normal">
                      ៥. អវត្តមានសិស្សប្រចាំថ្ងៃ (Daily Absentees Summary)
                    </h3>
                  </div>
                  <button 
                    onClick={() => openFormForSection('absent')}
                    className="bg-[#073B3A] hover:bg-[#0d5c5a] text-white font-bold text-[9.5px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer print:hidden"
                  >
                    <Plus className="w-3 h-3" />
                    <span>បន្ថែមអវត្តមាន (Add ABS)</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-slate-700 border-collapse table-auto">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-[10.5px]">
                        <th className="px-3 py-2 text-center w-10 border-r border-slate-200">No</th>
                        <th className="px-3 py-2 text-left border-r border-slate-200">Date (កាលបរិច្ឆេទ)</th>
                        <th className="px-3 py-2 text-center w-16 border-r border-slate-200">Male (ប្រុស)</th>
                        <th className="px-3 py-2 text-center w-16 border-r border-slate-200">Female (ស្រី)</th>
                        <th className="px-3 py-2 text-center w-16 border-r border-slate-200">Total (សរុប)</th>
                        <th className="px-3 py-2 text-left">Remarks (មូលហេតុចម្បង)</th>
                        <th className="px-3 py-2 text-center w-16 print:hidden">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {activeReport.absentList && activeReport.absentList.length > 0 ? (
                        activeReport.absentList.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 text-[11px]">
                            <td className="px-3 py-2 text-center font-mono text-slate-400 select-none bg-slate-50/20">{idx + 1}</td>
                            <td className="px-3 py-2 font-bold text-slate-900 border-r border-slate-150 font-mono">{item.date}</td>
                            <td className="px-3 py-2 text-center border-r border-slate-150 font-mono text-slate-705">{item.male}</td>
                            <td className="px-3 py-2 text-center border-r border-slate-150 font-mono text-slate-705">{item.female}</td>
                            <td className="px-3 py-2 text-center border-r border-slate-150 font-bold font-mono text-[#073B3A]">{item.total}</td>
                            <td className="px-3 py-2 text-slate-500 font-medium truncate max-w-[120px]" title={item.remarks}>{item.remarks || '-'}</td>
                            <td className="px-3 py-2 text-center bg-slate-50/10 print:hidden">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => openFormForSection('absent', item)} className="p-0.5 hover:bg-slate-100 text-slate-600 rounded"><Edit2 className="w-3 h-3" /></button>
                                <button onClick={() => handleDeleteRow('absent', item.id)} className="p-0.5 hover:bg-rose-50 text-rose-600 rounded"><Trash2 className="w-3 h-3" /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center py-6 text-slate-400 italic">មិនទាន់មានទិន្នន័យ (No absentees logged yet)</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total calculations */}
              <div className="bg-slate-50 p-3 border-t border-slate-150 font-semibold text-xs flex justify-between items-center text-slate-700 print:bg-white print:text-slate-900">
                <span>មធ្យមភាគអវត្តមានរួមទូទាំងសាលា៖</span>
                <span className="font-mono text-sm font-extrabold text-[#073B3A]">
                  {activeReport.absentList && activeReport.absentList.length > 0 
                    ? (activeReport.absentList.reduce((acc, curr) => acc + curr.total, 0) / activeReport.absentList.length).toFixed(1)
                    : 0
                  } នាក់/ថ្ងៃ (pax)
                </span>
              </div>
            </div>

            {/* Section 6: Sick Students */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs flex flex-col justify-between">
              <div>
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between print:bg-white">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#073B3A]/10 text-[#073B3A] rounded-lg">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs sm:text-xs font-bold text-slate-800 font-moul leading-normal">
                      ៦. សិស្សឈឺប្រចាំថ្ងៃ (Daily Students Sick Logs)
                    </h3>
                  </div>
                  <button 
                    onClick={() => openFormForSection('sick')}
                    className="bg-[#073B3A] hover:bg-[#0d5c5a] text-white font-bold text-[9.5px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer print:hidden"
                  >
                    <Plus className="w-3 h-3" />
                    <span>បន្ថែមសិស្សឈឺ (Add SICK)</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-slate-700 border-collapse table-auto">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-[10.5px]">
                        <th className="px-3 py-2 text-center w-10 border-r border-slate-200">No</th>
                        <th className="px-3 py-2 text-left border-r border-slate-200">Date (កាលបរិច្ឆេទ)</th>
                        <th className="px-3 py-2 text-center w-16 border-r border-slate-200">Male (ប្រុស)</th>
                        <th className="px-3 py-2 text-center w-16 border-r border-slate-200">Female (ស្រី)</th>
                        <th className="px-3 py-2 text-center w-16 border-r border-slate-200">Total (សរុប)</th>
                        <th className="px-3 py-2 text-left">Remarks (រោគសញ្ញាសំខាន់ៗ)</th>
                        <th className="px-3 py-2 text-center w-16 print:hidden">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {activeReport.sickList && activeReport.sickList.length > 0 ? (
                        activeReport.sickList.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 text-[11px]">
                            <td className="px-3 py-2 text-center font-mono text-slate-400 select-none bg-slate-50/20">{idx + 1}</td>
                            <td className="px-3 py-2 font-bold text-slate-900 border-r border-slate-150 font-mono">{item.date}</td>
                            <td className="px-3 py-2 text-center border-r border-slate-150 font-mono text-slate-705">{item.male}</td>
                            <td className="px-3 py-2 text-center border-r border-slate-150 font-mono text-slate-705">{item.female}</td>
                            <td className="px-3 py-2 text-center border-r border-slate-150 font-bold font-mono text-rose-800">{item.total}</td>
                            <td className="px-3 py-2 text-slate-500 font-medium truncate max-w-[120px]" title={item.remarks}>{item.remarks || '-'}</td>
                            <td className="px-3 py-2 text-center bg-slate-50/10 print:hidden">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => openFormForSection('sick', item)} className="p-0.5 hover:bg-slate-100 text-slate-600 rounded"><Edit2 className="w-3 h-3" /></button>
                                <button onClick={() => handleDeleteRow('sick', item.id)} className="p-0.5 hover:bg-rose-50 text-rose-600 rounded"><Trash2 className="w-3 h-3" /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center py-6 text-slate-400 italic">មិនទាន់មានទិន្នន័យសិស្សឈឺឡើយ (No illness cases registered this period)</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total calculations */}
              <div className="bg-slate-50 p-3 border-t border-slate-150 font-semibold text-xs flex justify-between items-center text-slate-700 print:bg-white print:text-slate-900">
                <span>ករណីសរុបសិស្សឈឺដែលបានសម្រាក៖</span>
                <span className="font-mono text-sm font-extrabold text-rose-800">
                  {activeReport.sickList ? activeReport.sickList.reduce((acc, curr) => acc + curr.total, 0) : 0} ករណី (cases)
                </span>
              </div>
            </div>

          </div>

          {/* Prepared By block at the bottom */}
          <div className="border-t border-slate-200 pt-8 mt-12 flex flex-col items-end justify-end space-y-3 pr-4">
            <div className="text-right space-y-1">
              <span className="text-xs text-slate-400 block font-semibold select-none">________Prepared by:</span>
              <div className="flex flex-col items-end print:hidden">
                {/* Editable interactive signature block for personalization */}
                <input 
                  type="text" 
                  value={preparedBy} 
                  onChange={(e) => handleUpdatePreparedDetails(e.target.value, preparedTitle)}
                  className="bg-transparent hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm text-right px-2 py-1 rounded border-0 border-b border-transparent hover:border-slate-300 focus:bg-white focus:border-[#073B3A]/50 outline-hidden transition max-w-sm font-moul leading-normal"
                  title="កែឈ្មោះអ្នករៀបចំ (Edit Prepared By Name)"
                />
                <input 
                  type="text" 
                  value={preparedTitle} 
                  onChange={(e) => handleUpdatePreparedDetails(preparedBy, e.target.value)}
                  className="bg-transparent hover:bg-slate-100 text-[#073B3A] font-bold text-[10px] sm:text-xs text-right px-2 py-0.5 rounded border-0 border-b border-transparent hover:border-slate-300 focus:bg-white focus:border-[#073B3A]/50 outline-hidden transition max-w-sm mt-0.5"
                  title="កែតំណែងអ្នករៀបចំ (Edit Prepared By Title)"
                />
              </div>
              
              {/* Static Signature display for printing rendering */}
              <div className="hidden print:block text-right">
                <h4 className="text-sm font-extrabold text-slate-905 font-moul mb-0.5 leading-normal">{activeReport.preparedBy || 'Mr. LOUNG Veasna'}</h4>
                <p className="text-xs text-[#073B3A] font-bold">{activeReport.preparedTitle || 'Admin Supervisor'}</p>
                <div className="mt-12 text-[10px] text-slate-400 italic">Signature Verified Digitally</div>
              </div>

            </div>
          </div>

        </div>

        {/* Dynamic bottom information bar */}
        <div className="bg-[#073B3A]/5 border-t border-slate-150 p-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4.5 h-4.5 text-[#073B3A] shrink-0" />
            <span>
              <b>ព័ត៌មាន៖</b> ប្រព័ន្ធស្វ័យប្រវត្តិបំពាក់រាល់រៀបចំរបាយការណ៍សង្ខេបប្រចាំខែនេះ ដើម្បីដាក់ជូនគណៈគ្រប់គ្រងពិនិត្យតាមដាន។
            </span>
          </div>
          <div className="font-mono text-[9px] font-semibold text-slate-400 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-lg select-none">
            WIS-SOP-V2.1 • MONTHLY_REPORTS_DB
          </div>
        </div>

      </div>

      {/* Dynamic Pop-up Form Dialog Modal based on requested segment */}
      {activeFormSection !== null && (
        <div className="fixed inset-0 bg-[#041615]/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in print:hidden">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#073B3A] to-[#042423] p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="bg-amber-400 p-2 rounded-xl text-slate-950">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-moul leading-normal">
                    {editingRowId ? 'កែប្រែទិន្នន័យតាមបន្ទាត់ (Edit Row Item)' : 'បន្ថែមទិន្នន័យតាមបន្ទាត់ (Add Row Item)'}
                  </h3>
                  <p className="text-[10px] text-emerald-200/90 font-medium">បំពេញទិន្នន័យដើម្បីបញ្ចូលក្នុងគ្រោងរបាយការណ៍ {activeReport.month}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveFormSection(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body form routing based on section type */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-800">
              
              {activeFormSection === 'lunch' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Description / ឈ្មោះអាហារថ្ងៃត្រង់ <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="ឧ. កញ្ចប់អាហារសិស្សមត្តេយ្យ (Kindergarten Lunch box)"
                      value={lunchDesc}
                      onChange={(e) => setLunchDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white text-xs font-semibold focus:outline-hidden focus:border-[#073B3A]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Count / ចំនួនកញ្ចប់ <span className="text-red-500">*</span></label>
                      <input 
                        type="number" 
                        required 
                        value={lunchCount}
                        onChange={(e) => setLunchCount(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:bg-white focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Total / សរុបរួម ($/Qty) <span className="text-red-500">*</span></label>
                      <input 
                        type="number" 
                        required 
                        value={lunchTotal}
                        onChange={(e) => setLunchTotal(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Note / កំណត់សម្គាល់</label>
                    <input 
                      type="text" 
                      value={lunchNote}
                      onChange={(e) => setLunchNote(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {activeFormSection === 'mosquito' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Date of spray / កាលបរិច្ឆេទអនុវត្តការបាញ់មូស <span className="text-red-500">*</span></label>
                    <input 
                      type="date" 
                      required
                      value={mosquitoDate}
                      onChange={(e) => setMosquitoDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold focus:bg-white text-xs focus:outline-hidden focus:border-[#073B3A]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Day / ថ្ងៃនៃសប្ដាហ៍ <span className="text-red-500">*</span></label>
                      <select
                        value={mosquitoDay}
                        onChange={(e) => setMosquitoDay(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:bg-white"
                      >
                        {getDayList().map((d, i) => (
                          <option key={i} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Execution Time / ម៉ោងអនុវត្តន៍ <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        placeholder="ឧ. 05:30 PM"
                        value={mosquitoTime}
                        onChange={(e) => setMosquitoTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeFormSection === 'achievement' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Achievement Description / សមិទ្ធផលគួរឱ្យកត់សម្គាល់ <span className="text-red-500">*</span></label>
                    <textarea 
                      rows={3}
                      required
                      placeholder="សរសេរពិពណ៌នាអំពីលទ្ធផលដែលទទួលបាន..."
                      value={achieveDesc}
                      onChange={(e) => setAchieveDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden focus:border-[#073B3A] resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Remarks / មតិយោបល់ ឬការណែនាំ</label>
                    <input 
                      type="text" 
                      placeholder="ឧ. បានបញ្ចប់រួចរាល់ និងដំណើរការបានធម្មតា"
                      value={achieveRemarks}
                      onChange={(e) => setAchieveRemarks(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {activeFormSection === 'insurance' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Student Name / ឈ្មោះសិស្សគ្រោះថ្នាក់ <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="ឧ. ឈឿន វិច្ឆិកា"
                      value={insClaimName}
                      onChange={(e) => setInsClaimName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:bg-white focus:outline-hidden focus:border-[#073B3A]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Grade / កម្រិតថ្នាក់ <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        placeholder="ឧ. Grade 10B"
                        value={insClaimGrade}
                        onChange={(e) => setInsClaimGrade(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:bg-white focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Sex / ភេទ <span className="text-red-500">*</span></label>
                      <select 
                        value={insClaimSex}
                        onChange={(e) => setInsClaimSex(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:bg-white"
                      >
                        <option value="Male (ប្រុស)">Male (ប្រុស)</option>
                        <option value="Female (ស្រី)">Female (ស្រី)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Date of Accident <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        required
                        value={insClaimAccDate}
                        onChange={(e) => setInsClaimAccDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Time of Accident <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        placeholder="ឧ. 10:15 AM"
                        value={insClaimAccTime}
                        onChange={(e) => setInsClaimAccTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Date Claimed / កាលបរិច្ឆេទស្នើសុំទូទាត់ធានារ៉ាប់រង <span className="text-red-500">*</span></label>
                    <input 
                      type="date" 
                      required
                      value={insClaimDate}
                      onChange={(e) => setInsClaimDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:outline-hidden focus:border-[#073B3A]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Remarks / មតិកែសម្រួល ឬជំងឺសម្រាកព្យាបាល</label>
                    <textarea 
                      rows={2}
                      placeholder="ពត៌មានលម្អិតពីការទូទាត់សំណងជំងឺ..."
                      value={insClaimRemarks}
                      onChange={(e) => setInsClaimRemarks(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden resize-none"
                    />
                  </div>
                </div>
              )}

              {activeFormSection === 'absent' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Date / កាលបរិច្ឆេទ <span className="text-red-500">*</span></label>
                    <input 
                      type="date" 
                      required
                      value={absentDate}
                      onChange={(e) => setAbsentDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold focus:bg-white text-xs focus:outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Male Absentees / ប្រុស (នាក់) <span className="text-red-500">*</span></label>
                      <input 
                        type="number" 
                        required
                        value={absentMale}
                        onChange={(e) => setAbsentMale(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Female Absentees / ស្រី (នាក់) <span className="text-red-500">*</span></label>
                      <input 
                        type="number" 
                        required
                        value={absentFemale}
                        onChange={(e) => setAbsentFemale(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Remarks / មូលហេតុ និងសេចក្តីកត់សម្គាល់</label>
                    <input 
                      type="text" 
                      placeholder="ឧ. Excused via online system"
                      value={absentRemarks}
                      onChange={(e) => setAbsentRemarks(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {activeFormSection === 'sick' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Date / កាលបរិច្ឆេទ <span className="text-red-500">*</span></label>
                    <input 
                      type="date" 
                      required
                      value={sickDate}
                      onChange={(e) => setSickDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold focus:bg-white text-xs focus:outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Male / ភេទប្រុស (នាក់) <span className="text-red-700">*</span></label>
                      <input 
                        type="number" 
                        required
                        value={sickMale}
                        onChange={(e) => setSickMale(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">Female / ភេទស្រី (នាក់) <span className="text-red-700">*</span></label>
                      <input 
                        type="number" 
                        required
                        value={sickFemale}
                        onChange={(e) => setSickFemale(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">Remarks / អាការៈឬអាកប្បកិរិយាឈឺ</label>
                    <input 
                      type="text" 
                      placeholder="ឧ. អាការៈក្តៅខ្លួនស្រាល និងផ្តាសាយ"
                      value={sickRemarks}
                      onChange={(e) => setSickRemarks(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons within Dialog Form */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveFormSection(null);
                    setEditingRowId(null);
                  }}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#073B3A] hover:bg-[#0c5352] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4 text-emerald-300 stroke-[2.5px]" />
                  <span>រក្សាទុក (Save Record)</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Embedded print styling specifically designed for high quality output */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area-wrapper, #print-area-wrapper * {
            visibility: visible;
          }
          #print-area-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
          }
          .print\\:hidden, button, select, input[type="month"] {
            display: none !important;
          }
          /* Hide interactive action buttons when printing standard SOPs */
          th:last-child, td:last-child {
            display: none !important;
          }
          /* Ensure headers are displayed beautifully */
          .print\\:bg-white {
            background-color: #fff !important;
            color: #000 !important;
          }
          .print\\:text-[#073B3A] {
            color: #073B3A !important;
          }
        }
      `}</style>

    </div>
  );
};
