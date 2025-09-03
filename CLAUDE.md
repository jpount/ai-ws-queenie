# CLAUDE.md - AI Assistant Build Guide

## Project: MindAnchor Dementia Safety & Community Response Platform
**Goal:** Build an MVP Dementia Safety & Community Response for elderly dementia patients in 3 hours

## Quick Commands
```bash
# Development
cd mindanchor && npm run dev

# Testing & Validation
npm run lint
npm run build

# Type checking
npx tsc --noEmit
```

## Build Priority Order

### Phase 1: Core Setup (30 min)
1. Install essential dependencies
2. Setup Firebase configuration
3. Create routing structure
4. Setup Tailwind CSS with brand colors
5. Create base layout components

### Phase 2: Patient Features (45 min)
1. Build SOS button component (PRIORITY #1)
2. Create patient dashboard
3. Implement emergency alert system
4. Add medication reminder UI
5. GPS location capture

### Phase 3: Caregiver Features (45 min)
1. Alert reception dashboard
2. Real-time alert cards
3. Response acknowledgment system
4. Map integration for location
5. Patient monitoring interface

### Phase 4: Polish & Demo (30 min)
1. Volunteer registration form
2. Add demo data
3. Test critical flows
4. Fix any breaking issues

## Critical Implementation Notes

### SOS Button Requirements
- Minimum 200x200px size
- Single tap activation
- Red color (#ff0000)
- Instant alert broadcast
- Show "Help is coming" confirmation

### Real-time Features
- Alerts must propagate in ≤3 seconds
- Use Firebase Realtime Database or Firestore
- WebSocket fallback if needed
- Optimistic UI updates

### Accessibility
- Minimum 18pt font for patient UI
- Touch targets ≥44x44pt
- High contrast (4.5:1 ratio)
- Simple 2-tap navigation max

### Brand Colors (Tailwind Config)
```javascript
colors: {
  'mind-blue': '#4299e1',
  'anchor-gold': '#f6ad55',
  'alert-cyan': '#00d4ff',
  'deep-navy': '#2d3748',
  'light-blue': '#90cdf4',
  'warm-cream': '#fef3c7',
  'neutral-gray': '#718096',
  'emergency-red': '#ff0000',
  'success-green': '#28a745',
  'warning-yellow': '#ffc107'
}
```

## Dependencies to Install
```json
{
  "react-router-dom": "^6.0.0",
  "firebase": "^10.0.0",
  "@react-google-maps/api": "^2.19.0",
  "tailwindcss": "^3.0.0",
  "date-fns": "^2.30.0",
  "react-hook-form": "^7.0.0",
  "zustand": "^4.0.0",
  "react-hot-toast": "^2.0.0",
  "lucide-react": "^0.400.0"
}
```

## File Structure to Create
```
src/
├── components/
│   ├── patient/
│   │   ├── SOSButton.tsx
│   │   ├── MedicationReminder.tsx
│   │   └── PatientDashboard.tsx
│   ├── caregiver/
│   │   ├── AlertCard.tsx
│   │   ├── AlertsDashboard.tsx
│   │   └── CaregiverDashboard.tsx
│   └── auth/
│       └── LoginForm.tsx
├── contexts/
│   └── AuthContext.tsx
├── services/
│   └── firebase.ts
├── types/
│   └── index.ts
└── pages/
    ├── PatientView.tsx
    ├── CaregiverView.tsx
    └── Login.tsx
```

## Firebase Configuration Template
```typescript
// src/services/firebase.ts
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "mindanchor-demo.firebaseapp.com",
  projectId: "mindanchor-demo",
  storageBucket: "mindanchor-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};
```

## Demo Scenarios to Test
1. **Emergency Flow**: Patient clicks SOS → Alert shows on caregiver dashboard → Caregiver responds
2. **Medication Flow**: Reminder popup → Patient responds → Status updates
3. **Multi-responder**: Multiple caregivers see and respond to same alert

## TypeScript Interfaces
```typescript
interface User {
  id: string;
  name: string;
  userType: 'patient' | 'caregiver' | 'volunteer';
  location?: { lat: number; lng: number; };
}

interface Alert {
  id: string;
  patientId: string;
  timestamp: Date;
  status: 'active' | 'responded' | 'resolved';
  location: { lat: number; lng: number; };
  responders: string[];
}

interface Medication {
  id: string;
  patientId: string;
  name: string;
  scheduleTime: string;
  lastResponse?: 'taken' | 'skipped' | 'pending';
}
```

## Success Criteria Checklist
- [ ] Patient can trigger SOS with single tap
- [ ] Alert reaches caregiver dashboard in <3 seconds
- [ ] Caregiver can acknowledge response
- [ ] Medication reminders appear on schedule
- [ ] Map shows patient location
- [ ] App handles 3+ concurrent users
- [ ] No crashes during 5-minute demo

## Common Issues & Solutions
- **Firebase not connecting**: Use demo mode with local state
- **Maps not loading**: Fallback to static location display
- **Real-time not working**: Use polling as fallback (5 second intervals)
- **Build errors**: Focus on core features, skip nice-to-haves

## Demo Data
```javascript
// Mock users for testing
const demoPatient = {
  id: 'p1',
  name: 'John Smith',
  userType: 'patient',
  location: { lat: 37.7749, lng: -122.4194 }
};

const demoCaregiver = {
  id: 'c1',
  name: 'Sarah Johnson',
  userType: 'caregiver',
  assignedPatients: ['p1']
};
```

## Remember
- **MVP Focus**: Core SOS and alert features first
- **Skip if time-constrained**: Advanced animations, perfect styling, admin features
- **Always working demo**: Better to have 3 working features than 10 broken ones
- **Test frequently**: Run the app every 15 minutes to catch issues early