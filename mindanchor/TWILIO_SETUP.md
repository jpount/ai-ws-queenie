# Twilio Voice Calling Setup Guide

## Current Implementation
The app currently includes a **demo mode** for testing the calling functionality without Twilio credentials. When you click on a contact in the Patient Dashboard, it will:
- On mobile devices: Open the phone's native dialer with the number pre-filled
- On desktop: Show an alert with instructions

## Production Setup

To enable actual VoIP calling through the web browser, follow these steps:

### 1. Create a Twilio Account
1. Sign up at [https://www.twilio.com](https://www.twilio.com)
2. Verify your phone number
3. Get your free trial credits

### 2. Get Your Twilio Credentials
From your Twilio Console, you'll need:
- **Account SID**: Found on the dashboard
- **Auth Token**: Found on the dashboard  
- **Phone Number**: Buy a phone number from Twilio (even trial accounts get one free number)
- **API Key & Secret**: Create these in Settings > API Keys

### 3. Set Up Your Backend (Required for Production)

Create a backend endpoint that generates access tokens. Example using Node.js/Express:

```javascript
// backend/twilioToken.js
const twilio = require('twilio');

app.post('/api/twilio/token', (req, res) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;
  const outgoingApplicationSid = process.env.TWILIO_APP_SID;
  
  const identity = req.body.identity || 'patient';
  
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;
  
  const token = new AccessToken(
    accountSid,
    apiKey,
    apiSecret,
    { identity }
  );
  
  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid,
    incomingAllow: true
  });
  
  token.addGrant(voiceGrant);
  
  res.json({ token: token.toJwt() });
});
```

### 4. Create a TwiML App
1. In Twilio Console, go to Voice > TwiML > TwiML Apps
2. Create a new TwiML App
3. Set the Voice Request URL to your backend endpoint that handles outgoing calls

Example TwiML endpoint:
```javascript
app.post('/api/twilio/voice', (req, res) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();
  
  const dial = response.dial({
    callerId: process.env.TWILIO_PHONE_NUMBER
  });
  
  dial.number(req.body.To);
  
  res.type('text/xml');
  res.send(response.toString());
});
```

### 5. Update Environment Variables

Update the `.env` file with your real credentials:

```env
VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_PHONE_NUMBER=+1234567890
VITE_TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 6. Update the Twilio Service

Modify `src/services/twilioService.ts`:

```typescript
private async getAccessToken(): Promise<string> {
  const response = await fetch('/api/twilio/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'patient' })
  });
  const data = await response.json();
  return data.token;
}
```

## Important Security Notes

⚠️ **Never expose your Twilio Auth Token or API Secret in the frontend code!**

- The Auth Token and API Secret should only be used on your backend server
- The frontend should only receive temporary access tokens from your backend
- Use environment variables and keep them secure
- Add `.env` to your `.gitignore` file

## Costs

- Twilio charges per minute for voice calls
- Rates vary by country (Singapore: ~$0.018/min for outbound calls)
- Free trial includes $15 credit
- See [Twilio Pricing](https://www.twilio.com/voice/pricing/sg) for details

## Testing

1. Start your backend server with token generation endpoint
2. Update the `.env` file with your credentials
3. Click on a contact in the Patient Dashboard
4. The call should connect through your browser
5. You can speak through your computer's microphone

## Support

For issues with Twilio setup:
- [Twilio Docs](https://www.twilio.com/docs/voice/sdks/javascript)
- [Twilio Support](https://support.twilio.com)
- Check the browser console for detailed error messages