# MindAnchor React App - Quick Start Guide

## Project Setup Commands

```bash
# Create React app with Vite and TypeScript
npm create vite@latest mindanchor -- --template react-ts
cd mindanchor

# Install core dependencies
npm install react-router-dom firebase @react-google-maps/api
npm install date-fns react-hook-form zustand axios react-hot-toast
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install type definitions
npm install -D @types/react @types/react-dom @types/google.maps
```

## Tailwind Configuration

Update `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mind-blue': '#4299e1',
        'anchor-gold': '#f6ad55',
        'alert-cyan': '#00d4ff',
        'deep-navy': '#2d3748',
        'light-blue': '#90cdf4',
        'warm-cream': '#fef3c7',
        'neutral-gray': '#718096',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication, Firestore, and Realtime Database
3. Get your config and create `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
```

## Initial File Structure

```bash
# Create folder structure
mkdir -p src/{components/{common,patient,caregiver,volunteer,auth},contexts,hooks,services,types,utils,styles,pages}

# Copy branding assets
cp logo.jpeg public/
```

## Core CSS Setup

Create `src/styles/globals.css`:
```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

:root {
  --primary-blue: #4299e1;
  --accent-gold: #f6ad55;
  --alert-cyan: #00d4ff;
  --text-navy: #2d3748;
  --emergency-red: #ff0000;
  --success-green: #28a745;
  --warning-yellow: #ffc107;
}

body {
  font-family: 'Inter', sans-serif;
  color: var(--text-navy);
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Poppins', sans-serif;
}

.sos-button {
  @apply bg-red-600 hover:bg-red-700 w-52 h-52 rounded-full text-white text-3xl font-bold shadow-2xl transform transition-all active:scale-95;
}
```

## Firebase Service Setup

Create `src/services/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const realtimeDb = getDatabase(app);
```

## Type Definitions

Create `src/types/user.types.ts`:
```typescript
export interface User {
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
  assignedPatients?: string[];
  medicalConditions?: string;
  createdAt: Date;
  lastActive: Date;
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
  responders: Responder[];
}

export interface Responder {
  caregiverId: string;
  caregiverName: string;
  responseTime: Date;
  etaMinutes: number;
  distanceMiles: number;
  status: 'notified' | 'acknowledged' | 'en_route' | 'arrived';
}

export interface Medication {
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

## Basic App Structure

Create `src/App.tsx`:
```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './styles/globals.css';

// Import pages when created
// import Login from './pages/Login';
// import PatientView from './pages/PatientView';
// import CaregiverView from './pages/CaregiverView';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<div>Welcome to MindAnchor</div>} />
          {/* Add routes as components are built */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

## Development Workflow

### Step 1: Authentication (30 min)
```bash
# Build auth components first
# - LoginForm.tsx
# - RegisterForm.tsx
# - UserTypeSelector.tsx
# - AuthContext.tsx
```

### Step 2: Patient Features (45 min)
```bash
# Build patient components
# - SOSButton.tsx
# - MedicationReminder.tsx
# - PatientDashboard.tsx
```

### Step 3: Caregiver Features (45 min)
```bash
# Build caregiver components
# - AlertCard.tsx
# - AlertsDashboard.tsx
# - MapView.tsx
```

### Step 4: Integration (30 min)
```bash
# Connect everything
# - Real-time updates
# - Location tracking
# - Alert broadcasting
```

## Testing the App

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Demo Data Setup

Create test users in Firebase:
```javascript
// Test Users
const demoUsers = [
  {
    email: 'dorothy@demo.com',
    password: 'demo123',
    name: 'Dorothy',
    userType: 'patient',
    medicalConditions: 'Mild dementia'
  },
  {
    email: 'john@demo.com', 
    password: 'demo123',
    name: 'John',
    userType: 'caregiver',
    assignedPatients: ['dorothy_id']
  },
  {
    email: 'sarah@demo.com',
    password: 'demo123',
    name: 'Sarah',
    userType: 'caregiver'
  }
];
```

## Common Issues & Solutions

### CORS Issues with Maps
Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' https://*.googleapis.com https://*.gstatic.com">
```

### Firebase Authentication Errors
Ensure you've enabled Email/Password auth in Firebase Console

### Build Optimization
```javascript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'maps': ['@react-google-maps/api'],
        }
      }
    }
  }
}
```

## Ready to Build!

With these files in place, you can now:

1. Run `npm create vite@latest mindanchor -- --template react-ts`
2. Copy this structure into your project
3. Start building components following the requirements
4. Use the brand colors and typography defined
5. Implement features in priority order

The app is now ready for Claude Code to build the React application!