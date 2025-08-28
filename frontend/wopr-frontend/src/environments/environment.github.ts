// GitHub Pages environment (static hosting with fallback)
export const environment = {
  production: true,
  apiUrl: 'https://wopr-chatbot-api.azurewebsites.net/api', // Future Azure deployment URL
  healthUrl: 'https://wopr-chatbot-api.azurewebsites.net',
  appName: 'WOPR Chatbot (GitHub Pages)',
  enableLogging: false,
  enableTelemetry: false, // Disable telemetry for static hosting
  githubPages: true,
  fallbackMode: true, // Enable fallback behavior when backend is unavailable
  staticMode: true // Enable static-only features
};