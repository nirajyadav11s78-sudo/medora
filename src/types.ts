export type ConsultationType = 'In-clinic' | 'Video consultation';

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No Show';

export interface ServiceItem {
  id: string;
  title: string;
  duration: string;
  fee: number;
  type: ConsultationType | 'Both';
  description: string;
  popular?: boolean;
}

export interface DoctorProfileData {
  name: string;
  title: string;
  qualification: string;
  specialization: string;
  experienceYears: number;
  registrationNumber: string;
  languages: string[];
  bio: string;
  clinicName: string;
  clinicAddress: string;
  landmark: string;
  phone: string;
  whatsappNumber: string; // digits only for wa.me, e.g. "919876543210"
  whatsappDisplay: string; // e.g. "+91 98765 43210"
  email: string;
  timingsDescription: string;
  mapEmbedQuery: string;
  googleMapsUrl: string;
  imageUrl: string;
}

export interface ShiftTime {
  start: string; // "10:00"
  end: string;   // "13:30"
}

export interface ClinicScheduleConfig {
  workingDays: string[]; // ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  morningShift: ShiftTime;
  eveningShift: ShiftTime;
  slotDurationMinutes: number;
  maxAppointmentsPerDay: number;
  blockedDates: string[]; // "YYYY-MM-DD"
  customBlockedSlots: { [date: string]: string[] }; // date -> ["10:00 AM", "10:30 AM"]
}

export interface Appointment {
  id: string; // e.g. "APT-1024"
  date: string; // "YYYY-MM-DD"
  time: string; // "10:30 AM"
  patientName: string;
  mobile: string;
  email?: string;
  service: string;
  consultationType: ConsultationType;
  reason?: string;
  status: AppointmentStatus;
  bookingTime: string; // ISO string
  notes?: string;
  syncedToSheets: boolean;
  sheetSyncError?: string;
}

export interface GoogleSheetsConfig {
  webhookUrl: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncTimestamp?: string;
}

export interface Testimonial {
  id: string;
  patientName: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}
