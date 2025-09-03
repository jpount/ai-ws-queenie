import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, User as UserIcon, Phone, Mail, MapPin, Users, Plus, X, Shield, Camera } from 'lucide-react';
import { useAuthContext } from '../../hooks/useAuthContext';
import Avatar from '../common/Avatar';
import type { User, PatientRelationship } from '../../types';
import toast from 'react-hot-toast';

interface CaregiverProfileProps {
  onBack: () => void;
}

const CaregiverProfile: React.FC<CaregiverProfileProps> = ({ onBack }) => {
  const { user, updateProfile } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || '',
    profilePhoto: user?.profilePhoto || ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newPatient, setNewPatient] = useState({
    email: '',
    relationship: 'family' as 'family' | 'professional' | 'friend' | 'other',
    relationshipDetails: '',
    isPrimary: false
  });

  const [patients, setPatients] = useState<PatientRelationship[]>(
    user?.assignedPatients || []
  );

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        emergencyContact: user.emergencyContact || '',
        profilePhoto: user.profilePhoto || ''
      });
      setPatients(user.assignedPatients || []);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, profilePhoto: base64String }));
        toast.success('Photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        ...formData,
        assignedPatients: patients
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPatient = async () => {
    if (!newPatient.email) {
      toast.error('Please enter patient email');
      return;
    }

    try {
      // In production, this would search for the patient by email
      const mockPatient: PatientRelationship = {
        patientId: `pt-${Date.now()}`,
        patientName: 'John Smith',
        patientEmail: newPatient.email,
        relationship: newPatient.relationship,
        relationshipDetails: newPatient.relationshipDetails,
        isPrimary: newPatient.isPrimary,
        addedAt: new Date()
      };

      setPatients([...patients, mockPatient]);
      setShowAddPatient(false);
      setNewPatient({
        email: '',
        relationship: 'family',
        relationshipDetails: '',
        isPrimary: false
      });
      toast.success('Patient added successfully!');
    } catch (error) {
      toast.error('Failed to add patient');
    }
  };

  const handleRemovePatient = (patientId: string) => {
    setPatients(patients.filter(pt => pt.patientId !== patientId));
    toast.success('Patient removed');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-blue via-white to-warm-cream p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-deep-navy" />
            </button>
            <h1 className="text-2xl font-bold text-deep-navy">My Profile</h1>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-anchor-gold text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-success-green text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Photo Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Avatar
              src={formData.profilePhoto || 'https://images.unsplash.com/photo-1551861568-a692c419233e?w=400&h=400&fit=crop'}
              name={formData.name}
              size="xlarge"
            />
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-anchor-gold text-white rounded-full hover:bg-yellow-600 transition-colors"
              >
                <Camera className="w-5 h-5" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-deep-navy">{formData.name || 'Your Name'}</h2>
            <p className="text-neutral-gray">Professional Caregiver</p>
            <p className="text-sm text-neutral-gray mt-1">
              Caring for {patients.length} {patients.length === 1 ? 'patient' : 'patients'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-deep-navy mb-6 flex items-center">
            <UserIcon className="w-6 h-6 mr-2 text-anchor-gold" />
            Personal Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="(555) 123-4567"
                className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="123 Main St, City, State 12345"
                className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact
              </label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="(555) 987-6543"
                className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Professional Information & Patients */}
        <div className="space-y-6">
          {/* Professional Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-deep-navy mb-6 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-anchor-gold" />
              Caregiver Information
            </h2>
            
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Account Type</p>
                <p className="font-medium text-deep-navy">Professional Caregiver</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Active Since</p>
                <p className="font-medium text-deep-navy">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="font-medium text-deep-navy">{patients.length}</p>
              </div>
            </div>
          </div>

          {/* Assigned Patients */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-deep-navy flex items-center">
                <Users className="w-6 h-6 mr-2 text-mind-blue" />
                My Patients
              </h2>
              {isEditing && (
                <button
                  onClick={() => setShowAddPatient(true)}
                  className="px-3 py-1 bg-anchor-gold text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {patients.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No patients assigned yet</p>
              ) : (
                patients.map(patient => (
                  <div key={patient.patientId} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-deep-navy">{patient.patientName}</p>
                        <p className="text-sm text-gray-600">{patient.patientEmail}</p>
                        <p className="text-sm text-gray-500">
                          {patient.relationship === 'other' && patient.relationshipDetails
                            ? patient.relationshipDetails
                            : patient.relationship.charAt(0).toUpperCase() + patient.relationship.slice(1)}
                          {patient.isPrimary && ' • Primary Care'}
                        </p>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleRemovePatient(patient.patientId)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-deep-navy mb-4">Add Patient</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Email
                </label>
                <input
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  placeholder="patient@example.com"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship Type
                </label>
                <select
                  value={newPatient.relationship}
                  onChange={(e) => setNewPatient({ ...newPatient, relationship: e.target.value as any })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="family">Family</option>
                  <option value="professional">Professional</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship Details (e.g., Parent, Client)
                </label>
                <input
                  type="text"
                  value={newPatient.relationshipDetails}
                  onChange={(e) => setNewPatient({ ...newPatient, relationshipDetails: e.target.value })}
                  placeholder="Parent"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={newPatient.isPrimary}
                  onChange={(e) => setNewPatient({ ...newPatient, isPrimary: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isPrimary" className="text-sm text-gray-700">
                  I am the primary caregiver for this patient
                </label>
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => setShowAddPatient(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPatient}
                className="flex-1 px-4 py-2 bg-anchor-gold text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Add Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaregiverProfile;