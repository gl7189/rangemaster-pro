
export enum MatchType {
  IPSC = 'IPSC',
  USPSA = 'USPSA',
  STEEL_CHALLENGE = 'Steel Challenge',
  IDPA = 'IDPA',
  PRECISION = 'Precision'
}

export enum Division {
  PRODUCTION = 'Production',
  STANDARD = 'Standard',
  OPEN = 'Open',
  CLASSIC = 'Classic',
  REVOLVER = 'Revolver',
  PCC = 'PCC'
}

export enum Category {
  OVERALL = 'Overall',
  LADY = 'Lady',
  JUNIOR = 'Junior',
  SENIOR = 'Senior',
  SUPER_SENIOR = 'Super Senior'
}

export interface Shooter {
  id: string;
  name: string;
  licenseNumber: string;
  club: string;
  division: Division;
  category: Category;
  powerFactor: 'Minor' | 'Major';
}

export interface Stage {
  id: string;
  name: string;
  minRounds: number;
  targets: number;
  scoringType: 'Comstock' | 'TimePlus' | 'Fixed';
}

export interface ScoreEntry {
  shooterId: string;
  stageId: string;
  time: number;
  aHits: number;
  cHits: number;
  dHits: number;
  misses: number;
  noShoots: number;
  procedurals: number;
  hitFactor?: number;
  timestamp: number;
}

export interface Match {
  id: string;
  name: string;
  date: string;
  type: MatchType;
  stages: Stage[];
  shooters: Shooter[];
}
