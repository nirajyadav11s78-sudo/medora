import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DoctorProfile } from './components/DoctorProfile';
import { ServicesSection } from './components/ServicesSection';
import { AppointmentSection } from './components/AppointmentSection';
import { TrustSection } from './components/TrustSection';
import { ContactSection } from './components/ContactSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { ManageAppointmentModal } from './components/ManageAppointmentModal';
import { AdminDashboard } from './components/AdminDashboard';
import { MobileBottomBar } from './components/MobileBottomBar';
import { defaultDoctorProfile, defaultServices, defaultTestimonials, defaultFaqs } from './data/initialData';
import { DoctorProfileData, ServiceItem, Appointment } from './types';

export default function App() {
  const [doctor, setDoctor] = useState<DoctorProfileData>(defaultDoctorProfile);
  const [services, setServices] = useState<ServiceItem[]>(defaultServices);
  const [testimonials] = useState(defaultTestimonials);
  const [faqs] = useState(defaultFaqs);

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<ServiceItem | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Fetch updated config on mount if available
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.doctorProfile) {
          setDoctor(prev => ({ ...prev, ...data.doctorProfile }));
        }
        if (data.services && data.services.length > 0) {
          setServices(data.services);
        }
      })
      .catch(err => console.error("Could not fetch clinic config:", err));
  }, []);

  const handleOpenBooking = (service?: ServiceItem) => {
    setSelectedServiceForModal(service || services[0]);
    setIsBookingModalOpen(true);
  };

  const handleAppointmentBooked = (appointment: Appointment) => {
    console.log("Appointment scheduled successfully:", appointment);
  };

  const handleUpdateDoctorProfile = (updatedFields: Partial<DoctorProfileData>) => {
    setDoctor(prev => ({ ...prev, ...updatedFields }));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-teal-500 selection:text-white flex flex-col">
      
      {/* Top Navigation */}
      <Navbar 
        doctor={doctor}
        onOpenBooking={() => handleOpenBooking()}
        onOpenManage={() => setIsManageModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection 
          doctor={doctor}
          onOpenBooking={() => handleOpenBooking()}
        />

        {/* Doctor Professional Profile */}
        <DoctorProfile 
          doctor={doctor}
          onOpenBooking={() => handleOpenBooking()}
        />

        {/* Medical Services & Transparent Pricing */}
        <ServicesSection 
          services={services}
          onSelectService={(srv) => handleOpenBooking(srv)}
        />

        {/* Dedicated Interactive Booking Section with Slot Selector */}
        <AppointmentSection 
          services={services}
          doctor={doctor}
          onAppointmentBooked={handleAppointmentBooked}
        />

        {/* Trust & Testimonials */}
        <TrustSection 
          testimonials={testimonials}
          doctor={doctor}
        />

        {/* Clinic Location & Hours */}
        <ContactSection 
          doctor={doctor}
          onOpenBooking={() => handleOpenBooking()}
        />

        {/* Patient FAQs */}
        <FaqSection 
          faqs={faqs}
        />
      </main>

      {/* Footer */}
      <Footer 
        doctor={doctor}
        onOpenBooking={() => handleOpenBooking()}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenManage={() => setIsManageModalOpen(true)}
      />

      {/* Mobile Sticky Bottom Bar */}
      <MobileBottomBar 
        doctor={doctor}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Quick Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        services={services}
        initialService={selectedServiceForModal}
        doctor={doctor}
        onSuccess={handleAppointmentBooked}
      />

      {/* Patient Lookup / Reschedule / Cancel Modal */}
      <ManageAppointmentModal 
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        doctor={doctor}
      />

      {/* Doctor & Clinic Admin Portal */}
      <AdminDashboard 
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        doctor={doctor}
        onUpdateDoctorProfile={handleUpdateDoctorProfile}
      />

    </div>
  );
}
