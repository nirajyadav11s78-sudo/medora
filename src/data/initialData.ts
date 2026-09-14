import { DoctorProfileData, ClinicScheduleConfig, ServiceItem, Testimonial, FaqItem, GoogleSheetsConfig } from '../types';

export const defaultDoctorProfile: DoctorProfileData = {
  name: "Dr. Rajesh Sharma",
  title: "MBBS, MD (General Medicine)",
  qualification: "MBBS (AIIMS New Delhi), MD - General Medicine (MAMC)",
  specialization: "Senior Consultant Physician & Diabetologist",
  experienceYears: 15,
  registrationNumber: "DMC-48291 (Delhi Medical Council)",
  languages: ["Hindi", "English", "Punjabi"],
  bio: "Dr. Rajesh Sharma brings over 15 years of distinguished clinical experience in internal medicine, diabetes management, hypertension, and acute infectious diseases. Known for his empathetic listening and evidence-based treatment plans, he believes in minimizing unnecessary medications and empowering patients through lifestyle modifications.",
  clinicName: "Arogya Medical Care & Diabetes Clinic",
  clinicAddress: "Shop 12, Ground Floor, Vardhman Medical Plaza, Sector 14, Rohini, New Delhi - 110085",
  landmark: "Near Rohini West Metro Station (Opposite City Park Hotel)",
  phone: "+91 98765 43210",
  whatsappNumber: "919876543210",
  whatsappDisplay: "+91 98765 43210",
  email: "dr.sharma.clinic@gmail.com",
  timingsDescription: "Mon – Sat: 10:00 AM – 01:30 PM & 05:30 PM – 08:30 PM (Sunday: Prior Emergency Only)",
  mapEmbedQuery: "Vardhman+Plaza+Sector+14+Rohini+Delhi",
  googleMapsUrl: "https://maps.google.com/?q=Sector+14+Rohini+New+Delhi",
  // High quality professional photo of an experienced Indian physician in clinical coat
  imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80"
};

export const defaultScheduleConfig: ClinicScheduleConfig = {
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  morningShift: {
    start: "10:00",
    end: "13:30"
  },
  eveningShift: {
    start: "17:30",
    end: "20:30"
  },
  slotDurationMinutes: 30,
  maxAppointmentsPerDay: 30,
  blockedDates: [],
  customBlockedSlots: {}
};

export const defaultServices: ServiceItem[] = [
  {
    id: "consultation",
    title: "In-Clinic Consultation",
    duration: "25-30 mins",
    fee: 600,
    type: "In-clinic",
    popular: true,
    description: "Detailed medical history review, vital checks (BP, pulse, oxygen, glucose), systemic physical examination, diagnosis, and personalized prescription."
  },
  {
    id: "followup",
    title: "Follow-Up Consultation",
    duration: "15-20 mins",
    fee: 300,
    type: "Both",
    description: "Review of ongoing treatment response, evaluation of lab test reports, dosage titration, and recovery monitoring within 7 days of primary visit."
  },
  {
    id: "diabetes",
    title: "Diabetes & Hypertension Care",
    duration: "30 mins",
    fee: 800,
    type: "Both",
    popular: true,
    description: "Holistic metabolic assessment, HbA1c review, insulin adjustment, personalized carbohydrate guidance, and early organ damage screening."
  },
  {
    id: "preventive",
    title: "Preventive Health & Heart Screening",
    duration: "35 mins",
    fee: 1000,
    type: "In-clinic",
    description: "Cardiovascular risk profiling, lifestyle review, lipid & renal marker interpretation, ECG assessment, and tailored longevity recommendations."
  },
  {
    id: "video",
    title: "Video Consultation (Telehealth)",
    duration: "20 mins",
    fee: 500,
    type: "Video consultation",
    popular: true,
    description: "Secure video consultation for patients unable to visit the clinic. Includes a legally valid signed digital prescription shared instantly on WhatsApp."
  }
];

export const defaultTestimonials: Testimonial[] = [
  {
    id: "rev-1",
    patientName: "Rahul Sharma",
    location: "Rohini, Delhi",
    rating: 5,
    comment: "Dr. Sharma diagnosed my recurrent fever when other clinics kept prescribing heavy antibiotics. He is extremely patient, explains the diagnosis in simple Hindi, and does not prescribe unnecessary tests.",
    date: "2 weeks ago",
    verified: true
  },
  {
    id: "rev-2",
    patientName: "Priya Verma",
    location: "Pitampura, Delhi",
    rating: 5,
    comment: "Booking through WhatsApp was seamless! Received my confirmed time slot within minutes. The clinic is spotlessly clean with minimal waiting time. Highly recommended for diabetes management.",
    date: "1 month ago",
    verified: true
  },
  {
    id: "rev-3",
    patientName: "Amitabh Gupta",
    location: "Prashant Vihar",
    rating: 5,
    comment: "Very polite doctor who treats elderly patients with great respect. My mother's blood pressure is now well controlled under his guidance. Video follow-up was very convenient.",
    date: "Last month",
    verified: true
  }
];

export const defaultFaqs: FaqItem[] = [
  {
    question: "How do I book an appointment?",
    answer: "You can book directly on this website in under a minute. Simply select your preferred service, choose an available date and time slot, enter your name and mobile number, and tap 'Confirm & Book on WhatsApp'. Your appointment will be recorded instantly and pre-filled in WhatsApp to message Dr. Sharma's clinic."
  },
  {
    question: "Can I reschedule or cancel my appointment?",
    answer: "Yes, easily! Click on 'Manage Appointment' in the navigation bar or top menu, enter your Appointment ID or registered mobile number, and select a new available time slot or cancel at no charge. We appreciate at least 2 hours notice so another patient can be accommodated."
  },
  {
    question: "Do you offer online video consultation?",
    answer: "Yes! Video consultation is available for patients across India and abroad. Select 'Video consultation' during booking. You will receive a video call link on WhatsApp and a signed digital prescription immediately after the consultation."
  },
  {
    question: "What happens if I arrive late or miss my appointment?",
    answer: "We offer a 10-minute grace period. If you arrive later, our clinic team will fit you in between scheduled patients as soon as possible. You can also send a quick WhatsApp message to let us know."
  },
  {
    question: "What documents should I bring to my appointment?",
    answer: "Please bring any previous medical prescriptions, recent blood reports, imaging scans, and a list of medications you are currently taking."
  },
  {
    question: "Is car parking available near the clinic?",
    answer: "Yes, dedicated visitor parking is available at Vardhman Medical Plaza with easy ramp access for wheelchair and elderly patients."
  }
];

export const defaultGoogleSheetsConfig: GoogleSheetsConfig = {
  webhookUrl: "",
  sheetName: "Appointments",
  autoSync: true,
  lastSyncTimestamp: undefined
};
