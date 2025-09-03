export type UserType = 'patient' | 'caregiver' | 'volunteer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  userType: UserType;
  location?: {
    lat: number;
    lng: number;
  };
  profilePhoto?: string;
  assignedPatients?: string[]; // For caregivers
  medicalConditions?: string; // For patients
  createdAt: Date;
  lastActive: Date;
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