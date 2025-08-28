# WOPR Frontend - War Games 1983 Interface

This Angular 18+ application provides an authentic WOPR (War Operation Plan Response) computer interface emulation from the 1983 movie "WarGames". The frontend features CRT terminal styling, text-to-speech capabilities, terminal beeping sounds, and a dual-layer fallback system for complete resilience.

## 🎬 Features

### Authentic War Games Experience
- **CRT Terminal Styling**: Phosphor green glow, scan lines, and dot-matrix text effects
- **WOPR Personality**: Authentic responses and character behavior from the movie
- **Text-to-Speech**: Robotic voice synthesis for all WOPR messages
- **Terminal Beeping**: 800Hz square wave sounds synchronized with character typing
- **Input Cursor Blinking**: Classic terminal cursor animation

### Advanced Functionality
- **Dual-Layer Fallback**: Client-side WOPR messages when backend is unavailable
- **Smart Focus Management**: Automatic input focus restoration after operations
- **Audio Controls**: Toggle buttons for TTS and beeping sounds
- **Individual Message Replay**: Speak button for each WOPR response
- **Real-time Chat Interface**: Seamless communication with backend API

## 🚀 Development Server

To start the development server:

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you modify source files.

## 🏗️ Building

To build the project:

```bash
npm run build
# or
ng build
```

Build artifacts are stored in the `dist/wopr-frontend` directory. Production builds are optimized for performance.

## 🧪 Testing

### Unit Tests
Run unit tests with Karma:

```bash
npm test
# or
ng test
```

### End-to-End Tests
Run Playwright tests:

```bash
npm run test:e2e
# or
npx playwright test
```

### Install Playwright Browsers
If needed, install Playwright browser dependencies:

```bash
npx playwright install
```

## 🎨 Styling & Customization

### CRT Effects
The styling is located in:
- `src/styles.scss` - Global CRT effects and theme variables
- `src/app/wopr-chat/wopr-chat.scss` - Component-specific styling

### Audio Configuration
Audio features can be customized in `wopr-chat.ts`:
- **TTS Settings**: Voice rate, pitch, and volume
- **Beep Frequency**: Square wave oscillator frequency (default: 800Hz)
- **Timing**: Character typing delays and focus restoration timing

## 🔧 Development Tools

### VS Code Extensions
Recommended extensions for development:
- Angular Language Service
- Angular Snippets
- Playwright Test for VS Code
- SCSS IntelliSense

### Code Scaffolding
Generate new components:

```bash
ng generate component component-name
ng generate service service-name
ng generate model model-name
```

## 🌐 Backend Integration

The frontend connects to the .NET Core Web API backend running on `https://localhost:7000`. Key integration points:

- **Chat API**: `/api/chat/message` for WOPR conversations
- **Game State**: `/api/chat/gamestate` for tracking games
- **System Reset**: `/api/chat/reset` for clearing sessions
- **Health Check**: `/health` for backend availability

## 🔄 Fallback System

When the backend is unavailable, the frontend automatically switches to client-side fallback mode with 15 authentic WOPR messages, ensuring users always receive WOPR-style responses.

## 📱 Responsive Design

The interface adapts to different screen sizes while maintaining the authentic CRT terminal appearance across desktop, tablet, and mobile devices.

---

*"Shall we play a game?"* - WOPR, WarGames (1983)
