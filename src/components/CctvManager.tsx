/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Video, Calendar, ShieldCheck, ShieldAlert, AlertTriangle, 
  Search, Plus, Edit3, Trash2, X, Check, Eye, PenTool,
  Printer, Download, Layers, Shield, Settings, Info, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Define CCTV Record type
export interface CctvRecord {
  id: string;
  cameraName: string;
  location: string;
  floor: string; // Ground Floor, 1st Floor, etc.
  status: 'Normal' | 'Faulty' | 'Under Repair';
  issueDescription: string;
  reportDate: string;
  repairDate: string;
  followUpDate: string;
  remarks: string;
}

const CONST_FLOORS = [
  { value: 'Ground Floor', kh: 'ជាន់ផ្ទាល់ដី' },
  { value: '1st Floor', kh: 'ជាន់ទី ១' },
  { value: '2nd Floor', kh: 'ជាន់ទី ២' },
  { value: '3rd Floor', kh: 'ជាន់ទី ៣' },
  { value: '4th Floor', kh: 'ជាន់ទី ៤' },
];

const DEFAULT_CCTV: CctvRecord[] = [
  {
    id: 'CAM-101',
    cameraName: 'Gate Camera 1',
    location: 'ច្រកទ្វារសំខាន់ខាងមុខ (Main Gate Front)',
    floor: 'Ground Floor',
    status: 'Normal',
    issueDescription: '',
    reportDate: '',
    repairDate: '',
    followUpDate: '',
    remarks: 'មើលឃើញច្បាស់ល្អ ផ្លូវចេញចូល'
  },
  {
    id: 'CAM-102',
    cameraName: 'Front Office Dome',
    location: 'ការិយាល័យរដ្ឋបាលខាងមុខ (Reception Area)',
    floor: 'Ground Floor',
    status: 'Faulty',
    issueDescription: 'រូបភាពភ្លឹបភ្លែតៗ និងជួនកាលដាច់សញ្ញា (Flickering image and signal loss)',
    reportDate: '2026-06-05',
    repairDate: '',
    followUpDate: '2026-06-11',
    remarks: 'ត្រូវការជាងប្ដូរសំណុំខ្សែសញ្ញា RG6'
  },
  {
    id: 'CAM-103',
    cameraName: 'Library Hall Cam',
    location: 'បណ្ណាល័យធំ (Library Main Hall)',
    floor: '1st Floor',
    status: 'Under Repair',
    issueDescription: 'កាមេរ៉ាមិនភ្លឺទាល់តែសោះ ដាច់ភ្លើង Power Supply (No Power/LED Off)',
    reportDate: '2026-06-01',
    repairDate: '2026-06-10',
    followUpDate: '2026-06-09',
    remarks: 'ជាងកំពុងយកទៅជួសជុលម៉ាស៊ីន និងប្ដូរអាដាប់ទ័រថ្មី'
  },
  {
    id: 'CAM-104',
    cameraName: 'Playground Outdoor',
    location: 'សួនកុមារ និងតំបន់កីឡា (Playground Area)',
    floor: 'Ground Floor',
    status: 'Normal',
    issueDescription: '',
    reportDate: '',
    repairDate: '',
    followUpDate: '',
    remarks: 'ការពារទឹកបានល្អ គុណភាពរូបភាពច្បាស់ (Bullet IP Cam)'
  },
  {
    id: 'CAM-105',
    cameraName: 'Staircase East A',
    location: 'ជណ្ដើរជើងខាងកើត (East Stairwell)',
    floor: '2nd Floor',
    status: 'Normal',
    issueDescription: '',
    reportDate: '',
    repairDate: '',
    followUpDate: '',
    remarks: 'ជ្រុងមើលឃើញទូលាយ'
  }
];

export default function CctvManager() {
  const [records, setRecords] = useState<CctvRecord[]>(() => {
    try {
      const saved = localStorage.getItem('wis_cctv_records');
      return saved ? JSON.parse(saved) : DEFAULT_CCTV;
    } catch {
      return DEFAULT_CCTV;
    }
  });

  // Keep synced to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('wis_cctv_records', JSON.stringify(records));
    } catch (e) {
      console.error(e);
    }
  }, [records]);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFloor, setFilterFloor] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CctvRecord | null>(null);

  // Form states
  const [cameraName, setCameraName] = useState('');
  const [location, setLocation] = useState('');
  const [floor, setFloor] = useState('Ground Floor');
  const [status, setStatus] = useState<'Normal' | 'Faulty' | 'Under Repair'>('Normal');
  const [issueDescription, setIssueDescription] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [repairDate, setRepairDate] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [remarks, setRemarks] = useState('');

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Open modal for either New or Edit
  const openModal = (record: CctvRecord | null = null) => {
    if (record) {
      setEditingRecord(record);
      setCameraName(record.cameraName);
      setLocation(record.location);
      setFloor(record.floor);
      setStatus(record.status);
      setIssueDescription(record.issueDescription || '');
      setReportDate(record.reportDate || '');
      setRepairDate(record.repairDate || '');
      setFollowUpDate(record.followUpDate || '');
      setRemarks(record.remarks || '');
    } else {
      setEditingRecord(null);
      // Auto generate ID suggestion
      const newIdNum = records.length + 101;
      setCameraName(`CAM-${newIdNum}`);
      setLocation('');
      setFloor('Ground Floor');
      setStatus('Normal');
      setIssueDescription('');
      setReportDate('');
      setRepairDate('');
      setFollowUpDate('');
      setRemarks('');
    }
    setIsModalOpen(true);
  };

  // Save changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cameraName.trim() || !location.trim()) {
      showToast('សូមបំពេញឈ្មោះកាមេរ៉ា និងទីតាំងជាដាច់ខាត!', 'error');
      return;
    }

    if (editingRecord) {
      // Edit mode
      const updated = records.map(r => r.id === editingRecord.id ? {
        ...r,
        cameraName,
        location,
        floor,
        status,
        issueDescription: status === 'Normal' ? '' : issueDescription,
        reportDate: status === 'Normal' ? '' : reportDate,
        repairDate,
        followUpDate: status === 'Normal' ? '' : followUpDate,
        remarks
      } : r);
      setRecords(updated);
      showToast(`បានកែប្រែកាមេរ៉ា "${cameraName}" រួចរាល់!`, 'success');
    } else {
      // Create mode
      const newRecord: CctvRecord = {
        id: 'CAM-' + Math.floor(1000 + Math.random() * 9000),
        cameraName,
        location,
        floor,
        status,
        issueDescription: status === 'Normal' ? '' : issueDescription,
        reportDate: status === 'Normal' ? '' : reportDate,
        repairDate,
        followUpDate: status === 'Normal' ? '' : followUpDate,
        remarks
      };
      setRecords([newRecord, ...records]);
      showToast(`បានបន្ថែមវត្តមានកាមេរ៉ាថ្មី "${cameraName}" ជោគជ័យ!`, 'success');
    }
    setIsModalOpen(false);
  };

  // Delete camera
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបបំបាត់កាមេរ៉ា "${name}" នេះមែនទេ?`)) {
      setRecords(records.filter(r => r.id !== id));
      showToast(`បានលុបកាមេរ៉ា "${name}" ចេញពីប្រព័ន្ធរួចរាល់`, 'info');
    }
  };

  // Statistics calculations
  const totalCams = records.length;
  const normalCams = records.filter(r => r.status === 'Normal').length;
  const faultyCams = records.filter(r => r.status === 'Faulty').length;
  const repairingCams = records.filter(r => r.status === 'Under Repair').length;

  // Filter & Search application
  const filteredRecords = records.filter(r => {
    const matchesSearch = r.cameraName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (r.issueDescription && r.issueDescription.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFloor = filterFloor === 'All' || r.floor === filterFloor;
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    
    return matchesSearch && matchesFloor && matchesStatus;
  });

  return (
    <div className="bg-white/95 rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200 font-sans relative">
      
      {/* Dynamic Toast Feedback Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-black flex items-center gap-2 max-w-sm ${
              toast.type === 'success' 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}
          >
            {toast.type === 'success' ? <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
            <div>{toast.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Title Head */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#073B3A] text-amber-300 rounded-2xl w-fit shadow-md">
            <Video className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-1.5 leading-snug">
              ការគ្រប់គ្រងប្រព័ន្ធកាមេរ៉ាសុវត្ថិភាព (CCTV Management Station)
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              ប្រព័ន្ធត្រួតពិនិត្យ ស្ថានភាពបច្ចេកទេស និងកំណត់ហេតុជួសជុលម៉ាស៊ីនកាមេរ៉ាសុវត្ថិភាពទូទាំងបរិវេណសាលា
            </p>
          </div>
        </div>
        
        <button
          onClick={() => openModal(null)}
          className="bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.01] active:scale-[0.99] transition-all text-white font-black text-xs px-4 py-3 rounded-xl flex items-center gap-1.5 self-start md:self-auto cursor-pointer shadow-sm shadow-emerald-750/10"
        >
          <Plus className="w-4 h-4" />
          <span>បន្ថែមឧបករណ៍កាមេរ៉ា (Add Camera)</span>
        </button>
      </div>

      {/* Top statistics panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Stat 1 */}
        <div className="bg-slate-50 border border-slate-205 border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-450 text-slate-400">កាមេរ៉ាសរុប (Total CCTV)</span>
            <h3 className="text-xl font-black text-slate-800 font-mono mt-0.5">{totalCams} គ្រឿង</h3>
          </div>
          <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-700">
            <Video className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-emerald-50/50 border border-emerald-150 border-emerald-200 text-emerald-950 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600">ស្ថានភាពល نارល្អ (Normal Status)</span>
            <h3 className="text-xl font-black text-emerald-800 font-mono mt-0.5">{normalCams} គ្រឿង</h3>
          </div>
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-amber-50/50 border border-amber-150 border-amber-200 text-amber-950 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-amber-600">កំពុងជួសជុល (Under Repair)</span>
            <h3 className="text-xl font-black text-amber-800 font-mono mt-0.5">{repairingCams} គ្រឿង</h3>
          </div>
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
            <PenTool className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-rose-50/50 border border-rose-150 border-rose-200 text-rose-950 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-rose-600">កំពុងខូច/មានបញ្ហា (Faulty/Failed)</span>
            <h3 className="text-xl font-black text-rose-800 font-mono mt-0.5">{faultyCams} គ្រឿង</h3>
          </div>
          <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Control Filters Block */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះកាមេរ៉ា ឬទីតាំង..."
            className="w-full bg-white border border-slate-200/85 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-705 text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Floor filter */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-[10.5px] font-black text-slate-500 shrink-0">ជាន់៖</span>
          <select
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-black text-slate-705 outline-none cursor-pointer"
          >
            <option value="All">ទាំងអស់ (All Floors)</option>
            {CONST_FLOORS.map(fl => (
              <option key={fl.value} value={fl.value}>{fl.kh}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-[10.5px] font-black text-slate-500 shrink-0">ស្ថានភាព៖</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-black text-slate-705 outline-none cursor-pointer"
          >
            <option value="All">ទាំងអស់ (All Status)</option>
            <option value="Normal">ដំណើរការល្អ (Normal)</option>
            <option value="Faulty">ខូច/ដាច់រូបភាព (Faulty)</option>
            <option value="Under Repair">កំពុងជួសជុល (Under Repair)</option>
          </select>
        </div>
      </div>

      {/* CCTV Data Table Grid representation */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full border-collapse text-left text-xs bg-white">
          <thead className="bg-slate-50 font-black text-slate-650 uppercase border-b border-slate-200 font-tapenh text-[10px]">
            <tr>
              <th className="p-3.5 pl-4">កូដ/ឈ្មោះ (ID & Name)</th>
              <th className="p-3.5">ទីតាំង (Floor & Location)</th>
              <th className="p-3.5 text-center">ស្ថានភាព (Status)</th>
              <th className="p-3.5">រាយការណ៍បញ្ហា (Issue Logs)</th>
              <th className="p-3.5">ការកំណត់ជួសជុល (Maintenance Dates)</th>
              <th className="p-3.5 text-right pr-4">សកម្មភាព (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-slate-450 text-slate-450 font-bold">
                  មិនទាន់មានទិន្នន័យកាមេរ៉ាសុវត្ថិភាពត្រូវនឹងលក្ខខណ្ឌចម្រោះរបស់លោកអ្នកឡើយ។
                </td>
              </tr>
            ) : (
              filteredRecords.map((r, idx) => {
                const floorLabel = CONST_FLOORS.find(fl => fl.value === r.floor)?.kh || r.floor;
                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Column 1 */}
                    <td className="p-4 pl-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          r.status === 'Normal' ? 'bg-emerald-50 text-emerald-600' :
                          r.status === 'Faulty' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
                        }`}>
                          <Video className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block">{r.cameraName}</span>
                          <span className="text-[10px] font-mono text-slate-450 bg-slate-100 px-1.5 py-0.5 rounded font-bold">{r.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Column 2 */}
                    <td className="p-4">
                      <div>
                        <span className="font-semibold block">{r.location}</span>
                        <span className="text-[10px] text-emerald-700 font-black block">{floorLabel}</span>
                      </div>
                    </td>

                    {/* Column 3 */}
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[9.5px] font-extrabold ${
                        r.status === 'Normal' ? 'bg-emerald-100 text-emerald-800' :
                        r.status === 'Faulty' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          r.status === 'Normal' ? 'bg-emerald-500 animate-pulse' :
                          r.status === 'Faulty' ? 'bg-rose-500' : 'bg-amber-500 animate-spin'
                        }`} />
                        {r.status === 'Normal' ? 'ដំណើរការល្អ (Normal)' :
                         r.status === 'Faulty' ? 'ខូច/មានបញ្ហា (Faulty)' : 'កំពុងជួសជុល (Under Repair)'}
                      </span>
                    </td>

                    {/* Column 4 */}
                    <td className="p-4">
                      {r.status === 'Normal' ? (
                        <span className="text-slate-400 text-[10px] italic">គ្មាលបញ្ហាធម្មតា (Stable)</span>
                      ) : (
                        <div className="max-w-[190px] leading-relaxed">
                          <p className="text-[11px] font-bold text-rose-600 block line-clamp-2">{r.issueDescription || 'មិនមានកំណត់ចំណាំ'}</p>
                          {r.remarks && <p className="text-[10px] text-slate-500 italic mt-0.5 mt-1 block"><b>Remarks:</b> {r.remarks}</p>}
                        </div>
                      )}
                    </td>

                    {/* Column 5 */}
                    <td className="p-4">
                      {r.status === 'Normal' ? (
                        <span className="text-slate-400">-</span>
                      ) : (
                        <div className="space-y-1 text-[10.5px]">
                          {r.reportDate && (
                            <div className="flex justify-between gap-1 text-slate-500 font-medium">
                              <span>ថ្ងៃរាយការណ៍៖</span>
                              <span className="font-bold text-slate-700 font-mono">{r.reportDate}</span>
                            </div>
                          )}
                          {r.followUpDate && (
                            <div className="flex justify-between gap-1 text-amber-600 font-black">
                              <span>តាមដានជាមួយជាង៖</span>
                              <span className="font-mono">{r.followUpDate}</span>
                            </div>
                          )}
                          {r.repairDate && (
                            <div className="flex justify-between gap-1 text-emerald-600 font-bold">
                              <span>កាលបរិច្ឆេទជួសជុល៖</span>
                              <span className="font-mono">{r.repairDate}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Column 6 */}
                    <td className="p-4 text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openModal(r)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-lg cursor-pointer transition border border-slate-200/50"
                          title="កែសម្រួលព័ត៌មាន (Edit Component)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id, r.cameraName)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-650 text-rose-600 rounded-lg cursor-pointer transition border border-rose-200/30"
                          title="លុបកាមេរ៉ា (Delete Camera)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CCTV Creator or Modifier Modal Overlay */}
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
                  <Video className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span className="text-sm font-black text-rose-50 font-sans">
                    {editingRecord ? 'កែសម្រួលព័ត៌មានកាមេរ៉ាសុវត្ថិភាព' : 'បន្ថែមព័ត៌មានកាមេរ៉ាសុវត្ថិភាពថ្មី'}
                  </span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4">
                
                {/* Visual Camera Name & Floor */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-650 block">ឈ្មោះកាមេរ៉ា (Camera Name) *</label>
                    <input
                      type="text"
                      value={cameraName}
                      onChange={(e) => setCameraName(e.target.value)}
                      placeholder="ឧទាហរណ៍៖ Gate Dome A"
                      className="w-full bg-slate-50 border border-slate-205 border-slate-200 p-2.5 rounded-xl text-xs font-black text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-650 block">ជាន់អាគារ (Floor Location) *</label>
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
                  <label className="text-[11px] font-black text-slate-650 block">ទីតាំងជាក់លាក់ (Location details) *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="ឧទាហរណ៍៖ ខាងមុខច្រកទ្វារធំអាគារ A"
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-black text-slate-700 outline-none"
                    required
                  />
                </div>

                {/* Status Indicator */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-650 block">ស្ថានភាពប្រតិបត្តិការ (Operation Status)</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { key: 'Normal', kh: 'ធម្មតា (Normal)', border: 'border-emerald-250', checkedStyle: 'bg-emerald-600 text-white' },
                      { key: 'Faulty', kh: 'ខូច (Faulty)', border: 'border-rose-250', checkedStyle: 'bg-rose-600 text-white' },
                      { key: 'Under Repair', kh: 'កំពុងជួសជុល (Repair)', border: 'border-amber-250', checkedStyle: 'bg-amber-500 text-white' }
                    ].map(opt => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setStatus(opt.key as any)}
                        className={`py-2 px-1 text-[10.5px] font-black rounded-xl border transition-all text-center cursor-pointer ${
                          status === opt.key 
                            ? opt.checkedStyle + ' border-transparent font-black shadow-xs' 
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        {opt.kh}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expanded Fields if Status is NOT Normal */}
                {status !== 'Normal' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 bg-red-50/15 border border-dashed border-slate-200 p-3 rounded-xl"
                  >
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-rose-800 block">កំណត់ត្រាបញ្ហាខូចខាត (Issue Description)</label>
                      <textarea
                        value={issueDescription}
                        onChange={(e) => setIssueDescription(e.target.value)}
                        placeholder="ឧទាហរណ៍៖ ដាច់សញ្ញារូបភាពនៅចន្លោះម៉ោង ៨ព្រឹក ឬរូបភាពមានធូលីដីខ្លាំង"
                        className="w-full bg-slate-50 border border-slate-200 p-2 text-xs font-semibold text-slate-700 outline-none rounded-lg h-14 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-650 block">កាលបរិច្ឆេទរាយការណ៍បញ្ហា</label>
                        <input
                          type="date"
                          value={reportDate}
                          onChange={(e) => setReportDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-black text-slate-700 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-amber-700 block">តាមដានជាមួយជាង (Follow-up)</label>
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-black text-slate-700 outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Repair date & general remarks (Always editable) */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-650 block">កាលបរិច្ឆេទជួសជុល (Repair Date)</label>
                    <input
                      type="date"
                      value={repairDate}
                      onChange={(e) => setRepairDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-black text-slate-700 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-650 block">កំណត់សម្គាល់ (Remarks)</label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="កំណត់សម្គាល់ផ្សេងៗ..."
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-semibold text-slate-700 outline-none"
                    />
                  </div>
                </div>

                {/* Actions Footer modal */}
                <div className="pt-2 flex items-center justify-end gap-2 text-xs font-black border-t border-slate-100">
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
                    <span>រក្សាសិទ្ធិទុក (Save Camera)</span>
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
