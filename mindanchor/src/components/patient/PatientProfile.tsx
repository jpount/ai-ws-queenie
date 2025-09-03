import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Phone, Mail, MapPin, Calendar, Heart, Users, Plus, X } from 'lucide-react';
import { useAuthContext } from '../../hooks/useAuthContext';
import type { User, CaregiverRelationship } from '../../types';
import toast from 'react-hot-toast';

interface PatientProfileProps {
  onBack: () => void;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ onBack }) => {
  const { user } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddCaregiver, setShowAddCaregiver] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth || '',
    emergencyContact: user?.emergencyContact || '',
    medicalConditions: user?.medicalConditions || ''
  });

  const [newCaregiver, setNewCaregiver] = useState({
    email: '',
    relationship: 'family' as 'family' | 'professional' | 'friend' | 'other',
    relationshipDetails: '',
    isPrimary: false
  });

  const [caregivers, setCaregivers] = useState<CaregiverRelationship[]>(
    user?.assignedCaregivers || []
  );

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || '',
        emergencyContact: user.emergencyContact || '',
        medicalConditions: user.medicalConditions || ''
      });
      setCaregivers(user.assignedCaregivers || []);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In production, this would update Firebase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local user data
      const updatedUser: User = {
        ...user!,
        ...formData,
        assignedCaregivers: caregivers
      };
      
      // In production, update auth context with new user data
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCaregiver = async () => {
    if (!newCaregiver.email) {
      toast.error('Please enter caregiver email');
      return;
    }

    try {
      // In production, this would search for the caregiver by email
      const mockCaregiver: CaregiverRelationship = {
        caregiverId: `cg-${Date.now()}`,
        caregiverName: 'Sarah Johnson',
        caregiverEmail: newCaregiver.email,
        relationship: newCaregiver.relationship,
        relationshipDetails: newCaregiver.relationshipDetails,
        isPrimary: newCaregiver.isPrimary || caregivers.length === 0,
        addedAt: new Date()
      };

      setCaregivers([...caregivers, mockCaregiver]);
      setShowAddCaregiver(false);
      setNewCaregiver({
        email: '',
        relationship: 'family',
        relationshipDetails: '',
        isPrimary: false
      });
      toast.success('Caregiver added successfully!');
    } catch (error) {
      toast.error('Failed to add caregiver');
    }
  };

  const handleRemoveCaregiver = (caregiverId: string) => {
    setCaregivers(caregivers.filter(cg => cg.caregiverId !== caregiverId));
    toast.success('Caregiver removed');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream via-white to-light-blue p-4">
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
              className="px-4 py-2 bg-mind-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-deep-navy mb-6 flex items-center">
            <User className="w-6 h-6 mr-2 text-mind-blue" />
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
                <Calendar className="w-4 h-4 inline mr-1" />
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={!isEditing}
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

        {/* Medical Information & Caregivers */}
        <div className="space-y-6">
          {/* Medical Conditions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-deep-navy mb-6 flex items-center">
              <Heart className="w-6 h-6 mr-2 text-emergency-red" />
              Medical Conditions
            </h2>
            
            <textarea
              name="medicalConditions"
              value={formData.medicalConditions}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={4}
              placeholder="List any medical conditions, allergies, or important health information..."
              className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50"
            />
          </div>

          {/* Caregivers */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-deep-navy flex items-center">
                <Users className="w-6 h-6 mr-2 text-anchor-gold" />
                My Caregivers
              </h2>
              {isEditing && (
                <button
                  onClick={() => setShowAddCaregiver(true)}
                  className="px-3 py-1 bg-mind-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {caregivers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No caregivers added yet</p>
              ) : (
                caregivers.map(caregiver => (
                  <div key={caregiver.caregiverId} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-deep-navy">{caregiver.caregiverName}</p>
                        <p className="text-sm text-gray-600">{caregiver.caregiverEmail}</p>
                        <p className="text-sm text-gray-500">
                          {caregiver.relationship === 'other' && caregiver.relationshipDetails
                            ? caregiver.relationshipDetails
                            : caregiver.relationship.charAt(0).toUpperCase() + caregiver.relationship.slice(1)}
                          {caregiver.isPrimary && ' • Primary'}
                        </p>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveCaregiver(caregiver.caregiverId)}
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

      {/* Add Caregiver Modal */}
      {showAddCaregiver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-deep-navy mb-4">Add Caregiver</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caregiver Email
                </label>
                <input
                  type="email"
                  value={newCaregiver.email}
                  onChange={(e) => setNewCaregiver({ ...newCaregiver, email: e.target.value })}
                  placeholder="caregiver@example.com"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship Type
                </label>
                <select
                  value={newCaregiver.relationship}
                  onChange={(e) => setNewCaregiver({ ...newCaregiver, relationship: e.target.value as any })}
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
                  Relationship Details (e.g., Daughter, Nurse)
                </label>
                <input
                  type="text"
                  value={newCaregiver.relationshipDetails}
                  onChange={(e) => setNewCaregiver({ ...newCaregiver, relationshipDetails: e.target.value })}
                  placeholder="Daughter"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={newCaregiver.isPrimary}
                  onChange={(e) => setNewCaregiver({ ...newCaregiver, isPrimary: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isPrimary" className="text-sm text-gray-700">
                  Set as primary caregiver
                </label>
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => setShowAddCaregiver(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCaregiver}
                className="flex-1 px-4 py-2 bg-mind-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Caregiver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;