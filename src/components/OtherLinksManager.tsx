/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { 
  Link2, Globe, Plus, Edit2, Trash2, Search, ExternalLink, Bookmark, 
  Tag, Filter, X, Check, AlertCircle, Sparkles, Copy, Trash, Folder, RefreshCw, Layers,
  FileSpreadsheet, Send, HardDrive, Settings, Briefcase, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface OtherLink {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  addedBy: string;
  createdAt: string;
  icon?: string; // Icon identifier
}

// Map database icons to Lucide components
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  sheets: FileSpreadsheet,
  telegram: Send,
  drive: HardDrive,
  globe: Globe,
  settings: Settings,
  briefcase: Briefcase,
  file: FileText,
  layers: Layers,
  link: Link2
};

const ICON_OPTIONS = [
  { key: 'sheets', label: 'Microsoft Excel / Google Sheets', icon: FileSpreadsheet, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
  { key: 'telegram', label: 'Telegram Chat / Channels', icon: Send, color: 'text-sky-500 bg-sky-50 border-sky-100' },
  { key: 'drive', label: 'Drives & Storages', icon: HardDrive, color: 'text-amber-500 bg-amber-50 border-amber-100' },
  { key: 'globe', label: 'គេហទំព័រ (Website)', icon: Globe, color: 'text-indigo-500 bg-indigo-50 border-indigo-100' },
  { key: 'settings', label: 'ប្រព័ន្ធគ្រប់គ្រង (Admin System)', icon: Settings, color: 'text-slate-600 bg-slate-50 border-slate-100' },
  { key: 'briefcase', label: 'ការងាររដ្ឋបាល (PR Job)', icon: Briefcase, color: 'text-orange-500 bg-orange-50 border-orange-100' },
  { key: 'file', label: 'លិខិតយោង (Documents)', icon: FileText, color: 'text-green-700 bg-green-50 border-green-100' },
  { key: 'layers', label: 'ប្រភពចំរុះ (Layers)', icon: Layers, color: 'text-teal-500 bg-teal-50 border-teal-100' },
  { key: 'link', label: 'តំណភ្ជាប់ទូទៅ (Link)', icon: Link2, color: 'text-rose-500 bg-rose-50 border-rose-100' }
];

const DEFAULT_LINKS: OtherLink[] = [
  {
    id: 'link_1',
    title: 'ប្រព័ន្ធបម្រុងទុកទិន្នន័យ (Google Sheets Backup Hub)',
    url: 'https://docs.google.com/spreadsheets/d/1wis-school-backup-example-sheet/edit',
    category: 'PR-System',
    description: 'តំណភ្ជាប់ទៅកាន់ផែនការបម្រុងទិន្នន័យស្វ័យប្រវត្តិ វត្តមាន បុគ្គលិក និងការចំណាយផ្សេងៗរបស់សាលា។',
    addedBy: 'LOUNG Veasna (Admin Supervisor)',
    createdAt: '2026-05-15T08:30:00.000Z',
    icon: 'sheets'
  },
  {
    id: 'link_2',
    title: 'គ្រុបតេឡេក្រាមរដ្ឋបាលសាលា (Western Admin Telegram Group)',
    url: 'https://t.me/western_school_admin_chat_example',
    category: 'Fixed Asset',
    description: 'ក្រុមរាយការណ៍បន្ទាន់ និងជូនដំណឹងទាក់ទងនឹងវត្តមាន និងសណ្តាប់ធ្នាប់ទូទៅក្នុងបរិវេណសាលា។',
    addedBy: 'LOUNG Veasna (Admin Supervisor)',
    createdAt: '2026-05-20T09:15:00.000Z',
    icon: 'telegram'
  },
  {
    id: 'link_3',
    title: 'ប្រព័ន្ធគ្រប់គ្រងធនធានផ្ទុកឯកសារ (Google Drive Shared Library)',
    url: 'https://drive.google.com/drive/folders/1wis-admin-files-preview-drive',
    category: 'ស្តុកឯកសារ (Drives & Storage)',
    description: 'កន្លែងរក្សាទុកឯកសារច្បាប់ដើម ឬលិខិតផ្លូវការផ្សេងៗ ទម្រង់បែបបទ លិខិតបញ្ជាក់របស់សិស្ស និងបុគ្គលិក។',
    addedBy: 'LOUNG Veasna (Admin Supervisor)',
    createdAt: '2026-05-22T14:10:00.000Z',
    icon: 'drive'
  },
  {
    id: 'link_4',
    title: 'គេហទំព័របង្រួមទំហំឯកសារ PDF (iLovePDF Compressor)',
    url: 'https://www.ilovepdf.com/compress_pdf',
    category: 'Compress PDF file',
    description: 'ប្រព័ន្ធបង្រួមទំហំឯកសារ PDF ឥតគិតថ្លៃ ដើម្បីងាយស្រួលក្នុងការបញ្ចូលទៅក្នុងប្រព័ន្ធគ្រប់គ្រងសាលា។',
    addedBy: 'LOUNG Veasna (Admin Supervisor)',
    createdAt: '2026-05-01T03:45:00.000Z',
    icon: 'file'
  }
];

interface OtherLinksManagerProps {
  currentUser?: UserAccount | null;
}

export default function OtherLinksManager({ currentUser }: OtherLinksManagerProps = {}) {
  const [links, setLinks] = useState<OtherLink[]>(() => {
    try {
      const saved = localStorage.getItem('wis_school_other_links');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Map old categories to updated ones
        return parsed.map((item: any) => {
          let cat = item.category;
          if (cat === 'ប្រព័ន្ធគ្រប់គ្រង (Admin System)') cat = 'PR-System';
          if (cat === 'ទំនាក់ទំនង (Telegram Channels)') cat = 'Fixed Asset';
          if (cat === 'គេហទំព័រ (Official Website)') cat = 'Compress PDF file';
          if (cat === 'ផ្សេងៗ (Others)') cat = 'បញ្ចូលដោយខ្លួនឯង';
          return {
            ...item,
            category: cat,
            icon: item.icon || 'link'
          };
        });
      }
      return DEFAULT_LINKS;
    } catch {
      return DEFAULT_LINKS;
    }
  });

  const displayedLinks = React.useMemo(() => {
    return links;
  }, [links]);

  // Keep state updated in local storage
  useEffect(() => {
    localStorage.setItem('wis_school_other_links', JSON.stringify(links));
  }, [links]);

  // Search and Category states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modal operations
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<OtherLink | null>(null);
  
  // Delete confirm modal
  const [deleteTarget, setDeleteTarget] = useState<OtherLink | null>(null);

  // Form input fields
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('PR-System');
  const [description, setDescription] = useState('');
  const [addedBy, setAddedBy] = useState(currentUser?.fullName || currentUser?.username || 'LOUNG Veasna (Admin Supervisor)');
  const [selectedIcon, setSelectedIcon] = useState('link');

  // Feed/Toast alert feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Get categorized categories list
  const categoriesList = ['All', 'PR-System', 'Fixed Asset', 'Compress PDF file', 'ស្តុកឯកសារ (Drives & Storage)', 'បញ្ចូលដោយខ្លួនឯង'];

  // Helper to retrieve category icon
  const getCategoryIcon = (catName: string) => {
    if (catName === 'PR-System') return Settings;
    if (catName === 'Fixed Asset') return Layers;
    if (catName === 'Compress PDF file') return FileText;
    if (catName === 'ស្តុកឯកសារ (Drives & Storage)') return HardDrive;
    if (catName === 'បញ្ចូលដោយខ្លួនឯង') return Briefcase;
    return Link2;
  };

  // Category Colors
  const getCategoryColor = (catName: string) => {
    switch (catName) {
      case 'PR-System':
        return 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100/50';
      case 'Fixed Asset':
        return 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100/50';
      case 'Compress PDF file':
        return 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/50';
      case 'ស្តុកឯកសារ (Drives & Storage)':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/50';
      case 'បញ្ចូលដោយខ្លួនឯង':
        return 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100/50';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/50';
    }
  };

  // Category Count Getter
  const getCategoryCount = (catName: string) => {
    if (catName === 'All') return links.length;
    return links.filter(l => l.category === catName).length;
  };

  // Open creation modal
  const openCreateModal = () => {
    setEditingLink(null);
    setTitle('');
    setUrl('');
    setCategory('PR-System');
    setDescription('');
    setAddedBy(currentUser?.fullName || currentUser?.username || 'LOUNG Veasna (Admin Supervisor)');
    setSelectedIcon('link');
    setIsFormOpen(true);
  };

  // Open edit modal
  const openEditModal = (link: OtherLink) => {
    setEditingLink(link);
    setTitle(link.title);
    setUrl(link.url);
    setCategory(link.category);
    setDescription(link.description || '');
    setAddedBy(link.addedBy);
    setSelectedIcon(link.icon || 'link');
    setIsFormOpen(true);
  };

  // Copy Link utility
  const copyToClipboard = (id: string, urlStr: string) => {
    navigator.clipboard.writeText(urlStr);
    setCopiedId(id);
    showToast('ចម្លងតំណភ្ជាប់បានសម្រេច!', 'info');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Handle Form submit (add/edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !url.trim()) {
      alert('សូមបំពេញព័ត៌មានដែលចាំបាច់ (ចំណងជើង និង URL)');
      return;
    }

    // Basic URL parsing prefix check
    let verifiedUrl = url.trim();
    if (!/^https?:\/\//i.test(verifiedUrl)) {
      verifiedUrl = 'https://' + verifiedUrl;
    }

    if (editingLink) {
      // Edit existing link
      const updated = links.map(l => {
        if (l.id === editingLink.id) {
          return {
            ...l,
            title: title.trim(),
            url: verifiedUrl,
            category: category.trim(),
            description: description.trim(),
            addedBy: addedBy.trim(),
            icon: selectedIcon
          };
        }
        return l;
      });
      setLinks(updated);
      showToast('រក្សាទុកការកែសម្រួលបានសម្រេច!');
    } else {
      // Create new link
      const newLink: OtherLink = {
        id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: title.trim(),
        url: verifiedUrl,
        category: category.trim(),
        description: description.trim(),
        addedBy: addedBy.trim(),
        createdAt: new Date().toISOString(),
        icon: selectedIcon
      };
      setLinks([newLink, ...links]);
      showToast('បន្ថែមតំណភ្ជាប់ថ្មីបានសម្រេច!');
    }

    setIsFormOpen(false);
    setEditingLink(null);
  };

  // Confirm delete handler
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setLinks(links.filter(l => l.id !== deleteTarget.id));
    showToast('លុបតំណភ្ជាប់បានសម្រេច!', 'success');
    setDeleteTarget(null);
  };

  // Filter links logic
  const filteredLinks = displayedLinks.filter(link => {
    const matchesSearch = 
      link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (link.description && link.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      link.url.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === 'All' || link.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Search Header and Action Deck with beautiful gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#072d2c] via-[#0d5c5a] to-[#127270] p-6 sm:p-8 rounded-3xl shadow-xl border border-[#148380]/20 flex flex-col md:flex-row md:items-center justify-between gap-6 select-none">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c4d4b_1px,transparent_1px),linear-gradient(to_bottom,#0c4d4b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-400 rounded-full blur-3xl opacity-15"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-400 rounded-full blur-3xl opacity-15"></div>

        <div className="relative z-10 space-y-2">
          <h2 className="text-white flex flex-wrap items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
              <Link2 className="w-5 h-5 text-teal-300" />
            </div>
            <span className="text-[16px] sm:text-[19px] font-moul font-normal tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-white to-teal-100">
              ប្រព័ន្ធគ្រប់គ្រងតំណភ្ជាប់ផ្សេងៗ
            </span>
            <span className="text-[9.5px] font-sans font-black tracking-widest text-teal-200 bg-teal-900/40 px-2 py-0.5 rounded-md border border-teal-800/30">
              PORTAL HUB
            </span>
          </h2>
          <p className="text-xs sm:text-[13px] text-teal-100/80 font-medium font-sans max-w-xl leading-relaxed">
            សម្របសម្រួលការប្រើប្រាស់ និងប្រមូលផ្តុំរាល់តំណភ្ជាប់សំខាន់ៗ Google Sheets, Telegram Group, Cloud Library ឬតំណភ្ជាប់ការងាររដ្ឋបាលផ្សេងៗ។
          </p>
        </div>

        <button 
          onClick={openCreateModal}
          className="relative z-10 bg-gradient-to-b from-teal-400 to-teal-600 hover:from-teal-300 hover:to-teal-500 text-teal-950 font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition-all duration-300 shadow-lg shadow-teal-950/40 hover:shadow-teal-400/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer border border-teal-300/30 transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 text-teal-950 stroke-[3px]" />
          <span>បន្ថែមតំណភ្ជាប់ថ្មី (Add Link)</span>
        </button>
      </div>

      {/* Main Board Area Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Filter Options Pane */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs select-none">
            <h3 className="text-[11px] font-black text-slate-850 uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Filter className="w-4 h-4 text-[#0d5c5a]" />
              <span>តម្រងប្រភេទតំណភ្ជាប់</span>
            </h3>

            <div className="flex flex-wrap lg:flex-col gap-2">
              {categoriesList.map((cat) => {
                const CatIcon = getCategoryIcon(cat);
                const count = getCategoryCount(cat);
                const isSelected = selectedCategory === cat;
                
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-3 rounded-2xl text-left text-xs font-bold transition-all w-full cursor-pointer flex items-center justify-between border ${
                      isSelected 
                        ? 'bg-teal-50/50 border-teal-300 text-[#0d5c5a] shadow-xs'
                        : 'border-transparent text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-[#0d5c5a] text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <span className="truncate pr-1 text-[11px]">
                        {cat === 'All' ? 'ទាំងអស់ (All Links)' : cat}
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                      isSelected ? 'bg-teal-200/60 text-[#073b3a]' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#0d5c5a]/5 border border-[#0d5c5a]/10 rounded-3xl p-5 text-[11px] leading-relaxed font-sans text-slate-600 space-y-3 select-none">
            <div className="flex items-center gap-2 text-[#0d5c5a] font-extrabold uppercase text-[10px] tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              ប្រអប់ជំនួយរហ័ស
            </div>
            <p className="text-slate-500">
              អ្នកគ្រប់គ្រងប្រព័ន្ធអាចបន្ថែម URL ផ្លូវការផ្សេងៗ ដោយជ្រើសរើសរូបតំណាងឱ្យស្របទៅតាមប្រភេទឯកសារ។ រាល់ការបញ្ចូលនឹងរក្សាទុកក្នុងប្រព័ន្ធដោយសុវត្ថិភាព។
            </p>
          </div>
        </div>

        {/* Right Side: Search Box and List Results Grid */}
        <div className="lg:col-span-3 space-y-5">
          {/* Search bar with modern shadow */}
          <div className="relative group">
            <Search className="absolute left-4.5 top-4 w-4 h-4 text-slate-400 group-focus-within:text-[#0d5c5a] transition-colors" />
            <input 
              type="text"
              placeholder="ស្វែងរកតាមចំណងជើង, តំណភ្ជាប់, ឬព័ត៌មានលម្អិត... (Search...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold leading-relaxed focus:ring-2 focus:ring-[#0d5c5a]/20 focus:border-[#0d5c5a] focus:outline-none placeholder-slate-400 shadow-xs transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-4.5 top-3.5 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Render List Grid */}
          {filteredLinks.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 text-center py-20 p-6 shadow-xs select-none">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-150">
                <Globe className="w-8 h-8 text-slate-300 opacity-80" />
              </div>
              <p className="text-sm font-bold text-slate-700">រកមិនឃើញតំណភ្ជាប់ដែលអ្នកចង់ស្វែងរកឡើយ</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                សូមពិនិត្យមើលពាក្យស្វែងរកឡើងវិញ ឬចុចប៊ូតុងខាងលើដើម្បីបន្ថែមថ្មី។
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredLinks.map((link) => {
                const LinkIcon = ICON_MAP[link.icon || 'link'] || Link2;
                const isCopied = copiedId === link.id;
                
                return (
                  <div 
                    key={link.id}
                    className="group bg-white rounded-3xl border border-slate-200 hover:border-teal-500/30 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden"
                    id={`link-card-${link.id}`}
                  >
                    {/* Corner Accent Color for hovering state */}
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-100 group-hover:bg-[#0d5c5a] transition-all duration-300"></div>

                    <div>
                      {/* Top Row: Category Label and Created Date */}
                      <div className="flex items-center justify-between mb-3.5 select-none">
                        <span className={`text-[9.5px] font-extrabold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shrink-0 transition-colors ${getCategoryColor(link.category)}`}>
                          <Tag className="w-3.5 h-3.5" />
                          <span>{link.category}</span>
                        </span>
                        <span className="text-[9.5px] font-mono text-slate-400 font-bold block shrink-0">
                          {new Date(link.createdAt).toLocaleDateString('kh-KH')}
                        </span>
                      </div>

                      {/* Header/Title Display */}
                      <h3 className="text-xs sm:text-[13.5px] font-bold text-slate-800 leading-relaxed mt-2 flex items-start gap-3">
                        <div className="p-2.5 bg-slate-50 text-[#0d5c5a] rounded-xl shrink-0 border border-slate-150 group-hover:bg-teal-50 group-hover:text-[#0d5c5a] group-hover:border-teal-100 transition-colors duration-300">
                          <LinkIcon className="w-4 h-4" />
                        </div>
                        <span className="mt-1 font-sans">{link.title}</span>
                      </h3>

                      {/* Description */}
                      {link.description ? (
                        <p className="text-xs font-medium text-slate-500 leading-relaxed mt-3.5 line-clamp-3 select-text bg-slate-50/40 p-2.5 rounded-xl border border-slate-100/50">
                          {link.description}
                        </p>
                      ) : (
                        <p className="text-xs font-medium text-slate-400 italic leading-relaxed mt-3 p-2 border border-dashed border-slate-150 rounded-xl">
                          មិនមានការពិពណ៌នា...
                        </p>
                      )}

                      {/* URL Display Box */}
                      <div className="mt-4 bg-slate-50 hover:bg-slate-100/60 rounded-xl p-3 border border-slate-150 flex items-center justify-between gap-3 min-w-0 transition-colors">
                        <span className="text-[10px] font-mono text-teal-600 font-extrabold truncate select-all block flex-1">
                          {link.url}
                        </span>
                        <button
                          onClick={() => copyToClipboard(link.id, link.url)}
                          className={`p-1.5 hover:bg-white text-slate-400 hover:text-slate-700 transition rounded-lg shrink-0 block cursor-pointer border border-transparent hover:border-slate-200 ${
                            isCopied ? 'text-emerald-600 bg-emerald-50' : ''
                          }`}
                          title="ចម្លងតំណភ្ជាប់ (Copy URL)"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="border-t border-slate-100 mt-5 pt-4 flex items-center justify-between gap-2 select-none shrink-0">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(link)}
                          className="p-2 text-slate-400 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-xl transition-all cursor-pointer"
                          title="កែសម្រួលព័ត៌មាន (Edit Link)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(link)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all cursor-pointer"
                          title="លុបតំណភ្ជាប់ (Delete Link)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0d5c5a] hover:bg-[#0a4846] text-white rounded-xl transition-all text-[11px] font-extrabold cursor-pointer shadow-sm hover:shadow-md hover:shadow-teal-900/10"
                      >
                        <span>បើកមើល (Browse Link)</span>
                        <ExternalLink className="w-3.5 h-3.5 text-teal-200" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Modal: Create & Edit Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
              id="link-form-modal"
            >
              {/* Header */}
              <div className="bg-[#0d5c5a] text-white p-5 flex items-center justify-between border-b border-[#148380]/20 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl border border-white/10">
                    <Link2 className="w-5 h-5 text-teal-200" />
                  </div>
                  <div>
                    <h3 className="text-sm font-moul font-normal leading-snug">
                      {editingLink ? 'កែសម្រួលតំណភ្ជាប់គេហទំព័រ' : 'បន្ថែមតំណភ្ជាប់ថ្មី'}
                    </h3>
                    <p className="text-[10px] text-teal-100/70 font-bold font-sans mt-0.5 uppercase tracking-wider">
                      {editingLink ? 'Edit external web reference link' : 'Add new external resource reference'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingLink(null);
                  }} 
                  className="text-teal-100 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-full">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label htmlFor="form_title" className="text-xs font-bold text-slate-700 block">ចំណងជើងតំណភ្ជាប់ (Link Title) *</label>
                  <input
                    id="form_title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ឧ. ប្រព័ន្ធគ្រប់គ្រងការទិញ និងទូទាត់ថវិកា (PR-System)"
                    className="w-full bg-slate-50 text-xs font-bold p-3 border border-slate-250 rounded-xl focus:ring-2 focus:ring-[#0d5c5a]/20 focus:border-[#0d5c5a] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                {/* URL */}
                <div className="space-y-1.5">
                  <label htmlFor="form_url" className="text-xs font-bold text-slate-700 block">តំណភ្ជាប់ URL (Link URL / IP address) *</label>
                  <input
                    id="form_url"
                    type="text"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="ឧ. https://docs.google.com/..."
                    className="w-full bg-slate-50 text-xs font-bold p-3 border border-slate-250 rounded-xl focus:ring-2 focus:ring-[#0d5c5a]/20 focus:border-[#0d5c5a] focus:bg-white focus:outline-none font-mono transition-all text-teal-600"
                  />
                </div>

                {/* Category and AddedBy Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="form_cat" className="text-xs font-bold text-slate-700 block">ប្រភេទព័ត៌មាន (Category)</label>
                    <select
                      id="form_cat"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 text-xs font-bold p-3 border border-slate-250 rounded-xl focus:ring-2 focus:ring-[#0d5c5a]/20 focus:border-[#0d5c5a] focus:bg-white focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="PR-System">PR-System</option>
                      <option value="Fixed Asset">Fixed Asset</option>
                      <option value="Compress PDF file">Compress PDF file</option>
                      <option value="ស្តុកឯកសារ (Drives & Storage)">ស្តុកឯកសារ (Drives & Storage)</option>
                      <option value="បញ្ចូលដោយខ្លួនឯង">បញ្ចូលដោយខ្លួនឯង</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="form_builder" className="text-xs font-bold text-slate-700 block">អ្នកបញ្ចូល (Added By)</label>
                    <input
                      id="form_builder"
                      type="text"
                      required
                      value={addedBy}
                      onChange={(e) => setAddedBy(e.target.value)}
                      placeholder="ឈ្មោះអ្នកគ្រប់គ្រង"
                      className="w-full bg-slate-50 text-xs font-bold p-3 border border-slate-250 rounded-xl focus:ring-2 focus:ring-[#0d5c5a]/20 focus:border-[#0d5c5a] focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Integrated Icon Selector Grid */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">ជ្រើសរើសរូបតំណាងឯកសារ (Select File Icon) *</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                    {ICON_OPTIONS.map((opt) => {
                      const IconComponent = opt.icon;
                      const isSelected = selectedIcon === opt.key;
                      
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setSelectedIcon(opt.key)}
                          className={`p-2 py-3 flex flex-col items-center justify-center gap-1.5 rounded-xl transition border text-center cursor-pointer ${
                            isSelected 
                              ? 'bg-[#0d5c5a] text-white border-[#0c4d4b] shadow-md scale-102' 
                              : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                          title={opt.label}
                        >
                          <IconComponent className={`w-5 h-5 ${isSelected ? 'text-teal-200' : 'text-slate-600'}`} />
                          <span className="text-[8px] font-extrabold line-clamp-1 truncate w-full px-0.5">{opt.key.toUpperCase()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label htmlFor="form_desc" className="text-xs font-bold text-slate-700 block">បរិយាយព័ត៌មានបន្ថែម (Description/Notes)</label>
                  <textarea
                    id="form_desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="បញ្ជាក់ការណែនាំបន្ថែម ឬប្លង់នៃការប្រើប្រាស់តំណភ្ជាប់នេះ..."
                    rows={3}
                    className="w-full bg-slate-50 text-xs font-bold p-3 border border-slate-250 rounded-xl focus:ring-2 focus:ring-[#0d5c5a]/20 focus:border-[#0d5c5a] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                {/* Submit actions */}
                <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingLink(null);
                    }}
                    className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-3 rounded-xl border border-slate-200 transition cursor-pointer"
                  >
                    បោះបង់ (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0d5c5a] hover:bg-[#0a4846] text-white text-xs font-extrabold px-6 py-3 rounded-xl transition shadow-md shadow-teal-900/10 cursor-pointer border border-transparent hover:border-teal-800/30"
                  >
                    {editingLink ? 'រក្សាទុកការកែប្រែ' : 'បញ្ចូលតំណភ្ជាប់'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Confirm Delete Link */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden"
              id="link-delete-modal"
            >
              {/* Header */}
              <div className="bg-rose-600 text-white p-4.5 flex items-center justify-between">
                <h3 className="text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-white" />
                  បញ្ជាក់ការលុបតំណភ្ជាប់
                </h3>
                <button onClick={() => setDeleteTarget(null)} className="text-white/80 hover:text-white transition cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                  <Trash className="w-8 h-8 text-rose-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">តើអ្នកពិតជាចង់លុបតំណភ្ជាប់នេះមែនទេ?</h4>
                <div className="text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 inline-block font-sans max-w-full truncate">
                  <span className="font-extrabold text-slate-850 break-all">{deleteTarget.title}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-rose-100 cursor-pointer"
                >
                  យល់ព្រមលុប (Delete)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Toasts Messages Overlay notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-100 p-4 bg-slate-900 border border-slate-800 text-teal-300 font-bold text-xs sm:text-sm rounded-xl shadow-2xl flex items-center gap-2.5 select-none"
            id="toast-notification"
          >
            <div className="w-6 h-6 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
