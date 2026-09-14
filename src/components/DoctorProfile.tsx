import React from 'react';
import { 
  GraduationCap, 
  Award, 
  Clock, 
  Languages, 
  FileCheck, 
  HeartHandshake, 
  Stethoscope, 
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { DoctorProfileData } from '../types';

interface DoctorProfileProps {
  doctor: DoctorProfileData;
  onOpenBooking: () => void;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = ({ doctor, onOpenBooking }) => {
  return (
    <section id="about" className="py-16 sm:py-24 bg-white border-b border-slate-200/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>Doctor Credentials & Experience</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Meet Dr. Rajesh Sharma
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            A trusted senior physician with 15+ years of clinical excellence in Delhi NCR, dedicated to 
            thorough diagnosis, holistic chronic illness management, and patient-first medical counseling.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Key Highlights & Bio */}
          <div className="lg:col-span-7 space-y-6">
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                {doctor.bio}
              </p>
              <p>
                Having trained at premier institutions including <strong>All India Institute of Medical Sciences (AIIMS, New Delhi)</strong> and <strong>Maulana Azad Medical College (MAMC)</strong>, Dr. Sharma brings an in-depth understanding of adult medicine, early diabetic reversal protocols, and complicated infectious diseases.
              </p>
            </div>

            {/* Clinical Philosophy Cards */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-teal-600" />
                <span>Our Patient Care Philosophy</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Detailed 20-30 min consultations without rush</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>No unnecessary lab investigations or polypharmacy</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Digital prescriptions sent directly on WhatsApp</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Lifestyle, diet, and stress management guidance</span>
                </li>
              </ul>
            </div>

            {/* Quick CTA */}
            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Consult Dr. Sharma Today</span>
              </button>
            </div>
          </div>

          {/* Right Column: Structured Credentials Grid */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            
            {/* Qualification Item */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-teal-300 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Qualifications</h4>
                  <div className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                    MBBS, MD (General Medicine)
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    AIIMS New Delhi & Maulana Azad Medical College (MAMC)
                  </div>
                </div>
              </div>
            </div>

            {/* Experience Item */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-teal-300 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Experience</h4>
                  <div className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                    15+ Years Active Practice
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Former Senior Resident at Max Super Speciality & LNJP Hospital
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Item */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-teal-300 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medical Council Registration</h4>
                  <div className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                    {doctor.registrationNumber}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Verified registered medical practitioner with Delhi Medical Council
                  </div>
                </div>
              </div>
            </div>

            {/* Languages & Memberships */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-teal-300 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Languages Spoken</h4>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {doctor.languages.join(" • ")}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Member, Association of Physicians of India (API) & RSSDI
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
