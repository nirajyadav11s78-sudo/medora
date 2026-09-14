import React, { useState } from 'react';
import { 
  Stethoscope, 
  Phone, 
  MapPin, 
  Mail, 
  Calendar, 
  MessageCircle, 
  ShieldCheck, 
  Heart,
  X
} from 'lucide-react';
import { DoctorProfileData } from '../types';

interface FooterProps {
  doctor: DoctorProfileData;
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  onOpenManage: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  doctor,
  onOpenBooking,
  onOpenAdmin,
  onOpenManage
}) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-24 sm:pb-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Doctor branding & bio */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold">
                <Stethoscope className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="text-lg font-bold text-white font-display block">
                  {doctor.name}
                </span>
                <span className="text-xs text-teal-400">
                  {doctor.title}
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              Senior Consultant Physician & Diabetologist with over 15 years of clinical practice. 
              Committed to ethical, unhurried, and evidence-guided medical consultations.
            </p>

            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-teal-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Delhi Medical Council: {doctor.registrationNumber}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#about" className="hover:text-white transition-colors">About Doctor</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Services & Fees</a></li>
              <li><a href="#booking" className="hover:text-white transition-colors">Book Online</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">Patient Reviews</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Clinic Timings</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Patient FAQs</a></li>
            </ul>
          </div>

          {/* Col 3: Patient Care & Actions */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Patient Services
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button 
                  onClick={onOpenBooking} 
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Book on WhatsApp
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenManage} 
                  className="hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  Find or Reschedule Booking
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenAdmin} 
                  className="text-slate-400 hover:text-teal-300 cursor-pointer"
                >
                  Doctor Admin Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setShowPrivacyModal(true)} 
                  className="hover:text-white cursor-pointer"
                >
                  Patient Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setShowTermsModal(true)} 
                  className="hover:text-white cursor-pointer"
                >
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hours */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Clinic Contact
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>{doctor.clinicAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <a href={`tel:${doctor.phone.replace(/\s+/g, '')}`} className="hover:text-white font-mono">
                  {doctor.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{doctor.email}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Medical Disclaimer Section */}
        <div className="py-6 border-b border-slate-800 text-[11px] text-slate-500 leading-relaxed space-y-2">
          <p>
            <strong>Medical Disclaimer:</strong> The information provided on this website is for general educational, informational, and appointment booking purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or emergency hospital treatment. Always seek the advice of your qualified physician with any questions you may have regarding a medical condition.
          </p>
          <p>
            <strong>Emergency Care:</strong> If you believe you have a medical emergency, please call <strong>112 / 102</strong> or report immediately to the nearest casualty emergency department.
          </p>
        </div>

        {/* Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} {doctor.clinicName}. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Designed for Indian Healthcare Standards</span>
            <span>•</span>
            <span>DMC Registered</span>
          </div>
        </div>

      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 max-w-lg w-full rounded-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base">Patient Privacy Policy</h3>
              <button onClick={() => setShowPrivacyModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="text-xs leading-relaxed space-y-2.5 text-slate-600">
              <p>We take patient confidentiality and personal medical data privacy with the utmost seriousness. In accordance with Indian healthcare regulations and the Digital Personal Data Protection Act:</p>
              <p>1. <strong>Collection:</strong> We collect patient names, phone numbers, appointment timestamps, and consultation history strictly for clinical scheduling and direct healthcare delivery.</p>
              <p>2. <strong>Confidentiality:</strong> Medical notes, diagnoses, and prescriptions are strictly confidential between patient and doctor.</p>
              <p>3. <strong>No Third-Party Sharing:</strong> We never sell, rent, or distribute patient contact details to commercial advertisers, pharmaceutical marketing agents, or unauthorized third parties.</p>
              <p>4. <strong>Security:</strong> All appointment records are maintained in secured databases with access restricted to authorized clinic staff.</p>
            </div>
            <button 
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 max-w-lg w-full rounded-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base">Clinic Terms & Conditions</h3>
              <button onClick={() => setShowTermsModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="text-xs leading-relaxed space-y-2.5 text-slate-600">
              <p>1. <strong>Appointments:</strong> Time slots reserved through this website represent scheduled consultation times. While we make every effort to adhere strictly to schedule, emergency patient cases may occasionally cause brief delays.</p>
              <p>2. <strong>Cancellations & Rescheduling:</strong> Patients may cancel or reschedule at no charge. We request at least 2 hours advance notice so that slots may be offered to other unwell patients.</p>
              <p>3. <strong>Video Consultations:</strong> Online telehealth consultations are provided in compliance with Telemedicine Practice Guidelines issued by the Medical Council of India / National Medical Commission.</p>
              <p>4. <strong>Prescriptions:</strong> Digital prescriptions issued after video consultations are legally valid under Indian law.</p>
            </div>
            <button 
              onClick={() => setShowTermsModal(false)}
              className="w-full py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
