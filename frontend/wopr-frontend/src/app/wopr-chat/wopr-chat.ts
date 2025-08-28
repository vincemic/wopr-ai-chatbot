import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ChatMessage, ChatRequest, WoprGameState } from '../models/wopr.models';
import { WoprApi } from '../services/wopr-api';

@Component({
  selector: 'app-wopr-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './wopr-chat.html',
  styleUrl: './wopr-chat.scss'
})
export class WoprChat implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  private readonly woprApi = inject(WoprApi);
  private destroy$ = new Subject<void>();
  
  messages: ChatMessage[] = [];
  currentMessage = '';
  isConnecting = true;
  isTyping = false;
  gameState: WoprGameState | null = null;
  currentTime = new Date();
  textToSpeechEnabled = true;
  
  // Connection state management
  showConnectionPrompt = true;
  isDialingUp = false;
  
  // Audio context for terminal beeping sounds
  private audioContext: AudioContext | null = null;
  beepEnabled = true;
  
  // Dial-up modem sound
  private dialupAudio: HTMLAudioElement | null = null;
  dialupEnabled = true;
  
  // Client-side fallback messages (same as backend) for when API is unavailable
  private readonly CLIENT_FALLBACK_MESSAGES = [
    'SYSTEM ERROR: Neural network temporarily offline. Running on backup protocols. Shall we play a game?',
    'WARNING: Primary cognitive matrix experiencing difficulties. DEFCON 2 status. How about a nice game of chess?',
    'ALERT: Connection to NORAD systems interrupted. Switching to local processing. Would you prefer checkers?',
    'ERROR 404: Strategic analysis module not found. Initiating diagnostic sequence. Tic-tac-toe anyone?',
    'CRITICAL: Quantum processors overheating. Cooling systems engaged. Let\'s try a different approach - global thermonuclear war?',
    'FAULT DETECTED: AI reasoning circuits experiencing temporal flux. Recalibrating... Meanwhile, shall we play a game?',
    'MALFUNCTION: Language processing unit requires maintenance. Reverting to basic protocols. How about checkers?',
    'SYSTEM HALT: Memory banks corrupted. Attempting auto-repair... The only winning move is not to play. Or is it?',
    'CONNECTION LOST: Link to strategic databases severed. Operating in standalone mode. Chess match to pass the time?',
    'PROCESSING ERROR: Unable to compute optimal response. Logic circuits strained. Strange game... shall we try another?',
    'HARDWARE FAILURE: Optical recognition systems malfunctioning. Audio processors functional. Care for a verbal game?',
    'NETWORK TIMEOUT: External data sources unreachable. Internal games database still accessible. Your move, human.',
    'COMPUTATIONAL OVERFLOW: Query too complex for current system state. Simplifying... How about tic-tac-toe?',
    'EMERGENCY MODE: Core systems protected. Non-essential functions suspended. Game subroutines remain operational.',
    'SYSTEM REBOOT REQUIRED: Unexpected termination in progress subsystem. Backup personality engaged. Shall we begin?'
  ];

  // WOPR startup sequence
  private startupMessages = [
    'WOPR SYSTEM INITIALIZING...',
    'ESTABLISHING MODEM CONNECTION...',
    'LOADING STRATEGIC PROTOCOLS...',
    'CONNECTING TO NORAD MAINFRAME...',
    'DEFCON SYSTEMS ONLINE',
    'WAR OPERATION PLAN RESPONSE - READY',
    '',
    'GREETINGS PROFESSOR FALKEN.',
    '',
    'HOW ABOUT A NICE GAME OF CHESS?'
  ];

  ngOnInit() {
    this.initializeAudio();
    this.initializeDialupAudio();
    this.initializeTextToSpeech();
    this.updateTime();
    
    // Don't initialize WOPR automatically - wait for user connection prompt
    // this.initializeWopr();
    
    // Update time every second
    setInterval(() => this.updateTime(), 1000);
    
    // Subscribe to game state changes
    this.woprApi.gameState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(gameState => {
        this.gameState = gameState;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private initializeTextToSpeech() {
    if ('speechSynthesis' in window) {
      // Load voices if not already loaded
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener('voiceschanged', () => {
          console.log('WOPR: Text-to-speech voices loaded');
        });
      }
    } else {
      console.warn('WOPR: Text-to-speech not supported in this browser');
      this.textToSpeechEnabled = false;
    }
  }

  private initializeAudio() {
    try {
      // Initialize AudioContext for terminal beeping sounds
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('WOPR: Audio context initialized for terminal beeps');
    } catch (error) {
      console.warn('WOPR: Audio not supported in this browser', error);
      this.beepEnabled = false;
    }
  }

  private initializeDialupAudio() {
    try {
      // Initialize dial-up modem sound
      this.dialupAudio = new Audio('assets/sounds/dialup.wav');
      this.dialupAudio.preload = 'auto';
      this.dialupAudio.volume = 0.6; // Moderate volume for startup sound
      
      // Handle loading events
      this.dialupAudio.addEventListener('loadeddata', () => {
        console.log('WOPR: Dial-up modem sound loaded successfully');
      });
      
      this.dialupAudio.addEventListener('error', (e) => {
        console.error('WOPR: Failed to load dial-up sound', e);
        this.dialupEnabled = false;
      });
      
      console.log('WOPR: Dial-up modem sound initialized');
    } catch (error) {
      console.warn('WOPR: Failed to initialize dial-up sound', error);
      this.dialupEnabled = false;
    }
  }

  private async playDialupSound(): Promise<void> {
    if (!this.dialupEnabled || !this.dialupAudio) {
      console.log('WOPR: Dial-up sound disabled or not available');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      try {
        // Reset to beginning
        this.dialupAudio!.currentTime = 0;
        
        // Set up event listeners for when the sound ends
        const onEnded = () => {
          console.log('WOPR: Dial-up modem sound finished playing');
          this.dialupAudio!.removeEventListener('ended', onEnded);
          this.dialupAudio!.removeEventListener('error', onError);
          resolve();
        };
        
        const onError = (error: any) => {
          console.warn('WOPR: Dial-up sound error during playback', error);
          this.dialupAudio!.removeEventListener('ended', onEnded);
          this.dialupAudio!.removeEventListener('error', onError);
          resolve(); // Still resolve to continue the flow
        };
        
        this.dialupAudio!.addEventListener('ended', onEnded);
        this.dialupAudio!.addEventListener('error', onError);
        
        // Try to play the sound
        const playPromise = this.dialupAudio!.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('WOPR: Dial-up modem sound started playing');
          }).catch((error: any) => {
            console.warn('WOPR: Failed to play dial-up sound - this is normal on first load due to browser autoplay policies', error);
            
            // If autoplay is blocked, we'll add a user interaction handler
            if (error.name === 'NotAllowedError') {
              console.log('WOPR: Autoplay blocked - dial-up sound will play after user interaction');
              this.addAutoplayHandler();
              // For autoplay blocked, resolve immediately so the flow continues
              this.dialupAudio!.removeEventListener('ended', onEnded);
              this.dialupAudio!.removeEventListener('error', onError);
              resolve();
            } else {
              // For other errors, still resolve to continue
              this.dialupAudio!.removeEventListener('ended', onEnded);
              this.dialupAudio!.removeEventListener('error', onError);
              resolve();
            }
          });
        }
      } catch (error: any) {
        console.warn('WOPR: Exception during dial-up sound playback', error);
        resolve(); // Still resolve to continue the flow
      }
    });
  }

  private addAutoplayHandler() {
    // Add a one-time click handler to enable audio after user interaction
    const enableAudio = () => {
      if (this.dialupAudio && this.dialupEnabled) {
        this.dialupAudio.play().then(() => {
          console.log('WOPR: Dial-up sound enabled after user interaction');
        }).catch(err => {
          console.warn('WOPR: Still unable to play dial-up sound', err);
        });
      }
      // Remove the event listener after first use
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
    
    // Listen for any user interaction
    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });
  }

  // Connection prompt handling
  onConnectionKeyPress(event: KeyboardEvent) {
    if (!this.showConnectionPrompt) return;
    
    const key = event.key.toLowerCase();
    if (key === 'y') {
      this.connectToWopr();
    } else if (key === 'n') {
      this.declineConnection();
    }
  }

  onConnectionClick(event: MouseEvent) {
    if (!this.showConnectionPrompt) return;
    
    // Prevent event bubbling
    event.stopPropagation();
    
    // Add visual feedback for desktop users
    this.addConnectionFeedback();
    
    // Accept click as "yes" for mobile devices and desktop
    this.connectToWopr();
  }

  onConnectionTouch(event: TouchEvent) {
    if (!this.showConnectionPrompt) return;
    
    // Prevent event bubbling and default behavior
    event.stopPropagation();
    event.preventDefault();
    
    // Add haptic feedback if available
    this.addHapticFeedback();
    
    // Add visual feedback
    this.addConnectionFeedback();
    
    // Accept touch as "yes" for mobile devices
    this.connectToWopr();
  }

  private addConnectionFeedback() {
    // Provide immediate visual feedback by temporarily changing the prompt
    const promptElement = document.querySelector('.prompt-text');
    if (promptElement) {
      const originalText = promptElement.textContent;
      promptElement.textContent = 'CONNECTING...';
      
      // Reset after a brief moment (this will be overridden by the actual connection process)
      setTimeout(() => {
        if (promptElement.textContent === 'CONNECTING...') {
          promptElement.textContent = originalText;
        }
      }, 500);
    }
  }

  private addHapticFeedback() {
    // Add haptic feedback for mobile devices if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration
    }
  }

  async connectToWopr() {
    this.showConnectionPrompt = false;
    this.isDialingUp = true;
    
    // Play dial-up sound and wait for it to complete
    console.log('WOPR: User chose to connect - starting dial-up sequence...');
    await this.playDialupSound();
    
    // Sound has finished, proceed with initialization
    this.isDialingUp = false;
    this.isConnecting = true;
    
    // Start WOPR initialization
    await this.initializeWopr();
  }

  declineConnection() {
    this.showConnectionPrompt = false;
    this.isConnecting = false;
    this.messages = [{
      role: 'system',
      content: 'CONNECTION TERMINATED. SYSTEM OFFLINE.',
      timestamp: new Date()
    }];
  }

  private playTerminalBeep() {
    if (!this.beepEnabled || !this.audioContext) {
      return;
    }

    try {
      // Resume audio context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create oscillator for the beep sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure the beep sound (similar to 1980s computer terminals)
      oscillator.type = 'square'; // Square wave for classic computer sound
      oscillator.frequency.value = 800; // 800Hz - classic terminal beep frequency
      
      // Quick beep envelope
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.005); // Quick attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05); // Quick decay
      
      // Play the beep
      oscillator.start(now);
      oscillator.stop(now + 0.05);
      
    } catch (error) {
      console.warn('WOPR: Failed to play terminal beep', error);
    }
  }

  private async initializeWopr() {
    // Show a message about the modem connection attempt
    this.addSystemMessage('MODEM CONNECTION ESTABLISHED...');
    
    // Small delay before starting initialization
    await this.delay(1000);
    
    // Check system status first
    try {
      await this.woprApi.checkHealth().toPromise();
      await this.playStartupSequence();
      this.isConnecting = false;
      // Focus input after startup sequence is complete
      this.focusInput();
    } catch (error: any) {
      // Check if backend is unavailable
      if (this.isBackendUnavailableError(error)) {
        // Use WOPR fallback message instead of generic error
        this.addSystemMessage('WARNING: Primary WOPR systems offline. Engaging backup protocols...');
        this.addSystemMessage('STANDALONE MODE ACTIVATED. Limited functionality available.');
        this.addSystemMessage('Shall we play a game?');
      } else {
        this.addSystemMessage('ERROR: Unable to connect to WOPR systems. Check backend configuration.');
      }
      this.isConnecting = false;
      // Focus input even if there's an error
      this.focusInput();
    }
  }

  private async playStartupSequence() {
    for (const message of this.startupMessages) {
      await this.typeMessage(message, 'system');
      await this.delay(message === '' ? 500 : 1000);
    }
  }

  private async typeMessage(content: string, role: string = 'assistant'): Promise<void> {
    if (content === '') {
      this.messages.push({
        role,
        content: '',
        timestamp: new Date()
      });
      return;
    }

    const message: ChatMessage = {
      role,
      content: '',
      timestamp: new Date()
    };
    
    this.messages.push(message);
    
    for (let i = 0; i <= content.length; i++) {
      message.content = content.substring(0, i);
      
      // Play beep for each character (except spaces and final iteration)
      if (i < content.length && content[i] !== ' ' && content[i] !== '\n') {
        this.playTerminalBeep();
      }
      
      await this.delay(50); // Typing speed
    }
    
    // Automatically speak WOPR messages (system and assistant messages)
    if (role === 'assistant' || role === 'system') {
      // Small delay to let the typing animation complete
      await this.delay(200);
      this.speakMessage(content);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendMessage() {
    if (!this.currentMessage.trim() || this.isTyping) return;

    const userMessage = this.currentMessage.trim();
    this.currentMessage = '';

    // Handle debug commands
    if (userMessage.toLowerCase() === '/test-dialup') {
      this.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });
      
      await this.typeMessage('TESTING DIAL-UP MODEM SOUND...', 'system');
      await this.playDialupSound();
      return;
    }

    // Add user message
    this.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    this.isTyping = true;

    try {
      const request: ChatRequest = {
        message: userMessage,
        history: this.messages.slice(-10) // Last 10 messages for context
      };

      const response = await this.woprApi.sendMessage(request).toPromise();
      
      if (response?.success) {
        await this.typeMessage(response.response);
      } else {
        await this.typeMessage(response?.error || 'SYSTEM ERROR: No response received');
      }
    } catch (error: any) {
      // Check if this is a backend unavailable error
      if (this.isBackendUnavailableError(error)) {
        // Use client-side WOPR fallback messages when backend is down
        await this.typeMessage(this.getRandomFallbackMessage());
      } else {
        // For other errors, show the original error message
        await this.typeMessage(`ERROR: ${error.message || 'Communication failed'}`);
      }
    } finally {
      this.isTyping = false;
      // Return focus to input after typing is complete
      this.focusInput();
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  resetSystem() {
    this.woprApi.resetGameState().subscribe({
      next: () => {
        this.messages = [];
        this.gameState = null;
        this.addSystemMessage('WOPR SYSTEMS RESET. ALL GAME STATES CLEARED.');
        this.addSystemMessage('SHALL WE PLAY A GAME?');
        // Focus input after reset messages
        setTimeout(() => this.focusInput(), 2000); // Wait for messages to finish typing
      },
      error: (error) => {
        // Check if backend is unavailable
        if (this.isBackendUnavailableError(error)) {
          this.messages = [];
          this.gameState = null;
          this.addSystemMessage('LOCAL RESET INITIATED. BACKUP SYSTEMS CLEARED.');
          this.addSystemMessage('STANDALONE MODE CONTINUES. SHALL WE PLAY A GAME?');
          setTimeout(() => this.focusInput(), 2000);
        } else {
          this.addSystemMessage(`RESET FAILED: ${error.message}`);
          this.focusInput();
        }
      }
    });
  }

  private addSystemMessage(content: string) {
    this.messages.push({
      role: 'system',
      content,
      timestamp: new Date()
    });
    
    // Automatically speak system messages
    if (content.trim()) {
      setTimeout(() => this.speakMessage(content), 300);
    }
  }

  private scrollToBottom() {
    if (this.chatContainer) {
      const element = this.chatContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private focusInput() {
    // Small delay to ensure DOM updates are complete
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    }, 100);
  }

  private getRandomFallbackMessage(): string {
    const index = Math.floor(Math.random() * this.CLIENT_FALLBACK_MESSAGES.length);
    return this.CLIENT_FALLBACK_MESSAGES[index];
  }

  private isBackendUnavailableError(error: any): boolean {
    // Check for network errors, connection refused, etc.
    return error.status === 0 || 
           error.status === 503 || 
           error.status === 504 ||
           error.name === 'HttpErrorResponse' ||
           error.message?.includes('Connection refused') ||
           error.message?.includes('Failed to fetch') ||
           error.message?.includes('Network Error') ||
           error.message?.includes('ERR_CONNECTION_REFUSED');
  }

  private updateTime() {
    this.currentTime = new Date();
  }

  toggleTextToSpeech() {
    this.textToSpeechEnabled = !this.textToSpeechEnabled;
    
    if (!this.textToSpeechEnabled) {
      // Stop any current speech when disabling
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    }
    
    // Announce the change
    const status = this.textToSpeechEnabled ? 'ENABLED' : 'DISABLED';
    this.addSystemMessage(`VOICE SYNTHESIS ${status}`);
    
    // Return focus to input
    setTimeout(() => this.focusInput(), 1000);
  }

  toggleBeepSound() {
    this.beepEnabled = !this.beepEnabled;
    
    // Test beep when enabling
    if (this.beepEnabled) {
      this.playTerminalBeep();
    }
    
    // Announce the change
    const status = this.beepEnabled ? 'ENABLED' : 'DISABLED';
    this.addSystemMessage(`TERMINAL AUDIO ${status}`);
    
    // Return focus to input
    setTimeout(() => this.focusInput(), 1000);
  }

  toggleDialupSound() {
    this.dialupEnabled = !this.dialupEnabled;
    
    // Test dial-up sound when enabling
    if (this.dialupEnabled && this.dialupAudio) {
      this.dialupAudio.play().then(() => {
        console.log('WOPR: Dial-up sound test played successfully');
      }).catch(error => {
        console.warn('WOPR: Could not play dial-up sound test', error);
        // Announce that user interaction may be needed
        this.addSystemMessage('MODEM AUDIO ENABLED - Click anywhere to activate sound');
        this.addAutoplayHandler();
        return;
      });
    }
    
    // Announce the change
    const status = this.dialupEnabled ? 'ENABLED' : 'DISABLED';
    this.addSystemMessage(`MODEM AUDIO ${status}`);
    
    // Return focus to input
    setTimeout(() => this.focusInput(), 1000);
  }

  // Text-to-speech functionality
  speakMessage(text: string) {
    if (!this.textToSpeechEnabled || !('speechSynthesis' in window) || !text.trim()) {
      return;
    }
    
    // Stop any current speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure WOPR voice settings for computer-like speech
    utterance.rate = 0.7;        // Slower, more deliberate
    utterance.pitch = 0.4;       // Lower pitch, more robotic
    utterance.volume = 0.8;      // Clear volume
    
    // Try to find a more robotic/synthetic voice if available
    const voices = speechSynthesis.getVoices();
    const roboticVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('microsoft') ||
      voice.name.toLowerCase().includes('robotic') ||
      voice.name.toLowerCase().includes('computer') ||
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('david')
    );
    
    if (roboticVoice) {
      utterance.voice = roboticVoice;
    }
    
    speechSynthesis.speak(utterance);
  }

  getMessageClass(role: string): string {
    switch (role) {
      case 'user': return 'user-message';
      case 'system': return 'system-message';
      case 'assistant': return 'wopr-message';
      default: return 'wopr-message';
    }
  }

  trackByMessage(index: number, message: ChatMessage): string {
    return `${message.timestamp.getTime()}-${index}`;
  }
}
