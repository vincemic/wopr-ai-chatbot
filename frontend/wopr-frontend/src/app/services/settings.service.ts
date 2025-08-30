import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DEFAULT_SETTINGS, SettingsChangeEvent, WoprSettings } from '../models/settings.models';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly STORAGE_KEY = 'wopr-settings';
  private readonly LEGACY_API_KEY = 'wopr-openai-key'; // For migration
  private readonly SETTINGS_VERSION = '1.0.0';
  
  private settingsSubject = new BehaviorSubject<WoprSettings>(DEFAULT_SETTINGS);
  private changeSubject = new BehaviorSubject<SettingsChangeEvent | null>(null);
  
  // Observable streams for reactive components
  public settings$ = this.settingsSubject.asObservable();
  public changes$ = this.changeSubject.asObservable();
  
  private currentSettings: WoprSettings;

  constructor() {
    this.currentSettings = this.loadSettings();
    this.settingsSubject.next(this.currentSettings);
    // Apply the current theme on service initialization
    this.applyTheme(this.currentSettings.theme);
  }

  /**
   * Load settings from localStorage with migration support
   */
  private loadSettings(): WoprSettings {
    try {
      // Check for existing settings
      const storedSettings = localStorage.getItem(this.STORAGE_KEY);
      
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings) as WoprSettings;
        
        // Migrate settings if version mismatch
        const migrated = this.migrateSettings(parsed);
        
        // Merge with defaults to ensure all properties exist
        const settings = { ...DEFAULT_SETTINGS, ...migrated };
        
        // Update last used timestamp
        settings.lastUsed = new Date();
        
        return settings;
      } else {
        // Check for legacy API key and migrate
        const legacyApiKey = localStorage.getItem(this.LEGACY_API_KEY);
        const settings = { ...DEFAULT_SETTINGS };
        
        if (legacyApiKey) {
          settings.openaiApiKey = legacyApiKey;
          console.log('WOPR Settings: Migrated legacy API key');
          
          // Remove legacy key after migration
          localStorage.removeItem(this.LEGACY_API_KEY);
        }
        
        // Save initial settings
        this.saveSettings(settings);
        return settings;
      }
    } catch (error) {
      console.error('WOPR Settings: Error loading settings, using defaults:', error);
      const settings = { ...DEFAULT_SETTINGS };
      this.saveSettings(settings);
      return settings;
    }
  }

  /**
   * Migrate settings from older versions
   */
  private migrateSettings(settings: any): WoprSettings {
    // If no version, this is a pre-versioned settings object
    if (!settings.version) {
      console.log('WOPR Settings: Migrating pre-versioned settings');
      
      // Ensure all new properties have defaults
      const migrated = {
        ...DEFAULT_SETTINGS,
        ...settings,
        version: this.SETTINGS_VERSION
      };
      
      return migrated;
    }
    
    // Add future migration logic here for different versions
    if (settings.version !== this.SETTINGS_VERSION) {
      console.log(`WOPR Settings: Migrating from version ${settings.version} to ${this.SETTINGS_VERSION}`);
      
      // For now, just merge with defaults and update version
      const migrated = {
        ...DEFAULT_SETTINGS,
        ...settings,
        version: this.SETTINGS_VERSION
      };
      
      return migrated;
    }
    
    return settings;
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(settings: WoprSettings): void {
    try {
      settings.lastUsed = new Date();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      console.log('WOPR Settings: Settings saved to localStorage');
    } catch (error) {
      console.error('WOPR Settings: Error saving settings:', error);
    }
  }

  /**
   * Get current settings (synchronous)
   */
  public getSettings(): WoprSettings {
    return { ...this.currentSettings };
  }

  /**
   * Get a specific setting value
   */
  public getSetting<K extends keyof WoprSettings>(key: K): WoprSettings[K] {
    return this.currentSettings[key];
  }

  /**
   * Update a single setting
   */
  public setSetting<K extends keyof WoprSettings>(key: K, value: WoprSettings[K]): void {
    const oldValue = this.currentSettings[key];
    
    if (oldValue !== value) {
      this.currentSettings[key] = value;
      this.saveSettings(this.currentSettings);
      this.settingsSubject.next({ ...this.currentSettings });
      
      // Emit change event
      const changeEvent: SettingsChangeEvent = {
        key,
        oldValue,
        newValue: value,
        timestamp: new Date()
      };
      this.changeSubject.next(changeEvent);
      
      console.log(`WOPR Settings: Updated ${key} from ${oldValue} to ${value}`);
    }
  }

  /**
   * Update multiple settings at once
   */
  public updateSettings(updates: Partial<WoprSettings>): void {
    let hasChanges = false;
    const changes: SettingsChangeEvent[] = [];
    
    for (const [key, value] of Object.entries(updates)) {
      const typedKey = key as keyof WoprSettings;
      const oldValue = this.currentSettings[typedKey];
      
      if (oldValue !== value) {
        (this.currentSettings as any)[typedKey] = value;
        hasChanges = true;
        
        changes.push({
          key: typedKey,
          oldValue,
          newValue: value,
          timestamp: new Date()
        });
      }
    }
    
    if (hasChanges) {
      this.saveSettings(this.currentSettings);
      this.settingsSubject.next({ ...this.currentSettings });
      
      // Emit all change events
      changes.forEach(change => this.changeSubject.next(change));
      
      console.log('WOPR Settings: Bulk update completed with', changes.length, 'changes');
    }
  }

  /**
   * Reset settings to defaults
   */
  public resetSettings(): void {
    const oldSettings = { ...this.currentSettings };
    this.currentSettings = { ...DEFAULT_SETTINGS };
    this.saveSettings(this.currentSettings);
    this.settingsSubject.next({ ...this.currentSettings });
    
    console.log('WOPR Settings: Reset to defaults');
    
    // Emit reset event
    this.changeSubject.next({
      key: 'version', // Use version as a proxy for "all settings"
      oldValue: oldSettings,
      newValue: this.currentSettings,
      timestamp: new Date()
    });
  }

  /**
   * Export settings as JSON string
   */
  public exportSettings(): string {
    const exportData = {
      settings: this.currentSettings,
      exportDate: new Date().toISOString(),
      version: this.SETTINGS_VERSION
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import settings from JSON string
   */
  public importSettings(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData);
      
      if (importData.settings) {
        const importedSettings = this.migrateSettings(importData.settings);
        this.updateSettings(importedSettings);
        console.log('WOPR Settings: Imported settings successfully');
        return true;
      } else {
        console.error('WOPR Settings: Invalid import data format');
        return false;
      }
    } catch (error) {
      console.error('WOPR Settings: Error importing settings:', error);
      return false;
    }
  }

  /**
   * Clear all stored settings (for development/debugging)
   */
  public clearStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.LEGACY_API_KEY);
    this.currentSettings = { ...DEFAULT_SETTINGS };
    this.settingsSubject.next({ ...this.currentSettings });
    console.log('WOPR Settings: Storage cleared');
  }

  /**
   * Get settings storage information
   */
  public getStorageInfo(): {
    size: number;
    lastUsed: Date;
    version: string;
    hasLegacyData: boolean;
  } {
    const settingsData = localStorage.getItem(this.STORAGE_KEY);
    const legacyApiKey = localStorage.getItem(this.LEGACY_API_KEY);
    
    return {
      size: settingsData ? new Blob([settingsData]).size : 0,
      lastUsed: this.currentSettings.lastUsed,
      version: this.currentSettings.version,
      hasLegacyData: !!legacyApiKey
    };
  }

  // Convenience methods for common settings

  /**
   * Audio settings management
   */
  public toggleTextToSpeech(): boolean {
    const newValue = !this.currentSettings.textToSpeechEnabled;
    this.setSetting('textToSpeechEnabled', newValue);
    return newValue;
  }

  public toggleBeepSound(): boolean {
    const newValue = !this.currentSettings.beepEnabled;
    this.setSetting('beepEnabled', newValue);
    return newValue;
  }

  public toggleDialupSound(): boolean {
    const newValue = !this.currentSettings.dialupEnabled;
    this.setSetting('dialupEnabled', newValue);
    return newValue;
  }

  public toggleTensionMusic(): boolean {
    const newValue = !this.currentSettings.tensionMusicEnabled;
    this.setSetting('tensionMusicEnabled', newValue);
    return newValue;
  }

  /**
   * API key management
   */
  public setApiKey(apiKey: string | null): void {
    this.setSetting('openaiApiKey', apiKey);
  }

  public getApiKey(): string | null {
    return this.currentSettings.openaiApiKey;
  }

  public hasApiKey(): boolean {
    return !!this.currentSettings.openaiApiKey;
  }

  public getMaskedApiKey(): string {
    const key = this.currentSettings.openaiApiKey;
    if (!key) return 'NOT SET';
    if (key.length <= 8) return '***';
    return key.substring(0, 7) + '***' + key.substring(key.length - 4);
  }

  /**
   * Theme management
   */
  public setTheme(theme: 'classic' | 'green' | 'amber' | 'blue'): void {
    this.setSetting('theme', theme);
    this.applyTheme(theme);
  }

  public getTheme(): string {
    return this.currentSettings.theme;
  }

  /**
   * Apply theme to document root CSS custom properties
   */
  private applyTheme(theme: string): void {
    const root = document.documentElement;
    
    switch (theme) {
      case 'classic':
        // Classic green CRT terminal
        root.style.setProperty('--crt-green', '#00ff00');
        root.style.setProperty('--crt-green-rgb', '0, 255, 0');
        root.style.setProperty('--crt-dark-green', '#008000');
        root.style.setProperty('--scan-line-opacity', '0.04');
        break;
        
      case 'green':
        // Matrix-style green
        root.style.setProperty('--crt-green', '#00ff41');
        root.style.setProperty('--crt-green-rgb', '0, 255, 65');
        root.style.setProperty('--crt-dark-green', '#00aa2b');
        root.style.setProperty('--scan-line-opacity', '0.06');
        break;
        
      case 'amber':
        // Amber terminal
        root.style.setProperty('--crt-green', '#ffb000');
        root.style.setProperty('--crt-green-rgb', '255, 176, 0');
        root.style.setProperty('--crt-dark-green', '#cc8800');
        root.style.setProperty('--scan-line-opacity', '0.05');
        break;
        
      case 'blue':
        // Blue matrix
        root.style.setProperty('--crt-green', '#00bfff');
        root.style.setProperty('--crt-green-rgb', '0, 191, 255');
        root.style.setProperty('--crt-dark-green', '#0099cc');
        root.style.setProperty('--scan-line-opacity', '0.05');
        break;
        
      default:
        // Fallback to classic
        this.applyTheme('classic');
    }
  }

  /**
   * Terminal speed management
   */
  public setTerminalSpeed(speed: number): void {
    // Clamp speed between 10ms and 200ms per character
    const clampedSpeed = Math.max(10, Math.min(200, speed));
    this.setSetting('terminalSpeed', clampedSpeed);
  }

  public getTerminalSpeed(): number {
    return this.currentSettings.terminalSpeed;
  }

  /**
   * Speech voice management
   */
  public setSpeechVoice(voiceName: string): void {
    this.setSetting('speechVoice', voiceName);
  }

  public getSpeechVoice(): string {
    return this.currentSettings.speechVoice;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if ('speechSynthesis' in window) {
      return speechSynthesis.getVoices();
    }
    return [];
  }

  public getBestVoiceForWopr(): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    if (voices.length === 0) return null;

    // Current setting
    const currentVoice = this.getSpeechVoice();
    
    // If user has selected a specific voice, try to find it
    if (currentVoice !== 'auto') {
      const selectedVoice = voices.find(v => v.name === currentVoice);
      if (selectedVoice) return selectedVoice;
    }

    // Auto-detect best voice for WOPR (robotic/computer-like)
    const roboticVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('microsoft') ||
      voice.name.toLowerCase().includes('robotic') ||
      voice.name.toLowerCase().includes('computer') ||
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('david') ||
      voice.name.toLowerCase().includes('mark')
    );
    
    if (roboticVoice) return roboticVoice;
    
    // Fallback to first available voice
    return voices[0] || null;
  }

  /**
   * System settings management
   */
  public toggleAutoConnect(): boolean {
    const newValue = !this.currentSettings.autoConnect;
    this.setSetting('autoConnect', newValue);
    return newValue;
  }

  public toggleFunctionCalling(): boolean {
    const newValue = !this.currentSettings.enableFunctionCalling;
    this.setSetting('enableFunctionCalling', newValue);
    return newValue;
  }

  public toggleTelemetry(): boolean {
    const newValue = !this.currentSettings.enableTelemetry;
    this.setSetting('enableTelemetry', newValue);
    return newValue;
  }

  /**
   * Accessibility settings
   */
  public toggleReducedMotion(): boolean {
    const newValue = !this.currentSettings.reducedMotion;
    this.setSetting('reducedMotion', newValue);
    return newValue;
  }

  public toggleHighContrast(): boolean {
    const newValue = !this.currentSettings.highContrast;
    this.setSetting('highContrast', newValue);
    return newValue;
  }
}