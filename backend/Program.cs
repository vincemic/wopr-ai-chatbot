using Microsoft.SemanticKernel;
using WoprChatbotApi.Services;
using WoprChatbotApi.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Add telemetry services
builder.AddTelemetry();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS for development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
});

// Configure Semantic Kernel
var kernelBuilder = Kernel.CreateBuilder();

// Get Azure OpenAI configuration from user secrets or environment
var endpoint = builder.Configuration["AzureOpenAI:Endpoint"];
var apiKey = builder.Configuration["AzureOpenAI:ApiKey"];
var deploymentName = builder.Configuration["AzureOpenAI:DeploymentName"];

if (!string.IsNullOrEmpty(endpoint) && !string.IsNullOrEmpty(apiKey) && !string.IsNullOrEmpty(deploymentName))
{
    kernelBuilder.AddAzureOpenAIChatCompletion(
        deploymentName: deploymentName,
        endpoint: endpoint,
        apiKey: apiKey);
}
else
{
    // Fallback for development - log warning about missing configuration
    Console.WriteLine("WARNING: Azure OpenAI configuration not found. Please configure user secrets.");
    Console.WriteLine("Run: dotnet user-secrets set \"AzureOpenAI:Endpoint\" \"your-endpoint\"");
    Console.WriteLine("Run: dotnet user-secrets set \"AzureOpenAI:ApiKey\" \"your-api-key\"");
    Console.WriteLine("Run: dotnet user-secrets set \"AzureOpenAI:DeploymentName\" \"your-deployment-name\"");
}

var kernel = kernelBuilder.Build();
builder.Services.AddSingleton(kernel);

// Register WOPR services
builder.Services.AddScoped<IWoprChatService, WoprChatService>();
builder.Services.AddSingleton<IWoprMetricsService, WoprMetricsService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "WOPR Chatbot API v1");
        c.RoutePrefix = string.Empty; // Set Swagger UI at the app's root
    });
}

app.UseCors("AllowAngularApp");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => new { 
    status = "Healthy", 
    timestamp = DateTime.UtcNow,
    system = "WOPR Chatbot API"
});

// Root endpoint with system info
app.MapGet("/", () => new
{
    system = "WOPR",
    fullName = "War Operation Plan Response",
    version = "1.0.0",
    status = "OPERATIONAL",
    message = "Greetings Professor Falken. Shall we play a game?",
    endpoints = new[]
    {
        "/swagger - API Documentation",
        "/api/chat/message - Send message to WOPR",
        "/api/chat/gamestate - Get current game state",
        "/api/chat/reset - Reset WOPR systems",
        "/api/chat/status - Get system status",
        "/health - Health check"
    }
});

app.Run();