/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  FollowupTask, 
  FollowupTaskStatus, 
  InsuranceFollowupRecord, 
  InsuranceFollowupStatus, 
  UserAccount 
} from '../types';
import { 
  Plus, Edit2, Trash2, Search, Filter, Calendar, 
  CheckCircle, Clock, AlertCircle, HelpCircle, XCircle, 
  FileSpreadsheet, Printer, ArrowUpRight, ChevronDown, Check, RefreshCw,
  Shield, User, Landmark, Layers, FileText, Info, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskFollowupManagerProps {
  currentUser?: UserAccount | null;
  lang?: 'kh' | 'en';
}

export interface StaffTask {
  id: string;
  assignedDate: string;
  staffName: string;
  position: string;
  taskToDo: string;
  deadline: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Overdue' | 'OnHold';
  finishDate: string;
  result: string;
  supervisor: string;
  remark: string;
}

export interface WeeklyStaffFollowup {
  id: string;
  date: string;
  staffName: string;
  taskDesc: string;
  progressPercent: number;
  challenge: string;
  solution: string;
  expectedFinishDate: string;
}

export interface MonthlyStaffEvaluation {
  id: string;
  staffName: string;
  totalTasks: number;
  completedOnTime: number;
  completedLate: number;
  unfinished: number;
  score: string;
}

export interface CleanerSecurityEvaluation {
  id: string;
  staffName: string;
  role: 'Cleaner' | 'Security';
  month: string;
  dateEvaluated: string;
  scores: number[]; 
  penalties: string[]; 
  totalScore: number; 
  grade: string; 
  customPenaltiesText?: string;
  criteriaComments?: string[];
  customCriteria?: { id: string; labelKh: string; labelEn: string; maxPoints: number; score: number }[];
}

export interface CsCriterion {
  id: number;
  labelKh: string;
  labelEn: string;
  maxPoints: number;
}

export const CLEANER_CRITERIA: CsCriterion[] = [
  { id: 1, labelKh: 'លាងសម្អាត និងអនាម័យបន្ទប់ទឹក', labelEn: 'Bathroom Cleaning & Sanitation', maxPoints: 20 },
  { id: 2, labelKh: 'ជូតសម្អាតការិយាល័យ និងថ្នាក់រៀនជាប្រចាំ', labelEn: 'Regular Mopping & Dusting of Offices & Classrooms', maxPoints: 20 },
  { id: 3, labelKh: 'ការប្រមូល បែងចែក និងទុកដាក់សម្រាម', labelEn: 'Waste Collection, Segregation & Disposal', maxPoints: 20 },
  { id: 4, labelKh: 'ការបោសសម្អាតទីធ្លាសាលា និងជូតសម្អាតកញ្ចក់បង្អួច', labelEn: 'Sweeping School Yard & Cleaning Window Panes', maxPoints: 20 },
  { id: 5, labelKh: 'អាកប្បកិរិយារួសរាយរាក់ទាក់ សហការបំពេញការងារ និងសន្សំសំចៃទឹក/ភ្លើង', labelEn: 'Cooperative Attitude, Friendliness & Utility Conservation', maxPoints: 20 }
];

export const SECURITY_CRITERIA: CsCriterion[] = [
  { id: 1, labelKh: 'ការសម្របសម្រួលចរាចរណ៍ សណ្ដាប់ធ្នាប់ និងសុវត្ថិភាពសិស្សពេលចេញចូល', labelEn: 'Traffic Coordination, Order & Student Ingress/Egress Safety', maxPoints: 25 },
  { id: 2, labelKh: 'ការយាមកាម ត្រួតពិនិត្យ និងគ្រប់គ្រងច្រកទ្វារចេញចូលសាលា', labelEn: 'Gate Vigilance, Visitor Log Checking & Entry Access Control', maxPoints: 25 },
  { id: 3, labelKh: 'ការដើរល្បាតតាមដានសុវត្ថិភាពទូទៅ និងបង្ការហានិភ័យជុំវិញបរិវេណសាលា', labelEn: 'Continuous Campus Patrol & Risk/Hazard Identification', maxPoints: 25 },
  { id: 4, labelKh: 'ការគោរពវិន័យ អាកប្បកិរិយាផ្ដល់ព័ត៌មាន និងការស្លៀកពាក់ឯកសណ្ឋានការងារញឹបញាប់', labelEn: 'Compliance with Professional Protocol, Uniform Decorum & Teamwork', maxPoints: 25 }
];

export interface CsPenalty {
  id: string;
  labelKh: string;
  labelEn: string;
  points: number;
}

export const CS_PENALTIES: CsPenalty[] = [
  { id: 'p_late', labelKh: 'យឺតយ៉ាវចូលការងារ', labelEn: 'Late arrival / Tardy', points: 5 },
  { id: 'p_absent', labelKh: 'អវត្តមានគ្មានច្បាប់អនុញ្ញាត', labelEn: 'Unexcused absence', points: 10 },
  { id: 'p_no_uniform', labelKh: 'មិនពាក់ឬពាក់ឯកសណ្ឋានការងារខុសការណែនាំ', labelEn: 'Improper/Missing uniform', points: 5 },
  { id: 'p_sleep', labelKh: 'គេងពេលកំពុងបំពេញតួនាទី (ធ្ងន់ធ្ងរ)', labelEn: 'Sleeping during duties (Severe)', points: 15 },
  { id: 'p_negligent', labelKh: 'ធ្វេសប្រហែសក្នុងការងារ ឬដឹកនាំការងារមិនស្អាត', labelEn: 'Negligent cleaning/Inattentiveness', points: 10 },
  { id: 'p_attitude', labelKh: 'អាកប្បកិរិយាមិនសមរម្យជាមួយសិស្ស អាណាព្យាបាល ឬបុគ្គលិកដទៃ', labelEn: 'Inappropriate communication with students/parents/staff', points: 10 }
];

export const getGradeDescription = (score: number, lang: 'kh' | 'en'): string => {
  if (score >= 95) return lang === 'kh' ? 'ល្អឥតខ្ចោះ' : 'Excellent';
  if (score >= 90) return lang === 'kh' ? 'ល្អណាស់' : 'Very Good';
  if (score >= 80) return lang === 'kh' ? 'ល្អ' : 'Good';
  if (score >= 70) return lang === 'kh' ? 'មធ្យម' : 'Fair';
  return lang === 'kh' ? 'ត្រូវកែលម្អ' : 'Needs Improvement';
};

export const getGradeColor = (grade: string): string => {
  if (grade === 'ល្អឥតខ្ចោះ' || grade === 'Excellent') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (grade === 'ល្អណាស់' || grade === 'Very Good') return 'text-teal-700 bg-teal-50 border-teal-200';
  if (grade === 'ល្អ' || grade === 'Good') return 'text-sky-700 bg-sky-50 border-sky-200';
  if (grade === 'មធ្យម' || grade === 'Fair') return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-rose-700 bg-rose-50 border-rose-250';
};

const DEFAULT_CS_EVALUATIONS: CleanerSecurityEvaluation[] = [
  {
    id: 'cs_1',
    staffName: 'ឈន់ ស្រីមុំ',
    role: 'Cleaner',
    month: '2026-06',
    dateEvaluated: '2026-06-22',
    scores: [19, 18, 19, 20, 20],
    penalties: [],
    totalScore: 96,
    grade: 'ល្អឥតខ្ចោះ',
    customPenaltiesText: ''
  },
  {
    id: 'cs_2',
    staffName: 'ម៉ៅ សុខា',
    role: 'Security',
    month: '2026-06',
    dateEvaluated: '2026-06-22',
    scores: [24, 25, 23, 23],
    penalties: ['p_late'],
    totalScore: 90,
    grade: 'ល្អណាស់',
    customPenaltiesText: 'មកយឺតម្តងក្នុងសប្តាហ៍ទី២'
  }
];


const DEFAULT_STAFF_TASKS: StaffTask[] = [
  {
    id: 'st_1',
    assignedDate: '2026-06-22',
    staffName: 'សុខ ដារ៉ា',
    position: 'IT Officer',
    taskToDo: 'ដំឡើង Printer ថ្មី GEP Room',
    deadline: '2026-06-25',
    status: 'InProgress',
    finishDate: '-',
    result: '-',
    supervisor: 'Manager',
    remark: '-'
  },
  {
    id: 'st_2',
    assignedDate: '2026-06-22',
    staffName: 'ស្រី មាលា',
    position: 'Admin Officer',
    taskToDo: 'រៀបចំឯកសារ Request Form',
    deadline: '2026-06-24',
    status: 'Completed',
    finishDate: '2026-06-23',
    result: 'ជោគជ័យ',
    supervisor: 'Manager',
    remark: '-'
  },
  {
    id: 'st_3',
    assignedDate: '2026-06-22',
    staffName: 'ចាន់ វិសាល',
    position: 'Maintenance',
    taskToDo: 'ជួសជុលទ្វារ Room 4B',
    deadline: '2026-06-26',
    status: 'Pending',
    finishDate: '-',
    result: '-',
    supervisor: 'Manager',
    remark: '-'
  }
];

const DEFAULT_WEEKLY_FOLLOWUPS: WeeklyStaffFollowup[] = [
  {
    id: 'wf_1',
    date: '2026-06-22',
    staffName: 'សុខ ដារ៉ា',
    taskDesc: 'ដំឡើង Printer',
    progressPercent: 60,
    challenge: 'រង់ចាំគ្រឿងបន្លាស់',
    solution: 'ទាក់ទង Supplier',
    expectedFinishDate: '2026-06-25'
  }
];

const DEFAULT_MONTHLY_EVALUATIONS: MonthlyStaffEvaluation[] = [
  {
    id: 'me_1',
    staffName: 'សុខ ដារ៉ា',
    totalTasks: 15,
    completedOnTime: 13,
    completedLate: 2,
    unfinished: 0,
    score: '90%'
  },
  {
    id: 'me_2',
    staffName: 'ស្រី មាលា',
    totalTasks: 20,
    completedOnTime: 19,
    completedLate: 1,
    unfinished: 0,
    score: '95%'
  }
];

const DEFAULT_TASKS: FollowupTask[] = [
  // 15 Completed tasks
  {
    id: 'tsk_1',
    dateRequest: '2026-06-01',
    issueRequest: 'រៀបចំប្រព័ន្ធធានារ៉ាប់រងសិស្សថ្នាក់ទី១២ សម្រាប់ឆមាសទី២',
    issueCategory: 'Student Insurance',
    location: 'ឆាករដ្ឋបាលជាន់ទី១',
    requestedBy: 'LOUNG Veasna (Admin Supervisor)',
    pic: 'Smart Insurance Broker',
    status: 'Completed',
    followupDate: '2026-06-05',
    remark: 'បានប្រមូល និងបញ្ជូនឯកសាររួចរាល់ កាតធានារ៉ាប់រងត្រូវបានចែកជូនសិស្ស'
  },
  {
    id: 'tsk_2',
    dateRequest: '2026-06-02',
    issueRequest: 'បញ្ជាទិញកាតសិស្សថ្មី និងស្រោមជ័រចំនួន ២៥០ ឈុត',
    issueCategory: 'Westec',
    location: 'ការិយាល័យអប់រំ',
    requestedBy: 'KONG Sreyneang (Director)',
    pic: 'Westec Supplier',
    status: 'Completed',
    followupDate: '2026-06-06',
    remark: 'ទំនិញបានដឹកមកដល់ និងផ្ទៀងផ្ទាត់ចំនួនជាមួយបញ្ជីរួចរាល់'
  },
  {
    id: 'tsk_3',
    dateRequest: '2026-06-03',
    issueRequest: 'ដំឡើងប្រព័ន្ធ WiFi Router បន្ថែមនៅបន្ទប់រៀន Grade 10A & 10B',
    issueCategory: 'Westec',
    location: 'អគារ B ជាន់ទី២',
    requestedBy: 'SOVANNAROTH (IT Support)',
    pic: 'IT Support Team',
    status: 'Completed',
    followupDate: '2026-06-05',
    remark: 'អ៊ីនធឺណិតដំណើរការល្បឿនលឿន និងមានស្ថិរភាពល្អ'
  },
  {
    id: 'tsk_4',
    dateRequest: '2026-06-04',
    issueRequest: 'បាញ់ថ្នាំមូសសម្លាប់សត្វល្អិតប្រចាំខែ មិថុនា',
    issueCategory: 'Other',
    location: 'ទូទាំងសាលា Chamkar Doung',
    requestedBy: 'LOUNG Veasna (Admin Supervisor)',
    pic: 'Admin Maintenance Team',
    status: 'Completed',
    followupDate: '2026-06-05',
    remark: 'បានបាញ់ថ្នាំរួចរាល់នៅថ្ងៃសៅរ៍ចុងសប្តាហ៍ ការពារគ្រុនឈាម'
  },
  {
    id: 'tsk_5',
    dateRequest: '2026-05-10',
    issueRequest: 'ផ្ទៀងផ្ទាត់បញ្ជីវត្តមានបុគ្គលិកផ្នែកអនាម័យសរុបប្រចាំខែឧសភា',
    issueCategory: 'Other',
    location: 'បន្ទប់រដ្ឋបាល',
    requestedBy: 'LOUNG Veasna',
    pic: 'Admin Team',
    status: 'Completed',
    followupDate: '2026-05-15',
    remark: 'បានចុះបញ្ជី និងបញ្ជូនទៅផ្នែកគណនេយ្យរួចរាល់'
  },
  {
    id: 'tsk_6',
    dateRequest: '2026-05-12',
    issueRequest: 'ពិនិត្យ និងជួសជុលម៉ាស៊ីនត្រជាក់ ថ្នាក់រៀន Grade 5B',
    issueCategory: 'Other',
    location: 'អគារ A ជាន់ទី៣',
    requestedBy: 'KONG Sreyneang (Director)',
    pic: 'AC Maintenance PIC',
    status: 'Completed',
    followupDate: '2026-05-14',
    remark: 'បានសម្អាតហ្វីលធ័រ និងបញ្ចូលហ្គាស ត្រជាក់ខ្លាំងល្អឡើងវិញ'
  },
  {
    id: 'tsk_7',
    dateRequest: '2026-05-15',
    issueRequest: 'ស្នើសុំតម្លើងសេវាប្រចាំខែ Smart Student Insurance ជូនសិស្សចំណូលថ្មី',
    issueCategory: 'Student Insurance',
    location: 'បន្ទប់ចុះឈ្មោះ',
    requestedBy: 'PICH Phyreak',
    pic: 'Smart Insurance Broker',
    status: 'Completed',
    followupDate: '2026-05-18',
    remark: 'សិស្សថ្មីទាំង ១៥ នាក់ ទទួលបានការធានារ៉ាប់រងពេញសិទ្ធិ'
  },
  {
    id: 'tsk_8',
    dateRequest: '2026-05-18',
    issueRequest: 'ជួសជុល និងតម្រឹមទីតាំងកាមេរ៉ា CCTV លេខ ០៤ និងលេចធ្លាយទឹកភ្លៀង',
    issueCategory: 'Other',
    location: 'របងខាងក្រោយអគារ C',
    requestedBy: 'SOVANNAROTH (IT Support)',
    pic: 'IT Support Team',
    status: 'Completed',
    followupDate: '2026-05-20',
    remark: 'បានស្រោបជ័រការពារជម្រាបទឹក និងតម្រឹមស៊ីមមុំមើលឃើញច្បាស់'
  },
  {
    id: 'tsk_9',
    dateRequest: '2026-05-20',
    issueRequest: 'ផ្លាស់ប្តូរតុស្តុកសៀវភៅបណ្ណាល័យដែលបាក់ជើង',
    issueCategory: 'Other',
    location: 'បណ្ណាល័យសាលា',
    requestedBy: 'Librarian Staff',
    pic: 'Carpentry PIC',
    status: 'Completed',
    followupDate: '2026-05-23',
    remark: 'ផ្លាស់ប្តូរតុឈើថ្មីរឹងមាំ និងមានផាសុកភាពសម្រាប់សិស្សមើលសៀវភៅ'
  },
  {
    id: 'tsk_10',
    dateRequest: '2026-05-22',
    issueRequest: 'បញ្ជាទិញសម្ភារៈពិសោធន៍ គីមីវិទ្យា និងរូបវិទ្យា សម្រាប់ទមែ្លងថ្នាក់ទី១២',
    issueCategory: 'Other',
    location: 'បន្ទប់ពិសោធន៍ជាន់ទី៤',
    requestedBy: 'Lab Assistant PIC',
    pic: 'Laboratory Supplies Co.',
    status: 'Completed',
    followupDate: '2026-05-28',
    remark: 'ទទួលបានសម្ភារៈពិសោធន៍គ្រប់ចំនួន និងរៀបចំទុកដាក់តាមទូត្រឹមត្រូវ'
  },
  {
    id: 'tsk_11',
    dateRequest: '2026-05-24',
    issueRequest: 'តម្លើងឧបករណ៍កំចាត់មេរោគ Air Purifier នៅបន្ទប់កុមារមត្តេយ្យ',
    issueCategory: 'Other',
    location: 'អគារ A ជាន់ផ្ទាល់ដី',
    requestedBy: 'Nurse Staff',
    pic: 'Admin Maintenance Team',
    status: 'Completed',
    followupDate: '2026-05-26',
    remark: 'ម៉ាស៊ីនដំណើរការ២៤ម៉ោង ដើម្បីធានាសុខភាពកុមារតូចៗ'
  },
  {
    id: 'tsk_12',
    dateRequest: '2026-05-26',
    issueRequest: 'សម្អាត និងលាងអាងស្តុកទឹកធំប្រចាំត្រីមាស',
    issueCategory: 'Other',
    location: 'ដំបូលអគារ B',
    requestedBy: 'LOUNG Veasna',
    pic: 'Water Quality Co.',
    status: 'Completed',
    followupDate: '2026-05-29',
    remark: 'លាងជម្រះបាតអាង លុបសារាយទឹក និងបាញ់ថ្នាំសម្លាប់មេរោគរួចរាល់'
  },
  {
    id: 'tsk_13',
    dateRequest: '2026-05-28',
    issueRequest: 'ទិញអាល់កុល ម៉ាស់ និងទឹកលាងដៃ សម្រាប់ប្រើប្រាស់នៅក្នុងសាលា',
    issueCategory: 'Other',
    location: 'បន្ទប់ស្តុកទូទៅ',
    requestedBy: 'Nurse Staff',
    pic: 'Medical Supply Shop',
    status: 'Completed',
    followupDate: '2026-05-30',
    remark: 'ទិញអាល់កុល ២០ប៊ីដុង និងម៉ាស់ ៥០ ប្រអប់ ស្តុកទុកប្រើប្រាស់រាល់ថ្ងៃ'
  },
  {
    id: 'tsk_14',
    dateRequest: '2026-05-30',
    issueRequest: 'ដំឡើងកុងតាក់ស្វ័យប្រវត្តិ (Timer Switch) សម្រាប់ភ្លើងលម្អនៅរបងសាលា',
    issueCategory: 'Other',
    location: 'ខ្លោងទ្វារខាងមុខ',
    requestedBy: 'LOUNG Veasna (Admin Supervisor)',
    pic: 'Electrician Staff',
    status: 'Completed',
    followupDate: '2026-06-02',
    remark: 'ភ្លើងបិទបើកស្វ័យប្រវត្តិតាមពេលវេលាកំណត់ (6:00 PM - 6:00 AM) សន្សំអគ្គិសនី'
  },
  {
    id: 'tsk_15',
    dateRequest: '2026-06-01',
    issueRequest: 'ធ្វើបច្ចុប្បន្នភាពបញ្ជីទ្រព្យសម្បត្តិថេរសម្រាប់ការិយាល័យអប់រំថ្មី',
    issueCategory: 'Other',
    location: 'ការិយាល័យរដ្ឋបាល',
    requestedBy: 'PICH Phyreak',
    pic: 'Admin Team',
    status: 'Completed',
    followupDate: '2026-06-04',
    remark: 'បានបិទកូដទ្រព្យសម្បត្តិ QR Code លើកៅអី តុ និងទូររួចរាល់ទាំងស្រុង'
  },

  // 3 In Progress tasks
  {
    id: 'tsk_16',
    dateRequest: '2026-06-15',
    issueRequest: 'ស្នើសុំទិញអាជ្ញាបណ្ណ Microsoft Office Professional Plus ជូនបុគ្គលិកថ្មី ២០ គណនី',
    issueCategory: 'Westec',
    location: 'បន្ទប់កុំព្យូទ័រជាន់ទី៣',
    requestedBy: 'KONG Sreyneang (Director)',
    pic: 'IT Support Team',
    status: 'InProgress',
    followupDate: '2026-06-25',
    remark: 'កំពុងស្នើសុំការអនុម័តថវិកាពីខាងគណនេយ្យកណ្តាល និងរៀបចំដំឡើងជាបន្តបន្ទាប់'
  },
  {
    id: 'tsk_17',
    dateRequest: '2026-06-18',
    issueRequest: 'ពិនិត្យឯកសារទាមទារសំណងធានារ៉ាប់រងករណីគ្រោះថ្នាក់សិស្ស Grade 8B',
    issueCategory: 'Student Insurance',
    location: 'ការិយាល័យចុះឈ្មោះ',
    requestedBy: 'PICH Phyreak',
    pic: 'Smart Insurance Broker',
    status: 'InProgress',
    followupDate: '2026-06-23',
    remark: 'កំពុងរង់ចាំវិក្កយបត្រថ្លៃព្យាបាលច្បាប់ដើមពីអាណាព្យាបាលសិស្ស ដើម្បីបំពេញទម្រង់បែបបទ'
  },
  {
    id: 'tsk_18',
    dateRequest: '2026-06-20',
    issueRequest: 'រៀបចំធ្វើកាតសម្គាល់ខ្លួនបុគ្គលិកចំណូលថ្មីខែមិថុនា ចំនួន ៨នាក់',
    issueCategory: 'Other',
    location: 'បន្ទប់រចនាកាត់កាត',
    requestedBy: 'LOUNG Veasna',
    pic: 'Admin Designer',
    status: 'InProgress',
    followupDate: '2026-06-24',
    remark: 'ថតរូបរួចរាល់ កំពុងរៀបចំ Layout និងដំណើរការបោះពុម្ពលើកាត PVC'
  },

  // 5 Pending tasks
  {
    id: 'tsk_19',
    dateRequest: '2026-06-10',
    issueRequest: 'ស៊ើបអង្កេតករណីខូចខាតកាសស្តាប់កូដកម្មវិធីនៅបន្ទប់ Lab ភាសា',
    issueCategory: 'Westec',
    location: 'អគារ A ជាន់ទី២',
    requestedBy: 'English Teacher Representative',
    pic: 'Westec Team',
    status: 'Pending',
    followupDate: '2026-06-26',
    remark: 'កំពុងទាក់ទងខាងបច្ចេកទេស Westec មកពិនិត្យខ្សែ និងរន្ធស្ដាប់សរុបទាំង ១០ គ្រឿង'
  },
  {
    id: 'tsk_20',
    dateRequest: '2026-06-12',
    issueRequest: 'ប្រមូលរូបថតសិស្សានុសិស្សចំណូលថ្មី ដើម្បីបំពេញទិន្នន័យធានារ៉ាប់រងវគ្គ២',
    issueCategory: 'Student Insurance',
    location: 'ផ្នែកកិច្ចការសិស្ស',
    requestedBy: 'PICH Phyreak',
    pic: 'Smart Insurance Broker',
    status: 'Pending',
    followupDate: '2026-06-28',
    remark: 'អាណាព្យាបាលខ្លះមិនទាន់បានបោះពុម្ពរូបថត 4x6 មកអោយការិយាល័យអប់រំនៅឡើយ'
  },
  {
    id: 'tsk_21',
    dateRequest: '2026-06-19',
    issueRequest: 'ជួសជុលសោរទ្វារបន្ទប់ទឹកស្រីជាន់ទី២ ចំនួន ២ បន្ទប់',
    issueCategory: 'Other',
    location: 'បន្ទប់ទឹកស្រីអគារ B',
    requestedBy: 'Cleaner Staff Lead',
    pic: 'Admin Maintenance Team',
    status: 'Pending',
    followupDate: '2026-06-22',
    remark: 'រង់ចាំទិញក្បាលសោរថ្មីមកពីផ្សារដើម្បីប្តូរជំនួស'
  },
  {
    id: 'tsk_22',
    dateRequest: '2026-06-20',
    issueRequest: 'ដំឡើងប្រព័ន្ធកាមេរ៉ា CCTV ថ្មីចំនួន ២ គ្រាប់ នៅក្បែរកន្លែងចតម៉ូតូបន្ថែម',
    issueCategory: 'Other',
    location: 'ចំណតម៉ូតូបុគ្គលិក',
    requestedBy: 'Security Lead',
    pic: 'IT Support Team',
    status: 'Pending',
    followupDate: '2026-06-24',
    remark: 'កំពុងស្នើសុំឡានជណ្តើរដើម្បីឡើើងម៉ោនខ្សែលើបង្គោលជញ្ជាំងខ្ពស់'
  },
  {
    id: 'tsk_23',
    dateRequest: '2026-06-21',
    issueRequest: 'រៀបចំឯកសារណែនាំសម្រាប់ដំណើរការចុះឈ្មោះវគ្គសិក្សាក្តៅប្រចាំពាក់កណ្តាលឆ្នាំ',
    issueCategory: 'Other',
    location: 'ការិយាល័យចុះឈ្មោះ',
    requestedBy: 'KONG Sreyneang (Director)',
    pic: 'Admin Team',
    status: 'Pending',
    followupDate: '2026-06-25',
    remark: 'កំពុងព្រាងមាតិកាណែនាំលើខិត្តប័ណ្ណដើម្បីចែកជូនអាណាព្យាបាល'
  },

  // 1 Cancelled task
  {
    id: 'tsk_24',
    dateRequest: '2026-05-15',
    issueRequest: 'ដំឡើងទូរទស្សន៍ស្មាត TV ទំហំ ៦៥ អ៊ីញ នៅការិយាល័យទទួលភ្ញៀវ',
    issueCategory: 'Other',
    location: 'ការិយាល័យជាន់ផ្ទាល់ដី',
    requestedBy: 'LOUNG Veasna',
    pic: 'Supplier Inc.',
    status: 'Cancelled',
    followupDate: '2026-05-18',
    remark: 'សម្រេចលុបចោលវិញដោយសារថ្នាក់ដឹកនាំចង់ប្រើប្រាស់ផ្ទាំង LED សម្រាប់ផ្សាយព័ត៌មានរួមវិញ'
  }
];

const DEFAULT_INSURANCE_RECORDS: InsuranceFollowupRecord[] = [
  {
    id: 'ins_1',
    dateIncident: '2026-06-02',
    studentName: 'សុខ ម៉ារី (Sok Mary)',
    gradeClass: 'Grade 10B',
    incidentDetails: 'ដួលម៉ូតូតាមផ្លូវទៅសាលារៀន បណ្តាលឲ្យរងរបួសជង្គង់ និងដៃស្តាំ',
    hospitalClinic: 'មន្ទីរពេទ្យព្រះកុសុមៈ (Kosamak Hospital)',
    insuranceClaimNo: 'INS-2026-9041',
    documentsSubmitted: 'វិក្កយបត្រ, រូបថតរបួស, សៀវភៅស្នាក់នៅ, លិខិតបញ្ជាក់សាលាច្បាប់ដើម',
    status: 'Completed',
    remark: 'ក្រុមហ៊ុនធានារ៉ាប់រងបានទូទាត់សំណងសរុប ១៥០$ រួចរាល់ជូនអាណាព្យាបាល'
  },
  {
    id: 'ins_2',
    dateIncident: '2026-06-12',
    studentName: 'គឹម ស៊ាង (Kim Seung)',
    gradeClass: 'Grade 11A',
    incidentDetails: 'រអិលដួលនៅអាងហែលទឹករបស់សាលា គ្រេចថ្លើមដៃខាងឆ្វេង',
    hospitalClinic: 'គ្លីនិកឯកជន រតនៈ (Ratanak Clinic)',
    insuranceClaimNo: 'INS-2026-9120',
    documentsSubmitted: 'កាតសិស្ស, លិខិតបញ្ជាក់ជំងឺ, វិក្កយបត្រសំរាកព្យាបាល',
    status: 'UnderReview',
    remark: 'ក្រុមហ៊ុនកំពុងត្រួតពិនិត្យភាពជាក់ស្តែងនៃការព្យាបាល និងរង់ចាំការវាយតម្លៃថវិកាសង'
  },
  {
    id: 'ins_3',
    dateIncident: '2026-06-15',
    studentName: 'ចាន់ ណារ៉េត (Chan Nareth)',
    gradeClass: 'Grade 8C',
    incidentDetails: 'លេងបាល់ទាត់ប៉ះទង្គិចគ្នា បណ្ដាលឲ្យបាក់ធ្មេញមុខចំនួន ១ គ្រាប់',
    hospitalClinic: 'មន្ទីរពហុព្យាបាលធ្មេញ សាកលវិទ្យាល័យ (University Dental)',
    insuranceClaimNo: 'INS-2026-9155',
    documentsSubmitted: 'កាតសិស្ស, រូបភាពធ្មេញមុន-ក្រោយជួសជុល',
    status: 'AdditionalDocRequired',
    remark: 'ក្រុមហ៊ុនតម្រូវឱ្យមានលិខិតបញ្ជាក់វេជ្ជបញ្ជាពីគ្រូពេទ្យធ្មេញច្បាប់ដើម និងវិក្កយបត្របង់ប្រាក់ពិតប្រាកដ'
  },
  {
    id: 'ins_4',
    dateIncident: '2026-06-18',
    studentName: 'លី ម៉េង (Ly Meng)',
    gradeClass: 'Grade 12A',
    incidentDetails: 'ក្តៅខ្លួនខ្លាំង ក្អួតចង្អោរ និងឈឺក្បាលត្រួតពិនិត្យនៅពេទ្យសង្គ្រោះបន្ទាន់',
    hospitalClinic: 'មន្ទីរពេទ្យកុមារជាតិ (National Pediatric Hospital)',
    insuranceClaimNo: 'INS-2026-9201',
    documentsSubmitted: 'មិនទាន់មានឯកសារ (រង់ចាំអាណាព្យាបាលយកមកដាក់ជូនសាលា)',
    status: 'PendingSubmission',
    remark: 'បានទាក់ទងទៅអាណាព្យាបាលដើម្បីយកឯកសារពេទ្យច្បាប់ដើមមកដាក់ជូនសាលាសម្របសម្រួល'
  },
  {
    id: 'ins_5',
    dateIncident: '2026-06-08',
    studentName: 'សេង ហុង (Seng Hong)',
    gradeClass: 'Grade 9B',
    incidentDetails: 'ត្រូវកញ្ចក់បង្អួចអាគារមុតម្រាមដៃពេលលេងដេញគ្នាក្នុងម៉ោងសម្រាក',
    hospitalClinic: 'មន្ទីរពេទ្យមិត្តភាពខ្មែរ-សូវៀត (Russian Hospital)',
    insuranceClaimNo: 'INS-2026-9088',
    documentsSubmitted: 'វិក្កយបត្រថ្លៃដេររបួស, រូបថតរបួស, លិខិតបញ្ជាក់វេជ្ជបញ្ជាពីពេទ្យ',
    status: 'Approved',
    remark: 'បានអនុម័តសំណងចំនួន ៧៥$ រង់ចាំការផ្ទេរប្រាក់ចូលគណនីធនាគាររបស់អាណាព្យាបាល'
  },
  {
    id: 'ins_6',
    dateIncident: '2025-11-28',
    studentName: 'ជា ស៊ីណា (Chea Sina)',
    gradeClass: 'Grade 12C',
    incidentDetails: 'ឈឺធ្មេញធម្មតា និងចង់ពត់ធ្មេញដើម្បីសាភ័ណភាព',
    hospitalClinic: 'គ្លីនិកធ្មេញ បាយ័ន (Bayon Dental)',
    insuranceClaimNo: 'INS-2026-8980',
    documentsSubmitted: 'វិក្កយបត្រពិនិត្យធ្មេញ',
    status: 'Rejected',
    remark: 'ការពិនិត្យជួសជុលធ្មេញសាភ័ណភាព (ពត់ធ្មេញ) មិនស្ថិតក្នុងលក្ខខណ្ឌធានារ៉ាប់រងគ្រោះថ្នាក់សាលាឡើយ'
  }
];

export default function TaskFollowupManager({ currentUser, lang = 'kh' }: TaskFollowupManagerProps) {
  // Sub-tab selection state: 'general', 'insurance', or new 'staff' (Staff task tracking)
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'insurance' | 'staff'>('general');

  // Load General Tasks from LocalStorage or default
  const [tasks, setTasks] = useState<FollowupTask[]>(() => {
    try {
      const saved = localStorage.getItem('wis_followup_tasks');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse followup tasks:', e);
    }
    return DEFAULT_TASKS;
  });

  // Load Student Insurance Followup Records from LocalStorage or default
  const [insuranceClaims, setInsuranceClaims] = useState<InsuranceFollowupRecord[]>(() => {
    try {
      const saved = localStorage.getItem('wis_insurance_followup_records');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse insurance followup records:', e);
    }
    return DEFAULT_INSURANCE_RECORDS;
  });

  // Load Staff Tasks from LocalStorage or default
  const [staffTasks, setStaffTasks] = useState<StaffTask[]>(() => {
    try {
      const saved = localStorage.getItem('wis_staff_tasks');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse staff tasks:', e);
    }
    return DEFAULT_STAFF_TASKS;
  });

  // Load Weekly Followups from LocalStorage or default
  const [weeklyFollowups, setWeeklyFollowups] = useState<WeeklyStaffFollowup[]>(() => {
    try {
      const saved = localStorage.getItem('wis_weekly_staff_followups');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse weekly followups:', e);
    }
    return DEFAULT_WEEKLY_FOLLOWUPS;
  });

  // Load Monthly Evaluations from LocalStorage or _default
  const [monthlyEvaluations, setMonthlyEvaluations] = useState<MonthlyStaffEvaluation[]>(() => {
    try {
      const saved = localStorage.getItem('wis_monthly_staff_evaluations');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse monthly evaluations:', e);
    }
    return DEFAULT_MONTHLY_EVALUATIONS;
  });

  // Share state managers
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // General Task form states
  const [isGeneralFormOpen, setIsGeneralFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  
  const [formDateRequest, setFormDateRequest] = useState('');
  const [formIssueRequest, setFormIssueRequest] = useState('');
  const [formIssueCategory, setFormIssueCategory] = useState('Westec');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formRequestedBy, setFormRequestedBy] = useState('');
  const [formPic, setFormPic] = useState('');
  const [formStatus, setFormStatus] = useState<FollowupTaskStatus>('Pending');
  const [formFollowupDate, setFormFollowupDate] = useState('');
  const [formRemark, setFormRemark] = useState('');

  // Student Insurance form states
  const [isInsuranceFormOpen, setIsInsuranceFormOpen] = useState(false);
  const [editingInsuranceId, setEditingInsuranceId] = useState<string | null>(null);
  const [deleteInsuranceId, setDeleteInsuranceId] = useState<string | null>(null);

  const [formInsDateIncident, setFormInsDateIncident] = useState('');
  const [formInsStudentName, setFormInsStudentName] = useState('');
  const [formInsGradeClass, setFormInsGradeClass] = useState('');
  const [formInsDetails, setFormInsDetails] = useState('');
  const [formInsHospitalClinic, setFormInsHospitalClinic] = useState('');
  const [formInsClaimNo, setFormInsClaimNo] = useState('');
  const [formInsDocsSubmitted, setFormInsDocsSubmitted] = useState('');
  const [formInsStatus, setFormInsStatus] = useState<InsuranceFollowupStatus>('UnderReview');
  const [formInsRemark, setFormInsRemark] = useState('');

  // Staff Task Form states
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [deleteStaffId, setDeleteStaffId] = useState<string | null>(null);

  const [formStAssignedDate, setFormStAssignedDate] = useState('');
  const [formStStaffName, setFormStStaffName] = useState('');
  const [formStPosition, setFormStPosition] = useState('');
  const [formStTaskToDo, setFormStTaskToDo] = useState('');
  const [formStDeadline, setFormStDeadline] = useState('');
  const [formStStatus, setFormStStatus] = useState<'Pending' | 'InProgress' | 'Completed' | 'Overdue' | 'OnHold'>('Pending');
  const [formStFinishDate, setFormStFinishDate] = useState('');
  const [formStResult, setFormStResult] = useState('');
  const [formStSupervisor, setFormStSupervisor] = useState('');
  const [formStRemark, setFormStRemark] = useState('');

  // Weekly Staff Followup Form states
  const [isWeeklyFormOpen, setIsWeeklyFormOpen] = useState(false);
  const [editingWeeklyId, setEditingWeeklyId] = useState<string | null>(null);
  const [deleteWeeklyId, setDeleteWeeklyId] = useState<string | null>(null);

  const [formWfDate, setFormWfDate] = useState('');
  const [formWfStaffName, setFormWfStaffName] = useState('');
  const [formWfTaskDesc, setFormWfTaskDesc] = useState('');
  const [formWfProgressPercent, setFormWfProgressPercent] = useState<number>(0);
  const [formWfChallenge, setFormWfChallenge] = useState('');
  const [formWfSolution, setFormWfSolution] = useState('');
  const [formWfExpectedFinishDate, setFormWfExpectedFinishDate] = useState('');

  // Monthly Staff Evaluation Form states
  const [isMonthlyFormOpen, setIsMonthlyFormOpen] = useState(false);
  const [editingMonthlyId, setEditingMonthlyId] = useState<string | null>(null);
  const [deleteMonthlyId, setDeleteMonthlyId] = useState<string | null>(null);

  const [formMeStaffName, setFormMeStaffName] = useState('');
  const [formMeTotalTasks, setFormMeTotalTasks] = useState<number>(0);
  const [formMeCompletedOnTime, setFormMeCompletedOnTime] = useState<number>(0);
  const [formMeCompletedLate, setFormMeCompletedLate] = useState<number>(0);
  const [formMeUnfinished, setFormMeUnfinished] = useState<number>(0);
  const [formMeScore, setFormMeScore] = useState('');

  // Cleaner/Security Evaluation Form states
  const [cleanerSecurityEvaluations, setCleanerSecurityEvaluations] = useState<CleanerSecurityEvaluation[]>(() => {
    try {
      const saved = localStorage.getItem('wis_cleaner_security_evaluations');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse CS evaluations:', e);
    }
    return DEFAULT_CS_EVALUATIONS;
  });

  const [isCsFormOpen, setIsCsFormOpen] = useState(false);
  const [editingCsId, setEditingCsId] = useState<string | null>(null);
  const [deleteCsId, setDeleteCsId] = useState<string | null>(null);

  const [formCsStaffName, setFormCsStaffName] = useState('');
  const [formCsRole, setFormCsRole] = useState<'Cleaner' | 'Security'>('Cleaner');
  const [formCsMonth, setFormCsMonth] = useState('2026-06');
  const [formCsDateEvaluated, setFormCsDateEvaluated] = useState('2026-06-22');
  const [formCsScores, setFormCsScores] = useState<number[]>([20, 20, 20, 20, 20]);
  const [formCsCriteriaComments, setFormCsCriteriaComments] = useState<string[]>([]);
  const [formCsCustomCriteria, setFormCsCustomCriteria] = useState<{ id: string; labelKh: string; labelEn: string; maxPoints: number; score: number }[]>([]);
  const [formCsPenalties, setFormCsPenalties] = useState<string[]>([]);
  const [formCsCustomPenaltiesText, setFormCsCustomPenaltiesText] = useState('');

  // Persists states
  useEffect(() => {
    localStorage.setItem('wis_followup_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('wis_insurance_followup_records', JSON.stringify(insuranceClaims));
  }, [insuranceClaims]);

  useEffect(() => {
    localStorage.setItem('wis_staff_tasks', JSON.stringify(staffTasks));
  }, [staffTasks]);

  useEffect(() => {
    localStorage.setItem('wis_weekly_staff_followups', JSON.stringify(weeklyFollowups));
  }, [weeklyFollowups]);

  useEffect(() => {
    localStorage.setItem('wis_monthly_staff_evaluations', JSON.stringify(monthlyEvaluations));
  }, [monthlyEvaluations]);

  useEffect(() => {
    localStorage.setItem('wis_cleaner_security_evaluations', JSON.stringify(cleanerSecurityEvaluations));
  }, [cleanerSecurityEvaluations]);

  // Reset filters when changing sub-tabs to keep table simple
  useEffect(() => {
    setSearchTerm('');
    setStatusFilter('All');
    setCategoryFilter('All');
  }, [activeSubTab]);

  const showNotice = (message: string) => {
    setShowNotification(message);
    setTimeout(() => {
      setShowNotification(null);
    }, 3000);
  };

  // Helper arrays for general categories
  const generalCategoryOptions = useMemo(() => {
    const list = new Set<string>();
    tasks.forEach(t => {
      if (t.issueCategory) list.add(t.issueCategory);
    });
    list.add('Westec');
    list.add('Student Insurance');
    list.add('Other');
    return Array.from(list).sort();
  }, [tasks]);

  // General statistics matching Dashboard requirements
  const generalStatistics = useMemo(() => {
    const counts = { Completed: 0, InProgress: 0, Pending: 0, FollowUp: 0, Cancelled: 0, Total: 0 };
    tasks.forEach(t => {
      counts.Total++;
      if (t.status === 'Completed') counts.Completed++;
      else if (t.status === 'InProgress') counts.InProgress++;
      else if (t.status === 'Pending') counts.Pending++;
      else if (t.status === 'FollowUp') counts.FollowUp++;
      else if (t.status === 'Cancelled') counts.Cancelled++;
    });
    return counts;
  }, [tasks]);

  // Insurance statistics matching requirements
  const insuranceStatistics = useMemo(() => {
    const counts = {
      PendingSubmission: 0,
      UnderReview: 0,
      AdditionalDocRequired: 0,
      Approved: 0,
      Rejected: 0,
      Completed: 0,
      Total: 0
    };
    insuranceClaims.forEach(c => {
      counts.Total++;
      if (c.status === 'PendingSubmission') counts.PendingSubmission++;
      else if (c.status === 'UnderReview') counts.UnderReview++;
      else if (c.status === 'AdditionalDocRequired') counts.AdditionalDocRequired++;
      else if (c.status === 'Approved') counts.Approved++;
      else if (c.status === 'Rejected') counts.Rejected++;
      else if (c.status === 'Completed') counts.Completed++;
    });
    return counts;
  }, [insuranceClaims]);

  // Staff Task live statistics calculation
  const staffStatistics = useMemo(() => {
    const total = staffTasks.length;
    const completed = staffTasks.filter(t => t.status === 'Completed').length;
    const inProgress = staffTasks.filter(t => t.status === 'InProgress').length;
    const pending = staffTasks.filter(t => t.status === 'Pending').length;
    const overdue = staffTasks.filter(t => t.status === 'Overdue').length;
    const onHold = staffTasks.filter(t => t.status === 'OnHold').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, pending, overdue, onHold, rate };
  }, [staffTasks]);

  // Filter lists
  const filteredGeneralTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = 
        t.issueRequest.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.pic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.remark.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' ? true : t.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' ? true : t.issueCategory === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    }).sort((a, b) => b.dateRequest.localeCompare(a.dateRequest));
  }, [tasks, searchTerm, statusFilter, categoryFilter]);

  const filteredInsuranceClaims = useMemo(() => {
    return insuranceClaims.filter(c => {
      const matchesSearch = 
        c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.gradeClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.incidentDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.hospitalClinic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.insuranceClaimNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.documentsSubmitted.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.remark && c.remark.toLowerCase().includes(searchTerm.toLowerCase() || ''));
      
      const matchesStatus = statusFilter === 'All' ? true : c.status === statusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => b.dateIncident.localeCompare(a.dateIncident));
  }, [insuranceClaims, searchTerm, statusFilter]);

  // Live filtering for Staff Tasks Section
  const filteredStaffTasks = useMemo(() => {
    return staffTasks.filter(t => {
      // Apply status filter if not 'All'
      const matchesStatus = statusFilter === 'All' ? true : t.status === statusFilter;
      if (!searchTerm) return matchesStatus;
      const term = searchTerm.toLowerCase();
      const matchesSearch = (
        t.staffName.toLowerCase().includes(term) ||
        t.position.toLowerCase().includes(term) ||
        t.taskToDo.toLowerCase().includes(term) ||
        t.supervisor.toLowerCase().includes(term) ||
        (t.remark && t.remark.toLowerCase().includes(term))
      );
      return matchesSearch && matchesStatus;
    }).sort((a, b) => b.assignedDate.localeCompare(a.assignedDate));
  }, [staffTasks, searchTerm, statusFilter]);

  const filteredWeeklyFollowups = useMemo(() => {
    return weeklyFollowups.filter(w => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        w.staffName.toLowerCase().includes(term) ||
        w.taskDesc.toLowerCase().includes(term) ||
        w.challenge.toLowerCase().includes(term) ||
        w.solution.toLowerCase().includes(term)
      );
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [weeklyFollowups, searchTerm]);

  const filteredMonthlyEvaluations = useMemo(() => {
    return monthlyEvaluations.filter(m => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return m.staffName.toLowerCase().includes(term);
    });
  }, [monthlyEvaluations, searchTerm]);

  // Event handlers for General Tasks Admin
  const handleOpenGeneralForm = (existing?: FollowupTask) => {
    if (existing) {
      setEditingTaskId(existing.id);
      setFormDateRequest(existing.dateRequest);
      setFormIssueRequest(existing.issueRequest);
      if (['Westec', 'Student Insurance', 'Other'].includes(existing.issueCategory)) {
        setFormIssueCategory(existing.issueCategory);
        setFormCustomCategory('');
      } else {
        setFormIssueCategory('Custom');
        setFormCustomCategory(existing.issueCategory);
      }
      setFormLocation(existing.location);
      setFormRequestedBy(existing.requestedBy);
      setFormPic(existing.pic);
      setFormStatus(existing.status);
      setFormFollowupDate(existing.followupDate);
      setFormRemark(existing.remark);
    } else {
      setEditingTaskId(null);
      const today = new Date().toISOString().split('T')[0];
      setFormDateRequest(today);
      setFormIssueRequest('');
      setFormIssueCategory('Westec');
      setFormCustomCategory('');
      setFormLocation('');
      setFormRequestedBy(currentUser?.fullName || currentUser?.username || 'LOUNG Veasna (Admin Supervisor)');
      setFormPic('');
      setFormStatus('Pending');
      setFormFollowupDate(today);
      setFormRemark('');
    }
    setIsGeneralFormOpen(true);
  };

  const handleSaveGeneralTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIssueRequest.trim() || !formLocation.trim() || !formRequestedBy.trim()) {
      alert(lang === 'kh' ? 'សូមបំពេញព័ត៌មានដែលចាំបាច់ឱ្យបានគ្រប់គ្រាន់!' : 'Please fill in all required fields!');
      return;
    }
    const finalCategory = formIssueCategory === 'Custom' ? formCustomCategory.trim() : formIssueCategory;
    if (!finalCategory) {
      alert(lang === 'kh' ? 'សូមបញ្ជាក់ប្រភេទការងារ!' : 'Please check category!');
      return;
    }

    if (editingTaskId) {
      const updated = tasks.map(t => {
        if (t.id === editingTaskId) {
          return {
            ...t,
            dateRequest: formDateRequest,
            issueRequest: formIssueRequest.trim(),
            issueCategory: finalCategory,
            location: formLocation.trim(),
            requestedBy: formRequestedBy.trim(),
            pic: formPic.trim() || 'Admin PIC',
            status: formStatus,
            followupDate: formFollowupDate,
            remark: formRemark.trim()
          };
        }
        return t;
      });
      setTasks(updated);
      showNotice(lang === 'kh' ? 'កែសម្រួលការងារទូទៅទទួលបានជោគជ័យ!' : 'General task updated!');
    } else {
      const newTask: FollowupTask = {
        id: `tsk_${Date.now()}`,
        dateRequest: formDateRequest,
        issueRequest: formIssueRequest.trim(),
        issueCategory: finalCategory,
        location: formLocation.trim(),
        requestedBy: formRequestedBy.trim(),
        pic: formPic.trim() || 'Admin PIC',
        status: formStatus,
        followupDate: formFollowupDate,
        remark: formRemark.trim(),
        createdBy: currentUser?.username || 'Admin'
      };
      setTasks([newTask, ...tasks]);
      showNotice(lang === 'kh' ? 'បានបន្ថែមការងារថ្មីដោយជោគជ័យ!' : 'New task added!');
    }
    setIsGeneralFormOpen(false);
  };

  const handleDeleteGeneralTask = () => {
    if (!deleteTaskId) return;
    setTasks(tasks.filter(t => t.id !== deleteTaskId));
    setDeleteTaskId(null);
    showNotice(lang === 'kh' ? 'បានលុបការងារប្រព័ន្ធរួចរាល់!' : 'General task removed!');
  };

  // Event handlers for Student Insurance Tasks
  const handleOpenInsuranceForm = (existing?: InsuranceFollowupRecord) => {
    if (existing) {
      setEditingInsuranceId(existing.id);
      setFormInsDateIncident(existing.dateIncident);
      setFormInsStudentName(existing.studentName);
      setFormInsGradeClass(existing.gradeClass);
      setFormInsDetails(existing.incidentDetails);
      setFormInsHospitalClinic(existing.hospitalClinic);
      setFormInsClaimNo(existing.insuranceClaimNo);
      setFormInsDocsSubmitted(existing.documentsSubmitted);
      setFormInsStatus(existing.status);
      setFormInsRemark(existing.remark || '');
    } else {
      setEditingInsuranceId(null);
      const today = new Date().toISOString().split('T')[0];
      setFormInsDateIncident(today);
      setFormInsStudentName('');
      setFormInsGradeClass('');
      setFormInsDetails('');
      setFormInsHospitalClinic('');
      setFormInsClaimNo('');
      setFormInsDocsSubmitted('');
      setFormInsStatus('PendingSubmission');
      setFormInsRemark('');
    }
    setIsInsuranceFormOpen(true);
  };

  const handleSaveInsuranceClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInsStudentName.trim() || !formInsGradeClass.trim() || !formInsDetails.trim()) {
      alert(lang === 'kh' ? 'សូមបំពេញព័ត៌មានដែលចាំបាច់ឱ្យបានគ្រប់គ្រាន់!' : 'Please fill in student name, class and details!');
      return;
    }

    if (editingInsuranceId) {
      const updated = insuranceClaims.map(c => {
        if (c.id === editingInsuranceId) {
          return {
            ...c,
            dateIncident: formInsDateIncident,
            studentName: formInsStudentName.trim(),
            gradeClass: formInsGradeClass.trim(),
            incidentDetails: formInsDetails.trim(),
            hospitalClinic: formInsHospitalClinic.trim() || '-',
            insuranceClaimNo: formInsClaimNo.trim() || '-',
            documentsSubmitted: formInsDocsSubmitted.trim() || '-',
            status: formInsStatus,
            remark: formInsRemark.trim()
          };
        }
        return c;
      });
      setInsuranceClaims(updated);
      showNotice(lang === 'kh' ? 'កែសម្រួលឯកសារធានារ៉ាប់រងបានសម្រេច!' : 'Insurance claim updated!');
    } else {
      const newClaim: InsuranceFollowupRecord = {
        id: `ins_${Date.now()}`,
        dateIncident: formInsDateIncident,
        studentName: formInsStudentName.trim(),
        gradeClass: formInsGradeClass.trim(),
        incidentDetails: formInsDetails.trim(),
        hospitalClinic: formInsHospitalClinic.trim() || '-',
        insuranceClaimNo: formInsClaimNo.trim() || '-',
        documentsSubmitted: formInsDocsSubmitted.trim() || 'មិនទាន់មាន (Pending)',
        status: formInsStatus,
        remark: formInsRemark.trim(),
        createdBy: currentUser?.username || 'Admin'
      };
      setInsuranceClaims([newClaim, ...insuranceClaims]);
      showNotice(lang === 'kh' ? 'បន្ថែមតាមដានធានារ៉ាប់រងសិស្សថ្មីរួចរាល់!' : 'New insurance claim tracking initiated!');
    }
    setIsInsuranceFormOpen(false);
  };

  const handleDeleteInsuranceClaim = () => {
    if (!deleteInsuranceId) return;
    setInsuranceClaims(insuranceClaims.filter(c => c.id !== deleteInsuranceId));
    setDeleteInsuranceId(null);
    showNotice(lang === 'kh' ? 'បានលុបការងារធានារ៉ាប់រងសិស្ស!' : 'Insurance claim tracker deleted!');
  };

  // Staff Task handlers
  const handleOpenStaffForm = (existing?: StaffTask) => {
    if (existing) {
      setEditingStaffId(existing.id);
      setFormStAssignedDate(existing.assignedDate);
      setFormStStaffName(existing.staffName);
      setFormStPosition(existing.position);
      setFormStTaskToDo(existing.taskToDo);
      setFormStDeadline(existing.deadline);
      setFormStStatus(existing.status);
      setFormStFinishDate(existing.finishDate);
      setFormStResult(existing.result);
      setFormStSupervisor(existing.supervisor);
      setFormStRemark(existing.remark);
    } else {
      setEditingStaffId(null);
      const today = new Date().toISOString().split('T')[0];
      setFormStAssignedDate(today);
      setFormStStaffName('');
      setFormStPosition('');
      setFormStTaskToDo('');
      setFormStDeadline(today);
      setFormStStatus('Pending');
      setFormStFinishDate('-');
      setFormStResult('-');
      setFormStSupervisor('Manager');
      setFormStRemark('-');
    }
    setIsStaffFormOpen(true);
  };

  const handleSaveStaffTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStStaffName.trim() || !formStTaskToDo.trim()) {
      alert(lang === 'kh' ? 'សូមបំពេញឈ្មោះបុគ្គលិក និងការងារដែលត្រូវធ្វើ!' : 'Please fill in staff name and task!');
      return;
    }

    if (editingStaffId) {
      setStaffTasks(prev => prev.map(t => t.id === editingStaffId ? {
        ...t,
        assignedDate: formStAssignedDate,
        staffName: formStStaffName.trim(),
        position: formStPosition.trim() || 'Staff',
        taskToDo: formStTaskToDo.trim(),
        deadline: formStDeadline,
        status: formStStatus,
        finishDate: formStFinishDate.trim() || '-',
        result: formStResult.trim() || '-',
        supervisor: formStSupervisor.trim() || 'Manager',
        remark: formStRemark.trim() || '-'
      } : t));
      showNotice(lang === 'kh' ? 'កែសម្រួលការងារបុគ្គលិកជោគជ័យ' : 'Staff task updated successfully');
    } else {
      const newTask: StaffTask = {
        id: 'st_' + Date.now(),
        assignedDate: formStAssignedDate,
        staffName: formStStaffName.trim(),
        position: formStPosition.trim() || 'Staff',
        taskToDo: formStTaskToDo.trim(),
        deadline: formStDeadline,
        status: formStStatus,
        finishDate: formStFinishDate.trim() || '-',
        result: formStResult.trim() || '-',
        supervisor: formStSupervisor.trim() || 'Manager',
        remark: formStRemark.trim() || '-'
      };
      setStaffTasks(prev => [newTask, ...prev]);
      showNotice(lang === 'kh' ? 'បន្ថែមការងារបុគ្គលិកជោគជ័យ' : 'Staff task added successfully');
    }
    setIsStaffFormOpen(false);
  };

  const handleDeleteStaffTask = () => {
    if (deleteStaffId) {
      setStaffTasks(prev => prev.filter(t => t.id !== deleteStaffId));
      setDeleteStaffId(null);
      showNotice(lang === 'kh' ? 'លុបការងារបុគ្គលិកបានសម្រេច' : 'Staff task removed successfully');
    }
  };

  // Weekly Staff Followup handlers
  const handleOpenWeeklyForm = (existing?: WeeklyStaffFollowup) => {
    if (existing) {
      setEditingWeeklyId(existing.id);
      setFormWfDate(existing.date);
      setFormWfStaffName(existing.staffName);
      setFormWfTaskDesc(existing.taskDesc);
      setFormWfProgressPercent(existing.progressPercent);
      setFormWfChallenge(existing.challenge);
      setFormWfSolution(existing.solution);
      setFormWfExpectedFinishDate(existing.expectedFinishDate);
    } else {
      setEditingWeeklyId(null);
      const today = new Date().toISOString().split('T')[0];
      setFormWfDate(today);
      setFormWfStaffName('');
      setFormWfTaskDesc('');
      setFormWfProgressPercent(0);
      setFormWfChallenge('');
      setFormWfSolution('');
      setFormWfExpectedFinishDate(today);
    }
    setIsWeeklyFormOpen(true);
  };

  const handleSaveWeeklyFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formWfStaffName.trim() || !formWfTaskDesc.trim()) {
      alert(lang === 'kh' ? 'សូមបំពេញឈ្មោះបុគ្គលិក និងការងារ!' : 'Please fill in staff name and task!');
      return;
    }

    if (editingWeeklyId) {
      setWeeklyFollowups(prev => prev.map(w => w.id === editingWeeklyId ? {
        ...w,
        date: formWfDate,
        staffName: formWfStaffName.trim(),
        taskDesc: formWfTaskDesc.trim(),
        progressPercent: formWfProgressPercent,
        challenge: formWfChallenge.trim() || '-',
        solution: formWfSolution.trim() || '-',
        expectedFinishDate: formWfExpectedFinishDate
      } : w));
      showNotice(lang === 'kh' ? 'កែសម្រួល Follow-up ជោគជ័យ' : 'Weekly followup updated successfully');
    } else {
      const newFollowup: WeeklyStaffFollowup = {
        id: 'wf_' + Date.now(),
        date: formWfDate,
        staffName: formWfStaffName.trim(),
        taskDesc: formWfTaskDesc.trim(),
        progressPercent: formWfProgressPercent,
        challenge: formWfChallenge.trim() || '-',
        solution: formWfSolution.trim() || '-',
        expectedFinishDate: formWfExpectedFinishDate
      };
      setWeeklyFollowups(prev => [newFollowup, ...prev]);
      showNotice(lang === 'kh' ? 'បន្ថែម Follow-up ជោគជ័យ' : 'Weekly followup added successfully');
    }
    setIsWeeklyFormOpen(false);
  };

  const handleDeleteWeeklyFollowup = () => {
    if (deleteWeeklyId) {
      setWeeklyFollowups(prev => prev.filter(w => w.id !== deleteWeeklyId));
      setDeleteWeeklyId(null);
      showNotice(lang === 'kh' ? 'លុបការងារប្រចាំសប្ដាហ៍រួចរាល់' : 'Weekly followup removed');
    }
  };

  // Monthly Evaluation handlers
  const handleOpenMonthlyForm = (existing?: MonthlyStaffEvaluation) => {
    if (existing) {
      setEditingMonthlyId(existing.id);
      setFormMeStaffName(existing.staffName);
      setFormMeTotalTasks(existing.totalTasks);
      setFormMeCompletedOnTime(existing.completedOnTime);
      setFormMeCompletedLate(existing.completedLate);
      setFormMeUnfinished(existing.unfinished);
      setFormMeScore(existing.score);
    } else {
      setEditingMonthlyId(null);
      setFormMeStaffName('');
      setFormMeTotalTasks(0);
      setFormMeCompletedOnTime(0);
      setFormMeCompletedLate(0);
      setFormMeUnfinished(0);
      setFormMeScore('100%');
    }
    setIsMonthlyFormOpen(true);
  };

  const handleMeTotalTasksChange = (valStr: string) => {
    const val = parseInt(valStr) || 0;
    setFormMeTotalTasks(val);
    const diff = val - (formMeCompletedOnTime + formMeCompletedLate);
    const calculatedUnfinished = diff > 0 ? diff : 0;
    setFormMeUnfinished(calculatedUnfinished);
    
    if (val > 0) {
      const score = Math.round(((formMeCompletedOnTime + formMeCompletedLate * 0.5) / val) * 100);
      setFormMeScore(score + '%');
    } else {
      setFormMeScore('0%');
    }
  };

  const handleMeCompletedOnTimeChange = (valStr: string) => {
    const val = parseInt(valStr) || 0;
    setFormMeCompletedOnTime(val);
    const calculatedTotal = val + formMeCompletedLate + formMeUnfinished;
    setFormMeTotalTasks(calculatedTotal);
    
    if (calculatedTotal > 0) {
      const score = Math.round(((val + formMeCompletedLate * 0.5) / calculatedTotal) * 100);
      setFormMeScore(score + '%');
    } else {
      setFormMeScore('0%');
    }
  };

  const handleMeCompletedLateChange = (valStr: string) => {
    const val = parseInt(valStr) || 0;
    setFormMeCompletedLate(val);
    const calculatedTotal = formMeCompletedOnTime + val + formMeUnfinished;
    setFormMeTotalTasks(calculatedTotal);
    
    if (calculatedTotal > 0) {
      const score = Math.round(((formMeCompletedOnTime + val * 0.5) / calculatedTotal) * 100);
      setFormMeScore(score + '%');
    } else {
      setFormMeScore('0%');
    }
  };

  const handleMeUnfinishedChange = (valStr: string) => {
    const val = parseInt(valStr) || 0;
    setFormMeUnfinished(val);
    const calculatedTotal = formMeCompletedOnTime + formMeCompletedLate + val;
    setFormMeTotalTasks(calculatedTotal);
    
    if (calculatedTotal > 0) {
      const score = Math.round(((formMeCompletedOnTime + formMeCompletedLate * 0.5) / calculatedTotal) * 100);
      setFormMeScore(score + '%');
    } else {
      setFormMeScore('0%');
    }
  };

  const handleSaveMonthlyEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMeStaffName.trim()) {
      alert(lang === 'kh' ? 'សូមបំពេញឈ្មោះបុគ្គលិក!' : 'Please fill in staff name!');
      return;
    }

    if (editingMonthlyId) {
      setMonthlyEvaluations(prev => prev.map(m => m.id === editingMonthlyId ? {
        ...m,
        staffName: formMeStaffName.trim(),
        totalTasks: formMeTotalTasks,
        completedOnTime: formMeCompletedOnTime,
        completedLate: formMeCompletedLate,
        unfinished: formMeUnfinished,
        score: formMeScore.trim() || '0%'
      } : m));
      showNotice(lang === 'kh' ? 'កែសម្រួលការវាយតម្លៃជោគជ័យ' : 'Monthly evaluation updated successfully');
    } else {
      const newEval: MonthlyStaffEvaluation = {
        id: 'me_' + Date.now(),
        staffName: formMeStaffName.trim(),
        totalTasks: formMeTotalTasks,
        completedOnTime: formMeCompletedOnTime,
        completedLate: formMeCompletedLate,
        unfinished: formMeUnfinished,
        score: formMeScore.trim() || '0%'
      };
      setMonthlyEvaluations(prev => [newEval, ...prev]);
      showNotice(lang === 'kh' ? 'បន្ថែមការវាយតម្លៃជោគជ័យ' : 'Monthly evaluation added successfully');
    }
    setIsMonthlyFormOpen(false);
  };

  const handleDeleteMonthlyEvaluation = () => {
    if (deleteMonthlyId) {
      setMonthlyEvaluations(prev => prev.filter(m => m.id !== deleteMonthlyId));
      setDeleteMonthlyId(null);
      showNotice(lang === 'kh' ? 'លុបការវាយតម្លៃបានជោគជ័យ' : 'Monthly evaluation removed');
    }
  };

  // Cleaner/Security evaluation handlers
  const handleOpenCsForm = (existing?: CleanerSecurityEvaluation) => {
    if (existing) {
      setEditingCsId(existing.id);
      setFormCsStaffName(existing.staffName);
      setFormCsRole(existing.role);
      setFormCsMonth(existing.month);
      setFormCsDateEvaluated(existing.dateEvaluated);
      setFormCsScores([...existing.scores]);
      setFormCsPenalties([...existing.penalties]);
      setFormCsCustomPenaltiesText(existing.customPenaltiesText || '');
      setFormCsCriteriaComments(existing.criteriaComments || []);
      setFormCsCustomCriteria(existing.customCriteria || []);
    } else {
      setEditingCsId(null);
      setFormCsStaffName('');
      setFormCsRole('Cleaner');
      setFormCsMonth(new Date().toISOString().substring(0, 7));
      setFormCsDateEvaluated(new Date().toISOString().split('T')[0]);
      setFormCsScores([20, 20, 20, 20, 20]);
      setFormCsPenalties([]);
      setFormCsCustomPenaltiesText('');
      setFormCsCriteriaComments([]);
      setFormCsCustomCriteria([]);
    }
    setIsCsFormOpen(true);
  };

  const handleCsRoleChange = (role: 'Cleaner' | 'Security') => {
    setFormCsRole(role);
    if (role === 'Cleaner') {
      setFormCsScores([20, 20, 20, 20, 20]);
    } else {
      setFormCsScores([25, 25, 25, 25]);
    }
    setFormCsCriteriaComments([]);
    setFormCsCustomCriteria([]);
  };

  const handleCsScoreValueChange = (index: number, valStr: string, maxPoints: number) => {
    const val = Math.min(maxPoints, Math.max(0, parseInt(valStr) || 0));
    setFormCsScores(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleCsCriteriaCommentChange = (index: number, text: string) => {
    setFormCsCriteriaComments(prev => {
      const next = [...prev];
      while (next.length <= index) {
        next.push('');
      }
      next[index] = text;
      return next;
    });
  };

  const handleAddCustomCriterion = () => {
    const defaultLabelsKh = ['លក្ខខណ្ឌបន្ថែមទី ១', 'លក្ខខណ្ឌបន្ថែមទី ២', 'លក្ខខណ្ឌបន្ថែមទី ៣'];
    const count = formCsCustomCriteria.length;
    const nextLabelKh = defaultLabelsKh[count] || `លក្ខខណ្ឌបន្ថែមទី ${count + 1}`;
    const nextLabelEn = `Custom Criterion ${count + 1}`;
    
    setFormCsCustomCriteria(prev => [
      ...prev,
      {
        id: 'cust_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        labelKh: nextLabelKh,
        labelEn: nextLabelEn,
        maxPoints: 20,
        score: 20
      }
    ]);
  };

  const handleRemoveCustomCriterion = (id: string) => {
    setFormCsCustomCriteria(prev => prev.filter(c => c.id !== id));
  };

  const handleCustomCriterionChange = (id: string, updates: Partial<{ labelKh: string; labelEn: string; maxPoints: number; score: number }>) => {
    setFormCsCustomCriteria(prev => prev.map(c => {
      if (c.id === id) {
        const next = { ...c, ...updates };
        if (updates.maxPoints !== undefined && next.score > updates.maxPoints) {
          next.score = updates.maxPoints;
        }
        return next;
      }
      return c;
    }));
  };

  const handleToggleCsPenalty = (penaltyId: string) => {
    setFormCsPenalties(prev => {
      if (prev.includes(penaltyId)) {
        return prev.filter(p => p !== penaltyId);
      } else {
        return [...prev, penaltyId];
      }
    });
  };

  const calculateCsTotalScore = (
    scores: number[], 
    penaltiesList: string[], 
    customCrits?: { maxPoints: number; score: number }[]
  ) => {
    const baseScoreSum = scores.reduce((sum, score) => sum + score, 0);
    const customScoreSum = customCrits?.reduce((sum, cc) => sum + cc.score, 0) || 0;
    
    const baseMaxSum = formCsRole === 'Cleaner' ? 100 : 100;
    const customMaxSum = customCrits?.reduce((sum, cc) => sum + cc.maxPoints, 0) || 0;
    
    const totalMax = baseMaxSum + customMaxSum;
    const totalAchieved = baseScoreSum + customScoreSum;
    
    const scaledScoreSum = totalMax > 0 ? (totalAchieved / totalMax) * 105 : 0; // Scale with robust max points
    const finalScaled = Math.min(100, Math.round((totalAchieved / totalMax) * 100));

    const penaltyPoints = penaltiesList.reduce((sum, pId) => {
      const penaltyObj = CS_PENALTIES.find(p => p.id === pId);
      return sum + (penaltyObj ? penaltyObj.points : 0);
    }, 0);
    
    return Math.max(0, finalScaled - penaltyPoints);
  };

  const handleSaveCsEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCsStaffName.trim()) {
      alert(lang === 'kh' ? 'សូមបំពេញឈ្មោះបុគ្គលិក!' : 'Please fill in staff name!');
      return;
    }

    const calculatedScore = calculateCsTotalScore(formCsScores, formCsPenalties, formCsCustomCriteria);
    const calculatedGrade = getGradeDescription(calculatedScore, 'kh');

    const evalData = {
      staffName: formCsStaffName.trim(),
      role: formCsRole,
      month: formCsMonth,
      dateEvaluated: formCsDateEvaluated,
      scores: [...formCsScores],
      penalties: [...formCsPenalties],
      totalScore: calculatedScore,
      grade: calculatedGrade,
      customPenaltiesText: formCsCustomPenaltiesText.trim(),
      criteriaComments: [...formCsCriteriaComments],
      customCriteria: [...formCsCustomCriteria]
    };

    if (editingCsId) {
      setCleanerSecurityEvaluations(prev => prev.map(c => c.id === editingCsId ? {
        ...c,
        ...evalData
      } : c));
      showNotice(lang === 'kh' ? 'កែសម្រួលពិន្ទុបុគ្គលិកជោគជ័យ' : 'Staff evaluation updated successfully');
    } else {
      const newEval: CleanerSecurityEvaluation = {
        id: 'cs_' + Date.now(),
        ...evalData
      };
      setCleanerSecurityEvaluations(prev => [newEval, ...prev]);
      showNotice(lang === 'kh' ? 'ការវាយតម្លៃពិន្ទុថ្មីត្រូវបានរក្សាទុក' : 'New staff evaluation has been recorded');
    }
    setIsCsFormOpen(false);
  };

  const handleDeleteCsEvaluation = () => {
    if (deleteCsId) {
      setCleanerSecurityEvaluations(prev => prev.filter(c => c.id !== deleteCsId));
      setDeleteCsId(null);
      showNotice(lang === 'kh' ? 'លុបការវាយតម្លៃពិន្ទុបានជោគជ័យ' : 'Evaluation removed');
    }
  };


  const getGeneralStatusDetails = (status: FollowupTaskStatus) => {
    switch (status) {
      case 'Completed':
        return {
          label: lang === 'kh' ? '🟢 បានបញ្ចប់' : 'Completed',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-250',
          dot: 'bg-emerald-500'
        };
      case 'InProgress':
        return {
          label: lang === 'kh' ? '🟡 កំពុងដំណើរការ' : 'In Progress',
          color: 'text-amber-700 bg-amber-50 border-amber-250',
          dot: 'bg-amber-400'
        };
      case 'Pending':
        return {
          label: lang === 'kh' ? '🔴 កំពុងរង់ចាំ' : 'Pending',
          color: 'text-rose-700 bg-rose-50 border-rose-200',
          dot: 'bg-rose-500'
        };
      case 'FollowUp':
        return {
          label: lang === 'kh' ? '🔵 ត្រូវតាមដានបន្ត' : 'Follow Up',
          color: 'text-sky-700 bg-sky-50 border-sky-200',
          dot: 'bg-sky-500'
        };
      case 'Cancelled':
        return {
          label: lang === 'kh' ? '⚫ លុបចោល' : 'Cancelled',
          color: 'text-slate-700 bg-slate-50 border-slate-200',
          dot: 'bg-slate-400'
        };
    }
  };

  const getInsuranceStatusDetails = (status: InsuranceFollowupStatus) => {
    switch (status) {
      case 'PendingSubmission':
        return {
          label: lang === 'kh' ? '🟡 មិនទាន់ដាក់ឯកសារ' : 'Pending Submission',
          color: 'text-amber-700 bg-amber-50 border-amber-250',
          dot: 'bg-amber-500'
        };
      case 'UnderReview':
        return {
          label: lang === 'kh' ? '🔵 កំពុងពិនិត្យ' : 'Under Review',
          color: 'text-sky-700 bg-sky-50 border-sky-200',
          dot: 'bg-sky-500'
        };
      case 'AdditionalDocRequired':
        return {
          label: lang === 'kh' ? '🟠 ត្រូវការឯកសារបន្ថែម' : 'Additional Docs Required',
          color: 'text-orange-700 bg-orange-50 border-orange-200',
          dot: 'bg-orange-400'
        };
      case 'Approved':
        return {
          label: lang === 'kh' ? '🟢 អនុម័ត' : 'Approved',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-250',
          dot: 'bg-emerald-500'
        };
      case 'Rejected':
        return {
          label: lang === 'kh' ? '🔴 បដិសេធ' : 'Rejected',
          color: 'text-rose-700 bg-rose-50 border-rose-250',
          dot: 'bg-rose-500'
        };
      case 'Completed':
        return {
          label: lang === 'kh' ? '🟢 បានទូទាត់រួចរាល់' : 'Completed/Paid',
          color: 'text-teal-700 bg-teal-50 border-teal-200',
          dot: 'bg-teal-500'
        };
    }
  };

  const getStaffStatusDetails = (status: StaffTask['status']) => {
    switch (status) {
      case 'Pending':
        return {
          label: lang === 'kh' ? '🔵 មិនទាន់ចាប់ផ្តើម' : 'Pending',
          color: 'text-sky-700 bg-sky-50 border-sky-200',
          dot: 'bg-sky-500'
        };
      case 'InProgress':
        return {
          label: lang === 'kh' ? '🟡 កំពុងធ្វើ' : 'In Progress',
          color: 'text-amber-700 bg-amber-50 border-amber-250',
          dot: 'bg-amber-400'
        };
      case 'Completed':
        return {
          label: lang === 'kh' ? '🟢 បញ្ចប់រួច' : 'Completed',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-250',
          dot: 'bg-emerald-500'
        };
      case 'Overdue':
        return {
          label: lang === 'kh' ? '🔴 ហួសកំណត់' : 'Overdue',
          color: 'text-rose-700 bg-rose-50 border-rose-250',
          dot: 'bg-rose-500'
        };
      case 'OnHold':
        return {
          label: lang === 'kh' ? '⚫ ផ្អាក' : 'On Hold',
          color: 'text-slate-700 bg-slate-50 border-slate-200',
          dot: 'bg-slate-400'
        };
    }
  };


  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-100 shadow-xs space-y-8 font-sans transition-all duration-300">
      
      {/* Toast Notice alerts */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 bg-slate-900 border border-slate-800 text-amber-300 font-black px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 z-50 text-xs"
          >
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>{showNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#052C2B] text-amber-300 rounded-2xl">
            <RefreshCw className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{lang === 'kh' ? 'ប្រព័ន្ធតាមដានការងារ (Follow-up Tracking System)' : 'WIS Follow-up Registries'}</span>
            </h2>
            <p className="text-xs text-slate-400 font-bold mt-1">
              {lang === 'kh' ? 'រៀបចំគ្រប់គ្រងការងារតាមដាន Westec ធានារ៉ាប់រងសិស្ស និងកិច្ចការទូទៅ' : 'Manage student accident insurance claims, Westec systems support, and structural events'}
            </p>
          </div>
        </div>

        {/* Buttons to print list or add items */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.print()}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-2xs active:scale-97 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>{lang === 'kh' ? 'បោះពុម្ពបញ្ជី' : 'Print Record'}</span>
          </button>
          
          <button
            onClick={() => {
              if (activeSubTab === 'general') handleOpenGeneralForm();
              else if (activeSubTab === 'insurance') handleOpenInsuranceForm();
              else handleOpenStaffForm();
            }}
            className="bg-[#052C2B] hover:bg-[#073B3A] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition duration-150 cursor-pointer shadow-xs active:scale-97 flex items-center gap-1.5"
          >
            <Plus className="w-4.5 h-4.5 stroke-[3]" />
            <span>
              {activeSubTab === 'general' 
                ? (lang === 'kh' ? 'បន្ថែមការងារទូទៅ' : 'Add Admin Task') 
                : activeSubTab === 'insurance'
                ? (lang === 'kh' ? 'បន្ថែមតាមដានធានារ៉ាប់រង' : 'Add Insurance Follow-up')
                : (lang === 'kh' ? 'បន្ថែមការងារបុគ្គលិក' : 'Add Staff Task')}
            </span>
          </button>
        </div>
      </div>

      {/* Sub tabs switches layout */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('general')}
          className={`px-5 py-3 text-xs sm:text-sm font-black tracking-wide border-b-2 transition duration-200 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'general'
              ? 'border-[#0d5c5a] text-[#0d5c5a] bg-emerald-50/20'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Layers className="w-4.5 h-4.5" />
          <span>{lang === 'kh' ? '១. តាមដានការងារទូទៅ (Westec, Insurance, Other)' : '1. General task Follow-up'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('insurance')}
          className={`px-5 py-3 text-xs sm:text-sm font-black tracking-wide border-b-2 transition duration-200 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'insurance'
              ? 'border-[#0d5c5a] text-[#0d5c5a] bg-emerald-50/20'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Shield className="w-4.5 h-4.5" />
          <span>{lang === 'kh' ? '២. តាមដានធានារ៉ាប់រងសិស្ស (Student Insurance Tracking)' : '2. Student Insurance Claims Tracker'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('staff')}
          className={`px-5 py-3 text-xs sm:text-sm font-black tracking-wide border-b-2 transition duration-200 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'staff'
              ? 'border-[#0d5c5a] text-[#0d5c5a] bg-emerald-50/20'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className="w-4.5 h-4.5" />
          <span>{lang === 'kh' ? '៣. តាមដានការងារបុគ្គលិក (Staff Task Tracking)' : '3. Staff Task Tracking'}</span>
        </button>
      </div>

      {/* RENDER TAB 1: GENERAL TASKS CONTENT */}
      {activeSubTab === 'general' && (
        <div className="space-y-8">
          
          {/* Dashboard statistics for General tasks */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4">
            
            {/* Summary Title Box */}
            <div className="col-span-2 sm:col-span-2 md:col-span-4 xl:col-span-2 bg-[#052C2B] text-emerald-100 p-5 rounded-3xl flex flex-col justify-between border border-emerald-500/20 shadow-xs">
              <div>
                <h3 className="text-amber-400 text-xs font-black tracking-wider uppercase">
                  {lang === 'kh' ? 'Dashboard សង្ខេបការងារទូទៅ' : 'Admin Task Dashboard'}
                </h3>
                <p className="text-[11px] leading-relaxed text-emerald-300/80 font-bold mt-1">
                  {lang === 'kh' ? 'លទ្ធផល និងស្ថានភាពតាមដានការងារ Westec និងការងាររដ្ឋបាលប្រព័ន្ធ' : 'Real-time analysis of administrative action logs and tickets.'}
                </p>
              </div>
              <div className="mt-4 flex items-baseline justify-between border-t border-emerald-800/50 pt-3">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                  {lang === 'kh' ? 'សំណើការងារសរុប (Total Request)' : 'Total Request'}
                </span>
                <span className="text-xl font-black text-white">{generalStatistics.Total}</span>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold text-emerald-800 uppercase">
                  {lang === 'kh' ? 'បានបញ្ចប់ (Completed)' : 'Completed'}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-950">{generalStatistics.Completed}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/50 px-1.5 py-0.5 rounded">
                  {generalStatistics.Total > 0 ? Math.round((generalStatistics.Completed / generalStatistics.Total) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-[11px] font-bold text-amber-800 uppercase">
                  {lang === 'kh' ? 'កំពុងដំណើរការ (In Progress)' : 'In Progress'}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-950">{generalStatistics.InProgress}</span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-100/50 px-1.5 py-0.5 rounded">
                  {generalStatistics.Total > 0 ? Math.round((generalStatistics.InProgress / generalStatistics.Total) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-rose-50/60 border border-rose-100 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-[11px] font-bold text-rose-800 uppercase">
                  {lang === 'kh' ? 'កំពុងរង់ចាំ (Pending)' : 'Pending'}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black text-[#6B0404]">{generalStatistics.Pending}</span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-100/50 px-1.5 py-0.5 rounded">
                  {generalStatistics.Total > 0 ? Math.round((generalStatistics.Pending / generalStatistics.Total) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Follow up & Cancelled unified block */}
            <div className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  {lang === 'kh' ? 'តាមដាន & លុបចោល' : 'FollowUp / Cancelled'}
                </span>
              </div>
              <div className="mt-2 text-xs font-bold text-slate-700 space-y-1">
                <div className="flex justify-between items-center bg-slate-100/70 p-1.5 rounded">
                  <span>🔵 FollowUp:</span>
                  <span className="font-black text-sky-800">{generalStatistics.FollowUp}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-150 p-1.5 rounded">
                  <span>⚫ Cancelled:</span>
                  <span className="font-black text-slate-800">{generalStatistics.Cancelled}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters controls block */}
          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder={lang === 'kh' ? 'ស្វែងរកតាម ឈ្មោះការងារ, ទីតាំង, អ្នកស្នើ ឬ PIC...' : 'Search by request details...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-[#0d5c5a] focus:ring-1 focus:ring-[#0d5c5a] rounded-xl pl-9.5 pr-4 py-2 text-xs font-bold text-slate-800 outline-hidden"
              />
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-[#0d5c5a] rounded-xl px-4 py-2 text-xs font-black text-slate-800 outline-hidden cursor-pointer"
              >
                <option value="All">{lang === 'kh' ? 'គ្រប់ប្រភេទការងារទាំងអស់' : 'All Work Types'}</option>
                {generalCategoryOptions.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'Westec' ? (lang === 'kh' ? 'ក្រុមហ៊ុនគាំទ្រ Westec' : 'Westec Supporting') : cat === 'Student Insurance' ? (lang === 'kh' ? 'ធានារ៉ាប់រងសិស្ស' : 'Student Insurance') : cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-[#0d5c5a] rounded-xl px-4 py-2 text-xs font-black text-slate-800 outline-hidden cursor-pointer"
              >
                <option value="All">{lang === 'kh' ? 'គ្រប់ស្ថានភាពទាំងអស់' : 'All Status Options'}</option>
                <option value="Completed">🟢 {lang === 'kh' ? 'បានបញ្ចប់ (Completed)' : 'Completed'}</option>
                <option value="InProgress">🟡 {lang === 'kh' ? 'កំពុងដំណើរការ (In Progress)' : 'In Progress'}</option>
                <option value="Pending">🔴 {lang === 'kh' ? 'កំពុងរង់ចាំ (Pending)' : 'Pending'}</option>
                <option value="FollowUp">🔵 {lang === 'kh' ? 'ត្រូវតាមដានបន្ត (Follow Up)' : 'Follow Up'}</option>
                <option value="Cancelled">⚫ {lang === 'kh' ? 'លុបចោល (Cancelled)' : 'Cancelled'}</option>
              </select>
            </div>
          </div>

          {/* General Database Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-3xs">
            <table className="w-full text-left border-collapse min-w-[1050px]">
              <thead>
                <tr className="bg-[#FAFBFB] border-b border-slate-100 text-[10px] uppercase font-black text-slate-500 tracking-wider">
                  <th className="py-4 px-4 text-center w-12">{lang === 'kh' ? 'ល.រ' : 'No.'}</th>
                  <th className="py-4 px-4 w-28">{lang === 'kh' ? 'កាលបរិច្ឆេទស្នើ' : 'Date Request'}</th>
                  <th className="py-4 px-5">{lang === 'kh' ? 'ការងារ / សេចក្តីស្នើ' : 'Issue / Request'}</th>
                  <th className="py-4 px-4 w-32">{lang === 'kh' ? 'ទីតាំង' : 'Location'}</th>
                  <th className="py-4 px-4 w-40">{lang === 'kh' ? 'អ្នកស្នើសុំ' : 'Request By'}</th>
                  <th className="py-4 px-4 w-40">{lang === 'kh' ? 'អ្នកទទួលការងារ' : 'Person in Charge (PIC)'}</th>
                  <th className="py-4 px-4 w-36 text-center">{lang === 'kh' ? 'ស្ថានភាព' : 'Status'}</th>
                  <th className="py-4 px-4 w-28 text-center">{lang === 'kh' ? 'ថ្ងៃតាមដាន' : 'Follow-up Date'}</th>
                  <th className="py-4 px-5 max-w-[200px]">{lang === 'kh' ? 'កំណត់សម្គាល់' : 'Remark'}</th>
                  <th className="py-4 px-4 text-center w-24 print:hidden">{lang === 'kh' ? 'សកម្មភាព' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                {filteredGeneralTasks.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-bold">
                      <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <span>{lang === 'kh' ? 'មិនមានការងារដែលត្រូវតាមដានឡើយ' : 'No tasks on followup matches your query'}</span>
                    </td>
                  </tr>
                ) : (
                  filteredGeneralTasks.map((task, index) => {
                    const sDetails = getGeneralStatusDetails(task.status);
                    const isOverdue = 
                      (task.status === 'Pending' || task.status === 'InProgress' || task.status === 'FollowUp') && 
                      new Date(task.followupDate) <= new Date();

                    return (
                      <tr key={task.id} className="hover:bg-slate-50/60 transition duration-150">
                        <td className="py-4 px-4 text-center text-slate-400 font-mono font-medium">
                          {index + 1}
                        </td>
                        <td className="py-4 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {task.dateRequest}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-850 font-extrabold leading-snug">
                              {task.issueRequest}
                            </span>
                            <span className="inline-flex max-w-fit items-center px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">
                              {task.issueCategory === 'Student Insurance' ? (lang === 'kh' ? 'ធានារ៉ាប់រងសិស្ស' : 'Student Insurance') : task.issueCategory}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600 font-semibold">{task.location}</td>
                        <td className="py-4 px-4 text-slate-600 font-bold whitespace-nowrap">{task.requestedBy}</td>
                        <td className="py-4 px-4 text-slate-500 font-semibold whitespace-nowrap">{task.pic}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border tracking-wide whitespace-nowrap ${sDetails.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sDetails.dot}`} />
                            <span>{sDetails.label}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            isOverdue 
                              ? 'bg-rose-100 text-rose-700 animate-pulse border border-rose-200' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {task.followupDate}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-500 font-medium max-w-[200px] break-words text-[11px] leading-relaxed">
                          {task.remark || '-'}
                        </td>
                        <td className="py-4 px-4 text-center print:hidden">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenGeneralForm(task)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-slate-200 bg-white rounded-lg transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTaskId(task.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-850 hover:bg-rose-50 border border-slate-200 bg-white rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
      )}

      {/* RENDER TAB 2: STUDENT INSURANCE FOLLOW-UP TRACKING */}
      {activeSubTab === 'insurance' && (
        <div className="space-y-8">
          
          {/* Dashboard statistics specific for Student Insurance Followup */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4">
            
            {/* Summary Title Box */}
            <div className="col-span-2 sm:col-span-2 md:col-span-4 xl:col-span-2 bg-[#052C2B] text-emerald-100 p-5 rounded-3xl flex flex-col justify-between border border-emerald-500/20 shadow-xs">
              <div>
                <h3 className="text-amber-400 text-xs font-black tracking-wider uppercase">
                  {lang === 'kh' ? 'Dashboard ធានារ៉ាប់រងសិស្ស' : 'Student Insurance Dashboard'}
                </h3>
                <p className="text-[11px] leading-relaxed text-emerald-300/80 font-bold mt-1">
                  {lang === 'kh' ? 'ស្ថានភាពតាមដានការទាមទារសំណងធានារ៉ាប់រងករណីគ្រោះថ្នាក់សិស្ស' : 'Follow up of student injury treatment packages, submissions, and payouts.'}
                </p>
              </div>
              <div className="mt-4 flex items-baseline justify-between border-t border-emerald-800/50 pt-3">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                  {lang === 'kh' ? 'ករណីគ្រោះថ្នាក់សរុប' : 'Total Claim Cases'}
                </span>
                <span className="text-xl font-black text-white">{insuranceStatistics.Total}</span>
              </div>
            </div>

            {/* Pending Submission */}
            <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[10px] font-bold text-amber-800">
                  {lang === 'kh' ? 'មិនទាន់ដាក់ឯកសារ' : 'Pending Submission'}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-950">{insuranceStatistics.PendingSubmission}</span>
                <span className="text-[10px] bg-amber-100/60 px-1.5 py-0.5 rounded text-amber-700">
                  {lang === 'kh' ? 'កំពុងរង់ចាំ' : 'Awaiting'}
                </span>
              </div>
            </div>

            {/* Under Review */}
            <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-[10px] font-bold text-sky-850">
                  {lang === 'kh' ? 'កំពុងពិនិត្យ' : 'Under Review'}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black text-sky-950">{insuranceStatistics.UnderReview}</span>
                <span className="text-[10px] bg-sky-100/60 px-1.5 py-0.5 rounded text-sky-750">
                  {insuranceClaims.length > 0 ? Math.round((insuranceStatistics.UnderReview / insuranceClaims.length) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Approved & Paid */}
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-800">
                  {lang === 'kh' ? 'អនុម័ត/ទូទាត់' : 'Approved & Paid'}
                </span>
              </div>
              <div className="mt-2 text-xs font-bold text-slate-750 space-y-1">
                <div className="flex justify-between items-center bg-emerald-100/30 px-1 rounded">
                  <span>🟢 Approved:</span>
                  <span className="font-extrabold">{insuranceStatistics.Approved}</span>
                </div>
                <div className="flex justify-between items-center bg-teal-100/30 px-1 rounded">
                  <span>🟢 Paid/Done:</span>
                  <span className="font-extrabold text-teal-800">{insuranceStatistics.Completed}</span>
                </div>
              </div>
            </div>

            {/* Failed Claims (Additional docs or rejected) */}
            <div className="bg-rose-50 border border-rose-100/80 p-4 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-[10px] font-bold text-rose-800">
                  {lang === 'kh' ? 'តម្រូវបន្ថែម/បដិសេធ' : 'Docs Req / Rejected'}
                </span>
              </div>
              <div className="mt-1 text-xs font-bold text-slate-750 space-y-1">
                <div className="flex justify-between items-center bg-orange-150 px-1 rounded">
                  <span>🟠 Add Docs:</span>
                  <span className="font-extrabold text-orange-700">{insuranceStatistics.AdditionalDocRequired}</span>
                </div>
                <div className="flex justify-between items-center bg-rose-150 px-1 rounded">
                  <span>🔴 Rejected:</span>
                  <span className="font-extrabold text-rose-800">{insuranceStatistics.Rejected}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters controls for insurance */}
          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder={lang === 'kh' ? 'ស្វែងរកតាម ឈ្មោះសិស្ស, ថ្នាក់, ព័ត៌មានលម្អិត, មន្ទីរពេទ្យ ឬ លេខឯកសារ...' : 'Search student claims by name, class, hospital, claim no...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-[#0d5c5a] focus:ring-1 focus:ring-[#0d5c5a] rounded-xl pl-9.5 pr-4 py-2 text-xs font-bold text-slate-800 outline-hidden"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-[#0d5c5a] rounded-xl px-4 py-2 text-xs font-black text-slate-800 outline-hidden cursor-pointer"
              >
                <option value="All">{lang === 'kh' ? 'គ្រប់ស្ថានភាពធានារ៉ាប់រងទាំងអស់' : 'All Claims status'}</option>
                <option value="PendingSubmission">🟡 {lang === 'kh' ? 'មិនទាន់ដាក់ឯកសារ (Pending Submission)' : 'Pending Submission'}</option>
                <option value="UnderReview">🔵 {lang === 'kh' ? 'កំពុងពិនិត្យ (Under Review)' : 'Under Review'}</option>
                <option value="AdditionalDocRequired">🟠 {lang === 'kh' ? 'ត្រូវការឯកសារបន្ថែម (Additional Docs)' : 'Additional Docs Required'}</option>
                <option value="Approved">🟢 {lang === 'kh' ? 'អនុម័ត (Approved)' : 'Approved'}</option>
                <option value="Rejected">🔴 {lang === 'kh' ? 'បដិសេធ (Rejected)' : 'Rejected'}</option>
                <option value="Completed">🟢 {lang === 'kh' ? 'បានទូទាត់រួចរាល់ (Completed)' : 'Completed/Paid'}</option>
              </select>
            </div>
          </div>

          {/* Student Insurance Claims Tracking Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-3xs">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-[#FAFBFB] border-b border-slate-100 text-[10px] uppercase font-black text-slate-500 tracking-wider">
                  <th className="py-4 px-4 text-center w-12">{lang === 'kh' ? 'ល.រ' : 'No.'}</th>
                  <th className="py-4 px-4 w-28">{lang === 'kh' ? 'ថ្ងៃគ្រោះថ្នាក់' : 'Date Incident'}</th>
                  <th className="py-4 px-5 w-44">{lang === 'kh' ? 'ឈ្មោះសិស្ស' : 'Student Name'}</th>
                  <th className="py-4 px-4 w-24 text-center">{lang === 'kh' ? 'ថ្នាក់/បន្ទប់' : 'Grade/Class'}</th>
                  <th className="py-4 px-5">{lang === 'kh' ? 'ព័ត៌មានលម្អិតគ្រោះថ្នាក់' : 'Incident Details'}</th>
                  <th className="py-4 px-4 w-44">{lang === 'kh' ? 'មន្ទីរពេទ្យ/គ្លីនិក' : 'Hospital/Clinic'}</th>
                  <th className="py-4 px-4 w-36 text-center">{lang === 'kh' ? 'លេខសំណុំរឿងធានា' : 'Insurance Claim No.'}</th>
                  <th className="py-4 px-5 w-44">{lang === 'kh' ? 'ឯកសារបានដាក់ជូន' : 'Documents Submitted'}</th>
                  <th className="py-4 px-4 w-38 text-center">{lang === 'kh' ? 'ស្ថានភាព' : 'Status'}</th>
                  <th className="py-4 px-5 max-w-[180px]">{lang === 'kh' ? 'កំណត់សម្គាល់' : 'Remark'}</th>
                  <th className="py-4 px-4 text-center w-24 print:hidden">{lang === 'kh' ? 'សកម្មភាព' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                {filteredInsuranceClaims.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400 font-bold">
                      <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <span>{lang === 'kh' ? 'មិនមានទិន្នន័យទាមទារសំណងធានារ៉ាប់រងសិស្សឡើយ' : 'No student injury claim following records'}</span>
                    </td>
                  </tr>
                ) : (
                  filteredInsuranceClaims.map((claim, idx) => {
                    const cDetails = getInsuranceStatusDetails(claim.status);
                    
                    return (
                      <tr key={claim.id} className="hover:bg-slate-50/60 transition duration-150">
                        <td className="py-4 px-4 text-center text-slate-400 font-mono font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-4 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {claim.dateIncident}
                        </td>
                        <td className="py-4 px-5 text-slate-900 font-black">
                          {claim.studentName}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="bg-emerald-50 text-[#0d5c5a] font-black border border-emerald-100 rounded px-2 py-0.5">
                            {claim.gradeClass}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-850 font-semibold leading-relaxed">
                          {claim.incidentDetails}
                        </td>
                        <td className="py-4 px-4 text-slate-600 font-medium">{claim.hospitalClinic}</td>
                        <td className="py-4 px-4 text-center font-mono text-slate-700 bg-slate-50 border-x border-slate-100 font-bold whitespace-nowrap">
                          {claim.insuranceClaimNo || '-'}
                        </td>
                        <td className="py-4 px-5 text-indigo-900 font-medium text-[11px] leading-snug">
                          {claim.documentsSubmitted}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border tracking-wide whitespace-nowrap ${cDetails.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cDetails.dot}`} />
                            <span>{cDetails.label}</span>
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-500 font-medium max-w-[180px] break-words text-[11px] leading-relaxed">
                          {claim.remark || '-'}
                        </td>
                        <td className="py-4 px-4 text-center print:hidden">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenInsuranceForm(claim)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-slate-200 bg-white rounded-lg transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteInsuranceId(claim.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-850 hover:bg-rose-50 border border-slate-200 bg-white rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
      )}

      {/* RENDER TAB 3: STAFF TASK TRACKING */}
      {activeSubTab === 'staff' && (
        <div className="space-y-8 animate-fade-in pb-12">
          
          {/* Dashboard សង្ខេបប្រចាំសប្ដាហ៍/ខែ (Weekly/Monthly Summary Dashboard) */}
          <div className="bg-white border text-slate-900 border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
              <div>
                <h3 className="text-slate-900 font-bold text-sm sm:text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  {lang === 'kh' ? 'Dashboard សង្ខេបប្រចាំសប្ដាហ៍/ខែ' : 'Weekly/Monthly Summary Dashboard'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  {lang === 'kh' ? 'សូចនាករវាស់វែងលទ្ធផលការងារបុគ្គលិក និងអត្រាបញ្ចប់ការងារសរុប' : 'Staff operational performance parameters, status counts, and KPIs.'}
                </p>
              </div>
              <span className="text-[10px] font-black uppercase text-[#0d5c5a] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin text-[#0d5c5a]/80" />
                {lang === 'kh' ? 'ធ្វើបច្ចុប្បន្នភាពផ្ទាល់' : 'Live Syncing'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              
              {/* Total Tasks Count */}
              <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {lang === 'kh' ? 'ការងារសរុប' : 'Total Tasks'}
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{staffStatistics.total}</div>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-2">
                  {lang === 'kh' ? 'កិច្ចការចាត់តាំង' : 'Assigned tasks'}
                </p>
              </div>

              {/* Completed Tasks Count */}
              <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                    {lang === 'kh' ? 'បញ្ចប់រួច' : 'Completed'}
                  </span>
                  <div className="text-2xl font-black text-emerald-950 mt-1">{staffStatistics.completed}</div>
                </div>
                <span className="text-[10px] w-fit text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded font-black mt-2">
                  {lang === 'kh' ? 'ជោគជ័យ' : 'Success'}
                </span>
              </div>

              {/* In Progress Tasks Count */}
              <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                    {lang === 'kh' ? 'កំពុងធ្វើ' : 'In Progress'}
                  </span>
                  <div className="text-2xl font-black text-amber-950 mt-1">{staffStatistics.inProgress}</div>
                </div>
                <p className="text-[10px] text-amber-600 font-bold mt-2">
                  {lang === 'kh' ? 'កំពុងដំណើរការ' : 'Active ongoing'}
                </p>
              </div>

              {/* Pending Tasks Count */}
              <div className="bg-blue-50/40 border border-blue-100 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-800">
                    {lang === 'kh' ? 'មិនទាន់ចាប់ផ្តើម' : 'Pending'}
                  </span>
                  <div className="text-2xl font-black text-blue-900 mt-1">{staffStatistics.pending}</div>
                </div>
                <p className="text-[10px] text-blue-500 font-semibold mt-2">
                  {lang === 'kh' ? 'រង់ចាំអនុវត្ត' : 'Awaiting start'}
                </p>
              </div>

              {/* Overdue Tasks Count */}
              <div className="bg-rose-50/40 border border-rose-100 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-800">
                    {lang === 'kh' ? 'ហួសកំណត់' : 'Overdue'}
                  </span>
                  <div className="text-2xl font-black text-rose-900 mt-1">{staffStatistics.overdue}</div>
                </div>
                <span className="text-[10px] w-fit text-rose-700 bg-rose-100/40 px-1.5 py-0.5 rounded font-bold mt-2">
                  {lang === 'kh' ? 'យឺតយ៉ាវ' : 'Late'}
                </span>
              </div>

              {/* Completion Rate KPI */}
              <div className="bg-[#052C2B] text-white p-4 rounded-xl flex flex-col justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                    {lang === 'kh' ? 'អត្រាបញ្ចប់ (%)' : 'Completion Rate'}
                  </span>
                  <div className="text-2xl font-black text-white mt-1">{staffStatistics.rate}%</div>
                </div>
                <div className="w-full bg-emerald-950 h-2.5 rounded-full overflow-hidden mt-3 border border-emerald-800/40">
                  <div 
                    className="bg-emerald-400 h-full transition-all duration-550" 
                    style={{ width: `${staffStatistics.rate}%` }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 1: តារាងតាមដានការងារបុគ្គលិក (Staff Task Tracking Table) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <h3 className="text-slate-900 font-bold text-sm sm:text-base flex items-center gap-2">
                  <Layers className="w-4.5 h-4.5 text-[#0d5c5a]" />
                  {lang === 'kh' ? 'តារាងតាមដានការងារបុគ្គលិក' : 'Staff Task Management Table'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  {lang === 'kh' ? 'តាមដានសកម្មភាពការងារចាត់តាំងរបស់បុគ្គលិក WIS ប្រចាំថ្ងៃ និងកាលបរិច្ឆេទបញ្ចប់' : 'Daily operational task lists assigned to staff with statuses, checkups, and outputs.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 self-stretch lg:self-auto justify-between sm:justify-start">
                {/* Status Legend Indicator summary box */}
                <span className="text-[10.5px] font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="font-extrabold text-slate-400">{lang === 'kh' ? 'ស្ថានភាព៖' : 'Statuses:'}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Pending</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> In Progress</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Overdue</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500" /> On Hold</span>
                </span>

                <button
                  onClick={() => handleOpenStaffForm()}
                  className="bg-[#0d5c5a] hover:bg-[#0b4d4b] text-white font-extrabold text-[11px] px-4 py-2.5 rounded-xl transition duration-150 cursor-pointer shadow-xs active:scale-97 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{lang === 'kh' ? 'បន្ថែមការងារបុគ្គលិក' : 'Add Staff Task'}</span>
                </button>
              </div>
            </div>

            {/* Table layout */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[#0d5c5a] font-bold">
                    <th className="py-3 px-3.5 text-center w-12">{lang === 'kh' ? 'ល.រ' : 'No.'}</th>
                    <th className="py-3 px-3.5">{lang === 'kh' ? 'កាលបរិច្ឆេទដាក់ការងារ' : 'Date Assigned'}</th>
                    <th className="py-3 px-4">{lang === 'kh' ? 'ឈ្មោះបុគ្គលិក' : 'Staff Name'}</th>
                    <th className="py-3 px-3.5">{lang === 'kh' ? 'មុខតំណែង' : 'Position'}</th>
                    <th className="py-3 px-5 whitespace-normal min-w-[220px]">{lang === 'kh' ? 'ការងារដែលត្រូវធ្វើ' : 'Task Detail'}</th>
                    <th className="py-3 px-3.5">{lang === 'kh' ? 'ថ្ងៃកំណត់' : 'Deadline'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'kh' ? 'ស្ថានភាព' : 'Status'}</th>
                    <th className="py-3 px-3.5">{lang === 'kh' ? 'កាលបរិច្ឆេទបញ្ចប់' : 'Finish Date'}</th>
                    <th className="py-3 px-3.5">{lang === 'kh' ? 'លទ្ធផល' : 'Result'}</th>
                    <th className="py-3 px-3.5">{lang === 'kh' ? 'អ្នកត្រួតពិនិត្យ' : 'Supervisor'}</th>
                    <th className="py-3 px-4">{lang === 'kh' ? 'កំណត់សម្គាល់' : 'Remark'}</th>
                    <th className="py-3 px-4 text-center print:hidden w-24">{lang === 'kh' ? 'សកម្មភាព' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaffTasks.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center font-bold text-slate-400">
                        {lang === 'kh' ? 'មិនមានទិន្នន័យការងារបុគ្គលិកទេ' : 'No staff tasks found matching criteria.'}
                      </td>
                    </tr>
                  ) : (
                    filteredStaffTasks.map((task, index) => {
                      const sDetails = getStaffStatusDetails(task.status);
                      return (
                        <tr key={task.id} className="hover:bg-slate-50/50 bg-white transition duration-100">
                          <td className="py-3.5 px-3.5 text-center text-slate-400 font-black">{index + 1}</td>
                          <td className="py-3.5 px-3.5 text-slate-500 font-medium">{task.assignedDate}</td>
                          <td className="py-3.5 px-4 font-black text-slate-900">{task.staffName}</td>
                          <td className="py-3.5 px-3.5">
                            <span className="bg-slate-100 border border-slate-200/50 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-slate-600">
                              {task.position}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 font-bold text-slate-800 whitespace-normal leading-relaxed">{task.taskToDo}</td>
                          <td className="py-3.5 px-3.5 text-rose-700 font-black">{task.deadline}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold border tracking-wide ${sDetails.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sDetails.dot}`} />
                              <span>{sDetails.label}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5 font-semibold text-slate-500">{task.finishDate}</td>
                          <td className="py-3.5 px-3.5">
                            <span className={`font-bold ${task.result === 'ជោគជ័យ' || task.result.toLowerCase() === 'success' || task.result === 'បញ្ចប់' ? 'text-emerald-600' : 'text-slate-500'}`}>
                              {task.result}
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5 text-slate-600 font-medium">{task.supervisor}</td>
                          <td className="py-3.5 px-4 text-slate-400 font-medium max-w-[150px] truncate" title={task.remark}>
                            {task.remark}
                          </td>
                          <td className="py-3.5 px-4 text-center print:hidden">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenStaffForm(task)}
                                className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-slate-200 bg-white rounded-lg transition"
                                title={lang === 'kh' ? 'កែសម្រួល' : 'Edit'}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteStaffId(task.id)}
                                className="p-1.5 text-rose-600 hover:text-rose-850 hover:bg-rose-55 border border-slate-200 bg-white rounded-lg transition"
                                title={lang === 'kh' ? 'លុប' : 'Delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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

          {/* SECTION 2: តារាង Follow-up ប្រចាំសប្ដាហ៍ (Weekly Follow-up Table) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <h3 className="text-slate-900 font-bold text-sm sm:text-base flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-[#0d5c5a]" />
                  {lang === 'kh' ? 'តារាង Follow-up ប្រចាំសប្ដាហ៍' : 'Weekly Review & Impediments Tracking'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  {lang === 'kh' ? 'ការវិនិត្យវឌ្ឍនភាពការងារ ប្រឈមនឹងដំណោះស្រាយរារាំងក្នុងសប្ដាហ៍' : 'Weekly task evolution, process progress metric %, impediments and mitigation strategies.'}
                </p>
              </div>

              <button
                onClick={() => handleOpenWeeklyForm()}
                className="bg-[#052C2B] hover:bg-[#073B3A] text-white font-extrabold text-[11px] px-4 py-2.5 rounded-xl transition duration-150 cursor-pointer shadow-xs active:scale-97 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>{lang === 'kh' ? 'បន្ថែមការកត់ត្រាសប្ដាហ៍' : 'Add Weekly Review'}</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[#0d5c5a] font-bold">
                    <th className="py-3 px-3.5 text-center w-12">{lang === 'kh' ? 'ល.រ' : 'No.'}</th>
                    <th className="py-3 px-4">{lang === 'kh' ? 'កាលបរិច្ឆេទ' : 'Date'}</th>
                    <th className="py-3 px-4">{lang === 'kh' ? 'ឈ្មោះបុគ្គលិក' : 'Staff Name'}</th>
                    <th className="py-3 px-4 whitespace-normal min-w-[200px]">{lang === 'kh' ? 'ការងារ' : 'Task Description'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'kh' ? 'វឌ្ឍនភាព (Progress)' : 'Progress (%)'}</th>
                    <th className="py-3 px-5 whitespace-normal min-w-[180px]">{lang === 'kh' ? 'បញ្ហាប្រឈម' : 'Challenges'}</th>
                    <th className="py-3 px-5 whitespace-normal min-w-[180px]">{lang === 'kh' ? 'ដំណោះស្រាយ' : 'Solutions'}</th>
                    <th className="py-3 px-4">{lang === 'kh' ? 'ថ្ងៃបញ្ចប់រំពឹងទុក' : 'Expected Finish Date'}</th>
                    <th className="py-3 px-4 text-center print:hidden w-24">{lang === 'kh' ? 'សកម្មភាព' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWeeklyFollowups.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center font-bold text-slate-400">
                        {lang === 'kh' ? 'មិនមានសកម្មភាព Follow-up ទេ' : 'No weekly followups found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredWeeklyFollowups.map((wf, index) => (
                      <tr key={wf.id} className="hover:bg-slate-50/50 bg-white transition duration-100">
                        <td className="py-3.5 px-3.5 text-center text-slate-400 font-black">{index + 1}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">{wf.date}</td>
                        <td className="py-3.5 px-4 font-black text-slate-900">{wf.staffName}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-normal leading-relaxed">{wf.taskDesc}</td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center gap-2.5 justify-center">
                            <span className="font-mono text-xs font-black text-[#0d5c5a]">{wf.progressPercent}%</span>
                            <div className="w-16 bg-slate-150 h-2 rounded-full overflow-hidden border border-slate-200">
                              <div className="bg-[#0b5c58] h-full rounded-full transition-all duration-300" style={{ width: `${wf.progressPercent}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-bold text-rose-700 whitespace-normal leading-relaxed">{wf.challenge}</td>
                        <td className="py-3.5 px-5 font-bold text-[#0d5c5a] whitespace-normal leading-relaxed">{wf.solution}</td>
                        <td className="py-3.5 px-3 font-black text-amber-700">{wf.expectedFinishDate}</td>
                        <td className="py-3.5 px-4 text-center print:hidden">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenWeeklyForm(wf)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-slate-200 bg-white rounded-lg transition"
                              title={lang === 'kh' ? 'កែសម្រួល' : 'Edit'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteWeeklyId(wf.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-850 hover:bg-rose-55 border border-slate-200 bg-white rounded-lg transition"
                              title={lang === 'kh' ? 'លុប' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: ការវាយតម្លៃការងារបុគ្គលិកប្រចាំខែ (Monthly Staff Performance Evaluation Table) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <h3 className="text-slate-900 font-bold text-sm sm:text-base flex items-center gap-2">
                  <User className="w-4.5 h-4.5 text-[#0d5c5a]" />
                  {lang === 'kh' ? 'ការវាយតម្លៃការងារបុគ្គលិកប្រចាំខែ' : 'Monthly Staff Performance Evaluation (KPI)'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  {lang === 'kh' ? 'ពិន្ទុសមិទ្ធផលការងារប្រចាំខែ បញ្ចប់ទាន់ពេល បញ្ចប់យឺតយ៉ាវ និងសរុបកិច្ចដំណើរការ' : 'Staff evaluation cards, total tasks accomplishment rate on-time vs late, final score rating %.'}
                </p>
              </div>

              <button
                onClick={() => handleOpenMonthlyForm()}
                className="bg-[#052C2B] hover:bg-[#073B3A] text-white font-extrabold text-[11px] px-4 py-2.5 rounded-xl transition duration-150 cursor-pointer shadow-xs active:scale-97 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>{lang === 'kh' ? 'បន្ថែមការវាយតម្លៃប្រចាំខែ' : 'Add Monthly KPI'}</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[#0d5c5a] font-bold">
                    <th className="py-3 px-3.5 text-center w-12">{lang === 'kh' ? 'ល.រ' : 'No.'}</th>
                    <th className="py-3 px-5">{lang === 'kh' ? 'ឈ្មោះបុគ្គលិក' : 'Staff Name'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'kh' ? 'ការងារសរុប' : 'Total Tasks'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'kh' ? 'បញ្ចប់ទាន់ពេល' : 'Completed On Time'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'kh' ? 'បញ្ចប់យឺត' : 'Completed Late'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'kh' ? 'មិនទាន់បញ្ចប់' : 'Unfinished'}</th>
                    <th className="py-3 px-5 text-center">{lang === 'kh' ? 'ពិន្ទុ (Score)' : 'Score (%)'}</th>
                    <th className="py-3 px-4 text-center print:hidden w-24">{lang === 'kh' ? 'សកម្មភាព' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMonthlyEvaluations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center font-bold text-slate-400">
                        {lang === 'kh' ? 'មិនទាន់មានការវាយតម្លៃទេ' : 'No monthly staff evaluations found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredMonthlyEvaluations.map((me, index) => (
                      <tr key={me.id} className="hover:bg-slate-50/50 bg-white transition duration-100">
                        <td className="py-4 px-3.5 text-center text-slate-400 font-black">{index + 1}</td>
                        <td className="py-4 px-5 font-black text-slate-900 text-sm">{me.staffName}</td>
                        <td className="py-4 px-4 text-center text-slate-700 font-bold text-sm bg-slate-50/30">{me.totalTasks}</td>
                        <td className="py-4 px-4 text-center text-emerald-600 font-extrabold text-sm">{me.completedOnTime}</td>
                        <td className="py-4 px-4 text-center text-amber-600 font-bold text-sm">{me.completedLate}</td>
                        <td className="py-4 px-4 text-center text-rose-500 font-bold text-sm">{me.unfinished}</td>
                        <td className="py-4 px-5 text-center">
                          <span className="bg-emerald-50 text-[#0d5c5a] border border-emerald-100 rounded-lg px-3 py-1 font-black text-xs">
                            {me.score}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center print:hidden">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenMonthlyForm(me)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-slate-200 bg-white rounded-lg transition"
                              title={lang === 'kh' ? 'កែសម្រួល' : 'Edit'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteMonthlyId(me.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-850 hover:bg-rose-55 border border-slate-200 bg-white rounded-lg transition"
                              title={lang === 'kh' ? 'លុប' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4: ពិន្ទុនិងការវាយតម្លៃសេវាកម្មបុគ្គលិក (Cleaner & Security KPI) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
              <div>
                <h3 className="text-slate-900 font-bold text-sm sm:text-base flex items-center gap-2">
                  <Shield className="w-4.5 h-4.5 text-[#0d5c5a]" />
                  {lang === 'kh' ? 'ពិន្ទុ និងការវាយតម្លៃសេវាកម្មបុគ្គលិក (Cleaner & Security KPI)' : 'Cleaner & Security Operational Performance (KPI)'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  {lang === 'kh' ? 'ការវាស់ស្ទង់សមត្ថភាពការងាររបស់បុគ្គលិកអនាម័យ និងបុគ្គលិកសន្តិសុខ ផ្អែកលើការវាយតម្លៃ និងការដកពិន្ទុ' : 'Performance evaluation specifically designed for Cleaners & Security staff based on criteria scores minus penalties.'}
                </p>
              </div>

              <button
                onClick={() => handleOpenCsForm()}
                className="bg-[#0b4d4b] hover:bg-[#073836] text-white font-extrabold text-[11px] px-4 py-2.5 rounded-xl transition duration-150 cursor-pointer shadow-xs active:scale-97 flex items-center gap-1.5 animate-pulse"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>{lang === 'kh' ? 'វាយតម្លៃពិន្ទុបុគ្គលិកអនាម័យ/សន្តិសុខ' : 'Add Cleaner/Security Evaluation'}</span>
              </button>
            </div>

            {/* Side-by-side Criteria Scales & Penalty reference cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              
              {/* Grading Reference Card */}
              <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-3xs space-y-3">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <span className="w-1.5 h-3 bg-[#0d5c5a] rounded-sm" />
                  {lang === 'kh' ? 'កម្រិតពិន្ទុវាយតម្លៃ (Rating Scales)' : 'Rating Scale Guide'}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="p-2 border border-emerald-100 bg-emerald-50/40 rounded-lg text-center">
                    <div className="text-[11px] font-black text-emerald-800">95 - 100</div>
                    <div className="text-[10px] font-bold text-emerald-700 mt-1">{lang === 'kh' ? 'ល្អឥតខ្ចោះ' : 'Excellent'}</div>
                  </div>
                  <div className="p-2 border border-teal-100 bg-teal-50/40 rounded-lg text-center">
                    <div className="text-[11px] font-black text-teal-800">90 - 94</div>
                    <div className="text-[10px] font-bold text-teal-700 mt-1">{lang === 'kh' ? 'ល្អណាស់' : 'Very Good'}</div>
                  </div>
                  <div className="p-2 border border-sky-100 bg-sky-50/40 rounded-lg text-center">
                    <div className="text-[11px] font-black text-[#0d5c5a]">80 - 89</div>
                    <div className="text-[10px] font-bold text-[#0d5c5a]/80 mt-1">{lang === 'kh' ? 'ល្អ' : 'Good'}</div>
                  </div>
                  <div className="p-2 border border-amber-100 bg-amber-50/40 rounded-lg text-center">
                    <div className="text-[11px] font-black text-amber-805">70 - 79</div>
                    <div className="text-[10px] font-bold text-amber-700 mt-1">{lang === 'kh' ? 'មធ្យម' : 'Fair'}</div>
                  </div>
                  <div className="p-2 border border-rose-100 bg-rose-50/40 rounded-lg text-center col-span-2 sm:col-span-1">
                    <div className="text-[11px] font-black text-rose-800">&lt; 70</div>
                    <div className="text-[10px] font-bold text-rose-600 mt-1 whitespace-nowrap">{lang === 'kh' ? 'ត្រូវកែលម្អ' : 'Need Improve'}</div>
                  </div>
                </div>
              </div>

              {/* Penalty Reference Card */}
              <div className="bg-white border border-slate-200/60 p-4 rounded-xl shadow-3xs space-y-2">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <span className="w-1.5 h-3 bg-rose-500 rounded-sm" />
                  {lang === 'kh' ? 'ប្រព័ន្ធដកពិន្ទុ (Penalty Deductions Map)' : 'Standard Penalties & Violations'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-slate-600 font-bold font-sans">
                  {CS_PENALTIES.map(p => (
                    <div key={p.id} className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                      <span className="truncate max-w-[150px]">{lang === 'kh' ? p.labelKh : p.labelEn}</span>
                      <span className="text-rose-600 font-extrabold text-[10px] ml-1">-{p.points}pt</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Table of Monthly Cleaner and Security Evaluation */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-[#0d5c5a] flex items-center gap-2 pt-2">
                <Landmark className="w-4 h-4 text-[#0d5c5a]/80" />
                {lang === 'kh' ? 'តារាងវាយតម្លៃប្រចាំខែ (Monthly Staff KPI Directory)' : 'Security & Cleaner Monthly Scores Listing'}
              </h4>
              
              <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-3xs">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[#0d5c5a] font-bold">
                      <th className="py-3 px-3.5 text-center w-12">{lang === 'kh' ? 'ល.រ' : 'No.'}</th>
                      <th className="py-3 px-5">{lang === 'kh' ? 'ឈ្មោះបុគ្គលិក' : 'Staff Name'}</th>
                      <th className="py-3 px-4 text-center">{lang === 'kh' ? 'តួនាទី' : 'Role'}</th>
                      <th className="py-3 px-4 text-center">{lang === 'kh' ? 'ខែវាយតម្លៃ' : 'Evaluation Month'}</th>
                      <th className="py-3 px-4 text-center">{lang === 'kh' ? 'ពិន្ទុលម្អិតតាមលក្ខខណ្ឌ' : 'Scores Criteria Details'}</th>
                      <th className="py-3 px-5">{lang === 'kh' ? 'កំហុសដកពិន្ទុ (Penalties Applied)' : 'Applied Penalties'}</th>
                      <th className="py-3 px-4 text-center">{lang === 'kh' ? 'ពិន្ទុលទ្ធផល' : 'Final Score'}</th>
                      <th className="py-3 px-4 text-center">{lang === 'kh' ? 'កម្រិតលទ្ធផល' : 'Result Grade'}</th>
                      <th className="py-3 px-4 text-center print:hidden w-24">{lang === 'kh' ? 'សកម្មភាព' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                    {cleanerSecurityEvaluations.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center font-bold text-slate-400 bg-white">
                          {lang === 'kh' ? 'មិនទាន់មានទិន្នន័យវាយតម្លៃសម្រាប់ Cleaner និងសន្តិសុខឡើយ' : 'No Cleaner or Security evaluations recorded yet.'}
                        </td>
                      </tr>
                    ) : (
                      cleanerSecurityEvaluations.map((cs, idx) => {
                        const totalCriteriaPts = cs.scores.reduce((a, b) => a + b, 0);
                        const penaltyPointsVal = cs.penalties.reduce((sum, pId) => {
                          const penaltyObj = CS_PENALTIES.find(p => p.id === pId);
                          return sum + (penaltyObj ? penaltyObj.points : 0);
                        }, 0);
                        
                        return (
                          <tr key={cs.id} className="hover:bg-slate-50/40 bg-white transition duration-100">
                            <td className="py-4 px-3.5 text-center text-slate-400 font-mono font-medium">{idx + 1}</td>
                            
                            <td className="py-4 px-5 font-black text-slate-800 text-sm">
                              {cs.staffName}
                            </td>
                            
                            <td className="py-4 px-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                                cs.role === 'Cleaner' 
                                  ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                              }`}>
                                {cs.role === 'Cleaner' 
                                  ? (lang === 'kh' ? '🧹 បុគ្គលិកអនាម័យ' : 'Cleaner') 
                                  : (lang === 'kh' ? '🛡️ ផ្នែកសន្តិសុខ' : 'Security')
                                }
                              </span>
                            </td>

                            <td className="py-4 px-4 text-center font-mono font-bold text-slate-500 bg-slate-50/20">
                              {cs.month}
                            </td>

                            <td className="py-4 px-4 max-w-[200px] whitespace-normal">
                              <div className="flex gap-1 flex-wrap justify-center">
                                {cs.scores.map((score, sIdx) => {
                                  const max = cs.role === 'Cleaner' ? 20 : 25;
                                  return (
                                    <span key={sIdx} className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold" title={`Criterion ${sIdx + 1} score`}>
                                      {score}/{max}
                                    </span>
                                  );
                                })}
                                <span className="text-[10px] font-black text-[#0d5c5a] pl-1">
                                  ({lang === 'kh' ? 'សរុប' : 'Base'}: {totalCriteriaPts})
                                </span>
                              </div>
                            </td>

                            <td className="py-4 px-5 whitespace-normal max-w-[220px]">
                              {cs.penalties.length === 0 ? (
                                <span className="text-[11px] font-bold text-emerald-600">
                                  {lang === 'kh' ? '✅ គ្មានកំហុសដកពិន្ទុ' : 'No infractions'}
                                </span>
                              ) : (
                                <div className="flex flex-wrap gap-1 leading-normal">
                                  {cs.penalties.map(pId => {
                                    const penObj = CS_PENALTIES.find(p => p.id === pId);
                                    return (
                                      <span key={pId} className="bg-rose-50 text-rose-700 border border-rose-100 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5">
                                        {lang === 'kh' ? penObj?.labelKh : penObj?.labelEn}
                                        <span className="font-extrabold text-[9px]">-{penObj?.points}</span>
                                      </span>
                                    );
                                  })}
                                  {cs.customPenaltiesText && (
                                    <span className="text-[10.5px] italic text-[#0d5c5a]/80 font-bold block mt-1">
                                      * {cs.customPenaltiesText}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="py-4 px-4 text-center bg-slate-50/40">
                              <span className="text-slate-900 font-extrabold text-sm font-mono">
                                {cs.totalScore}
                              </span>
                              <span className="text-slate-400 font-medium text-[10px]"> /100</span>
                            </td>

                            <td className="py-4 px-4 text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${getGradeColor(cs.grade)}`}>
                                {lang === 'kh' ? cs.grade : getGradeDescription(cs.totalScore, 'en')}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-center print:hidden">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleOpenCsForm(cs)}
                                  className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-slate-200 bg-white rounded-lg transition cursor-pointer"
                                  title={lang === 'kh' ? 'កែសម្រួល' : 'Edit'}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteCsId(cs.id)}
                                  className="p-1.5 text-rose-600 hover:text-rose-850 hover:bg-rose-55 border border-slate-200 bg-white rounded-lg transition cursor-pointer"
                                  title={lang === 'kh' ? 'លុប' : 'Delete'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
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
          </div>

        </div>
      )}


      {/* Delete confirmation dialog for Admin Tasks */}
      <AnimatePresence>
        {deleteTaskId && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 max-w-sm w-full rounded-2xl p-6 text-center space-y-4 shadow-xl"
            >
              <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">
                  {lang === 'kh' ? 'តើអ្នកប្រាកដជាចង់លុបការងារនេះទេ?' : 'Confirm deletion of follow-up record'}
                </h4>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  {lang === 'kh' ? 'ប្រតិបត្តិនេះនឹងដកព័ត៌មានចេញពីតារាងតាមដានជាអចិន្ត្រៃយ៍ និងមិនអាចសង្គ្រោះវិញបានឡើយ។' : 'This will remove the activity item completely.'}
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setDeleteTaskId(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold text-xs px-4 py-2 rounded-xl"
                >
                  {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteGeneralTask}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-4 py-2 rounded-xl"
                >
                  {lang === 'kh' ? 'យល់ព្រមលុប' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog for Insurance Claims */}
      <AnimatePresence>
        {deleteInsuranceId && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 max-w-sm w-full rounded-2xl p-6 text-center space-y-4 shadow-xl"
            >
              <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">
                  {lang === 'kh' ? 'តើអ្នកប្រាកដជាចង់លុបសំណុំរឿងធានារ៉ាប់រងនេះទេ?' : 'Confirm deletion of student insurance record'}
                </h4>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  {lang === 'kh' ? 'ព័ត៌មាននៃការតាមដានគ្រោះថ្នាក់របស់សិស្សនេះ នឹងត្រូវបានលុបជាអចិន្ត្រៃយ៍ ចេញពីប្រព័ន្ធតាមដានសាលា។' : 'This will erase the accident injury tracking follow up record.'}
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setDeleteInsuranceId(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold text-xs px-4 py-2 rounded-xl"
                >
                  {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteInsuranceClaim}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-4 py-2 rounded-xl"
                >
                  {lang === 'kh' ? 'យល់ព្រមលុប' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog for Staff Tasks */}
      <AnimatePresence>
        {deleteStaffId && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 max-w-sm w-full rounded-2xl p-6 text-center space-y-4 shadow-xl"
            >
              <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">
                  {lang === 'kh' ? 'តើអ្នកប្រាកដជាចង់លុបការងារបុគ្គលិកនេះទេ?' : 'Confirm deletion of staff task'}
                </h4>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  {lang === 'kh' ? 'ប្រតិបត្តិនេះនឹងលុបការងាររបស់បុគ្គលិកនេះជាអចិន្ត្រៃយ៍ និងមិនអាចសង្គ្រោះបានឡើយ។' : 'This will remove the staff assigned activity permanently.'}
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setDeleteStaffId(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold text-xs px-4 py-2 rounded-xl"
                >
                  {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteStaffTask}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-4 py-2 rounded-xl"
                >
                  {lang === 'kh' ? 'យល់ព្រមលុប' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog for Weekly Staff Reviews */}
      <AnimatePresence>
        {deleteWeeklyId && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 max-w-sm w-full rounded-2xl p-6 text-center space-y-4 shadow-xl"
            >
              <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">
                  {lang === 'kh' ? 'តើអ្នកប្រាកដជាចង់លុប Follow-up សប្ដាហ៍នេះទេ?' : 'Confirm deletion of weekly review'}
                </h4>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  {lang === 'kh' ? 'រាល់ព័ត៌មានពីការវិវត្ត និងដំណោះស្រាយក្នុងសប្ដាហ៍នឹងត្រូវលុបចោល។' : 'This will erase the weekly overview log for this staff.'}
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setDeleteWeeklyId(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold text-xs px-4 py-2 rounded-xl"
                >
                  {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteWeeklyFollowup}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-4 py-2 rounded-xl"
                >
                  {lang === 'kh' ? 'យល់ព្រមលុប' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog for Monthly KPIs */}
      <AnimatePresence>
        {deleteMonthlyId && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 max-w-sm w-full rounded-2xl p-6 text-center space-y-4 shadow-xl"
            >
              <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900">
                  {lang === 'kh' ? 'តើអ្នកប្រាកដជាចង់លុបការវាយតម្លៃនេះទេ?' : 'Confirm deletion of monthly rating'}
                </h4>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  {lang === 'kh' ? 'ប្រតិបត្តិនេះនឹងដកពិន្ទុសមិទ្ធផលការងារប្រចាំខែចោល។' : 'This will delete the monthly KPI metrics permanently.'}
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setDeleteMonthlyId(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold text-xs px-4 py-2 rounded-xl"
                >
                  {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteMonthlyEvaluation}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-4 py-2 rounded-xl"
                >
                  {lang === 'kh' ? 'យល់ព្រមលុប' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE OR EDIT MODAL DIALOGS - GENERAL FORMS */}
      <AnimatePresence>
        {isGeneralFormOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-3xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="bg-white border border-slate-100 rounded-2xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </span>
                  <h3 className="font-black text-sm text-slate-900">
                    {editingTaskId ? (lang === 'kh' ? 'កែសម្រួលការងារទូទៅ' : 'Edit General Task') : (lang === 'kh' ? 'បន្ថែមការងារទូទៅថ្មី' : 'Add New General Task')}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsGeneralFormOpen(false)}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center transition"
                >
                  <XCircle className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleSaveGeneralTask} className="p-6 overflow-y-auto space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'កាលបរិច្ឆេទស្នើ' : 'Date Request'} *
                    </label>
                    <input
                      type="date"
                      value={formDateRequest}
                      onChange={(e) => setFormDateRequest(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'ថ្ងៃតាមដានបន្ត' : 'Followup Date'} *
                    </label>
                    <input
                      type="date"
                      value={formFollowupDate}
                      onChange={(e) => setFormFollowupDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                    {lang === 'kh' ? 'ប្រភេទអន្តរាគមន៍ / Category' : 'Task Category'} *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={formIssueCategory}
                      onChange={(e) => setFormIssueCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="Westec">Westec</option>
                      <option value="Student Insurance">{lang === 'kh' ? 'ធានារ៉ាប់រងសិស្ស' : 'Student Insurance'}</option>
                      <option value="Other">{lang === 'kh' ? 'ផ្សេងៗ (Other)' : 'Other'}</option>
                      <option value="Custom">{lang === 'kh' ? 'ប្រភេទផ្ទាល់ខ្លួន... (Custom)' : 'Custom...'}</option>
                    </select>

                    {formIssueCategory === 'Custom' && (
                      <input
                        type="text"
                        placeholder={lang === 'kh' ? 'បញ្ចូលប្រភេទការងារថ្មី...' : 'Specify custom category'}
                        value={formCustomCategory}
                        onChange={(e) => setFormCustomCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold"
                        required
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                    {lang === 'kh' ? 'ការងារ / សេចក្តីស្នើ' : 'Issue / Request Details'} *
                  </label>
                  <textarea
                    rows={2}
                    value={formIssueRequest}
                    onChange={(e) => setFormIssueRequest(e.target.value)}
                    placeholder={lang === 'kh' ? 'រាយរាប់ខ្លឹមសារការងារ ឬបញ្ហាដែលកើតឡើង...' : 'Describe what needs to be followed up'}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-xs font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'ទីតាំង' : 'Location'} *
                    </label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder={lang === 'kh' ? 'ឧ. អគារ A ជាន់ទី២' : 'e.g., Campus B, Room 302'}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'ស្នើឡើងដោយ' : 'Request By'} *
                    </label>
                    <input
                      type="text"
                      value={formRequestedBy}
                      onChange={(e) => setFormRequestedBy(e.target.value)}
                      placeholder={lang === 'kh' ? 'ឈ្មោះអ្នកស្នើសុំ' : 'Person requesting'}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'អ្នកទទួលបន្ទុក / PIC' : 'Responsible PIC'}
                    </label>
                    <input
                      type="text"
                      value={formPic}
                      onChange={(e) => setFormPic(e.target.value)}
                      placeholder={lang === 'kh' ? 'ឧ. ជាងអគ្គិសនី ឬ បុគ្គលិក IT' : 'e.g., Westec Technical or IT team'}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'ស្ថានភាពការងារ / Status' : 'Work Status'} *
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as FollowupTaskStatus)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer"
                    >
                      <option value="Completed">🟢 {lang === 'kh' ? 'បានបញ្ចប់ (Completed)' : 'Completed'}</option>
                      <option value="InProgress">🟡 {lang === 'kh' ? 'កំពុងដំណើរការ (In Progress)' : 'In Progress'}</option>
                      <option value="Pending">🔴 {lang === 'kh' ? 'កំពុងរង់ចាំ (Pending)' : 'Pending'}</option>
                      <option value="FollowUp">🔵 {lang === 'kh' ? 'ត្រូវតាមដានបន្ត (Follow Up)' : 'Follow Up'}</option>
                      <option value="Cancelled">⚫ {lang === 'kh' ? 'លុបចោល (Cancelled)' : 'Cancelled'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                    {lang === 'kh' ? 'កំណត់សម្គាល់បន្ថែម' : 'Remark / Result Notes'}
                  </label>
                  <textarea
                    rows={2}
                    value={formRemark}
                    onChange={(e) => setFormRemark(e.target.value)}
                    placeholder={lang === 'kh' ? 'វាយបញ្ចូលលទ្ធផលអន្តរាគមន៍ ឬដំណោះស្រាយ...' : 'e.g., waiting for spares or completed'}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-xs font-bold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsGeneralFormOpen(false)}
                    className="bg-slate-105 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="bg-[#052C2B] hover:bg-[#073B3A] text-white font-extrabold text-xs px-5 py-2 rounded-xl active:scale-97 transition"
                  >
                    {lang === 'kh' ? 'រក្សាទុកការងារ' : 'Save Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE OR EDIT MODAL DIALOGS - STUDENT INSURANCE FORMS */}
      <AnimatePresence>
        {isInsuranceFormOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-3xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="bg-white border border-slate-100 rounded-2xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <Shield className="w-4 h-4 text-emerald-800 stroke-[2]" />
                  </span>
                  <h3 className="font-black text-sm text-slate-900">
                    {editingInsuranceId 
                      ? (lang === 'kh' ? 'កែសម្រួលលក្ខខណ្ឌធានារ៉ាប់រងសិស្ស' : 'Edit Student Injury Claims') 
                      : (lang === 'kh' ? 'បន្ថែមតាមដានធានារ៉ាប់រងសិស្សថ្មី' : 'New Accident / Student Injury claims follow')}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsInsuranceFormOpen(false)}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center transition"
                >
                  <XCircle className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleSaveInsuranceClaim} className="p-6 space-y-4 text-left overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'កាលបរិច្ឆេទកើតហេតុ' : 'Date Incident'} *
                    </label>
                    <input
                      type="date"
                      value={formInsDateIncident}
                      onChange={(e) => setFormInsDateIncident(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'លេខសំណុំរឿងទាមទារសង' : 'Insurance Claim No.'}
                    </label>
                    <input
                      type="text"
                      value={formInsClaimNo}
                      onChange={(e) => setFormInsClaimNo(e.target.value)}
                      placeholder="e.g., INS-2026-90XX"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3.5">
                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'ឈ្មោះសិស្ស' : 'Student Name'} *
                    </label>
                    <input
                      type="text"
                      value={formInsStudentName}
                      onChange={(e) => setFormInsStudentName(e.target.value)}
                      placeholder={lang === 'kh' ? 'ឧ. មុី សុធារិទ្ធ' : 'Full Name of student'}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold animate-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'ថ្នាក់/បន្ទប់' : 'Grade/Class'} *
                    </label>
                    <input
                      type="text"
                      value={formInsGradeClass}
                      onChange={(e) => setFormInsGradeClass(e.target.value)}
                      placeholder="e.g., Grade 10B"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                    {lang === 'kh' ? 'ព័ត៌មានលម្អិតនៃឧបទ្ទវហេតុ' : 'Incident Details'} *
                  </label>
                  <textarea
                    rows={2}
                    value={formInsDetails}
                    onChange={(e) => setFormInsDetails(e.target.value)}
                    placeholder={lang === 'kh' ? 'រាយរាប់ករណីគ្រោះថ្នាក់ ពេលវេលា និងផ្នែកដែលរងរបួស...' : 'Describe accident situation, injured parts or severity'}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                    {lang === 'kh' ? 'មន្ទីរពេទ្យ / គ្លីនិកព្យាបាល' : 'Hospital / Clinic'}
                  </label>
                  <input
                    type="text"
                    value={formInsHospitalClinic}
                    onChange={(e) => setFormInsHospitalClinic(e.target.value)}
                    placeholder={lang === 'kh' ? 'ឧ. មន្ទីរពេទ្យព្រះកុសុមៈ' : 'Which medical facility was visited'}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                    {lang === 'kh' ? 'ឯកសារដែលបានដាក់ជូន' : 'Documents Submitted'}
                  </label>
                  <input
                    type="text"
                    value={formInsDocsSubmitted}
                    onChange={(e) => setFormInsDocsSubmitted(e.target.value)}
                    placeholder={lang === 'kh' ? 'ឧ. វិក្កយបត្រ, រូបថតរបួស, សៀវភៅស្នាក់នៅ, លិខិតបញ្ជាក់សាលា' : 'e.g., original invoices, medical prescription lists'}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'ស្ថានភាពតាមដាន / Status' : 'Claim Tracking Status'} *
                    </label>
                    <select
                      value={formInsStatus}
                      onChange={(e) => setFormInsStatus(e.target.value as InsuranceFollowupStatus)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer"
                    >
                      <option value="PendingSubmission">🟡 {lang === 'kh' ? 'មិនទាន់ដាក់ឯកសារ (Pending Submission)' : 'Pending Submission'}</option>
                      <option value="UnderReview">🔵 {lang === 'kh' ? 'កំពុងពិនិត្យ (Under Review)' : 'Under Review'}</option>
                      <option value="AdditionalDocRequired">🟠 {lang === 'kh' ? 'ត្រូវការឯកសារបន្ថែម (Additional Docs Req.)' : 'Additional Documents Required'}</option>
                      <option value="Approved">🟢 {lang === 'kh' ? 'អនុម័ត (Approved)' : 'Approved'}</option>
                      <option value="Rejected">🔴 {lang === 'kh' ? 'បដិសេធ (Rejected)' : 'Rejected'}</option>
                      <option value="Completed">🟢 {lang === 'kh' ? 'បានទូទាត់រួចរាល់ (Completed)' : 'Completed'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                    {lang === 'kh' ? 'កំណត់សម្គាល់បន្ថែម / Remark' : 'Remark / Follow-up results'}
                  </label>
                  <textarea
                    rows={2}
                    value={formInsRemark}
                    onChange={(e) => setFormInsRemark(e.target.value)}
                    placeholder={lang === 'kh' ? 'វាយបញ្ចូលកំណត់សម្គាល់បន្ថែម...' : 'e.g., amount paid, parents contact status'}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-xs font-bold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsInsuranceFormOpen(false)}
                    className="bg-slate-105 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="bg-[#052C2B] hover:bg-[#073B3A] text-white font-extrabold text-xs px-5 py-2 rounded-xl active:scale-97 transition"
                  >
                    {lang === 'kh' ? 'រក្សាទុកសំណុំរឿង' : 'Save Claim Case'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE OR EDIT STAFF TASK MODAL */}
      <AnimatePresence>
        {isStaffFormOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white border border-slate-100 max-w-lg w-full rounded-2xl p-6 shadow-2xl relative my-8"
            >
              <button
                onClick={() => setIsStaffFormOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 mb-4">
                <div className="p-2 bg-emerald-50 rounded-xl text-[#0d5c5a]">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {editingStaffId 
                      ? (lang === 'kh' ? 'កែសម្រួលព័ត៌មានការងារបុគ្គលិក' : 'Modify Assigned Staff Task')
                      : (lang === 'kh' ? 'បន្ថែមការងារបុគ្គលិកថ្មី' : 'Create New Staff Task Assignment')}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    {lang === 'kh' ? 'សូមបំពេញព័ត៌មានលម្អិតលម្អិតខាងក្រោមឱ្យបានគ្រប់ជ្រុងជ្រោយ' : 'Please input task attributes and target timelines'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveStaffTask} className="space-y-4">
                <div className="grid grid-cols-2 gap-35">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'កាលបរិច្ឆេទដាក់ការងារ' : 'Date Assigned'} *
                    </label>
                    <input
                      type="date"
                      value={formStAssignedDate}
                      onChange={(e) => setFormStAssignedDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'ថ្ងៃកំណត់បញ្ចប់/កាលបរិច្ឆេទកំណត់' : 'Deadline'} *
                    </label>
                    <input
                      type="date"
                      value={formStDeadline}
                      onChange={(e) => setFormStDeadline(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-rose-750"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-35">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'ឈ្មោះបុគ្គលិកជនបង្គោល' : 'Staff Name'} *
                    </label>
                    <input
                      type="text"
                      value={formStStaffName}
                      onChange={(e) => setFormStStaffName(e.target.value)}
                      placeholder={lang === 'kh' ? 'ឧ. សុខ ដារ៉ា' : 'e.g., Sok Dara'}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'មុខតំណែង' : 'Position'}
                    </label>
                    <input
                      type="text"
                      value={formStPosition}
                      onChange={(e) => setFormStPosition(e.target.value)}
                      placeholder={lang === 'kh' ? 'ឧ. IT Officer' : 'e.g., Admin Officer'}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                    {lang === 'kh' ? 'ការងារដែលត្រូវធ្វើ' : 'Task Description'} *
                  </label>
                  <textarea
                    rows={2}
                    value={formStTaskToDo}
                    onChange={(e) => setFormStTaskToDo(e.target.value)}
                    placeholder={lang === 'kh' ? 'ការងារការផ្សព្វផ្សាយ តម្លើង Printer, ឬរៀបចំ Report...' : 'Detail core action item details'}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-xs font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'កាលបរិច្ឆេទបញ្ចប់ពិតប្រាកដ' : 'Actual Finish Date'}
                    </label>
                    <input
                      type="text"
                      value={formStFinishDate}
                      onChange={(e) => setFormStFinishDate(e.target.value)}
                      placeholder={lang === 'kh' ? 'ឧ. 24-Jun-2026 ឬ -' : 'e.g., 24-Jun-2026 or -'}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'លទ្ធផល' : 'Result'}
                    </label>
                    <input
                      type="text"
                      value={formStResult}
                      onChange={(e) => setFormStResult(e.target.value)}
                      placeholder={lang === 'kh' ? 'ឧ. ជោគជ័យ ឬ -' : 'e.g., Success or -'}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-emerald-750"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'អ្នកត្រួតពិនិត្យ' : 'Supervisor PIC'}
                    </label>
                    <input
                      type="text"
                      value={formStSupervisor}
                      onChange={(e) => setFormStSupervisor(e.target.value)}
                      placeholder={lang === 'kh' ? 'ឧ. Manager, Principal' : 'Supervisor / Auditor label'}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'ស្ថានភាពការងារ / Status' : 'Task Status'} *
                    </label>
                    <select
                      value={formStStatus}
                      onChange={(e) => setFormStStatus(e.target.value as StaffTask['status'])}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer"
                    >
                      <option value="Pending">🔵 {lang === 'kh' ? 'មិនទាន់ចាប់ផ្តើម (Pending)' : 'Pending'}</option>
                      <option value="InProgress">🟡 {lang === 'kh' ? 'កំពុងធ្វើ (In Progress)' : 'In Progress'}</option>
                      <option value="Completed">🟢 {lang === 'kh' ? 'បញ្ចប់រួច (Completed)' : 'Completed'}</option>
                      <option value="Overdue">🔴 {lang === 'kh' ? 'ហួសកំណត់ (Overdue)' : 'Overdue'}</option>
                      <option value="OnHold">⚫ {lang === 'kh' ? 'ផ្អាក (On Hold)' : 'On Hold'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'កំណត់សម្គាល់បន្ថែម / Remark' : 'Remark / Follow-up notes'}
                    </label>
                    <input
                      type="text"
                      value={formStRemark}
                      onChange={(e) => setFormStRemark(e.target.value)}
                      placeholder={lang === 'kh' ? 'កំណត់សម្គាល់...' : 'Any secondary details...'}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-950"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsStaffFormOpen(false)}
                    className="bg-slate-105 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                  >
                    {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="bg-[#052C2B] hover:bg-[#073B3A] text-white font-extrabold text-xs px-5 py-2 rounded-xl active:scale-97 transition"
                  >
                    {lang === 'kh' ? 'រក្សាទុកទិន្នន័យ' : 'Save Staff Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE OR EDIT WEEKLY STAFF FOLLOWUP REVIEW MODAL */}
      <AnimatePresence>
        {isWeeklyFormOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white border border-slate-100 max-w-lg w-full rounded-2xl p-6 shadow-2xl relative my-8"
            >
              <button
                onClick={() => setIsWeeklyFormOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 mb-4">
                <div className="p-2 bg-indigo-50 rounded-xl text-[#0d5c5a]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {editingWeeklyId 
                      ? (lang === 'kh' ? 'កែសម្រួលការតាមដានប្រចាំសប្ដាហ៍' : 'Modify Weekly Review Record')
                      : (lang === 'kh' ? 'បន្ថែមការកត់ត្រាប្រចាំសប្ដាហ៍ថ្មី' : 'Create Weekly Review Log')}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    {lang === 'kh' ? 'សូមបំពេញព័ត៌មានលម្អិតអំពីបញ្ហាប្រឈម និងដំណោះស្រាយរារាំងផ្សេងៗ' : 'Input weekly activity metrics, impediments, and solutions'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveWeeklyFollowup} className="space-y-4">
                <div className="grid grid-cols-2 gap-35">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'កាលបរិច្ឆេទកត់ត្រា' : 'Log Date'} *
                    </label>
                    <input
                      type="date"
                      value={formWfDate}
                      onChange={(e) => setFormWfDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'ថ្ងៃបញ្ចប់រំពឹងទុក' : 'Target Expected Finish Date'} *
                    </label>
                    <input
                      type="date"
                      value={formWfExpectedFinishDate}
                      onChange={(e) => setFormWfExpectedFinishDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-35">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'ឈ្មោះបុគ្គលិកជនបង្គោល' : 'Staff Name'} *
                    </label>
                    <input
                      type="text"
                      value={formWfStaffName}
                      onChange={(e) => setFormWfStaffName(e.target.value)}
                      placeholder={lang === 'kh' ? 'ឧ. ស្រី មាលា' : 'e.g., Srey Mealea'}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#0d5c5a]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'វឌ្ឍនភាពការងារ / Progress (%)' : 'Progress Rating (%)'} *
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formWfProgressPercent}
                      onChange={(e) => setFormWfProgressPercent(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-[#0d5c5a]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                    {lang === 'kh' ? 'ខ្លឹមសារការងារចម្បង' : 'Task Scope Description'} *
                  </label>
                  <textarea
                    rows={2}
                    value={formWfTaskDesc}
                    onChange={(e) => setFormWfTaskDesc(e.target.value)}
                    placeholder={lang === 'kh' ? 'បរិយាយអំពីការងារដែលបានអនុវត្ត...' : 'e.g., Designing standard request layout forms...'}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-xs font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-35">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'បញ្ហាប្រឈម / Issues / Blockers' : 'Challenges Encountered'}
                    </label>
                    <textarea
                      rows={2}
                      value={formWfChallenge}
                      onChange={(e) => setFormWfChallenge(e.target.value)}
                      placeholder={lang === 'kh' ? 'បញ្ហាប្រឈមចម្បងៗ ឬ -' : 'Any impediments blocking the flow...'}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-xs font-bold text-rose-750"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'ដំណោះស្រាយការងារ / Mitigation' : 'Proposed Solutions'}
                    </label>
                    <textarea
                      rows={2}
                      value={formWfSolution}
                      onChange={(e) => setFormWfSolution(e.target.value)}
                      placeholder={lang === 'kh' ? 'យុទ្ធសាស្ត្រដោះស្រាយ ឬ -' : 'What is to be done to solve it...'}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl p-3 text-xs font-bold text-emerald-850"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsWeeklyFormOpen(false)}
                    className="bg-slate-105 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="bg-[#052C2B] hover:bg-[#073B3A] text-white font-extrabold text-xs px-5 py-2 rounded-xl active:scale-97 transition"
                  >
                    {lang === 'kh' ? 'រក្សាទុកទិន្នន័យ' : 'Save Review Entry'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE OR EDIT MONTHLY EVALUATION KPI MODAL */}
      <AnimatePresence>
        {isMonthlyFormOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white border border-slate-100 max-w-sm w-full rounded-2xl p-6 shadow-2xl relative my-8"
            >
              <button
                onClick={() => setIsMonthlyFormOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 mb-4">
                <div className="p-2 bg-amber-50 rounded-xl text-[#0d5c5a]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {editingMonthlyId 
                      ? (lang === 'kh' ? 'កែសម្រួលការវាយតម្លៃបុគ្គលិក' : 'Modify Monthly Performance Rating')
                      : (lang === 'kh' ? 'បន្ថែមការវាយតម្លៃលទ្ធផលការងារ (KPI)' : 'Create Monthly Staff KPI Evaluation')}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    {lang === 'kh' ? 'បំពេញពិន្ទុវិនិច្ឆ័យសមិទ្ធផលរបស់បុគ្គលិក' : 'Assign specific performance ratings & task counts'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveMonthlyEvaluation} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                    {lang === 'kh' ? 'ឈ្មោះបុគ្គលិកជនបង្គោល' : 'Staff Name'} *
                  </label>
                  <input
                    type="text"
                    value={formMeStaffName}
                    onChange={(e) => setFormMeStaffName(e.target.value)}
                    placeholder={lang === 'kh' ? 'ឧ. សុខ ដារ៉ា' : 'e.g., Sok Dara'}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'ការងារសរុប' : 'Total Tasks'} *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formMeTotalTasks}
                      onChange={(e) => handleMeTotalTasksChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'បញ្ចប់ទាន់ពេល' : 'On Time Done'} *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formMeCompletedOnTime}
                      onChange={(e) => handleMeCompletedOnTimeChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-emerald-700"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'បញ្ចប់យឺតយ៉ាវ' : 'Late Closed Tasks'} *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formMeCompletedLate}
                      onChange={(e) => handleMeCompletedLateChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-amber-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'មិនទាន់បញ្ចប់' : 'Unfinished/Overdue'} *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formMeUnfinished}
                      onChange={(e) => handleMeUnfinishedChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-rose-750"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                    {lang === 'kh' ? 'ពិន្ទុរួមសរុប (%)' : 'Overall KPI Score (%)'} *
                  </label>
                  <input
                    type="text"
                    value={formMeScore}
                    onChange={(e) => setFormMeScore(e.target.value)}
                    placeholder="e.g., 90% or 100%"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-black text-[#0d5c5a]"
                    required
                  />
                  <p className="text-[9.5px] text-slate-400 font-bold mt-1 text-right">
                    {lang === 'kh' 
                      ? 'គណនាស្វ័យប្រវត្តិ៖ (ទាន់ពេល + (យឺត x 50%)) ÷ សរុប' 
                      : 'Auto-computed formula: (On-Time + (Late x 50%)) ÷ Total'}
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsMonthlyFormOpen(false)}
                    className="bg-slate-105 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="bg-[#052C2B] hover:bg-[#073B3A] text-white font-extrabold text-xs px-5 py-2 rounded-xl active:scale-97 transition"
                  >
                    {lang === 'kh' ? 'រក្សាទុកទិន្នន័យ' : 'Save KPI Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE OR EDIT CLEANER & SECURITY KPI MODAL */}
      <AnimatePresence>
        {isCsFormOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white border border-slate-100 max-w-lg w-full rounded-2xl p-6 shadow-2xl relative my-8"
            >
              <button
                onClick={() => setIsCsFormOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 mb-4">
                <div className="p-2 bg-teal-50 rounded-xl text-[#0d5c5a]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {editingCsId 
                      ? (lang === 'kh' ? 'កែសម្រួលការវាយតម្លៃអនាម័យ/សន្តិសុខ' : 'Modify Cleaner/Security KPI')
                      : (lang === 'kh' ? 'វាយតម្លៃពិន្ទុបុគ្គលិកអនាម័យ/សន្តិសុខ' : 'Create Cleaner/Security KPI')}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    {lang === 'kh' ? 'វាយតម្លៃពិន្ទុតាមលក្ខខណ្ឌវិនិច្ឆ័យដកពិន្ទុកំហុសឆ្គង' : 'Rate criteria parameters (total 100) minus penalties'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveCsEvaluation} className="space-y-4">
                
                {/* Name & Role Rows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'ឈ្មោះបុគ្គលិក' : 'Staff Name'} *
                    </label>
                    <input
                      type="text"
                      value={formCsStaffName}
                      onChange={(e) => setFormCsStaffName(e.target.value)}
                      placeholder={lang === 'kh' ? 'ឧ. ស្រី មាលា' : 'e.g., Srey Mealea'}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'តួនាទី / ផ្នែក' : 'Role / Position'} *
                    </label>
                    <select
                      value={formCsRole}
                      disabled={editingCsId !== null}
                      onChange={(e) => handleCsRoleChange(e.target.value as 'Cleaner' | 'Security')}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    >
                      <option value="Cleaner">{lang === 'kh' ? '🧹 បុគ្គលិកអនាម័យ (Cleaner)' : 'Cleaner'}</option>
                      <option value="Security">{lang === 'kh' ? '🛡️ ផ្នែកសន្តិសុខ (Security)' : 'Security'}</option>
                    </select>
                  </div>
                </div>

                {/* Month & Date Evaluated Rows */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'ប្រចាំខែ' : 'Evaluation Month'} *
                    </label>
                    <input
                      type="month"
                      value={formCsMonth}
                      onChange={(e) => setFormCsMonth(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-mono font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">
                      {lang === 'kh' ? 'កាលបរិច្ឆេទវាយតម្លៃ' : 'Date Evaluated'} *
                    </label>
                    <input
                      type="date"
                      value={formCsDateEvaluated}
                      onChange={(e) => setFormCsDateEvaluated(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                {/* Score inputs based on Criteria */}
                <div className="space-y-2 border-t border-b border-dashed border-slate-100 py-3">
                  <h4 className="text-[10.5px] uppercase font-black text-[#0d5c5a] flex justify-between items-center">
                    <span>{lang === 'kh' ? 'ពិន្ទុតាមលក្ខណៈវិនិច្ឆ័យ (សរុប ១០០)' : 'Scores per Criteria (Total 100)'}</span>
                    <span className="text-[9.5px] lowercase font-medium text-slate-400">
                      {formCsRole === 'Cleaner' ? '5 criteria x 20pts max' : '4 criteria x 25pts max'}
                    </span>
                  </h4>
                  
                  <div className="space-y-2">
                    {(formCsRole === 'Cleaner' ? CLEANER_CRITERIA : SECURITY_CRITERIA).map((crit, idx) => {
                      const maxPoints = formCsRole === 'Cleaner' ? 20 : 25;
                      return (
                        <div key={crit.id} className="flex items-center justify-between gap-3 bg-slate-50 p-2 rounded-xl border border-slate-150/40">
                          <div className="text-xs font-bold text-slate-705 leading-tight">
                            <span className="font-extrabold text-slate-400 font-mono pr-1">{idx + 1}.</span>
                            {lang === 'kh' ? crit.labelKh : crit.labelEn}
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            <input
                              type="number"
                              min={0}
                              max={maxPoints}
                              value={formCsScores[idx] !== undefined ? formCsScores[idx] : maxPoints}
                              onChange={(e) => handleCsScoreValueChange(idx, e.target.value, maxPoints)}
                              className="w-16 text-center bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-black text-[#0d5c5a]"
                              required
                            />
                            <span className="text-[11px] font-bold text-slate-400">/ {maxPoints}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Penalty choices Checklist */}
                <div className="space-y-2">
                  <h4 className="text-[10.5px] uppercase font-black text-rose-600 flex justify-between items-center">
                    <span>{lang === 'kh' ? 'ប្រព័ន្ធដកពិន្ទុតាមកំហុសឆ្គង (Penalties)' : 'Errors & Infractions Deductions'}</span>
                    <span className="text-[9.5px] lowercase font-semibold text-slate-450">
                      {lang === 'kh' ? 'ដកចេញពីពិន្ទុគោល' : 'deducted from base score'}
                    </span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50 font-sans">
                    {CS_PENALTIES.map(p => {
                      const isChecked = formCsPenalties.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center justify-between p-2 rounded-xl text-[10.5px] font-bold cursor-pointer border transition ${
                            isChecked 
                              ? 'bg-rose-50/50 border-rose-200 text-rose-800' 
                              : 'bg-white border-slate-150 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleCsPenalty(p.id)}
                              className="accent-rose-605 rounded"
                            />
                            <span className="truncate max-w-[120px]">{lang === 'kh' ? p.labelKh : p.labelEn}</span>
                          </div>
                          <span className="text-rose-600 font-extrabold">-{p.points}pt</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Custom/Optional penalties detail text */}
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-1 font-sans">
                    {lang === 'kh' ? 'កំណត់សម្គាល់កំហុសឆ្គងបន្ថែម' : 'Additional Infraction Notes'}
                  </label>
                  <textarea
                    rows={1}
                    value={formCsCustomPenaltiesText}
                    onChange={(e) => setFormCsCustomPenaltiesText(e.target.value)}
                    placeholder={lang === 'kh' ? 'ឧ. ខកខានមិនបានចាក់សោរបន្ទប់ទឹក' : 'e.g., missed locking restrooms'}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                  />
                </div>

                {/* Score Dynamic summary */}
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{lang === 'kh' ? 'ពិន្ទុសរុបចុងក្រោយ' : 'Final Calculated Score'}</span>
                    <span className="text-[11px] font-black text-emerald-800">
                      {lang === 'kh' ? 'កម្រិតថ្នាក់គណនាបាន៖' : 'Resolved Grade Level:'}{' '}
                      <span className="underline font-black">{getGradeDescription(calculateCsTotalScore(formCsScores, formCsPenalties), 'kh')}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#0d5c5a] font-mono">
                      {calculateCsTotalScore(formCsScores, formCsPenalties)}
                    </span>
                    <span className="text-slate-400 font-bold text-xs"> / 100</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCsFormOpen(false)}
                    className="bg-slate-105 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="bg-[#052C2B] hover:bg-[#073B3A] text-white font-extrabold text-xs px-5 py-2 rounded-xl active:scale-97 transition"
                  >
                    {lang === 'kh' ? 'រក្សាទុកការវាយតម្លៃ' : 'Save KPI Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG FOR CLEANER/SECURITY EVALUATIONS */}
      <AnimatePresence>
        {deleteCsId && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 max-w-sm w-full rounded-2xl p-6 shadow-2xl relative"
            >
              <h3 className="text-sm font-black text-slate-900 mb-2">
                {lang === 'kh' ? 'សូមបញ្ជាក់ការលុប!' : 'Confirm Operation'}
              </h3>
              <p className="text-xs text-slate-500 font-bold mb-5 leading-relaxed">
                {lang === 'kh' 
                  ? 'តើអ្នកពិតជាចង់លុបទិន្នន័យវាយតម្លៃពិន្ទុបុគ្គលិកនេះមែនទេ? សកម្មភាពនេះមិនអាចបង្កើតឡើងវិញបានទេ!' 
                  : 'Are you sure you want to permanently erase this staff performance record? This cannot be undone.'}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteCsId(null)}
                  className="bg-slate-105 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  {lang === 'kh' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCsEvaluation}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2 rounded-xl active:scale-97 cursor-pointer"
                >
                  {lang === 'kh' ? 'យល់ព្រមលុប' : 'Erase Record'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

