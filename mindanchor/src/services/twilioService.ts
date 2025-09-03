// Using REST API approach for making calls
class TwilioService {
  private baseUrl = 'http://localhost:3001'; // Backend server URL
  private isInitialized = false;

  /**
   * Initialize service and check backend health
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if backend is running
      const response = await fetch(`${this.baseUrl}/api/health`);
      const data = await response.json();
      console.log('Backend status:', data);
      
      if (data.status === 'OK') {
        this.isInitialized = true;
        console.log('Twilio service initialized');
      } else {
        throw new Error('Backend not healthy');
      }
    } catch (error) {
      console.error('Failed to initialize Twilio service:', error);
      console.warn('Make sure the backend server is running: node server.js');
      throw error;
    }
  }

  /**
   * Make an outbound call using REST API
   */
  async makeCall(phoneNumber: string, callerName: string = 'Patient', message?: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Format phone number (ensure it starts with +)
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      console.log(`Making call to ${formattedNumber} for ${callerName}`);
      
      const customMessage = message || `This is an emergency alert from MindAnchor. ${callerName} needs immediate assistance.`;
      
      const response = await fetch(`${this.baseUrl}/api/twilio/make-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formattedNumber,
          message: customMessage
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Call initiated successfully:', data);
        return data;
      } else {
        throw new Error(data.error || 'Failed to make call');
      }
    } catch (error) {
      console.error('Failed to make call:', error);
      throw error;
    }
  }

  /**
   * Send SMS message
   */
  async sendSMS(phoneNumber: string, message: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      const response = await fetch(`${this.baseUrl}/api/twilio/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formattedNumber,
          body: message
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('SMS sent successfully:', data);
        return data;
      } else {
        throw new Error(data.error || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }

  /**
   * Check backend health
   */
  async checkHealth(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'ERROR', error: error.message };
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.isInitialized = false;
  }
}

// Export singleton instance
export const twilioService = new TwilioService();

// Demo function for testing without actual Twilio credentials
export const makeDemoCall = async (phoneNumber: string, callerName: string): Promise<void> => {
  console.log(`[DEMO MODE] Initiating call to ${phoneNumber}`);
  console.log(`[DEMO MODE] Caller: ${callerName}`);
  
  // Simulate call connection
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[DEMO MODE] Call to ${phoneNumber} connected`);
      
      // Show notification
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLWhjMGHm7A7+OZURE');
      audio.play().catch(() => {}); // Play a beep sound
      
      // Open phone dialer on mobile or show alert on desktop
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = `tel:${phoneNumber}`;
      } else {
        alert(`Calling ${phoneNumber}\n\nOn a real device, this would open your phone dialer.\n\nFor production use, you'll need to:\n1. Set up a Twilio account\n2. Create a backend API for token generation\n3. Configure your Twilio phone number`);
      }
      
      resolve();
    }, 1000);
  });
};