export interface ChatMessage {
  role: string;
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  success: boolean;
  error?: string;
  timestamp: Date;
}

export interface WoprGameState {
  currentGame: string;
  gameStatus: string;
  gameData: { [key: string]: any };
  lastActivity: Date;
}

export interface WoprStatus {
  status: string;
  system: string;
  version: string;
  uptime: number;
  message: string;
}