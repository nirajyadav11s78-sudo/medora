import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  MessageCircle, 
  Video, 
  Building2, 
  CalendarPlus,
  Printer,
  Sparkles,
  Loader2,
  Share2
} from 'lucide-react';
import { ServiceItem, DoctorProfileData, ConsultationType, Appointment } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceItem[];
  doctor: DoctorProfileData;
  initialServiceId?: string;
  onAppointmentBooked?: (appointment: Appointment) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  services,
  doctor,
  initialServiceId,
  onAppointmentBooked
}) => {
  // Steps: 1: Service/Type, 2: Date, 3: Time, 4: Patient Info, 5: Summary, 6: Success Screen
  const [step, setStep] = useState<number>(1);
  
  // Selection states
  const [selectedService, setSelectedService] = useState<ServiceItem>(services[0]);
  const [consultationType, setConsultationType] = useState<ConsultationType>('In-clinic');
  
  // Date selection
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());

  // Availability state
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isDayOff, setIsDayOff] = useState<boolean>(false);
  const [dayOffReason, setDayOffReason] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Patient inputs
  const [patientName, setPatientName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  // Booking & Error states
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');

  // Reset or preset when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialServiceId) {
        const found = services.find(s => s.id === initialServiceId);
        if (found) {
          setSelectedService(found);
          if (found.type === 'Video consultation') {
            setConsultationType('Video consultation');
          } else if (found.type === 'In-clinic') {
            setConsultationType('In-clinic');
          }
        }
      }
      setStep(1);
      setErrorMsg('');
      setBookedAppointment(null);
    }
  }, [isOpen, initialServiceId, services]);

  // Fetch real availability when date changes
  useEffect(() => {
    if (!selectedDate) return;
    fetchAvailability(selectedDate);
  }, [selectedDate]);

  const fetchAvailability = async (dateStr: string) => {
    setLoadingSlots(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/availability?date=${dateStr}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load time slots");
      }
      setIsDayOff(data.isDayOff || false);
      setDayOffReason(data.reason || '');
      setAvailableSlots(data.availableSlots || []);
      setAllSlots(data.allSlots || []);
      setBookedSlots(data.bookedSlots || []);

      // If previously selected time is no longer available, clear it
      if (selectedTime && !data.availableSlots.includes(selectedTime)) {
        setSelectedTime('');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to load availability for this date.");
    } finally {
      setLoadingSlots(false);
    }
  };

  if (!isOpen) return null;

  // Helpers for date options
  const getNextDays = (count: number = 7) => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < count; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      let label = `${weekday}, ${dayNum} ${month}`;
      if (i === 0) label = `Today (${dayNum} ${month})`;
      if (i === 1) label = `Tomorrow (${dayNum} ${month})`;
      days.push({ iso, label, weekday, dayNum, month });
    }
    return days;
  };

  // Indian Phone validation helper
  const cleanPhone = mobile.replace(/\D/g, '');
  const isValidPhone = cleanPhone.length >= 10;

  // Handle final appointment confirmation
  const handleConfirmBooking = async () => {
    if (!patientName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!isValidPhone) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!selectedTime) {
      setErrorMsg("Please select an available time slot.");
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const formattedMobile = cleanPhone.startsWith('91') && cleanPhone.length > 10 
        ? `+${cleanPhone}` 
        : `+91 ${cleanPhone.slice(-10)}`;

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          patientName: patientName.trim(),
          mobile: formattedMobile,
          email: email.trim() || undefined,
          service: selectedService.title,
          consultationType,
          reason: reason.trim() || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          // Double booking detected by backend!
          throw new Error(data.error || "This time slot was just booked by someone else. Please select another slot.");
        }
        throw new Error(data.error || "Failed to schedule appointment.");
      }

      setBookedAppointment(data.appointment);
      setWhatsappUrl(data.whatsappUrl);
      if (onAppointmentBooked) {
        onAppointmentBooked(data.appointment);
      }

      // Automatically open WhatsApp message in new window for 60-second seamless flow
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
      }

      // Move to success screen
      setStep(6);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // Google Calendar generator
  const createGoogleCalendarUrl = () => {
    if (!bookedAppointment) return '#';
    // Format: YYYYMMDDTHHMMSS
    const dateParts = bookedAppointment.date.replace(/-/g, '');
    const title = encodeURIComponent(`Dr. Rajesh Sharma Consultation (${bookedAppointment.id})`);
    const details = encodeURIComponent(
      `Appointment ID: ${bookedAppointment.id}\nPatient: ${bookedAppointment.patientName}\nService: ${bookedAppointment.service}\nType: ${bookedAppointment.consultationType}\nClinic: ${doctor.clinicAddress}\nPhone: ${doctor.phone}`
    );
    const location = encodeURIComponent(bookedAppointment.consultationType === 'Video consultation' ? 'Online Video Call' : doctor.clinicAddress);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              {step <= 5 ? `Step ${step}/5` : 'Done'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {step === 6 ? 'Appointment Scheduled!' : 'Book Doctor Appointment'}
              </h3>
              <p className="text-xs text-slate-500">
                {doctor.name} • {doctor.specialization}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">

          {/* Global Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMsg}</p>
                {errorMsg.includes('no longer available') && (
                  <p className="text-[11px] text-rose-600 mt-1">Please select another available time slot below.</p>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 1: CHOOSE SERVICE & CONSULTATION TYPE ================= */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Choose Consultation Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultationType('In-clinic')}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      consultationType === 'In-clinic'
                        ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 text-teal-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${consultationType === 'In-clinic' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold">In-Clinic Visit</div>
                      <div className="text-[11px] text-slate-500">Rohini Sector 14, Delhi</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationType('Video consultation')}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      consultationType === 'Video consultation'
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20 text-sky-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${consultationType === 'Video consultation' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold">Video Consult</div>
                      <div className="text-[11px] text-slate-500">Prescription on WhatsApp</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Select Medical Service
                </label>
                <div className="space-y-2.5">
                  {services.map((srv) => {
                    const isSelected = selectedService.id === srv.id;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedService(srv)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="text-sm font-bold flex items-center gap-2">
                            <span>{srv.title}</span>
                            {srv.popular && (
                              <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                                isSelected ? 'bg-teal-500 text-slate-950' : 'bg-teal-100 text-teal-800'
                              }`}>
                                Popular
                              </span>
                            )}
                          </div>
                          <div className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {srv.duration} • {srv.description.slice(0, 75)}...
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-base font-extrabold">₹{srv.fee}</div>
                          <div className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                            Pay at Clinic
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: SELECT DATE ================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Appointment Date
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Clinic is open Monday through Saturday (Sunday Closed).
                </p>

                {/* Quick Date Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {getNextDays(6).map((day) => {
                    const isSelected = selectedDate === day.iso;
                    return (
                      <button
                        key={day.iso}
                        type="button"
                        onClick={() => setSelectedDate(day.iso)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-[11px] opacity-80 uppercase font-semibold">{day.weekday}</div>
                        <div className="text-base font-extrabold mt-0.5">{day.dayNum} {day.month}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Or Custom Date Input */}
                <div className="pt-2">
                  <label className="text-xs text-slate-500 font-medium block mb-1.5">
                    Or select a specific date:
                  </label>
                  <input
                    type="date"
                    min={getTodayStr()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {isDayOff && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-800">
                  ⚠️ <strong>Clinic is closed on this date:</strong> {dayOffReason || "Scheduled weekly day-off or official leave. Please select another date."}
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 3: SELECT TIME SLOT ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Choose Time Slot
                  </label>
                  <span className="text-xs text-teal-700 font-semibold">
                    Date: {selectedDate}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Each appointment is 25-30 minutes. Real-time availability prevents overlapping bookings.
                </p>

                {loadingSlots ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                    <span className="text-xs">Checking real-time doctor availability...</span>
                  </div>
                ) : isDayOff ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-800">
                    Clinic is closed on this date. Please go back and select another date.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Morning Shift */}
                    <div>
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>Morning Shift (10:00 AM – 01:30 PM)</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {allSlots
                          .filter(s => s.includes('AM') || s.startsWith('12:'))
                          .map((slot) => {
                            const isBooked = bookedSlots.includes(slot);
                            const isSelected = selectedTime === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={isBooked}
                                onClick={() => setSelectedTime(slot)}
                                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                                  isBooked
                                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed line-through'
                                    : isSelected
                                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                                    : 'bg-white border border-slate-200 text-slate-800 hover:border-teal-500 hover:bg-teal-50/50'
                                }`}
                              >
                                {slot}
                                {isBooked && <span className="block text-[9px] font-normal no-underline">Booked</span>}
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {/* Evening Shift */}
                    <div>
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        <span>Evening Shift (05:30 PM – 08:30 PM)</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {allSlots
                          .filter(s => s.includes('PM') && !s.startsWith('12:'))
                          .map((slot) => {
                            const isBooked = bookedSlots.includes(slot);
                            const isSelected = selectedTime === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={isBooked}
                                onClick={() => setSelectedTime(slot)}
                                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                                  isBooked
                                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed line-through'
                                    : isSelected
                                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                                    : 'bg-white border border-slate-200 text-slate-800 hover:border-teal-500 hover:bg-teal-50/50'
                                }`}
                              >
                                {slot}
                                {isBooked && <span className="block text-[9px] font-normal no-underline">Booked</span>}
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {availableSlots.length === 0 && !loadingSlots && (
                      <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-800 border border-amber-200">
                        All slots for this date are completely booked! Please select another date.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 4: PATIENT DETAILS ================= */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Patient Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number (WhatsApp) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-2.5 flex items-center gap-1 text-slate-500 text-sm font-semibold border-r border-slate-200 pr-2">
                    <span>🇮🇳 +91</span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-24 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Your appointment confirmation & digital prescription will be sent to this WhatsApp number.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason for Visit / Symptoms <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    placeholder="e.g. High fever for 2 days, body ache, cough..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 5: SUMMARY & CONFIRMATION ================= */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-teal-200/60">
                  <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">Appointment Summary</span>
                  <span className="text-xs font-bold text-teal-800 bg-white px-2 py-0.5 rounded-md border border-teal-200">
                    {consultationType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Doctor</span>
                    <span className="font-bold text-slate-900">{doctor.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Service</span>
                    <span className="font-bold text-slate-900">{selectedService.title}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Date</span>
                    <span className="font-bold text-slate-900">{selectedDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Time Slot</span>
                    <span className="font-bold text-emerald-700">{selectedTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Patient Name</span>
                    <span className="font-bold text-slate-900">{patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Mobile</span>
                    <span className="font-bold text-slate-900">+91 {cleanPhone.slice(-10)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-teal-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Total Consultation Fee</span>
                  <span className="text-base font-extrabold text-slate-900">₹{selectedService.fee}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 text-slate-700 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>No advance payment required:</strong> Your appointment is registered instantly in the clinic database. When you tap <strong>Confirm & Book on WhatsApp</strong>, a formatted message will open in WhatsApp to confirm directly with Dr. Sharma's reception.
                </p>
              </div>
            </div>
          )}

          {/* ================= STEP 6: SUCCESS SCREEN ================= */}
          {step === 6 && bookedAppointment && (
            <div className="space-y-6 text-center py-2 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Appointment ID: {bookedAppointment.id}
                </span>
                <h4 className="text-2xl font-extrabold text-slate-900 font-display">
                  Appointment Scheduled!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Your slot has been reserved for <strong>{bookedAppointment.patientName}</strong> with <strong>{doctor.name}</strong>.
                </p>
              </div>

              {/* Details card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5 text-xs sm:text-sm max-w-md mx-auto">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Scheduled Date & Time</span>
                  <span className="font-bold text-slate-900">{bookedAppointment.date} at {bookedAppointment.time}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Consultation Type</span>
                  <span className="font-semibold text-slate-800">{bookedAppointment.consultationType}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Clinic Address</span>
                  <span className="font-medium text-slate-800 text-right max-w-[200px] text-[11px] leading-tight">
                    {doctor.clinicAddress}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                    {bookedAppointment.status} (Reserved)
                  </span>
                </div>
              </div>

              {/* Action Buttons on Success */}
              <div className="flex flex-col gap-2.5 max-w-md mx-auto">
                {/* 1. Open WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all"
                >
                  <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                  <span>Send Confirmation on WhatsApp</span>
                </a>

                {/* 2. Add to Google Calendar */}
                <a
                  href={createGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-300"
                >
                  <CalendarPlus className="w-4 h-4 text-teal-600" />
                  <span>Add to Google Calendar</span>
                </a>

                {/* 3. Print / Save Slip */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-2 px-4 rounded-xl text-slate-500 hover:text-slate-700 text-xs flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        {step <= 5 && (
          <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <span />
            )}

            {step < 5 ? (
              <button
                type="button"
                disabled={
                  (step === 2 && isDayOff) ||
                  (step === 3 && !selectedTime) ||
                  (step === 4 && (!patientName.trim() || !isValidPhone))
                }
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white transition-all cursor-pointer"
              >
                Continue
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmBooking}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reserving Slot...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                    <span>Confirm & Book on WhatsApp</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
