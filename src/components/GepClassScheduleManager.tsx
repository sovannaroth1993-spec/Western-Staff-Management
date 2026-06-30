import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Printer, 
  X, 
  Check, 
  Sparkles, 
  ChevronDown, 
  Layers, 
  Home, 
  User, 
  Info,
  CalendarDays,
  FileText,
  AlertCircle,
  HelpCircle,
  RefreshCcw,
  BookOpen,
  Filter,
  CheckCircle,
  Sun,
  Sunrise,
  Moon
} from 'lucide-react';
import { GepClassSchedule, UserAccount } from '../types';

interface GepClassScheduleManagerProps {
  currentUser?: UserAccount | null;
  lang?: 'kh' | 'en';
}

const DEFAULT_GEP_SCHEDULES: GepClassSchedule[] = [
  {
    id: 'gep-1',
    startsOn: '2026-05-12',
    shift: 'Morning',
    time: '7:30 AM - 10:45 AM',
    level: 'GEP Level 3A',
    roomNumber: '101',
    roomName: 'Angkor',
    floor: '1st Floor',
    remarks: 'Full time',
    teacherName: 'Mr. David Miller',
    totalStudents: 24
  },
  {
    id: 'gep-2',
    startsOn: '2026-05-12',
    shift: 'Afternoon',
    time: '1:30 PM - 4:45 PM',
    level: 'GEP Level 6B',
    roomNumber: '202',
    roomName: 'Bayon',
    floor: '2nd Floor',
    remarks: 'Part Time',
    teacherName: 'Mrs. Soun Phalla',
    totalStudents: 18
  },
  {
    id: 'gep-3',
    startsOn: '2026-05-12',
    shift: 'Evening',
    time: '5:30 PM - 7:00 PM',
    level: 'GEP Level 9C',
    roomNumber: '303',
    roomName: 'Mekong',
    floor: '3rd Floor',
    remarks: 'Part Time',
    teacherName: 'Mr. Kenji Sato',
    totalStudents: 15
  },
  {
    id: 'gep-4',
    startsOn: '2026-05-12',
    shift: 'Morning',
    time: '7:30 AM - 10:45 AM',
    level: 'GEP Level 12A',
    roomNumber: '104',
    roomName: 'Phnom Penh',
    floor: '1st Floor',
    remarks: 'Full time',
    teacherName: 'Ms. Sarah Connor',
    totalStudents: 20
  },
  {
    id: 'gep-5',
    startsOn: '2026-05-12',
    shift: 'Afternoon',
    time: '1:30 PM - 4:45 PM',
    level: 'GEP Level 2A',
    roomNumber: '102',
    roomName: 'Siem Reap',
    floor: '1st Floor',
    remarks: 'Full time',
    teacherName: 'Mr. Keo Sovann',
    totalStudents: 22
  },
  {
    id: 'gep-6',
    startsOn: '2026-05-12',
    shift: 'Evening',
    time: '5:30 PM - 7:00 PM',
    level: 'GEP Level 5B',
    roomNumber: '205',
    roomName: 'Cardamom',
    floor: '2nd Floor',
    remarks: 'Part Time',
    teacherName: 'Ms. Emily Watson',
    totalStudents: 14
  }
];

export const GepClassScheduleManager: React.FC<GepClassScheduleManagerProps> = ({ currentUser, lang = 'kh' }) => {
  const [schedules, setSchedules] = useState<GepClassSchedule[]>(() => {
    try {
      const saved = localStorage.getItem('wis_gep_class_schedules');
      return saved ? JSON.parse(saved) : DEFAULT_GEP_SCHEDULES;
    } catch {
      return DEFAULT_GEP_SCHEDULES;
    }
  });

  // UI state filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState<'All' | 'Morning' | 'Afternoon' | 'Evening'>('All');
  const [filterRemarks, setFilterRemarks] = useState<'All' | 'Full time' | 'Part Time'>('All');
  const [filterFloor, setFilterFloor] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'Default' | 'Time' | 'Floor'>('Default');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [fieldStartsOn, setFieldStartsOn] = useState('2026-05-12');
  const [fieldShift, setFieldShift] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [fieldTime, setFieldTime] = useState('7:30 AM - 10:45 AM');
  const [fieldLevel, setFieldLevel] = useState('');
  const [fieldRoomNumber, setFieldRoomNumber] = useState('');
  const [fieldRoomName, setFieldRoomName] = useState('');
  const [fieldFloor, setFieldFloor] = useState('1st Floor');
  const [fieldRemarks, setFieldRemarks] = useState<'Full time' | 'Part Time'>('Full time');
  const [fieldTeacherName, setFieldTeacherName] = useState('');
  const [fieldTotalStudents, setFieldTotalStudents] = useState<number>(20);

  // Auto time slot setter when shift changes
  useEffect(() => {
    if (fieldShift === 'Morning') {
      setFieldTime('7:30 AM - 10:45 AM');
    } else if (fieldShift === 'Afternoon') {
      setFieldTime('1:30 PM - 4:45 PM');
    } else if (fieldShift === 'Evening') {
      setFieldTime('5:30 PM - 7:00 PM');
    }
  }, [fieldShift]);

  // Save changes helper
  const saveSchedules = (newSchedules: GepClassSchedule[]) => {
    setSchedules(newSchedules);
    try {
      localStorage.setItem('wis_gep_class_schedules', JSON.stringify(newSchedules));
    } catch (e) {
      console.error('Failed to save GEP schedules', e);
    }
  };

  // Open Add modal
  const openAddModal = () => {
    setModalMode('add');
    setEditingId(null);
    setFieldStartsOn('2026-05-12');
    setFieldShift('Morning');
    setFieldTime('7:30 AM - 10:45 AM');
    setFieldLevel('');
    setFieldRoomNumber('');
    setFieldRoomName('');
    setFieldFloor('1st Floor');
    setFieldRemarks('Full time');
    setFieldTeacherName('');
    setFieldTotalStudents(20);
    setIsModalOpen(true);
  };

  // Open Edit modal
  const openEditModal = (sch: GepClassSchedule) => {
    setModalMode('edit');
    setEditingId(sch.id);
    setFieldStartsOn(sch.startsOn);
    setFieldShift(sch.shift);
    setFieldTime(sch.time);
    setFieldLevel(sch.level);
    setFieldRoomNumber(sch.roomNumber);
    setFieldRoomName(sch.roomName);
    setFieldFloor(sch.floor);
    setFieldRemarks(sch.remarks);
    setFieldTeacherName(sch.teacherName || '');
    setFieldTotalStudents(sch.totalStudents || 20);
    setIsModalOpen(true);
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldLevel || !fieldRoomNumber || !fieldRoomName) {
      alert(lang === 'kh' ? 'សូមបំពេញព័ត៌មានដែលចាំបាច់ (Level, Room Number, Room Name)!' : 'Please fill all required fields!');
      return;
    }

    if (modalMode === 'add') {
      const newSch: GepClassSchedule = {
        id: 'gep-' + Date.now(),
        startsOn: fieldStartsOn,
        shift: fieldShift,
        time: fieldTime,
        level: fieldLevel,
        roomNumber: fieldRoomNumber,
        roomName: fieldRoomName,
        floor: fieldFloor,
        remarks: fieldRemarks,
        teacherName: fieldTeacherName || undefined,
        totalStudents: Number(fieldTotalStudents) || undefined
      };
      saveSchedules([...schedules, newSch]);
    } else {
      const updated = schedules.map(s => s.id === editingId ? {
        ...s,
        startsOn: fieldStartsOn,
        shift: fieldShift,
        time: fieldTime,
        level: fieldLevel,
        roomNumber: fieldRoomNumber,
        roomName: fieldRoomName,
        floor: fieldFloor,
        remarks: fieldRemarks,
        teacherName: fieldTeacherName || undefined,
        totalStudents: Number(fieldTotalStudents) || undefined
      } : s);
      saveSchedules(updated);
    }
    setIsModalOpen(false);
  };

  // Delete handler
  const handleDelete = (id: string) => {
    const confirmMsg = lang === 'kh' 
      ? 'តើអ្នកពិតជាចង់លុបកាលវិភាគថ្នាក់នេះមែនទេ?' 
      : 'Are you sure you want to delete this class schedule?';
    if (window.confirm(confirmMsg)) {
      saveSchedules(schedules.filter(s => s.id !== id));
    }
  };

  // Reset to seed data helper
  const handleResetDemoData = () => {
    const confirmMsg = lang === 'kh' 
      ? 'តើអ្នកចង់កំណត់ឡើងវិញនូវទិន្នន័យគំរូកាលវិភាគថ្នាក់ GEP ទាំងអស់ឬទេ?' 
      : 'Are you sure you want to reset all GEP classes schedules to demo data?';
    if (window.confirm(confirmMsg)) {
      saveSchedules(DEFAULT_GEP_SCHEDULES);
    }
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Filter schedules list
  const filteredSchedules = schedules.filter(sch => {
    const matchesSearch = 
      sch.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sch.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sch.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sch.teacherName && sch.teacherName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesShift = filterShift === 'All' || sch.shift === filterShift;
    const matchesRemarks = filterRemarks === 'All' || sch.remarks === filterRemarks;
    const matchesFloor = filterFloor === 'All' || sch.floor === filterFloor;

    return matchesSearch && matchesShift && matchesRemarks && matchesFloor;
  });

  // Sort helper functions
  const parseTimeToMinutes = (timeStr: string) => {
    const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const parseFloorToNumber = (floorStr: string) => {
    const lower = floorStr.toLowerCase();
    if (lower.includes('ground')) return 0;
    const match = lower.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 99;
  };

  // Sorted schedules list
  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    if (sortBy === 'Time') {
      const timeA = parseTimeToMinutes(a.time);
      const timeB = parseTimeToMinutes(b.time);
      if (timeA !== timeB) return timeA - timeB;
      const shiftOrder = { 'Morning': 1, 'Afternoon': 2, 'Evening': 3 };
      return (shiftOrder[a.shift] || 0) - (shiftOrder[b.shift] || 0);
    }
    if (sortBy === 'Floor') {
      const floorA = parseFloorToNumber(a.floor);
      const floorB = parseFloorToNumber(b.floor);
      if (floorA !== floorB) return floorA - floorB;
      return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
    }
    return 0; // Default
  });

  // Extract floor list for dynamic filters
  const floorOptions = Array.from(new Set(schedules.map(s => s.floor)));

  // Statistics calculations
  const totalClasses = schedules.length;
  const morningCount = schedules.filter(s => s.shift === 'Morning').length;
  const afternoonCount = schedules.filter(s => s.shift === 'Afternoon').length;
  const eveningCount = schedules.filter(s => s.shift === 'Evening').length;
  const fullTimeCount = schedules.filter(s => s.remarks === 'Full time').length;
  const partTimeCount = schedules.filter(s => s.remarks === 'Part Time').length;
  const totalStudentsExpected = schedules.reduce((acc, s) => acc + (s.totalStudents || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Ribbon Summary (Non-Print Only) */}
      <div className="no-print bg-gradient-to-r from-[#0d5c5a] to-[#073b3a] text-white p-6 rounded-3xl shadow-lg border border-emerald-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold uppercase px-2.5 py-1 rounded-full border border-emerald-500/30">
            GEP Operations Module
          </span>
          <h1 className="text-xl md:text-2xl font-black font-moul tracking-wide mt-2">
            កាលវិភាគថ្នាក់ GEP (GEP Classes Schedule)
          </h1>
          <p className="text-emerald-200/80 text-xs font-medium mt-1">
            {lang === 'kh' 
              ? 'ប្រព័ន្ធគ្រប់គ្រងកាលវិភាគសិក្សាកម្មវិធីភាសាអង់គ្លេសទូទៅ (GEP) - សាលាវេស្ទើនអន្តរជាតិ សាខាចំការដូង' 
              : 'General English Program (GEP) Class Schedule Manager - Western International School Chamkar Doung'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-900 font-black text-xs rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-900" />
            <span>{lang === 'kh' ? 'បន្ថែមថ្នាក់ថ្មី' : 'Add New Class'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <Printer className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{lang === 'kh' ? 'បោះពុម្ពបញ្ជី' : 'Print A4 Document'}</span>
          </button>
        </div>
      </div>

      {/* 2. Stats Summary Widgets Grid (Non-Print Only) */}
      <div className="no-print grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs space-y-1">
          <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">{lang === 'kh' ? 'ថ្នាក់សរុប' : 'Total Classes'}</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-800 font-mono">{totalClasses}</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">WIS GEP</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs space-y-1">
          <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">{lang === 'kh' ? 'ថ្នាក់ព្រឹក' : 'Morning Shift'}</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-[#0d5c5a] font-mono">{morningCount}</span>
            <span className="text-[10px] text-slate-400 font-semibold font-mono">7:30-10:45</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs space-y-1">
          <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">{lang === 'kh' ? 'ថ្នាក់រសៀល' : 'Afternoon Shift'}</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-[#0d5c5a] font-mono">{afternoonCount}</span>
            <span className="text-[10px] text-slate-400 font-semibold font-mono">1:30-4:45</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs space-y-1">
          <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">{lang === 'kh' ? 'ថ្នាក់ល្ងាច' : 'Evening Shift'}</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-[#0d5c5a] font-mono">{eveningCount}</span>
            <span className="text-[10px] text-slate-400 font-semibold font-mono">5:30-7:00</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs space-y-1">
          <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">{lang === 'kh' ? 'ពេញម៉ោង' : 'Full-time'}</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-amber-600 font-mono">{fullTimeCount}</span>
            <span className="text-[9px] bg-amber-50 text-amber-700 px-1 py-0.5 rounded font-black font-mono">FT</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs space-y-1">
          <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">{lang === 'kh' ? 'សិស្សសរុប' : 'Exp. Students'}</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-700 font-mono">{totalStudentsExpected}</span>
            <span className="text-[10px] text-slate-400 font-semibold font-mono">{lang === 'kh' ? 'នាក់' : 'pax'}</span>
          </div>
        </div>
      </div>

      {/* 3. Search and Filtering Controls (Non-Print Only) */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'kh' ? 'ស្វែងរកតាម Level, លេខបន្ទប់, ឈ្មោះបន្ទប់ ឬ គ្រូ...' : 'Search by Level, Room Number, Name, Teacher...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 pl-10 pr-4 py-2 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#0d5c5a] transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Shift Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">{lang === 'kh' ? 'វេន៖' : 'Shift:'}</span>
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value as any)}
              className="bg-transparent border-none text-[11px] font-black outline-none text-slate-700 pr-4 cursor-pointer"
            >
              <option value="All">{lang === 'kh' ? 'ទាំងអស់ (All)' : 'All Shifts'}</option>
              <option value="Morning">{lang === 'kh' ? 'ព្រឹក (Morning)' : 'Morning'}</option>
              <option value="Afternoon">{lang === 'kh' ? 'រសៀល (Afternoon)' : 'Afternoon'}</option>
              <option value="Evening">{lang === 'kh' ? 'ល្ងាច (Evening)' : 'Evening'}</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">{lang === 'kh' ? 'ប្រភេទ៖' : 'Type:'}</span>
            <select
              value={filterRemarks}
              onChange={(e) => setFilterRemarks(e.target.value as any)}
              className="bg-transparent border-none text-[11px] font-black outline-none text-slate-700 pr-4 cursor-pointer"
            >
              <option value="All">{lang === 'kh' ? 'ទាំងអស់' : 'All Types'}</option>
              <option value="Full time">Full time</option>
              <option value="Part Time">Part Time</option>
            </select>
          </div>

          {/* Floor Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">{lang === 'kh' ? 'ជាន់៖' : 'Floor:'}</span>
            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value)}
              className="bg-transparent border-none text-[11px] font-black outline-none text-slate-700 pr-4 cursor-pointer"
            >
              <option value="All">{lang === 'kh' ? 'ទាំងអស់' : 'All Floors'}</option>
              {floorOptions.map(fl => (
                <option key={fl} value={fl}>{fl}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-emerald-50/50 p-1.5 rounded-xl border border-[#0d5c5a]/20">
            <span className="text-[10px] font-black text-[#0d5c5a] uppercase tracking-wider pl-1">{lang === 'kh' ? 'តម្រៀប៖' : 'Sort:'}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-[11px] font-black outline-none text-[#0d5c5a] pr-4 cursor-pointer"
            >
              <option value="Default">{lang === 'kh' ? 'លំនាំដើម' : 'Default'}</option>
              <option value="Time">{lang === 'kh' ? 'ម៉ោងសិក្សា' : 'Time'}</option>
              <option value="Floor">{lang === 'kh' ? 'ជាន់បន្ទប់' : 'Floor'}</option>
            </select>
          </div>

          {/* Reset Demo button */}
          <button
            type="button"
            onClick={handleResetDemoData}
            title="Reset GEP Schedule to Demo Data"
            className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer border border-transparent hover:border-emerald-250 active:scale-95"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Active GEP Schedule List Block (Non-Print Only) */}
      <div className="no-print bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0d5c5a]" />
            <span>{lang === 'kh' ? 'តារាងកាលវិភាគថ្នាក់ GEP សរុប' : 'GEP Active Classes Schedule List'}</span>
          </h2>
          <span className="text-[10px] font-extrabold bg-[#0d5c5a]/10 text-[#0d5c5a] px-3 py-1 rounded-full border border-[#0d5c5a]/20">
            {sortedSchedules.length} {lang === 'kh' ? 'ថ្នាក់ត្រូវបានបង្ហាញ' : 'Classes Filtered'}
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[10px] font-black text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                <th className="p-4 text-center w-12">No</th>
                <th className="p-4">{lang === 'kh' ? 'កម្រិត (Level)' : 'Level'}</th>
                <th className="p-4 text-center">{lang === 'kh' ? 'លេខបន្ទប់' : 'Room No'}</th>
                <th className="p-4">{lang === 'kh' ? 'ឈ្មោះបន្ទប់' : 'Room Name'}</th>
                <th className="p-4 text-center">{lang === 'kh' ? 'ជាន់' : 'Floor'}</th>
                <th className="p-4">{lang === 'kh' ? 'វេន និងម៉ោងសិក្សា' : 'Shift & Time'}</th>
                <th className="p-4 text-center">{lang === 'kh' ? 'ប្រភេទសិក្សា' : 'Remarks'}</th>
                <th className="p-4">{lang === 'kh' ? 'គ្រូបង្រៀន' : 'Teacher'}</th>
                <th className="p-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
              {sortedSchedules.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-400 italic">
                    {lang === 'kh' 
                      ? 'រកមិនឃើញទិន្នន័យកាលវិភាគថ្នាក់ឡើយ! សូមបន្ថែមថ្នាក់ថ្មី ឬកំណត់ឡើងវិញនូវទិន្នន័យគំរូ។' 
                      : 'No class schedules found matching filter options. Try adding a new class.'}
                  </td>
                </tr>
              ) : (
                sortedSchedules.map((sch, idx) => (
                  <tr key={sch.id} className="hover:bg-emerald-50/30 border-l-4 border-l-transparent hover:border-l-[#0d5c5a] transition-all duration-300 ease-in-out transform hover:translate-x-0.5 shadow-sm hover:shadow-md/5">
                    <td className="p-4 text-center font-mono text-slate-400 bg-slate-50/10">
                      {idx + 1}
                    </td>
                    <td className="p-4">
                      <div className="font-extrabold text-[#0d5c5a] text-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#0d5c5a]" />
                        {sch.level}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-amber-100/70 text-amber-800 border border-amber-200 text-[11px] font-black px-2 py-0.5 rounded-lg font-mono">
                        {sch.roomNumber}
                      </span>
                    </td>
                    <td className="p-4 text-slate-800">
                      {sch.roomName}
                    </td>
                    <td className="p-4 text-center text-slate-500 text-[11px]">
                      {sch.floor}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {sch.shift === 'Morning' && (
                            <span className="bg-sky-50/90 text-sky-700 border border-sky-200/80 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit shadow-xs">
                              <Sunrise className="w-3 h-3 text-sky-500 shrink-0" />
                              <span>{lang === 'kh' ? 'ព្រឹក' : 'Morning'}</span>
                            </span>
                          )}
                          {sch.shift === 'Afternoon' && (
                            <span className="bg-amber-50/90 text-amber-800 border border-amber-200/80 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit shadow-xs">
                              <Sun className="w-3 h-3 text-amber-500 shrink-0" />
                              <span>{lang === 'kh' ? 'រសៀល' : 'Afternoon'}</span>
                            </span>
                          )}
                          {sch.shift === 'Evening' && (
                            <span className="bg-indigo-50/90 text-indigo-700 border border-indigo-200/85 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit shadow-xs">
                              <Moon className="w-3 h-3 text-indigo-500 shrink-0" />
                              <span>{lang === 'kh' ? 'ល្ងាច' : 'Evening'}</span>
                            </span>
                          )}
                          <span className="text-[10.5px] text-slate-400 font-extrabold font-mono">Starts May 12, 2026</span>
                        </div>
                        <div className="text-[11px] font-mono font-black text-slate-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{sch.time}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        sch.remarks === 'Full time' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {sch.remarks}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {sch.teacherName ? (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sch.teacherName}</span>
                          {sch.totalStudents && (
                            <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1 py-0.2 rounded ml-1 font-mono">
                              {sch.totalStudents}pax
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px] font-normal">Pending Assignment</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(sch)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer border border-transparent hover:border-emerald-250"
                          title="កែប្រែថ្នាក់"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(sch.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer border border-transparent hover:border-rose-250"
                          title="លុបថ្នាក់"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. A4 Official Printable Template (Printed Document) */}
      <div className="print-area hidden print:block bg-white p-4 relative text-slate-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Kingdom Cambodia Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-300 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 bg-emerald-800 rounded-xl flex items-center justify-center font-black text-white text-lg shrink-0">
              WIS
            </div>
            <div>
              <h1 className="font-moul text-[13px] leading-tight text-emerald-850">សាលាវេស្ទើនអន្តរជាតិ</h1>
              <p className="text-[10px] font-bold text-slate-600 mt-0.5">WESTERN INTERNATIONAL SCHOOL</p>
              <p className="text-[8.5px] font-semibold text-slate-450 mt-0.5">សាខាចំការដូង (Chamkar Doung Campus)</p>
            </div>
          </div>
          <div className="text-right space-y-0.5">
            <p className="font-moul text-[10px] leading-tight text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</p>
            <p className="font-moul text-[9px] leading-tight text-slate-900">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
            <p className="text-[9px] font-serif italic text-slate-500">KINGDOM OF CAMBODIA</p>
            <p className="text-[8.5px] font-bold text-slate-450 uppercase tracking-widest">Nation Religion King</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-6 space-y-1">
          <h2 className="font-moul text-sm text-slate-900 tracking-wide leading-relaxed">កាលវិភាគថ្នាក់សិក្សា GEP (GEP CLASSES SCHEDULE)</h2>
          <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Academic GEP General English Classes Master Plan</p>
          <div className="inline-block bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[9px] font-extrabold font-mono text-slate-600 mt-2">
            STARTS ON: MAY 12, 2026
          </div>
        </div>

        {/* Master Table of schedules */}
        <table className="w-full border-collapse border border-slate-400 text-[10.5px]">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-400 p-2 text-center w-8">No</th>
              <th className="border border-slate-400 p-2 text-left">Level (កម្រិតសិក្សា)</th>
              <th className="border border-slate-400 p-2 text-center">Room No</th>
              <th className="border border-slate-400 p-2 text-left">Room Name</th>
              <th className="border border-slate-400 p-2 text-center">Floor</th>
              <th className="border border-slate-400 p-2 text-left">Shift & Time (វេន និងម៉ោង)</th>
              <th className="border border-slate-400 p-2 text-center">Remarks</th>
              <th className="border border-slate-400 p-2 text-left">Teacher</th>
            </tr>
          </thead>
          <tbody>
            {sortedSchedules.map((s, idx) => (
              <tr key={s.id}>
                <td className="border border-slate-400 p-2 text-center font-mono">{idx + 1}</td>
                <td className="border border-slate-400 p-2 font-bold text-emerald-900">{s.level}</td>
                <td className="border border-slate-400 p-2 text-center font-bold font-mono">{s.roomNumber}</td>
                <td className="border border-slate-400 p-2">{s.roomName}</td>
                <td className="border border-slate-400 p-2 text-center">{s.floor}</td>
                <td className="border border-slate-400 p-2">
                  <div className="font-extrabold">
                    {s.shift === 'Morning' ? 'Morning Shift (7:30 AM - 10:45 AM)' 
                      : s.shift === 'Afternoon' ? 'Afternoon Shift (1:30 PM - 4:45 PM)' 
                      : 'Evening Shift (5:30 PM - 7:00 PM)'}
                  </div>
                </td>
                <td className="border border-slate-400 p-2 text-center font-bold">{s.remarks}</td>
                <td className="border border-slate-400 p-2 font-medium">{s.teacherName || 'TBA'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer block of the printed page */}
        <div className="mt-12 flex justify-between text-[10px]">
          <div className="text-center">
            <p className="font-bold">រៀបចំដោយ</p>
            <p className="text-[9px] text-slate-500">Prepared By Staff</p>
            <div className="h-16"></div>
            <p className="font-extrabold border-t border-slate-300 pt-1 px-4 min-w-[120px] inline-block">{currentUser?.fullName || 'Academic Supervisor'}</p>
          </div>

          {/* Official WIS Stamp Placeholder */}
          <div className="relative flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 border-4 border-double border-rose-600 rounded-full flex flex-col items-center justify-center text-center rotate-6 select-none shadow-sm z-20">
              <div className="text-[5.5px] font-black text-rose-650 tracking-widest uppercase mb-0.5">WESTERN INT. WIS_SCHOOL</div>
              <div className="border-t border-b border-rose-600 py-0.2 px-1 font-moul text-[5.5px] text-rose-600">យល់ព្រមអនុម័ត</div>
              <div className="text-[5.5px] font-black text-rose-650 tracking-wider">APPROVED</div>
            </div>
            <p className="text-[9px] text-slate-400 italic mt-1">Official Institutional Seal</p>
          </div>

          <div className="text-center">
            <p className="font-bold">ពិនិត្យ និងយល់ព្រម</p>
            <p className="text-[9px] text-slate-500">Approved By Principal</p>
            <div className="h-16"></div>
            <p className="font-extrabold border-t border-slate-300 pt-1 px-4 min-w-[120px] inline-block">LOUNG Veasna</p>
          </div>
        </div>

        {/* Printed Time watermark */}
        <div className="mt-12 text-center text-[8px] text-slate-400 font-mono">
          Report Generated: {new Date().toLocaleString()} • Western International School System Admin Module
        </div>
      </div>

      {/* 6. Form / Modal (Add and Edit Class Schedule) */}
      {isModalOpen && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl border border-slate-200 overflow-hidden shadow-2xl animate-scaleUp">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0d5c5a] to-[#073b3a] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-black font-moul text-sm tracking-wide">
                  {modalMode === 'add' ? 'បន្ថែមថ្នាក់សិក្សា GEP ថ្មី' : 'កែប្រែថ្នាក់សិក្សា GEP'}
                </h3>
                <p className="text-[10px] text-emerald-200 font-semibold mt-0.5 uppercase tracking-wider">
                  {modalMode === 'add' ? 'Add GEP Master Class Schedule' : 'Update Master GEP Class Info'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Starts On */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 block">Starts On *</label>
                  <input
                    type="date"
                    value={fieldStartsOn}
                    onChange={(e) => setFieldStartsOn(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-black outline-none font-mono focus:ring-2 focus:ring-[#0d5c5a] transition"
                    required
                  />
                </div>

                {/* Level */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 block">Level (កម្រិតសិក្សា) *</label>
                  <input
                    type="text"
                    placeholder="e.g. GEP Level 3A"
                    value={fieldLevel}
                    onChange={(e) => setFieldLevel(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-[#0d5c5a] transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Room Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 block">Room Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. 101"
                    value={fieldRoomNumber}
                    onChange={(e) => setFieldRoomNumber(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-[#0d5c5a] transition"
                    required
                  />
                </div>

                {/* Room Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 block">Room Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Angkor"
                    value={fieldRoomName}
                    onChange={(e) => setFieldRoomName(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-[#0d5c5a] transition"
                    required
                  />
                </div>

                {/* Floor */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 block">Floor</label>
                  <select
                    value={fieldFloor}
                    onChange={(e) => setFieldFloor(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-[#0d5c5a] cursor-pointer transition"
                  >
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="1st Floor">1st Floor</option>
                    <option value="2nd Floor">2nd Floor</option>
                    <option value="3rd Floor">3rd Floor</option>
                    <option value="4th Floor">4th Floor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-emerald-50/20 border border-emerald-100 p-4 rounded-2xl">
                {/* Shift */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#0d5c5a] block">Shift (វេនសិក្សា) *</label>
                  <select
                    value={fieldShift}
                    onChange={(e) => setFieldShift(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-[#0d5c5a] cursor-pointer transition"
                  >
                    <option value="Morning">Morning (7:30 AM - 10:45 AM)</option>
                    <option value="Afternoon">Afternoon (1:30 PM - 4:45 PM)</option>
                    <option value="Evening">Evening (5:30 PM - 7:00 PM)</option>
                  </select>
                </div>

                {/* Time range */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#0d5c5a] block">Time Window (ម៉ោងសិក្សា) *</label>
                  <input
                    type="text"
                    value={fieldTime}
                    onChange={(e) => setFieldTime(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-black outline-none font-mono focus:ring-2 focus:ring-[#0d5c5a] transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Remarks (Full time, Part Time) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 block">Remarks (ប្រភេទ) *</label>
                  <select
                    value={fieldRemarks}
                    onChange={(e) => setFieldRemarks(e.target.value as any)}
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-[#0d5c5a] cursor-pointer transition"
                  >
                    <option value="Full time">Full time</option>
                    <option value="Part Time">Part Time</option>
                  </select>
                </div>

                {/* Expected Students */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 block">Total Students Expected</label>
                  <input
                    type="number"
                    value={fieldTotalStudents}
                    onChange={(e) => setFieldTotalStudents(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-black outline-none font-mono focus:ring-2 focus:ring-[#0d5c5a] transition"
                  />
                </div>
              </div>

              {/* Teacher name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 block">Teacher Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. John Smith"
                  value={fieldTeacherName}
                  onChange={(e) => setFieldTeacherName(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-[#0d5c5a] transition"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-150 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-black rounded-xl transition cursor-pointer active:scale-95"
                >
                  {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0d5c5a] hover:bg-[#073b3a] text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === 'kh' ? 'រក្សាទុក' : 'Save Schedule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
