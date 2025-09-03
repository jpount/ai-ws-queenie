import React from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Heart, Users, HandHeart } from 'lucide-react';
import Logo from '../components/common/Logo';
import PatientDashboard from '../components/patient/PatientDashboard';
import CaregiverDashboard from '../components/caregiver/CaregiverDashboard';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  const getUserIcon = (size: 'small' | 'large' = 'large') => {
    const className = size === 'small' ? 'w-3 h-3 text-white' : 'w-8 h-8 text-white';
    switch (user.userType) {
      case 'patient':
        return <Heart className={className} />;
      case 'caregiver':
        return <Users className={className} />;
      case 'volunteer':
        return <HandHeart className={className} />;
      default:
        return null;
    }
  };

  const getUserTypeColor = () => {
    switch (user.userType) {
      case 'patient':
        return 'bg-mind-blue';
      case 'caregiver':
        return 'bg-anchor-gold';
      case 'volunteer':
        return 'bg-alert-cyan';
      default:
        return 'bg-neutral-gray';
    }
  };

  // Render specialized dashboards based on user type
  if (user.userType === 'patient') {
    return <PatientDashboard user={user} />;
  }
  
  if (user.userType === 'caregiver') {
    return <CaregiverDashboard user={user} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-blue via-white to-warm-cream">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Logo size="medium" />
              <div className="border-l-2 border-gray-200 pl-4 ml-2">
                <h1 className="text-2xl font-heading font-bold text-deep-navy">
                  MindAnchor
                </h1>
                <p className="text-sm text-neutral-gray capitalize flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center ${getUserTypeColor()}`}>
                    {getUserIcon('small')}
                  </span>
                  {user.userType} Dashboard
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${getUserTypeColor()}`}>
              {getUserIcon()}
            </div>
            <h2 className="text-3xl font-heading font-bold text-deep-navy mb-2">
              Welcome, {user.name}!
            </h2>
            <p className="text-neutral-gray">
              You are logged in as a <span className="font-semibold capitalize">{user.userType}</span>
            </p>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-heading font-semibold text-deep-navy mb-4">
              Account Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-neutral-gray">Name:</span>
                <span className="text-deep-navy font-medium">{user.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-neutral-gray">Email:</span>
                <span className="text-deep-navy font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-neutral-gray">Phone:</span>
                <span className="text-deep-navy font-medium">{user.phone || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-gray">User Type:</span>
                <span className="text-deep-navy font-medium capitalize">{user.userType}</span>
              </div>
            </div>
          </div>

          {/* Feature Placeholder */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-heading font-semibold text-deep-navy mb-2">
              Thank You for Volunteering!
            </h3>
            <p className="text-neutral-gray">
              Your registration is pending activation. We will notify you when volunteer features are available.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;