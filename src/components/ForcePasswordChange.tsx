import React, { useState } from 'react';
import { UserAccount } from '../types';
import { motion } from 'motion/react';
import { ShieldAlert, Key, Lock, CheckCircle2, LogOut, RefreshCw } from 'lucide-react';

interface ForcePasswordChangeProps {
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount | null) => void;
  usersList: UserAccount[];
  setUsersList: (users: UserAccount[]) => void;
  lang: 'kh' | 'en';
  onLogout: () => void;
}

export default function ForcePasswordChange({
  currentUser,
  setCurrentUser,
  usersList,
  setUsersList,
  lang,
  onLogout
}: ForcePasswordChangeProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const t = {
    kh: {
      tag: "ត្រូវការផ្លាស់ប្តូរលេខសម្ងាត់ (Password Change Required)",
      message: "ដើម្បីសុវត្ថិភាពគណនីរបស់អ្នក ព្រោះលេខសម្ងាត់ត្រូវបាន Reset ដោយអ្នកគ្រប់គ្រងប្រព័ន្ធ។ សូមបង្កើតលេខសម្ងាត់ថ្មីមួយដែលរឹងមាំដើម្បីបន្តចូលប្រើប្រាស់។",
      newPassLabel: "លេខសម្ងាត់ថ្មី (New Password) *",
      confirmPassLabel: "បញ្ជាក់លេខសម្ងាត់ថ្មី (Confirm New Password) *",
      btnSubmit: "ផ្លាស់ប្តូរ និងចូលប្រើប្រាស់ប្រព័ន្ធ",
      btnLogout: "ចាកចេញ (Sign Out)",
      errEmpty: "សូមបំពេញចន្លោះទិន្នន័យទាំងអស់!",
      errMatch: "លេខសម្ងាត់ថ្មី និងលេខសម្ងាត់បញ្ជាក់មិនត្រូវគ្នាទេ!",
      errDefault: "លេខសម្ងាត់ថ្មីមិនអាចជាលេខលំនាំដើម '123456' បានទេ! សូមជ្រើសរើសលេខផ្សេងដែលសុវត្ថិភាព។",
      errShort: "លេខសម្ងាត់ថ្មីត្រូវតែមានយ៉ាងតិច ៦ ខ្ទង់!",
      successMsg: "ការផ្លាស់ប្តូរលេខសម្ងាត់ដោយជោគជ័យ! ប្រព័ន្ធកំពុងនាំអ្នកចូល...",
    },
    en: {
      tag: "PASSWORD CHANGE REQUIRED",
      message: "An administrator has reset your password. For security purposes, you must create a new secure password before you can access the dashboard.",
      newPassLabel: "New Password *",
      confirmPassLabel: "Confirm New Password *",
      btnSubmit: "Save Password & Sign In",
      btnLogout: "Log Out",
      errEmpty: "Please complement all required password fields!",
      errMatch: "The new password and confirm password do not match!",
      errDefault: "Your password cannot be the insecure default '123456'! Please select a more complex one.",
      errShort: "The new password must be at least 6 characters long!",
      successMsg: "Password changed successfully! Signing you into the portal...",
    }
  }[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newPassword || !confirmPassword) {
      setErrorMsg(t.errEmpty);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg(t.errShort);
      return;
    }

    if (newPassword === '123456') {
      setErrorMsg(t.errDefault);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(t.errMatch);
      return;
    }

    // Success! Update password & clear forcePasswordChange in key state / storage
    const updatedUsers = usersList.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          password: newPassword,
          forcePasswordChange: false
        };
      }
      return u;
    });

    // Update in usersList parent state
    setUsersList(updatedUsers);

    // Update currentUser state and sync to localStorage
    const updatedUser: UserAccount = {
      ...currentUser,
      password: newPassword,
      forcePasswordChange: false
    };

    setSuccess(true);

    setTimeout(() => {
      // Complete state update
      try {
        localStorage.setItem('wis_current_user', JSON.stringify(updatedUser));
      } catch (err) {
        console.error(err);
      }
      setCurrentUser(updatedUser);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 font-sans relative overflow-hidden">
      {/* Visual Ambient Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#073B3A]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden relative z-10 flex flex-col gap-0"
      >
        {/* Superior Branding Panel */}
        <div className="bg-[#073B3A] text-white p-6 pb-7 text-center relative border-b-4 border-amber-400">
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-slate-950 font-black text-lg mx-auto shadow-md mb-2">
            <Lock className="w-5 h-5 text-slate-950" />
          </div>
          <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block mb-1">
            {t.tag}
          </span>
          <p className="text-[11px] text-emerald-100 leading-relaxed max-w-sm mx-auto px-1">
            {t.message}
          </p>
        </div>

        {/* Credentials Form */}
        <div className="p-6">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-850 px-4 py-3 rounded-2xl text-[11px] font-bold mb-4 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-850 px-4 py-3 rounded-2xl text-[11px] font-bold mb-4 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 className animate-bounce" />
              <span>{t.successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-500">{t.newPassLabel}</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={success}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#073B3A]/25 focus:border-[#073B3A] transition placeholder:text-slate-400 disabled:opacity-50"
                />
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-500">{t.confirmPassLabel}</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={success}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#073B3A]/25 focus:border-[#073B3A] transition placeholder:text-slate-400 disabled:opacity-50"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={success}
                className="w-full bg-[#073B3A] hover:bg-[#0c5352] text-amber-300 font-extrabold hover:text-white py-3 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {success ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{t.btnSubmit}</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                disabled={success}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.btnLogout}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
