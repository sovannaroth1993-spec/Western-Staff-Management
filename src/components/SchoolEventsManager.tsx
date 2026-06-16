import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Printer, 
  X, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Info,
  CalendarDays,
  FileText,
  User,
  Users,
  Settings,
  XCircle,
  TrendingUp,
  Download,
  AlertCircle
} from 'lucide-react';
import { SchoolEvent } from '../types';

interface SchoolEventsManagerProps {
  // We can add props here if we need, but standard self-contained using main localStorage sync is excellent.
}

const SEED_EVENTS: SchoolEvent[] = [
  {
    id: 'evt-1',
    no: 1,
    eventActivity: 'ពិធីបើកបវេសនកាលឆ្នាំសិក្សាថ្មី ២០២៦-២០២៧ (WIS Academic Year Opening 2026-2027)',
    date: '2026-08-10',
    involvement: 'សិស្សានុសិស្ស និងគណៈគ្រប់គ្រងទាំងអស់ (All Students & Management)',
    managedBy: 'ការិយាល័យសិក្សាធិការ (Academic Department)',
    remarks: 'ស្វាគមន៍សិស្សានុសិស្សសម្រាប់ឆមាសទី១ (Orientation day for high-school study guides)'
  },
  {
    id: 'evt-2',
    no: 2,
    eventActivity: 'កិច្ចប្រជុំអាណាព្យាបាលសិស្សលើកទី១ (1st Parents-Teacher Meeting)',
    date: '2026-09-12',
    involvement: 'អាណាព្យាបាលសិស្ស និងលោកគ្រូ-អ្នកគ្រូ (Parents & Core Faculty)',
    managedBy: 'លោកគ្រូបន្ទុកថ្នាក់ & រដ្ឋបាល (Homeroom Teachers & Admin)',
    remarks: 'ពិភាក្សាអំពីវឌ្ឍនភាពសិក្សារបស់សិស្សម្នាក់ៗ និងផែនការសិក្សាប្រចាំឆ្នាំ (SOP Guidelines)'
  },
  {
    id: 'evt-3',
    no: 3,
    eventActivity: 'ការប្រឡងពាក់កណ្តាលឆមាសទី១ (First Semester Midterm Exams)',
    date: '2026-10-19',
    involvement: 'សិស្សានុសិស្សកម្រិតទី១ ដល់ទី១២ (Grades 1 to 12 Students)',
    managedBy: 'គណៈកម្មការមេប្រឡង (Examination Committee)',
    remarks: 'ការវាយតម្លៃសមត្ថភាព និងចំណេះដឹងទូទៅដំណាក់កាលទី១'
  },
  {
    id: 'evt-4',
    no: 4,
    eventActivity: 'ទិវាបុណ្យប្រពៃណីអន្តរជាតិ និងហាលឡូវីន (WIS Halloween Culture Day)',
    date: '2026-10-30',
    involvement: 'សិស្ស មត្តេយ្យសិក្សា និងបឋមសិក្សា (Preschool & Primary Students)',
    managedBy: 'ក្រុមប្រឹក្សាយុវជនសាលា (WIS Student Council)',
    remarks: 'សកម្មភាពតុបតែងខ្លួន និងការសិក្សាពីវប្បធម៌អន្តរជាតិ (Acculturation & Fun Activities)'
  },
  {
    id: 'evt-5',
    no: 5,
    eventActivity: 'ទិវាកីឡាប្រចាំឆ្នាំសាលាវេស្ទើន (WIS Annual Sports Day)',
    date: '2026-11-20',
    involvement: 'បុគ្គលិក លោកគ្រូ-អ្នកគ្រូ និងសិស្សានុសិស្ស (All Staff, Faculty & Students)',
    managedBy: 'ផ្នែកអប់រំកាយ និងកីឡា (Physical Ed Department)',
    remarks: 'ការប្រកួតកីឡា ចម្រុះមិត្តភាព ដើម្បីបណ្តុះស្មារតីសាមគ្គីភាព និងសុខភាពមាំមួន'
  },
  {
    id: 'evt-6',
    no: 6,
    eventActivity: 'ការប្រឡងបញ្ចប់ឆមាសទី១ (First Semester Final Examinations)',
    date: '2027-01-11',
    involvement: 'សិស្សានុសិស្សគ្រប់កម្រិតថ្នាក់ (All Grades Students)',
    managedBy: 'គណៈគ្រប់គ្រងសិក្សាធិការ (Educational Board Directives)',
    remarks: 'បិទការវាយតម្លៃឆមាសទី១ និងការរៀបចំផ្ញើព្រឹត្តិបត្រពិន្ទុជូនអាណាព្យាបាល'
  },
  {
    id: 'evt-7',
    no: 7,
    eventActivity: 'ពិធីបុណ្យចូលឆ្នាំប្រពៃណីជាតិខ្មែរ (WIS Khmer New Year Celebration)',
    date: '2027-04-09',
    involvement: 'គណៈគ្រប់គ្រង លោកគ្រូអ្នកគ្រូ សិស្ស និងអាណាព្យាបាល (All WIS Campus Community)',
    managedBy: 'គណៈកម្មការវប្បធម៌ & រដ្ឋបាល (Cultural Committee & Admin)',
    remarks: 'ការសម្តែងរបាំប្រពៃណី លេងល្បែងប្រជាប្រិយខ្មែរ និងកម្មវិធីសប្បុរសធម៌ប្រចាំឆ្នាំ'
  },
  {
    id: 'evt-8',
    no: 8,
    eventActivity: 'ពិធីប្រគល់សញ្ញាបត្រ និងបញ្ចប់ការសិក្សាឆ្នាំ ២០២៧ (WIS Annual Graduation Ceremony 2027)',
    date: '2027-06-26',
    involvement: 'សិស្សបញ្ចប់ការសិក្សាថ្នាក់មត្តេយ្យ ទី៦ ទី៩ និងទី១២ (Graduating Cohorts)',
    managedBy: 'គណៈកម្មការរៀបចំព្រឹត្តិការណ៍សាលា (WIS Campus Events Committee)',
    remarks: 'ប្រារព្ធឡើងនៅសាលសន្និសីទធំ សាខាចំការដូង (WIS Grand Conference Hall) យ៉ាងឱឡារិក'
  }
];

export const SchoolEventsManager: React.FC<SchoolEventsManagerProps> = () => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [managedByFilter, setManagedByFilter] = useState('all');
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [eventActivity, setEventActivity] = useState('');
  const [date, setDate] = useState('');
  const [involvement, setInvolvement] = useState('');
  const [managedBy, setManagedBy] = useState('');
  const [remarks, setRemarks] = useState('');
  
  // Toast Alert Notification
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Custom dialog confirmations to bypass sandboxed iframe restrictions on system confirms
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load from database on startup
  useEffect(() => {
    const raw = window.localStorage.getItem('wis_school_events');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SchoolEvent[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sort by serial order or date
          setEvents(parsed.sort((a, b) => a.no - b.no));
        } else {
          setEvents(SEED_EVENTS);
          window.localStorage.setItem('wis_school_events', JSON.stringify(SEED_EVENTS));
        }
      } catch {
        setEvents(SEED_EVENTS);
        window.localStorage.setItem('wis_school_events', JSON.stringify(SEED_EVENTS));
      }
    } else {
      setEvents(SEED_EVENTS);
      window.localStorage.setItem('wis_school_events', JSON.stringify(SEED_EVENTS));
    }
  }, []);

  // Save changes to state and trigger window.localStorage custom synced setter
  const saveToStorage = (updatedList: SchoolEvent[]) => {
    // Re-adjust sequentially correct Serial 'no' for records
    const cleaned = updatedList
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item, index) => ({
        ...item,
        no: index + 1
      }));
    setEvents(cleaned);
    window.localStorage.setItem('wis_school_events', JSON.stringify(cleaned));
  };

  const showNotice = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotice({ text, type });
    setTimeout(() => {
      setNotice(null);
    }, 4500);
  };

  // Revert/Reset list to original seeds
  const handleResetToSeeds = () => {
    setShowResetConfirm(true);
  };

  const confirmResetToSeeds = () => {
    saveToStorage(SEED_EVENTS);
    showNotice('បានកំណត់ឡើងវិញជោគជ័យ! (Restored to default seeds successfully)', 'info');
    setShowResetConfirm(false);
  };

  const handleOpenAddForm = () => {
    setEditingId(null);
    setEventActivity('');
    setDate('');
    setInvolvement('');
    setManagedBy('');
    setRemarks('');
    setIsFormOpen(true);
  };

  const handleEditClick = (event: SchoolEvent) => {
    setEditingId(event.id);
    setEventActivity(event.eventActivity);
    setDate(event.date);
    setInvolvement(event.involvement);
    setManagedBy(event.managedBy);
    setRemarks(event.remarks);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      const filtered = events.filter(e => e.id !== deleteId);
      saveToStorage(filtered);
      showNotice('បានលុបសកម្មភាពដោយជោគជ័យ! (Deleted school activity record)', 'success');
      setDeleteId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventActivity.trim() || !date || !involvement.trim() || !managedBy.trim()) {
      showNotice('សូមបំពេញព័ត៌មានដែលចាំបាច់ទាំងអស់! (Please pack all required input fields)', 'error');
      return;
    }

    if (editingId) {
      // Edit mode
      const updated = events.map(evt => {
        if (evt.id === editingId) {
          return {
            ...evt,
            eventActivity: eventActivity.trim(),
            date,
            involvement: involvement.trim(),
            managedBy: managedBy.trim(),
            remarks: remarks.trim()
          };
        }
        return evt;
      });
      saveToStorage(updated);
      showNotice('បានកែប្រែព័ត៌មានសកម្មភាពដោយជោគជ័យ! (Updated activity successfully)', 'success');
    } else {
      // Add new
      const newEvent: SchoolEvent = {
        id: 'evt-' + Date.now(),
        no: events.length + 1,
        eventActivity: eventActivity.trim(),
        date,
        involvement: involvement.trim(),
        managedBy: managedBy.trim(),
        remarks: remarks.trim()
      };
      saveToStorage([...events, newEvent]);
      showNotice('បានបន្ថែមកម្មវិធីសកម្មភាពថ្មីដោយជោគជ័យ! (Created new school activity event)', 'success');
    }

    setIsFormOpen(false);
  };

  // Extract unique "Managed By" values for the filter dropdown
  const uniqueDepartments = Array.from(new Set(events.map(e => e.managedBy.split('(')[0].trim())));

  // Filters logic
  const filteredEvents = events.filter(evt => {
    const textMatch = 
      evt.eventActivity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.involvement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.managedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.remarks.toLowerCase().includes(searchQuery.toLowerCase());

    const deptMatch = managedByFilter === 'all' || evt.managedBy.toLowerCase().includes(managedByFilter.toLowerCase());
    return textMatch && deptMatch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in text-left font-sans">
      
      {/* Toast Notice Feedback */}
      {notice && (
        <div 
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border transition-all duration-300 max-w-sm ${
            notice.type === 'error' 
              ? 'bg-rose-50 border-rose-200 text-rose-900 shadow-rose-100'
              : notice.type === 'info'
              ? 'bg-sky-50 border-sky-200 text-sky-900 shadow-sky-100'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-emerald-100'
          }`}
        >
          {notice.type === 'error' ? (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : notice.type === 'info' ? (
            <Info className="w-5 h-5 text-sky-600 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <div>
            <p className="text-xs font-bold leading-relaxed">{notice.text}</p>
          </div>
        </div>
      )}

      {/* Primary Card Frame Frame container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Banner with signature school header background */}
        <div className="bg-gradient-to-r from-[#073B3A] to-[#042423] px-6 py-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-amber-400 p-3 rounded-2xl text-slate-950 shadow-md">
              <CalendarDays className="w-7 h-7" />
            </div>
            <div>
              <span className="bg-amber-400/20 text-amber-300 text-[9.5px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider border border-amber-400/25">
                Academic Year 2026-2027
              </span>
              <h1 className="text-lg md:text-xl font-bold tracking-tight mt-1 text-white">
                ផែនការសកម្មភាពសាលាប្រចាំឆ្នាំ (Annual School Events Plan)
              </h1>
              <p className="text-[10.5px] text-emerald-200/90 font-medium">
                តារាងគ្រោងសកម្មភាពសិក្សា ពិធីបុណ្យជាតិ-អន្តរជាតិ កិច្ចប្រជុំ និងព្រឹត្តិការណ៍នានារបស់សាលាវេស្ទើនអន្តរជាតិ
              </p>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenAddForm}
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.5px]" />
              <span>បន្ថែមសកម្មភាព (Add Event)</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-[#0c5150] hover:bg-[#106c6b] text-white border border-[#0d5c5a]/50 font-semibold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span>បោះពុម្ព (Print SOP Table)</span>
            </button>
            <button
              onClick={handleResetToSeeds}
              title="កំណត់ឡើងវិញនូវទិន្នន័យគំរូ"
              className="bg-slate-900/45 hover:bg-rose-950/40 text-emerald-100 hover:text-white font-semibold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1 transition-all duration-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>លំនាំដើម (Default Seeds)</span>
            </button>
          </div>
        </div>

        {/* Dynamic Matrix statistics bento layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/50">
          <div className="p-4 flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl text-[#073B3A]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">សកម្មភាពគ្រោងទុកសរុប (Total Events)</span>
              <span className="text-lg font-extrabold text-slate-800">{events.length}</span>
              <span className="text-[10px] text-emerald-700 font-bold ml-1.5 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100">Live Sync</span>
            </div>
          </div>
          <div className="p-4 flex items-center gap-3">
            <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">អ្នកដឹកនាំចែងចែកតាមផ្នែក (Management Groups)</span>
              <span className="text-lg font-extrabold text-slate-800">{uniqueDepartments.length}</span>
              <span className="text-[10px] text-amber-700 font-medium ml-1 bg-amber-50 px-1 py-0.5 rounded border border-amber-100">Departments list</span>
            </div>
          </div>
          <div className="p-4 flex items-center gap-3">
            <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">ឆ្នាំសិក្សាសកម្ម (Active Academic Year)</span>
              <span className="text-lg font-bold text-slate-800 font-mono">2026-2027</span>
              <span className="text-[10px] text-blue-700 font-bold ml-1.5 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">Current</span>
            </div>
          </div>
        </div>

        {/* Filter Area controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row items-center gap-3">
          
          {/* Query Filter */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ស្វែងរកក្នុងតារាងសកម្មភាព... (Search Event, Date, Involvement, Remarks...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 outline-hidden focus:border-[#073B3A] focus:ring-1 focus:ring-[#073B3A]/10 transition-all font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Department Filter dropdown */}
          <div className="w-full md:w-60 flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-500 whitespace-nowrap hidden sm:inline">ចម្រោះតាមផ្នែក៖</label>
            <select
              value={managedByFilter}
              onChange={(e) => setManagedByFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2.5 outline-hidden focus:border-[#073B3A] transition-all font-semibold"
            >
              <option value="all">បង្ហាញគ្រប់ផ្នែកទាំងអស់ (All Departments)</option>
              {uniqueDepartments.map((dept, i) => (
                <option key={i} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid Table Workspace */}
        <div className="overflow-x-auto min-w-full">
          <table className="min-w-full text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-[#073B3A] font-bold">
                <th className="px-4 py-3.5 text-center w-12 border-r border-slate-200 font-mono text-[11px]">No</th>
                <th className="px-4 py-3.5 text-left border-r border-slate-200">Event / Activity (ឈ្មោះសកម្មភាព)</th>
                <th className="px-4 py-3.5 text-left w-36 border-r border-slate-200">Date (កាលបរិច្ឆេទ)</th>
                <th className="px-4 py-3.5 text-left border-r border-slate-200">Involvement (អ្នកចូលរួម)</th>
                <th className="px-4 py-3.5 text-left w-48 border-r border-slate-200">Managed By (គ្រប់គ្រងដោយ)</th>
                <th className="px-4 py-3.5 text-left">Remarks (សេចក្តីណែនាំ/កត់សម្គាល់)</th>
                <th className="px-4 py-3.5 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((evt, index) => (
                  <tr 
                    key={evt.id} 
                    className="hover:bg-amber-400/5 transition-colors group align-top border-b border-slate-100"
                  >
                    {/* No Column */}
                    <td className="px-4 py-4 text-center font-mono font-bold text-slate-500 bg-slate-50 border-r border-slate-200 select-none">
                      {index + 1}
                    </td>

                    {/* Event/Activity Column */}
                    <td className="px-4 py-4 border-r border-slate-100">
                      <div className="font-bold text-slate-900 text-xs sm:text-[12.5px] leading-relaxed">
                        {evt.eventActivity}
                      </div>
                    </td>

                    {/* Date Column */}
                    <td className="px-4 py-4 border-r border-slate-100">
                      <div className="flex items-center gap-1 bg-[#073B3A]/5 text-[#073B3A] px-2.5 py-1 rounded-lg border border-[#0d5c5a]/10 max-w-max font-bold font-mono">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{evt.date}</span>
                      </div>
                    </td>

                    {/* Involvement Column */}
                    <td className="px-4 py-4 border-r border-slate-100">
                      <p className="font-semibold text-slate-800 leading-relaxed text-xs">
                        {evt.involvement}
                      </p>
                    </td>

                    {/* Managed By Column */}
                    <td className="px-4 py-4 border-r border-slate-100 text-slate-850">
                      <span className="inline-block bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[11px] border border-slate-200 leading-tight">
                        {evt.managedBy}
                      </span>
                    </td>

                    {/* Remarks Column */}
                    <td className="px-4 py-4 text-slate-500 leading-relaxed">
                      {evt.remarks || <span className="italic text-slate-300">គ្មានកំណត់សម្គាល់ (No remarks)</span>}
                    </td>

                    {/* Edit/Delete Actions */}
                    <td className="px-4 py-4 text-center select-none align-middle">
                      <div className="flex items-center justify-center gap-1 shadow-3xs rounded-lg p-0.5 max-w-max mx-auto bg-slate-5 relative">
                        <button
                          onClick={() => handleEditClick(evt)}
                          title="កែសម្រួលដោះស្រាយ (Edit)"
                          className="p-1 px-1.5 bg-white hover:bg-slate-100 text-slate-650 hover:text-slate-900 border border-slate-200 hover:border-slate-350 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(evt.id)}
                          title="លុបចោល (Delete)"
                          className="p-1 px-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 font-medium">
                    <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs">មិនមានទិន្នន័យស្រាវជ្រាវត្រូវនឹងពាក្យគន្លឹះរបស់អ្នកឡើយ!</p>
                    <p className="text-[10px] text-slate-350 mt-1">សូមព្យាយាមវាយពាក្យគន្លឹះផ្សេង ឬកំណត់ឡើងវិញ។ (No events matched your filter constraints)</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic bottom information statement area */}
        <div className="bg-[#073B3A]/5 border-t border-slate-150 p-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4.5 h-4.5 text-[#073B3A] shrink-0" />
            <span>
              <b>ការណែនាំ៖</b> រាល់ការកែប្រែក្នុងតារាងការគ្រោងទុកនេះ ត្រូវបានសមកាលកម្មដោយស្វ័យប្រវត្តិទៅកាន់ប្រព័ន្ធម៉ាស៊ីនពពក Cloud Database។
            </span>
          </div>
          <div className="font-mono text-[9px] font-semibold text-slate-400 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-lg select-none">
            WIS-SOP-V2.1 • EVENTS_DB
          </div>
        </div>
      </div>

      {/* Pop-up Overlay edit state Modal or Form Drawer block */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-[#041615]/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#073B3A] to-[#042423] p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="bg-amber-400 p-2 rounded-xl text-slate-905">
                  <CalendarDays className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {editingId ? 'កែសម្រួលគម្រោងសកម្មភាពសាលា (Edit School Event)' : 'បន្ថែមគម្រោងសកម្មភាពសាលា (Add New School Event)'}
                  </h3>
                  <p className="text-[10.5px] text-emerald-200/90 font-medium">បំពេញទិន្នន័យដើម្បីគ្រោងទុក និងសង្ខេបពត៌មានជាក់ស្តែង</p>
                </div>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Event Name Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700 block">
                  ឈ្មោះសកម្មភាព ឬព្រឹត្តិការណ៍សាលា <span className="text-red-500">*</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-1">(Event / Activity Name)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. ពិធីបើកឆ្នាំសិក្សានិងបង្រៀនសាកល្បងថ្នាក់ទី១២..."
                  value={eventActivity}
                  onChange={(e) => setEventActivity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:border-[#073B3A] focus:bg-white focus:outline-hidden transition-all"
                />
              </div>

              {/* Date & Managed By in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Date Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    កាលបរិច្ឆេទសកម្មភាព <span className="text-red-500">*</span>
                    <span className="text-[10px] text-slate-400 font-normal ml-1">(Activity Date)</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:border-[#073B3A] focus:bg-white focus:outline-hidden transition-all"
                  />
                </div>

                {/* Managed By Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    អ្នកទទួលបន្ទុក / ផ្នែកគ្រប់គ្រង <span className="text-red-500">*</span>
                    <span className="text-[10px] text-slate-400 font-normal ml-1">(Managed By)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. ការិយាល័យរដ្ឋបាល (Administration Office)"
                    value={managedBy}
                    onChange={(e) => setManagedBy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:border-[#073B3A] focus:bg-white focus:outline-hidden transition-all"
                    list="deptsList"
                  />
                  <datalist id="deptsList">
                    <option value="ការិយាល័យសិក្សាធិការ (Academic Department)" />
                    <option value="ការិយាល័យរដ្ឋបាល (Administration Department)" />
                    <option value="គណៈគ្រប់គ្រងសាលា (Campus Principal Office)" />
                    <option value="ក្រុមប្រឹក្សាយុវជនសាលា (WIS Student Council)" />
                    <option value="គណៈកម្មការវប្បធម៌ ល្បែងកម្សាន្ត (Cultural Committee)" />
                  </datalist>
                </div>
              </div>

              {/* Involvement Text Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700 block">
                  សិស្ស ឬបុគ្គលិកដែលត្រូវចូលរួម <span className="text-red-500">*</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-1">(Involvement Target)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. សិស្សានុសិស្សគ្រប់កម្រិតថ្នាក់ (All Students Grades K-12)..."
                  value={involvement}
                  onChange={(e) => setInvolvement(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:border-[#073B3A] focus:bg-white focus:outline-hidden transition-all"
                  list="involveList"
                />
                <datalist id="involveList">
                  <option value="សិស្សានុសិស្ស និងគណៈគ្រប់គ្រងទាំងអស់ (All Students & Management)" />
                  <option value="សិស្សានុសិស្សគ្រប់កម្រិតថ្នាក់ (All Grades Students)" />
                  <option value="សិស្ស មត្តេយ្យសិក្សា និងបឋមសិក្សា (KG & Primary Students)" />
                  <option value="បុគ្គលិក លោកគ្រូ-អ្នកគ្រូ និងសិស្ស (All Staff, Faculty & Students)" />
                  <option value="អាណាព្យាបាលសិស្ស និងលោកគ្រូ-អ្នកគ្រូ (Parents & Core Faculty)" />
                </datalist>
              </div>

              {/* Remarks Textarea */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700 block">
                  សេចក្តីណែនាំ / កំណត់សម្គាល់លម្អិត
                  <span className="text-[10px] text-slate-400 font-normal ml-1">(Remarks / Action Guidelines)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="សរសេរការណែនាំលម្អិត ទីតាំង សម្ភារៈត្រូវរៀបចំ ឬគោលបំណងកម្មវិធី..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:border-[#073B3A] focus:bg-white focus:outline-hidden transition-all resize-none"
                />
              </div>

              {/* Buttons Actions within Modal */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium text-xs transition cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#073B3A] hover:bg-[#0c5352] text-[#fff] rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4 text-emerald-300 stroke-[2.5px]" />
                  <span>រក្សាទុកព័ត៌មាន (Save Event)</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Deleting Events */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-[#041615]/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-rose-600 p-5 text-white flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl text-white">
                <Trash2 className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <div>
                <h3 className="font-bold text-sm font-moul">បញ្ជាក់ការលុបសកម្មភាព</h3>
                <p className="text-[10px] text-rose-100 font-medium font-sans">Delete School Event Confirmation</p>
              </div>
            </div>
            <div className="p-6 space-y-4 text-center font-sans">
              <p className="text-xs sm:text-sm font-semibold text-slate-805 leading-relaxed">
                តើលោកអ្នកប្រាកដជាចង់លុបសកម្មភាពសិក្សានេះចេញពីតារាងមែនទេ?
              </p>
              <div className="text-[11px] text-slate-500 font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-150 leading-relaxed text-left">
                {events.find(e => e.id === deleteId)?.eventActivity}
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-md"
                >
                  លុបចោល (Confirm Delete)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Resetting to Seeds */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-[#041615]/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-amber-500 p-5 text-slate-900 flex items-center gap-3">
              <div className="bg-slate-950/10 p-2 rounded-xl text-slate-900">
                <RotateCcw className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <div>
                <h3 className="font-bold text-sm font-moul">បញ្ជាក់ការកំណត់ឡើងវិញ</h3>
                <p className="text-[10px] text-amber-955 font-bold font-sans">Restore Default School Events</p>
              </div>
            </div>
            <div className="p-6 space-y-4 text-center font-sans">
              <p className="text-xs sm:text-sm font-semibold text-slate-805 leading-relaxed">
                តើលោកអ្នកប្រាកដជាចង់កំណត់ឡើងវិញនូវតារាងផែនការសកម្មភាពសាលាទៅជាលំនាំដើមរបស់សាលាដែរឬទេ?
              </p>
              <p className="text-[10.5px] text-amber-900 font-medium bg-amber-55/40 p-3.5 rounded-xl border border-amber-150 leading-relaxed text-left">
                សកម្មភាពថ្មីៗទាំងអស់ដែលអ្នកបានបន្ថែម ឬកែប្រែនឹងត្រូវជំនួសដោយសកម្មភាពលំនាំដើមរបស់សាលាមកវិញ។
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="button"
                  onClick={confirmResetToSeeds}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-605 text-slate-950 rounded-xl font-bold text-xs transition cursor-pointer shadow-md"
                >
                  យល់ព្រម (Yes, Restore Seeds)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded print styling specifically designed for high quality output */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-view, #print-view * {
            visibility: visible;
          }
          #print-view {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          /* Hide interactive action buttons when printing standard SOPs */
          th:last-child, td:last-child {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
};
