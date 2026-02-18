
export interface CropReport {
  diseaseName: string;
  confidence: number;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  symptoms: string[];
  treatment: string[];
  prevention: string[];
}

export interface YieldPrediction {
  yieldRange: string;
  unit: string;
  factors: string[];
  recommendations: string[];
  confidenceScore: number;
}

export interface Advisory {
  irrigation: string;
  fertilizer: string;
  pestAlert: string;
  riskLevel: 'Safe' | 'Watch' | 'Danger';
}

export interface FarmAlert {
  type: 'Weather' | 'Pest' | 'Market' | 'Task';
  title: string;
  description: string;
  urgency: 'Normal' | 'Urgent';
}

export interface UserCrop {
  id: string;
  name: string;
  variety: string;
  area: number;
  plantedDate: string;
}

export enum AppSection {
  DASHBOARD = 'DASHBOARD',
  DISEASE_DETECTION = 'DISEASE_DETECTION',
  ADVISORY = 'ADVISORY',
  YIELD_PREDICTION = 'YIELD_PREDICTION',
  MARKET_INSIGHTS = 'MARKET_INSIGHTS',
  SCHEDULE = 'SCHEDULE',
  CROP_MANAGEMENT = 'CROP_MANAGEMENT',
  SETTINGS = 'SETTINGS'
}
