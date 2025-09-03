import React, { useState, useEffect } from 'react';
import { X, Pill, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Medication } from '../../types';
import MedicineVisual from './MedicineVisual';
import type { PillShape, PillColor } from './MedicineVisual';
import { playAlarmSound, AudioPatterns } from '../../utils/audioUtils';

interface MedicationReminderProps {
  medication: Medication;
  onResponse: (medicationId: string, response: 'taken' | 'skipped') => void;
  onClose: () => void;
}

const MedicationReminder: React.FC<MedicationReminderProps> = ({ 
  medication, 
  onResponse, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Get visual properties based on medication name/type
  const getMedicationVisual = (medName: string): { shape: PillShape; color: PillColor; quantity: number } => {
    const lowerName = medName.toLowerCase();
    
    if (lowerName.includes('blood pressure')) {
      return { shape: 'oval', color: 'red', quantity: 1 };
    } else if (lowerName.includes('memory')) {
      return { shape: 'capsule', color: 'blue', quantity: 2 };
    } else if (lowerName.includes('heart')) {
      return { shape: 'round', color: 'pink', quantity: 1 };
    } else if (lowerName.includes('vitamin')) {
      return { shape: 'round', color: 'yellow', quantity: 1 };
    } else if (lowerName.includes('pain')) {
      return { shape: 'tablet', color: 'white', quantity: 2 };
    } else if (lowerName.includes('antibiotic')) {
      return { shape: 'capsule', color: 'orange', quantity: 1 };
    } else if (lowerName.includes('evening')) {
      return { shape: 'round', color: 'purple', quantity: 1 };
    } else {
      return { shape: 'tablet', color: 'green', quantity: 1 };
    }
  };

  useEffect(() => {
    setIsVisible(true);
    
    // Play notification sound when reminder appears
    playAlarmSound(AudioPatterns.NOTIFICATION, 0.4);
    
    // Auto-dismiss after 30 seconds if no response
    const timer = setTimeout(() => {
      onClose();
    }, 30000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleResponse = (response: 'taken' | 'skipped') => {
    setIsVisible(false);
    // Play appropriate sound based on response
    if (response === 'taken') {
      playAlarmSound(AudioPatterns.SUCCESS, 0.5);
    } else {
      playAlarmSound(AudioPatterns.WARNING, 0.3);
    }
    setTimeout(() => {
      onResponse(medication.id, response);
    }, 300);
  };
  
  const pillVisual = getMedicationVisual(medication.name);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-transform duration-300 ${
        isVisible ? 'scale-100' : 'scale-95'
      }`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close reminder"
        >
          <X className="w-6 h-6 text-neutral-gray" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-mind-blue to-light-blue p-6 rounded-t-3xl">
          <div className="flex items-center justify-center">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <Pill className="w-12 h-12 text-mind-blue" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mt-4">
            Medication Reminder
          </h2>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center bg-blue-50 px-4 py-2 rounded-full mb-4">
              <Clock className="w-5 h-5 text-mind-blue mr-2" />
              <span className="text-mind-blue font-medium">
                {medication.scheduleTime}
              </span>
            </div>
            
            <h3 className="text-3xl font-bold text-deep-navy mb-2">
              {medication.name}
            </h3>
            
            <p className="text-xl text-neutral-gray">
              {medication.dosage}
            </p>
          </div>

          {/* Medicine Visual Display */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-6">
            <div className="flex items-center justify-center mb-4">
              <MedicineVisual 
                shape={pillVisual.shape}
                color={pillVisual.color}
                size="large"
                quantity={pillVisual.quantity}
                label={`${pillVisual.quantity} ${pillVisual.quantity > 1 ? 'tablets' : 'tablet'}`}
              />
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-center text-lg font-medium text-deep-navy">
                Please take your medication now
              </p>
              <p className="text-center text-sm text-neutral-gray mt-1">
                Have a glass of water ready
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleResponse('taken')}
              className="w-full py-4 px-6 bg-success-green text-white rounded-2xl font-bold text-xl hover:bg-green-600 transition-colors flex items-center justify-center shadow-lg"
            >
              <CheckCircle className="w-7 h-7 mr-3" />
              I took it
            </button>
            
            <button
              onClick={() => handleResponse('skipped')}
              className="w-full py-4 px-6 bg-gray-200 text-neutral-gray rounded-2xl font-bold text-xl hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              <XCircle className="w-7 h-7 mr-3" />
              Skip this time
            </button>
          </div>

          {/* Helper text */}
          <p className="text-center text-sm text-neutral-gray mt-4">
            Your caregiver will be notified of your response
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicationReminder;