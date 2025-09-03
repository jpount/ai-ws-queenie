import { Device, Call } from '@twilio/voice-sdk';

class TwilioService {
  private device: Device | null = null;
  private currentCall: Call | null = null;
  private isInitialized = false;

  /**
   * Initialize Twilio Device with access token
   * In production, this token should be fetched from your backend
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // In production, fetch this token from your backend
      // The backend should generate it using Twilio API credentials
      const token = await this.getAccessToken();
      
      this.device = new Device(token, {
        logLevel: 1,
        edge: 'singapore', // Using Singapore edge for better connectivity in Asia
      });

      // Set up event listeners
      this.device.on('registered', () => {
        console.log('Twilio Device ready to make calls');
      });

      this.device.on('error', (error) => {
        console.error('Twilio Device error:', error);
      });

      this.device.on('incoming', (call) => {
        console.log('Incoming call from:', call.parameters.From);
        // Auto-answer for demo purposes
        call.accept();
        this.currentCall = call;
      });

      await this.device.register();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Twilio:', error);
      throw error;
    }
  }

  /**
   * Get access token from backend (mock for now)
   * In production, this should call your backend API
   */
  private async getAccessToken(): Promise<string> {
    // In production, replace with actual API call to your backend
    // Example:
    // const response = await fetch('/api/twilio/token');
    // const data = await response.json();
    // return data.token;

    // For demo purposes, returning a mock token
    // You'll need to implement a backend endpoint that generates this token
    console.warn('Using mock token - implement backend token generation for production');
    return 'mock-token-replace-with-real-implementation';
  }

  /**
   * Make an outbound call
   */
  async makeCall(phoneNumber: string, callerName: string = 'Patient'): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.device) {
      throw new Error('Twilio Device not initialized');
    }

    if (this.currentCall) {
      console.log('Ending current call');
      this.currentCall.disconnect();
    }

    try {
      // Format phone number (ensure it starts with +)
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      console.log(`Calling ${formattedNumber} as ${callerName}`);
      
      const call = await this.device.connect({
        params: {
          To: formattedNumber,
          CallerName: callerName,
        }
      });

      this.currentCall = call;

      // Set up call event handlers
      call.on('accept', () => {
        console.log('Call connected');
      });

      call.on('disconnect', () => {
        console.log('Call ended');
        this.currentCall = null;
      });

      call.on('error', (error) => {
        console.error('Call error:', error);
      });

    } catch (error) {
      console.error('Failed to make call:', error);
      throw error;
    }
  }

  /**
   * End the current call
   */
  endCall(): void {
    if (this.currentCall) {
      this.currentCall.disconnect();
      this.currentCall = null;
    }
  }

  /**
   * Check if a call is currently active
   */
  isCallActive(): boolean {
    return this.currentCall !== null && this.currentCall.status() === 'open';
  }

  /**
   * Get current call status
   */
  getCallStatus(): string {
    if (!this.currentCall) return 'idle';
    return this.currentCall.status();
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.endCall();
    if (this.device) {
      this.device.destroy();
      this.device = null;
    }
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