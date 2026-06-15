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
  const [activeSubTab, setActiveSubTab] = useState<'own-data' | 'requests' | 'profile'>('own-data');

  // Request form state
  const [requestTitle, setRequestTitle] = useState('');
  const [requestType, setRequestType] = useState<'Leave' | 'Equipment' | 'Maintenance' | 'Other'>('Leave');
  const [description, setDescription] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Profile update state
  const [profileName, setProfileName] = useState(currentUser.fullName);
  const [newPassword, setNewPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Camera & avatar state
  const [avatar, setAvatar] = useState<string>(() => {
    return currentUser.avatar || localStorage.getItem('wis_profile_avatar') || '';
  });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

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
    s.name.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase() ||
    s.staffId.trim().toLowerCase() === currentUser.username.trim().toLowerCase()
  );

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTitle.trim() || !description.trim()) return;

    const newReq: UserRequest = {
      id: 'req_' + Date.now(),
      username: currentUser.username,
      fullName: currentUser.fullName,
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
      if (u.id === currentUser.id) {
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

    // Update header profile variables nicely
    localStorage.setItem('wis_profile_name', profileName.trim());
    if (avatar) {
      localStorage.setItem('wis_profile_avatar', avatar);
    } else {
      localStorage.removeItem('wis_profile_avatar');
    }

    if (newPassword) {
      // Re-save session credentials
      const updatedCurr = { ...currentUser, fullName: profileName.trim(), password: newPassword, avatar: avatar };
      localStorage.setItem('wis_current_user', JSON.stringify(updatedCurr));
    } else {
      const updatedCurr = { ...currentUser, fullName: profileName.trim(), avatar: avatar };
      localStorage.setItem('wis_current_user', JSON.stringify(updatedCurr));
    }

    setNewPassword('');
    setProfileSuccess(true);
    setTimeout(() => {
      setProfileSuccess(false);
      // Fast refresh simple layout trick
      window.location.reload();
    }, 1500);
  };

  // Filter requests that only belong to this user
  const myRequests = userRequests.filter(r => r.username === currentUser.username);

  return (
    <div className="space-y-6">
      {/* Top Welcome Card */}
      <div className="bg-[#073B3A] text-white rounded-3xl p-6 shadow-xl border border-emerald-900 relative overflow-hidden">
        {/* Glow lights */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-900 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>{t.roleLabel}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-20s">
              {t.welcome}<span className="text-amber-400">{currentUser.fullName}</span>
            </h2>
            <p className="text-xs text-emerald-200 mt-1 font-semibold">
              @{currentUser.username} • Milton School Admin Services Portal
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
                          {t.ownDataEmpty} <span className="font-extrabold font-mono underline text-slate-900">"{currentUser.fullName}"</span>
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
