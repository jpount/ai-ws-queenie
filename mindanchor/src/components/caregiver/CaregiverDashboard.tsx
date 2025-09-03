import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, Calendar, Settings, ChevronRight, Heart, MapPin, Clock, Phone, Shield, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthContext } from '../../hooks/useAuthContext';
import AlertsDashboard from './AlertsDashboard';
import PatientMonitor from './PatientMonitor';
import CaregiverProfile from './CaregiverProfile';
import Avatar from '../common/Avatar';
import type { User } from '../../types';
import toast from 'react-hot-toast';

interface CaregiverDashboardProps {
  user: User;
}

type ViewMode = 'overview' | 'alerts' | 'patients' | 'schedule' | 'profile';

const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const [viewMode, setViewMode] = useState<ViewMode>('alerts');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Demo assigned patients
  const assignedPatients = [
    { 
      id: 'p1', 
      name: 'John Smith', 
      age: 78, 
      condition: 'Mild Dementia',
      lastSeen: new Date(Date.now() - 30 * 60000),
      location: 'Home',
      medications: 3,
      nextMedication: '2:00 PM',
      emergencyContact: '555-0101'
    },
    { 
      id: 'p2', 
      name: 'Mary Johnson', 
      age: 82, 
      condition: 'Alzheimer\'s',
      lastSeen: new Date(Date.now() - 2 * 60 * 60000),
      location: 'Garden',
      medications: 5,
      nextMedication: '3:30 PM',
      emergencyContact: '555-0102'
    },
    { 
      id: 'p3', 
      name: 'Robert Davis', 
      age: 75, 
      condition: 'Early Stage Dementia',
      lastSeen: new Date(),
      location: 'Living Room',
      medications: 2,
      nextMedication: '6:00 PM',
      emergencyContact: '555-0103'
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'alerts':
        return (
          <AlertsDashboard
            caregiverId={user.id}
            caregiverName={user.name}
            assignedPatients={assignedPatients.map(p => p.id)}
          />
        );
      
      case 'patients':
        if (selectedPatientId) {
          const patient = assignedPatients.find(p => p.id === selectedPatientId);
          if (patient) {
            return (
              <PatientMonitor
                patient={patient}
                onBack={() => setSelectedPatientId(null)}
              />
            );
          }
        }
        
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-deep-navy mb-6">My Patients</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assignedPatients.map(patient => (
                <div
                  key={patient.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedPatientId(patient.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-mind-blue rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-deep-navy">{patient.name}</h3>
                        <p className="text-sm text-neutral-gray">Age: {patient.age}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-gray" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Shield className="w-4 h-4 text-anchor-gold mr-2" />
                      <span className="text-neutral-gray">{patient.condition}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 text-mind-blue mr-2" />
                      <span className="text-neutral-gray">{patient.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 text-warning-yellow mr-2" />
                      <span className="text-neutral-gray">
                        Last seen: {new Date(patient.lastSeen).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-gray">
                        Next Med: {patient.nextMedication}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${patient.emergencyContact}`;
                        }}
                        className="p-2 bg-mind-blue text-white rounded-lg hover:bg-blue-600"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'profile':
        return <CaregiverProfile onBack={() => setViewMode('alerts')} />;
      
      case 'schedule':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-deep-navy mb-6">Today's Schedule</h2>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-2 h-12 bg-mind-blue rounded-full mr-4" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-deep-navy">Morning Medication Round</h4>
                        <p className="text-sm text-neutral-gray">John Smith, Mary Johnson</p>
                      </div>
                      <span className="text-sm font-medium text-mind-blue">9:00 AM</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-12 bg-warning-yellow rounded-full mr-4" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-deep-navy">Doctor Visit - Mary Johnson</h4>
                        <p className="text-sm text-neutral-gray">Routine checkup</p>
                      </div>
                      <span className="text-sm font-medium text-warning-yellow">11:30 AM</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <div className="w-2 h-12 bg-success-green rounded-full mr-4" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-deep-navy">Afternoon Activities</h4>
                        <p className="text-sm text-neutral-gray">All patients - Memory exercises</p>
                      </div>
                      <span className="text-sm font-medium text-success-green">2:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-deep-navy mb-6">Caregiver Overview</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <Users className="w-8 h-8 text-mind-blue mb-3" />
                <h3 className="text-3xl font-bold text-deep-navy">{assignedPatients.length}</h3>
                <p className="text-neutral-gray">Total Patients</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <Activity className="w-8 h-8 text-emergency-red mb-3" />
                <h3 className="text-3xl font-bold text-deep-navy">2</h3>
                <p className="text-neutral-gray">Active Alerts</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <Calendar className="w-8 h-8 text-anchor-gold mb-3" />
                <h3 className="text-3xl font-bold text-deep-navy">5</h3>
                <p className="text-neutral-gray">Today's Tasks</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <Shield className="w-8 h-8 text-success-green mb-3" />
                <h3 className="text-3xl font-bold text-deep-navy">98%</h3>
                <p className="text-neutral-gray">Response Rate</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-blue via-white to-warm-cream">
      {/* Navigation Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-10">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-anchor-gold rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-deep-navy">MindAnchor</h1>
              <p className="text-sm text-neutral-gray">Caregiver Portal</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4">
          <button
            onClick={() => setViewMode('alerts')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors ${
              viewMode === 'alerts' ? 'bg-mind-blue text-white' : 'hover:bg-gray-100 text-deep-navy'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="font-medium">Alert Dashboard</span>
            {viewMode === 'alerts' && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>
          
          <button
            onClick={() => setViewMode('patients')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors ${
              viewMode === 'patients' ? 'bg-mind-blue text-white' : 'hover:bg-gray-100 text-deep-navy'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">My Patients</span>
            {viewMode === 'patients' && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>
          
          <button
            onClick={() => setViewMode('schedule')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors ${
              viewMode === 'schedule' ? 'bg-mind-blue text-white' : 'hover:bg-gray-100 text-deep-navy'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Schedule</span>
            {viewMode === 'schedule' && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>
          
          <button
            onClick={() => setViewMode('overview')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors ${
              viewMode === 'overview' ? 'bg-mind-blue text-white' : 'hover:bg-gray-100 text-deep-navy'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Overview</span>
            {viewMode === 'overview' && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>
          
          <button
            onClick={() => setViewMode('profile')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg mb-2 transition-colors ${
              viewMode === 'profile' ? 'bg-mind-blue text-white' : 'hover:bg-gray-100 text-deep-navy'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="font-medium">My Profile</span>
            {viewMode === 'profile' && <ChevronRight className="w-4 h-4 ml-auto" />}
          </button>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar
              src={user.profilePhoto || 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=faces&q=80'}
              name={user.name}
              size="small"
            />
            <div className="flex-1">
              <p className="font-medium text-deep-navy">{user.name}</p>
              <p className="text-xs text-neutral-gray">Caregiver</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-64">
        {renderContent()}
      </div>
    </div>
  );
};

export default CaregiverDashboard;