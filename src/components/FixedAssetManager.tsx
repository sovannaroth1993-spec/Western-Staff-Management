/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Laptop, Monitor, Tv, Camera, Box, Search, PlusCircle, Edit2, Trash2, 
  X, Check, AlertTriangle, Download, Info, FileText, BarChart3, HardDrive, RefreshCw
} from 'lucide-react';
import { FixedAsset, AssetCategory, AssetStatus, ASSET_CATEGORIES_KM, ASSET_STATUSES_KM } from '../types';

// Default mock assets to make the UI look spectacular right out of the box
const DEFAULT_ASSETS: FixedAsset[] = [
  {
    id: 'WIS-AST-001',
    name: 'iMac 24" M3 4.5K Retina Display',
    category: 'Computer',
    brand: 'Apple',
    model: 'iMac 24-inch (M3, 2024)',
    serialNumber: 'C02H20WMLQ1G',
    location: 'ការិយាល័យរដ្ឋបាល & ទទួលភ្ញៀវ',
    assignedTo: 'LOUNG Veasna',
    status: 'Operational',
    purchaseDate: '2025-01-10',
    costUsd: 1499,
    notes: 'សម្រាប់ការងារបុគ្គលិកទទួលភ្ញៀវខាងមុខ (Front Desk admin)'
  },
  {
    id: 'WIS-AST-002',
    name: 'Dell Optiplex 7010 Tower Business PC',
    category: 'Computer',
    brand: 'Dell',
    model: 'Optiplex 7010 Micro',
    serialNumber: '7XDYH43',
    location: 'បន្ទប់ពិសោធន៍កុំព្យូទ័រ (IT Lab)',
    assignedTo: 'Sok Vichea',
    status: 'Operational',
    purchaseDate: '2024-09-15',
    costUsd: 750,
    notes: 'កុំព្យូទ័រសម្រាប់សិស្សរៀនកម្មវិធីបណ្តុះបណ្តាល (IT Unit 1)'
  },
  {
    id: 'WIS-AST-003',
    name: 'ThinkPad T14 Gen 4 High Performance',
    category: 'Laptop',
    brand: 'Lenovo',
    model: 'ThinkPad T14 Gen 4 (AMD)',
    serialNumber: 'PF3X8W9A',
    location: 'បន្ទប់ប្រជុំបុគ្គលិក & គ្រូបង្រៀន',
    assignedTo: 'Nouth Sreypov',
    status: 'Operational',
    purchaseDate: '2024-11-05',
    costUsd: 1150,
    notes: 'ឡេបថបសម្រាប់គ្រូប្រើប្រាស់គម្រោងបង្រៀន និងរៀបចំ Slide'
  },
  {
    id: 'WIS-AST-004',
    name: 'Epson EX-5280 Pro LCD Projector',
    category: 'Projector',
    brand: 'Epson',
    model: 'EX-5280 3800-Lumen',
    serialNumber: 'K65Y830421',
    location: 'ថ្នាក់រៀនជាន់ទី១ (Room 101)',
    assignedTo: 'Chan Thida',
    status: 'Operational',
    purchaseDate: '2024-08-20',
    costUsd: 649,
    notes: 'ម៉ាស៊ីនបញ្ចាំងស្លាយសម្រាប់ថ្នាក់ភាសាអង់គ្លេសទូទៅ'
  },
  {
    id: 'WIS-AST-005',
    name: 'Canon EOS 90D Production Camera',
    category: 'Camera',
    brand: 'Canon',
    model: 'EOS 90D EF-S 18-135mm IS USM',
    serialNumber: '3208230018',
    location: 'ការិយាល័យរដ្ឋបាល (PR Dept)',
    assignedTo: 'Khorn Sreyleak',
    status: 'Operational',
    purchaseDate: '2025-02-18',
    costUsd: 1290,
    notes: 'កាមេរ៉ាអាជីពសម្រាប់ថតរូបភាពសកម្មភាពប្រចាំថ្ងៃរបស់សាលា'
  },
  {
    id: 'WIS-AST-006',
    name: 'LG Smart TV UHD 65" Public Board',
    category: 'TV',
    brand: 'LG',
    model: '65UR9000 UR-Class LCD',
    serialNumber: 'LG65UR9000_9281',
    location: 'ច្រកចូលសាលាធំ (Lobby PR)',
    assignedTo: 'LOUNG Veasna',
    status: 'Operational',
    purchaseDate: '2024-10-01',
    costUsd: 599,
    notes: 'សម្រាប់ចាក់វីដេអូបណ្តុះបណ្តាលសកម្មភាពសិស្ស និងស្វាគមន៍មាតាបិតា'
  },
  {
    id: 'WIS-AST-007',
    name: 'Epson EX-5280 Pro LCD Projector',
    category: 'Projector',
    brand: 'Epson',
    model: 'EX-5280 3800-Lumen',
    serialNumber: 'K65Y830999',
    location: 'ថ្នាក់រៀនជាន់ទី២ (Room 201)',
    assignedTo: 'Heng Samnang',
    status: 'Maintenance',
    purchaseDate: '2024-08-20',
    costUsd: 649,
    notes: 'ម៉ាស៊ីនបញ្ចាំងមានបញ្ហារូបភាពរអិល កំពុងរង់ចាំជាងបច្ចេកទេសផ្លាស់ប្ដូរអំពូល'
  },
  {
    id: 'WIS-AST-008',
    name: 'Sony Handycam Video Recorder',
    category: 'Camera',
    brand: 'Sony',
    model: 'FDR-AX43A 4K Handycam',
    serialNumber: 'S01-4920211-B',
    location: 'ការិយាល័យរដ្ឋបាល (Media Center)',
    assignedTo: 'Chhoun Piseth',
    status: 'Broken',
    purchaseDate: '2024-05-10',
    costUsd: 899,
    notes: 'ខូចបន្ទះសៀគ្វីមេកានិច និងប្រព័ន្ធ Sensor មិនដំណើរការ'
  }
];

export default function FixedAssetManager() {
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<AssetStatus | 'All'>('All');
  
  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'info' } | null>(null);

  // Edit / Created Modal management states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<FixedAsset | null>(null);

  // Form states
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<AssetCategory>('Computer');
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formSerialNumber, setFormSerialNumber] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState('');
  const [formStatus, setFormStatus] = useState<AssetStatus>('Operational');
  const [formPurchaseDate, setFormPurchaseDate] = useState('');
  const [formCostUsd, setFormCostUsd] = useState(0);
  const [formNotes, setFormNotes] = useState('');

  // Initial Data Load
  useEffect(() => {
    try {
      const savedAssets = localStorage.getItem('wis_fixed_assets');
      if (savedAssets) {
        setAssets(JSON.parse(savedAssets));
      } else {
        setAssets(DEFAULT_ASSETS);
        localStorage.setItem('wis_fixed_assets', JSON.stringify(DEFAULT_ASSETS));
      }
    } catch (err) {
      console.error('Failed to parse assets', err);
      setAssets(DEFAULT_ASSETS);
    }
  }, []);

  // Helper trigger to save state instantly (รាល់ការបញ្ចូលព័ត៌មានទាំងអស់ត្រូវបានកត់ត្រាជាប់ Auto)
  const saveAndSyncState = (updatedAssets: FixedAsset[]) => {
    setAssets(updatedAssets);
    localStorage.setItem('wis_fixed_assets', JSON.stringify(updatedAssets));
  };

  const showToastMsg = (msg: string, type: 'success' | 'danger' | 'info') => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Open modal helper
  const openAddAssetModal = () => {
    setEditingAsset(null);
    // Auto increment default Asset ID style
    const nextSeqNum = assets.length > 0 
      ? Math.max(...assets.map(a => {
          const match = a.id.match(/\d+$/);
          return match ? parseInt(match[0]) : 0;
        })) + 1 
      : 1;
    const formatSeq = String(nextSeqNum).padStart(3, '0');
    
    setFormId(`WIS-AST-${formatSeq}`);
    setFormName('');
    setFormCategory('Computer');
    setFormBrand('');
    setFormModel('');
    setFormSerialNumber('');
    setFormLocation('');
    setFormAssignedTo('');
    setFormStatus('Operational');
    setFormPurchaseDate(new Date().toISOString().split('T')[0]);
    setFormCostUsd(100);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditAssetModal = (asset: FixedAsset) => {
    setEditingAsset(asset);
    setFormId(asset.id);
    setFormName(asset.name);
    setFormCategory(asset.category);
    setFormBrand(asset.brand);
    setFormModel(asset.model);
    setFormSerialNumber(asset.serialNumber);
    setFormLocation(asset.location);
    setFormAssignedTo(asset.assignedTo);
    setFormStatus(asset.status);
    setFormPurchaseDate(asset.purchaseDate || new Date().toISOString().split('T')[0]);
    setFormCostUsd(asset.costUsd || 0);
    setFormNotes(asset.notes || '');
    setIsModalOpen(true);
  };

  // Handle Form Submission with instant auto save
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formId.trim() || !formName.trim() || !formBrand.trim()) {
      showToastMsg('សូមបំពេញព័ត៌មានសំខាន់ៗឱ្យបានគ្រប់ជ្រុងជ្រោយ (Please fill all core fields).', 'danger');
      return;
    }

    const payload: FixedAsset = {
      id: formId.toUpperCase().trim(),
      name: formName.trim(),
      category: formCategory,
      brand: formBrand.trim(),
      model: formModel.trim() || 'N/A',
      serialNumber: formSerialNumber.trim() || 'N/A',
      location: formLocation.trim() || 'N/A',
      assignedTo: formAssignedTo.trim() || 'N/A',
      status: formStatus,
      purchaseDate: formPurchaseDate || new Date().toISOString().split('T')[0],
      costUsd: Number(formCostUsd) || 0,
      notes: formNotes.trim()
    };

    if (editingAsset) {
      // Edit Mode
      const updated = assets.map(a => a.id === editingAsset.id ? payload : a);
      saveAndSyncState(updated);
      showToastMsg(`ព័ត៌មានឧបករណ៍កូដ [${payload.id}] ត្រូវបានកែប្រែត្រឡប់មកវិញដោយជោគជ័យ និងរក្សាទុក Auto!`, 'success');
    } else {
      // Create Mode
      // Check duplicate ID
      const exists = assets.some(a => a.id.toLowerCase() === payload.id.toLowerCase());
      if (exists) {
        showToastMsg(`កូដសម្គាល់ឧបករណ៍ "${payload.id}" នេះមានរួចរាល់ហើយក្នុងប្រព័ន្ធ។ សូមប្តូរថ្មី!`, 'danger');
        return;
      }
      const updated = [payload, ...assets];
      saveAndSyncState(updated);
      showToastMsg(`បានបន្ថែមឧបករណ៍ថ្មី [${payload.id}] ទៅក្នុងបញ្ជីជោគជ័យ និងបានកត់ត្រាទុកជាប់ Auto!`, 'success');
    }

    setIsModalOpen(false);
  };

  // Remove single asset
  const handleRemoveAsset = (assetId: string) => {
    const isConfirmed = window.confirm(`តើលោកអ្នកពិតជាចង់លុបឧបករណ៍កូដ [${assetId}] នេះចេញពីប្រព័ន្ធមែនទេ?\nការលុបនឹងត្រូវបានកត់ត្រាស្វ័យប្រវត្តិ!`);
    if (!isConfirmed) return;

    const remaining = assets.filter(a => a.id !== assetId);
    saveAndSyncState(remaining);
    showToastMsg(`បានលុបឧបករណ៍កូដ [${assetId}] រួចរាល់ដោយជោគជ័យ និងធ្វើបច្ចុប្បន្នភាព Auto!`, 'info');
  };

  // Hard Reset Data with fallback values
  const handleResetToDefaults = () => {
    const isConfirmed = window.confirm('តើលោកអ្នកចង់លុបចោលទិន្នន័យចាស់ទាំងអស់ ហើយកែប្រែទៅទិន្នន័យគំរូដើមរបស់សាលាវិញមែនទេ?');
    if (!isConfirmed) return;

    saveAndSyncState(DEFAULT_ASSETS);
    showToastMsg('បានផ្លាស់ប្ដូរទិន្នន័យឧបករណ៍មកទម្រង់លំនាំដើមរបស់សាលាវិញរួចរាល់!', 'success');
  };

  // Get statistics calculation
  const totalAssetsNum = assets.length;
  const operationalNum = assets.filter(a => a.status === 'Operational').length;
  const maintenanceNum = assets.filter(a => a.status === 'Maintenance').length;
  const brokenNum = assets.filter(a => a.status === 'Broken').length;
  const totalValueUsd = assets.reduce((sum, a) => sum + (Number(a.costUsd) || 0), 0);

  // Filtered Assets list
  const filteredAssetsList = assets.filter(item => {
    const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
    const statusMatch = selectedStatus === 'All' || item.status === selectedStatus;
    
    const query = searchQuery.toLowerCase().trim();
    const searchMatch = !query || 
      item.id.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.brand.toLowerCase().includes(query) ||
      item.model.toLowerCase().includes(query) ||
      item.serialNumber.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.assignedTo.toLowerCase().includes(query) ||
      (item.notes || '').toLowerCase().includes(query);

    return categoryMatch && statusMatch && searchMatch;
  });

  // Category Icon helper picker
  const renderCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case 'Computer':
        return <Monitor className="w-4.5 h-4.5 text-blue-600" />;
      case 'Laptop':
        return <Laptop className="w-4.5 h-4.5 text-teal-600" />;
      case 'Projector':
        return <FileText className="w-4.5 h-4.5 text-amber-600" />;
      case 'Camera':
        return <Camera className="w-4.5 h-4.5 text-rose-600" />;
      case 'TV':
        return <Tv className="w-4.5 h-4.5 text-purple-600" />;
      default:
        return <Box className="w-4.5 h-4.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Introduction Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-700 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-moul tracking-normal text-slate-900 flex items-center gap-2">
                បញ្ជីគ្រប់គ្រងទ្រព្យសម្បត្តិសាលា (Fixed Asset Tracking System)
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Auto Recorded ✔</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                គ្រប់គ្រង ពិនិត្យ និងតាមដានរាល់សម្ភារៈឧបករណ៍បច្ចេកវិទ្យាទាំងអស់ (កុំព្យូទ័រ ឡេបថប ម៉ាស៊ីនបញ្ចាំង កាមេរ៉ា និងទូរទស្សន៍ស្មាត)។
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleResetToDefaults}
              title="កំណត់ទិន្នន័យលំនាំដើមឡើងវិញ"
              className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs px-3.5 py-2.5 rounded-xl transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>កំណត់ឡើងវិញ</span>
            </button>
            <button
              onClick={openAddAssetModal}
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl transition cursor-pointer shadow-sm shadow-emerald-700/10 select-none"
            >
              <PlusCircle className="w-4.5 h-4.5" />
              <span>បញ្ចូលឧបករណ៍ថ្មី (Add Asset)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Dashboard with Emerald/Indigo Styling */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ឧបករណ៍សរុប (Total)</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-black text-slate-800">{totalAssetsNum}</span>
            <span className="text-xs text-slate-400 font-extrabold font-mono">គ្រឿង</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-1">រាល់សម្ភារៈក្នុងបញ្ជី</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">ដំណើរការល្អ (Operational)</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-black text-emerald-600">{operationalNum}</span>
            <span className="text-xs text-emerald-400 font-extrabold font-mono">គ្រឿង</span>
          </div>
          <span className="inline-block text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded-md mt-1">
            {totalAssetsNum > 0 ? Math.round((operationalNum/totalAssetsNum)*100) : 0}% នៃឧបករណ៍
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">កំពុងថែទាំ (Maintenance)</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-black text-amber-600">{maintenanceNum}</span>
            <span className="text-xs text-amber-400 font-extrabold font-mono">គ្រឿង</span>
          </div>
          <span className="inline-block text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1.5 py-0.5 rounded-md mt-1">
            កំពុងត្រួតពិនិត្យ
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">មិនដំណើរការ (Broken)</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-mono font-black text-rose-600">{brokenNum}</span>
            <span className="text-xs text-rose-400 font-extrabold font-mono">គ្រឿង</span>
          </div>
          <span className="inline-block text-[9px] bg-rose-50 text-rose-700 font-extrabold px-1.5 py-0.5 rounded-md mt-1">
            រង់ចាំការបោះចោល
          </span>
        </div>

        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl text-white shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">តម្លៃសរុប (Asset Cost)</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400">${totalValueUsd.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 font-bold">USD</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 font-mono">គិតជាមធ្យមគ្រប់គ្រឿង</p>
        </div>
      </div>

      {/* Tool Filter Bar and Search Controls */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        
        {/* Search Input Control */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ស្វែងរកតាម៖ កូដសម្គាល់ ឈ្មោះ ម៉ាក ទីតាំង ឬអ្នកកាន់... (Search Assets)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories Dynamic Filters list */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-extrabold pr-1">ប្រភេទ (Category):</span>
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ទាំងអស់ ({totalAssetsNum})
          </button>
          
          {(Object.keys(ASSET_CATEGORIES_KM) as AssetCategory[]).map((cat) => {
            const count = assets.filter(a => a.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {renderCategoryIcon(cat)}
                <span>{cat} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Status Dropdown Quick Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 font-extrabold">ស្ថានភាព (Status):</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-705 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
          >
            <option value="All">បង្ហាញទាំងអស់ (Show All)</option>
            <option value="Operational">ដំណើរការល្អ (Operational)</option>
            <option value="Maintenance">កំពុងជួសជុល (Maintenance)</option>
            <option value="Broken">ខូច/មិនដំណើរការ (Broken)</option>
          </select>
        </div>
      </div>

      {/* Auto Logging Notice Message */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100/80 rounded-2xl px-5 py-3 flex items-center justify-between text-xs text-teal-900">
        <div className="flex items-center gap-2 font-bold text-teal-950">
          <Info className="w-4.5 h-4.5 text-teal-600 shrink-0" />
          <span>រាល់កូនសោបញ្ចូល ព័ត៌មាន កែប្រែ ឬលុបសម្ភារៈឧបករណ៍ នឹងត្រូវបានកត់ត្រាស្វ័យប្រវត្តិ (Saved Auto ✔)</span>
        </div>
        <span className="text-[10px] bg-teal-200/60 font-black text-teal-800 px-2 py-0.5 rounded-full select-none">
          LOCAL SYNC PRE-RUNNING
        </span>
      </div>

      {/* Active Assets Datatable */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black">
                <th className="px-4 py-3.5 text-center w-14 font-mono">№</th>
                <th className="px-4 py-3.5">កូដសម្គាល់ឧបករណ៍ (Asset ID)</th>
                <th className="px-5 py-3.5">ឈ្មោះឧបករណ៍ & ម៉ាក (Asset Details)</th>
                <th className="px-4 py-3.5">ប្រភេទ (Category)</th>
                <th className="px-4 py-3.5">ទីតាំង និងអ្នកកាន់ (Assigned Location)</th>
                <th className="px-4 py-3.5">ការទិញយក (Purchase Details)</th>
                <th className="px-4 py-3.5 text-center">ស្ថានភាព (Status)</th>
                <th className="px-4 py-3.5 text-center w-28">សកម្មភាព (Action)</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssetsList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 font-bold">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <BarChart3 className="w-12 h-12 text-slate-200 animate-pulse mb-3" />
                      <p className="text-xs text-slate-500">គ្មានទិន្នន័យឧបករណ៍ត្រូវបានរកឃើញទេ (No Assets Found)</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('All');
                          setSelectedStatus('All');
                        }}
                        className="mt-3 text-[11px] font-black text-emerald-700 hover:underline cursor-pointer"
                      >
                        សម្អាតតម្រងស្វែងរកឡើងវិញ
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssetsList.map((asset, index) => (
                  <tr 
                    key={asset.id} 
                    className="border-b border-slate-150 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3.5 text-center bg-slate-50/20 text-slate-400 font-mono font-bold select-none">{index + 1}</td>
                    
                    {/* Asset code badge with full double-click select */}
                    <td className="px-4 py-3.5 font-bold text-slate-900 select-all font-mono">
                      <span className="bg-slate-100 border border-slate-200 px-2 py-1 rounded-md text-[11px]">
                        {asset.id}
                      </span>
                    </td>

                    {/* Asset name, brand and serial number details */}
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-extrabold text-slate-800 text-[12.5px] line-clamp-1">{asset.name}</p>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                          ម៉ាក៖ <span className="text-slate-700 font-bold">{asset.brand}</span> • ម៉ូដែល៖ <span className="text-slate-700 font-bold">{asset.model}</span>
                        </p>
                        {asset.serialNumber && asset.serialNumber !== 'N/A' && (
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 select-all">
                            S/N: {asset.serialNumber}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Category Label with decorative background color */}
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg text-slate-700 font-black text-[11px]">
                        {renderCategoryIcon(asset.category)}
                        <span>{ASSET_CATEGORIES_KM[asset.category] ? ASSET_CATEGORIES_KM[asset.category].split(' (')[0] : asset.category}</span>
                      </div>
                    </td>

                    {/* Location and Supervisor */}
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-extrabold text-slate-700">{asset.location}</p>
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                          អ្នកគ្រប់គ្រង៖ <span className="text-emerald-700 font-black">{asset.assignedTo || 'មិនទាន់ចាត់តាំង'}</span>
                        </p>
                      </div>
                    </td>

                    {/* Purchase info */}
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-bold text-slate-800 font-mono text-[11px]">${asset.costUsd?.toLocaleString() || 0} USD</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {asset.purchaseDate || 'N/A'}
                        </p>
                      </div>
                    </td>

                    {/* Status badges */}
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block px-2.5 py-1 text-[10.5px] font-black rounded-lg border ${ASSET_STATUSES_KM[asset.status]?.color || ''}`}>
                        {ASSET_STATUSES_KM[asset.status]?.label || asset.status}
                      </span>
                    </td>

                    {/* Edit Delete action options */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditAssetModal(asset)}
                          className="p-1 px-2.5 rounded-lg bg-slate-130 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>កែប្រែ</span>
                        </button>
                        <button
                          onClick={() => handleRemoveAsset(asset.id)}
                          className="p-1 px-2 text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-500 hover:text-white hover:border-rose-400 rounded-lg transition text-[11px] font-bold cursor-pointer inline-flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table footer paging controls summary */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-slate-400 font-bold text-[11px] gap-2">
          <span>បង្ហាញ {filteredAssetsList.length} ក្នុងចំណោមសរុប {totalAssetsNum} ឧបករណ៍</span>
          <span>សាខាចំការដូង (Western International School System)</span>
        </div>
      </div>

      {/* Modal Dialog for Create and Edit fixed asset */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border text-left border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <HardDrive className="w-5 h-5" />
                <h3 className="font-moul tracking-normal text-sm md:text-base">
                  {editingAsset ? `កែប្រែឧបករណ៍៖ ${formId}` : 'បញ្ចូលព័ត៌មានឧបករណ៍ថ្មី (Add Fixed Asset)'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form layout body */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto max-h-[80vh] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              
              {/* Asset ID */}
              <div>
                <label className="block text-slate-500 font-extrabold mb-1">កូដសម្គាល់ឧបករណ៍ (Asset ID) *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. WIS-AST-010"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  disabled={!!editingAsset}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-slate-500 font-extrabold mb-1">ប្រភេទឧបករណ៍ (Category) *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as AssetCategory)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 font-bold"
                >
                  <option value="Computer">កុំព្យូទ័រ (Desktop PC)</option>
                  <option value="Laptop">ឡេបថប (Laptop)</option>
                  <option value="Projector">ម៉ាស៊ីនបញ្ចាំង (Projector)</option>
                  <option value="Camera">កាមេរ៉ា (Camera)</option>
                  <option value="TV">ទូរទស្សន៍ (Smart TV)</option>
                  <option value="Other">ឧបករណ៍ផ្សេងៗ (Other Equipment)</option>
                </select>
              </div>

              {/* Asset Name description */}
              <div className="sm:col-span-2">
                <label className="block text-slate-500 font-extrabold mb-1">ឈ្មោះសម្ភារៈឧបករណ៍ (Asset Name / Description) *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. Epson EB-FH06 3LCD Projector 1080p"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Brand name */}
              <div>
                <label className="block text-slate-500 font-extrabold mb-1">ម៉ាក (Brand) *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. Apple, Epson, Dell, Lenovo"
                  value={formBrand}
                  onChange={(e) => setFormBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-slate-500 font-extrabold mb-1">ម៉ូដែល (Model) *</label>
                <input
                  type="text"
                  placeholder="ឧ. ThinkPad E14 Gen 5"
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-slate-500 font-extrabold mb-1">លេខស៊េរីម៉ាស៊ីន (S/N Serial Number)</label>
                <input
                  type="text"
                  placeholder="S/N: XXXXXXXXXXXX"
                  value={formSerialNumber}
                  onChange={(e) => setFormSerialNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-850 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Cost in USD */}
              <div>
                <label className="block text-slate-500 font-extrabold mb-1">តម្លៃទិញចូល (Purchase Cost USD) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="ឧ. 750"
                  value={formCostUsd}
                  onChange={(e) => setFormCostUsd(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Location Room */}
              <div>
                <label className="block text-slate-500 font-extrabold mb-1">ទីតាំងដំឡើង (Room / Location) *</label>
                <input
                  type="text"
                  placeholder="ឧ. Lab Room, Room 102, Main Gate"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Assigned User Staff */}
              <div>
                <label className="block text-slate-500 font-extrabold mb-1">អ្នកកាន់ប្រើប្រាស់ (Assigned User) *</label>
                <input
                  type="text"
                  placeholder="ឧ. LOUNG Veasna... "
                  value={formAssignedTo}
                  onChange={(e) => setFormAssignedTo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Purchase Date */}
              <div>
                <label className="block text-slate-500 font-extrabold mb-1">ថ្ងៃទិញចូល (Purchase Date)</label>
                <input
                  type="date"
                  value={formPurchaseDate}
                  onChange={(e) => setFormPurchaseDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-850 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-slate-500 font-extrabold mb-1">ស្ថានភាពឧបករណ៍ (Status) *</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as AssetStatus)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 font-bold"
                >
                  <option value="Operational">ដំណើរការធម្មតា (Operational)</option>
                  <option value="Maintenance">កំពុងថែទាំ/ជួសជុល (Maintenance)</option>
                  <option value="Broken">ខូច/គាំងដំណើរការ (Broken)</option>
                </select>
              </div>

              {/* Special Remarks / comments */}
              <div className="sm:col-span-2">
                <label className="block text-slate-500 font-extrabold mb-1">ចំណាំបន្ថែម (Remarks / Notes)</label>
                <textarea
                  rows={3}
                  placeholder="ព័ត៌មានបន្ថែមទាក់ទងនឹងការធានា លក្ខណៈបច្ចេកទេស..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 font-semibold"
                />
              </div>

              {/* Form buttons container */}
              <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-550 border border-slate-200 hover:bg-slate-50 font-bold transition cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition cursor-pointer select-none"
                >
                  <Check className="w-4 h-4" />
                  <span>រក្សាទុកឧបករណ៍ (Save Asset)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Floating Toast notification container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce duration-300">
          <div className={`px-5 py-4.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border text-xs font-extrabold text-white ${
            toast.type === 'success' ? 'bg-emerald-900 border-emerald-700 shadow-emerald-950/20' : 
            toast.type === 'danger' ? 'bg-rose-900 border-rose-700 shadow-rose-950/20' : 
            'bg-slate-900 border-slate-700 shadow-slate-950/20'
          }`}>
            {toast.type === 'success' ? <Check className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
            <div>{toast.message}</div>
          </div>
        </div>
      )}

    </div>
  );
}
