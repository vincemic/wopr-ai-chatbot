using System.Diagnostics.Metrics;

namespace WoprChatbotApi.Services;

public interface IWoprMetricsService
{
    void RecordChatMessage(string messageType, int messageLength, double processingTimeMs);
    void RecordGameStateChange(string gameType, string newState);
    void RecordAiResponse(double responseTimeMs, int tokenCount, bool isSuccess);
    void RecordSystemOperation(string operation, bool isSuccess, double durationMs);
    void IncrementActiveUsers();
    void DecrementActiveUsers();
}

public class WoprMetricsService : IWoprMetricsService, IDisposable
{
    private readonly Meter _meter;
    private readonly Counter<long> _chatMessageCounter;
    private readonly Histogram<double> _chatProcessingTime;
    private readonly Counter<long> _gameStateChanges;
    private readonly Histogram<double> _aiResponseTime;
    private readonly Counter<long> _aiTokenUsage;
    private readonly Counter<long> _systemOperations;
    private readonly Histogram<double> _operationDuration;
    private readonly UpDownCounter<long> _activeUsers;

    public WoprMetricsService()
    {
        _meter = new Meter("WOPR.Chatbot.Metrics", "1.0.0");

        // Chat metrics
        _chatMessageCounter = _meter.CreateCounter<long>(
            "wopr_chat_messages_total",
            description: "Total number of chat messages processed by WOPR");

        _chatProcessingTime = _meter.CreateHistogram<double>(
            "wopr_chat_processing_duration_ms",
            unit: "ms",
            description: "Time taken to process chat messages");

        // Game metrics
        _gameStateChanges = _meter.CreateCounter<long>(
            "wopr_game_state_changes_total",
            description: "Total number of game state changes");

        // AI metrics
        _aiResponseTime = _meter.CreateHistogram<double>(
            "wopr_ai_response_duration_ms",
            unit: "ms",
            description: "Time taken for AI responses");

        _aiTokenUsage = _meter.CreateCounter<long>(
            "wopr_ai_tokens_used_total",
            description: "Total AI tokens consumed");

        // System metrics
        _systemOperations = _meter.CreateCounter<long>(
            "wopr_system_operations_total",
            description: "Total system operations performed");

        _operationDuration = _meter.CreateHistogram<double>(
            "wopr_operation_duration_ms",
            unit: "ms",
            description: "Duration of system operations");

        // User metrics
        _activeUsers = _meter.CreateUpDownCounter<long>(
            "wopr_active_users",
            description: "Number of active users connected to WOPR");
    }

    public void RecordChatMessage(string messageType, int messageLength, double processingTimeMs)
    {
        var tags = new KeyValuePair<string, object?>[]
        {
            new("message_type", messageType),
            new("message_length_category", GetMessageLengthCategory(messageLength))
        };

        _chatMessageCounter.Add(1, tags);
        _chatProcessingTime.Record(processingTimeMs, tags);
    }

    public void RecordGameStateChange(string gameType, string newState)
    {
        var tags = new KeyValuePair<string, object?>[]
        {
            new("game_type", gameType),
            new("new_state", newState)
        };

        _gameStateChanges.Add(1, tags);
    }

    public void RecordAiResponse(double responseTimeMs, int tokenCount, bool isSuccess)
    {
        var tags = new KeyValuePair<string, object?>[]
        {
            new("success", isSuccess.ToString().ToLower()),
            new("token_category", GetTokenCategory(tokenCount))
        };

        _aiResponseTime.Record(responseTimeMs, tags);

        if (isSuccess && tokenCount > 0)
        {
            _aiTokenUsage.Add(tokenCount, new KeyValuePair<string, object?>[]
            {
                new("token_type", "completion")
            });
        }
    }

    public void RecordSystemOperation(string operation, bool isSuccess, double durationMs)
    {
        var tags = new KeyValuePair<string, object?>[]
        {
            new("operation", operation),
            new("success", isSuccess.ToString().ToLower())
        };

        _systemOperations.Add(1, tags);
        _operationDuration.Record(durationMs, tags);
    }

    public void IncrementActiveUsers()
    {
        _activeUsers.Add(1);
    }

    public void DecrementActiveUsers()
    {
        _activeUsers.Add(-1);
    }

    private static string GetMessageLengthCategory(int length)
    {
        return length switch
        {
            <= 50 => "short",
            <= 200 => "medium",
            <= 500 => "long",
            _ => "very_long"
        };
    }

    private static string GetTokenCategory(int tokenCount)
    {
        return tokenCount switch
        {
            <= 100 => "small",
            <= 500 => "medium",
            <= 1000 => "large",
            _ => "very_large"
        };
    }

    public void Dispose()
    {
        _meter?.Dispose();
    }
}

// Custom metrics for WOPR-specific scenarios
public static class WoprMetrics
{
    public static readonly string[] GameTypes = ["tic-tac-toe", "chess", "checkers", "global-thermonuclear-war"];
    public static readonly string[] GameStates = ["waiting", "in-progress", "completed", "draw", "victory", "defeat"];
    public static readonly string[] MessageTypes = ["user-message", "wopr-response", "system-message", "game-move"];
    public static readonly string[] SystemOperations = ["startup", "shutdown", "reset", "configuration-change"];
}