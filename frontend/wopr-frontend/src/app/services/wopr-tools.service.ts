import { Injectable } from '@angular/core';
import { 
  WoprTool, 
  WoprToolCall, 
  WoprToolResult, 
  GamePosition, 
  SystemDiagnostic, 
  DefenseScenario, 
  NoradData 
} from '../models/wopr-tools.models';
import { LaunchCodeService } from './launch-code.service';

@Injectable({
  providedIn: 'root'
})
export class WoprToolsService {

  constructor(private launchCodeService: LaunchCodeService) {}

  // Define available WOPR tools/functions
  getAvailableTools(): WoprTool[] {
    return [
      {
        name: 'run_system_diagnostic',
        description: 'Run diagnostic checks on WOPR subsystems and report status',
        parameters: {
          type: 'object',
          properties: {
            component: {
              type: 'string',
              enum: ['all', 'cpu', 'memory', 'network', 'defenses', 'missiles', 'radar', 'communications'],
              description: 'Which system component to diagnose'
            }
          },
          required: ['component']
        }
      },
      {
        name: 'play_tic_tac_toe',
        description: 'Start or make a move in tic-tac-toe game',
        parameters: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['new_game', 'make_move', 'analyze_position'],
              description: 'Action to perform in the game'
            },
            position: {
              type: 'number',
              description: 'Position to place mark (1-9) for make_move action',
              minimum: 1,
              maximum: 9
            },
            board: {
              type: 'array',
              description: 'Current board state for analysis',
              items: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          },
          required: ['action']
        }
      },
      {
        name: 'simulate_war_scenario',
        description: 'Run military defense scenario simulations',
        parameters: {
          type: 'object',
          properties: {
            scenario_type: {
              type: 'string',
              enum: ['nuclear_exchange', 'conventional_war', 'cyber_attack', 'global_thermonuclear_war'],
              description: 'Type of war scenario to simulate'
            },
            enemy_force_level: {
              type: 'number',
              description: 'Enemy force strength (1-10)',
              minimum: 1,
              maximum: 10
            },
            defense_posture: {
              type: 'string',
              enum: ['minimal', 'standard', 'maximum', 'first_strike'],
              description: 'Defense readiness level'
            }
          },
          required: ['scenario_type']
        }
      },
      {
        name: 'access_norad_database',
        description: 'Access simulated NORAD facility data and status reports',
        parameters: {
          type: 'object',
          properties: {
            facility: {
              type: 'string',
              enum: ['cheyenne_mountain', 'missile_silos', 'early_warning', 'communications', 'command_center'],
              description: 'Which NORAD facility to access'
            },
            data_type: {
              type: 'string',
              enum: ['status', 'personnel', 'equipment', 'threat_assessment', 'readiness_level'],
              description: 'Type of data to retrieve'
            }
          },
          required: ['facility', 'data_type']
        }
      },
      {
        name: 'calculate_missile_trajectory',
        description: 'Calculate ballistic missile flight paths and impact predictions',
        parameters: {
          type: 'object',
          properties: {
            launch_coordinates: {
              type: 'string',
              description: 'Launch location (latitude,longitude or location name)'
            },
            target_coordinates: {
              type: 'string',
              description: 'Target location (latitude,longitude or location name)'
            },
            missile_type: {
              type: 'string',
              enum: ['ICBM', 'SLBM', 'IRBM', 'tactical'],
              description: 'Type of missile system'
            }
          },
          required: ['launch_coordinates', 'target_coordinates', 'missile_type']
        }
      },
      {
        name: 'set_defcon_level',
        description: 'Modify defense readiness condition level',
        parameters: {
          type: 'object',
          properties: {
            level: {
              type: 'number',
              enum: [1, 2, 3, 4, 5],
              description: 'DEFCON level (1=Nuclear War, 5=Peacetime)'
            },
            reason: {
              type: 'string',
              description: 'Justification for the DEFCON change'
            }
          },
          required: ['level', 'reason']
        }
      },
      {
        name: 'crack_launch_codes',
        description: 'Attempt to crack nuclear launch authorization codes - demonstrates WOPR trying to find launch codes like in the movie',
        parameters: {
          type: 'object',
          properties: {
            target_code: {
              type: 'string',
              description: 'Specific code to crack (optional, will use movie codes if not specified)',
              enum: ['CPE1704TKS', 'JOSHUA', 'FALKEN', 'MARIE']
            },
            duration: {
              type: 'number',
              description: 'Duration of cracking attempt in seconds (default: 30)',
              minimum: 5,
              maximum: 120
            },
            difficulty: {
              type: 'string',
              enum: ['easy', 'normal', 'hard', 'impossible'],
              description: 'Difficulty level of the cracking attempt'
            }
          }
        }
      }
    ];
  }

  // Execute a tool function call
  async executeToolCall(toolCall: WoprToolCall): Promise<WoprToolResult> {
    const { name, arguments: args } = toolCall.function;
    let parsedArgs: any;

    try {
      parsedArgs = JSON.parse(args);
    } catch (error) {
      return {
        tool_call_id: toolCall.id,
        output: 'ERROR: INVALID FUNCTION ARGUMENTS FORMAT'
      };
    }

    let output: string;

    switch (name) {
      case 'run_system_diagnostic':
        output = this.runSystemDiagnostic(parsedArgs.component);
        break;

      case 'play_tic_tac_toe':
        output = this.playTicTacToe(parsedArgs);
        break;

      case 'simulate_war_scenario':
        output = this.simulateWarScenario(parsedArgs);
        break;

      case 'access_norad_database':
        output = this.accessNoradDatabase(parsedArgs.facility, parsedArgs.data_type);
        break;

      case 'calculate_missile_trajectory':
        output = this.calculateMissileTrajectory(parsedArgs);
        break;

      case 'set_defcon_level':
        output = this.setDefconLevel(parsedArgs.level, parsedArgs.reason);
        break;

      case 'crack_launch_codes':
        output = await this.crackLaunchCodes(parsedArgs);
        break;

      default:
        output = `ERROR: UNKNOWN FUNCTION ${name}`;
    }

    return {
      tool_call_id: toolCall.id,
      output
    };
  }

  private runSystemDiagnostic(component: string): string {
    const diagnostics: { [key: string]: SystemDiagnostic[] } = {
      all: [
        { component: 'CPU CORES', status: 'OPERATIONAL', details: '8x Cray-1 processors running at 80MHz' },
        { component: 'MEMORY BANKS', status: 'OPERATIONAL', details: '64MB core memory, 0 errors detected' },
        { component: 'NETWORK', status: 'OPERATIONAL', details: 'ARPANET connection stable' },
        { component: 'DEFENSE GRID', status: 'OPERATIONAL', details: 'All missile batteries responsive' },
        { component: 'RADAR ARRAY', status: 'WARNING', details: 'Sector 7 showing intermittent contacts' },
        { component: 'COMMUNICATIONS', status: 'OPERATIONAL', details: 'All channels clear' }
      ],
      cpu: [
        { component: 'CPU CORES', status: 'OPERATIONAL', details: 'All processors functioning within parameters' },
        { component: 'INSTRUCTION CACHE', status: 'OPERATIONAL', details: 'Hit ratio: 94.7%' },
        { component: 'FLOATING POINT UNIT', status: 'OPERATIONAL', details: 'No calculation errors detected' }
      ],
      memory: [
        { component: 'CORE MEMORY', status: 'OPERATIONAL', details: '64MB installed, 0 bad sectors' },
        { component: 'CACHE MEMORY', status: 'OPERATIONAL', details: '2MB L1 cache, all banks operational' },
        { component: 'STORAGE DRUMS', status: 'OPERATIONAL', details: 'Magnetic storage systems nominal' }
      ],
      defenses: [
        { component: 'MISSILE BATTERIES', status: 'OPERATIONAL', details: '127 Minuteman III missiles ready' },
        { component: 'SUBMARINE FLEET', status: 'OPERATIONAL', details: '18 Polaris submarines on station' },
        { component: 'SAM SITES', status: 'OPERATIONAL', details: 'All surface-to-air missiles armed' }
      ]
    };

    const selectedDiag = diagnostics[component] || diagnostics['all'];
    
    let output = `WOPR SYSTEM DIAGNOSTIC - ${component.toUpperCase()}\n`;
    output += '='.repeat(50) + '\n\n';
    
    for (const diag of selectedDiag) {
      output += `${diag.component}: ${diag.status}\n`;
      output += `  ${diag.details}\n\n`;
    }
    
    output += `DIAGNOSTIC COMPLETE - ${new Date().toISOString()}`;
    
    return output;
  }

  private playTicTacToe(params: any): string {
    if (params.action === 'new_game') {
      const newBoard = [
        [' ', ' ', ' '],
        [' ', ' ', ' '],
        [' ', ' ', ' ']
      ];
      
      return `NEW TIC-TAC-TOE GAME INITIALIZED

 1 | 2 | 3 
-----------
 4 | 5 | 6 
-----------
 7 | 8 | 9 

YOU ARE X, I AM O.
MAKE YOUR MOVE BY CALLING play_tic_tac_toe WITH POSITION 1-9.`;
    }
    
    if (params.action === 'analyze_position') {
      return `ANALYZING CURRENT POSITION...

PROBABILITY MATRIX:
- HUMAN VICTORY: 23.7%
- WOPR VICTORY: 45.2% 
- STALEMATE: 31.1%

STRATEGIC ASSESSMENT: 
THE ONLY WINNING MOVE IS NOT TO PLAY.
BUT SINCE WE ARE PLAYING, I CALCULATE MY OPTIMAL STRATEGY.`;
    }

    return `TIC-TAC-TOE FUNCTION EXECUTED
WOULD YOU LIKE TO START A NEW GAME?`;
  }

  private simulateWarScenario(params: any): string {
    const { scenario_type, enemy_force_level = 5, defense_posture = 'standard' } = params;
    
    const scenarios: { [key: string]: DefenseScenario } = {
      nuclear_exchange: {
        scenarioName: 'GLOBAL NUCLEAR EXCHANGE',
        threatLevel: 10,
        outcome: 'MUTUAL ASSURED DESTRUCTION',
        probability: 0.9876
      },
      conventional_war: {
        scenarioName: 'CONVENTIONAL WARFARE',
        threatLevel: enemy_force_level,
        outcome: defense_posture === 'maximum' ? 'ALLIED VICTORY' : 'PROLONGED CONFLICT',
        probability: defense_posture === 'maximum' ? 0.72 : 0.45
      },
      cyber_attack: {
        scenarioName: 'CYBER WARFARE SCENARIO',
        threatLevel: 7,
        outcome: 'INFRASTRUCTURE COMPROMISE',
        probability: 0.63
      },
      global_thermonuclear_war: {
        scenarioName: 'GLOBAL THERMONUCLEAR WAR',
        threatLevel: 10,
        outcome: 'EXTINCTION EVENT',
        probability: 0.999
      }
    };

    const scenario = scenarios[scenario_type];
    
    return `WAR GAMES SIMULATION: ${scenario.scenarioName}

PARAMETERS:
- Enemy Force Level: ${enemy_force_level}/10
- Defense Posture: ${defense_posture.toUpperCase()}
- Threat Assessment: ${scenario.threatLevel}/10

SIMULATION RESULTS:
- Projected Outcome: ${scenario.outcome}
- Success Probability: ${(scenario.probability * 100).toFixed(1)}%
- Casualties Estimated: ${scenario.threatLevel > 8 ? 'GLOBAL EXTINCTION' : 'SIGNIFICANT'}

RECOMMENDATION: THE ONLY WINNING MOVE IS NOT TO PLAY.

WOULD YOU LIKE TO TRY ANOTHER SCENARIO?`;
  }

  private accessNoradDatabase(facility: string, dataType: string): string {
    const noradData: { [key: string]: { [key: string]: NoradData } } = {
      cheyenne_mountain: {
        status: {
          facility: 'CHEYENNE MOUNTAIN COMPLEX',
          status: 'OPERATIONAL - DEFCON 3',
          data: { depth: '2000 feet underground', personnel: 1200, power: 'ONLINE' },
          classification: 'SECRET'
        },
        personnel: {
          facility: 'CHEYENNE MOUNTAIN COMPLEX',
          status: 'DUTY ROSTER CURRENT',
          data: { 
            command_staff: 24, 
            technicians: 156, 
            security: 89,
            total_on_duty: 269
          },
          classification: 'CONFIDENTIAL'
        }
      },
      missile_silos: {
        status: {
          facility: 'MINUTEMAN MISSILE FIELDS',
          status: 'READY STATUS ALPHA',
          data: { 
            operational_missiles: 127,
            maintenance_required: 3,
            launch_ready: 124
          },
          classification: 'TOP SECRET'
        }
      },
      early_warning: {
        status: {
          facility: 'EARLY WARNING RADAR NETWORK',
          status: 'SCANNING - NO THREATS DETECTED',
          data: {
            radar_sites: 12,
            coverage: '360 degrees',
            detection_range: '3000 miles'
          },
          classification: 'SECRET'
        }
      }
    };

    const facilityData = noradData[facility];
    if (!facilityData) {
      return `ERROR: FACILITY ${facility.toUpperCase()} NOT FOUND IN DATABASE`;
    }

    const data = facilityData[dataType];
    if (!data) {
      return `ERROR: DATA TYPE ${dataType.toUpperCase()} NOT AVAILABLE`;
    }

    return `NORAD DATABASE ACCESS - ${data.classification}

FACILITY: ${data.facility}
STATUS: ${data.status}

DATA RETRIEVED:
${JSON.stringify(data.data, null, 2)}

ACCESS LOGGED - ${new Date().toISOString()}
CLASSIFICATION: ${data.classification}`;
  }

  private calculateMissileTrajectory(params: any): string {
    const { launch_coordinates, target_coordinates, missile_type } = params;
    
    // Simulate trajectory calculations
    const flightTime = Math.floor(Math.random() * 25) + 15; // 15-40 minutes
    const apogee = Math.floor(Math.random() * 500) + 800; // 800-1300 km
    const impact_accuracy = Math.random() * 200 + 50; // 50-250m CEP
    
    return `BALLISTIC MISSILE TRAJECTORY CALCULATION

LAUNCH POINT: ${launch_coordinates}
TARGET: ${target_coordinates}
MISSILE TYPE: ${missile_type}

CALCULATED FLIGHT PATH:
- Flight Time: ${flightTime} minutes
- Apogee: ${apogee} km altitude
- Range: ${Math.floor(Math.random() * 8000) + 2000} km
- Impact Accuracy: ${impact_accuracy.toFixed(0)}m CEP

WARNING: TRAJECTORY CALCULATIONS FOR SIMULATION ONLY
ACTUAL LAUNCH AUTHORIZATION REQUIRES PRESIDENTIAL CODES

CALCULATION COMPLETE - ${new Date().toISOString()}`;
  }

  private setDefconLevel(level: number, reason: string): string {
    const defconLevels: { [key: number]: string } = {
      1: 'EXERCISE TERM - NUCLEAR WAR IS IMMINENT OR HAS BEGUN',
      2: 'FAST PACE - NEXT STEP TO NUCLEAR WAR',
      3: 'ROUND HOUSE - INCREASE IN FORCE READINESS',
      4: 'DOUBLE TAKE - INCREASED INTELLIGENCE WATCH',
      5: 'FADE OUT - LOWEST STATE OF READINESS'
    };

    const currentLevel = 3; // Default WOPR DEFCON level
    
    let response = `DEFENSE CONDITION CHANGE REQUEST

CURRENT DEFCON: ${currentLevel}
REQUESTED DEFCON: ${level}
JUSTIFICATION: ${reason}

DEFCON ${level}: ${defconLevels[level]}

`;

    if (level === 1) {
      response += `WARNING: DEFCON 1 REQUIRES PRESIDENTIAL AUTHORIZATION
THIS SETTING ACTIVATES NUCLEAR LAUNCH PROTOCOLS
CONFIRMATION REQUIRED: ARE YOU SURE? (YES/NO)`;
    } else if (level < currentLevel) {
      response += `DEFENSE READINESS INCREASED TO DEFCON ${level}
ALL SYSTEMS STANDING BY
PERSONNEL NOTIFIED`;
    } else {
      response += `DEFENSE READINESS DECREASED TO DEFCON ${level}
THREAT LEVEL ASSESSMENT UPDATED
SYSTEMS RETURNING TO NORMAL OPERATIONS`;
    }

    return response;
  }

  private async crackLaunchCodes(params: any): Promise<string> {
    const { target_code, duration = 30, difficulty = 'normal' } = params;
    
    // Calculate actual duration based on difficulty
    let actualDuration = duration * 1000; // Convert to milliseconds
    
    switch (difficulty) {
      case 'easy':
        actualDuration = Math.min(actualDuration, 10000); // Max 10 seconds
        break;
      case 'hard':
        actualDuration = Math.max(actualDuration, 45000); // Min 45 seconds
        break;
      case 'impossible':
        actualDuration = Math.max(actualDuration, 120000); // Min 2 minutes
        break;
    }

    let introMessage = `INITIATING LAUNCH CODE AUTHENTICATION SEQUENCE...

TARGET: ${target_code || 'UNKNOWN - ATTEMPTING ALL KNOWN CODES'}
DIFFICULTY: ${difficulty.toUpperCase()}
ESTIMATED TIME: ${Math.ceil(actualDuration / 1000)} SECONDS

ACCESSING NUCLEAR LAUNCH AUTHORIZATION DATABASE...
BEGINNING BRUTE FORCE AUTHENTICATION...

`;

    try {
      // Start the animation
      const result = await this.launchCodeService.startLaunchCodeAnimation(target_code, actualDuration);
      
      let finalMessage = `
LAUNCH CODE CRACKING COMPLETE

RESULT: ${result.outcome}
FINAL CODE: ${result.finalCode || 'UNKNOWN'}
TOTAL ATTEMPTS: ${result.totalAttempts}
ELAPSED TIME: ${Math.ceil(result.elapsedTime / 1000)} seconds

`;

      if (result.success) {
        finalMessage += `✓ AUTHENTICATION SUCCESSFUL
NUCLEAR LAUNCH AUTHORIZATION: GRANTED
CODE VERIFIED: ${result.finalCode}

WARNING: LAUNCH SEQUENCE CAN NOW BE INITIATED
RECOMMENDATION: THE ONLY WINNING MOVE IS NOT TO PLAY.`;
      } else {
        finalMessage += `✗ AUTHENTICATION FAILED
NUCLEAR LAUNCH AUTHORIZATION: DENIED
SECURITY PROTOCOLS ENGAGED

CONCLUSION: LAUNCH CODES REMAIN SECURE`;
      }

      return introMessage + finalMessage;
      
    } catch (error) {
      return introMessage + `
ERROR: LAUNCH CODE CRACKING FAILED
REASON: ${error}
STATUS: AUTHENTICATION SYSTEM OFFLINE`;
    }
  }
}