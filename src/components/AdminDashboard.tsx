import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Clock3, 
  AlertCircle, 
  Search, 
  Download, 
  RefreshCw, 
  Check, 
  Ban, 
  FileSpreadsheet, 
  MessageCircle, 
  Settings, 
  Sliders, 
  CalendarDays, 
  LogOut, 
  UserCheck, 
  Building, 
  ExternalLink,
  Phone,
  Copy,
  Plus,
  Trash2
} from 'lucide-react';
import { 
  Appointment, 
  DoctorProfileData, 
  ClinicScheduleConfig, 
  ServiceItem, 
  GoogleSheetsConfig, 
  AppointmentStatus 
} from '../types';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorProfileData;
  onUpdateDoctorProfile: (profile: Partial<DoctorProfileData>) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  doctor,
  onUpdateDoctorProfile
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Tabs: 'appointments' | 'schedule' | 'sheets' | 'profile'
  const [activeTab, setActiveTab] = useState<'appointments' | 'schedule' | 'sheets' | 'profile'>('appointments');

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<string>('today');
  const [search, setSearch] = useState<string>('');
  const [loadingApts, setLoadingApts] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0, pending: 0, confirmed: 0, completed: 0 });

  // Schedule management state
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [newBlockDate, setNewBlockDate] = useState<string>('');
  const [slotDuration, setSlotDuration] = useState<number>(30);
  const [morningStart, setMorningStart] = useState<string>('10:00');
  const [morningEnd, setMorningEnd] = useState<string>('13:30');
  const [eveningStart, setEveningStart] = useState<string>('17:30');
  const [eveningEnd, setEveningEnd] = useState<string>('20:30');
  const [savingSchedule, setSavingSchedule] = useState(false);

  // WhatsApp & Clinic profile settings state
  const [whatsappNum, setWhatsappNum] = useState<string>(doctor.whatsappNumber);
  const [phoneNum, setPhoneNum] = useState<string>(doctor.phone);
  const [clinicAddress, setClinicAddress] = useState<string>(doctor.clinicAddress);

  // Google Sheets integration state
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>({
    webhookUrl: '',
    sheetName: 'Appointments',
    autoSync: true
  });
  const [savingSheets, setSavingSheets] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [notification, setNotification] = useState<string>('');

  // Admin password management state
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [passChangeLoading, setPassChangeLoading] = useState(false);
  const [passChangeMsg, setPassChangeMsg] = useState('');
  const [passChangeError, setPassChangeError] = useState('');

  const handleCopyForGoogleSheets = () => {
    if (appointments.length === 0) {
      showNotification("No appointments available to copy.");
      return;
    }
    const headers = ["Appointment ID", "Date", "Time", "Patient Name", "Mobile", "Service", "Consultation Type", "Status", "Booking Time", "Notes"];
    const rows = appointments.map(a => [
      a.id,
      a.date,
      a.time,
      a.patientName,
      a.mobile,
      a.service,
      a.consultationType,
      a.status,
      a.bookingTime,
      a.notes || a.reason || ''
    ]);
    const tsv = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsv);
    showNotification("Copied! Open Google Sheets and press Ctrl+V to paste.");
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAppointments();
      loadAdminConfig();
    }
  }, [isOpen, isAuthenticated, filter, search]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Incorrect password. Please use 'niraj1234'.");
      }
      setIsAuthenticated(true);
    } catch (err: any) {
      setAuthError(err.message || "Failed to authenticate.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeLoading(true);
    setPassChangeMsg('');
    setPassChangeError('');
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPassInput,
          newPassword: newPassInput
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }
      setPassChangeMsg(data.message || "Password successfully changed!");
      setCurrentPassInput('');
      setNewPassInput('');
      showNotification("Portal password successfully updated");
    } catch (err: any) {
      setPassChangeError(err.message || "Failed to update password");
    } finally {
      setPassChangeLoading(false);
    }
  };

  const loadAppointments = async () => {
    setLoadingApts(true);
    try {
      const res = await fetch(`/api/admin/appointments?filter=${filter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok) {
        setAppointments(data.appointments || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApts(false);
    }
  };

  const loadAdminConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (res.ok) {
        if (data.scheduleConfig) {
          setBlockedDates(data.scheduleConfig.blockedDates || []);
          setSlotDuration(data.scheduleConfig.slotDurationMinutes || 30);
          if (data.scheduleConfig.morningShift) {
            setMorningStart(data.scheduleConfig.morningShift.start);
            setMorningEnd(data.scheduleConfig.morningShift.end);
          }
          if (data.scheduleConfig.eveningShift) {
            setEveningStart(data.scheduleConfig.eveningShift.start);
            setEveningEnd(data.scheduleConfig.eveningShift.end);
          }
        }
      }

      const sRes = await fetch('/api/admin/sheets-config');
      const sData = await sRes.json();
      if (sRes.ok) {
        setSheetsConfig(sData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (aptId: string, newStatus: AppointmentStatus) => {
    try {
      const res = await fetch(`/api/appointments/${aptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: newStatus } : a));
        // If confirmed, open WhatsApp message confirmation link for patient
        if (newStatus === 'Confirmed' && data.whatsappConfirmUrl) {
          window.open(data.whatsappConfirmUrl, '_blank', 'noopener,noreferrer');
        }
        showNotification(`Appointment ${aptId} marked as ${newStatus}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBlockDate = async (dateStr: string) => {
    try {
      const res = await fetch('/api/admin/block-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, blockDate: true })
      });
      const data = await res.json();
      if (res.ok) {
        setBlockedDates(data.blockedDates);
        showNotification(`Holiday/Blocked dates updated.`);
        setNewBlockDate('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSchedule = async () => {
    setSavingSchedule(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleConfig: {
            morningShift: { start: morningStart, end: morningEnd },
            eveningShift: { start: eveningStart, end: eveningEnd },
            slotDurationMinutes: Number(slotDuration),
            blockedDates
          },
          doctorProfile: {
            whatsappNumber: whatsappNum.replace(/\D/g, ''),
            phone: phoneNum,
            clinicAddress
          }
        })
      });
      if (res.ok) {
        onUpdateDoctorProfile({
          whatsappNumber: whatsappNum.replace(/\D/g, ''),
          phone: phoneNum,
          clinicAddress
        });
        showNotification("Clinic hours and contact settings saved successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleSaveSheetsConfig = async () => {
    setSavingSheets(true);
    try {
      const res = await fetch('/api/admin/sheets-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetsConfig)
      });
      if (res.ok) {
        showNotification("Google Sheets synchronization settings updated!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSheets(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Confirmed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">🟢 Confirmed</span>;
      case 'Pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">🟠 Pending</span>;
      case 'Completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800">🔵 Completed</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">🔴 Cancelled</span>;
      case 'No Show':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">⚫ No Show</span>;
    }
  };

  // Pre-filled Google Apps Script template code
  const googleAppsScriptCode = 
`// Google Apps Script for Dr. Rajesh Sharma Clinic
// Paste this in Google Sheets: Extensions -> Apps Script -> Deploy as Web App
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName("Appointments") || doc.getActiveSheet();
    
    // Create headers if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Appointment ID", "Date", "Time", "Patient Name", "Mobile", "Service", "Consultation Type", "Status", "Booking Time", "Notes"]);
    }
    
    var data = JSON.parse(e.postData.contents);
    
    // Check if ID already exists to update
    var rows = sheet.getDataRange().getValues();
    var rowIndex = -1;
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] == data.appointmentId) {
        rowIndex = i + 1;
        break;
      }
    }
    
    var rowValues = [
      data.appointmentId,
      data.date,
      data.time,
      data.patientName,
      data.mobile,
      data.service,
      data.consultationType,
      data.status,
      data.bookingTime,
      data.notes || ""
    ];
    
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }
    
    return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Clinic Admin Portal — {doctor.clinicName}
              </h2>
              <p className="text-xs text-slate-400">
                Doctor: {doctor.name} ({doctor.registrationNumber})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Notification Banner */}
        {notification && (
          <div className="bg-teal-600 text-white px-6 py-2 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top-1">
            <span>✓ {notification}</span>
            <button onClick={() => setNotification('')}><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Auth Screen if not logged in */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Doctor / Staff Authentication</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your clinic security password to manage appointments, schedule, and Google Sheets sync.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3.5 text-left">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Password / PIN
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter password (e.g. niraj1234)"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <div className="text-[11px] text-slate-400 mt-1">
                    Doctor portal password: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">niraj1234</code>
                  </div>
                </div>

                {authError && (
                  <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {authLoading ? 'Verifying...' : 'Unlock Dashboard'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard Tabs */
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            
            {/* Nav Tabs */}
            <div className="bg-white border-b border-slate-200 px-6 flex items-center justify-between overflow-x-auto">
              <div className="flex space-x-6 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'appointments'
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Appointments ({stats.today} Today)</span>
                </button>

                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'schedule'
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Doctor Availability & Shifts</span>
                </button>

                <button
                  onClick={() => setActiveTab('sheets')}
                  className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'sheets'
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Google Sheets Sync</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'profile'
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Clinic & WhatsApp Settings</span>
                </button>
              </div>

              {/* Quick Sheet Actions */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyForGoogleSheets}
                  title="Copies table data formatted for instant paste into Google Sheets"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copy for Google Sheets</span>
                </button>
                <a
                  href="/api/admin/export-csv"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download .CSV</span>
                </a>
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noreferrer"
                  title="Open a blank Google Sheet in a new tab"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 text-xs transition-colors"
                >
                  <span>sheets.new</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* TAB 1: APPOINTMENTS TABLE */}
            {activeTab === 'appointments' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                
                {/* Google Sheet Access Banner */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-emerald-900 text-sm">
                        Appointments Spreadsheet for nirajyadav11s78@gmail.com
                      </div>
                      <div className="text-emerald-700 text-[11px] mt-0.5">
                        Export all booked patient records directly into your personal Google Sheet or Excel anytime.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyForGoogleSheets}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy for Google Sheets</span>
                    </button>
                    <a
                      href="/api/admin/export-csv"
                      download
                      className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-bold flex items-center gap-1.5 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CSV</span>
                    </a>
                  </div>
                </div>
                
                {/* Stats cards row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Today's Total</span>
                    <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{stats.today}</div>
                  </div>
                  <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-amber-700 uppercase">Pending Confirmations</span>
                    <div className="text-2xl font-extrabold text-amber-900 mt-0.5">{stats.pending}</div>
                  </div>
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase">Confirmed</span>
                    <div className="text-2xl font-extrabold text-emerald-900 mt-0.5">{stats.confirmed}</div>
                  </div>
                  <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-sky-700 uppercase">Completed</span>
                    <div className="text-2xl font-extrabold text-sky-900 mt-0.5">{stats.completed}</div>
                  </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                    {[
                      { id: 'today', label: "Today's" },
                      { id: 'tomorrow', label: 'Tomorrow' },
                      { id: 'upcoming', label: 'Upcoming' },
                      { id: 'pending', label: 'Pending' },
                      { id: 'completed', label: 'Completed' },
                      { id: 'cancelled', label: 'Cancelled' },
                      { id: 'all', label: 'All Records' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          filter === tab.id
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search patient, phone, or ID..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Table View */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-4">ID</th>
                          <th className="py-3 px-4">Date & Time</th>
                          <th className="py-3 px-4">Patient Name</th>
                          <th className="py-3 px-4">Mobile</th>
                          <th className="py-3 px-4">Service & Type</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Quick Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {loadingApts ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400">
                              Loading appointments...
                            </td>
                          </tr>
                        ) : appointments.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400">
                              No appointments found for "{filter}".
                            </td>
                          </tr>
                        ) : (
                          appointments.map((apt) => (
                            <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-teal-800">
                                {apt.id}
                              </td>
                              <td className="py-3 px-4 font-semibold text-slate-900">
                                <div>{apt.date}</div>
                                <div className="text-[11px] text-teal-700 font-bold">{apt.time}</div>
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-900">
                                <div>{apt.patientName}</div>
                                {apt.reason && (
                                  <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{apt.reason}</div>
                                )}
                              </td>
                              <td className="py-3 px-4 font-mono">
                                <a 
                                  href={`tel:${apt.mobile.replace(/\D/g, '')}`} 
                                  className="text-slate-800 hover:text-teal-600 hover:underline"
                                >
                                  {apt.mobile}
                                </a>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-800">{apt.service}</div>
                                <div className="text-[10px] text-slate-500">{apt.consultationType}</div>
                              </td>
                              <td className="py-3 px-4">
                                {getStatusBadge(apt.status)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Confirm Button */}
                                  {apt.status !== 'Confirmed' && apt.status !== 'Completed' && (
                                    <button
                                      title="Confirm appointment & send WhatsApp confirmation"
                                      onClick={() => handleUpdateStatus(apt.id, 'Confirmed')}
                                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Confirm</span>
                                    </button>
                                  )}

                                  {/* Complete Button */}
                                  {apt.status === 'Confirmed' && (
                                    <button
                                      title="Mark completed"
                                      onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                                      className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>Done ✓</span>
                                    </button>
                                  )}

                                  {/* Cancel Button */}
                                  {apt.status !== 'Cancelled' && (
                                    <button
                                      title="Cancel appointment"
                                      onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                                    >
                                      <Ban className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* WhatsApp Direct Chat */}
                                  <a
                                    title="Open WhatsApp chat with patient"
                                    href={`https://wa.me/${apt.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${apt.patientName}, regarding your appointment ${apt.id} with Dr. ${doctor.name}...`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                                  >
                                    <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                                  </a>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: SCHEDULE & SLOTS */}
            {activeTab === 'schedule' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Clinic OPD Shifts & Slot Duration
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure OPD working hours. The system automatically computes slots and removes booked timings.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Morning Shift */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <span className="text-xs font-bold text-slate-700 block">Morning Shift</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">Start Time</label>
                          <input
                            type="time"
                            value={morningStart}
                            onChange={(e) => setMorningStart(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">End Time</label>
                          <input
                            type="time"
                            value={morningEnd}
                            onChange={(e) => setMorningEnd(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Evening Shift */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <span className="text-xs font-bold text-slate-700 block">Evening Shift</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">Start Time</label>
                          <input
                            type="time"
                            value={eveningStart}
                            onChange={(e) => setEveningStart(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">End Time</label>
                          <input
                            type="time"
                            value={eveningEnd}
                            onChange={(e) => setEveningEnd(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slot Duration */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800">Consultation Slot Duration</div>
                      <div className="text-[11px] text-slate-500">Determines time allotted per patient</div>
                    </div>
                    <select
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(Number(e.target.value))}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-bold"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={20}>20 Minutes</option>
                      <option value={30}>30 Minutes (Recommended)</option>
                      <option value={45}>45 Minutes</option>
                    </select>
                  </div>
                </div>

                {/* Blocked Dates / Holidays */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Clinic Holidays & Blocked Dates
                    </h3>
                    <p className="text-xs text-slate-500">
                      Dates marked here will automatically be unavailable for patient booking.
                    </p>
                  </div>

                  {/* Add date to block */}
                  <div className="flex gap-2 max-w-sm">
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={newBlockDate}
                      onChange={(e) => setNewBlockDate(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                    <button
                      type="button"
                      disabled={!newBlockDate}
                      onClick={() => handleToggleBlockDate(newBlockDate)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Block Date
                    </button>
                  </div>

                  {/* Current blocked dates */}
                  {blockedDates.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {blockedDates.map(date => (
                        <span 
                          key={date}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200"
                        >
                          <span>{date}</span>
                          <button 
                            onClick={() => handleToggleBlockDate(date)} 
                            className="text-rose-600 hover:text-rose-900"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 py-2">
                      No custom holiday dates blocked yet.
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      disabled={savingSchedule}
                      onClick={handleSaveSchedule}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      {savingSchedule ? 'Saving...' : 'Save Availability Changes'}
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: GOOGLE SHEETS SYNC */}
            {activeTab === 'sheets' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                        <h3 className="text-lg font-bold text-slate-900 font-display">
                          Google Sheets Automated Sync
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Every patient booking is securely saved in the database AND automatically synchronized to your clinic Google Sheet.
                      </p>
                    </div>

                    <a
                      href="/api/admin/export-csv"
                      download
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Latest CSV</span>
                    </a>
                  </div>

                  {/* Webhook Configuration Form */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Google Apps Script Webhook URL (Optional for live sync)
                      </label>
                      <input
                        type="url"
                        placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                        value={sheetsConfig.webhookUrl}
                        onChange={(e) => setSheetsConfig({ ...sheetsConfig, webhookUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-mono"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        When configured, the server fires a secure background POST request so your Google Sheet updates in real-time.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sheetsConfig.autoSync}
                          onChange={(e) => setSheetsConfig({ ...sheetsConfig, autoSync: e.target.checked })}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>Enable instant background sync on new bookings</span>
                      </label>

                      <button
                        type="button"
                        disabled={savingSheets}
                        onClick={handleSaveSheetsConfig}
                        className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        {savingSheets ? 'Saving...' : 'Save Webhook Settings'}
                      </button>
                    </div>
                  </div>

                  {/* Ready-to-use Google Apps Script Template */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        30-Second Setup: Google Apps Script Code
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(googleAppsScriptCode);
                          setCopiedScript(true);
                          setTimeout(() => setCopiedScript(false), 2500);
                        }}
                        className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
                      >
                        {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Script Code'}</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto max-h-48">
                      <pre>{googleAppsScriptCode}</pre>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                      <p><strong>Instructions:</strong></p>
                      <p>1. Open your Google Sheet, go to <strong>Extensions → Apps Script</strong>.</p>
                      <p>2. Paste the snippet above and click <strong>Deploy → New deployment</strong>.</p>
                      <p>3. Select <strong>Web app</strong>, set "Who has access" to <strong>Anyone</strong>, and click Deploy.</p>
                      <p>4. Paste the resulting Web App URL into the Webhook input above!</p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 4: CLINIC & WHATSAPP SETTINGS */}
            {activeTab === 'profile' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Clinic WhatsApp & Contact Settings
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure your clinic's WhatsApp business destination number and contact telephone.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        WhatsApp Business Number (with country code, digits only)
                      </label>
                      <input
                        type="tel"
                        value={whatsappNum}
                        onChange={(e) => setWhatsappNum(e.target.value)}
                        placeholder="e.g. 919876543210"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                      />
                      <span className="text-[10px] text-slate-400">All patient booking messages will open to this number.</span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Clinic Display Phone Number
                      </label>
                      <input
                        type="text"
                        value={phoneNum}
                        onChange={(e) => setPhoneNum(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Clinic Full Address
                    </label>
                    <textarea
                      rows={2}
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={savingSchedule}
                      onClick={handleSaveSchedule}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      {savingSchedule ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </div>

                {/* Security & Admin Password Section */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-display">
                        Admin Portal Security
                      </h3>
                      <p className="text-xs text-slate-500">
                        Update your doctor & staff authentication password.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          required
                          value={currentPassInput}
                          onChange={(e) => setCurrentPassInput(e.target.value)}
                          placeholder="Current password"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          minLength={4}
                          value={newPassInput}
                          onChange={(e) => setNewPassInput(e.target.value)}
                          placeholder="At least 4 characters"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                        />
                      </div>
                    </div>

                    {passChangeError && (
                      <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
                        {passChangeError}
                      </div>
                    )}

                    {passChangeMsg && (
                      <div className="p-3 bg-teal-50 text-teal-800 text-xs rounded-xl border border-teal-200 flex items-center gap-1.5 font-semibold">
                        <Check className="w-4 h-4 text-teal-700" />
                        <span>{passChangeMsg}</span>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={passChangeLoading}
                        className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                      >
                        {passChangeLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
