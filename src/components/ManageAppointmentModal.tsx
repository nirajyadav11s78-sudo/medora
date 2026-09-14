import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  Ban, 
  MessageCircle, 
  Loader2 
} from 'lucide-react';
import { Appointment, DoctorProfileData } from '../types';

interface ManageAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorProfileData;
}

export const ManageAppointmentModal: React.FC<ManageAppointmentModalProps> = ({
  isOpen,
  onClose,
  doctor
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Reschedule state
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setErrorMsg("Please enter an Appointment ID (e.g. APT-1021) or your 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/appointments/lookup?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No appointment found.");
      }
      setAppointments(data.appointments || []);
    } catch (err: any) {
      setAppointments([]);
      setErrorMsg(err.message || "Failed to find appointment.");
    } finally {
      setLoading(false);
    }
  };

  const loadSlotsForReschedule = async (dateStr: string) => {
    setLoadingRescheduleSlots(true);
    try {
      const res = await fetch(`/api/availability?date=${dateStr}`);
      const data = await res.json();
      if (res.ok) {
        setAvailableSlots(data.availableSlots || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRescheduleSlots(false);
    }
  };

  const handleCancel = async (aptId: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment? Your slot will be made available for other patients.")) {
      return;
    }

    setUpdating(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/appointments/${aptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel");
      
      setSuccessMsg(`Appointment ${aptId} has been cancelled successfully.`);
      // Update local item
      setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: 'Cancelled' } : a));
    } catch (err: any) {
      setErrorMsg(err.message || "Could not cancel appointment.");
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmReschedule = async (aptId: string) => {
    if (!newDate || !newTime) {
      setErrorMsg("Please select both a new date and time slot.");
      return;
    }

    setUpdating(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/appointments/${aptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newDate,
          time: newTime,
          status: 'Pending'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reschedule");

      setSuccessMsg(`Appointment rescheduled to ${newDate} at ${newTime}!`);
      setReschedulingId(null);
      setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, date: newDate, time: newTime, status: 'Pending' } : a));
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reschedule.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Confirmed ✅</span>;
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Pending ⏳</span>;
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">Completed 🩺</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Cancelled ❌</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Manage Your Appointment
            </h3>
            <p className="text-xs text-slate-500">
              Check status, reschedule to another slot, or cancel
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Enter Appointment ID (e.g. APT-1021) or Mobile Number"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find'}
            </button>
          </form>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Results list */}
          {appointments.length > 0 && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Found {appointments.length} Appointment(s)
              </div>

              {appointments.map((apt) => (
                <div 
                  key={apt.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-teal-700 font-mono">
                        {apt.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        {apt.service}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Patient: <strong>{apt.patientName}</strong> • {apt.mobile}
                      </p>
                    </div>
                    <div>{getStatusBadge(apt.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.time}</span>
                    </div>
                  </div>

                  {/* Reschedule View */}
                  {reschedulingId === apt.id ? (
                    <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 space-y-3">
                      <div className="text-xs font-bold text-teal-900">
                        Choose New Date & Slot
                      </div>

                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={newDate}
                        onChange={(e) => {
                          setNewDate(e.target.value);
                          loadSlotsForReschedule(e.target.value);
                        }}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                      />

                      {loadingRescheduleSlots ? (
                        <div className="text-xs text-slate-500 py-2 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Loading available slots...
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Available slots:
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {availableSlots.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setNewTime(slot)}
                                className={`py-1.5 px-1 rounded text-[11px] font-bold border ${
                                  newTime === slot 
                                    ? 'bg-emerald-600 text-white border-emerald-600' 
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-teal-50'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : newDate ? (
                        <div className="text-xs text-amber-800">
                          No available slots for this date.
                        </div>
                      ) : null}

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setReschedulingId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={updating || !newDate || !newTime}
                          onClick={() => handleConfirmReschedule(apt.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white text-xs font-bold cursor-pointer"
                        >
                          {updating ? 'Updating...' : 'Save New Slot'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal Actions */
                    apt.status !== 'Cancelled' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setReschedulingId(apt.id);
                            setNewDate(apt.date);
                            loadSlotsForReschedule(apt.date);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reschedule
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCancel(apt.id)}
                          className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Cancel
                        </button>

                        <a
                          href={`https://wa.me/${doctor.whatsappNumber}?text=${encodeURIComponent(`Hello Dr. ${doctor.name}, I have a query regarding my appointment ${apt.id} on ${apt.date}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                          title="Message Clinic on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                        </a>
                      </div>
                    )
                  )}

                </div>
              ))}
            </div>
          )}

          {appointments.length === 0 && !loading && !errorMsg && (
            <div className="text-center py-8 text-slate-400">
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs text-slate-500">
                Enter your Appointment ID or registered 10-digit mobile number above to view or modify your booking.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
