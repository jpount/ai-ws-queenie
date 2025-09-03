# Emergency Response Platform - Requirements Summary

## Project Overview
**Name:** MindAnchor Emergency Response Platform
**Type:** React Web Application
**Purpose:** Emergency assistance platform for elderly patients with dementia, connecting them with caregivers and volunteers
**Development Approach:** MVP with 3-hour build target

## Core User Personas

### 1. Patient (Primary User)
- Elderly individuals with cognitive conditions
- Need simple, accessible interface
- Key features: SOS button, medication reminders

### 2. Caregiver (Secondary User)
- Professional and family caregivers
- Monitor and respond to patient needs
- Key features: Alert management, patient dashboard

### 3. Volunteer (Future Enhancement)
- Community members offering assistance
- Registration only in MVP

## Technical Stack Requirements

### Frontend Framework
- **React** with TypeScript
- Modern hooks-based architecture
- Responsive design for mobile and desktop

### Styling
- Use brand colors from BRANDING.md
- Tailwind CSS or styled-components
- Mobile-first responsive design

### State Management
- React Context API or Zustand for simple state
- Real-time updates for emergency alerts

### Backend Services
- Firebase or Supabase for:
  - Authentication
  - Real-time database
  - WebSocket connections

### Maps Integration
- Google Maps or Mapbox
- Display patient location
- Calculate distances and ETAs

## Core Features (MVP)

### Authentication System
- [ ] Simple login/registration
- [ ] User type selection (patient/caregiver/volunteer)
- [ ] Persistent sessions
- [ ] Mock face recognition option for patients

### Patient Features
- [ ] Large SOS button (200x200px minimum)
- [ ] Instant emergency alert trigger
- [ ] GPS location capture
- [ ] "Help is coming" confirmation
- [ ] Medication reminder popups
- [ ] Medication response tracking (Taken/Skip)
- [ ] Show responding caregivers list

### Caregiver Features
- [ ] Emergency alert dashboard
- [ ] Show alerts from assigned patients
- [ ] Show alerts from ANY patient within 1 mile
- [ ] "I'm responding" acknowledgment
- [ ] Calculate and display ETA
- [ ] Patient monitoring dashboard
- [ ] Medication compliance tracking
- [ ] Patient location on map

### Volunteer Features
- [ ] Registration form
- [ ] Store volunteer information
- [ ] "Thank you" confirmation
- [ ] Mark as "Pending Activation"

## UI/UX Requirements

### Accessibility
- Minimum 18pt font for patient interface
- High contrast (4.5:1 ratio minimum)
- Large touch targets (44x44pt minimum)
- Simple 2-tap navigation to critical features

### Color Scheme
```css
:root {
  --primary-blue: #4299e1;
  --accent-gold: #f6ad55;
  --alert-cyan: #00d4ff;
  --text-navy: #2d3748;
  --bg-light-blue: #90cdf4;
  --bg-cream: #fef3c7;
  --text-gray: #718096;
  --bg-white: #ffffff;
  --emergency-red: #ff0000;
  --success-green: #28a745;
  --warning-yellow: #ffc107;
}
```

### Component Specifications
- **SOS Button:** Red, circular, prominent placement
- **Alert Cards:** Full width, color-coded by severity
- **Medication Cards:** Clear action buttons, countdown timer
- **Map View:** Interactive with location markers

## Data Models

### User
```typescript
interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  userType: 'patient' | 'caregiver' | 'volunteer';
  location: {
    lat: number;
    lng: number;
  };
  profilePhoto?: string;
  assignedPatients?: string[]; // For caregivers
  medicalConditions?: string; // For patients
  createdAt: Date;
  lastActive: Date;
}
```

### Medication
```typescript
interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  scheduleTime: string;
  lastTaken?: Date;
  lastResponse: 'taken' | 'skipped' | 'pending';
  pillImage?: string;
  active: boolean;
}
```

### Alert
```typescript
interface Alert {
  id: string;
  patientId: string;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
  status: 'active' | 'responded' | 'resolved' | 'cancelled';
  severity: 'emergency' | 'urgent' | 'routine';
  responders: Array<{
    caregiverId: string;
    responseTime: Date;
    etaMinutes: number;
    distanceMiles: number;
    status: 'notified' | 'acknowledged' | 'en_route' | 'arrived';
  }>;
}
```

## Performance Requirements
- Emergency alerts propagate in ≤3 seconds
- Map renders in ≤2 seconds
- Application startup ≤5 seconds
- Support 10+ concurrent users

## Development Priorities

### Phase 1: Core Infrastructure (30 min)
1. React app setup with routing
2. Firebase/Supabase configuration
3. Basic authentication flow
4. Database schema setup

### Phase 2: Patient Features (45 min)
1. Patient dashboard layout
2. SOS button implementation
3. Emergency alert broadcasting
4. Medication reminder system

### Phase 3: Caregiver Features (45 min)
1. Caregiver dashboard
2. Alert reception and response
3. Patient monitoring interface
4. Map integration

### Phase 4: Polish & Demo (30 min)
1. Volunteer registration
2. UI polish and responsiveness
3. Demo data setup
4. Testing core flows

## Demo Success Criteria
- [ ] Patient can trigger SOS with single tap
- [ ] Alert reaches caregivers within 3 seconds
- [ ] Multiple caregivers can respond
- [ ] Medication reminders function correctly
- [ ] Map shows real-time locations
- [ ] No crashes during 5-minute demo

## Out of Scope (MVP)
- Real biometric authentication
- SMS/email notifications
- Offline mode
- Background tracking
- Push notifications
- Admin dashboard
- Payment processing
- HIPAA compliance (demo only)