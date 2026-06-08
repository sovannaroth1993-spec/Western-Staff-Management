/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Home, Monitor, Music, Shield, Dumbbell, Sofa, Search, PlusCircle, Edit2, Trash2, 
  X, Check, AlertTriangle, Download, Info, FileText, BarChart3, Settings, RefreshCw, 
  Camera, Layers, School, ShoppingBag, Eye, Printer, Upload, CheckSquare, Sparkles, Send
} from 'lucide-react';

export type RoomCategory = 'Classroom' | 'ComputerRoom' | 'PianoRoom' | 'DanceRoom' | 'HomeEco';

export const ROOM_CATEGORIES_KM: Record<RoomCategory, string> = {
  Classroom: 'នៅក្នុងបន្ទប់រៀន (Classroom)',
  ComputerRoom: 'បន្ទប់កុំព្យូទ័រ (Computer Room)',
  PianoRoom: 'បន្ទប់ព្យាណូ (Piano Room)',
  DanceRoom: 'បន្ទប់រាំ (Dance Room)',
  HomeEco: 'Home-Eco Room'
};

export const ROOM_CATEGORIES_EMOJI: Record<RoomCategory, string> = {
  Classroom: '🏫',
  ComputerRoom: '💻',
  PianoRoom: '🎹',
  DanceRoom: '💃',
  HomeEco: '🍳'
};

export type AssetCondition = 'Operational' | 'Maintenance' | 'Broken';

export const CONDITION_STATUS_KM: Record<AssetCondition, { label: string; color: string; bg: string }> = {
  Operational: { label: 'អាចប្រើប្រាស់បានធម្មតា (Operational)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', bg: 'bg-emerald-500' },
  Maintenance: { label: 'កំពុងជួសជុល/ថែទាំ (Maintenance)', color: 'text-amber-700 bg-amber-50 border-amber-200', bg: 'bg-amber-500' },
  Broken: { label: 'ខូច/មិនអាចប្រើបាន (Broken)', color: 'text-rose-700 bg-rose-50 border-rose-200', bg: 'bg-rose-500' }
};

export interface OtherAsset {
  id: string; // e.g., WIS-OTH-001
  name: string; // Name of material/equipment
  roomCategory: RoomCategory;
  specificRoom: string; // specific room name/number (e.g., "Room 204", "IT Lab B")
  brand: string; // Brand (e.g., Yamaha, Singer, Dell)
  model: string; // Model info / Specification
  quantity: number; // Qty of items
  unit: string; // Unit (e.g., "គ្រឿង", "ឈុត", "ផ្ទាំង")
  assignedStaff: string; // Staff in charge
  condition: AssetCondition;
  purchaseDate: string; // YYYY-MM-DD
  costUsd: number; // Price in USD
  serialNumber?: string; // Serial / code
  notes?: string;
  grade?: string;
  roomNumber?: string;
}

export const GRADE_LABELS_KM: Record<string, string> = {
  All: 'គ្រប់ថ្នាក់ ទាំងអស់ (All Grades)',
  Nursery: 'ថ្នាក់មត្តេយ្យសំបុកកូនឈើ (Nursery)',
  Kindergarten: 'ថ្នាក់មត្តេយ្យកម្រិតខ្ពស់ (Kindergarten)',
  'Grade 1': 'ថ្នាក់ទី១ (Grade 1)',
  'Grade 2': 'ថ្នាក់ទី២ (Grade 2)',
  'Grade 3': 'ថ្នាក់ទី៣ (Grade 3)',
  'Grade 4': 'ថ្នាក់ទី៤ (Grade 4)',
  'Grade 5': 'ថ្នាក់ទី៥ (Grade 5)',
  'Grade 6': 'ថ្នាក់ទី៦ (Grade 6)',
  'Grade 7': 'ថ្នាក់ទី៧ (Grade 7)',
  'Grade 8': 'ថ្នាក់ទី៨ (Grade 8)',
  'Grade 9': 'ថ្នាក់ទី៩ (Grade 9)',
  'Grade 10': 'ថ្នាក់ទី១០ (Grade 10)',
  'Grade 11': 'ថ្នាក់ទី១១ (Grade 11)',
  'Grade 12': 'ថ្នាក់ទី១២ (Grade 12)',
  None: 'ថ្នាក់ឯកទេស/បន្ទប់ផ្សេងៗ (Specialty Room)'
};

export function parseGradeAndRoom(asset: Partial<OtherAsset>): { grade: string; roomNumber: string } {
  let grade = 'None';
  let roomNumber = '';

  // Extract Grade from specificRoom or name
  const textToSearch = `${asset.name || ''} ${asset.specificRoom || ''}`.toLowerCase();
  if (textToSearch.includes('nursery') || textToSearch.includes('ថ្នាក់ (n)') || textToSearch.includes('មត្តេយ្យសំបុក')) {
    grade = 'Nursery';
  } else if (textToSearch.includes('kindergarten') || textToSearch.includes('ថ្នាក់ (k)') || textToSearch.includes('មត្តេយ្យកម្រិតខ្ពស់')) {
    grade = 'Kindergarten';
  } else if (textToSearch.includes('grade 1') || textToSearch.includes('ថ្នាក់ទី១') || textToSearch.includes('g01')) {
    grade = 'Grade 1';
  } else if (textToSearch.includes('grade 2') || textToSearch.includes('ថ្នាក់ទី២') || textToSearch.includes('g02')) {
    grade = 'Grade 2';
  } else if (textToSearch.includes('grade 3') || textToSearch.includes('ថ្នាក់ទី៣') || textToSearch.includes('g03')) {
    grade = 'Grade 3';
  } else if (textToSearch.includes('grade 4') || textToSearch.includes('ថ្នាក់ទី៤') || textToSearch.includes('g04')) {
    grade = 'Grade 4';
  } else if (textToSearch.includes('grade 5') || textToSearch.includes('ថ្នាក់ទី៥') || textToSearch.includes('g05')) {
    grade = 'Grade 5';
  } else if (textToSearch.includes('grade 6') || textToSearch.includes('ថ្នាក់ទី៦') || textToSearch.includes('g06')) {
    grade = 'Grade 6';
  } else if (textToSearch.includes('grade 7') || textToSearch.includes('ថ្នាក់ទី៧') || textToSearch.includes('g07')) {
    grade = 'Grade 7';
  } else if (textToSearch.includes('grade 8') || textToSearch.includes('ថ្នាក់ទី៨') || textToSearch.includes('g08')) {
    grade = 'Grade 8';
  } else if (textToSearch.includes('grade 9') || textToSearch.includes('ថ្នាក់ទី៩') || textToSearch.includes('g09')) {
    grade = 'Grade 9';
  } else if (textToSearch.includes('grade 10') || textToSearch.includes('ថ្នាក់ទី១០') || textToSearch.includes('g10')) {
    grade = 'Grade 10';
  } else if (textToSearch.includes('grade 11') || textToSearch.includes('ថ្នាក់ទី១១') || textToSearch.includes('g11')) {
    grade = 'Grade 11';
  } else if (textToSearch.includes('grade 12') || textToSearch.includes('ថ្នាក់ទី១២') || textToSearch.includes('g12')) {
    grade = 'Grade 12';
  }

  // Extract Room Number (e.g., "បន្ទប់ ២០១", "បន្ទប់ ២០២", "Room 204", "IT Lab B")
  const roomMatch = (asset.specificRoom || '').match(/(បន្ទប់\s*\d+|room\s*\d+|it\s*lab[-A-Z]*|piano\s*lab\s*\d+|home-eco|បន្ទប់\s*[ក-អ])/i);
  if (roomMatch) {
    roomNumber = roomMatch[0];
  } else {
    roomNumber = asset.specificRoom || '';
  }

  return { grade, roomNumber };
}

const DEFAULT_OTHER_ASSETS: OtherAsset[] = [
  // NURSERY (N)
  {
    id: 'WIS-OTH-N01',
    name: 'តុឈើសិស្សតូចរាងពាក់កណ្តាលរង្វង់ (Nursery Desks)',
    roomCategory: 'Classroom',
    specificRoom: 'ថ្នាក់មត្តេយ្យសំបុកកូនឈើ ថ្នាក់ (N)',
    brand: 'KinderWood',
    model: 'KW-SemiCircular-2024',
    quantity: 20,
    unit: 'តុ',
    assignedStaff: 'Seng Sreypich',
    condition: 'Operational',
    purchaseDate: '2024-09-01',
    costUsd: 45,
    serialNumber: 'SGR-TAB-01/20',
    notes: 'តុឈើជ្រុងសងខាងមូលការពារការប៉ះទង្គិចសម្រាប់កុមារតូច'
  },
  {
    id: 'WIS-OTH-N02',
    name: 'កៅអីជ័រចម្រុះពណ៌ខ្នាតតូចកុមារ (Nursery Chairs)',
    roomCategory: 'Classroom',
    specificRoom: 'ថ្នាក់មត្តេយ្យសំបុកកូនឈើ ថ្នាក់ (N)',
    brand: 'Toyo Plast',
    model: 'TY-Kids-Ergo',
    quantity: 20,
    unit: 'កៅអី',
    assignedStaff: 'Seng Sreypich',
    condition: 'Operational',
    purchaseDate: '2024-09-01',
    costUsd: 15,
    serialNumber: 'SGR-CHR-01/20',
    notes: 'កៅអីជ័រការពាររបូតគូទសិស្សតូច'
  },
  {
    id: 'WIS-OTH-N03',
    name: 'កុំព្យូទ័រគ្រូបង្រៀន All-in-One PC HP',
    roomCategory: 'Classroom',
    specificRoom: 'ថ្នាក់មត្តេយ្យសំបុកកូនឈើ ថ្នាក់ (N)',
    brand: 'HP',
    model: 'ProOne 440 G9',
    quantity: 1,
    unit: 'គ្រឿង',
    assignedStaff: 'Seng Sreypich',
    condition: 'Operational',
    purchaseDate: '2024-10-10',
    costUsd: 650,
    serialNumber: 'CNG3458FGG',
    notes: 'កុំព្យូទ័រគ្រូសម្រាប់បង្ហាញចម្រៀងគំនូរជីវចល'
  },

  // Kindergarten (K)
  {
    id: 'WIS-OTH-K01',
    name: 'តុឈើសិស្សតូចរាងពាក់កណ្តាលរង្វង់ (Kindergarten)',
    roomCategory: 'Classroom',
    specificRoom: 'ថ្នាក់មត្តេយ្យកម្រិតខ្ពស់ ថ្នាក់ (K)',
    brand: 'KinderWood',
    model: 'KW-SemiCircular-2024',
    quantity: 20,
    unit: 'តុ',
    assignedStaff: 'Hem Sreyleak',
    condition: 'Operational',
    purchaseDate: '2024-09-01',
    costUsd: 45,
    serialNumber: 'KND-TAB-01/20',
    notes: 'តុឈើវែងសម្រាប់ធ្វើការងារជាក្រុម'
  },
  {
    id: 'WIS-OTH-K02',
    name: 'កៅអីជ័រចម្រុះពណ៌ខ្នាតតូចកុមារ (Kindergarten)',
    roomCategory: 'Classroom',
    specificRoom: 'ថ្នាក់មត្តេយ្យកម្រិតខ្ពស់ ថ្នាក់ (K)',
    brand: 'Toyo Plast',
    model: 'TY-Kids-Ergo',
    quantity: 20,
    unit: 'កៅអី',
    assignedStaff: 'Hem Sreyleak',
    condition: 'Operational',
    purchaseDate: '2024-09-01',
    costUsd: 15,
    serialNumber: 'KND-CHR-01/20',
    notes: 'កៅអីជ័រស្រាលងាយស្រួលរៀបចំ'
  },
  {
    id: 'WIS-OTH-K03',
    name: 'កុំព្យូទ័រគ្រូបង្រៀន AIO Dell OptiPlex',
    roomCategory: 'Classroom',
    specificRoom: 'ថ្នាក់មត្តេយ្យកម្រិតខ្ពស់ ថ្នាក់ (K)',
    brand: 'Dell',
    model: 'OptiPlex 7410 AIO',
    quantity: 1,
    unit: 'គ្រឿង',
    assignedStaff: 'Hem Sreyleak',
    condition: 'Operational',
    purchaseDate: '2024-10-12',
    costUsd: 720,
    serialNumber: 'DLL-984210B',
    notes: 'កុំព្យូទ័រសម្រាប់គ្រូកម្រិតមត្តេយ្យ'
  },

  // GRADE 1 (ថ្នាក់ទី១)
  {
    id: 'WIS-OTH-G01A',
    name: 'តុឈើទំនើបសម្រាប់សិស្ស (Grade 1)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ២០១ ជាន់ទី២ (Grade 1)',
    brand: 'SchoolFurn',
    model: 'SF-Desk-Single',
    quantity: 20,
    unit: 'តុ',
    assignedStaff: 'Long Dalin',
    condition: 'Operational',
    purchaseDate: '2024-09-05',
    costUsd: 35,
    serialNumber: 'G1-TAB-01/20',
    notes: 'តុសិស្សទោលជើងដែកថែបក្រាស់'
  },
  {
    id: 'WIS-OTH-G01B',
    name: 'កៅអីឈើបង្អែកដែកសិស្ស (Grade 1)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ២០១ ជាន់ទី២ (Grade 1)',
    brand: 'SchoolFurn',
    model: 'SF-Chair-Metal',
    quantity: 20,
    unit: 'កៅអី',
    assignedStaff: 'Long Dalin',
    condition: 'Operational',
    purchaseDate: '2024-09-05',
    costUsd: 18,
    serialNumber: 'G1-CHR-01/20',
    notes: 'កៅអីអង្គុយស្រួល មិនឈឺខ្នង'
  },
  {
    id: 'WIS-OTH-G01C',
    name: 'កុំព្យូទ័រគ្រូបង្រៀន HP ProOne (Grade 1)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ២០១ ជាន់ទី២ (Grade 1)',
    brand: 'HP',
    model: 'ProOne 440 G9',
    quantity: 1,
    unit: 'គ្រឿង',
    assignedStaff: 'Long Dalin',
    condition: 'Operational',
    purchaseDate: '2024-10-02',
    costUsd: 650,
    serialNumber: 'HPZO1024',
    notes: 'ប្រព័ន្ធគ្រប់គ្រងមេរៀន និងគំនូរបង្ហាញ'
  },

  // GRADE 2 (ថ្នាក់ទី២)
  {
    id: 'WIS-OTH-G02A',
    name: 'តុឈើសិស្សវែង និងកៅអីកាងដែក (Grade 2)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ២០២ ជាន់ទី២ (Grade 2)',
    brand: 'Standard Furn',
    model: 'SF-Wood-Double',
    quantity: 10,
    unit: 'ឈុត',
    assignedStaff: 'Chan Sothea',
    condition: 'Operational',
    purchaseDate: '2024-09-05',
    costUsd: 120,
    serialNumber: 'G2-SET-01/10',
    notes: 'ឈុតតុវែង និងកៅអីវែងអង្គុយជាគូ (២ នាក់ក្នុង ១ ឈុត ស្មើ ២០ កៅអី)'
  },
  {
    id: 'WIS-OTH-G02B',
    name: 'កុំព្យូទ័រគ្រូបង្រៀន Lenovo ThinkCentre',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ២០២ ជាន់ទី២ (Grade 2)',
    brand: 'Lenovo',
    model: 'ThinkCentre Neo 30a',
    quantity: 1,
    unit: 'គ្រឿង',
    assignedStaff: 'Chan Sothea',
    condition: 'Operational',
    purchaseDate: '2024-10-18',
    costUsd: 680,
    serialNumber: 'LNV-885412A',
    notes: 'កុំព្យូទ័រសម្រាប់គ្រូកត់ត្រារៀនសរសេររបស់សិស្ស'
  },

  // GRADE 3 (ថ្នាក់ទី៣)
  {
    id: 'WIS-OTH-G03A',
    name: 'តុ-កៅអីឈើសិស្សទោល (Grade 3 - 20 sets)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ២០៣ ជាន់ទី២ (Grade 3)',
    brand: 'EcoFurn',
    model: 'EF-Ergo-2024',
    quantity: 20,
    unit: 'ឈុត',
    assignedStaff: 'Keo Sophea',
    condition: 'Operational',
    purchaseDate: '2024-09-02',
    costUsd: 55,
    serialNumber: 'G3-SET-01/20',
    notes: 'ឈុតតុ Ergonomic សម្រាប់សិស្សថ្នាក់ទី៣'
  },
  {
    id: 'WIS-OTH-G03B',
    name: 'កុំព្យូទ័រយួរដៃគ្រូ Dell Vostro Laptop',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ២០៣ ជាន់ទី២ (Grade 3)',
    brand: 'Dell',
    model: 'Vostro 15 3520',
    quantity: 1,
    unit: 'គ្រឿង',
    assignedStaff: 'Keo Sophea',
    condition: 'Operational',
    purchaseDate: '2024-09-15',
    costUsd: 580,
    serialNumber: 'DLL-VS5482',
    notes: 'ឡេបថបសម្រាប់គ្រូបន្តទៅបញ្ចាំងស្លាយក្នុងថ្នាក់'
  },

  // GRADE 4 (ថ្នាក់ទី៤)
  {
    id: 'WIS-OTH-G04A',
    name: 'តុ-កៅអីឈើសិស្សទោល (Grade 4 - 20 sets)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ២០៤ ជាន់ទី២ (Grade 4)',
    brand: 'EcoFurn',
    model: 'EF-Ergo-2024',
    quantity: 20,
    unit: 'ឈុត',
    assignedStaff: 'Vann Sopheak',
    condition: 'Operational',
    purchaseDate: '2024-09-02',
    costUsd: 55,
    serialNumber: 'G4-SET-01/20',
    notes: 'តុរៀបជាជួរសម្រាប់សិស្សថ្នាក់ទី៤'
  },
  {
    id: 'WIS-OTH-G04B',
    name: 'កុំព្យូទ័រគ្រូ AIO Lenovo Corei5',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ២០៤ ជាន់ទី២ (Grade 4)',
    brand: 'Lenovo',
    model: 'Neo 30a 24',
    quantity: 1,
    unit: 'គ្រឿង',
    assignedStaff: 'Vann Sopheak',
    condition: 'Operational',
    purchaseDate: '2024-11-01',
    costUsd: 690,
    serialNumber: 'LNV-N784110A',
    notes: 'កុំព្យូទ័រសម្រាប់គ្រូបង្ហាត់បង្រៀន'
  },

  // GRADE 5 (ថ្នាក់ទី៥)
  {
    id: 'WIS-OTH-G05A',
    name: 'តុ-កៅអីសិស្សឈើមាំទ្វេដង (Grade 5 - 20 sets)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ៣០១ ជាន់ទី៣ (Grade 5)',
    brand: 'Local Craft',
    model: 'WIS-WDSK-24',
    quantity: 20,
    unit: 'ឈុត',
    assignedStaff: 'Ouk Samnang',
    condition: 'Operational',
    purchaseDate: '2024-08-10',
    costUsd: 120,
    serialNumber: 'G5-SET-01/20',
    notes: 'ឈុតតុវែង និងកៅអីវែងអង្គុយបាន ២នាក់ ស្មើនឹង ២០ គូ សរុប ៤០ កៅអី'
  },
  {
    id: 'WIS-OTH-G05B',
    name: 'កុំព្យូទ័រ All-in-One PC HP ProOne (Grade 5)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ៣០១ ជាន់ទី៣ (Grade 5)',
    brand: 'HP',
    model: 'ProOne 440 G9',
    quantity: 1,
    unit: 'គ្រឿង',
    assignedStaff: 'Ouk Samnang',
    condition: 'Operational',
    purchaseDate: '2024-10-02',
    costUsd: 650,
    serialNumber: 'HP501025',
    notes: 'កុំព្យូទ័រគ្រូសម្រាប់គ្រប់គ្រងបណ្តាញមេរៀន Google Classroom'
  },

  // GRADE 6 (ថ្នាក់ទី៦)
  {
    id: 'WIS-OTH-G06A',
    name: 'តុ-កៅអីសិស្សឈើមាំទ្វេដង (Grade 6 - 20 sets)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ៣០២ ជាន់ទី៣ (Grade 6)',
    brand: 'Local Craft',
    model: 'WIS-WDSK-24',
    quantity: 20,
    unit: 'ឈុត',
    assignedStaff: 'Tep Sokha',
    condition: 'Operational',
    purchaseDate: '2024-08-10',
    costUsd: 120,
    serialNumber: 'G6-SET-01/20',
    notes: 'តុវែងអង្គុយបាន ២នាក់ ស្មើនឹង ៤០ កៅអី'
  },
  {
    id: 'WIS-OTH-G06B',
    name: 'កុំព្យូទ័រគ្រូបង្រៀន AIO Neo 30a (Grade 6)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ៣០២ ជាន់ទី៣ (Grade 6)',
    brand: 'Lenovo',
    model: 'ThinkCentre Neo 30A',
    quantity: 1,
    unit: 'គ្រឿង',
    assignedStaff: 'Tep Sokha',
    condition: 'Operational',
    purchaseDate: '2024-10-22',
    costUsd: 680,
    serialNumber: 'LNV-G6-001',
    notes: 'សម្រាប់ម៉ោងការងារថ្នាក់រៀន និងប្រព័ន្ធកត់ត្រាសិស្សពូកែ'
  },

  // GRADE 7 (ថ្នាក់ទី៧)
  {
    id: 'WIS-OTH-G07A',
    name: 'តុ-កៅអីសិស្សដែក និងឈើវែង (Grade 7 - 20 sets)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ៣០៣ ជាន់ទី៣ (Grade 7)',
    brand: 'IronWood',
    model: 'IW-Double-HD',
    quantity: 20,
    unit: 'ឈុត',
    assignedStaff: 'Nguon Sitha',
    condition: 'Operational',
    purchaseDate: '2024-09-01',
    costUsd: 130,
    serialNumber: 'G7-SET-01/20',
    notes: 'ឈុតតុ និងកៅអីដែកស្វិតស្រោបឈើកៅស៊ូ'
  },
  {
    id: 'WIS-OTH-G07B',
    name: 'កុំព្យូទ័រគ្រូបង្រៀន Dell OptiPlex (Grade 7)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ៣០៣ ជាន់ទី៣ (Grade 7)',
    brand: 'Dell',
    model: 'OptiPlex 3280 AIO',
    quantity: 1,
    unit: 'គ្រឿង',
    assignedStaff: 'Nguon Sitha',
    condition: 'Operational',
    purchaseDate: '2024-09-12',
    costUsd: 710,
    serialNumber: 'DLL-G7-02B',
    notes: 'កុំព្យូទ័រការងាររដ្ឋបាលគ្រូ និងគ្រប់គ្រងសិស្ស'
  },

  // GRADE 8 (ថ្នាក់ទី៨)
  {
    id: 'WIS-OTH-G08A',
    name: 'តុ-កៅអីសិស្សដែក និងឈើវែង (Grade 8 - 20 sets)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ៣០៤ ជាន់ទី៣ (Grade 8)',
    brand: 'IronWood',
    model: 'IW-Double-HD',
    quantity: 20,
    unit: 'ឈុត',
    assignedStaff: 'Nouth Sreypov',
    condition: 'Operational',
    purchaseDate: '2024-09-01',
    costUsd: 130,
    serialNumber: 'G8-SET-01/20',
    notes: 'ឈុតតុ និងកៅអីសម្រាប់សិស្សថ្នាក់ទី៨'
  },
  {
    id: 'WIS-OTH-G08B',
    name: 'កុំព្យូទ័រ All-in-One PC HP ProOne (Grade 8)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ៣០៤ ជាន់ទី៣ (Grade 8)',
    brand: 'HP',
    model: 'ProOne 440 G9',
    quantity: 1,
    unit: 'គ្រឿង',
    assignedStaff: 'Nouth Sreypov',
    condition: 'Operational',
    purchaseDate: '2024-10-02',
    costUsd: 650,
    serialNumber: 'HP801026',
    notes: 'ប្រើសម្រាប់បញ្ចាំងមេរៀនសៀវភៅអេឡិចត្រូនិច'
  },

  // GRADE 9 (ថ្នាក់ទី៩)
  {
    id: 'WIS-OTH-G09A',
    name: 'តុ-កៅអីដែកសិស្សទោលកម្រិតធ្ងន់ (Grade 9 - 20 sets)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ៤០១ ជាន់ទី៤ (Grade 9)',
    brand: 'SteelMax',
    model: 'SM-Single-HD',
    quantity: 20,
    unit: 'ឈុត',
    assignedStaff: 'Srun Moni',
    condition: 'Operational',
    purchaseDate: '2024-08-28',
    costUsd: 65,
    serialNumber: 'G9-SET-01/20',
    notes: 'តុឈើទោលស៊ុមដែកខ្នាតធំស្រួលសម្រាប់សិស្សថ្នាក់ទី៩'
  },
  {
    id: 'WIS-OTH-G09B',
    name: 'កុំព្យូទ័រគ្រូបង្រៀន Lenovo AIO Corei5',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ៤០១ ជាន់ទី៤ (Grade 9)',
    brand: 'Lenovo',
    model: 'Neo 30a',
    quantity: 1,
    unit: 'គ្រឿង',
    assignedStaff: 'Srun Moni',
    condition: 'Operational',
    purchaseDate: '2024-09-10',
    costUsd: 680,
    serialNumber: 'LNV-G912',
    notes: 'កុំព្យូទ័រគ្រូសម្រាប់រៀបចំដំណែងពិន្ទុឆមាស'
  },

  // GRADE 10 (ថ្នាក់ទី១០)
  {
    id: 'WIS-OTH-G10A',
    name: 'តុ-កៅអីដែកសិស្សទោលកម្រិតធ្ងន់ (Grade 10 - 20 sets)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ៤០២ ជាន់ទី៤ (Grade 10)',
    brand: 'SteelMax',
    model: 'SM-Single-HD',
    quantity: 20,
    unit: 'ឈុត',
    assignedStaff: 'Phan Sophorn',
    condition: 'Operational',
    purchaseDate: '2024-08-28',
    costUsd: 65,
    serialNumber: 'G10-SET-01/20',
    notes: 'តុឈើទោលដែកស្វិតល្អ ងាយសម្រួលរបៀបរៀន'
  },
  {
    id: 'WIS-OTH-G10B',
    name: 'កុំព្យូទ័រគ្រូបង្រៀន AIO Dell OptiPlex (Grade 10)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ៤០២ ជាន់ទី៤ (Grade 10)',
    brand: 'Dell',
    model: 'OptiPlex 7410 AIO',
    quantity: 1,
    unit: 'គ្រឿង',
    assignedStaff: 'Phan Sophorn',
    condition: 'Operational',
    purchaseDate: '2024-11-20',
    costUsd: 720,
    serialNumber: 'DLL-G10-01',
    notes: 'កុំព្យូទ័រការងារគ្រូថ្នាក់វិទ្យាសាស្ត្រ'
  },

  // GRADE 11 (ថ្នាក់ទី១១)
  {
    id: 'WIS-OTH-G11A',
    name: 'តុ-កៅអីដែកសិស្សទោល (Grade 11 - 20 sets)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ៤០៣ ជាន់ទី៤ (Grade 11)',
    brand: 'SteelMax',
    model: 'SM-Single-HD',
    quantity: 20,
    unit: 'ឈុត',
    assignedStaff: 'Khorn Sreyleak',
    condition: 'Operational',
    purchaseDate: '2024-08-28',
    costUsd: 65,
    serialNumber: 'G11-SET-01/20',
    notes: 'ឈុតតុ និងកៅអីសិស្សថ្នាក់ទី១១'
  },
  {
    id: 'WIS-OTH-G11B',
    name: 'កុំព្យូទ័រគ្រូបង្រៀន HP ProOne AIO (Grade 11)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ៤០៣ ជាន់ទី៤ (Grade 11)',
    brand: 'HP',
    model: 'ProOne 440 G9',
    quantity: 1,
    unit: 'គ្រឿង',
    assignedStaff: 'Khorn Sreyleak',
    condition: 'Operational',
    purchaseDate: '2024-10-02',
    costUsd: 650,
    serialNumber: 'HP11010A',
    notes: 'កុំព្យូទ័ររៀបចំលំហាត់គណិតវិទ្យា និងរូបវិទ្យា'
  },

  // GRADE 12 (ថ្នាក់ទី១២)
  {
    id: 'WIS-OTH-G12A',
    name: 'តុ-កៅអីដែកសិស្សទោល (Grade 12 - 20 sets)',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ៤០៤ ជាន់ទី៤ (Grade 12)',
    brand: 'SteelMax',
    model: 'SM-Single-HD',
    quantity: 20,
    unit: 'ឈុត',
    assignedStaff: 'Lao Chansovan',
    condition: 'Operational',
    purchaseDate: '2024-08-28',
    costUsd: 65,
    serialNumber: 'G12-SET-01/20',
    notes: 'តុ-កៅអីសភាសិស្សថ្នាក់ទី១២ សម្រាប់ការសិក្សាត្រៀមបាក់ឌុប'
  },
  {
    id: 'WIS-OTH-G12B',
    name: 'កុំព្យូទ័រគ្រូបង្រៀន iMac 24" Apple M3',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ៤០៤ ជាន់ទី៤ (Grade 12)',
    brand: 'Apple',
    model: 'iMac 24-inch M3 8GB/256GB',
    quantity: 1,
    unit: 'គ្រឿង',
    assignedStaff: 'Lao Chansovan',
    condition: 'Operational',
    purchaseDate: '2024-09-18',
    costUsd: 1399,
    serialNumber: 'C02HL512Q2',
    notes: 'កុំព្យូទ័រ iMac សម្រាប់គ្រប់គ្រង និងបង្ហាញមេរៀន'
  },
  {
    id: 'WIS-OTH-G12C',
    name: 'ក្តារខៀនម៉ាញេទិកទំនើបសរសេរហ្វឺតសាលាធំ',
    roomCategory: 'Classroom',
    specificRoom: 'បន្ទប់ ៤០៤ ជាន់ទី៤ (Grade 12)',
    brand: 'GlassBoard',
    model: 'GB-Premium-Magnetic',
    quantity: 1,
    unit: 'ផ្ទាំង',
    assignedStaff: 'Lao Chansovan',
    condition: 'Operational',
    purchaseDate: '2024-08-15',
    costUsd: 95,
    serialNumber: 'N/A',
    notes: 'ក្តារខៀនសរសេរហ្វឺតងាយស្រួលជូតសម្អាត'
  },

  // OTHER SPECIAL ROOMS
  {
    id: 'WIS-OTH-SPC01',
    name: 'ព្យាណូ Yamaha Upright Piano',
    roomCategory: 'PianoRoom',
    specificRoom: 'បន្ទប់ព្យាណូ ជាន់ទី២ (Piano Lab 1)',
    brand: 'Yamaha',
    model: 'U1 PE 121cm',
    quantity: 1,
    unit: 'គ្រឿង',
    assignedStaff: 'CHAN Samoul',
    condition: 'Operational',
    purchaseDate: '2024-11-20',
    costUsd: 4800,
    serialNumber: 'Y-6482103',
    notes: 'ព្យាណូអាជីពសម្រាប់គ្រូបង្រៀន និងសិស្សអនុវត្តផ្ទាល់'
  },
  {
    id: 'WIS-OTH-SPC02',
    name: 'កុំព្យូទ័រ All-in-One PC HP ProOne',
    roomCategory: 'ComputerRoom',
    specificRoom: 'បន្ទប់កុំព្យូទ័រ IT Lab-A',
    brand: 'HP',
    model: 'ProOne 440 G9 AIO',
    quantity: 24,
    unit: 'គ្រឿង',
    assignedStaff: 'LOUNG Veasna',
    condition: 'Operational',
    purchaseDate: '2024-10-02',
    costUsd: 680,
    serialNumber: 'CNG2480LQ2',
    notes: 'កុំព្យូទ័រសម្រាប់ម៉ោងពិសោធន៍បច្ចេកវិទ្យាព័ត៌មាន (IT Class)'
  },
  {
    id: 'WIS-OTH-SPC03',
    name: 'ម៉ាស៊ីនដេរអគ្គិសនី Singer Heavy Duty',
    roomCategory: 'HomeEco',
    specificRoom: 'បន្ទប់ Home-Eco (ជាន់ទី១)',
    brand: 'Singer',
    model: 'Heavy Duty 4452',
    quantity: 5,
    unit: 'គ្រឿង',
    assignedStaff: 'Khorn Sreyleak',
    condition: 'Operational',
    purchaseDate: '2025-01-15',
    costUsd: 320,
    serialNumber: 'SGR-884210',
    notes: 'សម្រាប់ម៉ោងការងារផ្ទះ (Home Economics class) រៀនកាត់ដេរ'
  },
  {
    id: 'WIS-OTH-SPC04',
    name: 'ឡដុតនំអគ្គិសនីជំនាញ Electrolux Combo',
    roomCategory: 'HomeEco',
    specificRoom: 'បន្ទប់ Home-Eco (ជាន់ទី១)',
    brand: 'Electrolux',
    model: 'EOT40DBD 40 Liters',
    quantity: 4,
    unit: 'គ្រឿង',
    assignedStaff: 'Khorn Sreyleak',
    condition: 'Operational',
    purchaseDate: '2024-09-12',
    costUsd: 145,
    serialNumber: 'ELX-20240901',
    notes: 'សម្រាប់ម៉ោងការងារផ្ទះ រៀនធ្វើនំ និងវិទ្យាសាស្ត្រអាហារ'
  }
];

export default function OtherAssetsManager() {
  const [assets, setAssets] = useState<OtherAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<RoomCategory | 'All'>('All');
  const [filterCondition, setFilterCondition] = useState<AssetCondition | 'All'>('All');
  const [filterGrade, setFilterGrade] = useState<string>('All');
  const [filterRoomNumber, setFilterRoomNumber] = useState<string>('All');
  
  // Modals and Toasts
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<OtherAsset | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'info' } | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');

  // Form fields
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formRoomCategory, setFormRoomCategory] = useState<RoomCategory>('Classroom');
  const [formSpecificRoom, setFormSpecificRoom] = useState('');
  const [formRoomNumber, setFormRoomNumber] = useState('');
  const [formGrade, setFormGrade] = useState('None');
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formQuantity, setFormQuantity] = useState(1);
  const [formUnit, setFormUnit] = useState('គ្រឿង');
  const [formAssignedStaff, setFormAssignedStaff] = useState('');
  const [formCondition, setFormCondition] = useState<AssetCondition>('Operational');
  const [formPurchaseDate, setFormPurchaseDate] = useState('');
  const [formCostUsd, setFormCostUsd] = useState(0);
  const [formSerialNumber, setFormSerialNumber] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Local storage synchronization (v2 key for new classroom asset list from N to G12)
  useEffect(() => {
    const saved = localStorage.getItem('wis_other_classroom_assets');
    if (saved) {
      try {
        setAssets(JSON.parse(saved));
      } catch (e) {
        setAssets(DEFAULT_OTHER_ASSETS);
      }
    } else {
      setAssets(DEFAULT_OTHER_ASSETS);
      localStorage.setItem('wis_other_classroom_assets', JSON.stringify(DEFAULT_OTHER_ASSETS));
    }
  }, []);

  const saveToLocalStorage = (newAssets: OtherAsset[]) => {
    setAssets(newAssets);
    localStorage.setItem('wis_other_classroom_assets', JSON.stringify(newAssets));
  };

  const triggerToast = (message: string, type: 'success' | 'danger' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenAddModal = () => {
    setEditingAsset(null);
    const nextIdNum = assets.length > 0 
      ? Math.max(...assets.map(a => {
          const match = a.id.match(/WIS-OTH-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })) + 1 
      : 1;
    const formattedId = `WIS-OTH-${String(nextIdNum).padStart(3, '0')}`;
    
    setFormId(formattedId);
    setFormName('');
    setFormRoomCategory('Classroom');
    setFormSpecificRoom('');
    setFormRoomNumber('');
    setFormGrade('None');
    setFormBrand('');
    setFormModel('');
    setFormQuantity(1);
    setFormUnit('គ្រឿង');
    setFormAssignedStaff('');
    setFormCondition('Operational');
    setFormPurchaseDate(new Date().toISOString().split('T')[0]);
    setFormCostUsd(0);
    setFormSerialNumber('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asset: OtherAsset) => {
    setEditingAsset(asset);
    setFormId(asset.id);
    setFormName(asset.name);
    setFormRoomCategory(asset.roomCategory);
    setFormSpecificRoom(asset.specificRoom);
    
    // Fallback parsing for pre-existing items
    const fallback = parseGradeAndRoom(asset);
    setFormRoomNumber(asset.roomNumber || fallback.roomNumber);
    setFormGrade(asset.grade || fallback.grade);

    setFormBrand(asset.brand || '');
    setFormModel(asset.model || '');
    setFormQuantity(asset.quantity || 1);
    setFormUnit(asset.unit || 'គ្រឿង');
    setFormAssignedStaff(asset.assignedStaff || '');
    setFormCondition(asset.condition || 'Operational');
    setFormPurchaseDate(asset.purchaseDate || '');
    setFormCostUsd(asset.costUsd || 0);
    setFormSerialNumber(asset.serialNumber || '');
    setFormNotes(asset.notes || '');
    setIsModalOpen(true);
  };

  const handleDeleteAsset = (id: string) => {
    if (window.confirm('តើអ្នកពិតជាចង់លុបសម្ភារៈនេះចេញពីបញ្ជីមែនទេ? (Are you sure you want to delete this?)')) {
      const updated = assets.filter(a => a.id !== id);
      saveToLocalStorage(updated);
      triggerToast('លុបសម្ភារៈជោគជ័យ!', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSpecificRoom.trim() || !formRoomNumber.trim()) {
      triggerToast('សូមបំពេញព័ត៌មានចាំបាច់ឲ្យបានគ្រប់គ្រាន់!', 'danger');
      return;
    }

    const payload: OtherAsset = {
      id: formId,
      name: formName.trim(),
      roomCategory: formRoomCategory,
      specificRoom: formSpecificRoom.trim(),
      roomNumber: formRoomNumber.trim(),
      grade: formGrade,
      brand: formBrand.trim(),
      model: formModel.trim(),
      quantity: Number(formQuantity),
      unit: formUnit.trim() || 'គ្រឿង',
      assignedStaff: formAssignedStaff.trim(),
      condition: formCondition,
      purchaseDate: formPurchaseDate,
      costUsd: Number(formCostUsd),
      serialNumber: formSerialNumber.trim() || 'N/A',
      notes: formNotes.trim()
    };

    let updatedList: OtherAsset[] = [];
    if (editingAsset) {
      // Update
      updatedList = assets.map(a => a.id === formId ? payload : a);
      triggerToast('ធ្វើបច្ចុប្បន្នភាពសម្ភារៈទទួលបានជោគជ័យ!', 'success');
    } else {
      // Create new
      if (assets.some(a => a.id === formId)) {
        triggerToast(`លខកូដសម្ភារៈ ${formId} មានរួចរាល់ហើយ!`, 'danger');
        return;
      }
      updatedList = [payload, ...assets];
      triggerToast('បន្ថែមសម្ភារៈថ្មីដោយជោគជ័យ!', 'success');
    }

    saveToLocalStorage(updatedList);
    setIsModalOpen(false);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Asset Name', 'Room Category', 'Specific Room', 'Brand', 'Model', 'Quantity', 'Unit', 'Assigned Staff', 'Condition', 'Purchase Date', 'Cost (USD)', 'Serial Number', 'Notes'];
    const rows = assets.map(a => [
      a.id,
      a.name,
      a.roomCategory,
      a.specificRoom,
      a.brand,
      a.model,
      a.quantity.toString(),
      a.unit,
      a.assignedStaff,
      a.condition,
      a.purchaseDate,
      a.costUsd.toString(),
      a.serialNumber || 'N/A',
      a.notes || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `WIS_Other_Room_Assets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('នាំទិន្នន័យចេញជា (CSV) ជោគជ័យ!', 'success');
  };

  const handleResetToDefaults = () => {
    if (window.confirm('តើលោកអ្នកពិតជាចង់កំណត់ឡើងវិញនូវទិន្នន័យសម្ភារៈគំរូទាំងអស់មែនទេ? (ចំណាំ៖ វានឹងរៀបចំបញ្ជីថ្មីពីថ្នាក់ Nursery (N) ដល់ ថ្នាក់ទី១២ ជំនួសរាល់ទិន្នន័យចាស់ទាំងអស់!)')) {
      saveToLocalStorage(DEFAULT_OTHER_ASSETS);
      triggerToast('បានកំណត់ឡើងវិញនូវសម្ភារៈគំរូថ្នាក់ (Nursery ដល់ ថ្នាក់ទី១២) ជោគជ័យ!', 'success');
    }
  };

  const handleBulkImport = () => {
    if (!bulkCsvText.trim()) {
      triggerToast('សូមបញ្ចូលទិន្នន័យ CSV ជាមុនសិន!', 'danger');
      return;
    }

    try {
      const lines = bulkCsvText.split('\n');
      const newAssets: OtherAsset[] = [];
      let parsedCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || i === 0 && line.toLowerCase().includes('id,asset')) continue; // Skip header

        // Simple CSV splitting (considering quoted values)
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
        const cleanFields = matches.map(f => f.replace(/^"|"$/g, '').trim());

        if (cleanFields.length >= 7) {
          const id = cleanFields[0] || `WIS-OTH-IMP-${Math.floor(Math.random() * 10000)}`;
          const name = cleanFields[1] || 'Unknown Material';
          const roomCategoryRaw = cleanFields[2] as RoomCategory;
          const roomCategory = ['Classroom', 'ComputerRoom', 'PianoRoom', 'DanceRoom', 'HomeEco'].includes(roomCategoryRaw) 
            ? roomCategoryRaw 
            : 'Classroom';
          const specificRoom = cleanFields[3] || 'General Room';
          const brand = cleanFields[4] || '';
          const model = cleanFields[5] || '';
          const quantity = parseInt(cleanFields[6]) || 1;
          const unit = cleanFields[7] || 'គ្រឿង';
          const assignedStaff = cleanFields[8] || '';
          const conditionRaw = cleanFields[9] as AssetCondition;
          const condition = ['Operational', 'Maintenance', 'Broken'].includes(conditionRaw) ? conditionRaw : 'Operational';
          const purchaseDate = cleanFields[10] || new Date().toISOString().split('T')[0];
          const costUsd = parseFloat(cleanFields[11]) || 0;
          const serialNumber = cleanFields[12] || 'N/A';
          const notes = cleanFields[13] || '';

          const parsed = parseGradeAndRoom({ name, specificRoom });
          const roomNumber = cleanFields[14] || parsed.roomNumber;
          const grade = cleanFields[15] || parsed.grade;

          newAssets.push({
            id,
            name,
            roomCategory,
            specificRoom,
            roomNumber,
            grade,
            brand,
            model,
            quantity,
            unit,
            assignedStaff,
            condition,
            purchaseDate,
            costUsd,
            serialNumber,
            notes
          });
          parsedCount++;
        }
      }

      if (parsedCount > 0) {
        // Merge with existing avoiding complete duplication
        const existingIds = new Set(assets.map(a => a.id));
        const merged = [...assets];
        newAssets.forEach(item => {
          if (!existingIds.has(item.id)) {
            merged.push(item);
          }
        });
        saveToLocalStorage(merged);
        setShowBulkModal(false);
        setBulkCsvText('');
        triggerToast(`នាំចូលសម្ភារៈជោគជ័យចំនួន ${parsedCount} មុខ!`, 'success');
      } else {
        triggerToast('ពុំមានទិន្នន័យសមស្របដែលត្រូវបានអានទេ!', 'danger');
      }
    } catch (err) {
      triggerToast('ទម្រង់ទិន្នន័យមិនត្រឹមត្រូវ សូមពិនិត្យខ្សែផ្ទេរ CSV ម្តងទៀត!', 'danger');
    }
  };

  // Helper getters to get grade and roomNumber with dynamic fallbacks
  const getAssetGrade = (item: OtherAsset) => item.grade || parseGradeAndRoom(item).grade;
  const getAssetRoomNumber = (item: OtherAsset) => item.roomNumber || parseGradeAndRoom(item).roomNumber;

  // Filter calculation
  const filteredAssets = assets.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specificRoom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getAssetRoomNumber(item).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.assignedStaff && item.assignedStaff.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filterCategory === 'All' || item.roomCategory === filterCategory;
    const matchesCondition = filterCondition === 'All' || item.condition === filterCondition;
    
    const assetGrade = getAssetGrade(item);
    const matchesGrade = filterGrade === 'All' || assetGrade === filterGrade;

    const assetRoomNumber = getAssetRoomNumber(item);
    const matchesRoomNumber = filterRoomNumber === 'All' || assetRoomNumber.toLowerCase() === filterRoomNumber.toLowerCase();

    return matchesSearch && matchesCategory && matchesCondition && matchesGrade && matchesRoomNumber;
  });

  // Extract unique room numbers for filtering select
  const uniqueRoomNumbers = Array.from(new Set(assets.map(item => getAssetRoomNumber(item)))).filter(Boolean).sort();

  // KPI count statistics
  const statTotalQty = assets.reduce((sum, item) => sum + item.quantity, 0);
  const statTotalCost = assets.reduce((sum, item) => sum + (item.costUsd * item.quantity), 0);
  const statOperational = assets.filter(a => a.condition === 'Operational').reduce((sum, item) => sum + item.quantity, 0);
  const statMaintenance = assets.filter(a => a.condition === 'Maintenance').reduce((sum, item) => sum + item.quantity, 0);
  const statBroken = assets.filter(a => a.condition === 'Broken').reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6 font-content" id="other-assets-manager">
      
      {/* Toast Alert Popup */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-2xl shadow-xl transition-all border text-xs font-bold animate-bounce ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-250' 
            : 'bg-rose-50 text-rose-800 border-rose-250'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl px-6 py-5.5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <School className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-black font-moul tracking-wide">គ្រប់គ្រងសម្ភារៈបន្ទប់រៀន</h2>
          </div>
          <p className="text-slate-350 text-xs sm:text-[13px] font-medium leading-relaxed mt-1">
            សៀវភៅបញ្ជីគ្រប់គ្រងគ្រឿងសង្ហារឹម តុ កៅអី កុំព្យូទ័រ និងសម្ភារៈបន្ទប់រៀនពីកម្រិត Nursery (N) ដល់វិទ្យាល័យថ្នាក់ទី១២
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleOpenAddModal}
            className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-555 text-white rounded-xl text-xs sm:text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>បន្ថែមសម្ភារៈថ្មី (Add Material)</span>
          </button>
          <button
            onClick={handleResetToDefaults}
            className="px-4.5 py-2.5 bg-amber-600/90 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-950/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>កំណត់ឡើងវិញជាគំរូសាលា</span>
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4.5 py-2.5 bg-[#0d5c5a]/80 hover:bg-[#0d5c5a] text-white rounded-xl text-xs sm:text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-500/30"
          >
            <Upload className="w-4 h-4" />
            <span>នាំចូលច្រើន (Bulk Import)</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border border-white/15"
          >
            <Download className="w-4 h-4" />
            <span>ទាញយក CSV</span>
          </button>
        </div>
      </div>

      {/* Quick Dashboard KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Total Assets */}
        <div className="bg-white border border-slate-200/85 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h5 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">សម្ភារៈសរុប</h5>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-black font-mono text-slate-800">{assets.length}</span>
              <span className="text-[9.5px] text-slate-400 font-bold">មុខ</span>
            </div>
            <p className="text-[9.5px] text-slate-500 font-semibold mt-0.5">បរិមាណ៖ <span className="font-mono font-black">{statTotalQty}</span> គ្រឿង/កំប្លេ</p>
          </div>
        </div>

        {/* Card 2: Cost summary */}
        <div className="bg-white border border-slate-200/85 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h5 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">តម្លៃវិនិយោគសរុប</h5>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[11px] font-black text-emerald-600">$</span>
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600">{statTotalCost.toLocaleString('en-US')}</span>
            </div>
            <p className="text-[9.5px] text-slate-505 text-emerald-600 font-extrabold mt-0.5">គិតថ្លៃដើមទិញសរុប</p>
          </div>
        </div>

        {/* Card 3: Operational */}
        <div className="bg-white border border-slate-200/85 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-lg">✅</span>
          </div>
          <div>
            <h5 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider text-emerald-700">មានភាពល្អប្រសើរ</h5>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-700">{statOperational}</span>
              <span className="text-[9.5px] text-slate-400 font-bold">គ្រឿង</span>
            </div>
            <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">រួចរាល់សម្រាប់ប្រើប្រាស់</p>
          </div>
        </div>

        {/* Card 4: In maintenance */}
        <div className="bg-white border border-slate-200/85 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-lg">🛠️</span>
          </div>
          <div>
            <h5 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider text-amber-700">កំពុងថែទាំជួសជុល</h5>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-black font-mono text-amber-700">{statMaintenance}</span>
              <span className="text-[9.5px] text-slate-400 font-bold">គ្រឿង</span>
            </div>
            <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">សេវាកាត់ដេរ ឬឡដុត</p>
          </div>
        </div>

        {/* Card 5: Broken */}
        <div className="bg-white border border-slate-200/85 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-lg">❌</span>
          </div>
          <div>
            <h5 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider text-rose-700">ខូច/ស្រុតគុណភាព</h5>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-black font-mono text-rose-700">{statBroken}</span>
              <span className="text-[9.5px] text-slate-400 font-bold">គ្រឿង</span>
            </div>
            <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">ត្រូវការផ្លាស់ប្តូរថ្មី</p>
          </div>
        </div>
      </div>

      {/* Interactive Classrooms, Room Numbers & Grades Multi-Filter Panel */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
        {/* Row 1: Category Pill Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-slate-500 mr-1">ប្រភេទបន្ទប់ (Room Category)៖</span>
            <button
              onClick={() => setFilterCategory('All')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                filterCategory === 'All'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              🏡 ទាំងអស់ ({assets.length})
            </button>
            
            {(Object.keys(ROOM_CATEGORIES_KM) as RoomCategory[]).map(cat => {
              const count = assets.filter(a => a.roomCategory === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-150 border border-slate-150 text-slate-700'
                  }`}
                >
                  <span>{ROOM_CATEGORIES_EMOJI[cat]}</span>
                  <span>{ROOM_CATEGORIES_KM[cat].split(' (')[0]}</span>
                  <span className="font-mono ml-0.5 opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Quick Clear Filters Button */}
          {(filterCategory !== 'All' || filterGrade !== 'All' || filterRoomNumber !== 'All' || filterCondition !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setFilterCategory('All');
                setFilterGrade('All');
                setFilterRoomNumber('All');
                setFilterCondition('All');
                setSearchQuery('');
              }}
              className="text-[10.5px] font-bold text-rose-600 hover:text-rose-700 underline flex items-center gap-1 transition self-end lg:self-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>សម្អាតតម្រងទាំងអស់ (Clear Filters)</span>
            </button>
          )}
        </div>

        {/* Row 2: Selectors Grid for Classroom, Room Number, Grade, Condition and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Sub-Filter: Grade */}
          <div className="space-y-1">
            <label className="block text-[10px] text-slate-450 font-extrabold uppercase tracking-wider">ត្រងតាម កម្រិតថ្នាក់ (Grade)</label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="All">🎓 គ្រប់ថ្នាក់ ទាំងអស់ (All Grades)</option>
              {Object.entries(GRADE_LABELS_KM).filter(([key]) => key !== 'All').map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>

          {/* Sub-Filter: Room Number */}
          <div className="space-y-1">
            <label className="block text-[10px] text-slate-450 font-extrabold uppercase tracking-wider">ត្រងតាម លេខបន្ទប់ (Room Number)</label>
            <select
              value={filterRoomNumber}
              onChange={(e) => setFilterRoomNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="All">📍 គ្រប់លេខបន្ទប់ ទាំងអស់ (All Rooms)</option>
              {uniqueRoomNumbers.map(room => (
                <option key={room} value={room}>🚪 បន្ទប់៖ {room}</option>
              ))}
            </select>
          </div>

          {/* Sub-Filter: Status */}
          <div className="space-y-1">
            <label className="block text-[10px] text-slate-450 font-extrabold uppercase tracking-wider">ត្រងតាម ស្ថានភាព (Condition)</label>
            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value as AssetCondition | 'All')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="All">⚙️ ស្ថានភាព៖ ទាំងអស់ (All)</option>
              <option value="Operational">🟢 ល្អ عادي/ប្រើប្រាស់បាន (Operational)</option>
              <option value="Maintenance">🟡 កំពុងជួសជុល (Maintenance)</option>
              <option value="Broken">🔴 ខូចខាត (Broken)</option>
            </select>
          </div>

          {/* Sub-Filter: Search Bar */}
          <div className="space-y-1">
            <label className="block text-[10px] text-slate-450 font-extrabold uppercase tracking-wider">ស្វែងរកពាក្យគន្លឹះ (Search)</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ស្វែងរកសម្ភារៈ ទីតាំង ឬអ្នកគ្រប់គ្រង..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid List of Rooms Assets */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Layers className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">រកមិនឃើញទិន្នន័យសម្ភារៈឡើយ</h4>
          <p className="text-xs text-slate-400 font-semibold max-w-md mx-auto mt-1 leading-relaxed">
            ពុំមានសម្ភារៈណាដែលត្រូវគ្នាជាមួយតម្រងស្វែងរករបស់អ្នក ឬមិនទាន់មានទិន្នន័យឡើយ។ សូមសាកល្បងសម្អាតតម្រង ឬបន្ថែមសម្ភារៈថ្មី។
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button 
              onClick={() => { setSearchQuery(''); setFilterCategory('All'); setFilterCondition('All'); }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer"
            >
              សម្អាតតម្រងទាំងអស់
            </button>
            <button 
              onClick={handleOpenAddModal}
              className="bg-[#0d5c5a] hover:bg-emerald-800 text-white text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
            >
              បន្ថែមវិធានការដំបូង
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map(asset => {
            const statusConfig = CONDITION_STATUS_KM[asset.condition] || { label: 'Unknown', color: 'text-slate-750 bg-slate-100 border-slate-200', bg: 'bg-slate-400' };
            const emoji = ROOM_CATEGORIES_EMOJI[asset.roomCategory] || '📦';
            const catLabel = ROOM_CATEGORIES_KM[asset.roomCategory] ? ROOM_CATEGORIES_KM[asset.roomCategory].split(' (')[0] : 'សម្ភារៈបន្ទប់រៀន';

            return (
              <div 
                key={asset.id} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                {/* Header portion */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-sm shrink-0">
                      {emoji}
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-700 font-mono tracking-wider">{asset.id}</span>
                      <span className="block text-[9.5px] font-extrabold text-slate-400 mt-0.5">{catLabel}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border shrink-0 ${statusConfig.color}`}>
                    {statusConfig.label.split(' (')[0]}
                  </span>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-grow space-y-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 leading-snug group-hover:text-emerald-700 transition-colors">
                      {asset.name}
                    </h4>
                    {asset.serialNumber && asset.serialNumber !== 'N/A' && (
                      <span className="text-[9.5px] font-mono text-slate-400 font-bold block mt-1">S/N: {asset.serialNumber}</span>
                    )}
                  </div>

                  {/* Meta Grid info */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-2.5 text-[10px] border border-slate-150 font-semibold text-slate-600">
                    <div>
                      <span className="text-slate-400 block mb-0.5">🚪 លេខបន្ទប់ / Room៖</span>
                      <span className="font-black text-slate-800 truncate block" title={getAssetRoomNumber(asset)}>
                        🚪 {getAssetRoomNumber(asset) || 'មិនកំណត់'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">🎓 កម្រិតថ្នាក់ / Grade៖</span>
                      <span className="font-black text-emerald-800 truncate block">
                        🏫 {GRADE_LABELS_KM[getAssetGrade(asset)]?.split(' (')[0] || getAssetGrade(asset)}
                      </span>
                    </div>
                    <div className="col-span-2 border-t border-slate-200/60 pt-1.5 mt-0.5">
                      <span className="text-slate-400 block mb-0.5">📍 ទីតាំងជាក់លាក់ (Location)៖</span>
                      <span className="font-extrabold text-slate-700 truncate block text-[9.5px]" title={asset.specificRoom}>
                        {asset.specificRoom}
                      </span>
                    </div>
                    <div className="col-span-2 border-t border-slate-200/60 pt-1.5">
                      <span className="text-slate-400 block mb-0.5">👤 អ្នកទទួលខុសត្រូវ (Custodian)៖</span>
                      <span className="font-extrabold text-slate-800 block truncate text-[9.5px]">
                        👤 {asset.assignedStaff || 'គ្មាន (Not assigned)'}
                      </span>
                    </div>
                  </div>

                  {/* Brand and spec detail lists */}
                  <div className="text-[10.5px] space-y-1 border-t border-slate-100 pt-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-450 font-bold">ប្រ៊េន / ម៉ូដែល៖</span>
                      <span className="font-extrabold text-slate-750">
                        {asset.brand ? `${asset.brand} - ${asset.model}` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450 font-bold">បរិមាណដែលមាន៖</span>
                      <span className="font-black text-emerald-800 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded font-mono text-[10px]">
                        {asset.quantity} {asset.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450 font-bold">តម្លៃក្នុងមួយឯកតា៖</span>
                      <span className="font-black text-slate-800 font-mono">${asset.costUsd?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450 font-semibold">ថ្ងៃចុះបញ្ជីទិញ៖</span>
                      <span className="font-semibold text-slate-600 font-mono text-[9px]">{asset.purchaseDate || 'N/A'}</span>
                    </div>
                  </div>

                  {asset.notes && (
                    <div className="bg-slate-50 border-l-2 border-emerald-500 rounded p-2 text-[10px] text-slate-500 font-medium leading-relaxed italic">
                      📝 {asset.notes}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                  <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <span className="text-[9px] font-bold text-slate-400">សរុបតម្លៃ៖</span>
                    <span className="font-black text-slate-700 font-mono">${(asset.costUsd * asset.quantity).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(asset)}
                      className="p-1.5 bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 rounded-lg transition shrink-0 cursor-pointer"
                      title="កែសម្រួលព័ត៌មាន (Edit)"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 rounded-lg transition shrink-0 cursor-pointer"
                      title="លុបចោល (Delete)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Primary Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-slate-250 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col my-8 animate-fade-in text-xs sm:text-xs">
            <div className="bg-emerald-950 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-emerald-300" />
                <h3 className="font-moul font-black text-xs sm:text-sm tracking-wide">
                  {editingAsset ? 'កែសម្រួលទិន្នន័យសម្ភារៈ' : 'បន្ថែមសម្ភារៈបន្ទប់រៀន ឬវិជ្ជាជីវៈថ្មី'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/75 hover:text-white p-1 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 max-h-[75vh]">
              
              {/* Form Row 1: ID and Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-500 font-extrabold text-[10px] mb-1 uppercase tracking-wider">លេខកូដសម្ភារៈ *</label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    required
                    disabled={!!editingAsset}
                    className="w-full bg-slate-105 bg-slate-100 text-slate-600 border border-slate-250 rounded-xl p-2.5 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-500 font-extrabold text-[10px] mb-1 uppercase tracking-wider">ឈ្មោះសម្ភារៈ/ឧបករណ៍ *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="ឈ្មោះឧបករណ៍ (ឧទាហរណ៍៖ ព្យាណូដោតភ្លើង, ម៉ាស៊ីនដេរ...)"
                    required
                    className="w-full bg-slate-5.0 border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Row 2: Room Category and Grade Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-500 font-extrabold text-[10px] mb-1 uppercase tracking-wider">បន្ទប់ជំនាញធំ / Category *</label>
                  <select
                    value={formRoomCategory}
                    onChange={(e) => setFormRoomCategory(e.target.value as RoomCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black focus:ring-1 focus:ring-emerald-700 text-slate-800"
                  >
                    {(Object.keys(ROOM_CATEGORIES_KM) as RoomCategory[]).map(cat => (
                      <option key={cat} value={cat}>{ROOM_CATEGORIES_EMOJI[cat]} {ROOM_CATEGORIES_KM[cat]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-extrabold text-[10px] mb-1 uppercase tracking-wider">កម្រិតថ្នាក់ (Grade Level) *</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black focus:ring-1 focus:ring-emerald-700 text-slate-800"
                  >
                    {Object.entries(GRADE_LABELS_KM).filter(([key]) => key !== 'All').map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Row 2.5: Specific Room Number and Entire Location Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-500 font-extrabold text-[10px] mb-1 uppercase tracking-wider">លេខបន្ទប់ជាក់លាក់ (Room Number Ex. 201, IT Lab-B) *</label>
                  <input
                    type="text"
                    value={formRoomNumber}
                    onChange={(e) => setFormRoomNumber(e.target.value)}
                    placeholder="ឧ. បន្ទប់ ២០១, IT Lab-B, 304"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-extrabold text-[10px] mb-1 uppercase tracking-wider">ទីតាំងលម្អិត (Location / Description) *</label>
                  <input
                    type="text"
                    value={formSpecificRoom}
                    onChange={(e) => setFormSpecificRoom(e.target.value)}
                    placeholder="ឧ. បន្ទប់ ២០១ ជាន់ទី២ (Grade 1)"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Row 3: Brand & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-500 font-extrabold text-[10px] mb-1 uppercase tracking-wider">ម៉ាក / ប្រ៊េន</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="ឧទាហរណ៍៖ Yamaha, Singer, Sony"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-extrabold text-[10px] mb-1 uppercase tracking-wider">ស៊េរី / ម៉ូដែល</label>
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="ឧទាហរណ៍៖ Model 2024, EOT40D ..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Row 4: Quantity and Unit and Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-500 font-extrabold text-[10px] mb-1 uppercase tracking-wider">បរិមាណ (Qty) *</label>
                  <input
                    type="number"
                    min="1"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-center font-mono focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-extrabold text-[10px] mb-1 uppercase tracking-wider">ឯកតារាប់ *</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="ឧ. គ្រឿង, ឈុត, កំប្លេ"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-center focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-extrabold text-[10px] mb-1 uppercase tracking-wider">តម្លៃក្នុងមួយឯកតា (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-extrabold text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formCostUsd}
                      onChange={(e) => setFormCostUsd(Number(e.target.value))}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-6.5 p-2.5 font-mono font-black text-right focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* Form Row 5: Serial Number, Condition, and Purchase Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-500 font-extrabold text-[10px] mb-1 uppercase tracking-wider">លេខស៊េរី (Serial S/N)</label>
                  <input
                    type="text"
                    value={formSerialNumber}
                    onChange={(e) => setFormSerialNumber(e.target.value)}
                    placeholder="N/A"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-extrabold text-[10px] mb-1 uppercase tracking-wider">ស្ថានភាពសម្ភារៈ *</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value as AssetCondition)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-extrabold focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="Operational">🟢 ល្អ عادي/ប្រើបានធម្មតា</option>
                    <option value="Maintenance">🟡 កំពុងថែទាំជួសជុល</option>
                    <option value="Broken">🔴 ខូច/ស្រុតមិនអាចប្រើបាន</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-extrabold text-[10px] mb-1 uppercase tracking-wider">ថ្ងៃចុះបញ្ជីទិញ *</label>
                  <input
                    type="date"
                    value={formPurchaseDate}
                    onChange={(e) => setFormPurchaseDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Row 6: Assigned Staff */}
              <div>
                <label className="block text-slate-500 font-extrabold text-[10px] mb-1 uppercase tracking-wider">បុគ្គលិកទទួលខុសត្រូវ (Custodian)</label>
                <input
                  type="text"
                  value={formAssignedStaff}
                  onChange={(e) => setFormAssignedStaff(e.target.value)}
                  placeholder="បំពេញឈ្មោះគ្រូ ឬជំនួយការរដ្ឋបាល"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-1 focus:ring-emerald-700 text-slate-750"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-500 font-extrabold text-[10px] mb-1 uppercase tracking-wider">កំណត់សម្គាល់បន្ថែម</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="បន្ថែមការណែនាំ ឬការខូចខាតខ្លះៗបើមាន..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-xs text-slate-700"
                />
              </div>

              {/* Footer Actions inside form */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2.5 rounded-b-2xl shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-extrabold rounded-xl border border-slate-200 transition cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-905 text-white text-xs font-black rounded-xl transition shadow-md shadow-emerald-100 cursor-pointer"
                >
                  រក្សាទុក (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-350 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col text-xs">
            <div className="bg-emerald-950 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                <h3 className="font-moul font-normal text-xs sm:text-xs">CSV Bulk Import (សម្ភារៈបន្ទប់រៀន)</h3>
              </div>
              <button 
                onClick={() => setShowBulkModal(false)}
                className="text-white/75 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="block text-slate-500 font-extrabold text-[10px] uppercase mb-1">របៀបប្រើប្រាស់៖</span>
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                  អ្នកអាចចម្លងទិន្នន័យពី Excel ឬ CSV ដែលមានជួរឈរតាមលំដាប់លំដោយខាងក្រោម ហើយបិទភ្ជាប់វា (Paste) ក្នុងប្រអប់ខាងក្រោម៖
                </p>
                <div className="bg-slate-100 rounded-lg p-2.5 font-mono text-[9px] text-emerald-800 font-semibold select-all select-all mt-1.5 overflow-x-auto leading-relaxed border border-slate-200">
                  ID, Name, RoomCategory, SpecificRoom, Brand, Model, Quantity, Unit, AssignedStaff, Condition, PurchaseDate, CostUSD, SerialNumber, Notes
                </div>
                <p className="text-[9.5px] mt-1 text-amber-600 font-semibold italic">
                  * Note: RoomCategory values must be exactly: <span className="font-mono">Classroom</span>, <span className="font-mono">ComputerRoom</span>, <span className="font-mono">PianoRoom</span>, <span className="font-mono">DanceRoom</span>, or <span className="font-mono">HomeEco</span>.
                </p>
              </div>

              <div>
                <label className="block text-slate-500 font-extrabold text-[10px] uppercase mb-1">បិទភ្ជាប់ចំណងទិន្នន័យ (CSV Raw Text) *</label>
                <textarea
                  rows={6}
                  value={bulkCsvText}
                  onChange={(e) => setBulkCsvText(e.target.value)}
                  placeholder="WIS-OTH-010, កៅអីឈើគ្រូ, Classroom, Room 101, Local, Std-Teacher, 1, គ្រឿង, Mr. Samnang, Operational, 2024-10-01, 45, N/A, Row Note"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[10.5px] leading-relaxed focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-2 shrink-0">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 transition"
                >
                  បោះបង់
                </button>
                <button
                  onClick={handleBulkImport}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-905 text-white font-black rounded-xl transition shadow-xs"
                >
                  យល់ព្រមនាំចូល (Import)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
