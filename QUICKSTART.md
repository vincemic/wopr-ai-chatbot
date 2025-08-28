# WOPR Chatbot - Quick Start Guide

## 🚀 Ready to Play?

Your WOPR chatbot workspace is now complete! Here's how to get it running:

### 1. Open the Workspace
```powershell
# Open the workspace file in VS Code
code wopr-chatbot.code-workspace
```

### 2. Configure Azure OpenAI (Required for full functionality)
```powershell
# Navigate to backend directory
cd backend

# Set up your Azure OpenAI credentials
dotnet user-secrets set "AzureOpenAI:Endpoint" "https://your-resource-name.openai.azure.com/"
dotnet user-secrets set "AzureOpenAI:ApiKey" "your-api-key-here"
dotnet user-secrets set "AzureOpenAI:DeploymentName" "gpt-35-turbo"
```

### 3. Start the Backend
```powershell
# In VS Code terminal or separate PowerShell window
cd backend
dotnet run
```
Backend will be available at: `https://localhost:7000`

### 4. Start the Frontend
```powershell
# In a new terminal window
cd frontend/wopr-frontend
npm start
```
Frontend will be available at: `http://localhost:4200`

### 5. Experience WOPR!
1. Open your browser to `http://localhost:4200`
2. Watch the WOPR startup sequence
3. Start chatting with the computer from WarGames!

## 🐛 Debugging (VS Code)

### Quick Debug Start
1. Open workspace: `code wopr-chatbot.code-workspace`
2. Press **F5** in VS Code
3. Select "🚀🌐 Launch Full Stack (Backend + Frontend)"
4. Set breakpoints in `.cs` or `.ts` files
5. Interact with WOPR to hit breakpoints

### Available Debug Configurations
- **🚀🌐 Launch Full Stack**: Debug both projects simultaneously
- **🚀 Launch Backend**: Debug .NET API only
- **🌐🔍 Debug Frontend in Chrome**: Debug Angular with DevTools
- **🧪 Run Playwright Tests**: Debug end-to-end tests

See [DEBUG.md](DEBUG.md) for complete debugging guide.

## 🎮 Sample Commands

```
> Hello WOPR
> Shall we play a game?
> What games can you play?
> Let's play tic-tac-toe
> How about Global Thermonuclear War?
> What is the meaning of life?
```

## 🔧 VS Code Tasks Available

- **Build Backend**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Build Backend"
- **Run Backend**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Run Backend" 
- **Start Frontend**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Start Frontend"
- **Start Full Stack**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Start Full Stack"
- **Run Tests**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Run Playwright Tests"

## 🎬 The WOPR Experience

> "Greetings, Professor Falken."
> 
> "Would you like to play a game?"
> 
> "How about a nice game of chess?"

Your WOPR chatbot includes:
- ✅ Authentic WarGames personality
- ✅ CRT terminal styling with scan lines
- ✅ Text-to-speech with computer voice
- ✅ Multiple game modes (Tic-tac-toe, Chess, etc.)
- ✅ Realistic typing animations
- ✅ Azure OpenAI integration

**WOPR STATUS**: OPERATIONAL
**DEFCON LEVEL**: 5
**READY TO PLAY**: ✓

---

*"Strange game. The only winning move is not to play."*