
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  MissileAnimationState,
  MissileTrajectory,
  TrajectoryPoint,
  RUSSIA_LAUNCH_SITES,
  USA_LAUNCH_SITES,
  RUSSIA_TARGETS,
  USA_TARGETS,
  MissileTarget,
  MissileImpact
} from '../models/missile.models';

@Injectable({
  providedIn: 'root'
})
export class MissileAnimationService {
  private animationSubject = new BehaviorSubject<MissileAnimationState>({
    isRunning: false,
    missiles: [],
    currentPhase: 'idle',
    startTime: 0,
    russianMissilesLaunched: 0,
    usaMissilesLaunched: 0,
    totalMissiles: 12
  });

  private impactsSubject = new BehaviorSubject<MissileImpact[]>([]);

  public animation$ = this.animationSubject.asObservable();
  public impacts$ = this.impactsSubject.asObservable();

  private animationFrameId?: number;
  private missileCounter = 0;

  async startMissileAnimation(): Promise<void> {
    if (this.animationSubject.value.isRunning) {
      return;
    }

    const startTime = Date.now();
    
    const initialState: MissileAnimationState = {
      isRunning: true,
      missiles: [],
      currentPhase: 'launching',
      startTime,
      russianMissilesLaunched: 0,
      usaMissilesLaunched: 0,
      totalMissiles: 12
    };

    this.animationSubject.next(initialState);
    this.impactsSubject.next([]);
    this.missileCounter = 0;

    // Start the animation sequence
    this.launchMissileSequence();
  }

  stopAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    const currentState = this.animationSubject.value;
    this.animationSubject.next({
      ...currentState,
      isRunning: false,
      currentPhase: 'idle'
    });
  }

  private async launchMissileSequence(): Promise<void> {
    // Russia launches 6 missiles first
    for (let i = 0; i < 6; i++) {
      await this.launchMissile('russia', i);
      await this.delay(800); // 800ms between Russian missile launches
    }

    // Brief pause before USA responds
    await this.delay(1500);

    // USA launches 6 missiles in response
    for (let i = 0; i < 6; i++) {
      await this.launchMissile('usa', i);
      await this.delay(700); // 700ms between USA missile launches
    }

    // Update phase to flying
    const currentState = this.animationSubject.value;
    this.animationSubject.next({
      ...currentState,
      currentPhase: 'flying'
    });

    // Start animation loop for missile movement
    this.animateMissileMovement();
  }

  private async launchMissile(country: 'russia' | 'usa', index: number): Promise<void> {
    const launchSites = country === 'russia' ? RUSSIA_LAUNCH_SITES : USA_LAUNCH_SITES;
    const targets = country === 'russia' ? RUSSIA_TARGETS : USA_TARGETS;

    const origin = launchSites[index % launchSites.length];
    const target = targets[index % targets.length];
    
    const trajectory = this.calculateTrajectory(origin, target);
    const flightDuration = 15000 + (Math.random() * 5000); // 15-20 seconds flight time

    const missile: MissileTrajectory = {
      id: `${country}-missile-${this.missileCounter++}`,
      origin,
      target,
      points: trajectory,
      currentPointIndex: 0,
      isActive: true,
      launchTime: Date.now(),
      flightDuration,
      color: country === 'russia' ? '#ff4444' : '#4444ff'
    };

    const currentState = this.animationSubject.value;
    const updatedMissiles = [...currentState.missiles, missile];
    
    this.animationSubject.next({
      ...currentState,
      missiles: updatedMissiles,
      russianMissilesLaunched: country === 'russia' 
        ? currentState.russianMissilesLaunched + 1 
        : currentState.russianMissilesLaunched,
      usaMissilesLaunched: country === 'usa' 
        ? currentState.usaMissilesLaunched + 1 
        : currentState.usaMissilesLaunched
    });
  }

  private calculateTrajectory(origin: MissileTarget, target: MissileTarget): TrajectoryPoint[] {
    const points: TrajectoryPoint[] = [];
    const numPoints = 20; // Number of points in trajectory
    
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate arc height (higher for longer distances)
    const arcHeight = Math.min(distance * 0.3, 150);
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      
      // Linear interpolation for x and y
      const x = origin.x + dx * t;
      const y = origin.y + dy * t;
      
      // Add parabolic arc (highest at midpoint)
      const arcY = y - (4 * arcHeight * t * (1 - t));
      
      points.push({
        x,
        y: arcY,
        timestamp: Date.now() + (t * 20000) // 20 second total flight time
      });
    }
    
    return points;
  }

  private animateMissileMovement(): void {
    const animate = () => {
      const currentState = this.animationSubject.value;
      
      if (!currentState.isRunning) {
        return;
      }

      const now = Date.now();
      let activeMissiles = 0;
      const newImpacts: MissileImpact[] = [...this.impactsSubject.value];

      const updatedMissiles = currentState.missiles.map(missile => {
        if (!missile.isActive) {
          return missile;
        }

        const elapsed = now - missile.launchTime;
        const progress = Math.min(elapsed / missile.flightDuration, 1);
        const newPointIndex = Math.floor(progress * (missile.points.length - 1));

        // Check if missile has reached target
        if (progress >= 1 || newPointIndex >= missile.points.length - 1) {
          // Missile impact
          const impact: MissileImpact = {
            x: missile.target.x,
            y: missile.target.y,
            timestamp: now,
            targetName: missile.target.name
          };
          newImpacts.push(impact);

          return {
            ...missile,
            isActive: false,
            currentPointIndex: missile.points.length - 1
          };
        }

        activeMissiles++;
        return {
          ...missile,
          currentPointIndex: newPointIndex
        };
      });

      // Update impacts
      if (newImpacts.length > this.impactsSubject.value.length) {
        this.impactsSubject.next(newImpacts);
      }

      // Update missiles
      this.animationSubject.next({
        ...currentState,
        missiles: updatedMissiles,
        currentPhase: activeMissiles > 0 ? 'flying' : 'impact'
      });

      // Continue animation if there are active missiles
      if (activeMissiles > 0) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        // All missiles have impacted
        setTimeout(() => {
          const finalState = this.animationSubject.value;
          this.animationSubject.next({
            ...finalState,
            currentPhase: 'completed',
            isRunning: false
          });
        }, 3000); // Show impacts for 3 seconds
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCurrentState(): MissileAnimationState {
    return this.animationSubject.value;
  }

  getCurrentImpacts(): MissileImpact[] {
    return this.impactsSubject.value;
  }
}