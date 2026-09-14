import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  MessageCircle, 
  Building2, 
  Video, 
  CalendarPlus, 
  Printer, 
  Loader2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ServiceItem, DoctorProfileData, ConsultationType, Appointment } from '../types';

interface AppointmentSectionProps {
  services: ServiceItem[];
  doctor: DoctorProfileData;
  onAppointmentBooked: (apt: Appointment) => void;
}

export const AppointmentSection: React.FC<AppointmentSectionProps> = ({
  services,
  doctor,
  onAppointmentBooked
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<ServiceItem>(services[0]);
  const [consultationType, setConsultationType] = useState<ConsultationType>('In-clinic');

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());

  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isDayOff, setIsDayOff] = useState<boolean>(false);
  const [dayOffReason, setDayOffReason] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const [patientName, setPatientName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate]);

  const fetchAvailability = async (dateStr: string) => {
    setLoadingSlots(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/availability?date=${dateStr}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load slots");
      setIsDayOff(data.isDayOff || false);
      setDayOffReason(data.reason || '');
      setAvailableSlots(data.availableSlots || []);
      setAllSlots(data.allSlots || []);
      setBookedSlots(data.bookedSlots || []);
      if (selectedTime && !data.availableSlots.includes(selectedTime)) {
        setSelectedTime('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Could not fetch slots.");
    } finally {
      setLoadingSlots(false);
    }
  };

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

  const cleanPhone = mobile.replace(/\D/g, '');
  const isValidPhone = cleanPhone.length >= 10;

  const handleConfirmBooking = async () => {
    if (!patientName.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!isValidPhone) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!selectedTime) {
      setErrorMsg("Please select a time slot.");
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
        throw new Error(data.error || "Failed to schedule appointment.");
      }

      setBookedAppointment(data.appointment);
      setWhatsappUrl(data.whatsappUrl);
      onAppointmentBooked(data.appointment);

      // Open WhatsApp automatically
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
      }

      setStep(6);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const createGoogleCalendarUrl = () => {
    if (!bookedAppointment) return '#';
    const title = encodeURIComponent(`Dr. Rajesh Sharma Consultation (${bookedAppointment.id})`);
    const details = encodeURIComponent(
      `Appointment ID: ${bookedAppointment.id}\nPatient: ${bookedAppointment.patientName}\nService: ${bookedAppointment.service}\nType: ${bookedAppointment.consultationType}\nClinic: ${doctor.clinicAddress}\nPhone: ${doctor.phone}`
    );
    const location = encodeURIComponent(bookedAppointment.consultationType === 'Video consultation' ? 'Online Video Call' : doctor.clinicAddress);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  return (
    <section id="booking" className="py-16 sm:py-24 bg-white border-b border-slate-200/60 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant Online Booking</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Book Your Consultation
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Select your preferred consultation type, pick an open date & slot, and receive instant confirmation directly on WhatsApp.
          </p>
        </div>

        {/* Booking Card Container */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          
          {/* Progress Indicator */}
          {step <= 5 && (
            <div className="bg-white border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Step {step} of 5: {
                  step === 1 ? 'Service & Type' :
                  step === 2 ? 'Choose Date' :
                  step === 3 ? 'Choose Slot' :
                  step === 4 ? 'Patient Details' : 'Review & Confirm'
                }</span>
                <span className="text-emerald-700 font-semibold">{Math.round((step / 5) * 100)}% Completed</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Form Content Area */}
          <div className="p-6 sm:p-8">
            
            {/* Error Message */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">{errorMsg}</span>
                  {errorMsg.includes('no longer available') && (
                    <span className="block text-rose-700 mt-1">Please select another time slot.</span>
                  )}
                </div>
              </div>
            )}

            {/* Step 1: Service & Type */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    1. Consultation Preference
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setConsultationType('In-clinic')}
                      className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                        consultationType === 'In-clinic'
                          ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-600/20 text-teal-950 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${consultationType === 'In-clinic' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">In-Clinic Consultation</div>
                        <div className="text-xs text-slate-500">Vardhman Plaza, Rohini Sector 14</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConsultationType('Video consultation')}
                      className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                        consultationType === 'Video consultation'
                          ? 'bg-sky-50 border-sky-600 ring-2 ring-sky-600/20 text-sky-950 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${consultationType === 'Video consultation' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">Online Video Consult</div>
                        <div className="text-xs text-slate-500">Prescription sent via WhatsApp</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    2. Select Medical Service
                  </label>
                  <div className="space-y-2.5">
                    {services.map((srv) => {
                      const isSelected = selectedService.id === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => setSelectedService(srv)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                            isSelected 
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
                          }`}
                        >
                          <div>
                            <div className="text-sm sm:text-base font-bold flex items-center gap-2">
                              <span>{srv.title}</span>
                              {srv.popular && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  isSelected ? 'bg-teal-400 text-slate-950' : 'bg-teal-100 text-teal-800'
                                }`}>
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className={`text-xs mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                              {srv.duration} • {srv.description}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-lg font-extrabold">₹{srv.fee}</div>
                            <span className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                              Pay at Clinic
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Choose Date */}
            {step === 2 && (
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Choose Appointment Date
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Clinic consultations run Monday through Saturday.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {getNextDays(6).map((day) => {
                    const isSelected = selectedDate === day.iso;
                    return (
                      <button
                        key={day.iso}
                        type="button"
                        onClick={() => setSelectedDate(day.iso)}
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-700 text-white border-teal-700 shadow-md font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs opacity-80 uppercase font-semibold">{day.weekday}</div>
                        <div className="text-lg font-extrabold mt-0.5">{day.dayNum} {day.month}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3">
                  <label className="text-xs text-slate-500 font-medium block mb-1.5">
                    Or select another date from the calendar:
                  </label>
                  <input
                    type="date"
                    min={getTodayStr()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {isDayOff && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900">
                    ⚠️ {dayOffReason || "The clinic is closed on this date. Please pick another date."}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Choose Time Slot */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Available Slots for {selectedDate}
                  </label>
                  <span className="text-xs font-semibold text-emerald-700">
                    {availableSlots.length} Slots Open
                  </span>
                </div>

                {loadingSlots ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                    <span className="text-xs">Fetching real-time availability...</span>
                  </div>
                ) : isDayOff ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900">
                    Clinic is closed on this date. Please go back and select another date.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Morning shift */}
                    <div>
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2.5">
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
                                className={`py-3 px-2 rounded-xl text-xs font-bold transition-all ${
                                  isBooked
                                    ? 'bg-slate-200/70 text-slate-400 border border-slate-200 cursor-not-allowed line-through'
                                    : isSelected
                                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-600/30'
                                    : 'bg-white border border-slate-200 text-slate-800 hover:border-teal-500 hover:bg-teal-50/50'
                                }`}
                              >
                                {slot}
                                {isBooked && <span className="block text-[9px] font-normal no-underline text-slate-400">Booked</span>}
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {/* Evening shift */}
                    <div>
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2.5">
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
                                className={`py-3 px-2 rounded-xl text-xs font-bold transition-all ${
                                  isBooked
                                    ? 'bg-slate-200/70 text-slate-400 border border-slate-200 cursor-not-allowed line-through'
                                    : isSelected
                                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-600/30'
                                    : 'bg-white border border-slate-200 text-slate-800 hover:border-teal-500 hover:bg-teal-50/50'
                                }`}
                              >
                                {slot}
                                {isBooked && <span className="block text-[9px] font-normal no-underline text-slate-400">Booked</span>}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Patient Info */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Patient Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                      className="w-full pl-24 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Confirmation & digital prescription will be messaged to this WhatsApp number.
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Reason for Consultation <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <textarea
                      rows={2}
                      placeholder="e.g. Fever, cough, diabetes routine checkup..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Summary */}
            {step === 5 && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-3.5">
                  <div className="flex items-center justify-between pb-2.5 border-b border-teal-200">
                    <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">Booking Review</span>
                    <span className="text-xs font-bold text-teal-800 bg-white px-2.5 py-0.5 rounded-md border border-teal-200">
                      {consultationType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
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
                      <span className="text-slate-500 block text-[11px]">Time</span>
                      <span className="font-bold text-emerald-700">{selectedTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Patient Name</span>
                      <span className="font-bold text-slate-900">{patientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Contact Mobile</span>
                      <span className="font-bold text-slate-900">+91 {cleanPhone.slice(-10)}</span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-teal-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Total Consultation Fee</span>
                    <span className="text-lg font-extrabold text-slate-900">₹{selectedService.fee}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>No advance payment required. You will receive an instant appointment record and pre-filled WhatsApp message.</span>
                </div>
              </div>
            )}

            {/* Step 6: Confirmation Screen */}
            {step === 6 && bookedAppointment && (
              <div className="text-center py-4 space-y-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                    Appointment ID: {bookedAppointment.id}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                    Appointment Confirmed!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Your appointment has been registered in the clinic schedule.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-left space-y-2 text-xs sm:text-sm max-w-md mx-auto">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Scheduled Date & Time</span>
                    <span className="font-bold text-slate-900">{bookedAppointment.date} at {bookedAppointment.time}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Patient</span>
                    <span className="font-bold text-slate-900">{bookedAppointment.patientName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Consultation Type</span>
                    <span className="font-medium text-slate-800">{bookedAppointment.consultationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Clinic Location</span>
                    <span className="font-medium text-slate-800 text-right max-w-[200px] text-[11px]">
                      {doctor.clinicAddress}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5 max-w-md mx-auto">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30"
                  >
                    <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                    <span>Send on WhatsApp</span>
                  </a>

                  <a
                    href={createGoogleCalendarUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-300"
                  >
                    <CalendarPlus className="w-4 h-4 text-teal-600" />
                    <span>Add to Google Calendar</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setBookedAppointment(null);
                    }}
                    className="text-xs text-teal-700 hover:underline pt-2 font-medium"
                  >
                    Book another appointment →
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Step Buttons */}
          {step <= 5 && (
            <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              ) : <span />}

              {step < 5 ? (
                <button
                  type="button"
                  disabled={
                    (step === 2 && isDayOff) ||
                    (step === 3 && !selectedTime) ||
                    (step === 4 && (!patientName.trim() || !isValidPhone))
                  }
                  onClick={() => setStep(step + 1)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white shadow-xs cursor-pointer"
                >
                  Continue
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmBooking}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Booking...</span>
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
    </section>
  );
};
