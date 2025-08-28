namespace WoprChatbotApi.Models
{
    public class ChatMessage
    {
        public string Role { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
        public List<ChatMessage> History { get; set; } = new();
    }

    public class ChatResponse
    {
        public string Response { get; set; } = string.Empty;
        public bool Success { get; set; } = true;
        public string? Error { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class WoprGameState
    {
        public string CurrentGame { get; set; } = string.Empty;
        public string GameStatus { get; set; } = "IDLE";
        public Dictionary<string, object> GameData { get; set; } = new();
        public DateTime LastActivity { get; set; } = DateTime.UtcNow;
    }
}