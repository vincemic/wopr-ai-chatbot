# GitHub Pages Deployment

This workflow automatically deploys the WOPR **frontend-only application** to GitHub Pages when changes are pushed to the `frontend/` directory.

## Frontend-Only Architecture

This project uses a **frontend-only architecture** with:

- **Direct OpenAI Integration**: Browser-to-OpenAI API communication
- **No Backend Required**: Complete WOPR experience runs in the browser
- **User-Provided API Keys**: Secure localStorage-based API key management
- **Static Hosting Friendly**: Perfect for GitHub Pages deployment

## Setup Instructions

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions
   - This will allow the workflow to deploy to Pages

2. **Repository Settings**:
   - The workflow expects your repository to be named `wopr-ai-chatbot`
   - If your repository has a different name, update the `--base-href` in `.github/workflows/deploy-frontend.yml`

3. **Automatic Deployment**:
   - Pushes to `main` branch that modify `frontend/` files trigger deployment
   - Manual deployment is available via the "Actions" tab → "Deploy Frontend to GitHub Pages" → "Run workflow"

## Access Your Deployed App

After successful deployment, your WOPR chatbot will be available at:

```url
https://[your-username].github.io/wopr-ai-chatbot/
```

## Features

- ✅ Automatic build and deployment on push
- ✅ Angular SPA routing support for GitHub Pages  
- ✅ Optimized production build with proper base href
- ✅ Manual deployment trigger available
- ✅ Only deploys when frontend files change
- ✅ **No backend required** - runs entirely in the browser

## Workflow Details

The workflow:

1. Installs Node.js 20 and npm dependencies
2. Builds the Angular app with GitHub Pages base href
3. Configures and uploads to GitHub Pages
4. Deploys the built application

## Notes

- **Frontend-Only**: No backend server required - the app runs entirely in the browser
- **OpenAI Integration**: Users provide their own OpenAI API keys for full functionality
- **Fallback System**: Includes helpful guidance when no API key is configured
- **Complete WOPR Experience**: All features work including connection prompt, dial-up sounds, and CRT interface
- **Production Ready**: Fully functional as a standalone demonstration