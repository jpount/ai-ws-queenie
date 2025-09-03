# MindAnchor React App - Project Structure

## Recommended Folder Structure

```
mindanchor/
├── public/
│   ├── index.html
│   └── logo.jpeg
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── patient/
│   │   │   ├── SOSButton.tsx
│   │   │   ├── MedicationReminder.tsx
│   │   │   ├── RespondersList.tsx
│   │   │   └── PatientDashboard.tsx
│   │   ├── caregiver/
│   │   │   ├── AlertCard.tsx
│   │   │   ├── AlertsDashboard.tsx
│   │   │   ├── PatientMonitor.tsx
│   │   │   ├── MapView.tsx
│   │   │   └── CaregiverDashboard.tsx
│   │   ├── volunteer/
│   │   │   ├── RegistrationForm.tsx
│   │   │   └── VolunteerDashboard.tsx
│   │   └── auth/
│   │       ├── LoginForm.tsx
│   │       ├── RegisterForm.tsx
│   │       └── UserTypeSelector.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── AlertContext.tsx
│   │   └── LocationContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLocation.ts
│   │   ├── useRealtime.ts
│   │   └── useMedications.ts
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── auth.service.ts
│   │   ├── alert.service.ts
│   │   ├── medication.service.ts
│   │   └── location.service.ts
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── alert.types.ts
│   │   └── medication.types.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── validators.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── components.css
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── PatientView.tsx
│   │   ├── CaregiverView.tsx
│   │   └── VolunteerView.tsx
│   ├── App.tsx
│   ├── index.tsx
│   └── routes.tsx
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.0.0",
    "typescript": "^5.0.0",
    "firebase": "^10.0.0",
    "@react-google-maps/api": "^2.19.0",
    "tailwindcss": "^3.0.0",
    "date-fns": "^2.30.0",
    "react-hook-form": "^7.0.0",
    "zustand": "^4.0.0",
    "axios": "^1.0.0",
    "react-hot-toast": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

## Environment Variables

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key

# App Configuration
VITE_APP_NAME=MindAnchor
VITE_ALERT_RADIUS_MILES=1
VITE_WEBSOCKET_URL=your_websocket_url
```

## Component Examples

### SOS Button Component
```typescript
// High-priority component with accessibility features
interface SOSButtonProps {
  onPress: () => void;
  isActive: boolean;
}
```

### Alert Card Component
```typescript
// Real-time updated card showing emergency alerts
interface AlertCardProps {
  alert: Alert;
  onRespond: (alertId: string) => void;
  currentLocation: Location;
}
```

### Medication Reminder Component
```typescript
// Scheduled popup with clear action buttons
interface MedicationReminderProps {
  medication: Medication;
  onTaken: () => void;
  onSkip: () => void;
}
```

## Routing Structure

```typescript
// Main routes
- / (Home/Landing)
- /login
- /register
- /patient/dashboard
- /patient/emergency
- /caregiver/dashboard
- /caregiver/alerts
- /caregiver/patients/:id
- /volunteer/register
- /volunteer/dashboard
```

## State Management Approach

### Global State (Context/Zustand)
- User authentication state
- Active alerts
- Current location
- WebSocket connection

### Local State
- Form inputs
- UI toggles
- Component-specific data

## Real-time Features Implementation

### WebSocket Events
```typescript
// Key events to handle
- 'emergency.triggered'
- 'emergency.responded'
- 'emergency.resolved'
- 'medication.reminder'
- 'medication.taken'
- 'location.updated'
```

## Styling Approach

### Tailwind Classes for Branded Components
```css
/* SOS Button */
.sos-button {
  @apply bg-red-600 hover:bg-red-700 
         w-52 h-52 rounded-full 
         text-white text-3xl font-bold
         shadow-2xl transform transition-all
         active:scale-95;
}

/* Alert Card */
.alert-card-emergency {
  @apply border-l-4 border-red-500 
         bg-red-50 p-4 rounded-lg
         shadow-md;
}

/* Brand Colors as Tailwind Extensions */
colors: {
  'mind-blue': '#4299e1',
  'anchor-gold': '#f6ad55',
  'alert-cyan': '#00d4ff',
  'deep-navy': '#2d3748'
}
```

## Testing Approach

### Demo Scenarios
1. **Emergency Flow**: Patient triggers SOS → Alert broadcasts → Caregiver responds
2. **Medication Flow**: Reminder appears → Patient responds → Compliance tracked
3. **Location Flow**: Real-time location updates → Distance calculations → ETA updates
4. **Multi-user Flow**: Multiple caregivers receive and respond to same alert

## Performance Optimizations

### Code Splitting
- Lazy load volunteer components
- Split maps library
- Defer non-critical features

### Real-time Optimizations
- Debounce location updates
- Batch state updates
- Use optimistic UI updates

## Security Considerations

### Authentication
- Secure token storage
- Session management
- Role-based access

### Data Protection
- Location privacy when not in emergency
- Encrypted sensitive data
- Secure WebSocket connections

## Deployment Strategy

### Development
```bash
npm run dev
# Runs on http://localhost:5173
```

### Production Build
```bash
npm run build
npm run preview
```

### Environment-specific Configs
- Development: Mock data and services
- Staging: Real services, test data
- Production: Full security, real data