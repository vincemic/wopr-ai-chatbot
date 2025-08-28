# Angular Environment Configuration

This document describes the environment configurations for the WOPR Chatbot Angular application.

## Environment Files

### 1. `environment.ts` (Default/Base)
- **Purpose**: Default development environment
- **API URL**: `https://localhost:7000/api`
- **Features**: Logging enabled, telemetry enabled
- **Usage**: Default environment when no specific configuration is selected

### 2. `environment.development.ts`
- **Purpose**: Explicit development environment
- **API URL**: `https://localhost:7000/api`
- **Features**: Logging enabled, telemetry enabled, shows "(Dev)" in app name
- **Usage**: For local development with `ng serve --configuration development`

### 3. `environment.production.ts`
- **Purpose**: Production deployment to Azure or other cloud platforms
- **API URL**: `https://wopr-chatbot-api.azurewebsites.net/api` (placeholder for future deployment)
- **Features**: Logging disabled, telemetry enabled, production optimizations
- **Usage**: For production deployments with `ng build --configuration production`

### 4. `environment.github.ts`
- **Purpose**: GitHub Pages static hosting
- **API URL**: `https://wopr-chatbot-api.azurewebsites.net/api` (with fallback behavior)
- **Features**: Logging disabled, telemetry disabled, static mode enabled, fallback mode enabled
- **Usage**: For GitHub Pages deployment with `ng build --configuration github`

## Build Configurations

### Available npm scripts:
- `npm start` or `npm run start:dev` - Development server
- `npm run build:dev` - Development build
- `npm run build:prod` - Production build
- `npm run build:github` - GitHub Pages build (includes baseHref)

### Angular CLI commands:
- `ng serve --configuration development` - Development server
- `ng serve --configuration github` - GitHub Pages simulation
- `ng build --configuration development` - Development build
- `ng build --configuration production` - Production build
- `ng build --configuration github` - GitHub Pages build

## Features

### Environment-based Configuration
- **API URLs**: Different backend endpoints for each environment
- **Logging**: Controlled by environment settings
- **App Naming**: Environment-specific titles
- **Base Href**: Automatic GitHub Pages path configuration

### Development Features
- **Development Banner**: Orange banner showing current environment and API URL (only in non-production)
- **Enhanced Logging**: Detailed error logging in development
- **Source Maps**: Available in development builds

### GitHub Pages Features
- **Base Href**: Automatically set to `/wopr-ai-chatbot/`
- **Static Mode**: Optimized for static hosting
- **Fallback Mode**: Graceful degradation when backend is unavailable
- **Reduced Telemetry**: Disabled for privacy in static hosting

## Configuration Updates

### Files Modified:
1. **angular.json**: Added environment file replacements and GitHub configuration
2. **WoprApi service**: Updated to use environment-based URLs and logging
3. **App component**: Added environment information and development banner
4. **GitHub Actions**: Updated to use GitHub environment configuration
5. **package.json**: Added convenient build scripts

### GitHub Actions Integration
The deployment workflow now uses:
```bash
npm run build -- --configuration github
```

This automatically applies the correct environment settings and base href for GitHub Pages.

## Usage Examples

### Local Development
```bash
# Start development server
npm run start:dev

# Build for development
npm run build:dev
```

### GitHub Pages Testing
```bash
# Build for GitHub Pages
npm run build:github

# Serve GitHub Pages build locally
ng serve --configuration github
```

### Production Deployment
```bash
# Build for production
npm run build:prod
```

## Environment Properties

| Property | Development | Production | GitHub Pages |
|----------|-------------|------------|--------------|
| `production` | false | true | true |
| `apiUrl` | localhost:7000 | azurewebsites.net | azurewebsites.net |
| `enableLogging` | true | false | false |
| `enableTelemetry` | true | true | false |
| `githubPages` | false | false | true |
| `fallbackMode` | undefined | undefined | true |
| `staticMode` | undefined | undefined | true |