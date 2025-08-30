import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WoprSettings } from '../../models/settings.models';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-settings-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-panel.component.html',
  styleUrl: './settings-panel.component.scss'
})
export class SettingsPanelComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  settings: WoprSettings;
  isVisible = false;
  
  // Theme options
  themeOptions = [
    { value: 'classic', label: 'Classic Green' },
    { value: 'green', label: 'Matrix Green' },
    { value: 'amber', label: 'Amber Terminal' },
    { value: 'blue', label: 'Blue Matrix' }
  ];

  constructor(private settingsService: SettingsService) {
    this.settings = this.settingsService.getSettings();
  }

  ngOnInit() {
    // Subscribe to settings changes
    this.settingsService.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.settings = settings;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
  }

  // Audio Settings
  toggleTextToSpeech() {
    this.settingsService.toggleTextToSpeech();
  }

  toggleBeepSound() {
    this.settingsService.toggleBeepSound();
  }

  toggleDialupSound() {
    this.settingsService.toggleDialupSound();
  }

  toggleTensionMusic() {
    this.settingsService.toggleTensionMusic();
  }

  // Display Settings
  onThemeChange(theme: string) {
    this.settingsService.setTheme(theme as any);
  }

  onTerminalSpeedChange(speed: number) {
    this.settingsService.setTerminalSpeed(speed);
  }

  toggleReducedMotion() {
    this.settingsService.toggleReducedMotion();
  }

  toggleHighContrast() {
    this.settingsService.toggleHighContrast();
  }

  // System Settings
  toggleAutoConnect() {
    this.settingsService.toggleAutoConnect();
  }

  toggleFunctionCalling() {
    this.settingsService.toggleFunctionCalling();
  }

  toggleTelemetry() {
    this.settingsService.toggleTelemetry();
  }

  // API Key Management
  setApiKey(apiKey: string) {
    this.settingsService.setApiKey(apiKey || null);
  }

  clearApiKey() {
    this.settingsService.setApiKey(null);
  }

  getMaskedApiKey(): string {
    return this.settingsService.getMaskedApiKey();
  }

  // Settings Management
  exportSettings() {
    try {
      const exportData = this.settingsService.exportSettings();
      
      // Create a downloadable file
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wopr-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Settings export failed:', error);
    }
  }

  importSettings(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = this.settingsService.importSettings(content);
        if (success) {
          console.log('Settings imported successfully');
        } else {
          console.error('Failed to import settings');
        }
      } catch (error) {
        console.error('Error reading settings file:', error);
      }
    };
    reader.readAsText(file);
  }

  resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      this.settingsService.resetSettings();
    }
  }

  // Storage Information
  getStorageInfo() {
    return this.settingsService.getStorageInfo();
  }
}