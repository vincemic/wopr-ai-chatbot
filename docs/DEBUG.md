# WOPR Debugging Guide

## 🚀 Quick Start Debugging

Your WOPR workspace is now configured with proper debugging support for the **frontend-only architecture**! Here's how to use it:

### 1. Open VS Code with the Workspace

```powershell
code wopr-chatbot.code-workspace
```

### 2. Available Debug Configurations

**Main Debug Options (Press F5 or use Debug Panel):**

1. **🌐🔍 Debug Frontend in Chrome** ⭐ *Recommended*
   - Debug Angular app in Chrome DevTools
   - Set breakpoints in TypeScript code
   - Inspect WOPR interface elements
   - Frontend runs on `http://localhost:4200`

2. **🧪 Run Playwright Tests**
   - Execute end-to-end tests
   - Debug test failures
   - Validate OpenAI integration and fallback systems

### 3. How to Debug

#### Frontend Debugging (Angular)

1. Open any `.ts` file (like `wopr-chat/wopr-chat.component.ts`)
2. Set breakpoints in TypeScript code
3. Press **F5** and select "🌐🔍 Debug Frontend in Chrome"
4. Chrome will open with DevTools attached
5. Interact with WOPR to hit breakpoints

#### OpenAI Integration Debugging

1. Set breakpoints in OpenAI service methods
2. Start frontend debugging
3. Configure API key using `/apikey` command
4. Send messages to debug API integration
5. Monitor network requests in DevTools

### 4. VS Code Debug Features

**Debug Panel (Ctrl+Shift+D):**

- View call stack
- Inspect variables
- Watch expressions
- Control execution (step over, step into, continue)

**Debug Console:**

- Execute code in debug context
- Inspect object properties
- Test API calls

**Breakpoint Management:**

- Set conditional breakpoints
- Add logpoints (console.log without code changes)
- Disable/enable breakpoints

### 5. Debugging Scenarios

#### WOPR Chat Messages

1. Set breakpoint in `sendMessage()` method
2. Set breakpoint in OpenAI service call
3. Start frontend debugging
4. Send a message to WOPR
5. Step through message processing and API integration

#### Slash Commands

1. Set breakpoints in command processing methods
2. Test `/help`, `/apikey`, `/tts`, `/beep`, `/dialup`, `/reset` commands
3. Debug command parsing and validation

#### Startup Sequence

1. Set breakpoints in `wopr-chat.component.ts` `ngOnInit()`
2. Debug the complete initialization process
3. Monitor connection prompt and audio initialization

### 6. Troubleshooting

**Frontend Not Starting:**

- Run `npm install` in frontend directory
- Check port 4200 is not in use
- Verify Node.js 18+ is installed

**Breakpoints Not Hitting:**

- Ensure source maps are enabled
- Check file paths in launch configuration
- Verify code is actually executing

**OpenAI Integration Issues:**

- Check API key configuration in localStorage
- Monitor network requests in DevTools
- Verify CORS settings for direct API calls

### 7. Pro Tips

- **Chrome DevTools**: Use F12 in Chrome for advanced frontend debugging
- **Network Tab**: Monitor OpenAI API calls and responses
- **Console Logs**: WOPR interface logs helpful debugging information
- **Local Storage**: Inspect stored API keys and configuration
- **Audio Context**: Debug Web Audio API and speech synthesis issues

## 🎯 Ready to Debug WOPR!

Your debugging environment is now configured with:

- ✅ Frontend debugging configurations
- ✅ Task automation
- ✅ Source mapping
- ✅ Chrome integration
- ✅ OpenAI integration testing

**Press F5 and select "🌐🔍 Debug Frontend in Chrome" to start debugging!**

---

*"The only winning move is to debug properly!"* - WOPR (probably)