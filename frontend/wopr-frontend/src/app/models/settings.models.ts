export interface WoprSettings {
  // Audio Settings
  textToSpeechEnabled: boolean;
  beepEnabled: boolean;
  dialupEnabled: boolean;
  tensionMusicEnabled: boolean;
  speechVoice: string; // Voice name for speech synthesis
  speechVolume: number; // Volume for TTS (0.0 - 1.0)
  speechRate: number; // Rate for TTS (0.1 - 10.0)
  speechPitch: number; // Pitch for TTS (0.0 - 2.0)
  
  // API Configuration
  openaiApiKey: string | null;
  
  // Theme and Display Settings
  theme: 'classic' | 'green' | 'amber' | 'blue';
  terminalSpeed: number; // milliseconds per character for typing effect
  fontSize: number; // Font size for terminal display
  
  // WOPR Behavior Settings
  autoConnect: boolean; // automatically connect to WOPR on page load
  enableFunctionCalling: boolean;
  enableTelemetry: boolean;
  debugMode: boolean; // Enable debug logging
  
  // Accessibility Settings
  reducedMotion: boolean;
  highContrast: boolean;
  
  // System Settings
  lastUsed: Date;
  version: string; // for settings migration
}

// Default settings
export const DEFAULT_SETTINGS: WoprSettings = {
  // Audio Settings
  textToSpeechEnabled: true,
  beepEnabled: true,
  dialupEnabled: true,
  tensionMusicEnabled: true,
  speechVoice: 'auto', // Auto-detect best voice
  speechVolume: 0.8, // Clear volume (0.0 - 1.0)
  speechRate: 0.7, // Slower, more deliberate (0.1 - 10.0)
  speechPitch: 0.4, // Lower pitch, more robotic (0.0 - 2.0)
  
  // API Configuration
  openaiApiKey: null,
  
  // Theme and Display Settings
  theme: 'classic',
  terminalSpeed: 50,
  fontSize: 16, // Default terminal font size
  
  // WOPR Behavior Settings
  autoConnect: false,
  enableFunctionCalling: true,
  enableTelemetry: true,
  debugMode: false, // Disabled by default
  
  // Accessibility Settings
  reducedMotion: false,
  highContrast: false,
  
  // System Settings
  lastUsed: new Date(),
  version: '1.0.0'
};

// Settings event types for reactive updates
export interface SettingsChangeEvent {
  key: keyof WoprSettings;
  oldValue: any;
  newValue: any;
  timestamp: Date;
}