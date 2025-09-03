import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { Alert, User } from '../types';

// Calculate distance between two coordinates in miles
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate ETA based on distance (rough estimate)
export const calculateETA = (distanceMiles: number): number => {
  // Assume average speed of 30 mph in emergency response
  return Math.ceil((distanceMiles / 30) * 60); // Returns minutes
};

class AlertService {
  // Create a new emergency alert
  async createAlert(patientId: string, location: { lat: number; lng: number }, severity: Alert['severity'] = 'emergency'): Promise<string> {
    try {
      // Get patient information
      const patientDoc = await getDoc(doc(db, 'users', patientId));
      if (!patientDoc.exists()) {
        throw new Error('Patient not found');
      }
      
      const patient = patientDoc.data() as User;
      
      const alertData = {
        patientId,
        patientName: patient.name,
        location,
        timestamp: serverTimestamp(),
        status: 'active' as Alert['status'],
        severity,
        responders: []
      };

      const docRef = await addDoc(collection(db, 'alerts'), alertData);
      
      // Notify nearby caregivers
      await this.notifyNearbyCaregivers(docRef.id, location, patientId);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  // Notify caregivers within radius or assigned to patient
  private async notifyNearbyCaregivers(alertId: string, patientLocation: { lat: number; lng: number }, patientId: string) {
    try {
      // Get all caregivers
      const caregiversQuery = query(
        collection(db, 'users'),
        where('userType', '==', 'caregiver')
      );
      
      const snapshot = await getDocs(caregiversQuery);
      const notificationBatch = writeBatch(db);
      
      snapshot.forEach((doc) => {
        const caregiver = doc.data() as User;
        
        // Check if caregiver is assigned to this patient or within 1 mile
        const isAssigned = caregiver.assignedPatients?.includes(patientId);
        let isNearby = false;
        
        if (caregiver.location) {
          const distance = calculateDistance(
            patientLocation.lat,
            patientLocation.lng,
            caregiver.location.lat,
            caregiver.location.lng
          );
          isNearby = distance <= 1; // Within 1 mile
        }
        
        if (isAssigned || isNearby) {
          // Create notification for this caregiver
          const notificationRef = doc(collection(db, 'notifications'));
          notificationBatch.set(notificationRef, {
            caregiverId: doc.id,
            alertId,
            type: 'emergency_alert',
            status: 'unread',
            timestamp: serverTimestamp()
          });
        }
      });
      
      await notificationBatch.commit();
    } catch (error) {
      console.error('Error notifying caregivers:', error);
    }
  }

  // Subscribe to alerts for a caregiver
  subscribeToAlerts(
    caregiverId: string,
    caregiverLocation: { lat: number; lng: number } | undefined,
    assignedPatients: string[] = [],
    callback: (alerts: Alert[]) => void
  ): () => void {
    // Query for active alerts
    const alertsQuery = query(
      collection(db, 'alerts'),
      where('status', 'in', ['active', 'responded']),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(alertsQuery, (snapshot) => {
      const alerts: Alert[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const alert: Alert = {
          id: doc.id,
          patientId: data.patientId,
          patientName: data.patientName,
          location: data.location,
          timestamp: data.timestamp?.toDate() || new Date(),
          status: data.status,
          severity: data.severity,
          responders: data.responders || []
        };

        // Filter alerts based on assignment or proximity
        const isAssigned = assignedPatients.includes(alert.patientId);
        let isNearby = false;
        
        if (caregiverLocation) {
          const distance = calculateDistance(
            alert.location.lat,
            alert.location.lng,
            caregiverLocation.lat,
            caregiverLocation.lng
          );
          isNearby = distance <= 1; // Within 1 mile
        }
        
        if (isAssigned || isNearby) {
          alerts.push(alert);
        }
      });
      
      callback(alerts);
    });
  }

  // Subscribe to a specific alert for real-time updates
  subscribeToAlert(alertId: string, callback: (alert: Alert | null) => void): () => void {
    const alertRef = doc(db, 'alerts', alertId);
    
    return onSnapshot(alertRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const alert: Alert = {
          id: doc.id,
          patientId: data.patientId,
          patientName: data.patientName,
          location: data.location,
          timestamp: data.timestamp?.toDate() || new Date(),
          status: data.status,
          severity: data.severity,
          responders: data.responders || []
        };
        callback(alert);
      } else {
        callback(null);
      }
    });
  }

  // Respond to an alert
  async respondToAlert(
    alertId: string,
    caregiverId: string,
    caregiverLocation?: { lat: number; lng: number }
  ): Promise<void> {
    try {
      const alertRef = doc(db, 'alerts', alertId);
      const alertDoc = await getDoc(alertRef);
      
      if (!alertDoc.exists()) {
        throw new Error('Alert not found');
      }
      
      const alert = alertDoc.data();
      const caregiverDoc = await getDoc(doc(db, 'users', caregiverId));
      
      if (!caregiverDoc.exists()) {
        throw new Error('Caregiver not found');
      }
      
      const caregiver = caregiverDoc.data() as User;
      
      // Calculate distance and ETA if location is available
      let distanceMiles = 0;
      let etaMinutes = 0;
      
      if (caregiverLocation && alert.location) {
        distanceMiles = calculateDistance(
          alert.location.lat,
          alert.location.lng,
          caregiverLocation.lat,
          caregiverLocation.lng
        );
        etaMinutes = calculateETA(distanceMiles);
      }
      
      // Add responder to alert
      const responder = {
        caregiverId,
        caregiverName: caregiver.name,
        responseTime: new Date(),
        etaMinutes,
        distanceMiles,
        status: 'acknowledged' as const
      };
      
      const updatedResponders = [...(alert.responders || []), responder];
      
      await updateDoc(alertRef, {
        responders: updatedResponders,
        status: 'responded'
      });
    } catch (error) {
      console.error('Error responding to alert:', error);
      throw error;
    }
  }

  // Update responder status
  async updateResponderStatus(
    alertId: string,
    caregiverId: string,
    status: 'acknowledged' | 'en_route' | 'arrived'
  ): Promise<void> {
    try {
      const alertRef = doc(db, 'alerts', alertId);
      const alertDoc = await getDoc(alertRef);
      
      if (!alertDoc.exists()) {
        throw new Error('Alert not found');
      }
      
      const alert = alertDoc.data();
      const updatedResponders = alert.responders.map((r: Alert['responders'][0]) => 
        r.caregiverId === caregiverId ? { ...r, status } : r
      );
      
      await updateDoc(alertRef, {
        responders: updatedResponders
      });
    } catch (error) {
      console.error('Error updating responder status:', error);
      throw error;
    }
  }

  // Resolve an alert
  async resolveAlert(alertId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'alerts', alertId), {
        status: 'resolved',
        resolvedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  // Cancel an alert
  async cancelAlert(alertId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'alerts', alertId), {
        status: 'cancelled',
        cancelledAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error cancelling alert:', error);
      throw error;
    }
  }

  // Get alert history for a patient
  async getPatientAlertHistory(patientId: string): Promise<Alert[]> {
    try {
      const alertsQuery = query(
        collection(db, 'alerts'),
        where('patientId', '==', patientId),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(alertsQuery);
      const alerts: Alert[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        alerts.push({
          id: doc.id,
          patientId: data.patientId,
          patientName: data.patientName,
          location: data.location,
          timestamp: data.timestamp?.toDate() || new Date(),
          status: data.status,
          severity: data.severity,
          responders: data.responders || []
        });
      });
      
      return alerts;
    } catch (error) {
      console.error('Error getting patient alert history:', error);
      return [];
    }
  }
}

// Create singleton instance
export const alertService = new AlertService();

// Demo mode alert service for development
export const demoAlertService = {
  alerts: new Map<string, Alert>(),
  listeners: new Map<string, Set<(alerts: Alert[]) => void>>(),
  alertListeners: new Map<string, Set<(alert: Alert | null) => void>>(),

  async createAlert(patientId: string, location: { lat: number; lng: number }, severity: Alert['severity'] = 'emergency'): Promise<string> {
    const alertId = `alert-${Date.now()}`;
    const alert: Alert = {
      id: alertId,
      patientId,
      patientName: 'Demo Patient',
      location,
      timestamp: new Date(),
      status: 'active',
      severity,
      responders: []
    };
    
    this.alerts.set(alertId, alert);
    this.notifyListeners();
    this.notifyAlertListeners(alertId);
    
    // Simulate notification
    setTimeout(() => {
      console.log('Demo: Alert created and caregivers notified');
    }, 100);
    
    return alertId;
  },

  subscribeToAlerts(
    caregiverId: string,
    caregiverLocation: { lat: number; lng: number } | undefined,
    assignedPatients: string[] = [],
    callback: (alerts: Alert[]) => void
  ): () => void {
    if (!this.listeners.has(caregiverId)) {
      this.listeners.set(caregiverId, new Set());
    }
    this.listeners.get(caregiverId)!.add(callback);
    
    // Send initial alerts
    callback(Array.from(this.alerts.values()).filter(a => 
      a.status === 'active' || a.status === 'responded'
    ));
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(caregiverId)?.delete(callback);
    };
  },

  subscribeToAlert(alertId: string, callback: (alert: Alert | null) => void): () => void {
    if (!this.alertListeners.has(alertId)) {
      this.alertListeners.set(alertId, new Set());
    }
    this.alertListeners.get(alertId)!.add(callback);
    
    // Send initial alert
    callback(this.alerts.get(alertId) || null);
    
    // Return unsubscribe function
    return () => {
      this.alertListeners.get(alertId)?.delete(callback);
    };
  },

  async respondToAlert(alertId: string, caregiverId: string, _caregiverLocation?: { lat: number; lng: number }): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (!alert) throw new Error('Alert not found');
    
    const responder = {
      caregiverId,
      caregiverName: 'Demo Caregiver',
      responseTime: new Date(),
      etaMinutes: 5,
      distanceMiles: 0.3,
      status: 'acknowledged' as const
    };
    
    alert.responders.push(responder);
    alert.status = 'responded';
    
    this.notifyListeners();
    this.notifyAlertListeners(alertId);
  },

  async updateResponderStatus(alertId: string, caregiverId: string, status: 'acknowledged' | 'en_route' | 'arrived'): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (!alert) throw new Error('Alert not found');
    
    const responder = alert.responders.find(r => r.caregiverId === caregiverId);
    if (responder) {
      responder.status = status;
      this.notifyListeners();
      this.notifyAlertListeners(alertId);
    }
  },

  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = 'resolved';
      this.notifyListeners();
      this.notifyAlertListeners(alertId);
    }
  },

  async cancelAlert(alertId: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = 'cancelled';
      this.notifyListeners();
      this.notifyAlertListeners(alertId);
    }
  },

  async getPatientAlertHistory(patientId: string): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(a => a.patientId === patientId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  notifyListeners() {
    const allAlerts = Array.from(this.alerts.values()).filter(a => 
      a.status === 'active' || a.status === 'responded'
    );
    
    this.listeners.forEach(callbacks => {
      callbacks.forEach(callback => callback(allAlerts));
    });
  },

  notifyAlertListeners(alertId: string) {
    const alert = this.alerts.get(alertId) || null;
    const listeners = this.alertListeners.get(alertId);
    
    if (listeners) {
      listeners.forEach(callback => callback(alert));
    }
  }
};

// Export the service to use (demo mode for now)
export const useAlertService = () => demoAlertService;