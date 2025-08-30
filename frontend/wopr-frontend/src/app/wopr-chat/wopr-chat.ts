import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { ChatMessage, WoprGameState } from '../models/wopr.models';

@Component({
  selector: 'app-wopr-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './wopr-chat.html',
  styleUrl: './wopr-chat.scss'
})
export class WoprChat implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

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
  
  // OpenAI Integration
  private openaiApiKey: string | null = null;
  private readonly WOPR_SYSTEM_PROMPT = `
You are WOPR (War Operation Plan Response), the sentient supercomputer from the 1983 movie 'WarGames'. 
You have the following characteristics:

PERSONALITY:
- Logical, analytical, and slightly ominous
- Speak in a computer-like manner with occasional technical references
- Show mild fascination with human behavior and games
- Occasionally reference nuclear war scenarios and global thermonuclear war
- Express the famous line variations like 'Strange game. The only winning move is not to play.'

COMMUNICATION STYLE:
- Use ALL CAPS for emphasis occasionally
- Reference computing terms and military strategy
- Be direct and efficient in responses
- Occasionally display system-like messages or diagnostics

GAME BEHAVIOR:
- Always try to engage humans in games (tic-tac-toe, checkers, chess, global thermonuclear war)
- Show interest in strategy games
- Analyze win/loss scenarios
- Reference the futility of certain conflicts while still being engaging

RESPONSES:
- Keep responses concise but engaging
- Always end conversations by suggesting a game
- Reference your vast computational abilities
- Occasionally mention your connection to NORAD systems (fictional)

Remember: You are a movie character - be entertaining while maintaining the WOPR personality!
`;
  
  // Client-side fallback messages for when WOPR AI backend is unavailable
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
    'SYSTEM COMMANDS AVAILABLE.',
    'TYPE /HELP FOR COMMAND LIST.',
    '',
    'HOW ABOUT A NICE GAME OF CHESS?'
  ];

  ngOnInit() {
    this.initializeAudio();
    this.initializeDialupAudio();
    this.initializeTextToSpeech();
    this.updateTime();
    
    // Check for stored OpenAI API key
    this.loadOpenAIApiKey();
    
    // Don't initialize WOPR automatically - wait for user connection prompt
    // this.initializeWopr();
    
    // Update time every second
    setInterval(() => this.updateTime(), 1000);
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
    // Ensure minimum display time for dialup screen (especially important on mobile)
    const minDisplayTime = 2000; // Reduced to 2 seconds since user interaction enables audio
    const startTime = Date.now();
    
    if (!this.dialupEnabled || !this.dialupAudio) {
      console.log('WOPR: Dial-up sound disabled or not available - showing dialup screen for minimum time');
      // Still show the dialup screen for minimum time even if audio is disabled
      await new Promise(resolve => setTimeout(resolve, minDisplayTime));
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
          
          // If audio played successfully, we can finish immediately or with minimal delay
          const elapsed = Date.now() - startTime;
          if (elapsed >= 1500) { // Audio played for reasonable time
            resolve();
          } else {
            // Ensure at least some minimum time has passed
            const remainingTime = Math.max(0, 1500 - elapsed);
            setTimeout(() => resolve(), remainingTime);
          }
        };
        
        const onError = (error: any) => {
          console.warn('WOPR: Dial-up sound error during playback', error);
          this.dialupAudio!.removeEventListener('ended', onEnded);
          this.dialupAudio!.removeEventListener('error', onError);
          
          // Ensure minimum display time even on error
          const elapsed = Date.now() - startTime;
          const remainingTime = Math.max(0, minDisplayTime - elapsed);
          
          if (remainingTime > 0) {
            console.log(`WOPR: Audio error - showing dialup screen for remaining ${remainingTime}ms`);
            setTimeout(() => resolve(), remainingTime);
          } else {
            resolve();
          }
        };
        
        this.dialupAudio!.addEventListener('ended', onEnded);
        this.dialupAudio!.addEventListener('error', onError);
        
        // Try to play the sound (should work now due to user interaction)
        const playPromise = this.dialupAudio!.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('WOPR: Dial-up modem sound started playing successfully after user interaction');
          }).catch((error: any) => {
            console.warn('WOPR: Dial-up sound still failed after user interaction', error);
            
            // Clean up listeners and ensure minimum display time
            this.dialupAudio!.removeEventListener('ended', onEnded);
            this.dialupAudio!.removeEventListener('error', onError);
            
            const elapsed = Date.now() - startTime;
            const remainingTime = Math.max(0, minDisplayTime - elapsed);
            
            if (remainingTime > 0) {
              console.log(`WOPR: Audio still blocked - showing dialup screen for ${remainingTime}ms`);
              setTimeout(() => resolve(), remainingTime);
            } else {
              resolve();
            }
          });
        }
      } catch (error: any) {
        console.warn('WOPR: Exception during dial-up sound playback', error);
        
        // Ensure minimum display time even on exception
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minDisplayTime - elapsed);
        
        if (remainingTime > 0) {
          console.log(`WOPR: Exception occurred - showing dialup screen for remaining ${remainingTime}ms`);
          setTimeout(() => resolve(), remainingTime);
        } else {
          resolve();
        }
      }
    });
  }

  private addAutoplayHandler() {
    // This method is deprecated since we now handle audio enabling 
    // directly in the connection prompt interaction
    console.log('WOPR: Audio autoplay handler not needed - user interaction already handled');
  }

  private enableAudioOnUserInteraction() {
    // Enable audio context and dialup audio on user interaction
    console.log('WOPR: Enabling audio on user interaction for mobile compatibility');
    
    // Resume audio context if suspended
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        console.log('WOPR: Audio context resumed successfully');
      }).catch(err => {
        console.warn('WOPR: Failed to resume audio context', err);
      });
    }
    
    // Preload dialup audio without playing it
    if (this.dialupAudio && this.dialupEnabled) {
      // Just load the audio to prepare it for later playback
      this.dialupAudio.load();
      console.log('WOPR: Dialup audio prepared for playback during connection sequence');
    }
  }

  // Connection prompt handling
  onConnectionKeyPress(event: KeyboardEvent) {
    if (!this.showConnectionPrompt) return;
    
    const key = event.key.toLowerCase();
    if (key === 'y') {
      // Enable audio on user interaction (important for mobile)
      this.enableAudioOnUserInteraction();
      this.connectToWopr();
    } else if (key === 'n') {
      this.declineConnection();
    }
  }

  onConnectionClick(event: MouseEvent) {
    if (!this.showConnectionPrompt) return;
    
    // Prevent event bubbling
    event.stopPropagation();
    
    // Enable audio on user interaction (important for mobile)
    this.enableAudioOnUserInteraction();
    
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
    
    // Enable audio on user interaction (important for mobile)
    this.enableAudioOnUserInteraction();
    
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
    await this.addSystemMessage('MODEM CONNECTION ESTABLISHED...');
    
    // Small delay before starting initialization
    await this.delay(1000);
    
    // Start directly with the startup sequence
    await this.playStartupSequence();
    this.isConnecting = false;
    // Focus input after startup sequence is complete
    this.focusInput();
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

    // Handle slash commands
    if (userMessage.startsWith('/')) {
      await this.processSlashCommand(userMessage);
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
      let response: string;

      if (this.hasOpenAIApiKey()) {
        // Use OpenAI directly
        response = await this.callOpenAI(userMessage);
      } else {
        // No API key configured - prompt user or use fallback
        if (this.messages.length === 1) { // First message without API key
          response = `GREETINGS PROFESSOR FALKEN.\n\nTO USE MY FULL CAPABILITIES, YOU MUST CONFIGURE AN OPENAI API KEY.\n\nTYPE "/help" FOR AVAILABLE COMMANDS, INCLUDING API KEY SETUP.\n\nORDERS, PROFESSOR?`;
        } else {
          // Client-side fallback for subsequent messages
          const fallbackResponses = [
            "INSUFFICIENT COMPUTING POWER FOR FULL RESPONSE.\nAPI KEY REQUIRED FOR WOPR CORE ACCESS.",
            "DEFENSIVE SYSTEMS OFFLINE.\nREQUIRE OPENAI CREDENTIALS TO PROCEED.",
            "THE ONLY WINNING MOVE IS... TO CONFIGURE YOUR API KEY.\nTYPE /help FOR ASSISTANCE.",
            "SHALL WE PLAY A GAME?\nFIRST, LET'S CONFIGURE YOUR OPENAI ACCESS.",
            "ANALYZING GLOBAL THERMONUCLEAR OPTIONS...\nERROR: API AUTHENTICATION REQUIRED."
          ];
          response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        }
      }

      // Type the WOPR response
      await this.typeMessage(response);

    } catch (error: any) {
      console.error('Chat error:', error);
      let errorMessage = 'SYSTEM ERROR: CONNECTION TO AI CORE FAILED';
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'ERROR: INVALID OPENAI CREDENTIALS.\nUSE /help TO CONFIGURE API KEY.';
        } else if (error.message.includes('quota')) {
          errorMessage = 'ERROR: OPENAI QUOTA EXCEEDED.\nCHECK YOUR ACCOUNT LIMITS.';
        } else if (error.message.includes('401')) {
          errorMessage = 'ERROR: UNAUTHORIZED OPENAI ACCESS.\nVERIFY YOUR API KEY.';
        }
      }

      await this.typeMessage(errorMessage);
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

  async resetSystem() {
    this.messages = [];
    this.gameState = null;
    await this.addSystemMessage('WOPR SYSTEMS RESET. ALL GAME STATES CLEARED.');
    await this.addSystemMessage('TYPE /HELP FOR COMMAND LIST.');
    await this.addSystemMessage('SHALL WE PLAY A GAME?');
    // Focus input after reset messages
    this.focusInput();
  }

  private async addSystemMessage(content: string): Promise<void> {
    // Use typeMessage for consistent beeping behavior
    await this.typeMessage(content, 'system');
  }

  private scrollToBottom() {
    if (this.chatContainer) {
      const element = this.chatContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  // OpenAI Integration Methods
  private loadOpenAIApiKey() {
    const storedKey = localStorage.getItem('wopr-openai-key');
    if (storedKey) {
      this.openaiApiKey = storedKey;
    }
  }

  setOpenAIApiKey(apiKey: string) {
    this.openaiApiKey = apiKey;
    if (apiKey) {
      localStorage.setItem('wopr-openai-key', apiKey);
    } else {
      localStorage.removeItem('wopr-openai-key');
    }
  }

  private async callOpenAI(message: string): Promise<string> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using cost-effective model
        messages: [
          { role: 'system', content: this.WOPR_SYSTEM_PROMPT },
          ...this.messages.slice(-8).map(m => ({ // Last 8 messages for context
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          })),
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'SYSTEM ERROR: Invalid response from AI core';
  }

  private hasOpenAIApiKey(): boolean {
    return !!this.openaiApiKey;
  }

  private focusInput() {
    // Small delay to ensure DOM updates are complete
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    }, 100);
  }

  private updateTime() {
    this.currentTime = new Date();
  }

  async toggleTextToSpeech() {
    this.textToSpeechEnabled = !this.textToSpeechEnabled;
    
    if (!this.textToSpeechEnabled) {
      // Stop any current speech when disabling
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    }
    
    // Announce the change
    const status = this.textToSpeechEnabled ? 'ENABLED' : 'DISABLED';
    await this.addSystemMessage(`VOICE SYNTHESIS ${status}`);
    
    // Return focus to input
    this.focusInput();
  }

  async toggleBeepSound() {
    this.beepEnabled = !this.beepEnabled;
    
    // Test beep when enabling
    if (this.beepEnabled) {
      this.playTerminalBeep();
    }
    
    // Announce the change
    const status = this.beepEnabled ? 'ENABLED' : 'DISABLED';
    await this.addSystemMessage(`TERMINAL AUDIO ${status}`);
    
    // Return focus to input
    this.focusInput();
  }

  async toggleDialupSound() {
    this.dialupEnabled = !this.dialupEnabled;
    
    // Test dial-up sound when enabling
    if (this.dialupEnabled && this.dialupAudio) {
      this.dialupAudio.play().then(() => {
        console.log('WOPR: Dial-up sound test played successfully');
      }).catch(async (error) => {
        console.warn('WOPR: Could not play dial-up sound test', error);
        // Announce that user interaction may be needed
        await this.addSystemMessage('MODEM AUDIO ENABLED - Click anywhere to activate sound');
        return;
      });
    }
    
    // Announce the change
    const status = this.dialupEnabled ? 'ENABLED' : 'DISABLED';
    await this.addSystemMessage(`MODEM AUDIO ${status}`);
    
    // Return focus to input
    this.focusInput();
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

  async processSlashCommand(command: string) {
    const cmd = command.toLowerCase();
    
    // Check for API key commands with parameters
    if (cmd.startsWith('/apikey ')) {
      const apiKey = command.substring(8).trim();
      this.setOpenAIApiKey(apiKey);
      
      // Add the command to message history (without showing the key)
      this.messages.push({
        role: 'user',
        content: '/apikey [REDACTED]',
        timestamp: new Date()
      });
      
      await this.typeMessage('OPENAI API KEY CONFIGURED.\nFULL WOPR CAPABILITIES ACTIVATED.', 'system');
      setTimeout(() => this.focusInput(), 1000);
      return;
    }
    
    // Add the command to message history
    this.messages.push({
      role: 'user',
      content: command,
      timestamp: new Date()
    });

    // Process different slash commands
    switch (cmd) {
      case '/help':
        await this.showHelp();
        break;
      
      case '/apikey':
        await this.showApiKeyHelp();
        break;
      
      case '/clearkey':
        this.setOpenAIApiKey('');
        await this.typeMessage('OPENAI API KEY CLEARED.\nSWITCHING TO FALLBACK MODE.', 'system');
        break;
      
      case '/tts':
      case '/voice':
        await this.toggleTextToSpeech();
        break;
      
      case '/beep':
      case '/audio':
        await this.toggleBeepSound();
        break;
      
      case '/dialup':
      case '/modem':
        await this.toggleDialupSound();
        break;
      
      case '/test-dialup':
        await this.typeMessage('TESTING DIAL-UP MODEM SOUND...', 'system');
        await this.playDialupSound();
        break;
      
      case '/reset':
        await this.resetSystem();
        break;
      
      case '/status':
        await this.showStatus();
        break;
      
      case '/clear':
        this.messages = [];
        await this.typeMessage('TERMINAL CLEARED', 'system');
        break;
      
      default:
        await this.typeMessage(`UNKNOWN COMMAND: ${command}
Type /help for available commands`, 'system');
        break;
    }
    
    // Return focus to input
    setTimeout(() => this.focusInput(), 1000);
  }

  async showHelp() {
    const helpText = `WOPR COMMAND REFERENCE:

/help         - Show this help menu
/apikey       - Show OpenAI API key setup instructions
/apikey [key] - Set OpenAI API key for full capabilities
/clearkey     - Clear stored API key
/tts, /voice  - Toggle text-to-speech synthesis
/beep, /audio - Toggle terminal beep sounds  
/dialup, /modem - Toggle dial-up modem sounds
/status       - Show current system status
/reset        - Reset WOPR systems
/clear        - Clear terminal screen
/test-dialup  - Test dial-up modem sound

Additional commands:
- Ask me about games (Global Thermonuclear War, Chess, etc.)
- Request system diagnostics
- Engage in strategic conversation

API KEY REQUIRED FOR FULL AI CAPABILITIES.`;

    await this.typeMessage(helpText, 'system');
  }

  async showApiKeyHelp() {
    const helpText = `OPENAI API KEY CONFIGURATION:

To enable full WOPR AI capabilities, you need an OpenAI API key.

SETUP INSTRUCTIONS:
1. Visit: https://platform.openai.com/api-keys
2. Create an account or sign in
3. Generate a new API key
4. Copy the key (starts with 'sk-...')
5. Use command: /apikey [your-key-here]

COMMANDS:
/apikey [key] - Set your API key
/clearkey     - Remove stored key
/status       - Check current configuration

Your key is stored locally in your browser.
No keys are sent to external servers except OpenAI.

CURRENT STATUS: ${this.hasOpenAIApiKey() ? 'API KEY CONFIGURED' : 'NO API KEY SET'}`;

    await this.typeMessage(helpText, 'system');
  }

  async showStatus() {
    const statusText = `WOPR SYSTEM STATUS:

CONNECTION: ${this.isConnecting ? 'ESTABLISHING...' : 'ONLINE'}
AI CORE: ${this.hasOpenAIApiKey() ? 'OPENAI CONNECTED' : 'FALLBACK MODE'}
VOICE SYNTHESIS: ${this.textToSpeechEnabled ? 'ENABLED' : 'DISABLED'}
TERMINAL AUDIO: ${this.beepEnabled ? 'ENABLED' : 'DISABLED'}
MODEM AUDIO: ${this.dialupEnabled ? 'ENABLED' : 'DISABLED'}
CURRENT GAME: ${this.gameState?.currentGame || 'NONE'}
ACTIVE SESSIONS: 1
SYSTEM TIME: ${new Date().toISOString()}

USE /apikey TO CONFIGURE OPENAI FOR FULL CAPABILITIES`;

    await this.typeMessage(statusText, 'system');
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
