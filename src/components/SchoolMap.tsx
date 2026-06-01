import React, { useState, useEffect, useRef } from 'react';
import { 
  Map, Upload, FileText, Maximize2, Minimize2, Trash2, 
  Info, Sparkles, Download, MapPin, Layers, Compass, Check, AlertCircle, ExternalLink,
  Cloud, Search, FolderOpen, Loader2, RefreshCw, LogOut, Key, CheckCircle, Plus, FileDown,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { 
  initAuth, 
  googleSignIn, 
  googleSignOut,
  listGoogleDriveFiles,
  downloadDriveFile,
  exportGoogleDoc
} from '../utils/googleSheetsHelper';

export interface LibraryDoc {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'excel';
  category: 'building_plan' | 'class_listings' | 'safety' | 'other';
  data: string;
  createdAt: string;
}

// IndexedDB storage helpers for handling large PDF/Image files (>5MB) without quota blocks
const openMapDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('WIS_Map_Database', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('map_files')) {
        db.createObjectStore('map_files');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveDocToLibraryDB = async (doc: LibraryDoc): Promise<LibraryDoc[]> => {
  try {
    const db = await openMapDB();
    const currentLibrary = await loadLibraryFromDB();
    const updatedLibrary = [doc, ...currentLibrary.filter(d => d.id !== doc.id)];
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('map_files', 'readwrite');
      const store = transaction.objectStore('map_files');
      const request = store.put(updatedLibrary, 'map_library');
      transaction.oncomplete = () => resolve(updatedLibrary);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.error('IndexedDB Save Library Error:', err);
    return [];
  }
};

const loadLibraryFromDB = async (): Promise<LibraryDoc[]> => {
  try {
    const db = await openMapDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('map_files', 'readonly');
      const store = transaction.objectStore('map_files');
      const request = store.get('map_library');
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    console.error('IndexedDB Load Library Error:', err);
    return [];
  }
};

const deleteDocFromLibraryDB = async (id: string): Promise<LibraryDoc[]> => {
  try {
    const db = await openMapDB();
    const currentLibrary = await loadLibraryFromDB();
    const updatedLibrary = currentLibrary.filter(d => d.id !== id);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('map_files', 'readwrite');
      const store = transaction.objectStore('map_files');
      const request = store.put(updatedLibrary, 'map_library');
      transaction.oncomplete = () => resolve(updatedLibrary);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.error('IndexedDB Delete Library Error:', err);
    return [];
  }
};

const saveMapToIndexedDB = async (name: string, type: 'pdf' | 'image' | 'excel', data: string): Promise<void> => {
  try {
    const db = await openMapDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('map_files', 'readwrite');
      const store = transaction.objectStore('map_files');
      const request = store.put({ name, type, data, updatedAt: new Date().toISOString() }, 'current_map');
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.error('IndexedDB Save Error:', err);
  }
};

const loadMapFromIndexedDB = async (): Promise<{ name: string; type: 'pdf' | 'image' | 'excel'; data: string } | null> => {
  try {
    const db = await openMapDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('map_files', 'readonly');
      const store = transaction.objectStore('map_files');
      const request = store.get('current_map');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('IndexedDB Load Error:', err);
    return null;
  }
};

const deleteMapFromIndexedDB = async (): Promise<void> => {
  try {
    const db = await openMapDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('map_files', 'readwrite');
      const store = transaction.objectStore('map_files');
      const request = store.delete('current_map');
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.error('IndexedDB Delete Error:', err);
  }
};

const saveFloorMapToIndexedDB = async (floorId: string, name: string, type: 'pdf' | 'image' | 'excel', data: string): Promise<void> => {
  try {
    const db = await openMapDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('map_files', 'readwrite');
      const store = transaction.objectStore('map_files');
      const request = store.put({ name, type, data, updatedAt: new Date().toISOString() }, `floor_map_${floorId}`);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.error(`IndexedDB Floor Save Error (${floorId}):`, err);
  }
};

const loadFloorMapFromIndexedDB = async (floorId: string): Promise<{ name: string; type: 'pdf' | 'image' | 'excel'; data: string } | null> => {
  try {
    const db = await openMapDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('map_files', 'readonly');
      const store = transaction.objectStore('map_files');
      const request = store.get(`floor_map_${floorId}`);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`IndexedDB Floor Load Error (${floorId}):`, err);
    return null;
  }
};

const deleteFloorMapFromIndexedDB = async (floorId: string): Promise<void> => {
  try {
    const db = await openMapDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('map_files', 'readwrite');
      const store = transaction.objectStore('map_files');
      const request = store.delete(`floor_map_${floorId}`);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.error(`IndexedDB Floor Delete Error (${floorId}):`, err);
  }
};

// Converts the raw base64 string safely to Binary Blob to bypass browser sandboxing/data-URI blocks
const base64ToBlob = (base64Data: string): Blob => {
  try {
    const parts = base64Data.split(';base64,');
    const contentType = parts[0].split(':')[1] || 'application/pdf';
    const raw = window.atob(parts[1] || parts[0]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  } catch (err) {
    console.error('Failed to convert base64 to blob:', err);
    return new Blob([], { type: 'application/pdf' });
  }
};

const FLOOR_ROOM_TEMPLATES: { [key: string]: Array<{ id: string; nameKh: string; nameEn: string; teacher: string; capacity: number; currentStudents: number; status: 'active' | 'busy' | 'maintenance'; color: string; seats: string[][] }> } = {
  ground: [
    { 
      id: 'g-k1', nameKh: 'ថ្នាក់មត្តេយ្យសកម្ម ក (Kindergarten 1A)', nameEn: 'Kindergarten 1A', teacher: 'អ្នកគ្រូ សាំង សុជាតា (Sang Socheata)', capacity: 20, currentStudents: 18, status: 'active', color: 'bg-emerald-50 border-emerald-500 text-emerald-800',
      seats: [
        ['សិរិ', 'បញ្ញា', 'មុនី', 'វឌ្ឍនៈ'],
        ['សុធា', 'ដារ៉ា', 'វីរៈ', 'ទេវី'],
        ['មុន្នី', 'សារ៉ន', 'ភារក្ស', 'លីដា']
      ]
    },
    { 
      id: 'g-k2', nameKh: 'ថ្នាក់មត្តេយ្យសកម្ម ខ (Kindergarten 1B)', nameEn: 'Kindergarten 1B', teacher: 'អ្នកគ្រូ លី រតនា (Ly Ratana)', capacity: 20, currentStudents: 16, status: 'active', color: 'bg-teal-50 border-teal-500 text-teal-800',
      seats: [
        ['សុភ័ក្ត្រ', 'បុប្ផា', 'ផល្លា', 'ម៉ូលី'],
        ['កុសល', 'ចាន់ដា', 'ធារី', 'លក្ខិណា'],
        ['ណារ៉េត', 'ភីរម្យ', 'รតនៈ', 'ពន្លឺ']
      ]
    },
    { 
      id: 'g-adm', nameKh: 'ការិយាល័យចុះឈ្មោះ (Admission Office)', nameEn: 'Admission & Admin', teacher: 'លោកគ្រូ អ៊ុក សុភី (Ouk Sophea)', capacity: 10, currentStudents: 4, status: 'busy', color: 'bg-indigo-50 border-indigo-500 text-indigo-800',
      seats: [
        ['តុចុះឈ្មោះ ១', 'តុចុះឈ្មោះ ២'],
        ['តុបង់ប្រាក់', 'បន្ទប់ព័ត៌មាន']
      ]
    },
    { 
      id: 'g-clinic', nameKh: 'បន្ទប់សង្គ្រោះបឋម (School Clinic)', nameEn: 'School Clinic / Nurse', teacher: 'អ្នកគ្រូ ចាន់ ណារី (Dr. Chan Nary)', capacity: 5, currentStudents: 1, status: 'active', color: 'bg-rose-50 border-rose-500 text-rose-800',
      seats: [
        ['គ្រែសង្គ្រោះ ១', 'គ្រែសង្គ្រោះ ២'],
        ['តុពិគ្រោះជំងឺ', 'ទូរថ្នាំពេទ្យ']
      ]
    }
  ],
  '1st': [
    { 
      id: '1-101', nameKh: 'ថ្នាក់រៀនថ្នាក់ទី១ ក (Grade 1A)', nameEn: 'Grade 1A Classroom', teacher: 'អ្នកគ្រូ ម៉ៅ សុជាតា (Mao Socheata)', capacity: 25, currentStudents: 24, status: 'active', color: 'bg-sky-50 border-sky-500 text-sky-800',
      seats: [
        ['សុជាតិ', 'ម៉ាលី', 'សំរិទ្ធ', 'សុភា'],
        ['វិបុល', 'ចាន់ថន', 'លីហួរ', 'វាសនា'],
        ['ណាគ្រី', 'សុផល', 'សិរីវឌ្ឍន៍', 'កានី']
      ]
    },
    { 
      id: '1-102', nameKh: 'ថ្នាក់រៀនថ្នាក់ទី១ ខ (Grade 1B)', nameEn: 'Grade 1B Classroom', teacher: 'លោកគ្រូ មាស ពិសិដ្ឋ (Meas Piseth)', capacity: 25, currentStudents: 22, status: 'active', color: 'bg-blue-50 border-blue-500 text-blue-800',
      seats: [
        ['ចន្ថា', 'ធារ៉ា', 'គីមហុង', 'ភក្តី'],
        ['ណារ៉ុង', 'មុន្នី', 'សោភា', 'បុរី'],
        ['ជាតា', 'រដ្ឋា', 'បញ្ញវន្ត', 'ភួង']
      ]
    },
    { 
      id: '1-lib', nameKh: 'បណ្ណាល័យធំ (Central Library)', nameEn: 'Central Library Hall', teacher: 'អ្នកគ្រូ ឈីម រស្មី (Chhim Raksmey)', capacity: 50, currentStudents: 32, status: 'active', color: 'bg-violet-50 border-violet-500 text-violet-800',
      seats: [
        ['តុអាន ១', 'តុអាន ២', 'តុអាន ៣'],
        ['រទេះសៀវភៅ', 'កុំព្យូទ័រស្រាវជ្រាវ', 'តុបណ្ណារក្ស']
      ]
    }
  ],
  '2nd': [
    { 
      id: '2-201', nameKh: 'ថ្នាក់រៀនថ្នាក់ទី២ ក (Grade 2A)', nameEn: 'Grade 2A Classroom', teacher: 'លោកគ្រូ ហេង សំអាត (Heng Samat)', capacity: 28, currentStudents: 26, status: 'active', color: 'bg-sky-50 border-sky-500 text-sky-800',
      seats: [
        ['សាំង', 'ភារម្យ', 'ធារី', 'ដារ៉ូ'],
        ['បុប្ផា', 'វាសនា', 'ច័ន្ទ', 'ស្រីការ'],
        ['វិចិត្រ', 'សុធី', 'ផល្លា', 'ណារ៉េត']
      ]
    },
    { 
      id: '2-202', nameKh: 'ថ្នាក់រៀនថ្នាក់ទី២ ខ (Grade 2B)', nameEn: 'Grade 2B Classroom', teacher: 'អ្នកគ្រូ ម៉ែន សុវណ្ណ (Men Sovann)', capacity: 28, currentStudents: 25, status: 'active', color: 'bg-blue-50 border-blue-500 text-blue-800',
      seats: [
        ['មុន្នី', 'រិទ្ធី', 'សុផាត', 'វីបុល'],
        ['សារ៉ាត់', 'ធានី', 'លីណា', 'កុសល'],
        ['ចន្ថា', 'នារី', 'សារ៉ុម', 'ភីរម្យ']
      ]
    },
    { 
      id: '2-art', nameKh: 'បន្ទប់សិល្បៈ និងគំនូរ (Art & Drawing Studio)', nameEn: 'Art & Drawing Studio', teacher: 'លោកគ្រូ សួង វិបុល (Soung Vibol)', capacity: 20, currentStudents: 15, status: 'active', color: 'bg-pink-50 border-pink-500 text-pink-800',
      seats: [
        ['ក្តារគូរ ១', 'ក្តារគូរ ២', 'ក្តារគូរ ៣'],
        ['តុពណ៌លាប', 'ចានជ័រលាយពណ៌', 'គំនូរតាំងពិព័រណ៍']
      ]
    }
  ],
  '3rd': [
    { 
      id: '3-301', nameKh: 'ថ្នាក់រៀនថ្នាក់ទី៣ ក (Grade 3A)', nameEn: 'Grade 3A Classroom', teacher: 'លោកគ្រូ ឡុង វាសនា (Loung Veasna)', capacity: 30, currentStudents: 29, status: 'active', color: 'bg-sky-50 border-sky-450 text-sky-800',
      seats: [
        ['រដ្ឋា', 'សុធា', 'ពន្លឺ', 'លីហួរ'],
        ['ទេវី', 'មុនី', 'ចាន់ដា', 'ធារ៉ា'],
        ['វិរៈ', 'សារ៉ន', 'ផល្លា', 'ដារ៉ា']
      ]
    },
    { 
      id: '3-it', nameKh: 'បន្ទប់ព័ត៌មានវិទ្យា (IT & Coding Lab)', nameEn: 'IT & Coding Lab', teacher: 'លោកគ្រូ សេង ដារា (Seng Dara)', capacity: 30, currentStudents: 28, status: 'busy', color: 'bg-emerald-50 border-emerald-500 text-emerald-800',
      seats: [
        ['កុំព្យូទ័រ ១', 'កុំព្យូទ័រ ២', 'កុំព្យូទ័រ ៣'],
        ['កុំព្យូទ័រ ៤', 'កុំព្យូទ័រ ៥', 'កុំព្យូទ័រ ៦'],
        ['ម៉ាស៊ីនមេ (Server)', 'តុគ្រូបង្រៀន', 'កុំព្យូទ័រ ៧']
      ]
    },
    { 
      id: '3-music', nameKh: 'បន្ទប់តន្រ្តី និងឧបករណ៍ (Music & Performing Arts)', nameEn: 'Music Studio', teacher: 'អ្នកគ្រូ នួន ចាន់ធី (Noun Chanthy)', capacity: 25, currentStudents: 18, status: 'active', color: 'bg-purple-50 border-purple-500 text-purple-800',
      seats: [
        ['ព្យាណូធំ (Piano)', 'ស្គរ (Drums)', 'ហ្គីតា (Guitars)'],
        ['ឧបករណ៍ភ្លេងខ្មែរ', 'មីក្រូហ្វូន', 'កៅអីហាត់ច្រៀង']
      ]
    }
  ],
  '4th': [
    { 
      id: '4-401', nameKh: 'ថ្នាក់ទី១០ (Grade 10 General)', nameEn: 'Grade 10 Classroom', teacher: 'Mr. Donald Vance', capacity: 30, currentStudents: 28, status: 'active', color: 'bg-sky-50 border-sky-500 text-sky-800',
      seats: [
        ['កុសល', 'សុដា', 'ភួង', 'ចន្ថា'],
        ['វាសនា', 'វីរៈ', 'ធារ៉ា', 'ម៉ាលី'],
        ['មុន្នី', 'សារ៉ុម', 'ភារក្ស', 'សុរក្ស']
      ]
    },
    { 
      id: '4-lab', nameKh: 'បន្ទប់ពិសោធន៍វិទ្យាសាស្ត្រ (Physics-Chemistry Lab)', nameEn: 'Physics & Chemistry Lab', teacher: 'អ្នកគ្រូ សួង ចាន់នី (Soung Channy)', capacity: 24, currentStudents: 20, status: 'active', color: 'bg-teal-50 border-teal-500 text-teal-800',
      seats: [
        ['តុពិសោធន៍គីមី ១', 'តុពិសោធន៍គីមី ២'],
        ['តុពិសោធន៍រូបវិទ្យា', 'ទូកែវពិសោធន៍'],
        ['កន្លែងលាងដៃ', 'ចំណុចការពារភ្លើង']
      ]
    }
  ],
  '5th': [
    { 
      id: '5-501', nameKh: 'ថ្នាក់ទី១១ (Grade 11 Sciences)', nameEn: 'Grade 11 Classroom', teacher: 'Mr. Gerald Cross', capacity: 30, currentStudents: 27, status: 'active', color: 'bg-slate-50 border-slate-500 text-slate-800',
      seats: [
        ['រតនៈ', 'ពន្លឺ', 'បុរី', 'ទេវី'],
        ['សារ៉ត', 'លីណា', 'បុប្ផា', 'គីមហុង'],
        ['សុផាត', 'ចាន់ថន', 'សុធារ៉ា', 'ផល្លា']
      ]
    },
    { 
      id: '5-502', nameKh: 'ថ្នាក់ទី១២ (Grade 12 High Prep)', nameEn: 'Grade 12 BacII Prep', teacher: 'អ្នកគ្រូ ហ៊ាង ស្រីនាង (Heang Sreyneang)', capacity: 32, currentStudents: 31, status: 'active', color: 'bg-amber-50 border-amber-500 text-amber-800',
      seats: [
        ['ភត្រា', 'វឌ្ឍនៈ', 'សោភា', 'ជាតា'],
        ['លីហួរ', 'សំរិទ្ធ', 'វាសនា', 'សុជាតិ'],
        ['ស្រីការ', 'វិចិត្រ', 'ដារ៉ូ', 'សំអាត']
      ]
    },
    { 
      id: '5-admin', nameKh: 'ការិយាល័យនាយកសិក្សា (Academic Advisor)', nameEn: 'Academic Advisor Office', teacher: 'លោកគ្រូ ចាន់ តារាវុធ (Chan Daravuth)', capacity: 6, currentStudents: 2, status: 'active', color: 'bg-slate-100 border-slate-400 text-slate-700',
      seats: [
        ['តុពិភាក្សា ១', 'តុប្រឹក្សាអាហារូបករណ៍'],
        ['តុនាយកសិក្សា', 'ឯកសារផែនការ']
      ]
    }
  ]
};

const getMockExcelData = (floorId: string, sheetName: string) => {
  const floorKh = floorId === 'ground' ? 'ជាន់ផ្ទាល់ដី' : `ជាន់ទី${floorId[0]}`;
  const floorNum = floorId === 'ground' ? '0' : floorId[0];
  if (sheetName === 'ថ្នាក់រៀន (Classrooms)' || !sheetName) {
    return [
      { 'លេខបន្ទប់': `${floorNum}01`, 'ឈ្មោះបន្ទប់សិក្សា': `${floorKh} - ថ្នាក់រៀនភាសាខ្មែរ (Khmer Literature)`, 'គ្រូបង្រៀន': 'កញ្ញា ម៉ៅ សុជាតា (Mao Socheata)', 'ចំនួនសិស្ស': '២៥', 'ម៉ោងសិក្សា': '08:00 AM - 11:30 AM', 'ស្ថានភាព': 'សកម្ម (Active)' },
      { 'លេខបន្ទប់': `${floorNum}02`, 'ឈ្មោះបន្ទប់សិក្សា': `${floorKh} - ថ្នាក់រៀនគណិតវិទ្យា (Math Classroom)`, 'គ្រូបង្រៀន': 'លោក ហេង សំអាត (Heng Samat)', 'ចំនួនសិស្ស': '២៨', 'ម៉ោងសិក្សា': '01:00 PM - 04:30 PM', 'ស្ថានភាព': 'សកម្ម (Active)' },
      { 'លេខបន្ទប់': `${floorNum}03`, 'ឈ្មោះបន្ទប់សិក្សា': `${floorKh} - បន្ទប់កុំព្យូទ័រ (Computer Science Lab)`, 'គ្រូបង្រៀន': 'លោក សេង ដារា (Seng Dara)', 'ចំនួនសិស្ស': '២០', 'ម៉ោងសិក្សា': '08:00 AM - 05:00 PM', 'ស្ថានភាព': 'មមាញឹក (Busy)' },
      { 'លេខបន្ទប់': `${floorNum}04`, 'ឈ្មោះបន្ទប់សិក្សា': `${floorKh} - ថ្នាក់រៀនភាសាអង់គ្លេស (English Advanced)`, 'គ្រូបង្រៀន': 'Mr. Donald Vance', 'ចំនួនសិស្ស': '៣០', 'ម៉ោងសិក្សា': '08:00 AM - 11:30 AM', 'ស្ថានភាព': 'សកម្ម (Active)' },
      { 'លេខបន្ទប់': `${floorNum}05`, 'ឈ្មោះបន្ទប់សិក្សា': `${floorKh} - បន្ទប់ពិសោធន៍វិទ្យាសាស្ត្រ (Science Lab)`, 'គ្រូបង្រៀន': 'អ្នកគ្រូ សួង ចាន់នី (Soung Channy)', 'ចំនួនសិស្ស': '១៨', 'ម៉ោងសិក្សា': '01:00 PM - 03:00 PM', 'ស្ថានភាព': 'សកម្ម (Active)' },
    ];
  } else {
    return [
      { 'ឈ្មោះគ្រូ': 'លោក ហេង សំអាត', 'ជំនាញ': 'គណិតវិទ្យា (Math)', 'ទូរស័ព្ទ': '012-345-XXX', 'អ៊ីមែល': 'samat.heng@wis.edu.kh' },
      { 'ឈ្មោះគ្រូ': 'កញ្ញា ម៉ៅ សុជាតា', 'ជំនាញ': 'អក្សរសាស្ត្រខ្មែរ', 'ទូរស័ព្ទ': '011-888-XXX', 'អ៊ីមែល': 'socheata.mao@wis.edu.kh' },
      { 'ឈ្មោះគ្រូ': 'Mr. Donald Vance', 'ជំនាញ': 'English Literature', 'ទូរស័ព្ទ': '096-777-XXX', 'អ៊ីមែល': 'donald.v@wis.edu.kh' },
      { 'ឈ្មោះគ្រូ': 'លោក សេង ដារា', 'ជំនាញ': 'បច្ចេកវិទ្យាព័ត៌មាន (IT)', 'ទូរស័ព្ទ': '085-555-XXX', 'អ៊ីមែល': 'dara.seng@wis.edu.kh' },
      { 'ឈ្មោះគ្រូ': 'អ្នកគ្រូ សួង ចាន់នី', 'ជំនាញ': 'រូបវិទ្យា-គីមីវិទ្យា', 'ទូរស័ព្ទ': '070-444-XXX', 'អ៊ីមែល': 'channy.s@wis.edu.kh' },
    ];
  }
};

export default function SchoolMap() {
  const [mapFileUrl, setMapFileUrl] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mapFileName, setMapFileName] = useState<string>('');
  const [mapFileType, setMapFileType] = useState<'pdf' | 'image' | 'excel' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeZone, setActiveZone] = useState<string>('building-a');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Floor specific state definitions (Support Ground Floor, 1st - 5th Floor)
  const [activeFloor, setActiveFloor] = useState<string>('ground');
  const [activeFloorViewMode, setActiveFloorViewMode] = useState<'map' | 'excel' | 'custom'>('map');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Interactive Excel grid and spreadsheets states
  const [excelSheets, setExcelSheets] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [excelData, setExcelData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Google Auth & Drive States
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isSearchingDrive, setIsSearchingDrive] = useState(false);
  const [driveSearchQuery, setDriveSearchQuery] = useState('');
  const [isDriveImporting, setIsDriveImporting] = useState<string | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);

  // Document Library States
  const [libraryDocs, setLibraryDocs] = useState<LibraryDoc[]>([]);
  const [selectedLibraryCategory, setSelectedLibraryCategory] = useState<'all' | 'building_plan' | 'class_listings' | 'safety' | 'other'>('all');
  const [importCategory, setImportCategory] = useState<'building_plan' | 'class_listings' | 'safety' | 'other'>('building_plan');
  
  // Tab within the document importer: 'local' or 'drive'
  const [activeImportSource, setActiveImportSource] = useState<'local' | 'drive'>('local');
  const [isViewingLibrary, setIsViewingLibrary] = useState(false);

  // Load imported document library on mount
  useEffect(() => {
    const fetchLibrary = async () => {
      const docs = await loadLibraryFromDB();
      setLibraryDocs(docs);
    };
    fetchLibrary();
  }, []);

  // Initialize Auth connection on Mount
  useEffect(() => {
    const unsub = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        setAuthInitialized(true);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
        setAuthInitialized(true);
      }
    );
    return () => unsub();
  }, []);

  // Fetch from Google Drive when token is updated
  const fetchDriveFiles = async (search?: string) => {
    if (!googleToken) return;
    try {
      setIsSearchingDrive(true);
      setDriveError(null);
      const files = await listGoogleDriveFiles(googleToken, search);
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
      setDriveError('មិនអាចទាញយកបញ្ជីឯកសារពី Google Drive ឡើយ។');
    } finally {
      setIsSearchingDrive(false);
    }
  };

  useEffect(() => {
    if (googleToken) {
      fetchDriveFiles();
    }
  }, [googleToken]);

  const handleGoogleSignIn = async () => {
    try {
      setDriveError(null);
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setDriveError('ការតភ្ជាប់គណនី Google ទទួលបានបរាជ័យ។');
    }
  };

  const handleGoogleSignOut = async () => {
    await googleSignOut();
    setGoogleUser(null);
    setGoogleToken(null);
    setDriveFiles([]);
  };

  // Parses raw Base64 code into worksheet rows and sheet list
  const parseExcelFromBase64 = (base64Data: string, sheetToLoad?: string) => {
    try {
      if (!base64Data) return;
      const parts = base64Data.split(';base64,');
      const base64String = parts[1] || parts[0];
      const workbook = XLSX.read(base64String, { type: 'base64', cellDates: true });
      
      const sheetNames = workbook.SheetNames;
      setExcelSheets(sheetNames);
      
      const selectedSheet = sheetToLoad && sheetNames.includes(sheetToLoad) ? sheetToLoad : sheetNames[0];
      setActiveSheet(selectedSheet || '');
      
      if (selectedSheet) {
        const worksheet = workbook.Sheets[selectedSheet];
        // Read cells and default empty slots to empty strings
        const json = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });
        setExcelData(json);
      }
    } catch (err) {
      console.error('Error parsing excel base64 payload:', err);
    }
  };

  const handleSheetChange = (sheetName: string) => {
    if (!mapFileUrl) return;
    parseExcelFromBase64(mapFileUrl, sheetName);
  };

  useEffect(() => {
    if (mapFileUrl && mapFileType === 'excel') {
      parseExcelFromBase64(mapFileUrl);
    }
  }, [mapFileUrl, mapFileType]);

  // Generate same-origin stable Object URL from the loaded base64 string
  useEffect(() => {
    if (!mapFileUrl) {
      setBlobUrl(null);
      return;
    }

    try {
      if (mapFileUrl.startsWith('data:')) {
        const blob = base64ToBlob(mapFileUrl);
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        
        return () => {
          URL.revokeObjectURL(url);
        };
      } else {
        setBlobUrl(mapFileUrl);
      }
    } catch (err) {
      console.error('Error generating temporary blob preview:', err);
      setBlobUrl(mapFileUrl);
    }
  }, [mapFileUrl]);

  // Open PDF map directly in a new browser tab/window
  const handleOpenInNewTab = () => {
    const activeUrl = blobUrl || mapFileUrl;
    if (!activeUrl) return;
    
    // Blob URLs open beautifully and securely in a new tab instantly!
    const newWindow = window.open(activeUrl, '_blank');
    if (!newWindow) {
      // Direct anchor link target fallback if popup is blocked
      const link = document.createElement('a');
      link.href = activeUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    }
  };

  // Trigger browser download for saving local hardcopies
  const handleDownload = () => {
    const activeUrl = blobUrl || mapFileUrl;
    if (!activeUrl) return;
    const link = document.createElement('a');
    link.href = activeUrl;
    link.download = mapFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Synchronize and load saved floor maps when activeFloor changes
  useEffect(() => {
    const loadFloorMap = async () => {
      try {
        const floorDbRecord = await loadFloorMapFromIndexedDB(activeFloor);
        if (floorDbRecord) {
          setMapFileUrl(floorDbRecord.data);
          setMapFileName(floorDbRecord.name);
          setMapFileType(floorDbRecord.type);
          setActiveFloorViewMode('custom');
        } else {
          // If no custom floor map is registered, default the floor view mode to 'map' 
          // which shows the high-fidelity native interactive classroom seat map!
          setMapFileUrl(null);
          setMapFileName('');
          setMapFileType(null);
          setActiveFloorViewMode('map');
        }
      } catch (err) {
        console.error(`Error loading floor map for ${activeFloor}:`, err);
      }
    };

    setSelectedRoomId(null);
    loadFloorMap();
  }, [activeFloor]);

  // Handle Drag & Drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Convert File to Base64 to save in IndexedDB and set URL for viewing
  const processFile = (file: File, cat: 'building_plan' | 'class_listings' | 'safety' | 'other' = 'building_plan') => {
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isImg = file.type.startsWith('image/');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';

    if (!isPdf && !isImg && !isExcel) {
      alert('សូមជ្រើសរើសតែឯកសារប្រភេទ PDF, រូបភាព (PNG, JPG) ឬ ឯកសារ Excel (.xlsx, .xls) ប៉ុណ្ណោះ។\n(Please select only PDF, Image, or Excel files.)');
      return;
    }

    if (file.size > 20 * 1024 * 1024) { // Increased limit to 20MB for high-res architectural PDFs
      alert('ទំហំឯកសារធំពេក! សូមជ្រើសរើសឯកសារដែលមានទំហំតូចជាង 20MB។\n(File is too large! Please choose a file under 20MB.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      if (result) {
        const fileType = isPdf ? 'pdf' : isImg ? 'image' : 'excel';
        setMapFileUrl(result);
        setMapFileName(file.name);
        setMapFileType(fileType);
        setActiveFloorViewMode('custom');

        // Save entire large string to IndexedDB as active map and floor-specific map
        await saveMapToIndexedDB(file.name, fileType, result);
        await saveFloorMapToIndexedDB(activeFloor, file.name, fileType, result);

        // Save metadata in localStorage
        try {
          localStorage.setItem('wis_school_map_name', file.name);
          localStorage.setItem('wis_school_map_type', fileType);
          localStorage.setItem(`wis_school_map_${activeFloor}_name`, file.name);
          localStorage.setItem(`wis_school_map_${activeFloor}_type`, fileType);
        } catch (storageErr) {
          console.warn('Could not save metadata to localStorage', storageErr);
        }

        // Add to library docs
        const newLibraryDoc: LibraryDoc = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          type: fileType,
          category: cat,
          data: result,
          createdAt: new Date().toISOString()
        };
        const updated = await saveDocToLibraryDB(newLibraryDoc);
        setLibraryDocs(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0], importCategory);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0], importCategory);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFromDrive = async (file: any) => {
    if (!googleToken) return;
    try {
      setIsDriveImporting(file.id);
      setDriveError(null);
      
      const isGoogleDoc = file.mimeType.startsWith('application/vnd.google-apps.');
      let blob: Blob;
      
      if (isGoogleDoc) {
        blob = await exportGoogleDoc(googleToken, file.id, file.mimeType);
      } else {
        blob = await downloadDriveFile(googleToken, file.id);
      }

      // Convert downloaded Blob to File
      let targetName = file.name;
      let detectedType = '';
      
      if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
        if (!targetName.endsWith('.xlsx')) targetName += '.xlsx';
        detectedType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (file.mimeType === 'application/pdf' || file.mimeType === 'application/vnd.google-apps.document') {
        if (!targetName.endsWith('.pdf')) targetName += '.pdf';
        detectedType = 'application/pdf';
      } else if (file.mimeType.startsWith('image/')) {
        detectedType = file.mimeType;
      } else {
        detectedType = file.mimeType;
      }

      const generatedFile = new File([blob], targetName, { type: detectedType });
      processFile(generatedFile, importCategory);
      
      alert(`នាំចូលឯកសារ "${file.name}" ពី Google Drive ដោយជោគជ័យ!`);
    } catch (err: any) {
      console.error(err);
      setDriveError(`បរាជ័យក្នុងការទាញយកឯកសារនេះពី Google Drive៖ ${err.message || 'Error occurred'}`);
    } finally {
      setIsDriveImporting(null);
    }
  };

  const handleSelectDocFromLibrary = async (doc: LibraryDoc) => {
    setMapFileUrl(doc.data);
    setMapFileName(doc.name);
    setMapFileType(doc.type);
    setActiveFloorViewMode('custom');

    await saveMapToIndexedDB(doc.name, doc.type, doc.data);
    await saveFloorMapToIndexedDB(activeFloor, doc.name, doc.type, doc.data);
    try {
      localStorage.setItem('wis_school_map_name', doc.name);
      localStorage.setItem('wis_school_map_type', doc.type);
      localStorage.setItem(`wis_school_map_${activeFloor}_name`, doc.name);
      localStorage.setItem(`wis_school_map_${activeFloor}_type`, doc.type);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleDeleteDocFromLibrary = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('តើអ្នកពិតជាចង់លុបឯកសារនេះពីបណ្ណាល័យមែនទេ?')) {
      const updated = await deleteDocFromLibraryDB(id);
      setLibraryDocs(updated);
      
      // If current loaded file was deleted, load another or clear
      if (mapFileName) {
        const stillExists = updated.some(d => d.name === mapFileName);
        if (!stillExists) {
          if (updated.length > 0) {
            handleSelectDocFromLibrary(updated[0]);
          } else {
            setMapFileUrl(null);
            setMapFileName('');
            setMapFileType(null);
            setActiveFloorViewMode('map');
            await deleteMapFromIndexedDB();
            await deleteFloorMapFromIndexedDB(activeFloor);
            localStorage.removeItem('wis_school_map_name');
            localStorage.removeItem('wis_school_map_type');
            localStorage.removeItem(`wis_school_map_${activeFloor}_name`);
            localStorage.removeItem(`wis_school_map_${activeFloor}_type`);
          }
        }
      }
    }
  };

  const handleClearMap = async () => {
    const floorNamesKh: { [key: string]: string } = {
      ground: 'ជាន់ផ្ទាល់ដី',
      '1st': 'ជាន់ទី១',
      '2nd': 'ជាន់ទី២',
      '3rd': 'ជាន់ទី៣',
      '4th': 'ជាន់ទី៤',
      '5th': 'ជាន់ទី៥'
    };
    const floorKh = floorNamesKh[activeFloor] || activeFloor;
    if (confirm(`តើអ្នកពិតជាចង់លុបប្លង់សាលាសម្រាប${floorKh}នេះមែនទេ?`)) {
      setMapFileUrl(null);
      setMapFileName('');
      setMapFileType(null);
      setActiveFloorViewMode('map');
      
      await deleteFloorMapFromIndexedDB(activeFloor);
      localStorage.removeItem(`wis_school_map_${activeFloor}_name`);
      localStorage.removeItem(`wis_school_map_${activeFloor}_type`);
    }
  };

  // Interactive mock campus zones info
  const campusZones = [
    {
      id: 'building-a',
      name: 'អគារសិក្សា A (Primary & Kindergarten)',
      levels: 'ជាន់ផ្ទាល់ដី ដល់ ជាន់ទី៣ (4 Levels)',
      rooms: 'ថ្នាក់មត្តេយ្យ (KG), បន្ទប់រដ្ឋបាល, ថ្នាក់រៀនបឋមសិក្សា (G1-G6)',
      head: 'លោកគ្រូ LOUNG Veasna (ប្រធានអគារ)',
      color: 'border-l-4 border-sky-500'
    },
    {
      id: 'building-b',
      name: 'អគារសិក្សា B (Secondary & High School)',
      levels: 'ជាន់ផ្ទាល់ដី ដល់ ជាន់ទី៥ (6 Levels)',
      rooms: 'ថ្នាក់អនុវិទ្យាល័យ និងវិទ្យាល័យ, បន្ទប់ពិសោធន៍វិទ្យាសាស្ត្រ (Lab), បណ្ណាល័យធំ',
      head: 'អ្នកគ្រូ HEANG Sreyneang',
      color: 'border-l-4 border-amber-500'
    },
    {
      id: 'admin-block',
      name: 'អគាររដ្ឋបាលកណ្តាល (Central Admin Office)',
      levels: 'ជាន់ផ្ទាល់ដី និង ជាន់ទី១ (2 Levels)',
      rooms: 'ការិយាល័យចុះឈ្មោះ និងបង់ប្រាក់, បន្ទប់ទទួលភ្ញៀវ, ការិយាល័យលោកនាយក',
      head: 'អ្នកគ្រូ OUK Sophea',
      color: 'border-l-4 border-emerald-500'
    },
    {
      id: 'facility-zones',
      name: 'តំបន់សេវាកម្ម និងកីឡា (Facilities & Recreation)',
      levels: 'តំបន់ក្រៅអគារសិក្សា',
      rooms: 'អាហារដ្ឋានធំ, តារាងបាល់ទាត់-បាល់បោះ, អាងហែលទឹក, គ្លីនិកសាលា (Nurse Room)',
      head: 'ប្រធានផ្នែកសន្តិសុខ និង សណ្តាប់ធ្នាប់ (Security Supervisor)',
      color: 'border-l-4 border-rose-500'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Introduction Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                ប្លង់សាលា និងទីតាំងសិក្សា (WIS School Map & Floor Plans)
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Interactive Live PDF & Excel</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                គ្រប់គ្រង និងស្វែងរកបន្ទប់រៀន អគារសិក្សា និងទីតាំងសាលា។ អ្នកអាចបញ្ចូលឯកសារប្លង់ PDF ផ្លូវការ ឬតារាងបន្ទប់រៀនជា Excel ដើម្បីបង្ហាញ និងស្វែងរកទិន្នន័យបានភ្លាមៗ។
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        
        {/* Main Viewer Area */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm relative">
            {/* Tab navigation headers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-3">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setIsViewingLibrary(false)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                    !isViewingLibrary 
                      ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-800 border border-transparent'
                  }`}
                >
                  <Layers className={`w-4 h-4 ${!isViewingLibrary ? 'text-sky-600' : ''}`} />
                  <span>ផ្ទាំងបង្ហាញប្លង់សិក្សា (Active Viewer)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsViewingLibrary(true)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                    isViewingLibrary 
                      ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-800 border border-transparent'
                  }`}
                >
                  <FolderOpen className={`w-4 h-4 ${isViewingLibrary ? 'text-teal-600' : ''}`} />
                  <span>នាំចូល & បណ្ណាល័យ (Import & Library)</span>
                  {libraryDocs.length > 0 && (
                    <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                      {libraryDocs.length}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {!isViewingLibrary && mapFileUrl && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                      title={isFullscreen ? "បង្រួមមកវិញ" : "បង្ហាញពេញអេក្រង់ (Full View)"}
                    >
                      {isFullscreen ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearMap}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="លុបឯកសារប្លង់សកម្មនេះ"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* If not viewing Library tab */}
            {!isViewingLibrary ? (
              <div className="space-y-5">
                {/* 1. Floor Selector Bar */}
                <div className="space-y-1.5 bg-slate-50 border border-slate-150 p-3.5 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">
                      សូមជ្រើសរើសជាន់សិក្សា (Please Select a Floor Plan)
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                      សរុប ៦ ជាន់
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {[
                      { id: 'ground', labelKh: 'ជាន់ផ្ទាល់ដី', labelEn: 'Ground Floor' },
                      { id: '1st', labelKh: 'ជាន់ទី១', labelEn: '1st Floor' },
                      { id: '2nd', labelKh: 'ជាន់ទី២', labelEn: '2nd Floor' },
                      { id: '3rd', labelKh: 'ជាន់ទី៣', labelEn: '3rd Floor' },
                      { id: '4th', labelKh: 'ជាន់ទី៤', labelEn: '4th Floor' },
                      { id: '5th', labelKh: 'ជាន់ទី៥', labelEn: '5th Floor' },
                    ].map((fl) => {
                      const isActive = activeFloor === fl.id;
                      return (
                        <button
                          key={fl.id}
                          onClick={() => {
                            setActiveFloor(fl.id);
                          }}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer relative overflow-hidden ${
                            isActive
                              ? `bg-slate-900 border-slate-900 text-white shadow-md scale-[1.03]`
                              : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-100/60 hover:border-slate-350'
                          }`}
                        >
                          <span className="text-xs font-black">{fl.labelKh}</span>
                          <span className={`text-[9px] font-bold mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>{fl.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. View Mode Toggle Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-1 pb-2 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActiveFloorViewMode('map')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeFloorViewMode === 'map'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>🗺️ ប្លង់កៅអី & បន្ទប់ (Interactive Seat Map)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFloorViewMode('excel')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeFloorViewMode === 'excel'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-550 hover:text-slate-800'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>📈 តារាងគំរូ Excel (Spreadsheet List)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFloorViewMode('custom')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeFloorViewMode === 'custom'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-550 hover:text-slate-800'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>📂 ប្លង់ស្កែន PDF/Excel (Custom Scans)</span>
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                    ជម្រើសបង្ហាញ៖ <strong className="text-slate-700 font-black">{activeFloorViewMode === 'map' ? 'ប្លង់កៅអី' : activeFloorViewMode === 'excel' ? 'តារាង Excel' : 'ឯកសារផ្ទាល់ខ្លួន'}</strong>
                  </span>
                </div>

                {/* 3. View Mode Content Renders */}
                {activeFloorViewMode === 'map' && (
                  /* Custom high-fidelity interactive visual class/seat layout */
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-sky-50 to-indigo-50/50 border border-sky-100/60 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2 text-indigo-950">
                        <Sparkles className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <p className="font-extrabold text-[12px] text-slate-800">ប្លង់បន្ទប់សិក្សានិងតារាងកៅអីសិស្ស (Interactive Seat Map)</p>
                          <p className="text-slate-500 font-semibold text-[11px] mt-0.5">
                            សូមចុចលើបន្ទប់សិក្សាណាមួយ ខាងក្រោម ដើម្បីទស្សនាការចាត់ចែងកៅអី ឈ្មោះសិស្ស និងឧបករណ៍សុវត្ថិភាពក្នុងបន្ទប់នីមួយៗ។
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      {/* Left: Rooms Layout grid of that floor */}
                      <div className="lg:col-span-2 space-y-3">
                        <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                          <div className="flex items-center justify-between mb-3 text-xs font-extrabold">
                            <span className="text-slate-500 uppercase tracking-wider">បន្ទប់សិក្សាបង្គោលក្នុងជាន់នេះ (Main Floor Rooms)</span>
                            <span className="text-indigo-600">សរុប {FLOOR_ROOM_TEMPLATES[activeFloor]?.length || 0} បន្ទប់</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {FLOOR_ROOM_TEMPLATES[activeFloor]?.map((room) => {
                              const isSelected = selectedRoomId === room.id || (!selectedRoomId && FLOOR_ROOM_TEMPLATES[activeFloor]?.[0]?.id === room.id);
                              return (
                                <button
                                  type="button"
                                  key={room.id}
                                  onClick={() => setSelectedRoomId(room.id)}
                                  className={`w-full text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                                    isSelected
                                      ? 'border-indigo-600 bg-white shadow-md ring-2 ring-indigo-600/10 scale-[1.01]'
                                      : 'bg-white border-slate-150 hover:border-slate-250 hover:shadow-xs'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-1 w-full">
                                      <span className="text-[10px] font-mono font-black text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-1.5 py-0.5">{room.id.toUpperCase()}</span>
                                      <span className={`text-[9px] px-1 py-0.2 rounded-md font-bold uppercase ${
                                        room.status === 'active' 
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                          : room.status === 'busy'
                                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                            : 'bg-slate-100 text-slate-500'
                                      }`}>
                                        {room.status === 'active' ? 'សកម្ម (Active)' : room.status === 'busy' ? 'មមាញឹក (Busy)' : 'ថែទាំ'}
                                      </span>
                                    </div>
                                    <h4 className="text-xs sm:text-[13px] font-extrabold text-slate-800 line-clamp-1 mt-2">{room.nameKh}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold font-mono mt-0.5">{room.nameEn}</p>
                                  </div>

                                  <div className="flex items-center justify-between text-[10px] text-slate-555 font-bold pt-2 border-t border-slate-100 mt-2 w-full">
                                    <span>គ្រូ៖ <strong className="text-slate-705">{room.teacher.split(' (')[0]}</strong></span>
                                    <span>សិស្ស៖ <strong className="text-slate-800 font-black font-mono">{room.currentStudents}/{room.capacity}</strong></span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Right: Room visual student desk seating arrangement panel */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                        {(() => {
                          const room = FLOOR_ROOM_TEMPLATES[activeFloor]?.find(r => r.id === selectedRoomId) || FLOOR_ROOM_TEMPLATES[activeFloor]?.[0];
                          if (!room) {
                            return (
                              <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                                <Layers className="w-10 h-10 text-slate-300 animate-bounce mb-2" />
                                <p className="text-xs text-slate-500 font-extrabold">គ្មានបន្ទប់ក្នុងជាន់នេះលម្អិត</p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-4">
                              <div className="border-b border-slate-100 pb-3">
                                <span className="text-[9px] font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md px-1.5 py-0.5">{room.id.toUpperCase()}</span>
                                <h3 className="text-xs sm:text-sm font-black text-slate-800 mt-1">{room.nameKh}</h3>
                                <p className="text-[10px] text-slate-400 font-bold font-mono">{room.nameEn}</p>
                              </div>

                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl">
                                  <span className="text-slate-400 font-extrabold text-[9px] uppercase">គ្រូបង្រៀន (Teacher):</span>
                                  <span className="font-extrabold text-slate-800 text-right">{room.teacher}</span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl">
                                  <span className="text-slate-400 font-extrabold text-[9px] uppercase">សិស្សសកម្ម (Students):</span>
                                  <span className="font-extrabold text-slate-800 font-mono text-right">{room.currentStudents} / {room.capacity}</span>
                                </div>
                              </div>

                              {/* Layout Classroom Desk Schema */}
                              <div className="space-y-2.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                  ប្លង់កៅអីសិស្សនៅក្នុងថ្នាក់ (Whiteboard Seating Chart)
                                </span>
                                
                                {/* Whiteboard Indicator */}
                                <div className="bg-slate-100 border border-slate-305 text-slate-550 text-[10px] py-1.5 text-center font-black rounded-lg uppercase tracking-wider">
                                  ក្តារខៀន / ក្តារឆ្លាតវៃ (Whiteboard & Projector Screen)
                                </div>

                                <div className="grid gap-2 border border-slate-150 p-3 bg-slate-50 rounded-xl">
                                  {room.seats.map((rowArr, rowIndex) => (
                                    <div key={rowIndex} className="grid grid-cols-2 gap-1.5">
                                      {rowArr.map((student, colIndex) => (
                                        <div 
                                          key={colIndex} 
                                          className="bg-white border border-slate-200 p-2 rounded-lg text-center shadow-2xs hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                                          title={`សិស្ស៖ ${student}`}
                                        >
                                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mx-auto mb-1 shrink-0" />
                                          <p className="text-[10px] font-black text-slate-700 truncate">{student}</p> 
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>

                                {/* Safety equipment checklist for safety plans */}
                                <div className="pt-2 border-t border-slate-100">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                                    សម្ភារសុវត្ថិភាព & បង្ការ (Safety Equipment)
                                  </span>
                                  <div className="grid grid-cols-2 gap-1.5 text-[9px] font-extrabold text-slate-600">
                                    <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-600 shrink-0" /> បំពង់ពន្លត់អគ្គីភ័យ (Fire Ext)</span>
                                    <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-600 shrink-0" /> ប្រអប់ថ្នាំសង្គ្រោះ (First Aid)</span>
                                    <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-600 shrink-0" /> ច្រកទ្វារសុវត្ថិភាព (Safety Exit)</span>
                                    <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-600 shrink-0" /> ផែនការជម្លៀសខ្លួន (Evac Plan)</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {activeFloorViewMode === 'excel' && (
                  /* Standard Excel Sheet lists, loaded from our floor generator if no custom map is selected */
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-100/80 p-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2 text-emerald-950">
                        <Info className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold text-[12px] text-slate-800">សន្លឹកកិច្ចការគំរូ Excel សម្រាប់ជាន់នេះ (Active Floor Excel Database)</p>
                          <p className="text-slate-500 font-semibold text-[11px] mt-0.5">
                            បញ្ជីបន្ទប់រៀន គ្រូទទួលបន្ទុក និងម៉ោងសិក្សា ដែលបង្កើតឡើងដោយស្វ័យប្រវត្ត។ អ្នកអាចស្វែងរកទិន្នន័យ ឬចុចប៊ូតុងខាងស្តាំដើម្បីទាញយកជាឯកសារ Excel ដើម។
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          // Allow exporting to active excel mock
                          const data = getMockExcelData(activeFloor, 'ថ្នាក់រៀន (Classrooms)');
                          const worksheet = XLSX.utils.json_to_sheet(data);
                          const workbook = XLSX.utils.book_new();
                          XLSX.utils.book_append_sheet(workbook, worksheet, 'Classrooms');
                          XLSX.writeFile(workbook, `WIS_${activeFloor}_Floor_Classrooms.xlsx`);
                        }}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0 shadow-xs select-none"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ទាញយក Excel គំរូនេះ</span>
                      </button>
                    </div>

                    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col h-[525px]">
                      {/* Search bar inside floor spreadsheets finder */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border-b border-slate-200 shrink-0">
                        {/* Sheets Selection Tabs */}
                        <div className="flex flex-wrap gap-1.5">
                          {['ថ្នាក់រៀន (Classrooms)', 'បញ្ជីគ្រូ (Teachers)'].map((sheet) => {
                            const isCurrent = activeSheet === sheet || (!activeSheet && sheet === 'ថ្នាក់រៀន (Classrooms)');
                            return (
                              <button
                                type="button"
                                key={sheet}
                                onClick={() => setActiveSheet(sheet)}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer ${
                                  isCurrent
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                }`}
                              >
                                {sheet}
                              </button>
                            );
                          })}
                        </div>
                        
                        {/* Search spreadsheet bar */}
                        <div className="relative flex-1 max-w-sm">
                          <input
                            type="text"
                            placeholder="ស្វែងរកក្នុងតារាង Excel នៃជាន់បច្ចុប្បន្ន... (Search...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl pl-3.5 pr-10 py-1.5 text-xs font-bold text-slate-805"
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => setSearchQuery('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black hover:text-rose-500 text-slate-400 cursor-pointer"
                            >
                              សម្អាត
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Spreadsheet renderer */}
                      <div className="flex-1 overflow-auto p-4 bg-white">
                        {(() => {
                          const sheetToLoad = activeSheet === 'បញ្ជីគ្រូ (Teachers)' ? 'បញ្ជីគ្រូ (Teachers)' : 'ថ្នាក់រៀន (Classrooms)';
                          const data = getMockExcelData(activeFloor, sheetToLoad);
                          const keys = Object.keys(data[0] || {});
                          
                          const filtered = data.filter((rowArr: any) => {
                            if (!searchQuery) return true;
                            const query = searchQuery.toLowerCase().trim();
                            return keys.some(k => String(rowArr[k] || '').toLowerCase().includes(query));
                          });

                          return (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-[11px] text-slate-400 font-extrabold px-1">
                                <span>រកឃើញចំនួន៖ {filtered.length} ក្នុងចំណោម {data.length} ជួរដេក</span>
                                <span>សន្លឹកបច្ចុប្បន្ន៖ <strong className="text-emerald-700 font-black">{sheetToLoad}</strong></span>
                              </div>

                              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                                <table className="w-full border-collapse text-left text-xs bg-white">
                                  <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black">
                                      <th className="px-4 py-3 text-center w-12 font-mono">№</th>
                                      {keys.map((k) => (
                                        <th key={k} className="px-4 py-3 font-black border-l border-slate-150">{k}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {filtered.map((row: any, rIndex) => (
                                      <tr key={rIndex} className="hover:bg-slate-50/40 border-b border-slate-150 last:border-0">
                                        <td className="px-4 py-2.5 text-center bg-slate-50/50 text-slate-400 font-mono font-bold select-none">{rIndex + 1}</td>
                                        {keys.map((k) => (
                                          <td key={k} className="px-4 py-2.5 font-bold text-slate-700 border-l border-slate-150 max-w-[280px] truncate" title={String(row[k] || '')}>
                                            {String(row[k] || '')}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {activeFloorViewMode === 'custom' && (
                  /* Shows uploader/PDF screen for custom uploaded plans */
                  mapFileUrl ? (
                    <div className="space-y-3.5">
                      {/* PDF Helpful Action Bar */}
                      {mapFileType === 'pdf' && (
                        <div className="bg-gradient-to-r from-sky-50 to-blue-50/50 border border-sky-100/80 p-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                          <div className="flex items-start gap-2 text-sky-950">
                            <Info className="w-4.5 h-4.5 text-sky-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-extrabold text-[12px] text-slate-800">របៀបមើលប្លង់ PDF ឲ្យបានច្បាស់ល្អ (PDF Viewing Guide)</p>
                              <p className="text-slate-500 font-semibold text-[11px] mt-0.5">
                                ប្រសិនបើកម្មវិធីរុករករបស់លោកអ្នកមិនបង្ហាញប្លង់ខាងក្រោមនេះទេ សូមចុចប៊ូតុងខាងស្តាំដើម្បីបើកមើលពេញអេក្រង់ ឬទាញយក។
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={handleOpenInNewTab}
                              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                              <span>បើកក្នុងផ្ទាំងថ្មី (Open Tab)</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleDownload}
                              className="inline-flex items-center gap-1.5 bg-sky-100 hover:bg-sky-200 text-sky-900 font-extrabold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-sky-700" />
                              <span>ទាញយក PDF</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Excel Helpful Action Bar */}
                      {mapFileType === 'excel' && (
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-100/80 p-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                          <div className="flex items-start gap-2 text-emerald-950">
                            <Info className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-extrabold text-[12px] text-slate-800">របៀបប្រើប្រាស់តារាងប្លង់ Excel / Classroom Map</p>
                              <p className="text-slate-500 font-semibold text-[11px] mt-0.5">
                                លោកអ្នកអាចស្វែងរកបន្ទប់រៀន គ្រូ និងទីតាំងនៅក្នុងប្រអប់ស្វែងរក ឬទាញយកឯកសារ Excel ដើមមកវិញបាន។
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={handleDownload}
                              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>ទាញយក Excel</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <div className={`transition-all duration-300 relative bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/80 ${
                        isFullscreen 
                          ? 'h-[85vh] fixed inset-4 z-[9999] bg-slate-900/95 p-4 flex flex-col' 
                          : mapFileType === 'pdf' 
                            ? 'h-[240px] flex flex-col' 
                            : 'h-[420px] flex flex-col'
                      }`}>
                        {isFullscreen && (
                          <div className="flex items-center justify-between bg-slate-800 text-white px-4 py-2 rounded-xl mb-4">
                            <span className="text-xs font-bold font-mono tracking-wider truncate">{mapFileName}</span>
                            <button
                              type="button"
                              onClick={() => setIsFullscreen(false)}
                              className="inline-flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer"
                            >
                              <Minimize2 className="w-4 h-4" /> ផ្អាកបង្ហាញពេញអេក្រង់
                            </button>
                          </div>
                        )}

                        {/* Custom Excel Renderer inside user scan */}
                        {mapFileType === 'excel' ? (
                          <div className="w-full h-full flex-1 flex flex-col bg-white overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border-b border-slate-200 shrink-0">
                              <div className="flex flex-wrap gap-1.5">
                                {excelSheets.map((sheet) => (
                                  <button
                                    type="button"
                                    key={sheet}
                                    onClick={() => handleSheetChange(sheet)}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer ${
                                      activeSheet === sheet
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                    }`}
                                  >
                                    {sheet}
                                  </button>
                                ))}
                              </div>
                              <div className="relative flex-1 max-w-sm">
                                <input
                                  type="text"
                                  placeholder="ស្វែងរកក្នុងតារាង Excel..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded-xl pl-3.5 pr-10 py-1.5 text-xs font-bold text-slate-805"
                                />
                              </div>
                            </div>
                            <div className="flex-1 overflow-auto p-4 bg-white">
                              {excelData.length === 0 ? (
                                <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 font-extrabold text-xs">គ្មានទិន្នន័យ</div>
                              ) : (
                                (() => {
                                  const allKeys: string[] = (Array.from(new Set(excelData.reduce((acc: any, obj: any) => [...acc, ...Object.keys(obj)], []))) as string[]).filter(k => k !== '__rowNum__');
                                  const filteredData = excelData.filter((row: any) => {
                                    if (!searchQuery) return true;
                                    const q = searchQuery.toLowerCase();
                                    return allKeys.some(k => String(row[k] || '').toLowerCase().includes(q));
                                  });
                                  return (
                                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                                      <table className="w-full border-collapse text-left text-xs bg-white">
                                        <thead>
                                          <tr className="bg-slate-50 text-slate-600 font-black border-b border-slate-200">
                                            <th className="px-4 py-3 text-center w-12 font-mono">№</th>
                                            {allKeys.map(k => <th key={String(k)} className="px-4 py-3 border-l border-slate-150">{String(k)}</th>)}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {filteredData.map((row: any, rIdx) => (
                                            <tr key={rIdx} className="hover:bg-slate-50/40 border-b border-slate-150 last:border-0">
                                              <td className="px-4 py-2 text-center bg-slate-50/30 font-mono text-slate-400">{rIdx + 1}</td>
                                              {allKeys.map(k => <td key={String(k)} className="px-4 py-2 text-slate-705 border-l border-slate-150">{String(row[k] || '')}</td>)}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  );
                                })()
                              )}
                            </div>
                          </div>
                        ) : mapFileType === 'pdf' ? (
                          <div className="w-full h-full flex-1 flex flex-col items-center justify-center bg-slate-50 border border-slate-150 p-6 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mb-3 shadow-2xs">
                              <FileText className="w-8 h-8 animate-pulse" />
                            </div>
                            <h3 className="text-xs sm:text-sm font-black text-slate-855 font-mono select-all">
                              {mapFileName}
                            </h3>
                            <p className="text-[10px] text-slate-500 font-semibold max-w-sm mt-1 mb-4">
                              ឯកសារ PDF របស់លោកអ្នកសម្រាប់ជាន់នេះត្រូវបានរក្សាទុកក្នុងទិន្នន័យ IndexedDB ដោយសុវត្ថិភាព។
                            </p>
                            <div className="flex gap-2 justify-center">
                              <button type="button" onClick={handleOpenInNewTab} className="bg-slate-900 text-teal-400 px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-800 transition shadow-xs flex items-center gap-1 cursor-pointer">
                                <ExternalLink className="w-3.5 h-3.5" /> បើក PDF ពេញអេក្រង់
                              </button>
                              <button type="button" onClick={handleDownload} className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1 cursor-pointer">
                                <Download className="w-3.5 h-3.5" /> ទាញយក
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex-1 flex items-center justify-center bg-slate-950 p-2 overflow-auto">
                            <img src={blobUrl || mapFileUrl || undefined} alt={mapFileName} className="max-w-full max-h-full object-contain rounded-lg" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* If no custom map file has been loaded for the active floor yet, show a beautiful customized upload zone in the floor view mode */
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-slate-200 hover:border-slate-350 bg-slate-50/50 rounded-2xl p-8 text-center transition flex flex-col items-center justify-center min-h-[220px]">
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          className="hidden" 
                          accept=".pdf, .xlsx, .xls, image/*"
                          onChange={handleChange}
                        />
                        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6 animate-pulse" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-700">
                          សូមបង្ហោះឯកសារប្លង់សិក្សា PDF, Excel ឬរូបភាពសម្រាប់ស្កែនរបស់លោកអ្នក សម្រាប់ {activeFloor === 'ground' ? 'ជាន់ផ្ទាល់ដី' : `ជាន់ទី${activeFloor[0]}`}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">
                          សន្លឹកប្លង់ផ្លូវការ PDF ឬតារាងថ្នាក់រៀន Excel នឹងត្រូវរក្សាទុកដាច់ដោយឡែកសម្រាប់ជាន់នេះ។
                        </p>
                        <button
                          type="button"
                          onClick={onButtonClick}
                          className="mt-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                        >
                          ជ្រើសរើសឯកសារបង្ហោះចូល (Choose File)
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              /* Viewing Library and Import Interface */
              <div className="space-y-6">
                
                {/* Upper section: Importer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                  
                  {/* Left Side: Import Source Selector & Form */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        <span>នាំចូលឯកសារថ្មី (Import New Document)</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        ជ្រើសរើសប្រភពដើម្បីបញ្ចូលប្លង់សាលា ឬតារាងបន្ទប់រៀនទៅកាន់បណ្ណាល័យសកម្ម។
                      </p>
                    </div>

                    {/* Source Tab Selector */}
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                      <button
                        onClick={() => setActiveImportSource('local')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          activeImportSource === 'local'
                            ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>ឯកសារក្នុងម៉ាស៊ីន (Local Upload)</span>
                      </button>
                      <button
                        onClick={() => setActiveImportSource('drive')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          activeImportSource === 'drive'
                            ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Cloud className="w-3.5 h-3.5" />
                        <span>Google Drive</span>
                      </button>
                    </div>

                    {/* Category Selector for Next Import */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                        ប្រភេទ / ប្រធានបទឯកសារ (Document Category)
                      </label>
                      <select
                        value={importCategory}
                        onChange={(e: any) => setImportCategory(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer"
                      >
                        <option value="building_plan">ប្លង់បច្ចេកទេស និងអគារ (Building Plans)</option>
                        <option value="class_listings">តារាងបន្ទប់ & គ្រូបង្រៀន (Room & Class Listings)</option>
                        <option value="safety">ផែនការសន្តិសុខ & បង្ការគ្រោះថ្នាក់ (Safety & Assembly)</option>
                        <option value="other">លិខិត ឬឯកសារផ្សេងៗ (Others / General Docs)</option>
                      </select>
                    </div>

                    {/* Source Form Render */}
                    {activeImportSource === 'local' ? (
                      /* Drag & Drop zone */
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center min-h-[170px] ${
                          dragActive 
                            ? "border-sky-500 bg-sky-50/50" 
                            : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                        }`}
                      >
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          className="hidden" 
                          accept=".pdf, .xlsx, .xls, image/*"
                          onChange={handleChange}
                        />
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2.5 shrink-0">
                          <Upload className="w-5 h-5 animate-pulse" />
                        </div>
                        <h4 className="text-[11px] font-black text-slate-700">
                          អូសទាញទម្លាក់ ឬ ចុចបញ្ចូលទីនេះ
                        </h4>
                        <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
                          គាំទ្រ PDF, Excel, រូបភាព (PNG/JPG) ទំហំអតិបរមា 20MB
                        </p>
                        <button 
                          type="button"
                          onClick={onButtonClick}
                          className="mt-3 inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-xs"
                        >
                          ជ្រើសរើសឯកសារ
                        </button>
                      </div>
                    ) : (
                      /* Google Drive View */
                      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3">
                        {!googleUser ? (
                          <div className="text-center py-4 space-y-3">
                            <Cloud className="w-10 h-10 text-slate-300 mx-auto animate-bounce" />
                            <div className="space-y-1">
                              <h4 className="text-[11px] font-black text-slate-700">ភ្ជាប់ជាមួយ Google Drive</h4>
                              <p className="text-[10px] text-slate-500 font-semibold max-w-[240px] mx-auto leading-relaxed">
                                អ្នកអាចស្វែងរក និងនាំចូលឯកសារ PDF, Excel ពីគណនី Google Drive របស់អ្នកដោយផ្ទាល់។
                              </p>
                            </div>
                            <button
                              onClick={handleGoogleSignIn}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-[10px] font-black px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span>ភ្ជាប់គណនី Google</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* Authed User Info */}
                            <div className="flex items-center justify-between bg-white border border-slate-150 p-2.5 rounded-xl">
                              <div className="flex items-center gap-2">
                                {googleUser.photoURL ? (
                                  <img 
                                    src={googleUser.photoURL} 
                                    alt={googleUser.displayName} 
                                    className="w-7 h-7 rounded-full border border-slate-200 shadow-xs"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs">
                                    {(googleUser.displayName || 'G')[0]}
                                  </div>
                                )}
                                <div className="text-[10px] leading-tight">
                                  <p className="font-black text-slate-700 truncate max-w-[120px]">{googleUser.displayName}</p>
                                  <p className="font-bold text-slate-400 font-mono truncate max-w-[125px]">{googleUser.email}</p>
                                </div>
                              </div>
                              <button
                                onClick={handleGoogleSignOut}
                                className="p-1 px-2.5 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg text-[9px] font-black transition cursor-pointer flex items-center gap-1"
                              >
                                <LogOut className="w-3 h-3" />
                                <span>ចាកចេញ</span>
                              </button>
                            </div>

                            {/* Drive Search Bar */}
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="ស្វែងរកក្នុង Google Drive..."
                                value={driveSearchQuery}
                                onChange={(e) => setDriveSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') fetchDriveFiles(driveSearchQuery);
                                }}
                                className="w-full bg-white border border-slate-200 rounded-xl pl-3.5 pr-14 py-1.5 text-[11px] font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                              />
                              <button
                                onClick={() => fetchDriveFiles(driveSearchQuery)}
                                className="absolute right-1 top-1 bottom-1 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[9px] font-black cursor-pointer transition flex items-center justify-center"
                              >
                                <Search className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Drive Files List / Results */}
                            {driveError && (
                              <p className="text-[10px] text-rose-500 font-bold bg-rose-50 p-2 rounded-lg border border-rose-100">{driveError}</p>
                            )}

                            <div className="bg-white border border-slate-150 rounded-xl max-h-[140px] overflow-y-auto divide-y divide-slate-100">
                              {isSearchingDrive ? (
                                <div className="py-6 text-center select-none flex flex-col items-center justify-center gap-1">
                                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                                  <span className="text-[10px] text-slate-450 font-black">កំពុងទាញយកបញ្ជីឯកសារ...</span>
                                </div>
                              ) : driveFiles.length === 0 ? (
                                <div className="py-6 text-center text-[10px] text-slate-400 font-extrabold select-none">
                                  រកមិនឃើញឯកសារ PDF/Excel ក្នុងគណនីឡើយ
                                </div>
                              ) : (
                                driveFiles.map((file) => (
                                  <div key={file.id} className="flex items-center justify-between p-2 hover:bg-slate-50 transition-colors bg-white">
                                    <div className="flex items-center gap-2 truncate flex-1 mr-2">
                                      <FileText className={`w-3.5 h-3.5 shrink-0 ${
                                        file.mimeType.includes('spreadsheet') ? 'text-emerald-500' : 'text-rose-500'
                                      }`} />
                                      <span className="text-[10px] font-black text-slate-700 truncate max-w-[155px]" title={file.name}>
                                        {file.name}
                                      </span>
                                    </div>
                                    <button
                                      disabled={isDriveImporting !== null}
                                      onClick={() => handleImportFromDrive(file)}
                                      className={`px-2 py-1 rounded-lg text-[9px] font-black transition text-white ${
                                        isDriveImporting === file.id
                                          ? 'bg-slate-350 cursor-not-allowed'
                                          : 'bg-emerald-600 hover:bg-emerald-700'
                                      }`}
                                    >
                                      {isDriveImporting === file.id ? 'នាំចូល...' : 'នាំចូល'}
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Side: Simple Explanation of Document Library benefits */}
                  <div className="bg-slate-50 p-5 rounded-2xl flex flex-col justify-between border border-slate-150 relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-sky-200/10 rounded-full blur-xl pointer-events-none" />
                    <div className="space-y-3.5 text-xs">
                      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200">
                        <Sparkles className="w-4 h-4 text-sky-600" />
                        <h4 className="font-extrabold text-slate-800">អត្ថប្រយោជន៍នៃបណ្ណាល័យប្លង់ (The Library Advantage)</h4>
                      </div>
                      <ul className="space-y-2.5 text-slate-550 font-semibold leading-relaxed">
                        <li className="flex gap-2 items-start text-[11px]">
                          <span className="text-sky-600 font-mono mt-0.5 shrink-0">●</span>
                          <span><strong>រក្សាទុកឯកសារមានសុវត្ថិភាព៖</strong> រាល់ឯកសារដែលអ្នកនាំចូលនឹងរក្សាទុកក្នុងឃ្លាំងសម្ងាត់ IndexedDB ដោយផ្ទាល់នៅក្នុងកម្មវិធីរុករក ជៀសវាងការបាត់បង់ពេលធ្វើការ Refresh។</span>
                        </li>
                        <li className="flex gap-2 items-start text-[11px]">
                          <span className="text-sky-600 font-mono mt-0.5 shrink-0">●</span>
                          <span><strong>ប្តូរទិដ្ឋភាពបានរហ័ស៖</strong> អ្នកអាចបង្ហោះបានច្រើនប្លង់ (ឧទាហរណ៍៖ ប្លង់អាគារជាន់ទី១ និងតារាងបន្ទប់សិក្សា Excel ផ្សេងគ្នា) រួចប្តូរចុចមើលត្រឡប់ទៅមកបានភ្លាមៗ។</span>
                        </li>
                        <li className="flex gap-2 items-start text-[11px]">
                          <span className="text-sky-600 font-mono mt-0.5 shrink-0">●</span>
                          <span><strong>ដោះស្រាយបញ្ហា Google Drive Co-op៖</strong> ឯកសារនឹងត្រូវបំប្លែងទៅជា Files និម្មិតយ៉ាងងាយស្រួលដោយស្វ័យប្រវត្ត។</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-white border border-slate-200 p-2.5 rounded-xl text-[10px] text-slate-500 font-extrabold flex items-center justify-between gap-2 mt-4">
                      <span>ឯកសារសរុបក្នុងម៉ាស៊ីន៖ <strong className="text-slate-855 font-black font-mono">{libraryDocs.length}</strong></span>
                      <span className="text-emerald-600 font-black flex items-center gap-0.5 animate-pulse">
                        <CheckCircle className="w-3.5 h-3.5" /> active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lower section: Filter & Documents Grid */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-sky-600" />
                        <span>បញ្ជីឯកសារប្លង់សិក្សាសកម្ម (Database Document Collection)</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        ចុចលើប៊ូតុង "ចុចមើល" ដើម្បីបង្ហាញឯកសារនេះលើផ្ចាំទស្សនាការណ៍។
                      </p>
                    </div>

                    {/* Filter Navigation Category */}
                    <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
                      {(['all', 'building_plan', 'class_listings', 'safety', 'other'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedLibraryCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                            selectedLibraryCategory === cat
                              ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {cat === 'all' && 'ទាំងអស់'}
                          {cat === 'building_plan' && 'ប្លង់អគារ'}
                          {cat === 'class_listings' && 'តារាងបន្ទប់/គ្រូ'}
                          {cat === 'safety' && 'ផ្នែកសុវត្ថិភាព'}
                          {cat === 'other' && 'ផ្សេងៗ'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Document Grid */}
                  {(() => {
                    const filtered = libraryDocs.filter(doc => 
                      selectedLibraryCategory === 'all' || doc.category === selectedLibraryCategory
                    );

                    if (filtered.length === 0) {
                      return (
                        <div className="py-12 border border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/20 max-w-lg mx-auto">
                          <FolderOpen className="w-10 h-10 text-slate-350 mx-auto animate-pulse mb-2.5" />
                          <h4 className="text-xs font-black text-slate-700">គ្មានឯកសារសម្រាប់ប្រភេទនេះឡើយ (No Docs Registered)</h4>
                          <p className="text-[10px] text-slate-400 font-medium max-w-xs mx-auto mt-1 leading-relaxed">
                            សូមជ្រើសរើស ឯកសារក្នុងម៉ាស៊ីន (Local Upload) ឬ Google Drive ខាងលើ ដើម្បីបញ្ចូលឯកសារដំបូងទៅកាន់ប្រព័ន្ធ។
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map((doc) => {
                          const dateString = doc.createdAt 
                            ? new Date(doc.createdAt).toLocaleDateString('kh-KH', { year: 'numeric', month: 'short', day: 'numeric' })
                            : 'គ្មានកាលបរិច្ឆេទ';
                            
                          return (
                            <div 
                              key={doc.id}
                              onClick={() => {
                                handleSelectDocFromLibrary(doc);
                                setIsViewingLibrary(false);
                              }}
                              className={`group p-4 border rounded-2xl bg-white hover:bg-slate-50/50 transition cursor-pointer flex items-start gap-3.5 relative overflow-hidden ${
                                mapFileName === doc.name
                                  ? 'border-emerald-500 shadow-xs ring-1 ring-emerald-500/10'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {mapFileName === doc.name && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg">
                                  Active
                                </div>
                              )}

                              {/* Document Type Indicator Icon */}
                              <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-xs ${
                                doc.type === 'pdf' 
                                  ? 'bg-rose-50 text-rose-600'
                                  : doc.type === 'excel'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-blue-50 text-blue-600'
                              }`}>
                                <FileText className="w-5 h-5" />
                              </div>

                              {/* Document Info */}
                              <div className="flex-1 truncate space-y-1">
                                <h4 className="text-[11px] sm:text-xs font-black text-slate-800 truncate group-hover:text-slate-950 transition-colors" title={doc.name}>
                                  {doc.name}
                                </h4>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-slate-400 font-extrabold uppercase">
                                  <span>{dateString}</span>
                                  <span className="text-slate-300 font-mono">•</span>
                                  <span className="text-slate-500">
                                    {doc.category === 'building_plan' && 'ប្លង់អគារ'}
                                    {doc.category === 'class_listings' && 'តារាងបន្ទប់'}
                                    {doc.category === 'safety' && 'ផ្នែកសុវត្ថិភាព'}
                                    {doc.category === 'other' && 'General'}
                                  </span>
                                  <span className="text-slate-300 font-mono">•</span>
                                  <span className="bg-slate-100 text-slate-500 px-1 py-0.2 rounded-md font-mono">{doc.type}</span>
                                </div>
                              </div>

                              {/* Hover Selection or Delete Actions */}
                              <div className="flex items-center gap-1 shrink-0 ml-1.5 self-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectDocFromLibrary(doc);
                                    setIsViewingLibrary(false);
                                  }}
                                  className={`p-1.5 rounded-lg text-[10px] font-black transition cursor-pointer inline-flex items-center gap-1 ${
                                    mapFileName === doc.name
                                      ? 'bg-emerald-50 text-emerald-855 border border-emerald-250/30 font-black'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {mapFileName === doc.name ? 'សកម្ម' : 'ចុចមើល'}
                                </button>
                                <button
                                  onClick={(e) => handleDeleteDocFromLibrary(e, doc.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer bg-white"
                                  title="លុបឯកសារ"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Sidebar Guidelines and Assembly Info */}
        <div className="space-y-4">
          
          {/* Quick List of Campus Zones (Simple Selector Sidebar) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-slate-700 pb-2 border-b border-slate-100">
              បញ្ជីតំបន់គ្រប់គ្រង (All Zones)
            </h3>
            <div className="space-y-2">
              {campusZones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => {
                    setActiveZone(zone.id);
                    if (mapFileUrl) {
                      // If a map file is uploaded, explain how to read details
                    }
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${zone.color} ${
                    activeZone === zone.id 
                      ? 'bg-slate-50 border-slate-300 shadow-xs' 
                      : 'bg-white hover:bg-slate-50 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 line-clamp-1">{zone.name}</span>
                    {activeZone === zone.id && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">{zone.levels}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Security Instruction Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-slate-700 pb-2 border-b border-slate-100">
              សន្តិសុខ និងកិច្ចការពារសង្គ្រោះ (Safety & Assembly)
            </h3>
            
            <div className="space-y-2.5 text-xs text-slate-650">
              <div className="flex items-start gap-2 bg-rose-50 border border-rose-100/50 p-2.5 rounded-xl text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <h4 className="font-extrabold text-[11px]">ទីតាំងជួបជុំពេលអាសន្ន</h4>
                  <p className="text-[10px] leading-relaxed mt-0.5">
                    ទីធ្លារត់លេងខាងក្នុងសាលា ជិតតារាងបាល់បោះ (Main Playground Assembly Point)។
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100/50 p-2.5 rounded-xl text-blue-800">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                <div>
                  <h4 className="font-extrabold text-[11px]">លេខទូរស័ព្ទសង្គ្រោះបន្ទាន់</h4>
                  <p className="text-[10px] font-mono leading-relaxed mt-0.5 font-bold">
                    Admin Office: 023-222-XXX / Fire Dept: 118
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
