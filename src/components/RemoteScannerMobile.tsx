/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Staff, DEPARTMENT_NAMES_KM } from '../types';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, Camera, CheckCircle2, AlertCircle, RefreshCw, 
  Smartphone, Wifi, Send, ArrowLeft, HelpCircle, Check, X, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RemoteScannerMobileProps {
  staffList: Staff[];
  channelId: string;
  onExit: () => void;
}

export default function RemoteScannerMobile({ staffList, channelId, onExit }: RemoteScannerMobileProps) {
  const [scannerActive, setScannerActive] = useState(true);
  const [manualInput, setManualInput] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'linking' | 'connected' | 'error'>('linking');
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    staffName?: string;
    staffId?: string;
    photo?: string;
    dept?: string;
    time?: string;
  }>({ status: 'idle', message: '' });

  const [recentScans, setRecentScans] = useState<Array<{
    id: string;
    staffName: string;
    staffId: string;
    time: string;
  }>>([]);

  const [autoResume, setAutoResume] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const lastScannedRef = React.useRef<{ code: string; time: number }>({ code: '', time: 0 });
  const [flashState, setFlashState] = useState<'none' | 'success' | 'error'>('none');

  // Web Audio Beeper for dynamic physical/sensory feedback like a real handheld scanner
  const playBeep = (type: 'success' | 'error') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      if (type === 'success') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(950, audioCtx.currentTime); // Quick pleasant chirp
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.12);
      } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(260, audioCtx.currentTime); // Soft alert warning buzz
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.28);
      }
    } catch (e) {
      console.error("Audio Context beep fail", e);
    }
  };

  // Verify connection with computer on boot by writing a handshake telemetry
  useEffect(() => {
    setSyncStatus('linking');
    const handshakeData = {
      connected: true,
      handshakeTime: Date.now(),
      staffCount: staffList.length,
      device: navigator.userAgent.includes('Mobile') ? 'Mobile Phone' : 'Web Browser'
    };

    fetch(`/api/db/wis_remotescan_status_${channelId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: handshakeData })
    })
    .then(() => {
      setSyncStatus('connected');
    })
    .catch(err => {
      console.error("Handshake fail", err);
      setSyncStatus('error');
    });
  }, [channelId, staffList.length]);

  // Handle reporting scanned code to the computer database key
  const transmitScanCode = (code: string) => {
    const cleaned = code.trim();
    const match = cleaned.match(/(WIS-\d+|STAFF-\d+|[A-Z0-9-]+)/i);
    const codeToSearch = match ? match[0].toUpperCase() : cleaned.toUpperCase();

    // Prevent duplicate triggers of the exact same code within 3 seconds so continuous sweep works nicely
    const nowTime = Date.now();
    if (lastScannedRef.current.code === codeToSearch && (nowTime - lastScannedRef.current.time) < 3000) {
      return;
    }
    lastScannedRef.current = { code: codeToSearch, time: nowTime };

    const staff = staffList.find(s => 
      s.staffId.trim().toUpperCase() === codeToSearch ||
      s.name.trim().toUpperCase() === cleaned.toUpperCase()
    );

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: true 
    });

    if (staff) {
      playBeep('success');
      setFlashState('success');
      setTimeout(() => setFlashState('none'), 800);
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate(100);
        }
      } catch {}

      // Valid staff found on mobile! Express-delivery of payload to server key
      const scanPayload = {
        staffId: staff.staffId,
        scannedBy: 'Wireless Mobile Scanner',
        timestamp: Date.now(),
        nonce: Math.random()
      };

      setScanResult({
        status: 'success',
        message: 'ទិន្នន័យវត្តមាន ត្រូវបានផ្ញើទៅកុំព្យូទ័រជាស្វ័យប្រវត្ត!',
        staffName: staff.name,
        staffId: staff.staffId,
        photo: staff.photo,
        dept: DEPARTMENT_NAMES_KM[staff.department],
        time: timeStr
      });

      // Update recent local tracking
      setRecentScans(prev => [
        { id: Math.random().toString(), staffName: staff.name, staffId: staff.staffId, time: timeStr },
        ...prev
      ].slice(0, 4));

      // Push scan to database! This triggers computer's poller instantly
      fetch(`/api/db/wis_remotescan_${channelId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: scanPayload })
      })
      .then(() => {
        // Voice alert feedback
        try {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(`${staff.name} sent.`);
            utterance.rate = 1.1;
            utterance.volume = 0.5;
            window.speechSynthesis.speak(utterance);
          }
        } catch { }
      })
      .catch((err) => {
        console.error("Transmission error", err);
        setSyncStatus('error');
      });

    } else {
      playBeep('error');
      setFlashState('error');
      setTimeout(() => setFlashState('none'), 800);
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      } catch {}

      // Staff not found, but we can still transmit the raw code to let the computer parse it!
      const rawPayload = {
        staffId: codeToSearch,
        scannedBy: 'Wireless Mobile Scanner',
        timestamp: Date.now(),
        nonce: Math.random()
      };

      setScanResult({
        status: 'error',
        message: `រកមិនឃើញលេខកូដ "${codeToSearch}" ក្នុងបញ្ជីបុគ្គលិកលើទូរស័ព្ទឡើយ ប៉ុន្តែត្រូវបានបញ្ជូនទៅកុំព្យូទ័រដើម្បីផ្ទៀងផ្ទាត់។`
      });

      fetch(`/api/db/wis_remotescan_${channelId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: rawPayload })
      });
    }
  };

  // Continuous Auto-Resume timer countdown effect
  useEffect(() => {
    if (scanResult.status === 'idle') {
      setCountdown(0);
      return;
    }
    if (!autoResume) return;

    // Fast automatic skip duration: 1.5s for success checkins, 3s for error prompts
    const duration = scanResult.status === 'success' ? 1.5 : 3.0;
    setCountdown(duration);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      setCountdown(parseFloat(remaining.toFixed(1)));

      if (elapsed >= duration) {
        clearInterval(interval);
        setScanResult({ status: 'idle', message: '' });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [scanResult.status, autoResume]);

  // Camera QR Scanning flow (exact same high-performance lifecycle with optimized high FPS scan)
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    
    if (scannerActive && syncStatus === 'connected') {
      try {
        const qrContainer = document.getElementById("mobile-qr-reader");
        if (qrContainer) {
          html5QrCode = new Html5Qrcode("mobile-qr-reader");
          html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 22, // Optimized from 12 to 22 FPS for ultra responsive, immediate auto detection
              qrbox: (width: number, height: number) => {
                const size = Math.min(width, height) * 0.75;
                return { width: size, height: size };
              }
            },
            (decodedText: string) => {
              transmitScanCode(decodedText);
            },
            () => { /* passive fail */ }
          ).catch(err => {
            console.error("Mobile camera start error", err);
          });
        }
      } catch (e) {
        console.error("Scanner exception mobile", e);
      }
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        try {
          html5QrCode.stop().then(() => {
            html5QrCode.clear();
          }).catch(err => console.error("Mobile scanner stop error", err));
        } catch (err) { }
      }
    };
  }, [scannerActive, syncStatus]);

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 flex flex-col z-50 overflow-y-auto font-sans">
      {/* Background soft color flares */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none z-0" />
      
      {/* Top Header navbar bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center justify-between shrink-0 relative z-10">
        <div className="flex items-center gap-2.5">
          <button 
            type="button" 
            onClick={onExit}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5 uppercase font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>WIS Remotescan</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold">ម៉ាស៊ីនស្កេនទូរស័ព្ទដៃឥតខ្សែ (Wireless Scanner Mode)</p>
          </div>
        </div>

        {/* Sync telemetry mode badge */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full text-[10px] font-black tracking-wider">
          {syncStatus === 'connected' ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 uppercase">ភ្ជាប់ជោគជ័យ</span>
            </>
          ) : syncStatus === 'linking' ? (
            <>
              <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
              <span className="text-amber-400 uppercase">កំពុងភ្ជាប់...</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-rose-500 uppercase">កំហុសសេវា</span>
            </>
          )}
        </div>
      </header>

      {/* Main viewport */}
      <main className="flex-1 p-4 flex flex-col gap-5 max-w-md mx-auto w-full relative z-10">
        
        {/* Connection status banner and pairing channel */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-slate-950 text-emerald-400 rounded-xl border border-slate-850">
            <Smartphone className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400">ឆានែលប្រព័ន្ធភ្ជាប់ (Channel Link Code)</p>
            <p className="text-sm font-black font-mono text-amber-400 tracking-wider mt-0.5">{channelId}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-slate-400 font-extrabold">បញ្ជីបុគ្គលិក</p>
            <p className="text-xs font-mono font-black text-slate-200">{staffList.length} នាក់</p>
          </div>
        </div>

        {/* Live Camera Scanner Box */}
        <div className="bg-slate-900 border border-slate-850 rounded-3xl p-4.5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-300 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>កាមេរ៉ាស្កេនទូរស័ព្ទ (Live Mobile Camera)</span>
            </span>
            <span className="text-[9.5px] bg-slate-950 font-mono px-2 py-0.5 rounded text-amber-500 font-extrabold uppercase">
              SCANNING
            </span>
          </div>

          <div className="relative aspect-square w-full max-w-[280px] mx-auto bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center p-3">
            {scannerActive && (
              <div id="mobile-qr-reader" className="w-full h-full overflow-hidden rounded-xl" />
            )}

            {/* Micro scan visual target framing & Success/Error continuous flash overlay */}
            <div className={`absolute inset-0 pointer-events-none rounded-2xl transition-all duration-300 z-20 ${
              flashState === 'success' 
                ? 'border-4 border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : flashState === 'error'
                ? 'border-4 border-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                : 'border-2 border-emerald-500/10'
            }`}>
              {/* Scan target grids */}
              {flashState === 'none' && (
                <div className="w-full h-full relative flex items-center justify-center">
                  <div className="w-44 h-44 border border-dashed border-emerald-400/50 rounded-xl relative">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan" style={{ animationDuration: '2s', animationIterationCount: 'infinite' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Non-blocking premium floating outcome card HUD */}
            <AnimatePresence>
              {scanResult.status !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 220 }}
                  className="absolute bottom-3 left-3 right-3 bg-slate-900/95 border border-slate-800 rounded-2xl p-3 shadow-2xl z-30 pointer-events-auto backdrop-blur-md"
                >
                  <div className="flex gap-3 items-center">
                    {/* Status Circle */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      scanResult.status === 'success' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                    }`}>
                      {scanResult.status === 'success' ? <Check className="w-5 h-5 font-black" /> : <X className="w-5 h-5 font-black" />}
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-[10px] font-black uppercase tracking-wider ${
                        scanResult.status === 'success' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {scanResult.status === 'success' ? 'បញ្ជូនវត្តមានជោគជ័យ' : 'រកមិនឃើញលេខកូដ'}
                      </p>

                      {scanResult.status === 'success' ? (
                        <div className="mt-0.5">
                          <h4 className="text-xs font-black text-white truncate max-w-[150px] uppercase leading-tight">{scanResult.staffName}</h4>
                          <p className="text-[9.5px] text-slate-400 font-medium leading-none mt-0.5">
                            {scanResult.dept} • <span className="font-mono text-[9px] text-amber-500">{scanResult.staffId}</span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-350 leading-normal truncate max-w-[160px] font-medium mt-0.5">
                          {scanResult.message}
                        </p>
                      )}
                    </div>

                    {/* Photo/Avatar on success (if present) */}
                    {scanResult.status === 'success' && (
                      <div className="shrink-0">
                        {scanResult.photo ? (
                          <img 
                            src={scanResult.photo} 
                            alt={scanResult.staffName} 
                            className="w-10 h-10 rounded-xl border border-slate-700 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-black text-amber-400">
                            WIS
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Manual Close indicator */}
                  <button 
                    onClick={() => setScanResult({ status: 'idle', message: '' })}
                    className="absolute top-2 right-2 text-slate-550 hover:text-white p-1 rounded-full transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Manual Manual Staff ID input fallback */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-4 space-y-2.5">
          <label className="block text-xs font-black text-slate-300">
            បញ្ចូលកូដ ឬឈ្មោះដោយផ្ទាល់ (Manual Code Entry Backup)៖
          </label>
          <div className="flex gap-2.5">
            <input 
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="ឧទាហរណ៍៖ WIS-1002"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-black text-slate-200 placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={() => {
                if (!manualInput.trim()) return;
                transmitScanCode(manualInput.trim());
                setManualInput('');
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ផ្ញើ</span>
            </button>
          </div>
        </div>

        {/* Rolling scan log history inside the phone */}
        <div className="bg-slate-900/60 border border-slate-850/80 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-black text-slate-400 flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            <span>ប្រវត្តិស្កេនក្នុងទូរស័ព្ទនេះ (Mobile History logs)</span>
          </h4>

          {recentScans.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-850 rounded-xl text-[10px] text-slate-650 font-bold">
              មិនទាន់មានការស្កេនវត្តមាននៅឡើយទេ
            </div>
          ) : (
            <div className="space-y-2">
              {recentScans.map(log => (
                <div key={log.id} className="p-2 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-extrabold text-slate-200">{log.staffName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{log.staffId}</p>
                  </div>
                  <span className="font-mono text-[9px] text-amber-500 font-extrabold bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                    {log.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      <footer className="mt-auto py-5 text-center text-[10px] text-slate-500 font-bold border-t border-slate-900">
        WESTERN ATTENDANCE HUB • MOBILE CONNECTOR v1.5
      </footer>
    </div>
  );
}
