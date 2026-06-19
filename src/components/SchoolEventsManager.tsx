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
  FileSpreadsheet,
  FileImage,
  User,
  Users,
  Settings,
  XCircle,
  TrendingUp,
  Download,
  AlertCircle,
  Paperclip,
  Link2,
  ExternalLink,
  Share2,
  AlertTriangle
} from 'lucide-react';
import { SchoolEvent, UserAccount } from '../types';

interface SchoolEventsManagerProps {
  currentUser?: UserAccount | null;
}

const SEED_EVENTS: SchoolEvent[] = [
  {
    id: 'evt-1',
    no: 1,
    eventActivity: 'ពិធីបើកបវេសនកាលឆ្នាំសិក្សាថ្មី ២០២៦-២០២៧ (WIS Academic Year Opening 2026-2027)',
    date: '2026-08-10',
    involvement: 'សិស្សានុសិស្ស និងគណៈគ្រប់គ្រងទាំងអស់ (All Students & Management)',
    managedBy: 'ការិយាល័យសិក្សាធិការ (Academic Department)',
    remarks: 'ស្វាគមន៍សិស្សានុសិស្សសម្រាប់ឆមាសទី១ (Orientation day for high-school study guides)',
    attachments: [
      { name: 'WIS_Academic_Calendar_2026_2027.pdf', url: 'https://example.com/docs/calendar.pdf', size: '1.2 MB', type: 'application/pdf' }
    ],
    otherLinks: [
      { name: 'Student Orientation slides', url: 'https://example.com/orientation', description: 'Google Slides presentation for new students' }
    ]
  },
  {
    id: 'evt-2',
    no: 2,
    eventActivity: 'កិច្ចប្រជុំអាណាព្យាបាលសិស្សលើកទី១ (1st Parents-Teacher Meeting)',
    date: '2026-09-12',
    involvement: 'អាណាព្យាបាលសិស្ស និងលោកគ្រូ-អ្នកគ្រូ (Parents & Core Faculty)',
    managedBy: 'លោកគ្រូបន្ទុកថ្នាក់ & រដ្ឋបាល (Homeroom Teachers & Admin)',
    remarks: 'ពិភាក្សាអំពីវឌ្ឍនភាពសិក្សារបស់សិស្សម្នាក់ៗ និងផែនការសិក្សាប្រចាំឆ្នាំ (SOP Guidelines)',
    attachments: [
      { name: 'Meeting_Agenda_SOP.pdf', url: 'https://example.com/docs/agenda.pdf', size: '450 KB', type: 'application/pdf' },
      { name: 'Parent_Handbook_V3.pdf', url: 'https://example.com/docs/parent_handbook.pdf', size: '2.4 MB', type: 'application/pdf' }
    ],
    otherLinks: [
      { name: 'Telegram RSVP Channel', url: 'https://t.me/wis_rsvp_bot', description: 'RSVP channel to record attendance' }
    ]
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

// ISO Date Helper to extract the academic year of an event (WIS runs Sept 1st to Aug 31st)
const getEventAcademicYear = (eventDate: string): string => {
  if (!eventDate) return '2026-2027';
  const d = new Date(eventDate);
  if (isNaN(d.getTime())) return '2026-2027';
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // Month is 0-indexed
  if (month >= 9) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

// Helper to determine the icon, color, and classes for file attachments based on extension or type
const getAttachmentIconAndColor = (name: string, type?: string) => {
  const lower = name.toLowerCase();
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || (type && (type.includes('spreadsheet') || type.includes('excel') || type.includes('sheet')))) {
    return {
      icon: <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />,
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70',
      badgeBg: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-155 border-emerald-250',
      tag: 'Excel document'
    };
  }
  if (lower.endsWith('.doc') || lower.endsWith('.docx') || (type && (type.includes('word') || type.includes('document')))) {
    return {
      icon: <FileText className="w-3.5 h-3.5 shrink-0 block" />,
      bg: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/70',
      badgeBg: 'bg-blue-100 text-blue-800 hover:bg-blue-155 border-blue-250',
      tag: 'Word document'
    };
  }
  if (lower.endsWith('.pdf') || (type && type.includes('pdf'))) {
    return {
      icon: <FileText className="w-3.5 h-3.5 shrink-0" />,
      bg: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/70',
      badgeBg: 'bg-rose-100 text-rose-800 hover:bg-rose-155 border-rose-250',
      tag: 'PDF document'
    };
  }
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp') || lower.endsWith('.gif') || (type && type.includes('image'))) {
    return {
      icon: <FileImage className="w-3.5 h-3.5 shrink-0" />,
      bg: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70',
      badgeBg: 'bg-amber-100 text-amber-805 hover:bg-amber-155 border-amber-250',
      tag: 'Image format'
    };
  }
  return {
    icon: <Paperclip className="w-3.5 h-3.5 shrink-0" />,
    bg: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100/70',
    badgeBg: 'bg-sky-100 text-sky-805 hover:bg-sky-155 border-sky-250',
    tag: 'Attached document'
  };
};

const STANDARD_DEPTS = [
  'SA, SP, Admin & Academic',
  'Campus',
  'English Dept., SA & Coordinators',
  'Khmer Dept., SA & Coordinators',
  'Academics, SP, Admin & SA',
  'Operations & Academics',
  'GEP & Admin',
  'SA, Admin & Registrar',
  'IR, Operations',
  'SP, Registrar, Academics'
];

export const SchoolEventsManager: React.FC<SchoolEventsManagerProps> = ({ currentUser }) => {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [managedByFilter, setManagedByFilter] = useState('all');

  // Academic Years state
  const [activeAcademicYear, setActiveAcademicYear] = useState<string>(() => {
    return window.localStorage.getItem('wis_active_academic_year') || '2026-2027';
  });
  const [academicYears, setAcademicYears] = useState<string[]>(() => {
    const saved = window.localStorage.getItem('wis_academic_years');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return ['2025-2026', '2026-2027', '2027-2028', '2028-2029'];
  });
  
  // Year Filter choice
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>(() => {
    return window.localStorage.getItem('wis_active_academic_year') || '2026-2027';
  });

  // Manage Years modal states
  const [showYearModal, setShowYearModal] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');
  const [editingYearIndex, setEditingYearIndex] = useState<number | null>(null);
  const [editingYearValue, setEditingYearValue] = useState('');
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [eventActivity, setEventActivity] = useState('');
  const [date, setDate] = useState('');
  const [involvement, setInvolvement] = useState('');
  const [managedBy, setManagedBy] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  
  // Toast Alert Notification
  const [notice, setNotice] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Custom dialog confirmations to bypass sandboxed iframe restrictions on system confirms
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{
    type: 'attachment' | 'link';
    eventId: string;
    index: number;
    name: string;
  } | null>(null);

  // Attachment & Link Manager modal states
  const [managedEventAttachments, setManagedEventAttachments] = useState<SchoolEvent | null>(null);
  const [managedEventLinks, setManagedEventLinks] = useState<SchoolEvent | null>(null);

  // Form input states for attachments
  const [newAttachName, setNewAttachName] = useState('');
  const [newAttachUrl, setNewAttachUrl] = useState('');
  const [newAttachSize, setNewAttachSize] = useState('1.5 MB');

  // Form input states for links
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkDesc, setNewLinkDesc] = useState('');

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
    setIsCustomSelected(false);
    setIsFormOpen(true);
  };

  const handleEditClick = (event: SchoolEvent) => {
    setEditingId(event.id);
    setEventActivity(event.eventActivity);
    setDate(event.date);
    setInvolvement(event.involvement);
    setManagedBy(event.managedBy);
    setRemarks(event.remarks);
    setIsCustomSelected(!STANDARD_DEPTS.includes(event.managedBy) && event.managedBy !== '');
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
          const isAdmin = currentUser?.role === 'admin';
          if (!isAdmin && evt.createdBy && evt.createdBy !== currentUser?.username) {
            return evt;
          }
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
        remarks: remarks.trim(),
        createdBy: currentUser?.username || 'admin'
      };
      saveToStorage([...events, newEvent]);
      showNotice('បានបន្ថែមកម្មវិធីសកម្មភាពថ្មីដោយជោគជ័យ! (Created new school activity event)', 'success');
    }

    setIsFormOpen(false);
  };

  // Attachment management methods
  const handleAddAttachment = (eventId: string) => {
    if (!newAttachName.trim() || !newAttachUrl.trim()) {
      showNotice('សូមវាយបញ្ចូលឈ្មោះ និងតំណភ្ជាប់ឯកសារ! (Please enter both file name and url)', 'error');
      return;
    }
    
    let formattedUrl = newAttachUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const updated = events.map(evt => {
      if (evt.id === eventId) {
        const existing = evt.attachments || [];
        const updatedAttachs = [
          ...existing,
          {
            name: newAttachName.trim(),
            url: formattedUrl,
            size: newAttachSize.trim() || '1.5 MB',
            type: newAttachName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'
          }
        ];
        
        // Update the active modal state
        setTimeout(() => {
          setManagedEventAttachments({
            ...evt,
            attachments: updatedAttachs
          });
        }, 0);

        return {
          ...evt,
          attachments: updatedAttachs
        };
      }
      return evt;
    });

    saveToStorage(updated);
    setNewAttachName('');
    setNewAttachUrl('');
    setNewAttachSize('1.5 MB');
    showNotice('បានផ្ដល់ឯកសារភ្ជាប់ដោយជោគជ័យ! (Added file attachment successfully)', 'success');
  };

  const handleRemoveAttachment = (eventId: string, index: number) => {
    const updated = events.map(evt => {
      if (evt.id === eventId) {
        const existing = evt.attachments || [];
        const updatedAttachs = existing.filter((_, idx) => idx !== index);
        
        // Update active modal state
        setTimeout(() => {
          setManagedEventAttachments({
            ...evt,
            attachments: updatedAttachs
          });
        }, 0);

        return {
          ...evt,
          attachments: updatedAttachs
        };
      }
      return evt;
    });
    saveToStorage(updated);
    showNotice('បានលុបឯកសារភ្ជាប់ដោយជោគជ័យ! (Removed attachment successfully)', 'info');
  };

  // Other Link management methods
  const handleAddLink = (eventId: string) => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) {
      showNotice('សូមវាយបញ្ចូលឈ្មោះ និង URL តំណភ្ជាប់! (Please enter both a label and URL link)', 'error');
      return;
    }

    let formattedUrl = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const updated = events.map(evt => {
      if (evt.id === eventId) {
        const existing = evt.otherLinks || [];
        const updatedLinks = [
          ...existing,
          {
            name: newLinkLabel.trim(),
            url: formattedUrl,
            description: newLinkDesc.trim()
          }
        ];

        // Update active modal state
        setTimeout(() => {
          setManagedEventLinks({
            ...evt,
            otherLinks: updatedLinks
          });
        }, 0);

        return {
          ...evt,
          otherLinks: updatedLinks
        };
      }
      return evt;
    });

    saveToStorage(updated);
    setNewLinkLabel('');
    setNewLinkUrl('');
    setNewLinkDesc('');
    showNotice('បានបន្ថែមតំណភ្ជាប់ទទួលបានជោគជ័យ! (Added other link successfully)', 'success');
  };

  const handleRemoveLink = (eventId: string, index: number) => {
    const updated = events.map(evt => {
      if (evt.id === eventId) {
        const existing = evt.otherLinks || [];
        const updatedLinks = existing.filter((_, idx) => idx !== index);

        // Update active modal state
        setTimeout(() => {
          setManagedEventLinks({
            ...evt,
            otherLinks: updatedLinks
          });
        }, 0);

        return {
          ...evt,
          otherLinks: updatedLinks
        };
      }
      return evt;
    });
    saveToStorage(updated);
    showNotice('បានលុបតំណភ្ជាប់ដោយជោគជ័យ! (Removed link successfully)', 'info');
  };

  // Academic Year Management Handlers
  const handleAddAcademicYear = () => {
    const formatted = newYearInput.trim();
    if (!formatted) {
      showNotice('សូមបញ្ចូលឆ្នាំសិក្សា! (Please enter an academic year)', 'error');
      return;
    }
    // Check format YYYY-YYYY (e.g. 2026-2027)
    if (!/^\d{4}-\d{4}$/.test(formatted)) {
      showNotice('ទម្រង់ឆ្នាំសិក្សាមិនត្រឹមត្រូវទេ! ឧទាហរណ៍៖ 2026-2027 (Format must be YYYY-YYYY, e.g. 2026-2027)', 'error');
      return;
    }
    if (academicYears.includes(formatted)) {
      showNotice('ឆ្នាំសិក្សានេះមានរួចហើយ! (This academic year already exists)', 'error');
      return;
    }
    const updated = [...academicYears, formatted].sort();
    setAcademicYears(updated);
    window.localStorage.setItem('wis_academic_years', JSON.stringify(updated));
    setNewYearInput('');
    showNotice('បានបញ្ចូលឆ្នាំសិក្សាថ្មីដោយជោគជ័យ! (Added new academic year successfully)', 'success');
  };

  const handleUpdateAcademicYear = (index: number) => {
    const formatted = editingYearValue.trim();
    if (!formatted) {
      showNotice('សូមបញ្ចូលឆ្នាំសិក្សា! (Please enter an academic year)', 'error');
      return;
    }
    if (!/^\d{4}-\d{4}$/.test(formatted)) {
      showNotice('ទម្រង់ឆ្នាំសិក្សាមិនត្រឹមត្រូវទេ! ឧទាហរណ៍៖ 2026-2027 (Format must be YYYY-YYYY, e.g. 2026-2027)', 'error');
      return;
    }
    const oldYear = academicYears[index];
    const updated = [...academicYears];
    updated[index] = formatted;
    updated.sort();
    setAcademicYears(updated);
    window.localStorage.setItem('wis_academic_years', JSON.stringify(updated));
    
    // If the edited year was active or selected filter, update them too
    if (activeAcademicYear === oldYear) {
      setActiveAcademicYear(formatted);
      window.localStorage.setItem('wis_active_academic_year', formatted);
    }
    if (selectedYearFilter === oldYear) {
      setSelectedYearFilter(formatted);
    }
    
    setEditingYearIndex(null);
    setEditingYearValue('');
    showNotice('បានកែប្រែឆ្នាំសិក្សាដោយជោគជ័យ! (Updated academic year successfully)', 'success');
  };

  const handleSelectActiveYear = (year: string) => {
    setActiveAcademicYear(year);
    window.localStorage.setItem('wis_active_academic_year', year);
    setSelectedYearFilter(year); // Automatically set filter to the activated year too
    showNotice(`បានផ្លាស់ប្ដូរឆ្នាំសិក្សាសកម្មទៅជា៖ ${year} (Changed active year to: ${year})`, 'success');
  };

  const handleDeleteAcademicYear = (year: string) => {
    if (academicYears.length <= 1) {
      showNotice('មិនអាចលុបបានទេ! ត្រូវតែមានឆ្នាំសិក្សាយ៉ាងហោចណាស់មួយ។ (Cannot delete! There must be at least one academic year.)', 'error');
      return;
    }
    const updated = academicYears.filter(y => y !== year);
    setAcademicYears(updated);
    window.localStorage.setItem('wis_academic_years', JSON.stringify(updated));
    if (activeAcademicYear === year) {
      const nextActive = updated[0];
      setActiveAcademicYear(nextActive);
      window.localStorage.setItem('wis_active_academic_year', nextActive);
      if (selectedYearFilter === year) {
        setSelectedYearFilter(nextActive);
      }
    } else if (selectedYearFilter === year) {
      setSelectedYearFilter('all');
    }
    showNotice('បានលុបឆ្នាំសិក្សាដោយជោគជ័យ! (Deleted academic year successfully)', 'info');
  };

  // Extract unique "Managed By" values for the filter dropdown
  const uniqueDepartments = Array.from(new Set(events.map(e => e.managedBy.split('(')[0].trim())));

  // Filters logic
  const filteredEvents = events.filter(evt => {
    const isAdmin = currentUser?.role === 'admin';
    if (!isAdmin && evt.createdBy !== currentUser?.username) {
      return false;
    }

    const textMatch = 
      evt.eventActivity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.involvement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.managedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.remarks.toLowerCase().includes(searchQuery.toLowerCase());

    const deptMatch = managedByFilter === 'all' || evt.managedBy.toLowerCase().includes(managedByFilter.toLowerCase());

    // Academic Year Filter match
    const eventYear = getEventAcademicYear(evt.date);
    const yearMatch = selectedYearFilter === 'all' || eventYear === selectedYearFilter;

    return textMatch && deptMatch && yearMatch;
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
              <button
                onClick={() => setShowYearModal(true)}
                className="inline-flex bg-amber-400/20 hover:bg-amber-400/35 text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider border border-amber-400/25 transition cursor-pointer"
                title="គ្រប់គ្រងឆ្នាំសិក្សា (Manage Academic Years)"
              >
                Academic Year {activeAcademicYear}
              </button>
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
            {currentUser?.role === 'admin' && (
              <button
                onClick={handleResetToSeeds}
                title="កំណត់ឡើងវិញនូវទិន្នន័យគំរូ"
                className="bg-slate-900/45 hover:bg-rose-950/40 text-emerald-100 hover:text-white font-semibold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1 transition-all duration-200 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>លំនាំដើម (Default Seeds)</span>
              </button>
            )}
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
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">ឆ្នាំសិក្សាសកម្ម (Active Academic Year)</span>
                <span className="text-lg font-bold text-slate-800 font-mono tracking-wide">{activeAcademicYear}</span>
                <span className="text-[10.5px] text-blue-700 font-bold ml-1.5 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">Current</span>
              </div>
            </div>
            <button
              onClick={() => setShowYearModal(true)}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-[10px] font-black transition cursor-pointer shrink-0"
              title="កែប្រែឆ្នាំសិក្សាសកម្ម ឬបន្ថែមឆ្នាំសិក្សាថ្មី"
            >
              កែប្រែ / បន្ថែម (Update)
            </button>
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
          <div className="w-full md:w-56 flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-500 whitespace-nowrap hidden sm:inline">ចម្រោះតាមផ្នែក៖</label>
            <select
              value={managedByFilter}
              onChange={(e) => setManagedByFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-705 text-xs rounded-xl px-3 py-2.5 outline-hidden focus:border-[#073B3A] transition-all font-semibold"
            >
              <option value="all">បង្ហាញគ្រប់ផ្នែក (All Departments)</option>
              {uniqueDepartments.map((dept, i) => (
                <option key={i} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Academic Year Filter dropdown */}
          <div className="w-full md:w-52 flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-500 whitespace-nowrap hidden sm:inline">ឆ្នាំសិក្សា៖</label>
            <select
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-705 text-xs rounded-xl px-3 py-2.5 outline-hidden focus:border-[#073B3A] transition-all font-semibold font-sans font-mono"
            >
              <option value="all">ឆ្នាំសិក្សាទាំងអស់ (All Years)</option>
              {academicYears.map((yr, i) => (
                <option key={i} value={yr}>ឆ្នាំសិក្សា {yr}</option>
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
                      {((evt.attachments && evt.attachments.length > 0) || (evt.otherLinks && evt.otherLinks.length > 0)) && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {evt.attachments?.map((att, i) => {
                            const info = getAttachmentIconAndColor(att.name, att.type);
                            return (
                              <a
                                key={`att-${i}`}
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                title={`ទាញយកឯកសារភ្ជាប់៖ ${att.name} (${att.size || '1.5 MB'}) - ${info.tag}`}
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold transition duration-155 cursor-pointer ${info.bg}`}
                              >
                                {info.icon}
                                <span className="max-w-[130px] truncate">{att.name}</span>
                              </a>
                            );
                          })}
                          {evt.otherLinks?.map((lnk, i) => (
                            <a
                              key={`lnk-${i}`}
                              href={lnk.url}
                              target="_blank"
                              rel="noreferrer"
                              title={lnk.description || lnk.name}
                              className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200 text-[10px] font-bold transition duration-150 cursor-pointer"
                            >
                              <Link2 className="w-2.5 h-2.5 shrink-0" />
                              <span className="max-w-[125px] truncate">{lnk.name}</span>
                            </a>
                          ))}
                        </div>
                      )}
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
                        
                        {/* Attachments Trigger Button */}
                        <button
                          onClick={() => setManagedEventAttachments(evt)}
                          title="គ្រប់គ្រងឯកសារភ្ជាប់ (Manage File Attachments)"
                          className={`p-1 px-1.5 rounded-lg border transition relative cursor-pointer ${
                            evt.attachments && evt.attachments.length > 0
                              ? 'bg-sky-50 text-sky-600 border-sky-250 hover:bg-sky-100 hover:text-sky-700'
                              : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600'
                          }`}
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          {evt.attachments && evt.attachments.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-sky-600 text-white text-[8px] font-black px-1.2 py-0.2 rounded-full border border-white leading-none scale-90">
                              {evt.attachments.length}
                            </span>
                          )}
                        </button>

                        {/* Other Links Trigger Button */}
                        <button
                          onClick={() => setManagedEventLinks(evt)}
                          title="គ្រប់គ្រងតំណភ្ជាប់ក្រៅ (Manage Other Links)"
                          className={`p-1 px-1.5 rounded-lg border transition relative cursor-pointer ${
                            evt.otherLinks && evt.otherLinks.length > 0
                              ? 'bg-indigo-50 text-indigo-600 border-indigo-250 hover:bg-indigo-100 hover:text-indigo-700'
                              : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600'
                          }`}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          {evt.otherLinks && evt.otherLinks.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[8px] font-black px-1.2 py-0.2 rounded-full border border-white leading-none scale-90">
                              {evt.otherLinks.length}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => handleDelete(evt.id)}
                          title="លុបចោល (Delete)"
                          className="p-1 px-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition cursor-pointer"
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
                  <select
                    required
                    value={isCustomSelected ? 'custom' : (STANDARD_DEPTS.includes(managedBy) ? managedBy : '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        setIsCustomSelected(true);
                        setManagedBy('');
                      } else {
                        setIsCustomSelected(false);
                        setManagedBy(val);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:border-[#073B3A] focus:bg-white focus:outline-hidden transition-all"
                  >
                    <option value="" disabled>-- ជ្រើសរើសផ្នែកគ្រប់គ្រង --</option>
                    {STANDARD_DEPTS.map((dept, i) => (
                      <option key={i} value={dept}>{dept}</option>
                    ))}
                    <option value="custom">ផ្សេងៗ / Custom Input...</option>
                  </select>

                  {isCustomSelected && (
                    <div className="pt-1.5 animate-fade-in">
                      <input
                        type="text"
                        required
                        placeholder="បញ្ចូលឈ្មោះផ្នែកគ្រប់គ្រងផ្ទាល់ខ្លួន..."
                        value={managedBy}
                        onChange={(e) => setManagedBy(e.target.value)}
                        className="w-full bg-white border border-[#073B3A] text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-hidden transition-all"
                      />
                    </div>
                  )}
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

      {/* Manage Academic Years Modal */}
      {showYearModal && (
        <div className="fixed inset-0 bg-[#041615]/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#073B3A] to-[#042423] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-400 p-2 rounded-xl text-slate-900">
                  <TrendingUp className="w-5 h-5 stroke-[2px]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[14px] uppercase tracking-wider text-amber-300">
                    គ្រប់គ្រងឆ្នាំសិក្សា (Academic Year)
                  </h3>
                  <p className="text-[10px] text-emerald-200 uppercase font-sans font-bold">
                    Configure Active School Year
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowYearModal(false);
                  setEditingYearIndex(null);
                }}
                className="text-slate-400 hover:text-white px-2 py-1 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Active Year Highlight banner */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-600 font-extrabold block uppercase tracking-wider">ឆ្នាំសិក្សាសកម្មបច្ចុប្បន្ន</span>
                  <span className="text-base font-extrabold text-emerald-950 font-mono tracking-wide">{activeAcademicYear}</span>
                </div>
                <span className="bg-emerald-650 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-sans">
                  Active Year
                </span>
              </div>

              {/* Add New Academic Year Form section */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide block">
                  បញ្ចូលឆ្នាំសិក្សាថ្មី (Add New Year)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="ឧ. 2027-2028"
                    value={newYearInput}
                    onChange={(e) => setNewYearInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-805 text-xs rounded-xl px-3.5 py-2 outline-hidden focus:border-[#073B3A] focus:bg-white transition-all font-mono font-bold tracking-wider text-center"
                  />
                  <button
                    type="button"
                    onClick={handleAddAcademicYear}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-xs border border-emerald-600"
                  >
                    បន្ថែម (Add)
                  </button>
                </div>
                <p className="text-[9.5px] text-slate-400 italic">
                  * ត្រូវប្រើប្រាស់ទ្រង់ទ្រាយ YYYY-YYYY (ឧទាហរណ៍៖ 2027-2028)
                </p>
              </div>

              {/* List of Academic Years with Actions */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide block">
                  បញ្ជីឆ្នាំសិក្សា (Available Years)
                </label>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-3xl bg-slate-50/10">
                  {academicYears.map((yr, idx) => {
                    const isActive = yr === activeAcademicYear;
                    const isEditingThis = editingYearIndex === idx;

                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3.5 transition-colors ${
                          isActive ? 'bg-amber-400/5' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        {isEditingThis ? (
                          <div className="flex-1 flex gap-2 pr-2">
                            <input
                              type="text"
                              value={editingYearValue}
                              onChange={(e) => setEditingYearValue(e.target.value)}
                              className="flex-1 min-w-0 bg-white border border-[#073B3A] text-slate-805 text-xs rounded-xl px-3 py-1.5 font-mono font-bold text-center tracking-wider"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateAcademicYear(idx)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl transition cursor-pointer"
                            >
                              រក្សាទុក
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingYearIndex(null)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold text-[10px] px-3 py-1.5 rounded-xl transition cursor-pointer"
                            >
                              បោះបង់
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-slate-800 font-mono tracking-wide">
                                {yr}
                              </span>
                              {isActive && (
                                <span className="bg-amber-100 text-amber-850 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">
                                  Active
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Select as Active */}
                              {!isActive && (
                                <button
                                  type="button"
                                  onClick={() => handleSelectActiveYear(yr)}
                                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-100 transition cursor-pointer"
                                  title="កំណត់ជាឆ្នាំសិក្សាសកម្ម"
                                >
                                  កំណត់ជាសកម្ម
                                </button>
                              )}

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingYearIndex(idx);
                                  setEditingYearValue(yr);
                                }}
                                className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition cursor-pointer border border-transparent"
                                title="កែប្រែឆ្នាំនេះ"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteAcademicYear(yr)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-705 rounded-lg transition cursor-pointer border border-transparent"
                                title="លុបឆ្នាំនេះចេញ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowYearModal(false);
                  setEditingYearIndex(null);
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl font-bold text-xs transition cursor-pointer"
              >
                រួចរាល់ (Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Deleting Attachments / Links */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in font-sans">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-rose-50 p-5 text-rose-650 flex items-center gap-3 border-b border-rose-100">
              <div className="bg-rose-100 p-2 rounded-xl text-rose-600">
                <AlertTriangle className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <div>
                <h3 className="font-extrabold text-[13px] uppercase tracking-wider text-rose-650">
                  {deleteConfirmItem.type === 'attachment' ? 'លុបឯកសារភ្ជាប់' : 'លុបតំណភ្ជាប់'}
                </h3>
                <p className="text-[9px] text-rose-500 font-bold tracking-wider uppercase font-sans">
                  {deleteConfirmItem.type === 'attachment' ? 'Confirm File Removal' : 'Confirm Link Removal'}
                </p>
              </div>
            </div>
            <div className="p-6 space-y-4 text-center font-sans">
              <p className="text-xs sm:text-[13px] font-bold text-slate-705 leading-relaxed">
                {deleteConfirmItem.type === 'attachment'
                  ? 'តើលោកអ្នកប្រាកដជាចង់លុបឯកសារភ្ជាប់នេះពិតប្រាកដមែនទេ?'
                  : 'តើលោកអ្នកប្រាកដជាចង់លុបតំណភ្ជាប់នេះពិតប្រាកដមែនទេ?'}
              </p>
              <div className="text-[11px] font-mono font-bold text-slate-600 bg-slate-55 p-3.5 rounded-xl border border-slate-150 leading-relaxed text-center break-all">
                {deleteConfirmItem.name}
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmItem(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteConfirmItem.type === 'attachment') {
                      handleRemoveAttachment(deleteConfirmItem.eventId, deleteConfirmItem.index);
                    } else {
                      handleRemoveLink(deleteConfirmItem.eventId, deleteConfirmItem.index);
                    }
                    setDeleteConfirmItem(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-extrabold text-xs transition cursor-pointer shadow-md"
                >
                  យល់ព្រមលុប (Yes, Delete)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Attachments Modal */}
      {managedEventAttachments && (
        <div className="fixed inset-0 bg-[#041615]/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-800 to-sky-950 p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="bg-amber-400 p-2 rounded-xl text-slate-900 shrink-0">
                  <Paperclip className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">
                    គ្រប់គ្រងឯកសារភ្ជាប់ (Manage File Attachments)
                  </h3>
                  <p className="text-[10px] text-sky-100/90 font-medium truncate">សម្រាប់៖ {managedEventAttachments.eventActivity}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setManagedEventAttachments(null);
                  setNewAttachName('');
                  setNewAttachUrl('');
                }}
                className="text-white hover:bg-white/10 p-1.5 rounded-lg transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-left">
              {/* Existing List */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">ឯកសារភ្ជាប់បច្ចុប្បន្ន (Current Attachments)</h4>
                {(!managedEventAttachments.attachments || managedEventAttachments.attachments.length === 0) ? (
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
                    <Paperclip className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-semibold">មិនមានឯកសារភ្ជាប់នៅឡើយទេ។ (No attachments present)</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {managedEventAttachments.attachments.map((att, idx) => {
                      const info = getAttachmentIconAndColor(att.name, att.type);
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`p-2 rounded-lg shrink-0 border ${info.bg}`}>
                              {info.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate" title={att.name}>{att.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-400 font-mono font-bold">{att.size || '1.5 MB'}</span>
                                <span className={`text-[8.5px] px-1.5 py-0.2 rounded-sm border uppercase font-sans font-extrabold tracking-wider scale-95 origin-left ${info.bg}`}>{info.tag}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a 
                              href={att.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-1 px-2.5 bg-sky-650 hover:bg-sky-700 text-white rounded-lg text-[10px] font-extrabold transition cursor-pointer"
                            >
                              បើក (Open)
                            </a>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmItem({
                                type: 'attachment',
                                eventId: managedEventAttachments.id,
                                index: idx,
                                name: att.name
                              })}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition cursor-pointer"
                              title="លុបឯកសារភ្ជាប់ (Delete Attachment)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add New Attachment Form */}
              <div className="border-t border-slate-150 pt-4 space-y-3">
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">បន្ថែមឯកសារភ្ជាប់ថ្មី (Add New Attachment)</h4>
                
                <div className="space-y-3 p-4 bg-[#073B3A]/5 border border-slate-150 rounded-2xl">
                  {/* File Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 block">
                      ឈ្មោះឯកសារ (Document Name) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ឧ. សៀវភៅណែនាំ-តម្រង់ទិស-WIS.pdf"
                      value={newAttachName}
                      onChange={(e) => setNewAttachName(e.target.value)}
                      className="w-full bg-white border border-slate-250 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:border-[#073B3A] focus:outline-hidden focus:ring-1 focus:ring-[#073B3A] transition-all"
                    />
                  </div>

                  {/* URL / Path */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 block">
                      តំណភ្ជាប់ឯកសារ (File URL / Document Link) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://example.com/docs/guidelines.pdf"
                      value={newAttachUrl}
                      onChange={(e) => setNewAttachUrl(e.target.value)}
                      className="w-full bg-white border border-slate-250 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:border-[#073B3A] focus:outline-hidden focus:ring-1 focus:ring-[#073B3A] transition-all"
                    />
                  </div>

                  {/* Size Preset Selection */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1.5 font-sans">
                      <label className="text-[10px] font-bold text-slate-600 block">ទំហំឯកសារ (File Size)</label>
                      <select
                        value={newAttachSize}
                        onChange={(e) => setNewAttachSize(e.target.value)}
                        className="w-full bg-white border border-slate-250 text-slate-700 text-xs rounded-xl px-3 py-2 outline-hidden focus:border-[#073B3A]"
                      >
                        <option value="550 KB">550 KB</option>
                        <option value="1.2 MB">1.2 MB</option>
                        <option value="2.5 MB">2.5 MB</option>
                        <option value="4.8 MB">4.8 MB</option>
                        <option value="10.4 MB">10.4 MB</option>
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleAddAttachment(managedEventAttachments.id)}
                        className="w-full py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                      >
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>ភ្ជាប់ឯកសារ (Attach File)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setManagedEventAttachments(null);
                  setNewAttachName('');
                  setNewAttachUrl('');
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                រួចរាល់ (Done)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Manage Other Links Modal */}
      {managedEventLinks && (
        <div className="fixed inset-0 bg-[#041615]/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-800 to-indigo-950 p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="bg-amber-400 p-2 rounded-xl text-slate-900 shrink-0">
                  <Link2 className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">
                    គ្រប់គ្រងតំណភ្ជាប់បន្ថែម (Manage Other Links)
                  </h3>
                  <p className="text-[10px] text-indigo-100/90 font-medium truncate">សម្រាប់៖ {managedEventLinks.eventActivity}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setManagedEventLinks(null);
                  setNewLinkLabel('');
                  setNewLinkUrl('');
                  setNewLinkDesc('');
                }}
                className="text-white hover:bg-white/10 p-1.5 rounded-lg transition cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-left">
              {/* Existing List */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">តំណភ្ជាប់បច្ចុប្បន្ន (Current Web Links)</h4>
                {(!managedEventLinks.otherLinks || managedEventLinks.otherLinks.length === 0) ? (
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
                    <Link2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-semibold">មិនមានតំណភ្ជាប់បន្ថែមនៅឡើយទេ។ (No other links present)</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {managedEventLinks.otherLinks.map((lnk, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                            <ExternalLink className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate" title={lnk.name}>{lnk.name}</p>
                            <p className="text-[10px] text-slate-500 truncate" title={lnk.description || lnk.url}>{lnk.description || lnk.url}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 font-sans">
                          <a 
                            href={lnk.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-extrabold transition cursor-pointer"
                          >
                            បើក (Open)
                          </a>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmItem({
                              type: 'link',
                              eventId: managedEventLinks.id,
                              index: idx,
                              name: lnk.name
                            })}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition cursor-pointer"
                            title="លុបតំណភ្ជាប់ (Delete Link)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Link Form */}
              <div className="border-t border-slate-150 pt-4 space-y-3">
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">បន្ថែមតំណភ្ជាប់ថ្មី (Add New External Link)</h4>
                
                <div className="space-y-3 p-4 bg-[#073B3A]/5 border border-slate-150 rounded-2xl">
                  {/* Link Label */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 block">
                      ឈ្មោះតំណភ្ជាប់ / ប៊ូតុង (Link Label / Button Title) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ឧ. ក្រុម Telegram គណៈរៀបចំ"
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      className="w-full bg-white border border-slate-250 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:border-[#073B3A] focus:outline-hidden focus:ring-1 focus:ring-[#073B3A] transition-all"
                    />
                  </div>

                  {/* URL */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 block">
                      តំណភ្ជាប់ URL (Link Destination / URL) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://t.me/wis_committee_chat"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      className="w-full bg-white border border-slate-250 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:border-[#073B3A] focus:outline-hidden focus:ring-1 focus:ring-[#073B3A] transition-all"
                    />
                  </div>

                  {/* Descriptive hint */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 block">ការពិពណ៌នាខ្លីៗ (Short Memo / Description)</label>
                    <input
                      type="text"
                      placeholder="ឧ. គ្រុបពិភាក្សាព័ត៌មានលម្អិត..."
                      value={newLinkDesc}
                      onChange={(e) => setNewLinkDesc(e.target.value)}
                      className="w-full bg-white border border-slate-250 text-slate-800 text-xs rounded-xl px-3 py-2 focus:border-[#073B3A] focus:outline-hidden focus:ring-1 focus:ring-[#073B3A] transition-all"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleAddLink(managedEventLinks.id)}
                      className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-805 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4 shrink-0" />
                      <span>បន្ថែមតំណភ្ជាប់ (Add Web Link)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setManagedEventLinks(null);
                  setNewLinkLabel('');
                  setNewLinkUrl('');
                  setNewLinkDesc('');
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                រួចរាល់ (Done)
              </button>
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
