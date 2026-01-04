
export enum JobScope {
  CARD_ACCESS = 'Card Access Systems',
  CCTV = 'CCTV Systems',
  INTERCOM = 'Intercom Systems',
  BIOMETRICS = 'Biometrics',
  ANPR = 'ANPR Integration',
  BARRIER = 'Barrier Systems',
  OTHERS = 'Others'
}

export enum WorkOrderStatus {
  PENDING = 'Pending',
  ASSIGNED = 'Assigned',
  COMPLETED = 'Completed',
  HANDOVER = 'Handover',
  INVOICED = 'Invoiced',
  CANCELLED = 'Cancelled'
}

export enum WorkOrderPriority {
  LOW = 'Low',
  STANDARD = 'Standard',
  URGENT = 'Urgent'
}

export enum MaintenanceFrequency {
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  BI_ANNUALLY = 'Bi-Annually',
  ANNUALLY = 'Annually'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  TECHNICIAN = 'TECHNICIAN',
  CLIENT = 'CLIENT'
}

export interface TrackingLog {
  id: string;
  timestamp: string;
  event: 'CHECK_IN' | 'CHECK_OUT' | 'LOCATION_UPDATE' | 'STATUS_CHANGE' | 'SYSTEM_AUTO';
  location?: { lat: number; lng: number };
  note?: string;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  password?: string;
  contactPerson: string;
  industry?: string;
  uen?: string;
  gstRegistered?: boolean;
  createdAt: string;
  role: UserRole.CLIENT;
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string;
  specialty: JobScope;
  status: 'Available' | 'On Site' | 'Away';
  lastLogin?: string;
  role: UserRole.TECHNICIAN;
}

export interface MaintenanceContract {
  id: string;
  clientId: string;
  clientName: string;
  jobScope: JobScope;
  frequency: MaintenanceFrequency;
  description: string;
  startDate: string;
  nextServiceDate: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  contractValue: number;
}

export interface InternalNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface SiteHandover {
  id: string;
  workOrderId: string;
  clientName: string;
  technicianName: string;
  handoverDate: string;
  checklist: {
    systemTested: boolean;
    areaCleaned: boolean;
    manualsExplained: boolean;
    defectsReported: boolean;
  };
  clientSignatureName: string;
  remarks: string;
}

export interface WorkOrder {
  id: string;
  clientId?: string;
  clientName: string;
  clientAddress: string;
  clientContact: string;
  clientEmail: string;
  jobScope: JobScope;
  priority: WorkOrderPriority;
  description: string;
  status: WorkOrderStatus;
  assignedTechnician?: string;
  assignedTechnicianId?: string;
  createdAt: string;
  source?: 'AD_HOC' | 'MAINTENANCE' | 'CLIENT_PORTAL';
  contractId?: string;
  internalNotes?: InternalNote[];
  // Time and Location Tracking
  checkInTime?: string;
  checkOutTime?: string;
  checkInLocation?: { lat: number; lng: number };
  checkOutLocation?: { lat: number; lng: number };
  currentLocation?: { lat: number; lng: number };
  totalDurationSeconds?: number;
  trackingLogs?: TrackingLog[];
}

export interface ServiceReport {
  id: string;
  workOrderId: string;
  technicianName: string;
  findings: string;
  actionsTaken: string;
  partsUsed: Array<{ item: string; quantity: number }>;
  completionDate: string;
  clientAcknowledged: boolean;
  reviewedByAdmin: boolean;
  manHours?: string;
}

export interface Invoice {
  id: string;
  serviceReportId?: string;
  workOrderId?: string;
  clientId?: string;
  clientNameOverride?: string;
  invoiceDate: string;
  dueDate: string;
  paymentReceivedDate?: string;
  paymentTerms: string;
  totalAmount: number;
  items: Array<{ description: string; amount: number }>;
  status: 'DRAFT' | 'SENT' | 'PAID';
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  web: string;
  whatsapp: string;
  whatsappGroupLink?: string;
  logoUrl?: string;
  signatureUrl?: string;
  motto?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
