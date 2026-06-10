/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  School, Layers, Laptop, Tv, Wind, Volume2, HardDrive, 
  Trash2, Plus, Edit3, Save, X, Search, ChevronRight, Check,
  PlusCircle, MinusCircle, FileSpreadsheet, Settings, Info
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
}

// Classroom representation
export interface ClassroomRecord {
  id: string;
  roomNumber: string;
  location: string; // e.g. "Building A", "Building B"
  floor: string; // "Ground Floor", "1st Floor", etc.
  equipment: EquipmentQuantities;
  remarks: string;
}

const CONST_FLOORS = [
  { value: 'Ground Floor', kh: 'ជាន់ផ្ទាល់ដី' },
  { value: '1st Floor', kh: 'ជាន់ទី ១' },
  { value: '2nd Floor', kh: 'ជាន់ទី ២' },
  { value: '3rd Floor', kh: 'ជាន់ទី ៣' },
  { value: '4th Floor', kh: 'ជាន់ទី ៤' },
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
    }
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
    }
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
      projector: 0, // Faulty/Returned to stock
      whiteboard: 2,
      ac: 2,
      speaker: 2,
      locker: 15,
      other: 0
    }
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
    }
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
      other: 32 // Computers & Hub assets
    }
  }
];

export default function ClassroomEquipmentManager() {
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

  // Notification feedback Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

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
    const totals = {
      studentDesk: 0,
      studentChair: 0,
      teacherDesk: 0,
      teacherChair: 0,
      projector: 0,
      whiteboard: 0,
      ac: 0,
      speaker: 0,
      locker: 0,
      other: 0
    };

    rooms.forEach(room => {
      totals.studentDesk += room.equipment.studentDesk || 0;
      totals.studentChair += room.equipment.studentChair || 0;
      totals.teacherDesk += room.equipment.teacherDesk || 0;
      totals.teacherChair += room.equipment.teacherChair || 0;
      totals.projector += room.equipment.projector || 0;
      totals.whiteboard += room.equipment.whiteboard || 0;
      totals.ac += room.equipment.ac || 0;
      totals.speaker += room.equipment.speaker || 0;
      totals.locker += room.equipment.locker || 0;
      totals.other += room.equipment.other || 0;
    });

    return totals;
  };

  const grandTotals = getGrandTotals();

  // Handle manual unit plus/minus adjustments
  const adjustEquipmentQty = (roomId: string, key: keyof EquipmentQuantities, amount: number) => {
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
  const setEquipmentQtyDirect = (roomId: string, key: keyof EquipmentQuantities, inputVal: string) => {
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

  // Open Room Modal creator / editor
  const openRoomModal = (room: ClassroomRecord | null = null) => {
    if (room) {
      setEditingRoom(room);
      setRoomNumber(room.roomNumber);
      setLocation(room.location);
      setFloor(room.floor);
      setRemarks(room.remarks || '');
      setInitialQty({ ...room.equipment });
    } else {
      setEditingRoom(null);
      setRoomNumber(`Room ${rooms.length + 101}`);
      setLocation('');
      setFloor('Ground Floor');
      setRemarks('');
      setInitialQty({
        studentDesk: 24,
        studentChair: 24,
        teacherDesk: 1,
        teacherChair: 1,
        projector: 1,
        whiteboard: 1,
        ac: 2,
        speaker: 2,
        locker: 0,
        other: 0
      });
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

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3.5 text-center">
          {[
            { key: 'studentDesk', label: 'តុសិស្ស', count: grandTotals.studentDesk, style: 'bg-emerald-950/40 border-emerald-800/30' },
            { key: 'studentChair', label: 'កៅអីសិស្ស', count: grandTotals.studentChair, style: 'bg-emerald-950/40 border-emerald-800/30' },
            { key: 'teacherDesk', label: 'តុគ្រូ', count: grandTotals.teacherDesk, style: 'bg-teal-950/30 border-teal-850/20' },
            { key: 'teacherChair', label: 'កៅអីគ្រូ', count: grandTotals.teacherChair, style: 'bg-teal-950/30 border-teal-850/20' },
            { key: 'projector', label: 'Projector', count: grandTotals.projector, style: 'bg-slate-900/50 border-slate-800/30' },
            { key: 'whiteboard', label: 'ក្តារខៀន', count: grandTotals.whiteboard, style: 'bg-slate-900/50 border-slate-800/30' },
            { key: 'ac', label: 'ម៉ាស៊ីនត្រជាក់', count: grandTotals.ac, style: 'bg-sky-950/30 border-sky-850/20' },
            { key: 'speaker', label: 'Speaker', count: grandTotals.speaker, style: 'bg-indigo-950/30 border-indigo-850/20' },
            { key: 'locker', label: 'Locker', count: grandTotals.locker, style: 'bg-amber-950/20 border-amber-850/15' },
            { key: 'other', label: 'ផ្សេងៗ', count: grandTotals.other, style: 'bg-slate-950/40 border-slate-850/20' }
          ].map(it => (
            <div key={it.key} className={`border rounded-xl p-2 flex flex-col justify-between ${it.style}`}>
              <span className="text-[10px] text-slate-300 font-bold truncate">{it.label}</span>
              <span className="text-sm font-black font-mono text-amber-300 block mt-1">{it.count}</span>
            </div>
          ))}
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
        <div className="lg:col-span-7">
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

              {/* Classroom equipment interactive counter elements list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <span>បញ្ជីឧបករណ៍សម្ភារៈនៅក្នុងបន្ទប់រៀននេះ</span>
                  <span>បរិមាណ (Quantity)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {[
                    { key: 'studentDesk', label: 'តុសិស្ស (Student Desk)', icon: School, color: 'text-emerald-600 bg-emerald-50' },
                    { key: 'studentChair', label: 'កៅអីសិស្ស (Student Chair)', icon: School, color: 'text-emerald-600 bg-emerald-50' },
                    { key: 'teacherDesk', label: 'តុគ្រូ (Teacher Desk)', icon: School, color: 'text-teal-600 bg-teal-50' },
                    { key: 'teacherChair', label: 'កៅអីគ្រូ (Teacher Chair)', icon: School, color: 'text-teal-600 bg-teal-50' },
                    { key: 'projector', label: 'ម៉ាស៊ីនចាក់ផ្សាយ (Projector)', icon: Tv, color: 'text-indigo-600 bg-indigo-50' },
                    { key: 'whiteboard', label: 'ក្តារខៀនសរសេរ (Whiteboard)', icon: Tv, color: 'text-stone-600 bg-stone-50' },
                    { key: 'ac', label: 'ម៉ាស៊ីនត្រជាក់ (Air Conditioner)', icon: Wind, color: 'text-sky-600 bg-sky-50 animate-pulse' },
                    { key: 'speaker', label: 'បាសបន្លឺសំឡេង (Speaker)', icon: Volume2, color: 'text-indigo-600 bg-indigo-50' },
                    { key: 'locker', label: 'ទូដាក់ឯកសារ (Locker)', icon: HardDrive, color: 'text-amber-600 bg-amber-50' },
                    { key: 'other', label: 'ឧបករណ៍ផ្សេងៗ (Other Equipment)', icon: Laptop, color: 'text-slate-650 bg-slate-100' }
                  ].map(item => {
                    const typedKey = item.key as keyof EquipmentQuantities;
                    const val = selectedRoom.equipment[typedKey] || 0;

                    return (
                      <div 
                        key={item.key} 
                        className="py-2.5 px-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs"
                      >
                        <div className="flex items-center gap-2 max-w-[200px]">
                          <div className={`p-1.5 rounded-lg ${item.color} shrink-0`}>
                            <item.icon className="w-4 h-4" />
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
                    {[
                      { key: 'studentDesk', label: 'តុសិស្ស (Student Desk)' },
                      { key: 'studentChair', label: 'កៅអីសិស្ស (Student Chair)' },
                      { key: 'teacherDesk', label: 'តុគ្រូ (Teacher Desk)' },
                      { key: 'teacherChair', label: 'កៅអីគ្រូ (Teacher Chair)' },
                      { key: 'projector', label: 'Projector' },
                      { key: 'whiteboard', label: 'Whiteboard' },
                      { key: 'ac', label: 'Air Conditioner (AC)' },
                      { key: 'speaker', label: 'Speaker' },
                      { key: 'locker', label: 'Locker' },
                      { key: 'other', label: 'ឧបករណ៍ផ្សេងៗ' }
                    ].map(it => {
                      const typedKey = it.key as keyof EquipmentQuantities;
                      const val = initialQty[typedKey] || 0;

                      return (
                        <div key={it.key} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="font-semibold text-slate-700 shrink-0 truncate max-w-[110px]">{it.label}</span>
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

    </div>
  );
}
