// Production environment (GitHub Pages hosting)
export const environment = {
  production: true,
  apiUrl: 'https://wopr-chatbot-api.azurewebsites.net/api', // Future Azure deployment URL
  healthUrl: 'https://wopr-chatbot-api.azurewebsites.net',
  appName: 'WOPR Chatbot',
  enableLogging: false,
  enableTelemetry: true,
  githubPages: true
};