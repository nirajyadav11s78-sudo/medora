import React from 'react';
import { 
  Stethoscope, 
  RotateCcw, 
  Activity, 
  HeartPulse, 
  Video, 
  Clock, 
  ArrowRight, 
  MessageCircle,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { ServiceItem } from '../types';

interface ServicesSectionProps {
  services: ServiceItem[];
  onSelectService: (service: ServiceItem, instantWhatsApp?: boolean) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectService
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'consultation':
        return <Stethoscope className="w-5 h-5 text-teal-600" />;
      case 'followup':
        return <RotateCcw className="w-5 h-5 text-sky-600" />;
      case 'diabetes':
        return <Activity className="w-5 h-5 text-emerald-600" />;
      case 'preventive':
        return <HeartPulse className="w-5 h-5 text-rose-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-indigo-600" />;
      default:
        return <Stethoscope className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <section id="services" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/70 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3">
            <span>Specialized Clinical Services</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Comprehensive Medical Treatments
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Transparent consultation fees, zero advance payment needed, and dedicated unhurried consultations.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {services.map((service) => (
            <div 
              key={service.id}
              className={`relative flex flex-col justify-between rounded-2xl bg-white p-6 sm:p-7 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                service.popular ? 'border-teal-400/80 ring-1 ring-teal-400/30' : 'border-slate-200/80 shadow-xs'
              }`}
            >
              {service.popular && (
                <div className="absolute -top-3 right-6 bg-teal-600 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full tracking-wider shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Most Booked
                </div>
              )}

              <div>
                {/* Header with icon & badge */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                    {getIcon(service.id)}
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${
                    service.type === 'Video consultation'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
                      : service.type === 'In-clinic'
                      ? 'bg-teal-50 text-teal-700 border-teal-200/60'
                      : 'bg-sky-50 text-sky-700 border-sky-200/60'
                  }`}>
                    {service.type}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">
                  {service.title}
                </h3>

                {/* Duration and Fee */}
                <div className="flex items-baseline gap-3 mb-3.5 pb-3.5 border-b border-slate-100">
                  <span className="text-2xl font-extrabold text-slate-900">
                    ₹{service.fee}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {service.duration}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  {service.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {/* Book on WhatsApp (Quick) */}
                <button
                  onClick={() => onSelectService(service, true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                  <span>Book on WhatsApp</span>
                </button>

                {/* Choose Slot Button */}
                <button
                  onClick={() => onSelectService(service, false)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <span>Select Date & Time</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Emergency Notice Footer */}
        <div className="mt-12 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Note for Medical Emergencies:</strong> For acute emergencies such as chest pain radiating to arm, sudden severe breathlessness, stroke symptoms (facial drooping or weakness), or major physical trauma, please proceed immediately to the nearest hospital casualty emergency ward or dial <strong>112 / 102</strong>.
          </p>
        </div>

      </div>
    </section>
  );
};
