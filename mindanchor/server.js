import express from 'express';
import cors from 'cors';
import twilio from 'twilio';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Twilio configuration
const accountSid = process.env.VITE_TWILIO_ACCOUNT_SID;
const authToken = process.env.VITE_TWILIO_AUTH_TOKEN;
const apiKey = process.env.VITE_TWILIO_API_KEY;
const apiSecret = process.env.VITE_TWILIO_API_SECRET;
const twilioPhoneNumber = process.env.VITE_TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const twilioClient = twilio(accountSid, authToken);
const { AccessToken } = twilio.jwt;
const { VoiceGrant } = AccessToken;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Generate Access Token for Voice SDK
app.post('/api/twilio/token', (req, res) => {
  try {
    const identity = req.body.identity || 'patient_' + Date.now();
    
    // Create access token with credentials
    const token = new AccessToken(
      accountSid,
      apiKey,
      apiSecret,
      { 
        identity: identity,
        ttl: 3600 // 1 hour
      }
    );

    // Create Voice grant
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: 'AP' + '0'.repeat(30), // Placeholder for TwiML app SID
      incomingAllow: false // We only need outgoing calls
    });

    // Add grant to token
    token.addGrant(voiceGrant);

    res.json({ 
      token: token.toJwt(),
      identity: identity 
    });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// TwiML endpoint for handling outgoing calls
app.post('/api/twilio/voice', (req, res) => {
  const { To } = req.body;
  
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();
  
  // Create a dial verb
  const dial = response.dial({
    callerId: twilioPhoneNumber,
    timeout: 30
  });
  
  // Dial the number
  dial.number(To);
  
  res.type('text/xml');
  res.send(response.toString());
});

// Make a call using REST API (alternative method)
app.post('/api/twilio/make-call', async (req, res) => {
  try {
    const { to, message = 'This is an emergency alert from MindAnchor. A patient needs assistance.' } = req.body;
    
    // Format the phone number
    const formattedTo = to.startsWith('+') ? to : `+${to}`;
    
    console.log(`Making call from ${twilioPhoneNumber} to ${formattedTo}`);
    
    // Create TwiML for the call
    const twiml = `
      <Response>
        <Say voice="alice" language="en-US">${message}</Say>
        <Pause length="2"/>
        <Say voice="alice" language="en-US">Press 1 to acknowledge this alert. Press 2 to call back.</Say>
        <Gather numDigits="1" action="${process.env.VITE_APP_URL || 'http://localhost:3001'}/api/twilio/gather" method="POST">
          <Say>Please press 1 or 2.</Say>
        </Gather>
        <Say>We didn't receive any input. Goodbye!</Say>
      </Response>
    `;
    
    // Make the call
    const call = await twilioClient.calls.create({
      to: formattedTo,
      from: twilioPhoneNumber,
      twiml: twiml,
      statusCallback: `${process.env.VITE_APP_URL || 'http://localhost:3001'}/api/twilio/status`,
      statusCallbackMethod: 'POST',
      statusCallbackEvent: ['initiated', 'answered', 'completed']
    });
    
    res.json({ 
      success: true,
      callSid: call.sid,
      status: call.status,
      to: call.to,
      from: call.from
    });
  } catch (error) {
    console.error('Error making call:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error 
    });
  }
});

// Handle gather input from call
app.post('/api/twilio/gather', (req, res) => {
  const { Digits } = req.body;
  
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();
  
  if (Digits === '1') {
    response.say('Thank you for acknowledging. Help is on the way.');
  } else if (Digits === '2') {
    response.say('Connecting you now.');
    response.dial(twilioPhoneNumber); // Or connect to a specific number
  } else {
    response.say('Invalid input.');
    response.redirect('/api/twilio/voice');
  }
  
  res.type('text/xml');
  res.send(response.toString());
});

// Call status webhook
app.post('/api/twilio/status', (req, res) => {
  const { CallSid, CallStatus, To, From } = req.body;
  console.log(`Call ${CallSid} to ${To} is ${CallStatus}`);
  res.sendStatus(200);
});

// Send SMS (bonus feature)
app.post('/api/twilio/send-sms', async (req, res) => {
  try {
    const { to, body } = req.body;
    
    const message = await twilioClient.messages.create({
      body: body,
      from: twilioPhoneNumber,
      to: to.startsWith('+') ? to : `+${to}`
    });
    
    res.json({ 
      success: true,
      messageSid: message.sid,
      status: message.status 
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    twilio: {
      accountSid: accountSid ? accountSid.substring(0, 10) + '...' : 'Not configured',
      phoneNumber: twilioPhoneNumber || 'Not configured'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Twilio Account SID: ${accountSid ? accountSid.substring(0, 10) + '...' : 'Not configured'}`);
  console.log(`Twilio Phone Number: ${twilioPhoneNumber || 'Not configured'}`);
});