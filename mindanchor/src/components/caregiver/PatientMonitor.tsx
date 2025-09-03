import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MapPin, Pill, Activity, Phone, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface PatientInfo {
  id: string;
  name: string;
  age: number;
  condition: string;
  lastSeen: Date;
  location: string;
  medications: number;
  nextMedication: string;
  emergencyContact: string;
}

interface PatientMonitorProps {
  patient: PatientInfo;
  onBack: () => void;
}

const PatientMonitor: React.FC<PatientMonitorProps> = ({ patient, onBack }) => {
  const [vitals, setVitals] = useState({
    heartRate: 72,
    bloodPressure: '120/80',
    temperature: 98.6,
    oxygenLevel: 98
  });
  
  const [recentActivities] = useState([
    { time: '8:00 AM', activity: 'Woke up', status: 'normal' },
    { time: '8:30 AM', activity: 'Breakfast', status: 'normal' },
    { time: '9:00 AM', activity: 'Morning medication taken', status: 'success' },
    { time: '10:30 AM', activity: 'Went for walk in garden', status: 'normal' },
    { time: '12:00 PM', activity: 'Lunch', status: 'normal' },
  ]);

  const [medications] = useState([
    { name: 'Blood Pressure Med', time: '9:00 AM', status: 'taken' },
    { name: 'Memory Support', time: '2:00 PM', status: 'pending' },
    { name: 'Evening Medicine', time: '8:00 PM', status: 'pending' }
  ]);

  // Simulate vitals update
  useEffect(() => {
    const interval = setInterval(() => {
      setVitals(prev => ({
        ...prev,
        heartRate: 68 + Math.floor(Math.random() * 10),
        oxygenLevel: 96 + Math.floor(Math.random() * 4)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCallPatient = () => {
    toast.success('Initiating call to ' + patient.name);
    // In production, integrate with calling API
  };

  const handleEmergencyContact = () => {
    window.location.href = `tel:${patient.emergencyContact}`;
  };

  const handleSendReminder = () => {
    toast.success('Medication reminder sent to ' + patient.name);
    // In production, send actual reminder
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-mind-blue hover:text-blue-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Patients</span>
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleCallPatient}
              className="px-4 py-2 bg-mind-blue text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Patient</span>
            </button>
            <button
              onClick={handleEmergencyContact}
              className="px-4 py-2 bg-emergency-red text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Emergency Contact</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-mind-blue rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-white" />
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-deep-navy mb-2">{patient.name}</h1>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-neutral-gray">Age</p>
                <p className="font-semibold text-deep-navy">{patient.age} years</p>
              </div>
              <div>
                <p className="text-sm text-neutral-gray">Condition</p>
                <p className="font-semibold text-deep-navy">{patient.condition}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-gray">Current Location</p>
                <p className="font-semibold text-deep-navy flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-anchor-gold" />
                  {patient.location}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-gray">Last Seen</p>
                <p className="font-semibold text-deep-navy">
                  {patient.lastSeen.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Vitals */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-deep-navy mb-4 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-emergency-red" />
            Live Vitals
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-neutral-gray">Heart Rate</span>
                <span className="text-2xl font-bold text-emergency-red">
                  {vitals.heartRate} BPM
                </span>
              </div>
              <div className="mt-2 h-2 bg-red-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emergency-red transition-all duration-500"
                  style={{ width: `${(vitals.heartRate / 120) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-neutral-gray">Blood Pressure</span>
                <span className="text-xl font-bold text-mind-blue">
                  {vitals.bloodPressure}
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-neutral-gray">Temperature</span>
                <span className="text-xl font-bold text-success-green">
                  {vitals.temperature}°F
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-cyan-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-neutral-gray">Oxygen Level</span>
                <span className="text-xl font-bold text-alert-cyan">
                  {vitals.oxygenLevel}%
                </span>
              </div>
              <div className="mt-2 h-2 bg-cyan-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-alert-cyan transition-all duration-500"
                  style={{ width: `${vitals.oxygenLevel}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Medications */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-deep-navy flex items-center">
              <Pill className="w-6 h-6 mr-2 text-anchor-gold" />
              Today's Medications
            </h2>
            <button
              onClick={handleSendReminder}
              className="text-mind-blue hover:text-blue-700 text-sm underline"
            >
              Send Reminder
            </button>
          </div>
          
          <div className="space-y-3">
            {medications.map((med, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-deep-navy">{med.name}</p>
                    <p className="text-sm text-neutral-gray">{med.time}</p>
                  </div>
                  {med.status === 'taken' ? (
                    <CheckCircle className="w-5 h-5 text-success-green" />
                  ) : (
                    <span className="px-2 py-1 bg-warning-yellow text-white text-xs rounded-full">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-mind-blue">
              <strong>Next medication:</strong> {patient.nextMedication}
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-deep-navy mb-4 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-success-green" />
            Recent Activity
          </h2>
          
          <div className="space-y-3">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{
                    backgroundColor: activity.status === 'success' 
                      ? '#28a745' 
                      : activity.status === 'warning' 
                      ? '#ffc107' 
                      : '#718096'
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-deep-navy">
                    {activity.activity}
                  </p>
                  <p className="text-xs text-neutral-gray">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="mt-4 w-full py-2 bg-gray-100 text-neutral-gray rounded-lg hover:bg-gray-200 text-sm">
            View Full History
          </button>
        </div>
      </div>

      {/* Location Map Placeholder */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-deep-navy mb-4 flex items-center">
          <MapPin className="w-6 h-6 mr-2 text-anchor-gold" />
          Patient Location
        </h2>
        
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-anchor-gold mx-auto mb-2" />
            <p className="text-neutral-gray">Map View</p>
            <p className="text-sm text-neutral-gray mt-2">
              Patient is currently at: {patient.location}
            </p>
            <button 
              className="mt-4 px-4 py-2 bg-mind-blue text-white rounded-lg hover:bg-blue-600"
              onClick={() => {
                window.open(`https://maps.google.com/?q=37.7749,-122.4194`, '_blank');
              }}
            >
              Open in Maps
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientMonitor;