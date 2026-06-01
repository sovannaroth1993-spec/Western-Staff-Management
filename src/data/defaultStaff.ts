/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Staff } from '../types';

export const DEFAULT_STAFF: Staff[] = [
  // Security Section (សន្តិសុខ)
  {
    id: 'WIS-SEC-001',
    no: 1,
    staffId: 'WIS-SEC-001',
    name: 'សោម សុខា',
    gender: 'ប្រុស',
    dob: '1988-04-12',
    joinDate: '2022-03-01',
    phoneNumber: '012 345 678',
    photo: '', // Empty photo means use the generated default preview avatar
    department: 'Security'
  },
  {
    id: 'WIS-SEC-002',
    no: 2,
    staffId: 'WIS-SEC-002',
    name: 'កែវ ពិសិដ្ឋ',
    gender: 'ប្រុស',
    dob: '1992-08-23',
    joinDate: '2023-06-15',
    phoneNumber: '085 999 111',
    photo: '',
    department: 'Security'
  },
  
  // Cleaner Section (អ្នកអនាម័យ)
  {
    id: 'WIS-CLN-001',
    no: 3,
    staffId: 'WIS-CLN-001',
    name: 'ចាន់ ធារី',
    gender: 'ស្រី',
    dob: '1985-05-15',
    joinDate: '2021-09-10',
    phoneNumber: '097 555 4443',
    photo: '',
    department: 'Cleaner'
  },
  {
    id: 'WIS-CLN-002',
    no: 4,
    staffId: 'WIS-CLN-002',
    name: 'សុខ ស្រីនឿន',
    gender: 'ស្រី',
    dob: '1990-11-02',
    joinDate: '2023-11-20',
    phoneNumber: '010 888 222',
    photo: '',
    department: 'Cleaner'
  },
  {
    id: 'WIS-CLN-003',
    no: 5,
    staffId: 'WIS-CLN-003',
    name: 'លី ចាន់ណា',
    gender: 'ស្រី',
    dob: '1987-01-30',
    joinDate: '2022-05-05',
    phoneNumber: '092 123 456',
    photo: '',
    department: 'Cleaner'
  },
  // Librarian Section (បណ្ណារ័ក្ស)
  {
    id: 'WIS-LIB-001',
    no: 6,
    staffId: 'WIS-LIB-001',
    name: 'ជា ពិសី',
    gender: 'ស្រី',
    dob: '1995-12-10',
    joinDate: '2024-02-15',
    phoneNumber: '070 456 789',
    photo: '',
    department: 'Librarian'
  },
 
  // Nurse Section (គិលានុបដ្ឋាយិកា)
  {
    id: 'WIS-NUR-001',
    no: 7,
    staffId: 'WIS-NUR-001',
    name: 'អ៊ុំ សុវណ្ណារី',
    gender: 'ស្រី',
    dob: '1991-03-25',
    joinDate: '2023-04-10',
    phoneNumber: '012 777 888',
    photo: '',
    department: 'Nurse'
  },
 
  // Customer Service Section (បម្រើសេវាកម្មអតិថិជន)
  {
    id: 'WIS-CS-001',
    no: 8,
    staffId: 'WIS-CS-001',
    name: 'អ៊ាង សុជាតា',
    gender: 'ស្រី',
    dob: '1997-07-18',
    joinDate: '2024-08-01',
    phoneNumber: '015 654 321',
    photo: '',
    department: 'Customer Service'
  },
  {
    id: 'WIS-CS-002',
    no: 9,
    staffId: 'WIS-CS-002',
    name: 'សេង ម៉េងហុង',
    gender: 'ប្រុស',
    dob: '1996-10-05',
    joinDate: '2025-01-10',
    phoneNumber: '088 222 3333',
    photo: '',
    department: 'Customer Service'
  },
  
  // Lab Assistant Section (ជំនួយការបន្ទប់ពិសោធន៍)
  {
    id: 'WIS-LAB-001',
    no: 10,
    staffId: 'WIS-LAB-001',
    name: 'ឈឿន សំណាង',
    gender: 'ប្រុស',
    dob: '1995-12-12',
    joinDate: '2024-11-01',
    phoneNumber: '096 123 4567',
    photo: '',
    department: 'Lab Assistant'
  },
  {
    id: 'WIS-LAB-002',
    no: 11,
    staffId: 'WIS-LAB-002',
    name: 'គង់ ស្រីលីន',
    gender: 'ស្រី',
    dob: '1998-04-20',
    joinDate: '2025-02-15',
    phoneNumber: '077 888 999',
    photo: '',
    department: 'Lab Assistant'
  }
];
