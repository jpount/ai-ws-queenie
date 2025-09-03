export type UserType = 'patient' | 'caregiver' | 'volunteer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userType: UserType;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  location?: {
    lat: number;
    lng: number;
  };
  profilePhoto?: string;
  assignedPatients?: PatientRelationship[]; // For caregivers
  assignedCaregivers?: CaregiverRelationship[]; // For patients  
  medicalConditions?: string; // For patients
  createdAt: Date;
  lastActive: Date;
}

export interface CaregiverRelationship {
  caregiverId: string;
  caregiverName: string;
  caregiverEmail: string;
  relationship: 'family' | 'professional' | 'friend' | 'other';
  relationshipDetails?: string; // e.g., "Daughter", "Home Health Aide"
  isPrimary: boolean;
  addedAt: Date;
}

export interface PatientRelationship {
  patientId: string;
  patientName: string;
  patientEmail: string;
  relationship: 'family' | 'professional' | 'friend' | 'other';
  relationshipDetails?: string;
  isPrimary: boolean;
  addedAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  userType: UserType;
  phone?: string;
}

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
  status: 'active' | 'responded' | 'resolved' | 'cancelled';
  severity: 'emergency' | 'urgent' | 'routine';
  responders: Array<{
    caregiverId: string;
    caregiverName: string;
    responseTime: Date;
    etaMinutes: number;
    distanceMiles: number;
    status: 'notified' | 'acknowledged' | 'en_route' | 'arrived';
  }>;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  scheduleTime: string;
  lastTaken?: Date;
  lastResponse?: 'taken' | 'skipped' | 'pending';
  pillImage?: string;
  active: boolean;
}