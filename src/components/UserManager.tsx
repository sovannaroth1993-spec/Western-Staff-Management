import React, { useState, useEffect } from 'react';
import { UserAccount, UserRequest } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserPlus, Shield, UserCheck, UserX, Trash2, Edit2, Check, X, Search, Lock, FileText, BadgeAlert, Sparkles, MessageSquare, Plus, Clock, ThumbsUp, ThumbsDown, RefreshCw,
  Database, Download, UploadCloud, AlertTriangle, ChevronDown, CheckCircle
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

export const AVAILABLE_PERMISSIONS = [
  { key: 'dashboard', labelKh: 'ផ្ទាំងព័ត៌មាន (Dashboard)', labelEn: 'Dashboard Stats' },
  { key: 'attendance', labelKh: 'ស្រង់វត្តមានបុគ្គលិក (Attendance)', labelEn: 'Attendance' },
  { key: 'staff', labelKh: 'គ្រប់គ្រងបុគ្គលិក (Staff info)', labelEn: 'Staff Info' },
  { key: 'students', labelKh: 'គ្រប់គ្រងសិស្ស (Students info)', labelEn: 'Student Info' },
  { key: 'studentstatistics', labelKh: 'ប្រព័ន្ធស្ថិតិសិស្ស (Student stats)', labelEn: 'Student Stats' },
  { key: 'electricity', labelKh: 'តាមដានអគ្គិសនី (Electricity)', labelEn: 'Electricity' },
  { key: 'water', labelKh: 'តាមដានទឹក (Water)', labelEn: 'Water' },
  { key: 'fixedassets', labelKh: 'គ្រប់គ្រងទ្រព្យសម្បត្តិថេរ (Fixed Assets)', labelEn: 'Fixed Assets' },
  { key: 'insurance', labelKh: 'ធានារ៉ាប់រងសិស្ស (Student Insurance)', labelEn: 'Insurance' },
  { key: 'cctv', labelKh: 'តាមដាន CCTV (CCTV Management)', labelEn: 'CCTV' },
  { key: 'classroomequipment', labelKh: 'សម្ភារៈថ្នាក់រៀន (Classroom Equipment)', labelEn: 'Classroom Equipment' },
  { key: 'dailyreport', labelKh: 'របាយការណ៍ប្រចាំថ្ងៃ (Daily Report)', labelEn: 'Daily Report' },
  { key: 'admindocs', labelKh: 'ឯកសាររដ្ឋបាល (Admin Docs)', labelEn: 'Admin Docs' },
  { key: 'otherlinks', labelKh: 'តំណភ្ជាប់ផ្សេងៗ (Other Links)', labelEn: 'Other Links' },
  { key: 'schoolinfo', labelKh: 'ព័ត៌មានសាលាវេស្ទើន (School Info)', labelEn: 'School Info' },
  { key: 'telegram', labelKh: 'ប្រព័ន្ធ Forward ទៅ Telegram', labelEn: 'Telegram Alert' },
  { key: 'schoolevents', labelKh: 'ផែនការសកម្មភាពសាលា (School Events)', labelEn: 'School Annual Events' },
  { key: 'monthlyreport', labelKh: 'របាយការណ៍សង្ខេបប្រចាំខែ (Monthly Report)', labelEn: 'Monthly Reports' },
  { key: 'gepclassschedule', labelKh: 'កាលវិភាគថ្នាក់ GEP (GEP Classes Schedule)', labelEn: 'GEP Classes Schedule' },
  { key: 'abapayment', labelKh: 'ទូទាត់ប្រាក់ ABA QR Code (ABA KHQR Payment)', labelEn: 'ABA KHQR Payment' },
  { key: 'followup', labelKh: 'តារាង Follow-up ការងារ (Task Follow-up)', labelEn: 'Task Follow-up Tracker' },
  { key: 'usermanager', labelKh: 'គ្រប់គ្រងអ្នកប្រើប្រាស់ (User manager)', labelEn: 'User Manager' },
];

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
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Backup & Safety confirmation modal states
  const [importPreview, setImportPreview] = useState<{
    fileName: string;
    fileSize: string;
    keysFound: { key: string; nameEn: string; nameKh: string; recordsCount: number }[];
    rawJson: Record<string, any>;
  } | null>(null);

  const [backupConfirmModal, setBackupConfirmModal] = useState<{
    isOpen: boolean;
    type: 'clear_dataset' | 'restore_backup';
    titleKh: string;
    titleEn: string;
    warningKh: string;
    warningEn: string;
    keyword?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'clear_dataset',
    titleKh: '',
    titleEn: '',
    warningKh: '',
    warningEn: '',
    onConfirm: () => {}
  });

  const [safetyConfirmInput, setSafetyConfirmInput] = useState('');

  // Export progress & Toast state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportPhase, setExportPhase] = useState<{ kh: string; en: string }>({ kh: '', en: '' });
  const [toastNotification, setToastNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    messageKh: string;
    messageEn: string;
  } | null>(null);

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
      confirmClearLogs: "តើអ្នកប្រាកដជាចង់សម្អាតប្រវត្តិ និងកំណត់ត្រាទាំងអស់នេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានឡើយ!",
      tabBackup: "ទិន្នន័យ & ការចម្លងទុក (Data Backup)"
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
      confirmClearLogs: "Are you sure you want to clear all security logs and history? This action is irreversible!",
      tabBackup: "Data Backup & Recovery"
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
      forcePasswordChange: forcePasswordChange,
      permissions: selectedPermissions
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
    setSelectedPermissions([]);
  };

  const openEdit = (user: UserAccount) => {
    setSelectedUser(user);
    setUsername(user.username);
    setFullName(user.fullName);
    setPassword(user.password || '');
    setRole(user.role);
    setStatus(user.status);
    setForcePasswordChange(user.forcePasswordChange || false);
    setSelectedPermissions(user.permissions || []);
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
          forcePasswordChange: forcePasswordChange,
          permissions: selectedPermissions
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

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'requests' | 'resetLogs' | 'backup'>('users');
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

  // ==========================================
  // DATA BACKUP & SYSTEM PURGE METHODS
  // ==========================================

  const handleExportFullBackup = () => {
    if (isExporting) return;
    
    setIsExporting(true);
    setExportProgress(5);
    setExportPhase({
      kh: "កំពុងវិភាគពិនិត្យមើលសោទិន្នន័យប្រព័ន្ធ...",
      en: "Analyzing local storage keyrings..."
    });

    const updateStage = (progress: number, phaseKh: string, phaseEn: string, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setExportProgress(progress);
          setExportPhase({ kh: phaseKh, en: phaseEn });
          resolve();
        }, delay);
      });
    };

    const runBackupSequence = async () => {
      await updateStage(25, "កំពុងដកស្រង់សំណុំព័ត៌មានបុគ្គលិក និងសិស្ស...", "Extracting staff and student datasets...", 250);
      await updateStage(55, "កំពុងបង្កើតរចនាសម្ព័ន្ធកំណត់ត្រាហិរញ្ញវត្ថុ និងឧបករណ៍...", "Formatting operations records and assets schema...", 300);
      await updateStage(85, "កំពុងបំលែងសំណុំទិន្នន័យទៅជា JSON Stream...", "Packaging database entries into clean JSON stream...", 250);
      await updateStage(100, "ការធ្វើសៀរៀលកម្មបានបញ្ចប់! ប្រព័ន្ធកំពុងចាប់ផ្តើមទាញយក...", "Serialization complete! Triggering local file browser download...", 200);

      setTimeout(() => {
        const backupObj: Record<string, any> = {};
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('wis_') || key.startsWith('school_')) {
            try {
              const val = localStorage.getItem(key);
              if (val) backupObj[key] = JSON.parse(val);
            } catch {
              backupObj[key] = localStorage.getItem(key);
            }
          }
        });

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        const dateStr = new Date().toISOString().split('T')[0];
        downloadAnchor.setAttribute("download", `WIS_Full_System_Backup_${dateStr}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        // End exporting state
        setIsExporting(false);
        setExportProgress(0);
        setExportPhase({ kh: '', en: '' });

        // Show Success Toast
        setToastNotification({
          show: true,
          type: 'success',
          messageKh: "ការបម្រុងទុកទិន្នន័យបានជោគជ័យ! ឯកសារ JSON ត្រូវបានរក្សាទុកក្នុងកុំព្យូទ័ររបស់អ្នករួចរាល់។",
          messageEn: "Data backup successful! The full workspace state JSON file is now stored locally."
        });

        // Auto-dismiss toast
        setTimeout(() => {
          setToastNotification(prev => prev && prev.show ? null : prev);
        }, 4500);

      }, 300);
    };

    runBackupSequence();
  };

  const processImportJson = (jsonText: string, fileName: string, fileSize: number) => {
    try {
      const parsed = JSON.parse(jsonText);
      if (typeof parsed !== 'object' || parsed === null) {
        alert(lang === 'kh' ? "ឯកសារ Backup មិនត្រឹមត្រូវ!" : "Invalid backup file structure!");
        return;
      }

      const keysFound: { key: string; nameEn: string; nameKh: string; recordsCount: number }[] = [];
      
      const translateKey = (k: string) => {
        const mapping: Record<string, { kh: string; en: string }> = {
          'wis_staff_list': { kh: 'ព័ត៌មានបុគ្គលិកសាលា (Staff Profiles)', en: 'Staff Profiles list' },
          'wis_student_list': { kh: 'បញ្ជីរាយនាមសិស្ស (Student Profiles)', en: 'Student Profiles list' },
          'wis_attendance_records': { kh: 'កំណត់ត្រាវត្តមានបុគ្គលិក (Attendance Logs)', en: 'Staff Attendance records' },
          'wis_electricity_records': { kh: 'ទិន្នន័យម៉ែត្រអគ្គិសនី (Electricity Logs)', en: 'Electricity tracker audits' },
          'wis_water_records': { kh: 'ទិន្នន័យម៉ែត្រទឹក (Water Logs)', en: 'Water tracker audits' },
          'wis_daily_reports': { kh: 'របាយការណ៍ប្រតិបត្តិការប្រចាំថ្ងៃ (Daily Reports)', en: 'Daily Operations reports' },
          'wis_monthly_reports': { kh: 'របាយការណ៍សង្ខេបប្រចាំខែ (Monthly Reports)', en: 'Monthly operation metrics' },
          'wis_fixed_assets': { kh: 'ទ្រព្យសម្បត្តិថេរ (Fixed Assets)', en: 'Fixed Assets Registry' },
          'wis_cctv_records': { kh: 'កំណត់ត្រាត្រួតពិនិត្យ CCTV', en: 'CCTV Checklogs' },
          'wis_school_events': { kh: 'ផែនការសកម្មភាពសាលា (Events Calendar)', en: 'School Events Calendar' },
          'school_admin_docs_files_v1': { kh: 'ឯកសាររដ្ឋបាល (Admin Documents)', en: 'Administration files' },
          'school_admin_docs_status_v1': { kh: 'ស្ថានភាពឯកសាររដ្ឋបាល', en: 'Admin Categories statuses' },
          'wis_khmer_calendar_notes': { kh: 'កំណត់សម្គាល់ប្រតិទិនខ្មែរ', en: 'Khmer Calendar comments' },
          'wis_tuition_calc_students': { kh: 'សិស្សគណនាកម្រៃសិក្សា (Tuition Roster)', en: 'Tuition calculator records' },
          'wis_users_list': { kh: 'គណនីប្រើប្រាស់ប្រព័ន្ធ (User Accounts)', en: 'System account credentials' },
          'wis_user_requests': { kh: 'សំណើការអនុញ្ញាតពីបុគ្គលិក (Request Inbox)', en: 'User Requests Inbox' },
          'wis_password_reset_logs': { kh: 'ប្រវត្តិកែលេខកូដសុវត្ថិភាព (Reset Logs)', en: 'Password reset logs' }
        };
        return mapping[k] || { kh: `ប្រភេទទិន្នន័យ៖ ${k}`, en: `Custom dataset: ${k}` };
      };

      Object.keys(parsed).forEach((k) => {
        if (k.startsWith('wis_') || k.startsWith('school_')) {
          let count = 0;
          if (Array.isArray(parsed[k])) {
            count = parsed[k].length;
          } else if (typeof parsed[k] === 'object' && parsed[k] !== null) {
            count = Object.keys(parsed[k]).length;
          } else {
            count = parsed[k] ? 1 : 0;
          }
          const trans = translateKey(k);
          keysFound.push({
            key: k,
            nameKh: trans.kh,
            nameEn: trans.en,
            recordsCount: count
          });
        }
      });

      if (keysFound.length === 0) {
        alert(lang === 'kh' ? "រកមិនឃើញទិន្នន័យប្រព័ន្ធនៅក្នុងឯកសារនេះទេ!" : "No system datasets detected in this backup file!");
        return;
      }

      setImportPreview({
        fileName,
        fileSize: (fileSize / 1024).toFixed(1) + " KB",
        keysFound,
        rawJson: parsed
      });
    } catch (e) {
      alert(lang === 'kh' ? "ការអានឯកសារ JSON បានបរាជ័យ!" : "Failed to parse JSON backup file!");
    }
  };

  const handleImportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      processImportJson(text, file.name, file.size);
    };
    reader.readAsText(file);
  };

  const handleImportFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      alert(lang === 'kh' ? "សូមបញ្ចូលតែឯកសារ .json ប៉ុណ្ណោះ!" : "Only JSON files are supported!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      processImportJson(text, file.name, file.size);
    };
    reader.readAsText(file);
  };

  const getPurgeableDatasets = () => {
    const getLen = (key: string) => {
      try {
        const saved = localStorage.getItem(key);
        if (!saved) return 0;
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.length : (typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 0);
      } catch {
        return 0;
      }
    };

    return [
      { key: 'wis_staff_list', nameKh: 'ព័ត៌មានបុគ្គលិកសាលា (Staff Profiles)', nameEn: 'WIS Staff Profiles', count: getLen('wis_staff_list'), defaultValue: '[]' },
      { key: 'wis_student_list', nameKh: 'កាលវិភាគ/ព័ត៌មានសិស្ស (Student Profiles)', nameEn: 'WIS Student Profiles', count: getLen('wis_student_list'), defaultValue: '[]' },
      { key: 'wis_attendance_records', nameKh: 'កំណត់ត្រាវត្តមានបុគ្គលិក (Attendance Logs)', nameEn: 'Staff Attendance Records', count: getLen('wis_attendance_records'), defaultValue: '[]' },
      { key: 'wis_electricity_records', nameKh: 'របាយការណ៍ម៉ែត្រអគ្គិសនី (Electricity Logs)', nameEn: 'Electricity Tracker logs', count: getLen('wis_electricity_records'), defaultValue: '[]' },
      { key: 'wis_water_records', nameKh: 'របាយការណ៍ម៉ែត្រទឹក (Water Logs)', nameEn: 'Water Tracker logs', count: getLen('wis_water_records'), defaultValue: '[]' },
      { key: 'wis_daily_reports', nameKh: 'របាយការណ៍ប្រតិបត្តិការប្រចាំថ្ងៃ (Daily Reports)', nameEn: 'Daily Operations Reports', count: getLen('wis_daily_reports'), defaultValue: '[]' },
      { key: 'wis_monthly_reports', nameKh: 'របាយការណ៍សង្ខេបប្រចាំខែ (Monthly Reports)', nameEn: 'Monthly operation metrics', count: getLen('wis_monthly_reports'), defaultValue: '[]' },
      { key: 'wis_fixed_assets', nameKh: 'ទ្រព្យសម្បត្តិថេររបស់សាលា (Fixed Assets)', nameEn: 'School Fixed Assets', count: getLen('wis_fixed_assets'), defaultValue: '[]' },
      { key: 'wis_cctv_records', nameKh: 'កំណត់ត្រាសវនកម្ម CCTV (CCTV Checklogs)', nameEn: 'CCTV Audit records', count: getLen('wis_cctv_records'), defaultValue: '[]' },
      { key: 'wis_school_events', nameKh: 'ផែនការសកម្មភាពសាលា (School Events)', nameEn: 'WIS Events Calendar', count: getLen('wis_school_events'), defaultValue: '[]' },
      { key: 'school_admin_docs_files_v1', nameKh: 'ឯកសាររដ្ឋបាល & ច្បាប់អនុវត្ត (Admin Docs)', nameEn: 'Admin Docs & Regulations', count: getLen('school_admin_docs_files_v1'), defaultValue: '[]' }
    ];
  };

  const triggerClearDataset = (ds: { key: string; nameKh: string; nameEn: string; count: number; defaultValue: string }) => {
    setSafetyConfirmInput('');
    setBackupConfirmModal({
      isOpen: true,
      type: 'clear_dataset',
      titleKh: `សម្អាតសំណុំទិន្នន័យ៖ ${ds.nameKh}`,
      titleEn: `Clear Dataset: ${ds.nameEn}`,
      warningKh: `តើអ្នកពិតជាចង់សម្អាតទិន្នន័យ "${ds.nameKh}" នេះមែនទេ? សកម្មភាពនេះនឹងលុបចោលទាំងស្រុងនូវកំណត់ត្រាចំនួន ${ds.count} របស់សាលាជាអចិន្ត្រៃយ៍ និងមិនអាចទាញមកវិញបានឡើយ!`,
      warningEn: `Are you sure you want to completely clear the "${ds.nameEn}" dataset? This action will permanently wipe out all ${ds.count} active school records, and is absolutely irreversible!`,
      keyword: 'WISDELETE',
      onConfirm: () => {
        try {
          localStorage.setItem(ds.key, ds.defaultValue);
          alert(lang === 'kh' 
            ? `បានសម្អាតទិន្នន័យ "${ds.nameKh}" ដោយជោគជ័យ! ប្រព័ន្ធនឹងរៀបចំដំណើរការឡើងវិញជាស្វ័យប្រវត្តិ។` 
            : `Successfully wiped out "${ds.nameEn}"! System will now restart dynamically.`);
          setBackupConfirmModal(prev => ({ ...prev, isOpen: false }));
          window.location.reload();
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const triggerRestoreConfirmation = (rawJson: Record<string, any>, datasetCount: number) => {
    setSafetyConfirmInput('');
    setBackupConfirmModal({
      isOpen: true,
      type: 'restore_backup',
      titleKh: 'តម្លើងទិន្នន័យប្រព័ន្ធចាស់ឡើងវិញ',
      titleEn: 'Restore System Backup File',
      warningKh: `ការតម្លើងទិន្នន័យចម្លងនេះ នឹងជំនួស រាល់ទិន្នន័យសាលាដែលមានស្រាប់នៅក្នុងប្រព័ន្ធនាពេលបច្ចុប្បន្ន (សរុបមាន ${datasetCount} សំណុំទិន្នន័យរកឃើញ)! តើអ្នកប្រាកដថាចង់បន្តសកម្មភាពនេះមែនទេ?`,
      warningEn: `Restoring this backup file will completely OVERWRITE and replace all current school records across ${datasetCount} school datasets! Are you sure you want to perform this operation?`,
      keyword: 'WISRESTORE',
      onConfirm: () => {
        try {
          Object.keys(rawJson).forEach((k) => {
            if (k.startsWith('wis_') || k.startsWith('school_')) {
              const val = rawJson[k];
              localStorage.setItem(k, typeof val === 'object' ? JSON.stringify(val) : String(val));
            }
          });
          alert(lang === 'kh' 
            ? "បានស្តារ និងតម្លើងទិន្នន័យចម្លងប្រព័ន្ធឡើងវិញដោយជោគជ័យ! ប្រព័ន្ធកំពុងដំណើរការឡើងវិញ..." 
            : "Restore complete! System is reloading dynamic records successfully now.");
          setBackupConfirmModal(prev => ({ ...prev, isOpen: false }));
          setImportPreview(null);
          window.location.reload();
        } catch (err) {
          alert(lang === 'kh' ? "ការតម្លើងបរាជ័យ!" : "System recovery failed!");
        }
      }
    });
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
        <button
          onClick={() => setActiveSubTab('backup')}
          className={`px-6 py-3 font-bold text-xs rounded-t-2xl border-t border-x transition-all cursor-pointer ${
            activeSubTab === 'backup'
              ? 'bg-white border-slate-200 border-b-white text-emerald-805 shadow-2xs'
              : 'border-transparent text-slate-400 bg-transparent hover:text-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-500" />
            {t.tabBackup}
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
                              <div className="flex items-center gap-1.5">
                                <span>{user.fullName}</span>
                                {currentUser?.username === user.username && (
                                  <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-sans">You</span>
                                )}
                                {user.forcePasswordChange && (
                                  <span className="bg-amber-100 border border-amber-200 text-amber-805 text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase animate-pulse font-sans">
                                    {lang === 'kh' ? '🔑 ទាមទារប្តូរលេខសម្ងាត់' : '🔑 Change Required'}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1 max-w-[320px]">
                                {user.role === 'admin' ? (
                                  <span className="bg-amber-50 border border-amber-200 text-[#073B3A] text-[8.5px] font-bold px-1.5 py-0.5 rounded font-sans">
                                    ★ {lang === 'kh' ? 'សិទ្ធិគ្រប់គ្រងទាំងអស់' : 'Super Admin'}
                                  </span>
                                ) : user.permissions && user.permissions.length > 0 ? (
                                  user.permissions.map(kp => {
                                    const match = AVAILABLE_PERMISSIONS.find(p => p.key === kp);
                                    return (
                                      <span key={kp} className="bg-emerald-50/60 border border-emerald-100 text-emerald-805 text-[8.5px] font-bold px-1.5 py-0.5 rounded font-sans leading-none">
                                        {lang === 'kh' ? (match?.labelKh.split(' ')[0] || kp) : (match?.labelEn || kp)}
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span className="bg-slate-50 border border-slate-100 text-slate-400 text-[8.5px] font-bold px-1.5 py-0.5 rounded italic font-sans leading-none">
                                    {lang === 'kh' ? 'សិទ្ធិបុគ្គលិកធម្មតា (Staff Portal)' : 'Staff Portal Only'}
                                  </span>
                                )}
                              </div>
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
      ) : activeSubTab === 'resetLogs' ? (
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
      ) : (
        /* Data Backup and Recovery Tab panel */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Left Side: Backup & Restore */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-205 shadow-3xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Database className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black text-slate-850 uppercase tracking-tight">
                  {lang === 'kh' ? 'នាំចេញ និងនាំចូលទិន្នន័យចម្លង' : 'Export & Import Full Database JSON Backup'}
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {lang === 'kh'
                  ? 'អ្នកអាចទាញយកទិន្នន័យ (រាល់បញ្ជីបុគ្គលិក សิស្ស របាយការណ៍ និងកំណត់ត្រាផ្សេងៗ) ទាំងអស់នៅក្នុង Workspace មកកុំព្យូទ័ររបស់អ្នកក្នុងទម្រង់ជា JSON ឬបង្ហោះឯកសារចម្លងនោះមកវិញដើម្បីទាញទិន្នន័យចាស់មកប្រើវិញ។'
                  : 'You can download the entire workspace states (including all employee profiles, student registries, audit logs, and reports) locally as a single JSON file, or drag-and-drop a previous file to restore states.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handleExportFullBackup}
                  className="inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-100 disabled:text-slate-350 disabled:border-slate-200 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-amber-100 disabled:shadow-none transition-all duration-205 cursor-pointer flex-1"
                >
                  <Download className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} />
                  <span>
                    {isExporting 
                      ? (lang === 'kh' ? 'កំពុងនាំចេញ...' : 'Exporting State...') 
                      : (lang === 'kh' ? 'ទាញយកទិន្នន័យចម្លង (Export JSON)' : 'Full Backup (Export JSON)')
                    }
                  </span>
                </button>
              </div>

              {/* Visual Export Progress Bar */}
              {isExporting && (
                <div className="bg-amber-50/50 border border-amber-150 rounded-2xl p-4 space-y-3 font-sans animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-800 flex items-center gap-1.5 animate-pulse">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      {lang === 'kh' ? 'កំពុងនាំចេញទិន្នន័យ...' : 'Exporting System State...'}
                    </span>
                    <span className="text-xs font-mono font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">
                      {exportProgress}%
                    </span>
                  </div>

                  <p className="text-[11px] font-bold text-slate-500 min-h-[16px]">
                    {lang === 'kh' ? exportPhase.kh : exportPhase.en}
                  </p>

                  {/* Progress tracks */}
                  <div className="w-full bg-slate-150 h-2.5 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${exportProgress}%` }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}

              {/* Import Upload box */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-black text-slate-700">
                  {lang === 'kh' ? 'តម្លើងទិន្នន័យចាស់ឡើងវិញ (Import & Restore)' : 'Upload Backup File to Restore'}
                </h4>

                <div 
                  className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer relative bg-slate-50 hover:bg-emerald-50/20"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleImportFileDrop}
                >
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-black text-slate-600">
                    {lang === 'kh' ? 'អូសទម្លាក់ ឬ ចុចដើម្បីជ្រើសរើសឯកសារ JSON' : 'Drag & drop or click to select JSON backup file'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">
                    {lang === 'kh' ? 'ឯកសារត្រូវតែជាទម្រង់ .json ដែលបាននាំចេញពីប្រព័ន្ធនេះ' : 'Must be a .json file exported from this application'}
                  </p>
                </div>
              </div>

              {/* Import Preview if file exists */}
              {importPreview && (
                <div className="bg-emerald-50/50 border border-emerald-150 rounded-2xl p-4 space-y-3 font-sans animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      {lang === 'kh' ? 'ឯកសារត្រឹមត្រូវសម្រាប់ការតម្លើង' : 'Valid Backup File Spotted'}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setImportPreview(null)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded-full hover:bg-slate-200 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="font-extrabold text-slate-500">{lang === 'kh' ? 'ឈ្មោះឯកសារ៖ ' : 'Name: '}</span>
                      <span className="font-black text-slate-800">{importPreview.fileName}</span>
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-500">{lang === 'kh' ? 'ទំហំ៖ ' : 'Size: '}</span>
                      <span className="font-semibold text-slate-600">{importPreview.fileSize}</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-emerald-100 max-h-48 overflow-y-auto space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider border-b pb-1.5 mb-1.5">
                      {lang === 'kh' ? 'ទិន្នន័យដែលរកឃើញ (Datasets Detected)' : 'Analyzed Records list'}
                    </div>
                    {importPreview.keysFound.map((k) => (
                      <div key={k.key} className="flex justify-between items-center text-[11px] py-1">
                        <span className="font-bold text-slate-600">{lang === 'kh' ? k.nameKh : k.nameEn}</span>
                        <span className="bg-emerald-100 text-emerald-800 font-black px-1.5 py-px rounded font-mono">
                          {k.recordsCount} {lang === 'kh' ? 'កំណត់ត្រា' : 'records'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerRestoreConfirmation(importPreview.rawJson, importPreview.keysFound.length)}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{lang === 'kh' ? 'តម្លើងទិន្នន័យចម្លងនេះ' : 'Restore Selected Backup'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Clear Records Datasets */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-3xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-black text-slate-850 uppercase tracking-tight">
                  {lang === 'kh' ? 'សម្អាតកំណត់ត្រាប្រព័ន្ធ និងទិន្នន័យ' : 'System Records Depuration & Cleanup'}
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {lang === 'kh'
                  ? 'លុបសម្អាតសំណុំទិន្នន័យជាក់លាក់ដោយឡែកជាអចិន្ត្រៃយ៍។ រាល់សកម្មភាពលុបត្រូវតែឆ្លងកាត់ផ្দেশেরបញ្ជាក់ Confirmation Modal ដោយវាយបញ្ចូលពាក្យសម្ងាត់សុវត្ថិភាពជាមុន ដើម្បីការពារការជ្រុលដៃលុបទិន្នន័យ។'
                  : 'Permanently purge selected datasets from the workspace database. All clear triggers are fully guarded by an interactive confirmation modal, requiring safety-key input to avoid accidental click actions.'}
              </p>

              {/* Datasets purging grid */}
              <div className="space-y-3">
                {getPurgeableDatasets().map((ds) => (
                  <div key={ds.key} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 gap-3">
                    <div>
                      <h4 className="text-xs font-black text-slate-800">
                        {lang === 'kh' ? ds.nameKh : ds.nameEn}
                      </h4>
                      <p className="text-[10.5px] font-bold text-slate-400 mt-0.5">
                        {lang === 'kh' ? `សរុប៖ ${ds.count} កំណត់ត្រា (Key: ${ds.key})` : `Count: ${ds.count} lines (Storage key: ${ds.key})`}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={ds.count === 0}
                      onClick={() => triggerClearDataset(ds)}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 disabled:bg-slate-100 disabled:text-slate-300 hover:text-rose-700 text-rose-600 border border-rose-200 disabled:border-slate-200 font-extrabold text-[11px] rounded-xl transition cursor-pointer shrink-0"
                    >
                      {lang === 'kh' ? 'សម្អាត (Clear)' : 'Purge All'}
                    </button>
                  </div>
                ))}
              </div>
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

                {/* Permitted Features Checkboxes */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-slate-500">
                      {lang === 'kh' ? 'សិទ្ធិប្រើប្រាស់មុខងារនានាក្នុងប្រព័ន្ធ' : 'Feature Permissions'}
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPermissions(AVAILABLE_PERMISSIONS.map(p => p.key))}
                        className="text-[9.5px] font-black text-emerald-600 hover:underline cursor-pointer"
                      >
                        {lang === 'kh' ? 'ជ្រើសទាំងអស់' : 'Select All'}
                      </button>
                      <span className="text-[9px] text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedPermissions([])}
                        className="text-[9.5px] font-black text-rose-600 hover:underline cursor-pointer"
                      >
                        {lang === 'kh' ? 'សម្អាតទាំងអស់' : 'Clear All'}
                      </button>
                    </div>
                  </div>
                  
                  {role === 'admin' ? (
                    <div className="bg-amber-50/50 text-amber-805 text-[10px] font-bold p-3 rounded-2xl border border-amber-200/50 italic">
                      💡 {lang === 'kh' ? 'តួនាទី Admin មានសិទ្ធិប្រើប្រាស់មុខងារទាំងអស់ក្នុងប្រព័ន្ធដោយស្វ័យប្រវត្តិ។' : 'Admin accounts automatically have full access to all system features.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/50 max-h-48 overflow-y-auto">
                      {AVAILABLE_PERMISSIONS.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.key);
                        return (
                          <label 
                            key={perm.key} 
                            className={`flex items-start gap-1.5 p-1.5 rounded-xl border transition cursor-pointer select-none ${
                              isChecked 
                                ? 'bg-emerald-50/40 border-emerald-100 text-emerald-900 font-extrabold' 
                                : 'bg-white border-transparent hover:bg-slate-100/50 text-slate-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedPermissions(selectedPermissions.filter(p => p !== perm.key));
                                } else {
                                  setSelectedPermissions([...selectedPermissions, perm.key]);
                                }
                              }}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5 h-3.5 w-3.5 cursor-pointer shrink-0"
                            />
                            <span className="text-[10px] leading-snug">
                              {lang === 'kh' ? perm.labelKh : perm.labelEn}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
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

                {/* Permitted Features Checkboxes */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-slate-500">
                      {lang === 'kh' ? 'សិទ្ធិប្រើប្រាស់មុខងារនានាក្នុងប្រព័ន្ធ' : 'Feature Permissions'}
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPermissions(AVAILABLE_PERMISSIONS.map(p => p.key))}
                        className="text-[9.5px] font-black text-emerald-600 hover:underline cursor-pointer"
                      >
                        {lang === 'kh' ? 'ជ្រើសទាំងអស់' : 'Select All'}
                      </button>
                      <span className="text-[9px] text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedPermissions([])}
                        className="text-[9.5px] font-black text-rose-600 hover:underline cursor-pointer"
                      >
                        {lang === 'kh' ? 'សម្អាតទាំងអស់' : 'Clear All'}
                      </button>
                    </div>
                  </div>
                  
                  {role === 'admin' ? (
                    <div className="bg-amber-50/50 text-amber-805 text-[10px] font-bold p-3 rounded-2xl border border-amber-200/50 italic">
                      💡 {lang === 'kh' ? 'តួនាទី Admin មានសិទ្ធិប្រើប្រាស់មុខងារទាំងអស់ក្នុងប្រព័ន្ធដោយស្វ័យប្រវត្តិ។' : 'Admin accounts automatically have full access to all system features.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/50 max-h-48 overflow-y-auto">
                      {AVAILABLE_PERMISSIONS.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.key);
                        return (
                          <label 
                            key={perm.key} 
                            className={`flex items-start gap-1.5 p-1.5 rounded-xl border transition cursor-pointer select-none ${
                              isChecked 
                                ? 'bg-emerald-50/40 border-emerald-100 text-emerald-900 font-extrabold' 
                                : 'bg-white border-transparent hover:bg-slate-100/50 text-slate-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedPermissions(selectedPermissions.filter(p => p !== perm.key));
                                } else {
                                  setSelectedPermissions([...selectedPermissions, perm.key]);
                                }
                              }}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5 h-3.5 w-3.5 cursor-pointer shrink-0"
                            />
                            <span className="text-[10px] leading-snug">
                              {lang === 'kh' ? perm.labelKh : perm.labelEn}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
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

      {/* Backup & Purge Safety lock Confirmation Modal */}
      <AnimatePresence>
        {backupConfirmModal.isOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden font-sans"
            >
              {/* Header */}
              <div className="bg-rose-50/50 p-6 flex items-start gap-4 border-b border-slate-100">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl border border-rose-200 shrink-0">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                    {lang === 'kh' ? backupConfirmModal.titleKh : backupConfirmModal.titleEn}
                  </h3>
                  <p className="text-[10px] text-rose-650 font-black tracking-wider uppercase mt-1">
                    {lang === 'kh' ? 'សកម្មភាពរដ្ឋបាលជាន់ខ្ពស់' : 'Critical Administrative Directive'}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {lang === 'kh' ? backupConfirmModal.warningKh : backupConfirmModal.warningEn}
                </p>

                {backupConfirmModal.keyword && (
                  <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-150">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {lang === 'kh' ? `សូមវាយពាក្យ "${backupConfirmModal.keyword}" ដើម្បីបញ្ជាក់៖` : `Type keyword "${backupConfirmModal.keyword}" to confirm:`}
                    </label>
                    <input
                      type="text"
                      value={safetyConfirmInput}
                      onChange={(e) => setSafetyConfirmInput(e.target.value)}
                      placeholder={backupConfirmModal.keyword}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black tracking-wider text-rose-650 text-center uppercase focus:outline-hidden focus:ring-2 focus:ring-rose-500/25 focus:border-rose-450 transition font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBackupConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={backupConfirmModal.keyword ? safetyConfirmInput !== backupConfirmModal.keyword : false}
                  onClick={backupConfirmModal.onConfirm}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs rounded-xl shadow-md disabled:shadow-none transition-all duration-150 cursor-pointer"
                >
                  {lang === 'kh' ? 'យល់ព្រមអនុវត្ត' : 'Confirm Action'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast notification banner */}
      <AnimatePresence>
        {toastNotification && toastNotification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-150 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 p-4 font-sans"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="text-xs font-black tracking-wider uppercase text-emerald-400">
                  {lang === 'kh' ? 'នាំចេញដោយជោគជ័យ' : 'EXPORT COMPLETED'}
                </h4>
                <p className="text-[11px] text-slate-300 font-bold leading-relaxed">
                  {lang === 'kh' ? toastNotification.messageKh : toastNotification.messageEn}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setToastNotification(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
