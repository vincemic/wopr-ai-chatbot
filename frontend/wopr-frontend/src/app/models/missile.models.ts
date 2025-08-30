
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
  { name: 'Plesetsk Cosmodrome', x: 680, y: 103, country: 'russia' },
  { name: 'Kapustin Yar', x: 720, y: 192, country: 'russia' },
  { name: 'Baikonur Cosmodrome', x: 756, y: 215, country: 'russia' },
  { name: 'Svobodny Cosmodrome', x: 915, y: 170, country: 'russia' },
  { name: 'Murmansk Naval Base', x: 650, y: 90, country: 'russia' },
  { name: 'Severodvinsk Shipyard', x: 670, y: 95, country: 'russia' }
];

export const USA_LAUNCH_SITES: MissileTarget[] = [
  { name: 'Vandenberg Space Force Base', x: 206, y: 243, country: 'usa' },
  { name: 'Kennedy Space Center', x: 319, y: 284, country: 'usa' },
  { name: 'Minot Air Force Base', x: 300, y: 152, country: 'usa' },
  { name: 'F.E. Warren Air Force Base', x: 290, y: 187, country: 'usa' },
  { name: 'Malmstrom Air Force Base', x: 270, y: 142, country: 'usa' },
  { name: 'Naval Submarine Base Kings Bay', x: 318, y: 263, country: 'usa' }
];

export const RUSSIA_TARGETS: MissileTarget[] = [
  { name: 'Moscow', x: 800, y: 265, country: 'russia' },
  { name: 'St. Petersburg', x: 785, y: 245, country: 'russia' },
  { name: 'Novosibirsk', x: 985, y: 305, country: 'russia' },
  { name: 'Yekaterinburg', x: 910, y: 285, country: 'russia' },
  { name: 'Vladivostok', x: 1160, y: 365, country: 'russia' },
  { name: 'Murmansk', x: 770, y: 195, country: 'russia' }
];

export const USA_TARGETS: MissileTarget[] = [
  { name: 'New York City', x: 295, y: 315, country: 'usa' },
  { name: 'Washington D.C.', x: 290, y: 330, country: 'usa' },
  { name: 'Los Angeles', x: 130, y: 375, country: 'usa' },
  { name: 'Chicago', x: 250, y: 295, country: 'usa' },
  { name: 'Houston', x: 235, y: 395, country: 'usa' },
  { name: 'Seattle', x: 115, y: 255, country: 'usa' }
];