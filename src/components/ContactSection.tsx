import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Navigation, 
  Car, 
  Train, 
  ExternalLink 
} from 'lucide-react';
import { DoctorProfileData } from '../types';

interface ContactSectionProps {
  doctor: DoctorProfileData;
  onOpenBooking: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ doctor, onOpenBooking }) => {
  return (
    <section id="contact" className="py-16 sm:py-24 bg-white border-b border-slate-200/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>Clinic Location & Hours</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Visit Arogya Medical Care
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Conveniently situated in Rohini Sector 14 with elevator access, ample visitor parking, and walking distance from the metro.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact cards */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Address card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>Clinic Address</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {doctor.clinicName}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {doctor.clinicAddress}
              </p>
              <div className="text-xs text-teal-800 font-medium pt-1">
                Landmark: {doctor.landmark}
              </div>

              <div className="pt-3 flex flex-wrap gap-2">
                <a
                  href={doctor.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions on Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>

            {/* Timings card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Consultation Timings</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900">Morning Shift</div>
                  <div className="text-teal-700 font-semibold mt-0.5">10:00 AM – 01:30 PM</div>
                  <div className="text-[11px] text-slate-500">Mon, Tue, Wed, Thu, Fri, Sat</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900">Evening Shift</div>
                  <div className="text-teal-700 font-semibold mt-0.5">05:30 PM – 08:30 PM</div>
                  <div className="text-[11px] text-slate-500">Mon, Tue, Wed, Thu, Fri, Sat</div>
                </div>
              </div>
              <div className="text-xs text-rose-700 font-medium pt-1">
                Sunday: Closed for routine OPD (Telehealth emergencies on appointment only)
              </div>
            </div>

            {/* Phone & WhatsApp Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Phone Contact</span>
                <a
                  href={`tel:${doctor.phone.replace(/\s+/g, '')}`}
                  className="text-base font-extrabold text-slate-900 hover:text-teal-600 flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span>{doctor.phone}</span>
                </a>
                <span className="text-[11px] text-slate-500 block mt-0.5">Available 9 AM to 9 PM</span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">WhatsApp Business</span>
                <a
                  href={`https://wa.me/${doctor.whatsappNumber}?text=${encodeURIComponent(`Hello Dr. ${doctor.name}, I have a medical enquiry.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800"
                >
                  <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                  <span>Message on WhatsApp</span>
                </a>
                <span className="text-[11px] text-slate-500 block mt-0.5">Fast reply within 15 mins</span>
              </div>
            </div>

            {/* Transit & Parking Badges */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                <Train className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Rohini West Metro Station (350m walk)</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                <Car className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Dedicated visitor parking plaza</span>
              </div>
            </div>

          </div>

          {/* Right: Interactive Map Simulation */}
          <div className="lg:col-span-6 rounded-3xl overflow-hidden border border-slate-200/90 shadow-md bg-slate-100 flex flex-col h-[420px] sm:h-[480px]">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-bold text-slate-800">Clinic Map & Coordinates</span>
              </div>
              <a
                href={doctor.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Map visual iframe representation */}
            <div className="flex-1 relative bg-slate-200">
              <iframe
                title="Clinic Location Map"
                src="https://maps.google.com/maps?q=Rohini+Sector+14+Delhi&t=&z=14&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              
              {/* Overlay location pin badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-slate-200 text-xs">
                <div className="font-bold text-slate-900">{doctor.clinicName}</div>
                <div className="text-slate-600 text-[11px] truncate">Ground Floor, Vardhman Plaza, Sector 14 Rohini, Delhi</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
