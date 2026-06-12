/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileText, FileSpreadsheet, UploadCloud, Trash2, Download, Search, 
  Calendar, CheckCircle, XCircle, Info, Plus, Clock, ChevronLeft, 
  ChevronRight, Sparkles, Check, AlertCircle, File, FolderOpen, AlertTriangle,
  Wind, Printer, Wrench, Shield, CheckSquare, Square, Zap, Droplet, 
  HardDrive, ShieldCheck, Eye, ExternalLink, RefreshCw, FileDown
} from 'lucide-react';

interface DocCategory {
  id: string;
  num: number;
  titleKh: string;
  titleEn: string;
  iconType: 'wind' | 'printer' | 'wrench' | 'shield' | 'zap' | 'droplet' | 'harddrive' | 'shieldcheck' | 'filetext' | 'filespreadsheet' | 'folder' | 'sparkles' | 'checklist';
  descriptionKh: string;
  descriptionEn: string;
}

const CATEGORIES: DocCategory[] = [
  {
    id: 'ac_maintenance',
    num: 1,
    titleKh: 'របាយការណ៍ថែទាំម៉ាស៊ីនត្រជាក់',
    titleEn: 'Air Conditioner maintenance report is updated',
    iconType: 'wind',
    descriptionKh: 'តាមដានការលាងសម្អាត បញ្ចូលហ្គាស និងជួសជុលម៉ាស៊ីនត្រជាក់គ្រប់ទីតាំង។',
    descriptionEn: 'Tracks cleaning, refrigerant refills, and repairs for all air conditioner units.'
  },
  {
    id: 'photocopier_maintenance',
    num: 2,
    titleKh: 'របាយការណ៍ថែទាំម៉ាស៊ីនថតចម្លង (ម៉ាស៊ីន Copy)',
    titleEn: 'Photocopier maintenance report is updated',
    iconType: 'printer',
    descriptionKh: 'កត់ត្រាការផ្លាស់ប្តូរថ្នាំទឹក គ្រឿងបន្លាស់ និងការថែទាំម៉ាស៊ីនថតចម្លង។',
    descriptionEn: 'Logs ink/toner replacement, parts servicing, and photocopier maintenance.'
  },
  {
    id: 'additional_maintenance',
    num: 3,
    titleKh: 'របាយការណ៍តាមដានការថែទាំបន្ថែម',
    titleEn: 'Additional Maintenance follow up report is updated',
    iconType: 'wrench',
    descriptionKh: 'តាមដានសកម្មភាពជួសជុល ថែទាំទូទៅ និងការងាររៀបចំអគារបន្ថែម។',
    descriptionEn: 'Registers general repairs, preventive upkeep, and property improvements.'
  },
  {
    id: 'pest_killing',
    num: 4,
    titleKh: 'ការតាមដានកាលវិភាគកំចាត់សត្វល្អិត',
    titleEn: 'Schedule for Pest killing is followed',
    iconType: 'shield',
    descriptionKh: 'កត់ត្រាការបាញ់ថ្នាំ និងកំចាត់សត្វល្អិត កណ្តៀរ មូស កណ្តុរ តាមការិយាល័យ និងថ្នាក់រៀន។',
    descriptionEn: 'Documents professional chemical treatments against pests, termites, and insects.'
  },
  {
    id: 'office_supply',
    num: 5,
    titleKh: 'របាយការណ៍គ្រប់គ្រងសន្និធិសម្ភារៈការិយាល័យ',
    titleEn: 'Office supply report is updated',
    iconType: 'folder',
    descriptionKh: 'គ្រប់គ្រងការស្នើសុំ ការបើកផ្តល់ និងស្តុកសម្ភារៈការិយាល័យប្រចាំខែ។',
    descriptionEn: 'Manages monthly stock levels, stationery requests, and distribution logs.'
  },
  {
    id: 'cleaning_materials',
    num: 6,
    titleKh: 'របាយការណ៍គ្រប់គ្រងសម្ភារៈសម្អាតអនាម័យ',
    titleEn: 'Cleaning materials report is updated',
    iconType: 'droplet',
    descriptionKh: 'តាមដានវត្តមាន និងបរិមាណសារធាតុសាប៊ូ ក្រដាសអនាម័យ និងឧបករណ៍អនាម័យ។',
    descriptionEn: 'Tracks detergent inventory, hygiene supplies, and cleaning apparatus usage.'
  },
  {
    id: 'utility_bills',
    num: 7,
    titleKh: 'ការកត់ត្រាឯកសារវិក្កយបត្រទឹក និងអគ្គិសនី',
    titleEn: 'Electricity and Water Bill are documented properly',
    iconType: 'zap',
    descriptionKh: 'កត់ត្រានិងរក្សាទុកវិក្កយបត្រ ព្រមទាំងការតាមដានការប្រើប្រាស់អគ្គិសនី និងទឹក។',
    descriptionEn: 'Maintains records of monthly utilities payment bills and consumption metrics.'
  },
  {
    id: 'fixed_asset_check',
    num: 8,
    titleKh: 'ការកត់ត្រា ត្រួតពិនិត្យ និងរាប់បញ្ជីទ្រព្យសម្បត្តិថេរ',
    titleEn: 'Fixed Asset is updated/checked/counted',
    iconType: 'harddrive',
    descriptionKh: 'កត់ត្រាតារាងសារពើភ័ណ្ឌ បញ្ជីទ្រព្យសម្បត្តិសាលា និងលទ្ធផលត្រួតពិនិត្យជាក់ស្តែង។',
    descriptionEn: 'Stores physical counting results, depreciation tracking, and inventory audits.'
  },
  {
    id: 'safety_cameras',
    num: 9,
    titleKh: 'បង្កាន់ដៃត្រួតពិនិត្យដំណើរការកាមេរ៉ាសុវត្ថិភាព (CCTV)',
    titleEn: 'Safety Cameras are working and in good condition',
    iconType: 'shieldcheck',
    descriptionKh: 'បញ្ជាក់ស្ថានភាពដំណើរការស្ដុកទុកទិន្នន័យ (NVR) និងមុំកាមេរ៉ាគ្រប់កន្លែង។',
    descriptionEn: 'Verifies operational uptime, recording history, and lens adjustments for CCTV.'
  },
  {
    id: 'staff_food',
    num: 10,
    titleKh: 'របាយការណ៍អាហារបុគ្គលិក (មានហត្ថលេខាទទួល)',
    titleEn: "Staff food report is updated (with staff's signature)",
    iconType: 'checklist',
    descriptionKh: 'កត់ត្រាបញ្ជីមុខម្ហូប ថ្លៃចំណាយ និងការចុះហត្ថលេខាទទួលអាហារប្រចាំថ្ងៃរបស់បុគ្គលិក។',
    descriptionEn: 'Tracks catering costs, daily menu counts, and staff sign-off attendance sheets.'
  },
  {
    id: 'event_materials',
    num: 11,
    titleKh: 'ការកត់ត្រានិងគ្រប់គ្រងសម្ភារៈព្រឹត្តិការណ៍',
    titleEn: 'Event Materials are recorded properly',
    iconType: 'sparkles',
    descriptionKh: 'បញ្ជីឧបករណ៍ សម្ភារៈតុបតែង ផ្ទាំងរូបភាព និងរង្វាន់សម្រាប់កម្មវិធីសាលា។',
    descriptionEn: 'Registers equipment, decorations, backdrop prints, and trophies for school events.'
  },
  {
    id: 'admin_documents',
    num: 12,
    titleKh: 'ការរៀបចំ និងការទុកដាក់ឯកសាររដ្ឋបាល',
    titleEn: 'Documents are properly prepared and arranged',
    iconType: 'folder',
    descriptionKh: 'ការចាត់ថ្នាក់ លិខិតចូល-ចេញ កិច្ចសន្យាការងារ និងឯកសាររដ្ឋបាលសំខាន់ៗ។',
    descriptionEn: 'Categorizes official incoming/outgoing letters, work contracts, and admin file-trees.'
  },
  {
    id: 'medicine_nurse',
    num: 13,
    titleKh: 'របាយការណ៍ថ្នាំសង្កូវប្រចាំខែ (បន្ទប់គិលានដ្ឋាន)',
    titleEn: 'Monthly report for Medicines (Nurse room) are updated',
    iconType: 'filetext',
    descriptionKh: 'តាមដានការប្រើប្រាស់ថ្នាំ បរិមាណស្តុកថ្នាំសង្គ្រោះបឋម និងកាលបរិច្ឆេទហួសកំណត់។',
    descriptionEn: 'Monitors medical logbooks, active nurse supplies inventory, and drug expiry dates.'
  },
  {
    id: 'purchase_requests',
    num: 14,
    titleKh: 'ការរក្សាទុកទម្រង់ស្នើសុំទិញដើម (Purchase Request - PR)',
    titleEn: 'Original Purchase Request form is documented properly',
    iconType: 'filespreadsheet',
    descriptionKh: 'ប្រមូលផ្ដុំទម្រង់ស្នើសុំទិញដើមដែលមានចុះហត្ថលេខាអនុម័ត និង رسید ទិញទំនិញ។',
    descriptionEn: 'Consolidates original countersigned internal request sheets and cash receipts.'
  }
];

interface DocFileRecord {
  id: string;
  categoryId: string;
  month: string; // YYYY-MM格式 eg 2026-05
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'excel' | 'spreadsheet' | 'image';
  uploadedAt: string;
  fileData?: string; // base64 string
  uploadedBy: string;
}

interface DocMonthStatus {
  key: string; // categoryId_month
  categoryId: string;
  month: string; // YYYY-MM
  isDone: boolean;
  notes: string;
  updatedAt: string;
  updatedBy: string;
}

export default function AdminDocumentationManager() {
  const [selectedCategory, setSelectedCategory] = useState<DocCategory>(CATEGORIES[0]);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(4); // Default to May (0-indexed, so 4 is May)
  const [searchQuery, setSearchQuery] = useState('');
  
  // Database States
  const [files, setFiles] = useState<DocFileRecord[]>([]);
  const [statusRegistry, setStatusRegistry] = useState<Record<string, DocMonthStatus>>({});
  
  // Interactive UI States
  const [isDragOver, setIsDragOver] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'info' | 'warning' } | null>(null);
  const [fileToDelete, setFileToDelete] = useState<DocFileRecord | null>(null);
  const [fileToView, setFileToView] = useState<DocFileRecord | null>(null);
  const [parsedExcelRows, setParsedExcelRows] = useState<any[][] | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'categoryView' | 'yearlyMatrix'>('categoryView');

  // Blob conversion effect for safe PDF / file iframe rendering (bypassing browser blocks for huge base64 data URLs)
  useEffect(() => {
    if (fileToView && fileToView.fileData) {
      if (fileToView.fileData.startsWith('data:')) {
        try {
          const parts = fileToView.fileData.split(';base64,');
          const contentType = parts[0].split(':')[1] || 'application/octet-stream';
          const raw = window.atob(parts[1]);
          const rawLength = raw.length;
          const uInt8Array = new Uint8Array(rawLength);
          for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
          }
          const blob = new Blob([uInt8Array], { type: contentType });
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          return () => {
            URL.revokeObjectURL(url);
          };
        } catch (e) {
          console.error("Error creating blob URL for preview:", e);
          setPreviewUrl(fileToView.fileData);
        }
      } else {
        // Server upload URL: Add preview query parameter to serve with inline disposition
        const hasQuery = fileToView.fileData.includes('?');
        const previewUrlString = fileToView.fileData + (hasQuery ? '&' : '?') + 'preview=true';
        setPreviewUrl(previewUrlString);
      }
    } else {
      setPreviewUrl(null);
    }
  }, [fileToView]);

  // Excel real-time parser hook
  useEffect(() => {
    if (fileToView && fileToView.fileType === 'excel' && fileToView.fileData) {
      if (fileToView.fileData.startsWith('data:') || !fileToView.fileData.startsWith('/')) {
        try {
          const base64Data = fileToView.fileData;
          const parts = base64Data.split(';base64,');
          const b64 = parts.length > 1 ? parts[1] : parts[0];
          const workbook = XLSX.read(b64, { type: 'base64' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          if (data && data.length > 0) {
            setParsedExcelRows(data);
          } else {
            setParsedExcelRows(null);
          }
        } catch (err) {
          console.error('Error parsing excel base64 with xlsx:', err);
          setParsedExcelRows(null);
        }
      } else {
        // Fetch URL as array buffer with correct type to prevent binary truncation
        fetch(fileToView.fileData)
          .then((res) => {
            if (!res.ok) throw new Error("Could not fetch file from server");
            return res.arrayBuffer();
          })
          .then((buf) => {
            const workbook = XLSX.read(buf, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            if (data && data.length > 0) {
              setParsedExcelRows(data);
            } else {
              setParsedExcelRows(null);
            }
          })
          .catch((err) => {
            console.error('Error fetching/parsing server excel file:', err);
            setParsedExcelRows(null);
          });
      }
    } else {
      setParsedExcelRows(null);
    }
  }, [fileToView]);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Month Names
  const MONTHS_KM = [
    { label: 'មករា', eng: 'January', code: '01' },
    { label: 'កុម្ភៈ', eng: 'February', code: '02' },
    { label: 'មីនា', eng: 'March', code: '03' },
    { label: 'មេសា', eng: 'April', code: '04' },
    { label: 'ឧសភា', eng: 'May', code: '05' },
    { label: 'មិថុនា', eng: 'June', code: '06' },
    { label: 'កក្កដា', eng: 'July', code: '07' },
    { label: 'សីហា', eng: 'August', code: '08' },
    { label: 'កញ្ញា', eng: 'September', code: '09' },
    { label: 'តុលា', eng: 'October', code: '10' },
    { label: 'វិច្ឆិកា', eng: 'November', code: '11' },
    { label: 'ធ្នូ', eng: 'December', code: '12' }
  ];

  const activeMonthCode = MONTHS_KM[selectedMonthIndex].code;
  const activeMonthString = `${currentYear}-${activeMonthCode}`;

  // Load Data
  useEffect(() => {
    try {
      const storedFiles = localStorage.getItem('school_admin_docs_files_v1');
      if (storedFiles) {
        setFiles(JSON.parse(storedFiles));
      } else {
        // Feed in some realistic default simulated documents
        const initialMockFiles: DocFileRecord[] = [
          {
            id: 'mock-1',
            categoryId: 'ac_maintenance',
            month: '2026-05',
            fileName: 'AC_Maintenace_Report_May_2026.xlsx',
            fileSize: 45200,
            fileType: 'excel',
            uploadedAt: '2026-05-15T08:30:00.000Z',
            uploadedBy: 'វ៉ាន់ ធារ៉ា (VAN Theara)'
          },
          {
            id: 'mock-2',
            categoryId: 'ac_maintenance',
            month: '2026-05',
            fileName: 'AC_Inspection_Cert_Floor2_BuildingA.pdf',
            fileSize: 245000,
            fileType: 'pdf',
            uploadedAt: '2026-05-20T10:15:00.000Z',
            uploadedBy: 'សេង គឹមសួរ (SENG Kimsuor)'
          },
          {
            id: 'mock-3',
            categoryId: 'photocopier_maintenance',
            month: '2026-05',
            fileName: 'Admin_Photocopier_May_Log.xlsx',
            fileSize: 32800,
            fileType: 'excel',
            uploadedAt: '2026-05-22T04:12:00.000Z',
            uploadedBy: 'សេង គឹមសួរ (SENG Kimsuor)'
          },
          {
            id: 'mock-4',
            categoryId: 'utility_bills',
            month: '2026-05',
            fileName: 'May_Electric_EDC_Invoice.pdf',
            fileSize: 189000,
            fileType: 'pdf',
            uploadedAt: '2026-05-28T09:05:00.000Z',
            uploadedBy: 'រស់ ចាន់នី (ROS Channy)'
          },
          {
            id: 'mock-5',
            categoryId: 'pest_killing',
            month: '2026-05',
            fileName: 'Pest_Control_Certificate_Q2_2026.pdf',
            fileSize: 512000,
            fileType: 'pdf',
            uploadedAt: '2026-05-10T02:00:00.000Z',
            uploadedBy: 'វ៉ាន់ ធារ៉ា (VAN Theara)'
          }
        ];
        setFiles(initialMockFiles);
        localStorage.setItem('school_admin_docs_files_v1', JSON.stringify(initialMockFiles));
      }

      const storedStatus = localStorage.getItem('school_admin_docs_status_v1');
      if (storedStatus) {
        setStatusRegistry(JSON.parse(storedStatus));
      } else {
        const initialStatus: Record<string, DocMonthStatus> = {
          'ac_maintenance_2026-05': {
            key: 'ac_maintenance_2026-05',
            categoryId: 'ac_maintenance',
            month: '2026-05',
            isDone: true,
            notes: 'រាល់ម៉ាស៊ីនត្រជាក់ទាំងអស់ត្រូវបានត្រួតពិនិត្យ និងសម្អាតរួចរាល់សម្រាប់ត្រីមាសទី២។',
            updatedAt: '2026-05-20T10:15:00.000Z',
            updatedBy: 'សេង គឹមសួរ (SENG Kimsuor)'
          },
          'photocopier_maintenance_2026-05': {
            key: 'photocopier_maintenance_2026-05',
            categoryId: 'photocopier_maintenance',
            month: '2026-05',
            isDone: true,
            notes: 'បានផ្លាស់ប្តូរថ្នាំ និងសម្អាតកម្ទេចក្រដាសរួចរាល់។ ម៉ាស៊ីនចម្លងដំណើរការស្រួល។',
            updatedAt: '2026-05-22T04:12:00.000Z',
            updatedBy: 'សេង គឹមសួរ (SENG Kimsuor)'
          }
        };
        setStatusRegistry(initialStatus);
        localStorage.setItem('school_admin_docs_status_v1', JSON.stringify(initialStatus));
      }
    } catch (e) {
      console.error('Error loading admin docs from storage:', e);
    }
  }, []);

  const saveDatabase = (newFiles: DocFileRecord[], newStatus: Record<string, DocMonthStatus>) => {
    try {
      localStorage.setItem('school_admin_docs_files_v1', JSON.stringify(newFiles));
      localStorage.setItem('school_admin_docs_status_v1', JSON.stringify(newStatus));
      setFiles(newFiles);
      setStatusRegistry(newStatus);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      showToast('ទំហំផ្ទុកលើសកម្រិត! មិនអាចរក្សាទុកឯកសារធំបានទេ សូមលុបខ្លះសិន។', 'warning');
    }
  };

  const showToast = (message: string, type: 'success' | 'danger' | 'info' | 'warning') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Helper to get Category specific icon component
  const getIcon = (type: string, className = "w-5 h-5") => {
    switch (type) {
      case 'wind': return <Wind className={className} />;
      case 'printer': return <Printer className={className} />;
      case 'wrench': return <Wrench className={className} />;
      case 'shield': return <Shield className={className} />;
      case 'zap': return <Zap className={className} />;
      case 'droplet': return <Droplet className={className} />;
      case 'harddrive': return <HardDrive className={className} />;
      case 'shieldcheck': return <ShieldCheck className={className} />;
      case 'sparkles': return <Sparkles className={className} />;
      case 'folder': return <FolderOpen className={className} />;
      case 'filespreadsheet': return <FileSpreadsheet className={className} />;
      default: return <FileText className={className} />;
    }
  };

  const currentStatusKey = `${selectedCategory.id}_${activeMonthString}`;
  const currentMonthStatus = statusRegistry[currentStatusKey] || {
    key: currentStatusKey,
    categoryId: selectedCategory.id,
    month: activeMonthString,
    isDone: false,
    notes: '',
    updatedAt: '',
    updatedBy: ''
  };

  const handleToggleStatus = () => {
    const updatedStatus = { ...statusRegistry };
    const newStatusVal = !currentMonthStatus.isDone;
    
    updatedStatus[currentStatusKey] = {
      ...currentMonthStatus,
      isDone: newStatusVal,
      updatedAt: new Date().toISOString(),
      updatedBy: 'បង្រ្គីប រដ្ឋបាល (Admin User)'
    };
    
    saveDatabase(files, updatedStatus);
    showToast(
      newStatusVal 
        ? `បានសម្គាល់ "${selectedCategory.titleKh}" ថា [បានធ្វើបច្ចុប្បន្នភាព] រួចរាល់!` 
        : `បានដកស្ថានភាពរួចរាល់របស់ "${selectedCategory.titleKh}" វិញ`, 
      newStatusVal ? 'success' : 'info'
    );
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedStatus = { ...statusRegistry };
    updatedStatus[currentStatusKey] = {
      ...currentMonthStatus,
      notes: e.target.value,
      updatedAt: new Date().toISOString(),
      updatedBy: 'បង្រ្គីប រដ្ឋបាល (Admin User)'
    };
    saveDatabase(files, updatedStatus);
  };

  // Handle file insertions with full-stack multipart form upload
  const processFiles = async (fileList: FileList) => {
    const addedFilesCount = fileList.length;
    if (addedFilesCount === 0) return;

    const newFilesList = [...files];
    let successCount = 0;

    for (const file of Array.from(fileList)) {
      // Requirement 1: core debugging logs for audit
      console.log("file:", file);
      console.log("file.size:", file.size);

      // Check if size = 0 (Requirement 1: size = 0 -> upload is broken)
      if (file.size === 0) {
        showToast(`មិនអាចបញ្ចូលឯកសារ "${file.name}" បានទេ ព្រោះទំហំឯកសារស្មើនឹង 0 Bytes (Empty File)!`, 'danger');
        continue;
      }

      const extension = file.name.split('.').pop()?.toLowerCase();
      const isExcel = ['xlsx', 'xls', 'csv'].includes(extension || '');
      const isPdf = extension === 'pdf';
      const isPhoto = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension || '');

      if (!isExcel && !isPdf && !isPhoto) {
        showToast(`មិនគាំទ្រឯកសារប្រភេទនេះទេ! សាកល្បង PDF, Excel ឬរូបភាពស៊េរីថ្មីវិញ។ (${file.name})`, 'warning');
        continue;
      }

      // Requirement 7: Validate MIME Type
      const allowedMimes = [
        "application/pdf",
        "application/x-pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
        "application/csv",
        "application/octet-stream",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/webp"
      ];
      const isMimeAllowed = allowedMimes.includes(file.type || "");
      const isExtensionAllowed = ['xlsx', 'xls', 'csv', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension || '');

      if (!isMimeAllowed && !isExtensionAllowed) {
        showToast(`មិនគាំទ្រប្រភេទ MIME: ${file.type || "unknown"} ឡើយ! អនុញ្ញាតតែឯកសារ PDF, Excel (.xlsx, .xls, .csv) និងរូបភាព (.png, .jpg, .jpeg, .gif, .webp) ប៉ុណ្ណោះ។`, 'danger');
        continue;
      }

      try {
        // Requirement 2: ប្រើ FormData ត្រឹមត្រូវ
        const formData = new FormData();
        formData.append("file", file);

        showToast(`កំពុងបញ្ចូលឯកសារ "${file.name}"...`, 'info');

        const response = await fetch("/upload", {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          const errResponse = await response.json().catch(() => ({}));
          throw new Error(errResponse.error || `Upload failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("Server response details:", data);

        const newRecord: DocFileRecord = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          categoryId: selectedCategory.id,
          month: activeMonthString,
          fileName: file.name,
          fileSize: file.size,
          fileType: isExcel ? 'excel' : isPdf ? 'pdf' : isPhoto ? 'image' : 'pdf',
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'រដ្ឋបាលសាលា (School Admin)',
          fileData: data.url // e.g. /download/171584...-file.xlsx
        };

        newFilesList.push(newRecord);
        successCount++;
      } catch (err: any) {
        console.error("Upload error details:", err);
        showToast(`ការបញ្ចូលឯកសារ "${file.name}" មិនបានសម្រេច៖ ${err.message}`, 'danger');
      }
    }

    if (successCount > 0) {
      // If files were loaded, auto mark status to completed/isDone to maintain rich state interaction
      const updatedStatus = { ...statusRegistry };
      if (!updatedStatus[currentStatusKey]) {
        updatedStatus[currentStatusKey] = {
          key: currentStatusKey,
          categoryId: selectedCategory.id,
          month: activeMonthString,
          isDone: true,
          notes: 'ឯកសារត្រូវបានបញ្ចូលរួចរាល់ និងបានធ្វើបច្ចុប្បន្នភាពកាលបរិច្ឆេទដោយជោគជ័យ។',
          updatedAt: new Date().toISOString(),
          uploadedBy: 'រដ្ឋបាលសាលា (School Admin)'
        };
      } else {
        updatedStatus[currentStatusKey].isDone = true;
      }

      saveDatabase(newFilesList, updatedStatus);
      showToast(`បានបញ្ចូលឯកសារចំនួន ${successCount} ទៅកាន់ម៉ាស៊ីនបម្រើ និងរក្សាទុកដោយជោគជ័យ!`, 'success');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Delete Action
  const triggerDelete = (record: DocFileRecord) => {
    setFileToDelete(record);
  };

  const confirmDeleteFile = () => {
    if (!fileToDelete) return;

    const remaining = files.filter(f => f.id !== fileToDelete.id);
    saveDatabase(remaining, statusRegistry);
    showToast(`បានលុបឯកសារ "${fileToDelete.fileName}" រួចរាល់`, 'info');
    setFileToDelete(null);
  };

  // Convert base64 data to Blob for safe iframe-sandboxed downloads that can be read properly
  const base64ToBlob = (base64Data: string, defaultType = '') => {
    try {
      const parts = base64Data.split(';base64,');
      const contentType = parts.length > 1 ? parts[0].split(':')[1] : defaultType;
      const raw = parts.length > 1 ? parts[1] : parts[0];
      const sliceSize = 1024;
      const byteCharacters = atob(raw);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      return new Blob(byteArrays, { type: contentType });
    } catch (e) {
      console.error('Error converting base64 to blob:', e);
      return null;
    }
  };

  // Handle Download File (triggers a real browser download)
  const downloadFile = (fileRecord: DocFileRecord) => {
    if (fileRecord.fileData) {
      if (fileRecord.fileData.startsWith('data:')) {
        try {
          const ext = fileRecord.fileName.split('.').pop()?.toLowerCase() || '';
          let defaultMime = 'application/octet-stream';
          if (fileRecord.fileType === 'excel') {
            defaultMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          } else if (fileRecord.fileType === 'pdf') {
            defaultMime = 'application/pdf';
          } else if (fileRecord.fileType === 'image') {
            defaultMime = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
          }
          const blob = base64ToBlob(fileRecord.fileData, defaultMime);
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileRecord.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast(`កំពុងទាញយកឯកសារគឺ "${fileRecord.fileName}" ទទួលបានជោគជ័យ។`, 'success');
          } else {
            showToast('ការលុបនិងទាញយកឯកសាររអាក់រអួល', 'danger');
          }
        } catch (err) {
          console.error('Download error:', err);
          showToast('ការទាញយកឯកសារមានបញ្ហា', 'danger');
        }
      } else {
        // Direct server-side download via res.download with correct headers
        const link = document.createElement('a');
        link.href = fileRecord.fileData; // points to /download/:filename
        link.download = fileRecord.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`កំពុងទាញយកឯកសារគឺ "${fileRecord.fileName}" ពីម៉ាស៊ីនបម្រើ...`, 'success');
      }
    } else {
      // Generate high-quality realistic CSV/PDF content fallback
      const isExcel = fileRecord.fileType === 'excel';
      let unicodeContent = '';
      if (isExcel) {
        const cat = CATEGORIES.find(c => c.id === fileRecord.categoryId);
        // Start with UTF-8 BOM so MS Excel opens Cambodian Khmer unicode characters properly!
        unicodeContent = '\ufeff' + `"ល.រ","កិច្ចការគ្រប់គ្រង (Admin Checklist Task)","ស្ថានភាព (Status)","អ្នកទទួលខុសត្រូវ (Staff)","កាលបរិច្ឆេទពិនិត្យ (Audit Date)"\n`;
        unicodeContent += `"1","${cat?.titleKh || 'កិច្ចការបង្គោល'}","បានត្រួតពិនិត្យ និងរួចរាល់ (Updated)","${fileRecord.uploadedBy}","2026-05-29"\n`;
        unicodeContent += `"2","ឯកសារយោង និងទិន្នន័យស្រង់ចេញ","ឯកសារយោងផ្លូវការ (Verified Archive)","រដ្ឋបាលសាលា (Admin)","2026-05-29"\n`;
      } else {
        unicodeContent = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
      }
      
      const blob = new Blob([unicodeContent], { type: isExcel ? 'text/csv;charset=utf-8;' : 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // If it has .xlsx extension, we download as .excel.csv to maintain perfect spreadsheet utility
      const extension = fileRecord.fileName.split('.').pop()?.toLowerCase();
      link.download = (isExcel && extension === 'xlsx') ? fileRecord.fileName.replace('.xlsx', '.csv') : fileRecord.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`កំពុងទាញយកឯកសារគំរូ "${fileRecord.fileName}" ដែលបានធ្វើបច្ចុប្បន្នភាព...`, 'success');
    }
  };

  // Get filtered files for the current category and month
  const activeFiles = files.filter(f => {
    const isCategory = f.categoryId === selectedCategory.id;
    const isMonth = f.month === activeMonthString;
    const matchesSearch = searchQuery 
      ? f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) 
      : true;
    return isCategory && isMonth && matchesSearch;
  });

  const getFilesCountForCategory = (catId: string, monthStr: string) => {
    return files.filter(f => f.categoryId === catId && f.month === monthStr).length;
  };

  const getStatusForCategory = (catId: string, monthStr: string) => {
    const key = `${catId}_${monthStr}`;
    return statusRegistry[key]?.isDone || false;
  };

  // Monthly Quick Jump Buttons
  const nextMonth = () => {
    if (selectedMonthIndex === 11) {
      setSelectedMonthIndex(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setSelectedMonthIndex(prev => prev + 1);
    }
  };

  const prevMonth = () => {
    if (selectedMonthIndex === 0) {
      setSelectedMonthIndex(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setSelectedMonthIndex(prev => prev - 1);
    }
  };

  return (
    <div id="admin-doc-manager-root" className="bg-slate-50 rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-slate-800 flex flex-col min-h-[680px]">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-60 animate-bounce transition-all">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm text-slate-900 bg-white font-medium ${
            toast.type === 'success' ? 'border-emerald-200 shadow-emerald-700/5' :
            toast.type === 'danger' ? 'border-rose-200 shadow-rose-700/5' :
            toast.type === 'warning' ? 'border-amber-200 shadow-amber-700/5' :
            'border-sky-200 shadow-sky-700/5'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
              toast.type === 'danger' ? 'bg-rose-50 text-rose-600' :
              toast.type === 'warning' ? 'bg-amber-50 text-amber-600' :
              'bg-sky-50 text-sky-655'
            }`}>
              {toast.type === 'success' && <Check className="w-4 h-4" />}
              {toast.type === 'danger' && <XCircle className="w-4 h-4" />}
              {toast.type === 'warning' && <AlertCircle className="w-4 h-4" />}
              {toast.type === 'info' && <Info className="w-4 h-4" />}
            </div>
            <div>
              <p className="font-extrabold text-xs">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="p-5 sm:p-6 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400">
              <FolderOpen className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight font-moul">
                ប្រព័ន្ធគ្រប់គ្រងឯកសារ និងរបាយការណ៍រដ្ឋបាល (Admin Documentation)
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                System Documentation & Archive Registry
              </p>
            </div>
          </div>
        </div>

        {/* View Switch / Matrix and Month */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('categoryView')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === 'categoryView'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            កិច្ចការទាំង ១៤ (14 Categories)
          </button>
          <button
            onClick={() => setActiveTab('yearlyMatrix')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeTab === 'yearlyMatrix'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            តារាងម៉ាទ្រីសប្រចាំឆ្នាំ (Yearly Grid Matrix)
          </button>
        </div>
      </div>

      {/* YEAR & MONTH REGULATOR PANEL */}
      <div className="bg-slate-900 text-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-950">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-extrabold">សាលារៀន វ៉េស្ទឡាញន៍:</span>
          <div className="flex items-center bg-slate-800 rounded-lg px-2 py-1 gap-1 border border-slate-700">
            <button
              onClick={() => setCurrentYear(prev => prev - 1)}
              className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition text-xs font-bold"
            >
              -
            </button>
            <span className="px-2 text-xs font-black font-mono text-emerald-400">{currentYear}</span>
            <button
              onClick={() => setCurrentYear(prev => prev + 1)}
              className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition text-xs font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Month Selector Row */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={prevMonth}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-lg transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 font-moul text-xs text-white max-w-[180px] justify-center">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 tracking-wide">ខែ {MONTHS_KM[selectedMonthIndex].label}</span>
            <span className="font-mono text-slate-400 font-bold ml-1">({MONTHS_KM[selectedMonthIndex].eng})</span>
          </div>

          <button
            onClick={nextMonth}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-lg transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Picker */}
        <div className="hidden lg:flex items-center gap-1">
          {MONTHS_KM.map((m, idx) => (
            <button
              key={m.code}
              onClick={() => setSelectedMonthIndex(idx)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedMonthIndex === idx
                  ? 'bg-emerald-600 text-white font-black scale-105'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* MATRIX VIEW */}
      {activeTab === 'yearlyMatrix' && (
        <div className="p-6 flex-1 overflow-x-auto">
          <div className="min-w-[1000px] space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-xs font-black text-slate-900 font-moul flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  ម៉ាទ្រីសស្ថានភាពទុកដាក់ឯកសារប្រចាំឆ្នាំ {currentYear}
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Monthly Checklist Matrix & Fulfillment Registry</p>
              </div>
              <div className="flex items-center gap-3.5 text-xs">
                <span className="flex items-center gap-1 text-slate-500 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> បានរួចរាល់ (Updated)
                </span>
                <span className="flex items-center gap-1 text-slate-500 font-bold">
                  <span className="w-2.5 h-2.5 rounded bg-slate-200 inline-block border border-slate-300" /> មិនទាន់ទិន្នន័យ (Pending)
                </span>
              </div>
            </div>

            <table className="w-full border-collapse text-xs border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-mono text-[10px] uppercase font-black">
                  <th className="p-3 text-left border border-slate-800 font-moul uppercase w-[300px]">កិច្ចការគ្រប់គ្រង (Admin Tasks)</th>
                  {MONTHS_KM.map(m => (
                    <th key={m.code} className="p-2 text-center border border-slate-800 w-[60px]">
                      {m.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {CATEGORIES.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 border border-slate-200">
                      <div className="flex items-start gap-2">
                        <div className="p-1 px-1.5 bg-slate-100 rounded-md text-slate-800 shrink-0 select-none">
                          <span className="font-mono text-[9px] font-black">#{cat.num}</span>
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 leading-tight text-[11px]">{cat.titleKh}</p>
                          <p className="text-[9px] text-slate-400 font-bold leading-none">{cat.titleEn}</p>
                        </div>
                      </div>
                    </td>
                    {MONTHS_KM.map((m, idx) => {
                      const mStr = `${currentYear}-${m.code}`;
                      const isDone = getStatusForCategory(cat.id, mStr);
                      const fileCount = getFilesCountForCategory(cat.id, mStr);
                      return (
                        <td
                          key={m.code}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setSelectedMonthIndex(idx);
                            setActiveTab('categoryView');
                          }}
                          className={`p-2 border border-slate-200 text-center cursor-pointer transition-all ${
                            isDone 
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800' 
                              : 'bg-white hover:bg-slate-100 text-slate-300'
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center gap-1">
                            {isDone ? (
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
                            )}
                            {fileCount > 0 && (
                              <span className="text-[9px] px-1 font-mono font-black rounded-full bg-slate-900 text-emerald-400 scale-90">
                                {fileCount}F
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CORE VIEW WITH SIDEBAR & MAIN DETAILS PANEL */}
      {activeTab === 'categoryView' && (
        <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* SIDEBAR: categories list */}
          <div className="w-full md:w-[350px] shrink-0 bg-white flex flex-col h-[580px] overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">តម្រងស្វែងរកយោង</span>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរកតាមប្រធានបទឯកសារ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-300 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {CATEGORIES.filter(cat => 
                cat.titleKh.toLowerCase().includes(searchQuery.toLowerCase()) || 
                cat.titleEn.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((cat) => {
                const filesCount = getFilesCountForCategory(cat.id, activeMonthString);
                const isCompleted = getStatusForCategory(cat.id, activeMonthString);
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                      selectedCategory.id === cat.id
                        ? 'bg-slate-900 text-white'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${
                      selectedCategory.id === cat.id
                        ? 'bg-slate-800 text-emerald-400'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {getIcon(cat.iconType, "w-4.5 h-4.5")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-xs font-extrabold truncate ${
                          selectedCategory.id === cat.id ? 'text-white' : 'text-slate-900'
                        }`}>
                          {cat.num}. {cat.titleKh}
                        </p>
                        {isCompleted && (
                          <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className={`text-[9px] truncate font-bold ${
                        selectedCategory.id === cat.id ? 'text-slate-400' : 'text-slate-400'
                      }`}>
                        {cat.titleEn}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-black ${
                          selectedCategory.id === cat.id ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {filesCount} ឯកសារ (Files)
                        </span>
                        
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {isCompleted ? 'បានអាប់ដេត' : 'មិនទាន់អាប់ដេត'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN PANEL CONTENT: ACTIVE CATEGORY DETAILS */}
          <div className="flex-1 bg-white p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Category Lead Info banner */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-8 text-slate-800 pointer-events-none opacity-20">
                  {getIcon(selectedCategory.iconType, "w-32 h-32 transform translate-x-12 -translate-y-8")}
                </div>

                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase font-mono">
                      កាតព្វកិច្ចកូដរដ្ឋបាល #{selectedCategory.num}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold font-mono">/ Month: {activeMonthString}</span>
                  </div>

                  <h2 className="text-sm sm:text-base font-black font-moul tracking-tight text-white leading-snug">
                    {selectedCategory.titleKh}
                  </h2>
                  <p className="text-[11px] text-slate-300 font-mono font-bold uppercase tracking-wide">
                    {selectedCategory.titleEn}
                  </p>
                  
                  <div className="h-px bg-slate-800 my-2" />

                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed max-w-xl">
                    {selectedCategory.descriptionKh} 
                    <span className="block text-[9px] text-slate-400 font-bold font-mono italic mt-0.5">{selectedCategory.descriptionEn}</span>
                  </p>
                </div>
              </div>

              {/* ACTION: COMPLETION CHECKBOX & NOTES FOR Month */}
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="space-y-2 flex-1 w-full">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-extrabold">ស្ថានភាពកិច្ចការប្រចាំខែ:</span>
                  
                  <button
                    onClick={handleToggleStatus}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${
                      currentMonthStatus.isDone
                        ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {currentMonthStatus.isDone ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-black">
                        {currentMonthStatus.isDone ? 'បានសម្រេច៖ រៀបចំនិងធ្វើបច្ចុប្បន្នភាពរួចរាល់' : 'សម្គាល់ថា៖ បានធ្វើបច្ចុប្បន្នភាពរួចរាល់សម្រាប់ខែនេះ (Mark as Updated)'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold font-mono">Fulfillment marker: Updated for this month</p>
                    </div>
                  </button>

                  <div className="pt-2">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      កំណត់សម្គាល់រដ្ឋបាល (Monthly Administration Notes):
                    </label>
                    <textarea
                      value={currentMonthStatus.notes}
                      onChange={handleNotesChange}
                      placeholder="បញ្ចូលកំណត់សម្គាល់ការងារ កាលបរិច្ឆេទ ហត្ថលេខា សម្ភារៈខ្វះខាត ឬចំណុចសំខាន់ៗដែលទទួលបានសម្រាប់ខែនេះ..."
                      className="w-full mt-1.5 p-3 border border-slate-300 rounded-xl text-xs bg-white text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 resize-none h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* FILE UPLOAD DROP-ZONE (Excel & PDF) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 font-moul">ការបញ្ចូលឯកសារ Excel & PDF (Attach Documents)</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide font-mono">Multiple File Upload and Month Alignment</p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">គាំទ្រ: .xlsx, .xls, .csv, .pdf</span>
                </div>

                <form
                  onSubmit={(e) => e.preventDefault()}
                  encType="multipart/form-data"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                    isDragOver
                      ? 'border-emerald-600 bg-emerald-500/5'
                      : 'border-slate-300 hover:border-slate-900 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.gif,.webp"
                    className="hidden"
                  />
                  <UploadCloud className={`w-10 h-10 mb-2 transition-transform ${isDragOver ? 'scale-110 text-emerald-600' : 'text-slate-400'}`} />
                  <p className="text-xs font-black text-slate-800">
                    អូស និងទម្លាក់ឯកសារ Excel, PDF ឬរូបថតជាច្រើននៅទីនេះ ឬ ចុចដើម្បីស្វែងរកឯកសារ
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold font-mono mt-1">
                    Drag & Drop multiple files here or click to browse (PDF, Excel & Images)
                  </p>
                </form>
              </div>

              {/* ATTACHED FILE LIST */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between border-b pb-1.5 border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full" />
                    <h4 className="text-xs font-black text-slate-900">
                      បញ្ជីឯកសារភ្ជាប់ខែនេះ ({activeFiles.length} ឯកសារ)
                    </h4>
                  </div>
                  <p className="text-[9px] text-slate-400 font-mono font-bold">Attached Docs List</p>
                </div>

                {activeFiles.length === 0 ? (
                  <div className="p-8 border border-slate-100 rounded-xl text-center bg-slate-50/30">
                    <AlertCircle className="w-8 h-8 text-slate-305 mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-slate-500 font-medium">មិនមានឯកសារភ្ជាប់ ឬរូបថតសម្រាប់ខែ {MONTHS_KM[selectedMonthIndex].label} នេះនៅឡើយទេ</p>
                    <p className="text-[9px] text-slate-400 font-bold font-mono">No attached spreadsheets, PDFs, or photos for this month yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:shadow-xs transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-2 rounded-lg shrink-0 ${
                            file.fileType === 'excel' ? 'bg-emerald-50 text-emerald-600' : file.fileType === 'image' ? 'bg-cyan-50 text-cyan-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {file.fileType === 'excel' ? (
                              <FileSpreadsheet className="w-4.5 h-4.5" />
                            ) : file.fileType === 'image' ? (
                              <Eye className="w-4.5 h-4.5" />
                            ) : (
                              <FileText className="w-4.5 h-4.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-slate-950 truncate max-w-[150px] sm:max-w-[200px]" title={file.fileName}>
                              {file.fileName}
                            </p>
                            <p className="text-[9px] text-slate-400 font-mono font-bold mt-0.5">
                              {(file.fileSize / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            onClick={() => downloadFile(file)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition cursor-pointer animate-pulse"
                            title="ទាញយក (Download file)"
                          >
                            <Download className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => setFileToView(file)}
                            className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 hover:text-emerald-800 transition cursor-pointer"
                            title="មើលឯកសារ (View Doc)"
                          >
                            <Eye className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => triggerDelete(file)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="លុបឯកសារ (Delete file)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Bottom info banner */}
            <div className="mt-8 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold leading-relaxed">
                <span className="font-mono text-slate-800">ស្វ័យ-រក្សាទុក៖</span> រាល់ឯកសារដែលបញ្ចូលជាមួយប្រភេទនីមួយៗ នឹងត្រូវបញ្ចូលទៅក្នុងប្រព័ន្ធផ្ទុកទិន្នន័យមូលដ្ឋាន (Local Database) របស់កម្មវិធីដោយស្វ័យប្រវត្ត។ លោកអ្នកអាចត្រលប់មកវិញនៅពេលណាក៏បាន។
              </p>
            </div>

          </div>
        </div>
      )}

      {/* 1. DELETE FILE CONFIRMATION MODAL */}
      {fileToDelete && (
        <div id="file-delete-modal" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[110] animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-500 font-moul text-xs font-black">
              <AlertTriangle className="w-5 h-5" />
              <span>លុបឯកសារភ្ជាប់ (Delete File Confirm)</span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              តើលោកអ្នកប្រាកដជាចង់លុបឯកសារ <span className="font-extrabold text-slate-900 font-mono">"{fileToDelete.fileName}"</span> នេះមែនទេ? ការលុបនេះមិនអាចសង្គ្រោះមកវិញបានឡើយ។
            </p>
            <div className="flex items-center justify-end gap-2 text-xs font-bold pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition cursor-pointer"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                onClick={confirmDeleteFile}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition cursor-pointer font-black"
              >
                លុបចោល (Confirm Delete)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DOCUMENT PREVIEW MODAL */}
      {fileToView && (
        <div id="file-preview-modal" className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-xl shrink-0 ${
                  fileToView.fileType === 'excel' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {fileToView.fileType === 'excel' ? (
                    <FileSpreadsheet className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-white truncate font-moul leading-snug" title={fileToView.fileName}>
                    {fileToView.fileName}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">
                    {(fileToView.fileSize / 1024).toFixed(1)} KB • {fileToView.uploadedBy}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setFileToView(null)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer ml-4 shrink-0"
                title="បិទ (Close)"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-slate-50">
              
              {/* PDF Viewer OR Image Viewer OR Spreadsheet SheetJS Viewer */}
              {fileToView.fileType === 'pdf' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-[10px] sm:text-xs font-black text-emerald-800 leading-normal">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
                      <span className="truncate">កម្រងឯកសារ PDF គោលដៅ (Viewing Active PDF Document Scan)</span>
                    </span>
                    <button
                      onClick={() => downloadFile(fileToView)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition text-[9px] font-black cursor-pointer shadow-xs shrink-0"
                    >
                      ទាញយកច្បាប់ដើម (Download PDF)
                    </button>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs p-1">
                    {previewUrl ? (
                      <iframe 
                        src={previewUrl} 
                        className="w-full h-[500px] rounded-xl bg-slate-100 border-0" 
                        title={fileToView.fileName}
                      />
                    ) : (
                      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                        <AlertCircle className="w-10 h-10 text-slate-300 animate-bounce" />
                        <p className="text-xs font-bold text-slate-700">មិនអាចផ្ទុកកម្រងឯកសារ PDF នេះបានទេ</p>
                        <button
                          onClick={() => downloadFile(fileToView)}
                          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                        >
                          ទាញយកដើម្បីបើកមើល (Download to View)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : fileToView.fileType === 'image' ? (
                /* Interactive Photo / Image Viewer Previewer */
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-cyan-50 border border-cyan-100 rounded-2xl text-[10px] sm:text-xs font-black text-cyan-800 leading-normal">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse shrink-0"></span>
                      <span className="truncate">ការបង្ហាញរូបថតភ្ជាប់ (Viewing Uploaded Image / Photo Preview)</span>
                    </span>
                    <button
                      onClick={() => downloadFile(fileToView)}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition text-[9px] font-black cursor-pointer shadow-xs shrink-0"
                    >
                      ទាញយករូបថតដើម (Download Image)
                    </button>
                  </div>
                  
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-center min-h-[300px] max-h-[500px] overflow-hidden shadow-inner">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt={fileToView.fileName}
                        className="max-w-full max-h-[460px] object-contain rounded-lg transition-transform hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
                        <AlertCircle className="w-10 h-10 text-slate-600 animate-bounce" />
                        <p className="text-xs font-bold">មិនអាចផ្ទុករូបភាពនេះបានទេ</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Excel / Spreadsheet SheetJS Viewer */
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="p-3.5 bg-slate-900 text-emerald-400 text-[10px] sm:text-xs font-black font-moul flex items-center justify-between shrink-0">
                    <span>{fileToView.fileData ? 'ទិន្នន័យក្នុងតារាង Excel ដើម (Spreadsheet)' : 'ទិន្នន័យក្នុងឯកសារ (Structured Data Grid)'}</span>
                    <span className="font-mono text-[8px] text-slate-400 uppercase tracking-widest">{fileToView.fileData ? 'XLSX/CSV Live Render' : 'Interactive Table Preview'}</span>
                  </div>
                  
                  <div className="overflow-x-auto max-h-[380px]">
                    {(() => {
                      // 1. If parsed excel rows are loaded from XLSX
                      if (parsedExcelRows && parsedExcelRows.length > 0) {
                        return (
                          <table className="w-full text-left text-[11px] border-collapse bg-white font-mono">
                            <thead>
                              <tr className="bg-slate-100 text-slate-800 border-b border-slate-200 font-extrabold text-[10px]">
                                <th className="p-2 border-r border-slate-200 w-10 text-center text-slate-400">#</th>
                                {parsedExcelRows[0].map((colVal, colIdx) => {
                                  const letter = String.fromCharCode(65 + (colIdx % 26));
                                  return (
                                    <th key={colIdx} className="p-2.5 border-r border-slate-200 text-slate-700 text-center font-bold bg-slate-50/50 min-w-[120px]">
                                      <div className="text-[8px] text-slate-400 font-normal leading-none mb-1">{letter}</div>
                                      <div className="truncate font-sans font-black">{colVal === undefined || colVal === null ? '' : String(colVal)}</div>
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150 text-slate-655">
                              {parsedExcelRows.slice(1).map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-50/75 transition-colors">
                                  <td className="p-2 border-r border-slate-200 bg-slate-50/30 text-center text-[9px] font-bold text-slate-400">{rIdx + 1}</td>
                                  {parsedExcelRows[0].map((_, cIdx) => {
                                    const cellValue = row[cIdx];
                                    return (
                                      <td key={cIdx} className="p-2.5 border-r border-slate-150 last:border-r-0 max-w-[200px] truncate leading-normal" title={cellValue === undefined ? '' : String(cellValue)}>
                                        <span className="font-sans font-semibold text-slate-800">{cellValue === undefined || cellValue === null ? '' : String(cellValue)}</span>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        );
                      }

                      // Helper to get simulated mock rows
                      const getSimulatedDocRows = (categoryId) => {
                        switch (categoryId) {
                          case 'ac_maintenance':
                            return [
                              { d1: 'ម៉ាស៊ីនត្រជាក់ Panasonic 1.5HP (បន្ទប់ ១០១)', d2: 'លាងសម្អាតត្រង ដុសកាវ', d3: 'ល្អ (Normal)', d4: 'វ៉ាន់ ធារ៉ា', d5: '២០-ឧសភា' },
                              { d1: 'ម៉ាស៊ីនត្រជាក់ LG 2.0HP (បន្ទប់ ១០២)', d2: 'លាងសម្អាត និងវាស់កម្រិតហ្គាស', d3: 'ល្អ (Normal)', d4: 'វ៉ាន់ ធារ៉ា', d5: '២០-ឧសភា' },
                              { d1: 'ម៉ាស៊ីនត្រជាក់ Toshiba 1.0HP (គិលានដ្ឋាន)', d2: 'ជួសជុលកង្ហារ និងប្តូរកុងដង់', d3: 'ល្អ (Normal)', d4: 'សេង គឹមសួរ', d5: '២១-ឧសភា' },
                              { d1: 'ម៉ាស៊ីនត្រជាក់ Midea 2.5HP (ការិយាល័យធំ)', d2: 'សម្អាតទូទៅ និងបាញ់ថ្នាំសម្លាប់មេរោគ', d3: 'ល្អ (Normal)', d4: 'វ៉ាន់ ធារ៉ា', d5: '២២-ឧសភា' },
                            ];
                          case 'photocopier_maintenance':
                            return [
                              { d1: 'ម៉ាស៊ីនថតចម្លង Canon iR2525 (ជាន់ទី១)', d2: 'ផ្លាស់ប្តូរត្រលប់ទឹកថ្នាំ (Toner) និងជូតកញ្ចក់', d3: 'រួចរាល់', d4: 'សេង គឹមសួរ', d5: '២២-ឧសភា' },
                              { d1: 'ម៉ាស៊ីនថតចម្លង Ricoh MP 3055 (បន្ទប់រដ្ឋបាល)', d2: 'ដោះស្រាយបញ្ហាស្ទះក្រដាស និងផ្លាស់ប្តូរកៅស៊ូ', d3: 'រួចរាល់', d4: 'សេង គឹមសួរ', d5: '២៣-ឧសភា' },
                            ];
                          case 'additional_maintenance':
                            return [
                              { d1: 'បង្កាន់ដៃជណ្ដើរឡើងអគារ A Block', d2: 'ផ្សារភ្ជាប់ដែកដែលរបូតឡើងវិញ', d3: 'រួចរាល់', d4: 'សុខ ជា', d5: '១៨-ឧសភា' },
                              { d1: 'បង្គន់អនាម័យស្រី (ជាន់ក្រោម)', d2: 'ផ្លាស់ប្តូរក្បាលរ៉ូប៊ីណេ និងស៊ីហ្វុងបង្ហូរទឹក', d3: 'រួចរាល់', d4: 'គង់ ណារ៉េត', d5: '១៩-ឧសភា' },
                            ];
                          case 'pest_killing':
                            return [
                              { d1: 'បន្ទប់រៀន និងការិយាល័យអគារ A Block', d2: 'បាញ់ថ្នាំមូសសង្កូវទឹក និងលាបថ្នាំសម្លាប់កណ្តៀរ', d3: 'រួចរាល់', d4: 'PestControl Co.', d5: '១០-ឧសភា' },
                              { d1: 'បន្ទប់អាហារដ្ឋាន និងផ្ទះបាយ', d2: 'ដាក់អន្ទាក់ និងថ្នាំកណ្តុរនៅជ្រុងសុវត្ថិភាព', d3: 'រួចរាល់', d4: 'PestControl Co.', d5: '១០-ឧសភា' },
                            ];
                          case 'office_supply':
                            return [
                              { d1: 'ក្រដាស Double A A4 (70g)', d2: 'សេសសល់ ៥ កេស (ក្នុងស្តុក)', d3: 'គ្រប់គ្រាន់', d4: 'អ៊ឹង ស្រីលីន', d5: '២៨-ឧសភា' },
                              { d1: 'ប៊ិចសរសេរ (ខៀវ-ក្រហម)', d2: 'សេសសល់ ៣ ប្រអប់', d3: 'គ្រប់គ្រាន់', d4: 'អ៊ឹង ស្រីលីន', d5: '២៨-ឧសភា' },
                              { d1: 'ដីសសរសេរក្តារ និងហ្វឺតសរសេរ', d2: 'សេសសល់ ១០ ប្រអប់', d3: 'គ្រប់គ្រាន់', d4: 'អ៊ឹង ស្រីលីន', d5: '២៨-ឧសភា' },
                            ];
                          case 'cleaning_materials':
                            return [
                              { d1: 'សាប៊ូដុសកម្រាល Sunlight', d2: 'សេសសល់ ៦ ដបធំ', d3: 'គ្រប់គ្រាន់', d4: 'រត្ន័ ចាន់ដារ៉ា', d5: '២៥-ឧសភា' },
                              { d1: 'ក្រដាសអនាម័យ (Rolls)', d2: 'សេសសល់ ២ កេសធំ', d3: 'គ្រប់គ្រាន់', d4: 'រត្ន័ ចាន់ដារ៉ា', d5: '២៥-ឧសភា' },
                              { d1: 'អំបោស និងប្រដាប់កើបសម្រាម', d2: 'សេសសល់ ៥ ឈុត', d3: 'គ្រប់គ្រាន់', d4: 'រត្ន័ ចាន់ដារ៉ា', d5: '២៥-ឧសភា' },
                            ];
                          case 'utility_bills':
                            return [
                              { d1: 'អគ្គិសនី EDC (លេខកុងទ័រ ២០២៦-A)', d2: 'ការប្រើប្រាស់ ៤,៥០០ kWh - ទឹកប្រាក់ $៩២០.០០', d3: 'បានទូទាត់រួច', d4: 'រស់ ចាន់នី', d5: '២៨-ឧសភា' },
                              { d1: 'ទឹកស្អាតរដ្ឋ (លេខកុងទ័រ ៩០២១-W)', d2: 'ការប្រើប្រាស់ ១៨០ ម៉ែត្រគូប - ទឹកប្រាក់ $៨៥.០០', d3: 'បានទូទាត់រួច', d4: 'រស់ ចាន់នី', d5: '២៨-ឧសភា' },
                            ];
                          case 'fixed_asset_check':
                            return [
                              { d1: 'តុសិស្សឈើគ្រោងដែក', d2: 'ពិនិត្យសរុប ៤២០ គ្រឿង - ស្ថានភាពល្អ', d3: 'ត្រឹមត្រូវ', d4: 'ប៉ែន សារ៉ាត់', d5: '២威-ឧសភា' },
                              { d1: 'កៅអីវិលការិយាល័យ', d2: 'ពិនិត្យសរុប ៤៥ គ្រឿង - ខូចខាតស្រាល ២ គ្រឿង ជួសជុលរួច', d3: 'ត្រឹមត្រូវ', d4: 'ប៉ែន សារ៉ាត់', d5: '២៧-ឧសភា' },
                            ];
                          case 'safety_cameras':
                            return [
                              { d1: 'ម៉ាស៊ីនថត NVR និង HDD Storage', d2: 'ស្តុកទុកទិន្នន័យបាន ៣០ ថ្ងៃ (Recording normal)', d3: 'ដំណើរការល្អ', d4: 'អ៊ុន សុភ័ក្រ', d5: '២៦-ឧសភា' },
                              { d1: 'កាមេរ៉ាសុវត្ថិភាពច្រកទ្វារធំ និងជណ្តើរ', d2: 'សម្អាតកែវឡេន និងលៃតម្រង់មុំមើលឃើញច្បាស់', d3: 'ដំណើរការល្អ', d4: 'អ៊ុន សុភ័ក្រ', d5: '២៦-ឧសភា' },
                            ];
                          case 'staff_food':
                            return [
                              { d1: 'ម្ហូបថ្ងៃចន្ទ - សម្លម្ជូរគ្រឿង និងត្រីអាំង', d2: 'បុគ្គលិក ៣២ នាក់បានទទួលទាន និងចុះហត្ថលេខា', d3: 'ពេញលេញ', d4: 'ម៉ៅ សុខា', d5: '១៨-ឧសភា' },
                              { d1: 'ម្ហូបថ្ងៃអង្គារ - ឆាខ្ញីមាន់ និងសម្លស្ពៃក្តោប', d2: 'បុគ្គលិក ៣៤ នាក់បានទទួលទាន និងចុះហត្ថលេខា', d3: 'ពេញលេញ', d4: 'ម៉ៅ សុខា', d5: '១៩-ឧសភា' },
                            ];
                          case 'event_materials':
                            return [
                              { d1: 'ផ្ទាំង Backdrop កម្មវិធីកីឡាសាលា (Sports Day)', d2: 'ទំហំ ៣ម៉ែត្រ x ៥ម៉ែត្រ ដែកគ្រោងមាំ', d3: 'រក្សាទុកល្អ', d4: 'ហង្ស មករា', d5: '១៥-ឧសភា' },
                              { d1: 'ពានរង្វាន់ជើងឯក និងមេដាយ', d2: 'ពាន ១៥ គ្រឿង និងមេដាយមាស-ប្រាក់-សំរិទ្ធ ៥០', d3: 'ប្រគល់រួចរាល់', d4: 'ហង្ស មករា', d5: '១៦-ឧសភា' },
                            ];
                          case 'admin_documents':
                            return [
                              { d1: 'លិខិតផ្លូវការពីក្រសួងអប់រំ និងមន្ទីរអប់រំ', d2: 'ចែកប្រភេទ លិខិតចូល និងលិខិតចេញ ចុះលេខរៀងត្រឹមត្រូវ', d3: 'សណ្តាប់ធ្នាប់ល្អ', d4: 'គឹម ស្រីមុំ', d5: '២៤-ឧសភា' },
                              { d1: 'កិច្ចសន្យាការងារគ្រូបង្រៀនក្រៅម៉ោង (Q2)', d2: 'បានចុះហត្ថលេខា ស្នើស្កេនទុកដាក់ក្នុងកុំព្យូទ័រ', d3: 'សណ្តាប់ធ្នាប់ល្អ', d4: 'គឹម ស្រីមុំ', d5: '២៥-ឧសភា' },
                            ];
                          case 'medicine_nurse':
                            return [
                              { d1: 'ថ្នាំប៉ារ៉ាសេតាមុល Paracetamol 500mg', d2: 'សេសសល់ ១៨០ គ្រាប់ក្នុងគិលានដ្ឋាន (Exp: 12/2027)', d3: 'ត្រឹមត្រូវ', d4: 'គង់ ចរិយា', d5: '២៨-ឧសភា' },
                              { d1: 'បង់រុំរបួស ហ្គាស អាល់កុល និង Betadine', d2: 'សម្ភារៈសង្គ្រោះបឋមស្ថិតក្នុងកាលកំណត់ប្រើប្រាស់', d3: 'ត្រឹមត្រូវ', d4: 'គង់ ចរិយា', d5: '២៨-ឧសភា' },
                            ];
                          case 'purchase_requests':
                            return [
                              { d1: 'PR-2026-0045 (ស្នើសុំទិញម៉ាស៊ីនបាញ់សម្លាប់មេរោគ)', d2: 'ចំនួន $១២៥.០០ - ឯកសារដើមត្រូវចុះហត្ថលេខាអនុម័ត', d3: 'អនុម័តរួច', d4: 'ឡៅ ជាលី', d5: '១៥-ឧសភា' },
                              { d1: 'PR-2026-0046 (ទិញសម្ភារៈកីឡាសាលា)', d2: 'ចំនួន $៣៥០.០០ - ភ្ជាប់ رسید ទូទាត់ច្បាប់ដើម', d3: 'អនុម័តរួច', d4: 'ឡៅ ជាលី', d5: '១៦-ឧសភា' },
                            ];
                          default:
                            return [
                              { d1: 'ឯកសាររដ្ឋបាលត្រួតពិនិត្យទូទៅ', d2: 'ដំណើរការត្រឹមត្រូវតាមលំដាប់លំដោយ', d3: 'ល្អ', d4: 'រដ្ឋបាលសាលា', d5: '២៩-ឧសភា' }
                            ];
                        }
                      };

                      // 2. If it's a simulated table fallback or simple file metadata with CSV parse option
                      const getParsedCSVRows = (base64Data) => {
                        try {
                          const parts = base64Data.split(';base64,');
                          const raw = parts.length > 1 ? parts[1] : parts[0];
                          const decoded = decodeURIComponent(escape(atob(raw)));
                          const lines = decoded.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                          if (lines.length === 0) return null;
                          return lines.map(line => {
                            const cols = [];
                            let current = '';
                            let inQuotes = false;
                            for (let i = 0; i < line.length; i++) {
                              const char = line[i];
                              if (char === '"') {
                                inQuotes = !inQuotes;
                              } else if (char === ',' && !inQuotes) {
                                cols.push(current.trim());
                                current = '';
                              } else {
                                current += char;
                              }
                            }
                            cols.push(current.trim());
                            return cols;
                          });
                        } catch (e) {
                          try {
                            const parts = base64Data.split(';base64,');
                            const raw = parts.length > 1 ? parts[1] : parts[0];
                            const decoded = atob(raw);
                            return decoded.split('\n').map(l => l.split(','));
                          } catch (e2) {
                            console.error('Error parsing CSV base64 data:', e2);
                            return null;
                          }
                        }
                      };

                      const parsedCsv = fileToView.fileData ? getParsedCSVRows(fileToView.fileData) : null;
                      if (parsedCsv && parsedCsv.length > 0) {
                        return (
                          <table className="w-full text-left text-[11px] border-collapse bg-white">
                            <thead>
                              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 font-mono text-[10px]">
                                {parsedCsv[0].map((col, idx) => (
                                  <th key={idx} className="p-3 border-r border-slate-200 last:border-r-0 whitespace-nowrap">{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                              {parsedCsv.slice(1).map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-50 transition">
                                  {row.map((col, cIdx) => (
                                    <td key={cIdx} className="p-3 border-r border-slate-200 last:border-r-0 max-w-[140px] truncate">{col}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        );
                      }

                      // 3. Fallback to realistic educational/administrative template for default mock values
                      const rows = getSimulatedDocRows(fileToView.categoryId);
                      return (
                        <table className="w-full text-left text-[11px] border-collapse bg-white bg-slate-50">
                          <thead>
                            <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-200 leading-tight">
                              <th className="p-3 border-r border-slate-200 w-[8%] text-center">ល.រ</th>
                              <th className="p-3 border-r border-slate-200 w-[50%]">ព័ត៌មានលម្អិត/ទីតាំង (Item Details)</th>
                              <th className="p-3 border-r border-slate-200 w-[20%]">សកម្មភាព/ទិន្នន័យ (Activity)</th>
                              <th className="p-3 border-r border-slate-200 w-[12%] text-center">ស្ថានភាព</th>
                              <th className="p-3 w-[10%]">អ្នកពិនិត្យ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium pb-2 bg-white">
                            {rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50/50 transition">
                                <td className="p-3 border-r border-slate-200 font-mono font-bold text-center">{rIdx + 1}</td>
                                <td className="p-3 border-r border-slate-200 font-black text-slate-900 leading-snug">{row.d1}</td>
                                <td className="p-3 border-r border-slate-200 text-slate-500 font-bold">{row.d2}</td>
                                <td className="p-3 border-r border-slate-200 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                    row.d3 === 'ល្អ' || row.d3.includes('ល្អ') || row.d3.includes('រួចរាល់') || row.d3.includes('អនុម័ត') || row.d3.includes('ពេញលេញ')
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                                  }`}>
                                    {row.d3}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-600 font-bold text-[10px] truncate">{row.d4}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Institutional Signatures & Stamp mockup */}
              <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-xs text-xs font-bold font-moul shrink-0">
                <div className="text-center space-y-6 w-[120px] sm:w-[150px]">
                  <p className="text-[9px] text-slate-400">អ្នករៀបចំ</p>
                  <p className="text-[10px] text-slate-800 underline underline-offset-4 truncate">{fileToView.uploadedBy}</p>
                </div>

                {/* Simulated digital stamp in professional dark green */}
                <div className="hidden sm:flex relative items-center justify-center w-20 h-20 border-4 border-emerald-900/40 rounded-full scale-75 select-none shrink-0 text-center leading-none text-emerald-900 flex-col font-sans">
                  <span className="text-[6px] tracking-tighter">THE WESTLINE</span>
                  <span className="text-[8px] font-black tracking-widest my-0.5">APPROVED</span>
                  <span className="text-[6px] font-medium">{fileToView.month}</span>
                </div>

                <div className="text-center space-y-6 w-[120px] sm:w-[150px]">
                  <p className="text-[9px] text-slate-400">រដ្ឋបាលផ្ទៀងផ្ទាត់</p>
                  <p className="text-[10px] text-emerald-700 font-bold">រដ្ឋបាលសាលា</p>
                </div>
              </div>

            </div>

            {/* Modal Footer actions */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2 text-xs font-bold font-moul shrink-0">
              <button
                onClick={() => setFileToView(null)}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-700 transition cursor-pointer"
              >
                បិទផ្ទាំង (Close Preview)
              </button>
              <button
                onClick={() => {
                  downloadFile(fileToView);
                  setFileToView(null);
                }}
                className="bg-slate-900 hover:bg-slate-850 text-white font-extrabold px-6 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow"
              >
                <Download className="w-4 h-4 text-emerald-400 animate-bounce" />
                ទាញយកឯកសារនេះ (Download)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
