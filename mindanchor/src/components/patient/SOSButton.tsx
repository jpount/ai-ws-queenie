import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface SOSButtonProps {
  patientId: string;
  patientName: string;
  onEmergency?: (location: { lat: number; lng: number }) => void;
}

const SOSButton: React.FC<SOSButtonProps> = ({ patientId, patientName, onEmergency }) => {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [helpComing, setHelpComing] = useState(false);

  const handleSOSClick = async () => {
    if (isActive || isLoading) return;

    setIsLoading(true);
    setIsActive(true);

    try {
      // Get current location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            // Trigger emergency callback
            if (onEmergency) {
              await onEmergency(location);
            }

            // Show success state
            setIsLoading(false);
            setHelpComing(true);
            toast.success('Emergency alert sent! Help is on the way.', {
              duration: 5000,
              icon: '🚨'
            });

            // Reset after 10 seconds
            setTimeout(() => {
              setIsActive(false);
              setHelpComing(false);
            }, 10000);
          },
          (error) => {
            console.error('Location error:', error);
            // Send alert without location
            if (onEmergency) {
              onEmergency({ lat: 0, lng: 0 });
            }
            setIsLoading(false);
            setHelpComing(true);
            toast.success('Emergency alert sent! (Location unavailable)', {
              duration: 5000,
              icon: '🚨'
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        // No geolocation support
        if (onEmergency) {
          onEmergency({ lat: 0, lng: 0 });
        }
        setIsLoading(false);
        setHelpComing(true);
        toast.success('Emergency alert sent!', {
          duration: 5000,
          icon: '🚨'
        });
      }
    } catch (error) {
      console.error('SOS Error:', error);
      setIsLoading(false);
      setIsActive(false);
      toast.error('Failed to send alert. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <button
        onClick={handleSOSClick}
        disabled={isActive}
        className={`
          relative w-56 h-56 rounded-full shadow-2xl transform transition-all duration-300
          ${isActive 
            ? helpComing 
              ? 'bg-success-green scale-95 shadow-green-400/50' 
              : 'bg-emergency-red animate-pulse scale-110 shadow-red-500/70'
            : 'bg-emergency-red hover:scale-105 hover:shadow-red-600/60 active:scale-95'
          }
          disabled:cursor-not-allowed
          focus:outline-none focus:ring-8 focus:ring-red-300
        `}
        aria-label="Emergency SOS Button"
      >
        <div className="flex flex-col items-center justify-center h-full">
          {isLoading ? (
            <Loader2 className="w-20 h-20 text-white animate-spin" />
          ) : helpComing ? (
            <>
              <CheckCircle className="w-20 h-20 text-white mb-2" />
              <span className="text-white text-2xl font-bold">Help is Coming!</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-20 h-20 text-white mb-2" />
              <span className="text-white text-3xl font-bold">SOS</span>
              <span className="text-white text-lg mt-1">Tap for Help</span>
            </>
          )}
        </div>

        {/* Ripple effect when active */}
        {isActive && !helpComing && (
          <>
            <span className="absolute inset-0 rounded-full bg-emergency-red animate-ping opacity-75"></span>
            <span className="absolute inset-0 rounded-full bg-emergency-red animate-ping opacity-50 animation-delay-200"></span>
          </>
        )}
      </button>

      {/* Status text */}
      <div className="mt-6 text-center">
        {helpComing ? (
          <div className="bg-green-100 text-success-green px-6 py-3 rounded-lg">
            <p className="text-xl font-semibold">Stay calm, {patientName}</p>
            <p className="text-lg">Your caregiver has been notified</p>
          </div>
        ) : (
          <p className="text-neutral-gray text-lg">
            Press the button above if you need immediate help
          </p>
        )}
      </div>
    </div>
  );
};

export default SOSButton;