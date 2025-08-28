# GitHub Pages Deployment

This workflow automatically deploys the WOPR frontend to GitHub Pages when changes are pushed to the `frontend/` directory.

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

## Workflow Details

The workflow:

1. Installs Node.js 20 and npm dependencies
2. Builds the Angular app with GitHub Pages base href
3. Configures and uploads to GitHub Pages
4. Deploys the built application

The frontend runs independently with built-in fallback messages, so no backend is required for the GitHub Pages deployment.

## Notes

- The deployed version uses client-side fallback messages since no backend is available on GitHub Pages
- All WOPR interactions work including the connection prompt, dial-up sounds, and CRT interface
- The app is fully functional as a standalone demonstration