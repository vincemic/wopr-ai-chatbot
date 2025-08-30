# WOPR Chatbot - Quick Start Guide

## 🚀 Ready to Play?

Your WOPR chatbot workspace is now complete! This is a **frontend-only application** with direct OpenAI integration. Here's how to get it running:

### 1. Open the Workspace
```powershell
# Open the workspace file in VS Code
code wopr-chatbot.code-workspace
```

### 2. Setup Frontend Dependencies
```powershell
# Navigate to frontend directory
cd frontend/wopr-frontend

# Install dependencies
npm install

# Install Playwright browsers (for testing)
npx playwright install
```

### 3. Start the Frontend
```powershell
# Start development server
npm start
```
Frontend will be available at: `http://localhost:4200`

### 4. Configure OpenAI API Key
1. **Get your API key** from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Connect to WOPR** by clicking "CONNECT TO WOPR" or pressing 'Y'
3. **Set your API key** using the command: `/apikey sk-your-api-key-here`
4. **Start chatting** with the full WOPR AI personality!

### 5. Experience WOPR!
1. Open your browser to `http://localhost:4200`
2. Watch the WOPR startup sequence
3. Configure your OpenAI API key when prompted
4. Start chatting with the computer from WarGames!

## 🐛 Debugging (VS Code)

### Quick Debug Start

1. Open workspace: `code wopr-chatbot.code-workspace`
2. Press **F5** in VS Code
3. Select "🌐🔍 Debug Frontend in Chrome"
4. Set breakpoints in `.ts` files
5. Interact with WOPR to hit breakpoints

### Available Debug Configurations

- **🌐🔍 Debug Frontend in Chrome**: Debug Angular with DevTools
- **🧪 Run Playwright Tests**: Debug end-to-end tests

See [DEBUG.md](DEBUG.md) for complete debugging guide.

## 🎮 Sample Commands

```text
> Hello WOPR
> /help
> /apikey sk-your-key-here
> Shall we play a game?
> What games can you play?
> Let's play tic-tac-toe
> How about Global Thermonuclear War?
> What is the meaning of life?
```

## 🔧 VS Code Tasks Available

- **Start Frontend**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Start Frontend"
- **Build Frontend**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Build Frontend"
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
- ✅ Direct OpenAI integration
- ✅ Frontend-only architecture

**WOPR STATUS**: OPERATIONAL  
**DEFCON LEVEL**: 5  
**READY TO PLAY**: ✓

---

*"Strange game. The only winning move is not to play."*