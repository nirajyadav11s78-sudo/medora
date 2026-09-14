import React from 'react';
import { Home, Stethoscope, Calendar, MessageCircle } from 'lucide-react';
import { DoctorProfileData } from '../types';

interface MobileBottomBarProps {
  doctor: DoctorProfileData;
  onOpenBooking: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  doctor,
  onOpenBooking
}) => {
  return (
    <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        
        {/* Home */}
        <a 
          href="#"
          className="flex flex-col items-center justify-center py-1 px-3 text-slate-600 hover:text-teal-600 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Home</span>
        </a>

        {/* Services */}
        <a 
          href="#services"
          className="flex flex-col items-center justify-center py-1 px-3 text-slate-600 hover:text-teal-600 transition-colors"
        >
          <Stethoscope className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Services</span>
        </a>

        {/* Appointments (Book Slot) */}
        <button
          onClick={onOpenBooking}
          className="flex flex-col items-center justify-center py-1 px-3 text-teal-700 hover:text-teal-800 transition-colors"
        >
          <Calendar className="w-5 h-5 text-teal-700" />
          <span className="text-[10px] font-bold mt-0.5">Book Slot</span>
        </button>

        {/* WhatsApp Direct Action */}
        <a 
          href={`https://wa.me/${doctor.whatsappNumber}?text=${encodeURIComponent(`Hello Dr. ${doctor.name}, I would like to book an appointment.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30"
        >
          <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
          <span>WhatsApp</span>
        </a>

      </div>
    </div>
  );
};
