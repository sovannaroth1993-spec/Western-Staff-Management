import React, { useState, useEffect } from 'react';
import { 
  Users, 
  User, 
  GraduationCap, 
  Search, 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  RotateCcw, 
  Edit3, 
  Check, 
  X, 
  TrendingUp, 
  FileText, 
  Sparkles,
  BarChart2,
  PieChart,
  Calendar,
  Layers,
  Award,
  Hash,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GradeStatistic {
  id: string;
  grade: string;
  subClasses: string[]; // e.g. ["N-A", "N-B"] or ["K3-A"] or ["Grade 1A", "Grade 1B"]
  male: number;
  female: number;
}

const DEFAULT_GRADE_STATS: GradeStatistic[] = [
  { id: '1', grade: 'Nursery', subClasses: ['N-A', 'N-B'], male: 45, female: 40 },
  { id: '2', grade: 'Kindergarten', subClasses: ['K3-A', 'K3-B'], male: 60, female: 58 },
  { id: '3', grade: 'Grade 1', subClasses: ['Grade 1A', 'Grade 1B', 'Grade 1C'], male: 85, female: 82 },
  { id: '4', grade: 'Grade 2', subClasses: ['Grade 2A', 'Grade 2B'], male: 88, female: 90 },
  { id: '5', grade: 'Grade 3', subClasses: ['Grade 3A', 'Grade 3B'], male: 92, female: 85 },
  { id: '6', grade: 'Grade 4', subClasses: ['Grade 4A', 'Grade 4B'], male: 95, female: 88 },
  { id: '7', grade: 'Grade 5', subClasses: ['Grade 5A', 'Grade 5B'], male: 100, female: 100 },
  { id: '8', grade: 'Grade 6', subClasses: ['Grade 6A', 'Grade 6B'], male: 105, female: 102 },
  { id: '9', grade: 'Grade 7', subClasses: ['Grade 7A', 'Grade 7B'], male: 110, female: 98 },
  { id: '10', grade: 'Grade 8', subClasses: ['Grade 8A', 'Grade 8B'], male: 108, female: 108 },
  { id: '11', grade: 'Grade 9', subClasses: ['Grade 9A', 'Grade 9B'], male: 102, female: 94 },
  { id: '12', grade: 'Grade 10', subClasses: ['Grade 10A'], male: 95, female: 85 },
  { id: '13', grade: 'Grade 11', subClasses: ['Grade 11A'], male: 93, female: 82 },
  { id: '14', grade: 'Grade 12', subClasses: ['Grade 12A'], male: 72, female: 68 },
];

export default function StudentStatistics() {
  const [stats, setStats] = useState<GradeStatistic[]>(() => {
    try {
      const saved = localStorage.getItem('wis_student_grade_statistics');
      return saved ? JSON.parse(saved) : DEFAULT_GRADE_STATS;
    } catch {
      return DEFAULT_GRADE_STATS;
    }
  });

  // Academic Year State
  const [academicYear, setAcademicYear] = useState<string>(() => {
    return localStorage.getItem('wis_student_statistics_academic_year') || '2025-2026';
  });
  const [isEditingYear, setIsEditingYear] = useState(false);
  const [tempYear, setTempYear] = useState(academicYear);

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editMale, setEditMale] = useState(0);
  const [editFemale, setEditFemale] = useState(0);
  const [editGradeName, setEditGradeName] = useState('');
  const [editSubClassesText, setEditSubClassesText] = useState('');

  // Add Grade Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGradeName, setNewGradeName] = useState('');
  const [newMaleCount, setNewMaleCount] = useState<number | ''>('');
  const [newFemaleCount, setNewFemaleCount] = useState<number | ''>('');
  const [newSubClassesText, setNewSubClassesText] = useState('');

  // ASCII memo & printer container state
  const [showTextReport, setShowTextReport] = useState(false);
  const [showStamp, setShowStamp] = useState(true);

  // Save statistics to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wis_student_grade_statistics', JSON.stringify(stats));
    } catch (e) {
      console.error('Error saving statistics:', e);
    }
  }, [stats]);

  // Save Academic Year helper
  const handleSaveAcademicYear = () => {
    if (tempYear.trim()) {
      setAcademicYear(tempYear);
      localStorage.setItem('wis_student_statistics_academic_year', tempYear);
      setIsEditingYear(false);
    }
  };

  // Aggregate stats
  const totalMale = stats.reduce((sum, item) => sum + item.male, 0);
  const totalFemale = stats.reduce((sum, item) => sum + item.female, 0);
  const totalStudents = totalMale + totalFemale;
  const totalSubClassesCount = stats.reduce((sum, item) => sum + (item.subClasses ? item.subClasses.length : 0), 0);

  // Filter stats
  const filteredStats = stats.filter(item => 
    item.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.subClasses && item.subClasses.some(sc => sc.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Start editing a grade entry
  const startEdit = (item: GradeStatistic) => {
    setIsEditing(item.id);
    setEditGradeName(item.grade);
    setEditMale(item.male);
    setEditFemale(item.female);
    setEditSubClassesText(item.subClasses ? item.subClasses.join(', ') : '');
  };

  // Save edited grade
  const saveEdit = (id: string) => {
    if (!editGradeName.trim()) return;
    const parsedSub = editSubClassesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    setStats(prev => prev.map(item => 
      item.id === id 
        ? { 
            ...item, 
            grade: editGradeName, 
            subClasses: parsedSub,
            male: Number(editMale) || 0, 
            female: Number(editFemale) || 0 
          }
        : item
    ));
    setIsEditing(null);
  };

  // Delete grade
  const deleteGrade = (id: string, name: string) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបចោលទិន្នន័យថ្នាក់ "${name}" មែនទេ?`)) {
      setStats(prev => prev.filter(item => item.id !== id));
    }
  };

  // Add new grade entry
  const handleAddNewGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGradeName.trim()) return;

    const maleNum = Number(newMaleCount) || 0;
    const femaleNum = Number(newFemaleCount) || 0;
    const parsedSub = newSubClassesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const newObj: GradeStatistic = {
      id: Date.now().toString(),
      grade: newGradeName,
      subClasses: parsedSub,
      male: maleNum,
      female: femaleNum
    };

    setStats(prev => [...prev, newObj]);
    setNewGradeName('');
    setNewMaleCount('');
    setNewFemaleCount('');
    setNewSubClassesText('');
    setShowAddForm(false);
  };

  // Reset to original defaults
  const resetStats = () => {
    if (window.confirm('តើអ្នកចង់កំណត់ការគណនាស្ថិតិឡើងវិញទៅតាមលំនាំដើមមែនទេ? (Reset to default statistics)')) {
      setStats(DEFAULT_GRADE_STATS);
      setAcademicYear('2025-2026');
      setTempYear('2025-2026');
      localStorage.setItem('wis_student_statistics_academic_year', '2025-2026');
    }
  };

  // Generate ASCII Plaintext representation exactly matching user specification with classrooms info
  const generateAsciiReport = () => {
    let report = `+------------------------------------------------------------+\n`;
    report += `|              STUDENT STATISTICS REPORT                     |\n`;
    report += `|              ACADEMIC YEAR: ${academicYear.padEnd(20, ' ')}   |\n`;
    report += `+------------------------------------------------------------+\n\n`;
    report += `👨🎓 Male Students    : ${totalMale.toLocaleString()}\n`;
    report += `👩🎓 Female Students  : ${totalFemale.toLocaleString()}\n`;
    report += `👥 Total Students    : ${totalStudents.toLocaleString()}\n`;
    report += `🏫 Total Sub-classes  : ${totalSubClassesCount} Classes\n\n`;
    report += `--------------------------------------------------------------\n`;
    report += `Grade Level    Male     Female     Total     Classrooms/Sections \n`;
    report += `--------------------------------------------------------------\n`;
    
    stats.forEach(item => {
      const g = item.grade.padEnd(14, ' ');
      const m = item.male.toString().padStart(6, ' ');
      const f = item.female.toString().padStart(10, ' ');
      const t = (item.male + item.female).toString().padStart(9, ' ');
      const classesStr = item.subClasses && item.subClasses.length > 0 
        ? ` (${item.subClasses.join(', ')})` 
        : ' (-)';
      const c = classesStr.padEnd(20, ' ');
      report += `${g}${m}${f}${t}   ${c}\n`;
    });
    
    report += `--------------------------------------------------------------\n`;
    const totG = "TOTAL SUM".padEnd(14, ' ');
    const totM = totalMale.toString().padStart(6, ' ');
    const totF = totalFemale.toString().padStart(10, ' ');
    const totT = totalStudents.toString().padStart(9, ' ');
    report += `${totG}${totM}${totF}${totT}   (${totalSubClassesCount} classrooms)\n`;
    report += `--------------------------------------------------------------\n`;
    return report;
  };

  // Copy Plaintext to clipboard
  const [copied, setCopied] = useState(false);
  const handleCopyText = () => {
    try {
      navigator.clipboard.writeText(generateAsciiReport());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Trigger Print direct
  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Brand Widget / Action Panel */}
      <div id="statistics-upper-panel" className="bg-gradient-to-br from-[#073B3A] via-[#052d2c] to-[#03201e] rounded-3xl border border-teal-500/20 shadow-xl p-6 relative overflow-hidden select-none">
        {/* Abstract background graphics */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-10 w-36 h-36 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-amber-350 to-amber-500 text-slate-900 rounded-2xl shadow-lg shrink-0 animate-pulse">
              <GraduationCap className="w-8 h-8 stroke-[2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm md:text-base font-black font-moul tracking-wide text-white drop-shadow-sm">
                  ស្ថិតិសិស្សានុសិស្សវិទ្យាល័យ (Student Statistics Portfolio)
                </h2>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-900/60 border border-teal-500/30 text-[10px] text-teal-300 font-bold font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE UPDATE
                </div>
              </div>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider font-sans mt-1 max-w-2xl">
                Western International School • Campus Operational Enrollment Real-time Multi-Classroom Distribution
              </p>
            </div>
          </div>
          
          {/* Editable Academic Year in premium gold frame */}
          <div id="academic-year-card" className="bg-adaptive flex items-center justify-between gap-4 p-3 px-4.5 bg-black/30 border border-teal-500/20 rounded-2xl w-full xl:w-auto relative group">
            <div className="space-y-0.5">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">
                ឆ្នាំសិក្សា • ACADEMIC YEAR
              </span>
              
              <AnimatePresence mode="wait">
                {isEditingYear ? (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="flex items-center gap-1.5 mt-0.5"
                  >
                    <input
                      id="academic-year-input"
                      type="text"
                      value={tempYear}
                      onChange={(e) => setTempYear(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveAcademicYear()}
                      className="bg-slate-800 border border-amber-400/40 text-amber-300 rounded-lg px-2 py-1 text-xs font-black w-28 focus:outline-none focus:border-amber-400 focus:bg-slate-900"
                    />
                    <button
                      id="save-year-btn"
                      onClick={handleSaveAcademicYear}
                      className="p-1.5 bg-amber-450 hover:bg-amber-500 text-slate-950 rounded-lg transition active:scale-90 cursor-pointer"
                      title="រក្សាទុក (Save)"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                    <button
                      id="cancel-year-btn"
                      onClick={() => { setTempYear(academicYear); setIsEditingYear(false); }}
                      className="p-1.5 bg-slate-700 hover:bg-slate-650 text-slate-300 rounded-lg transition active:scale-90 cursor-pointer"
                      title="បោះបង់ (Cancel)"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-sm font-black text-amber-300 font-sans tracking-wide">
                      {academicYear}
                    </span>
                    <button 
                      id="edit-academic-year-icon"
                      onClick={() => { setTempYear(academicYear); setIsEditingYear(true); }}
                      className="p-1 inline-flex items-center justify-center rounded-lg hover:bg-white/10 text-amber-410 hover:text-amber-300 transition duration-150 cursor-pointer"
                      title="កែប្រែឆ្នាំសិក្សា (Edit Academic Year)"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="p-2.5 bg-gradient-to-br from-indigo-950/40 to-teal-900/40 border border-teal-505/20 text-teal-300 rounded-xl">
              <Calendar className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* Action Buttons at Bottom of Hero row */}
        <div className="mt-5 pt-4 border-t border-teal-500/10 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2 text-[11px] text-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>ប្រព័ន្ធគ្រប់គ្រងស្ថិតិទំនើប ស្រង់វត្តមាន និងរបាយការណ៍បោះពុម្ពវៃឆ្លាត</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              id="view-report-memo-btn"
              type="button"
              onClick={() => setShowTextReport(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-black text-xs rounded-xl hover:from-amber-500 hover:to-amber-600 transition shadow-lg cursor-pointer transform active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>របាយការណ៍មេម៉ូរ៉ង់ដាំ (View Plaintext / Stamp)</span>
            </button>

            <button
              id="add-class-btn"
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-emerald-50 font-black text-xs rounded-xl hover:bg-emerald-700 transition shadow-lg cursor-pointer transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>បន្ថែមថ្នាក់ (Add Class Level)</span>
            </button>

            <button
              id="reset-stats-btn"
              type="button"
              onClick={resetStats}
              title="Reset to default statistics"
              className="px-3 py-2.5 bg-teal-950/50 border border-teal-500/30 text-teal-300 rounded-xl hover:bg-teal-900/60 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Total Counters cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total Students Enrollment */}
        <div id="stat-card-total" className="bg-gradient-to-br from-[#073B3A] to-[#04201f] text-white p-5 rounded-3xl border border-teal-500/20 shadow-md relative overflow-hidden flex items-center justify-between group hover:shadow-cyan-900/10 transition-all duration-300">
          <div className="space-y-1 z-10">
            <span className="block text-[9.5px] text-teal-300 tracking-widest uppercase font-extrabold font-sans">
              ចំនួនសិស្សសរុបរួម  •  Total Enrollment
            </span>
            <span className="block text-2xl font-black font-sans tracking-tight text-amber-300">
              {totalStudents.toLocaleString()} <span className="text-[10px] font-semibold text-teal-200 pr-0.5">នាក់ / Pax</span>
            </span>
            <span className="block text-[9.5px] italic text-emerald-200/80 font-medium">
              សរុបរួមគ្រប់កម្រិតថ្នាក់សិក្សាទាំងអស់
            </span>
          </div>
          <div className="p-3.5 bg-teal-950/40 border border-teal-500/20 text-amber-300 rounded-2xl shrink-0 z-10">
            <Users className="w-7 h-7" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#0d5c5a]/40 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
        </div>

        {/* Classrooms Subdivisions Count */}
        <div id="stat-card-subclasses" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex items-center justify-between group hover:shadow-indigo-500/5 transition-all duration-300">
          <div className="space-y-1 z-10">
            <span className="block text-[9.5px] text-slate-450 tracking-widest uppercase font-black font-sans">
              🏫 បន្ទប់សរុប  •  Total Sections
            </span>
            <span className="block text-2xl font-black font-sans tracking-tight text-teal-700">
              {totalSubClassesCount} <span className="text-[10px] font-semibold text-slate-500 pr-0.5">ថ្នាក់ / Co.</span>
            </span>
            <span className="block text-[9.5px] text-slate-600 font-bold bg-teal-50 border border-teal-100/50 px-2 py-0.5 rounded-lg w-fit">
              មធ្យម {totalStudents ? (totalStudents / (totalSubClassesCount || 1)).toFixed(1) : 0} នាក់ក្នុងមួយថ្នាក់
            </span>
          </div>
          <div className="p-3.5 bg-teal-50 text-teal-600 rounded-2xl shrink-0 z-10">
            <Layers className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-teal-50 rounded-full blur-md pointer-events-none" />
        </div>

        {/* Male Students */}
        <div id="stat-card-male" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex items-center justify-between group hover:shadow-indigo-550/5 transition-all duration-300">
          <div className="space-y-1 z-10">
            <span className="block text-[9.5px] text-slate-450 tracking-widest uppercase font-black font-sans">
              👨🎓 សិស្សប្រុស  •  Male Students
            </span>
            <span className="block text-2xl font-black font-sans tracking-tight text-indigo-700">
              {totalMale.toLocaleString()} <span className="text-[10px] font-semibold text-slate-450 pr-0.5">នាក់ / Pax</span>
            </span>
            <span className="block text-[9.5px] text-[#073B3A] font-bold bg-indigo-50 border border-indigo-200/50 px-2 py-0.5 rounded-lg w-fit">
              👦 {totalStudents ? ((totalMale / totalStudents) * 100).toFixed(1) : 0}% Ratio of Male
            </span>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0 z-10">
            <User className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-50 rounded-full blur-md pointer-events-none" />
        </div>

        {/* Female Students */}
        <div id="stat-card-female" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex items-center justify-between group hover:shadow-rose-550/5 transition-all duration-300">
          <div className="space-y-1 z-10">
            <span className="block text-[9.5px] text-slate-450 tracking-widest uppercase font-black font-sans">
              👩🎓 សិស្សស្រី  •  Female Students
            </span>
            <span className="block text-2xl font-black font-sans tracking-tight text-rose-650">
              {totalFemale.toLocaleString()} <span className="text-[10px] font-semibold text-slate-450 pr-0.5">នាក់ / Pax</span>
            </span>
            <span className="block text-[9.5px] text-slate-650 font-bold bg-rose-50 border border-rose-200/30 px-2 py-0.5 rounded-lg w-fit">
              👧 {totalStudents ? ((totalFemale / totalStudents) * 100).toFixed(1) : 0}% Ratio of Female
            </span>
          </div>
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl shrink-0 z-10 flex items-center justify-center">
            <User className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-rose-55 rounded-full blur-md pointer-events-none" />
        </div>

      </div>

      {/* Main Grid: Statistics Table Breakdowns & Charts visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Editable statistics Grid Table */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-slate-350">
          <div>
            {/* Table Header Filter controls */}
            <div className="p-5 border-b border-slate-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/70">
              <div>
                <h3 className="text-xs font-black text-[#073B3A] flex items-center gap-1.5 uppercase">
                  <BarChart2 className="w-4 h-4 text-emerald-600" />
                  <span>តារាងស្ថិតិលម្អិតតាមកម្រិតថ្នាក់ (Detailed Grade Levels Table)</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                  View, search, or edit student counts and classroom sub-divisions
                </p>
              </div>
              
              {/* Classroom search */}
              <div className="relative w-full sm:w-64 text-xs">
                <input
                  id="classroom-search-box"
                  type="text"
                  placeholder="ស្វែងរកថ្នាក់ / បន្ទប់ (Search Grade/Class)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-8 pl-3 py-2 bg-white border border-slate-250 rounded-xl focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-650/40 transition text-[11px] placeholder:text-slate-400"
                />
                <Search className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Table layout */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[10px] font-black text-slate-700 border-b border-slate-150 uppercase tracking-wider">
                    <th className="p-3 pl-5 text-center w-12 bg-slate-50/80">ល.រ</th>
                    <th className="p-3 w-1/3">កម្រិតថ្នាក់សិក្សា (Grade & Sections)</th>
                    <th className="p-3 text-center w-24 bg-indigo-50/20 text-indigo-905">ប្រុស (Male)</th>
                    <th className="p-3 text-center w-24 bg-rose-50/20 text-rose-905">ស្រី (Female)</th>
                    <th className="p-3 text-center w-24 bg-emerald-50/20 text-[#073B3A]">សរុប (Total)</th>
                    <th className="p-3 text-center w-28">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold text-slate-700 divide-y divide-slate-100">
                  {filteredStats.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-16 text-center text-slate-400 italic">
                        មិនមានទិន្នន័យត្រូវបានស្វែងរកឃើញឡើយ។ (No records matched your search query)
                      </td>
                    </tr>
                  ) : (
                    filteredStats.map((item, index) => {
                      const itemTotal = item.male + item.female;
                      const isRowEditing = isEditing === item.id;
                      
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 divide-x divide-slate-100/50 transition duration-150">
                          {/* index */}
                          <td className="p-3 text-center font-mono text-[10px] font-bold text-slate-400 bg-slate-50/10">
                            {index + 1}
                          </td>

                          {/* Grade Name & Sections tag column */}
                          <td className="p-3 space-y-1.5">
                            {isRowEditing ? (
                              <div className="space-y-2">
                                <div>
                                  <label className="text-[8.5px] uppercase font-black text-slate-410 block">Grade Name</label>
                                  <input
                                    type="text"
                                    value={editGradeName}
                                    onChange={(e) => setEditGradeName(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-1 px-2 text-xs focus:outline-teal-600 bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-[8.5px] uppercase font-black text-slate-415 block">Classrooms / Sections (comma separated)</label>
                                  <input
                                    type="text"
                                    value={editSubClassesText}
                                    onChange={(e) => setEditSubClassesText(e.target.value)}
                                    placeholder="Ex: Grade 1A, Grade 1B, G1-C"
                                    className="w-full border border-slate-300 rounded-lg p-1 px-2 text-xs focus:outline-teal-600 bg-white placeholder:text-slate-300"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="block text-[12.5px] font-black text-slate-900 tracking-tight">{item.grade}</span>
                                
                                {/* Horizontal row of classroom tags */}
                                <div className="flex flex-wrap items-center gap-1 mt-1">
                                  {item.subClasses && item.subClasses.length > 0 ? (
                                    item.subClasses.map((sc, scIdx) => (
                                      <span 
                                        key={scIdx} 
                                        className="text-[9px] font-black font-mono tracking-tight bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-slate-650 hover:text-teal-700 px-1.5 py-0.5 rounded-md transition-colors"
                                      >
                                        {sc}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[9px] italic text-slate-350">គ្មានបន្ទប់ជាក់លាក់ (No sections declared)</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Male Count Input or Text */}
                          <td className="p-3 text-center bg-indigo-50/5 font-mono text-[11.5px] text-indigo-900 font-extrabold">
                            {isRowEditing ? (
                              <div className="space-y-1">
                                <label className="text-[8px] uppercase font-black text-indigo-400 block sm:hidden">Male</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={editMale}
                                  onChange={(e) => setEditMale(parseInt(e.target.value) || 0)}
                                  className="w-full max-w-[80px] border border-slate-300 rounded-lg p-1 text-xs text-center focus:outline-teal-600 bg-white mx-auto block"
                                />
                              </div>
                            ) : (
                              item.male.toLocaleString()
                            )}
                          </td>

                          {/* Female Count Input or Text */}
                          <td className="p-3 text-center bg-rose-50/5 font-mono text-[11.5px] text-rose-700 font-extrabold">
                            {isRowEditing ? (
                              <div className="space-y-1">
                                <label className="text-[8px] uppercase font-black text-rose-450 block sm:hidden">Female</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={editFemale}
                                  onChange={(e) => setEditFemale(parseInt(e.target.value) || 0)}
                                  className="w-full max-w-[80px] border border-slate-300 rounded-lg p-1 text-xs text-center focus:outline-teal-600 bg-white mx-auto block"
                                />
                              </div>
                            ) : (
                              item.female.toLocaleString()
                            )}
                          </td>

                          {/* total */}
                          <td className="p-3 text-center bg-emerald-50/5 font-mono text-xs font-black text-[#073B3A]">
                            {isRowEditing ? (
                              <span className="text-slate-400">{(editMale + editFemale).toLocaleString()}</span>
                            ) : (
                              itemTotal.toLocaleString()
                            )}
                          </td>

                          {/* action buttons */}
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {isRowEditing ? (
                                <>
                                  <button
                                    onClick={() => saveEdit(item.id)}
                                    className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg border border-emerald-500 transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                                    title="រក្សាទុក (Save)"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span className="text-[9px] font-black uppercase">រក្សាទុក</span>
                                  </button>
                                  <button
                                    onClick={() => setIsEditing(null)}
                                    className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg border border-slate-200 transition cursor-pointer"
                                    title="បោះបង់ (Cancel)"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEdit(item)}
                                    className="p-1.5 text-slate-600 hover:bg-slate-50 hover:text-teal-700 rounded-lg border border-slate-205 transition cursor-pointer inline-flex items-center gap-1"
                                    title="កែសម្រួល (Edit)"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteGrade(item.id, item.grade)}
                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-100 transition cursor-pointer"
                                    title="លុបថ្នាក់ (Delete)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table total sums footer */}
          <div className="border-t border-slate-200 p-4.5 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-black uppercase text-[#073B3A]">
            <span className="font-sans">🏫 TOTAL SYSTEM ENROLLMENT SUMS</span>
            <div className="flex flex-wrap gap-2.5 font-mono text-[10.5px]">
              <span className="text-teal-900 bg-teal-50 border border-teal-150 px-3 py-1 rounded-xl">
                🏫 បន្ទប់: {totalSubClassesCount} ថ្នាក់
              </span>
              <span className="text-indigo-900 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl font-bold">
                👦 ប្រុស: {totalMale.toLocaleString()} នាក់
              </span>
              <span className="text-rose-750 bg-rose-50 border border-rose-100 px-3 py-1 rounded-xl font-bold">
                👧 ស្រី: {totalFemale.toLocaleString()} នាក់
              </span>
              <span className="bg-[#073B3A] text-amber-300 border border-teal-800 px-3 py-1 rounded-xl shadow-xs font-black">
                👥 សរុប: {totalStudents.toLocaleString()} នាក់
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: High Quality Distribution Graphics (Progress Bar Charts) */}
        <div className="lg:col-span-12 xl:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 flex flex-col justify-between transition-all duration-300 hover:border-slate-350">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-black text-[#073B3A] flex items-center gap-1.5 uppercase">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <span>គំនូសបែងចែកទំហំសិស្ស (Distribution and Gender Ratios)</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                Visualizing grade levels sizes, densities & school proportions
              </p>
            </div>

            {/* Total Student Gender ratio slide bar */}
            <div className="space-y-2 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-150 p-4.5 rounded-2xl">
              <span className="text-[9.5px] font-black text-slate-500 block uppercase tracking-wider">
                សមាមាត្រយេនឌ័រសាលាសរុប ({academicYear})
              </span>
              
              <div className="h-6.5 bg-slate-200 rounded-full overflow-hidden flex shadow-inner relative border border-slate-300">
                <div 
                  style={{ width: totalStudents > 0 ? `${(totalMale / totalStudents) * 100}%` : '50%' }}
                  className="bg-indigo-600 h-full flex items-center justify-center text-[10px] text-white font-extrabold select-none transition-all duration-300 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.1)]"
                >
                  {totalStudents > 0 ? ((totalMale / totalStudents) * 100).toFixed(0) : '0'}% ប្រុស
                </div>
                <div 
                  style={{ width: totalStudents > 0 ? `${(totalFemale / totalStudents) * 100}%` : '50%' }}
                  className="bg-rose-500 h-full flex items-center justify-center text-[10px] text-white font-extrabold select-none transition-all duration-300 shadow-[inset_2px_0_4px_rgba(0,0,0,0.1)]"
                >
                  {totalStudents > 0 ? ((totalFemale / totalStudents) * 100).toFixed(0) : '0'}% ស្រី
                </div>
              </div>
              
              <div className="flex justify-between text-[8.5px] font-bold text-slate-500 uppercase mt-0.5">
                <span className="inline-flex items-center gap-1">👦 MALE ({totalMale.toLocaleString()} pax)</span>
                <span className="inline-flex items-center gap-1">👧 FEMALE ({totalFemale.toLocaleString()} pax)</span>
              </div>
            </div>

            {/* Bar list chart representation of each class level size */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 text-slate-700">
              <span className="text-[9.5px] font-black text-slate-500 block uppercase tracking-wider">
                ដង់ស៊ីតេសិស្សតាមថ្នាក់នីមួយៗ (Student Enrollment Density per Grade)
              </span>
              
              {stats.map(item => {
                const total = item.male + item.female;
                const percentOfMax = totalStudents > 0 ? (total / Math.max(...stats.map(s => s.male + s.female))) * 100 : 0;
                
                return (
                  <div key={item.id} className="space-y-1 group">
                    <div className="flex justify-between text-[11px] font-bold text-slate-700">
                      <span className="font-sans flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600 hover:scale-110 transition-transform" />
                        <b className="group-hover:text-teal-700 transition-colors">{item.grade}</b>
                        {item.subClasses && item.subClasses.length > 0 && (
                          <span className="text-[8.5px] font-normal text-slate-400 bg-slate-100 border px-1 rounded-sm">
                            {item.subClasses.length} sct.
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-slate-500">
                        <b>{total}</b> Students <span className="text-[8px] text-slate-400">({totalStudents > 0 ? ((total / totalStudents) * 100).toFixed(1) : 0}%)</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-grow h-3 bg-slate-100 border border-slate-200 rounded-full overflow-hidden shadow-2xs relative">
                        {/* Dual colored compound progress bar */}
                        <div className="flex h-full">
                          <div 
                            style={{ width: `${total > 0 ? (item.male / total) * percentOfMax : 0}%` }}
                            className="bg-indigo-600/80 h-full transition-all duration-300"
                          />
                          <div 
                            style={{ width: `${total > 0 ? (item.female / total) * percentOfMax : 0}%` }}
                            className="bg-rose-500/80 h-full transition-all duration-300"
                          />
                        </div>
                      </div>
                      
                      <span className="text-[8.5px] font-mono font-black text-slate-400 w-14 text-right shrink-0">
                        👦{item.male} 👧{item.female}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Notice stamp widget */}
          <div className="bg-amber-50/20 border border-amber-900/10 p-4.5 rounded-2xl text-[9.5px] text-slate-500 leading-normal font-medium space-y-1.5 mt-2 select-none">
            <p className="font-black text-amber-950 flex items-center gap-1 text-[10px]">
              <Bookmark className="w-3.5 h-3.5 text-amber-600" />
              <span>ការប្រើប្រាស់ សិត្អិសិស្សានុសិស្ស និងសមកាលកម្ម៖</span>
            </p>
            <p>ទិន្នន័យស្ថិតិរួមទាំង បញ្ជីរាយនាមបន្ទប់សិក្សា (ដូចជា {stats[0]?.subClasses?.join(', ')} ...ល។) ត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិក្នុង Local Storage នៃកម្មវិធី។ អ្នកអាចកំណត់ឆ្នាំសិក្សាថ្នាក់នីមួយៗ និងទាញទិន្នន័យជា Memo ឬហត្ថលេខាត្រាផ្លូវការដើម្បីរដ្ឋបាលបោះពុម្ពបានភ្លាមៗ។</p>
          </div>
        </div>

      </div>

      {/* Add Grade Entry Modal Form Popup */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-50 p-5 border-b border-slate-150 flex items-center gap-3 select-none">
                <div className="p-2.5 bg-[#073B3A] text-amber-300 rounded-2xl shadow-inner shrink-0 animate-bounce">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-moul text-[10px] sm:text-[11px] text-[#073B3A] leading-normal">
                    បន្ថែមថ្នាក់រៀនថ្មី (Add New Grade Level)
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-sans mt-0.5">
                    Create custom census and classroom identifiers
                  </p>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleAddNewGrade}>
                <div className="p-6 space-y-4">
                  {/* Grade Name */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-500">
                      ឈ្មោះកម្រិតថ្នាក់ (Grade Level Name) *
                    </label>
                    <input
                      id="new-grade-name"
                      type="text"
                      placeholder="ឧ. Grade 13 or Nursery Section..."
                      value={newGradeName}
                      onChange={(e) => setNewGradeName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-250 bg-white rounded-xl focus:outline-teal-600"
                      required
                    />
                  </div>

                  {/* Sub-classes sections comma separated list */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-500">
                      ថ្នាក់/បន្ទប់រៀនជាក់លាក់ (Sub-classes comma separated list)
                    </label>
                    <input
                      id="new-grade-subclasses"
                      type="text"
                      placeholder="ឧ. G13-A, G13-B, G13-C..."
                      value={newSubClassesText}
                      onChange={(e) => setNewSubClassesText(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-250 bg-white rounded-xl focus:outline-teal-600"
                    />
                  </div>

                  {/* Male / Female breakdown */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-slate-500">
                        👦 សិស្សប្រុស (Male)
                      </label>
                      <input
                        id="new-grade-male"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={newMaleCount}
                        onChange={(e) => setNewMaleCount(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full text-xs p-2.5 border border-slate-250 bg-white rounded-xl focus:outline-teal-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-slate-500">
                        👧 សិស្សស្រី (Female)
                      </label>
                      <input
                        id="new-grade-female"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={newFemaleCount}
                        onChange={(e) => setNewFemaleCount(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full text-xs p-2.5 border border-slate-250 bg-white rounded-xl focus:outline-teal-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-150 flex items-center justify-end gap-2 text-xs font-black">
                  <button
                    id="cancel-add-btn"
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 hover:bg-slate-150 text-slate-550 border border-slate-205 bg-white rounded-xl cursor-pointer transition active:scale-95"
                  >
                    បោះបង់ (Cancel)
                  </button>
                  <button
                    id="save-new-grade-btn"
                    type="submit"
                    className="px-4 py-2 bg-[#073B3A] hover:bg-[#0c5352] text-white rounded-xl cursor-pointer transition active:scale-95 shadow-md shadow-emerald-700/20 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>រក្សាទុកថ្នាក់ (Save Grade)</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ASCII printable reports sheet (Authentic styled desk popup with stamp) */}
      <AnimatePresence>
        {showTextReport && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-205 shadow-2xl rounded-3xl w-full max-w-3xl overflow-hidden relative flex flex-col my-8 max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Modal control bar header */}
              <div className="bg-slate-50 p-4 border-b border-slate-150 flex items-center justify-between shrink-0 no-print">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-amber-400 text-slate-900 text-[10px] font-black rounded-lg uppercase tracking-wider">OFFICIAL SYSTEM MEMO</span>
                  <span className="text-xs font-bold text-slate-500">របាយការណ៍សង្ខេបសម្រាប់បោះពុម្ព និងបញ្ជាក់ផ្លូវការ</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs font-black">
                  {/* Toggle Official Stamp Check */}
                  <label className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 select-none">
                    <input 
                      id="official-stamp-checkbox"
                      type="checkbox" 
                      checked={showStamp} 
                      onChange={(e) => setShowStamp(e.target.checked)}
                      className="accent-[#073B3A]"
                    />
                    <span>សញ្ញាត្រាផ្លូវការ (Show Stamp)</span>
                  </label>

                  <button
                    id="copy-text-report-btn"
                    onClick={handleCopyText}
                    className="px-3 py-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-lg transition text-slate-700 cursor-pointer flex items-center gap-1"
                  >
                    <span>{copied ? '✅ បានចម្លងរួច!' : '📋 ចម្លងអត្ថបទ Core Text'}</span>
                  </button>

                  <button
                    id="trigger-print-report-btn"
                    onClick={triggerPrint}
                    className="px-3 py-1.5 bg-[#073B3A] text-white hover:bg-[#0c5352] rounded-lg transition cursor-pointer flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>បោះពុម្ពវិក្កយបត្រ (Print Memo)</span>
                  </button>

                  <button
                    id="close-report-popup-btn"
                    onClick={() => setShowTextReport(false)}
                    className="p-1.5 bg-slate-100 text-slate-400 hover:text-slate-650 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Area - Styles tuned for realistic office-paper aesthetics */}
              <div className="p-6 md:p-12 overflow-y-auto flex-1 bg-slate-100/30 font-sans print:bg-white print:p-0 text-left" id="print-view">
                <style dangerouslySetInnerHTML={{ __html: `
                  @media print {
                    body { background: white !important; color: black !important; }
                    .no-print { display: none !important; }
                    #print-view { padding: 0 !important; background: white !important; }
                    .print-border { border: none !important; box-shadow: none !important; }
                  }
                `}} />
                
                <div className="bg-white border text-left border-slate-250 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-8 md:p-[0.7in] relative mx-auto w-full max-w-[760px] min-h-[920px] flex flex-col justify-between print-border">
                  
                  {/* Decorative binder line */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#073B3A]/85 no-print" />

                  {/* Header Logo, National Letterhead */}
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start text-xs border-b border-slate-200 pb-3">
                      <div className="space-y-1 text-slate-850">
                        <h2 className="text-[11.5px] font-black text-[#073B3A] font-moul leading-relaxed">
                          សាលាវេស្ទើនអន្តរជាតិ សាខាចំការដូង
                        </h2>
                        <p className="text-[9px] text-[#0d5c5a] font-normal font-moul">
                          ការិយាល័យស្ថិតិ និងចុះឈ្មោះចូលរៀនសាលា
                        </p>
                        <p className="text-[7.5px] text-slate-405 font-extrabold uppercase tracking-wider">
                          Western International School • Admission & Registry Office
                        </p>
                      </div>

                      <div className="text-right mt-2 sm:mt-0">
                        <p className="font-moul text-[9.5px] font-normal leading-normal text-slate-900 tracking-wider">
                          ព្រះរាជាណាចក្រកម្ពុជា
                        </p>
                        <p className="font-moul text-[8.5px] font-normal leading-normal text-slate-800">
                          ជាតិ សាសនា ព្រះមហាក្សត្រ
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-slate-200 select-none no-print">
                          <span>⚜️</span>
                          <span className="w-6 border-t border-dashed border-slate-305"></span>
                          <span>⚜️</span>
                        </div>
                      </div>
                    </div>

                    {/* Double Horizontal Divider lines */}
                    <div className="border-t-2 border-slate-800 mt-1 pb-1">
                      <div className="border-t border-slate-800" />
                    </div>

                    {/* Report Specific Title and Memo description */}
                    <div className="text-center space-y-1.5 my-5 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-3xs select-none">
                      <h1 className="text-[12px] sm:text-[13px] font-black text-slate-900 font-moul tracking-wide leading-relaxed">
                        សេចក្តីរាយការណ៍ព័ត៌មានស្ថិតិសិស្សានុសិស្សសរុស (OFFICIAL REGISTER CENSUS)
                      </h1>
                      <div className="text-[9.5px] text-[#073B3A] font-bold font-sans flex items-center justify-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#073B3A]" />
                        <span>ACADEMIC YEAR: {academicYear}</span>
                      </div>
                      <p className="text-[8.5px] text-slate-450 font-bold uppercase tracking-wider font-sans">
                        DAILY ENROLLMENT AND CLASSROOM RATIO DISTRIBUTION SHEET
                      </p>
                    </div>

                    <div className="text-[10px] text-slate-500 space-y-1 select-none pr-1 mb-5">
                      <p><b>កាលបរិច្ឆេទរបាយការណ៍ (Report Compiled) :</b> {new Date().toLocaleDateString('kh-KH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p><b>គណនាចុងក្រោយដោយស្វ័យប្រវត្តិ (Auto recalculated by registry suite) :</b> Active Live Data Sync Mode (WIS Registry Suite Ver. 4.0)</p>
                      <p><b>ឆ្នាំសិក្សាដែលបានបញ្ជាក់ (Certified Year) :</b> {academicYear}</p>
                    </div>

                    {/* ASCII Raw Preview EXACTLY matching user query, wrapped inside elegant high contrast box */}
                    <div className="space-y-1.5 mt-4">
                      <span className="text-[9.5px] font-black text-[#073B3A] block uppercase tracking-wider select-none">
                        📄 របាយការណ៍ Plaintext Format ផ្លូវការ (Exact System Printed Format)
                      </span>
                      
                      <div className="bg-slate-950 p-5 rounded-2xl shadow-inner border border-slate-850 relative overflow-hidden font-mono text-[9px] text-slate-200 leading-relaxed overflow-x-auto whitespace-pre">
                        {generateAsciiReport()}
                      </div>
                    </div>
                  </div>

                  {/* Stamp Container & signatures rendered over the paper sheet dynamically */}
                  <div className="relative mt-8 pt-6 border-t border-slate-250 grid grid-cols-2 gap-8 text-center text-[10px] select-none">
                    
                    {/* Red Stamp Seal layered on top of the Approved sign */}
                    {showStamp && (
                      <div className="absolute right-12 bottom-2 w-28 h-28 border-4 border-double border-rose-600 rounded-full flex flex-col items-center justify-center text-center opacity-85 select-none pointer-events-none rotate-12 shadow-[inset_0_0_8px_rgba(225,29,72,0.1)] z-20">
                        <div className="text-[7px] font-black text-rose-605 tracking-widest uppercase mb-0.5">WESTERN INT. SCHOOL</div>
                        <div className="border-t border-b border-rose-600/60 py-0.5 px-2 font-moul text-[6.5px] text-rose-650 font-normal">បានពិនិត្យ & យល់ព្រម</div>
                        <div className="text-[7.5px] font-black text-rose-600 tracking-wider mt-0.5">OFFICIAL APPROVED</div>
                        <div className="text-[5.5px] font-mono text-rose-600 mt-0.5 opacity-70 font-bold">DATE: {new Date().toISOString().split('T')[0]}</div>
                      </div>
                    )}

                    {/* Prepared Person Sign */}
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-500 text-[9px] uppercase tracking-wide">អ្នកចងក្រងស្ថិតិ / COMPILED BY</p>
                      <div className="h-10 flex items-end justify-center font-nitean text-xs text-indigo-700 italic select-none pb-0.5">
                        Veasna
                      </div>
                      <p className="font-moul text-[8.5px] text-slate-800">ឡុង វាសនា</p>
                      <p className="text-[8.5px] text-slate-400">អ្នកគ្រប់គ្រងការិយាល័យរដ្ឋបាល • WIS Chamkar Doung</p>
                    </div>

                    {/* Approved Sign */}
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-500 text-[9px] uppercase tracking-wide">ប្រធានការិយាល័យសិក្សា / DIRECTORY ENDORSEMENT</p>
                      <div className="h-10 flex items-center justify-center font-mono text-xs text-slate-300 select-none italic">
                        (ហត្ថលេខា និងសញ្ញា)
                      </div>
                      <p className="font-moul text-[8.5px] text-slate-800">នាយកផ្នែកអប់រំ និងចុះឈ្មោះ</p>
                      <p className="text-[8.5px] text-slate-400">ក្រុមប្រឹក្សាភិបាលសាលា • Board of Western Directors</p>
                    </div>

                  </div>

                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
