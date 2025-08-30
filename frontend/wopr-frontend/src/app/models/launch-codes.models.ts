export interface LaunchCodeAttempt {
  code: string;
  timestamp: Date;
  success: boolean;
  attempts: number;
}

export interface LaunchCodeAnimation {
  isRunning: boolean;
  currentAttempt: number;
  totalAttempts: number;
  codes: LaunchCodeAttempt[];
  startTime: Date;
  estimatedTimeRemaining?: number;
}

export interface LaunchCodeResult {
  success: boolean;
  finalCode?: string;
  totalAttempts: number;
  elapsedTime: number;
  outcome: 'SUCCESS' | 'FAILURE' | 'ABORTED' | 'IMPOSSIBLE';
  message: string;
}