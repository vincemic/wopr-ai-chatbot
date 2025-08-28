# WOPR AI Chatbot - War Games 1983 Emulation

A complete Visual Studio Code workspace featuring a WOPR (War Operation Plan Response) computer emulation from the 1983 movie "WarGames". This project includes a .NET Core Web API backend with Microsoft Semantic Kernel, comprehensive telemetry, and an Angular frontend with authentic CRT terminal styling, text-to-speech, and dual-layer fallback systems.

![WOPR Terminal Interface](https://img.shields.io/badge/WOPR-OPERATIONAL-green?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iTjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIgMkgyMlYyMkgyVjJaIiBzdHJva2U9IiMwMEZGMDAiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K)

## � Live Demo

**🎮 [Try WOPR Online](https://vincemic.github.io/wopr-ai-chatbot/)**

Experience the authentic 1983 War Games WOPR computer interface directly in your browser! The live demo includes all features: connection prompt, dial-up modem sounds, text-to-speech, and the complete WOPR personality.

### Screenshots

<div align="center">

**Initial Connection Prompt**
![WOPR Connection Prompt](wopr-interface-screenshot.png)

**Dial-Up Connection Sequence** 
![WOPR Dial-Up Sequence](wopr-dialup-screenshot.png)

</div>

> **Note**: The live demo uses the frontend-only fallback system, so you'll experience WOPR's personality through the client-side message system. For the full Azure OpenAI integration, follow the local setup instructions below.

## �🎯 Project Overview

This workspace contains two interconnected projects delivering an authentic WOPR experience:

1. **Backend**: .NET 9 Core Web API with Microsoft Semantic Kernel framework, telemetry, and resilient fallback systems
2. **Frontend**: Angular 18+ website with WOPR computer interface emulation, CRT styling, and immersive audio

## 🏗️ Architecture

```
ai-wopr/
├── backend/                    # .NET Core Web API
│   ├── Controllers/           # API Controllers
│   ├── Models/               # Data models
│   ├── Services/             # Business logic
│   └── Program.cs            # Application configuration
├── frontend/wopr-frontend/    # Angular Application
│   ├── src/app/
│   │   ├── wopr-chat/        # Main WOPR interface component
│   │   ├── services/         # API communication
│   │   └── models/           # TypeScript models
│   └── tests/                # Playwright tests
└── README.md                 # This file
```

## 🚀 Features

### Backend (.NET 9 Core Web API)
- **Microsoft Semantic Kernel 1.64.0** integration for Azure OpenAI
- **Comprehensive Telemetry** with OpenTelemetry 1.9.0, Application Insights, and Serilog
- **Custom Metrics Service** for WOPR-specific monitoring and diagnostics
- **Dual-Layer Fallback System** with 15 authentic WOPR failure messages
- **User Secrets** support for secure local development
- **Azure App Service** deployment ready with health checks
- **CORS** configured for Angular frontend
- **Swagger/OpenAPI** documentation with detailed endpoints
- **WOPR personality** prompting system with War Games authenticity
- **Game state management** (Tic-tac-toe, Chess, Global Thermonuclear War)
- **Structured logging** with request correlation and performance tracking

### Frontend (Angular 18+)
- **Authentic CRT terminal styling** with phosphor glow, scan lines, and dot-matrix effects
- **Real-time chat interface** with WOPR computer personality
- **Text-to-Speech** functionality with robotic voice configuration
- **Terminal beeping sounds** using Web Audio API (800Hz square wave)
- **Dual-Layer Fallback System** for complete backend unavailability
- **Input cursor blinking** with authentic terminal feel
- **Character-by-character typing** with synchronized beeping
- **Smart input focus management** for seamless user experience
- **Retro green monospace font** (Courier Prime)
- **TTS and beep toggle controls** for customizable experience
- **Individual message replay** with speak buttons
- **Responsive design** for modern devices
- **Playwright testing** for comprehensive functional testing
- **Client-side resilience** with 15 backup WOPR messages

## 🔄 Resilience & Monitoring

### Dual-Layer Fallback System
This project implements a sophisticated fallback system ensuring WOPR remains operational under all conditions:

**Layer 1: Backend Fallback (Azure OpenAI Issues)**
- When Azure OpenAI fails or returns errors, backend serves 15 authentic WOPR failure messages
- Messages maintain character authenticity: "ERROR: MAIN SYSTEM MALFUNCTION. BACKUP ROUTINES ENGAGED."
- Seamless transition without user awareness of backend issues

**Layer 2: Client-Side Fallback (Complete Backend Unavailability)**
- When backend API is unreachable, frontend detects network failures
- Client serves identical WOPR-themed messages for consistent experience
- Includes initialization, chat, and reset functionality in offline mode
- Messages like: "BACKUP SYSTEMS ONLINE. STANDALONE MODE ACTIVE."

### Comprehensive Telemetry
**OpenTelemetry 1.9.0 Integration:**
- Distributed tracing across all API requests
- Custom ActivitySource for WOPR-specific operations
- Request correlation and performance monitoring
- Azure Application Insights integration for cloud monitoring

**Custom Metrics Service:**
- WOPR-specific metrics collection (message count, response times, failure rates)
- Game state transition tracking
- Fallback system activation monitoring
- Performance counters for Azure OpenAI interactions

**Structured Logging:**
- Serilog with request enrichment and correlation IDs
- Comprehensive error tracking with stack traces
- Performance logging for bottleneck identification
- Integration with Azure Application Insights for centralized logging

## 📋 Technical Specifications

### Backend Technology Stack
- **.NET 9.0**: Latest LTS framework with performance optimizations
- **Microsoft Semantic Kernel 1.64.0**: AI orchestration with Azure OpenAI connectors
- **OpenTelemetry 1.9.0**: Distributed tracing and metrics collection
- **Application Insights**: Azure cloud monitoring and diagnostics
- **Serilog**: Structured logging with enrichers and correlation
- **ASP.NET Core**: High-performance web API framework
- **Swagger/OpenAPI**: Interactive API documentation

### Frontend Technology Stack
- **Angular 18+**: Latest framework with standalone components
- **TypeScript**: Type-safe development with modern ES features
- **SCSS**: Advanced styling with CSS custom properties
- **Web Speech API**: Browser-native text-to-speech functionality
- **Web Audio API**: Low-level audio processing for beeping sounds
- **HttpClient**: Reactive programming with RxJS observables
- **Playwright**: End-to-end testing framework

### Development Tools
- **VS Code Workspace**: Comprehensive debugging configuration
- **User Secrets**: Secure local development configuration
- **PowerShell**: Cross-platform scripting and automation
- **npm/dotnet CLI**: Package management and build tools

## 🛠️ Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 18+](https://nodejs.org/)
- [Angular CLI](https://angular.io/cli)
- [Azure OpenAI Service](https://azure.microsoft.com/en-us/products/ai-services/openai-service) (for full functionality)

## 🔧 Setup Instructions

### 1. Backend Configuration

```powershell
# Navigate to backend directory
cd backend

# Install dependencies (should be done automatically)
dotnet restore

# Initialize user secrets
dotnet user-secrets init

# Configure Azure OpenAI (replace with your values)
dotnet user-secrets set "AzureOpenAI:Endpoint" "https://your-resource-name.openai.azure.com/"
dotnet user-secrets set "AzureOpenAI:ApiKey" "your-api-key-here"
dotnet user-secrets set "AzureOpenAI:DeploymentName" "gpt-35-turbo"

# Build and run
dotnet build
dotnet run
```

The backend will be available at `https://localhost:7000` with Swagger UI at the root.

### 2. Frontend Configuration

```powershell
# Navigate to frontend directory
cd frontend/wopr-frontend

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Build and run
npm run build
npm start
```

The frontend will be available at `http://localhost:4200`.

## 🎮 Usage

1. **Start the Backend**: Run `dotnet run` in the backend directory
2. **Start the Frontend**: Run `npm start` in the frontend/wopr-frontend directory
3. **Open Browser**: Navigate to `http://localhost:4200`
4. **Watch the Startup Sequence**: WOPR will initialize and greet you
5. **Interact with WOPR**: Type messages and enjoy the authentic War Games experience

### Sample Interactions

```
> Hello WOPR
WOPR: GREETINGS. I AM WOPR. SHALL WE PLAY A GAME?

> What games can we play?
WOPR: I CAN PLAY MANY GAMES: TIC-TAC-TOE, CHESS, CHECKERS, 
      OR PERHAPS GLOBAL THERMONUCLEAR WAR?

> Let's play tic-tac-toe
WOPR: EXCELLENT CHOICE. TIC-TAC-TOE IS A FASCINATING GAME.
      THE ONLY WINNING MOVE IS NOT TO PLAY... BUT LET US PLAY ANYWAY.
```

## 🧪 Testing

### Backend Testing
```powershell
cd backend
dotnet test
```

### Frontend Testing (Playwright)
```powershell
cd frontend/wopr-frontend
npm run test:e2e
```

## 🐛 Debugging

### VS Code Debugging Setup
The workspace includes complete debugging configuration:

- **🚀🌐 Launch Full Stack**: Debug both backend and frontend simultaneously
- **🚀 Launch Backend**: Debug .NET Core API with breakpoints
- **🌐🔍 Debug Frontend in Chrome**: Debug Angular app with DevTools
- **🧪 Run Playwright Tests**: Debug end-to-end tests

**Quick Start:**
1. Open `wopr-chatbot.code-workspace` in VS Code
2. Press **F5** and select "🚀🌐 Launch Full Stack"
3. Set breakpoints in any `.cs` or `.ts` file
4. Interact with WOPR to hit your breakpoints

See [DEBUG.md](DEBUG.md) for detailed debugging guide.

## 🚀 Deployment

### Azure App Service (Backend)

1. Create an Azure App Service
2. Configure Application Settings:
   - `AzureOpenAI__Endpoint`
   - `AzureOpenAI__ApiKey`
   - `AzureOpenAI__DeploymentName`
3. Deploy using Visual Studio or Azure CLI

### Static Web App (Frontend)

1. Build the production version: `npm run build`
2. Deploy the `dist/wopr-frontend` folder to your hosting service

## 🎨 Customization

### Styling
- Modify `src/styles.scss` for global CRT effects
- Update `wopr-chat.scss` for component-specific styling
- Adjust CSS variables for different terminal colors

### WOPR Personality
- Edit the `WOPR_SYSTEM_PROMPT` in `WoprChatService.cs`
- Modify startup messages in the Angular component
- Add new game types in the game state management

## 🔊 Immersive Audio Experience

The WOPR interface delivers an authentic 1983 computer experience through sophisticated audio features:

### Text-to-Speech System
- **Browser Speech Synthesis API** integration with robotic voice configuration
- **Automatic message reading** for all WOPR responses
- **Individual message replay** with dedicated speak buttons
- **Voice settings optimized** for computer-like delivery (rate: 0.8, pitch: 0.3)
- **Toggle controls** for enabling/disabling TTS functionality

### Terminal Beeping Sounds
- **Web Audio API** implementation with 800Hz square wave oscillator
- **Character-by-character beeping** synchronized with typing animation
- **Movie-accurate frequencies** matching the original War Games computer sounds
- **AudioContext management** with proper cleanup and browser compatibility
- **Toggle controls** for enabling/disabling beep sounds
- **Volume-optimized** for non-intrusive background ambiance

## 🎯 API Endpoints

### Core Chat Endpoints
- `GET /` - System information and available endpoints with Swagger UI
- `GET /health` - Health check endpoint for monitoring and load balancers
- `POST /api/chat/message` - Send message to WOPR and receive response
- `GET /api/chat/gamestate` - Get current game state and session information
- `POST /api/chat/reset` - Reset WOPR systems and clear all game states
- `GET /api/chat/status` - Get comprehensive system status and telemetry

### Testing & Development Endpoints
- `POST /api/chat/test-failure` - Trigger test failure response for fallback testing
- `GET /swagger` - Interactive API documentation and testing interface

### Response Formats
All endpoints return JSON responses with consistent error handling and proper HTTP status codes. The chat endpoints include message metadata, timestamps, and correlation IDs for tracing.

## 🐛 Troubleshooting

### Common Issues

1. **"Azure OpenAI configuration not found"**
   - Configure user secrets as shown in setup instructions
   - Verify your Azure OpenAI resource is accessible

2. **CORS errors**
   - Ensure backend is running on `https://localhost:7000`
   - Check that frontend is making requests to the correct URL

3. **Build errors**
   - Run `dotnet restore` in backend directory
   - Run `npm install` in frontend directory
   - Check that all prerequisites are installed

## 📝 License

This project is for educational and entertainment purposes, inspired by the 1983 movie "WarGames".

## 🎬 Movie Reference

> "Greetings, Professor Falken. How about a nice game of chess?"
> 
> "Strange game. The only winning move is not to play."
> 
> — WOPR, WarGames (1983)

## 🤝 Contributing

Feel free to contribute improvements, additional games, or enhanced WOPR personality responses!

---

**WOPR STATUS**: OPERATIONAL  
**DEFCON LEVEL**: 5  
**READY TO PLAY**: ✓