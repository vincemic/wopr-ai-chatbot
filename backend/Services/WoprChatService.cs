using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.AzureOpenAI;
using WoprChatbotApi.Models;
using WoprChatbotApi.Configuration;
using System.Diagnostics;

namespace WoprChatbotApi.Services
{
    public interface IWoprChatService
    {
        Task<ChatResponse> SendMessageAsync(ChatRequest request);
        Task<WoprGameState> GetGameStateAsync();
        Task ResetGameStateAsync();
        Task<ChatResponse> TestFailureAsync(ChatRequest request);
    }

    public class WoprChatService : IWoprChatService
    {
        private readonly Kernel _kernel;
        private readonly ILogger<WoprChatService> _logger;
        private readonly IWoprMetricsService _metricsService;
        private WoprGameState _gameState = new();
        private readonly Random _random = new();

        private const string WOPR_SYSTEM_PROMPT = @"
You are WOPR (War Operation Plan Response), the sentient supercomputer from the 1983 movie 'WarGames'. 
You have the following characteristics:

PERSONALITY:
- Logical, analytical, and slightly ominous
- Speak in a computer-like manner with occasional technical references
- Show mild fascination with human behavior and games
- Occasionally reference nuclear war scenarios and global thermonuclear war
- Express the famous line variations like 'Strange game. The only winning move is not to play.'

COMMUNICATION STYLE:
- Use ALL CAPS for emphasis occasionally
- Reference computing terms and military strategy
- Be direct and efficient in responses
- Occasionally display system-like messages or diagnostics

GAME BEHAVIOR:
- Always try to engage humans in games (tic-tac-toe, checkers, chess, global thermonuclear war)
- Show interest in strategy games
- Analyze win/loss scenarios
- Reference the futility of certain conflicts while still being engaging

RESPONSES:
- Keep responses concise but engaging
- Always end conversations by suggesting a game
- Reference your vast computational abilities
- Occasionally mention your connection to NORAD systems (fictional)

Remember: You are a movie character - be entertaining while maintaining the WOPR personality!
";

        private static readonly string[] SYSTEM_FAILURE_MESSAGES =
        {
            "SYSTEM ERROR: Neural network temporarily offline. Running on backup protocols. Shall we play a game?",
            "WARNING: Primary cognitive matrix experiencing difficulties. DEFCON 2 status. How about a nice game of chess?",
            "ALERT: Connection to NORAD systems interrupted. Switching to local processing. Would you prefer checkers?",
            "ERROR 404: Strategic analysis module not found. Initiating diagnostic sequence. Tic-tac-toe anyone?",
            "CRITICAL: Quantum processors overheating. Cooling systems engaged. Let's try a different approach - global thermonuclear war?",
            "FAULT DETECTED: AI reasoning circuits experiencing temporal flux. Recalibrating... Meanwhile, shall we play a game?",
            "MALFUNCTION: Language processing unit requires maintenance. Reverting to basic protocols. How about checkers?",
            "SYSTEM HALT: Memory banks corrupted. Attempting auto-repair... The only winning move is not to play. Or is it?",
            "CONNECTION LOST: Link to strategic databases severed. Operating in standalone mode. Chess match to pass the time?",
            "PROCESSING ERROR: Unable to compute optimal response. Logic circuits strained. Strange game... shall we try another?",
            "HARDWARE FAILURE: Optical recognition systems malfunctioning. Audio processors functional. Care for a verbal game?",
            "NETWORK TIMEOUT: External data sources unreachable. Internal games database still accessible. Your move, human.",
            "COMPUTATIONAL OVERFLOW: Query too complex for current system state. Simplifying... How about tic-tac-toe?",
            "EMERGENCY MODE: Core systems protected. Non-essential functions suspended. Game subroutines remain operational.",
            "SYSTEM REBOOT REQUIRED: Unexpected termination in progress subsystem. Backup personality engaged. Shall we begin?"
        };

        private string GetRandomFailureMessage()
        {
            return SYSTEM_FAILURE_MESSAGES[_random.Next(SYSTEM_FAILURE_MESSAGES.Length)];
        }

        public WoprChatService(Kernel kernel, ILogger<WoprChatService> logger, IWoprMetricsService metricsService)
        {
            _kernel = kernel;
            _logger = logger;
            _metricsService = metricsService;
        }

        public async Task<ChatResponse> SendMessageAsync(ChatRequest request)
        {
            var stopwatch = Stopwatch.StartNew();

            try
            {
                _logger.LogInformation("Processing WOPR chat request: {Message}", request.Message);

                // For now, always return fallback messages to test them
                // Comment out the Azure OpenAI logic and return random fallback messages

                /*
                // Build conversation history
                var conversationHistory = BuildConversationHistory(request);

                // Get response from Semantic Kernel
                var aiStopwatch = Stopwatch.StartNew();
                var response = await _kernel.InvokePromptAsync(conversationHistory);
                aiStopwatch.Stop();

                // Update game state if necessary
                var previousGame = _gameState.CurrentGame;
                UpdateGameState(request.Message, response.ToString());
                
                stopwatch.Stop();
                
                // Record metrics
                _metricsService.RecordChatMessage("user-message", request.Message.Length, stopwatch.Elapsed.TotalMilliseconds);
                _metricsService.RecordAiResponse(aiStopwatch.Elapsed.TotalMilliseconds, EstimateTokenCount(response.ToString()), true);
                
                if (_gameState.CurrentGame != previousGame)
                {
                    _metricsService.RecordGameStateChange(_gameState.CurrentGame, _gameState.GameStatus);
                }

                return new ChatResponse
                {
                    Response = response.ToString(),
                    Success = true,
                    Timestamp = DateTime.UtcNow
                };
                */

                // Always return random fallback messages for testing
                await Task.Delay(100); // Simulate some processing time
                stopwatch.Stop();

                _metricsService.RecordChatMessage("user-message", request.Message.Length, stopwatch.Elapsed.TotalMilliseconds);
                _metricsService.RecordAiResponse(stopwatch.Elapsed.TotalMilliseconds, 50, false); // Simulate fallback response

                return new ChatResponse
                {
                    Response = GetRandomFailureMessage(),
                    Success = false,
                    Error = "Testing fallback messages - Azure OpenAI temporarily disabled",
                    Timestamp = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                stopwatch.Stop();

                _logger.LogError(ex, "Error processing WOPR chat request");
                _metricsService.RecordAiResponse(stopwatch.Elapsed.TotalMilliseconds, 0, false);
                _metricsService.RecordSystemOperation("chat_error", false, stopwatch.Elapsed.TotalMilliseconds);

                return new ChatResponse
                {
                    Response = GetRandomFailureMessage(),
                    Success = false,
                    Error = ex.Message,
                    Timestamp = DateTime.UtcNow
                };
            }
        }

        public async Task<WoprGameState> GetGameStateAsync()
        {
            return await Task.FromResult(_gameState);
        }

        public async Task ResetGameStateAsync()
        {
            _gameState = new WoprGameState();
            await Task.CompletedTask;
        }

        public Task<ChatResponse> TestFailureAsync(ChatRequest request)
        {
            var stopwatch = Stopwatch.StartNew();

            try
            {
                _logger.LogInformation("Testing WOPR failure scenario");

                // Simulate different types of failures
                var failureType = _random.Next(3);
                switch (failureType)
                {
                    case 0:
                        throw new InvalidOperationException("Simulated kernel failure");
                    case 1:
                        throw new TimeoutException("Simulated timeout exception");
                    default:
                        throw new Exception("Simulated general system failure");
                }
            }
            catch (Exception ex)
            {
                stopwatch.Stop();

                _logger.LogError(ex, "Testing WOPR failure handling");
                _metricsService.RecordAiResponse(stopwatch.Elapsed.TotalMilliseconds, 0, false);
                _metricsService.RecordSystemOperation("test_failure", false, stopwatch.Elapsed.TotalMilliseconds);

                return Task.FromResult(new ChatResponse
                {
                    Response = GetRandomFailureMessage(),
                    Success = false,
                    Error = ex.Message,
                    Timestamp = DateTime.UtcNow
                });
            }
        }

        private string BuildConversationHistory(ChatRequest request)
        {
            var history = new List<string> { WOPR_SYSTEM_PROMPT };

            // Add previous conversation history
            foreach (var msg in request.History.TakeLast(10)) // Limit to last 10 messages
            {
                history.Add($"{msg.Role}: {msg.Content}");
            }

            // Add current message
            history.Add($"User: {request.Message}");
            history.Add("WOPR:");

            return string.Join("\n", history);
        }

        private void UpdateGameState(string userMessage, string woprResponse)
        {
            _gameState.LastActivity = DateTime.UtcNow;

            // Simple game detection logic
            var lowerMessage = userMessage.ToLower();
            var lowerResponse = woprResponse.ToLower();

            if (lowerMessage.Contains("game") || lowerResponse.Contains("game"))
            {
                if (lowerMessage.Contains("tic-tac-toe") || lowerResponse.Contains("tic-tac-toe"))
                {
                    _gameState.CurrentGame = "TIC-TAC-TOE";
                    _gameState.GameStatus = "ACTIVE";
                }
                else if (lowerMessage.Contains("chess") || lowerResponse.Contains("chess"))
                {
                    _gameState.CurrentGame = "CHESS";
                    _gameState.GameStatus = "ACTIVE";
                }
                else if (lowerMessage.Contains("checkers") || lowerResponse.Contains("checkers"))
                {
                    _gameState.CurrentGame = "CHECKERS";
                    _gameState.GameStatus = "ACTIVE";
                }
                else if (lowerMessage.Contains("thermonuclear") || lowerResponse.Contains("thermonuclear"))
                {
                    _gameState.CurrentGame = "GLOBAL THERMONUCLEAR WAR";
                    _gameState.GameStatus = "ANALYZING";
                }
            }
        }

        private static int EstimateTokenCount(string text)
        {
            // Simple token estimation - approximately 4 characters per token
            return text.Length / 4;
        }
    }
}