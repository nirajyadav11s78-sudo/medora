import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { 
  Appointment, 
  DoctorProfileData, 
  ClinicScheduleConfig, 
  ServiceItem, 
  GoogleSheetsConfig 
} from './src/types';
import { 
  defaultDoctorProfile, 
  defaultScheduleConfig, 
  defaultServices, 
  defaultGoogleSheetsConfig 
} from './src/data/initialData';

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent Data Storage Path
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'clinic_data.json');

interface DatabaseSchema {
  appointments: Appointment[];
  doctorProfile: DoctorProfileData;
  scheduleConfig: ClinicScheduleConfig;
  services: ServiceItem[];
  sheetsConfig: GoogleSheetsConfig;
  adminPassword: string;
}

// Initial seed helper
function getInitialData(): DatabaseSchema {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const initialAppointments: Appointment[] = [
    {
      id: "APT-1021",
      date: todayStr,
      time: "10:00 AM",
      patientName: "Rahul Sharma",
      mobile: "+91 98112 34567",
      email: "rahul.s@example.com",
      service: "In-Clinic Consultation",
      consultationType: "In-clinic",
      reason: "High fever and persistent cough for 3 days",
      status: "Confirmed",
      bookingTime: new Date(Date.now() - 3600000 * 24).toISOString(),
      syncedToSheets: true
    },
    {
      id: "APT-1022",
      date: todayStr,
      time: "10:30 AM",
      patientName: "Priya Verma",
      mobile: "+91 98711 98765",
      service: "Follow-Up Consultation",
      consultationType: "In-clinic",
      reason: "Reviewing HbA1c test reports & BP adjustment",
      status: "Pending",
      bookingTime: new Date(Date.now() - 3600000 * 12).toISOString(),
      syncedToSheets: true
    },
    {
      id: "APT-1023",
      date: todayStr,
      time: "11:30 AM",
      patientName: "Amitabh Gupta",
      mobile: "+91 99100 12345",
      email: "amitabh.g@example.com",
      service: "Video Consultation (Telehealth)",
      consultationType: "Video consultation",
      reason: "Routine diabetic dietary consultation",
      status: "Confirmed",
      bookingTime: new Date(Date.now() - 3600000 * 6).toISOString(),
      syncedToSheets: true
    }
  ];

  return {
    appointments: initialAppointments,
    doctorProfile: defaultDoctorProfile,
    scheduleConfig: defaultScheduleConfig,
    services: defaultServices,
    sheetsConfig: defaultGoogleSheetsConfig,
    adminPassword: "niraj1234"
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading database file, using default seed:", err);
  }
  const initial = getInitialData();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// Generate all standard slots for a shift
function generateSlotsForShift(startStr: string, endStr: string, durationMinutes: number): string[] {
  const slots: string[] = [];
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes + durationMinutes <= endMinutes) {
    const h = Math.floor(currentMinutes / 60);
    const m = currentMinutes % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m.toString().padStart(2, '0');
    slots.push(`${displayH.toString().padStart(2, '0')}:${displayM} ${period}`);
    currentMinutes += durationMinutes;
  }

  return slots;
}

// Check slot availability for given date
function getSlotsForDate(db: DatabaseSchema, targetDateStr: string) {
  const targetDate = new Date(targetDateStr + 'T00:00:00');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[targetDate.getDay()];

  // Check if working day
  if (!db.scheduleConfig.workingDays.includes(dayName)) {
    return {
      date: targetDateStr,
      dayName,
      isDayOff: true,
      reason: `${dayName} is a scheduled clinic holiday`,
      availableSlots: [],
      bookedSlots: []
    };
  }

  // Check if date is blocked
  if (db.scheduleConfig.blockedDates.includes(targetDateStr)) {
    return {
      date: targetDateStr,
      dayName,
      isDayOff: true,
      reason: `Clinic is closed on ${targetDateStr} for official leave/holiday`,
      availableSlots: [],
      bookedSlots: []
    };
  }

  const duration = db.scheduleConfig.slotDurationMinutes || 30;
  const morningSlots = generateSlotsForShift(
    db.scheduleConfig.morningShift.start,
    db.scheduleConfig.morningShift.end,
    duration
  );
  const eveningSlots = generateSlotsForShift(
    db.scheduleConfig.eveningShift.start,
    db.scheduleConfig.eveningShift.end,
    duration
  );
  const allGeneratedSlots = [...morningSlots, ...eveningSlots];

  // Booked slots on this date (excluding Cancelled)
  const bookedSlots = db.appointments
    .filter(a => a.date === targetDateStr && a.status !== 'Cancelled')
    .map(a => a.time);

  // Custom blocked slots by admin
  const customBlocked = db.scheduleConfig.customBlockedSlots[targetDateStr] || [];

  // Filter available
  const availableSlots = allGeneratedSlots.filter(
    slot => !bookedSlots.includes(slot) && !customBlocked.includes(slot)
  );

  return {
    date: targetDateStr,
    dayName,
    isDayOff: false,
    allSlots: allGeneratedSlots,
    availableSlots,
    bookedSlots,
    customBlockedSlots: customBlocked
  };
}

// Background trigger to sync row to Google Sheets via Webhook URL if configured
async function syncRowToGoogleSheets(appointment: Appointment, sheetsConfig: GoogleSheetsConfig): Promise<boolean> {
  if (!sheetsConfig.webhookUrl || !sheetsConfig.autoSync) {
    return false;
  }
  try {
    const payload = {
      action: "add_or_update",
      appointmentId: appointment.id,
      date: appointment.date,
      time: appointment.time,
      patientName: appointment.patientName,
      mobile: appointment.mobile,
      service: appointment.service,
      consultationType: appointment.consultationType,
      status: appointment.status,
      bookingTime: appointment.bookingTime,
      notes: appointment.notes || appointment.reason || ""
    };

    const response = await fetch(sheetsConfig.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return response.ok;
  } catch (err: any) {
    console.warn("Google Sheets Webhook sync error (app continues normally):", err.message);
    return false;
  }
}

// ==================== API ROUTES ====================

// 1. Clinic Public Config & Doctor Profile
app.get('/api/config', (req: Request, res: Response) => {
  const db = loadDatabase();
  res.json({
    doctorProfile: db.doctorProfile,
    scheduleConfig: {
      workingDays: db.scheduleConfig.workingDays,
      morningShift: db.scheduleConfig.morningShift,
      eveningShift: db.scheduleConfig.eveningShift,
      slotDurationMinutes: db.scheduleConfig.slotDurationMinutes,
      blockedDates: db.scheduleConfig.blockedDates
    },
    services: db.services
  });
});

// 2. Slot Availability for a specific Date (with real-time double-booking verification)
app.get('/api/availability', (req: Request, res: Response) => {
  const dateStr = req.query.date as string;
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return res.status(400).json({ error: "Invalid or missing date. Required format: YYYY-MM-DD" });
  }

  const db = loadDatabase();
  const availability = getSlotsForDate(db, dateStr);
  res.json(availability);
});

// 3. Create Appointment with Atomic Double-Booking Lock
app.post('/api/appointments', async (req: Request, res: Response) => {
  const { 
    date, 
    time, 
    patientName, 
    mobile, 
    email, 
    service, 
    consultationType, 
    reason 
  } = req.body;

  if (!date || !time || !patientName || !mobile || !service) {
    return res.status(400).json({ 
      error: "Missing required fields. Please provide date, time, patientName, mobile, and service." 
    });
  }

  const db = loadDatabase();

  // Double-booking check: verify if another non-cancelled appointment already occupies this slot
  const slotConflict = db.appointments.find(
    a => a.date === date && a.time === time && a.status !== 'Cancelled'
  );

  if (slotConflict) {
    return res.status(409).json({ 
      error: "Sorry, this time slot is no longer available. Another patient just booked it. Please select another time." 
    });
  }

  // Check if date or slot is blocked by clinic
  if (db.scheduleConfig.blockedDates.includes(date)) {
    return res.status(400).json({ error: "Clinic is closed on the selected date." });
  }
  const customBlocked = db.scheduleConfig.customBlockedSlots[date] || [];
  if (customBlocked.includes(time)) {
    return res.status(400).json({ error: "Selected slot is reserved by clinic." });
  }

  // Generate unique Appointment ID: e.g. APT-1025
  const maxNumber = db.appointments.reduce((max, apt) => {
    const match = apt.id.match(/^APT-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 1023);

  const newId = `APT-${maxNumber + 1}`;

  const newAppointment: Appointment = {
    id: newId,
    date,
    time,
    patientName: patientName.trim(),
    mobile: mobile.trim(),
    email: email ? email.trim() : undefined,
    service,
    consultationType: consultationType || 'In-clinic',
    reason: reason ? reason.trim() : undefined,
    status: 'Pending',
    bookingTime: new Date().toISOString(),
    syncedToSheets: false
  };

  // Attempt Google Sheets webhook sync in background
  syncRowToGoogleSheets(newAppointment, db.sheetsConfig).then(synced => {
    if (synced) {
      const currentDb = loadDatabase();
      const target = currentDb.appointments.find(a => a.id === newId);
      if (target) {
        target.syncedToSheets = true;
        saveDatabase(currentDb);
      }
    }
  });

  db.appointments.unshift(newAppointment);
  saveDatabase(db);

  // Generate pre-filled WhatsApp message
  const doctorName = db.doctorProfile.name;
  const whatsappNumber = db.doctorProfile.whatsappNumber;
  const messageText = 
`Hello Dr. ${doctorName},
I would like to book an appointment.

Patient Name: ${newAppointment.patientName}
Service: ${newAppointment.service}
Consultation: ${newAppointment.consultationType}
Date: ${newAppointment.date}
Time: ${newAppointment.time}
Appointment ID: ${newAppointment.id}

Please confirm my appointment.`;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;

  return res.status(201).json({
    success: true,
    appointment: newAppointment,
    whatsappUrl,
    message: "Appointment scheduled successfully"
  });
});

// 4. Patient Self-Service: Lookup Appointment by ID or Mobile
app.get('/api/appointments/lookup', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim().toLowerCase();
  if (!query) {
    return res.status(400).json({ error: "Please enter your Appointment ID or mobile number" });
  }

  const db = loadDatabase();
  const cleanPhone = query.replace(/\D/g, '');

  const matches = db.appointments.filter(a => {
    if (a.id.toLowerCase() === query) return true;
    if (cleanPhone.length >= 8 && a.mobile.replace(/\D/g, '').includes(cleanPhone)) return true;
    return false;
  });

  if (matches.length === 0) {
    return res.status(404).json({ error: "No appointment found matching that ID or mobile number." });
  }

  res.json({ appointments: matches });
});

// 5. Patient/Admin: Reschedule or Cancel Appointment
app.patch('/api/appointments/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, date, time, reason, notes } = req.body;

  const db = loadDatabase();
  const aptIndex = db.appointments.findIndex(a => a.id === id);

  if (aptIndex === -1) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  const apt = db.appointments[aptIndex];

  // If rescheduling date or time, verify availability
  if ((date && date !== apt.date) || (time && time !== apt.time)) {
    const targetDate = date || apt.date;
    const targetTime = time || apt.time;

    const conflict = db.appointments.find(
      a => a.id !== id && a.date === targetDate && a.time === targetTime && a.status !== 'Cancelled'
    );
    if (conflict) {
      return res.status(409).json({ 
        error: `Sorry, the slot on ${targetDate} at ${targetTime} is already booked. Please choose another slot.` 
      });
    }

    apt.date = targetDate;
    apt.time = targetTime;
  }

  if (status) {
    apt.status = status;
  }
  if (notes !== undefined) {
    apt.notes = notes;
  }
  if (reason !== undefined) {
    apt.reason = reason;
  }

  saveDatabase(db);

  // Sync to sheets
  syncRowToGoogleSheets(apt, db.sheetsConfig);

  // Generate confirmation WhatsApp message if confirmed
  let whatsappConfirmUrl: string | undefined = undefined;
  if (status === 'Confirmed') {
    const confirmMessage = 
`Appointment Confirmed ✅

Doctor: ${db.doctorProfile.name}
Patient: ${apt.patientName}
Date: ${apt.date}
Time: ${apt.time}
Consultation: ${apt.consultationType}
Clinic: ${db.doctorProfile.clinicAddress}

Please arrive 10 minutes before your appointment.`;
    const cleanPatientMobile = apt.mobile.replace(/\D/g, '');
    const targetMobile = cleanPatientMobile.startsWith('91') ? cleanPatientMobile : `91${cleanPatientMobile}`;
    whatsappConfirmUrl = `https://wa.me/${targetMobile}?text=${encodeURIComponent(confirmMessage)}`;
  }

  res.json({ success: true, appointment: apt, whatsappConfirmUrl });
});

// 6. Admin Authentication
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  const db = loadDatabase();

  if (password === db.adminPassword || password === 'niraj1234') {
    return res.json({ 
      success: true, 
      token: "dr_session_" + Buffer.from(Date.now().toString()).toString('base64'),
      doctorName: db.doctorProfile.name
    });
  }

  return res.status(401).json({ error: "Invalid doctor/admin password. Please use 'niraj1234'." });
});

// Admin: Change Password
app.post('/api/admin/change-password', (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const db = loadDatabase();

  if (currentPassword !== db.adminPassword && currentPassword !== 'niraj1234') {
    return res.status(401).json({ error: "Current password is incorrect." });
  }

  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ error: "New password must be at least 4 characters long." });
  }

  db.adminPassword = newPassword.trim();
  saveDatabase(db);
  return res.json({ success: true, message: "Admin portal password successfully updated." });
});

// 7. Admin: Get all appointments with filter & search
app.get('/api/admin/appointments', (req: Request, res: Response) => {
  const db = loadDatabase();
  const filter = (req.query.filter as string) || 'all';
  const search = (req.query.search as string || '').toLowerCase();

  const today = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date(Date.now() + 86400000);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  let filtered = db.appointments;

  if (filter === 'today') {
    filtered = filtered.filter(a => a.date === today);
  } else if (filter === 'tomorrow') {
    filtered = filtered.filter(a => a.date === tomorrow);
  } else if (filter === 'upcoming') {
    filtered = filtered.filter(a => a.date >= today && a.status !== 'Cancelled' && a.status !== 'Completed');
  } else if (filter === 'completed') {
    filtered = filtered.filter(a => a.status === 'Completed');
  } else if (filter === 'cancelled') {
    filtered = filtered.filter(a => a.status === 'Cancelled');
  } else if (filter === 'pending') {
    filtered = filtered.filter(a => a.status === 'Pending');
  }

  if (search) {
    filtered = filtered.filter(a => 
      a.patientName.toLowerCase().includes(search) ||
      a.mobile.toLowerCase().includes(search) ||
      a.id.toLowerCase().includes(search) ||
      a.service.toLowerCase().includes(search)
    );
  }

  res.json({
    appointments: filtered,
    stats: {
      total: db.appointments.length,
      today: db.appointments.filter(a => a.date === today).length,
      pending: db.appointments.filter(a => a.status === 'Pending').length,
      confirmed: db.appointments.filter(a => a.status === 'Confirmed').length,
      completed: db.appointments.filter(a => a.status === 'Completed').length
    }
  });
});

// 8. Admin: Update Clinic Profile or Schedule Settings
app.post('/api/admin/config', (req: Request, res: Response) => {
  const { doctorProfile, scheduleConfig, services } = req.body;
  const db = loadDatabase();

  if (doctorProfile) {
    db.doctorProfile = { ...db.doctorProfile, ...doctorProfile };
  }
  if (scheduleConfig) {
    db.scheduleConfig = { ...db.scheduleConfig, ...scheduleConfig };
  }
  if (services && Array.isArray(services)) {
    db.services = services;
  }

  saveDatabase(db);
  res.json({ success: true, message: "Clinic configuration updated successfully" });
});

// 9. Admin: Toggle Block Date or Block Time Slot
app.post('/api/admin/block-slot', (req: Request, res: Response) => {
  const { date, time, blockDate } = req.body;
  const db = loadDatabase();

  if (blockDate) {
    if (!db.scheduleConfig.blockedDates.includes(date)) {
      db.scheduleConfig.blockedDates.push(date);
    } else {
      db.scheduleConfig.blockedDates = db.scheduleConfig.blockedDates.filter(d => d !== date);
    }
  } else if (date && time) {
    if (!db.scheduleConfig.customBlockedSlots[date]) {
      db.scheduleConfig.customBlockedSlots[date] = [];
    }
    const current = db.scheduleConfig.customBlockedSlots[date];
    if (current.includes(time)) {
      db.scheduleConfig.customBlockedSlots[date] = current.filter(t => t !== time);
    } else {
      current.push(time);
    }
  }

  saveDatabase(db);
  res.json({ 
    success: true, 
    blockedDates: db.scheduleConfig.blockedDates,
    customBlockedSlots: db.scheduleConfig.customBlockedSlots
  });
});

// 10. Google Sheets Integration Settings & CSV Export
app.get('/api/admin/sheets-config', (req: Request, res: Response) => {
  const db = loadDatabase();
  res.json(db.sheetsConfig);
});

app.post('/api/admin/sheets-config', (req: Request, res: Response) => {
  const { webhookUrl, sheetName, autoSync } = req.body;
  const db = loadDatabase();
  db.sheetsConfig = {
    ...db.sheetsConfig,
    webhookUrl: webhookUrl !== undefined ? webhookUrl.trim() : db.sheetsConfig.webhookUrl,
    sheetName: sheetName || db.sheetsConfig.sheetName,
    autoSync: autoSync !== undefined ? autoSync : db.sheetsConfig.autoSync,
    lastSyncTimestamp: new Date().toISOString()
  };
  saveDatabase(db);
  res.json({ success: true, sheetsConfig: db.sheetsConfig });
});

// Export CSV formatted directly for Google Sheets
app.get('/api/admin/export-csv', (req: Request, res: Response) => {
  const db = loadDatabase();
  const headers = ["Appointment ID", "Date", "Time", "Patient Name", "Mobile", "Service", "Consultation Type", "Status", "Booking Time", "Notes"];
  
  const rows = db.appointments.map(a => [
    `"${a.id}"`,
    `"${a.date}"`,
    `"${a.time}"`,
    `"${a.patientName.replace(/"/g, '""')}"`,
    `"${a.mobile.replace(/"/g, '""')}"`,
    `"${a.service.replace(/"/g, '""')}"`,
    `"${a.consultationType}"`,
    `"${a.status}"`,
    `"${a.bookingTime}"`,
    `"${(a.notes || a.reason || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=appointments-${new Date().toISOString().split('T')[0]}.csv`);
  res.send(csvContent);
});

// Start Server and mount Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dr. Rajesh Sharma Clinic server running on http://localhost:${PORT}`);
  });
}

startServer();
