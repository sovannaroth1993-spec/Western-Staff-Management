/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Wind, Search, PlusCircle, Edit, Trash2, X, Check, AlertTriangle, 
  User, CheckSquare, Square, ShieldAlert, ClipboardCheck, 
  Wrench, Layers, RefreshCw, Eye, MapPin, Calendar, Clock, Sparkles, Plus, ThumbsUp, Trash, Radio
} from 'lucide-react';
import { AirConditionerInspection, ACMaintenanceItem, ACType } from '../types';

const AC_TYPES: ACType[] = ['Split', 'Cassette', 'Standing', 'Ceiling Concealed'];

const CHECKPOINTS = [
  { id: 'checkMachine', label: 'ពិនិត្យការដំណើរការម៉ាស៊ីន', eng: 'Check Unit Operation' },
  { id: 'checkTemp', label: 'ពិនិត្យសីតុណ្ហភាពត្រជាក់', eng: 'Check Cooling Temperature' },
  { id: 'checkNoise', label: 'ពិនិត្យសំឡេងម៉ាស៊ីន', eng: 'Check Unit Noise' },
  { id: 'checkFanIndoor', label: 'ពិនិត្យកង្ហារ Indoor', eng: 'Check Indoor Fan' },
  { id: 'checkFanOutdoor', label: 'ពិនិត្យកង្ហារ Outdoor', eng: 'Check Outdoor Fan' },
  { id: 'checkWaterFlow', label: 'ពិនិត្យការហូរទឹក', eng: 'Check Water Drainage' },
  { id: 'checkWaterPipe', label: 'ពិនិត្យបំពង់ទឹក', eng: 'Check Water Drainage Pipe' },
  { id: 'checkWiring', label: 'ពិនិត្យខ្សែភ្លើង', eng: 'Check Electrical Wiring' },
  { id: 'checkBreaker', label: 'ពិនិត្យ Breaker / Switch', eng: 'Check Breaker/Switch' },
  { id: 'checkGasRefrigerant', label: 'ពិនិត្យ Gas Refrigerant', eng: 'Check Gas Level' },
  { id: 'cleanFilter', label: 'សម្អាត Filter', eng: 'Clean Filter' },
  { id: 'cleanCondenser', label: 'សម្អាត Condenser Coil', eng: 'Clean Condenser Coil' },
  { id: 'cleanEvaporator', label: 'សម្អាត Evaporator Coil', eng: 'Clean Evaporator Coil' },
  { id: 'checkCompressor', label: 'ពិនិត្យ Compressor', eng: 'Check Compressor' },
  { id: 'checkRemote', label: 'ពិនិត្យ Remote Control', eng: 'Check Remote Control' }
];

const DEFAULT_AC_INSPECTIONS: AirConditionerInspection[] = [
  {
    id: 'WIS-AC-2026-001',
    inspectionDate: '2026-05-15',
    location: 'បន្ទប់កុំព្យូទ័រជាន់ទី២ (Computer Lab Floor 2)',
    assetCode: 'WIS-AC-EQ-042',
    brandModel: 'Panasonic Inverter (S-18PU2H5)',
    acType: 'Cassette',
    powerHpBtu: '2.0 HP (18,000 BTU)',
    inspectorName: 'វ៉ាន់ ធារ៉ា (VAN Theara)',
    department: 'ផ្នែកព័ត៌មានវិទ្យា (IT Dept)',
    
    // Checkpoints
    checkMachine: 'ល្អ', checkTemp: 'ល្អ', checkNoise: 'ល្អ',
    checkFanIndoor: 'ល្អ', checkFanOutdoor: 'ល្អ', checkWaterFlow: 'ល្អ',
    checkWaterPipe: 'ល្អ', checkWiring: 'ល្អ', checkBreaker: 'ល្អ',
    checkGasRefrigerant: 'ល្អ', cleanFilter: 'ល្អ', cleanCondenser: 'ល្អ',
    cleanEvaporator: 'ល្អ', checkCompressor: 'ល្អ', checkRemote: 'ល្អ',

    checkMachineNote: 'ដំណើរការធម្មតា',
    checkTempNote: 'ត្រជាក់ល្អ ១៨ អង្សាសេ',
    checkGasRefrigerantNote: 'សម្ពាធហ្គាស 135 PSI (ល្អ)',

    // Repairs list
    repairs: [
      {
        id: 'r1',
        issueFound: 'ធូលីដីជាប់លើតម្រងបន្តិចបន្តួច',
        repairAction: 'បានលាងសម្អាតតម្រងខ្យល់កង្ហារ',
        materialsUsed: 'ទឹកស្អាត និងជក់សម្អាត',
        quantity: '១ ឈុត',
        notes: 'បានបញ្ចប់ដោយជោគជ័យ'
      }
    ],

    // Maintenance plan
    planCleanNormal: true,
    planAddGas: false,
    planChangeParts: false,
    planRepairWiring: false,
    planRepairWaterPipe: false,
    planSendBigRepair: false,
    planOther: false,
    planOtherDetail: '',

    repairOutcome: 'ដំណើរការល្អ',
    outcomeNotes: 'ម៉ាស៊ីនដំណើរការត្រជាក់ និងស្ងាត់ល្អក្រោយលាងសម្អាត',

    inspectorSigName: 'វ៉ាន់ ធារ៉ា',
    inspectorSigDate: '2026-05-15',
    technicianSigName: 'គឹម ហេង',
    technicianSigDate: '2026-05-15',
    approverSigName: 'អ៊ុំ រតនា',
    approverSigDate: '2026-05-16'
  },
  {
    id: 'WIS-AC-2026-002',
    inspectionDate: '2026-05-24',
    location: 'ការិយាល័យរដ្ឋបាលជាន់ផ្ទាល់ដី (Admin Office Ground Fl)',
    assetCode: 'WIS-AC-EQ-018',
    brandModel: 'Toshiba Multi-Split',
    acType: 'Split',
    powerHpBtu: '1.5 HP (12,000 BTU)',
    inspectorName: 'សេង គឹមសួរ (SENG Kimsuor)',
    department: 'ផ្នែករដ្ឋបាល (Admin Dept)',

    // Checkpoints (With some medium/broken issues)
    checkMachine: 'មធ្យម', checkTemp: 'ល្អ', checkNoise: 'មធ្យម',
    checkFanIndoor: 'ល្អ', checkFanOutdoor: 'ល្អ', checkWaterFlow: 'ខូច',
    checkWaterPipe: 'ល្អ', checkWiring: 'ល្អ', checkBreaker: 'ល្អ',
    checkGasRefrigerant: 'មធ្យម', cleanFilter: 'ខូច', cleanCondenser: 'មធ្យម',
    cleanEvaporator: 'មធ្យម', checkCompressor: 'ល្អ', checkRemote: 'ល្អ',

    checkWaterFlowNote: 'កកស្ទះស្លែក្នុងថាសបង្ហូរទឹកហូរចេញក្រៅដប',
    cleanFilterNote: 'ធូលីផ្ដុំគ្នាកម្រាស់ក្រាស់ខ្លាំង',
    checkNoiseNote: 'ឮសូរខ្លាំងចេញពីដង្ហារមុខបក់',

    // Repairs
    repairs: [
      {
        id: 'r2',
        issueFound: 'ស្ទះថាសបង្ហូរទឹកបណ្ដាលឲ្យស្រក់ទឹក',
        repairAction: 'បានផ្លុំខ្យល់សម្អាតបំពង់បង្ហូរ និងចាក់អាស៊ីតសម្លាប់ស្លែ',
        materialsUsed: 'សារធាតុគីមីលាងស្លែ និងស្នប់ខ្យល់',
        quantity: '១ ដប',
        notes: 'ស្អាតល្អមិនស្រក់ទៀតឡើយ'
      },
      {
        id: 'r3',
        issueFound: 'តម្រងខ្យល់កខ្វក់ខ្លាំង',
        repairAction: 'បានដកមកបាញ់ទឹកសម្អាត និងសម្ងួត',
        materialsUsed: 'គ្មាន',
        quantity: '២ ផ្ទាំង',
        notes: 'លាងជម្រះរួចរាល់'
      }
    ],

    planCleanNormal: true,
    planAddGas: true,
    planChangeParts: false,
    planRepairWiring: false,
    planRepairWaterPipe: true,
    planSendBigRepair: false,
    planOther: false,
    planOtherDetail: '',

    repairOutcome: 'ដំណើរការល្អ',
    outcomeNotes: 'កែសម្រួលដោះស្រាយការស្រក់ទឹកបានរួចរាល់ ដំណើរការត្រជាក់ឡើងវិញ',

    inspectorSigName: 'សេង គឹមសួរ',
    inspectorSigDate: '2026-05-24',
    technicianSigName: 'ទេព ម៉ារ៉ា',
    technicianSigDate: '2026-05-24',
    approverSigName: 'អ៊ុំ រតនា',
    approverSigDate: '2026-05-24'
  },
  {
    id: 'WIS-AC-2026-003',
    inspectionDate: '2026-05-28',
    location: 'បន្ទប់ពិសោធន៍វិទ្យាសាស្ត្រ (Science Lab)',
    assetCode: 'WIS-AC-EQ-009',
    brandModel: 'Daikin Ceiling Suspended (FHNQ24MV1)',
    acType: 'Ceiling Concealed',
    powerHpBtu: '2.5 HP (24,000 BTU)',
    inspectorName: 'មាស សុខា (MEAS Sokha)',
    department: 'ផ្នែកជំនួយការបន្ទប់ពិសោធន៍',

    // Checkpoints
    checkMachine: 'ខូច', checkTemp: 'ខូច', checkNoise: 'ល្អ',
    checkFanIndoor: 'ល្អ', checkFanOutdoor: 'ល្អ', checkWaterFlow: 'ល្អ',
    checkWaterPipe: 'ល្អ', checkWiring: 'ខូច', checkBreaker: 'ល្អ',
    checkGasRefrigerant: 'ខូច', cleanFilter: 'ល្អ', cleanCondenser: 'ល្អ',
    cleanEvaporator: 'ល្អ', checkCompressor: 'ខូច', checkRemote: 'មធ្យម',

    checkMachineNote: 'ម៉ាស៊ីនខាងក្រៅមិនដំណើរការ (Compressor Not Running)',
    checkWiringNote: 'ក្តារបញ្ជារលាកកុងទ័រទំនាក់ទំនង ឬខូចគួប្លិក',
    checkGasRefrigerantNote: 'លេចធ្លាយហ្គាសសូន្យ R32 ក្នុងប្រព័ន្ធ',

    // repairs
    repairs: [
      {
        id: 'r4',
        issueFound: 'ខូច Capacitor និងលេចធ្លាយកន្លែងកោងទុយោស្ពាន់',
        repairAction: 'ត្រូវការផ្សាទុយោជិតឡើងវិញ រួចបូមទាក់សេ និងប្តូរ Capacitor',
        materialsUsed: 'សារធាតុផ្សាស្ពាន់ R32 ហ្គាស, Capacitor ថ្មី',
        quantity: '១ ឈុត',
        notes: 'កំពុងរង់ចាំគ្រឿងបន្លាស់ផ្លាស់ប្តូរ'
      }
    ],

    planCleanNormal: false,
    planAddGas: true,
    planChangeParts: true,
    planRepairWiring: true,
    planRepairWaterPipe: false,
    planSendBigRepair: true,
    planOther: false,
    planOtherDetail: '',

    repairOutcome: 'ត្រូវត្រួតពិនិត្យបន្ថែម',
    outcomeNotes: 'បច្ចុប្បន្នផ្អាកការប្រើប្រាស់ជាបណ្ដោះអាសន្ន រង់ចាំគ្រឿងបន្លាស់មកដល់សិន',

    inspectorSigName: 'មាស សុខា',
    inspectorSigDate: '2026-05-28',
    technicianSigName: 'សួង ពិសិដ្ឋ',
    technicianSigDate: '2026-05-28',
    approverSigName: 'អ៊ុំ រតនា',
    approverSigDate: '2026-05-29'
  }
];

export default function AirConditionerInspectionManager() {
  const [inspections, setInspections] = useState<AirConditionerInspection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [outcomeFilter, setOutcomeFilter] = useState<'All' | 'Good' | 'Attention' | 'Broken'>('All');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modals management
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingForm, setViewingForm] = useState<AirConditionerInspection | null>(null);
  const [editingForm, setEditingForm] = useState<AirConditionerInspection | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Form Field States
  const [formId, setFormId] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [location, setLocation] = useState('');
  const [assetCode, setAssetCode] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [acType, setAcType] = useState<ACType>('Split');
  const [powerHpBtu, setPowerHpBtu] = useState('1.5 HP (12,000 BTU)');
  const [inspectorName, setInspectorName] = useState('វ៉ាន់ ធារ៉ា (VAN Theara)');
  const [department, setDepartment] = useState('ផ្នែកអនាម័យ និងបច្ចេកទេស');

  // Checkpoints States
  const [checks, setChecks] = useState<Record<string, 'ល្អ' | 'មធ្យម' | 'ខូច'>>({
    checkMachine: 'ល្អ', checkTemp: 'ល្អ', checkNoise: 'ល្អ',
    checkFanIndoor: 'ល្អ', checkFanOutdoor: 'ល្អ', checkWaterFlow: 'ល្អ',
    checkWaterPipe: 'ល្អ', checkWiring: 'ល្អ', checkBreaker: 'ល្អ',
    checkGasRefrigerant: 'ល្អ', cleanFilter: 'ល្អ', cleanCondenser: 'ល្អ',
    cleanEvaporator: 'ល្អ', checkCompressor: 'ល្អ', checkRemote: 'ល្អ'
  });

  const [checkNotes, setCheckNotes] = useState<Record<string, string>>({
    checkMachineNote: '', checkTempNote: '', checkNoiseNote: '',
    checkFanIndoorNote: '', checkFanOutdoorNote: '', checkWaterFlowNote: '',
    checkWaterPipeNote: '', checkWiringNote: '', checkBreakerNote: '',
    checkGasRefrigerantNote: '', cleanFilterNote: '', cleanCondenserNote: '',
    cleanEvaporatorNote: '', checkCompressorNote: '', checkRemoteNote: ''
  });

  // Repair rows
  const [repairsList, setRepairsList] = useState<ACMaintenanceItem[]>([
    { id: 't1', issueFound: '', repairAction: '', materialsUsed: '', quantity: '', notes: '' }
  ]);

  // Maintenance plan checkboxes
  const [planCleanNormal, setPlanCleanNormal] = useState(true);
  const [planAddGas, setPlanAddGas] = useState(false);
  const [planChangeParts, setPlanChangeParts] = useState(false);
  const [planRepairWiring, setPlanRepairWiring] = useState(false);
  const [planRepairWaterPipe, setPlanRepairWaterPipe] = useState(false);
  const [planSendBigRepair, setPlanSendBigRepair] = useState(false);
  const [planOther, setPlanOther] = useState(false);
  const [planOtherDetail, setPlanOtherDetail] = useState('');

  // Outcome
  const [repairOutcome, setRepairOutcome] = useState<'ដំណើរការល្អ' | 'ត្រូវត្រួតពិនិត្យបន្ថែម' | 'មិនអាចប្រើប្រាស់បាន'>('ដំណើរការល្អ');
  const [outcomeNotes, setOutcomeNotes] = useState('');

  // Signatures
  const [inspectorSigName, setInspectorSigName] = useState('វ៉ាន់ ធារ៉ា');
  const [inspectorSigDate, setInspectorSigDate] = useState('');
  const [technicianSigName, setTechnicianSigName] = useState('គឹម ហេង');
  const [technicianSigDate, setTechnicianSigDate] = useState('');
  const [approverSigName, setApproverSigName] = useState('អ៊ុំ រតនា');
  const [approverSigDate, setApproverSigDate] = useState('');

  // Initial load from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wis_ac_inspections');
      if (saved) {
        setInspections(JSON.parse(saved));
      } else {
        setInspections(DEFAULT_AC_INSPECTIONS);
        localStorage.setItem('wis_ac_inspections', JSON.stringify(DEFAULT_AC_INSPECTIONS));
      }
    } catch (err) {
      console.error(err);
      setInspections(DEFAULT_AC_INSPECTIONS);
    }
  }, []);

  const saveAndSync = (updated: AirConditionerInspection[]) => {
    setInspections(updated);
    try {
      localStorage.setItem('wis_ac_inspections', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const showToastMsg = (msg: string, type: 'success' | 'info' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper to append a maintenance repair row
  const addRepairRow = () => {
    setRepairsList([
      ...repairsList,
      { id: Date.now().toString() + Math.random().toString(), issueFound: '', repairAction: '', materialsUsed: '', quantity: '', notes: '' }
    ]);
  };

  const removeRepairRow = (index: number) => {
    if (repairsList.length === 1) {
      setRepairsList([{ id: 't-only', issueFound: '', repairAction: '', materialsUsed: '', quantity: '', notes: '' }]);
    } else {
      setRepairsList(repairsList.filter((_, idx) => idx !== index));
    }
  };

  const updateRepairRowField = (index: number, field: keyof ACMaintenanceItem, value: string) => {
    const updated = repairsList.map((row, idx) => {
      if (idx === index) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setRepairsList(updated);
  };

  const openAddForm = () => {
    setEditingForm(null);

    // Calc Next sequence ID
    const nextSeq = inspections.length > 0
      ? Math.max(...inspections.map(i => {
          const matched = i.id.match(/\d+$/);
          return matched ? parseInt(matched[0]) : 0;
        })) + 1
      : 1;
    const formattedCode = `WIS-AC-2026-${String(nextSeq).padStart(3, '0')}`;

    setFormId(formattedCode);
    setInspectionDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setAssetCode(`WIS-AC-EQ-${String(100 + nextSeq)}`);
    setBrandModel('');
    setAcType('Split');
    setPowerHpBtu('1.5 HP (12,000 BTU)');
    setInspectorName('វ៉ាន់ ធារ៉ា (VAN Theara)');
    setDepartment('ផ្នែកអនាម័យ និងបច្ចេកទេស');

    // Default checkpoints
    const defaultChecks: Record<string, 'ល្អ' | 'មធ្យម' | 'ខូច'> = {};
    const defaultCheckNotes: Record<string, string> = {};
    CHECKPOINTS.forEach(pt => {
      defaultChecks[pt.id] = 'ល្អ';
      defaultCheckNotes[`${pt.id}Note`] = '';
    });
    setChecks(defaultChecks);
    setCheckNotes(defaultCheckNotes);

    setRepairsList([{ id: 't1', issueFound: 'គ្មាន', repairAction: 'គ្មាន', materialsUsed: 'គ្មាន', quantity: '0', notes: 'រកមិនឃើញបញ្ហាទេ' }]);

    setPlanCleanNormal(true);
    setPlanAddGas(false);
    setPlanChangeParts(false);
    setPlanRepairWiring(false);
    setPlanRepairWaterPipe(false);
    setPlanSendBigRepair(false);
    setPlanOther(false);
    setPlanOtherDetail('');

    setRepairOutcome('ដំណើរការល្អ');
    setOutcomeNotes('');

    setInspectorSigName('វ៉ាន់ ធារ៉ា');
    setInspectorSigDate(new Date().toISOString().split('T')[0]);
    setTechnicianSigName('គឹម ហេង');
    setTechnicianSigDate(new Date().toISOString().split('T')[0]);
    setApproverSigName('អ៊ុំ រតនា');
    setApproverSigDate(new Date().toISOString().split('T')[0]);

    setIsFormOpen(true);
  };

  const openEditForm = (item: AirConditionerInspection) => {
    setEditingForm(item);

    setFormId(item.id);
    setInspectionDate(item.inspectionDate);
    setLocation(item.location);
    setAssetCode(item.assetCode);
    setBrandModel(item.brandModel);
    setAcType(item.acType);
    setPowerHpBtu(item.powerHpBtu);
    setInspectorName(item.inspectorName);
    setDepartment(item.department);

    // Map checkpoints
    const loadedChecks: Record<string, 'ល្អ' | 'មធ្យម' | 'ខូច'> = {};
    const loadedCheckNotes: Record<string, string> = {};
    CHECKPOINTS.forEach(pt => {
      // @ts-ignore
      loadedChecks[pt.id] = item[pt.id] || 'ល្អ';
      // @ts-ignore
      loadedCheckNotes[`${pt.id}Note`] = item[`${pt.id}Note`] || '';
    });
    setChecks(loadedChecks);
    setCheckNotes(loadedCheckNotes);

    setRepairsList(item.repairs && item.repairs.length > 0 ? item.repairs : [{ id: 'rr', issueFound: '', repairAction: '', materialsUsed: '', quantity: '', notes: '' }]);

    setPlanCleanNormal(item.planCleanNormal);
    setPlanAddGas(item.planAddGas);
    setPlanChangeParts(item.planChangeParts);
    setPlanRepairWiring(item.planRepairWiring);
    setPlanRepairWaterPipe(item.planRepairWaterPipe);
    setPlanSendBigRepair(item.planSendBigRepair);
    setPlanOther(item.planOther);
    setPlanOtherDetail(item.planOtherDetail || '');

    setRepairOutcome(item.repairOutcome);
    setOutcomeNotes(item.outcomeNotes || '');

    setInspectorSigName(item.inspectorSigName || '');
    setInspectorSigDate(item.inspectorSigDate || '');
    setTechnicianSigName(item.technicianSigName || '');
    setTechnicianSigDate(item.technicianSigDate || '');
    setApproverSigName(item.approverSigName || '');
    setApproverSigDate(item.approverSigDate || '');

    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    const remaining = inspections.filter(item => item.id !== deletingId);
    saveAndSync(remaining);
    showToastMsg(`បានលុបកំណត់ត្រា [${deletingId}] ចេញពីប្រព័ន្ធរួចរាល់`, 'info');
    setDeletingId(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim() || !brandModel.trim() || !assetCode.trim()) {
      showToastMsg('សូមបំពេញព័ត៌មានចាំបាច់ (ទីតាំង ម៉ាកម៉ូដែល លេខសម្គាល់ម៉ាស៊ីន)', 'error');
      return;
    }

    // Filter blank repairs logic
    const sanitizedRepairs = repairsList.filter(r => r.issueFound.trim() !== '' || r.repairAction.trim() !== '');

    const payload: AirConditionerInspection = {
      id: formId,
      inspectionDate,
      location,
      assetCode,
      brandModel,
      acType,
      powerHpBtu,
      inspectorName,
      department,

      // Embed checks deconstructed
      checkMachine: checks.checkMachine,
      checkTemp: checks.checkTemp,
      checkNoise: checks.checkNoise,
      checkFanIndoor: checks.checkFanIndoor,
      checkFanOutdoor: checks.checkFanOutdoor,
      checkWaterFlow: checks.checkWaterFlow,
      checkWaterPipe: checks.checkWaterPipe,
      checkWiring: checks.checkWiring,
      checkBreaker: checks.checkBreaker,
      checkGasRefrigerant: checks.checkGasRefrigerant,
      cleanFilter: checks.cleanFilter,
      cleanCondenser: checks.cleanCondenser,
      cleanEvaporator: checks.cleanEvaporator,
      checkCompressor: checks.checkCompressor,
      checkRemote: checks.checkRemote,

      checkMachineNote: checkNotes.checkMachineNote,
      checkTempNote: checkNotes.checkTempNote,
      checkNoiseNote: checkNotes.checkNoiseNote,
      checkFanIndoorNote: checkNotes.checkFanIndoorNote,
      checkFanOutdoorNote: checkNotes.checkFanOutdoorNote,
      checkWaterFlowNote: checkNotes.checkWaterFlowNote,
      checkWaterPipeNote: checkNotes.checkWaterPipeNote,
      checkWiringNote: checkNotes.checkWiringNote,
      checkBreakerNote: checkNotes.checkBreakerNote,
      checkGasRefrigerantNote: checkNotes.checkGasRefrigerantNote,
      cleanFilterNote: checkNotes.cleanFilterNote,
      cleanCondenserNote: checkNotes.cleanCondenserNote,
      cleanEvaporatorNote: checkNotes.cleanEvaporatorNote,
      checkCompressorNote: checkNotes.checkCompressorNote,
      checkRemoteNote: checkNotes.checkRemoteNote,

      repairs: sanitizedRepairs.length > 0 ? sanitizedRepairs : [],

      planCleanNormal,
      planAddGas,
      planChangeParts,
      planRepairWiring,
      planRepairWaterPipe,
      planSendBigRepair,
      planOther,
      planOtherDetail,

      repairOutcome,
      outcomeNotes,

      inspectorSigName,
      inspectorSigDate: inspectorSigDate || inspectionDate,
      technicianSigName,
      technicianSigDate: technicianSigDate || inspectionDate,
      approverSigName,
      approverSigDate: approverSigDate || inspectionDate
    };

    if (editingForm) {
      const updated = inspections.map(item => item.id === editingForm.id ? payload : item);
      saveAndSync(updated);
      showToastMsg(`បានកែប្រែកំណត់ត្រា ${payload.id} ជោគជ័យ និងរក្សាទុកស្វ័យប្រវត្ត`, 'success');
    } else {
      const exists = inspections.some(item => item.id === payload.id);
      if (exists) {
        showToastMsg(`លេខការណែនាំ "${payload.id}" នេះមានរួចហើយនៅក្នុងប្រព័ន្ធ`, 'error');
        return;
      }
      const updated = [payload, ...inspections];
      saveAndSync(updated);
      showToastMsg(`បានបន្ថែមការត្រួតពិនិត្យ ${payload.id} ថ្មី រក្សាទុកស្វ័យប្រវត្ត`, 'success');
    }

    setIsFormOpen(false);
  };

  const handleResetDefaults = () => {
    setShowResetConfirm(true);
  };

  const confirmResetDefaults = () => {
    saveAndSync(DEFAULT_AC_INSPECTIONS);
    showToastMsg('ប្រព័ន្ធបានកំណត់ទិន្នន័យគំរូដើមរួចរាល់ម៉ាស៊ីនត្រជាក់', 'success');
    setShowResetConfirm(false);
  };

  // Stats Counters
  const totalReportsNum = inspections.length;
  const goodStatusCount = inspections.filter(item => item.repairOutcome === 'ដំណើរការល្អ').length;
  const attentionRequiredCount = inspections.filter(item => item.repairOutcome === 'ត្រូវត្រួតពិនិត្យបន្ថែម').length;
  const unusableCount = inspections.filter(item => item.repairOutcome === 'មិនអាចប្រើប្រាស់បាន').length;

  const totalRepairsTracked = inspections.reduce((acc, current) => acc + (current.repairs?.length || 0), 0);

  // Filter list
  const filteredList = inspections.filter(item => {
    const query = searchQuery.trim().toLowerCase();
    const searchMatches = !query ||
      item.id.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.assetCode.toLowerCase().includes(query) ||
      item.brandModel.toLowerCase().includes(query) ||
      item.inspectorName.toLowerCase().includes(query) ||
      item.department.toLowerCase().includes(query);

    const typeMatches = filterType === 'All' || item.acType === filterType;

    let outcomeMatches = true;
    if (outcomeFilter === 'Good') {
      outcomeMatches = item.repairOutcome === 'ដំណើរការល្អ';
    } else if (outcomeFilter === 'Attention') {
      outcomeMatches = item.repairOutcome === 'ត្រូវត្រួតពិនិត្យបន្ថែម';
    } else if (outcomeFilter === 'Broken') {
      outcomeMatches = item.repairOutcome === 'មិនអាចប្រើប្រាស់បាន';
    }

    return searchMatches && typeMatches && outcomeMatches;
  });

  return (
    <div className="space-y-6" id="ac-inspection-manager-root">
      
      {/* Toast Alarm Notification display */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
          'bg-slate-50 text-slate-805 border-slate-200'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4 text-emerald-700" /> : <AlertTriangle className="w-4 h-4 text-rose-700" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Main Panel Banner Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden" id="ac-panel-banner">
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shrink-0">
              <Wind className="w-6.5 h-6.5 animate-pulse text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-moul tracking-normal text-slate-900 flex flex-wrap items-center gap-2">
                សន្លឹកត្រួតពិនិត្យ និងការថែទាំម៉ាស៊ីនត្រជាក់ (Air Conditioner Inspection & Maintenance Form)
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">Auto Synchronized ⚙</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                គណនីគ្រប់គ្រងការលាងសម្អាត សង្គ្រោះ កត់សម្គាល់សីតុណ្ហភាព បំពង់ទឹកហូរ សម្ពាធហ្គាស និងបញ្ជីជួសជុលឧបករណ៍ត្រជាក់។
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2 hover:bg-slate-100 transition border rounded-xl text-slate-500 text-xs font-bold cursor-pointer"
            >
              កំណត់ឡើងវិញ
            </button>
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4.5 h-4.5" />
              <span>បញ្ចូលកំណត់ត្រាថ្មី (Add Inspection Form)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Board Widget Counter */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest">រាយការណ៍សរុប (Total Forms)</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-black text-slate-800">{totalReportsNum}</span>
            <span className="text-xs text-slate-400 font-bold">ច្បាប់</span>
          </div>
          <p className="text-[9.5px] text-slate-400 mt-1 font-semibold">បញ្ជី Form ក្នុងប្រព័ន្ធ</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <p className="text-[10.5px] font-black text-emerald-600 uppercase tracking-widest">លទ្ធផល៖ ដំណើរការល្អ (Good)</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-black text-emerald-600">{goodStatusCount}</span>
            <span className="text-xs text-emerald-400 font-bold">គ្រឿង</span>
          </div>
          <span className="inline-block text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md mt-1 font-bold">
            សីតុណ្ហភាពត្រជាក់ និងស្អាត
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <p className="text-[10.5px] font-black text-amber-600 uppercase tracking-widest">ត្រួតពិនិត្យបន្ថែម (Pending Check)</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-black text-amber-600">{attentionRequiredCount}</span>
            <span className="text-xs text-amber-400 font-bold">គ្រឿង</span>
          </div>
          <span className="inline-block text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md mt-1 font-bold">
            ត្រូវការការជួសជុលបន្ទាប់បន្សំ
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <p className="text-[10.5px] font-black text-rose-600 uppercase tracking-widest">មិនអាចប្រើប្រាស់បាន (Unusable)</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-mono font-black text-rose-600">{unusableCount}</span>
            <span className="text-xs text-rose-400 font-bold">គ្រឿង</span>
          </div>
          <span className="inline-block text-[9px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md mt-1 font-bold">
            អសកម្ម/រង់ចាំផ្លាស់ប្តូរគ្រឿង
          </span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-900 to-emerald-950 p-4 rounded-2xl text-white shadow-xs">
          <p className="text-[10.5px] font-black text-emerald-200 uppercase tracking-widest">ករណីជួសជុលសរុប (Maintenance Log)</p>
          <div className="flex items-baseline gap-0.5 mt-1">
            <span className="text-2xl font-mono font-black text-emerald-400">{totalRepairsTracked}</span>
            <span className="text-[10px] text-slate-300 font-bold ml-1">ការងារ</span>
          </div>
          <p className="text-[9.5px] text-emerald-200 mt-2 font-mono">ចងក្រងក្នុងតារាង Form Sub-records</p>
        </div>
      </div>

      {/* Filter and Query Selection Box Panel */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs" id="ac-filter-panel">
        
        {/* Dynamic Input Search Box */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ស្វែងរក៖ លេខ Form ទីតាំង ម៉ាកម៉ាស៊ីន អ្នកត្រួតពិនិត្យ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-600 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              សម្អាត
            </button>
          )}
        </div>

        {/* Tab statuses filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-extrabold">លទ្ធផលលម្អិត (Repair Outcome):</span>
          <button
            onClick={() => setOutcomeFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              outcomeFilter === 'All'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ទាំងអស់ ({totalReportsNum})
          </button>
          
          <button
            onClick={() => setOutcomeFilter('Good')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              outcomeFilter === 'Good'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-50 text-emerald-800 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ដំណើរការល្អ ({goodStatusCount})
          </button>

          <button
            onClick={() => setOutcomeFilter('Attention')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              outcomeFilter === 'Attention'
                ? 'bg-amber-600 text-slate-950 shadow-xs'
                : 'bg-slate-50 text-amber-800 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ត្រូវពិនិត្យបន្ថែម ({attentionRequiredCount})
          </button>

          <button
            onClick={() => setOutcomeFilter('Broken')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              outcomeFilter === 'Broken'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-50 text-rose-800 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            មិនអាចប្រើប្រាស់បាន ({unusableCount})
          </button>
        </div>

        {/* Filter by AC Type */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-extrabold shrink-0">ប្រភេទឧបករណ៍៖</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="All">បង្ហាញទាំងអស់</option>
            {AC_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid listing of AC Inspection report cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredList.length === 0 ? (
          <div className="col-span-2 bg-white border border-slate-200 py-12 rounded-2xl text-center shadow-xs">
            <div className="max-w-xs mx-auto flex flex-col items-center">
              <Wind className="w-12 h-12 text-slate-200 animate-pulse mb-2" />
              <p className="text-xs text-slate-500 font-bold">រកមិនឃើញកំណត់ត្រាត្រួតពិនិត្យម៉ាស៊ីនត្រជាក់ទេ</p>
            </div>
          </div>
        ) : (
          filteredList.map((item) => {
            // Count checkpoint status percentages
            const totalPt = CHECKPOINTS.length;
            const ptGood = CHECKPOINTS.filter(pt => {
              // @ts-ignore
              return item[pt.id] === 'ល្អ';
            }).length;
            const ptMedium = CHECKPOINTS.filter(pt => {
              // @ts-ignore
              return item[pt.id] === 'មធ្យម';
            }).length;
            const ptBroken = CHECKPOINTS.filter(pt => {
              // @ts-ignore
              return item[pt.id] === 'ខូច';
            }).length;

            return (
              <div 
                key={item.id} 
                className="bg-white border rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between border-slate-200"
                id={`ac-card-${item.id}`}
              >
                {/* Header ribbon indicator */}
                <div className={`p-4 py-3 border-b flex justify-between items-center ${
                  item.repairOutcome === 'ដំណើរការល្អ' 
                    ? 'bg-emerald-50/75 border-emerald-100 text-emerald-950'
                    : item.repairOutcome === 'ត្រូវត្រួតពិនិត្យបន្ថែម'
                    ? 'bg-amber-50/75 border-amber-100 text-amber-950'
                    : 'bg-rose-50/75 border-rose-100 text-rose-950'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      item.repairOutcome === 'ដំណើរការល្អ' ? 'bg-emerald-500' :
                      item.repairOutcome === 'ត្រូវត្រួតពិនិត្យបន្ថែម' ? 'bg-amber-500 animate-pulse' :
                      'bg-rose-500 animate-ping'
                    }`} />
                    <span className="font-mono font-bold text-slate-900 bg-white border px-2 py-0.5 rounded-lg text-[10.5px]">
                      {item.id}
                    </span>
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase">
                      • {item.acType}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-black tracking-wide ${
                    item.repairOutcome === 'ដំណើរការល្អ' 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-250'
                      : item.repairOutcome === 'ត្រូវត្រួតពិនិត្យបន្ថែម'
                      ? 'bg-amber-100 text-amber-800 border-amber-250'
                      : 'bg-rose-100 text-rose-800 border-rose-250'
                  }`}>
                    {item.repairOutcome}
                  </span>
                </div>

                {/* Card Content body */}
                <div className="p-5 space-y-4 flex-1">
                  
                  {/* Row 1: General specs and model */}
                  <div className="flex items-start justify-between gap-2 border-b border-dashed border-slate-100 pb-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                        <Wind className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{item.brandModel}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>ទីតាំង៖ {item.location}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        លេខសម្គាល់ / Asset: {item.assetCode} | កម្លាំង: {item.powerHpBtu}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ថ្ងៃត្រួតពិនិត្យ</p>
                      <p className="text-[11.5px] font-mono font-bold text-slate-700 mt-0.5 flex items-center gap-1 justify-end">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {item.inspectionDate}
                      </p>
                    </div>
                  </div>

                  {/* Row 2: Checkpoint indicators grid summary */}
                  <div>
                    <div className="flex justify-between items-center text-[10.5px] font-extrabold text-slate-500 mb-1.5">
                      <span>ស្ថានភាពត្រួតពិនិត្យទាំង ១៥ (Checkpoints Status):</span>
                      <div className="flex gap-1.5 font-mono text-[9.5px]">
                        <span className="text-emerald-600 bg-emerald-50 px-1.5 rounded font-black">ល្អ: {ptGood}</span>
                        <span className="text-amber-600 bg-amber-50 px-1.5 rounded font-black">មធ្យម: {ptMedium}</span>
                        <span className="text-rose-600 bg-rose-50 px-1.5 rounded font-black">ខូច: {ptBroken}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {CHECKPOINTS.slice(0, 5).map((chk) => {
                        // @ts-ignore
                        const val = item[chk.id] as 'ល្អ' | 'មធ្យម' | 'ខូច';
                        return (
                          <div 
                            key={chk.id}
                            title={`${chk.label}៖ ${val}`}
                            className={`p-1 rounded text-center text-[9px] font-bold border truncate transition ${
                              val === 'ល្អ' ? 'bg-emerald-50/40 border-emerald-100 text-emerald-800' :
                              val === 'មធ្យម' ? 'bg-amber-50/40 border-amber-100 text-amber-800' :
                              'bg-rose-50/40 border-rose-100 text-rose-800'
                            }`}
                          >
                            {chk.label.replace('ពិនិត្យ', '').trim()} ({val})
                          </div>
                        );
                      })}
                      <div className="p-1 rounded bg-slate-100 text-center text-[8.5px] font-extrabold text-slate-550 border border-slate-200">
                        +១០ ទៀត...
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Maintenance Actions & Plan Summary */}
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-[11px] space-y-1 text-slate-700">
                    <p className="font-extrabold text-slate-800 mb-1 flex items-center gap-1 border-b border-rose-100 pb-1">
                      <Wrench className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>ការងារជួសជុល និងផែនការថែទាំ (Repair & Plan):</span>
                    </p>
                    <div className="flex flex-wrap gap-1 py-1">
                      {item.planCleanNormal && <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[9.5px] font-bold">លាងសម្អាតធម្មតា</span>}
                      {item.planAddGas && <span className="bg-blue-100 text-blue-805 px-2 py-0.5 rounded text-[9.5px] font-bold">បញ្ចូលហ្គាស</span>}
                      {item.planChangeParts && <span className="bg-amber-100 text-amber-805 px-2 py-0.5 rounded text-[9.5px] font-bold">ដូរគ្រឿងបន្លាស់</span>}
                      {item.planRepairWiring && <span className="bg-rose-100 text-rose-850 px-2 py-0.5 rounded text-[9.5px] font-bold">ជួសជុលខ្សែភ្លើង</span>}
                      {item.planRepairWaterPipe && <span className="bg-teal-100 text-teal-805 px-2 py-0.5 rounded text-[9.5px] font-bold">ជួសជុលបំពង់ទឹក</span>}
                      {item.planSendBigRepair && <span className="bg-green-100 text-green-900 px-2 py-0.5 rounded text-[9.5px] font-bold">ជួសជុលធំ</span>}
                    </div>
                    {item.repairs && item.repairs.length > 0 ? (
                      <p className="text-slate-500 italic text-[10.5px] truncate">
                        <strong className="text-slate-700 font-bold">បញ្ហាដែលបានដោះស្រាយ៖</strong> {item.repairs.map(r => r.issueFound).join(', ')}
                      </p>
                    ) : (
                      <p className="text-emerald-700 font-bold">គ្មានការងារជួសជុលដែលត្រូវកត់ត្រាទេ</p>
                    )}
                  </div>

                  {/* Row 4: Signature fields footer indicators */}
                  <div className="flex border-t border-slate-100 pt-2 text-[10px] text-slate-400 justify-between items-center bg-slate-50/25 px-2 py-1 rounded-lg">
                    <span>អ្នកត្រួតពិនិត្យ៖ <strong className="text-slate-700 font-bold">{item.inspectorName.split(' ')[0]}</strong></span>
                    <span>ជាងជួសជុល៖ <strong className="text-slate-700 font-bold">{item.technicianSigName}</strong></span>
                    <span>ប្រធានអនុម័ត៖ <strong className="text-slate-700 font-bold">{item.approverSigName}</strong></span>
                  </div>
                </div>

                {/* Footer interactive buttons */}
                <div className="p-3 bg-slate-50 border-t border-slate-150 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => setViewingForm(item)}
                    className="p-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 transition text-[11px] font-black cursor-pointer inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>មើលលម្អិត</span>
                  </button>

                  <button
                    onClick={() => openEditForm(item)}
                    className="p-1.5 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition text-[11px] font-black cursor-pointer inline-flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>កែសម្រួល</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 hover:bg-rose-600 bg-rose-50 text-rose-600 border border-rose-105 hover:text-white rounded-xl transition text-[11px] cursor-pointer"
                    title="លុបចោលកំណត់ត្រា"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: VIEW ONLY FORM (Sheet Placard display) */}
      {viewingForm && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-slate-800">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
            
            {/* Dark banner style */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 text-emerald-400">
                <Wind className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="font-moul text-sm tracking-normal leading-normal text-white">
                    របាយការណ៍ត្រួតពិនិត្យ និងថែទាំម៉ាស៊ីនត្រជាក់សាលា
                  </h3>
                  <p className="text-[11px] text-slate-300 font-bold mt-0.5">លេខប័ណ្ណ Form: {viewingForm.id} • ថ្ងៃបោះពុម្ព៖ {viewingForm.inspectionDate} • សាខាចំការដូង</p>
                </div>
              </div>
              <button
                onClick={() => setViewingForm(null)}
                className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Area Scroll container */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-xs text-slate-700">
              
              {/* National Emblem top header */}
              <div className="text-center space-y-1 pb-4 border-b">
                <h4 className="font-moul text-xs uppercase text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</h4>
                <p className="font-bold text-[10px]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <div className="h-0.5 w-16 bg-slate-900 mx-auto mt-1" />
                <p className="font-moul text-xs text-slate-800 mt-3">សាលាអន្តរជាតិ វេស្ទើន (WESTERN INTERNATIONAL SCHOOL)</p>
                <p className="text-[10px] text-slate-400 font-bold">ការិយាល័យបច្ចេកទេស និងគ្រប់គ្រងទ្រព្យសម្បត្តិ</p>
              </div>

              {/* Title Section */}
              <div className="text-center bg-emerald-50 border border-emerald-100 rounded-2xl py-3.5">
                <h3 className="font-moul text-xs md:text-sm text-emerald-950">សន្លឹកត្រួតពិនិត្យម៉ាស៊ីនត្រជាក់ និងការជួសជុល</h3>
                <h3 className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider mt-0.5">Air Conditioner Inspection & Maintenance Sheet</h3>
              </div>

              {/* Box 1: General Specifications (១. ព័ត៌មានទូទៅ) */}
              <div className="space-y-2.5">
                <h5 className="font-moul text-[11px] text-indigo-950 border-l-4 border-emerald-600 pl-2">
                  ១. ព័ត៌មានទូទៅឧបករណ៍ (General Specifications)
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="space-y-2 text-[11px]">
                    <p><span className="text-slate-400 font-bold">លេខ Form / Form No:</span> <strong className="text-slate-950 font-mono text-[12px]">{viewingForm.id}</strong></p>
                    <p><span className="text-slate-400 font-bold">កាលបរិច្ឆេទ / Date:</span> <span className="text-slate-800 font-mono font-bold">{viewingForm.inspectionDate}</span></p>
                    <p><span className="text-slate-400 font-bold">ទីតាំង / បន្ទប់ (Location):</span> <span className="text-slate-850 font-bold">{viewingForm.location}</span></p>
                    <p><span className="text-slate-400 font-bold">លេខសម្គាល់ / Asset Code:</span> <span className="text-indigo-900 font-mono font-bold">{viewingForm.assetCode}</span></p>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <p><span className="text-slate-400 font-bold">ម៉ាក / ម៉ូដែល (Brand Model):</span> <span className="text-slate-850 font-bold">{viewingForm.brandModel}</span></p>
                    <p><span className="text-slate-400 font-bold">ប្រភេទម៉ាស៊ីន (Type):</span> <span className="text-slate-800 font-extrabold">{viewingForm.acType}</span></p>
                    <p><span className="text-slate-400 font-bold">កម្លាំងម៉ាស៊ីន (Capacity):</span> <span className="text-slate-800 font-bold">{viewingForm.powerHpBtu}</span></p>
                    <p><span className="text-slate-400 font-bold">អ្នកត្រួតពិនិត្យ / Dept:</span> <span className="text-slate-850 font-bold">{viewingForm.inspectorName} ({viewingForm.department})</span></p>
                  </div>
                </div>
              </div>

              {/* Box 2: Checkpoint Grid Table (២. តារាងត្រួតពិនិត្យម៉ាស៊ីនត្រជាក់) */}
              <div className="space-y-2.5">
                <h5 className="font-moul text-[11px] text-indigo-950 border-l-4 border-emerald-600 pl-2">
                  ២. សន្លឹកត្រួតពិនិត្យលម្អិតទាំង ១៥ ចំណុច (Detailed Inspection Checklist)
                </h5>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-[10.5px] text-left border-collapse bg-white">
                    <thead>
                      <tr className="bg-slate-100 uppercase text-slate-700 font-extrabold text-[9px] border-b border-slate-240">
                        <th className="p-2.5 text-center w-12">ល.រ</th>
                        <th className="p-2.5">ចំណុចត្រួតពិនិត្យ (Checkpoint Description)</th>
                        <th className="p-2.5 text-center w-20">ល្អ (Good)</th>
                        <th className="p-2.5 text-center w-20">មធ្យម (Avg)</th>
                        <th className="p-2.5 text-center w-20">ខូច (Bad)</th>
                        <th className="p-2.5">កំណត់សម្គាល់ (Remarks / Notes)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {CHECKPOINTS.map((pt, i) => {
                        // @ts-ignore
                        const score = viewingForm[pt.id] as 'ល្អ' | 'មធ្យម' | 'ខូច';
                        // @ts-ignore
                        const note = viewingForm[`${pt.id}Note`] || '';
                        return (
                          <tr key={pt.id} className="hover:bg-slate-50/50">
                            <td className="p-2 text-center font-mono font-bold text-slate-400">{i + 1}</td>
                            <td className="p-2">
                              <p className="font-semibold text-slate-800">{pt.label}</p>
                              <p className="text-[9px] text-slate-400 font-mono uppercase">{pt.eng}</p>
                            </td>
                            {/* ល្អ */}
                            <td className="p-2 text-center">
                              {score === 'ល្អ' ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-305 font-bold">✔</span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            {/* មធ្យម */}
                            <td className="p-2 text-center">
                              {score === 'មធ្យម' ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-850 border border-amber-305 font-bold">✔</span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            {/* ខូច */}
                            <td className="p-2 text-center">
                              {score === 'ខូច' ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold">✘</span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            <td className="p-2">
                              <span className="text-slate-650 font-bold font-mono text-[10px] block italic">{note || 'គ្មាន / Regular condition'}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Box 3: Repairs & Actions Subtable (៣. ការជួសជុល) */}
              <div className="space-y-2.5">
                <h5 className="font-moul text-[11px] text-indigo-950 border-l-4 border-emerald-600 pl-2">
                  ៣. សកម្មភាពជួសជុល និងលទ្ធផល (Corrective Maintenance & Actions Record)
                </h5>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-[10.5px] text-left border-collapse bg-white">
                    <thead>
                      <tr className="bg-slate-100 uppercase text-slate-705 font-extrabold text-[9px] border-b border-slate-240">
                        <th className="p-2.5 text-center w-12">ល.រ</th>
                        <th className="p-2.5">បញ្ហាដែលរកឃើញ (Issue Discovered)</th>
                        <th className="p-2.5">សកម្មភាពជួសជុល (Action Taken)</th>
                        <th className="p-2.5">សម្ភារៈប្រើប្រាស់ (Materials Used)</th>
                        <th className="p-2.5 text-center w-20">បរិមាណ (Qty)</th>
                        <th className="p-2.5">កំណត់សម្គាល់ (Notes)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {viewingForm.repairs && viewingForm.repairs.length > 0 ? (
                        viewingForm.repairs.map((rep, rIdx) => (
                          <tr key={rep.id} className="hover:bg-slate-50/50">
                            <td className="p-2 text-center font-mono font-bold text-slate-500">{rIdx + 1}</td>
                            <td className="p-2 font-bold text-slate-800">{rep.issueFound}</td>
                            <td className="p-2 text-slate-700">{rep.repairAction}</td>
                            <td className="p-2 font-mono text-slate-600">{rep.materialsUsed || 'N/A'}</td>
                            <td className="p-2 text-center font-mono font-extrabold text-blue-700">{rep.quantity || '0'}</td>
                            <td className="p-2 text-slate-500 italic font-medium">{rep.notes || 'គ្មាន'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-emerald-700 font-bold bg-emerald-50/30">
                            រកមិនឃើញព័ត៌មានជួសជុលឬបញ្ហា ដែលត្រូវបានកត់ត្រាឡើយ
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Box 4 & 5: maintenance Plan and Outcome */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 4. ផែនការថែទាំ */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-[10.5px] space-y-2.5">
                  <h6 className="font-moul tracking-normal text-slate-900 border-b pb-1.5 text-[9.5px]">
                    ៤. ផែនការថែទាំជាបន្ត (Ongoing Maintenance Plan)
                  </h6>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="flex items-center gap-1.5">
                      <span className="shrink-0">{viewingForm.planCleanNormal ? '☑' : '☐'}</span>
                      <span className="font-bold">សម្អាតធម្មតា</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="shrink-0">{viewingForm.planAddGas ? '☑' : '☐'}</span>
                      <span className="font-bold">បន្ថែម Gas Refrigerant</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="shrink-0">{viewingForm.planChangeParts ? '☑' : '☐'}</span>
                      <span className="font-bold">ប្តូរគ្រឿងបន្លាស់</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="shrink-0">{viewingForm.planRepairWiring ? '☑' : '☐'}</span>
                      <span className="font-bold">ជួសជុលខ្សែភ្លើង</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="shrink-0">{viewingForm.planRepairWaterPipe ? '☑' : '☐'}</span>
                      <span className="font-bold">ជួសជុលបំពង់ទឹក</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="shrink-0">{viewingForm.planSendBigRepair ? '☑' : '☐'}</span>
                      <span className="font-bold">ផ្ញើទៅជួសជុលធំ</span>
                    </p>
                  </div>
                  {viewingForm.planOther && (
                    <p className="border-t pt-1.5 mt-1 text-[11px] text-slate-600 font-medium">
                      <strong className="text-slate-700 font-bold">ផ្សេងៗ (Other detail)៖</strong> {viewingForm.planOtherDetail || 'N/A'}
                    </p>
                  )}
                </div>

                {/* 5. លទ្ធផលបន្ទាប់ពីជួសជុល */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-[10.5px] space-y-2.5">
                  <h6 className="font-moul tracking-normal text-slate-900 border-b pb-1.5 text-[9.5px]">
                    ៥. លទ្ធផលបន្ទាប់ពីជួសជុល (Post-Service Appraisal)
                  </h6>
                  <div className="space-y-2 font-black text-slate-800">
                    <p className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${viewingForm.repairOutcome === 'ដំណើរការល្អ' ? 'bg-emerald-500':'bg-slate-300'}`} />
                      <span className={viewingForm.repairOutcome === 'ដំណើរការល្អ' ? 'text-emerald-700 font-extrabold':''}>
                        ដំណើរការល្អធម្មតា / Operational OK
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${viewingForm.repairOutcome === 'ត្រូវត្រួតពិនិត្យបន្ថែម' ? 'bg-amber-500':'bg-slate-300'}`} />
                      <span className={viewingForm.repairOutcome === 'ត្រូវត្រួតពិនិត្យបន្ថែម' ? 'text-amber-700 font-extrabold':''}>
                        ត្រូវត្រួតពិនិត្យបន្ថែម / Requires Further Check
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${viewingForm.repairOutcome === 'មិនអាចប្រើប្រាស់បាន' ? 'bg-rose-500 animate-pulse':'bg-slate-300'}`} />
                      <span className={viewingForm.repairOutcome === 'មិនអាចប្រើប្រាស់បាន' ? 'text-rose-700 font-extrabold':''}>
                        មិនអាចប្រើប្រាស់បាន / Hard Failure
                      </span>
                    </p>
                  </div>
                  {viewingForm.outcomeNotes && (
                    <div className="border-t border-slate-200 pt-1.5 mt-1">
                      <strong className="text-slate-500 font-bold">កំណត់សម្គាល់បន្ថែម៖</strong>
                      <p className="text-slate-755 font-semibold mt-0.5">{viewingForm.outcomeNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Box 6: Signatures (៦. ហត្ថលេខា) */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white">
                <h5 className="font-moul text-[10.5px] text-slate-950 text-center tracking-normal">
                  ៦. ការបញ្ជាក់ និងហត្ថលេខាព្រមព្រៀង (Endorsements Seals)
                </h5>
                <div className="grid grid-cols-3 gap-6 text-center pt-2">
                  <div className="space-y-12">
                    <div>
                      <p className="font-bold text-slate-700">អ្នកត្រួតពិនិត្យ (Inspector)</p>
                      <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">Physical check performed</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-slate-800 underline decoration-emerald-500 decoration-2 font-mono italic">
                        {viewingForm.inspectorSigName || viewingForm.inspectorName}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">កាលបរិច្ឆេទ៖ {viewingForm.inspectorSigDate || viewingForm.inspectionDate}</p>
                    </div>
                  </div>

                  <div className="space-y-12 border-x">
                    <div>
                      <p className="font-bold text-slate-700">អ្នកជួសជុល (Technician)</p>
                      <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">Applied maintenance action</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-slate-800 underline decoration-emerald-500 decoration-2 font-mono italic">
                        {viewingForm.technicianSigName || 'គឹម ហេង'}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">កាលបរិច្ឆេទ៖ {viewingForm.technicianSigDate || viewingForm.inspectionDate}</p>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div>
                      <p className="font-bold text-slate-700">អ្នកអនុម័ត (Approver)</p>
                      <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">Validation seal review</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-indigo-900 underline decoration-emerald-500 decoration-2 font-mono italic">
                        {viewingForm.approverSigName || 'អ៊ុំ រតនា'}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">កាលបរិច្ឆេទ៖ {viewingForm.approverSigDate || viewingForm.inspectionDate}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer options */}
            <div className="p-4 bg-slate-50 border-t flex items-center justify-end gap-2.5 shrink-0">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black rounded-xl transition cursor-pointer"
              >
                បោះពុម្ពឯកសារ Form (Print Sheet)
              </button>
              <button
                onClick={() => setViewingForm(null)}
                className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-100 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                បិទផ្ទាំង (Close)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT AIR CONDITIONER INSPECTION FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 text-slate-800 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
            
            {/* Header style */}
            <div className="bg-emerald-950 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-emerald-400" />
                <h3 className="font-moul text-xs md:text-sm text-white tracking-normal leading-relaxed">
                  {editingForm ? 'កែប្រែទម្រង់ត្រួតពិនិត្យម៉ាស៊ីនត្រជាក់ (Edit AC Inspection Form)' : 'បញ្ចូលទម្រង់ត្រួតពិនិត្យម៉ាស៊ីនត្រជាក់ថ្មី (Add AC Inspection Form)'}
                </h3>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Scroll Content Area */}
            <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              
              {/* BLOCK 1: ព័ត៌មានទូទៅ */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl relative space-y-4">
                <div className="absolute top-3 right-4 font-bold text-[10px] text-emerald-700 uppercase">
                  SECTION 1: SPECIFICATION INFO
                </div>
                <h4 className="font-moul text-slate-900 text-[10.5px]">១. ព័ត៌មានទូទៅបំពង់ និងម៉ាស៊ីនត្រជាក់</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Form ID */}
                  <div className="space-y-1">
                    <label className="block text-slate-550 font-black">លេខ Form (Form ID)</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden font-mono"
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      required
                    />
                  </div>

                  {/* Inspection Date */}
                  <div className="space-y-1">
                    <label className="block text-slate-550 font-black">កាលបរិច្ឆេទត្រួតពិនិត្យ</label>
                    <input 
                      type="date"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden font-mono"
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                      required
                    />
                  </div>

                  {/* Location Room */}
                  <div className="space-y-1">
                    <label className="block text-slate-550 font-black">ទីតាំង / បន្ទប់ (Location)</label>
                    <input 
                      type="text"
                      placeholder="e.g. បន្ទប់កុំព្យូទ័រជាន់ទី២"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>

                  {/* Asset code */}
                  <div className="space-y-1">
                    <label className="block text-slate-550 font-black">លេខសម្គាល់ម៉ាស៊ីន (Asset Code)</label>
                    <input 
                      type="text"
                      placeholder="e.g. WIS-AC-EQ-123"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden font-mono"
                      value={assetCode}
                      onChange={(e) => setAssetCode(e.target.value)}
                      required
                    />
                  </div>

                  {/* Brand Model */}
                  <div className="space-y-1">
                    <label className="block text-slate-550 font-black">ម៉ាក / Model</label>
                    <input 
                      type="text"
                      placeholder="e.g. Panasonic Inverter, Daikin, LG"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      value={brandModel}
                      onChange={(e) => setBrandModel(e.target.value)}
                      required
                    />
                  </div>

                  {/* AC Type Selector */}
                  <div className="space-y-1">
                    <label className="block text-slate-550 font-black">ប្រភេទម៉ាស៊ីនត្រជាក់</label>
                    <select
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      value={acType}
                      onChange={(e) => setAcType(e.target.value as ACType)}
                    >
                      {AC_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Power HP / BTU */}
                  <div className="space-y-1">
                    <label className="block text-slate-550 font-black">កម្លាំងម៉ាស៊ីន (HP / BTU)</label>
                    <input 
                      type="text"
                      placeholder="e.g. 1.5 HP (12,000 BTU)"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden"
                      value={powerHpBtu}
                      onChange={(e) => setPowerHpBtu(e.target.value)}
                    />
                  </div>

                  {/* Inspector Name */}
                  <div className="space-y-1">
                    <label className="block text-slate-550 font-black">ឈ្មោះអ្នកត្រួតពិនិត្យ</label>
                    <input 
                      type="text"
                      placeholder="e.g. វ៉ាន់ ធារ៉ា"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden"
                      value={inspectorName}
                      onChange={(e) => setInspectorName(e.target.value)}
                    />
                  </div>

                  {/* Department */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-slate-550 font-black">ផ្នែកទទួលបន្ទុក (Department)</label>
                    <input 
                      type="text"
                      placeholder="e.g. ផ្នែកអនាម័យ និងគ្រប់គ្រងទ្រព្យសម្បត្តិ"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* BLOCK 2: CHECKPOINTS TABLE */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-4">
                <h4 className="font-moul text-slate-900 text-[10.5px]">២. តារាងត្រួតពិនិត្យម៉ាស៊ីនត្រជាក់លម្អិត (Checkpoints Radios)</h4>
                
                <div className="space-y-3.5 divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-2 border rounded-xl p-3 bg-slate-50/30">
                  {CHECKPOINTS.map((pt) => {
                    const score = checks[pt.id] || 'ល្អ';
                    const noteValue = checkNotes[`${pt.id}Note`] || '';
                    return (
                      <div key={pt.id} className="pt-3.5 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="md:w-1/3">
                          <p className="font-bold text-slate-800 text-[11px]">{pt.label}</p>
                          <p className="text-[10px] text-slate-450 font-mono uppercase leading-none">{pt.eng}</p>
                        </div>

                        {/* Radios for ល្អ / មធ្យម / ខូច */}
                        <div className="flex items-center gap-4 shrink-0 bg-white p-1.5 px-3 rounded-lg border border-slate-150">
                          {['ល្អ', 'មធ្យម', 'ខូច'].map((lvl) => (
                            <label key={lvl} className="flex items-center gap-1 cursor-pointer font-extrabold text-[10.5px]">
                              <input 
                                type="radio" 
                                name={`chk-${pt.id}`}
                                checked={score === lvl}
                                onChange={() => setChecks({ ...checks, [pt.id]: lvl as 'ល្អ' | 'មធ្យម' | 'ខូច' })}
                                className="text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                              />
                              <span className={
                                lvl === 'ល្អ' ? 'text-emerald-700' :
                                lvl === 'មធ្យម' ? 'text-amber-700' :
                                'text-rose-700'
                              }>{lvl}</span>
                            </label>
                          ))}
                        </div>

                        {/* Note Input field */}
                        <div className="flex-1">
                          <input 
                            type="text"
                            placeholder="កំណត់សម្គាល់សម្រាប់ចំណុចនេះ..."
                            className="w-full bg-white border border-slate-150 rounded-lg px-2.5 py-1.5 text-[10.5px] text-slate-700 focus:outline-hidden focus:border-emerald-500"
                            value={noteValue}
                            onChange={(e) => setCheckNotes({ ...checkNotes, [`${pt.id}Note`]: e.target.value })}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BLOCK 3: SUBTABLE OF REPAIRS MAINTENANCE (ការជួសជុល / Maintenance & Repair) */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-moul text-slate-900 text-[10.5px]">៣. កំណត់ត្រាការងារជួសជុល (Maintenance & Repairs Carried Out)</h4>
                  <button
                    type="button"
                    onClick={addRepairRow}
                    className="inline-flex items-center gap-1 bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>បន្ថែមលំដាប់ជួសជុល (Add Repair)</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[10.5px] text-left">
                    <thead>
                      <tr className="bg-slate-50 uppercase text-slate-500 border-b border-slate-200">
                        <th className="p-2 w-10 text-center">ល.រ</th>
                        <th className="p-2">បញ្ហាដែលរកឃើញ <span className="text-rose-500">*</span></th>
                        <th className="p-2">សកម្មភាពជួសជុល <span className="text-rose-500">*</span></th>
                        <th className="p-2">សម្ភារៈប្រើប្រាស់</th>
                        <th className="p-2 w-20">បរិមាណ (Qty)</th>
                        <th className="p-2">កំណត់សម្គាល់</th>
                        <th className="p-2 w-10 text-center">លុប</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {repairsList.map((rep, idx) => (
                        <tr key={rep.id} className="hover:bg-slate-50/50">
                          <td className="p-2 text-center font-bold text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-2">
                            <input 
                              type="text"
                              value={rep.issueFound}
                              onChange={(e) => updateRepairRowField(idx, 'issueFound', e.target.value)}
                              placeholder="ស្ទះក្បាលបាញ់ទឹក, ខូច Cap, លេចធ្លាយ..."
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-hidden focus:border-emerald-500 font-bold"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="text"
                              value={rep.repairAction}
                              onChange={(e) => updateRepairRowField(idx, 'repairAction', e.target.value)}
                              placeholder="បានបាញ់ផ្លុំខ្យល់, ប្តូរ Cap ថ្មី, បូមទាក់សេ..."
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-hidden focus:border-emerald-500"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="text"
                              value={rep.materialsUsed}
                              onChange={(e) => updateRepairRowField(idx, 'materialsUsed', e.target.value)}
                              placeholder="e.g. Capacitor 45uF, ហ្គាស R32"
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-mono text-[10.5px]"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="text"
                              value={rep.quantity}
                              onChange={(e) => updateRepairRowField(idx, 'quantity', e.target.value)}
                              placeholder="e.g. 1 ឈុត, 2L"
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-mono font-bold"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="text"
                              value={rep.notes}
                              onChange={(e) => updateRepairRowField(idx, 'notes', e.target.value)}
                              placeholder="លទ្ធផលជោគជ័យ..."
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeRepairRow(idx)}
                              className="p-1 hover:bg-rose-100 rounded-md text-rose-600 transition cursor-pointer"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BLOCK 4 & 5: PLAN AND OUTCOME FORM GROUP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                
                {/* 4. ផែនការថែទាំ */}
                <div className="space-y-3.5">
                  <h4 className="font-moul text-slate-900 text-[10px]">៤. ផែនការថែទាំជាបន្ត (Ongoing Maintenance Plan)</h4>
                  <div className="grid grid-cols-2 gap-2 bg-white p-3.5 rounded-xl border">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                      <input 
                        type="checkbox"
                        checked={planCleanNormal}
                        onChange={(e) => setPlanCleanNormal(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>សម្អាតធម្មតា (Standard Clean)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                      <input 
                        type="checkbox"
                        checked={planAddGas}
                        onChange={(e) => setPlanAddGas(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>បន្ថែម Gas Refrigerant</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                      <input 
                        type="checkbox"
                        checked={planChangeParts}
                        onChange={(e) => setPlanChangeParts(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>ប្តូរគ្រឿងបន្លាស់ (Change Parts)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                      <input 
                        type="checkbox"
                        checked={planRepairWiring}
                        onChange={(e) => setPlanRepairWiring(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>ជួសជុលខ្សែភ្លើង (Wiring)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                      <input 
                        type="checkbox"
                        checked={planRepairWaterPipe}
                        onChange={(e) => setPlanRepairWaterPipe(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>ជួសជុលបំពង់ទឹក (Water pipe)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                      <input 
                        type="checkbox"
                        checked={planSendBigRepair}
                        onChange={(e) => setPlanSendBigRepair(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>ផ្ញើទៅជួសជុលធំ (Send to Shop)</span>
                    </label>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-600">
                      <input 
                        type="checkbox"
                        checked={planOther}
                        onChange={(e) => setPlanOther(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span>ផ្សេងៗ (Others)</span>
                    </label>
                    {planOther && (
                      <input 
                        type="text"
                        placeholder="សូមបញ្ជាក់ព័ត៌មានបន្ថែម..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-805 placeholder:text-slate-400 focus:outline-hidden"
                        value={planOtherDetail}
                        onChange={(e) => setPlanOtherDetail(e.target.value)}
                      />
                    )}
                  </div>
                </div>

                {/* 5. លទ្ធផលបន្ទាប់ពីជួសជុល */}
                <div className="space-y-3.5">
                  <h4 className="font-moul text-slate-900 text-[10px]">៥. លទ្ធផលបន្ទាប់ពីជួសជុល (Post-Service Outcome)</h4>
                  <div className="grid grid-cols-1 gap-2 bg-white p-3.5 rounded-xl border">
                    {['ដំណើរការល្អ', 'ត្រូវត្រួតពិនិត្យបន្ថែម', 'មិនអាចប្រើប្រាស់បាន'].map((out) => (
                      <label key={out} className="flex items-center gap-2 cursor-pointer font-extrabold text-[11px]">
                        <input 
                          type="radio"
                          name="repairOutcomeGroup"
                          checked={repairOutcome === out}
                          onChange={() => setRepairOutcome(out as 'ដំណើរការល្អ' | 'ត្រូវត្រួតពិនិត្យបន្ថែម' | 'មិនអាចប្រើប្រាស់បាន')}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className={
                          out === 'ដំណើរការល្អ' ? 'text-emerald-700' :
                          out === 'ត្រូវត្រួតពិនិត្យបន្ថែម' ? 'text-amber-700' :
                          'text-rose-700'
                        }>{out}</span>
                      </label>
                    ))}
                  </div>

                  <div className="space-y-1 font-bold">
                    <label className="block text-slate-550">កំណត់សម្គាល់បន្ថែម (Outcome Remarks):</label>
                    <textarea 
                      rows={2}
                      placeholder="សំណេរកំណត់សម្គាល់បន្ថែមអំពីលទ្ធផល និងការណែនាំដល់អ្នកប្រើប្រាស់..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-805 placeholder:text-slate-400 focus:outline-hidden"
                      value={outcomeNotes}
                      onChange={(e) => setOutcomeNotes(e.target.value)}
                    />
                  </div>
                </div>

              </div>

              {/* BLOCK 6: SIGNATURES FORM INPUT */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-4">
                <h4 className="font-moul text-slate-900 text-[10px] text-center">៦. អ្នកពាក់ព័ន្ធ និងការបញ្ជាក់ហត្ថលេខា (Responsible Sign-off)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
                  
                  {/* Inspector sign detail */}
                  <div className="bg-slate-50 border p-3.5 rounded-xl space-y-2">
                    <p className="font-bold text-slate-700 text-center">អ្នកត្រួតពិនិត្យ / Inspector</p>
                    <div className="space-y-1.5">
                      <input 
                        type="text" 
                        placeholder="ឈ្មោះអ្នកត្រួតពិនិត្យ"
                        className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-center font-bold"
                        value={inspectorSigName}
                        onChange={(e) => setInspectorSigName(e.target.value)}
                        required
                      />
                      <input 
                        type="date"
                        className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-center text-[10px]"
                        value={inspectorSigDate}
                        onChange={(e) => setInspectorSigDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Technician sign detail */}
                  <div className="bg-slate-50 border p-3.5 rounded-xl space-y-2">
                    <p className="font-bold text-slate-700 text-center">អ្នកជួសជុល / Technician</p>
                    <div className="space-y-1.5">
                      <input 
                        type="text" 
                        placeholder="ឈ្មោះជាងជួសជុល"
                        className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-center font-bold"
                        value={technicianSigName}
                        onChange={(e) => setTechnicianSigName(e.target.value)}
                        required
                      />
                      <input 
                        type="date"
                        className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-center text-[10px]"
                        value={technicianSigDate}
                        onChange={(e) => setTechnicianSigDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Approver sign detail */}
                  <div className="bg-slate-50 border p-3.5 rounded-xl space-y-2">
                    <p className="font-bold text-slate-700 text-center">អ្នកអនុម័ត (Admin Approver)</p>
                    <div className="space-y-1.5">
                      <input 
                        type="text" 
                        placeholder="ឈ្មោះអ្នកត្រួតពិនិត្យអនុម័ត"
                        className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-center font-bold"
                        value={approverSigName}
                        onChange={(e) => setApproverSigName(e.target.value)}
                        required
                      />
                      <input 
                        type="date"
                        className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-center text-[10px]"
                        value={approverSigDate}
                        onChange={(e) => setApproverSigDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Form submit footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 hover:bg-slate-105 transition border rounded-xl text-slate-500 font-bold cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2 rounded-xl transition cursor-pointer shadow-xs"
                >
                  {editingForm ? 'កែប្រែទម្រង់ និងរក្សាទុក' : 'រក្សាទុកទម្រង់ និងបញ្ចប់'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CUSTOM CONFIRM DELETE */}
      {deletingId && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-fadeIn text-slate-800">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3.5 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">បញ្ជាក់ការលុបកំណត់ត្រា</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Confirm Record Deletion</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              តើអ្នកពិតជាចង់លុបចោលកំណត់ត្រាត្រួតពិនិត្យកូដ <strong className="text-slate-900 font-mono font-black">[{deletingId}]</strong> នេះមែនទេ? សកម្មភាពនេះមិនអាចសង្គ្រោះវិញបានឡើយ។
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 hover:bg-slate-100 transition border border-slate-200 rounded-xl text-slate-500 text-xs font-bold cursor-pointer"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                onClick={confirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
              >
                លុបចោល (Confirm Delete)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CUSTOM CONFIRM RESET TO DEFAULT */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-fadeIn text-slate-800">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3.5 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">កំណត់ទិន្នន័យឡើងវិញ</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reset To Sample Data</p>
              </div>
            </div>

            <p className="text-xs text-slate-605 font-medium leading-relaxed">
              តើអ្នកពិតជាចង់កំណត់ទិន្នន័យគំរូម៉ាស៊ីនត្រជាក់ឡើងវិញមែនទេ? រាល់ការកែប្រែកន្លងមកនឹងត្រូវលុបចោល។
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 hover:bg-slate-100 transition border border-slate-200 rounded-xl text-slate-500 text-xs font-bold cursor-pointer"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                onClick={confirmResetDefaults}
                className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
              >
                កំណត់ឡើងវិញ (Reset Defaults)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
