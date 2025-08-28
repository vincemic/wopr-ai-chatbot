using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog;
using Serilog.Events;
using System.Diagnostics;

namespace WoprChatbotApi.Configuration;

public static class TelemetryConfiguration
{
    private const string ServiceName = "WOPR-Chatbot-API";
    private const string ServiceVersion = "1.0.0";

    public static ActivitySource ActivitySource { get; } = new(ServiceName);

    public static WebApplicationBuilder AddTelemetry(this WebApplicationBuilder builder)
    {
        // Configure Serilog
        ConfigureSerilog(builder);

        // Configure OpenTelemetry
        ConfigureOpenTelemetry(builder);

        // Configure Application Insights
        ConfigureApplicationInsights(builder);

        return builder;
    }

    private static void ConfigureSerilog(WebApplicationBuilder builder)
    {
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
            .MinimumLevel.Override("Microsoft.SemanticKernel", LogEventLevel.Information)
            .Enrich.FromLogContext()
            .Enrich.WithProperty("ServiceName", ServiceName)
            .Enrich.WithProperty("ServiceVersion", ServiceVersion)
            .Enrich.WithEnvironmentName()
            .Enrich.WithProcessId()
            .Enrich.WithProcessName()
            .Enrich.WithThreadId()
            .WriteTo.Console(outputTemplate:
                "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}: {Message:lj} " +
                "{Properties:j}{NewLine}{Exception}")
            .WriteTo.ApplicationInsights(
                builder.Configuration.GetConnectionString("ApplicationInsights") ?? "InstrumentationKey=00000000-0000-0000-0000-000000000000",
                TelemetryConverter.Traces)
            .CreateLogger();

        builder.Host.UseSerilog();
    }

    private static void ConfigureOpenTelemetry(WebApplicationBuilder builder)
    {
        var resourceBuilder = ResourceBuilder.CreateDefault()
            .AddService(ServiceName, ServiceVersion)
            .AddAttributes([
                new("deployment.environment", builder.Environment.EnvironmentName),
                new("service.instance.id", Environment.MachineName),
                new("wopr.version", "1983-WarGames-Edition")
            ]);

        builder.Services.AddOpenTelemetry()
            .ConfigureResource(resource => resource
                .AddService(ServiceName, serviceVersion: ServiceVersion)
                .AddAttributes([
                    new("deployment.environment", builder.Environment.EnvironmentName),
                    new("service.instance.id", Environment.MachineName),
                    new("wopr.version", "1983-WarGames-Edition")
                ]))
            .WithTracing(tracing =>
            {
                tracing
                    .AddSource(ServiceName)
                    .AddSource("Microsoft.SemanticKernel*")
                    .AddAspNetCoreInstrumentation(options =>
                    {
                        options.RecordException = true;
                        options.EnrichWithHttpRequest = EnrichHttpRequest;
                        options.EnrichWithHttpResponse = EnrichHttpResponse;
                    })
                    .AddHttpClientInstrumentation(options =>
                    {
                        options.RecordException = true;
                        options.EnrichWithHttpRequestMessage = EnrichHttpRequestMessage;
                        options.EnrichWithHttpResponseMessage = EnrichHttpResponseMessage;
                    })
                    .AddConsoleExporter()
                    .AddOtlpExporter();

                // Add Application Insights if connection string is available
                var aiConnectionString = builder.Configuration.GetConnectionString("ApplicationInsights");
                if (!string.IsNullOrEmpty(aiConnectionString))
                {
                    // Application Insights automatically integrates with OpenTelemetry
                }
            })
            .WithMetrics(metrics =>
            {
                metrics
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddRuntimeInstrumentation()
                    .AddMeter("WOPR.Chatbot.Metrics")
                    .AddConsoleExporter()
                    .AddOtlpExporter();
            });
    }

    private static void ConfigureApplicationInsights(WebApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("ApplicationInsights");
        if (!string.IsNullOrEmpty(connectionString))
        {
            builder.Services.AddApplicationInsightsTelemetry(options =>
            {
                options.ConnectionString = connectionString;
                options.EnableAdaptiveSampling = true;
                options.EnableQuickPulseMetricStream = true;
                options.EnableDebugLogger = builder.Environment.IsDevelopment();
            });
        }
    }

    private static void EnrichHttpRequest(Activity activity, HttpRequest request)
    {
        activity.SetTag("wopr.request.user_agent", request.Headers.UserAgent.ToString());
        activity.SetTag("wopr.request.content_type", request.ContentType);
        activity.SetTag("wopr.request.content_length", request.ContentLength?.ToString());

        // Add WOPR-specific tags for chat requests
        if (request.Path.StartsWithSegments("/api/chat"))
        {
            activity.SetTag("wopr.operation", "chat");
            activity.SetTag("wopr.endpoint", request.Path.Value);
        }
    }

    private static void EnrichHttpResponse(Activity activity, HttpResponse response)
    {
        activity.SetTag("wopr.response.content_type", response.ContentType);
        activity.SetTag("wopr.response.content_length", response.ContentLength?.ToString());
    }

    private static void EnrichHttpRequestMessage(Activity activity, HttpRequestMessage request)
    {
        activity.SetTag("wopr.http.request.method", request.Method.ToString());
        activity.SetTag("wopr.http.request.uri", request.RequestUri?.ToString());

        // Detect Azure OpenAI calls
        if (request.RequestUri?.Host.Contains("openai.azure.com") == true)
        {
            activity.SetTag("wopr.ai.provider", "Azure OpenAI");
            activity.SetTag("wopr.ai.operation", "completion");
        }
    }

    private static void EnrichHttpResponseMessage(Activity activity, HttpResponseMessage response)
    {
        activity.SetTag("wopr.http.response.status_code", ((int)response.StatusCode).ToString());
        activity.SetTag("wopr.http.response.reason_phrase", response.ReasonPhrase);

        // Track token usage from Azure OpenAI responses
        if (response.Headers.Contains("x-ratelimit-remaining-tokens"))
        {
            activity.SetTag("wopr.ai.tokens.remaining",
                response.Headers.GetValues("x-ratelimit-remaining-tokens").FirstOrDefault());
        }
    }
}

public static class TelemetryExtensions
{
    public static IDisposable StartWoprActivity(this Microsoft.Extensions.Logging.ILogger logger, string operationName, object? parameters = null)
    {
        var activity = TelemetryConfiguration.ActivitySource.StartActivity(operationName);

        if (activity != null && parameters != null)
        {
            foreach (var prop in parameters.GetType().GetProperties())
            {
                var value = prop.GetValue(parameters)?.ToString();
                if (!string.IsNullOrEmpty(value))
                {
                    activity.SetTag($"wopr.{prop.Name.ToLowerInvariant()}", value);
                }
            }
        }

        logger.LogInformation("WOPR Operation Started: {OperationName}", operationName);

        return new WoprActivityScope(activity, logger, operationName);
    }
}

internal class WoprActivityScope : IDisposable
{
    private readonly Activity? _activity;
    private readonly Microsoft.Extensions.Logging.ILogger _logger;
    private readonly string _operationName;
    private readonly DateTime _startTime;

    public WoprActivityScope(Activity? activity, Microsoft.Extensions.Logging.ILogger logger, string operationName)
    {
        _activity = activity;
        _logger = logger;
        _operationName = operationName;
        _startTime = DateTime.UtcNow;
    }

    public void Dispose()
    {
        var duration = DateTime.UtcNow - _startTime;
        _logger.LogInformation("WOPR Operation Completed: {OperationName} in {Duration}ms",
            _operationName, duration.TotalMilliseconds);

        _activity?.SetTag("wopr.operation.duration_ms", duration.TotalMilliseconds.ToString("F2"));
        _activity?.Dispose();
    }
}