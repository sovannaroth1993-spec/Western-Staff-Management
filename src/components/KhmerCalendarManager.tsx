/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Info, Plus, Trash2, ChevronLeft, ChevronRight, 
  Search, Download, Check, Sparkles, Printer, FileSpreadsheet, List, Trash, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

interface CalendarNote {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  category: 'general' | 'meeting' | 'event' | 'holiday_related' | 'duty';
  time?: string;
  recordedBy: string;
  createdAt: string;
}

interface Holiday {
  date: string; // MM-DD or YYYY-MM-DD
  nameKh: string;
  nameEn: string;
  type: 'national' | 'festival' | 'commemoration';
  descriptionKh: string;
  descriptionEn: string;
}

const SOLAR_HOLIDAYS: Holiday[] = [
  { date: "01-01", nameKh: "ថ្ងៃចូលឆ្នាំសកល", nameEn: "International New Year's Day", type: "national", descriptionKh: "ពិធីបុណ្យចូលឆ្នាំសកល ឆ្លងឆ្នាំចាស់ចូលឆ្នាំថ្មីទូទាំងពិភពលោក។", descriptionEn: "Celebration of the New Year on the Gregorian calendar." },
  { date: "01-07", nameKh: "ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍", nameEn: "Victory over Genocide Day", type: "national", descriptionKh: "ទិវារំលឹកដល់ការដួលរលំនៃរបបខ្មែរក្រហមក្នុងឆ្នាំ ១៩៧៩ ដើម្បីសង្គ្រោះជាតិកម្ពុជាពីរបបប្រល័យពូជសាសន៍។", descriptionEn: "Commemorates the fall of the brutal Khmer Rouge regime in 1979." },
  { date: "03-08", nameKh: "ទិវានារីអន្តរជាតិ", nameEn: "International Women's Day", type: "national", descriptionKh: "ទិវាអបអរសាទរ និងលើកកម្ពស់សិទ្ធិ ក៏ដូចជាសមភាពរបស់ស្ត្រីទូទាំងសកលលោក។", descriptionEn: "Honors the social, economic, cultural, and political achievements of women worldwide." },
  { date: "04-14", nameKh: "ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី១)", nameEn: "Khmer New Year Day 1", type: "festival", descriptionKh: "ថ្ងៃដំបូងនៃឆ្នាំថ្មីប្រពៃណីជាតិខ្មែរ (មហាសង្ក្រាន្ត) គឺជាថ្ងៃទទួលទេវតាឆ្នាំថ្មី។", descriptionEn: "First day of the Traditional Khmer New Year celebration (Maha Sangkran)." },
  { date: "04-15", nameKh: "ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី២)", nameEn: "Khmer New Year Day 2", type: "festival", descriptionKh: "ថ្ងៃទី២ នៃឆ្នាំថ្មីប្រពៃណីជាតិខ្មែរ (វារៈវ័នបត) ជាថ្ងៃជូនពរគុណពុកម៉ែ គ្រូបាអាចារ្យ និងធ្វើបុណ្យទាន។", descriptionEn: "Second day of the Traditional Khmer New Year (Veareak Vanabat)." },
  { date: "04-16", nameKh: "ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី៣)", nameEn: "Khmer New Year Day 3", type: "festival", descriptionKh: "ថ្ងៃទី៣ នៃឆ្នាំថ្មីប្រពៃណីជាតិខ្មែរ (វារៈឡើងស័ក) ជាថ្ងៃស្រង់ព្រះ សម្អាត រួចបញ្ចប់កម្មវិធីសប្បាយៗ។", descriptionEn: "Third and final day of the Traditional Khmer New Year (Veareak Laeung Sak)." },
  { date: "05-01", nameKh: "ទិវាពលកម្មអន្តរជាតិ", nameEn: "International Labour Day", type: "national", descriptionKh: "ទិវាឧទ្ទិសដល់ពលកម្ម កិច្ចការពារសិទ្ធិ លក្ខខណ្ឌការងារ និងសេរីភាពកម្មករនិយោជិតក្នុងពិភពលោក។", descriptionEn: "Celebration of the international labor movement and workers' solidarity." },
  { date: "05-14", nameKh: "ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះបាទសម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី", nameEn: "King Sihamoni's Birthday", type: "national", descriptionKh: "ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះករុណា ព្រះបាទសម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី ព្រះមហាក្សត្រនៃព្រះរាជាណាចក្រកម្ពុជា។", descriptionEn: "Celebrates the official birthday of His Majesty King Norodom Sihamoni, reigning king of Cambodia." },
  { date: "06-18", nameKh: "ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនិនាថ សីហនុ", nameEn: "Queen Mother's Birthday", type: "national", descriptionKh: "ព្រះរាជពិធីចម្រើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនិនាថ សីហនុ ព្រះវររាជមាតាជាតិខ្មែរជាទីគោរពសក្ការៈ។", descriptionEn: "Birthday of Her Majesty the Queen Mother Norodom Monineath Sihanouk of Cambodia." },
  { date: "09-24", nameKh: "ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ", nameEn: "Constitutional Day", type: "national", descriptionKh: "ការរំលឹកដល់ការប្រកាសរៀបចំ និងរដ្ឋធម្មនុញ្ញអចិន្ត្រៃយ៍ឡើងវិញរបស់ប្រទេសកម្ពុជានៅឆ្នាំ ១៩៩៣។", descriptionEn: "Commemorates the adoption of the permanent Constitution of the Kingdom of Cambodia in 1993." },
  { date: "10-15", nameKh: "ទិវាគោរពព្រះវិញ្ញាណក្ខន្ធ ព្រះបរមរតនកោដ្ឋ", nameEn: "King Father's Commemoration Day", type: "national", descriptionKh: "ទិវារំលឹកដល់ព្រះគុណូបការៈ និងការប្រារព្ធពិធីគោរពព្រះវិញ្ញាណក្ខន្ធ ព្រះករុណា ព្រះបាទសម្តេចព្រះ នរោត្តម សីហនុ ព្រះបរមរតនកោដ្ឋ សម្តេចឪជាតិ។", descriptionEn: "Honors the memory and dedication of the late King Father Norodom Sihanouk after his passing." },
  { date: "10-29", nameKh: "ព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ ព្រះបាទសម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី", nameEn: "King's Coronation Day", type: "national", descriptionKh: "ព្រះរាជពិធីបុណ្យខួបនៃការឡើងគ្រងព្រះបរមរាជសម្បត្តិជាផ្លូវការរបស់ ព្រះករុណា ព្រះបាទសម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី ក្នុងឆ្នាំ ២០០៤។", descriptionEn: "Anniversary of the official coronation ceremony of King Norodom Sihamoni." },
  { date: "11-09", nameKh: "ពិធីបុណ្យឯករាជ្យជាតិ", nameEn: "National Independence Day", type: "national", descriptionKh: "ទិវាប្រវត្តិសាស្ត្រនៃការទទួលបានឯករាជ្យពេញលេញពីសាធារណរដ្ឋបារាំងនៅឆ្នាំ ១៩៥៣ ក្រោមព្រះរាជបូជនីយកិច្ចដ៏ឧត្តុង្គឧត្តមរបស់សម្តេចឪ។", descriptionEn: "Commemorates Cambodia's historic declaration of independence from France in 1953." }
];

const LUNAR_HOLIDAYS_BY_YEAR: { [key: number]: Holiday[] } = {
  2025: [
    { date: "2025-05-12", nameKh: "ពិធីបុណ្យវិសាខបូជា", nameEn: "Visak Bochea Day", descriptionKh: "ជាថ្ងៃរំលឹកដល់ព្រឹត្តិការណ៍វិសេសបីគឺ ការប្រសូត ការត្រាស់ដឹង និងការរលត់ខន្ធចូលបរិនិព្វានរបស់ព្រះពុទ្ធសមណគោតម។", descriptionEn: "Commemorates the birth, enlightenment, and passing of the Buddha.", type: "festival" },
    { date: "2025-05-16", nameKh: "ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល", nameEn: "Royal Ploughing Ceremony", descriptionKh: "ព្រះរាជពិធីប្រពៃណីដើម្បីប្រកាសរដូវកសិកម្ម បង្កបង្កើនផលស្រូវប្រចាំឆ្នាំ និងការទស្សន៍ទាយផលកសិដ្ឋានផ្សេងៗ។", descriptionEn: "Ancient royal rite to mark the start of the rice-planting season and predict agriculture harvests.", type: "festival" },
    { date: "2025-09-21", nameKh: "ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី១)", nameEn: "Pchum Ben Day 1", descriptionKh: "ថ្ងៃដំបូងនៃពិធីបុណ្យភ្ជុំបិណ្ឌឧទ្ទិសកុសលជូនបុព្វការីជន និងញាតិដែលចែកឋានទៅ។", descriptionEn: "First day of Pchum Ben, a traditional Cambodian Buddhist festival for honoring deceased ancestors.", type: "festival" },
    { date: "2025-09-22", nameKh: "ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី២)", nameEn: "Pchum Ben Day 2", descriptionKh: "ថ្ងៃទីពីនៃពិធីបុណ្យភ្ជុំបិណ្ឌ។", descriptionEn: "Second day of the Pchum Ben Festival.", type: "festival" },
    { date: "2025-09-23", nameKh: "ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី៣)", nameEn: "Pchum Ben Day 3", descriptionKh: "ថ្ងៃបញ្ចប់នៃពិធីបុណ្យភ្ជុំបិណ្ឌ ដែលជាបុណ្យប្រពៃណីជាតិធំជាងគេបង្អស់។", descriptionEn: "Final and main day of the Pchum Ben Festival.", type: "festival" },
    { date: "2025-11-04", nameKh: "ពិធីបុណ្យអុំទូក (ថ្ងៃទី១)", nameEn: "Water Festival Day 1", descriptionKh: "ការបើកការប្រណាំងទូកងទូទាំងប្រទេស អរគុណដល់ទន្លេមេគង្គ និងទន្លេសាបដែលជួយផលិតផលដីល្បាប់មានជីជាតិ។", descriptionEn: "First day of the Water Festival including nationwide boat racing and fireworks.", type: "festival" },
    { date: "2025-11-05", nameKh: "ពិធីបុណ្យអុំទូក (ថ្ងៃទី២)", nameEn: "Water Festival Day 2", descriptionKh: "ប្រារព្ធពិធីបុណ្យបណ្តែតប្រទីប សំពះព្រះខែ និងអកអំបុកនាពេលរាត្រី។", descriptionEn: "Second day of the Water Festival with lantern floating (Loy Pratip) and moon greeting.", type: "festival" },
    { date: "2025-11-06", nameKh: "ពិធីបុណ្យអុំទូក (ថ្ងៃទី៣)", nameEn: "Water Festival Day 3", descriptionKh: "ថ្ងៃចុងក្រោយនៃការកាត់សេចក្តីជ័យលាភី និងការផ្តល់ពានរង្វាន់ទូកង។", descriptionEn: "Third and final day of the Water Festival in Phnom Penh.", type: "festival" }
  ],
  2026: [
    { date: "2026-05-01", nameKh: "ពិធីបុណ្យវិសាខបូជា", nameEn: "Visak Bochea Day", descriptionKh: "ជាថ្ងៃរំលឹកដល់ព្រឹត្តិការណ៍វិសេសបីគឺ ការប្រសូត ការត្រាស់ដឹង និងការរលត់ខន្ធចូលបរិនិព្វានរបស់ព្រះពុទ្ធសមណគោតម។", descriptionEn: "Commemorates the birth, enlightenment, and passing of the Buddha.", type: "festival" },
    { date: "2026-05-05", nameKh: "ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល", nameEn: "Royal Ploughing Ceremony", descriptionKh: "ព្រះរាជពិធីប្រពៃណីដើម្បីប្រកាសរដូវកសិកម្ម បង្កបង្កើនផលស្រូវប្រចាំឆ្នាំ និងការទស្សន៍ទាយផលកសិដ្ឋានផ្សេងៗ។", descriptionEn: "Ancient royal rite to mark the start of the rice-planting season and predict agriculture harvests.", type: "festival" },
    { date: "2026-10-10", nameKh: "ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី១)", nameEn: "Pchum Ben Day 1", descriptionKh: "ថ្ងៃដំបូងនៃពិធីបុណ្យភ្ជុំបិណ្ឌឧទ្ទិសកុសលជូនបុព្វការីជន និងញាតិដែលចែកឋានទៅ។", descriptionEn: "First day of Pchum Ben, a traditional Cambodian Buddhist festival for honoring deceased ancestors.", type: "festival" },
    { date: "2026-10-11", nameKh: "ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី២)", nameEn: "Pchum Ben Day 2", descriptionKh: "ថ្ងៃទីពីនៃពិធីបុណ្យភ្ជុំបិណ្ឌ។", descriptionEn: "Second day of the Pchum Ben Festival.", type: "festival" },
    { date: "2026-10-12", nameKh: "ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី៣)", nameEn: "Pchum Ben Day 3", descriptionKh: "ថ្ងៃបញ្ចប់នៃពិធីបុណ្យភ្ជុំបិណ្ឌ ដែលជាបុណ្យប្រពៃណីជាតិធំជាងគេបង្អស់។", descriptionEn: "Final and main day of the Pchum Ben Festival.", type: "festival" },
    { date: "2026-11-23", nameKh: "ពិធីបុណ្យអុំទូក (ថ្ងៃទី១)", nameEn: "Water Festival Day 1", descriptionKh: "ការបើកការប្រណាំងទូកងទូទាំងប្រទេស អរគុណដល់ទន្លេមេគង្គ និងទន្លេសាបដែលជួយផលិតផលដីល្បាប់មានជីជាតិ។", descriptionEn: "First day of the Water Festival including nationwide boat racing and fireworks.", type: "festival" },
    { date: "2026-11-24", nameKh: "ពិធីបុណ្យអុំទូក (ថ្ងៃទី២)", nameEn: "Water Festival Day 2", descriptionKh: "ប្រារព្ធពិធីបុណ្យបណ្តែតប្រទីប សំពះព្រះខែ និងអកអំបុកនាពេលរាត្រី។", descriptionEn: "Second day of the Water Festival with lantern floating (Loy Pratip) and moon greeting.", type: "festival" },
    { date: "2026-11-25", nameKh: "ពិធីបុណ្យអុំទូក (ថ្ងៃទី៣)", nameEn: "Water Festival Day 3", descriptionKh: "ថ្ងៃចុងក្រោយនៃការកាត់សេចក្តីជ័យលាភី និងការផ្តល់ពានរង្វាន់ទូកង។", descriptionEn: "Third and final day of the Water Festival in Phnom Penh.", type: "festival" }
  ],
  2027: [
    { date: "2027-05-20", nameKh: "ពិធីបុណ្យវិសាខបូជា", nameEn: "Visak Bochea Day", descriptionKh: "ជាថ្ងៃរំលឹកដល់ព្រឹត្តិការណ៍វិសេសបីគឺ ការប្រសូត ការត្រាស់ដឹង និងការរលត់ខន្ធចូលបរិនិព្វានរបស់ព្រះពុទ្ធសមណគោតម។", descriptionEn: "Commemorates the birth, enlightenment, and passing of the Buddha.", type: "festival" },
    { date: "2027-05-24", nameKh: "ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល", nameEn: "Royal Ploughing Ceremony", descriptionKh: "ព្រះរាជពិធីប្រពៃណីដើម្បីប្រកាសរដូវកសិកម្ម បង្កបង្កើនផលស្រូវប្រចាំឆ្នាំ និងការទស្សន៍ទាយផលកសិដ្ឋានផ្សេងៗ។", descriptionEn: "Ancient royal rite to mark the start of the rice-planting season and predict agriculture harvests.", type: "festival" },
    { date: "2027-09-29", nameKh: "ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី១)", nameEn: "Pchum Ben Day 1", descriptionKh: "ថ្ងៃដំបូងនៃពិធីបុណ្យភ្ជុំបិណ្ឌឧទ្ទិសកុសលជូនបុព្វការីជន និងញាតិដែលចែកឋានទៅ។", descriptionEn: "First day of Pchum Ben, a traditional Cambodian Buddhist festival for honoring deceased ancestors.", type: "festival" },
    { date: "2027-09-30", nameKh: "ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី២)", nameEn: "Pchum Ben Day 2", descriptionKh: "ថ្ងៃទីពីនៃពិធីបុណ្យភ្ជុំបិណ្ឌ។", descriptionEn: "Second day of the Pchum Ben Festival.", type: "festival" },
    { date: "2027-10-01", nameKh: "ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី៣)", nameEn: "Pchum Ben Day 3", descriptionKh: "ថ្ងៃបញ្ចប់នៃពិធីបុណ្យភ្ជុំបិណ្ឌ ដែលជាបុណ្យប្រពៃណីជាតិធំជាងគេបង្អស់។", descriptionEn: "Final and main day of the Pchum Ben Festival.", type: "festival" },
    { date: "2027-11-12", nameKh: "ពិធីបុណ្យអុំទូក (ថ្ងៃទី១)", nameEn: "Water Festival Day 1", descriptionKh: "ការបើកការប្រណាំងទូកងទូទាំងប្រទេស អរគុណដល់ទន្លេមេគង្គ និងទន្លេសាបដែលជួយផលិតផលដីល្បាប់មានជីជាតិ។", descriptionEn: "First day of the Water Festival including nationwide boat racing and fireworks.", type: "festival" },
    { date: "2027-11-13", nameKh: "ពិធីបុណ្យអុំទូក (ថ្ងៃទី២)", nameEn: "Water Festival Day 2", descriptionKh: "ប្រារព្ធពិធីបុណ្យបណ្តែតប្រទីប សំពះព្រះខែ និងអកអំបុកនាពេលរាត្រី។", descriptionEn: "Second day of the Water Festival with lantern floating (Loy Pratip) and moon greeting.", type: "festival" },
    { date: "2027-11-14", nameKh: "ពិធីបុណ្យអុំទូក (ថ្ងៃទី៣)", nameEn: "Water Festival Day 3", descriptionKh: "ថ្ងៃចុងក្រោយនៃការកាត់សេចក្តីជ័យលាភី និងការផ្តល់ពានរង្វាន់ទូកង។", descriptionEn: "Third and final day of the Water Festival in Phnom Penh.", type: "festival" }
  ]
};

const KHMER_MONTHS = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const KHMER_WEEKDAYS = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
const EN_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const NOTE_CATEGORIES = [
  { id: 'general', labelKh: 'ទូទៅ / General', colorClass: 'bg-slate-100 text-slate-800 border-slate-200' },
  { id: 'meeting', labelKh: 'ប្រជុំ / Meeting', colorClass: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: 'event', labelKh: 'កម្មវិធីសាលា / School Event', colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'holiday_related', labelKh: 'ការងារបុណ្យ / Holiday Duty', colorClass: 'bg-rose-50 text-rose-800 border-rose-200' },
  { id: 'duty', labelKh: 'កាតព្វកិច្ច / Duty Work', colorClass: 'bg-amber-50 text-amber-805 border-amber-200' },
];

export default function KhmerCalendarManager() {
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 5, 8)); // June 2026 as starting base
  const [selectedDateStr, setSelectedDateStr] = useState('2026-06-08');
  
  // Custom states
  const [useKhmerNums, setUseKhmerNums] = useState(true);
  const [notesList, setNotesList] = useState<CalendarNote[]>(() => {
    try {
      const saved = localStorage.getItem('wis_khmer_calendar_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Note entry editor states
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<CalendarNote['category']>('general');
  const [newNoteTime, setNewNoteTime] = useState('08:00');
  const [noteAuthor, setNoteAuthor] = useState('LOUNG Veasna');

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategory, setFilteredCategory] = useState<string>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('wis_khmer_calendar_notes', JSON.stringify(notesList));
  }, [notesList]);

  // Utility to convert number to Khmer digits
  const toKhmerNumStr = (num: number | string): string => {
    const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    return String(num).replace(/\d/g, (d) => khmerDigits[parseInt(d)]);
  };

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    const todayStr = today.toISOString().split('T')[0];
    setSelectedDateStr(todayStr);
  };

  // Get active holidays for current year
  const getHolidaysForCurrentYear = (): Holiday[] => {
    const solar = SOLAR_HOLIDAYS.map(h => ({
      ...h,
      date: `${year}-${h.date}`
    }));
    const lunar = LUNAR_HOLIDAYS_BY_YEAR[year] || [];
    return [...solar, ...lunar];
  };

  const holidays = getHolidaysForCurrentYear();

  // Check if a date string is a holiday
  const getHolidayForDate = (dateStr: string): Holiday | undefined => {
    return holidays.find(h => h.date === dateStr);
  };

  // Calculation of day dimensions for calendar grid
  const daysInMonthCount = new Date(year, month + 1, 0).getDate();
  const startDayIndex = new Date(year, month, 1).getDay(); // Sunday is 0, etc.

  // Calendar cells setup
  const cells: (string | null)[] = [];
  for (let i = 0; i < startDayIndex; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonthCount; d++) {
    const dayStr = d < 10 ? `0${d}` : `${d}`;
    const monthStr = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
    cells.push(`${year}-${monthStr}-${dayStr}`);
  }

  const handleCellClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
  };

  // Handle Add Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: CalendarNote = {
      id: `note_${Date.now()}`,
      date: selectedDateStr,
      text: newNoteText.trim(),
      category: newNoteCategory,
      time: newNoteTime || undefined,
      recordedBy: noteAuthor || 'LOUNG Veasna',
      createdAt: new Date().toISOString()
    };

    setNotesList(prev => [newNote, ...prev]);
    setNewNoteText('');
  };

  // Handle Delete Note
  const handleDeleteNote = (id: string) => {
    setNotesList(prev => prev.filter(n => n.id !== id));
  };

  // Notes specifically for the selected date
  const selectedDateNotes = notesList.filter(n => n.date === selectedDateStr);

  // Search filtered month-wide notes
  const monthPrefix = `${year}-${(month + 1) < 10 ? `0${month + 1}` : `${month + 1}`}`;
  const monthlyNotes = notesList.filter(n => n.date.startsWith(monthPrefix));

  const filteredMonthlyNotes = monthlyNotes.filter(n => {
    const matchesSearch = n.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (n.recordedBy && n.recordedBy.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = filteredCategory === 'all' || n.category === filteredCategory;
    return matchesSearch && matchesCat;
  });

  // Highlighted monthly holidays
  const monthlyHolidays = holidays.filter(h => h.date.startsWith(monthPrefix));

  // Export to Excel helper
  const handleExportExcel = () => {
    if (monthlyNotes.length === 0) {
      alert("មិនមានកំណត់ត្រាសម្រាប់ខែនេះទេ ដើម្បីទាញយកទិន្នន័យបាន។ No records found for export.");
      return;
    }

    const dataToExport = monthlyNotes.map((n, idx) => {
      const holidayOnNote = getHolidayForDate(n.date);
      return {
        "ល.រ (No.)": idx + 1,
        "កាលបរិច្ឆេទ (Date)": n.date,
        "ពេលវេលា (Time)": n.time || "N/A",
        "ខ្លឹមសារកំណត់ត្រា (Memo/Task)": n.text,
        "ប្រភេទ (Category)": n.category.toUpperCase(),
        "កត់ត្រាដោយ (Author)": n.recordedBy,
        "ថ្ងៃឈប់សម្រាករួមគ្នា (Holiday Name)": holidayOnNote ? `${holidayOnNote.nameKh} (${holidayOnNote.nameEn})` : "-"
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Calendar Memos ${year}-${month + 1}`);
    XLSX.writeFile(workbook, `Western_School_Calendar_Memos_${year}_${month + 1}.xlsx`);
  };

  // Print friendly version
  const handlePrint = () => {
    window.print();
  };

  // Readable selected date string in Khmer
  const formatSelectedKhmerDate = () => {
    const parts = selectedDateStr.split('-');
    if (parts.length !== 3) return '';
    const y = parseInt(parts[0]);
    const m = parseInt(parts[1]) - 1;
    const d = parseInt(parts[2]);
    
    // Day of week
    const dateObj = new Date(y, m, d);
    const dayOfWeek = KHMER_WEEKDAYS[dateObj.getDay()];
    const khDay = useKhmerNums ? toKhmerNumStr(d) : d;
    const khMonth = KHMER_MONTHS[m];
    const khYear = useKhmerNums ? toKhmerNumStr(y) : y;

    return `ថ្ងៃ${dayOfWeek} ទី${khDay} ខែ${khMonth} ឆ្នាំ${khYear}`;
  };

  return (
    <div id="khmer-calendar-workspace" className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-6 lg:p-8 shadow-sm">
      
      {/* Workspace Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-rose-50 text-rose-500 rounded-2xl">
              <Calendar className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-niroth text-rose-600">
                ប្រតិទិនកម្ពុជា & កំណត់ត្រាសាលារៀន (Cambodian Calendar & Memos)
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                ត្រួតពិនិត្យថ្ងៃឈប់សម្រាកបុណ្យជាតិប្រពៃណីខ្មែរ និងកត់ត្រាកាលវិភាគការងារ គ្រូ និងសិស្សសាលា
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Digits Toggle */}
          <button
            onClick={() => setUseKhmerNums(!useKhmerNums)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>លេខខ្មែរ (Khmer Digits): {useKhmerNums ? 'បើក / ON' : 'បិទ / OFF'}</span>
          </button>

          {/* Jump to Today */}
          <button
            onClick={jumpToToday}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all hover:scale-[1.02]"
          >
            ថ្ងៃនេះ (Today)
          </button>
        </div>
      </div>

      {/* Main Calendar Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* Left Side: Monthly Calendar View */}
        <div className="lg:col-span-8 flex flex-col">
          
          {/* Calendar Control Header Bar */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 sm:p-4 rounded-2xl mb-4">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 text-slate-600 hover:text-slate-900 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-wide font-nitean text-indigo-600">
                ខែ {KHMER_MONTHS[month]} ( {EN_MONTHS[month]} ) {useKhmerNums ? toKhmerNumStr(year) : year}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
                Western International School Hub Calendar
              </p>
            </div>

            <button
              onClick={nextMonth}
              className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 text-slate-600 hover:text-slate-900 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid Container */}
          <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-inner bg-slate-50">
            {/* Weekdays indicator */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/50">
              {KHMER_WEEKDAYS.map((wkDay, idx) => (
                <div 
                  key={idx} 
                  className={`py-3 text-center text-xs font-bold ${
                    idx === 0 ? 'text-red-500 bg-red-50/10' : idx === 6 ? 'text-amber-600' : 'text-slate-600'
                  }`}
                >
                  <span className="block sm:hidden">{wkDay.charAt(0)}</span>
                  <span className="hidden sm:inline">{wkDay}</span>
                  <span className="block text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">{EN_WEEKDAYS[idx].substring(0,3)}</span>
                </div>
              ))}
            </div>

            {/* Monthly Days Cells */}
            <div className="grid grid-cols-7 gap-[1px] bg-slate-200">
              {cells.map((cellDateStr, cellIdx) => {
                if (cellDateStr === null) {
                  return (
                    <div key={`empty-${cellIdx}`} className="bg-slate-50/50 min-h-[75px] sm:min-h-[105px]" />
                  );
                }

                const dNum = parseInt(cellDateStr.split('-')[2]);
                const displayDay = useKhmerNums ? toKhmerNumStr(dNum) : dNum;
                
                const isSelected = cellDateStr === selectedDateStr;
                const isTodayStr = new Date().toISOString().split('T')[0] === cellDateStr;
                const holiday = getHolidayForDate(cellDateStr);
                const hasHoliday = !!holiday;
                
                // Day of week index
                const dayOfWeekIdx = cellIdx % 7;
                const isWeekend = dayOfWeekIdx === 0 || dayOfWeekIdx === 6;

                // Calendar Notes Count for this cell
                const cellNotes = notesList.filter(n => n.date === cellDateStr);
                const hasNotes = cellNotes.length > 0;

                return (
                  <div
                    key={cellDateStr}
                    onClick={() => handleCellClick(cellDateStr)}
                    className={`min-h-[75px] sm:min-h-[105px] p-1.5 sm:p-2 bg-white flex flex-col justify-between cursor-pointer transition-all relative hover:bg-amber-50/40 select-none ${
                      isSelected ? 'ring-2 ring-inset ring-indigo-500 bg-indigo-50/20' : ''
                    } ${isTodayStr ? 'bg-amber-50/60 font-semibold' : ''}`}
                  >
                    {/* Top line: Day Number + holiday badge + today mark */}
                    <div className="flex items-center justify-between">
                      <span 
                        className={`text-xs sm:text-sm font-bold flex items-center justify-center rounded-full w-6 h-6 sm:w-7 sm:h-7 ${
                          isTodayStr 
                            ? 'bg-amber-500 text-white shadow-sm' 
                            : hasHoliday 
                              ? 'bg-rose-500 text-white shadow-xs' 
                              : isWeekend 
                                ? 'text-red-500' 
                                : 'text-slate-700'
                        }`}
                      >
                        {displayDay}
                      </span>

                      {/* Small visual dot indicators */}
                      <div className="flex gap-0.5 sm:gap-1">
                        {hasHoliday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" title="ថ្ងៃបុណ្យជាតិ" />
                        )}
                        {hasNotes && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" title={`${cellNotes.length} កំណត់ត្រា`} />
                        )}
                      </div>
                    </div>

                    {/* Middle segment: Holiday short name */}
                    <div className="flex-1 mt-1 sm:mt-1.5 overflow-hidden">
                      {hasHoliday && (
                        <div className="text-[8px] sm:text-[10px] text-red-600 font-semibold leading-tight line-clamp-2 bg-rose-50 px-1 py-0.5 rounded-sm sm:rounded border border-red-100">
                          {holiday.nameKh}
                        </div>
                      )}
                    </div>

                    {/* Bottom row: count of memos inside indicator capsule */}
                    {hasNotes && (
                      <div className="mt-1 flex items-center justify-end">
                        <span className="text-[7px] sm:text-[9px] bg-slate-100 text-slate-600 px-1 rounded sm:rounded-md border border-slate-200 flex items-center gap-0.5">
                          <Check className="w-2 h-2 text-indigo-500" />
                          <span>{useKhmerNums ? toKhmerNumStr(cellNotes.length) : cellNotes.length} ភារកិច្ច</span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick instructions indicator */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500">
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>ចុចលើប្រអប់ថ្ងៃនីមួយៗ ដើម្បីកត់ត្រារំលឹក ឬមើលពត៌មានលំអិតអំពីថ្ងៃឈប់សម្រាក។</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-505 border border-rose-300" />
                <span className="text-slate-500 font-semibold">ថ្ងៃបុណ្យជាតិ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-505 border border-indigo-300" />
                <span className="text-slate-500 font-semibold">មានកំណត់ត្រា</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-205 border border-amber-300" />
                <span className="text-slate-500 font-semibold">ថ្ងៃបច្ចុប្បន្ន</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Selected Date Details & Notepad editor */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Section: Selected Date overview and notes */}
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl flex flex-col">
            
            {/* Khmer Calendar focused Date display */}
            <div className="border-b border-slate-200 pb-4 text-center">
              <span className="text-[10px] font-black tracking-widest text-[#d97706] uppercase bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full inline-block">
                កាលបរិច្ឆេទជ្រើសរើស (Selected Date)
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2 font-nitean text-slate-800 leading-snug">
                {formatSelectedKhmerDate()}
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {selectedDateStr}
              </p>
            </div>

            {/* If focused day is holiday, show a glamorous card info block */}
            {getHolidayForDate(selectedDateStr) && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-left">
                <div className="flex items-start gap-2">
                  <span className="p-1 px-2 bg-rose-500 text-white rounded-lg text-[10px] uppercase font-black tracking-wide mt-0.5 animate-pulse">
                    បុណ្យជាតិ
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-rose-700 leading-tight">
                      {getHolidayForDate(selectedDateStr)?.nameKh}
                    </h4>
                    <span className="block text-xs text-rose-500 font-medium tracking-tight mt-0.5">
                      {getHolidayForDate(selectedDateStr)?.nameEn}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed border-t border-rose-200/50 pt-2.5">
                  {getHolidayForDate(selectedDateStr)?.descriptionKh}
                </p>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-snug italic font-medium">
                  {getHolidayForDate(selectedDateStr)?.descriptionEn}
                </p>
              </div>
            )}

            {/* Note add Form block */}
            <form onSubmit={handleAddNote} className="mt-4 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                បន្ថែមការកត់ត្រាថ្មី (Create Memo Task)
              </h4>
              
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="សូមសរសេរកំណត់ត្រា ការពារសន្តិសុខ ប្រជុំ ការងារថ្នាក់រៀន... (Write memo here)"
                className="w-full min-h-[75px] max-h-[120px] p-3 text-xs bg-white text-slate-800 border-2 border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl resize-none placeholder-slate-400 transition-colors"
                maxLength={300}
                required
              />

              <div className="grid grid-cols-2 gap-2">
                {/* Time picker */}
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    ម៉ោង (Time)
                  </label>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1.5" />
                    <input
                      type="time"
                      value={newNoteTime}
                      onChange={(e) => setNewNoteTime(e.target.value)}
                      className="text-xs text-slate-700 focus:outline-none w-full bg-transparent"
                    />
                  </div>
                </div>

                {/* Author picker */}
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    អ្នកកត់ត្រា (Author)
                  </label>
                  <input
                    type="text"
                    value={noteAuthor}
                    onChange={(e) => setNoteAuthor(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 px-2 focus:outline-none focus:border-indigo-500 text-slate-700 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Category picker */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  ប្រភេទការងារ (Category)
                </label>
                <select
                  value={newNoteCategory}
                  onChange={(e) => setNewNoteCategory(e.target.value as CalendarNote['category'])}
                  className="w-full text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-indigo-500"
                >
                  {NOTE_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.labelKh}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 hover:shadow-none transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>ចុះបញ្ចូលកំណត់ត្រា (Add Note)</span>
              </button>
            </form>

            {/* List of existing notes for this selected date */}
            <div className="mt-5 border-t border-slate-200 pt-4 flex-1">
              <h4 className="text-xs font-black text-slate-650 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>កំណត់ត្រាថ្ងៃនេះ ({useKhmerNums ? toKhmerNumStr(selectedDateNotes.length) : selectedDateNotes.length})</span>
                <span className="font-mono text-[10px] text-slate-400">MEMOS</span>
              </h4>

              {selectedDateNotes.length === 0 ? (
                <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center">
                  <List className="w-5 h-5 text-slate-350 stroke-1 block mb-1 animate-bounce" />
                  <span className="text-xs">មិនមានទិន្នន័យកត់ត្រារំលឹកឡើយ</span>
                  <span className="text-[10px] text-slate-350 block mt-0.5">No memos recorded for today</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {selectedDateNotes.map(n => {
                    const catInfo = NOTE_CATEGORIES.find(c => c.id === n.category);
                    return (
                      <div 
                        key={n.id} 
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 shadow-xs bg-white relative group overflow-hidden ${
                          catInfo?.colorClass || 'border-slate-200'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {n.time && (
                              <span className="text-[10px] font-bold text-slate-500 font-mono flex items-center gap-0.5 bg-slate-100 px-1 py-0.5 rounded">
                                <Clock className="w-2.5 h-2.5" />
                                {n.time}
                              </span>
                            )}
                            <span className="text-[9px] text-slate-400 leading-tight">
                              ដោយៈ {n.recordedBy}
                            </span>
                          </div>
                          
                          <p className="text-xs font-semibold text-slate-800 leading-relaxed mt-1 break-words">
                            {n.text}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeleteNote(n.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-slate-50 cursor-pointer"
                          title="លុបចោល"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Monthly Summary & Consolidated Agenda Memos list */}
      <div className="mt-8 border-t border-slate-100 pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-nitean text-slate-850 flex items-center gap-1.5">
              <span>សរុបរបៀបវារៈកំណត់ត្រាប្រចាំខែ (Monthly consolidated Memos)</span>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 rounded-md font-bold font-sans">
                {useKhmerNums ? toKhmerNumStr(monthlyNotes.length) : monthlyNotes.length} ភារកិច្ច
              </span>
            </h3>
            <p className="text-xs text-slate-450 mt-0.5">
              បណ្តុំកំណត់ត្រា ការប្រជុំ កិច្ចការពិសេស និងតារាងឈប់សម្រាកប្រចាំខែដែលបង្ហាញខាងលើ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search items bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ស្វែងរកកំណត់ត្រា... (Search)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8.5 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl bg-slate-50 hover:bg-slate-100 focus:bg-white border-2 border-transparent transition-all w-[180px] sm:w-[220px]"
              />
            </div>

            {/* Category filter select */}
            <select
              value={filteredCategory}
              onChange={(e) => setFilteredCategory(e.target.value)}
              className="text-xs text-slate-650 bg-slate-50 hover:bg-slate-100 border border-transparent rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">ប្រភេទ-ទាំងអស់ (All Categories)</option>
              {NOTE_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.labelKh}
                </option>
              ))}
            </select>

            {/* Print and Excel export actions */}
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-colors"
              title="ទាញយកជា Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">នាំចេញជា Excel (Export Excel)</span>
            </button>
          </div>
        </div>

        {/* Consolidated Memos grid or list view */}
        {filteredMonthlyNotes.length === 0 ? (
          <div className="py-12 border border-dashed border-slate-150 rounded-3xl text-center bg-slate-50/30 flex flex-col items-center justify-center">
            <Info className="w-6 h-6 text-slate-350 block mb-1.5" />
            <h4 className="text-xs font-bold text-slate-500">មិនមានកំណត់ត្រាត្រូវតាមតម្រូវការស្វែងរកទេ</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">No memos matching selected categories or search string for this month.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-2">
            {filteredMonthlyNotes.map(n => {
              const catInfo = NOTE_CATEGORIES.find(c => c.id === n.category);
              const isCellDateHoliday = getHolidayForDate(n.date);
              
              // format date for specific note list
              const [ny, nm, nd] = n.date.split('-');
              const khDay = useKhmerNums ? toKhmerNumStr(nd) : nd;
              const khYear = useKhmerNums ? toKhmerNumStr(ny) : ny;
              const memoDateKhmer = `ថ្ងៃទី${khDay} ខែ${KHMER_MONTHS[parseInt(nm) - 1]} ${khYear}`;

              return (
                <div 
                  key={n.id}
                  onClick={() => setSelectedDateStr(n.date)}
                  className={`p-4 rounded-2xl border text-left bg-white transition-all hover:shadow-md cursor-pointer hover:border-slate-300 relative group flex flex-col justify-between ${
                    selectedDateStr === n.date ? 'ring-2 ring-indigo-500 border-transparent shadow' : 'border-slate-150'
                  }`}
                >
                  <div>
                    {/* Top row metadata info */}
                    <div className="flex flex-wrap items-center justify-between gap-1 border-b border-slate-100 pb-2 mb-2">
                      <span className="text-[10px] font-bold text-slate-505 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                        {memoDateKhmer}
                      </span>
                      {n.time && (
                        <span className="text-[9px] font-mono font-bold text-slate-450 flex items-center gap-0.5 bg-slate-50 border border-slate-150 px-1 py-0.5 rounded-sm">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          {n.time}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed mb-3">
                      {n.text}
                    </p>
                  </div>

                  {/* Footing note row info */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-auto">
                    <span className={`text-[8px] sm:text-[9px] font-bold tracking-tight px-1.5 py-0.5 rounded border ${catInfo?.colorClass || 'text-slate-550 bg-slate-50'}`}>
                      {catInfo?.labelKh.split(' / ')[0]}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-400">
                        ដោយៈ {n.recordedBy}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(n.id);
                        }}
                        className="text-slate-350 hover:text-red-500 bg-slate-50 hover:bg-red-55/70 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="លុបចោល"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Consolidated Cambodian Public Holidays list for active Month view */}
      <div className="mt-8 bg-slate-50 p-5 rounded-3xl border border-slate-150">
        <h4 className="text-sm font-bold text-slate-800 font-nitean tracking-wider border-b border-slate-200 pb-2 mb-3">
          🗓️ ថ្ងៃឈប់សម្រាកជាតិប្រចាំខែនេះ (Cambodian Holidays for {EN_MONTHS[month]}):
        </h4>

        {monthlyHolidays.length === 0 ? (
          <p className="text-xs text-slate-500 italic">មិនមានថ្ងៃឈប់សម្រាកផ្លូវការនៅក្នុងខែនេះឡើយ។ No official holidays scheduled in this month.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monthlyHolidays.map((h, idx) => {
              const dNum = parseInt(h.date.split('-')[2]);
              const dKh = useKhmerNums ? toKhmerNumStr(dNum) : dNum;
              return (
                <div key={idx} className="flex gap-3 bg-white p-3 rounded-2xl border border-slate-150 text-left">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-rose-50 text-rose-505 flex flex-col items-center justify-center border border-rose-100 font-bold">
                    <span className="text-xs uppercase leading-none font-sans font-black tracking-tighter text-slate-400">{EN_MONTHS[month].substring(0,3)}</span>
                    <span className="text-base leading-none tracking-tight font-nitean mt-0.5">{dKh}</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-rose-700 leading-tight">
                      {h.nameKh}
                    </h5>
                    <span className="block text-[10px] text-slate-450 font-medium tracking-tight mt-0.5">
                      {h.nameEn}
                    </span>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 leading-snug">
                      {h.descriptionKh}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
