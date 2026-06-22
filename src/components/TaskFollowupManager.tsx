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
  Shield, User, Landmark, Layers, FileText, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskFollowupManagerProps {
  currentUser?: UserAccount | null;
  lang?: 'kh' | 'en';
}

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
  // Sub-tab selection state: 'general' (General Tasks Admin) or 'insurance' (Student Insurance Tracking)
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'insurance'>('general');

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

  // Persists states
  useEffect(() => {
    localStorage.setItem('wis_followup_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('wis_insurance_followup_records', JSON.stringify(insuranceClaims));
  }, [insuranceClaims]);

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
              else handleOpenInsuranceForm();
            }}
            className="bg-[#052C2B] hover:bg-[#073B3A] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition duration-150 cursor-pointer shadow-xs active:scale-97 flex items-center gap-1.5"
          >
            <Plus className="w-4.5 h-4.5 stroke-[3]" />
            <span>{activeSubTab === 'general' ? (lang === 'kh' ? 'បន្ថែមការងារទូទៅ' : 'Add Admin Task') : (lang === 'kh' ? 'បន្ថែមតាមដានធានារ៉ាប់រង' : 'Add Insurance Follow-up')}</span>
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
                  <th className="py-4 px-4 w-40">{lang === 'kh' ? 'Westec PIC / PIC' : 'Westec PIC'}</th>
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

    </div>
  );
}
