// Audio utility functions for emergency alerts and notifications

export const AudioPatterns = {
  EMERGENCY: 'emergency',
  SUCCESS: 'success', 
  WARNING: 'warning',
  NOTIFICATION: 'notification'
} as const;

type AudioPattern = typeof AudioPatterns[keyof typeof AudioPatterns];

/**
 * Play an emergency alarm sound pattern
 * @param pattern - The type of audio pattern to play
 * @param volume - Volume level (0-1)
 * @param repeat - Whether to repeat the pattern
 */
export const playAlarmSound = (
  pattern: AudioPattern = AudioPatterns.EMERGENCY,
  volume: number = 0.5,
  repeat: boolean = false
): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTone = (frequency: number, startTime: number, duration: number = 0.2, type: OscillatorType = 'sine') => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;

    switch (pattern) {
      case AudioPatterns.EMERGENCY:
        // Urgent pattern: High-low-high rapid beeps
        playTone(800, now, 0.15, 'square');
        playTone(600, now + 0.2, 0.15, 'square');
        playTone(800, now + 0.4, 0.15, 'square');
        playTone(600, now + 0.6, 0.15, 'square');
        playTone(800, now + 0.8, 0.15, 'square');
        
        if (repeat) {
          setTimeout(() => playAlarmSound(pattern, volume, false), 1500);
        }
        break;
        
      case AudioPatterns.SUCCESS:
        // Success pattern: Ascending tones
        playTone(400, now, 0.1);
        playTone(500, now + 0.15, 0.1);
        playTone(600, now + 0.3, 0.2);
        break;
        
      case AudioPatterns.WARNING:
        // Warning pattern: Two medium beeps
        playTone(700, now, 0.2, 'triangle');
        playTone(700, now + 0.3, 0.2, 'triangle');
        break;
        
      case AudioPatterns.NOTIFICATION:
        // Notification pattern: Single pleasant chime
        playTone(523, now, 0.1); // C
        playTone(659, now + 0.1, 0.1); // E
        playTone(784, now + 0.2, 0.3); // G
        break;
    }
  } catch (error) {
    console.error('Could not play audio:', error);
    playFallbackAudio(pattern);
  }
};

/**
 * Fallback audio using HTML5 Audio API
 * @param pattern - The type of audio pattern to play
 */
const playFallbackAudio = (pattern: AudioPattern): void => {
  try {
    // Base64 encoded simple beep sound
    const beepSound = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZURE';
    const audio = new Audio(beepSound);
    
    switch (pattern) {
      case AudioPatterns.EMERGENCY:
        audio.volume = 0.8;
        audio.playbackRate = 1.5; // Faster playback for urgency
        break;
      case AudioPatterns.SUCCESS:
        audio.volume = 0.5;
        audio.playbackRate = 1.2;
        break;
      case AudioPatterns.WARNING:
        audio.volume = 0.6;
        break;
      case AudioPatterns.NOTIFICATION:
        audio.volume = 0.4;
        break;
    }
    
    audio.play().catch(() => {
      // Silent fail if audio cannot play
    });
  } catch (e) {
    // Complete silent fail as last resort
  }
};

/**
 * Stop all currently playing sounds
 */
export const stopAllSounds = (): void => {
  // This would require tracking active audio contexts
  // For now, sounds will stop naturally when they complete
  console.log('Stopping all sounds');
};

/**
 * Test audio playback capability
 * @returns Promise<boolean> - Whether audio can be played
 */
export const canPlayAudio = async (): Promise<boolean> => {
  try {
    const testAudio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
    await testAudio.play();
    return true;
  } catch {
    return false;
  }
};