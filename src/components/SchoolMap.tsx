import React, { useState, useEffect, useRef } from 'react';
import { 
  Map, Upload, FileText, Maximize2, Minimize2, Trash2, 
  Info, Sparkles, Download, MapPin, Layers, Compass, Check, AlertCircle, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

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

export default function SchoolMap() {
  const [mapFileUrl, setMapFileUrl] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mapFileName, setMapFileName] = useState<string>('');
  const [mapFileType, setMapFileType] = useState<'pdf' | 'image' | 'excel' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeZone, setActiveZone] = useState<string>('building-a');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interactive Excel grid and spreadsheets states
  const [excelSheets, setExcelSheets] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [excelData, setExcelData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Load saved school map on Mount (Checking IndexedDB first)
  useEffect(() => {
    const loadMapData = async () => {
      try {
        const dbRecord = await loadMapFromIndexedDB();
        if (dbRecord) {
          setMapFileUrl(dbRecord.data);
          setMapFileName(dbRecord.name);
          setMapFileType(dbRecord.type);
          return;
        }

        // Fallback to localStorage if available
        const savedMapName = localStorage.getItem('wis_school_map_name');
        const savedMapType = localStorage.getItem('wis_school_map_type') as 'pdf' | 'image' | 'excel' | null;
        const savedMapData = localStorage.getItem('wis_school_map_data');
        
        if (savedMapData && savedMapType) {
          setMapFileUrl(savedMapData);
          setMapFileName(savedMapName || 'school_map_document');
          setMapFileType(savedMapType);
          
          // Migrate automatically to IndexedDB
          await saveMapToIndexedDB(savedMapName || 'school_map_document', savedMapType, savedMapData);
        }
      } catch (err) {
        console.error('Error loading school map:', err);
      }
    };

    loadMapData();
  }, []);

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
  const processFile = (file: File) => {
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

        // Save entire large string to IndexedDB
        await saveMapToIndexedDB(file.name, fileType, result);

        // Save lightweight metadata in localStorage
        try {
          localStorage.setItem('wis_school_map_name', file.name);
          localStorage.setItem('wis_school_map_type', fileType);
        } catch (storageErr) {
          console.warn('Could not save metadata to localStorage', storageErr);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearMap = async () => {
    if (confirm('តើអ្នកពិតជាចង់លុបប្លង់សាលានេះមែនទេ?')) {
      setMapFileUrl(null);
      setMapFileName('');
      setMapFileType(null);
      
      await deleteMapFromIndexedDB();
      localStorage.removeItem('wis_school_map_name');
      localStorage.removeItem('wis_school_map_type');
      localStorage.removeItem('wis_school_map_data');
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
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                <span className="text-xs sm:text-sm font-black text-slate-700">
                  {mapFileUrl ? `ឯកសារបច្ចុប្បន្ន៖ ${mapFileName}` : 'ប្លង់គំរូ និងការបញ្ចូលឯកសារ PDF (Default Template & PDF Upload)'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {mapFileUrl && (
                  <>
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                      title={isFullscreen ? "បង្រួមមកវិញ" : "បង្ហាញពេញអេក្រង់ (Full View)"}
                    >
                      {isFullscreen ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
                    </button>
                    <button
                      onClick={handleClearMap}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="លុបឯកសារប្លង់នេះ"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* If a Map is loaded */}
            {mapFileUrl ? (
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
                        onClick={handleOpenInNewTab}
                        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                        <span>បើកក្នុងផ្ទាំងថ្មី (Open Tab)</span>
                      </button>
                      <button
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
                        onClick={handleDownload}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ទាញយក Excel</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className={`transition-all duration-300 relative bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/80 ${isFullscreen ? 'h-[85vh] fixed inset-4 z-[9999] bg-slate-900/95 p-4 flex flex-col' : 'h-[650px] flex flex-col'}`}>
                  {isFullscreen && (
                    <div className="flex items-center justify-between bg-slate-800 text-white px-4 py-2 rounded-xl mb-4">
                      <span className="text-xs font-bold font-mono tracking-wider truncate">{mapFileName}</span>
                      <button
                        onClick={() => setIsFullscreen(false)}
                        className="inline-flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer"
                      >
                        <Minimize2 className="w-4 h-4" /> ផ្អាកបង្ហាញពេញអេក្រង់
                      </button>
                    </div>
                  )}

                  {/* Excel Spreadsheet Interactive Live Viewer */}
                  {mapFileType === 'excel' ? (
                    <div className="w-full h-full flex-1 flex flex-col bg-white overflow-hidden">
                      {/* Search & Sheets Tabs Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border-b border-slate-200 shrink-0">
                        {/* Sheets Selection Tabs */}
                        <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pr-2">
                          {excelSheets.map((sheet) => (
                            <button
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
                        
                        {/* Search spreadsheet bar */}
                        <div className="relative flex-1 max-w-sm">
                          <input
                            type="text"
                            placeholder="ស្វែងរកក្នុងតារាង Excel... (Search...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl pl-3.5 pr-10 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black hover:text-rose-500 text-slate-400 cursor-pointer"
                            >
                              សម្អាត
                            </button>
                          )}
                        </div>
                      </div>

                      {/* spreadsheet content */}
                      <div className="flex-1 overflow-auto p-4">
                        {excelData.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-2xl border border-slate-150">
                            <FileText className="w-12 h-12 text-slate-300 animate-pulse mb-2" />
                            <p className="text-xs text-slate-500 font-extrabold">គ្មានទិន្នន័យនៅក្នុងសន្លឹកកិច្ចការនេះទេ (No Data in Sheet)</p>
                          </div>
                        ) : (
                          (() => {
                            // Extract sheet keys dynamically
                            const allKeys: string[] = Array.from<string>(
                              new Set(
                                excelData.reduce<string[]>((acc, obj) => [...acc, ...Object.keys(obj)], [])
                              )
                            ).filter(k => k !== '__rowNum__');
                            
                            // Filter rows based on search parameters
                            const filteredData = excelData.filter((row) => {
                              if (!searchQuery) return true;
                              const query = searchQuery.toLowerCase().trim();
                              return allKeys.some((key) => 
                                String(row[key] || '').toLowerCase().includes(query)
                              );
                            });

                            return (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-[11px] text-slate-400 font-extrabold px-1">
                                  <span>រកឃើញ៖ {filteredData.length} ក្នុងចំណោម {excelData.length} ជួរដេក</span>
                                  <span>សន្លឹកបច្ចុប្បន្ន៖ <strong className="text-emerald-700 font-black">{activeSheet}</strong></span>
                                </div>
                                
                                <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
                                  <div className="overflow-x-auto max-w-full">
                                    <table className="w-full border-collapse text-left text-xs text-slate-705">
                                      <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black">
                                          <th className="px-4 py-3 text-center w-12 font-mono">№</th>
                                          {allKeys.map((header: any) => (
                                            <th key={header} className="px-4 py-3 font-bold border-l border-slate-200 select-all">
                                              {header}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {filteredData.map((row, rIndex) => (
                                          <tr 
                                            key={rIndex} 
                                            className="hover:bg-slate-50/50 border-b border-slate-150 last:border-b-0 transition-colors"
                                          >
                                            <td className="px-4 py-2.5 text-center bg-slate-50/50 text-slate-400 font-mono font-bold select-none">{rIndex + 1}</td>
                                            {allKeys.map((header: any) => (
                                              <td key={header} className="px-4 py-2.5 font-semibold text-slate-800 border-l border-slate-150 max-w-[280px] truncate" title={String(row[header] || '')}>
                                                {String(row[header] || '')}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            );
                          })()
                        )}
                      </div>
                    </div>
                  ) : mapFileType === 'pdf' ? (
                    <div className="w-full h-full flex-1 flex flex-col items-center justify-center bg-slate-50 border border-slate-150 rounded-2xl p-6 text-center">
                      <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 mb-4 shadow-sm">
                        <FileText className="w-10 h-10 animate-pulse" />
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-slate-800 font-mono select-all">
                        {mapFileName}
                      </h3>
                      <p className="text-xs text-slate-500 font-bold max-w-md mt-2 mb-6 leading-relaxed">
                        ឯកសារត្រូវបានរក្សាទុកដោយជោគជ័យ! <br />
                        ដើម្បីជៀសវាងការទប់ស្កាត់សុវត្ថិភាពពីកម្មវិធីរុករក (Microsoft Edge & Chrome Iframe Blocks) និងអាចមើលប្លង់បានយ៉ាងច្បាស់ពេញលេញ សូមចុចប៊ូតុងខាងក្រោម៖
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3.5">
                        <button
                          onClick={handleOpenInNewTab}
                          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-teal-400 font-black text-xs sm:text-sm px-6 py-3 rounded-xl transition cursor-pointer shadow-md select-none"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>បើកមើលប្លង់ស្អាតច្បាស់ល្អ (Open Full PDF)</span>
                        </button>
                        
                        <button
                          onClick={handleDownload}
                          className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition cursor-pointer select-none"
                        >
                          <Download className="w-4 h-4 text-slate-500" />
                          <span>ទាញយកទុកប្រើប្រាស់ (Download PDF)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Image Viewer with zoom ability fallback */
                    <div className="w-full h-full flex-1 flex items-center justify-center bg-slate-950 p-2 overflow-auto">
                      <img 
                        src={blobUrl || mapFileUrl || undefined} 
                        alt={mapFileName} 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* No Map Uploaded yet - Drag & Drop / Visual Mockup state */
              <div className="space-y-6">
                
                {/* Drag and drop upload zone */}
                <form 
                  onDragEnter={handleDrag}
                  onSubmit={(e) => e.preventDefault()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center min-h-[220px] ${
                    dragActive 
                      ? "border-sky-500 bg-sky-50/50" 
                      : "border-slate-200 hover:border-slate-350 bg-slate-50/50"
                  }`}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept=".pdf, .xlsx, .xls, image/*"
                    onChange={handleChange}
                  />
                  
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3 shrink-0">
                    <Upload className="w-6 h-6 animate-bounce" />
                  </div>
                  
                  <h3 className="text-xs sm:text-sm font-black text-slate-700">
                    សូមទាញទម្លាក់ ឬ ចុចបញ្ចូលឯកសារ PDF, Excel ឬ រូបភាពប្លង់សាលារៀន
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-550 font-semibold mt-1">
                    គាំទ្រពពួកឯកសារ PDF, Excel (.xlsx, .xls), PNG, JPG (ទំហំអតិបរមា 20MB)
                  </p>
                  
                  <button 
                    type="button"
                    onClick={onButtonClick}
                    className="mt-4 inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-855 rounded-xl transition cursor-pointer shadow-sm select-none"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                    ជ្រើសរើសឯកសារ PDF / Excel / រូបភាព
                  </button>
                </form>

                {/* Default Visual Mockup of School Campus Layout (interactive diagram representation) */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Compass className="w-5 h-5 text-sky-600" />
                    <h3 className="text-xs sm:text-sm font-black text-slate-700">
                      គំនូសប្លង់ទូទៅ និងអគារសិក្សា (WIS Layout Overview Schema)
                    </h3>
                  </div>

                  {/* SVG Map Layout representation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    
                    {/* Architectural interactive diagram representation */}
                    <div className="border border-slate-200/50 bg-white rounded-xl p-4 shadow-xs relative">
                      <span className="absolute top-2 right-2 text-[9px] font-black text-slate-400 font-mono tracking-widest uppercase">
                        North ↑
                      </span>

                      <div className="space-y-3">
                        {/* Upper Section (Main Entrance & Football field) */}
                        <div className="flex gap-2">
                          <div className="flex-1 border-2 border-dashed border-sky-300 bg-sky-50 text-sky-700 font-extrabold text-[10px] p-2.5 rounded-lg text-center flex items-center justify-center min-h-[50px]">
                            តារាងហាត់កីឡា & ទីធ្លារត់លេង (Sports Arena)
                          </div>
                          <div className="w-20 border border-slate-200 bg-slate-50 text-slate-600 font-extrabold text-[10px] p-2 rounded-lg text-center flex items-center justify-center">
                            ខ្លោងទ្វារធំ (Gate)
                          </div>
                        </div>

                        {/* Mid Section (Building A, Central Admin, Building B) */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setActiveZone('building-a')}
                            className={`border-2 p-3 rounded-lg text-center flex flex-col items-center justify-center gap-1 transition ${
                              activeZone === 'building-a' 
                                ? 'border-sky-500 bg-sky-50 text-sky-800' 
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase">Building A</span>
                            <span className="text-[9px] font-bold text-slate-400">Primary / KG</span>
                          </button>

                          <button
                            onClick={() => setActiveZone('admin-block')}
                            className={`border-2 p-3 rounded-lg text-center flex flex-col items-center justify-center gap-1 transition ${
                              activeZone === 'admin-block' 
                                ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800' 
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase">Central Office</span>
                            <span className="text-[9px] font-bold text-slate-400">Admission</span>
                          </button>

                          <button
                            onClick={() => setActiveZone('building-b')}
                            className={`border-2 p-3 rounded-lg text-center flex flex-col items-center justify-center gap-1 transition relative ${
                              activeZone === 'building-b' 
                                ? 'border-amber-500 bg-amber-50/50 text-amber-800' 
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase">Building B</span>
                            <span className="text-[9px] font-bold text-slate-400">High School</span>
                          </button>
                        </div>

                        {/* Bottom Section (Cafeteria & Pool area) */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setActiveZone('facility-zones')}
                            className={`border-2 p-2.5 rounded-lg text-center transition flex items-center justify-center gap-1.5 ${
                              activeZone === 'facility-zones' 
                                ? 'border-rose-500 bg-rose-50 text-rose-800' 
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                            }`}
                          >
                            <span className="text-[10px] font-black">អាហារដ្ឋាន (Cafeteria)</span>
                          </button>
                          
                          <button
                            onClick={() => setActiveZone('facility-zones')}
                            className={`border-2 p-2.5 rounded-lg text-center transition flex items-center justify-center gap-1.5 ${
                              activeZone === 'facility-zones' 
                                ? 'border-rose-500 bg-rose-50 text-rose-800' 
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                            }`}
                          >
                            <span className="text-[10px] font-black">អាងហែលទឹក (Pool)</span>
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 text-[10px] text-slate-400 font-extrabold text-center flex items-center justify-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>សូមចុចលើតំបន់នីមួយៗលើប្លង់គំរូដើម្បីមើលការបញ្ជាក់លម្អិត</span>
                      </div>
                    </div>

                    {/* Dynamic legend detail block */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        ព័ត៌មានលម្អិតតាមតំបន់ (Campus Zone Details)
                      </span>

                      {(() => {
                        const zone = campusZones.find(z => z.id === activeZone) || campusZones[0];
                        return (
                          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs space-y-3.5">
                            <div className="flex items-start gap-2.5">
                              <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                              <div>
                                <h4 className="text-xs sm:text-sm font-black text-slate-800">{zone.name}</h4>
                                <span className="text-[10px] bg-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded-md inline-block mt-0.5">{zone.levels}</span>
                              </div>
                            </div>

                            <div className="space-y-1.5 text-xs">
                              <div>
                                <span className="text-slate-400 font-extrabold text-[10px] uppercase block">មាតិកា និងបន្ទប់រៀន (Inside Areas/Rooms):</span>
                                <span className="text-slate-700 font-bold">{zone.rooms}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-extrabold text-[10px] uppercase block">អ្នកគ្រប់គ្រង-សម្របសម្រួល (Supervisor in Charge):</span>
                                <span className="text-slate-750 font-black">{zone.head}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                  </div>
                </div>

                {/* Integration Info Box */}
                <div className="flex gap-2.5 bg-sky-50/50 border border-sky-100 p-4 rounded-2xl">
                  <Sparkles className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <h4 className="font-extrabold text-sky-900">ហេតុអ្វីត្រូវប្រើប្រាស់ឯកសារប្លង់សាលា PDF ផ្ទាល់ខ្លួន?</h4>
                    <p className="text-sky-800 text-[11px] font-medium leading-relaxed mt-1">
                      ព្រោះរាល់ពេលដើរត្រួតពិនិត្យអនាម័យ គិលានុបដ្ឋាយិកា ឬ ប្រព័ន្ធអគ្គិសនី-ទឹក បុគ្គលិកគ្រប់គ្រងអាចផ្អែកលើប្លង់លម្អិត ដើម្បីសម្គាល់ទីតាំងដែលមានបញ្ហា និងយកទៅកែតម្រូវបានក្នុងបន្ទប់ជាក់លាក់។
                    </p>
                  </div>
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
