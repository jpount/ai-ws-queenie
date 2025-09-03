/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { Alert, User } from '../types';
import { useAlertService } from '../services/alertService';
import toast from 'react-hot-toast';

interface AlertContextType {
  // Active alerts
  alerts: Alert[];
  activeAlert: Alert | null;
  
  // Alert actions
  createAlert: (location: { lat: number; lng: number }, severity?: Alert['severity']) => Promise<string>;
  respondToAlert: (alertId: string, location?: { lat: number; lng: number }) => Promise<void>;
  updateResponderStatus: (alertId: string, status: 'acknowledged' | 'en_route' | 'arrived') => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  cancelAlert: (alertId: string) => Promise<void>;
  
  // Alert subscription
  subscribeToAlerts: (caregiverId: string, location?: { lat: number; lng: number }, assignedPatients?: string[]) => () => void;
  subscribeToAlert: (alertId: string) => () => void;
  
  // Alert history
  getAlertHistory: (patientId: string) => Promise<Alert[]>;
  
  // Loading states
  isCreatingAlert: boolean;
  isRespondingToAlert: boolean;
}

export const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: React.ReactNode;
  user: User | null;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children, user }) => {
  const alertService = useAlertService();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [isRespondingToAlert, setIsRespondingToAlert] = useState(false);

  // Create an alert (for patients)
  const createAlert = useCallback(async (
    location: { lat: number; lng: number },
    severity: Alert['severity'] = 'emergency'
  ): Promise<string> => {
    if (!user || user.userType !== 'patient') {
      throw new Error('Only patients can create alerts');
    }

    setIsCreatingAlert(true);
    try {
      const alertId = await alertService.createAlert(user.id, location, severity);
      
      // Subscribe to this alert for updates
      const unsubscribe = alertService.subscribeToAlert(alertId, (alert) => {
        if (alert) {
          setActiveAlert(alert);
        }
      });

      toast.success('Emergency alert sent! Help is on the way.', {
        duration: 6000,
        icon: '🚨'
      });

      return alertId;
    } catch (error) {
      toast.error('Failed to send alert. Please try again.');
      throw error;
    } finally {
      setIsCreatingAlert(false);
    }
  }, [user, alertService]);

  // Respond to an alert (for caregivers)
  const respondToAlert = useCallback(async (
    alertId: string,
    location?: { lat: number; lng: number }
  ): Promise<void> => {
    if (!user || user.userType !== 'caregiver') {
      throw new Error('Only caregivers can respond to alerts');
    }

    setIsRespondingToAlert(true);
    try {
      await alertService.respondToAlert(alertId, user.id, location);
      toast.success('Response acknowledged. Patient has been notified.', {
        icon: '✅'
      });
    } catch (error) {
      toast.error('Failed to respond to alert.');
      throw error;
    } finally {
      setIsRespondingToAlert(false);
    }
  }, [user, alertService]);

  // Update responder status
  const updateResponderStatus = useCallback(async (
    alertId: string,
    status: 'acknowledged' | 'en_route' | 'arrived'
  ): Promise<void> => {
    if (!user || user.userType !== 'caregiver') {
      throw new Error('Only caregivers can update response status');
    }

    try {
      await alertService.updateResponderStatus(alertId, user.id, status);
      
      const statusMessages = {
        acknowledged: 'Status: Acknowledged',
        en_route: 'Status: On the way',
        arrived: 'Status: Arrived at location'
      };
      
      toast.success(statusMessages[status], {
        icon: status === 'arrived' ? '🏁' : '🚗'
      });
    } catch (error) {
      toast.error('Failed to update status.');
      throw error;
    }
  }, [user, alertService]);

  // Resolve an alert
  const resolveAlert = useCallback(async (alertId: string): Promise<void> => {
    try {
      await alertService.resolveAlert(alertId);
      setActiveAlert(null);
      toast.success('Alert resolved successfully.', {
        icon: '✅'
      });
    } catch (error) {
      toast.error('Failed to resolve alert.');
      throw error;
    }
  }, [alertService]);

  // Cancel an alert
  const cancelAlert = useCallback(async (alertId: string): Promise<void> => {
    try {
      await alertService.cancelAlert(alertId);
      setActiveAlert(null);
      toast.success('Alert cancelled.', {
        icon: '❌'
      });
    } catch (error) {
      toast.error('Failed to cancel alert.');
      throw error;
    }
  }, [alertService]);

  // Subscribe to alerts (for caregivers)
  const subscribeToAlerts = useCallback((
    caregiverId: string,
    location?: { lat: number; lng: number },
    assignedPatients: string[] = []
  ): (() => void) => {
    return alertService.subscribeToAlerts(
      caregiverId,
      location,
      assignedPatients,
      (newAlerts) => {
        setAlerts(newAlerts);
        
        // Show toast for new alerts
        const newAlert = newAlerts.find(a => 
          a.status === 'active' && 
          !alerts.some(existing => existing.id === a.id)
        );
        
        if (newAlert) {
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      🚨 Emergency Alert
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {newAlert.patientName} needs immediate assistance!
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {newAlert.distanceMiles?.toFixed(1) || '0'} miles away
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  View
                </button>
              </div>
            </div>
          ), {
            duration: 10000
          });
        }
      }
    );
  }, [alertService, alerts]);

  // Subscribe to a specific alert
  const subscribeToAlert = useCallback((alertId: string): (() => void) => {
    return alertService.subscribeToAlert(alertId, (alert) => {
      if (alert) {
        setActiveAlert(alert);
        
        // Notify patient when caregiver responds
        if (user?.userType === 'patient' && alert.responders.length > 0) {
          const latestResponder = alert.responders[alert.responders.length - 1];
          if (latestResponder.status === 'acknowledged') {
            toast.success(
              `${latestResponder.caregiverName} is responding! ETA: ${latestResponder.etaMinutes} minutes`,
              {
                duration: 8000,
                icon: '🚑'
              }
            );
          }
        }
      } else {
        setActiveAlert(null);
      }
    });
  }, [alertService, user]);

  // Get alert history
  const getAlertHistory = useCallback(async (patientId: string): Promise<Alert[]> => {
    return alertService.getPatientAlertHistory(patientId);
  }, [alertService]);

  // Auto-subscribe caregivers to alerts
  useEffect(() => {
    if (user?.userType === 'caregiver') {
      const unsubscribe = subscribeToAlerts(
        user.id,
        user.location,
        user.assignedPatients
      );
      return unsubscribe;
    } else if (!user) {
      // Clear alerts when user logs out
      setAlerts([]);
      setActiveAlert(null);
    }
  }, [user, subscribeToAlerts]);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        activeAlert,
        createAlert,
        respondToAlert,
        updateResponderStatus,
        resolveAlert,
        cancelAlert,
        subscribeToAlerts,
        subscribeToAlert,
        getAlertHistory,
        isCreatingAlert,
        isRespondingToAlert
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};