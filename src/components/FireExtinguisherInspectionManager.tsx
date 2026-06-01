/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Flame, Search, PlusCircle, Edit, Trash2, X, Check, AlertTriangle, 
  User, CheckSquare, Square, ShieldAlert, Download, ClipboardCheck, 
  Wrench, Layers, RefreshCw, PenTool, Eye, ShieldCheck, MapPin, Calendar
} from 'lucide-react';
import { FireExtinguisherInspection } from '../types';

const EXT_TYPES = [
  'Dry Chemical (ម្សៅស្ងួត)',
  'CO2 (កាបូនឌីអុកស៊ីត)',
  'Foam (ហ្វូម)',
  'Water (ទឹក)',
  'Wet Chemical (សារធាតុគីមីសើម)'
];

const CAPACITIES = ['2kg', '4kg', '6kg', '9kg', '12kg', '50lb'];

const DEFAULT_INSPECTIONS: FireExtinguisherInspection[] = [
  {
    id: 'WIS-FE-001',
    type: 'Dry Chemical (ម្សៅស្ងួត)',
    capacity: '4kg',
    location: 'ក្បែរកណ្តើរយន្តជណ្តើរកណ្តាល (Near Central Elevator)',
    buildingFloor: 'អគារ A - ជាន់ទី ១ (Building A - Floor 1)',
    inspectionDate: '2026-05-20',
    inspectorName: 'សាយ សេរី (SAY Serey)',
    
    // Checkpoints
    isInPlace: true,
    hasClearSign: true,
    isPressureOk: true,
    isPinPresent: true,
    isSealIntact: true,
    isNoCorrosion: true,
    isNozzleClean: true,
    isNotExpired: true,
    isInstructionClear: true,
    isUsable: true,
    
    // Corrective Actions
    needsRepair: 'គ្មានការជួសជុលទេ (No Repair Required)',
    needsRefill: 'គ្មានការបញ្ចូលសារធាតុទេ (Refill Level OK)',
    needsReplacement: 'គ្មានការផ្លាស់ប្តូរទេ (Good Condition)',
    
    // Signatures
    inspectorSignature: 'សាយ សេរី',
    deptHeadSignature: 'អ៊ុំ រតនា',
    signatureDate: '2026-05-20'
  },
  {
    id: 'WIS-FE-002',
    type: 'CO2 (កាបូនឌីអុកស៊ីត)',
    capacity: '6kg',
    location: 'បន្ទប់ពិសោធន៍វិទ្យាសាស្ត្រ (Science Laboratory Room)',
    buildingFloor: 'អគារ B - ជាន់ទី ២ (Building B - Floor 2)',
    inspectionDate: '2026-05-25',
    inspectorName: 'ផល សុភ័ក្រ (PHAL Sopheak)',
    
    // Checkpoints
    isInPlace: true,
    hasClearSign: true,
    isPressureOk: false, // low pressure
    isPinPresent: true,
    isSealIntact: false, // broken lock string
    isNoCorrosion: true,
    isNozzleClean: true,
    isNotExpired: true,
    isInstructionClear: true,
    isUsable: false, // not usable due to pressure
    
    // Corrective Actions
    needsRepair: 'ប្តូរបណ្តោងសោ និងផ្សាខ្សែថ្មី (Replace safety seal lock)',
    needsRefill: 'ត្រូវការបញ្ចូលសារធាតុហ្គាស CO2 ឡើងវិញជាប្រញាប់ (Requires CO2 Gas Refill urgently)',
    needsReplacement: 'កិច្ចសន្យាដូរដបពុំត្រូវការឡើយ ដបនៅថ្មី (No bottle replacement needed)',
    
    // Signatures
    inspectorSignature: 'ផល សុភ័ក្រ',
    deptHeadSignature: 'អ៊ុំ រតនា',
    signatureDate: '2026-05-25'
  },
  {
    id: 'WIS-FE-003',
    type: 'Dry Chemical (ម្សៅស្ងួត)',
    capacity: '4kg',
    location: 'មុខការិយាល័យរដ្ឋបាល (In front of Admin Office)',
    buildingFloor: 'អគារ A - ជាន់ទី ២ (Building A - Floor 2)',
    inspectionDate: '2026-05-18',
    inspectorName: 'សាយ សេរី (SAY Serey)',
    
    // Checkpoints
    isInPlace: true,
    hasClearSign: true,
    isPressureOk: true,
    isPinPresent: true,
    isSealIntact: true,
    isNoCorrosion: false, // has minor rust on bottom margin
    isNozzleClean: true,
    isNotExpired: true,
    isInstructionClear: false, // instruction text is peeled off
    isUsable: true,
    
    // Corrective Actions
    needsRepair: 'បោសសម្អាតស្នឹមច្រេះពីជើងបំពង់ រួចលាបថ្នាំការពារសារជាថ្មី (Clean rust and repaint)',
    needsRefill: 'គ្មាន (None)',
    needsReplacement: 'បិទបដាសេចក្តីណែនាំថ្មី (Apply new operating instruction label)',
    
    // Signatures
    inspectorSignature: 'សាយ សេរី',
    deptHeadSignature: 'អ៊ុំ រតនា',
    signatureDate: '2026-05-18'
  },
  {
    id: 'WIS-FE-004',
    type: 'Dry Chemical (ម្សៅស្ងួត)',
    capacity: '9kg',
    location: 'អាហារដ្ឋានជាន់ក្រោម (Canteen Ground Level)',
    buildingFloor: 'អគារ A - Ground Fl. (Building A - Ground)',
    inspectionDate: '2026-05-27',
    inspectorName: 'សាយ សេរី (SAY Serey)',
    
    // Checkpoints
    isInPlace: true,
    hasClearSign: true,
    isPressureOk: true,
    isPinPresent: true,
    isSealIntact: true,
    isNoCorrosion: true,
    isNozzleClean: true,
    isNotExpired: true,
    isInstructionClear: true,
    isUsable: true,
    
    // Corrective Actions
    needsRepair: 'គ្មាន (None)',
    needsRefill: 'គ្មាន (None)',
    needsReplacement: 'គ្មាន (None)',
    
    // Signatures
    inspectorSignature: 'សាយ សេរី',
    deptHeadSignature: 'អ៊ុំ រតនា',
    signatureDate: '2026-05-27'
  }
];

export default function FireExtinguisherInspectionManager() {
  const [inspections, setInspections] = useState<FireExtinguisherInspection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Usable' | 'NeedsAttention'>('All');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'info' } | null>(null);

  // Modals management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FireExtinguisherInspection | null>(null);
  const [viewingItem, setViewingItem] = useState<FireExtinguisherInspection | null>(null);

  // Form Fields State
  const [id, setId] = useState('');
  const [type, setType] = useState('Dry Chemical (ម្សៅស្ងួត)');
  const [capacity, setCapacity] = useState('4kg');
  const [location, setLocation] = useState('');
  const [buildingFloor, setBuildingFloor] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectorName, setInspectorName] = useState('');

  // 10 Checkpoints
  const [isInPlace, setIsInPlace] = useState(true);
  const [hasClearSign, setHasClearSign] = useState(true);
  const [isPressureOk, setIsPressureOk] = useState(true);
  const [isPinPresent, setIsPinPresent] = useState(true);
  const [isSealIntact, setIsSealIntact] = useState(true);
  const [isNoCorrosion, setIsNoCorrosion] = useState(true);
  const [isNozzleClean, setIsNozzleClean] = useState(true);
  const [isNotExpired, setIsNotExpired] = useState(true);
  const [isInstructionClear, setIsInstructionClear] = useState(true);
  const [isUsable, setIsUsable] = useState(true);

  // Corrective Actions
  const [needsRepair, setNeedsRepair] = useState('');
  const [needsRefill, setNeedsRefill] = useState('');
  const [needsReplacement, setNeedsReplacement] = useState('');

  // Signatures
  const [inspectorSignature, setInspectorSignature] = useState('');
  const [deptHeadSignature, setDeptHeadSignature] = useState('');
  const [signatureDate, setSignatureDate] = useState('');

  // Initial load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wis_fe_inspections');
      if (saved) {
        setInspections(JSON.parse(saved));
      } else {
        setInspections(DEFAULT_INSPECTIONS);
        localStorage.setItem('wis_fe_inspections', JSON.stringify(DEFAULT_INSPECTIONS));
      }
    } catch (err) {
      console.error('Failed to load Fire Extinguisher inspections', err);
      setInspections(DEFAULT_INSPECTIONS);
    }
  }, []);

  // Save updates instantly
  const saveAndSync = (updated: FireExtinguisherInspection[]) => {
    setInspections(updated);
    localStorage.setItem('wis_fe_inspections', JSON.stringify(updated));
  };

  const showToastMsg = (msg: string, type: 'success' | 'danger' | 'info') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Pre-fill and open modal for insertion
  const openAddModal = () => {
    setEditingItem(null);
    setViewingItem(null);

    // Calculate incremental ID
    const nextSeqNum = inspections.length > 0
      ? Math.max(...inspections.map(i => {
          const m = i.id.match(/\d+$/);
          return m ? parseInt(m[0]) : 0;
        })) + 1
      : 1;
    const formatted = String(nextSeqNum).padStart(3, '0');

    setId(`WIS-FE-${formatted}`);
    setType('Dry Chemical (ម្សៅស្ងួត)');
    setCapacity('4kg');
    setLocation('');
    setBuildingFloor('');
    setInspectionDate(new Date().toISOString().split('T')[0]);
    setInspectorName('សាយ សេរី (SAY Serey)');

    // Set all checkpoints true by default
    setIsInPlace(true);
    setHasClearSign(true);
    setIsPressureOk(true);
    setIsPinPresent(true);
    setIsSealIntact(true);
    setIsNoCorrosion(true);
    setIsNozzleClean(true);
    setIsNotExpired(true);
    setIsInstructionClear(true);
    setIsUsable(true);

    setNeedsRepair('គ្មាន (None)');
    setNeedsRefill('គ្មាន (None)');
    setNeedsReplacement('គ្មាន (None)');

    setInspectorSignature('សាយ សេរី');
    setDeptHeadSignature('អ៊ុំ រតនា');
    setSignatureDate(new Date().toISOString().split('T')[0]);

    setIsModalOpen(true);
  };

  // Pre-fill for edit
  const openEditModal = (item: FireExtinguisherInspection) => {
    setEditingItem(item);
    setViewingItem(null);

    setId(item.id);
    setType(item.type);
    setCapacity(item.capacity);
    setLocation(item.location);
    setBuildingFloor(item.buildingFloor);
    setInspectionDate(item.inspectionDate);
    setInspectorName(item.inspectorName);

    setIsInPlace(item.isInPlace);
    setHasClearSign(item.hasClearSign);
    setIsPressureOk(item.isPressureOk);
    setIsPinPresent(item.isPinPresent);
    setIsSealIntact(item.isSealIntact);
    setIsNoCorrosion(item.isNoCorrosion);
    setIsNozzleClean(item.isNozzleClean);
    setIsNotExpired(item.isNotExpired);
    setIsInstructionClear(item.isInstructionClear);
    setIsUsable(item.isUsable);

    setNeedsRepair(item.needsRepair);
    setNeedsRefill(item.needsRefill);
    setNeedsReplacement(item.needsReplacement);

    setInspectorSignature(item.inspectorSignature);
    setDeptHeadSignature(item.deptHeadSignature);
    setSignatureDate(item.signatureDate);

    setIsModalOpen(true);
  };

  // Submit action
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim() || !buildingFloor.trim() || !inspectorName.trim()) {
      showToastMsg('សូមបំពេញព័ត៌មានចាំបាច់ (ទីតាំងដាក់ អគារ/ជាន់ និងអ្នកត្រួតពិនិត្យ)', 'danger');
      return;
    }

    const payload: FireExtinguisherInspection = {
      id,
      type,
      capacity,
      location,
      buildingFloor,
      inspectionDate,
      inspectorName,

      isInPlace,
      hasClearSign,
      isPressureOk,
      isPinPresent,
      isSealIntact,
      isNoCorrosion,
      isNozzleClean,
      isNotExpired,
      isInstructionClear,
      isUsable,

      needsRepair: needsRepair || 'គ្មាន (None)',
      needsRefill: needsRefill || 'គ្មាន (None)',
      needsReplacement: needsReplacement || 'គ្មាន (None)',

      inspectorSignature: inspectorSignature || inspectorName,
      deptHeadSignature: deptHeadSignature || 'អ៊ុំ រតនា',
      signatureDate: signatureDate || inspectionDate
    };

    if (editingItem) {
      const updated = inspections.map(item => item.id === editingItem.id ? payload : item);
      saveAndSync(updated);
      showToastMsg(`កែប្រែកំណត់ត្រាត្រួតពិនិត្យបំពង់ ${payload.id} ជោគជ័យ និងរក្សាទុកស្វ័យប្រវត្ត`, 'success');
    } else {
      const exists = inspections.some(item => item.id === payload.id);
      if (exists) {
        showToastMsg(`លេខសម្គាល់បំពង់ "${payload.id}" នេះមានរួចហើយ!`, 'danger');
        return;
      }
      const updated = [payload, ...inspections];
      saveAndSync(updated);
      showToastMsg(`បានបន្ថែមការត្រួតពិនិត្យបំពង់ ${payload.id} ថ្មីចូលក្នុងប្រព័ន្ធ និងរក្សាទុកស្វ័យប្រវត្ត`, 'success');
    }

    setIsModalOpen(false);
  };

  // Delete inspection record
  const handleDeleteInspection = (recordId: string) => {
    const isConfirmed = window.confirm(`តើលោកអ្នកពិតជាចង់លុបចោលកំណត់ត្រាត្រួតពិនិត្យបំពង់កូដ [${recordId}] នេះមែនទេ?\nការផ្លាស់ប្តូរណាមួយនឹងត្រូវរក្សាទុកស្វ័យប្រវត្តិ!`);
    if (!isConfirmed) return;

    const remaining = inspections.filter(item => item.id !== recordId);
    saveAndSync(remaining);
    showToastMsg(`បានលុបកំណត់ត្រា ${recordId} ចេញពីប្រព័ន្ធរួចរាល់!`, 'info');
  };

  // Reset defaults helper
  const handleResetDefaults = () => {
    const isConfirmed = window.confirm('តើអ្នកចង់កំណត់ឡើងវិញនូវបញ្ជីត្រួតពិនិត្យបំពង់ពន្លត់អគ្គិភ័យគំរូមែនទេ?');
    if (!isConfirmed) return;

    saveAndSync(DEFAULT_INSPECTIONS);
    showToastMsg('ប្រព័ន្ធបានកំណត់ឡើងវិញនូវទិន្នន័យគំរូដើមរបស់សាលារួចរាល់!', 'success');
  };

  // Calculate high-level counters
  const totalInvoiced = inspections.length;
  const compliantCount = inspections.filter(item => item.isUsable).length;
  const nonCompliantCount = totalInvoiced - compliantCount;
  
  // Specific warnings
  const lowPressureCount = inspections.filter(item => !item.isPressureOk).length;
  const missingPinsCount = inspections.filter(item => !item.isPinPresent).length;

  // Filter items matching layout specifications
  const filteredList = inspections.filter(item => {
    const typeMatch = filterType === 'All' || item.type.includes(filterType);
    
    let statusMatch = true;
    if (statusFilter === 'Usable') statusMatch = item.isUsable;
    else if (statusFilter === 'NeedsAttention') statusMatch = !item.isUsable;

    const query = searchQuery.trim().toLowerCase();
    const searchMatch = !query ||
      item.id.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.buildingFloor.toLowerCase().includes(query) ||
      item.inspectorName.toLowerCase().includes(query) ||
      item.needsRepair.toLowerCase().includes(query) ||
      item.needsRefill.toLowerCase().includes(query) ||
      item.needsReplacement.toLowerCase().includes(query);

    return typeMatch && statusMatch && searchMatch;
  });

  return (
    <div className="space-y-6" id="fire-extinguisher-manager-root">
      
      {/* Toast Alert message display */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          toast.type === 'danger' ? 'bg-rose-50 text-rose-800 border-rose-200' :
          'bg-slate-50 text-slate-800 border-slate-200'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4 text-emerald-700" /> : <AlertTriangle className="w-4 h-4 text-rose-700" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Visual Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden" id="fe-header-banner">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center text-white shadow-md shadow-rose-550/15 shrink-0">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-moul tracking-normal text-slate-900 flex flex-wrap items-center gap-2">
                សន្លឹកគ្រប់គ្រងការត្រួតពិនិត្យបំពង់អគ្គិភ័យ (Fire Extinguisher Inspection Panel)
                <span className="text-[10px] bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full font-bold">Auto Synchronized ⚙</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                ប្រព័ន្ធត្រួតពិនិត្យសុវត្ថិភាពអគ្គិភ័យ៖ កត់ត្រាលេខសម្គាល់ ប្រភេទបំពង់ សូចនាករសម្ពាធការិយាល័យ និងសកម្មភាពជួសជុលផ្សេងៗ។
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2 hover:bg-slate-100 transition border rounded-xl text-slate-500 text-xs font-bold cursor-pointer"
            >
              កំណត់ឡើងវិញ
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm shadow-rose-620/15"
            >
              <PlusCircle className="w-4 h-4" />
              <span>បញ្ចូលកំណត់ត្រាថ្មី (Add Inspection)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety Notice Information Banner */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100/90 rounded-2xl px-5 py-3 text-xs text-red-950 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 font-bold text-red-950">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>ស្តង់ដារគ្រប់គ្រង៖ រាល់បំពង់ពន្លត់ភ័យត្រូវត្រួតពិនិត្យប្រចាំខែដើម្បីធានាសម្ពាធ សោសុវត្ថិភាព និងលទ្ធភាពបំពេញការងារបានធម្មតា។</span>
          </div>
          <span className="text-[10px] uppercase font-black bg-red-200 text-red-800 px-2 py-0.5 rounded-lg">
            Standard Operating Protocol
          </span>
        </div>
      </div>

      {/* Dashboard Counters Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest">បំពង់សរុប (Total)</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-black text-slate-800">{totalInvoiced}</span>
            <span className="text-xs text-slate-400 font-bold">គ្រឿង</span>
          </div>
          <p className="text-[9.5px] text-slate-400 mt-1 font-semibold">ចុះបញ្ជីទូទាំងសាខា</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-[10.5px] font-black text-emerald-600 uppercase tracking-widest">ប្រើប្រាស់បាន (Operational)</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-black text-emerald-600">{compliantCount}</span>
            <span className="text-xs text-emerald-400 font-bold">គ្រឿង</span>
          </div>
          <span className="inline-block text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md mt-1 font-bold">
            មានសុវត្ថិភាពទាំងស្រុង
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-[10.5px] font-black text-rose-600 uppercase tracking-widest">ត្រូវការថែទាំ (Attention)</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-black text-rose-600">{nonCompliantCount}</span>
            <span className="text-xs text-rose-400 font-bold">គ្រឿង</span>
          </div>
          <span className="inline-block text-[9px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md mt-1 font-bold">
            ខ្វះខាតចំណុចបច្ចេកទេស
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-[10.5px] font-black text-orange-600 uppercase tracking-widest">បញ្ហាសម្ពាធ (Pressure Issues)</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-black text-orange-605">{lowPressureCount}</span>
            <span className="text-xs text-orange-400 font-bold">គ្រឿង</span>
          </div>
          <span className="inline-block text-[9px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md mt-1 font-bold">
            ត្រូវការបញ្ចូលហ្គាស/សារធាតុ
          </span>
        </div>

        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-red-950 to-slate-900 p-4 rounded-2xl text-white shadow-xs">
          <p className="text-[10.5px] font-black text-slate-300 uppercase tracking-widest">សោសុវត្ថិភាពបាត់ (Missing Pins)</p>
          <div className="flex items-baseline gap-0.5 mt-1">
            <span className="text-2xl font-mono font-black text-amber-400">{missingPinsCount}</span>
            <span className="text-[10px] text-slate-300 font-bold ml-1">ករណី</span>
          </div>
          <p className="text-[9.5px] text-red-200 mt-2 font-mono">ត្រូវការបំពាក់ថ្មីភ្លាមៗ</p>
        </div>
      </div>

      {/* Filter and Control Panel card */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm" id="fe-filter-panel">
        
        {/* Dynamic Input Search box */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ស្វែងរក៖ កូដសម្គាល់ ទីតាំង ជាន់ អ្នកពិនិត្យ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/25 focus:border-rose-600 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              សម្អាត
            </button>
          )}
        </div>

        {/* Tab statuses filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-extrabold">លទ្ធផលត្រួតពិនិត្យ (Report Outcome):</span>
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              statusFilter === 'All'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'bg-slate-50 text-slate-605 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ទាំងអស់ ({totalInvoiced})
          </button>
          
          <button
            onClick={() => setStatusFilter('Usable')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              statusFilter === 'Usable'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-50 text-emerald-800 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ប្រើបានធម្មតា ({compliantCount})
          </button>

          <button
            onClick={() => setStatusFilter('NeedsAttention')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              statusFilter === 'NeedsAttention'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-50 text-rose-850 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            មិនទាន់គ្រប់លក្ខណៈ ({nonCompliantCount})
          </button>
        </div>

        {/* Extinguisher Typology quick filter drop-down */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-extrabold shrink-0">ប្រភេទសារធាតុ៖</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="All">បង្ហាញទាំងអស់</option>
            <option value="Dry Chemical">Dry Chemical (ម្សៅស្ងួត)</option>
            <option value="CO2">CO2 (កាបូនឌីអុកស៊ីត)</option>
            <option value="Foam">Foam (ហ្វូម)</option>
            <option value="Water">Water (ទឹក)</option>
          </select>
        </div>
      </div>

      {/* Grid of Extinguisher Records of WIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredList.length === 0 ? (
          <div className="col-span-2 bg-white border border-slate-200 py-12 rounded-2xl text-center">
            <div className="max-w-xs mx-auto flex flex-col items-center">
              <Flame className="w-12 h-12 text-slate-200 animate-pulse mb-2" />
              <p className="text-xs text-slate-500 font-bold">រកមិនឃើញកំណត់ត្រាត្រួតពិនិត្យស្របនឹងលក្ខខណ្ឌចម្រោះទេ</p>
            </div>
          </div>
        ) : (
          filteredList.map((item) => {
            const checklistPassedCount = [
              item.isInPlace, item.hasClearSign, item.isPressureOk, item.isPinPresent,
              item.isSealIntact, item.isNoCorrosion, item.isNozzleClean, item.isNotExpired,
              item.isInstructionClear, item.isUsable
            ].filter(Boolean).length;

            return (
              <div 
                key={item.id} 
                className="bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border-slate-200"
                id={`card-${item.id}`}
              >
                {/* Ribbon status indicator top bar */}
                <div className={`p-4 py-3 border-b flex justify-between items-center ${
                  item.isUsable 
                    ? 'bg-emerald-50/75 border-emerald-100 text-emerald-950'
                    : 'bg-rose-50/75 border-rose-100 text-rose-950'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.isUsable ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`} />
                    <span className="font-mono font-bold text-slate-900 bg-white border px-2 py-0.5 rounded-lg text-[10.5px]">
                      {item.id}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      | {item.buildingFloor}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-black tracking-wide ${
                    item.isUsable 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-250'
                      : 'bg-rose-100 text-rose-800 border-rose-250'
                  }`}>
                    {item.isUsable ? 'អាចប្រើប្រាស់បាន' : 'ផ្អាក / ត្រូវការបញ្ចូលសារធាតុ'}
                  </span>
                </div>

                {/* Card Content body */}
                <div className="p-5 space-y-4 flex-1">
                  
                  {/* General Info list */}
                  <div className="flex items-start justify-between gap-2 border-b border-dashed border-slate-100 pb-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 mt-0.5">
                        {item.type} ({item.capacity})
                      </h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>ទីតាំង៖ {item.location}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ថ្ងៃត្រួតពិនិត្យ</p>
                      <p className="text-[11px] font-mono font-bold text-slate-700 mt-0.5 flex items-center gap-1 justify-end">
                        <Calendar className="w-3 h-3" />
                        {item.inspectionDate}
                      </p>
                    </div>
                  </div>

                  {/* Checklist Summary Tracker Indicator */}
                  <div>
                    <div className="flex justify-between items-center text-[10.5px] font-extrabold text-slate-500 mb-1.5">
                      <span>ពិន្ទុត្រួតពិនិត្យ (Inspected Checkpoints):</span>
                      <span className={checklistPassedCount === 10 ? 'text-emerald-700' : 'text-amber-700'}>
                        {checklistPassedCount} / 10 ចំណុចត្រឹមត្រូវ
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { label: 'ទីតាំង', pass: item.isInPlace },
                        { label: 'ស្លាក', pass: item.hasClearSign },
                        { label: 'សម្ពាធ', pass: item.isPressureOk },
                        { label: 'សោសុវត្ថិ', pass: item.isPinPresent },
                        { label: 'ខ្សែសោ', pass: item.isSealIntact },
                        { label: 'គ្មានច្រេះ', pass: item.isNoCorrosion },
                        { label: 'ទុយោ', pass: item.isNozzleClean },
                        { label: 'មិនហួស', pass: item.isNotExpired },
                        { label: 'ណែនាំ', pass: item.isInstructionClear },
                        { label: 'ប្រើប្រាស់', pass: item.isUsable }
                      ].map((chk, i) => (
                        <div 
                          key={i} 
                          title={`${chk.label}៖ ${chk.pass ? 'ត្រឹមត្រូវ / Regular' : 'មានបញ្ហា / Issue'}`}
                          className={`p-1.5 rounded-lg border text-[9.5px] font-bold text-center transition duration-150 ${
                            chk.pass 
                              ? 'bg-emerald-50/40 border-emerald-100 text-emerald-800' 
                              : 'bg-rose-50/40 border-rose-100 text-rose-700 line-through'
                          }`}
                        >
                          {chk.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Non-conforming actions panel */}
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-[11px] space-y-1 text-slate-705">
                    <p className="font-extrabold text-slate-800 mb-1 flex items-center gap-1 border-b border-slate-200 pb-1">
                      <Wrench className="w-3.5 h-3.5 text-slate-500" />
                      <span>សកម្មភាពជួសជុល / ផ្លាស់ប្តូរ (Corrective Actions):</span>
                    </p>
                    <p className="line-clamp-1"><strong className="text-slate-500">ត្រូវការជួសជុល៖</strong> <span className={item.needsRepair !== 'គ្មាន (None)' && item.needsRepair !== 'គ្មានការជួសជុលទេ (No Repair Required)' ? 'text-amber-700 font-extrabold':'text-slate-650'}>{item.needsRepair}</span></p>
                    <p className="line-clamp-1"><strong className="text-slate-500">ត្រូវការបញ្ចូលសារធាតុ៖</strong> <span className={item.needsRefill !== 'គ្មាន (None)' && item.needsRefill !== 'គ្មានការបញ្ចូលសារធាតុទេ (Refill Level OK)' ? 'text-orange-700 font-extrabold':'text-slate-650'}>{item.needsRefill}</span></p>
                    <p className="line-clamp-1"><strong className="text-slate-500">ត្រូវការផ្លាស់ប្តូរ៖</strong> <span className={item.needsReplacement !== 'គ្មាន (None)' && item.needsReplacement !== 'គ្មានការផ្លាស់ប្តូរទេ (Good Condition)' ? 'text-rose-750 font-extrabold':'text-slate-650'}>{item.needsReplacement}</span></p>
                  </div>

                  {/* Inspector sign details */}
                  <div className="flex border-t border-slate-100 pt-2 text-[10px] text-slate-400 justify-between items-center">
                    <span>អ្នកត្រួតពិនិត្យ៖ <strong className="text-slate-700 font-semibold">{item.inspectorName}</strong></span>
                    <span>ប្រធានផ្នែក៖ <strong className="text-slate-700 font-semibold">{item.deptHeadSignature}</strong></span>
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="p-3 bg-slate-50 border-t border-slate-150 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => setViewingItem(item)}
                    title="មើលកំណត់ត្រាលម្អិត / បោះពុម្ព (View Inspector Sheet)"
                    className="p-1.5 px-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 transition text-[11px] font-black cursor-pointer inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>មើលលម្អិត</span>
                  </button>

                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 px-2.5 rounded-lg bg-slate-100 border border-slate-205 text-slate-700 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition text-[11px] font-black cursor-pointer inline-flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>កែទិន្នន័យ</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteInspection(item.id)}
                    className="p-1.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-550 hover:text-white rounded-lg transition text-[11px] font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View Only Inspection form placar sheets modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header style */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-rose-500">
                <Flame className="w-5.5 h-5.5 text-rose-500" />
                <div>
                  <h3 className="font-moul text-sm md:text-base text-white tracking-normal leading-relaxed">
                    របាយការណ៍ត្រួតពិនិត្យឧបករណ៍ពន្លត់អគ្គិភ័យសាលា
                  </h3>
                  <p className="text-[11px] text-slate-300 font-bold mt-0.5">ប័ណ្ណសម្គាល់បំពង់៖ {viewingItem.id} • {viewingItem.buildingFloor}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingItem(null)}
                className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Document Content */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-xs text-slate-700">
              
              {/* Official Document Banner Top Header */}
              <div className="text-center space-y-1 pb-4 border-b border-slate-250">
                <h4 className="font-moul text-xs text-slate-900 uppercase">ព្រះរាជាណាចក្រកម្ពុជា</h4>
                <p className="font-bold text-[10.5px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <div className="h-0.5 w-16 bg-slate-900 mx-auto mt-1" />
                <p className="font-moul text-xs text-slate-800 mt-3">សាលាអន្តរជាតិ វេស្ទើន (WESTERN INTERNATIONAL SCHOOL)</p>
                <p className="text-[10px] text-slate-400 font-bold">សាខាចំការដូង (Chamkar Doung Branch)</p>
              </div>

              {/* SECTION 1: General Info */}
              <div className="space-y-3">
                <h5 className="font-extrabold text-[12px] text-indigo-950 font-moul tracking-normal border-l-4 border-indigo-900 pl-2">
                  ១. ព័ត៌មានទូទៅបំពង់អគ្គិភ័យ (Extinguisher Specifications)
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="space-y-2 text-[11px]">
                    <p><span className="text-slate-400 font-bold">លេខសម្គាល់បំពង់ (Extinguisher ID)៖</span> <strong className="text-slate-900 font-mono">{viewingItem.id}</strong></p>
                    <p><span className="text-slate-400 font-bold">ប្រភេទបំពង់ (Type)៖</span> <strong className="text-slate-900 font-semibold">{viewingItem.type}</strong></p>
                    <p><span className="text-slate-400 font-bold">ទំហំធុង / Capacity៖</span> <strong className="text-slate-900 font-mono">{viewingItem.capacity}</strong></p>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <p><span className="text-slate-400 font-bold">ទីតាំងដំឡើង (Location)៖</span> <strong className="text-slate-900">{viewingItem.location}</strong></p>
                    <p><span className="text-slate-400 font-bold">អគារ / ជាន់ (Building/Floor)៖</span> <strong className="text-indigo-950">{viewingItem.buildingFloor}</strong></p>
                    <p><span className="text-slate-400 font-bold">ថ្ងៃត្រួតពិនិត្យ (Inspection Date)៖</span> <strong className="text-slate-900 font-mono">{viewingItem.inspectionDate}</strong></p>
                    <p><span className="text-slate-400 font-bold">អ្នកត្រួតពិនិត្យ (Inspector)៖</span> <strong className="text-slate-900 font-semi">{viewingItem.inspectorName}</strong></p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: 10 Checkpoint indicators representing Khmer & English mapping */}
              <div className="space-y-3">
                <h5 className="font-extrabold text-[12px] text-indigo-950 font-moul tracking-normal border-l-4 border-indigo-900 pl-2">
                  ២. ចំណុចត្រួតពិនិត្យបច្ចេកទេស (Inspector Checklist)
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 bg-white border border-slate-150 p-4 rounded-xl">
                  {[
                    { label: 'បំពង់ស្ថិតនៅទីតាំងត្រឹមត្រូវ', english: 'Extinguisher in designated place', pass: viewingItem.isInPlace },
                    { label: 'មានស្លាកសម្គាល់ច្បាស់លាស់', english: 'Clear safety signages & labels', pass: viewingItem.hasClearSign },
                    { label: 'សម្ពាធស្ថិតក្នុងកម្រិតស្តង់ដារ', english: 'Pressure gauge indicator in standard green zone', pass: viewingItem.isPressureOk },
                    { label: 'សោសុវត្ថិភាព (Safety Pin) នៅគ្រប់គ្រាន់', english: 'Safety Pin cleanly present and secured', pass: viewingItem.isPinPresent },
                    { label: 'ខ្សែសោមិនខូច', english: 'Safety plastic lock/seal intact', pass: viewingItem.isSealIntact },
                    { label: 'បំពង់មិនច្រេះ ឬបែកបាក់', english: 'No corrosion, rust, or physical dents on vessel', pass: viewingItem.isNoCorrosion },
                    { label: 'ទុយោ / Nozzle មិនស្ទះ', english: 'Nozzle/hose clean and free of blockage', pass: viewingItem.isNozzleClean },
                    { label: 'ថ្ងៃផុតកំណត់មិនហួស', english: 'Expiry service date not exceeded', pass: viewingItem.isNotExpired },
                    { label: 'ស្លាកណែនាំប្រើប្រាស់នៅច្បាស់', english: 'Operating manuals clearly readable', pass: viewingItem.isInstructionClear },
                    { label: 'អាចប្រើប្រាស់បានធម្មតា', english: 'Overall fully active / ready for deployment', pass: viewingItem.isUsable }
                  ].map((chk, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-b-0">
                      <div>
                        <p className="font-bold text-slate-800">{chk.label}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{chk.english}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-[9.5px] font-black tracking-wider ${
                        chk.pass 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-250' 
                          : 'bg-rose-50 text-rose-850 border border-rose-250'
                      }`}>
                        {chk.pass ? '✔ ត្រឹមត្រូវ' : '✘ ខ្វះខាត / មានបញ្ហា'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: Action remarks */}
              <div className="space-y-3">
                <h5 className="font-extrabold text-[12px] text-indigo-950 font-moul tracking-normal border-l-4 border-indigo-900 pl-2">
                  ៣. សកម្មភាពជួសជុល / ផ្លាស់ប្តូរ (Corrective Actions Record)
                </h5>
                <div className="bg-slate-50 border border-slate-201 p-4 rounded-xl space-y-2.5 text-[11px] text-slate-705">
                  <div className="flex items-start gap-1">
                    <span className="font-bold text-slate-500 w-36 shrink-0">ត្រូវការជួសជុល (Needs Repair)៖</span>
                    <span className="text-slate-900 border-b border-dashed border-slate-300 flex-1 pb-0.5">
                      {viewingItem.needsRepair}
                    </span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="font-bold text-slate-500 w-36 shrink-0">ត្រូវការបញ្ចូលសារធាតុ (Needs Refill)៖</span>
                    <span className="text-slate-900 border-b border-dashed border-slate-300 flex-1 pb-0.5">
                      {viewingItem.needsRefill}
                    </span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="font-bold text-slate-500 w-36 shrink-0">ត្រូវការផ្លាស់ប្តូរ (Needs Replace)៖</span>
                    <span className="text-slate-900 border-b border-dashed border-slate-300 flex-1 pb-0.5">
                      {viewingItem.needsReplacement}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Signatures */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h5 className="font-extrabold text-[12px] text-indigo-950 font-moul tracking-normal border-l-4 border-indigo-900 pl-2">
                  ៤. ការបញ្ជាក់ និងហត្ថលេខា (Inspector Endorsements)
                </h5>
                <div className="grid grid-cols-2 gap-8 text-center pt-2">
                  <div className="space-y-8">
                    <div>
                      <p className="font-bold text-slate-700">អ្នកត្រួតពិនិត្យ (Inspector Sig.)</p>
                      <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">Checked with strict oversight</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-indigo-750 font-mono italic underline decoration-rose-500 decoration-wavy py-1 inline-block">
                        {viewingItem.inspectorSignature}
                      </span>
                      <p className="text-[10px] text-slate-500 font-semibold">{viewingItem.inspectorName}</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <p className="font-bold text-slate-700">ប្រធានផ្នែកទទួលខុសត្រូវ (Dept. Head)</p>
                      <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">Acknowledged and Approved</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-slate-800 font-mono italic underline decoration-slate-900 decoration-dashed py-1 inline-block">
                        {viewingItem.deptHeadSignature}
                      </span>
                      <p className="text-[10px] text-slate-500 font-semibold">ប្រធានការិយាល័យរដ្ឋបាល</p>
                    </div>
                  </div>
                </div>

                <div className="text-right text-[10.5px] text-slate-400 font-bold pt-4">
                  កាលបរិច្ឆេទចុះហត្ថលេខា៖ <span className="text-slate-800 font-mono">{viewingItem.signatureDate}</span>
                </div>
              </div>

            </div>

            {/* Print and Close buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              <button
                onClick={() => {
                  window.print();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-905 hover:bg-slate-800 text-slate-800 border rounded-xl text-xs font-extrabold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>បោះពុម្ពឯកសារ (Print Sheet)</span>
              </button>
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer"
              >
                បិទផ្ទាំង (Close Window)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add & Edit Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="bg-gradient-to-r from-rose-700 to-red-800 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Flame className="w-5.5 h-5.5 text-amber-400 fill-amber-400/10" />
                <h3 className="font-moul text-xs md:text-sm text-white tracking-normal leading-relaxed">
                  {editingItem ? 'កែប្រែទម្រង់ត្រួតពិនិត្យបំពង់អគ្គិភ័យ' : 'បញ្ចូលទម្រង់ត្រួតពិនិត្យបំពង់អគ្គិភ័យថ្មី'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white transition cursor-pointer p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Area */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-xs text-slate-700">
              
              {/* SECTION 1: General Specs fields */}
              <div className="space-y-4">
                <div className="flex items-center gap-1 border-b pb-1">
                  <span className="w-2 h-4 bg-rose-600 rounded-full inline-block" />
                  <h4 className="font-moul text-slate-800 text-xs">១. ព័ត៌មានទូទៅបំពង់អគ្គិភ័យ (General Info Specs)</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* ID */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500">លេខសម្គាល់បំពង់ (Extinguisher ID) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. WIS-FE-005"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-850 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  {/* Type drop-down selection */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500">ប្រភេទបំពង់ពន្លត់អគ្គិភ័យ <span className="text-red-500">*</span></label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-850 focus:outline-hidden"
                    >
                      {EXT_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Size capacity */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500">ទំហំ / Capacity <span className="text-red-500">*</span></label>
                    <select
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-850 focus:outline-hidden"
                    >
                      {CAPACITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location spec */}
                  <div className="col-span-1 md:col-span-2 space-y-1">
                    <label className="font-extrabold text-slate-500">ទីតាំងដំឡើងដាក់បំពង់ (Location Location Location) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. ក្បែរជណ្តើរយន្តជាន់ទី១, បន្ទប់ពិសោធន៍កុំព្យូទ័រ..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-medium text-slate-850 focus:outline-hidden"
                    />
                  </div>

                  {/* Building & Floor selection */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500">អគារ / ជាន់ (Building / Floor) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="ឧ. អគារ A - ជាន់ទី ១"
                      value={buildingFloor}
                      onChange={(e) => setBuildingFloor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-medium text-slate-850 focus:outline-hidden"
                    />
                  </div>

                  {/* Inspection Date */}
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500">កាលបរិច្ឆេទត្រួតពិនិត្យ (Inspection Date) <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      required
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-850 focus:outline-hidden"
                    />
                  </div>

                  {/* Inspector Name */}
                  <div className="col-span-1 md:col-span-2 space-y-1">
                    <label className="font-extrabold text-slate-500">អ្នកត្រួតពិនិត្យ (Inspector Name) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="ឈ្មោះអ្នកត្រួតពិនិត្យ..."
                      value={inspectorName}
                      onChange={(e) => setInspectorName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: 10 checklist point checkboxes */}
              <div className="space-y-4">
                <div className="flex items-center gap-1 border-b pb-1">
                  <span className="w-2 h-4 bg-orange-500 rounded-full inline-block" />
                  <h4 className="font-moul text-slate-800 text-xs">២. ចំណុចត្រួតពិនិត្យរាងកាយ និងបច្ចេកទេស (Safety Checkpoints - 10 Items)</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
                  
                  {/* Checklist 1 */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isInPlace}
                      onChange={(e) => setIsInPlace(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4.5 h-4.5 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-855 text-[11.5px]">បំពង់ស្ថិតនៅទីតាំងត្រឹមត្រូវ</p>
                      <p className="text-[10px] text-slate-400">Extinguisher is hanging/mounted in designate place</p>
                    </div>
                  </label>

                  {/* Checklist 2 */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasClearSign}
                      onChange={(e) => setHasClearSign(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4.5 h-4.5 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-855 text-[11.5px]">មានស្លាកសម្គាល់ច្បាស់លាស់</p>
                      <p className="text-[10px] text-slate-400">Clear fire protection safety signage is present</p>
                    </div>
                  </label>

                  {/* Checklist 3 */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPressureOk}
                      onChange={(e) => setIsPressureOk(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4.5 h-4.5 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-855 text-[11.5px]">សម្ពាធស្ថិតក្នុងកម្រិតស្តង់ដារ</p>
                      <p className="text-[10px] text-slate-400">Pressure needle points safely in regular green zone</p>
                    </div>
                  </label>

                  {/* Checklist 4 */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPinPresent}
                      onChange={(e) => setIsPinPresent(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4.5 h-4.5 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-855 text-[11.5px]">សោសុវត្ថិភាព (Safety Pin) នៅគ្រប់គ្រាន់</p>
                      <p className="text-[10px] text-slate-400">Metallic pull ring safety pin correctly inserted</p>
                    </div>
                  </label>

                  {/* Checklist 5 */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isSealIntact}
                      onChange={(e) => setIsSealIntact(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4.5 h-4.5 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-855 text-[11.5px]">ខ្សែសោមិនខូច</p>
                      <p className="text-[10px] text-slate-400">Plastic tamper-evidence seal is unbroken of tie</p>
                    </div>
                  </label>

                  {/* Checklist 6 */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isNoCorrosion}
                      onChange={(e) => setIsNoCorrosion(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4.5 h-4.5 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-855 text-[11.5px]">បំពង់មិនច្រេះ ឬបែកបាក់</p>
                      <p className="text-[10px] text-slate-400">Vessel cylinder body is free of heavy rust or dents</p>
                    </div>
                  </label>

                  {/* Checklist 7 */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isNozzleClean}
                      onChange={(e) => setIsNozzleClean(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4.5 h-4.5 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-855 text-[11.5px]">ទុយោ / Nozzle មិនស្ទះ</p>
                      <p className="text-[10px] text-slate-400">Extinguishing nozzle/discharge hose has no obstruction</p>
                    </div>
                  </label>

                  {/* Checklist 8 */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isNotExpired}
                      onChange={(e) => setIsNotExpired(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4.5 h-4.5 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-855 text-[11.5px]">ថ្ងៃផុតកំណត់មិនហួស</p>
                      <p className="text-[10px] text-slate-400">The maintenance tag test date is current/not expired</p>
                    </div>
                  </label>

                  {/* Checklist 9 */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isInstructionClear}
                      onChange={(e) => setIsInstructionClear(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4.5 h-4.5 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-855 text-[11.5px]">ស្លាកណែនាំប្រើប្រាស់នៅច្បាស់</p>
                      <p className="text-[10px] text-slate-400">Operating manual stickers are cleanly legible</p>
                    </div>
                  </label>

                  {/* Checklist 10 */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isUsable}
                      onChange={(e) => setIsUsable(e.target.checked)}
                      className="rounded text-rose-605 focus:ring-rose-550 w-4.5 h-4.5 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-855 text-[11.5px] uppercase text-red-700">អាចប្រើប្រាស់បានធម្មតា (FULLY OPERATIONAL)</p>
                      <p className="text-[10px] text-slate-400">Can be deployed instantly in case of thermal emergency</p>
                    </div>
                  </label>

                </div>
              </div>

              {/* SECTION 3: Action text fields mapping */}
              <div className="space-y-4">
                <div className="flex items-center gap-1 border-b pb-1">
                  <span className="w-2 h-4 bg-yellow-500 rounded-full inline-block" />
                  <h4 className="font-moul text-slate-800 text-xs">៣. សកម្មភាពជួសជុល / ផ្លាស់ប្តូរ (Corrective Action Inputs)</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Repair needs */}
                  <div className="space-y-1">
                    <label className="font-black text-slate-500">ត្រូវការជួសជុល (Needs Repairs)</label>
                    <input
                      type="text"
                      placeholder="ឧ. គ្មាន, ឬ ប្តូរបណ្តោងសោថ្មី..."
                      value={needsRepair}
                      onChange={(e) => setNeedsRepair(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-850 focus:outline-hidden"
                    />
                  </div>

                  {/* Refill needs */}
                  <div className="space-y-1">
                    <label className="font-black text-slate-500">ត្រូវការបញ្ចូលសារធាតុឡើងវិញ (Needs Refill)</label>
                    <input
                      type="text"
                      placeholder="ឧ. គ្មាន, ឬ បញ្ចូលហ្គាស CO2 ឡើងវិញ..."
                      value={needsRefill}
                      onChange={(e) => setNeedsRefill(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-850 focus:outline-hidden"
                    />
                  </div>

                  {/* Replacement needs */}
                  <div className="space-y-1">
                    <label className="font-black text-slate-500">ត្រូវការផ្លាស់ប្តូរ (Needs Replacement)</label>
                    <input
                      type="text"
                      placeholder="ឧ. គ្មាន, ឬ បិទស្លាកណែនាំថ្មី..."
                      value={needsReplacement}
                      onChange={(e) => setNeedsReplacement(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold text-slate-850 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Signatures */}
              <div className="space-y-4">
                <div className="flex items-center gap-1 border-b pb-1">
                  <span className="w-2 h-4 bg-teal-500 rounded-full inline-block" />
                  <h4 className="font-moul text-slate-800 text-xs">៤. ហត្ថលេខា និងសក្ខីភាព (Inspector Verification Sign-Off)</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Inspector Signature */}
                  <div className="space-y-1">
                    <label className="font-black text-slate-500">អ្នកត្រួតពិនិត្យ (Inspector Sig.)</label>
                    <input
                      type="text"
                      placeholder="ហត្ថលេខា/ឈ្មោះអ្នកត្រួតពិនិត្យ..."
                      value={inspectorSignature}
                      onChange={(e) => setInspectorSignature(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-850 focus:outline-hidden"
                    />
                  </div>

                  {/* Dept Head signature */}
                  <div className="space-y-1">
                    <label className="font-black text-slate-500">ប្រធានផ្នែក (Dept. Head Sig.)</label>
                    <input
                      type="text"
                      placeholder="ហត្ថលេខា/ឈ្មោះប្រធានផ្នែក..."
                      value={deptHeadSignature}
                      onChange={(e) => setDeptHeadSignature(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-850 focus:outline-hidden"
                    />
                  </div>

                  {/* Signature Date */}
                  <div className="space-y-1">
                    <label className="font-black text-slate-500">កាលបរិច្ឆេទ (Signature Date)</label>
                    <input
                      type="date"
                      value={signatureDate}
                      onChange={(e) => setSignatureDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-850 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

            </form>

            {/* Modal Bottom buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 hover:bg-slate-205 border text-slate-500 text-xs font-bold rounded-xl cursor-pointer"
              >
                លុបចោល
              </button>
              
              <button
                onClick={handleFormSubmit}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>កត់ត្រា និងរក្សាទុក (Save Record)</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
