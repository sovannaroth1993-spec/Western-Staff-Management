/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Award, ShieldCheck, Users, Sparkles, Upload, X, User, Camera, PenLine } from 'lucide-react';
import { translations, Language } from '../lib/translations';

interface HeaderProps {
  totalStaff: number;
  totalPresentToday: number;
  lang: Language;
}

export default function Header({ totalStaff, totalPresentToday, lang }: HeaderProps) {
  const t = translations[lang];
  const [time, setTime] = useState(new Date());
  const [logo, setLogo] = useState<string>(() => {
    try {
      return localStorage.getItem('wis_school_logo') || '';
    } catch {
      return '';
    }
  });

  const [profileName, setProfileName] = useState(() => {
    try {
      return localStorage.getItem('wis_profile_name') || 'សុវណ្ណារ័ត្ន';
    } catch {
      return 'សុវណ្ណារ័ត្ន';
    }
  });

  const [profileRole, setProfileRole] = useState(() => {
    try {
      return localStorage.getItem('wis_profile_role') || 'អ្នកគ្រប់គ្រងប្រព័ន្ធ';
    } catch {
      return 'អ្នកគ្រប់គ្រងប្រព័ន្ធ';
    }
  });

  const [profileAvatar, setProfileAvatar] = useState(() => {
    try {
      return localStorage.getItem('wis_profile_avatar') || '';
    } catch {
      return '';
    }
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNameField, setEditNameField] = useState(profileName);
  const [editRoleField, setEditRoleField] = useState(profileRole);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileAvatar(base64String);
        try {
          localStorage.setItem('wis_profile_avatar', base64String);
        } catch (error) {
          console.error("Local storage error:", error);
          alert(t.imageTooLarge);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProfileAvatar('');
    try {
      localStorage.removeItem('wis_profile_avatar');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNameField.trim() || !editRoleField.trim()) return;
    setProfileName(editNameField);
    setProfileRole(editRoleField);
    try {
      localStorage.setItem('wis_profile_name', editNameField);
      localStorage.setItem('wis_profile_role', editRoleField);
    } catch (err) {
      console.error(err);
    }
    setIsEditModalOpen(false);
  };

  const handleOpenEditModal = () => {
    setEditNameField(profileName);
    setEditRoleField(profileRole);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogo(base64String);
        try {
          localStorage.setItem('wis_school_logo', base64String);
        } catch (error) {
          console.error("Local storage error:", error);
          alert(t.imageTooLarge);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogo('');
    try {
      localStorage.removeItem('wis_school_logo');
    } catch (err) {
      console.error(err);
    }
  };

  // Format Date dynamically
  const formatDateString = (date: Date) => {
    if (lang === 'en') {
      const weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthsEn = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${weekdaysEn[date.getDay()]}, ${monthsEn[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
    const weekdays = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
    const months = [
      'មករា', 'កម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 
      'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
    ];
    
    const dayName = weekdays[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `ថ្ងៃ${dayName}, ទី${day} ${monthName} ${year}`;
  };

  const presencePercent = totalStaff > 0 ? Math.round((totalPresentToday / totalStaff) * 100) : 0;

  return (
    <header className="sticky top-2 z-40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-950 border-b-4 border-emerald-500 text-white relative overflow-hidden shadow-2xl rounded-2xl mb-8">
      {/* Absolute Decorative Glow Rings */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Upper Branded Color Strip */}
      <div className="bg-emerald-900 h-1.5 w-full" />

      <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        
        {/* Logo and Brand Info */}
        <div className="flex items-center gap-4">
          {/* Logo Upload Section */}
          <div className="relative group">
            {logo ? (
              <div className="relative w-16 h-16 flex items-center justify-center bg-transparent group-hover:scale-105 transition-all duration-300">
                <img 
                  src={logo} 
                  alt="Western International School Logo" 
                  className="object-contain w-full h-full max-h-16 max-w-16"
                  referrerPolicy="no-referrer"
                />
                
                {/* Actions on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center gap-1.5 z-10">
                  <label className="p-1 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-md cursor-pointer transition" title="ប្តូរ Logo">
                    <Upload className="w-3.5 h-3.5" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload} 
                      className="hidden" 
                    />
                  </label>
                  <button 
                    onClick={handleRemoveLogo} 
                    className="p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-md transition" 
                    title="លុប Logo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-amber-500/35 hover:border-amber-400 bg-emerald-900/30 hover:bg-emerald-900/60 rounded-2xl cursor-pointer transition-all duration-300 group shadow-inner">
                <Upload className="w-5 h-5 text-amber-500/60 group-hover:text-amber-400 group-hover:scale-110 transition-all duration-300" />
                <span className="text-[9px] font-bold text-slate-400 mt-1 bg-emerald-950/60 px-1 py-0.5 rounded uppercase tracking-wider scale-90">Logo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload} 
                  className="hidden" 
                />
              </label>
            )}
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-moul tracking-normal mt-1 mb-1.5 leading-relaxed text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-400">
              {lang === 'en' ? 'Western International School' : 'សាលាវេស្ទើនអន្តរជាតិ'}
            </h1>
            <p className="text-sm md:text-base font-bold text-emerald-200 tracking-wider uppercase">
              {lang === 'en' ? 'Chamkar Doung Branch' : 'Western International School • សាខាចំការដូង'}
            </p>
          </div>
        </div>

        {/* Real-time Widget and Stats */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-start lg:self-auto">
          {/* Time & Date Display */}
          <div className="bg-emerald-950/70 backdrop-blur border border-emerald-800/40 p-4 rounded-xl flex items-center gap-3.5 shadow-lg">
            <div className="bg-emerald-900/55 p-2.5 rounded-lg text-amber-400">
              <Clock className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-300/90">{t.realtimeClock}</div>
              <div className="text-lg md:text-xl font-extrabold text-white tracking-tight">
                {time.toLocaleTimeString('en-US', { hour12: true })}
              </div>
              <div className="text-xs md:text-sm font-semibold text-amber-400 mt-1">
                {formatDateString(time)}
              </div>
            </div>
          </div>

          {/* Quick Attendance Progress Gauge */}
          <div className="bg-emerald-950/70 backdrop-blur border border-emerald-800/40 p-4 rounded-xl flex items-center gap-3.5 min-w-[220px] shadow-lg">
            <div className="relative flex items-center justify-center">
              {/* Simple Circular progress look */}
              <div className="w-12 h-12 rounded-full border-4 border-emerald-800/45 flex items-center justify-center">
                <span className="text-xs md:text-sm font-black text-emerald-400">{presencePercent}%</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-300/90">{t.todayAttendance}</div>
              <div className="text-base md:text-lg font-black text-white mt-0.5">
                {totalPresentToday} / {totalStaff} {t.peopleUnit}
              </div>
              <div className="w-28 bg-emerald-900/55 h-2 rounded-full overflow-hidden mt-1.5">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${presencePercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* User Profile Widget */}
          <div className="bg-emerald-950/70 backdrop-blur border border-emerald-800/40 p-4 rounded-xl flex items-center gap-3.5 min-w-[240px] shadow-lg relative group">
            {/* Avatar block */}
            <div className="relative">
              {profileAvatar ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 flex items-center justify-center bg-emerald-950 shrink-0">
                  <img 
                    src={profileAvatar} 
                    alt="User Profile" 
                    className="object-cover w-full h-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-900/55 border-2 border-emerald-800/40 flex items-center justify-center text-amber-400 shrink-0">
                  <User className="w-6 h-6" />
                </div>
              )}
              {/* Camera Icon on Hover to quickly upload profile */}
              <label className="absolute -bottom-1 -right-1 w-5.5 h-5.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xs" title={lang === 'en' ? 'Change Photo' : 'ប្តូររូបថត'}>
                <Camera className="w-3 h-3" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  className="hidden" 
                />
              </label>
            </div>
            {/* Name and role block */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-emerald-300/90 flex items-center justify-between">
                <span>{t.currentAccount}</span>
                <button 
                  onClick={handleOpenEditModal}
                  className="text-amber-400 hover:text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer p-0.5 rounded hover:bg-white/5 inline-flex items-center"
                  title={t.editProfile}
                >
                  <PenLine className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-sm font-extrabold text-white truncate mt-0.5" title={profileName}>
                {profileName === 'សុវណ្ណារ័ត្ន' && lang === 'en' ? 'Sovannaroth' : profileName}
              </div>
              <div className="text-[11px] font-semibold text-emerald-200 truncate mt-0.5" title={profileRole}>
                {profileRole === 'អ្នកគ្រប់គ្រងប្រព័ន្ធ' && lang === 'en' ? 'System Administrator' : profileRole}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-800">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4.5 h-4.5 text-amber-400" />
                <h3 className="font-sans text-xs text-white font-bold leading-relaxed">
                  {t.editProfile}
                </h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 space-y-4 font-sans">
              {/* Profile Avatar Selection in Form */}
              <div className="flex flex-col items-center gap-2 pb-2 border-b border-slate-100">
                <div className="relative group">
                  {profileAvatar ? (
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-emerald-500/10 flex items-center justify-center bg-slate-50">
                      <img 
                        src={profileAvatar} 
                        alt="Preview" 
                        className="object-cover w-full h-full"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                  
                  {/* Avatar Controls inside form */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center gap-1.5">
                    <label className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-full cursor-pointer transition">
                      <Camera className="w-3.5 h-3.5" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarUpload} 
                        className="hidden" 
                      />
                    </label>
                    {profileAvatar && (
                      <button 
                        type="button"
                        onClick={handleRemoveAvatar} 
                        className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full transition" 
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">{t.clickToChange}</span>
              </div>

              {/* Name Field */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-500">{t.accountName} <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={editNameField}
                  onChange={(e) => setEditNameField(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 transition"
                  required
                />
              </div>

              {/* Role Field */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-500">{t.accountRole} <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={editRoleField}
                  onChange={(e) => setEditRoleField(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 transition"
                  required
                />
              </div>

              {/* Footer buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-100 transition border rounded-xl text-slate-500 text-xs font-bold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
