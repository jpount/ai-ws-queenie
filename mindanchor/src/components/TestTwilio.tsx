import React, { useState } from 'react';
import { twilioService } from '../services/twilioService';
import toast from 'react-hot-toast';

export default function TestTwilio() {
  const [phoneNumber, setPhoneNumber] = useState('+6591829532');
  const [message, setMessage] = useState('This is a test emergency alert from MindAnchor.');
  const [isLoading, setIsLoading] = useState(false);
  const [callResult, setCallResult] = useState<any>(null);
  const [smsBody, setSmsBody] = useState('Emergency: Patient needs assistance at location.');
  
  const testCall = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }
    
    setIsLoading(true);
    try {
      await twilioService.initialize();
      const result = await twilioService.makeCall(phoneNumber, 'Test Patient', message);
      setCallResult(result);
      toast.success('Call initiated successfully!');
    } catch (error: any) {
      console.error('Call failed:', error);
      toast.error(`Call failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const testSMS = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }
    
    setIsLoading(true);
    try {
      await twilioService.initialize();
      const result = await twilioService.sendSMS(phoneNumber, smsBody);
      toast.success('SMS sent successfully!');
      console.log('SMS result:', result);
    } catch (error: any) {
      console.error('SMS failed:', error);
      toast.error(`SMS failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const health = await twilioService.checkHealth();
      console.log('Health check:', health);
      if (health.status === 'OK') {
        toast.success('Backend is healthy!');
      } else {
        toast.error('Backend is not responding');
      }
    } catch (error: any) {
      toast.error('Cannot connect to backend. Make sure server.js is running.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-deep-navy">Twilio Test Interface</h1>
      
      <div className="mb-6 p-4 bg-warning-yellow/20 rounded-lg">
        <p className="text-sm font-semibold mb-2">Prerequisites:</p>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Make sure the backend server is running: <code className="bg-gray-200 px-1 rounded">node server.js</code></li>
          <li>Ensure .env file has valid Twilio credentials</li>
          <li>Phone number should include country code (e.g., +6591829532)</li>
        </ol>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (with country code)
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+6591829532"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mind-blue"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Call Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mind-blue"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SMS Message
          </label>
          <textarea
            value={smsBody}
            onChange={(e) => setSmsBody(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mind-blue"
          />
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={checkHealth}
            disabled={isLoading}
            className="px-4 py-2 bg-neutral-gray text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Checking...' : 'Check Backend Health'}
          </button>
          
          <button
            onClick={testCall}
            disabled={isLoading}
            className="px-4 py-2 bg-emergency-red text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Calling...' : 'Test Call'}
          </button>
          
          <button
            onClick={testSMS}
            disabled={isLoading}
            className="px-4 py-2 bg-mind-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Test SMS'}
          </button>
        </div>
      </div>
      
      {callResult && (
        <div className="mt-6 p-4 bg-success-green/10 rounded-lg">
          <h3 className="font-semibold mb-2">Call Result:</h3>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(callResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}