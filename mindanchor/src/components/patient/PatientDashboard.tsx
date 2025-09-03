import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Pill, MapPin, Phone, Activity, LogOut, CheckCircle, User as UserIcon, PhoneCall, PhoneOff } from 'lucide-react';
import { useAuthContext } from '../../hooks/useAuthContext';
import SOSButton from './SOSButton';
import MedicationReminder from './MedicationReminder';
import MedicineVisual from './MedicineVisual';
import type { PillShape, PillColor } from './MedicineVisual';
import PatientProfile from './PatientProfile';
import Avatar from '../common/Avatar';
import type { User, Alert, Medication } from '../../types';
import { twilioService } from '../../services/twilioService';
import toast from 'react-hot-toast';

interface PatientDashboardProps {
  user: User;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showMedReminder, setShowMedReminder] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [callingContact, setCallingContact] = useState<string | null>(null);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Helper function to get pill visual properties
  const getPillVisual = (medName: string): { shape: PillShape; color: PillColor } => {
    const lowerName = medName.toLowerCase();
    
    if (lowerName.includes('blood pressure')) {
      return { shape: 'oval', color: 'red' };
    } else if (lowerName.includes('memory')) {
      return { shape: 'capsule', color: 'blue' };
    } else if (lowerName.includes('heart')) {
      return { shape: 'round', color: 'pink' };
    } else if (lowerName.includes('vitamin')) {
      return { shape: 'round', color: 'yellow' };
    } else if (lowerName.includes('evening')) {
      return { shape: 'round', color: 'purple' };
    } else {
      return { shape: 'tablet', color: 'green' };
    }
  };

  // Demo medications
  useEffect(() => {
    const demoMeds: Medication[] = [
      {
        id: 'm1',
        patientId: user.id,
        name: 'Blood Pressure Medicine',
        dosage: '1 tablet',
        scheduleTime: '09:00',
        active: true
      },
      {
        id: 'm2',
        patientId: user.id,
        name: 'Memory Support',
        dosage: '2 tablets',
        scheduleTime: '14:00',
        active: true
      },
      {
        id: 'm3',
        patientId: user.id,
        name: 'Evening Medication',
        dosage: '1 tablet',
        scheduleTime: '20:00',
        active: true
      }
    ];
    setMedications(demoMeds);
  }, [user.id]);

  const handleEmergency = async (location: { lat: number; lng: number }) => {
    const newAlert: Alert = {
      id: `alert-${Date.now()}`,
      patientId: user.id,
      patientName: user.name,
      location,
      timestamp: new Date(),
      status: 'active',
      severity: 'emergency',
      responders: []
    };

    setActiveAlert(newAlert);
    
    // In production, this would send to Firebase
    console.log('Emergency Alert Created:', newAlert);
    
    // Simulate caregiver response after 3 seconds
    setTimeout(() => {
      if (activeAlert?.id === newAlert.id) {
        setActiveAlert({
          ...newAlert,
          status: 'responded',
          responders: [{
            caregiverId: 'c1',
            caregiverName: 'Sarah (Daughter)',
            responseTime: new Date(),
            etaMinutes: 5,
            distanceMiles: 2.3,
            status: 'en_route'
          }]
        });
        toast.success('Sarah is on her way! ETA: 5 minutes', {
          duration: 6000,
          icon: '🚗'
        });
      }
    }, 3000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handlePhoneCall = async (phoneNumber: string, contactName: string) => {
    try {
      setCallingContact(contactName);
      toast.loading(`Initiating call to ${contactName}...`, { id: 'calling' });
      
      // Initialize Twilio service if not already done
      await twilioService.initialize();
      
      // Make the real call using Twilio
      const message = `This is an emergency alert from MindAnchor. ${user.name} needs immediate assistance. Please respond by pressing 1 to acknowledge or 2 to call back.`;
      const result = await twilioService.makeCall(phoneNumber, user.name, message);
      
      toast.dismiss('calling');
      
      if (result.success) {
        toast.success(`Call initiated to ${contactName}`, {
          icon: '📞',
          duration: 4000
        });
        
        // Keep the calling state for 5 seconds to show the call is in progress
        setTimeout(() => {
          setCallingContact(null);
          toast.success(`Call to ${contactName} completed`, {
            icon: '✅',
            duration: 3000
          });
        }, 5000);
      } else {
        throw new Error(result.error || 'Call failed');
      }
    } catch (error: any) {
      toast.dismiss('calling');
      toast.error(`Failed to call ${contactName}. Make sure the backend server is running.`);
      setCallingContact(null);
      console.error('Call error:', error);
    }
  };

  const handleMedicationResponse = (medId: string, response: 'taken' | 'skipped') => {
    setMedications(prev => 
      prev.map(med => 
        med.id === medId 
          ? { ...med, lastResponse: response, lastTaken: new Date() }
          : med
      )
    );
    setShowMedReminder(false);
    toast.success(
      response === 'taken' 
        ? 'Great job! Medication recorded as taken.' 
        : 'Medication skipped. Please consult your caregiver.',
      { icon: response === 'taken' ? '✅' : '⏭️' }
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Show profile view if selected
  if (showProfile) {
    return <PatientProfile onBack={() => setShowProfile(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream via-white to-light-blue p-4">
      {/* Header with Large Clock */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Avatar
              src={user.profilePhoto || 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=400&h=400&fit=crop&crop=faces&q=80'}
              name={user.name}
              size="large"
            />
            <div>
              <h1 className="text-3xl font-bold text-deep-navy mb-2">
                Hello, {user.name}
              </h1>
              <p className="text-xl text-neutral-gray">
                {formatDate(currentTime)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-right">
              <div className="text-5xl font-bold text-mind-blue">
                {formatTime(currentTime)}
              </div>
              <div className="flex items-center justify-end mt-2 text-neutral-gray">
                <MapPin className="w-5 h-5 mr-1" />
                <span>Home</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-mind-blue rounded-lg hover:bg-blue-100 transition-colors"
                title="Profile"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* SOS Button Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-deep-navy mb-4 text-center">
            Emergency Help
          </h2>
          <SOSButton 
            patientId={user.id}
            patientName={user.name}
            onEmergency={handleEmergency}
          />
          
          {/* Active Alert Status */}
          {activeAlert && activeAlert.status === 'responded' && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border-2 border-success-green">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-success-green">
                    Help is on the way!
                  </p>
                  <p className="text-neutral-gray mt-1">
                    {activeAlert.responders[0]?.caregiverName} • ETA: {activeAlert.responders[0]?.etaMinutes} min
                  </p>
                </div>
                <Activity className="w-8 h-8 text-success-green animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* Quick Info Section */}
        <div className="space-y-6">
          {/* Medication Schedule */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-deep-navy flex items-center">
                <Pill className="w-6 h-6 mr-2 text-mind-blue" />
                Today's Medications
              </h3>
              <button
                onClick={() => setShowMedReminder(true)}
                className="text-mind-blue hover:text-blue-700 underline"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-3">
              {medications.slice(0, 3).map(med => {
                const pillVisual = getPillVisual(med.name);
                const quantity = parseInt(med.dosage) || 1;
                
                return (
                  <div key={med.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <MedicineVisual 
                        shape={pillVisual.shape}
                        color={pillVisual.color}
                        size="small"
                        quantity={quantity}
                      />
                      <div>
                        <p className="font-medium text-deep-navy text-lg">{med.name}</p>
                        <p className="text-sm text-neutral-gray">{med.scheduleTime} • {med.dosage}</p>
                      </div>
                    </div>
                    {med.lastResponse === 'taken' ? (
                      <div className="flex items-center text-success-green">
                        <CheckCircle className="w-6 h-6" />
                        <span className="ml-1 font-medium">Taken</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-warning-yellow">
                        <Clock className="w-6 h-6" />
                        <span className="ml-1 text-sm font-medium">Pending</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-deep-navy mb-4 flex items-center">
              <Phone className="w-6 h-6 mr-2 text-anchor-gold" />
              Quick Contacts
            </h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => handlePhoneCall('+6591829532', 'Sarah (Daughter)')}
                disabled={callingContact !== null}
                className={`w-full p-4 rounded-lg flex items-center justify-between transition-all ${
                  callingContact === 'Sarah (Daughter)' 
                    ? 'bg-green-100 animate-pulse' 
                    : 'bg-blue-50 hover:bg-blue-100'
                } ${callingContact && callingContact !== 'Sarah (Daughter)' ? 'opacity-50' : ''}`}
              >
                <div className="text-left">
                  <p className="font-medium text-deep-navy">Sarah (Daughter)</p>
                  <p className="text-sm text-neutral-gray">
                    {callingContact === 'Sarah (Daughter)' ? 'Calling...' : 'Primary Caregiver'}
                  </p>
                </div>
                {callingContact === 'Sarah (Daughter)' ? (
                  <PhoneCall className="w-6 h-6 text-green-600 animate-bounce" />
                ) : (
                  <Phone className="w-6 h-6 text-mind-blue" />
                )}
              </button>
              
              <button 
                onClick={() => handlePhoneCall('+6512345678', 'Dr. Johnson')}
                disabled={callingContact !== null}
                className={`w-full p-4 rounded-lg flex items-center justify-between transition-all ${
                  callingContact === 'Dr. Johnson' 
                    ? 'bg-green-100 animate-pulse' 
                    : 'bg-orange-50 hover:bg-orange-100'
                } ${callingContact && callingContact !== 'Dr. Johnson' ? 'opacity-50' : ''}`}
              >
                <div className="text-left">
                  <p className="font-medium text-deep-navy">Dr. Johnson</p>
                  <p className="text-sm text-neutral-gray">
                    {callingContact === 'Dr. Johnson' ? 'Calling...' : 'Family Doctor'}
                  </p>
                </div>
                {callingContact === 'Dr. Johnson' ? (
                  <PhoneCall className="w-6 h-6 text-green-600 animate-bounce" />
                ) : (
                  <Phone className="w-6 h-6 text-anchor-gold" />
                )}
              </button>
              
              <button 
                onClick={() => handlePhoneCall('+6598765432', 'Tom (Son)')}
                disabled={callingContact !== null}
                className={`w-full p-4 rounded-lg flex items-center justify-between transition-all ${
                  callingContact === 'Tom (Son)' 
                    ? 'bg-green-100 animate-pulse' 
                    : 'bg-purple-50 hover:bg-purple-100'
                } ${callingContact && callingContact !== 'Tom (Son)' ? 'opacity-50' : ''}`}
              >
                <div className="text-left">
                  <p className="font-medium text-deep-navy">Tom (Son)</p>
                  <p className="text-sm text-neutral-gray">
                    {callingContact === 'Tom (Son)' ? 'Calling...' : 'Secondary Contact'}
                  </p>
                </div>
                {callingContact === 'Tom (Son)' ? (
                  <PhoneCall className="w-6 h-6 text-green-600 animate-bounce" />
                ) : (
                  <Phone className="w-6 h-6 text-purple-600" />
                )}
              </button>
              
              <button 
                onClick={() => handlePhoneCall('999', 'Emergency Services')}
                disabled={callingContact !== null}
                className={`w-full p-4 rounded-lg flex items-center justify-between transition-all ${
                  callingContact === 'Emergency Services' 
                    ? 'bg-red-200 animate-pulse' 
                    : 'bg-red-50 hover:bg-red-100'
                } ${callingContact && callingContact !== 'Emergency Services' ? 'opacity-50' : ''}`}
              >
                <div className="text-left">
                  <p className="font-medium text-deep-navy">Emergency Services</p>
                  <p className="text-sm text-neutral-gray">
                    {callingContact === 'Emergency Services' ? 'Calling 999...' : '999 - Ambulance/Police'}
                  </p>
                </div>
                {callingContact === 'Emergency Services' ? (
                  <PhoneCall className="w-6 h-6 text-red-600 animate-bounce" />
                ) : (
                  <Phone className="w-6 h-6 text-emergency-red" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Medication Reminder Modal */}
      {showMedReminder && medications.length > 0 && (
        <MedicationReminder
          medication={medications[0]}
          onResponse={handleMedicationResponse}
          onClose={() => setShowMedReminder(false)}
        />
      )}
    </div>
  );
};

export default PatientDashboard;