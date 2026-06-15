import React, { useState } from 'react';
import { UserAccount } from '../types';
import { motion } from 'motion/react';
import { Key, User, ShieldAlert, Sparkles, LogIn, ChevronDown, ChevronUp, Lock, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  usersList: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  lang: 'kh' | 'en';
  setLang: (lang: 'kh' | 'en') => void;
}

export default function LoginScreen({
  usersList,
  onLoginSuccess,
  lang,
  setLang
}: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showHelp, setShowHelp] = useState(true);

  const t = {
    kh: {
      tag: "ប្រព័ន្ធគ្រប់គ្រងសាលាវេស្ទើនអន្តរជាតិ",
      title: "ចូលប្រើប្រាស់ប្រព័ន្ធ",
      subtitle: "Western International School Portal",
      usernameLabel: "ឈ្មោះគណនី (Username) *",
      passwordLabel: "លេខកូដសម្ងាត់ (Password) *",
      loginBtn: "ចូលគណនី (Sign In)",
      errorEmpty: "សូមបញ្ចូលឈ្មោះគណនី និងលេខកូដសម្ងាត់!",
      errorInvalid: "ឈ្មោះគណនី ឬលេខកូដសម្ងាត់មិនត្រឹមត្រូវឡើយ!",
      errorInactive: "គណនីនេះត្រូវបានផ្អាកជាបណ្តោះអាសន្ន! សូមទាក់ទង Admin។",
      demoAccounts: "គណនីគំរូសម្រាប់សាកល្បង (Demo Accounts)",
      demoDesc: "អ្នកអាចប្រើប្រាស់គណនីខាងក្រោម ដើម្បីសាកល្បង៖",
      roleAdmin: "រដ្ឋបាល (Admin)",
      roleUser: "បុគ្គលិកធម្មតា (Standard User)"
    },
    en: {
      tag: "WESTERN INTERNATIONAL SCHOOL SYSTEM",
      title: "Staff Login Portal",
      subtitle: "Western International School Administration",
      usernameLabel: "Username *",
      passwordLabel: "Password *",
      loginBtn: "Secure Log In",
      errorEmpty: "Please enter your username and password!",
      errorInvalid: "Invalid username or password credentials!",
      errorInactive: "This account has been inactivated! Contact administrator.",
      demoAccounts: "Pre-loaded Demo Accounts (គណនីគំរូ)",
      demoDesc: "Use these credentials to evaluate the role permission behaviors:",
      roleAdmin: "System Administrator",
      roleUser: "Standard User"
    }
  }[lang];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg(t.errorEmpty);
      return;
    }

    // Lookup user
    const foundUser = usersList.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    
    if (!foundUser || foundUser.password !== password) {
      setErrorMsg(t.errorInvalid);
      return;
    }

    if (foundUser.status === 'inactive') {
      setErrorMsg(t.errorInactive);
      return;
    }

    // Success login
    onLoginSuccess(foundUser);
  };

  const handleFillDemo = (demoUser: string) => {
    setUsername(demoUser);
    setPassword('123456');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 font-sans relative overflow-hidden">
      {/* Visual Ambient Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#073B3A]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden relative z-10 flex flex-col gap-0">
        
        {/* Superior Branding Panel */}
        <div className="bg-[#073B3A] text-white p-6 pb-8 text-center relative border-b-4 border-amber-400">
          {/* Logo element placeholder visual wrapper */}
          <div className="w-14 h-14 bg-gradient-to-tr from-amber-300 to-amber-500 rounded-2xl flex items-center justify-center text-slate-950 font-black text-lg mx-auto shadow-md mb-3.5">
            WIS
          </div>
          <span className="text-[9.5px] font-black text-amber-300 uppercase tracking-widest block mb-1">
            {t.tag}
          </span>
          <h2 className="text-xl font-black tracking-tight leading-relaxed">
            {t.title}
          </h2>
          <p className="text-xs text-emerald-200 font-medium">
            {t.subtitle}
          </p>

          {/* Bilingual Switcher in Login */}
          <div className="absolute top-4 right-4 flex bg-slate-900/40 p-0.5 rounded-lg border border-emerald-800/20">
            <button
              onClick={() => setLang('kh')}
              type="button"
              className={`px-1.5 py-0.5 text-[8.5px] font-bold rounded cursor-pointer ${
                lang === 'kh' ? 'bg-amber-400 text-slate-950 font-black' : 'text-emerald-100/60'
              }`}
            >
              KH
            </button>
            <button
              onClick={() => setLang('en')}
              type="button"
              className={`px-1.5 py-0.5 text-[8.5px] font-bold rounded cursor-pointer ${
                lang === 'en' ? 'bg-amber-400 text-slate-950 font-black' : 'text-emerald-100/60'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Login Credentials Form */}
        <div className="p-6 pb-5">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-805 px-4 py-2.5 rounded-2xl text-xs font-bold mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-500">{t.usernameLabel}</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. admin, user01"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#073B3A]/25 focus:border-[#073B3A] transition placeholder:text-slate-400"
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-500">{t.passwordLabel}</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-extrabold text-slate-805 focus:outline-hidden focus:ring-2 focus:ring-[#073B3A]/25 focus:border-[#073B3A] transition placeholder:text-slate-400"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 w-full bg-[#073B3A] hover:bg-[#052b2a] text-white font-black text-xs py-3 px-4 rounded-2xl shadow-lg shadow-emerald-950/20 hover:shadow-xl transition-all duration-200 cursor-pointer text-center"
            >
              <LogIn className="w-4 h-4 text-amber-305" />
              <span>{t.loginBtn}</span>
            </button>
          </form>
        </div>

        {/* Pre-populated Evaluation Accounts Drawer */}
        <div className="border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="w-full px-6 py-3 flex items-center justify-between text-xs font-black text-slate-500 hover:text-slate-850 transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500 animate-bounce" />
              <span>{t.demoAccounts}</span>
            </span>
            {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHelp && (
            <div className="px-6 pb-6 space-y-3.5">
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                {t.demoDesc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Admin button filler */}
                <button
                  onClick={() => handleFillDemo('admin')}
                  type="button"
                  className="bg-white hover:bg-emerald-50/50 border border-slate-200 rounded-xl p-2 text-left transition text-xs font-bold block w-full group cursor-pointer"
                >
                  <div className="text-[9.5px] font-black text-emerald-805 flex items-center justify-between">
                    <span>Admin Profile</span>
                    <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-mono font-bold block">PWD: 123456</span>
                  </div>
                  <div className="text-[11px] text-slate-700 font-bold mt-1">@admin</div>
                  <div className="text-[9px] text-slate-400 font-semibold mt-0.5">System Admin</div>
                </button>

                {/* User 1 button filler */}
                <button
                  onClick={() => handleFillDemo('user01')}
                  type="button"
                  className="bg-white hover:bg-amber-50/40 border border-slate-200 rounded-xl p-2 text-left transition text-xs font-bold block w-full group cursor-pointer"
                >
                  <div className="text-[9.5px] font-black text-amber-705 flex items-center justify-between">
                    <span>User Profile</span>
                    <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-mono font-bold block font-bold">PWD: 123456</span>
                  </div>
                  <div className="text-[11px] text-slate-700 font-bold mt-1">@user01</div>
                  <div className="text-[9px] text-slate-400 font-semibold mt-0.5">John Doe (Standard)</div>
                </button>

                {/* Teacher 1 button filler */}
                <button
                  onClick={() => handleFillDemo('teacher01')}
                  type="button"
                  className="bg-white hover:bg-emerald-50/30 border border-slate-200 rounded-xl p-2 text-left transition text-xs font-bold block w-full group cursor-pointer"
                >
                  <div className="text-[9.5px] font-black text-emerald-805 flex items-center justify-between">
                    <span>User Profile</span>
                    <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-mono font-bold block font-bold">PWD: 123456</span>
                  </div>
                  <div className="text-[11px] text-slate-700 font-bold mt-1">@teacher01</div>
                  <div className="text-[9px] text-slate-400 font-semibold mt-0.5">Sok Dara (Teacher)</div>
                </button>

                {/* Staff 1 button filler */}
                <button
                  onClick={() => handleFillDemo('staff01')}
                  type="button"
                  className="bg-white hover:bg-emerald-50/30 border border-slate-200 rounded-xl p-2 text-left transition text-xs font-bold block w-full group cursor-pointer"
                >
                  <div className="text-[9.5px] font-black text-emerald-805 flex items-center justify-between">
                    <span>User Profile</span>
                    <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-mono font-bold block font-bold">PWD: 123456</span>
                  </div>
                  <div className="text-[11px] text-slate-700 font-bold mt-1">@staff01</div>
                  <div className="text-[9px] text-slate-400 font-semibold mt-0.5">Chan Vannak (Security)</div>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
