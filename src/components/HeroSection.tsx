import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Video, 
  Phone, 
  CheckCircle2, 
  ArrowRight,
  MessageCircle,
  Building2,
  Sparkles
} from 'lucide-react';
import { DoctorProfileData } from '../types';

interface HeroSectionProps {
  doctor: DoctorProfileData;
  onOpenBooking: () => void;
  onScrollToBooking: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  doctor,
  onOpenBooking,
  onScrollToBooking
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/40 via-white to-slate-50 pt-8 pb-14 sm:pt-14 sm:pb-20 border-b border-slate-200/70">
      {/* Subtle background ambient circles */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-teal-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-sky-100/40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Top Qualification & Trust Tag */}
            <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs sm:text-sm font-semibold shadow-2xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
              </span>
              <span>Available for Appointments Today</span>
              <span className="text-teal-300">•</span>
              <span className="text-teal-700 font-medium">15+ Yrs Clinical Experience</span>
            </div>

            {/* Doctor Name & Heading */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-display">
                {doctor.name}
              </h1>
              <p className="text-lg sm:text-xl font-semibold text-teal-700">
                {doctor.title} — {doctor.specialization}
              </p>
            </div>

            {/* Trust Statement */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Ethical, evidence-based healthcare with dedicated personal time for every patient. 
              Specialized in diabetes control, hypertension, viral illnesses, and preventive health checks 
              with minimal waiting time.
            </p>

            {/* Key Clinic Location & Modality Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">In-Clinic Consultation</div>
                  <div className="text-[11px] text-slate-500">Rohini Sector 14, New Delhi</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-700">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Online Video Consultation</div>
                  <div className="text-[11px] text-slate-500">Digital prescription on WhatsApp</div>
                </div>
              </div>
            </div>

            {/* Primary & Secondary Call to Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              {/* WhatsApp Appointment Booking (Primary) */}
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 cursor-pointer text-center"
                id="hero-whatsapp-booking-btn"
              >
                <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                <span>Book Appointment on WhatsApp</span>
              </button>

              {/* View Available Slots */}
              <button
                onClick={onScrollToBooking}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all hover:-translate-y-0.5 cursor-pointer"
                id="hero-view-slots-btn"
              >
                <Calendar className="w-4 h-4 text-teal-400" />
                <span>View Available Slots</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Call Clinic CTA */}
              <a
                href={`tel:${doctor.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-300 shadow-2xs transition-colors"
                id="hero-call-clinic-btn"
              >
                <Phone className="w-4 h-4 text-slate-500" />
                <span>Call Clinic</span>
              </a>
            </div>

            {/* Micro badges below CTA */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                No advance payment needed
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Direct Doctor Confirmation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                Free Rescheduling
              </span>
            </div>

          </div>

          {/* Right Hero Visual with Floating Cards */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm sm:max-w-md">
              
              {/* Doctor Portrait Card */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-teal-500 to-sky-900 p-1.5 shadow-2xl">
                <div className="rounded-[22px] overflow-hidden bg-slate-100 aspect-[3/4] relative">
                  <img
                    src={doctor.imageUrl}
                    alt={`${doctor.name} - Senior Physician`}
                    className="w-full h-full object-cover object-top hover:scale-102 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="eager"
                  />
                  {/* Subtle gradient vignette at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-4">
                    <div className="text-white">
                      <div className="font-bold text-sm">{doctor.name}</div>
                      <div className="text-xs text-teal-200">Delhi Medical Council: {doctor.registrationNumber}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card 1: Available Today (Top Right) */}
              <div className="absolute -top-3 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-slate-200/80 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100/80 flex items-center justify-center text-teal-700">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Available Today</div>
                  <div className="text-[11px] text-teal-700 font-medium">Slots Open for Booking</div>
                </div>
              </div>

              {/* Floating Card 2: Verified Doctor (Top Left) */}
              <div className="absolute top-1/4 -left-3 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-slate-200/80 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Verified Doctor</div>
                  <div className="text-[11px] text-slate-500">AIIMS & MAMC Alumnus</div>
                </div>
              </div>

              {/* Floating Card 3: Google Rating & Reviews (Bottom Right) */}
              <div className="absolute -bottom-4 right-2 sm:-right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 font-bold text-sm">
                  ★ 4.9
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">500+ Patients Treated</div>
                  <div className="text-[10px] text-slate-500">Verified Patient Feedback</div>
                </div>
              </div>

              {/* Floating Card 4: WhatsApp Instant Booking Badge */}
              <div className="absolute bottom-16 -left-3 sm:-left-6 bg-emerald-50/95 backdrop-blur-md rounded-xl py-2 px-3 shadow-md border border-emerald-200 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <span className="text-[11px] font-bold text-emerald-800">Direct WhatsApp Booking</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
