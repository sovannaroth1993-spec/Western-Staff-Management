import React, { useState } from 'react';
import { UserAccount } from '../types';
import { motion } from 'motion/react';
import { Key, User, ShieldAlert, LogIn, Lock, CheckCircle2, X, Upload } from 'lucide-react';

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

  // Logo state
  const [logo, setLogo] = useState<string>(() => {
    try {
      return localStorage.getItem('wis_school_logo') || '';
    } catch {
      return '';
    }
  });

  // Sync logo in real-time
  React.useEffect(() => {
    const handleStorageChange = () => {
      try {
        setLogo(localStorage.getItem('wis_school_logo') || '');
      } catch (err) {
        console.error(err);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('wis_logo_changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wis_logo_changed', handleStorageChange);
    };
  }, []);

  // Forgot Password States
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

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
      roleUser: "បុគ្គលិកធម្មតា (Standard User)",
      forgotPasswordLink: "ភ្លេចលេខកូដសម្ងាត់? ស្នើសុំ Admin កំណត់ឡើងវិញ",
      forgotTitle: "ស្នើសុំកំណត់លេខសម្ងាត់ឡើងវិញ",
      forgotSubmit: "ផ្ញើសំណើសុំកំណត់ឡើងវិញ",
      forgotUsernameLabel: "បញ្ចូលឈ្មោះគណនីរបស់អ្នក *",
      forgotErrEmpty: "សូមបញ្ចូលឈ្មោះគណនី!",
      forgotErrNotFound: "មិនរកឃើញឈ្មោះគណនីនេះក្នុងប្រព័ន្ធឡើយ!",
      forgotErrPending: "សំណើសុំកំណត់លេខសម្ងាត់របស់គណនីនេះ កំពុងរង់ចាំ Admin អនុម័តរួចហើយ!",
      forgotSuccessMsg: "សំណើសុំកំណត់លេខសម្ងាត់ឡើងវិញត្រូវបានផ្ញើដោយជោគជ័យ! សូមទាក់ទងអ្នកគ្រប់គ្រង (Admin) ដើម្បីអនុម័ត។",
      backToLogin: "ត្រឡប់ទៅទំព័រចូលគណនី"
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
      roleUser: "Standard User",
      forgotPasswordLink: "Forgot password? Request Admin reset",
      forgotTitle: "Request Password Reset",
      forgotSubmit: "Submit Reset Request",
      forgotUsernameLabel: "Enter your username *",
      forgotErrEmpty: "Please enter your username!",
      forgotErrNotFound: "This username was not found in the system!",
      forgotErrPending: "A password reset request for this user is already pending Admin approval!",
      forgotSuccessMsg: "Reset request submitted successfully! Please contact your Administrator to approve.",
      backToLogin: "Back to Secure Login"
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

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotUsername.trim()) {
      setForgotError(t.forgotErrEmpty);
      return;
    }

    const tUsername = forgotUsername.trim().toLowerCase();
    const foundUser = usersList.find(u => u.username.toLowerCase() === tUsername);
    if (!foundUser) {
      setForgotError(t.forgotErrNotFound);
      return;
    }

    // Load existing reset requests to prevent duplicate pending
    let logs = [];
    try {
      const savedLogs = localStorage.getItem('wis_password_reset_logs');
      if (savedLogs) {
        logs = JSON.parse(savedLogs);
      }
    } catch (err) {
      console.error(err);
    }

    const isPending = logs.some((l: any) => l.username.toLowerCase() === tUsername && l.status === 'Pending');
    if (isPending) {
      setForgotError(t.forgotErrPending);
      return;
    }

    // Create new log entry
    const newLog = {
      id: 'pr_' + Date.now(),
      userId: foundUser.id,
      username: foundUser.username,
      fullName: foundUser.fullName,
      actionType: 'User_Requested',
      requestedAt: new Date().toISOString(),
      performedBy: 'Client Portal',
      status: 'Pending',
      details: lang === 'kh' ? 'ស្នើឡើងដោយបុគ្គលិកតាមទំព័រដើម។' : 'Requested via Client login portal.'
    };

    const updatedLogs = [newLog, ...logs];
    try {
      localStorage.setItem('wis_password_reset_logs', JSON.stringify(updatedLogs));
    } catch (err) {
      console.error(err);
    }

    setForgotSuccess(t.forgotSuccessMsg);
    setForgotUsername('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 font-sans relative overflow-hidden">
      {/* Visual Ambient Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#073B3A]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden relative z-10 flex flex-col gap-0">
        
        {/* Superior Branding Panel */}
        <div className="bg-[#073B3A] text-white p-6 pb-8 text-center relative border-b-4 border-amber-400">
          {/* Custom Logo uploadable container - allows transparent background */}
          <div className="relative group mx-auto w-20 h-20 mb-3.5 flex items-center justify-center">
            {logo ? (
              <div className="relative w-20 h-20 flex items-center justify-center bg-transparent group-hover:scale-105 transition-all duration-300">
                <img 
                  src={logo} 
                  alt="WIS Logo" 
                  className="object-contain w-full h-full max-h-20 max-w-20"
                  referrerPolicy="no-referrer"
                />
                
                {/* Logo Actions Overlay (Edit / Delete) */}
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl flex items-center justify-center gap-1.5 z-10">
                  <label className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg cursor-pointer transition shadow-md" title={lang === 'kh' ? 'កែសម្រួល Logo' : 'Change Logo'}>
                    <Upload className="w-3.5 h-3.5 font-bold" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64String = reader.result as string;
                            setLogo(base64String);
                            try {
                              localStorage.setItem('wis_school_logo', base64String);
                              // Dispatch event to update other components (Header, etc.)
                              window.dispatchEvent(new Event('storage'));
                              window.dispatchEvent(new Event('wis_logo_changed'));
                            } catch (error) {
                              console.error("Local storage error:", error);
                              alert(lang === 'kh' ? "រូបភាពធំពេក! សូមជ្រើសរើសរូបភាពតូចជាង ២MB។" : "Image too large! Please select a smaller file.");
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                      className="hidden" 
                    />
                  </label>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(lang === 'kh' ? "តើអ្នកចង់លុប Logo ផ្ទាល់ខ្លួននេះមែនទេ?" : "Are you sure you want to remove this custom logo?")) {
                        setLogo('');
                        try {
                          localStorage.removeItem('wis_school_logo');
                          window.dispatchEvent(new Event('storage'));
                          window.dispatchEvent(new Event('wis_logo_changed'));
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }} 
                    className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition shadow-md cursor-pointer" 
                    title={lang === 'kh' ? 'លុប Logo' : 'Remove Logo'}
                  >
                    <X className="w-3.5 h-3.5 font-bold" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <div className="w-14 h-14 bg-gradient-to-tr from-amber-300 to-amber-500 rounded-2xl flex items-center justify-center text-slate-950 font-black text-lg shadow-md hover:scale-105 transition duration-350">
                  WIS
                </div>
                {/* Hover label to upload custom transparent PNG */}
                <label className="absolute inset-0 bg-[#073B3A]/85 border-2 border-dashed border-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer text-white text-[9px] font-black uppercase tracking-tight shadow-lg" title={lang === 'kh' ? 'បញ្ចូល Logo គ្មាន Background' : 'Upload custom logo'}>
                  <Upload className="w-4 h-4 text-amber-300 mb-0.5 animate-bounce" />
                  <span>Logo</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64String = reader.result as string;
                          setLogo(base64String);
                          try {
                            localStorage.setItem('wis_school_logo', base64String);
                            window.dispatchEvent(new Event('storage'));
                            window.dispatchEvent(new Event('wis_logo_changed'));
                          } catch (error) {
                            console.error("Local storage error:", error);
                            alert(lang === 'kh' ? "រូបភាពធំពេក! សូមជ្រើសរើសរូបភាពតូចជាង ២MB។" : "Image too large! Please select a smaller file.");
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                    className="hidden" 
                  />
                </label>
              </div>
            )}
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

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setForgotUsername('');
                  setForgotError('');
                  setForgotSuccess('');
                  setIsForgotModalOpen(true);
                }}
                className="text-[11px] font-black text-emerald-800 hover:text-emerald-950 hover:underline transition cursor-pointer"
              >
                {t.forgotPasswordLink}
              </button>
            </div>
          </form>
        </div>

        {/* Forgot Password Modal */}
        {isForgotModalOpen && (
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b-2 border-emerald-500">
                <div className="flex items-center gap-2">
                  <Key className="w-4.5 h-4.5 text-amber-405" />
                  <h3 className="text-sm font-black text-white">{t.forgotTitle}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleForgotSubmit} className="p-6 space-y-4">
                {forgotError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-805 px-4 py-2.5 rounded-2xl text-xs font-bold leading-relaxed">
                    ⚠️ {forgotError}
                  </div>
                )}

                {forgotSuccess ? (
                  <div className="space-y-4 py-2 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 leading-relaxed px-2">
                      {forgotSuccess}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(false)}
                      className="inline-flex items-center justify-center w-full bg-[#073B3A] hover:bg-[#052b2a] text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-md transition duration-200 cursor-pointer"
                    >
                      {t.backToLogin}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black text-slate-500">{t.forgotUsernameLabel}</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={forgotUsername}
                          onChange={(e) => setForgotUsername(e.target.value)}
                          placeholder="e.g. user01"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 transition placeholder:text-slate-400"
                        />
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 px-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all duration-200 cursor-pointer text-center"
                    >
                      <span>{t.forgotSubmit}</span>
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
