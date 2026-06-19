/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Staff, AttendanceRecord, DEPARTMENT_NAMES_KM, Department } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, Search, UserCheck, AlertCircle, Sparkles, Clock, 
  ArrowLeft, X, ShieldCheck, Heart, User, Check, RefreshCw
} from 'lucide-react';

interface SelfCheckinPortalProps {
  staffList: Staff[];
  attendanceRecords: AttendanceRecord[];
  onCheckinSuccess: (record: AttendanceRecord) => void;
  onExit: () => void;
  lang?: 'en' | 'kh';
}

export default function SelfCheckinPortal({ 
  staffList, 
  attendanceRecords, 
  onCheckinSuccess, 
  onExit,
  lang = 'kh' 
}: SelfCheckinPortalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<Department | 'All'>('All');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [verifyStaffId, setVerifyStaffId] = useState('');
  const [userNotes, setUserNotes] = useState('');
  
  // Feedback states
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ name: string; time: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Today's Date representation in Khmer and English
  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const todayDisplay = useMemo(() => {
    const d = new Date();
    const daysKh = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
    const monthsKh = ['មករា', 'កុម្ភៈ0', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    
    if (lang === 'kh') {
      return `ថ្ងៃ${daysKh[d.getDay()]} ទី${d.getDate()} ខែ${monthsKh[d.getMonth()]} ឆ្នាំ${d.getFullYear()}`;
    }
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }, [lang]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const list = Array.from(new Set(staffList.map(s => s.department)));
    return list;
  }, [staffList]);

  // Already checked in today list of staff IDs
  const checkedInIds = useMemo(() => {
    return new Set(
      attendanceRecords
        .filter(r => r.date === todayStr && r.status === 'Present')
        .map(r => r.staffId)
    );
  }, [attendanceRecords, todayStr]);

  // Filter staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.staffId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = selectedDept === 'All' || s.department === selectedDept;
      return matchSearch && matchDept;
    });
  }, [staffList, searchQuery, selectedDept]);

  const handleSelectStaff = (staff: Staff) => {
    setErrorMsg('');
    setVerifyStaffId('');
    setUserNotes('');
    
    // Check if member already checked-in today
    if (checkedInIds.has(staff.staffId)) {
      setErrorMsg(lang === 'kh' ? 'លោកអ្នកបានចុះវត្តមានរួចរាល់ហើយសម្រាប់ថ្ងៃនេះ!' : 'You have already checked-in for today!');
    }
    setSelectedStaff(staff);
  };

  const handleConfirmCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setErrorMsg('');

    // Check pre-existing check-in to avoid double submissions
    if (checkedInIds.has(selectedStaff.staffId)) {
      setErrorMsg(lang === 'kh' ? 'លោកអ្នកបានចុះវត្តមានរួចរាល់ហើយសម្រាប់ថ្ងៃនេះ!' : 'You have already checked-in for today!');
      return;
    }

    // Security validation of Staff ID
    if (verifyStaffId.trim().toUpperCase() !== selectedStaff.staffId.trim().toUpperCase()) {
      setErrorMsg(lang === 'kh' ? 'លេខសម្គាល់បុគ្គលិកមិនត្រឹមត្រូវទេ! សូមពិនិត្យឡើងវិញ' : 'Incorrect Staff ID! Please verify and try again.');
      return;
    }

    setIsSubmitting(true);

    const currentTimeStr = new Date().toLocaleTimeString('kh-KH', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    // Construct new attendance record
    const selfRecord: AttendanceRecord = {
      id: `att_self_${Date.now()}`,
      staffId: selectedStaff.staffId,
      staffName: selectedStaff.name,
      department: selectedStaff.department,
      date: todayStr,
      status: 'Present',
      notes: (userNotes.trim() ? `${userNotes.trim()} ` : '') + `(Self checked-in via QR at ${currentTimeStr})`,
      createdBy: 'self-service'
    };

    setTimeout(() => {
      onCheckinSuccess(selfRecord);
      setIsSubmitting(false);
      
      // Open success screen
      setSuccessInfo({
        name: selectedStaff.name,
        time: currentTimeStr
      });

      // Clear selection
      setSelectedStaff(null);
      setSearchQuery('');

      // Auto clear success screen after 3 seconds
      setTimeout(() => {
        setSuccessInfo(null);
      }, 3500);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden antialiased">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner / Navigation */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600/15 border border-emerald-500/20 p-2.5 rounded-2xl text-emerald-400 shadow-lg shadow-emerald-500/5">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-100 uppercase">
              {lang === 'kh' ? 'សាលាវេស្ទើនអន្តរជាតិ' : 'Western International School'}
            </h1>
            <p className="text-[10px] font-bold text-amber-500/95 mt-0.5 tracking-wider uppercase font-mono">
              {lang === 'kh' ? 'ប្រព័ន្ធចុះវត្តមានស្វ័យសេវា (Self-Service Attendance Portal)' : 'Self-Service Staff Portal'}
            </p>
          </div>
        </div>

        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition duration-200 border border-slate-700/60 shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{lang === 'kh' ? 'ត្រឡប់ក្រោយ' : 'Go Back'}</span>
        </button>
      </header>

      {/* Success Modal Screen Overlay */}
      <AnimatePresence>
        {successInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-lg flex flex-col items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -30 }}
              transition={{ type: "spring", damping: 15 }}
              className="max-w-md w-full bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 text-center shadow-2xl shadow-emerald-500/10 relative overflow-hidden"
            >
              {/* Confetti Accent Lines */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500" />
              
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute -inset-2 bg-emerald-500/20 rounded-full blur-md animate-ping" />
                  <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center shadow-lg relative">
                    <Check className="w-10 h-10 stroke-[3]" />
                  </div>
                </div>
              </div>

              <span className="bg-emerald-500/10 text-emerald-400 text-[10.5px] font-black tracking-widest uppercase px-3 py-1 rounded-full border border-emerald-500/20">
                {lang === 'kh' ? 'ជោគជ័យ (SUCCESS)' : 'CHECK-IN SUCCESSFUL'}
              </span>

              <h2 className="text-xl font-black text-slate-100 font-sans tracking-tight mt-4">
                {successInfo.name}
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                {lang === 'kh' ? 'បានចុះវត្តមានជាផ្លូវការរួចរាល់' : 'Your attendance has been logged!'}
              </p>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mt-6 flex items-center justify-center gap-3">
                <Clock className="w-4 h-4 text-amber-500" />
                <div className="text-left">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    {lang === 'kh' ? 'កាលបរិច្ឆេទ & ម៉ោងចាក់សោ' : 'Timestamp Recorded'}
                  </div>
                  <div className="text-sm font-black text-amber-400 mt-0.5">
                    {successInfo.time} — {todayStr}
                  </div>
                </div>
              </div>

              <div className="text-[10.5px] font-bold text-slate-500 mt-8 flex items-center justify-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-600" />
                {lang === 'kh' ? 'ទំព័រនេះនឹងសម្អាតឡើងវិញដោយស្វ័យប្រវត្តិ...' : 'Resetting system automatically for next person...'}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 items-stretch h-full">
        
        {/* Left Side: Instructions and Staff List */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          
          {/* Header instructions block */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <div className="text-emerald-400 text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{lang === 'kh' ? 'ស្វាគមន៍មកកាន់ប្រព័ន្ធស្វ័យសេវា' : 'WELCOME TO THE FRONT DESK PORTAL'}</span>
            </div>
            <h2 className="text-base font-black text-slate-100 font-sans tracking-tight">
              {lang === 'kh' ? 'សូមស្កេន ឬជ្រើសរើសឈ្មោះរបស់អ្នក ដើម្បីចុះឈ្មោះវត្តមាន' : 'Select your name to sign-in securely'}
            </h2>
            <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-400 font-bold bg-slate-950/55 p-2 rounded-xl border border-slate-800/40 w-fit">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{todayDisplay}</span>
            </div>
          </div>

          {/* Search controls */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center shrink-0">
            <div className="relative w-full flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                placeholder={lang === 'kh' ? "ស្វែងរកតាម ឈ្មោះ ឬ លេខសម្គាល់បុគ្គលិក..." : "Search by Staff Name or ID..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/90 leading-normal border border-slate-800 hover:border-slate-700 focus:border-emerald-500/80 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-250 placeholder-slate-550 outline-none transition duration-200"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value as any)}
              className="w-full sm:w-48 bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-300 outline-none focus:border-emerald-500/80 cursor-pointer"
            >
              <option value="All">{lang === 'kh' ? 'គ្រប់ផ្នែកទាំងអស់ (All Depts)' : 'All Departments'}</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {DEPARTMENT_NAMES_KM[dept] || dept}
                </option>
              ))}
            </select>
          </div>

          {/* Scrollable list card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden min-h-[350px]">
            <div className="bg-slate-950/60 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-wider shrink-0">
              <span>{lang === 'kh' ? `បញ្ជីបុគ្គលិក (${filteredStaff.length} នាក់)` : `Staff List (${filteredStaff.length} found)`}</span>
              <span>{lang === 'kh' ? 'ស្ថានភាពវត្តមានថ្ងៃនេះ' : 'Status Today'}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredStaff.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 gap-2">
                  <User className="w-12 h-12 text-slate-700" />
                  <p className="text-xs font-bold">
                    {lang === 'kh' ? 'រកមិនឃើញបុគ្គលិកដែលចង់ស្វែងរកទេ!' : 'No staff found matching search filter.'}
                  </p>
                </div>
              ) : (
                filteredStaff.map((staff) => {
                  const isAlreadyDone = checkedInIds.has(staff.staffId);
                  
                  return (
                    <button
                      key={staff.staffId}
                      onClick={() => handleSelectStaff(staff)}
                      className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                        selectedStaff?.staffId === staff.staffId
                          ? 'bg-emerald-600/10 border-emerald-500/60 text-slate-100 shadow-lg shadow-emerald-500/5'
                          : isAlreadyDone
                          ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-400 opacity-60 hover:opacity-85'
                          : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/30 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm uppercase shrink-0 border shadow-md ${
                          isAlreadyDone 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}>
                          {staff.photo ? (
                            <img 
                              src={staff.photo} 
                              alt="" 
                              className="w-full h-full object-cover rounded-full"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            staff.name.slice(0, 2)
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-extrabold flex items-center gap-2">
                            <span>{staff.name}</span>
                            <span className="text-[9.5px] font-mono text-slate-500 px-1.5 py-0.5 bg-slate-900 rounded-md border border-slate-800">
                              {staff.staffId}
                            </span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 mt-1">
                            {DEPARTMENT_NAMES_KM[staff.department] || staff.department}
                          </div>
                        </div>
                      </div>

                      <div>
                        {isAlreadyDone ? (
                          <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {lang === 'kh' ? 'រួចរាល់' : 'Checked In'}
                          </span>
                        ) : (
                          <span className="bg-slate-800/80 text-slate-400 font-extrabold text-[9.5px] px-2.5 py-1 rounded-full uppercase tracking-wider border border-slate-700/40">
                            {lang === 'kh' ? 'មិនទាន់ចុះឈ្មោះ' : 'Pending'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Security verification checkin form panel */}
        <div className="w-full md:w-80 shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-full flex flex-col justify-between overflow-hidden relative">
            
            {/* Top Info Header */}
            <div>
              <div className="border-b border-slate-800 pb-3 mb-4.5">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>{lang === 'kh' ? 'ការបញ្ជាក់សន្តិសុខ' : 'SECURITY VERIFICATION'}</span>
                </h3>
              </div>

              {selectedStaff ? (
                <form onSubmit={handleConfirmCheckin} className="space-y-4">
                  {/* Selected staff detail card */}
                  <div className="bg-slate-950/80 border border-emerald-500/10 rounded-2xl p-4 text-center">
                    <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center font-black text-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3 shadow-lg">
                      {selectedStaff.photo ? (
                        <img 
                          src={selectedStaff.photo} 
                          alt="" 
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        selectedStaff.name.slice(0, 2)
                      )}
                    </div>
                    
                    <h4 className="text-sm font-black text-slate-100">{selectedStaff.name}</h4>
                    <span className="inline-block text-[10px] font-mono font-black text-emerald-400 px-2 py-0.5 bg-emerald-500/5 border border-emerald-500/10 rounded-md mt-1.5 uppercase">
                      ID: {selectedStaff.staffId}
                    </span>
                    <p className="text-[10px] font-bold text-slate-500 mt-1">
                      {DEPARTMENT_NAMES_KM[selectedStaff.department] || selectedStaff.department}
                    </p>
                  </div>

                  {/* Id Confirm Field */}
                  <div className="space-y-1.5">
                    <label className="block text-[10.5px] font-extrabold text-slate-400">
                      {lang === 'kh' ? 'បញ្ចូលលេខសម្គាល់បុគ្គលិកដើម្បីបញ្ជាក់៖' : 'Confirm your Staff ID:'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === 'kh' ? "ឧ. " + selectedStaff.staffId : "e.g. " + selectedStaff.staffId}
                      value={verifyStaffId}
                      onChange={(e) => setVerifyStaffId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/80 rounded-xl px-3 py-2 text-xs font-black tracking-widest text-center text-amber-400 outline-none uppercase transition"
                    />
                  </div>

                  {/* Notes Field */}
                  <div className="space-y-1.5">
                    <label className="block text-[10.5px] font-bold text-slate-400">
                      {lang === 'kh' ? 'កំណត់ចំណាំផ្សេងៗ (ចងស្រេចចិត្ត)៖' : 'Optional notes:'}
                    </label>
                    <textarea
                      placeholder={lang === 'kh' ? "ឧ. មកដល់ទាន់ពេលល្អ ឬ មកយឺតបន្តិច..." : "e.g. On-time, or traffic delay..."}
                      value={userNotes}
                      onChange={(e) => setUserNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-none focus:border-emerald-500/80 transition resize-none"
                    />
                  </div>

                  {errorMsg && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2 text-rose-400 text-[10.5px] font-bold leading-relaxed">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || checkedInIds.has(selectedStaff.staffId)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-850 disabled:text-slate-600 disabled:border-slate-900 border border-emerald-500/20 text-slate-100 rounded-xl text-xs font-black tracking-wider transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/10 uppercase"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-200" />
                        <span>{lang === 'kh' ? 'កំពុងចុះឈ្មោះ...' : 'SUBMITTING...'}</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>{lang === 'kh' ? 'ចុះវត្តមានឥឡូវនេះ' : 'Confirm Check-In'}</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="h-[250px] flex flex-col items-center justify-center text-center text-slate-650 p-4 border border-dashed border-slate-800 rounded-2xl gap-3">
                  <div className="bg-slate-950/40 p-3 rounded-2xl text-slate-600 border border-slate-800/50">
                    <User className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-slate-400">
                      {lang === 'kh' ? 'មិនទាន់មានជ្រើសរើស' : 'No Staff Selected'}
                    </p>
                    <p className="text-[10.5px] font-bold text-slate-500 leading-normal px-2">
                      {lang === 'kh' ? 'សូមជ្រើសរើសឈ្មោះរបស់អ្នកលម្អិតក្នុងបញ្ជីខាងឆ្វេង ដើម្បីចាប់ផ្តើមចុះវត្តមានទូរសព្ទដៃ' : 'Select your profile from the left scroll area to verify identity.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Brand Heart Note */}
            <div className="text-center pt-4 border-t border-slate-850 mt-6 shrink-0">
              <span className="text-[9px] font-black text-slate-600 tracking-wider uppercase flex items-center justify-center gap-1 font-mono">
                Made with <Heart className="w-3 h-3 text-rose-600 animate-pulse fill-rose-600/60" /> for WIS Campus
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
