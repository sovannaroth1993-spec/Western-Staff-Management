import React, { useState, useEffect } from 'react';
import { UserAccount, UserRequest } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserPlus, Shield, UserCheck, UserX, Trash2, Edit2, Check, X, Search, Lock, FileText, BadgeAlert, Sparkles, MessageSquare, Plus, Clock, ThumbsUp, ThumbsDown, RefreshCw
} from 'lucide-react';

export interface PasswordResetLog {
  id: string;
  userId?: string;
  username: string;
  fullName: string;
  actionType: 'User_Requested' | 'Admin_Reset' | 'Request_Approved' | 'Request_Rejected';
  requestedAt: string;
  performedBy: string;
  status: 'Pending' | 'Completed' | 'Rejected';
  details: string;
}

interface UserManagerProps {
  usersList: UserAccount[];
  setUsersList: (users: UserAccount[]) => void;
  userRequests: UserRequest[];
  setUserRequests: (reqs: UserRequest[]) => void;
  currentUser: UserAccount | null;
  lang: 'kh' | 'en';
}

export default function UserManager({
  usersList,
  setUsersList,
  userRequests,
  setUserRequests,
  currentUser,
  lang
}: UserManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Form states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [formError, setFormError] = useState('');

  // Request response states
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [forcePasswordChange, setForcePasswordChange] = useState(false);

  // Translations
  const t = {
    kh: {
      title: "គ្រប់គ្រងអ្នកប្រើប្រាស់ និងគណនី",
      subtitle: "បន្ថែម កែប្រែ លុប និងចាត់ចែងសិទ្ធិបុគ្គលិកប្រើប្រាស់ប្រព័ន្ធ",
      tabUsers: "គណនីអ្នកប្រើប្រាស់",
      tabRequests: "សំណើសុំការអនុញ្ញាត",
      searchPlaceholder: "ស្វែងរកតាមឈ្មោះ ឬឈ្មោះគណនី...",
      allRoles: "តួនាទីទាំងអស់",
      adminRole: "អ្នកគ្រប់គ្រង (Admin)",
      userRole: "អ្នកប្រើប្រាស់ (User)",
      allStatuses: "ស្ថានភាពទាំងអស់",
      statusActive: "សកម្ម (Active)",
      statusInactive: "មិនសកម្ម (Inactive)",
      addUser: "បង្កើតគណនីថ្មី",
      username: "ឈ្មោះគណនី (Username)",
      fullName: "ឈ្មោះពេញ (Full Name)",
      password: "លេខកូដសម្ងាត់ (Password)",
      role: "តួនាទី (Role)",
      status: "ស្ថានភាព (Status)",
      createdAt: "កាលបរិច្ឆេទបង្កើត",
      actions: "សកម្មភាព",
      edit: "កែប្រែ",
      delete: "លុប",
      cancel: "បោះបង់",
      save: "រក្សាទុក",
      errExists: "ឈ្មោះគណនីនេះមានរួចហើយនៅក្នុងប្រព័ន្ធ!",
      errEmpty: "សូមបំពេញព័ត៌មានដែលចាំបាច់ទាំងអស់!",
      confirmDelete: "តើអ្នកប្រាកដជាចង់លុបគណនីនេះមែនទេ?",
      noUsers: "មិនមានគណនីអ្នកប្រើប្រាស់ទេ",
      requestTitle: "ចំណងជើងសំណើ",
      requestType: "ប្រភេទសំណើ",
      requester: "អ្នកស្នើសុំ",
      description: "ការពិពណ៌នា",
      statusPending: "កំពុងរង់ចាំ",
      statusApproved: "បានអនុម័ត",
      statusRejected: "បានបដិសេធ",
      respond: "ឆ្លើយតបសំណើ",
      remarks: "កំណត់សម្គាល់របស់ Admin (Remarks)",
      approve: "អនុម័តសំណើ",
      reject: "បដិសេធសំណើ",
      noRequests: "មិនមានសំណើពីអ្នកប្រើប្រាស់ទេ",
      resetPassword: "កំណត់លេខសម្ងាត់ឡើងវិញ",
      confirmResetPassword: "តើអ្នកប្រាកដជាចង់កំណត់លេខសម្ងាត់របស់គណនី @{username} ទៅជាតម្លៃដើម '123456' ឡើងវិញមែនទេ?",
      resetSuccess: "បានកំណត់លេខសម្ងាត់របស់ @{username} ទៅជា '123456' ដោយជោគជ័យ!",
      resetToDefaultBtn: "ប្តូរទៅលំនាំដើម (123456)",
      forcePasswordChangeLabel: "តម្រូវឱ្យផ្លាស់ប្តូរលេខសម្ងាត់ពេលចូលលើកដំបូង (Force change on next login)",
      tabResetLogs: "ប្រវត្តិប្តូរលេខសម្ងាត់",
      noResetLogs: "មិនមានប្រវត្តិនៃការប្តូរលេខសម្ងាត់ក្នុងប្រព័ន្ធទេ",
      resetLogTime: "ពេលវេលា",
      resetLogUser: "ឈ្មោះគណនី / ឈ្មោះពេញ",
      resetLogType: "ប្រភេទសកម្មភាព",
      resetLogStatus: "ស្ថានភាពសន្តិសុខ",
      resetLogAdmin: "អនុវត្តដោយ",
      resetLogDetails: "ព័ត៌មានលម្អិត & គោលនយោបាយ",
      actionApproved: "បានអនុម័តសំណើ",
      actionRejected: "បានបដិសេធសំណើ",
      actionRequested: "សំណើសុំកំណត់ឡើងវិញ",
      actionDirectReset: "កំណត់ឡើងវិញដោយ Admin",
      btnApprove: "អនុម័ត",
      btnReject: "បដិសេធ",
      btnClearLogs: "សម្អាតប្រវត្តិទាំងអស់",
      confirmClearLogs: "តើអ្នកប្រាកដជាចង់សម្អាតប្រវត្តិ និងកំណត់ត្រាទាំងអស់នេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានឡើយ!"
    },
    en: {
      title: "User Accounts & Permissions",
      subtitle: "Add, edit, delete and manage staff permissions for system access",
      tabUsers: "User Accounts",
      tabRequests: "User Request Inboxes",
      searchPlaceholder: "Search by name or username...",
      allRoles: "All Roles",
      adminRole: "Administrator (Admin)",
      userRole: "Standard User (User)",
      allStatuses: "All Statuses",
      statusActive: "Active Status",
      statusInactive: "Inactive Status",
      addUser: "Create New Account",
      username: "Username",
      fullName: "Full Name",
      password: "Password",
      role: "Role",
      status: "Status",
      createdAt: "Created Date",
      actions: "Actions",
      edit: "Edit Profile",
      delete: "Delete",
      cancel: "Cancel",
      save: "Save Changes",
      errExists: "Username already exists in system!",
      errEmpty: "Please fill out all required fields!",
      confirmDelete: "Are you sure you want to delete this user profile?",
      noUsers: "No user accounts found",
      requestTitle: "Request Title",
      requestType: "Request Type",
      requester: "Requester",
      description: "Description",
      statusPending: "Pending Verification",
      statusApproved: "Approved",
      statusRejected: "Rejected",
      respond: "Respond to Request",
      remarks: "Admin Feedback Remarks",
      approve: "Approve Request",
      reject: "Reject Request",
      noRequests: "No user requests found",
      resetPassword: "Reset Password",
      confirmResetPassword: "Are you sure you want to reset the password for @{username} to the default value '123456'?",
      resetSuccess: "Successfully reset password for @{username} to '123456'!",
      resetToDefaultBtn: "Reset to Default (123456)",
      forcePasswordChangeLabel: "Force password change on next login",
      tabResetLogs: "Password Reset Logs",
      noResetLogs: "No password reset logs or requests found in the system",
      resetLogTime: "Timestamp",
      resetLogUser: "Username / Target User",
      resetLogType: "Action Type",
      resetLogStatus: "Security Status",
      resetLogAdmin: "Performed By",
      resetLogDetails: "Log Details & Security Policy",
      actionApproved: "Approved Request",
      actionRejected: "Rejected Request",
      actionRequested: "User Reset Request",
      actionDirectReset: "Direct Admin Reset",
      btnApprove: "Approve",
      btnReject: "Reject",
      btnClearLogs: "Clear All Logs",
      confirmClearLogs: "Are you sure you want to clear all security logs and history? This action is irreversible!"
    }
  }[lang];

  // Load and save logic is handled at parent App state, which receives usersList trigger from callback
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!username.trim() || !fullName.trim() || !password.trim()) {
      setFormError(t.errEmpty);
      return;
    }

    const exists = usersList.some(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (exists) {
      setFormError(t.errExists);
      return;
    }

    const newUser: UserAccount = {
      id: 'usr_' + Date.now(),
      username: username.trim().toLowerCase(),
      password: password,
      fullName: fullName.trim(),
      role,
      status,
      createdAt: new Date().toISOString(),
      forcePasswordChange: forcePasswordChange
    };

    setUsersList([...usersList, newUser]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setUsername('');
    setFullName('');
    setPassword('');
    setRole('user');
    setStatus('active');
    setFormError('');
    setForcePasswordChange(false);
  };

  const openEdit = (user: UserAccount) => {
    setSelectedUser(user);
    setUsername(user.username);
    setFullName(user.fullName);
    setPassword(user.password || '');
    setRole(user.role);
    setStatus(user.status);
    setForcePasswordChange(user.forcePasswordChange || false);
    setIsEditModalOpen(true);
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim()) {
      setFormError(t.errEmpty);
      return;
    }

    if (!selectedUser) return;

    const updated = usersList.map(u => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          fullName: fullName.trim(),
          password: password || u.password,
          role,
          status,
          forcePasswordChange: forcePasswordChange
        };
      }
      return u;
    });

    setUsersList(updated);
    setIsEditModalOpen(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleDeleteUser = (userId: string, targetUsername: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert(lang === 'kh' ? "មានតែគណនីរដ្ឋបាល (Admin) ទេដែលទើបអាចលុបបាន!" : "Only Admin accounts can delete users!");
      return;
    }

    if (currentUser.username === targetUsername) {
      alert(lang === 'kh' ? "អ្នកមិនអាចលុបគណនីដែលកំពុងប្រើប្រាស់បានទេ!" : "You cannot delete the currently logged-in account!");
      return;
    }

    if (confirm(t.confirmDelete)) {
      setUsersList(usersList.filter(u => u.id !== userId));
    }
  };

  const handleResetPassword = (userId: string, targetUsername: string) => {
    const confirmMessage = t.confirmResetPassword.replace('{username}', targetUsername);
    if (confirm(confirmMessage)) {
      const updated = usersList.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            password: '123456',
            forcePasswordChange: true
          };
        }
        return u;
      });
      setUsersList(updated);

      // Create Admin Direct Reset Log
      const targetUser = usersList.find(u => u.id === userId);
      const adminName = currentUser ? `${currentUser.fullName} (@${currentUser.username})` : 'Administrator';
      
      const newLog: PasswordResetLog = {
        id: 'pr_' + Date.now(),
        userId: userId,
        username: targetUsername,
        fullName: targetUser?.fullName || targetUsername,
        actionType: 'Admin_Reset',
        requestedAt: new Date().toISOString(),
        performedBy: adminName,
        status: 'Completed',
        details: lang === 'kh' 
          ? `កំណត់លេខសម្ងាត់ឡើងវិញទៅលំនាំដើម '123456' ដោយផ្ទាល់ដោយ Admin៖ ${adminName}។`
          : `Direct administrator reset to default '123456' by ${adminName}.`
      };

      const updatedLogs = [newLog, ...resetLogs];
      saveLogs(updatedLogs);

      alert(t.resetSuccess.replace('{username}', targetUsername));
    }
  };

  const handleRespondRequest = (status: 'Approved' | 'Rejected') => {
    if (!selectedRequest) return;

    const updated = userRequests.map(r => {
      if (r.id === selectedRequest.id) {
        return {
          ...r,
          status,
          remarks: adminRemarks.trim() || undefined
        };
      }
      return r;
    });

    setUserRequests(updated);
    setSelectedRequest(null);
    setAdminRemarks('');
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ? true : u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'requests' | 'resetLogs'>('users');
  const [resetLogs, setResetLogs] = useState<PasswordResetLog[]>([]);

  useEffect(() => {
    try {
      const savedLogs = localStorage.getItem('wis_password_reset_logs');
      if (savedLogs) {
        setResetLogs(JSON.parse(savedLogs));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveLogs = (updatedLogs: PasswordResetLog[]) => {
    setResetLogs(updatedLogs);
    try {
      localStorage.setItem('wis_password_reset_logs', JSON.stringify(updatedLogs));
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveResetRequest = (logId: string) => {
    const log = resetLogs.find(l => l.id === logId);
    if (!log) return;

    const targetUser = usersList.find(u => u.username.toLowerCase() === log.username.toLowerCase());
    if (!targetUser) {
      alert(lang === 'kh' ? "មិនអាចអនុម័តបានទេ ព្រោះគណនីនេះលែងមានក្នុងប្រព័ន្ធទៀតហើយ!" : "Cannot approve! This user account no longer exists in the system.");
      
      const updatedLogs = resetLogs.map(l => {
        if (l.id === logId) {
          return {
            ...l,
            status: 'Rejected' as const,
            details: lang === 'kh' ? "គណនីនេះត្រូវបានលុបចេញពីប្រព័ន្ធ។" : "User account has been deleted from system."
          };
        }
        return l;
      });
      saveLogs(updatedLogs);
      return;
    }

    const adminName = currentUser ? `${currentUser.fullName} (@${currentUser.username})` : 'Administrator';

    const updatedUsers = usersList.map(u => {
      if (u.id === targetUser.id) {
        return {
          ...u,
          password: '123456',
          forcePasswordChange: true
        };
      }
      return u;
    });
    setUsersList(updatedUsers);

    const updatedLogs = resetLogs.map(l => {
      if (l.id === logId) {
        return {
          ...l,
          actionType: 'Request_Approved' as const,
          status: 'Completed' as const,
          performedBy: adminName,
          details: lang === 'kh' 
            ? `បានអនុម័តសំណើរបស់ @${targetUser.username} ដោយ Admin៖ ${adminName}។ លេខសម្ងាត់កំណត់ទៅ '123456'។`
            : `Approved request of @${targetUser.username} by Admin: ${adminName}. Password set to default '123456'.`
        };
      }
      return l;
    });
    saveLogs(updatedLogs);

    alert(lang === 'kh' 
      ? `បានអនុម័តសំណើរបស់ @${targetUser.username} និងកំណត់លេខសម្ងាត់ទៅលំនាំដើម '123456' ដោយជោគជ័យ!` 
      : `Approved reset request for @${targetUser.username} and successfully reset password to '123456'!`);
  };

  const handleRejectResetRequest = (logId: string) => {
    const log = resetLogs.find(l => l.id === logId);
    if (!log) return;

    if (confirm(lang === 'kh' ? "តើអ្នកប្រាកដជាចង់បដិសេធសំណើនេះមែនទេ?" : "Are you sure you want to reject this request?")) {
      const adminName = currentUser ? `${currentUser.fullName} (@${currentUser.username})` : 'Administrator';

      const updatedLogs = resetLogs.map(l => {
        if (l.id === logId) {
          return {
            ...l,
            actionType: 'Request_Rejected' as const,
            status: 'Rejected' as const,
            performedBy: adminName,
            details: lang === 'kh' 
              ? `បានបដិសេធដោយ Admin៖ ${adminName}។`
              : `Rejected by Admin: ${adminName}.`
          };
        }
        return l;
      });
      saveLogs(updatedLogs);

      alert(lang === 'kh' ? "បានបដិសេធសំណើដោយជោគជ័យ!" : "Successfully rejected reset request!");
    }
  };

  const handleClearAllLogs = () => {
    if (confirm(t.confirmClearLogs)) {
      saveLogs([]);
      alert(lang === 'kh' ? "សម្អាតប្រវត្តិនៃការប្តូរលេខសម្ងាត់ដោយជោគជ័យ!" : "Successfully cleared all password reset logs!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-2xl border border-emerald-100">
              <Users className="w-6 h-6 text-emerald-805" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">{t.title}</h2>
              <p className="text-xs font-semibold text-slate-400 uppercase mt-0.5 tracking-wider">{t.subtitle}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-emerald-150 transition-all duration-200 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t.addUser}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-6 py-3 font-bold text-xs rounded-t-2xl border-t border-x transition-all cursor-pointer ${
            activeSubTab === 'users'
              ? 'bg-white border-slate-200 border-b-white text-emerald-805 shadow-2xs'
              : 'border-transparent text-slate-400 bg-transparent hover:text-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t.tabUsers}
            <span className="bg-slate-100 text-slate-600 font-extrabold px-1.5 py-0.5 rounded-full text-[10px]">
              {usersList.length}
            </span>
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('requests')}
          className={`px-6 py-3 font-bold text-xs rounded-t-2xl border-t border-x transition-all cursor-pointer ${
            activeSubTab === 'requests'
              ? 'bg-white border-slate-200 border-b-white text-emerald-805 shadow-2xs'
              : 'border-transparent text-slate-400 bg-transparent hover:text-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            {t.tabRequests}
            {userRequests.filter(r => r.status === 'Pending').length > 0 && (
              <span className="bg-rose-500 text-white font-black px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
                {userRequests.filter(r => r.status === 'Pending').length}New
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('resetLogs')}
          className={`px-6 py-3 font-bold text-xs rounded-t-2xl border-t border-x transition-all cursor-pointer ${
            activeSubTab === 'resetLogs'
              ? 'bg-white border-slate-200 border-b-white text-emerald-805 shadow-2xs'
              : 'border-transparent text-slate-400 bg-transparent hover:text-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            {t.tabResetLogs}
            {resetLogs.filter(l => l.status === 'Pending').length > 0 && (
              <span className="bg-rose-500 text-white font-black px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">
                {resetLogs.filter(l => l.status === 'Pending').length}New
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Dynamic Tab Panels */}
      {activeSubTab === 'users' ? (
        <div className="space-y-4">
          {/* Filters Row */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-3xs flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 transition"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={roleFilter}
                onChange={(e: any) => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-extrabold text-slate-600 focus:outline-hidden"
              >
                <option value="all">🛡️ {t.allRoles}</option>
                <option value="admin">👮 {t.adminRole}</option>
                <option value="user">👤 {t.userRole}</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-extrabold text-slate-600 focus:outline-hidden"
              >
                <option value="all">⭐ {t.allStatuses}</option>
                <option value="active">🟢 {t.statusActive}</option>
                <option value="inactive">🔴 {t.statusInactive}</option>
              </select>
            </div>
          </div>

          {/* User List Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="py-4 px-6">{t.fullName}</th>
                    <th className="py-4 px-6">{t.username}</th>
                    <th className="py-4 px-6">{t.role}</th>
                    <th className="py-4 px-6">{t.status}</th>
                    <th className="py-4 px-6">{t.createdAt}</th>
                    <th className="py-4 px-6 text-center">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-6 font-extrabold text-slate-800">
                          <div className="flex items-center gap-2.5">
                            {user.avatar ? (
                              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200/60 shrink-0">
                                <img 
                                  src={user.avatar} 
                                  alt={user.fullName} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-extrabold text-[11px] shrink-0">
                                {user.fullName.split(' ').pop()?.substring(0, 2) || 'US'}
                              </div>
                            )}
                            <div>
                              <span>{user.fullName}</span>
                              {currentUser?.username === user.username && (
                                <span className="ml-2 bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-sans">You</span>
                              )}
                              {user.forcePasswordChange && (
                                <span className="ml-2 bg-amber-100 border border-amber-200 text-amber-805 text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase animate-pulse font-sans">
                                  {lang === 'kh' ? '🔑 ទាមទារប្តូរលេខសម្ងាត់' : '🔑 Change Required'}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 font-mono text-slate-500 font-bold">
                          @{user.username}
                        </td>
                        <td className="py-3.5 px-6">
                          {user.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-805 font-bold px-2.5 py-1 rounded-lg text-[10px]">
                              <Shield className="w-3 h-3" />
                              {lang === 'kh' ? "រដ្ឋបាល (Admin)" : "Admin"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-650 font-bold px-2.5 py-1 rounded-lg text-[10px]">
                              <Users className="w-3 h-3" />
                              {lang === 'kh' ? "ប្រើប្រាស់ (User)" : "Standard User"}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6">
                          {user.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-md font-bold text-[10px]">
                              ● {lang === 'kh' ? "សកម្ម" : "Active"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-150 px-2 py-0.5 rounded-md font-bold text-[10px]">
                              ■ {lang === 'kh' ? "មិនសកម្ម" : "Inactive"}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 font-mono text-slate-400 text-[10.5px]">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEdit(user)}
                              className="p-1.5 hover:bg-emerald-50 text-emerald-800 rounded-lg border border-slate-200 hover:border-emerald-200 transition cursor-pointer"
                              title={t.edit}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleResetPassword(user.id, user.username)}
                              className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg border border-slate-200 hover:border-amber-200 transition cursor-pointer"
                              title={t.resetPassword}
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              disabled={currentUser?.role !== 'admin' || currentUser?.username === user.username}
                              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg border border-slate-200 hover:border-rose-200 transition disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                              title={t.delete}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center font-bold text-slate-450 text-xs">
                        {t.noUsers}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeSubTab === 'requests' ? (
        /* Requests Tab panel */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userRequests.length > 0 ? (
              userRequests.map((req) => (
                <div 
                  key={req.id} 
                  className={`bg-white rounded-3xl p-5 border shadow-3xs flex flex-col justify-between gap-4 transition-all duration-200 ${
                    req.status === 'Pending' 
                      ? 'border-amber-200 shadow-md shadow-amber-500/5 ring-1 ring-amber-300/35'
                      : req.status === 'Approved'
                        ? 'border-emerald-100 hover:border-emerald-250'
                        : 'border-rose-100 hover:border-rose-250'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        req.requestType === 'Leave' 
                          ? 'bg-amber-50 text-amber-805 border border-amber-250' 
                          : req.requestType === 'Equipment'
                            ? 'bg-blue-50 text-blue-805 border border-blue-250'
                            : req.requestType === 'Maintenance'
                              ? 'bg-purple-50 text-purple-850 border border-purple-250'
                              : 'bg-slate-100 text-slate-700 border border-slate-205'
                      }`}>
                        📂 {req.requestType}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === 'Pending'
                          ? 'bg-amber-100 text-amber-805 border border-amber-300'
                          : req.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-805 border border-emerald-300'
                            : 'bg-rose-100 text-rose-805 border border-rose-300'
                      }`}>
                        {req.status === 'Pending' ? t.statusPending : req.status === 'Approved' ? t.statusApproved : t.statusRejected}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-slate-800 tracking-tight leading-snug">{req.requestTitle}</h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[10.5px] font-bold text-slate-400">
                        <span>👤 {req.fullName} (@{req.username})</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed bg-slate-50/70 p-3 rounded-2xl border border-slate-100 max-h-24 overflow-y-auto whitespace-pre-wrap">
                      {req.description}
                    </p>

                    {req.remarks && (
                      <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 mt-2">
                        <div className="text-[10px] text-slate-400 font-extrabold uppercase">Admin Remarks៖</div>
                        <p className="text-xs text-slate-700 font-bold italic mt-0.5">"{req.remarks}"</p>
                      </div>
                    )}
                  </div>

                  {req.status === 'Pending' && (
                    <button
                      onClick={() => { setSelectedRequest(req); setAdminRemarks(req.remarks || ''); }}
                      className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-xs transition duration-200 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t.respond}</span>
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-3xl font-bold text-slate-400 text-xs">
                {t.noRequests}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Password Reset Logs Tab panel */
        <div className="space-y-4">
          <div className="flex items-center justify-between col-span-full">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {lang === 'kh' ? 'កំណត់ត្រា និងសំណើប្តូរលេខសម្ងាត់' : 'Password Reset Logs & Action Items'}
            </h3>
            {resetLogs.length > 0 && (
              <button
                onClick={handleClearAllLogs}
                className="bg-rose-50 hover:bg-rose-100/80 border border-rose-200 hover:border-rose-300 text-rose-750 font-extrabold text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.btnClearLogs}</span>
              </button>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-3xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-[10.5px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">{t.resetLogTime}</th>
                    <th className="py-3.5 px-6">{t.resetLogUser}</th>
                    <th className="py-3.5 px-6">{t.resetLogType}</th>
                    <th className="py-3.5 px-6">{t.resetLogStatus}</th>
                    <th className="py-3.5 px-6">{t.resetLogAdmin}</th>
                    <th className="py-3.5 px-6">{t.resetLogDetails}</th>
                    <th className="py-3.5 px-6 text-center">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resetLogs.length > 0 ? (
                    resetLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-6 text-[10.5px] font-mono text-slate-500 whitespace-nowrap">
                          {new Date(log.requestedAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="text-xs font-black text-slate-800">@{log.username}</div>
                          <div className="text-[10px] font-bold text-slate-400">{log.fullName}</div>
                        </td>
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md leading-none flex items-center gap-1.5 w-fit ${
                            log.actionType === 'User_Requested'
                              ? 'bg-amber-50 text-amber-805 border border-amber-200/60'
                              : log.actionType === 'Admin_Reset'
                                ? 'bg-indigo-50 text-indigo-850 border border-indigo-200/60'
                                : log.actionType === 'Request_Approved'
                                  ? 'bg-emerald-50 text-emerald-805 border border-emerald-250/60'
                                  : 'bg-rose-50 text-rose-805 border border-rose-250/60'
                          }`}>
                            {log.actionType === 'User_Requested' ? (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                {t.actionRequested}
                              </>
                            ) : log.actionType === 'Admin_Reset' ? (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-505" />
                                {t.actionDirectReset}
                              </>
                            ) : log.actionType === 'Request_Approved' ? (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-505" />
                                {t.actionApproved}
                              </>
                            ) : (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-505" />
                                {t.actionRejected}
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            log.status === 'Pending'
                              ? 'bg-amber-100 text-amber-805 border-amber-300'
                              : log.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}>
                            {log.status === 'Pending' ? t.statusPending : log.status === 'Completed' ? t.statusApproved : t.statusRejected}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-xs font-semibold text-slate-600 max-w-[140px] truncate" title={log.performedBy}>
                          {log.performedBy}
                        </td>
                        <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 max-w-xs truncate" title={log.details}>
                          {log.details}
                        </td>
                        <td className="py-3.5 px-6 text-center whitespace-nowrap">
                          {log.status === 'Pending' ? (
                            <div className="inline-flex gap-1.5 justify-center">
                              <button
                                onClick={() => handleApproveResetRequest(log.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10.5px] px-2.5 py-1 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{t.btnApprove}</span>
                              </button>
                              <button
                                onClick={() => handleRejectResetRequest(log.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 font-extrabold text-[10.5px] px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>{t.btnReject}</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-[10px] font-mono select-none">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-bold text-xs bg-white">
                        {t.noResetLogs}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b-2 border-emerald-500">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-450" />
                  <h3 className="text-sm font-black text-white">{t.addUser}</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="p-6 space-y-4 font-sans">
                {formError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-805 px-4 py-2.5 rounded-2xl text-xs font-bold">
                    ⚠️ {formError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-500">{t.username} <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. user01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-450 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-500">{t.fullName} <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-450 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-500">{t.password} <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-extrabold text-slate-805 placeholder:text-slate-450 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 transition"
                      required
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                  
                  {/* Force Password Change Checkbox */}
                  <label className="flex items-center gap-2 mt-2 select-none cursor-pointer group bg-slate-50 border border-slate-200/50 hover:bg-emerald-50/40 rounded-xl px-3 py-2 transition">
                    <input
                      type="checkbox"
                      checked={forcePasswordChange}
                      onChange={(e) => setForcePasswordChange(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                    />
                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 group-hover:text-emerald-855 leading-tight">
                      {t.forcePasswordChangeLabel}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-black text-slate-500">{t.role}</label>
                    <select
                      value={role}
                      onChange={(e: any) => setRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-extrabold text-slate-700"
                    >
                      <option value="user">{lang === 'kh' ? "ប្រើប្រាស់ (User)" : "User"}</option>
                      <option value="admin">{lang === 'kh' ? "រដ្ឋបាល (Admin)" : "Admin"}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-black text-slate-500">{t.status}</label>
                    <select
                      value={status}
                      onChange={(e: any) => setStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-extrabold text-slate-705"
                    >
                      <option value="active">🟢 {lang === 'kh' ? "សកម្ម" : "Active"}</option>
                      <option value="inactive">🔴 {lang === 'kh' ? "មិនសកម្ម" : "Inactive"}</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 hover:bg-slate-100 border border-slate-205 rounded-xl text-slate-500 text-xs font-bold cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    {t.addUser}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b-2 border-emerald-500">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-emerald-450" />
                  <h3 className="text-sm font-black text-white">{t.edit}៖ @{username}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setSelectedUser(null); }}
                  className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditUser} className="p-6 space-y-4 font-sans">
                {formError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-805 px-4 py-2.5 rounded-2xl text-xs font-bold">
                    ⚠️ {formError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-500">{t.fullName} <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-450 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-500">{t.password} ({lang === 'kh' ? "ទទេបើមិនចង់ដូរ" : "Leave blank to keep current"})</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-extrabold text-slate-805 placeholder:text-slate-450 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 transition"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    {/* Force Password Change Checkbox */}
                    <label className="flex items-center gap-1.5 select-none cursor-pointer group hover:opacity-80 transition">
                      <input
                        type="checkbox"
                        checked={forcePasswordChange}
                        onChange={(e) => setForcePasswordChange(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                      />
                      <span className="text-[10px] font-bold text-slate-550 group-hover:text-slate-900 leading-tight">
                        {lang === 'kh' ? 'តម្រូវឱ្យប្តូរលេខកូដសិន' : 'Force change'}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => { setPassword('123456'); setForcePasswordChange(true); }}
                      className="text-[10px] text-amber-605 hover:text-amber-700 font-extrabold flex items-center gap-1 cursor-pointer transition bg-amber-50 hover:bg-amber-100 rounded-lg px-2 py-1 border border-amber-200/50"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      {t.resetToDefaultBtn}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-black text-slate-500">{t.role}</label>
                    <select
                      value={role}
                      onChange={(e: any) => setRole(e.target.value)}
                      disabled={currentUser?.username === username}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-extrabold text-slate-700 disabled:opacity-50"
                    >
                      <option value="user">{lang === 'kh' ? "ប្រើប្រាស់ (User)" : "User"}</option>
                      <option value="admin">{lang === 'kh' ? "រដ្ឋបាល (Admin)" : "Admin"}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-black text-slate-500">{t.status}</label>
                    <select
                      value={status}
                      disabled={currentUser?.username === username}
                      onChange={(e: any) => setStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-extrabold text-slate-705 disabled:opacity-50"
                    >
                      <option value="active">🟢 {lang === 'kh' ? "សកម្ម" : "Active"}</option>
                      <option value="inactive">🔴 {lang === 'kh' ? "មិនសកម្ម" : "Inactive"}</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setIsEditModalOpen(false); setSelectedUser(null); }}
                    className="px-5 py-2.5 hover:bg-slate-100 border border-slate-205 rounded-xl text-slate-500 text-xs font-bold cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Respond to Request Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b-2 border-emerald-500">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-450" />
                  <h3 className="text-sm font-black text-white">{t.respond}</h3>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 font-sans">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase">{t.requestTitle}៖</div>
                  <h4 className="text-xs font-black text-slate-800 leading-snug">{selectedRequest.requestTitle}</h4>
                  <div className="text-[10px] text-slate-450 font-bold mt-1">👤 {selectedRequest.fullName} (@{selectedRequest.username})</div>
                  <div className="text-xs text-slate-600 mt-2 italic bg-white p-2.5 rounded-xl border border-slate-150 whitespace-pre-wrap">
                    "{selectedRequest.description}"
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-500">{t.remarks}</label>
                  <textarea
                    rows={3}
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    placeholder={lang === 'kh' ? "បញ្ចូលកំណត់សម្គាល់ ចម្លើយ ឬការយល់ព្រម..." : "Enter admin notes, approval feedback..."}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 transition"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleRespondRequest('Rejected')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-805 border border-rose-250 font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>{t.reject}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRespondRequest('Approved')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md shadow-emerald-200 transition cursor-pointer"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{t.approve}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
