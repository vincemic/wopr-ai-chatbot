export interface ChatMessage {
  role: string;
  content: string;
  timestamp: Date;
}

export interface WoprGameState {
  currentGame: string;
  gameStatus: string;
  gameData: { [key: string]: any };
  lastActivity: Date;
}