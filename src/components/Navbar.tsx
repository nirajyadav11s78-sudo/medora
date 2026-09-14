import React, { useState } from 'react';
import { 
  Phone, 
  Calendar, 
  Search, 
  UserCheck, 
  Menu, 
  X, 
  Clock, 
  ShieldCheck, 
  MessageCircle,
  Stethoscope
} from 'lucide-react';
import { DoctorProfileData } from '../types';

interface NavbarProps {
  doctor: DoctorProfileData;
  onOpenBooking: (serviceId?: string) => void;
  onOpenManage: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  doctor,
  onOpenBooking,
  onOpenManage,
  onOpenAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro-bar for trust & quick hours */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 text-teal-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Reg: {doctor.registrationNumber}
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Today: 10:00 AM – 1:30 PM & 5:30 PM – 8:30 PM
            </span>
            <span className="text-slate-300">
              📍 {doctor.landmark}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={onOpenManage} 
              className="text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Search className="w-3 h-3 text-teal-400" />
              Find / Reschedule Appointment
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={onOpenAdmin} 
              className="text-slate-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <UserCheck className="w-3 h-3" />
              Doctor Portal
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Brand Logo & Doctor Name */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-teal-600 to-sky-800 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-6 h-6 text-teal-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-display">
                  {doctor.name}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                  MBBS, MD
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                {doctor.clinicName} • {doctor.specialization}
              </p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-slate-700">
            <a href="#about" className="hover:text-teal-600 transition-colors">About Doctor</a>
            <a href="#services" className="hover:text-teal-600 transition-colors">Services</a>
            <a href="#booking" className="hover:text-teal-600 transition-colors">Book Slot</a>
            <a href="#reviews" className="hover:text-teal-600 transition-colors">Patient Reviews</a>
            <a href="#contact" className="hover:text-teal-600 transition-colors">Contact & Timings</a>
          </nav>

          {/* Desktop Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a 
              href={`tel:${doctor.phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-xs font-semibold border border-slate-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{doctor.phone}</span>
            </a>

            <button
              onClick={() => onOpenBooking()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>Book on WhatsApp</span>
            </button>
          </div>

          {/* Mobile hamburger & phone trigger */}
          <div className="flex items-center gap-2 sm:hidden">
            <a 
              href={`tel:${doctor.phone.replace(/\s+/g, '')}`}
              className="p-2 text-slate-600 hover:text-teal-600 rounded-lg hover:bg-slate-100"
              aria-label="Call clinic"
            >
              <Phone className="w-5 h-5" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs text-slate-500">
            <span>Reg: {doctor.registrationNumber}</span>
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
              className="text-teal-700 font-semibold"
            >
              Doctor Login →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm font-medium text-slate-700">
            <a 
              href="#about" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50"
            >
              About Doctor
            </a>
            <a 
              href="#services" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50"
            >
              Services & Fees
            </a>
            <a 
              href="#reviews" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50"
            >
              Patient Reviews
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50"
            >
              Clinic Address
            </a>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              Book Appointment on WhatsApp
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenManage();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              Check Existing Appointment Status
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
