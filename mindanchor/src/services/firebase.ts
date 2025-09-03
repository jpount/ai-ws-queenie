import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import type { User, RegisterData, LoginCredentials } from '../types';

// Demo Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "mindanchor-demo.firebaseapp.com",
  projectId: "mindanchor-demo",
  storageBucket: "mindanchor-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth service functions
export const authService = {
  async register(data: RegisterData): Promise<User> {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Create user document in Firestore
      const userData: User = {
        id: userCredential.user.uid,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        userType: data.userType,
        createdAt: new Date(),
        lastActive: new Date()
      };

      await setDoc(doc(db, 'users', userData.id), {
        ...userData,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      });

      return userData;
    } catch (error) {
      throw new Error((error as Error).message || 'Failed to register');
    }
  },

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      // Update last active
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastActive: serverTimestamp()
      });

      return userDoc.data() as User;
    } catch (error) {
      throw new Error((error as Error).message || 'Failed to login');
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error((error as Error).message || 'Failed to logout');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) return null;

    return userDoc.data() as User;
  },

  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          callback(userDoc.data() as User);
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
};

// Demo mode fallback - for development without Firebase
export const demoAuth = {
  async register(data: RegisterData): Promise<User> {
    const demoUser: User = {
      id: `demo-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      userType: data.userType,
      createdAt: new Date(),
      lastActive: new Date()
    };
    
    // Store in localStorage for demo
    localStorage.setItem('mindanchor-user', JSON.stringify(demoUser));
    return demoUser;
  },

  async login(credentials: LoginCredentials): Promise<User> {
    // Demo login - accept any email/password
    const storedUser = localStorage.getItem('mindanchor-user');
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      user.lastActive = new Date();
      localStorage.setItem('mindanchor-user', JSON.stringify(user));
      return user;
    }

    // Create demo user if none exists
    const demoUser: User = {
      id: 'demo-user-1',
      name: credentials.email.split('@')[0],
      email: credentials.email,
      userType: 'patient',
      createdAt: new Date(),
      lastActive: new Date()
    };
    
    localStorage.setItem('mindanchor-user', JSON.stringify(demoUser));
    return demoUser;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('mindanchor-user');
  },

  async getCurrentUser(): Promise<User | null> {
    const storedUser = localStorage.getItem('mindanchor-user');
    return storedUser ? JSON.parse(storedUser) : null;
  },

  onAuthChange(callback: (user: User | null) => void) {
    // Check localStorage on mount
    const storedUser = localStorage.getItem('mindanchor-user');
    callback(storedUser ? JSON.parse(storedUser) : null);
    
    // Return unsubscribe function
    return () => {};
  }
};

// Use demo auth for now (switch to authService when Firebase is configured)
export const useAuth = demoAuth;