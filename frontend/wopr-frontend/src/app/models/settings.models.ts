export interface WoprSettings {
  // Audio Settings
  textToSpeechEnabled: boolean;
  beepEnabled: boolean;
  dialupEnabled: boolean;
  tensionMusicEnabled: boolean;
  speechVoice: string; // Voice name for speech synthesis
  
  // API Configuration
  openaiApiKey: string | null;
  
  // Theme and Display Settings
  theme: 'classic' | 'green' | 'amber' | 'blue';
  terminalSpeed: number; // milliseconds per character for typing effect
  
  // WOPR Behavior Settings
  autoConnect: boolean; // automatically connect to WOPR on page load
  enableFunctionCalling: boolean;
  enableTelemetry: boolean;
  
  // Accessibility Settings
  reducedMotion: boolean;
  highContrast: boolean;
  
  // System Settings
  lastUsed: Date;
  version: string; // for settings migration
}

export interface AudioSettings {
  textToSpeechEnabled: boolean;
  beepEnabled: boolean;
  dialupEnabled: boolean;
  tensionMusicEnabled: boolean;
  volume: number;
  voiceRate: number;
  voicePitch: number;
}

export interface DisplaySettings {
  theme: string;
  terminalSpeed: number;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: number;
}

export interface SystemSettings {
  autoConnect: boolean;
  enableFunctionCalling: boolean;
  enableTelemetry: boolean;
  debugMode: boolean;
}

export interface SettingsGroup {
  audio: AudioSettings;
  display: DisplaySettings;
  system: SystemSettings;
}

// Default settings
export const DEFAULT_SETTINGS: WoprSettings = {
  // Audio Settings
  textToSpeechEnabled: true,
  beepEnabled: true,
  dialupEnabled: true,
  tensionMusicEnabled: true,
  speechVoice: 'auto', // Auto-detect best voice
  
  // API Configuration
  openaiApiKey: null,
  
  // Theme and Display Settings
  theme: 'green',
  terminalSpeed: 50,
  
  // WOPR Behavior Settings
  autoConnect: false,
  enableFunctionCalling: true,
  enableTelemetry: true,
  
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