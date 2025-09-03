import React, { useState, useEffect } from 'react';
import { Bell, Filter, RefreshCw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import AlertCard from './AlertCard';
import type { Alert } from '../../types';
import toast from 'react-hot-toast';

interface AlertsDashboardProps {
  caregiverId: string;
  caregiverName: string;
  assignedPatients?: string[];
}

const AlertsDashboard: React.FC<AlertsDashboardProps> = ({
  caregiverId,
  caregiverName,
  assignedPatients = []
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'responded' | 'resolved'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate receiving alerts (in production, this would be Firebase real-time)
  useEffect(() => {
    // Demo alerts
    const demoAlerts: Alert[] = [
      {
        id: 'alert-001',
        patientId: 'p1',
        patientName: 'John Smith',
        location: { lat: 37.7749, lng: -122.4194 },
        timestamp: new Date(Date.now() - 2 * 60000), // 2 minutes ago
        status: 'active',
        severity: 'emergency',
        responders: []
      },
      {
        id: 'alert-002',
        patientId: 'p2',
        patientName: 'Mary Johnson',
        location: { lat: 37.7849, lng: -122.4094 },
        timestamp: new Date(Date.now() - 15 * 60000), // 15 minutes ago
        status: 'responded',
        severity: 'urgent',
        responders: [{
          caregiverId: 'c2',
          caregiverName: 'Tom Wilson',
          responseTime: new Date(Date.now() - 10 * 60000),
          etaMinutes: 8,
          distanceMiles: 3.2,
          status: 'en_route'
        }]
      },
      {
        id: 'alert-003',
        patientId: 'p3',
        patientName: 'Robert Davis',
        location: { lat: 0, lng: 0 }, // Location unavailable
        timestamp: new Date(Date.now() - 60 * 60000), // 1 hour ago
        status: 'resolved',
        severity: 'routine',
        responders: [{
          caregiverId: caregiverId,
          caregiverName: caregiverName,
          responseTime: new Date(Date.now() - 55 * 60000),
          etaMinutes: 15,
          distanceMiles: 5.1,
          status: 'arrived'
        }]
      }
    ];

    setAlerts(demoAlerts);

    // Simulate new alert arriving after 5 seconds
    const timer = setTimeout(() => {
      const newAlert: Alert = {
        id: `alert-${Date.now()}`,
        patientId: 'p4',
        patientName: 'Emma Wilson',
        location: { lat: 37.7649, lng: -122.4294 },
        timestamp: new Date(),
        status: 'active',
        severity: 'emergency',
        responders: []
      };

      setAlerts(prev => [newAlert, ...prev]);
      toast.error('🚨 New Emergency Alert!', {
        duration: 5000,
        style: {
          background: '#ff0000',
          color: '#fff',
        }
      });

      // Play alert sound (in production)
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF');
      audio.play().catch(() => {});
    }, 5000);

    return () => clearTimeout(timer);
  }, [caregiverId, caregiverName]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // In production, fetch latest alerts
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRespond = async (alertId: string, responseData: any) => {
    setAlerts(prev => prev.map(alert => {
      if (alert.id === alertId) {
        return {
          ...alert,
          status: 'responded' as const,
          responders: [...alert.responders, responseData]
        };
      }
      return alert;
    }));
  };

  const handleResolve = (alertId: string) => {
    setAlerts(prev => prev.map(alert => {
      if (alert.id === alertId) {
        return {
          ...alert,
          status: 'resolved' as const
        };
      }
      return alert;
    }));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setLastUpdate(new Date());
    
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Dashboard refreshed');
    }, 1000);
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'active') return alert.status === 'active';
    if (filter === 'responded') return alert.status === 'responded';
    if (filter === 'resolved') return alert.status === 'resolved';
    return true;
  });

  const getFilteredCount = (status: typeof filter) => {
    if (status === 'all') return alerts.length;
    if (status === 'active') return alerts.filter(a => a.status === 'active').length;
    if (status === 'responded') return alerts.filter(a => a.status === 'responded').length;
    if (status === 'resolved') return alerts.filter(a => a.status === 'resolved').length;
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <Bell className="w-8 h-8 text-anchor-gold" />
            <div>
              <h1 className="text-2xl font-bold text-deep-navy">Alert Dashboard</h1>
              <p className="text-neutral-gray">
                Monitoring {assignedPatients.length || 3} patients
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-lg bg-mind-blue text-white hover:bg-blue-600 transition-all ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              disabled={isRefreshing}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            <div className="text-right">
              <p className="text-xs text-neutral-gray">Last updated</p>
              <p className="text-sm font-medium text-deep-navy">
                {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-red-50 rounded-lg p-3 border border-emergency-red">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-6 h-6 text-emergency-red" />
              <span className="text-2xl font-bold text-emergency-red">
                {alerts.filter(a => a.status === 'active' && a.severity === 'emergency').length}
              </span>
            </div>
            <p className="text-sm text-neutral-gray mt-1">Emergency</p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-3 border border-warning-yellow">
            <div className="flex items-center justify-between">
              <Clock className="w-6 h-6 text-warning-yellow" />
              <span className="text-2xl font-bold text-warning-yellow">
                {alerts.filter(a => a.status === 'active').length}
              </span>
            </div>
            <p className="text-sm text-neutral-gray mt-1">Active</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3 border border-mind-blue">
            <div className="flex items-center justify-between">
              <Bell className="w-6 h-6 text-mind-blue" />
              <span className="text-2xl font-bold text-mind-blue">
                {alerts.filter(a => a.status === 'responded').length}
              </span>
            </div>
            <p className="text-sm text-neutral-gray mt-1">Responded</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 border border-success-green">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="w-6 h-6 text-success-green" />
              <span className="text-2xl font-bold text-success-green">
                {alerts.filter(a => a.status === 'resolved').length}
              </span>
            </div>
            <p className="text-sm text-neutral-gray mt-1">Resolved</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md p-2 mb-6">
        <div className="flex space-x-2">
          {(['all', 'active', 'responded', 'resolved'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-mind-blue text-white'
                  : 'bg-gray-100 text-neutral-gray hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Filter className="w-4 h-4" />
                <span className="capitalize">{status}</span>
                <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                  {getFilteredCount(status)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              caregiverId={caregiverId}
              caregiverName={caregiverName}
              onRespond={handleRespond}
              onResolve={handleResolve}
            />
          ))
        ) : (
          <div className="col-span-full bg-white rounded-xl shadow-md p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-success-green mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-deep-navy mb-2">
              No {filter !== 'all' ? filter : ''} alerts
            </h3>
            <p className="text-neutral-gray">
              {filter === 'all' 
                ? 'All patients are safe. You will be notified of any emergencies.'
                : `No ${filter} alerts at this time.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsDashboard;