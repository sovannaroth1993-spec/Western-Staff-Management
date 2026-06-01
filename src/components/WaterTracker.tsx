/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { WaterRecord } from '../types';
import { 
  Droplet, Calendar, Plus, Edit2, Trash2, TrendingUp, TrendingDown, 
  Calculator, Info, AlertCircle, ArrowUpRight, ArrowDownRight, X, HelpCircle, User,
  FileText, FileSpreadsheet, FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { exportWaterToPdf } from '../utils/pdfHelper';
import { exportWaterToExcel } from '../utils/excelHelper';

interface WaterTrackerProps {
  waterRecords: WaterRecord[];
  setWaterRecords: (records: WaterRecord[]) => void;
}

// Format number with USD currency style
const formatUSD = (num: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
};

// Format Khmer Month names from YYYY-MM
const formatKhmerMonth = (monthYearStr: string) => {
  if (!monthYearStr) return '';
  const [year, month] = monthYearStr.split('-');
  const khmerMonths = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];
  const monthIndex = parseInt(month, 10) - 1;
  const khmerMonthName = khmerMonths[monthIndex] || month;
  return `${khmerMonthName} ${year}`;
};

export default function WaterTracker({
  waterRecords,
  setWaterRecords
}: WaterTrackerProps) {
  
  // Local interface states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [formMonthYear, setFormMonthYear] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  });
  const [formCostBeforeUsd, setFormCostBeforeUsd] = useState<string>('');
  const [formCostAfterUsd, setFormCostAfterUsd] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formRecordedBy, setFormRecordedBy] = useState<string>('LOUNG Veasna');
  const [formError, setFormError] = useState<string>('');

  // Chronologically sorted records helper
  const sortedRecords = useMemo(() => {
    return [...waterRecords].sort((a, b) => a.monthYear.localeCompare(b.monthYear));
  }, [waterRecords]);

  // Overall statistics summaries based on USD $
  const stats = useMemo(() => {
    if (waterRecords.length === 0) return null;
    
    const totalCostUsd = waterRecords.reduce((sum, r) => sum + r.costAfterUsd, 0);
    const averageCostUsd = totalCostUsd / waterRecords.length;
    
    // Find the record with extreme costAfterUsd
    let highestRecord = waterRecords[0];
    let lowestRecord = waterRecords[0];
    
    waterRecords.forEach(r => {
      if (r.costAfterUsd > highestRecord.costAfterUsd) highestRecord = r;
      if (r.costAfterUsd < lowestRecord.costAfterUsd) lowestRecord = r;
    });

    // Comparison for the latest recorded month
    const latestRecord = sortedRecords[sortedRecords.length - 1];

    return {
      totalCostUsd,
      averageCostUsd,
      highestRecord,
      lowestRecord,
      latestRecord
    };
  }, [waterRecords, sortedRecords]);

  // Reset Form states
  const handleResetForm = () => {
    const d = new Date();
    setFormMonthYear(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`);
    setFormCostBeforeUsd('');
    setFormCostAfterUsd('');
    setFormNotes('');
    setFormRecordedBy('LOUNG Veasna');
    setFormError('');
    setEditingId(null);
  };

  // Trigger Edit record
  const handleEditInit = (record: WaterRecord) => {
    setEditingId(record.id);
    setFormMonthYear(record.monthYear);
    setFormCostBeforeUsd(record.costBeforeUsd.toString());
    setFormCostAfterUsd(record.costAfterUsd.toString());
    setFormNotes(record.notes || '');
    setFormRecordedBy(record.recordedBy);
    setIsFormOpen(true);
    setFormError('');
  };

  // Save/Add record
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const before = parseFloat(formCostBeforeUsd);
    const after = parseFloat(formCostAfterUsd);

    if (isNaN(before) || isNaN(after) || before < 0 || after < 0) {
      setFormError('សូមបញ្ចូលតម្លៃការប្រើប្រាស់ឱ្យបានត្រឹមត្រូវ និងវិជ្ជមានជាដុល្លារ ($)!');
      return;
    }

    // Check if month already exists (unless editing the same month)
    const existingMonth = waterRecords.find(
      r => r.monthYear === formMonthYear && r.id !== editingId
    );
    if (existingMonth) {
      setFormError(`កម្រងទិន្នន័យសម្រាប់ខែ "${formatKhmerMonth(formMonthYear)}" មានរួចរាល់ហើយ! សូមកែប្រែទិន្នន័យចាស់ជំនួសវិញ។`);
      return;
    }

    const differenceUsd = after - before;
    let differencePercent = 0;
    if (before > 0) {
      differencePercent = (differenceUsd / before) * 100;
    }

    if (editingId) {
      // Edit existing
      const updated = waterRecords.map(r => {
        if (r.id === editingId) {
          return {
            ...r,
            monthYear: formMonthYear,
            costBeforeUsd: before,
            costAfterUsd: after,
            differenceUsd,
            differencePercent,
            notes: formNotes,
            recordedBy: formRecordedBy,
            recordedAt: new Date().toISOString()
          };
        }
        return r;
      });
      setWaterRecords(updated);
    } else {
      // Add new
      const newRecord: WaterRecord = {
        id: `water_${Date.now()}`,
        monthYear: formMonthYear,
        costBeforeUsd: before,
        costAfterUsd: after,
        differenceUsd,
        differencePercent,
        recordedAt: new Date().toISOString(),
        recordedBy: formRecordedBy,
        notes: formNotes
      };
      setWaterRecords([...waterRecords, newRecord]);
    }

    setIsFormOpen(false);
    handleResetForm();
  };

  // Perform delete
  const handleDeleteRecord = (id: string) => {
    setWaterRecords(waterRecords.filter(r => r.id !== id));
    setDeleteId(null);
  };

  // Computed local difference for current typing
  const liveDiffUsd = useMemo(() => {
    const before = parseFloat(formCostBeforeUsd);
    const after = parseFloat(formCostAfterUsd);
    if (!isNaN(before) && !isNaN(after)) {
      return after - before;
    }
    return null;
  }, [formCostBeforeUsd, formCostAfterUsd]);

  const liveDiffPercent = useMemo(() => {
    const before = parseFloat(formCostBeforeUsd);
    if (liveDiffUsd !== null && !isNaN(before) && before > 0) {
      return (liveDiffUsd / before) * 100;
    }
    return null;
  }, [liveDiffUsd, formCostBeforeUsd]);

  return (
    <div className="space-y-6">
      
      {/* Upper bar & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-sky-50/40 border border-sky-100 p-5 rounded-2xl animate-fade-in">
        <div className="flex items-start gap-3">
          <span className="p-3 bg-sky-500/10 text-sky-600 rounded-xl mt-1 shrink-0">
            <Droplet className="w-6 h-6 fill-sky-500/30 text-sky-500" />
          </span>
          <div>
            <h3 className="text-lg font-black text-slate-800">
              ការគ្រប់គ្រងការប្រើប្រាស់ទឹកប្រចាំខែ (Monthly Water Supply Analysis)
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              ប្រៀបធៀប និងតាមដានរបាយការណ៍ចំណាយទឹក ចន្លោះការប្រើប្រាស់ខែមុន និងខែបន្ទាប់គិតជាដុល្លារ ($)
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            handleResetForm();
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-md shadow-sky-100 shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          បញ្ចូលទិន្នន័យទឹក ($)
        </button>
      </div>

      {/* Numerical Stats Summaries if available */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Box 1: Latest month consumption widget */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between">
              <div>
                <span className="bg-sky-500 text-slate-950 text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase">
                  ការប្រើប្រាស់ទឹកចុងក្រោយ (Latest)
                </span>
                <h4 className="text-sm font-black text-slate-300 mt-2">
                  ខែ {stats.latestRecord ? formatKhmerMonth(stats.latestRecord.monthYear) : 'N/A'}
                </h4>
              </div>
              <div className="p-2.5 bg-slate-800 rounded-xl text-sky-400">
                <Droplet className="w-5 h-5 fill-sky-500/20" />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tracking-tight">
                  {stats.latestRecord ? formatUSD(stats.latestRecord.costAfterUsd) : '$0.00'}
                </span>
                <span className="text-xs font-black text-slate-400">USD ($)</span>
              </div>
              
              {/* MoM Comparison string */}
              {stats.latestRecord && (
                <div className="flex items-center gap-1 mt-2">
                  {stats.latestRecord.differenceUsd > 0 ? (
                    <div className="inline-flex items-center gap-0.5 text-xs text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md font-bold">
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                      +{formatUSD(stats.latestRecord.differenceUsd)} (+{stats.latestRecord.differencePercent.toFixed(1)}%)
                    </div>
                  ) : stats.latestRecord.differenceUsd < 0 ? (
                    <div className="inline-flex items-center gap-0.5 text-xs text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-md font-bold">
                      <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                      {formatUSD(stats.latestRecord.differenceUsd)} ({stats.latestRecord.differencePercent.toFixed(1)}%)
                    </div>
                  ) : (
                    <span className="text-xs text-slate-450 font-bold bg-slate-800 px-1.5 py-0.5 rounded-md text-slate-300">
                      ថេរស្មើនឹងខែមុន
                    </span>
                  )}
                  <span className="text-[10px] font-semibold text-slate-400">ធៀបនឹងខែមុន</span>
                </div>
              )}
            </div>

            {/* Accent color lines */}
            <div className="absolute top-0 right-0 w-16 h-1 bg-sky-500" />
          </div>

          {/* Box 2: Cost Summary */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-md flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between">
              <div>
                <span className="bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase">
                  ចំណាយលើទឹកសរុប (All Months)
                </span>
                <h4 className="text-base font-black text-slate-700 tracking-wide mt-2">
                  ទឹកប្រាក់សរុបទាំងអស់ ($)
                </h4>
              </div>
              <div className="p-2.5 bg-sky-50 text-sky-650 text-sky-600 rounded-xl">
                <Calculator className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                  {formatUSD(stats.totalCostUsd)}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-2">
                តម្លៃមធ្យមភាគប្រចាំខែ៖ <span className="text-slate-700 font-extrabold">{formatUSD(stats.averageCostUsd)}</span>
              </p>
            </div>
            {/* Accent color status line */}
            <div className="w-full h-1 bg-sky-500 absolute bottom-0 left-0" />
          </div>

          {/* Box 3: Historical Highlights insights */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-md flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between">
              <div>
                <span className="bg-sky-50 text-sky-850 border border-sky-100 text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase">
                  របាយការណ៍សន្សំបំផុត (Insights)
                </span>
                <h4 className="text-base font-black text-slate-700 mt-2">
                  ខែប្រើប្រាស់ទាប/ខ្ពស់ជាងគេ
                </h4>
              </div>
              <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
                <Info className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-500 font-semibold font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>ខ្ពស់បំផុត៖ ({formatKhmerMonth(stats.highestRecord.monthYear)})</span>
                </div>
                <span className="font-extrabold text-rose-600">
                  {formatUSD(stats.highestRecord.costAfterUsd)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-500 font-semibold font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>ទាបបំផុត៖ ({formatKhmerMonth(stats.lowestRecord.monthYear)})</span>
                </div>
                <span className="font-extrabold text-emerald-650 text-emerald-650 text-emerald-600">
                  {formatUSD(stats.lowestRecord.costAfterUsd)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-1.5 mt-1">
                <span className="text-slate-400 font-extrabold">មធ្យមភាគចំណាយ៖</span>
                <span className="font-black text-slate-700">{formatUSD(stats.averageCostUsd)} / ខែ</span>
              </div>
            </div>
          </div>

        </div>
      ) : null}

      {/* Main Records List & Visual Comparisons */}
      {sortedRecords.length === 0 ? (
        <div className="text-center py-24 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-6">
          <Droplet className="w-14 h-14 text-slate-300 mx-auto mb-2.5" />
          <h4 className="text-sm font-extrabold text-slate-700">មិនទាន់មានទិន្នន័យចំណាយទឹកប្រចាំខែទេ</h4>
          <p className="text-xs text-slate-400 font-semibold mt-1 max-w-sm mx-auto">
            ចុចលើប៊ូតុង <span className="underline text-sky-600 font-extrabold">"បញ្ចូលទិន្នន័យទឹក ($)"</span> ខាងលើ ដើម្បីបញ្ចូលទិន្នន័យប្រៀបធៀបចំណាយទឹកប្រចាំខែ!
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          
          {/* Header Panel */}
          <div className="p-4 bg-slate-50 border-b border-gray-200/60 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h4 className="text-sm font-black text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              ប្រវត្តិនៃការចុះបញ្ជី និងប្រៀបធៀបចំណាយទឹក (Water Supply Expense Comparison)
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] bg-slate-200 text-slate-700 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                ទិន្នន័យសរុប {sortedRecords.length} របាយការណ៍
              </span>
              
              {/* Save PDF Link Button */}
              <button
                onClick={() => exportWaterToPdf(waterRecords)}
                className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-black px-3 py-1.5 rounded-xl border border-rose-100 transition cursor-pointer shadow-sm"
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span>Save PDF</span>
              </button>

              {/* Save Excel Link Button */}
              <button
                onClick={() => exportWaterToExcel(waterRecords)}
                className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl border border-emerald-100 transition cursor-pointer shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-650 text-emerald-600" />
                <span>Save Excel</span>
              </button>
            </div>
          </div>

          {/* Desktop Spreadsheet-style view */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-gray-200/60 text-slate-500 text-xs font-black">
                  <th className="py-4 px-5">ល.រ</th>
                  <th className="py-2.5 md:py-4 px-4">ខែ-ឆ្នាំ (Month-Year)</th>
                  <th className="py-4 px-4 text-center">ការប្រើប្រាស់ខែមុន ($)</th>
                  <th className="py-4 px-4 text-center">ការប្រើប្រាស់ខែបន្ទាប់ ($)</th>
                  <th className="py-4 px-4 text-center">គម្លាតតាមការគណនា ($)</th>
                  <th className="py-4 px-4 text-center">ភាគរយប្រៀបធៀប (%)</th>
                  <th className="py-4 px-4">អ្នកបញ្ជាក់ / បញ្ចូល</th>
                  <th className="py-4 px-4">ការសម្គាល់បន្ថែម</th>
                  <th className="py-4 px-5 text-right">ជម្រើស</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 text-slate-700 font-sans text-xs">
                {sortedRecords.map((r, idx) => {
                  const isCostSaved = r.differenceUsd < 0;
                  const isCostEqual = r.differenceUsd === 0;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="py-4 px-5 font-bold text-slate-400">
                        {(idx + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="py-4 px-4 font-black text-slate-800 text-sm whitespace-nowrap">
                        {formatKhmerMonth(r.monthYear)}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-500">
                        {formatUSD(r.costBeforeUsd)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-block bg-sky-50 text-sky-700 font-extrabold px-2.5 py-1 rounded-lg border border-sky-100 whitespace-nowrap">
                          {formatUSD(r.costAfterUsd)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold">
                        {isCostEqual ? (
                          <span className="text-slate-400">-</span>
                        ) : isCostSaved ? (
                          <span className="text-emerald-600 font-extrabold">
                            {formatUSD(r.differenceUsd)}
                          </span>
                        ) : (
                          <span className="text-rose-600 font-extrabold">
                            +{formatUSD(r.differenceUsd)}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {isCostEqual ? (
                          <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-500 font-bold px-2 py-0.5 rounded-md text-[10px] border border-slate-200">
                            ថេរ (0%)
                          </span>
                        ) : isCostSaved ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-650 font-black px-2 py-0.5 rounded-md text-[10px] border border-emerald-100 text-emerald-750">
                            <TrendingDown className="w-3.1 h-3.1 stroke-[3]" />
                            សន្សំសំចៃ {r.differencePercent.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 font-black px-2 py-0.5 rounded-md text-[10px] border border-rose-100">
                            <TrendingUp className="w-3.1 h-3.1 stroke-[3]" />
                            កើនឡើង +{r.differencePercent.toFixed(1)}%
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1 mt-1 border-0">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{r.recordedBy}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 max-w-[200px] truncate" title={r.notes}>
                        {r.notes || <span className="text-slate-350 font-normal">គ្មានសម្គាល់</span>}
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditInit(r)}
                            className="p-1.5 text-slate-400 hover:text-sky-650 hover:text-sky-600 bg-white hover:bg-sky-50 border border-slate-200 rounded-lg transition cursor-pointer"
                            title="កែប្រែ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(r.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg transition cursor-pointer"
                            title="លុបចោល"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Khmer text note on computation mechanism */}
          <div className="bg-slate-50/50 border-t border-slate-100 p-4 text-[11px] font-semibold text-slate-550 text-slate-500 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-slate-450 shrink-0 mt-0.5 text-slate-400" />
            <div>
              <span className="font-extrabold text-slate-700">របៀបនៃការគណនាប្រៀបធៀប៖</span> កម្រងទិន្នន័យចំណាយទឹកត្រូវបានរក្សាបរិមាណគិតជាដុល្លារ ($) ដោយផ្ទាល់។ សូចនាករប្រៀបធៀប ("កើនឡើង" ឬ "សន្សំសំចៃ") គឺយកតម្លៃចំណាយប្រើប្រាស់ខែបន្ទាប់គណនាដក និងធៀបជាភាគរយទៅនឹងការប្រើប្រាស់ខែមុន។ នេះជួយជាយុទ្ធសាស្ត្រក្នុងការតាមដានចំណាយរបស់សាលាវេស្ទើនអន្តរជាតិ សាខាចំការដូង ឱ្យកាន់តែងាយស្រួល។
            </div>
          </div>
        </div>
      )}

      {/* Insert or Update Modal Dialog */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden"
              id="water-form-modal"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <h4 className="text-sm font-black flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-sky-400 fill-sky-400/20" />
                  {editingId ? 'កែប្រែរបាយការណ៍ចំណាយទឹកប្រចាំខែ' : 'បញ្ចូលទិន្នន័យទឹកប្រចាំខែថ្មី'}
                </h4>
                <button 
                  onClick={() => setIsFormOpen(false)} 
                  className="text-white/80 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveRecord}>
                <div className="p-6 space-y-4">
                  {formError && (
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs font-semibold text-rose-600 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Month Year select */}
                    <div className="col-span-2">
                      <label className="block text-slate-500 font-extrabold text-xs mb-1.5">
                        ជ្រើសរើសខែ និងឆ្នាំ (Month-Year) *
                      </label>
                      <input 
                        type="month"
                        required
                        value={formMonthYear}
                        onChange={(e) => setFormMonthYear(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 font-bold p-3 rounded-xl focus:ring-1 focus:ring-sky-500 focus:outline-none text-slate-800 text-sm"
                      />
                    </div>

                    {/* Previous month consumption cost input */}
                    <div>
                      <label className="block text-slate-505 text-slate-500 font-extrabold text-xs mb-1.5 text-slate-650">
                        ការប្រើប្រាស់ខែមុន (តម្លៃគិតជា $) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                        <input 
                          type="number"
                          step="0.01"
                          required
                          placeholder="0.00"
                          value={formCostBeforeUsd}
                          onChange={(e) => setFormCostBeforeUsd(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 font-black pl-8 p-3 rounded-xl focus:ring-1 focus:ring-sky-550 focus:ring-sky-500 focus:outline-none text-slate-800 text-sm text-center"
                        />
                      </div>
                    </div>

                    {/* Next/New month consumption cost input */}
                    <div>
                      <label className="block text-slate-505 text-slate-500 font-extrabold text-xs mb-1.5 text-slate-650">
                        ការប្រើប្រាស់ខែបន្ទាប់ (តម្លៃគិតជា $) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                        <input 
                          type="number"
                          step="0.01"
                          required
                          placeholder="0.00"
                          value={formCostAfterUsd}
                          onChange={(e) => setFormCostAfterUsd(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 font-black pl-8 p-3 rounded-xl focus:ring-1 focus:ring-sky-550 focus:ring-sky-500 focus:outline-none text-slate-800 text-sm text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Computed Live Savings Preview Box */}
                  {liveDiffUsd !== null && !isNaN(parseFloat(formCostBeforeUsd)) && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 flex flex-col gap-2.5">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">សេចក្ដីបញ្ជាក់ការគណនាជាបណ្ដោះអាសន្ន</h5>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-semibold text-xs">លទ្ធផលគម្លាតចំណាយ៖</span>
                        {liveDiffUsd > 0 ? (
                          <span className="text-xs font-black text-rose-500 inline-flex items-center gap-0.5">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            កើនឡើង +{formatUSD(liveDiffUsd)} ({liveDiffPercent !== null ? `+${liveDiffPercent.toFixed(1)}%` : '0%'})
                          </span>
                        ) : liveDiffUsd < 0 ? (
                          <span className="text-xs font-black text-emerald-600 inline-flex items-center gap-0.5">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            សន្សំសំចៃ {formatUSD(liveDiffUsd)} ({liveDiffPercent !== null ? `${liveDiffPercent.toFixed(1)}%` : '0%'})
                          </span>
                        ) : (
                          <span className="text-xs font-black text-slate-450 text-slate-500">
                            ស្មើគ្នា (0%)
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recorded by input box */}
                  <div>
                    <label className="block text-slate-500 font-extrabold text-xs mb-1.5">
                      អ្នកស្រង់ / អ្នកបញ្ចូល *
                    </label>
                    <input 
                      type="text"
                      required
                      value={formRecordedBy}
                      onChange={(e) => setFormRecordedBy(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 font-bold p-3 rounded-xl focus:ring-1 focus:ring-sky-500 focus:outline-none text-slate-800 text-sm"
                    />
                  </div>

                  {/* Annotation Notes */}
                  <div>
                    <label className="block text-slate-500 font-extrabold text-xs mb-1.5">
                      ការបញ្ជាក់ / សម្គាល់បន្ថែម
                    </label>
                    <textarea 
                      placeholder="ឧទាហរណ៍៖ ការលេចធ្លាយទុយោ, បុកខួងអណ្ដូង..."
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-semibold p-3 rounded-xl focus:ring-1 focus:ring-sky-500 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      handleResetForm();
                    }}
                    className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-extrabold px-4 py-2.5 rounded-xl border border-slate-200 transition cursor-pointer"
                  >
                    បោះបង់ (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition shadow-md shadow-sky-100 cursor-pointer"
                  >
                    រក្សាទុកទិន្នន័យ (Save)
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden"
              id="delete-water-confirm"
            >
              <div className="bg-rose-600 text-white p-4">
                <h4 className="text-sm font-black flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-white animate-bounce" />
                  បញ្ជាក់ការលុបទិន្នន័យទឹកប្រចាំខែ
                </h4>
              </div>

              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-rose-100">
                  <Trash2 className="w-7 h-7" />
                </div>
                <h5 className="text-sm font-bold text-slate-800 mb-1">តើអ្នកពិតជាចង់លុបទិន្នន័យទឹកនេះទេ?</h5>
                <p className="text-xs text-slate-400 font-semibold">
                  ទិន្នន័យប្រើប្រាស់សម្រាប់ខែ '{formatKhmerMonth(waterRecords.find(r => r.id === deleteId)?.monthYear || '')}' នឹងត្រូវលុបជាអចិន្ត្រៃយ៍។
                </p>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  onClick={() => setDeleteId(null)}
                  className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-extrabold px-4 py-2.5 rounded-xl border border-slate-200 transition"
                >
                  បោះបង់
                </button>
                <button
                  onClick={() => handleDeleteRecord(deleteId)}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition shadow-md shadow-rose-100"
                >
                  យល់ព្រមលុប
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
