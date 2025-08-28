# WOPR Debugging Guide

## 🚀 Quick Start Debugging

Your WOPR workspace is now configured with proper debugging support! Here's how to use it:

### 1. Open VS Code with the Workspace
```powershell
code wopr-chatbot.code-workspace
```

### 2. Available Debug Configurations

**Main Debug Options (Press F5 or use Debug Panel):**

1. **🚀🌐 Launch Full Stack (Backend + Frontend)** ⭐ *Recommended*
   - Starts both backend API and Angular dev server
   - Perfect for full-stack debugging
   - Backend runs on `https://localhost:7000`
   - Frontend runs on `http://localhost:4200`

2. **🚀 Launch Backend (.NET Core)**
   - Debug just the .NET API
   - Set breakpoints in C# code
   - View API responses in Swagger UI

3. **🌐🔍 Debug Frontend in Chrome**
   - Debug Angular app in Chrome DevTools
   - Set breakpoints in TypeScript code
   - Inspect WOPR interface elements

4. **🧪 Run Playwright Tests**
   - Execute end-to-end tests
   - Debug test failures

### 3. How to Debug

#### Backend Debugging (.NET Core)
1. Open any `.cs` file (like `Controllers/ChatController.cs`)
2. Click in the left margin to set breakpoints (red dots)
3. Press **F5** and select "🚀 Launch Backend (.NET Core)"
4. Make API calls to hit your breakpoints
5. Use Debug Console to inspect variables

#### Frontend Debugging (Angular)
1. Open any `.ts` file (like `wopr-chat/wopr-chat.component.ts`)
2. Set breakpoints in TypeScript code
3. Press **F5** and select "🌐🔍 Debug Frontend in Chrome"
4. Chrome will open with DevTools attached
5. Interact with WOPR to hit breakpoints

#### Full Stack Debugging
1. Set breakpoints in both backend and frontend code
2. Press **F5** and select "🚀🌐 Launch Full Stack"
3. Both servers start automatically
4. Debug end-to-end from browser to API

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
1. Set breakpoint in `WoprChatService.SendMessageAsync()`
2. Set breakpoint in Angular `sendMessage()` method
3. Start full stack debugging
4. Send a message to WOPR
5. Step through both frontend and backend code

#### API Endpoints
1. Set breakpoints in `ChatController` methods
2. Use Swagger UI at `https://localhost:7000` to test endpoints
3. Inspect request/response data

#### Startup Sequence
1. Set breakpoints in `Program.cs` for backend startup
2. Set breakpoints in `wopr-chat.component.ts` `ngOnInit()`
3. Debug the complete initialization process

### 6. Troubleshooting

**Backend Not Starting:**
- Check user secrets are configured
- Verify port 7000 is not in use
- Check .NET 9 SDK is installed

**Frontend Not Starting:**
- Run `npm install` in frontend directory
- Check port 4200 is not in use
- Verify Node.js 18+ is installed

**Breakpoints Not Hitting:**
- Ensure source maps are enabled
- Check file paths in launch configuration
- Verify code is actually executing

### 7. Pro Tips

- **Multiple Terminals**: Debug panel creates separate terminals for each service
- **Hot Reload**: Both backend and frontend support hot reload during debugging
- **Chrome DevTools**: Use F12 in Chrome for advanced frontend debugging
- **Network Tab**: Monitor API calls between frontend and backend
- **Console Logs**: WOPR interface logs helpful debugging information

## 🎯 Ready to Debug WOPR!

Your debugging environment is now configured with:
- ✅ Proper launch configurations
- ✅ Task automation
- ✅ Source mapping
- ✅ Multi-project debugging
- ✅ Chrome integration

**Press F5 and select "🚀🌐 Launch Full Stack" to start debugging!**

---

*"The only winning move is to debug properly!"* - WOPR (probably)