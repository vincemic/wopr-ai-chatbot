using Microsoft.AspNetCore.Mvc;
using WoprChatbotApi.Models;
using WoprChatbotApi.Services;
using WoprChatbotApi.Configuration;
using System.Diagnostics;

namespace WoprChatbotApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IWoprChatService _woprChatService;
    private readonly IWoprMetricsService _metricsService;
    private readonly ILogger<ChatController> _logger;

    public ChatController(IWoprChatService woprChatService, IWoprMetricsService metricsService, ILogger<ChatController> logger)
    {
        _woprChatService = woprChatService;
        _metricsService = metricsService;
        _logger = logger;
    }

    [HttpPost("message")]
    public async Task<ActionResult<ChatResponse>> SendMessage([FromBody] ChatRequest request)
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            _metricsService.IncrementActiveUsers();

            if (string.IsNullOrWhiteSpace(request.Message))
            {
                _metricsService.RecordSystemOperation("validation_error", false, stopwatch.Elapsed.TotalMilliseconds);
                return BadRequest(new ChatResponse
                {
                    Success = false,
                    Error = "Message cannot be empty",
                    Response = "ERROR: No input detected. Please provide a message."
                });
            }

            var response = await _woprChatService.SendMessageAsync(request);
            stopwatch.Stop();

            _metricsService.RecordSystemOperation("api_request", response.Success, stopwatch.Elapsed.TotalMilliseconds);

            return Ok(response);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, "Error in SendMessage API endpoint");
            _metricsService.RecordSystemOperation("api_error", false, stopwatch.Elapsed.TotalMilliseconds);

            return StatusCode(500, new ChatResponse
            {
                Success = false,
                Error = "Internal server error",
                Response = "SYSTEM ERROR: WOPR mainframe experiencing difficulties."
            });
        }
        finally
        {
            _metricsService.DecrementActiveUsers();
        }
    }

    [HttpGet("gamestate")]
    public async Task<ActionResult<WoprGameState>> GetGameState()
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            var gameState = await _woprChatService.GetGameStateAsync();
            stopwatch.Stop();

            _metricsService.RecordSystemOperation("get_gamestate", true, stopwatch.Elapsed.TotalMilliseconds);
            return Ok(gameState);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, "Error getting game state");
            _metricsService.RecordSystemOperation("get_gamestate", false, stopwatch.Elapsed.TotalMilliseconds);

            return StatusCode(500, new { error = "Failed to retrieve game state" });
        }
    }

    [HttpPost("reset")]
    public async Task<ActionResult> ResetGameState()
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            await _woprChatService.ResetGameStateAsync();
            stopwatch.Stop();

            _metricsService.RecordSystemOperation("reset_gamestate", true, stopwatch.Elapsed.TotalMilliseconds);
            _metricsService.RecordGameStateChange("none", "reset");

            return Ok(new { message = "WOPR systems reset. All game states cleared." });
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, "Error resetting game state");
            _metricsService.RecordSystemOperation("reset_gamestate", false, stopwatch.Elapsed.TotalMilliseconds);

            return StatusCode(500, new { error = "Failed to reset game state" });
        }
    }

    [HttpGet("status")]
    public ActionResult GetStatus()
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            var status = new
            {
                status = "OPERATIONAL",
                system = "WOPR",
                version = "1.0.0",
                uptime = Environment.TickCount64,
                message = "War Operation Plan Response - READY"
            };

            stopwatch.Stop();
            _metricsService.RecordSystemOperation("get_status", true, stopwatch.Elapsed.TotalMilliseconds);

            return Ok(status);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, "Error getting system status");
            _metricsService.RecordSystemOperation("get_status", false, stopwatch.Elapsed.TotalMilliseconds);

            return StatusCode(500, new { error = "System status unavailable" });
        }
    }

    [HttpPost("test-failure")]
    public async Task<ActionResult<ChatResponse>> TestFailure([FromBody] ChatRequest request)
    {
        // This endpoint is for testing fallback messages by forcing an exception
        var testRequest = new ChatRequest
        {
            Message = request.Message ?? "test failure",
            History = request.History ?? new List<ChatMessage>()
        };

        var response = await _woprChatService.TestFailureAsync(testRequest);
        return Ok(response);
    }
}