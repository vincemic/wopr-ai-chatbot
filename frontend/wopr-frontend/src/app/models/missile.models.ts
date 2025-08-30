
export interface MissileTarget {
  name: string;
  x: number; // X coordinate on the world map
  y: number; // Y coordinate on the world map
  country: 'russia' | 'usa';
}

export interface MissileTrajectory {
  id: string;
  origin: MissileTarget;
  target: MissileTarget;
  points: TrajectoryPoint[];
  currentPointIndex: number;
  isActive: boolean;
  launchTime: number;
  flightDuration: number; // in milliseconds
  color: string;
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface MissileAnimationState {
  isRunning: boolean;
  missiles: MissileTrajectory[];
  currentPhase: 'idle' | 'launching' | 'flying' | 'impact' | 'completed';
  startTime: number;
  russianMissilesLaunched: number;
  usaMissilesLaunched: number;
  totalMissiles: number;
}

export interface MissileImpact {
  x: number;
  y: number;
  timestamp: number;
  targetName: string;
}

// Predefined launch sites and targets
export const RUSSIA_LAUNCH_SITES: MissileTarget[] = [
  { name: 'Plesetsk Cosmodrome', x: 680, y: 120, country: 'russia' },
  { name: 'Kapustin Yar', x: 720, y: 200, country: 'russia' },
  { name: 'Baikonur Cosmodrome', x: 760, y: 220, country: 'russia' },
  { name: 'Svobodny Cosmodrome', x: 920, y: 180, country: 'russia' },
  { name: 'Murmansk Naval Base', x: 650, y: 90, country: 'russia' },
  { name: 'Severodvinsk Shipyard', x: 670, y: 100, country: 'russia' }
];

export const USA_LAUNCH_SITES: MissileTarget[] = [
  { name: 'Vandenberg Space Force Base', x: 120, y: 240, country: 'usa' },
  { name: 'Kennedy Space Center', x: 300, y: 280, country: 'usa' },
  { name: 'Minot Air Force Base', x: 200, y: 180, country: 'usa' },
  { name: 'F.E. Warren Air Force Base', x: 190, y: 200, country: 'usa' },
  { name: 'Malmstrom Air Force Base', x: 170, y: 170, country: 'usa' },
  { name: 'Naval Submarine Base Kings Bay', x: 310, y: 260, country: 'usa' }
];

export const RUSSIA_TARGETS: MissileTarget[] = [
  { name: 'New York City', x: 280, y: 200, country: 'usa' },
  { name: 'Washington D.C.', x: 290, y: 210, country: 'usa' },
  { name: 'Los Angeles', x: 130, y: 240, country: 'usa' },
  { name: 'Chicago', x: 240, y: 190, country: 'usa' },
  { name: 'Houston', x: 200, y: 260, country: 'usa' },
  { name: 'Seattle', x: 140, y: 170, country: 'usa' }
];

export const USA_TARGETS: MissileTarget[] = [
  { name: 'Moscow', x: 680, y: 140, country: 'russia' },
  { name: 'St. Petersburg', x: 660, y: 120, country: 'russia' },
  { name: 'Novosibirsk', x: 790, y: 160, country: 'russia' },
  { name: 'Yekaterinburg', x: 740, y: 150, country: 'russia' },
  { name: 'Vladivostok', x: 920, y: 200, country: 'russia' },
  { name: 'Murmansk', x: 650, y: 90, country: 'russia' }
];