import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import { useAuthContext } from './hooks/useAuthContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import TestTwilio from './components/TestTwilio';

// Wrapper component to provide AlertProvider with user context
function AppContent() {
  const { user } = useAuthContext();
  
  return (
    <AlertProvider user={user}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/test-twilio" element={<TestTwilio />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AlertProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#2d3748',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#28a745',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff0000',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;