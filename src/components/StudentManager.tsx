/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Student, StudentGrade, GRADE_NAMES_KM, ALL_GRADES } from '../types';
import * as XLSX from 'xlsx';
import { transliterateKhmerToLatin } from '../utils/pdfHelper';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  Plus, Edit2, Trash2, FileSpreadsheet, FileText, Upload, 
  Search, Filter, BookOpen, AlertCircle, Camera, UserPlus, X, Info,
  Paperclip, Download, Eye, File, Link2, Globe, ExternalLink, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Declare standard plugins for jsPDF
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

interface StudentManagerProps {
  studentList: Student[];
  setStudentList: (list: Student[]) => void;
  lang: 'kh' | 'en';
}

interface BulkRow {
  id: string;
  name: string;
  gender: 'ប្រុស' | 'ស្រី';
  dob: string;
  enrollmentDate?: string;
  phoneNumber: string;
  grade: StudentGrade;
}

export default function StudentManager({ studentList, setStudentList, lang }: StudentManagerProps) {
  const isKh = lang === 'kh';

  // Filters & State
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<StudentGrade | 'All'>('All');
  const [selectedGender, setSelectedGender] = useState<'All' | 'ប្រុស' | 'ស្រី'>('All');
  
  // Handlers for Add / Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; studentId: string } | null>(null);

  // Multi/Bulk Entry State
  const [entryMode, setEntryMode] = useState<'single' | 'bulk'>('single');
  const [keepAndAddMore, setKeepAndAddMore] = useState(false);
  const [lastInsertedStudent, setLastInsertedStudent] = useState<{ name: string; studentId: string } | null>(null);
  const [bulkPasteText, setBulkPasteText] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Form Fields
  const [formStudentId, setFormStudentId] = useState('');
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'ប្រុស' | 'ស្រី'>('ប្រុស');
  const [formDob, setFormDob] = useState('');
  const [formEnrollmentDate, setFormEnrollmentDate] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [formGrade, setFormGrade] = useState<StudentGrade>('Grade 1');
  const [formResponsibleLocation, setFormResponsibleLocation] = useState('');

  // Excel input target grade selection
  const [importGrade, setImportGrade] = useState<StudentGrade>('Grade 1');
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
  const [selectedStudentForAttachments, setSelectedStudentForAttachments] = useState<Student | null>(null);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const attachmentFileInputRef = useRef<HTMLInputElement>(null);
  const [previewingAttachment, setPreviewingAttachment] = useState<{ id: string; name: string; type: string; dataUrl: string } | null>(null);
  const [deleteAttachmentTarget, setDeleteAttachmentTarget] = useState<{ id: string; name: string } | null>(null);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [activeAttachmentTab, setActiveAttachmentTab] = useState<'upload' | 'link'>('upload');

  // Auto-focus name input when form opens
  useEffect(() => {
    if (isFormOpen && entryMode === 'single') {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 150);
    }
  }, [isFormOpen, entryMode]);

  // Helper to construct an empty bulk row
  const createEmptyBulkRow = (grade: StudentGrade): BulkRow => ({
    id: `row_${Math.random().toString(36).substring(2, 9)}`,
    name: '',
    gender: 'ប្រុស',
    dob: '2015-01-01',
    enrollmentDate: '2026-01-01',
    phoneNumber: '',
    grade: grade,
  });

  const [bulkRows, setBulkRows] = useState<BulkRow[]>(() => [
    createEmptyBulkRow('Grade 1'),
    createEmptyBulkRow('Grade 1'),
    createEmptyBulkRow('Grade 1'),
    createEmptyBulkRow('Grade 1'),
    createEmptyBulkRow('Grade 1'),
  ]);

  // Helper to auto-generate a unique Student ID
  const generateUniqueStudentId = (grade: StudentGrade, additionalExistingIds: string[] = []): string => {
    const prefixMap: Record<StudentGrade, string> = {
      Kindergarten: 'WIS-KND',
      'Grade 1': 'WIS-GR1',
      'Grade 2': 'WIS-GR2',
      'Grade 3': 'WIS-GR3',
      'Grade 4': 'WIS-GR4',
      'Grade 5': 'WIS-GR5',
      'Grade 6': 'WIS-GR6',
      'Grade 7': 'WIS-GR7',
      'Grade 8': 'WIS-GR8',
      'Grade 9': 'WIS-GR9',
      'Grade 10': 'WIS-GR10',
      'Grade 11': 'WIS-GR11',
      'Grade 12': 'WIS-GR12',
    };
    const prefix = prefixMap[grade] || 'WIS-STU';
    
    const combinedIds = [
      ...studentList.map(s => s.studentId),
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
    setEditingStudentId(null);
    setFormStudentId('');
    setFormName('');
    setFormGender('ប្រុស');
    setFormDob('');
    setFormEnrollmentDate('');
    setFormPhone('');
    setFormPhoto('');
    setFormGrade('Grade 1');
    setFormResponsibleLocation('');
    setLastInsertedStudent(null);
  };

  // Open modal for adding
  const openAddForm = () => {
    resetForm();
    const suggestedId = generateUniqueStudentId('Grade 1');
    setFormStudentId(suggestedId);
    setFormGrade('Grade 1');
    setFormResponsibleLocation('');
    setFormEnrollmentDate('');
    setEntryMode('single');
    setKeepAndAddMore(false);
    setIsFormOpen(true);
  };

  // Open modal for editing
  const openEditForm = (student: Student) => {
    resetForm();
    setEditingStudentId(student.id);
    setFormStudentId(student.studentId);
    setFormName(student.name);
    setFormGender(student.gender as 'ប្រុស' | 'ស្រី');
    setFormDob(student.dob);
    setFormEnrollmentDate(student.enrollmentDate || '');
    setFormPhone(student.phoneNumber);
    setFormPhoto(student.photo);
    setFormGrade(student.grade);
    setFormResponsibleLocation(student.responsibleLocation || '');
    setEntryMode('single');
    setIsFormOpen(true);
  };

  // Profile icon dynamic generator from student initials
  const getInitialsAvatar = (fullName: string) => {
    const trimmed = fullName.trim();
    if (!trimmed) return 'ST';
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    
    // For Khmer names, often the last word is the given name
    const lastWord = parts[parts.length - 1];
    const firstWord = parts[0];
    return (firstWord[0] + lastWord[0]).toUpperCase();
  };

  // Photo uploaded base64 mapper with Canvas resizing and compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotice(isKh ? 'សូមជ្រើសរើសតែឯកសាររូបភាពប៉ុណ្ណោះ!' : 'Please select only image files!', 'error');
        return;
      }

      setIsCompressing(true);

      const reader = new FileReader();
      reader.onerror = () => {
        showNotice(isKh ? 'មានបញ្ហាក្នុងការអានឯកសាររូបភាពនេះ!' : 'Error reading file', 'error');
        setIsCompressing(false);
      };

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const targetWidth = 240;
            const targetHeight = 360;
            
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              setFormPhoto(event.target?.result as string);
              setIsCompressing(false);
              return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            const imgRatio = img.width / img.height;
            const targetRatio = targetWidth / targetHeight;

            let sx = 0;
            let sy = 0;
            let sWidth = img.width;
            let sHeight = img.height;

            if (imgRatio > targetRatio) {
              sWidth = img.height * targetRatio;
              sx = (img.width - sWidth) / 2;
            } else if (imgRatio < targetRatio) {
              sHeight = img.width / targetRatio;
              sy = (img.height - sHeight) / 2;
            }

            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
            setFormPhoto(compressedBase64);
          } catch (err) {
            console.error('Image compression failed:', err);
            setFormPhoto(event.target?.result as string);
          } finally {
            setIsCompressing(false);
          }
        };

        img.onerror = () => {
          showNotice(isKh ? 'មិនអាចដំណើរការរូបភាពនេះបានឡើយ!' : 'Invalid image data', 'error');
          setIsCompressing(false);
        };
      };

      reader.readAsDataURL(file);
    }
  };

  // Form submission (Save / Edit)
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showNotice(isKh ? 'សូមបំពេញឈ្មោះពេញរបស់សិស្ស!' : 'Please enter student name!', 'error');
      return;
    }

    let finalStudentId = formStudentId.trim();
    if (!finalStudentId) {
      finalStudentId = generateUniqueStudentId(formGrade);
    }

    if (editingStudentId) {
      // Modify
      const updatedList = studentList.map(s => {
        if (s.id === editingStudentId) {
          return {
            ...s,
            studentId: finalStudentId,
            name: formName.trim(),
            gender: formGender,
            dob: formDob || s.dob,
            enrollmentDate: formEnrollmentDate || s.enrollmentDate,
            phoneNumber: formPhone.trim() || s.phoneNumber,
            photo: formPhoto || s.photo,
            grade: formGrade,
            responsibleLocation: formResponsibleLocation.trim()
          };
        }
        return s;
      });
      setStudentList(updatedList);
      setIsFormOpen(false);
      resetForm();
      showNotice(isKh 
        ? `ជោគជ័យ! បានកែសម្រួលព័ត៌មានសិស្សឈ្មោះ ៖ ${formName.trim()} រួចរាល់ដោយជោគជ័យ។`
        : `Success! Student ${formName.trim()} has been updated successfully.`
      );
    } else {
      // Create new
      let exists = studentList.some(s => s.studentId === finalStudentId);
      if (exists) {
        let counter = 1;
        const baseId = finalStudentId;
        while (exists) {
          finalStudentId = `${baseId}-${counter}`;
          exists = studentList.some(s => s.studentId === finalStudentId);
          counter++;
        }
      }

      const newStudent: Student = {
        id: finalStudentId,
        no: studentList.length + 1,
        studentId: finalStudentId,
        name: formName.trim(),
        gender: formGender,
        dob: formDob || '2015-01-01',
        enrollmentDate: formEnrollmentDate || '',
        phoneNumber: formPhone.trim() || 'N/A',
        photo: formPhoto,
        grade: formGrade,
        responsibleLocation: formResponsibleLocation.trim()
      };

      setStudentList([...studentList, newStudent]);

      if (keepAndAddMore) {
        setLastInsertedStudent({ name: formName.trim(), studentId: finalStudentId });
        setFormName('');
        setFormPhone('');
        setFormPhoto('');
        setFormDob('');
        setFormEnrollmentDate('');
        setFormResponsibleLocation('');

        const nextId = generateUniqueStudentId(formGrade, [finalStudentId]);
        setFormStudentId(nextId);

        setTimeout(() => {
          nameInputRef.current?.focus();
        }, 100);
      } else {
        setIsFormOpen(false);
        resetForm();
        showNotice(isKh 
          ? `ជោគជ័យ! បានបញ្ចូលសិស្សថ្មីឈ្មោះ ៖ ${newStudent.name} (លេខសម្គាល់ ៖ ${newStudent.studentId}) ទៅក្នុងប្រព័ន្ធដោយរលូន និងជោគជ័យ។`
          : `Success! New student ${newStudent.name} (ID: ${newStudent.studentId}) has been successfully registered.`
        );
      }
    }
  };

  // Bulk batch submission (Save multiple rows at once)
  const handleSaveBulkStudent = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filledRows = bulkRows.filter(row => row.name.trim() !== '');
    if (filledRows.length === 0) {
      showNotice(isKh ? 'សូមបំពេញឈ្មោះសិស្សយ៉ាងតិច ១ នាក់នៅក្នុងតារាង!' : 'Please enter at least 1 student name!', 'error');
      return;
    }

    const updatedList = [...studentList];
    const temporaryGeneratedIds: string[] = [];

    filledRows.forEach((row) => {
      const finalId = generateUniqueStudentId(row.grade, temporaryGeneratedIds);
      temporaryGeneratedIds.push(finalId);

      const newStudent: Student = {
        id: finalId,
        no: updatedList.length + 1,
        studentId: finalId,
        name: row.name.trim(),
        gender: row.gender,
        dob: row.dob || '2015-01-01',
        enrollmentDate: row.enrollmentDate || '2026-01-01',
        phoneNumber: row.phoneNumber.trim() || 'N/A',
        photo: '', // Bypasses photo for speed in bulk registration
        grade: row.grade,
      };

      updatedList.push(newStudent);
    });

    setStudentList(updatedList);
    setIsFormOpen(false);

    setBulkRows([
      createEmptyBulkRow('Grade 1'),
      createEmptyBulkRow('Grade 1'),
      createEmptyBulkRow('Grade 1'),
      createEmptyBulkRow('Grade 1'),
      createEmptyBulkRow('Grade 1'),
    ]);

    showNotice(isKh 
      ? `ជោគជ័យ! បញ្ចូលសិស្សថ្មីចំនួន ${filledRows.length} នាក់ ដោយរលូន និងរហ័សបំផុត។`
      : `Success! Added ${filledRows.length} students smoothly and quickly.`
    );
  };

  const handleBulkRowChange = (index: number, key: keyof BulkRow, val: any) => {
    const updated = [...bulkRows];
    updated[index] = { ...updated[index], [key]: val };
    setBulkRows(updated);
  };

  const handleRemoveBulkRow = (index: number) => {
    if (bulkRows.length <= 1) {
      showNotice(isKh ? 'ត្រូវរក្សាទុកយ៉ាងហោចណាស់ ១ ជួរ!' : 'Must keep at least 1 row!', 'error');
      return;
    }
    setBulkRows(bulkRows.filter((_, idx) => idx !== index));
  };

  const handleAddBulkRow = () => {
    const lastGrade = bulkRows[bulkRows.length - 1]?.grade || 'Grade 1';
    setBulkRows([...bulkRows, createEmptyBulkRow(lastGrade)]);
  };

  const handleApplyBulkPaste = () => {
    if (!bulkPasteText.trim()) {
      showNotice(isKh ? 'សូមបញ្ចូល ឬបិទភ្ជាប់ឈ្មោះជាមុនសិន!' : 'Please paste or enter names first!', 'error');
      return;
    }
    const names = bulkPasteText
      .split(/[\n,;]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (names.length === 0) {
      showNotice(isKh ? 'រកមិនឃើញឈ្មោះណាមួយឡើយ!' : 'No valid names found!', 'error');
      return;
    }

    const lastGrade = bulkRows[bulkRows.length - 1]?.grade || 'Grade 1';
    const newRows = names.map(name => ({
      ...createEmptyBulkRow(lastGrade),
      name: name
    }));

    const hasOnlyEmptyDefaultRows = bulkRows.every(r => r.name.trim() === '');
    if (hasOnlyEmptyDefaultRows) {
      setBulkRows(newRows);
    } else {
      setBulkRows([...bulkRows.filter(r => r.name.trim() !== ''), ...newRows]);
    }

    setBulkPasteText('');
    showNotice(isKh 
      ? `បានបិទភ្ជាប់ និងបន្ថែមចំនួន ${names.length} ជួរដោយជោគជ័យ! សូមពិនិត្យព័ត៌មានលម្អិតបន្ថែមមុនពេលចុចរក្សាទុក។`
      : `Successfully added ${names.length} rows! Please check details and save.`
    );
  };

  // DELETE single student
  const handleDeleteStudent = () => {
    if (!deleteTarget) return;
    const filtered = studentList.filter(s => s.id !== deleteTarget.id);
    
    // Reorder 'no' column neatly
    const neatList = filtered.map((s, idx) => ({
      ...s,
      no: idx + 1
    }));
    
    setStudentList(neatList);
    setDeleteTarget(null);
    showNotice(isKh ? 'បានលុបទិន្នន័យសិស្ស រួចរាល់។' : 'Student record has been deleted.');
  };

  // EXCEL Import Handler
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImportError(null);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          if (!data) throw new Error('No data');
          
          const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json<any>(sheet);
          
          const parsed: Student[] = [];
          
          json.forEach((row, idx) => {
            let nameVal = '';
            let sidVal = '';
            let genderVal: 'ប្រុស' | 'ស្រី' = 'ប្រុស';
            let dobVal = '';
            let enrollVal = '';
            let phoneVal = '';
            let locVal = '';

            for (const key of Object.keys(row)) {
              const cleanKey = key.trim().toLowerCase();
              const val = row[key];

              if (cleanKey === 'name' || cleanKey === 'ឈ្មោះ' || cleanKey === 'ឈ្មោះសិស្ស') {
                nameVal = String(val).trim();
              } else if (cleanKey === 'student id' || cleanKey === 'id' || cleanKey === 'លេខសម្គាល់' || cleanKey === 'អត្តសញ្ញាណប័ណ្ណ') {
                sidVal = String(val).trim();
              } else if (cleanKey === 'gender' || cleanKey === 'sex' || cleanKey === 'ភេទ') {
                const sex = String(val).trim().toLowerCase();
                genderVal = (sex === 'ស្រី' || sex === 'female' || sex === 'f') ? 'ស្រី' : 'ប្រុស';
              } else if (cleanKey === 'dob' || cleanKey === 'ngày sinh' || cleanKey === 'ថ្ងៃខែឆ្នាំកំណើត') {
                dobVal = val instanceof Date ? val.toISOString().split('T')[0] : String(val).trim();
              } else if (cleanKey === 'join' || cleanKey === 'enrollment date' || cleanKey === 'ថ្ងៃចូលរៀន') {
                enrollVal = val instanceof Date ? val.toISOString().split('T')[0] : String(val).trim();
              } else if (cleanKey === 'phone' || cleanKey === 'លេខទូរស័ព្ទ' || cleanKey === 'លេខទូរស័ព្ទអាណាព្យាបាល') {
                phoneVal = String(val).trim();
              } else if (cleanKey === 'room' || cleanKey === 'location' || cleanKey === 'classroom' || cleanKey === 'បន្ទប់' || cleanKey === 'បន្ទប់រៀន') {
                locVal = String(val).trim();
              }
            }

            if (nameVal) {
              const sid = sidVal || `WIS-STU-${Math.floor(1000 + Math.random() * 9000)}`;
              parsed.push({
                id: sid,
                no: studentList.length + parsed.length + 1,
                studentId: sid,
                name: nameVal,
                gender: genderVal,
                dob: dobVal || '2015-01-01',
                enrollmentDate: enrollVal || '',
                phoneNumber: phoneVal || 'N/A',
                photo: '',
                grade: importGrade,
                responsibleLocation: locVal || undefined
              });
            }
          });

          if (parsed.length === 0) {
            showNotice(isKh ? 'រកមិនឃើញទិន្នន័យសិស្សដែលមានសុពលភាពទេ!' : 'No valid student data found in spreadsheet!', 'error');
            return;
          }

          setStudentList([...studentList, ...parsed]);
          showNotice(isKh 
            ? `បានបញ្ចូលសិស្សចំនួន ${parsed.length} នាក់ពីឯកសារ Excel ដោយជោគជ័យ!`
            : `Successfully imported ${parsed.length} students from Excel file!`
          );
        } catch (err: any) {
          setImportError(err.message || 'Error parsing file');
        }
      };

      reader.readAsBinaryString(file);
    } catch (err: any) {
      setImportError(err.message || 'Error reading file');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // EXCEL Export Handler
  const handleExportExcel = () => {
    const list = selectedGrade === 'All' 
      ? studentList 
      : studentList.filter(s => s.grade === selectedGrade);

    if (list.length === 0) {
      showNotice(isKh ? 'គ្មានទិន្នន័យសម្រាប់ធ្វើការនាំចេញឡើយ!' : 'No data to export!', 'error');
      return;
    }

    const data = list.map((s, index) => ({
      'ល.រ (No)': index + 1,
      'លេខសម្គាល់សិស្ស (Student ID)': s.studentId,
      'ឈ្មោះសិស្ស (Student Name)': s.name,
      'ភេទ (Gender)': s.gender,
      'ថ្ងៃខែឆ្នាំកំណើត (DOB)': s.dob,
      'ថ្ងៃចូលរៀន (Enrollment Date)': s.enrollmentDate || 'N/A',
      'លេខទូរស័ព្ទអាណាព្យាបាល (Parent Phone)': s.phoneNumber,
      'ថ្នាក់រៀន (Grade)': GRADE_NAMES_KM[s.grade] || s.grade,
      'បន្ទប់រៀន (Classroom)': s.responsibleLocation || 'គ្មាន'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'បញ្ជីសិស្ស');
    XLSX.writeFile(workbook, `WIS_Student_List_${selectedGrade}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // PDF Export Handler
  const handleExportPdf = () => {
    const list = selectedGrade === 'All' 
      ? studentList 
      : studentList.filter(s => s.grade === selectedGrade);

    if (list.length === 0) {
      showNotice(isKh ? 'គ្មានទិន្នន័យសម្រាប់ធ្វើការនាំចេញឡើយ!' : 'No data to export!', 'error');
      return;
    }

    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    // Brand header styles
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 15, 'F');
    doc.setFillColor(245, 158, 11); // Golden orange amber line for students
    doc.rect(0, 15, 210, 2, 'F');
    
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.text('WESTERN INTERNATIONAL SCHOOL', 14, 10);
    
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(16);
    doc.text(`STUDENT DIRECTORY - ${selectedGrade.toUpperCase()}`, 14, 28);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.text(`Total Students: ${list.length}`, 14, 40);
    
    const showGradeCol = selectedGrade === 'All';
    const columns = [
      'No', 
      'Student ID', 
      'Student Name', 
      'Gender', 
      'Date of Birth', 
      'Enrollment Date', 
      'Parent Contact', 
      ...(showGradeCol ? ['Grade'] : []), 
      'Classroom'
    ];

    const rows = list.map((s, idx) => {
      const dataRow = [
        idx + 1,
        s.studentId,
        transliterateKhmerToLatin(s.name),
        s.gender === 'ស្រី' ? 'Female' : 'Male',
        s.dob,
        s.enrollmentDate || '-',
        s.phoneNumber,
      ];
      if (showGradeCol) {
        dataRow.push(s.grade);
      }
      dataRow.push(s.responsibleLocation ? transliterateKhmerToLatin(s.responsibleLocation) : '-');
      return dataRow;
    });

    const colStyles = showGradeCol ? {
      0: { cellWidth: 8 },
      1: { cellWidth: 22 },
      2: { cellWidth: 32 },
      3: { cellWidth: 14 },
      4: { cellWidth: 22 },
      5: { cellWidth: 22 },
      6: { cellWidth: 26 },
      7: { cellWidth: 26 },
      8: { cellWidth: 18 }
    } : {
      0: { cellWidth: 10 },
      1: { cellWidth: 26 },
      2: { cellWidth: 38 },
      3: { cellWidth: 16 },
      4: { cellWidth: 26 },
      5: { cellWidth: 26 },
      6: { cellWidth: 30 },
      7: { cellWidth: 18 }
    };

    doc.autoTable({
      startY: 46,
      head: [columns],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, font: 'Helvetica', overflow: 'linebreak' },
      columnStyles: colStyles
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(10);
    doc.text('Prepared By:', 14, finalY + 20);
    doc.text('__________________', 14, finalY + 30);
    doc.text('Registrar / Admin Supervisor', 14, finalY + 35);
    
    doc.text('Approved By:', 140, finalY + 20);
    doc.text('__________________', 140, finalY + 30);
    doc.text('School Principal', 140, finalY + 35);

    doc.save(`WIS_Students_${selectedGrade}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Attachments Subsystem Logic
  const handleOpenAttachments = (student: Student) => {
    setSelectedStudentForAttachments(student);
    setIsAttachmentModalOpen(true);
    setLinkTitle('');
    setLinkUrl('');
    setPreviewingAttachment(null);
    setDeleteAttachmentTarget(null);
  };

  const handleUploadAttachmentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStudentForAttachments) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      
      const newFileObj = {
        id: `att_${Date.now()}`,
        name: file.name,
        size: `${sizeMb} MB`,
        type: file.type || 'application/octet-stream',
        dataUrl: dataUrl
      };

      const updatedAttachments = [
        ...(selectedStudentForAttachments.attachments || []),
        newFileObj
      ];

      const updatedStudent = {
        ...selectedStudentForAttachments,
        attachments: updatedAttachments
      };

      // update global items list
      const newList = studentList.map(s => {
        if (s.id === selectedStudentForAttachments.id) {
          return updatedStudent;
        }
        return s;
      });

      setStudentList(newList);
      setSelectedStudentForAttachments(updatedStudent);
      alert(isKh ? 'បានបញ្ចូលឯកសារយោងដោយជោគជ័យ។' : 'Document uploaded successfully.');
    };

    reader.readAsDataURL(file);
    if (attachmentFileInputRef.current) attachmentFileInputRef.current.value = '';
  };

  const handleAddAttachmentLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim() || !selectedStudentForAttachments) return;

    let formattedUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newLinkObj = {
      id: `link_${Date.now()}`,
      name: linkTitle.trim(),
      size: 'Web Link',
      type: 'text/html',
      dataUrl: formattedUrl
    };

    const updatedAttachments = [
      ...(selectedStudentForAttachments.attachments || []),
      newLinkObj
    ];

    const updatedStudent = {
      ...selectedStudentForAttachments,
      attachments: updatedAttachments
    };

    const newList = studentList.map(s => {
      if (s.id === selectedStudentForAttachments.id) {
        return updatedStudent;
      }
      return s;
    });

    setStudentList(newList);
    setSelectedStudentForAttachments(updatedStudent);
    setLinkTitle('');
    setLinkUrl('');
    alert(isKh ? 'បានរៀបចំតំណភ្ជាប់ឯកសារស្រាវជ្រាវដោយជោគជ័យ។' : 'Link stored successfully.');
  };

  const handleDeleteAttachment = () => {
    if (!deleteAttachmentTarget || !selectedStudentForAttachments) return;

    const filtered = (selectedStudentForAttachments.attachments || []).filter(
      a => a.id !== deleteAttachmentTarget.id
    );

    const updatedStudent = {
      ...selectedStudentForAttachments,
      attachments: filtered
    };

    const newList = studentList.map(s => {
      if (s.id === selectedStudentForAttachments.id) {
        return updatedStudent;
      }
      return s;
    });

    setStudentList(newList);
    setSelectedStudentForAttachments(updatedStudent);
    setDeleteAttachmentTarget(null);
    if (previewingAttachment?.id === deleteAttachmentTarget.id) {
      setPreviewingAttachment(null);
    }
    alert(isKh ? 'បានលុបឯកសារចោលរួចរាល់' : 'Attachment deleted.');
  };

  // Searching & Filtering dataset
  const filteredStudents = studentList.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.studentId.toLowerCase().includes(search.toLowerCase()) ||
      student.phoneNumber.toLowerCase().includes(search.toLowerCase()) ||
      (student.responsibleLocation || '').toLowerCase().includes(search.toLowerCase());

    const matchesGrade = selectedGrade === 'All' || student.grade === selectedGrade;
    const matchesGender = selectedGender === 'All' || student.gender === selectedGender;

    return matchesSearch && matchesGrade && matchesGender;
  });

  return (
    <div className="space-y-6">
      {/* Banner / Title Row */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-moul leading-relaxed tracking-normal text-slate-800">
              {isKh ? 'គ្រប់គ្រងសិស្ស' : 'Student Management'}
            </h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">
              {isKh 
                ? 'បញ្ជីឈ្មោះសិស្ស ថ្នាក់ កាលបរិច្ឆេទចុះឈ្មោះ ប្រវត្តិរូប និងឯកសារយោង' 
                : 'Student list, grades, enrollment details, files and credentials'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Action buttons */}
          <button 
            onClick={openAddForm}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl font-extrabold text-xs transition duration-200 inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>{isKh ? 'ចុះឈ្មោះសិស្សថ្មី' : 'Enroll New Student'}</span>
          </button>

          <button 
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition duration-200 inline-flex items-center gap-2 shadow-xs cursor-pointer"
            title="Export labels grid to Microsoft Excel Sheet"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>EXCEL</span>
          </button>

          <button 
            onClick={handleExportPdf}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs transition duration-200 inline-flex items-center gap-2 shadow-xs cursor-pointer"
            title="Export clean list layout representation to print PDF"
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Database control section - Search, Import, Filter */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Real-time search query */}
          <div className="flex-1 max-w-lg relative">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder={isKh ? "ស្វែងរកសិស្ស បន្ទប់ លេខកូដ ឬទូរស័ព្ទ..." : "Search student, ID, class location..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10.5 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-700 placeholder-slate-400 border border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 rounded-xl text-xs font-bold transition duration-200 outline-none"
            />
          </div>

          {/* Inline Excel Importer */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50/70 py-1.5 px-3 rounded-lg border border-slate-200/60">
              <span className="text-[10px] font-extrabold text-slate-500">
                {isKh ? 'នាំចូលទៅ ៖' : 'Import Target Grade:'}
              </span>
              <select 
                value={importGrade} 
                onChange={(e) => setImportGrade(e.target.value as StudentGrade)}
                className="bg-transparent border-none text-[10px] font-black text-slate-700 py-0 pr-6 pl-0 outline-none cursor-pointer focus:ring-0"
              >
                {ALL_GRADES.map((g) => (
                  <option key={g} value={g}>{GRADE_NAMES_KM[g]}</option>
                ))}
              </select>
            </div>

            <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl font-black text-xs transition duration-200 inline-flex items-center gap-2 cursor-pointer shadow-3xs">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>{isKh ? 'បញ្ចូលឯកសារសៀវភៅ Excel' : 'Import Excel Sheet'}</span>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept=".xlsx,.xls" 
                onChange={handleImportExcel} 
                className="hidden" 
              />
            </label>
          </div>
        </div>

        {importError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        {/* Filters Select row */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
            <Filter className="w-4 h-4" />
            <span>{isKh ? 'តម្រងស្វែងរក ៖' : 'Filters:'}</span>
          </div>

          {/* Grade filter */}
          <select 
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value as any)}
            className="bg-slate-50/85 hover:bg-slate-100 text-slate-600 border border-slate-200/80 rounded-lg py-1 px-2.5 text-xs font-extrabold cursor-pointer transition focus:ring-0"
          >
            <option value="All">{isKh ? 'គ្រប់កម្រិតថ្នាក់ទាំងអស់' : 'All Grades'}</option>
            {ALL_GRADES.map((g) => (
              <option key={g} value={g}>{GRADE_NAMES_KM[g]}</option>
            ))}
          </select>

          {/* Gender Filter */}
          <select 
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value as any)}
            className="bg-slate-50/85 hover:bg-slate-100 text-slate-600 border border-slate-200/80 rounded-lg py-1 px-2.5 text-xs font-extrabold cursor-pointer transition focus:ring-0"
          >
            <option value="All">{isKh ? 'គ្រប់ភេទ' : 'All Genders'}</option>
            <option value="ប្រុស">{isKh ? 'ភេទ ប្រុស' : 'Male'}</option>
            <option value="ស្រី">{isKh ? 'ភេទ ស្រី' : 'Female'}</option>
          </select>

          {/* Clear filters trigger */}
          {(search || selectedGrade !== 'All' || selectedGender !== 'All') && (
            <button 
              onClick={() => {
                setSearch('');
                setSelectedGrade('All');
                setSelectedGender('All');
              }}
              className="text-amber-600 hover:text-amber-700 text-xs font-extrabold flex items-center gap-1 cursor-pointer ml-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isKh ? 'សម្អាតតម្រង' : 'Clear Filters'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Student Table Area */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-extrabold text-[11px] uppercase tracking-wider border-b border-slate-100">
                <th className="py-4 px-5 text-center w-14">ล.ร (No)</th>
                <th className="py-4 px-4 w-40">{isKh ? 'អត្តសញ្ញាណប័ណ្ណ' : 'Student ID'}</th>
                <th className="py-4 px-4 w-52">{isKh ? 'រូបថត & ឈ្មោះពេញ' : 'Photo & Full Name'}</th>
                <th className="py-4 px-4 w-24 text-center">{isKh ? 'ភេទ' : 'Gender'}</th>
                <th className="py-4 px-4 w-32">{isKh ? 'កាលបរិច្ឆេទកំណើត' : 'Birth Date'}</th>
                <th className="py-4 px-4 w-36">{isKh ? 'ថ្នាក់សិក្សា' : 'Grade Level'}</th>
                <th className="py-4 px-4 w-36">{isKh ? 'បន្ទប់រៀន / ទីតាំង' : 'Classroom'}</th>
                <th className="py-4 px-4 w-36">{isKh ? 'ទូរស័ព្ទអាណាព្យាបាល' : 'Parent Contact'}</th>
                <th className="py-4 px-4 text-center w-28">{isKh ? 'ឯកសារយោង' : 'Files'}</th>
                <th className="py-4 px-5 text-right w-36">{isKh ? 'សកម្មភាព' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/40 transition">
                    <td className="py-3 px-5 text-center text-slate-405 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 bg-amber-50 px-2 py-1 rounded-md text-[11px] border border-amber-200/50">
                        {student.studentId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {/* Profile Picture */}
                        {student.photo ? (
                          <img 
                            src={student.photo} 
                            alt={student.name}
                            className="w-9 h-11 object-cover rounded-md border border-slate-200 bg-slate-100"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-9 h-11 rounded-md bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-black text-xs">
                            {getInitialsAvatar(student.name)}
                          </div>
                        )}
                        <span className="font-extrabold text-slate-850 truncate max-w-[200px]" title={student.name}>
                          {student.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        student.gender === 'ស្រី' || student.gender === 'Female'
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {student.gender === 'ស្រី' || student.gender === 'Female' ? (isKh ? 'ស្រី' : 'F') : (isKh ? 'ប្រុស' : 'M')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {student.dob}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-amber-700">
                      {GRADE_NAMES_KM[student.grade] || student.grade}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-600 font-bold">
                        {student.responsibleLocation || (isKh ? 'មិនទាន់កំណត់' : 'Not assigned')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {student.phoneNumber}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {/* Attachments trigger button with count badge */}
                      <button 
                        onClick={() => handleOpenAttachments(student)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition cursor-pointer ${
                          student.attachments && student.attachments.length > 0
                            ? 'bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700'
                            : 'bg-slate-100 border border-transparent hover:bg-slate-200 text-slate-500'
                        }`}
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{student.attachments?.length || 0}</span>
                      </button>
                    </td>
                    <td className="py-3 px-5 text-right space-x-1.5">
                      {/* Action trigger group buttons */}
                      <button 
                        onClick={() => openEditForm(student)}
                        className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50/50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                        title="Edit profile information details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => setDeleteTarget({ id: student.id, name: student.name, studentId: student.studentId })}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                        title="Remove student data instantly"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-xs">{isKh ? 'មិនអាចរកឃើញទិន្នន័យសិស្សឡើយ!' : 'No student records found!'}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{isKh ? 'សូមព្យាយាមវាយស្វែងរកឈ្មោះផ្សេង ឬចុចបន្ថែមសិស្សថ្មី' : 'Try searching for other keywords or add a new record.'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD / UPDATE STUDENT FORM CONTAINER */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100"
            >
              {/* Header block with interactive style tabs */}
              <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5.5 h-5.5 text-amber-400" />
                  <h3 className="font-moul text-xs text-white leading-relaxed">
                    {editingStudentId 
                      ? (isKh ? 'កែសម្រួលព័ត៌មានសិស្ស' : 'Edit Student Details')
                      : (isKh ? 'ចុះឈ្មោះសិស្សថ្មី' : 'Register New Student')}
                  </h3>
                </div>

                {/* Single/Bulk options selector tabs */}
                {!editingStudentId && (
                  <div className="flex bg-[#111827] p-1 border border-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setEntryMode('single')}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition ${
                        entryMode === 'single'
                          ? 'bg-amber-400 text-slate-900'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {isKh ? 'បញ្ចូលម្តងម្នាក់' : 'Single Entry'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryMode('bulk')}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition ${
                        entryMode === 'bulk'
                          ? 'bg-amber-400 text-slate-900'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {isKh ? 'បញ្ចូលលឿនច្រើននាក់' : 'Bulk Fast Entry'}
                    </button>
                  </div>
                )}
                
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer self-end sm:self-auto"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body blocks */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                
                {/* 1. SINGLE INPUT SCHEMATIC ENTRY FIELD */}
                {entryMode === 'single' && (
                  <form onSubmit={handleSaveStudent} className="space-y-4">
                    {lastInsertedStudent && (
                      <div className="bg-emerald-50 text-emerald-800 font-bold p-3 text-xs rounded-xl border border-emerald-100 flex items-center gap-2 animate-pulse">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>
                          {isKh 
                            ? `បានបញ្ចូល ${lastInsertedStudent.name} (លេខសម្គាល់ ៖ ${lastInsertedStudent.studentId}) ដោយជោគជ័យ!`
                            : `Added ${lastInsertedStudent.name} (ID: ${lastInsertedStudent.studentId}) successfully! Ready for next.`}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Photo upload view column (Left Side) */}
                      <div className="flex flex-col items-center gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60">
                        <span className="text-[10px] uppercase font-black text-slate-400 self-start">
                          {isKh ? 'រូបថតសិស្ស (4*6)' : 'Student Photo (4x6)'}
                        </span>

                        <div className="relative group w-32 h-44 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-3xs flex items-center justify-center">
                          {isCompressing ? (
                            <div className="inset-0 absolute bg-slate-900/40 flex flex-col items-center justify-center text-white text-[11px] font-black gap-2">
                              <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>{isKh ? 'កំពុងបង្រួម...' : 'Compressing...'}</span>
                            </div>
                          ) : formPhoto ? (
                            <>
                              <img 
                                src={formPhoto} 
                                alt="Student preview" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                              <button 
                                type="button" 
                                onClick={() => setFormPhoto('')}
                                className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition duration-200 shadow-xs cursor-pointer"
                                title="Remove photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1.5 text-slate-300">
                              <Camera className="w-10 h-10 stroke-[1.2]" />
                              <span className="text-[10px] font-bold text-slate-400">{isKh ? 'គ្មានរូបថត' : 'No Photo'}</span>
                            </div>
                          )}
                          
                          {/* Photo Input Trigger Tag */}
                          {!isCompressing && (
                            <label className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition duration-200 cursor-pointer flex flex-col items-center justify-center text-white text-[10px] font-extrabold gap-1">
                              <Upload className="w-4 h-4" />
                              <span>{formPhoto ? (isKh ? 'ប្តូររូបភាព' : 'Change Icon') : (isKh ? 'បញ្ចូលរូបភាព' : 'Upload Icon')}</span>
                              <input 
                                ref={photoInputRef}
                                type="file" 
                                accept="image/*" 
                                onChange={handlePhotoUpload} 
                                className="hidden" 
                              />
                            </label>
                          )}
                        </div>

                        {formPhoto && (
                          <button 
                            type="button" 
                            onClick={() => photoInputRef.current?.click()}
                            className="text-amber-600 hover:text-amber-700 text-[10px] font-black underline cursor-pointer"
                          >
                            {isKh ? 'ជ្រើសរើសរូបថតផ្សេង' : 'Choose another photo'}
                          </button>
                        )}
                        <span className="text-[9px] text-slate-450 text-center font-bold">
                          {isKh 
                            ? 'ផ្តល់អនុសាសន៍ដើម្បីបញ្ចូលកម្រិតទំហំរូបថត 4*6 កាត់តម្រឹមស្អាតរួចជាស្រេច' 
                            : 'Recommended: Upload cropped 4x6 photo for best results'}
                        </span>
                      </div>

                      {/* Detail inputs grid table column (Right Side) */}
                      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Student ID Code */}
                        <div className="space-y-1">
                          <label className="block text-xs font-black text-slate-500">
                            {isKh ? 'លេខសម្គាល់សិស្ស (Student ID)' : 'Student ID'} <span className="text-amber-500">*</span>
                          </label>
                          <input 
                            type="text" 
                            value={formStudentId}
                            onChange={(e) => setFormStudentId(e.target.value)}
                            placeholder="e.g. WIS-GR1-001"
                            className="w-full px-3.5 py-2 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-400 focus:ring-3 focus:ring-amber-500/10 rounded-xl text-xs font-bold transition duration-200 outline-none uppercase"
                          />
                        </div>

                        {/* Full Name */}
                        <div className="space-y-1">
                          <label className="block text-xs font-black text-slate-500">
                            {isKh ? 'ឈ្មោះពេញសិស្ស' : 'Full Name'} <span className="text-rose-500">*</span>
                          </label>
                          <input 
                            ref={nameInputRef}
                            type="text" 
                            required
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder={isKh ? "បំពេញគោត្តនាម និងនាមខ្លួន..." : "Enter full student name..."}
                            className="w-full px-3.5 py-2 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-400 focus:ring-3 focus:ring-amber-500/10 rounded-xl text-xs font-bold transition duration-200 outline-none"
                          />
                        </div>

                        {/* Gender selection */}
                        <div className="space-y-1">
                          <label className="block text-xs font-black text-slate-500">
                            {isKh ? 'ភេទ (Gender)' : 'Gender'} <span className="text-rose-500">*</span>
                          </label>
                          <div className="flex bg-slate-100 p-1 border rounded-xl gap-1">
                            <button
                              type="button"
                              onClick={() => setFormGender('ប្រុស')}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-black text-center transition cursor-pointer ${
                                formGender === 'ប្រុស'
                                  ? 'bg-white text-blue-600 shadow-3xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              {isKh ? 'ប្រុស' : 'Male'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormGender('ស្រី')}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-black text-center transition cursor-pointer ${
                                formGender === 'ស្រី'
                                  ? 'bg-white text-rose-600 shadow-3xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              {isKh ? 'ស្រី' : 'Female'}
                            </button>
                          </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-1">
                          <label className="block text-xs font-black text-slate-500">
                            {isKh ? 'ថ្ងៃខែឆ្នាំកំណើត' : 'Date of Birth'}
                          </label>
                          <input 
                            type="date" 
                            value={formDob}
                            onChange={(e) => setFormDob(e.target.value)}
                            className="w-full px-3.5 py-2 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-400 focus:ring-3 focus:ring-amber-500/10 rounded-xl text-xs font-mono font-bold transition duration-200 outline-none text-slate-705"
                          />
                        </div>

                        {/* Enrollment Grade level selection */}
                        <div className="space-y-1">
                          <label className="block text-xs font-black text-slate-500">
                            {isKh ? 'កម្រិតថ្នាក់សិក្សា' : 'Current Grade'} <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={formGrade}
                            onChange={(e) => {
                              const newG = e.target.value as StudentGrade;
                              setFormGrade(newG);
                              // Auto regenerate sequentially if adding a new student
                              if (!editingStudentId) {
                                setFormStudentId(generateUniqueStudentId(newG));
                              }
                            }}
                            className="w-full px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 focus:border-amber-400 focus:ring-3 focus:ring-amber-500/10 rounded-xl text-xs font-extrabold transition duration-200 outline-none text-slate-700 cursor-pointer"
                          >
                            {ALL_GRADES.map(g => (
                              <option key={g} value={g}>{GRADE_NAMES_KM[g]}</option>
                            ))}
                          </select>
                        </div>

                        {/* Student Classroom details */}
                        <div className="space-y-1">
                          <label className="block text-xs font-black text-slate-500">
                            {isKh ? 'ទីតាំងបន្ទប់រៀន (Classroom Room)' : 'Classroom / Location'}
                          </label>
                          <input 
                            type="text" 
                            value={formResponsibleLocation}
                            onChange={(e) => setFormResponsibleLocation(e.target.value)}
                            placeholder={isKh ? "បន្ទប់រៀន e.g. RC-102" : "Room label, e.g. RC-102"}
                            className="w-full px-3.5 py-2 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-400 focus:ring-3 focus:ring-amber-500/10 rounded-xl text-xs font-bold transition duration-200 outline-none"
                          />
                        </div>

                        {/* Guardian Contact Number */}
                        <div className="space-y-1">
                          <label className="block text-xs font-black text-slate-500">
                            {isKh ? 'លេខទូរស័ព្ទអាណាព្យាបាល (Parent Phone)' : 'Guardian Phone'} <span className="text-rose-500">*</span>
                          </label>
                          <input 
                            type="text" 
                            required
                            value={formPhone}
                            onChange={(e) => setFormPhone(e.target.value)}
                            placeholder="e.g. 010 123 456"
                            className="w-full px-3.5 py-2 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-400 focus:ring-3 focus:ring-amber-500/10 rounded-xl text-xs font-mono font-bold transition duration-200 outline-none text-slate-700"
                          />
                        </div>

                        {/* Date of Join / Enrollment */}
                        <div className="space-y-1">
                          <label className="block text-xs font-black text-slate-500">
                            {isKh ? 'ថ្ងៃខែឆ្នាំចូលរៀន (Enrollment Date)' : 'Enrollment Date'}
                          </label>
                          <input 
                            type="date" 
                            value={formEnrollmentDate}
                            onChange={(e) => setFormEnrollmentDate(e.target.value)}
                            className="w-full px-3.5 py-2 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-400 focus:ring-3 focus:ring-amber-500/10 rounded-xl text-xs font-mono font-bold transition duration-200 outline-none text-slate-700"
                          />
                        </div>

                      </div>

                    </div>

                    {/* Bottom Action trigger footer buttons */}
                    <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                      
                      {!editingStudentId ? (
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={keepAndAddMore}
                            onChange={(e) => setKeepAndAddMore(e.target.checked)}
                            className="rounded-sm border-slate-300 text-amber-500 focus:ring-amber-500/20 w-4 h-4 cursor-pointer"
                          />
                          <span className="text-xs text-slate-500 font-extrabold group-hover:text-amber-600 transition">
                            {isKh ? 'រក្សាទុក រួចចុះសិស្សម្នាក់ទៀតបន្តបន្ទាប់' : 'Keep open & Enroll more continuously'}
                          </span>
                        </label>
                      ) : <div />}

                      <div className="flex items-center gap-2 ml-auto">
                        <button 
                          type="button" 
                          onClick={() => setIsFormOpen(false)}
                          className="px-4 py-2 hover:bg-slate-100 transition border border-slate-200 rounded-xl text-slate-500 font-extrabold text-xs cursor-pointer"
                        >
                          {isKh ? 'បោះបង់' : 'Cancel'}
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 border border-transparent rounded-xl font-black text-xs transition duration-200 cursor-pointer shadow-3xs"
                        >
                          {editingStudentId ? (isKh ? 'កែប្រែព័ត៌មាន' : 'Save Changes') : (isKh ? 'រក្សាទុកសិស្ស' : 'Register Student')}
                        </button>
                      </div>

                    </div>

                  </form>
                )}

                {/* 2. BULK BATCH INTERACTIVE GRID SPREADSHEET */}
                {entryMode === 'bulk' && !editingStudentId && (
                  <form onSubmit={handleSaveBulkStudent} className="space-y-6">
                    
                    {/* Raw Paste Textbox area */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500 space-y-3">
                      <div className="flex items-center gap-2 font-black text-slate-700 text-[11px]">
                        <BookOpen className="w-4 h-4 text-amber-600" />
                        <span>{isKh ? 'របៀបបិទភ្ជាប់ស្វ័យប្រវត្តិកូដច្រើនជួរ سريع (Fast Autofill Names)' : 'Autofill Names Block'}</span>
                      </div>
                      <p className="text-[10px] text-slate-450 leading-relaxed font-bold">
                        {isKh 
                          ? 'សូមចម្លងបញ្ជីឈ្មោះសិស្សពី Excel ឬឯកសារ text រួចបិទភ្ជាប់ក្នុងប្រអប់ខាងក្រោម (បំបែកដោយការចុះបន្ទាត់ ឬសញ្ញាក្បៀស)។ ប្រព័ន្ធនឹងរៀបចំបង្កើតជួរស្វ័យប្រវត្តិ។' 
                          : 'Copy a list of student names from Excel, Notepad or any other app, paste them below separated by breaks or commas, and press Apply.'}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <textarea
                          rows={2}
                          value={bulkPasteText}
                          onChange={(e) => setBulkPasteText(e.target.value)}
                          placeholder={isKh ? "ឧទាហរណ៍ ៖\nសុខ ចន្ថា\nកែវ រតនា\nទូច សំបូរ" : "Example:\nSok Chantha\nKeo Rotana\nTouch Sambor"}
                          className="flex-1 px-3 py-2 bg-white text-slate-700 placeholder-slate-400 border border-slate-205 focus:border-amber-400 rounded-xl text-xs font-bold transition outline-none resize-none"
                        />
                        <button
                          type="button"
                          onClick={handleApplyBulkPaste}
                          className="px-4 py-4 shrink-0 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition duration-150 cursor-pointer"
                        >
                          {isKh ? 'អនុវត្ត' : 'Apply'}
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-3xs">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="bg-slate-900/5 text-slate-600 font-extrabold text-[10px] uppercase border-b border-slate-200">
                            <th className="p-2.5 text-center w-12">No</th>
                            <th className="p-2.5">{isKh ? 'ឈ្មោះពេញសិស្ស' : 'Student Name'} *</th>
                            <th className="p-2.5 w-28 text-center">{isKh ? 'ភេទ' : 'Gender'}</th>
                            <th className="p-2.5 w-36">{isKh ? 'ថ្ងៃកំណើត' : 'Birth Date'}</th>
                            <th className="p-2.5 w-44">{isKh ? 'កម្រិតថ្នាក់សិក្សា' : 'Grade'}</th>
                            <th className="p-2.5 w-36">{isKh ? 'ទូរស័ព្ទអាណាព្យាបាល' : 'Parent Contact'}</th>
                            <th className="p-2.5 text-right w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 text-xs font-semibold text-slate-700">
                          {bulkRows.map((row, idx) => (
                            <tr key={row.id} className="hover:bg-slate-50/20">
                              <td className="p-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.name}
                                  onChange={(e) => handleBulkRowChange(idx, 'name', e.target.value)}
                                  placeholder={isKh ? "ឈ្មោះពេញសិស្ស..." : "Full name..."}
                                  className="w-full px-2.5 py-1.5 focus:bg-white border border-transparent focus:border-slate-300 rounded-lg text-xs outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  value={row.gender}
                                  onChange={(e) => handleBulkRowChange(idx, 'gender', e.target.value)}
                                  className="w-full px-2 py-1 bg-transparent border border-transparent focus:border-slate-300 rounded-lg text-xs outline-none cursor-pointer"
                                >
                                  <option value="ប្រុស">{isKh ? 'ប្រុស' : 'Male'}</option>
                                  <option value="ស្រី">{isKh ? 'ស្រី' : 'Female'}</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <input
                                  type="date"
                                  value={row.dob}
                                  onChange={(e) => handleBulkRowChange(idx, 'dob', e.target.value)}
                                  className="w-full px-2 py-1 bg-transparent border border-transparent focus:border-slate-300 rounded-lg text-xs font-mono outline-none text-slate-700"
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  value={row.grade}
                                  onChange={(e) => handleBulkRowChange(idx, 'grade', e.target.value as StudentGrade)}
                                  className="w-full px-2 py-1 bg-transparent border border-transparent focus:border-slate-300 rounded-lg text-xs outline-none font-bold text-amber-700 cursor-pointer"
                                >
                                  {ALL_GRADES.map(g => (
                                    <option key={g} value={g}>{GRADE_NAMES_KM[g]}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.phoneNumber}
                                  onChange={(e) => handleBulkRowChange(idx, 'phoneNumber', e.target.value)}
                                  placeholder="e.g. 012 345 678"
                                  className="w-full px-2.5 py-1.5 focus:bg-white border border-transparent focus:border-slate-300 rounded-lg text-xs font-mono outline-none text-slate-700"
                                />
                              </td>
                              <td className="p-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBulkRow(idx)}
                                  className="p-1 text-slate-300 hover:text-rose-500 rounded-lg transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddBulkRow}
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-dashed border-slate-350 rounded-xl font-black text-xs transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isKh ? 'បន្ថែមបន្ទាត់បញ្ចូលថ្មីទៀត' : 'Append Next Input Row'}</span>
                    </button>

                    <div className="pt-5 border-t border-slate-100 flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setIsFormOpen(false)}
                        className="px-4 py-2 hover:bg-slate-100 transition border border-slate-205 rounded-xl text-slate-500 font-extrabold text-xs cursor-pointer"
                      >
                        {isKh ? 'បោះបង់' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 border border-transparent rounded-xl font-black text-xs transition duration-200 cursor-pointer shadow-3xs"
                      >
                        {isKh ? 'រក្សាទុកទិន្នន័យសិស្សទាំងអស់' : 'Save All Registered Students'}
                      </button>
                    </div>

                  </form>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CONFIRM DELETE STUDENT DIALOG */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-3xs z-55 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl overflow-hidden max-w-md w-full shadow-xl border border-slate-100 p-6 space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-moul text-xs text-rose-650 leading-relaxed">
                  {isKh ? 'តើអ្នកប្រាកដជាចង់លុបទិន្នន័យនេះមែនទេ?' : 'Confirm Delete Candidate'}
                </h4>
                <p className="text-slate-500 text-xs font-bold leading-normal">
                  {isKh 
                    ? `អ្នកកំពុងព្យាយាមលុបទិន្នន័យរបស់សិស្សឈ្មោះ ៖ ${deleteTarget.name} (${deleteTarget.studentId})។ សកម្មភាពនេះមិនអាចបង្កើតឡើងវិញបានឡើយ!` 
                    : `You are about to delete record of ${deleteTarget.name} (Code: ${deleteTarget.studentId}). This action is irreversible.`}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 hover:bg-slate-100 transition border border-slate-200 rounded-xl text-slate-500 font-extrabold text-xs cursor-pointer"
                >
                  {isKh ? 'បដិសេធ' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteStudent}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-extrabold text-xs transition cursor-pointer"
                >
                  {isKh ? 'យល់ព្រមលុបចោល' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: ATTACHMENT DRAWER/SUB-MANAGER */}
      <AnimatePresence>
        {isAttachmentModalOpen && selectedStudentForAttachments && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-end">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white h-full w-full max-w-md shadow-2xl flex flex-col border-l border-slate-100"
            >
              {/* Drawer Title Block */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="font-extrabold text-xs">
                      {isKh ? 'ឯកសារយោង និងលិខិតបញ្ជាក់' : 'Reference Assets & Docs'}
                    </h4>
                    <p className="text-[10px] text-amber-200/90 font-bold mt-0.5 max-w-[280px] truncate" title={selectedStudentForAttachments.name}>
                      {selectedStudentForAttachments.name} ({selectedStudentForAttachments.studentId})
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAttachmentModalOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Core Body Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* 1. Upload input & link setup tab switcher */}
                <div className="space-y-4">
                  <div className="flex bg-slate-100 p-1 border rounded-lg shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveAttachmentTab('upload')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black text-center transition cursor-pointer ${
                        activeAttachmentTab === 'upload'
                          ? 'bg-white text-slate-900 shadow-3xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {isKh ? 'បញ្ចូលឯកសារឯកត្តជន (File upload)' : 'File Upload'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAttachmentTab('link')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black text-center transition cursor-pointer ${
                        activeAttachmentTab === 'link'
                          ? 'bg-white text-slate-900 shadow-3xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {isKh ? 'បន្ថែមតំណភ្ជាប់ (Link/URL)' : 'Web Link'}
                    </button>
                  </div>

                  {activeAttachmentTab === 'upload' ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-205 rounded-2xl p-6 hover:bg-slate-50/50 transition duration-200">
                      <Upload className="w-10 h-10 text-slate-300 stroke-[1.2] mb-2" />
                      <button 
                        onClick={() => attachmentFileInputRef.current?.click()}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition duration-200 shadow-3xs cursor-pointer"
                      >
                        {isKh ? 'ជ្រើសរើសឯកសារ' : 'Browse File'}
                      </button>
                      <span className="text-[10px] text-slate-400 font-bold mt-2">
                        {isKh ? 'គាំទ្ររូបភាព PDF Word ទំហំអតិបរមា ៥MB' : 'Supports Images, PDF, Docs up to 5MB'}
                      </span>
                      <input 
                        ref={attachmentFileInputRef}
                        type="file" 
                        onChange={handleUploadAttachmentFile}
                        className="hidden" 
                      />
                    </div>
                  ) : (
                    <form onSubmit={handleAddAttachmentLink} className="space-y-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-500 uppercase">{isKh ? 'ឈ្មោះចំណងជើង' : 'Title description'}</label>
                        <input 
                          type="text" 
                          required
                          value={linkTitle}
                          onChange={(e) => setLinkTitle(e.target.value)}
                          placeholder={isKh ? "ចំណងជើងកិច្ចសន្យា ឧដាកាស..." : "e.g. Guardian Contract doc, Registration link..."}
                          className="w-full px-3 py-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold transition outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input 
                          type="text" 
                          required
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="WIS-drive-sheets/doc_003"
                          className="col-span-2 px-3 py-1.5 hover:bg-slate-50 border border-slate-205 focus:border-amber-400 rounded-lg text-xs transition outline-none"
                        />
                        <button 
                          type="submit"
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
                        >
                          {isKh ? 'យល់ព្រម' : 'Add Link'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* 2. Registered attachments list */}
                <div className="space-y-3 pt-5 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-black text-slate-450 tracking-wider">
                    {isKh ? `បញ្ជីឯកសារយោង (${(selectedStudentForAttachments.attachments || []).length})` : `Stored items count (${(selectedStudentForAttachments.attachments || []).length})`}
                  </span>

                  {(selectedStudentForAttachments.attachments || []).length > 0 ? (
                    <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden shadow-3xs">
                      {selectedStudentForAttachments.attachments?.map((att) => {
                        const isWebLink = att.type === 'text/html';
                        return (
                          <li key={att.id} className="p-3 hover:bg-slate-50/50 flex items-center justify-between gap-2.5 transition">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isWebLink ? 'bg-sky-50 text-sky-500' : 'bg-indigo-50 text-indigo-500'
                              }`}>
                                {isWebLink ? <Globe className="w-4.5 h-4.5" /> : <File className="w-4.5 h-4.5" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-slate-800 text-xs font-bold truncate max-w-[180px]" title={att.name}>
                                  {att.name}
                                </p>
                                <span className="text-[10px] text-slate-400 font-bold block">
                                  {att.size}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button 
                                onClick={() => {
                                  if (isWebLink) {
                                    window.open(att.dataUrl, '_blank');
                                  } else {
                                    setPreviewingAttachment(att);
                                  }
                                }}
                                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black transition cursor-pointer"
                                title="Open / Preview item info"
                              >
                                {isWebLink ? <ExternalLink className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              
                              <button 
                                onClick={() => setDeleteAttachmentTarget({ id: att.id, name: att.name })}
                                className="p-1 text-slate-350 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                title="Delete item info"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="text-center py-8 text-slate-300 border border-dashed border-slate-200 rounded-xl">
                      <File className="w-8 h-8 stroke-[1.2] mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-slate-400">{isKh ? 'មិនមានឯកសារយោងទេ' : 'Empty record storage'}</span>
                    </div>
                  )}
                </div>

              </div>
              
              <div className="p-5 border-t border-slate-100 shrink-0 bg-slate-50 flex justify-end">
                <button 
                  onClick={() => setIsAttachmentModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition duration-200 shadow-3xs cursor-pointer"
                >
                  {isKh ? 'រួចរាល់' : 'Done'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: INLINE PREVIEW LIGHTBOX */}
      <AnimatePresence>
        {previewingAttachment && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-55 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full flex flex-col shadow-2xl border border-slate-100 max-h-[85vh]"
            >
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <span className="text-xs font-bold truncate max-w-[500px]" title={previewingAttachment.name}>
                  {previewingAttachment.name}
                </span>
                <button 
                  onClick={() => setPreviewingAttachment(null)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="flex-1 bg-slate-100 overflow-auto p-4 flex items-center justify-center min-h-[300px]">
                {previewingAttachment.type.startsWith('image/') ? (
                  <img 
                    src={previewingAttachment.dataUrl} 
                    alt="Preview" 
                    className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center p-6 bg-white rounded-xl shadow-xs border border-slate-200">
                    <File className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-700">{previewingAttachment.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase mt-0.5">{previewingAttachment.type}</p>
                    <a 
                      href={previewingAttachment.dataUrl} 
                      download={previewingAttachment.name}
                      className="px-4 py-2 mt-4 inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold rounded-xl shadow-3xs transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isKh ? 'ទាញយកឯកសារនេះ' : 'Download Document'}</span>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ATTACHMENT ACTION CONFIRM DELETE */}
      <AnimatePresence>
        {deleteAttachmentTarget && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-3xs z-55 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-5 space-y-4 max-w-xs text-center shadow-lg border border-slate-100"
            >
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <div>
                <p className="text-xs font-moul leading-relaxed text-slate-800">
                  {isKh ? 'លុបឯកសារចោល?' : 'Delete Attachment?'}
                </p>
                <p className="text-[10px] text-slate-500 font-bold mt-1 leading-normal">
                  {isKh 
                    ? `តើអ្នកចង់លុបឯកសារយោង "${deleteAttachmentTarget.name}" នេះពិតមែនទេ?`
                    : `Remove "${deleteAttachmentTarget.name}"?`}
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-1">
                <button 
                  onClick={() => setDeleteAttachmentTarget(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  {isKh ? 'ទេ' : 'No'}
                </button>
                <button 
                  onClick={handleDeleteAttachment}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  {isKh ? 'លុបចោល' : 'Yes, Delete'}
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
