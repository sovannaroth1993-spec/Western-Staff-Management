/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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

export default function OtherLinksManager() {
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
  const [addedBy, setAddedBy] = useState('LOUNG Veasna (Admin Supervisor)');
  const [selectedIcon, setSelectedIcon] = useState('link');

  // Feed/Toast alert feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Get categorized categories list
  const categoriesList = ['All', 'PR-System', 'Fixed Asset', 'Compress PDF file', 'ស្តុកឯកសារ (Drives & Storage)', 'ផ្សេងៗ (Others)'];

  // Helper to retrieve category icon
  const getCategoryIcon = (catName: string) => {
    if (catName === 'PR-System') return Settings;
    if (catName === 'Fixed Asset') return Layers;
    if (catName === 'Compress PDF file') return FileText;
    if (catName === 'ស្តុកឯកសារ (Drives & Storage)') return HardDrive;
    return Link2;
  };

  // Open creation modal
  const openCreateModal = () => {
    setEditingLink(null);
    setTitle('');
    setUrl('');
    setCategory('PR-System');
    setDescription('');
    setAddedBy('LOUNG Veasna (Admin Supervisor)');
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
  const copyToClipboard = (urlStr: string) => {
    navigator.clipboard.writeText(urlStr);
    showToast('ចម្លងតំណភ្ជាប់បានសម្រេច!', 'info');
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
  const filteredLinks = links.filter(link => {
    const matchesSearch = 
      link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (link.description && link.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      link.url.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === 'All' || link.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Search Header and Action Deck */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h2 className="text-xl font-black font-moul text-indigo-950 flex items-center gap-2.5">
            <Link2 className="w-6 h-6 text-indigo-600" />
            ប្រព័ន្ធគ្រប់គ្រងតំណភ្ជាប់ផ្សេងៗ (Web Links Manager)
          </h2>
          <p className="text-xs text-slate-500 font-bold font-sans mt-1">
            គ្រប់គ្រងតំណភ្ជាប់ឯកសារ Google Sheets, Telegram Chat, Drive Folders ឬតំណភ្ជាប់គេហទំព័រសាលាផ្សេងៗ
          </p>
        </div>

        <button 
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-xl transition shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>បន្ថែមតំណភ្ជាប់ថ្មី (Add New Web Link)</span>
        </button>
      </div>

      {/* Main Board Area Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Filter Options Pane */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 select-none">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <Filter className="w-3.5 h-3.5 text-indigo-500" />
              តម្រងប្រភេទឯកសារ
            </h3>

            <div className="flex flex-wrap lg:flex-col gap-1.5">
              {categoriesList.map((cat) => {
                const CatIcon = getCategoryIcon(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2.5 rounded-xl text-left text-xs font-black transition-all w-full ${
                      selectedCategory === cat 
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-black shadow-xs'
                        : 'border border-transparent text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${selectedCategory === cat ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                        <CatIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{cat === 'All' ? 'ទាំងអស់ (All Categories)' : cat}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4 text-xs font-bold font-sans text-sky-850 space-y-2 select-none">
            <div className="flex items-center gap-1.5 text-sky-900 font-extrabold uppercase text-[10px] tracking-wider">
              <Sparkles className="w-4 h-4 text-sky-500" />
              ប្រអប់ជំនួយរហ័ស
            </div>
            <p className="leading-relaxed text-slate-600">
              លោកអ្នកអាចដាក់ URL ដែលបំប្លែងចេញពី Google Drive, Google Sheets, OneDrive ឬ Telegram Group របស់សាលា ដើម្បីឲ្យគណៈគ្រប់គ្រងងាយស្រួលចុចបើក និងចែករំលែកដោយផ្ទាល់។
            </p>
          </div>
        </div>

        {/* Right Side: Search Box and List Results Grid */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search bar inside container decoration */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="ស្វែងរកចំណងជើងតំណភ្ជាប់... (Search link title, url, description...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400/90 shadow-2xs"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-50"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Render List Grid */}
          {filteredLinks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 text-center py-16 p-6">
              <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3 opacity-60 animate-pulse" />
              <p className="text-sm font-black text-slate-500">រកមិនឃើញតំណភ្ជាប់ដែលអ្នកចង់ស្វែងរកឡើយ</p>
              <p className="text-xs text-slate-400 mt-1">សូមសាកល្បងស្វែងរកម្ដងទៀត ឬចុចប៊ូតុងខាងលើដើម្បីបន្ថែមថ្មី។</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLinks.map((link) => {
                // Dynamically retrieve specified custom icon component
                const LinkIcon = ICON_MAP[link.icon || 'link'] || Link2;
                
                return (
                  <div 
                    key={link.id}
                    className="bg-white rounded-2xl border border-slate-200/85 hover:shadow-md hover:border-slate-300 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between"
                    id={`link-card-${link.id}`}
                  >
                    <div>
                      {/* Category Label */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-black font-sans px-2.5 py-1 ${
                          link.category === 'PR-System' 
                            ? 'bg-rose-50 border border-rose-100 text-rose-700' 
                            : 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                        } rounded-full flex items-center gap-1 shrink-0`}>
                          <Tag className="w-3 h-3" />
                          {link.category}
                        </span>
                        <span className="text-[9px] font-sans text-slate-400 font-bold block shrink-0">
                          {new Date(link.createdAt).toLocaleDateString('kh-KH')}
                        </span>
                      </div>

                      {/* Title & icon display */}
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug mt-1.5 flex items-start gap-2.5 line-clamp-2">
                        <div className="p-1 px-1.5 bg-slate-100 text-indigo-600 rounded-lg shrink-0 border border-slate-200/60 mt-0.5">
                          <LinkIcon className="w-4 h-4" />
                        </div>
                        <span className="mt-0.5">{link.title}</span>
                      </h3>

                      {/* Description */}
                      {link.description ? (
                        <p className="text-xs font-semibold text-slate-500 leading-relaxed mt-2.5 line-clamp-3 select-text">
                          {link.description}
                        </p>
                      ) : (
                        <p className="text-xs font-semibold text-slate-400 italic leading-relaxed mt-2">
                          មិនបានដាក់ការពិពណ៌នា...
                        </p>
                      )}

                      {/* URL display preview */}
                      <div className="mt-3 bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-indigo-500 font-bold truncate select-all block flex-1">
                          {link.url}
                        </span>
                        <button
                          onClick={() => copyToClipboard(link.url)}
                          className="p-1 hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition rounded-md shrink-0 block"
                          title="ចម្លងតំណភ្ជាប់ (Copy URL)"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between gap-2 select-none shrink-0">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(link)}
                          className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 rounded-xl transition-all"
                          title="កែសម្រួលព័ត៌មាន (Edit Link)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(link)}
                          className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200/60 rounded-xl transition-all"
                          title="លុបតំណភ្ជាប់ (Delete Link)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-white rounded-xl transition text-[11px] font-black"
                      >
                        <span>បើកមើល (Browse Link)</span>
                        <ExternalLink className="w-3 h-3 text-slate-300" />
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
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
              id="link-form-modal"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-indigo-500 shrink-0">
                <div className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-black font-moul leading-snug">
                      {editingLink ? 'កែសម្រួលតំណភ្ជាប់គេហទំព័រ' : 'បន្ថែមតំណភ្ជាប់ថ្មី'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">
                      {editingLink ? 'Edit general school external link' : 'Add new external resource link'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingLink(null);
                  }} 
                  className="text-slate-400 hover:text-white transition p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-full">
                
                {/* Title */}
                <div className="space-y-1">
                  <label htmlFor="form_title" className="text-xs font-bold text-slate-700 block">ចំណងជើងតំណភ្ជាប់ (Link Title) *</label>
                  <input
                    id="form_title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ឧ. ប្រព័ន្ធគ្រប់គ្រងការទិញ និងទូទាត់ថវិកា (PR-System)"
                    className="w-full bg-slate-50 text-xs font-semibold p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* URL */}
                <div className="space-y-1">
                  <label htmlFor="form_url" className="text-xs font-bold text-slate-700 block">តំណភ្ជាប់ URL (Link URL / IP address) *</label>
                  <input
                    id="form_url"
                    type="text"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="ឧ. https://docs.google.com/..."
                    className="w-full bg-slate-50 text-xs font-semibold p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                {/* Category and AddedBy Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="form_cat" className="text-xs font-bold text-slate-700 block">ប្រភេទព័ត៌មាន (Category)</label>
                    <select
                      id="form_cat"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 text-xs font-semibold p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="PR-System">PR-System</option>
                      <option value="Fixed Asset">Fixed Asset</option>
                      <option value="Compress PDF file">Compress PDF file</option>
                      <option value="ស្តុកឯកសារ (Drives & Storage)">ស្តុកឯកសារ (Drives & Storage)</option>
                      <option value="ផ្សេងៗ (Others)">ផ្សេងៗ (Others)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="form_builder" className="text-xs font-bold text-slate-700 block">អ្នកបញ្ចូល (Added By)</label>
                    <input
                      id="form_builder"
                      type="text"
                      required
                      value={addedBy}
                      onChange={(e) => setAddedBy(e.target.value)}
                      placeholder="ឈ្មោះអ្នកគ្រប់គ្រង"
                      className="w-full bg-slate-50 text-xs font-semibold p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Integrated Icon Selector Grid */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 block">ជ្រើសរើសរូបតំណាងឯកសារ (Select File Icon) *</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {ICON_OPTIONS.map((opt) => {
                      const IconComponent = opt.icon;
                      const isSelected = selectedIcon === opt.key;
                      
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setSelectedIcon(opt.key)}
                          className={`p-2 flex flex-col items-center justify-center gap-1 rounded-xl transition border text-center ${
                            isSelected 
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-102' 
                              : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                          title={opt.label}
                        >
                          <IconComponent className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                          <span className="text-[8px] font-bold line-clamp-1 truncate w-full px-1">{opt.key.toUpperCase()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label htmlFor="form_desc" className="text-xs font-bold text-slate-700 block">បរិយាយព័ត៌មានបន្ថែម (Description/Notes)</label>
                  <textarea
                    id="form_desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="បញ្ជាក់ការណែនាំបន្ថែម ឬប្លង់នៃការប្រើប្រាស់តំណភ្ជាប់នេះ..."
                    rows={3}
                    className="w-full bg-slate-50 text-xs font-semibold p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Submit actions */}
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingLink(null);
                    }}
                    className="bg-white hover:bg-slate-150 text-slate-700 text-xs font-black px-4 py-2.5 rounded-xl border border-slate-200 transition"
                  >
                    បោះបង់ (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-100"
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
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden"
              id="link-delete-modal"
            >
              {/* Header */}
              <div className="bg-rose-600 text-white p-4 flex items-center justify-between">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-white" />
                  បញ្ជាក់ការលុបតំណភ្ជាប់
                </h3>
                <button onClick={() => setDeleteTarget(null)} className="text-white/80 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                  <Trash className="w-8 h-8 text-rose-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">តើអ្នកពិតជាចង់លុបតំណភ្ជាប់នេះមែនទេ?</h4>
                <div className="text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 inline-block font-sans max-w-full truncate">
                  <span className="font-extrabold text-slate-850 break-all">{deleteTarget.title}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-black px-4 py-2.5 rounded-xl border border-slate-200 transition"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition shadow-md shadow-rose-100"
                >
                  យល់ព្រមលុប (Delete Link)
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
            className="fixed bottom-6 right-6 z-100 p-4 bg-slate-900 border border-slate-800 text-amber-400 font-bold text-xs sm:text-sm rounded-xl shadow-2xl flex items-center gap-2.5 select-none"
            id="toast-notification"
          >
            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
