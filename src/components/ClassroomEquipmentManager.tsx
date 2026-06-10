/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  School, Layers, Laptop, Tv, Wind, Volume2, HardDrive, 
  Trash2, Plus, Edit3, Save, X, Search, ChevronRight, Check,
  PlusCircle, MinusCircle, FileSpreadsheet, Settings, Info,
  Wrench, Calendar, AlertTriangle, CheckCircle, Clock, Camera, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Equipment counts structure for a room
export interface EquipmentQuantities {
  studentDesk: number;
  studentChair: number;
  teacherDesk: number;
  teacherChair: number;
  projector: number;
  whiteboard: number;
  ac: number;
  speaker: number;
  locker: number;
  other: number;
  [key: string]: number;
}

export interface EquipmentItemType {
  key: string;
  label: string;
  iconName: string;
  color: string;
}

const DEFAULT_EQUIPMENT_TYPES: EquipmentItemType[] = [
  { key: 'studentDesk', label: 'តុសិស្ស (Student Desk)', iconName: 'School', color: 'text-emerald-600 bg-emerald-50' },
  { key: 'studentChair', label: 'កៅអីសិស្ស (Student Chair)', iconName: 'School', color: 'text-emerald-600 bg-emerald-50' },
  { key: 'teacherDesk', label: 'តុគ្រូ (Teacher Desk)', iconName: 'School', color: 'text-teal-600 bg-teal-50' },
  { key: 'teacherChair', label: 'កៅអីគ្រូ (Teacher Chair)', iconName: 'School', color: 'text-teal-600 bg-teal-50' },
  { key: 'projector', label: 'ម៉ាស៊ីនចាក់ផ្សាយ (Projector)', iconName: 'Tv', color: 'text-indigo-600 bg-indigo-50' },
  { key: 'whiteboard', label: 'ក្តារខៀនសរសេរ (Whiteboard)', iconName: 'Tv', color: 'text-stone-600 bg-stone-50' },
  { key: 'ac', label: 'ម៉ាស៊ីនត្រជាក់ (Air Conditioner)', iconName: 'Wind', color: 'text-sky-600 bg-sky-50 animate-pulse' },
  { key: 'speaker', label: 'បាសបន្លឺសំឡេង (Speaker)', iconName: 'Volume2', color: 'text-indigo-600 bg-indigo-50' },
  { key: 'locker', label: 'ទូដាក់ឯកសារ (Locker)', iconName: 'HardDrive', color: 'text-amber-600 bg-amber-50' },
  { key: 'other', label: 'ឧបករណ៍ផ្សេងៗ (Other Equipment)', iconName: 'Laptop', color: 'text-slate-650 bg-slate-100' }
];

const AVAILABLE_ICONS = [
  { name: 'School', label: 'សាលារៀន (School)' },
  { name: 'Laptop', label: 'កុំព្យូទ័រ (Computer)' },
  { name: 'Tv', label: 'អេក្រង់/Projector (Screen)' },
  { name: 'Wind', label: 'ម៉ាស៊ីនត្រជាក់/កង្ហារ (AC/Fan)' },
  { name: 'Volume2', label: 'បាស (Speaker)' },
  { name: 'HardDrive', label: 'ទូ/លុកឃ័រ (Locker/Cabinet)' },
  { name: 'Settings', label: 'គ្រឿងម៉ាស៊ីន (Machine/Settings)' },
  { name: 'Info', label: 'ផ្សេងៗ (Other)' }
];

const AVAILABLE_COLORS = [
  { value: 'text-emerald-600 bg-emerald-50', label: 'ពណ៌បៃតងខ្ចី (Emerald)' },
  { value: 'text-rose-600 bg-rose-50', label: 'ពណ៌ក្រហម (Rose)' },
  { value: 'text-indigo-600 bg-indigo-50', label: 'ពណ៌ស្វាយ (Indigo)' },
  { value: 'text-sky-600 bg-sky-50', label: 'ពណ៌ខៀវស្រាល (Sky)' },
  { value: 'text-amber-600 bg-amber-50', label: 'ពណ៌លឿង (Amber)' },
  { value: 'text-stone-600 bg-stone-50', label: 'ពណ៌ប្រផេះ (Stone)' },
  { value: 'text-violet-600 bg-violet-50', label: 'ពណ៌ស្វាយចាស់ (Violet)' }
];

export interface MaintenanceLog {
  id: string;
  equipmentKey: string;
  quantity: number;
  condition: 'Good' | 'Damaged' | 'Missing' | 'NeedRepair';
  reportedIssue: string;
  reportDate: string;
  repairDate: string; // កាលបរិច្ឆេទជួសជុល ឬផ្លាស់ប្តូរ
  repairStatus: 'Pending' | 'Repairing' | 'Repaired' | 'Replaced';
  remarks: string;
  photoUrl?: string;
}

// Classroom representation
export interface ClassroomRecord {
  id: string;
  roomNumber: string;
  location: string; // e.g. "Building A", "Building B"
  floor: string; // "Ground Floor", "1st Floor", etc.
  equipment: EquipmentQuantities;
  remarks: string;
  maintenanceLogs?: MaintenanceLog[];
}

const CONST_FLOORS = [
  { value: 'Ground Floor', kh: 'ជាន់ផ្ទាល់ដី' },
  { value: '1st Floor', kh: 'ជាន់ទី ១' },
  { value: '2nd Floor', kh: 'ជាន់ទី ២' },
  { value: '3rd Floor', kh: 'ជាន់ទី ៣' },
  { value: '4th Floor', kh: 'ជាន់ទី ៤' },
  { value: '5th Floor', kh: 'ជាន់ទី ៥' },
];

const DEFAULT_ROOMS: ClassroomRecord[] = [
  {
    id: 'R-101',
    roomNumber: 'Room 101',
    location: 'អាគារសិក្សា កៅសិប (Building A)',
    floor: 'Ground Floor',
    remarks: 'ថ្នាក់មត្តេយ្យសិក្សា (Preschool Classroom)',
    equipment: {
      studentDesk: 15,
      studentChair: 30,
      teacherDesk: 1,
      teacherChair: 1,
      projector: 1,
      whiteboard: 1,
      ac: 2,
      speaker: 2,
      locker: 1,
      other: 3
    },
    maintenanceLogs: [
      {
        id: 'L-001',
        equipmentKey: 'ac',
        quantity: 1,
        condition: 'NeedRepair',
        reportedIssue: 'ម៉ាស៊ីនត្រជាក់ហៀរទឹក និងមិនសូវត្រជាក់ស្រួល',
        reportDate: '2026-06-05',
        repairDate: '2026-06-12',
        repairStatus: 'Repairing',
        remarks: 'គ្រោងនឹងមកជួសជុលដោយជាងនៅថ្ងៃទី១២ ខែមិថុនា'
      },
      {
        id: 'L-002',
        equipmentKey: 'studentChair',
        quantity: 2,
        condition: 'Damaged',
        reportedIssue: 'បាក់ជើងកៅអីជ័រចំហៀង',
        reportDate: '2026-06-08',
        repairDate: '2026-06-10',
        repairStatus: 'Repaired',
        remarks: 'បានផ្សារជើងទប់ឡើងវិញរួចរាល់ ប្រើប្រាស់បានធម្មតា'
      }
    ]
  },
  {
    id: 'R-102',
    roomNumber: 'Room 102',
    location: 'អាគារសិក្សា កៅសិប (Building A)',
    floor: 'Ground Floor',
    remarks: 'ថ្នាក់បឋមសិក្សាកម្រិតទាប (Primary Level)',
    equipment: {
      studentDesk: 20,
      studentChair: 40,
      teacherDesk: 1,
      teacherChair: 2,
      projector: 1,
      whiteboard: 1,
      ac: 2,
      speaker: 1,
      locker: 0,
      other: 1
    },
    maintenanceLogs: [
      {
        id: 'L-005',
        equipmentKey: 'projector',
        quantity: 1,
        condition: 'NeedRepair',
        reportedIssue: 'កង្ហារម៉ាស៊ីនចាក់ផ្សាយលាន់ឮខ្លាំង ហើយម៉ាស៊ីនឡើងកម្តៅខ្លាំងពេក (Projector fan very loud & overheating)',
        reportDate: '2026-05-28',
        repairDate: '',
        repairStatus: 'Pending',
        remarks: 'មិនទាន់មានជាងទាក់ទងមកវិភាគបញ្ហានៅឡើយ'
      },
      {
        id: 'L-006',
        equipmentKey: 'ac',
        quantity: 1,
        condition: 'Damaged',
        reportedIssue: 'ម៉ាស៊ីនត្រជាក់បង្ហូរទឹកជោកជញ្ជាំង និងមិនដំណើរការសោះ (AC leaking water onto wall & not working)',
        reportDate: '2026-05-25',
        repairDate: '',
        repairStatus: 'Repairing',
        remarks: 'បានទាក់ទងជាងកាលពី ១សប្តាហ៍មុន តែមិនទាន់អញ្ជើញមក'
      }
    ]
  },
  {
    id: 'R-201',
    roomNumber: 'Room 201',
    location: 'អាគារសិក្សា កៅសិប (Building A)',
    floor: '1st Floor',
    remarks: 'ថ្នាក់មធ្យមសិក្សា (Secondary Classroom)',
    equipment: {
      studentDesk: 25,
      studentChair: 25,
      teacherDesk: 1,
      teacherChair: 1,
      projector: 0,
      whiteboard: 2,
      ac: 2,
      speaker: 2,
      locker: 15,
      other: 0
    },
    maintenanceLogs: [
      {
        id: 'L-003',
        equipmentKey: 'projector',
        quantity: 1,
        condition: 'Damaged',
        reportedIssue: 'ដាច់អំពូលបញ្ចាំង (Bulb Blown) រូបភាពមិនចេញ',
        reportDate: '2026-05-20',
        repairDate: '2026-05-25',
        repairStatus: 'Repaired',
        remarks: 'បានប្តូរដុំអំពូលម៉ាស៊ីនចាក់ផ្សាយថ្មី និងតេស្តជោគជ័យ'
      },
      {
        id: 'L-004',
        equipmentKey: 'locker',
        quantity: 3,
        condition: 'Missing',
        reportedIssue: 'បាត់សោរចាក់សោរទូដាក់ឯកសារ',
        reportDate: '2026-06-01',
        repairDate: '2024-06-08',
        repairStatus: 'Replaced',
        remarks: 'បានទិញដុំសោរថ្មីមកប្តូរជំនួសសោរចាស់ដែលបាត់'
      }
    ]
  },
  {
    id: 'R-202',
    roomNumber: 'Room 202',
    location: 'អាគារសិក្សា ខ (Building B)',
    floor: '1st Floor',
    remarks: 'បន្ទប់ពិសោធន៍វិទ្យាសាស្ត្រ (Science Lab)',
    equipment: {
      studentDesk: 10,
      studentChair: 20,
      teacherDesk: 1,
      teacherChair: 1,
      projector: 1,
      whiteboard: 1,
      ac: 2,
      speaker: 4,
      locker: 5,
      other: 12
    },
    maintenanceLogs: []
  },
  {
    id: 'R-301',
    roomNumber: 'Room 301',
    location: 'អាគារសិក្សា ខ (Building B)',
    floor: '2nd Floor',
    remarks: 'បន្ទប់ព័ត៌មានវិទ្យា (Computer Lab)',
    equipment: {
      studentDesk: 30,
      studentChair: 30,
      teacherDesk: 1,
      teacherChair: 1,
      projector: 1,
      whiteboard: 1,
      ac: 3,
      speaker: 2,
      locker: 0,
      other: 32
    },
    maintenanceLogs: []
  }
];

export default function ClassroomEquipmentManager() {
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentItemType[]>(() => {
    try {
      const saved = localStorage.getItem('wis_classroom_equipment_types');
      return saved ? JSON.parse(saved) : DEFAULT_EQUIPMENT_TYPES;
    } catch {
      return DEFAULT_EQUIPMENT_TYPES;
    }
  });

  // Keep equipment types saved
  useEffect(() => {
    try {
      localStorage.setItem('wis_classroom_equipment_types', JSON.stringify(equipmentTypes));
    } catch (e) {
      console.error(e);
    }
  }, [equipmentTypes]);

  const [rooms, setRooms] = useState<ClassroomRecord[]>(() => {
    try {
      const saved = localStorage.getItem('wis_classroom_rooms');
      return saved ? JSON.parse(saved) : DEFAULT_ROOMS;
    } catch {
      return DEFAULT_ROOMS;
    }
  });

  // Keep saved
  useEffect(() => {
    try {
      localStorage.setItem('wis_classroom_rooms', JSON.stringify(rooms));
    } catch (e) {
      console.error(e);
    }
  }, [rooms]);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFloor, setFilterFloor] = useState('All');
  
  // Selection / Modal state
  const [selectedRoom, setSelectedRoom] = useState<ClassroomRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<ClassroomRecord | null>(null);

  // Form states (Add/Edit Room Profile)
  const [roomNumber, setRoomNumber] = useState('');
  const [location, setLocation] = useState('');
  const [floor, setFloor] = useState('Ground Floor');
  const [remarks, setRemarks] = useState('');
  const [initialQty, setInitialQty] = useState<EquipmentQuantities>({
    studentDesk: 20,
    studentChair: 20,
    teacherDesk: 1,
    teacherChair: 1,
    projector: 1,
    whiteboard: 1,
    ac: 2,
    speaker: 2,
    locker: 0,
    other: 0
  });

  // State for adding a new Custom Equipment Item type
  const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState(false);
  const [customItemLabelKh, setCustomItemLabelKh] = useState('');
  const [customItemLabelEn, setCustomItemLabelEn] = useState('');
  const [customItemIcon, setCustomItemIcon] = useState('Info');
  const [customItemColor, setCustomItemColor] = useState('text-emerald-600 bg-emerald-50');
  const [customItemInitialQty, setCustomItemInitialQty] = useState(0);

  // States for Equipment Maintenance and Inspection tracking
  const [detailTab, setDetailTab] = useState<'items' | 'maintenance'>('items');
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);

  // Form states for Maintenance Track record
  const [logEquipmentKey, setLogEquipmentKey] = useState('');
  const [logQuantity, setLogQuantity] = useState(1);
  const [logCondition, setLogCondition] = useState<'Good' | 'Damaged' | 'Missing' | 'NeedRepair'>('NeedRepair');
  const [logReportedIssue, setLogReportedIssue] = useState('');
  const [logReportDate, setLogReportDate] = useState('2026-06-10');
  const [logRepairDate, setLogRepairDate] = useState('');
  const [logRepairStatus, setLogRepairStatus] = useState<'Pending' | 'Repairing' | 'Repaired' | 'Replaced'>('Pending');
  const [logRemarks, setLogRemarks] = useState('');

  // Camera & Image state variables
  const [logPhotoUrl, setLogPhotoUrl] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Stop camera tracks helper
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  // Run or sync camera element with state
  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => console.log("Video play interrupted", err));
    }
  }, [isCameraActive, cameraStream]);

  // Clean up camera on modal close
  useEffect(() => {
    if (!isMaintenanceModalOpen) {
      stopCamera();
    }
  }, [isMaintenanceModalOpen]);

  // Notification feedback Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Telegram Equipment Notification State
  const [telegramBotToken, setTelegramBotToken] = useState(() => localStorage.getItem('wis_telegram_bot_token') || '');
  const [telegramChatId, setTelegramChatId] = useState(() => localStorage.getItem('wis_telegram_chat_id') || '');
  const [isTelegramEnabled, setIsTelegramEnabled] = useState(() => {
    const saved = localStorage.getItem('wis_telegram_equipment_alerts_enabled');
    return saved !== 'false';
  });
  const [showTelegramSetup, setShowTelegramSetup] = useState(false);
  const [telegramTestStatus, setTelegramTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [telegramTestError, setTelegramTestError] = useState('');

  const handleSaveTelegramState = (token: string, chatId: string, enabled: boolean) => {
    setTelegramBotToken(token);
    setTelegramChatId(chatId);
    setIsTelegramEnabled(enabled);
    localStorage.setItem('wis_telegram_bot_token', token);
    localStorage.setItem('wis_telegram_chat_id', chatId);
    localStorage.setItem('wis_telegram_equipment_alerts_enabled', enabled ? 'true' : 'false');
  };

  const sendTelegramTestMessage = async () => {
    if (!telegramBotToken.trim() || !telegramChatId.trim()) {
      setTelegramTestStatus('error');
      setTelegramTestError('សូមបញ្ចូល Telegram Bot Token និង Chat ID ជាមុនសិន!');
      return;
    }

    setTelegramTestStatus('sending');
    setTelegramTestError('');

    try {
      const url = `https://api.telegram.org/bot${telegramBotToken.trim()}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramChatId.trim(),
          text: `🔔 <b>ការសាកល្បងប្រព័ន្ធជូនដំណឹង - WIS Classroom Equipment Notification Test</b>\n\nប្រព័ន្ធស្វ័យប្រវត្តិតភ្ជាប់ជោគជ័យ! បញ្ហាសម្ភារៈខូចខាត ឬត្រូវការជួសជុលនឹងរាយការណ៍មកកាន់ក្រុមនេះ។\n\n✍️ <i>WIS Equipment Module Test</i>`,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();
      if (response.ok && data.ok) {
        setTelegramTestStatus('success');
        showToast('📨 សារសាកល្បងត្រូវបានផ្ញើទៅកាន់ក្រុម Telegram រួចរាល់!', 'success');
        setTimeout(() => {
          setTelegramTestStatus('idle');
        }, 5000);
      } else {
        setTelegramTestStatus('error');
        setTelegramTestError(data.description || 'ការសាកល្បងបរាជ័យ!');
      }
    } catch (err: any) {
      setTelegramTestStatus('error');
      setTelegramTestError(err.message || 'មិនអាចភ្ជាប់ទៅ Telegram Bot API!');
    }
  };

  const sendEquipmentNotificationToTelegram = async (roomNumber: string, log: MaintenanceLog) => {
    const token = localStorage.getItem('wis_telegram_bot_token') || telegramBotToken;
    const chatId = localStorage.getItem('wis_telegram_chat_id') || telegramChatId;
    const isEnabled = localStorage.getItem('wis_telegram_equipment_alerts_enabled') !== 'false';

    if (!isEnabled) {
      console.log('Automated Telegram alerts are disabled by user.');
      return;
    }

    if (!token || !chatId) {
      console.log('Telegram Bot Token or Chat ID not configured. Skipping automatic report.');
      return;
    }

    try {
      const itemType = equipmentTypes.find(t => t.key === log.equipmentKey);
      const keyLabel = itemType ? itemType.label.split('(')[0].trim() : log.equipmentKey;
      
      let conditionLabel = '';
      let conditionEmoji = '⚠️';
      if (log.condition === 'NeedRepair') {
        conditionLabel = 'ត្រូវការជួសជុល (Need Repair)';
        conditionEmoji = '⚠️';
      } else if (log.condition === 'Damaged') {
        conditionLabel = 'ខូចខាត (Damaged)';
        conditionEmoji = '🚨';
      } else {
        return;
      }

      let text = `🚨 <b>របាយការណ៍ខូចខាតឧបករណ៍ - Classroom Equipment Alert</b>\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
      text += `🏫 <b>ថ្នាក់រៀន/បន្ទប់៖</b> <code>${roomNumber}</code>\n`;
      text += `📦 <b>សម្ភារៈឧបករណ៍៖</b> <b>${keyLabel}</b>\n`;
      text += `🔢 <b>ចំនួន៖</b> <b>${log.quantity} គ្រឿង</b>\n`;
      text += `${conditionEmoji} <b>ស្ថានភាព៖</b> <b>${conditionLabel}</b>\n`;
      text += `📅 <b>ថ្ងៃរាយការណ៍៖</b> ${log.reportDate}\n\n`;
      text += `📋 <b>ការពិពណ៌នាអំពីបញ្ហា៖</b>\n<i>${log.reportedIssue || 'គ្មានការពិពណ៌នាបញ្ហា'}</i>\n`;
      
      if (log.remarks) {
        text += `\n✍️ <b>កំណត់សម្គាល់៖</b> <i>${log.remarks}</i>\n`;
      }
      text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `✍️ <i>របាយការណ៍បញ្ជូនដោយស្វ័យប្រវត្តិតាមរយៈ WIS Classroom Management System</i>`;

      const url = `https://api.telegram.org/bot${token.trim()}/sendMessage`;
      
      let sentPhoto = false;
      if (log.photoUrl && log.photoUrl.startsWith('data:image/')) {
        try {
          const response = await fetch(log.photoUrl);
          const blob = await response.blob();
          
          const formData = new FormData();
          formData.append('chat_id', chatId.trim());
          formData.append('photo', blob, 'equipment_damage.jpg');
          formData.append('caption', text);
          formData.append('parse_mode', 'HTML');
          
          const photoUrl = `https://api.telegram.org/bot${token.trim()}/sendPhoto`;
          const photoRes = await fetch(photoUrl, {
            method: 'POST',
            body: formData
          });
          const photoData = await photoRes.json();
          if (photoRes.ok && photoData.ok) {
            sentPhoto = true;
          } else {
            console.warn('Telegram sendPhoto failed, falling back to message:', photoData.description);
          }
        } catch (photoErr) {
          console.error('Error uploading photo to Telegram:', photoErr);
        }
      }

      if (!sentPhoto) {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId.trim(),
            text: text,
            parse_mode: 'HTML',
          }),
        });
        const data = await response.json();
        if (!data.ok) {
          console.error('Telegram sendMessage failed:', data.description);
        }
      }
      
      showToast('📨 របាយការណ៍ត្រូវបានបញ្ជូនទៅ Telegram រួចរាល់!', 'success');
    } catch (err) {
      console.error('Telegram notification network error:', err);
    }
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Auto-select first room on view load if none selected
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0]);
    }
  }, [rooms, selectedRoom]);

  // Master Sum calculations of all assets across the entire school listing!
  const getGrandTotals = () => {
    const totals: Record<string, number> = {};
    equipmentTypes.forEach(t => {
      totals[t.key] = 0;
    });

    rooms.forEach(room => {
      equipmentTypes.forEach(t => {
        totals[t.key] = (totals[t.key] || 0) + (room.equipment[t.key] || 0);
      });
    });

    return totals;
  };

  const grandTotals = getGrandTotals();

  // Dashboard notification collapse state
  const [isAlertsExpanded, setIsAlertsExpanded] = useState(true);

  // Get days unaddressed based on June 10, 2026 anchor date
  const getDaysUnaddressed = (reportDateStr: string) => {
    if (!reportDateStr) return 0;
    const reportDate = new Date(reportDateStr);
    if (isNaN(reportDate.getTime())) return 0;
    
    // System reference date anchor: 2026-06-10 or later
    const current = new Date('2026-06-10');
    const now = new Date();
    const anchorDate = now > current ? now : current;
    
    const diffTime = anchorDate.getTime() - reportDate.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  };

  const getUrgentUnaddressedLogs = () => {
    const list: { room: ClassroomRecord; log: MaintenanceLog; days: number }[] = [];
    rooms.forEach(room => {
      if (room.maintenanceLogs) {
        room.maintenanceLogs.forEach(log => {
          if (
            (log.condition === 'NeedRepair' || log.condition === 'Damaged') &&
            (log.repairStatus === 'Pending' || log.repairStatus === 'Repairing')
          ) {
            const days = getDaysUnaddressed(log.reportDate);
            if (days > 7) {
              list.push({ room, log, days });
            }
          }
        });
      }
    });
    return list.sort((a, b) => b.days - a.days);
  };

  const urgentLogs = getUrgentUnaddressedLogs();

  // States and helper functions for full Damaged / Need Repair Equipment Summary section
  const [isEquipmentSummaryExpanded, setIsEquipmentSummaryExpanded] = useState(true);
  const [summaryStatusFilter, setSummaryStatusFilter] = useState<'all' | 'unresolved'>('unresolved');

  const getSummaryDamagedOrNeedRepairLogs = () => {
    const list: { room: ClassroomRecord; log: MaintenanceLog; days: number }[] = [];
    rooms.forEach(room => {
      if (room.maintenanceLogs) {
        room.maintenanceLogs.forEach(log => {
          if (log.condition === 'NeedRepair' || log.condition === 'Damaged') {
            const isUnresolved = log.repairStatus === 'Pending' || log.repairStatus === 'Repairing';
            if (summaryStatusFilter === 'all' || isUnresolved) {
              const days = getDaysUnaddressed(log.reportDate);
              list.push({ room, log, days });
            }
          }
        });
      }
    });
    return list.sort((a, b) => b.days - a.days);
  };

  const summaryDamagedLogs = getSummaryDamagedOrNeedRepairLogs();

  // Handle manual unit plus/minus adjustments
  const adjustEquipmentQty = (roomId: string, key: string, amount: number) => {
    const updated = rooms.map(r => {
      if (r.id === roomId) {
        const value = Math.max(0, (r.equipment[key] || 0) + amount);
        const nextQty = {
          ...r.equipment,
          [key]: value
        };
        return {
          ...r,
          equipment: nextQty
        };
      }
      return r;
    });

    setRooms(updated);
    
    // Also sync selectedRoom display
    const roomMatch = updated.find(r => r.id === roomId);
    if (roomMatch) {
      setSelectedRoom(roomMatch);
    }
  };

  // Handle direct typed numeric quantity change
  const setEquipmentQtyDirect = (roomId: string, key: string, inputVal: string) => {
    const cleanNum = parseInt(inputVal, 10);
    const validNum = isNaN(cleanNum) ? 0 : Math.max(0, cleanNum);

    const updated = rooms.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          equipment: {
            ...r.equipment,
            [key]: validNum
          }
        };
      }
      return r;
    });

    setRooms(updated);

    const roomMatch = updated.find(r => r.id === roomId);
    if (roomMatch) {
      setSelectedRoom(roomMatch);
    }
  };

  // Handler to register a new custom equipment type
  const handleAddCustomItemType = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customItemLabelKh.trim() && !customItemLabelEn.trim()) {
      showToast('សូមបំពេញឈ្មោះសម្ភារៈជាដាច់ខាត!', 'error');
      return;
    }

    const brandKh = customItemLabelKh.trim();
    const brandEn = customItemLabelEn.trim();
    const label = `${brandKh}${brandEn ? ` (${brandEn})` : ''}`;
    const newKey = `cust_${Date.now()}`;

    const newType: EquipmentItemType = {
      key: newKey,
      label,
      iconName: customItemIcon,
      color: customItemColor
    };

    // 1. Add to equipment types list
    const nextTypes = [...equipmentTypes, newType];
    setEquipmentTypes(nextTypes);

    // 2. Add to all rooms defaulting to 0, except active room if quantity was specified
    const updatedRooms = rooms.map(r => {
      const isCurrentSelected = r.id === selectedRoom?.id;
      return {
        ...r,
        equipment: {
          ...r.equipment,
          [newKey]: isCurrentSelected ? customItemInitialQty : 0
        }
      };
    });

    setRooms(updatedRooms);

    // Update active visual panel
    if (selectedRoom) {
      const match = updatedRooms.find(r => r.id === selectedRoom.id);
      if (match) setSelectedRoom(match);
    }

    showToast(`បានបន្ថែមប្រភេទសម្ភារៈថ្មី៖ "${label}" រួចរាល់!`, 'success');

    // Reset fields & close modal
    setCustomItemLabelKh('');
    setCustomItemLabelEn('');
    setCustomItemIcon('Info');
    setCustomItemColor('text-emerald-600 bg-emerald-50');
    setCustomItemInitialQty(0);
    setIsCustomItemModalOpen(false);
  };

  // Open Maintenance Log creation / update form
  const openMaintenanceLogModal = (log: MaintenanceLog | null = null) => {
    setCameraError('');
    if (log) {
      setEditingLog(log);
      setLogEquipmentKey(log.equipmentKey);
      setLogQuantity(log.quantity);
      setLogCondition(log.condition);
      setLogReportedIssue(log.reportedIssue);
      setLogReportDate(log.reportDate || '2026-06-10');
      setLogRepairDate(log.repairDate || '');
      setLogRepairStatus(log.repairStatus || 'Pending');
      setLogRemarks(log.remarks || '');
      setLogPhotoUrl(log.photoUrl || '');
    } else {
      setEditingLog(null);
      setLogEquipmentKey(equipmentTypes[0]?.key || 'studentDesk');
      setLogQuantity(1);
      setLogCondition('NeedRepair');
      setLogReportedIssue('');
      setLogReportDate('2026-06-10');
      setLogRepairDate('');
      setLogRepairStatus('Pending');
      setLogRemarks('');
      setLogPhotoUrl('');
    }
    setIsMaintenanceModalOpen(true);
  };

  // Create or Update Maintenance Record
  const handleSaveMaintenanceLog = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRoom) return;

    if (!logEquipmentKey) {
      showToast('សូមជ្រើសរើសប្រភេទឧបករណ៍!', 'error');
      return;
    }

    const currentLogs = selectedRoom.maintenanceLogs || [];

    let updatedLogs: MaintenanceLog[] = [];
    let logToReport: MaintenanceLog | null = null;

    if (editingLog) {
      // Edit
      const editedLog: MaintenanceLog = {
        ...editingLog,
        equipmentKey: logEquipmentKey,
        quantity: logQuantity,
        condition: logCondition,
        reportedIssue: logReportedIssue,
        reportDate: logReportDate,
        repairDate: logRepairDate,
        repairStatus: logRepairStatus,
        remarks: logRemarks,
        photoUrl: logPhotoUrl
      };
      updatedLogs = currentLogs.map(l => l.id === editingLog.id ? editedLog : l);
      
      if (logCondition === 'Damaged' || logCondition === 'NeedRepair') {
        logToReport = editedLog;
      }
      showToast('បានធ្វើបច្ចុប្បន្នភាពកំណត់ត្រាត្រួតពិនិត្យ និងជួសជុល!', 'success');
    } else {
      // Add
      const newLog: MaintenanceLog = {
        id: `L-${Math.floor(100 + Math.random() * 900)}`,
        equipmentKey: logEquipmentKey,
        quantity: logQuantity,
        condition: logCondition,
        reportedIssue: logReportedIssue,
        reportDate: logReportDate,
        repairDate: logRepairDate,
        repairStatus: logRepairStatus,
        remarks: logRemarks,
        photoUrl: logPhotoUrl
      };
      updatedLogs = [...currentLogs, newLog];

      if (logCondition === 'Damaged' || logCondition === 'NeedRepair') {
        logToReport = newLog;
      }
      showToast('បានកត់ត្រាការត្រួតពិនិត្យ/ការផ្ដួចផ្ដើមជួសជុលថ្មី!', 'success');
    }

    // Update rooms list
    const updatedRooms = rooms.map(r => r.id === selectedRoom.id ? {
      ...r,
      maintenanceLogs: updatedLogs
    } : r);

    setRooms(updatedRooms);
    
    // Update active view
    const matched = updatedRooms.find(r => r.id === selectedRoom.id);
    if (matched) setSelectedRoom(matched);

    setIsMaintenanceModalOpen(false);

    // Call auto-forward telegram report after state actions complete
    if (logToReport) {
      sendEquipmentNotificationToTelegram(selectedRoom.roomNumber, logToReport);
    }
  };

  // Delete specific maintenance record
  const handleDeleteMaintenanceLog = (logId: string) => {
    if (!selectedRoom) return;
    if (window.confirm('តើអ្នកពិតជាចង់លុបចោលកំណត់ត្រាស្ថានភាព/ការជួសជុលនេះមែនទេ?')) {
      const currentLogs = selectedRoom.maintenanceLogs || [];
      const updatedLogs = currentLogs.filter(l => l.id !== logId);

      const updatedRooms = rooms.map(r => r.id === selectedRoom.id ? {
        ...r,
        maintenanceLogs: updatedLogs
      } : r);

      setRooms(updatedRooms);
      
      const matched = updatedRooms.find(r => r.id === selectedRoom.id);
      if (matched) setSelectedRoom(matched);

      showToast('បានលុបចោលកំណត់ត្រាជោគជ័យ!', 'info');
    }
  };

  // Start camera stream
  const startCameraFocus = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      setIsCameraActive(true);
    } catch (err: any) {
      console.error(err);
      setCameraError('មិនអាចសុំសិទ្ធិបើកកាមេរ៉ាបានទេ! សូមប្រាកដថាអ្នកបានបើកសិទ្ធិកាមេរ៉ាក្នុងកម្មវិធីរុករករបស់អ្នក (Could not access camera device. Please check site permissions!)');
    }
  };

  // Capture canvas photo snapshot from video stream
  const captureCameraPhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setLogPhotoUrl(dataUrl);
        stopCamera();
      }
    }
  };

  // Handle uploaded files
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('សូមជ្រើសរើសតែឯកសាររូបភាពប៉ុណ្ណោះ! (Images only)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setLogPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag handles
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('សូមជ្រើសរើសតែឯកសាររូបភាពប៉ុណ្ណោះ! (Images only)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setLogPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Room Modal creator / editor
  const openRoomModal = (room: ClassroomRecord | null = null) => {
    if (room) {
      setEditingRoom(room);
      setRoomNumber(room.roomNumber);
      setLocation(room.location);
      setFloor(room.floor);
      setRemarks(room.remarks || '');
      
      const fullQty = { ...room.equipment };
      equipmentTypes.forEach(t => {
        if (fullQty[t.key] === undefined) {
          fullQty[t.key] = 0;
        }
      });
      setInitialQty(fullQty as any);
    } else {
      setEditingRoom(null);
      setRoomNumber(`Room ${rooms.length + 101}`);
      setLocation('');
      setFloor('Ground Floor');
      setRemarks('');
      
      const defaultQty: Record<string, number> = {};
      equipmentTypes.forEach(t => {
        defaultQty[t.key] = t.key === 'studentDesk' ? 24 : t.key === 'studentChair' ? 24 : t.key === 'teacherDesk' ? 1 : t.key === 'teacherChair' ? 1 : t.key === 'projector' ? 1 : t.key === 'whiteboard' ? 1 : t.key === 'ac' ? 2 : t.key === 'speaker' ? 2 : 0;
      });
      setInitialQty(defaultQty as any);
    }
    setIsModalOpen(true);
  };

  // Save new/edited classroom
  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomNumber.trim() || !location.trim()) {
      showToast('សូមបំពេញលេខបន្ទប់ និងទីតាំងជាដាច់ខាត!', 'error');
      return;
    }

    if (editingRoom) {
      // Edit
      const updated = rooms.map(r => r.id === editingRoom.id ? {
        ...r,
        roomNumber,
        location,
        floor,
        remarks,
        equipment: initialQty
      } : r);
      setRooms(updated);
      showToast(`បានកែប្រែព័ត៌មានថ្នាក់ "${roomNumber}" ដោយស្វ័យប្រវត្ត!`, 'success');
      
      // Update viewing panel
      const match = updated.find(r => r.id === editingRoom.id);
      if (match) setSelectedRoom(match);
    } else {
      // New Room
      const newRoom: ClassroomRecord = {
        id: 'R-' + Math.floor(100 + Math.random() * 900),
        roomNumber,
        location,
        floor,
        remarks,
        equipment: initialQty
      };
      setRooms([...rooms, newRoom]);
      setSelectedRoom(newRoom);
      showToast(`បានបន្ថែមបន្ទប់រៀនថ្មី "${roomNumber}" ជោគជ័យ!`, 'success');
    }

    setIsModalOpen(false);
  };

  // Delete Room Record
  const handleDeleteRoom = (roomId: string, name: string) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបចោលបន្ទប់រៀន "${name}" និងរាល់បញ្ជីសម្ភារៈទាំងអស់មែនទេ?`)) {
      const nextRooms = rooms.filter(r => r.id !== roomId);
      setRooms(nextRooms);
      
      // select next available room
      if (nextRooms.length > 0) {
        setSelectedRoom(nextRooms[0]);
      } else {
        setSelectedRoom(null);
      }
      showToast(`បានលុបបន្ទប់រៀន "${name}" រួចរាល់`, 'info');
    }
  };

  // Room search filtering
  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (r.remarks && r.remarks.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFloor = filterFloor === 'All' || r.floor === filterFloor;
    return matchesSearch && matchesFloor;
  });

  return (
    <div className="bg-white/95 rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200 font-sans relative">
      
      {/* Toast Alert Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-black flex items-center gap-2 max-w-sm ${
              toast.type === 'success' 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}
          >
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>{toast.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#073B3A] text-amber-300 rounded-2xl w-fit shadow-md">
            <School className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-1.5 leading-snug">
              ការគ្រប់គ្រងសម្ភារៈនៅក្នុងបន្ទប់រៀន (Classroom Equipment & Inventory)
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              សវនកម្មទ្រព្យសម្បត្តិសាលា តុ កៅអី ម៉ាស៊ីនត្រជាក់ ស្ប៉ីគឃ័រ លុកឃ័រ និងឧបករណ៍បង្រៀននានាក្នុងគ្រប់បន្ទប់ថ្នាក់រៀន
            </p>
          </div>
        </div>

        <button
          onClick={() => openRoomModal(null)}
          className="bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.01] active:scale-[0.99] transition-all text-white font-black text-xs px-4 py-3 rounded-xl flex items-center gap-1.5 self-start md:self-auto cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>បង្កើតបន្ទប់ថ្នាក់ថ្មី (Add Classroom)</span>
        </button>
      </div>

      {/* School Equipment Master Sum Box */}
      <div className="bg-[#073B3A] text-white rounded-2xl p-4.5 mb-6 border border-[#0d5c5a]/45 relative overflow-hidden shadow-sm">
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-3 translate-x-3">
          <School className="w-56 h-56" />
        </div>

        <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-amber-300 flex items-center gap-1.5 mb-3.5">
          <Layers className="w-4 h-4 animate-pulse" />
          <span>ចំនួនសម្ភារៈ-ឧបករណ៍សរុបប្រចាំសាលា (School-wide Inventory Summary)</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3.5 text-center">
          {equipmentTypes.map(it => {
            const labelShort = it.label.split('(')[0].trim();
            return (
              <div key={it.key} className="border border-slate-750/30 rounded-xl p-2 flex flex-col justify-between bg-slate-900/40">
                <span className="text-[10px] text-slate-300 font-bold truncate" title={it.label}>{labelShort}</span>
                <span className="text-sm font-black font-mono text-amber-300 block mt-1">{grandTotals[it.key] || 0}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Telegram Equipment Auto-Report Settings */}
      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-3xl p-4.5 shadow-2xs">
        <div 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
          onClick={() => setShowTelegramSetup(!showTelegramSetup)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-150 shrink-0">
              <RefreshCw className={`w-5 h-5 shrink-0 ${isTelegramEnabled && telegramBotToken && telegramChatId ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 flex items-center flex-wrap gap-2 leading-none">
                <span>🤖 ប្រព័ន្ធតភ្ជាប់ស្វ័យប្រវត្តិតាម Telegram (Automated Telegram Notifications)</span>
                <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full leading-none ${
                  isTelegramEnabled && telegramBotToken && telegramChatId 
                    ? 'bg-emerald-500 text-white animate-pulse' 
                    : 'bg-slate-300 text-slate-700'
                }`}>
                  {isTelegramEnabled && telegramBotToken && telegramChatId ? 'បើកដំណើរការ (Active)' : 'មិនទាន់តភ្ជាប់ (Not Configured)'}
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-1.5 leading-normal">
                បញ្ជូនរបាយការណ៍ស្វ័យប្រវត្តិទៅកាន់គ្រុបការងារភ្លាមៗ រាល់ពេលកត់ត្រាសម្ភារៈខូចខាត ឬត្រូវការជួសជុល (Send alerts to Telegram when items are marked 'Damaged' or 'Need Repair')
              </p>
            </div>
          </div>
          
          <button
            type="button"
            className="text-[10.5px] font-black text-indigo-750 hover:text-indigo-900 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl transition cursor-pointer shrink-0 self-end sm:self-auto shadow-2xs"
          >
            {showTelegramSetup ? 'លាក់ការកំណត់ (Hide Settings)' : 'កំណត់ការតភ្ជាប់ (Configure)'}
          </button>
        </div>

        <AnimatePresence>
          {showTelegramSetup && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-3">
                    <label className="text-xs font-black text-slate-750 block">បើកដំណើរការបញ្ជូន (Enabled Alerts)</label>
                    <p className="text-[10px] text-slate-500 font-medium">បើក / បិទការផ្ញើសារស្វ័យប្រវត្តិ</p>
                  </div>
                  <div className="sm:col-span-9">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveTelegramState(telegramBotToken, telegramChatId, !isTelegramEnabled)}
                        className={`font-black text-xs px-4 py-2 rounded-xl border transition cursor-pointer shadow-3xs ${
                          isTelegramEnabled
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}
                      >
                        {isTelegramEnabled ? '📡 បានបើក (On)' : '📴 បានបិទ (Off)'}
                      </button>
                      <span className="text-[10.5px] text-slate-500 font-bold">
                        {isTelegramEnabled 
                          ? 'សារនឹងត្រូវបានបញ្ជូនទៅ Telegram ភ្លាមៗ' 
                          : 'សារនឹងមិនត្រូវបានផ្ញើឡើយ (ទោះបីជាបានបំពេញព័ត៌មានខាងក្រោម)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-black text-slate-700">Telegram Bot Token</label>
                    <input
                      type="text"
                      placeholder="ឧ. 123456:ABC-DEF..."
                      value={telegramBotToken}
                      onChange={(e) => handleSaveTelegramState(e.target.value, telegramChatId, isTelegramEnabled)}
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-mono text-[11px] focus:ring-1 focus:ring-indigo-500 focus:outline-none transition shadow-3xs"
                    />
                    <p className="text-[10px] text-slate-400 font-medium">ទទួលបានពី @BotFather លើកម្មវិធី Telegram</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-black text-slate-700">Telegram Chat ID (Group/Channel)</label>
                    <input
                      type="text"
                      placeholder="ឧ. -100123456789"
                      value={telegramChatId}
                      onChange={(e) => handleSaveTelegramState(telegramBotToken, e.target.value, isTelegramEnabled)}
                      className="w-full bg-white border border-slate-200 p-2.5 rounded-xl font-mono text-[11px] focus:ring-1 focus:ring-indigo-500 focus:outline-none transition shadow-3xs"
                    />
                    <p className="text-[10px] text-slate-400 font-medium">ID នៃក្រុមដែលត្រូវបញ្ជូនរបាយការណ៍ទៅ</p>
                  </div>
                </div>

                {/* Info and Test messaging actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-150">
                  <div className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-lg col-span-1">
                    💡 <b>ព័ត៌មានបន្ថែម៖</b> ការកំណត់នេះត្រូវបានចែករំលែកជាមួយទំព័រ <b>Telegram Reporter</b> រួមគ្នា។ អ្នកអាចកែប្រែនៅទីនេះ ឬទីនោះបានដូចគ្នា។ ប្រសិនមិនទាន់មាន Bot ទេ សូមបញ្ចូល Bot របស់លោកអ្នក រួចសាកល្បងដោយចុចប៊ូតុងខាងស្តាំ។
                  </div>

                  <div className="flex items-center gap-2 self-end">
                    {telegramTestStatus === 'sending' && (
                      <span className="text-[10px] font-bold text-indigo-650 animate-pulse bg-indigo-50 border border-indigo-150 px-2 py-1 rounded-lg">កំពុងសាកល្បង...</span>
                    )}
                    {telegramTestStatus === 'success' && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-1 rounded-lg">សាកល្បងជោគជ័យ!</span>
                    )}
                    {telegramTestStatus === 'error' && (
                      <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-1 rounded-lg truncate max-w-xs">{telegramTestError}</span>
                    )}

                    <button
                      type="button"
                      onClick={sendTelegramTestMessage}
                      disabled={telegramTestStatus === 'sending'}
                      className="bg-indigo-500 hover:bg-indigo-650 disabled:opacity-50 text-white font-extrabold text-[10.5px] px-4 py-2 rounded-xl transition cursor-pointer shadow-2xs"
                    >
                      សាកល្បងបញ្ជូនសារ (Send Test)
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dashboard Notification System / Urgent Equipment Updates */}
      <div className="mb-6">
        <div className={`rounded-3xl border transition-all duration-350 overflow-hidden ${
          urgentLogs.length > 0 
            ? 'bg-rose-50/25 border-rose-200 shadow-sm' 
            : 'bg-emerald-50/10 border-emerald-100/40 shadow-2xs'
        }`}>
          {/* Header Bar */}
          <div className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none ${
            urgentLogs.length > 0 ? 'bg-rose-50/65' : 'bg-emerald-50/15'
          }`}
            onClick={() => setIsAlertsExpanded(!isAlertsExpanded)}
          >
            <div className="flex items-start sm:items-center gap-3">
              <div className={`p-2 rounded-2xl shrink-0 flex items-center justify-center ${
                urgentLogs.length > 0 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-emerald-100 text-emerald-800'
              }`}>
                <AlertTriangle className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800 flex items-center flex-wrap gap-2 leading-none">
                  <span>🔔 ប្រព័ន្ធជូនដំណឹងស្ថានភាពឧបករណ៍បន្ទាន់ (Urgent Technical Alerts)</span>
                  {urgentLogs.length > 0 && (
                    <span className="bg-rose-600 text-white font-mono text-[10.5px] font-black px-2 py-0.5 rounded-full leading-none">
                      {urgentLogs.length} បញ្ហា
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-1 leading-normal">
                  {urgentLogs.length > 0 
                    ? `មានឧបករណ៍ចំនួន ${urgentLogs.length} គ្រឿងត្រូវបានរាយការណ៍ថាខូច ឬត្រូវការជួសជុលលើសពី ៧ ថ្ងៃដោយគ្មានការដោះស្រាយ`
                    : 'ឧបករណ៍សម្ភារៈទាំងអស់កំពុងស្ថិតក្នុងស្ថានភាពធម្មតា ឬបានដោះស្រាយទាន់ពេលក្នុងរយៈពេល ៧ ថ្ងៃ (No unaddressed critical repairs older than 7 days)'
                  }
                </p>
              </div>
            </div>

            <button
              type="button"
              className="text-[10.5px] font-black text-slate-650 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl transition cursor-pointer shrink-0 self-end sm:self-auto"
            >
              {isAlertsExpanded ? 'លាក់ព័ត៌មាន (Hide Details)' : 'បង្ហាញលម្អិត (Show Details)'}
            </button>
          </div>

          {/* Expanded Alerts list */}
          <AnimatePresence>
            {isAlertsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="border-t border-slate-200/60 overflow-hidden"
              >
                {urgentLogs.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-semibold bg-white">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <span className="text-slate-700 font-bold">ប្រព័ន្ធដំណើរការបានល្អឥតខ្ចោះ!</span>
                    <p className="text-[10.5px] text-slate-450 font-medium mt-1">គ្មានការរាយការណ៍អំពីឧបករណ៍ខូចខាតណាមួយដែលទុកចោលហួសរយៈពេល ៧ ថ្ងៃឡើយ។</p>
                  </div>
                ) : (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/50">
                    {urgentLogs.map(({ room, log, days }) => {
                      const itemType = equipmentTypes.find(t => t.key === log.equipmentKey);
                      const keyLabel = itemType ? itemType.label.split('(')[0].trim() : log.equipmentKey;

                      // Condition styles
                      const condColor = log.condition === 'NeedRepair' 
                        ? 'text-amber-700 bg-amber-50 border-amber-200' 
                        : 'text-rose-700 bg-rose-50 border-rose-200';

                      return (
                        <div 
                          key={log.id} 
                          className="bg-white border border-rose-200/55 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition relative overflow-hidden flex flex-col justify-between"
                        >
                          <div className="absolute right-0 top-0 bg-rose-600 text-white font-mono text-[9.5px] font-black px-3 py-1 rounded-bl-xl shadow-xs">
                            ហួសពេល {days} ថ្ងៃ
                          </div>

                          <div className="space-y-2 pr-12">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-lg">
                                {room.roomNumber}
                              </span>
                              <span className="text-xs font-bold text-slate-800">{keyLabel}</span>
                              <span className={`text-[10px] border px-1.5 py-0.5 rounded-lg font-black ${condColor}`}>
                                {log.condition === 'NeedRepair' ? 'ត្រូវការជួសជុល (Need Repair)' : 'ខូចខាត (Damaged)'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 font-semibold leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 line-clamp-2" title={log.reportedIssue}>
                              {log.reportedIssue || 'គ្មានព័ត៌មានលម្អិត'}
                            </p>

                            <div className="flex items-center gap-1.5 text-[10px] text-slate-450 font-bold">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>រាយការណ៍៖ <strong className="text-slate-700">{log.reportDate}</strong> &bull; ស្ថានភាព៖ <strong className="text-rose-650">{log.repairStatus === 'Pending' ? 'មិនទាន់ចាប់ផ្ដើម' : 'កំពុងជួសជុល'}</strong></span>
                            </div>
                          </div>

                          <div className="mt-4.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-mono font-bold">កូដ៖ {log.id}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRoom(room);
                                setDetailTab('maintenance');
                                setTimeout(() => {
                                  const el = document.getElementById('room-detail-panel');
                                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }, 50);
                              }}
                              className="text-[10.5px] font-black text-[#073B3A] hover:bg-[#073B3A]/5 border border-[#073B3A]/30 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <span>ទៅកាន់បន្ទប់រៀនដើម្បីដោះស្រាយ (Manage Classroom)</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Complete Dashboard Summary Section: Classroom Equipment Marked as 'Damaged' or 'Need Repair' */}
      <div className="mb-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Bar */}
          <div 
            className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
            onClick={() => setIsEquipmentSummaryExpanded(!isEquipmentSummaryExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-yellow-50 text-amber-600 rounded-2xl border border-amber-250 shrink-0">
                <Wrench className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800 flex items-center flex-wrap gap-2 leading-none">
                  <span>📋 របាយការណ៍សង្ខេបសម្ភារៈខូចខាត និងត្រូវការជួសជុល (Damaged & Need Repair Equipment Summary)</span>
                  {summaryDamagedLogs.length > 0 && (
                    <span className="bg-amber-500 text-white font-mono text-[10.5px] font-black px-2 py-0.5 rounded-full leading-none">
                      {summaryDamagedLogs.length} របាយការណ៍
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-500 font-semibold mt-1 leading-normal">
                  បញ្ជីវាយតម្លៃរួមនៃសម្ភារៈដែលខូច ឬត្រូវការថែទាំគ្រប់បន្ទប់សិក្សា តម្រៀបតាមរយៈពេលរង់ចាំ (All classroom items reported as faulty, sorted by report date)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto" onClick={(e) => e.stopPropagation()}>
              {/* Toggle resolved vs unresolved */}
              <div className="flex bg-slate-150 p-1 rounded-xl text-[10.5px] font-black border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setSummaryStatusFilter('unresolved')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    summaryStatusFilter === 'unresolved'
                      ? 'bg-white shadow-xs text-[#073B3A] font-black'
                      : 'text-slate-450 hover:text-slate-750'
                  }`}
                >
                  មិនទាន់ជួសជុល
                </button>
                <button
                  type="button"
                  onClick={() => setSummaryStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    summaryStatusFilter === 'all'
                      ? 'bg-white shadow-xs text-[#073B3A] font-black'
                      : 'text-slate-450 hover:text-slate-750'
                  }`}
                >
                  ទាំងអស់
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsEquipmentSummaryExpanded(!isEquipmentSummaryExpanded)}
                className="text-[10.5px] font-black text-slate-650 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0"
              >
                {isEquipmentSummaryExpanded ? 'លាក់ (Hide)' : 'បង្ហាញ (Show)'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isEquipmentSummaryExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                {summaryDamagedLogs.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-xs font-semibold bg-white/50">
                    <CheckCircle className="w-9 h-9 text-emerald-500 mx-auto mb-3 animate-bounce" />
                    <span className="text-slate-800 font-extrabold block text-sm">អបអរសាទរ! គ្មានរបាយការណ៍ខូចខាតឡើយ</span>
                    <p className="text-[10.5px] text-slate-450 font-semibold mt-1">
                      {summaryStatusFilter === 'unresolved' 
                        ? 'រាល់ការខូចខាត ឬការជួសជុលឧបករណ៍ទាំងអស់ ត្រូវបានដោះស្រាយរួចរាល់ជាស្ថាពរ (No outstanding unresolved issues).'
                        : 'មិនទាន់មានកំណត់ត្រាស្ថានភាព ឬការជួសជុលណាមួយនៅក្នុងប្រព័ន្ធនៅឡើយទេ។'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {summaryDamagedLogs.map(({ room, log, days }) => {
                        const itemType = equipmentTypes.find(t => t.key === log.equipmentKey);
                        const keyLabel = itemType ? itemType.label.split('(')[0].trim() : log.equipmentKey;
                        const itemColor = itemType ? itemType.color : 'text-slate-600 bg-slate-50';

                        // Icon Resolver
                        const IconComponent = (() => {
                          if (!itemType) return Info;
                          switch (itemType.iconName) {
                            case 'School': return School;
                            case 'Laptop': return Laptop;
                            case 'Tv': return Tv;
                            case 'Wind': return Wind;
                            case 'Volume2': return Volume2;
                            case 'HardDrive': return HardDrive;
                            case 'Settings': return Settings;
                            default: return Info;
                          }
                        })();

                        // Condition details
                        const condLabel = log.condition === 'NeedRepair' ? 'ត្រូវការជួសជុល' : 'ខូចខាត';
                        const condBadgeClass = log.condition === 'NeedRepair'
                          ? 'text-amber-700 bg-amber-50/80 border-amber-200'
                          : 'text-rose-700 bg-rose-50/80 border-rose-250';

                        // Status styling
                        const statusLabel = (() => {
                          switch (log.repairStatus) {
                            case 'Pending': return { text: 'សំណើមិនទាន់ជួសជុល', color: 'text-red-700 bg-red-50 border-red-200' };
                            case 'Repairing': return { text: 'កំពុងជួសជុល', color: 'text-amber-800 bg-amber-50 border-amber-250' };
                            case 'Repaired': return { text: 'បានជួសជុលរួចរាល់', color: 'text-emerald-800 bg-emerald-50 border-emerald-250' };
                            case 'Replaced': return { text: 'បានផ្លាស់ប្តូរថ្មី', color: 'text-sky-800 bg-sky-50 border-sky-250' };
                            default: return { text: log.repairStatus, color: 'text-slate-700 bg-slate-50 border-slate-200' };
                          }
                        })();

                        return (
                          <div 
                            key={`summary-${log.id}`}
                            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition relative flex flex-col justify-between"
                          >
                            {/* Wait days tag */}
                            <div className={`absolute right-3 top-3 text-[10px] font-black px-2.5 py-1 rounded-xl shadow-2xs flex items-center gap-1 ${
                              days > 7 
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              <Clock className="w-3 h-3 text-current shrink-0" />
                              <span>{days === 0 ? 'ថ្ងៃនេះ' : `${days} ថ្ងៃមុន`}</span>
                            </div>

                            <div className="space-y-3">
                              {/* Classroom & Item Name header */}
                              <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg shrink-0 ${itemColor}`}>
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <div className="max-w-[70%]">
                                  <span className="text-xs font-black text-slate-800 block truncate" title={itemType?.label || keyLabel}>{keyLabel}</span>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-[9.5px] font-black text-slate-450">បន្ទប់</span>
                                    <span className="text-[10px] bg-slate-100 text-slate-700 font-extrabold px-1.5 py-0.5 rounded-md leading-none border border-slate-200">
                                      {room.roomNumber}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Issue text description */}
                              <div className="flex gap-2">
                                <p className="text-[11.5px] text-slate-600 font-semibold leading-relaxed bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/70 line-clamp-2 grow" title={log.reportedIssue}>
                                  {log.reportedIssue || 'គ្មានអាការៈលម្អិត'}
                                </p>
                                {log.photoUrl && (
                                  <div 
                                    className="relative shrink-0 w-10 h-10 border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 active:scale-95 transition" 
                                    onClick={() => setPreviewPhotoUrl(log.photoUrl || null)}
                                  >
                                    <img src={log.photoUrl} alt="Status thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>

                              {/* Badges Grid line */}
                              <div className="flex flex-wrap items-center gap-1.5 text-[9.5px] font-black">
                                <span className={`border px-2 py-0.5 rounded-lg ${condBadgeClass}`}>
                                  {condLabel} ({log.quantity} គ្រឿង)
                                </span>
                                <span className={`border px-2 py-0.5 rounded-lg ${statusLabel.color}`}>
                                  {statusLabel.text}
                                </span>
                              </div>
                            </div>

                            {/* Footer links to classroom inspection controls */}
                            <div className="mt-4 pt-3 border-t border-slate-105 flex items-center justify-between text-[10.5px]">
                              <span className="text-[9px] text-slate-400 font-mono font-bold">លេខកូដ៖ {log.id}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRoom(room);
                                  setDetailTab('maintenance');
                                  setTimeout(() => {
                                    const el = document.getElementById('room-detail-panel');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                  }, 50);
                                }}
                                className="text-[#073B3A] hover:bg-[#073B3A]/5 px-2.5 py-1.5 rounded-lg transition font-black flex items-center gap-1 cursor-pointer border border-[#073B3A]/20"
                              >
                                <span>ដោះស្រាយ (Manage)</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Two-Column split screen view layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Room list directory selection */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-600 block">បញ្ជីបន្ទប់ទិន្នន័យ (Classrooms List)</span>
              <span className="text-[10px] font-mono text-slate-450 font-bold bg-slate-200/60 px-2 py-0.5 rounded-md">{filteredRooms.length} បន្ទប់</span>
            </div>

            {/* Quick Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ស្វែងរកតាមលេខបន្ទប់ ឬជាន់..."
                className="w-full bg-white border border-slate-250 border-slate-200 rounded-xl py-1.5 pl-8.5 pr-3 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
              />
            </div>

            {/* Floor filter select option */}
            <div className="flex bg-slate-200/50 p-0.5 rounded-lg border border-slate-200 text-[10.5px] font-black">
              <button
                type="button"
                onClick={() => setFilterFloor('All')}
                className={`flex-1 py-1 text-center rounded-md cursor-pointer transition ${
                  filterFloor === 'All' ? 'bg-white shadow-xs text-emerald-800 font-extrabold' : 'text-slate-500'
                }`}
              >
                ទាំងអស់
              </button>
              {CONST_FLOORS.map(fl => (
                <button
                  key={fl.value}
                  type="button"
                  onClick={() => setFilterFloor(fl.value)}
                  className={`flex-1 py-1 text-center rounded-md cursor-pointer transition ${
                    filterFloor === fl.value ? 'bg-white shadow-xs text-emerald-800 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  {fl.kh.split(' ')[1] || fl.kh}
                </button>
              ))}
            </div>
          </div>

          {/* Directory layout lists */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold">
                រកមិនឃើញបន្ទប់សិក្សាឡើយ
              </div>
            ) : (
              filteredRooms.map(room => {
                const isSelected = selectedRoom?.id === room.id;
                const totalItemAmount = (Object.values(room.equipment) as number[]).reduce((a, b) => a + b, 0);

                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`rounded-xl p-3 border text-left cursor-pointer transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'bg-[#073B3A]/5 border-emerald-800 shadow-xs' 
                        : 'bg-white/80 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900">{room.roomNumber}</span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-black px-1.5 py-0.5 rounded-md">
                          {CONST_FLOORS.find(f => f.value === room.floor)?.kh || room.floor}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-450 font-bold mt-0.5 line-clamp-1">{room.location}</p>
                      {room.remarks && <p className="text-[9.5px] text-slate-500 italic mt-0.5">{room.remarks}</p>}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold block">សម្ភារៈសរុប</span>
                      <span className="text-xs font-bold text-slate-700 font-mono block mt-0.5">
                        {totalItemAmount} គ្រឿង
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Specific Details and direct quantity adjustments */}
        <div id="room-detail-panel" className="lg:col-span-7">
          {selectedRoom ? (
            <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 space-y-5">
              
              {/* Header inside Detail View */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">{selectedRoom.roomNumber}</h3>
                    <span className="text-[10px] font-mono text-slate-450 bg-slate-200/85 px-1.5 py-0.5 rounded-md font-bold">
                      {selectedRoom.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">
                    {selectedRoom.location} • {CONST_FLOORS.find(f => f.value === selectedRoom.floor)?.kh || selectedRoom.floor}
                  </p>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => openRoomModal(selectedRoom)}
                    className="p-2 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-xl cursor-pointer border border-slate-200 flex items-center gap-1 text-[10px] font-black"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">កែសម្រួលព័ត៌មាន (Edit Room)</span>
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(selectedRoom.id, selectedRoom.roomNumber)}
                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-650 rounded-xl border border-rose-100 cursor-pointer flex items-center gap-1 text-[10px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tab Selector: Quantities vs Maintenance logs */}
              <div className="flex border-b border-slate-200 text-xs font-black gap-2">
                <button
                  type="button"
                  onClick={() => setDetailTab('items')}
                  className={`px-4 py-2.5 border-b-2 transition cursor-pointer ${
                    detailTab === 'items'
                      ? 'border-[#073B3A] text-[#073B3A] font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  📦 បរិមាណសម្ភារៈ (Inventory)
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('maintenance')}
                  className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                    detailTab === 'maintenance'
                      ? 'border-[#073B3A] text-[#073B3A] font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  🛠️ ត្រួតពិនិត្យស្ថានភាព & ជួសជុល (Inspections & Repairs)
                  {(selectedRoom.maintenanceLogs || []).filter(l => l.repairStatus !== 'Repaired' && l.repairStatus !== 'Replaced').length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
                  )}
                </button>
              </div>

              {detailTab === 'items' ? (
                <>
                  {/* Classroom equipment interactive counter elements list */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      <span>បញ្ជីឧបករណ៍សម្ភារៈនៅក្នុងបន្ទប់រៀននេះ</span>
                      <button
                        type="button"
                        onClick={() => setIsCustomItemModalOpen(true)}
                        className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-250 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>បន្ថែមសម្ភារៈថ្មី (Add new)</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {equipmentTypes.map(item => {
                        const typedKey = item.key;
                        const val = selectedRoom.equipment[typedKey] || 0;
                        const IconComponent = (() => {
                          switch (item.iconName) {
                            case 'School': return School;
                            case 'Laptop': return Laptop;
                            case 'Tv': return Tv;
                            case 'Wind': return Wind;
                            case 'Volume2': return Volume2;
                            case 'HardDrive': return HardDrive;
                            case 'Settings': return Settings;
                            default: return Info;
                          }
                        })();

                        return (
                          <div 
                            key={item.key} 
                            className="py-2.5 px-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs"
                          >
                            <div className="flex items-center gap-2 max-w-[200px]">
                              <div className={`p-1.5 rounded-lg ${item.color} shrink-0`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-extrabold text-slate-800 block leading-tight">{item.label}</span>
                              </div>
                            </div>

                            {/* Interactive Plus Minus controls */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => adjustEquipmentQty(selectedRoom.id, typedKey, -1)}
                                className="text-slate-400 hover:text-slate-800 transition active:scale-90"
                                title="ដកចេញ ១"
                              >
                                <MinusCircle className="w-5 h-5" />
                              </button>

                              <input
                                type="text"
                                value={val}
                                onChange={(e) => setEquipmentQtyDirect(selectedRoom.id, typedKey, e.target.value)}
                                className="w-10 text-center bg-slate-50 border border-slate-200 rounded-md font-mono text-xs font-black text-slate-800 py-1"
                              />

                              <button
                                type="button"
                                onClick={() => adjustEquipmentQty(selectedRoom.id, typedKey, 1)}
                                className="text-emerald-500 hover:text-emerald-700 transition active:scale-90"
                                title="បន្ថែម ១"
                              >
                                <PlusCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Remarks detail box */}
                  {selectedRoom.remarks && (
                    <div className="bg-amber-50/40 border border-amber-200/50 p-3 rounded-xl flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-black text-amber-700 block tracking-wide">សម្គាល់ពីគ្រូបង្រៀន ឬអ្នកគ្រប់គ្រង</span>
                        <p className="text-xs text-amber-900 font-semibold mt-0.5 leading-snug">{selectedRoom.remarks}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  
                  {/* Condition Summary Cards stats */}
                  {(() => {
                    const logs = selectedRoom.maintenanceLogs || [];
                    const breakdown = { Good: 0, Damaged: 0, Missing: 0, NeedRepair: 0 };
                    logs.forEach(l => {
                      if (breakdown[l.condition] !== undefined) {
                        breakdown[l.condition] += l.quantity;
                      }
                    });

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-center shadow-xs">
                        <div className="p-2 border border-emerald-100 rounded-xl bg-emerald-50/20">
                          <span className="text-[9px] font-black text-emerald-800 block">ល្អ (Good)</span>
                          <span className="text-base font-black text-emerald-700 font-mono block mt-1">{breakdown.Good}</span>
                        </div>
                        <div className="p-2 border border-rose-100 rounded-xl bg-rose-50/25">
                          <span className="text-[9px] font-black text-rose-800 block">ខូច (Damaged)</span>
                          <span className="text-base font-black text-rose-700 font-mono block mt-1">{breakdown.Damaged}</span>
                        </div>
                        <div className="p-2 border border-amber-100 rounded-xl bg-amber-50/30">
                          <span className="text-[9px] font-black text-amber-805 text-amber-800 block">ត្រូវការជួសជុល (Need Repair)</span>
                          <span className="text-base font-black text-amber-700 font-mono block mt-1">{breakdown.NeedRepair}</span>
                        </div>
                        <div className="p-2 border border-stone-200/50 rounded-xl bg-stone-50/35">
                          <span className="text-[9px] font-black text-stone-700 block font-sans">បាត់បង់ (Missing)</span>
                          <span className="text-base font-black text-stone-600 font-mono block mt-1">{breakdown.Missing}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Header of maintenance section */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      កំណត់ត្រាស្ថានភាព និងការតាមដានការជួសជុល
                    </span>
                    <button
                      type="button"
                      onClick={() => openMaintenanceLogModal(null)}
                      className="bg-[#073B3A] hover:bg-[#0d5c5a] text-amber-300 font-black text-[10.5px] px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer shadow-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>កត់ត្រាស្ថានភាព/ជួសជុល (New Report)</span>
                    </button>
                  </div>

                  {/* List of reports */}
                  <div className="space-y-3">
                    {!(selectedRoom.maintenanceLogs && selectedRoom.maintenanceLogs.length > 0) ? (
                      <div className="text-center py-10 border border-dashed border-slate-205 rounded-2xl text-slate-400 bg-white shadow-xs p-4">
                        <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-pulse" />
                        <span className="text-xs font-black text-slate-500 block">មិនទាន់មានរបាយការណ៍បញ្ហាជួសជុលទេ</span>
                        <p className="text-[10px] text-slate-405 font-medium mt-1">រាល់កិច្ចការតាមដានការខូចខាត ឬជួសជុលសម្ភារៈសិក្សា នឹងបង្ហាញនៅត្រង់នេះ</p>
                      </div>
                    ) : (
                      selectedRoom.maintenanceLogs.map(log => {
                        const itemType = equipmentTypes.find(e => e.key === log.equipmentKey);
                        const labelShort = itemType ? itemType.label.split('(')[0].trim() : log.equipmentKey;

                        // Condition badge calculations
                        const condBadge = (() => {
                          switch (log.condition) {
                            case 'Good':
                              return { text: 'ល្អ (Good)', style: 'bg-emerald-50 text-emerald-800 border-emerald-250' };
                            case 'Damaged':
                              return { text: 'ខូច (Damaged)', style: 'bg-rose-50 text-rose-800 border-rose-200' };
                            case 'Missing':
                              return { text: 'បាត់បង់ (Missing)', style: 'bg-stone-55 text-stone-800 border-stone-300 bg-slate-100' };
                            case 'NeedRepair':
                              return { text: 'ត្រូវការជួសជុល (Need Repair)', style: 'bg-amber-50 text-amber-800 border-amber-250' };
                            default:
                              return { text: log.condition, style: 'bg-slate-50 text-slate-700 border-slate-200' };
                          }
                        })();

                        // Status badge rendering
                        const statusBadge = (() => {
                          switch (log.repairStatus) {
                            case 'Pending':
                              return { 
                                text: 'មិនទាន់ជួសជុល (Pending)', 
                                style: 'bg-red-50 text-red-750 border-red-200',
                                icon: Clock,
                                iconColor: 'text-red-500'
                              };
                            case 'Repairing':
                              return { 
                                text: 'កំពុងជួសជុល (Repairing)', 
                                style: 'bg-amber-50 text-amber-850 border-amber-300',
                                icon: Wrench,
                                iconColor: 'text-amber-600'
                              };
                            case 'Repaired':
                              return { 
                                text: 'ជួសជុលរួច (Repaired)', 
                                style: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                                icon: CheckCircle,
                                iconColor: 'text-emerald-700'
                              };
                            case 'Replaced':
                              return { 
                                text: 'ផ្លាស់ប្តូររួច (Replaced)', 
                                style: 'bg-sky-50 text-sky-850 border-sky-305',
                                icon: CheckCircle,
                                iconColor: 'text-sky-605'
                              };
                            default:
                              return { 
                                text: log.repairStatus, 
                                style: 'bg-slate-55 text-slate-805',
                                icon: Info,
                                iconColor: 'text-slate-500'
                              };
                          }
                        })();

                        const StatusIcon = statusBadge.icon;

                        return (
                          <div 
                            key={log.id} 
                            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs relative overflow-hidden flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                          >
                            <div className="space-y-2">
                              {/* Content header: Equipment Name and Impacted Qty */}
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-900">{labelShort}</span>
                                <span className="text-[10px] bg-[#073B3A]/5 text-slate-700 font-extrabold border border-emerald-950/10 px-2 py-0.5 rounded-lg">
                                  ចំនួន៖ {log.quantity} គ្រឿង
                                </span>
                                <span className={`text-[9.5px] font-black border px-1.5 py-0.5 rounded-md ${condBadge.style}`}>
                                  {condBadge.text}
                                </span>
                              </div>

                              {/* Problem description */}
                              <p className="text-xs text-slate-755 font-semibold leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider mb-0.5">បញ្ហាដែលកើតមាន / Problem Description</span>
                                {log.reportedIssue || 'គ្មានការពណ៌នា'}
                              </p>

                              {/* Dates Grid block */}
                              <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  <span>រាយការណ៍៖ <strong className="text-slate-800 font-bold">{log.reportDate || 'គ្មាន'}</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                  <Wrench className="w-3.5 h-3.5 text-slate-400" />
                                  <span>ជួសជុល/ប្តូរ៖ <strong className="text-slate-800 font-bold">{log.repairDate || 'មិនទាន់កំណត់'}</strong></span>
                                </div>
                              </div>

                              {/* Remarks */}
                              {log.remarks && (
                                <p className="text-[11px] text-slate-500 font-medium italic mt-1 pl-1">
                                  * កំណត់សម្គាល់៖ {log.remarks}
                                </p>
                              )}

                              {/* Photo thumbnail */}
                              {log.photoUrl && (
                                <div className="mt-2.5 flex items-center gap-2 bg-slate-50 border border-slate-100 p-2 rounded-2xl max-w-[280px]">
                                  <img 
                                    src={log.photoUrl} 
                                    alt="Equipment status" 
                                    referrerPolicy="no-referrer"
                                    className="w-12 h-12 object-cover rounded-xl cursor-pointer hover:opacity-95 active:scale-95 transition"
                                    onClick={() => setPreviewPhotoUrl(log.photoUrl || null)}
                                  />
                                  <div className="text-[9.5px] text-slate-500 font-sans leading-tight">
                                    <span className="font-extrabold block text-slate-700">រូបភាពភ្ជាប់ (Image attached)</span>
                                    <span>ចុចពង្រីក (Click to zoom)</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Status tracker sidebar */}
                            <div className="flex sm:flex-col items-end sm:justify-start justify-between shrink-0 gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                              <div className={`flex items-center gap-1 text-[10px] font-black border px-2 py-1 rounded-xl shadow-xs shrink-0 ${statusBadge.style}`}>
                                <StatusIcon className={`w-3.5 h-3.5 shrink-0 ${statusBadge.iconColor}`} />
                                <span className="leading-none">{statusBadge.text}</span>
                              </div>

                              {/* Actions available */}
                              <div className="flex gap-1.5 self-end">
                                <button
                                  type="button"
                                  onClick={() => openMaintenanceLogModal(log)}
                                  className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg border border-slate-200 transition cursor-pointer"
                                  title="កែសម្រួលស្ថានភាព"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMaintenanceLog(log.id)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-slate-400 hover:text-rose-700 rounded-lg border border-rose-100 transition cursor-pointer"
                                  title="លុបកំណត់ត្រា"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl text-slate-450 font-bold">
              សូមបង្កើត ឬរៀបចំជ្រើសរើសបន្ទប់ថ្នាក់រៀនលើផ្នែកខាងឆ្វេង ដើម្បីចាប់ផ្ដើមគ្រប់គ្រងសម្ភារៈ។
            </div>
          )}
        </div>

      </div>

      {/* Classroom Creator or Modifier Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-40">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 font-sans"
            >
              <div className="bg-[#073B3A] text-white p-4.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <School className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span className="text-sm font-black text-rose-50 font-sans">
                    {editingRoom ? 'កែសម្រួលទម្រង់និងសម្ភារៈថ្នាក់រៀន' : 'បង្កើតបន្ទប់សិក្សាថ្មី & កំណត់សម្ភារៈជម្រើសដើម'}
                  </span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveRoom} className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
                
                {/* Visual Camera Name & Floor */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-650 block">លេខបន្ទប់សិក្សា (Room Code) *</label>
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="ឧទហរណ៍៖ Room 502"
                      className="w-full bg-slate-50 border border-slate-205 border-slate-200 p-2.5 rounded-xl text-xs font-black text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-650 block">ជាន់អាគារ (Floor) *</label>
                    <select
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-black text-slate-700 outline-none"
                    >
                      {CONST_FLOORS.map(fl => (
                        <option key={fl.value} value={fl.value}>{fl.kh}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-650 block">ទីតាំងអាគារជាក់លាក់ (Building Section) *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="ឧទាហរណ៍៖ អាគារ B ស្លាបខាងឆ្វេង (Building B - Left Wing)"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-black text-slate-700 outline-none"
                    required
                  />
                </div>

                {/* Remarks */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-650 block">កំណត់សម្គាល់បន្ថែម (Remarks)</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="ឧទាហរណ៍៖ ថ្នាក់សិក្សាភាសាបរទេស / បន្ទប់សម្រាកគ្រូ"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                  />
                </div>

                {/* Pre-fill startup quantities */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <span className="text-[11.5px] font-black text-emerald-800 block">កត់ត្រាបរិមាណសម្ភារៈចាប់ផ្តើម (Inventory Quantities)</span>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {equipmentTypes.map(it => {
                      const typedKey = it.key;
                      const val = initialQty[typedKey] || 0;

                      return (
                        <div key={it.key} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="font-semibold text-slate-700 shrink-0 truncate max-w-[110px]" title={it.label}>
                            {it.label}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={val}
                            onChange={(e) => {
                              const num = parseInt(e.target.value, 10);
                              setInitialQty({
                                ...initialQty,
                                [typedKey]: isNaN(num) ? 0 : Math.max(0, num)
                              });
                            }}
                            className="w-12 text-center bg-white border border-slate-250 rounded-md py-1 font-mono text-xs font-bold"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions Footer modal */}
                <div className="pt-2.5 flex items-center justify-end gap-2 text-xs font-black border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-xl cursor-pointer transition"
                  >
                    បោះបង់ (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow cursor-pointer transition flex items-center gap-1"
                  >
                    <Save className="w-4 h-4 text-emerald-100" />
                    <span>រក្សាទុកថ្នាក់រៀន (Save Room)</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Equipment Creator Modal */}
      <AnimatePresence>
        {isCustomItemModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 font-sans"
            >
              <div className="bg-[#073B3A] text-white p-4.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-amber-300" />
                  <span className="text-sm font-black font-sans">
                    បន្ថែមប្រភេទសម្ភារៈថ្មី (Add New Equipment Type)
                  </span>
                </div>
                <button
                  onClick={() => setIsCustomItemModalOpen(false)}
                  className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCustomItemType} className="p-5 space-y-4">
                {/* Names input */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-600 block">ឈ្មោះជាភាសាខ្មែរ (Khmer Name) *</label>
                    <input
                      type="text"
                      value={customItemLabelKh}
                      onChange={(e) => setCustomItemLabelKh(e.target.value)}
                      placeholder="ឧទាហរណ៍៖ កង្ហារពិដាន"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-black text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-650 block font-sans">ឈ្មោះជាភាសាអង់គ្លេស (English Name)</label>
                    <input
                      type="text"
                      value={customItemLabelEn}
                      onChange={(e) => setCustomItemLabelEn(e.target.value)}
                      placeholder="ឧទាហរណ៍៖ Ceiling Fan"
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Icon Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-650 block">ជ្រើសរើសរូបតំណាង (Pick Icon)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {AVAILABLE_ICONS.map(ic => {
                      const IconComponent = (() => {
                        switch (ic.name) {
                          case 'School': return School;
                          case 'Laptop': return Laptop;
                          case 'Tv': return Tv;
                          case 'Wind': return Wind;
                          case 'Volume2': return Volume2;
                          case 'HardDrive': return HardDrive;
                          case 'Settings': return Settings;
                          default: return Info;
                        }
                      })();
                      const isSelected = customItemIcon === ic.name;

                      return (
                        <button
                          key={ic.name}
                          type="button"
                          onClick={() => setCustomItemIcon(ic.name)}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 scale-102 ring-1 ring-emerald-500' 
                              : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                          }`}
                          title={ic.label}
                        >
                          <IconComponent className="w-5 h-5 shrink-0" />
                          <span className="text-[8px] font-black tracking-tighter truncate max-w-full">
                            {ic.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-650 block">ជ្រើសរើសពណ៌ (Pick Theme Color)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_COLORS.map(c => {
                      const isSelected = customItemColor === c.value;
                      const dotColor = c.value.split(' ')[0];

                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setCustomItemColor(c.value)}
                          className={`px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                            isSelected 
                              ? 'border-slate-850 bg-slate-900 text-white font-extrabold shadow-sm scale-110' 
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${dotColor.replace('text-', 'bg-')} inline-block`} />
                          <span>{c.label.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity for current room */}
                {selectedRoom && (
                  <div className="bg-emerald-50/40 border border-emerald-150 p-3 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-emerald-900 block">បរិមាណដំបូងក្នុងថ្នាក់ {selectedRoom.roomNumber}</span>
                      <p className="text-[10px] text-emerald-700 font-medium">ចំនួនសម្ភារៈនេះសម្រាប់ដាក់ក្នុងបន្ទប់បច្ចុប្បន្នភ្លាមៗ</p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={customItemInitialQty}
                      onChange={(e) => setCustomItemInitialQty(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-14 text-center bg-white border border-emerald-200 rounded-xl py-1.5 font-mono text-sm font-black text-slate-800 outline-none"
                    />
                  </div>
                )}

                {/* Form actions */}
                <div className="pt-2 flex items-center justify-end gap-2 text-xs font-black border-t border-slate-150">
                  <button
                    type="button"
                    onClick={() => setIsCustomItemModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-xl cursor-pointer transition"
                  >
                    បោះបង់ (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow cursor-pointer transition flex items-center gap-1"
                  >
                    <Check className="w-4 h-4 text-emerald-100" />
                    <span>បង្កើតសម្ភារៈ (Create)</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Maintenance & Condition Logging Form Modal */}
      <AnimatePresence>
        {isMaintenanceModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 font-sans"
            >
              <div className="bg-[#073B3A] text-white p-4.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-300" />
                  <span className="text-sm font-black font-sans">
                    {editingLog 
                      ? 'កែសម្រួលស្ថានភាព និងការជួសជុល (Edit Condition/Repair Record)' 
                      : 'កត់ត្រាស្ថានភាព ឬរាយការណ៍ជួសជុល (New Condition & Maintenance Log)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMaintenanceModalOpen(false)}
                  className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-teal-900/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMaintenanceLog} className="p-5 space-y-4 text-left">
                
                {/* Grid of Equipment Type & Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Equipment Selection */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-600 block">ជ្រើសរើសសម្ភារៈ (Select Equipment) *</label>
                    <select
                      value={logEquipmentKey}
                      onChange={(e) => setLogEquipmentKey(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-black text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      required
                    >
                      {equipmentTypes.map(item => (
                        <option key={item.key} value={item.key}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity impacted */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-600 block">ចំនួនសម្ភារៈ (Quantity Affected) *</label>
                    <input
                      type="number"
                      min="1"
                      value={logQuantity}
                      onChange={(e) => setLogQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-black text-slate-700 outline-none font-mono focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Grid of Condition Type and Repair Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Condition selector */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-600 block">ស្ថានភាពឧបករណ៍ (Equipment Condition) *</label>
                    <select
                      value={logCondition}
                      onChange={(e) => setLogCondition(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-black text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      required
                    >
                      <option value="Good">ល្អ (Good)</option>
                      <option value="Damaged">ខូច (Damaged)</option>
                      <option value="Missing">បាត់បង់ (Missing)</option>
                      <option value="NeedRepair">ត្រូវការជួសជុល (Need Repair)</option>
                    </select>
                  </div>

                  {/* Follow-up Repair Status */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-600 block">ស្ថានភាពតាមដានការជួសជុល (Repair Status) *</label>
                    <select
                      value={logRepairStatus}
                      onChange={(e) => setLogRepairStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-black text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      required
                    >
                      <option value="Pending">មិនទាន់ជួសជុល (Pending)</option>
                      <option value="Repairing">កំពុងជួសជុល (Repairing)</option>
                      <option value="Repaired">ជួសជុលរួច (Repaired)</option>
                      <option value="Replaced">ផ្លាស់ប្តូររួច (Replaced)</option>
                    </select>
                  </div>
                </div>

                {/* Issue Description detail */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-600 block">កត់ត្រាបញ្ហាដែលកើតមាន (Record issue details)</label>
                  <textarea
                    rows={2}
                    value={logReportedIssue}
                    onChange={(e) => setLogReportedIssue(e.target.value)}
                    placeholder="បញ្ជាក់អំពីអាការៈខូចខាត ឬព័ត៌មានលម្អិត..."
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Dates selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Reported Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-600 block">កាលបរិច្ឆេទរាយការណ៍បញ្ហា (Report Date) *</label>
                    <input
                      type="date"
                      value={logReportDate}
                      onChange={(e) => setLogReportDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 outline-none font-mono focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      required
                    />
                  </div>

                  {/* Repair Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-600 block">កាលបរិច្ឆេទជួសជុល ឬផ្លាស់ប្តូរ (Action Date)</label>
                    <input
                      type="date"
                      value={logRepairDate}
                      onChange={(e) => setLogRepairDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 outline-none font-mono focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* General Remarks */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-600 block">កំណត់សម្គាល់បន្ថែម (Remarks)</label>
                  <input
                    type="text"
                    value={logRemarks}
                    onChange={(e) => setLogRemarks(e.target.value)}
                    placeholder="សម្គាល់ (ឧទាហរណ៍៖ ទិញពីហាងទំនើប, ប្តូរគ្រឿងបន្លាស់...)"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Photo of Equipment (Camera & Upload Options) */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <label className="text-[11px] font-black text-[#073B3A] block flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1">📷 រូបភាពសម្ភារៈឧបករណ៍ (Attach Damage/Condition Photo)</span>
                    <span className="text-[10px] text-slate-400 font-bold font-sans">កាមេរ៉ា ឬឯកសារ (Camera / File)</span>
                  </label>

                  {logPhotoUrl ? (
                    // Preview of the current attached image
                    <div className="relative border border-slate-200 rounded-3xl p-3 bg-slate-50 shadow-2xs flex flex-col items-center justify-center gap-2">
                      <img 
                        src={logPhotoUrl} 
                        alt="Equipment damage preview" 
                        referrerPolicy="no-referrer"
                        className="max-h-48 object-contain rounded-2xl border border-slate-200/80 bg-white"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewPhotoUrl(logPhotoUrl)}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] px-3 py-1.5 rounded-xl transition font-black cursor-pointer shadow-xs"
                        >
                          ពង្រីក (Preview)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLogPhotoUrl('');
                            stopCamera();
                          }}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] px-3 py-1.5 rounded-xl transition font-black cursor-pointer shadow-xs"
                        >
                          លុបរូបភាព (Delete)
                        </button>
                      </div>
                    </div>
                  ) : isCameraActive ? (
                    // Live camera recording video stream
                    <div className="border border-teal-200 rounded-3xl p-4 bg-teal-50/20 shadow-xs space-y-3">
                      <div className="aspect-video relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-950 flex items-center justify-center">
                        <video 
                          ref={videoRef} 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-lg flex items-center gap-1 shadow animate-pulse">
                          <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />
                          <span>សកម្ម (Active Cam)</span>
                        </div>
                      </div>

                      {cameraError && (
                        <p className="text-[10px] text-rose-605 font-bold bg-rose-50 border border-rose-200 p-2 rounded-xl">
                          {cameraError}
                        </p>
                      )}

                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={captureCameraPhoto}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black px-4 py-2 rounded-xl cursor-pointer shadow flex items-center gap-1 transition"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>ថតយករូបភាព (Take Photo)</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-black px-4 py-2 rounded-xl cursor-pointer shadow transition"
                        >
                          បិទកាមេរ៉ា (Close)
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Selection choices: Open Camera or Drag and drop file
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Open Camera button option */}
                      <button
                        type="button"
                        onClick={startCameraFocus}
                        className="bg-amber-50 hover:bg-amber-100/80 border border-amber-250 text-[#073B3A] font-black rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition shadow-2xs group"
                      >
                        <div className="p-3 bg-white text-amber-500 rounded-full shadow-2xs group-hover:scale-105 transition duration-200">
                          <Camera className="w-5 h-5 shrink-0" />
                        </div>
                        <div>
                          <span className="text-[11.5px] font-black font-sans block">បើកកាមេរ៉ាថតផ្ទាល់ (Take Web-Cam Photo)</span>
                          <span className="text-[9.5px] text-slate-500 font-semibold block mt-0.5">ប្រើប្រាស់កាមេរ៉ាដើម្បីថតភ្ជាប់ភ្លាមៗ</span>
                        </div>
                      </button>

                      {/* Dropzone file upload option */}
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition duration-200 flex flex-col items-center justify-center gap-1.5 ${
                          isDragActive
                            ? 'border-[#073B3A] bg-[#073B3A]/5'
                            : 'border-slate-250 hover:border-slate-350 bg-slate-50'
                        }`}
                      >
                        <input
                          type="file"
                          id="maint-photo-upload"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                        <label htmlFor="maint-photo-upload" className="cursor-pointer space-y-1 block w-full">
                          <span className="text-[11.5px] font-black text-slate-750 block">ជ្រើសរើសរូបថត ឬអូសចូល (Choose / Drag Image)</span>
                          <span className="text-[9.5px] text-slate-450 font-bold block">PNG, JPG, JPEG (អតិបរមា 5MB)</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit actions */}
                <div className="pt-3 flex items-center justify-end gap-2 text-xs font-black border-t border-slate-150">
                  <button
                    type="button"
                    onClick={() => setIsMaintenanceModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-750 rounded-xl cursor-pointer transition"
                  >
                    បោះបង់ (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2.5 bg-[#073B3A] hover:bg-teal-900 text-amber-300 rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-emerald-100" />
                    <span>{editingLog ? 'រក្សាទុកការកែប្រែ (Update Log)' : 'រក្សាទុកទិន្នន័យ (Save Log)'}</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Photo Full-Resolution Zoom Modal Overlay */}
      <AnimatePresence>
        {previewPhotoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/90 z-[100] flex items-center justify-center p-4 backdrop-blur-xs"
            onClick={() => setPreviewPhotoUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setPreviewPhotoUrl(null)}
                className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 text-white p-2 rounded-full cursor-pointer transition shadow-xl"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="bg-slate-950 border border-white/10 p-2.5 rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center max-h-[75vh]">
                <img 
                  src={previewPhotoUrl} 
                  alt="Full resolution view" 
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[70vh] object-contain rounded-2xl"
                />
              </div>

              <div className="mt-3.5 bg-black/60 backdrop-blur-sm border border-white/5 py-2 px-5 rounded-2xl text-center text-white text-xs max-w-md shadow-lg">
                <p className="font-extrabold flex items-center gap-1.5 justify-center">
                  <span>📸 រូបភាពស្ថានភាពឧបករណ៍ជាក់ស្តែង</span>
                </p>
                <p className="text-[10px] text-slate-300 font-medium mt-0.5">
                  ចុចកន្លែងណាក៏បានដើម្បីបិទវិញ (Click anywhere outside to close window)
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
