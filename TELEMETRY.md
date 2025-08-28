# WOPR Chatbot Telemetry

The WOPR Chatbot API now includes comprehensive telemetry and monitoring capabilities.

## 🔍 Telemetry Features

### OpenTelemetry Integration
- **Distributed Tracing**: Tracks requests across services with unique correlation IDs
- **Metrics Collection**: Custom metrics for WOPR-specific operations
- **Activity Sources**: Dedicated activity source for WOPR operations (`WOPR.Chatbot.Activities`)

### Metrics Captured

#### Chat Metrics
- `wopr_chat_messages_total`: Total chat messages processed
- `wopr_chat_processing_duration_ms`: Time to process chat messages
- Message categorization by length (short/medium/long/very_long)

#### AI Response Metrics
- `wopr_ai_response_duration_ms`: AI response generation time
- `wopr_ai_tokens_used_total`: Total AI tokens consumed
- Token usage categorization (small/medium/large/very_large)

#### Game State Metrics
- `wopr_game_state_changes_total`: Game state transitions
- Tracks different game types (tic-tac-toe, chess, checkers, global-thermonuclear-war)

#### System Operations
- `wopr_system_operations_total`: System operation counters
- `wopr_operation_duration_ms`: Operation timing
- `wopr_active_users`: Real-time active user count

### Logging Integration

#### Serilog Configuration
- **Structured Logging**: JSON-formatted logs with contextual information
- **Multiple Outputs**: Console and Application Insights
- **Enrichers**: Process ID, thread ID, environment, service version
- **Custom Properties**: WOPR-specific context and operation tracking

#### Log Levels
- **Information**: Normal operations, chat processing
- **Warning**: Performance issues, configuration warnings
- **Error**: Failures, exceptions, system errors

### Application Insights
- **Real-time Monitoring**: Live metrics and dashboards
- **Custom Events**: WOPR-specific events and user interactions
- **Exception Tracking**: Automated error capture and analysis
- **Performance Counters**: Response times, throughput metrics

## 🛠️ Configuration

### Development Settings
```json
{
  "ApplicationInsights": {
    "ConnectionString": "InstrumentationKey=..."
  },
  "Telemetry": {
    "ServiceName": "WoprChatbotApi",
    "ServiceVersion": "1.0.0",
    "Environment": "Development"
  }
}
```

### User Secrets (Development)
Configure telemetry connection strings:
```bash
dotnet user-secrets set "ApplicationInsights:ConnectionString" "InstrumentationKey=your-key"
```

## 📊 Monitoring Dashboard Ideas

### WOPR Command Center Dashboard
1. **System Status Panel**
   - Active users count
   - System operational status
   - Uptime metrics

2. **Game Analytics**
   - Popular games being played
   - Game completion rates
   - Average game session duration

3. **AI Performance**
   - Response time percentiles
   - Token usage trends
   - Error rates

4. **User Engagement**
   - Message frequency
   - Conversation length
   - User retention

### Alert Thresholds
- Response time > 5 seconds
- Error rate > 5%
- Active users > capacity threshold
- Token usage exceeding quotas

## 🎯 WOPR-Specific Features

### Custom Activity Tags
- `wopr.operation.type`: Type of WOPR operation
- `wopr.game.type`: Current game being played
- `wopr.user.context`: User interaction context
- `wopr.ai.model`: AI model used for responses

### Game State Tracking
- Automatic detection of game transitions
- Performance metrics per game type
- User engagement analytics per game

### Military-Grade Logging
- Operation names styled after military terminology
- DEFCON-style severity levels
- Strategic operation correlation IDs

## 🚀 Production Considerations

### Performance Impact
- Minimal overhead (~1-2ms per request)
- Asynchronous metric collection
- Efficient sampling strategies

### Data Privacy
- No sensitive user data in metrics
- Anonymized user identifiers
- Configurable data retention

### Scalability
- Metrics aggregation for high throughput
- Distributed tracing correlation
- Resource utilization optimization

---

*"The only winning move is not to play... unless you're monitoring it properly."* - WOPR