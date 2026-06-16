import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, UserRequest, Staff } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Clipboard, Send, Key, CheckCircle, Clock, AlertTriangle, HelpCircle, 
  Sparkles, FileText, Plus, ShieldAlert, Phone, MapPin, Radio, Calendar, FileDown, LogOut,
  Camera, Upload, X
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: UserAccount;
  usersList: UserAccount[];
  setUsersList: (users: UserAccount[]) => void;
  userRequests: UserRequest[];
  setUserRequests: (reqs: UserRequest[]) => void;
  staffList: Staff[];
  onLogout: () => void;
  lang: 'kh' | 'en';
}

export default function UserDashboard({
  currentUser,
  usersList,
  setUsersList,
  userRequests,
  setUserRequests,
  staffList,
  onLogout,
  lang
}: UserDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'own-data' | 'requests' | 'profile' | 'all-dashboards'>(() => {
    return currentUser.role === 'admin' ? 'all-dashboards' : 'own-data';
  });

  // Search state for all dashboards oversight view
  const [dsSearchTerm, setDsSearchTerm] = useState('');
  const [dsRoleFilter, setDsRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  // State to track which user card's system menu permission is expanded
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // Admin Monitoring / User selector feature
  const isAdmin = currentUser.role === 'admin';
  const [selectedUsername, setSelectedUsername] = useState<string>(currentUser.username);

  // Find currently active viewing user
  const activeUser = isAdmin
    ? (usersList.find(u => u.username === selectedUsername) || currentUser)
    : currentUser;

  // Request form state
  const [requestTitle, setRequestTitle] = useState('');
  const [requestType, setRequestType] = useState<'Leave' | 'Equipment' | 'Maintenance' | 'Other'>('Leave');
  const [description, setDescription] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Profile update state
  const [profileName, setProfileName] = useState(activeUser.fullName);
  const [newPassword, setNewPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Camera & avatar state
  const [avatar, setAvatar] = useState<string>(() => {
    return activeUser.avatar || localStorage.getItem('wis_profile_avatar') || '';
  });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setProfileName(activeUser.fullName);
    setAvatar(activeUser.avatar || '');
  }, [activeUser.username, activeUser.fullName]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async () => {
    setCameraError('');
    setIsCameraActive(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320, facingMode: 'user' },
        audio: false
      });
      setCameraStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError(lang === 'kh' ? 'មិនអាចបើកកាមេរ៉ាបានទេ! សូមពិនិត្យការអនុញ្ញាតសិទ្ធិ។' : 'Could not access camera! Please check permissions.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 320;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 320);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(dataUrl);
        } catch (error) {
          console.error("Canvas draw error:", error);
        }
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Translations
  const t = {
    kh: {
      welcome: "សូមស្វាគមន៍មកកាន់ប្រព័ន្ធ, ",
      roleLabel: "គណនីប្រើប្រាស់ធម្មតា • Standard User",
      logout: "ចាកចេញ",
      tabOwnData: "🔍 មើលទិន្នន័យផ្ទាល់ខ្លួន",
      tabRequests: "📝 បង្កើតសំណើសុំការអនុញ្ញាត",
      tabProfile: "⚙️ កែប្រែប្រវត្តិរូប",
      // Own Data Sub-view
      ownDataTitle: "ព័ត៌មានផ្ទាល់ខ្លួនបុគ្គលិក",
      ownDataEmpty: "គណនីរបស់អ្នកមិនទាន់បានភ្ជាប់ជាមួយបុគ្គលិកណាមួយនៅក្នុងបញ្ជីឡើយ។ សូមទាក់ទង Admin ដើម្បីភ្ជាប់ឈ្មោះពេញរបស់អ្នក ៖ ",
      personalDetails: "ព័ត៌មានលម្អិត",
      joinDate: "ថ្ងៃចូលធ្វើការ (Join Date)៖",
      dob: "ថ្ងៃខែឆ្នាំកំណើត (DOB)៖",
      contact: "លេខទូរស័ព្ទ (Contact)៖",
      department: "ផ្នែក/ដេប៉ាតឺម៉ង់៖",
      duty: "ទីតាំងប្រចាំការ៖",
      icom: "អាយកូម (Walkie-Talkie)៖",
      attachments: "ប័ណ្ណសារឯកសារភ្ជាប់ (Attachments)",
      noAttachments: "មិនទាន់មានឯកសារភ្ជាប់ក្នុងប្រព័ន្ធទេ",
      // Requests Sub-view
      requestTitleLabel: "ចំណងជើងសំណើ *",
      requestTypeLabel: "ប្រភេទសំណើ *",
      requestDescLabel: "ការពិពណ៌នាលម្អិត *",
      submitRequest: "បញ្ជូនសំណើទៅកាន់ Admin",
      successRequest: "សំណើរបស់អ្នកត្រូវបានបញ្ជូនទៅកាន់ Admin ដោយជោគជ័យ!",
      reqHistory: "ប្រវត្តិសំណើរបស់អ្នក",
      noHistRequests: "អ្នកមិនទាន់មានប្រវត្តិសំណើនៅឡើយទេ",
      statusPending: "កំពុងរង់ចាំ",
      statusApproved: "បានអនុម័ត",
      statusRejected: "បានបដិសេធ",
      adminRemarks: "កំណត់សម្គាល់របស់ Admin ៖",
      // Update profile
      accName: "ឈ្មោះពេញក្នុងគណនី *",
      accPass: "លេខកូដសម្ងាត់ថ្មី (ទុកទទេបើមិនចង់ប្តូរ)",
      saveChanges: "រក្សាទុកការផ្លាស់ប្តូរ",
      successProfile: "ព័ត៌មានគណនីរបស់អ្នកត្រូវបានធ្វើបច្ចុប្បន្នភាពជោគជ័យ!"
    },
    en: {
      welcome: "Welcome back, ",
      roleLabel: "Standard User • គណនីធម្មតា",
      logout: "Sign Out",
      tabOwnData: "🔍 View Own Data",
      tabRequests: "📝 Create Request",
      tabProfile: "⚙️ Update Profile",
      // Own data Sub-view
      ownDataTitle: "Personal Staff Member Profile",
      ownDataEmpty: "Your account is not yet linked to any staff member in the directory. Please contact your Supervisor to match your name precisely: ",
      personalDetails: "Personal Details",
      joinDate: "Join Date (📅) :",
      dob: "Date of Birth (🎂) :",
      contact: "Phone Number (📞) :",
      department: "Department Division :",
      duty: "Duty Station Location :",
      icom: "Walkie-Talkie Icom :",
      attachments: "Your Document Attachments",
      noAttachments: "No document attachments indexed in your record",
      // Requests Sub-view
      requestTitleLabel: "Request Title *",
      requestTypeLabel: "Request Type *",
      requestDescLabel: "Detailed Description *",
      submitRequest: "Submit Request to Admin",
      successRequest: "Your request has been filed successfully and sent to Admin!",
      reqHistory: "Your Request Timelines",
      noHistRequests: "You have not filed any requests yet",
      statusPending: "Pending Approval",
      statusApproved: "Approved",
      statusRejected: "Rejected",
      adminRemarks: "Supervisor Feedback:",
      // Update profile
      accName: "Account Display Name *",
      accPass: "New Password (Leave empty to keep current)",
      saveChanges: "Save Profile",
      successProfile: "Your user account credentials updated successfully!"
    }
  }[lang];

  // Logic to auto-match current logged in user with the staff details list by full name comparison (or email)
  const matchedStaff = staffList.find(s => 
    s.name.trim().toLowerCase() === activeUser.fullName.trim().toLowerCase() ||
    s.staffId.trim().toLowerCase() === activeUser.username.trim().toLowerCase()
  );

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTitle.trim() || !description.trim()) return;

    const newReq: UserRequest = {
      id: 'req_' + Date.now(),
      username: activeUser.username,
      fullName: activeUser.fullName,
      requestTitle: requestTitle.trim(),
      requestType,
      description: description.trim(),
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    setUserRequests([newReq, ...userRequests]);
    setRequestTitle('');
    setDescription('');
    setRequestSuccess(true);
    setTimeout(() => setRequestSuccess(false), 4000);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    // Update locally stored credential accounts
    const updatedUsers = usersList.map(u => {
      if (u.id === activeUser.id) {
        return {
          ...u,
          fullName: profileName.trim(),
          password: newPassword ? newPassword : u.password,
          avatar: avatar
        };
      }
      return u;
    });

    setUsersList(updatedUsers);

    // Update session or local storage only if modifying logged-in user themselves
    if (activeUser.id === currentUser.id) {
      localStorage.setItem('wis_profile_name', profileName.trim());
      if (avatar) {
        localStorage.setItem('wis_profile_avatar', avatar);
      } else {
        localStorage.removeItem('wis_profile_avatar');
      }

      if (newPassword) {
        const updatedCurr = { ...currentUser, fullName: profileName.trim(), password: newPassword, avatar: avatar };
        sessionStorage.setItem('wis_current_user', JSON.stringify(updatedCurr));
        localStorage.setItem('wis_current_user', JSON.stringify(updatedCurr));
      } else {
        const updatedCurr = { ...currentUser, fullName: profileName.trim(), avatar: avatar };
        sessionStorage.setItem('wis_current_user', JSON.stringify(updatedCurr));
        localStorage.setItem('wis_current_user', JSON.stringify(updatedCurr));
      }
    }

    setNewPassword('');
    setProfileSuccess(true);
    setTimeout(() => {
      setProfileSuccess(false);
      if (activeUser.id === currentUser.id) {
        window.location.reload();
      }
    }, 1500);
  };

  // Filter requests that only belong to this user
  const myRequests = userRequests.filter(r => r.username === activeUser.username);

  return (
    <div className="space-y-6">
      {/* Admin Monitoring Selector Dropdown */}
      {isAdmin && (
        <div className="bg-amber-50/90 border-2 border-amber-200/80 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md shadow-amber-900/5 hover:border-amber-300 transition duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100/80 rounded-2xl flex items-center justify-center font-black shadow-inner shadow-amber-200 text-lg">
              👓
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                {lang === 'kh' ? 'សិទ្ធិពិសេសអ្នកគ្រប់គ្រងប្រព័ន្ធ (Admin Monitoring)' : 'Admin Monitoring Oversight'}
              </h4>
              <p className="text-[11px] text-amber-800 font-semibold leading-relaxed mt-0.5">
                {lang === 'kh' ? 'លោកអ្នកមានសិទ្ធិចូលមើលគណនីបុគ្គលិកណាម្នាក់ ដើម្បីពិនិត្យទិន្នន័យ ឯកសារ បង្កើតសំណើ និងកែប្រែប្រវត្តិរូបរបស់ពួកគាត់បានយ៉ាងពេញលេញ។' : 'You have administrator privileges to view, inspect, file requests, or update the profile for any user.'}
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 flex items-center gap-2">
            <span className="text-xs font-bold text-amber-900 shrink-0 select-none">
              {lang === 'kh' ? 'ជ្រើសរើសគណនី៖' : 'Select User Account:'}
            </span>
            <select
              id="admin-user-selector"
              value={selectedUsername}
              onChange={(e) => {
                setSelectedUsername(e.target.value);
                setActiveSubTab('own-data'); // reset to own-data when switching users for convenience
              }}
              className="bg-white border text-sm border-amber-300/80 rounded-xl px-3.5 py-2 font-black text-[#073B3A] focus:outline-hidden focus:ring-2 focus:ring-[#073B3A]/30 w-full md:w-64 cursor-pointer shadow-sm hover:border-amber-400 transition"
            >
              {usersList.map((user) => (
                <option key={user.id} value={user.username}>
                  👤 {user.fullName} (@{user.username}) {user.role === 'admin' ? '⭐ Admin' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Top Welcome Card */}
      <div className="bg-[#073B3A] text-white rounded-3xl p-6 shadow-xl border border-emerald-900 relative overflow-hidden">
        {/* Glow lights */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-900 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>{activeUser.role === 'admin' ? (lang === 'kh' ? 'គណនីផ្ទាល់ខ្លួន Admin' : 'Super Admin Profile') : t.roleLabel}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-20s">
              {t.welcome}<span className="text-amber-400">{activeUser.fullName}</span>
            </h2>
            <p className="text-xs text-emerald-200 mt-1 font-semibold">
              @{activeUser.username} • {activeUser.role === 'admin' ? (lang === 'kh' ? 'អ្នកគ្រប់គ្រងជាន់ខ្ពស់' : 'System Administrator') : (lang === 'kh' ? 'បុគ្គលិកធម្មតា' : 'Standard Employee')} • Western International School
            </p>
          </div>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl border border-rose-500/40 cursor-pointer transition shadow-lg shadow-rose-950/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.logout}</span>
          </button>
        </div>
      </div>

      {/* Grid containing Dashboard Navigation & Active Sub-view Panels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar sub navigation */}
        <div className="md:col-span-1 space-y-2">
          {isAdmin && (
            <button
              onClick={() => setActiveSubTab('all-dashboards')}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left text-xs font-bold transition-all duration-200 shadow-xs border cursor-pointer ${
                activeSubTab === 'all-dashboards'
                  ? 'bg-amber-500 border-amber-600 text-slate-950 font-black'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-bold'
              }`}
            >
              📊 {lang === 'kh' ? 'ផ្ទាំងគ្រប់គ្រងបុគ្គលិកទាំងអស់' : 'All User Dashboards'}
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('own-data')}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left text-xs font-bold transition duration-200 shadow-sm border cursor-pointer ${
              activeSubTab === 'own-data'
                ? 'bg-emerald-600 border-emerald-500 text-white font-extrabold'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            {t.tabOwnData}
          </button>

          <button
            onClick={() => setActiveSubTab('requests')}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left text-xs font-bold transition duration-200 shadow-sm border cursor-pointer ${
              activeSubTab === 'requests'
                ? 'bg-emerald-600 border-emerald-500 text-white font-extrabold'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-bold'
            }`}
          >
            {t.tabRequests}
          </button>

          <button
            onClick={() => setActiveSubTab('profile')}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left text-xs font-bold transition duration-200 shadow-sm border cursor-pointer ${
              activeSubTab === 'profile'
                ? 'bg-emerald-600 border-emerald-500 text-white font-extrabold'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            {t.tabProfile}
          </button>
        </div>

        {/* Core Detail content */}
        <div className="md:col-span-3">
          <AnimatePresence mode="wait">
            {activeSubTab === 'all-dashboards' && isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Header widget */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-[#073B3A]">
                      {lang === 'kh' ? '📊 ផ្ទាំងគ្រប់គ្រង និងតាមដានរាល់គណនីបុគ្គលិក' : '📊 All Staff Roster Dashboards'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">
                      {lang === 'kh' ? 'មើលទិន្នន័យ បង្កើតសំណើ និងកែសម្រួលគណនីបុគ្គលិកទាំងអស់' : 'Monitor data inputs, file requests or override profiles for any user account.'}
                    </p>
                  </div>
                  <div className="inline-flex bg-emerald-50 text-emerald-800 text-[10px] font-black px-3 py-1.5 rounded-xl border border-emerald-100">
                    {lang === 'kh' ? 'សិទ្ធិពិសេសអ្នកគ្រប់គ្រង' : 'Admin Oversight Mode'}
                  </div>
                </div>

                {/* mini stats cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      {lang === 'kh' ? 'គណនីសរុប (Total Users)' : 'Total Accounts'}
                    </span>
                    <span className="text-xl font-black text-slate-800 block mt-1">
                      {usersList.length} 👤
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      {lang === 'kh' ? 'កំពុងស្នើសុំ (Pending Requests)' : 'Pending Requests'}
                    </span>
                    <span className="text-xl font-black text-amber-600 block mt-1 animate-pulse">
                      {userRequests.filter(r => r.status === 'Pending').length} ⏳
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs col-span-2 lg:col-span-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      {lang === 'kh' ? 'បុគ្គលិកគំរូ (Matched Profiles)' : 'Linked Staff Records'}
                    </span>
                    <span className="text-xl font-black text-emerald-700 block mt-1">
                      {usersList.filter(u => staffList.some(s => s.name.trim().toLowerCase() === u.fullName.trim().toLowerCase() || s.staffId.trim().toLowerCase() === u.username.trim().toLowerCase())).length} / {usersList.length} ✅
                    </span>
                  </div>
                </div>

                {/* Filters controller */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-3xs flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none">
                      🔍
                    </span>
                    <input
                      type="text"
                      id="ds-search-box"
                      placeholder={lang === 'kh' ? 'ស្វែងរកគណនីតាមឈ្មោះ ឬឈ្មោះគណនី...' : 'Search accounts by name or @username...'}
                      value={dsSearchTerm}
                      onChange={(e) => setDsSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-xs font-black text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#073B3A]/20 focus:border-emerald-600 transition"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap hidden md:inline">
                      {lang === 'kh' ? 'តួនាទី៖' : 'Filters:'}
                    </span>
                    <select
                      id="ds-role-filter"
                      value={dsRoleFilter}
                      onChange={(e: any) => setDsRoleFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-black text-slate-705 focus:outline-hidden"
                    >
                      <option value="all">{lang === 'kh' ? 'តួនាទីទាំងអស់' : 'All Roles'}</option>
                      <option value="admin">{lang === 'kh' ? 'អ្នកគ្រប់គ្រង (Admin)' : 'Admin Only'}</option>
                      <option value="user">{lang === 'kh' ? 'បុគ្គលិកធម្មតា (User)' : 'User Only'}</option>
                    </select>
                  </div>
                </div>

                {/* cards collection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {usersList.filter(u => {
                    const matchesSearch = u.fullName.toLowerCase().includes(dsSearchTerm.toLowerCase()) || 
                                          u.username.toLowerCase().includes(dsSearchTerm.toLowerCase());
                    const matchesRole = dsRoleFilter === 'all' ? true : u.role === dsRoleFilter;
                    return matchesSearch && matchesRole;
                  }).map(u => {
                    const staffMatch = staffList.find(s => 
                      s.name.trim().toLowerCase() === u.fullName.trim().toLowerCase() ||
                      s.staffId.trim().toLowerCase() === u.username.trim().toLowerCase()
                    );
                    const uReqs = userRequests.filter(r => r.username === u.username);
                    const pCount = uReqs.filter(r => r.status === 'Pending').length;
                    const aCount = uReqs.filter(r => r.status === 'Approved').length;
                    const rCount = uReqs.filter(r => r.status === 'Rejected').length;

                    return (
                      <div 
                        key={u.id}
                        className={`bg-white rounded-3xl p-5 border shadow-2xs flex flex-col justify-between gap-4 transition-all duration-200 hover:shadow-md ${
                          selectedUsername === u.username 
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Upper user description */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            {/* Photo / Avatar */}
                            <div className="w-12 h-15 rounded-lg border border-slate-250 bg-slate-50 shadow-inner flex items-center justify-center overflow-hidden shrink-0">
                              {staffMatch?.photo ? (
                                <img 
                                  src={staffMatch.photo} 
                                  alt={u.fullName} 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : u.avatar ? (
                                <img 
                                  src={u.avatar} 
                                  alt={u.fullName} 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-center font-bold text-slate-400 text-xs">
                                  {u.fullName.split(' ').pop()?.substring(0, 2) || 'WIS'}
                                </div>
                              )}
                            </div>

                            <div className="flex-grow min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-black text-slate-800 leading-tight truncate">
                                  {u.fullName}
                                </h4>
                                {u.role === 'admin' ? (
                                  <span className="bg-amber-100 text-amber-805 text-[8.5px] font-black px-1 rounded">Admin</span>
                                ) : (
                                  <span className="bg-slate-150 text-slate-700 text-[8.5px] font-black px-1 rounded">Staff</span>
                                )}
                              </div>
                              <span className="block text-[10.5px] font-bold text-slate-400 font-mono mt-0.5">@{u.username}</span>
                              
                              {/* status */}
                              <div className="mt-1">
                                {u.status === 'active' ? (
                                  <span className="inline-flex items-center gap-1 text-[8.5px] font-semibold text-emerald-805 bg-emerald-50 border border-emerald-150 px-1 py-0.5 rounded leading-none">
                                    ● Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[8.5px] font-semibold text-rose-805 bg-rose-50 border border-rose-150 px-1 py-0.5 rounded leading-none">
                                    ■ Inactive
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Matching details */}
                          <div className="bg-slate-50/70 border border-slate-200/60 p-3 rounded-2xl text-[11px] font-semibold text-slate-600 space-y-1">
                            {staffMatch ? (
                              <>
                                <div>
                                  <span className="text-slate-400 font-bold">{lang === 'kh' ? 'ដេប៉ាតឺម៉ង់៖' : 'Dept:'}</span>{' '}
                                  <span className="font-extrabold text-[#073B3A]">{staffMatch.department}</span>
                                </div>
                                <div className="flex justify-between">
                                  <div>
                                    <span className="text-slate-400 font-bold">{lang === 'kh' ? 'ទីតាំង៖' : 'Location:'}</span>{' '}
                                    <span className="font-bold text-slate-750">{staffMatch.responsibleLocation || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 font-bold">Walkie:</span>{' '}
                                    <span className="font-mono text-slate-750">{staffMatch.icom || 'N/A'}</span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="text-amber-700 font-bold flex items-center gap-1 text-[10.5px]">
                                ⚠️ {lang === 'kh' ? 'មិនទាន់ភ្ជាប់ជាមួយឯកសារបុគ្គលិកឡើយ' : 'No matched staff detail profile'}
                              </div>
                            )}
                          </div>

                          {/* System Menu Permissions */}
                          <div className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/60 p-3 rounded-2xl transition duration-250 select-none">
                            <button
                              type="button"
                              onClick={() => setExpandedMenus(prev => ({ ...prev, [u.username]: !prev[u.username] }))}
                              className="w-full flex items-center justify-between text-left cursor-pointer group"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">🔑</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider group-hover:text-[#073B3A] transition">
                                  {lang === 'kh' ? 'បញ្ជីគ្រប់គ្រងសាលា (System Menu)' : 'School Management List'}
                                </span>
                              </div>
                              <span className="text-xs transition duration-250">
                                {expandedMenus[u.username] ? '🔼' : '🔽'}
                              </span>
                            </button>

                            {expandedMenus[u.username] && (
                              <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-3">
                                {u.role === 'admin' ? (
                                  <div className="text-[11px] font-black text-amber-850 flex items-center gap-1.5 bg-amber-50 border border-amber-100 p-2 rounded-xl">
                                    👑 {lang === 'kh' ? 'សិទ្ធិពិសេសអ្នកគ្រប់គ្រង (Admin Full Access)' : 'Admin: Full Unrestricted Access'}
                                  </div>
                                ) : (
                                  <div className="text-[10px] font-black text-[#073B3A] bg-emerald-50 border border-emerald-150 p-2 rounded-xl mb-1.5 flex items-center justify-between gap-1">
                                    <span>📋 {lang === 'kh' ? 'ម៉ឺនុយប្រព័ន្ធដែលអាចចូលមើលបាន (ចុចដើម្បីបើក/បិទ)៖' : 'Assigned Menu (Click block to toggle):'}</span>
                                    <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded animate-pulse">EDITABLE</span>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-1.5 animate-fadeIn">
                                  {[
                                    { key: 'dashboard', labelKh: 'ផ្ទាំងព័ត៌មាន', labelEn: 'Dashboard Stats', icon: '📊' },
                                    { key: 'attendance', labelKh: 'ស្រង់វត្តមានបុគ្គលិក', labelEn: 'Attendance', icon: '🕒' },
                                    { key: 'staff', labelKh: 'គ្រប់គ្រងបុគ្គលិក', labelEn: 'Staff Info', icon: '👥' },
                                    { key: 'students', labelKh: 'គ្រប់គ្រងសិស្ស', labelEn: 'Student Info', icon: '🎓' },
                                    { key: 'studentstatistics', labelKh: 'ប្រព័ន្ធស្ថិតិសិស្ស', labelEn: 'Student Stats', icon: '📈' },
                                    { key: 'electricity', labelKh: 'តាមដានអគ្គិសនី', labelEn: 'Electricity', icon: '⚡' },
                                    { key: 'water', labelKh: 'តាមដានទឹក', labelEn: 'Water Usage', icon: '💧' },
                                    { key: 'fixedassets', labelKh: 'ទ្រព្យសម្បត្តិថេរ', labelEn: 'Fixed Assets', icon: '📦' },
                                    { key: 'insurance', labelKh: 'ធានារ៉ាប់រងសិស្ស', labelEn: 'Insurance', icon: '🛡️' },
                                    { key: 'cctv', labelKh: 'តាមដាន CCTV', labelEn: 'CCTV System', icon: '🎥' },
                                    { key: 'classroomequipment', labelKh: 'សម្ភារៈថ្នាក់រៀន', labelEn: 'Classroom Eq', icon: '🏫' },
                                    { key: 'dailyreport', labelKh: 'របាយការណ៍ប្រចាំថ្ងៃ', labelEn: 'Daily Report', icon: '📝' },
                                    { key: 'admindocs', labelKh: 'ឯកសាររដ្ឋបាល', labelEn: 'Admin Docs', icon: '📂' },
                                    { key: 'otherlinks', labelKh: 'តំណភ្ជាប់ផ្សេងៗ', labelEn: 'Other Links', icon: '🔗' },
                                    { key: 'schoolinfo', labelKh: 'ព័ត៌មានសាលា', labelEn: 'School Info', icon: '🏛️' },
                                    { key: 'telegram', labelKh: 'Telegram Alert', labelEn: 'Telegram Alert', icon: '🤖' },
                                    { key: 'usermanager', labelKh: 'គ្រប់គ្រងអ្នកប្រើប្រាស់', labelEn: 'User Manager', icon: '⚙️' }
                                  ].map((perm) => {
                                    const hasAccess = u.role === 'admin' || (u.permissions && u.permissions.includes(perm.key));
                                    
                                    const handleTogglePermission = () => {
                                      if (u.role === 'admin') return;
                                      
                                      let newPermissions = [...(u.permissions || [])];
                                      if (newPermissions.includes(perm.key)) {
                                        newPermissions = newPermissions.filter(k => k !== perm.key);
                                      } else {
                                        newPermissions.push(perm.key);
                                      }

                                      // Create updated users list
                                      const updatedUsers = usersList.map(item => {
                                        if (item.id === u.id) {
                                          const updated = { ...item, permissions: newPermissions };
                                          // Update session user permissions too if modifying current logged user
                                          if (item.username === currentUser.username) {
                                            const updatedCurr = { ...currentUser, permissions: newPermissions };
                                            sessionStorage.setItem('wis_current_user', JSON.stringify(updatedCurr));
                                            localStorage.setItem('wis_current_user', JSON.stringify(updatedCurr));
                                          }
                                          return updated;
                                        }
                                        return item;
                                      });

                                      setUsersList(updatedUsers);
                                      localStorage.setItem('wis_users_list', JSON.stringify(updatedUsers));
                                    };

                                    return (
                                      <button 
                                        key={perm.key} 
                                        type="button"
                                        onClick={handleTogglePermission}
                                        disabled={u.role === 'admin'}
                                        className={`flex items-center justify-between p-2 rounded-xl border text-[10.5px] font-black transition text-left ${
                                          u.role !== 'admin'
                                            ? 'cursor-pointer hover:border-emerald-500 hover:shadow-2xs active:scale-95'
                                            : ''
                                        } ${
                                          hasAccess 
                                            ? 'bg-emerald-50/70 border-emerald-200/80 text-[#073B3A]' 
                                            : 'bg-slate-100/50 border-slate-200/40 text-slate-400 opacity-60'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 truncate">
                                          <span>{perm.icon}</span>
                                          <span className="truncate">{lang === 'kh' ? perm.labelKh : perm.labelEn}</span>
                                        </div>
                                        <span className="shrink-0 text-[10px]">
                                          {hasAccess ? '✅' : '❌'}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Request counts tracker */}
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{lang === 'kh' ? 'រង្វាស់សំណើ៖' : 'Requests:'}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="bg-amber-50 text-amber-805 border border-amber-250 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1" title="Pending">
                                ⏳ {pCount}
                              </span>
                              <span className="bg-emerald-50 text-emerald-805 border border-emerald-250 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1" title="Approved">
                                ✓ {aCount}
                              </span>
                              <span className="bg-rose-50 text-rose-850 border border-rose-250 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1" title="Rejected">
                                ✗ {rCount}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive direct switchers */}
                        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUsername(u.username);
                              setActiveSubTab('own-data');
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            className="bg-[#073B3A]/5 hover:bg-[#073B3A]/10 text-[#073B3A] font-extrabold text-[10px] py-2 px-1 rounded-xl text-center cursor-pointer transition"
                          >
                            🔍 {lang === 'kh' ? 'មើលទិន្នន័យ' : 'View Data'}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUsername(u.username);
                              setActiveSubTab('requests');
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] py-2 px-1 rounded-xl text-center cursor-pointer transition shadow-xs"
                          >
                            📝 {lang === 'kh' ? 'បញ្ចូលសំណើ' : 'Add Request'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUsername(u.username);
                              setActiveSubTab('profile');
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold text-[10px] py-2 px-1 rounded-xl text-center cursor-pointer transition"
                          >
                            ⚙️ {lang === 'kh' ? 'កែប្រែប្រវត្តិរូប' : 'Edit Profile'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeSubTab === 'own-data' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <Clipboard className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">{t.ownDataTitle}</h3>
                </div>

                {matchedStaff ? (
                  <div className="space-y-6">
                    {/* Visual Card */}
                    <div className="flex flex-col sm:flex-row gap-6 p-4 bg-slate-50/75 rounded-2xl border border-slate-200/60">
                      {/* Photo aspect block */}
                      <div className="w-28 h-36 bg-slate-100 border border-slate-300 shadow-sm relative overflow-hidden rounded-xl flex items-center justify-center shrink-0">
                        {matchedStaff.photo ? (
                          <img 
                            src={matchedStaff.photo} 
                            alt={matchedStaff.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="text-center p-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">ID Photo</span>
                            <div className="mt-2 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-605">
                              {matchedStaff.name.split(' ').pop()?.substring(0, 2) || 'WIS'}
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-emerald-600 text-[7px] font-bold text-white px-1 rounded uppercase tracking-wide">
                          Verified
                        </div>
                      </div>

                      {/* Main labels */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="text-lg font-black text-slate-800 leading-tight">{matchedStaff.name}</h4>
                          <span className="inline-block mt-1 font-mono text-[10.5px] font-black text-emerald-805 bg-emerald-50 border border-emerald-150 rounded px-2">
                            {matchedStaff.staffId}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-600">
                          <div>
                            <span className="text-slate-400 font-bold">{t.department}</span>{' '}
                            <span className="font-extrabold text-slate-800">{matchedStaff.department}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold">{t.contact}</span>{' '}
                            <span className="font-mono text-slate-800 font-bold">{matchedStaff.phoneNumber}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold">{t.dob}</span>{' '}
                            <span className="font-mono text-slate-800">{matchedStaff.dob || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold">{t.joinDate}</span>{' '}
                            <span className="font-mono text-slate-800">{matchedStaff.joinDate || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Duty logs & logistical assets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex items-center gap-3">
                        <MapPin className="w-8 h-8 text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-[10px] text-slate-400 font-extrabold uppercase">{t.duty}</div>
                          <div className="text-xs font-black text-slate-800">{matchedStaff.responsibleLocation || 'Not Assigned / មិនទាន់កំណត់'}</div>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex items-center gap-3">
                        <Radio className="w-8 h-8 text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-[10px] text-slate-400 font-extrabold uppercase">{t.icom}</div>
                          <div className="text-xs font-black text-slate-800">{matchedStaff.icom || 'No Active Radio / មិនមានកំណត់'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Attachments section */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">{t.attachments}</h4>
                      {matchedStaff.attachments && matchedStaff.attachments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {matchedStaff.attachments.map((file) => (
                            <a 
                              key={file.id} 
                              href={file.dataUrl} 
                              download={file.name}
                              className="bg-white hover:bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-3 transition"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-emerald-650 shrink-0" />
                                <div className="truncate">
                                  <div className="text-xs font-bold text-slate-800 truncate">{file.name}</div>
                                  <div className="text-[10px] text-slate-400 font-bold">{file.size}</div>
                                </div>
                              </div>
                              <FileDown className="w-4 h-4 text-slate-400 hover:text-emerald-700 shrink-0" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl font-bold text-slate-400 text-xs">
                          {t.noAttachments}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 border border-amber-100 bg-amber-50/50 rounded-2xl space-y-4">
                    <div className="flex gap-3">
                      <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-extrabold text-amber-900 uppercase">គណនីមិនទាន់មានទិន្នន័យ / No matched staff file</h4>
                        <p className="text-xs text-amber-800 leading-relaxed mt-1">
                          {t.ownDataEmpty} <span className="font-extrabold font-mono underline text-slate-900">"{activeUser.fullName}"</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeSubTab === 'requests' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">{t.tabRequests}</h3>
                  </div>
                </div>

                {requestSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-805 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                    <span>{t.successRequest}</span>
                  </div>
                )}

                {/* Submission Form */}
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-xs font-black text-slate-500">{t.requestTitleLabel}</label>
                      <input
                        type="text"
                        required
                        value={requestTitle}
                        onChange={(e) => setRequestTitle(e.target.value)}
                        placeholder="e.g. ស្នើសុំច្បាប់សម្រាកព្យាបាល (Sick Leave Request)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-black text-slate-500">{t.requestTypeLabel}</label>
                      <select
                        value={requestType}
                        onChange={(e: any) => setRequestType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-700 focus:outline-hidden"
                      >
                        <option value="Leave">Leave (ច្បាប់សម្រាក)</option>
                        <option value="Equipment">Equipment (ស្នើសម្ភារៈ)</option>
                        <option value="Maintenance">Maintenance (ជួសជុល)</option>
                        <option value="Other">Other (ផេ្សងៗ)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-black text-slate-500">{t.requestDescLabel}</label>
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="ពន្យល់លម្អិតអំពីសំណើរបស់អ្នកផ្ញើជូនរដ្ឋបាល..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 transition whitespace-pre-wrap"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.submitRequest}</span>
                  </button>
                </form>

                {/* Request list */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.reqHistory}</h4>

                  <div className="space-y-2.5">
                    {myRequests.length > 0 ? (
                      myRequests.map((req) => (
                        <div key={req.id} className="border border-slate-150 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1.5 flex-grow">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-slate-800">{req.requestTitle}</span>
                              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                {req.requestType}
                              </span>
                            </div>
                            <p className="text-slate-500 leading-relaxed font-medium">{req.description}</p>
                            {req.remarks && (
                              <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl mt-1.5 text-[11px] font-semibold text-slate-700 italic">
                                <span className="font-extrabold text-slate-800 not-italic block mb-0.5">{t.adminRemarks}</span>
                                "{req.remarks}"
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center">
                            <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2.5 py-1 rounded-lg border ${
                              req.status === 'Pending'
                                ? 'bg-amber-50 border-amber-200 text-amber-805'
                                : req.status === 'Approved'
                                  ? 'bg-emerald-50 border-emerald-255 text-emerald-805'
                                  : 'bg-rose-50 border-rose-255 text-rose-805'
                            }`}>
                              {req.status === 'Pending' ? t.statusPending : req.status === 'Approved' ? t.statusApproved : t.statusRejected}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl font-bold text-slate-400 text-xs">
                        {t.noHistRequests}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <Key className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">{t.tabProfile}</h3>
                </div>

                {profileSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-805 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                    <span>{t.successProfile}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {/* Photo Upload & Camera Capture Section */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/65 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group shrink-0">
                      {avatar ? (
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500/20 shadow-md bg-white">
                          <img 
                            src={avatar} 
                            alt="Profile Avatar" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-slate-200 border-2 border-dashed border-slate-350 flex items-center justify-center text-slate-400">
                          <User className="w-12 h-12" />
                        </div>
                      )}
                      
                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar('')}
                          className="absolute -bottom-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white p-1.5 rounded-full shadow-md transition cursor-pointer flex items-center justify-center"
                          title="Remove Avatar"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 space-y-3 w-full text-center sm:text-left">
                      <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider">
                        {lang === 'kh' ? 'រូបថតប្រវត្តិរូប (Profile Photo)' : 'Profile Image'}
                      </h4>
                      <p className="text-[11px] text-slate-450 leading-relaxed font-semibold">
                        {lang === 'kh' ? 'ជ្រើសរើសឯកសាររូបភាព ឬផ្ដិតយករូបថ្មីតាមរយៈកាមេរ៉ារបស់ឧបករណ៍អ្នក។' : 'Select an image file from your device or snap a new one instantly using your camera.'}
                      </p>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        {/* File Upload Button */}
                        <label className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-[11px] px-3.5 py-2.5 rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5 animate-none">
                          <Upload className="w-4 h-4 text-emerald-600" />
                          <span>{lang === 'kh' ? 'ផ្ទុកឡើងរូបភាព' : 'Upload Image'}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                            className="hidden" 
                          />
                        </label>

                        {/* Camera Trigger */}
                        <button
                          type="button"
                          onClick={isCameraActive ? stopCamera : startCamera}
                          className={`font-extrabold text-[11px] px-3.5 py-2.5 rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5 ${
                            isCameraActive 
                              ? 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
                              : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
                          }`}
                        >
                          <Camera className={`w-4 h-4 ${isCameraActive ? 'text-rose-500 animate-bounce' : 'text-amber-500'}`} />
                          <span>{isCameraActive ? (lang === 'kh' ? 'បិទកាមេរ៉ា' : 'Stop Camera') : (lang === 'kh' ? 'ថតរូបតាមកាមេរ៉ា' : 'Use Camera')}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Camera Live Feed Area */}
                  {isCameraActive && (
                    <div className="bg-slate-950 p-4 rounded-2xl flex flex-col items-center gap-4 border border-slate-800 animate-fadeIn text-white">
                      <div className="relative w-full max-w-[240px] aspect-square rounded-xl overflow-hidden bg-black/40 border-2 border-emerald-500/30 shadow-inner">
                        <video 
                          ref={videoRef}
                          autoPlay 
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full animate-pulse border border-rose-450 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                          <span>LIVE</span>
                        </div>
                      </div>

                      {cameraError && (
                        <div className="text-rose-450 text-[10.5px] font-bold text-center px-4">
                          ⚠️ {cameraError}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Camera className="w-4 h-4" />
                          <span>{lang === 'kh' ? 'ផ្ដិតយករូបភាព' : 'Snap Photo'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                        >
                          {lang === 'kh' ? 'បដិសេធ' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-xs font-black text-slate-500">{t.accName}</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-805 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-black text-slate-500">{t.accPass}</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-805 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition cursor-pointer"
                  >
                    <CheckCircle className="w-4.5 h-4.5" />
                    <span>{t.saveChanges}</span>
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
