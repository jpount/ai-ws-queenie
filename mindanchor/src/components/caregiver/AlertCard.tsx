import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, Navigation, CheckCircle, AlertCircle, User } from 'lucide-react';
import type { Alert } from '../../types';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface AlertCardProps {
  alert: Alert;
  caregiverId: string;
  caregiverName: string;
  onRespond: (alertId: string, responseData: any) => void;
  onResolve: (alertId: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ 
  alert, 
  caregiverId, 
  caregiverName,
  onRespond, 
  onResolve 
}) => {
  const [isResponding, setIsResponding] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState(10);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Check if this caregiver has already responded
    const myResponse = alert.responders.find(r => r.caregiverId === caregiverId);
    if (myResponse) {
      setHasResponded(true);
    }

    // Stop animation after 5 seconds to reduce CPU usage
    const timer = setTimeout(() => setIsAnimating(false), 5000);
    return () => clearTimeout(timer);
  }, [alert.responders, caregiverId]);

  const handleRespond = async () => {
    setIsResponding(true);
    
    try {
      const responseData = {
        caregiverId,
        caregiverName,
        responseTime: new Date(),
        etaMinutes,
        distanceMiles: 2.5, // In production, calculate from actual location
        status: 'acknowledged' as const
      };

      await onRespond(alert.id, responseData);
      setHasResponded(true);
      toast.success(`Response sent! ETA: ${etaMinutes} minutes`, {
        icon: '🚗',
        duration: 4000
      });
    } catch (error) {
      toast.error('Failed to send response. Please try again.');
    } finally {
      setIsResponding(false);
    }
  };

  const handleResolve = () => {
    onResolve(alert.id);
    toast.success('Alert marked as resolved', {
      icon: '✅'
    });
  };

  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'emergency':
        return 'border-emergency-red bg-red-50';
      case 'urgent':
        return 'border-warning-yellow bg-yellow-50';
      case 'routine':
        return 'border-mind-blue bg-blue-50';
      default:
        return 'border-neutral-gray bg-gray-50';
    }
  };

  const getSeverityBadge = () => {
    switch (alert.severity) {
      case 'emergency':
        return 'bg-emergency-red text-white';
      case 'urgent':
        return 'bg-warning-yellow text-black';
      case 'routine':
        return 'bg-mind-blue text-white';
      default:
        return 'bg-neutral-gray text-white';
    }
  };

  const getStatusIcon = () => {
    if (alert.status === 'resolved') {
      return <CheckCircle className="w-6 h-6 text-success-green" />;
    }
    if (hasResponded) {
      return <Navigation className="w-6 h-6 text-mind-blue" />;
    }
    return <AlertCircle className="w-6 h-6 text-emergency-red animate-pulse" />;
  };

  return (
    <div className={`border-2 rounded-xl p-6 shadow-lg transition-all duration-300 ${getSeverityColor()} ${
      alert.status === 'active' && isAnimating ? 'animate-pulse' : ''
    }`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-xl font-bold text-deep-navy flex items-center gap-2">
              <User className="w-5 h-5" />
              {alert.patientName}
            </h3>
            <p className="text-sm text-neutral-gray mt-1">
              {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${getSeverityBadge()}`}>
          {alert.severity}
        </span>
      </div>

      {/* Location Info */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-neutral-gray">
            <MapPin className="w-5 h-5 mr-2 text-anchor-gold" />
            <span className="font-medium">Location</span>
          </div>
          <button 
            className="text-mind-blue hover:text-blue-700 underline text-sm"
            onClick={() => {
              // In production, open maps app
              window.open(`https://maps.google.com/?q=${alert.location.lat},${alert.location.lng}`, '_blank');
            }}
          >
            View on Map
          </button>
        </div>
        
        {alert.location.lat !== 0 ? (
          <p className="text-sm text-deep-navy">
            GPS: {alert.location.lat.toFixed(6)}, {alert.location.lng.toFixed(6)}
          </p>
        ) : (
          <p className="text-sm text-warning-yellow italic">
            Location unavailable - patient may be indoors
          </p>
        )}
      </div>

      {/* Responders */}
      {alert.responders.length > 0 && (
        <div className="bg-white rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-deep-navy mb-2">Responders ({alert.responders.length})</h4>
          <div className="space-y-2">
            {alert.responders.map((responder, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-neutral-gray">
                  {responder.caregiverName}
                </span>
                <span className="text-mind-blue font-medium">
                  ETA: {responder.etaMinutes} min
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!hasResponded && alert.status === 'active' && (
          <>
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-gray mb-1">
                ETA (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={etaMinutes}
                onChange={(e) => setEtaMinutes(parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                disabled={isResponding}
              />
              <button
                onClick={handleRespond}
                disabled={isResponding}
                className="w-full bg-success-green text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isResponding ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Responding...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    I'm Responding
                  </>
                )}
              </button>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-gray mb-1">
                Quick Contact
              </label>
              <button className="w-full bg-mind-blue text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center mb-2">
                <Phone className="w-5 h-5 mr-2" />
                Call Patient
              </button>
              <button className="w-full bg-anchor-gold text-white px-4 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                Call 911
              </button>
            </div>
          </>
        )}

        {hasResponded && alert.status !== 'resolved' && (
          <div className="flex-1 space-y-3">
            <div className="bg-green-100 text-success-green p-3 rounded-lg text-center font-medium">
              ✓ You are responding - ETA: {etaMinutes} minutes
            </div>
            <button
              onClick={handleResolve}
              className="w-full bg-neutral-gray text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Mark as Resolved
            </button>
          </div>
        )}

        {alert.status === 'resolved' && (
          <div className="flex-1 bg-gray-100 text-neutral-gray p-4 rounded-lg text-center">
            <CheckCircle className="w-8 h-8 text-success-green mx-auto mb-2" />
            <p className="font-semibold">Alert Resolved</p>
            <p className="text-sm mt-1">
              {format(new Date(alert.timestamp), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        )}
      </div>

      {/* Alert Time */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-neutral-gray">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          <span>Alert Time: {format(new Date(alert.timestamp), 'h:mm a')}</span>
        </div>
        <span className="font-medium">
          Alert ID: {alert.id.slice(-6)}
        </span>
      </div>
    </div>
  );
};

export default AlertCard;