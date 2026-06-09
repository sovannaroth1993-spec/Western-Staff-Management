/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Staff, Department, DEPARTMENT_NAMES_KM, ALL_DEPARTMENTS } from '../types';
import { parseStaffExcel, exportStaffToExcel } from '../utils/excelHelper';
import { exportStaffToPdf } from '../utils/pdfHelper';
import { 
  Plus, Edit2, Trash2, FileSpreadsheet, FileText, Upload, 
  Search, Filter, BookOpen, AlertCircle, Camera, UserPlus, X, Info,
  Paperclip, Download, Eye, File, Link2, Globe, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StaffManagerProps {
  staffList: Staff[];
  setStaffList: (list: Staff[]) => void;
}

interface BulkRow {
  id: string;
  name: string;
  gender: 'ប្រុស' | 'ស្រី';
  dob: string;
  joinDate?: string;
  phoneNumber: string;
  department: Department;
}

/**
 * Helper to calculate years of work dynamically from join date compared to current date
 */
export const calculateYearsOfWork = (joinDateStr?: string): string => {
  if (!joinDateStr) return 'N/A';
  const joinDate = new Date(joinDateStr);
  if (isNaN(joinDate.getTime())) return 'N/A';
  
  const today = new Date();
  let years = today.getFullYear() - joinDate.getFullYear();
  const monthDiff = today.getMonth() - joinDate.getMonth();
  const dayDiff = today.getDate() - joinDate.getDate();
  
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years--;
  }
  
  if (years < 0) return '0 ឆ្នាំ';
  if (years === 0) {
    let months = (today.getFullYear() - joinDate.getFullYear()) * 12 + today.getMonth() - joinDate.getMonth();
    if (dayDiff < 0) {
      months--;
    }
    if (months <= 0) {
      return 'ថ្មីៗ (New)';
    }
    return `${months} ខែ`;
  }
  
  return `${years} ឆ្នាំ`;
};

export default function StaffManager({ staffList, setStaffList }: StaffManagerProps) {
  // Filters & State
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department | 'All'>('All');
  const [selectedGender, setSelectedGender] = useState<'All' | 'ប្រុស' | 'ស្រី'>('All');
  
  // Handlers for Add / Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; staffId: string } | null>(null);

  // Improvements for Multi/Bulk Entry
  const [entryMode, setEntryMode] = useState<'single' | 'bulk'>('single');
  const [keepAndAddMore, setKeepAndAddMore] = useState(false);
  const [lastInsertedStaff, setLastInsertedStaff] = useState<{ name: string; staffId: string } | null>(null);
  const [bulkPasteText, setBulkPasteText] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Auto-focus physical name input when single form opens or when tab changes
  useEffect(() => {
    if (isFormOpen && entryMode === 'single') {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 150);
    }
  }, [isFormOpen, entryMode]);

  // Form Fields
  const [formStaffId, setFormStaffId] = useState('');
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'ប្រុស' | 'ស្រី'>('ប្រុស');
  const [formDob, setFormDob] = useState('');
  const [formJoinDate, setFormJoinDate] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [formDept, setFormDept] = useState<Department>('Security');
  const [formIcom, setFormIcom] = useState('');
  const [formResponsibleLocation, setFormResponsibleLocation] = useState('');

  // Excel input target department selection
  const [importDept, setImportDept] = useState<Department>('Cleaner');
  const [importError, setImportError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotice = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === msg ? null : prev));
    }, 4500);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Attachments State
  const [selectedStaffForAttachments, setSelectedStaffForAttachments] = useState<Staff | null>(null);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const attachmentFileInputRef = useRef<HTMLInputElement>(null);
  const [previewingAttachment, setPreviewingAttachment] = useState<{ id: string; name: string; type: string; dataUrl: string } | null>(null);
  const [deleteAttachmentTarget, setDeleteAttachmentTarget] = useState<{ id: string; name: string } | null>(null);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [activeAttachmentTab, setActiveAttachmentTab] = useState<'upload' | 'link'>('upload');

  // Helper to construct an empty bulk row
  const createEmptyBulkRow = (dept: Department): BulkRow => ({
    id: `row_${Math.random().toString(36).substring(2, 9)}`,
    name: '',
    gender: 'ប្រុស',
    dob: '1995-01-01',
    joinDate: '2026-01-01',
    phoneNumber: '',
    department: dept,
  });

  const [bulkRows, setBulkRows] = useState<BulkRow[]>(() => [
    createEmptyBulkRow('Security'),
    createEmptyBulkRow('Security'),
    createEmptyBulkRow('Security'),
    createEmptyBulkRow('Security'),
    createEmptyBulkRow('Security'),
  ]);

  // Helper to auto-generate a unique Staff ID (supporting prepackaged additions in the same batch)
  const generateUniqueStaffId = (dept: Department, additionalExistingIds: string[] = []): string => {
    const prefixMap: Record<Department, string> = {
      Security: 'WIS-SEC',
      Cleaner: 'WIS-CLN',
      Librarian: 'WIS-LIB',
      Nurse: 'WIS-NUR',
      'Customer Service': 'WIS-CS',
      'Lab Assistant': 'WIS-LAB',
      'Admin Head': 'WIS-ADM'
    };
    const prefix = prefixMap[dept] || 'WIS';
    
    // Find all existing numbers for this prefix
    const combinedIds = [
      ...staffList.map(s => s.staffId),
      ...additionalExistingIds
    ];

    const existingNums = combinedIds
      .filter(id => id.startsWith(prefix + '-'))
      .map(id => {
        const parts = id.split('-');
        const lastPart = parts[parts.length - 1];
        const num = parseInt(lastPart, 10);
        return isNaN(num) ? 0 : num;
      });

    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
    const nextNum = maxNum + 1;
    const paddedNum = nextNum.toString().padStart(3, '0');
    return `${prefix}-${paddedNum}`;
  };

  // Reset form helper
  const resetForm = () => {
    setEditingStaffId(null);
    setFormStaffId('');
    setFormName('');
    setFormGender('ប្រុស');
    setFormDob('');
    setFormJoinDate('');
    setFormPhone('');
    setFormPhoto('');
    setFormDept('Security');
    setFormIcom('');
    setFormResponsibleLocation('');
    setLastInsertedStaff(null);
  };

  // Open modal for adding
  const openAddForm = () => {
    resetForm();
    const suggestedId = generateUniqueStaffId('Security');
    setFormStaffId(suggestedId);
    setFormDept('Security');
    setFormIcom('');
    setFormResponsibleLocation('');
    setFormJoinDate('');
    setEntryMode('single'); // default tab
    setKeepAndAddMore(false);
    setIsFormOpen(true);
  };

  // Open modal for editing
  const openEditForm = (staff: Staff) => {
    resetForm();
    setEditingStaffId(staff.id);
    setFormStaffId(staff.staffId);
    setFormName(staff.name);
    setFormGender(staff.gender as 'ប្រុស' | 'ស្រី');
    setFormDob(staff.dob);
    setFormJoinDate(staff.joinDate || '');
    setFormPhone(staff.phoneNumber);
    setFormPhoto(staff.photo);
    setFormDept(staff.department);
    setFormIcom(staff.icom || '');
    setFormResponsibleLocation(staff.responsibleLocation || '');
    setEntryMode('single');
    setIsFormOpen(true);
  };

  // File Upload base64 mapper with Canvas resizing and compression to prevent localStorage QuotaExceededError
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic size validation
      if (!file.type.startsWith('image/')) {
        showNotice('សូមជ្រើសរើសតែឯកសាររូបភាពប៉ុណ្ណោះ (Please select only image files)!', 'error');
        return;
      }

      setIsCompressing(true);

      const reader = new FileReader();
      reader.onerror = () => {
        showNotice('មានបញ្ហាក្នុងការអានឯកសាររូបភាពនេះ! (Error reading file)', 'error');
        setIsCompressing(false);
      };

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            // Standard optimal 4x6 proportion size (e.g., width 240px, height 360px is perfect for profile photo container)
            const targetWidth = 240;
            const targetHeight = 360;
            
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              // Fallback to original raw scale if context is unavailable
              setFormPhoto(event.target?.result as string);
              setIsCompressing(false);
              return;
            }

            // High quality image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Crop the input image to exactly 4:6 centered ratio
            const imgRatio = img.width / img.height;
            const targetRatio = targetWidth / targetHeight;

            let sx = 0;
            let sy = 0;
            let sWidth = img.width;
            let sHeight = img.height;

            if (imgRatio > targetRatio) {
              // Image is wider than 4:6. Crop right and left doors.
              sWidth = img.height * targetRatio;
              sx = (img.width - sWidth) / 2;
            } else if (imgRatio < targetRatio) {
              // Image is taller than 4:6. Crop upper and lower parts.
              sHeight = img.width / targetRatio;
              sy = (img.height - sHeight) / 2;
            }

            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
            
            // Get JPEG base64 string compressed (0.8 quality handles high quality with highly optimized file sizing like 12-18KB)
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
            setFormPhoto(compressedBase64);
          } catch (err) {
            console.error('Image compression failed:', err);
            // Fallback
            setFormPhoto(event.target?.result as string);
          } finally {
            setIsCompressing(false);
          }
        };

        img.onerror = () => {
          showNotice('មិនអាចដំណើរការរូបភាពនេះបានឡើយ! (Invalid image data)', 'error');
          setIsCompressing(false);
        };
      };

      reader.readAsDataURL(file);
    }
  };

  // Form submission (Save / Edit)
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showNotice('សូមបំពេញឈ្មោះពេញរបស់បុគ្គលិក!', 'error');
      return;
    }

    let finalStaffId = formStaffId.trim();
    if (!finalStaffId) {
      finalStaffId = generateUniqueStaffId(formDept);
    }

    if (editingStaffId) {
      // Modify
      const updatedList = staffList.map(s => {
        if (s.id === editingStaffId) {
          return {
            ...s,
            staffId: finalStaffId,
            name: formName.trim(),
            gender: formGender,
            dob: formDob || s.dob,
            joinDate: formJoinDate || s.joinDate,
            phoneNumber: formPhone.trim() || s.phoneNumber,
            photo: formPhoto || s.photo,
            department: formDept,
            icom: formIcom.trim(),
            responsibleLocation: formResponsibleLocation.trim()
          };
        }
        return s;
      });
      setStaffList(updatedList);
      setIsFormOpen(false);
      resetForm();
      showNotice(`ជោគជ័យ! បានកែសម្រួលព័ត៌មានបុគ្គលិកឈ្មោះ ៖ ${formName.trim()} រួចរាល់ដោយជោគជ័យ។`);
    } else {
      // Create new
      // If the target staffId already exists, automatically auto-increment to prevent duplicate errors
      let exists = staffList.some(s => s.staffId === finalStaffId);
      if (exists) {
        let counter = 1;
        const baseId = finalStaffId;
        while (exists) {
          finalStaffId = `${baseId}-${counter}`;
          exists = staffList.some(s => s.staffId === finalStaffId);
          counter++;
        }
      }

      const newStaff: Staff = {
        id: finalStaffId,
        no: staffList.length + 1,
        staffId: finalStaffId,
        name: formName.trim(),
        gender: formGender,
        dob: formDob || '1990-01-01',
        joinDate: formJoinDate || '',
        phoneNumber: formPhone.trim() || 'N/A',
        photo: formPhoto,
        department: formDept,
        icom: formIcom.trim(),
        responsibleLocation: formResponsibleLocation.trim()
      };

      setStaffList([...staffList, newStaff]);

      if (keepAndAddMore) {
        // Continuous input mode: notify success and reset specific inputs
        setLastInsertedStaff({ name: formName.trim(), staffId: finalStaffId });
        setFormName('');
        setFormPhone('');
        setFormPhoto('');
        setFormDob('');
        setFormJoinDate('');
        setFormIcom('');
        setFormResponsibleLocation('');

        // Generate the next unique ID sequential number for this department
        const nextId = generateUniqueStaffId(formDept, [finalStaffId]);
        setFormStaffId(nextId);

        // Auto-focus back on Name input for seamless fast typing
        setTimeout(() => {
          nameInputRef.current?.focus();
        }, 100);
      } else {
        setIsFormOpen(false);
        resetForm();
        showNotice(`ជោគជ័យ! បានបញ្ចូលបុគ្គលិកថ្មីឈ្មោះ ៖ ${newStaff.name} (លេខសម្គាល់ ៖ ${newStaff.staffId}) ទៅក្នុងប្រព័ន្ធដោយរលូន និងជោគជ័យ។`);
      }
    }
  };

  // Bulk batch submission (Save multiple rows at once)
  const handleSaveBulkStaff = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate rows containing at least a name
    const filledRows = bulkRows.filter(row => row.name.trim() !== '');
    if (filledRows.length === 0) {
      showNotice('សូមបំពេញឈ្មោះបុគ្គលិកយ៉ាងតិច ១ នាក់នៅក្នុងតារាង!', 'error');
      return;
    }

    const updatedList = [...staffList];
    const temporaryGeneratedIds: string[] = [];

    filledRows.forEach((row) => {
      // Auto sequence ID generator
      const finalId = generateUniqueStaffId(row.department, temporaryGeneratedIds);
      temporaryGeneratedIds.push(finalId);

      const newStaff: Staff = {
        id: finalId,
        no: updatedList.length + 1,
        staffId: finalId,
        name: row.name.trim(),
        gender: row.gender,
        dob: row.dob || '1995-01-01',
        joinDate: row.joinDate || '2026-01-01',
        phoneNumber: row.phoneNumber.trim() || 'N/A',
        photo: '', // Speed bypasses image upload
        department: row.department
      };

      updatedList.push(newStaff);
    });

    setStaffList(updatedList);
    setIsFormOpen(false);

    // Reset bulk grid with clean instances of default
    setBulkRows([
      createEmptyBulkRow('Security'),
      createEmptyBulkRow('Security'),
      createEmptyBulkRow('Security'),
      createEmptyBulkRow('Security'),
      createEmptyBulkRow('Security'),
    ]);

    showNotice(`ជោគជ័យ! បញ្ចូលបុគ្គលិកថ្មីចំនួន ${filledRows.length} នាក់ ដោយរលូន និងរហ័សបំផុត។`);
  };

  const handleBulkRowChange = (index: number, key: keyof BulkRow, val: any) => {
    const updated = [...bulkRows];
    updated[index] = { ...updated[index], [key]: val };
    setBulkRows(updated);
  };

  const handleRemoveBulkRow = (index: number) => {
    if (bulkRows.length <= 1) {
      showNotice('ត្រូវរក្សាទុកយ៉ាងហោចណាស់ ១ ជួរ!', 'error');
      return;
    }
    setBulkRows(bulkRows.filter((_, idx) => idx !== index));
  };

  const handleAddBulkRow = () => {
    const lastDept = bulkRows[bulkRows.length - 1]?.department || 'Security';
    setBulkRows([...bulkRows, createEmptyBulkRow(lastDept)]);
  };

  const handleApplyBulkPaste = () => {
    if (!bulkPasteText.trim()) {
      showNotice('សូមបញ្ចូល ឬបិទភ្ជាប់ឈ្មោះជាមុនសិន!', 'error');
      return;
    }
    const names = bulkPasteText
      .split(/[\n,;]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (names.length === 0) {
      showNotice('រកមិនឃើញឈ្មោះណាមួយឡើយ!', 'error');
      return;
    }

    const lastDept = bulkRows[bulkRows.length - 1]?.department || 'Security';
    const newRows = names.map(name => ({
      ...createEmptyBulkRow(lastDept),
      name: name
    }));

    // If current empty rows exist, replace. Otherwise append.
    const hasOnlyEmptyDefaultRows = bulkRows.every(r => r.name.trim() === '');
    if (hasOnlyEmptyDefaultRows) {
      setBulkRows(newRows);
    } else {
      setBulkRows([...bulkRows.filter(r => r.name.trim() !== ''), ...newRows]);
    }

    setBulkPasteText('');
    showNotice(`ជោគជ័យ! បានបញ្ចូលឈ្មោះ ${names.length} នាក់ ទៅក្នុងតារាងខាងក្រោមរួចរាល់។ លោកអ្នកគ្រាន់តែពិនិត្យភេទ ផ្នែកការងារ ឬវាយលេខទូរស័ព្ទ រួចចុច "រក្សាទុកជាក្រុម" ជាការស្រេច!`);
  };

  // Delete staff member
  const handleDeleteStaff = (id: string, name: string, staffId: string) => {
    setDeleteTarget({ id, name, staffId });
  };

  const confirmDeleteStaff = () => {
    if (deleteTarget) {
      setStaffList(staffList.filter(s => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  // Attachment managers
  const openAttachmentModal = (staff: Staff, defaultTab: 'upload' | 'link' = 'upload') => {
    const activeStaff = staffList.find(s => s.id === staff.id) || staff;
    setSelectedStaffForAttachments(activeStaff);
    setActiveAttachmentTab(defaultTab);
    setIsAttachmentModalOpen(true);
  };

  const handleUploadAttachments = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedStaffForAttachments) return;

    const fileList: File[] = Array.from(files) as File[];
    const newAttachments: { id: string; name: string; size: string; type: string; dataUrl: string }[] = [];

    setIsCompressing(true);

    try {
      for (const file of fileList) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const formattedSize = file.size > 1024 * 1024 
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
          : `${(file.size / 1024).toFixed(0)} KB`;

        newAttachments.push({
          id: `attach_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: formattedSize,
          type: file.type,
          dataUrl
        });
      }

      const updatedList = staffList.map(s => {
        if (s.id === selectedStaffForAttachments.id) {
          const currentAttachments = s.attachments || [];
          return {
            ...s,
            attachments: [...currentAttachments, ...newAttachments]
          };
        }
        return s;
      });

      setStaffList(updatedList);
      
      const activeStaff = updatedList.find(s => s.id === selectedStaffForAttachments.id);
      if (activeStaff) {
        setSelectedStaffForAttachments(activeStaff);
      }
    } catch (err) {
      console.error(err);
      showNotice('មានបញ្ហាក្នុងការអានឯកសារ សូមសាកល្បងម្ដងទៀត!', 'error');
    } finally {
      setIsCompressing(false);
      if (attachmentFileInputRef.current) {
        attachmentFileInputRef.current.value = '';
      }
    }
  };

  const handleAddWebLinkAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForAttachments || !linkTitle.trim() || !linkUrl.trim()) return;

    let targetUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    const newAttachment = {
      id: `attach_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: linkTitle.trim(),
      size: 'Web Link',
      type: 'link',
      dataUrl: targetUrl
    };

    const updatedList = staffList.map(s => {
      if (s.id === selectedStaffForAttachments.id) {
        const currentAttachments = s.attachments || [];
        return {
          ...s,
          attachments: [...currentAttachments, newAttachment]
        };
      }
      return s;
    });

    setStaffList(updatedList);
    const activeStaff = updatedList.find(s => s.id === selectedStaffForAttachments.id);
    if (activeStaff) {
      setSelectedStaffForAttachments(activeStaff);
    }

    setLinkTitle('');
    setLinkUrl('');
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    if (!selectedStaffForAttachments) return;
    const attachment = (selectedStaffForAttachments.attachments || []).find(a => a.id === attachmentId);
    if (attachment) {
      setDeleteAttachmentTarget({ id: attachmentId, name: attachment.name });
    }
  };

  const confirmDeleteAttachment = () => {
    if (!deleteAttachmentTarget || !selectedStaffForAttachments) return;

    const attachmentId = deleteAttachmentTarget.id;
    const updatedList = staffList.map(s => {
      if (s.id === selectedStaffForAttachments.id) {
        return {
          ...s,
          attachments: (s.attachments || []).filter(a => a.id !== attachmentId)
        };
      }
      return s;
    });

    setStaffList(updatedList);

    const activeStaff = updatedList.find(s => s.id === selectedStaffForAttachments.id);
    if (activeStaff) {
      setSelectedStaffForAttachments(activeStaff);
    }
    
    setDeleteAttachmentTarget(null);
  };

  // Handle Excel upload
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    try {
      const parsed = await parseStaffExcel(file, importDept);
      
      // Merge spreadsheet parsing into current list without repeating elements
      const currentIds = staffList.map(s => s.staffId);
      const filteredNew = parsed.filter(p => !currentIds.includes(p.staffId));
      
      const updatedList = [...staffList];
      filteredNew.forEach((p, idx) => {
        p.no = updatedList.length + 1;
        updatedList.push(p);
      });
      
      setStaffList(updatedList);
      showNotice(`បញ្ចូលជោគជ័យ! បានរកឃើញបុគ្គលិកថ្មី ${filteredNew.length} នាក់ បញ្ចូលក្នុង "${DEPARTMENT_NAMES_KM[importDept]}"។`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setImportError('សូមពិនិត្យមើលទ្រង់ទ្រាយឯកសារ Excel ថាតើត្រឹមត្រូវតាមលក្ខខណ្ឌដែរឬទេ!');
    }
  };

  // Downloads Sample Template Excel file directly for customers
  const downloadTemplate = () => {
    const data = [
      {
        'No': 1,
        'Staff ID': 'WIS-CLN-050',
        'Name': 'អ៊ុំ ស្រីមុំ',
        'Gender': 'ស្រី',
        'DOB': '1989-06-25',
        'Phone Number': '012 555 123',
        'Photo': ''
      },
      {
        'No': 2,
        'Staff ID': 'WIS-SEC-030',
        'Name': 'ប៉ែន សម្បត្តិ',
        'Gender': 'ប្រុស',
        'DOB': '1993-10-15',
        'Phone Number': '097 999 888',
        'Photo': ''
      }
    ];
    import('xlsx').then((XLSX) => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'គំរូទិន្នន័យបុគ្គលិក');
      XLSX.writeFile(workbook, 'WIS_Staff_Template_Sample.xlsx');
    });
  };

  // Filtered staff enumeration
  const filteredStaff = staffList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.staffId.toLowerCase().includes(search.toLowerCase()) || 
                          s.phoneNumber.includes(search);
    const matchesDept = selectedDept === 'All' || s.department === selectedDept;
    const matchesGender = selectedGender === 'All' || s.gender === selectedGender;
    return matchesSearch && matchesDept && matchesGender;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-6 relative">
      
      {/* Title with decorative badge */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 text-emerald-850 rounded-lg"><BookOpen className="w-5 h-5" /></span>
            រៀបចំ និងគ្រប់គ្រងទិន្នន័យបុគ្គលិក
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            បន្ថែមដោយផ្ទាល់ជាម្នាក់ៗ ឬបន្ថែមជាក្រុមល្បឿនលឿន និងស្រង់ព័ត៌មានបុគ្គលិកទាំងអស់
          </p>
        </div>

        {/* Action Button layout */}
        <div className="flex flex-wrap items-center gap-3">
          {/* New manual add button */}
          <button 
            onClick={openAddForm}
            className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-md shadow-emerald-100"
          >
            <UserPlus className="w-4 h-4" />
            បន្ថែមបុគ្គលិកថ្មី
          </button>
        </div>
      </div>

      {/* Main Grid: Upload Block & Filters List */}
      <div className="my-6">
        
        {/* Box Right: Quick Search Filters */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-end">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            
            {/* Search filter input */}
            <div>
              <label className="text-xs font-black text-slate-600">ស្វែងរក (Search)</label>
              <div className="relative mt-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  placeholder="ស្វែងរកឈ្មោះ, លេខបុគ្គលិក..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 text-xs font-medium border border-slate-200 pl-9 pr-3 py-2 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
            </div>

            {/* Department Selection Filter */}
            <div>
              <label className="text-xs font-black text-slate-600">តម្រងផ្នែក (Department)</label>
              <select 
                value={selectedDept} 
                onChange={(e) => setSelectedDept(e.target.value as Department | 'All')}
                className="w-full bg-slate-50 border border-slate-200 p-2 text-xs font-semibold rounded-lg mt-1 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="All">គ្រប់ផ្នែកទាំងអស់</option>
                {ALL_DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{DEPARTMENT_NAMES_KM[d]}</option>
                ))}
              </select>
            </div>

            {/* Gender Selection Filter */}
            <div>
              <label className="text-xs font-black text-slate-600">តម្រងភេទ (Gender)</label>
              <select 
                value={selectedGender} 
                onChange={(e) => setSelectedGender(e.target.value as 'All' | 'ប្រុស' | 'ស្រី')}
                className="w-full bg-slate-50 border border-slate-200 p-2 text-xs font-semibold rounded-lg mt-1 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="All">ប្រុស និងស្រី</option>
                <option value="ប្រុស">ប្រុស (Male)</option>
                <option value="ស្រី">ស្រី (Female)</option>
              </select>
            </div>

          </div>

          {/* Quick Export Panel of current search results */}
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <span className="text-xs font-bold text-slate-400 mr-2">រកឃើញ៖ {filteredStaff.length} នាក់</span>
            
            <button 
              onClick={() => {
                exportStaffToExcel(filteredStaff, selectedDept);
              }}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-xl border border-emerald-500 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel (.xlsx)
            </button>
            <button 
              onClick={() => {
                exportStaffToPdf(filteredStaff, selectedDept);
              }}
              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-xl border border-rose-500 transition"
            >
              <FileText className="w-3.5 h-3.5" /> Export PDF
            </button>
          </div>
        </div>

      </div>

      {/* Staff Photo Card List Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredStaff.map((staff) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={staff.id}
              className="bg-slate-50/50 rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition relative flex flex-col justify-between"
            >
              {/* Photo 4*6 layout box */}
              <div>
                <div className="w-28 h-36 mx-auto bg-slate-200 border border-slate-300 shadow-sm relative overflow-hidden rounded-md flex items-center justify-center">
                  {staff.photo ? (
                    <img 
                      src={staff.photo} 
                      alt={staff.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="text-center p-2 flex flex-col items-center justify-center h-full">
                      {/* Generates Initials dynamically */}
                      <span className="text-sm font-black text-slate-500 block uppercase">WIS Photo</span>
                      <span className="text-xs text-slate-400 font-semibold block mt-1">(ទំហំ 4*6)</span>
                      <div className="mt-2 w-10 h-10 rounded-full bg-slate-350 bg-slate-300 flex items-center justify-center text-xs font-black text-slate-700">
                        {staff.name.split(' ').pop()?.substring(0, 2) || 'WIS'}
                      </div>
                    </div>
                  )}
                  {/* Absolute small tag */}
                  <div className="absolute top-1.5 left-1.5 bg-slate-900/85 text-[8px] font-bold text-white px-1 py-0.5 rounded-sm">
                    4x6 SIZE
                  </div>
                </div>

                <div className="text-center mt-3">
                  <h4 className="text-base font-black text-slate-800">{staff.name}</h4>
                  <p className="text-xs font-bold text-emerald-800 mt-0.5">{staff.staffId}</p>
                  
                  {/* Department description tag */}
                  <span className="inline-block bg-slate-200 text-slate-800 font-extrabold text-[9px] px-2 py-0.5 rounded-full mt-2 uppercase tracking-wide">
                    {DEPARTMENT_NAMES_KM[staff.department]}
                  </span>
                </div>

                <div className="border-t border-slate-200/50 mt-3 pt-3 space-y-1.5 text-xs font-semibold text-slate-500">
                  <div className="flex justify-between">
                    <span>ភេទ៖ <span className="font-extrabold text-slate-700">{staff.gender}</span></span>
                    <span>ចំនួនឆ្នាំធ្វើការ៖ <span className="font-extrabold text-emerald-800 font-sans">{calculateYearsOfWork(staff.joinDate)}</span></span>
                  </div>
                  {staff.joinDate && (
                    <div className="flex justify-between">
                      <span>ថ្ងៃចូលការងារ៖</span>
                      <span className="font-extrabold text-slate-700">{staff.joinDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs">
                    <span>ទូរស័ព្ទ៖</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-emerald-850 font-mono text-[11px]">{staff.phoneNumber}</span>
                      {staff.phoneNumber && staff.phoneNumber !== 'N/A' && staff.phoneNumber !== 'គ្មាន' && (
                        <a
                          href={(() => {
                            const clean = staff.phoneNumber.replace(/[^0-9]/g, '');
                            const international = clean.startsWith('855') 
                              ? clean 
                              : clean.startsWith('0') 
                                ? `855${clean.slice(1)}` 
                                : `855${clean}`;
                            return `https://t.me/+${international}`;
                          })()}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center p-1 rounded-md bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white transition duration-200 cursor-pointer border border-sky-100"
                          title="បើកឆាត Telegram (Instant Contact)"
                        >
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.66-.52.36-.97.53-1.35.52-.42-.01-1.23-.24-1.83-.44-.74-.24-1.33-.37-1.28-.79.03-.22.33-.45.91-.69 3.56-1.55 5.93-2.57 7.12-3.06 3.4-1.4 4.1-1.64 4.56-1.65.11 0 .34.03.49.15.12.1.15.24.17.34 0 .07.01.21 0 .28z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                  {staff.icom && (
                    <div className="flex justify-between items-center bg-amber-50 border border-amber-100/60 rounded-lg p-1.5 mt-2 text-[10px] text-amber-900 font-extrabold">
                      <span className="flex items-center gap-1">📻 មុខងារអាយកូម (Icom):</span>
                      <span className="font-black bg-white px-1.5 py-0.5 rounded border border-amber-200">{staff.icom}</span>
                    </div>
                  )}
                  {staff.responsibleLocation && (
                    <div className="space-y-1.5 mt-2">
                      <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100/60 rounded-lg p-1.5 text-[10px] text-emerald-900 font-extrabold shadow-2xs">
                        <span className="flex items-center gap-1">📍 ទីតាំងទទួលខុសត្រូវ៖</span>
                        <span className="font-black bg-white px-1.5 py-0.5 rounded border border-emerald-200">{staff.responsibleLocation}</span>
                      </div>
                      {staff.phoneNumber && (
                        <div className="flex items-center gap-1">
                          <a
                            href={(() => {
                              const clean = staff.phoneNumber.replace(/[^0-9]/g, '');
                              const international = clean.startsWith('855') 
                                ? clean 
                                : clean.startsWith('0') 
                                  ? `855${clean.slice(1)}` 
                                  : `855${clean}`;
                              return `https://t.me/+${international}`;
                            })()}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-1.5 w-full bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white border border-sky-100 hover:border-sky-600 rounded-lg py-1.5 px-2 text-[10px] font-extrabold transition-all duration-200 cursor-pointer shadow-2xs group"
                            title="ចុចទីនេះដើម្បីបើកឆាត Telegram ទៅកាន់អ្នកទទួលខុសត្រូវ"
                          >
                            <svg className="w-3.5 h-3.5 text-sky-500 group-hover:text-white shrink-0 fill-current transition-colors" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.66-.52.36-.97.53-1.35.52-.42-.01-1.23-.24-1.83-.44-.74-.24-1.33-.37-1.28-.79.03-.22.33-.45.91-.69 3.56-1.55 5.93-2.57 7.12-3.06 3.4-1.4 4.1-1.64 4.56-1.65.11 0 .34.03.49.15.12.1.15.24.17.34 0 .07.01.21 0 .28z" />
                            </svg>
                            <span>ទាក់ទងតាម Telegram</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Edit / Delete quick buttons */}
              <div className="flex items-center gap-2 border-t border-slate-200/50 mt-4 pt-3 justify-end">
                <button 
                  onClick={() => openAttachmentModal(staff, 'upload')}
                  className="p-1.5 text-slate-400 hover:text-teal-600 bg-white hover:bg-teal-50 rounded-lg border border-slate-200/60 transition flex items-center justify-center relative cursor-pointer"
                  title="ឯកសារភ្ជាប់ (File Attachments)"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  {staff.attachments && staff.attachments.filter(a => a.type !== 'link').length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-teal-500 text-white font-sans text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-xs border border-white">
                      {staff.attachments.filter(a => a.type !== 'link').length}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => openAttachmentModal(staff, 'link')}
                  className="p-1.5 text-slate-400 hover:text-emerald-805 bg-white hover:bg-emerald-50 rounded-lg border border-slate-200/60 transition flex items-center justify-center relative cursor-pointer"
                  title="តំណភ្ជាប់ Web (Other Links)"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  {staff.attachments && staff.attachments.filter(a => a.type === 'link').length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white font-sans text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-xs border border-white">
                      {staff.attachments.filter(a => a.type === 'link').length}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => openEditForm(staff)}
                  className="p-1.5 text-slate-400 hover:text-emerald-805 bg-white hover:bg-emerald-50 rounded-lg border border-slate-200/60 transition cursor-pointer"
                  title="កែសម្រួលព័ត៌មាន"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleDeleteStaff(staff.id, staff.name, staff.staffId)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-lg border border-slate-200/60 transition cursor-pointer"
                  title="លុបចោល"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredStaff.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 font-semibold text-xs border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl">
            គ្មានទិន្នន័យបុគ្គលិកដើម្បីបង្ហាញតាមរយៈការស្វែងរកនេះឡើយ។
          </div>
        )}
      </div>

      {/* Manual Input / Editing Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full overflow-hidden flex flex-col transition-all duration-300 ${
                entryMode === 'bulk' ? 'max-w-4xl max-h-[90vh]' : 'max-w-lg max-h-[95vh]'
              }`}
            >
              {/* Header */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b-2 border-amber-500 shrink-0">
                <h3 className="text-base font-black flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-400" />
                  {editingStaffId ? 'កែសម្រួលព័ត៌មានបុគ្គលិក' : 'បន្ថែមព័ត៌មានបុគ្គលិក'}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode Toggles (Only when adding, not editing) */}
              {!editingStaffId && (
                <div className="flex bg-slate-100 border-b border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEntryMode('single');
                      setLastInsertedStaff(null);
                    }}
                    className={`flex-1 py-3 text-xs font-black transition flex items-center justify-center gap-2 ${
                      entryMode === 'single'
                        ? 'bg-white text-emerald-850 border-b-2 border-emerald-850'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span>👤 បញ្ចូលប្រចាំនាក់ (Single Entry)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEntryMode('bulk');
                      setLastInsertedStaff(null);
                    }}
                    className={`flex-1 py-3 text-xs font-black transition flex items-center justify-center gap-2 ${
                      entryMode === 'bulk'
                        ? 'bg-white text-emerald-850 border-b-2 border-emerald-850'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span>📋 បញ្ចូលជាក្រុម (Bulk Table Entry)</span>
                  </button>
                </div>
              )}

              {/* Single Mode Form */}
              {entryMode === 'single' ? (
                <form onSubmit={handleSaveStaff} className="p-6 space-y-4 overflow-y-auto">
                  {/* Last inserted notification toast inside modal */}
                  {lastInsertedStaff && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      <span className="text-xs font-bold leading-tight">
                        បានបញ្ចូលដោយជោគជ័យ៖ <b>{lastInsertedStaff.name}</b> (លេខសម្គាល់៖ <b>{lastInsertedStaff.staffId}</b>)។ អាចបន្តវាយឈ្មោះបន្ទាប់!
                      </span>
                    </motion.div>
                  )}

                  {/* ID & Name row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700">លេខសម្គាល់បុគ្គលិក (Staff ID) *</label>
                      <input 
                        type="text"
                        value={formStaffId}
                        onChange={(e) => setFormStaffId(e.target.value.toUpperCase())}
                        placeholder="WIS-CLN-085"
                        className="w-full bg-slate-50 text-xs font-semibold p-2.5 border border-slate-200 rounded-lg mt-1 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">ឈ្មោះពេញ (Full Name) *</label>
                      <input 
                        type="text"
                        ref={nameInputRef}
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="ឈ្មោះបុគ្គលិក..."
                        className="w-full bg-slate-50 text-xs font-semibold p-2.5 border border-slate-200 rounded-lg mt-1 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Gender & DOB row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700">ភេទ (Gender)</label>
                      <select
                        value={formGender}
                        onChange={(e) => setFormGender(e.target.value as 'ប្រុស' | 'ស្រី')}
                        className="w-full bg-slate-50 text-xs font-semibold p-2.5 border border-slate-200 rounded-lg mt-1 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                      >
                        <option value="ប្រុស">ប្រុស (Male)</option>
                        <option value="ស្រី">ស្រី (Female)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">ចំនួនឆ្នាំធ្វើការ (Years of Work)</label>
                      <div className="w-full bg-slate-100 text-xs font-black p-2.5 border border-slate-200 text-emerald-800 rounded-lg mt-1 select-none font-sans min-h-[38px] flex items-center">
                        {calculateYearsOfWork(formJoinDate)} (គណនាស្វ័យប្រវត្ត)
                      </div>
                    </div>
                  </div>

                  {/* Date of Joining (Hire Date) */}
                  <div>
                    <label className="text-xs font-bold text-slate-700">ថ្ងៃខែឆ្នាំចូលធ្វើការ (Date of Joining)</label>
                    <input 
                      type="date"
                      value={formJoinDate}
                      onChange={(e) => setFormJoinDate(e.target.value)}
                      className="w-full bg-slate-50 text-xs font-semibold p-2.5 border border-slate-200 rounded-lg mt-1 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>

                  {/* Phone & Department row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700">លេខទូរស័ព្ទ (Phone)</label>
                      <input 
                        type="text"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="012 345 678"
                        className="w-full bg-slate-50 text-xs font-semibold p-2.5 border border-slate-200 rounded-lg mt-1 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">ផ្នែកការងារ (Department)</label>
                      <select
                        value={formDept}
                        onChange={(e) => {
                          const newDept = e.target.value as Department;
                          setFormDept(newDept);
                          if (!editingStaffId) {
                            const suggestedId = generateUniqueStaffId(newDept);
                            setFormStaffId(suggestedId);
                          }
                        }}
                        className="w-full bg-slate-50 text-xs font-semibold p-2.5 border border-slate-200 rounded-lg mt-1 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                      >
                        {ALL_DEPARTMENTS.map(d => (
                          <option key={d} value={d}>{DEPARTMENT_NAMES_KM[d]}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Icom row */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      📻 មុខងារអាយកូម (Icom Walkie-Talkie)
                    </label>
                    <input 
                      type="text"
                      value={formIcom}
                      onChange={(e) => setFormIcom(e.target.value)}
                      placeholder="ឧទាហរណ៍៖ មាន (ម៉ាក Motorola), Channel 3, លេខ ០២..."
                      className="w-full bg-slate-50 text-xs font-semibold p-2.5 border border-slate-200 rounded-lg mt-1 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>

                  {/* Responsible Location row */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      📍 ទីតាំងទទួលខុសត្រូវ (Responsible Location)
                    </label>
                    <input 
                      type="text"
                      value={formResponsibleLocation}
                      onChange={(e) => setFormResponsibleLocation(e.target.value)}
                      placeholder="ឧទាហរណ៍៖ អគារ A, បណ្ណាល័យ, ច្រកទ្វារធំ..."
                      className="w-full bg-slate-50 text-xs font-semibold p-2.5 border border-slate-200 rounded-lg mt-1 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                    />
                    {formResponsibleLocation.trim() && formPhone.trim() && (
                      <div className="mt-2.5 bg-sky-50 border border-sky-100/75 rounded-xl p-3 text-[11px] text-sky-900 font-extrabold animate-fade-in space-y-1.5 shadow-sm">
                        <div className="flex items-center gap-1.5 text-sky-850">
                          <svg className="w-4 h-4 text-sky-550 shrink-0 fill-current animate-pulse" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.66-.52.36-.97.53-1.35.52-.42-.01-1.23-.24-1.83-.44-.74-.24-1.33-.37-1.28-.79.03-.22.33-.45.91-.69 3.56-1.55 5.93-2.57 7.12-3.06 3.4-1.4 4.1-1.64 4.56-1.65.11 0 .34.03.49.15.12.1.15.24.17.34 0 .07.01.21 0 .28z" />
                          </svg>
                          <span>សាកល្បងបំលែងទូរស័ព្ទទៅ Telegram៖</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-2.5 py-1.5 border border-sky-100 rounded-lg">
                          <span className="font-mono text-sky-850 font-extrabold tracking-wide text-xs select-all shrink-0">
                            {(() => {
                              const clean = formPhone.replace(/[^0-9]/g, '');
                              const international = clean.startsWith('855') 
                                ? clean 
                                : clean.startsWith('0') 
                                  ? `855${clean.slice(1)}` 
                                  : `855${clean}`;
                              return `t.me/+${international}`;
                            })()}
                          </span>
                          <a
                            href={(() => {
                              const clean = formPhone.replace(/[^0-9]/g, '');
                              const international = clean.startsWith('855') 
                                ? clean 
                                : clean.startsWith('0') 
                                  ? `855${clean.slice(1)}` 
                                  : `855${clean}`;
                              return `https://t.me/+${international}`;
                            })()}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-sky-600 hover:bg-sky-700 text-white text-[10px] px-3 py-1.5 rounded-lg font-black transition-all shadow-md shadow-sky-100 shrink-0 cursor-pointer"
                          >
                            បើកឆាតភ្លាមៗ
                          </a>
                        </div>
                        <p className="text-[9.5px] text-slate-400 font-semibold leading-normal">
                          ប្រព័ន្ធនឹងបំលែងលេខទូរស័ព្ទ ({formPhone || 'គ្មាន'}) ទៅជាតំណភ្ជាប់គណនី Telegram ប្រទេសកម្ពុជា (+855) ស្វ័យប្រវត្ត។
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Profile Photo (Size: 4*6) Upload */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Camera className="w-4 h-4 text-slate-400" /> រូបថតទំហំ 4*6 (Photo Size 4x6)
                    </label>
                    <div className="mt-1 flex items-center gap-4">
                      {/* Tiny preview */}
                      <div className="w-14 h-20 bg-slate-100 rounded border border-slate-300 overflow-hidden flex items-center justify-center relative">
                        {isCompressing ? (
                          <span className="text-[9px] text-emerald-800 text-center font-semibold animate-pulse leading-none">កំពុងបង្ហាប់...</span>
                        ) : formPhoto ? (
                          <img src={formPhoto} alt="4x6 Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] text-slate-400 text-center font-bold">គ្មានរូប</span>
                        )}
                      </div>
                      <div>
                        <input 
                          type="file" 
                          ref={photoInputRef}
                          onChange={handlePhotoUpload}
                          accept="image/*"
                          className="hidden" 
                          disabled={isCompressing}
                        />
                        <button
                          type="button"
                          disabled={isCompressing}
                          onClick={() => photoInputRef.current?.click()}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-extrabold px-3 py-2 rounded-lg border border-slate-200 transition disabled:opacity-50"
                        >
                          {isCompressing ? 'កំពុងដំណើរការ...' : 'បញ្ចូលរូបថតពីម៉ាស៊ីន'}
                        </button>
                        {formPhoto && !isCompressing && (
                          <button
                            type="button"
                            onClick={() => setFormPhoto('')}
                            className="text-rose-600 font-extrabold text-[11px] ml-3"
                          >
                            លុបរូប
                          </button>
                        )}
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">រូបភាពបញ្ឈរទំហំសមាមាត្រ 4:6 (ប្រព័ន្ធបង្រួមនិងតម្រឹមចំកណ្ដាលដោយស្វ័យប្រវត្តិ)</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit button bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 mt-6 shrink-0">
                    {!editingStaffId ? (
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={keepAndAddMore}
                          onChange={(e) => setKeepAndAddMore(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                        />
                        <span>រក្សាទុក និងបន្ថែមបន្តទៀត (Continuous Adding)</span>
                      </label>
                    ) : (
                      <div />
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-extrabold px-4 py-2.5 rounded-xl border border-slate-200 transition"
                      >
                        បដិសេធ
                      </button>
                      <button
                        type="submit"
                        className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition shadow-md shadow-emerald-100"
                      >
                        {editingStaffId ? 'រក្សាទុកការកែសម្រួល' : 'បញ្ចូលទិន្នន័យ'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* Bulk Spreadsheet Editor Mode */
                <form onSubmit={handleSaveBulkStaff} className="p-6 flex flex-col overflow-hidden max-h-[75vh]">
                  
                  {/* Warning instruction */}
                  <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-950 px-4 py-3 rounded-xl flex items-start gap-2.5 shrink-0">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold">គន្លឹះបញ្ចូលបុគ្គលិកជាក្រុមល្បឿនលឿន (Bulk Add Tips)៖</p>
                      <p className="text-[11px] text-slate-600 font-medium mt-1">
                        - ប្រព័ន្ធនឹងបង្កើត <b>លេខសម្គាល់បុគ្គលិក (Staff ID)</b> ជូនដោយស្វ័យប្រវត្តិតាមលំដាប់លំដោយនៃផ្នែកការងារនីមួយៗ។<br />
                        - រូបថតទំហំ 4*6 អាចបន្ថែមតាមក្រោយបាននៅពេលកែសម្រួលបុគ្គលិក ដើម្បីដំណើរការទិន្នន័យបានលឿនខ្ពស់បំផុត។
                      </p>
                    </div>
                  </div>

                  {/* Quick paste box for ultra-fast name inserting */}
                  <div className="mb-4 bg-slate-50 border border-slate-200 p-3 rounded-xl shrink-0">
                    <label className="text-xs font-black text-slate-700 flex items-center gap-1.5 mb-1.5">
                      <Plus className="w-4 h-4 text-emerald-800" />
                      បិទភ្ជាប់បញ្ជីឈ្មោះរហ័ស (Quick Name Paste)
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        rows={1}
                        value={bulkPasteText}
                        onChange={(e) => setBulkPasteText(e.target.value)}
                        placeholder="បិទភ្ជាប់ ឬវាយឈ្មោះជាច្រើននៅទីនេះ (ចុះបន្ទាត់ ឬប្រើសញ្ញាក្បៀស [,] ដើម្បីញែកឈ្មោះ)..."
                        className="flex-1 bg-white border border-slate-200 text-xs font-semibold p-2 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:outline-none resize-none"
                      />
                      <button
                        type="button"
                        onClick={handleApplyBulkPaste}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black px-4 rounded-lg transition shrink-0 flex items-center gap-1 shadow-xs"
                      >
                        <span>បញ្ចូលទៅក្នុងតារាង</span>
                      </button>
                    </div>
                  </div>

                  {/* Scrollable grid wrapper */}
                  <div className="overflow-auto border border-slate-200 rounded-xl bg-slate-50 flex-1">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider sticky top-0 z-10">
                          <th className="py-2.5 px-3 text-center w-10">#</th>
                          <th className="py-2.5 px-3">ឈ្មោះពេញរបស់បុគ្គលិក *</th>
                          <th className="py-2.5 px-3 w-32">ភេទ (Gender)</th>
                          <th className="py-2.5 px-3 w-40 text-center">ចំនួនឆ្នាំធ្វើការ (Years)</th>
                          <th className="py-2.5 px-3 w-40">ថ្ងៃចូលធ្វើការ (Joining)</th>
                          <th className="py-2.5 px-3 w-40">លេខទូរស័ព្ទ (Phone)</th>
                          <th className="py-2.5 px-3 w-48">ផ្នែកការងារ (Department)</th>
                          <th className="py-2.5 px-3 text-center w-12">លុប</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white text-xs">
                        {bulkRows.map((row, index) => (
                          <tr key={row.id} className="hover:bg-emerald-50/20 transition-colors">
                            <td className="py-2 px-3 text-center font-bold text-slate-400">
                              {(index + 1).toString().padStart(2, '0')}
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.name}
                                onChange={(e) => handleBulkRowChange(index, 'name', e.target.value)}
                                placeholder="ឧ. កែវ សុខា"
                                className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs font-bold p-2 border border-slate-200 focus:border-emerald-700 rounded-lg focus:outline-none transition"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={row.gender}
                                onChange={(e) => handleBulkRowChange(index, 'gender', e.target.value)}
                                className="w-full bg-slate-50 text-xs font-bold p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-700"
                              >
                                <option value="ប្រុស">ប្រុស</option>
                                <option value="ស្រី">ស្រី</option>
                              </select>
                            </td>
                            <td className="py-2 px-3 text-center font-extrabold text-xs text-emerald-800 font-sans">
                              {calculateYearsOfWork(row.joinDate)}
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="date"
                                value={row.joinDate || ''}
                                onChange={(e) => handleBulkRowChange(index, 'joinDate', e.target.value)}
                                className="w-full bg-slate-50 text-xs font-semibold p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-700"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.phoneNumber}
                                onChange={(e) => handleBulkRowChange(index, 'phoneNumber', e.target.value)}
                                placeholder="098 765 432"
                                className="w-full bg-slate-50 text-xs font-semibold p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-800 focus:border-emerald-700"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <select
                                value={row.department}
                                onChange={(e) => handleBulkRowChange(index, 'department', e.target.value as Department)}
                                className="w-full bg-slate-50 text-xs font-bold p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-700"
                              >
                                {ALL_DEPARTMENTS.map(d => (
                                  <option key={d} value={d}>{DEPARTMENT_NAMES_KM[d]}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveBulkRow(index)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="លុបជួរនេះ"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Row Button bar */}
                  <div className="mt-3 flex items-center justify-between shrink-0">
                    <button
                      type="button"
                      onClick={handleAddBulkRow}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-black px-4 py-2.5 rounded-xl border border-slate-700 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> បន្ថែមជួរថ្មី (Add Row)
                    </button>
                    <span className="text-[10px] text-slate-400 font-bold">
                      * ជួរដែលពុំមានបំពេញឈ្មោះពេញ នឹងត្រូវបានរំលងផ្ដាច់ដោយស្វ័យប្រវត្តិនាពេលរក្សាទុក។
                    </span>
                  </div>

                  {/* Submitting Actions */}
                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-extrabold px-4 py-2.5 rounded-xl border border-slate-200 transition"
                    >
                      បោះបង់
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl transition shadow-md shadow-emerald-100"
                    >
                      រក្សាទុកជាក្រុម
                    </button>
                  </div>

                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden"
              id="delete-confirm-modal"
            >
              {/* Header */}
              <div className="bg-rose-600 text-white p-4 flex items-center justify-between">
                <h3 className="text-base font-black flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-white" />
                  បញ្ជាក់ការលុបទិន្នន័យ
                </h3>
                <button onClick={() => setDeleteTarget(null)} className="text-white/80 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                  <Trash2 className="w-8 h-8 text-rose-600" />
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-2">តើអ្នកពិតជាចង់លុបបុគ្គលិកនេះមែនទេ?</h4>
                <div className="text-sm font-medium text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 inline-block font-sans">
                  ឈ្មោះ៖ <span className="font-extrabold text-slate-800">{deleteTarget.name}</span> <span className="text-slate-350 mx-2">|</span> លេខសម្គាល់៖ <span className="font-extrabold text-slate-800">{deleteTarget.staffId}</span>
                </div>
                <p className="text-xs text-rose-500 font-semibold mt-4">
                  *ការលុបនេះនឹងមិនអាចសង្គ្រោះមកវិញបានទេ!
                </p>
              </div>

              {/* Actions */}
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-extrabold px-4 py-2.5 rounded-xl border border-slate-200 transition"
                  id="cancel-delete-btn"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteStaff}
                  className="bg-rose-650 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition shadow-md shadow-rose-100"
                  id="confirm-delete-btn"
                >
                  យល់ព្រមលុប (Delete)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Attachments Manager Modal */}
      <AnimatePresence>
        {isAttachmentModalOpen && selectedStaffForAttachments && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]"
              id="attachments-modal"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-green-600">
                <div className="flex items-center gap-2">
                  {activeAttachmentTab === 'link' ? (
                    <Link2 className="w-5 h-5 text-emerald-500 animate-pulse" />
                  ) : (
                    <Paperclip className="w-5 h-5 text-green-400" />
                  )}
                  <div>
                    <h3 className="text-sm font-black font-moul leading-snug text-white">
                      {activeAttachmentTab === 'link' ? 'តំណភ្ជាប់ Web របស់បុគ្គលិក' : 'ឯកសារភ្ជាប់របស់បុគ្គលិក'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">
                      {activeAttachmentTab === 'link' ? 'Web Links' : 'File Attachments'} for {selectedStaffForAttachments.name} ({selectedStaffForAttachments.staffId})
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsAttachmentModalOpen(false);
                    setSelectedStaffForAttachments(null);
                  }} 
                  className="text-slate-400 hover:text-white transition p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload or Link input block */}
              {activeAttachmentTab === 'link' ? (
                <form onSubmit={handleAddWebLinkAttachment} className="p-4 border-b border-slate-100 bg-teal-50/20 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">
                        ឈ្មោះតំណភ្ជាប់ / Link Title <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="ឧ. បទបង្ហាញការងារ, ផែនការបង្រៀន..."
                        value={linkTitle}
                        onChange={(e) => setLinkTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-800 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">
                        អាសយដ្ឋានតំណភ្ជាប់ / Web URL <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="ឧ. https://drive.google.com/..."
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="w-full bg-white border border-slate-200 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-hidden font-sans"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={!linkTitle.trim() || !linkUrl.trim()}
                      className="bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-black px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>បញ្ចូលតំណភ្ជាប់ (Add URL)</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 border-b border-slate-100 bg-slate-50/70">
                  <input 
                    type="file"
                    multiple
                    ref={attachmentFileInputRef}
                    onChange={handleUploadAttachments}
                    className="hidden"
                  />
                  <div 
                    onClick={() => attachmentFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-700 hover:bg-slate-50 rounded-xl p-6 text-center cursor-pointer transition-all duration-250 select-none group"
                  >
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-800 group-hover:scale-110 transition mx-auto mb-2" />
                    <span className="text-xs font-extrabold text-slate-700 block col-span-full">ជ្រើសរើសឯកសារភ្ជាប់ ឬ រូបភាព (ព្រីនសន្លឹក, ឯកសារ PDF...)</span>
                    <span className="text-[10px] font-bold text-slate-400 block mt-1">អាចផ្ទុកឯកសារបានច្រើនក្នុងពេលតែមួយ (Supports multiple files)</span>
                  </div>
                </div>
              )}

              {/* Attachments List */}
              <div className="p-4 overflow-y-auto flex-1 space-y-3 min-h-[160px]">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                  បញ្ជីឯកសារភ្ជាប់ ({selectedStaffForAttachments.attachments?.length || 0})
                </h4>

                {!selectedStaffForAttachments.attachments || selectedStaffForAttachments.attachments.length === 0 ? (
                  <div className="text-center py-10">
                    <Paperclip className="w-10 h-10 text-slate-300 mx-auto mb-2.5 opacity-60" />
                    <p className="text-xs text-slate-400 font-black">មិនទាន់មានឯកសារភ្ជាប់នៅឡើយទេ</p>
                    <p className="text-[10px] text-slate-400 mt-1">លោកអ្នកអាចចុចប្រអប់ខាងលើ ដើម្បីភ្ជាប់ឯកសារ ឬតំណភ្ជាប់ផ្សេងៗ។</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedStaffForAttachments.attachments.map((file) => {
                      const isImage = file.type?.startsWith('image/');
                      const isLink = file.type === 'link';
                      return (
                        <div 
                          key={file.id}
                          className="flex items-center justify-between border border-slate-200/80 rounded-xl p-3 bg-white hover:border-slate-300 transition-colors gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Thumbnail or Icon */}
                            <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                              {isImage ? (
                                <img 
                                  src={file.dataUrl} 
                                  alt={file.name} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : isLink ? (
                                <div className="w-full h-full bg-sky-50 flex items-center justify-center">
                                  <Link2 className="w-5 h-5 text-sky-500" />
                                </div>
                              ) : (
                                <File className="w-5 h-5 text-slate-400" />
                              )}
                            </div>

                            {/* Details */}
                            <div className="min-w-0">
                              <span 
                                className="text-xs font-bold text-slate-800 block truncate"
                                title={file.name}
                              >
                                {file.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-semibold mt-0.5 font-sans truncate">
                                {isLink ? 'តំណភ្ជាប់ Web • URL' : `${file.size} • ${file.type ? file.type.split('/')[1]?.toUpperCase() : 'DOC'}`}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isLink ? (
                              <a 
                                href={file.dataUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 hover:bg-sky-50 text-sky-600 hover:text-sky-800 border border-slate-200 bg-white transition rounded-lg flex items-center justify-center gap-1 font-bold text-[10px]"
                                title="បើកតំណភ្ជាប់ (Open Link)"
                              >
                                <ExternalLink className="w-3.5 h-3.5 shadow-2xs" />
                                <span>បើកមើល</span>
                              </a>
                            ) : (
                              <>
                                {/* Download Icon */}
                                <a 
                                  href={file.dataUrl}
                                  download={file.name}
                                  className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition rounded-lg border border-slate-200 bg-white"
                                  title="ទាញយក (Download File)"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>

                                {/* Preview / View trigger */}
                                <button 
                                  type="button"
                                  onClick={() => setPreviewingAttachment(file)}
                                  className="p-1.5 hover:bg-slate-100 text-emerald-800 hover:text-emerald-900 transition rounded-lg border border-slate-200 bg-white"
                                  title="មើលឯកសារពេញ (View/Print File)"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {/* Delete specific attachment */}
                            <button 
                              onClick={() => handleDeleteAttachment(file.id)}
                              className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition rounded-lg border border-slate-200 bg-white"
                              title="លុបឯកសារភ្ជាប់ (Delete Archive)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="bg-slate-50 px-4 py-3 flex justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAttachmentModalOpen(false);
                    setSelectedStaffForAttachments(null);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-6 py-2.5 rounded-xl cursor-pointer shadow-sm"
                >
                  រួចរាល់ (Done)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
      {/* File Preview Inline Overlay Modal */}
      <AnimatePresence>
        {previewingAttachment && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-55 p-3 sm:p-6 select-none print:hidden">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-4xl w-full overflow-hidden flex flex-col h-[85vh]"
              id="attachment-preview-modal"
            >
              {/* Preview Header */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-green-600 shrink-0">
                <div className="flex items-center gap-2 max-w-[80%]">
                  <Eye className="w-5 h-5 text-green-400 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-black font-moul leading-snug text-white truncate" title={previewingAttachment.name}>
                      {previewingAttachment.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5 truncate">
                      ប្រភេទឯកសារ៖ {previewingAttachment.type || 'មិនស្គាល់ (Unknown)'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {/* Download Button */}
                  <a
                    href={previewingAttachment.dataUrl}
                    download={previewingAttachment.name}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 transition rounded-xl border border-slate-700 flex items-center gap-1.5 text-[11px] font-bold"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">ទាញយក (Download)</span>
                  </a>

                  {/* Close Button */}
                  <button 
                    onClick={() => setPreviewingAttachment(null)} 
                    className="text-slate-400 hover:text-white transition p-2 bg-slate-800 hover:bg-rose-600 rounded-xl"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Main Content Pane */}
              <div className="flex-1 bg-slate-100 p-4 overflow-auto flex flex-col items-center justify-center relative min-h-0">
                {previewingAttachment.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(previewingAttachment.name) ? (
                  // Image Type Viewer
                  <div className="max-w-full max-h-full overflow-auto flex items-center justify-center p-2">
                    <img 
                      src={previewingAttachment.dataUrl} 
                      alt={previewingAttachment.name} 
                      className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-lg border border-white bg-white" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : previewingAttachment.type === 'application/pdf' || /\.pdf$/i.test(previewingAttachment.name) ? (
                  // PDF Document Type Viewer
                  <div className="w-full h-full flex flex-col relative">
                    <div className="absolute top-2 right-2 z-10 bg-slate-900/90 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 border border-slate-700 shadow-md">
                      <Info className="w-3.5 h-3.5 text-indigo-400" />
                      <span>ឯកសារ PDF ពេញលេញ</span>
                    </div>
                    
                    <object 
                      data={previewingAttachment.dataUrl} 
                      type="application/pdf" 
                      className="w-full h-full rounded-xl border border-slate-200 bg-white"
                      style={{ minHeight: '520px' }}
                    >
                      <iframe 
                        src={previewingAttachment.dataUrl} 
                        className="w-full h-full rounded-xl border border-slate-200 bg-white"
                        style={{ minHeight: '520px' }}
                        title={previewingAttachment.name}
                      >
                        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 max-w-md mx-auto my-12">
                          <File className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                          <h4 className="text-sm font-bold text-slate-850">មិនអាចបង្ហាញឯកសារ PDF ស្រាប់បានទេ</h4>
                          <p className="text-xs text-slate-500 mt-2">
                            សូមចុចប៊ូតុងទាញយកនៅខាងលើដើម្បីបើកមើលឯកសារនេះ។
                          </p>
                        </div>
                      </iframe>
                    </object>
                  </div>
                ) : (
                  // Other file Fallback design
                  <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 max-w-sm w-full text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                      <File className="w-8 h-8 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 truncate" title={previewingAttachment.name}>
                        {previewingAttachment.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium mt-1">
                        ប្រភេទនិងទម្រង់ឯកសារមិនគាំទ្រការទស្សនាផ្ទាល់ឡើយ។
                      </p>
                    </div>
                    <a
                      href={previewingAttachment.dataUrl}
                      download={previewingAttachment.name}
                      className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-6 rounded-xl w-full transition shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>ទាញយក និង បើកឯកសារនេះ</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Preview Footer */}
              <div className="bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 shrink-0">
                <div className="text-[10px] font-bold text-slate-400 text-center sm:text-left">
                  * ឯកសារត្រូវបានរក្សាទម្រង់ដើម និងបំប្លែងទិន្នន័យដើម្បីសុវត្ថិភាព។
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewingAttachment(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-6 py-2.5 rounded-xl cursor-pointer w-full sm:w-auto text-center"
                >
                  បិទវិញ (Close View)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal for Attachments */}
      <AnimatePresence>
        {deleteAttachmentTarget && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-60 p-4 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden"
              id="delete-attachment-confirm-modal"
            >
              {/* Header */}
              <div className="bg-rose-600 text-white p-4 flex items-center justify-between">
                <h3 className="text-base font-black flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-white" />
                  បញ្ជាក់ការលុបឯកសារភ្ជាប់
                </h3>
                <button onClick={() => setDeleteAttachmentTarget(null)} className="text-white/80 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                  <Trash2 className="w-8 h-8 text-rose-600" />
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-2">តើអ្នកពិតជាចង់លុបឯកសារភ្ជាប់នេះជាអចិន្ត្រៃយ៍មែនទេ?</h4>
                <div className="text-sm font-medium text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 inline-block font-sans max-w-full truncate">
                  ឈ្មោះឯកសារ៖ <span className="font-extrabold text-slate-850 break-all">{deleteAttachmentTarget.name}</span>
                </div>
                <p className="text-xs text-rose-500 font-semibold mt-4">
                  *ការលុបនេះនឹងមិនអាចសង្គ្រោះមកវិញបានទេ!
                </p>
              </div>

              {/* Actions */}
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteAttachmentTarget(null)}
                  className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-extrabold px-4 py-2.5 rounded-xl border border-slate-200 transition"
                  id="cancel-delete-attachment-btn"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteAttachment}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition shadow-md shadow-rose-100"
                  id="confirm-delete-attachment-btn"
                >
                  យល់ព្រមលុប (Delete File)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-extrabold flex items-center gap-3 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-slate-900/95 border-slate-800 text-emerald-400 font-tapenh shadow-black/10'
                : 'bg-rose-600/95 border-rose-500 text-white font-tapenh shadow-rose-900/10'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-400 animate-ping' : 'bg-white animate-pulse'}`} />
            <span className="leading-relaxed">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
 
    </div>
  );
}
