# WOPR Chatbot API - User Secrets Configuration

To configure Azure OpenAI for local development, run the following commands:

```powershell
# Navigate to the backend directory
cd backend

# Set your Azure OpenAI endpoint
dotnet user-secrets set "AzureOpenAI:Endpoint" "https://your-resource-name.openai.azure.com/"

# Set your Azure OpenAI API key
dotnet user-secrets set "AzureOpenAI:ApiKey" "your-api-key-here"

# Set your deployment name (model deployment)
dotnet user-secrets set "AzureOpenAI:DeploymentName" "gpt-35-turbo"
```

## Required Azure OpenAI Configuration

1. **Endpoint**: Your Azure OpenAI resource endpoint
2. **API Key**: Your Azure OpenAI API key
3. **Deployment Name**: The name of your deployed model (e.g., gpt-35-turbo, gpt-4)

## For Azure App Service Deployment

When deploying to Azure App Service, configure these as Application Settings:

- `AzureOpenAI__Endpoint`
- `AzureOpenAI__ApiKey`
- `AzureOpenAI__DeploymentName`

## Note

The application will show warnings and may not function properly without proper Azure OpenAI configuration.