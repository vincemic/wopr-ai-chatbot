export interface WoprTool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: { [key: string]: any };
    required?: string[];
  };
}

export interface WoprToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface WoprToolResult {
  tool_call_id: string;
  output: string;
}

export interface GamePosition {
  board: string[][];
  currentPlayer: string;
  gameStatus: 'active' | 'won' | 'draw' | 'terminated';
  winner?: string;
}

export interface SystemDiagnostic {
  component: string;
  status: 'OPERATIONAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  details: string;
}

export interface DefenseScenario {
  scenarioName: string;
  threatLevel: number;
  outcome: string;
  probability: number;
}

export interface NoradData {
  facility: string;
  status: string;
  data: any;
  classification: 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET';
}