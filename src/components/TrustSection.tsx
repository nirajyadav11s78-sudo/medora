import React from 'react';
import { 
  Star, 
  ShieldCheck, 
  Award, 
  Users, 
  Heart, 
  CheckCircle, 
  Building,
  Quote
} from 'lucide-react';
import { Testimonial, DoctorProfileData } from '../types';

interface TrustSectionProps {
  testimonials: Testimonial[];
  doctor: DoctorProfileData;
}

export const TrustSection: React.FC<TrustSectionProps> = ({ testimonials, doctor }) => {
  return (
    <section id="reviews" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Statistics Metric Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-teal-700 font-display">15+</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">Years of Clinical Experience</div>
            <div className="text-[11px] text-slate-500 mt-0.5">AIIMS & MAMC Trained</div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-sky-700 font-display">10,000+</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">Patients Treated</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Delhi NCR & Teleconsultations</div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-500 font-display flex items-center justify-center gap-1">
              4.9 <Star className="w-6 h-6 fill-amber-400 text-amber-400 inline" />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">Patient Satisfaction</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Verified Google Reviews</div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-display">100%</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">Ethical Practice</div>
            <div className="text-[11px] text-slate-500 mt-0.5">No Unnecessary Tests</div>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/70 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3">
            <span>Patient Testimonials</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            What Our Patients Say
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Real feedback from patients treated by Dr. Rajesh Sharma for acute infections, chronic diabetes, and preventive checkups.
          </p>
        </div>

        {/* Testimonials Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((review) => (
            <div 
              key={review.id}
              className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Review body */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-6">
                  "{review.comment}"
                </p>
              </div>

              {/* Patient info */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">{review.patientName}</div>
                  <div className="text-[11px] text-slate-500">{review.location} • {review.date}</div>
                </div>
                {review.verified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                    <CheckCircle className="w-3 h-3 text-teal-600" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
