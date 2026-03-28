export interface RuleMetrics {
  id: string
  condition: string
  prediction: number
  predictionLabel: string
  precision: number
  recall: number
  f1Score: number
  support: number
  complexity: 'simple' | 'moderate' | 'complex'
  coverage: number // percentage of data that matches this rule
  falsePositiveRate: number
  accuracy: number
}

export interface RulesDataset {
  id: string
  name: string
  description: string
  dataSource: string
  totalRules: number
  averagePrecision: number
  averageRecall: number
  lastUpdated: string
  rules: RuleMetrics[]
}

export function getMockRulesDataset(): RulesDataset {
  const rules: RuleMetrics[] = [
    {
      id: 'r1',
      condition: '(water_level_cm >= 550) AND (rain_mm > 20)',
      prediction: 1,
      predictionLabel: 'HIGH FLOOD RISK',
      precision: 0.92,
      recall: 0.85,
      f1Score: 0.88,
      support: 143,
      complexity: 'simple',
      coverage: 15.2,
      falsePositiveRate: 0.08,
      accuracy: 0.91,
    },
    {
      id: 'r2',
      condition: '(soil_moisture > 0.6) AND (water_level_cm >= 500) AND (NDWI > 0.15)',
      prediction: 1,
      predictionLabel: 'HIGH FLOOD RISK',
      precision: 0.88,
      recall: 0.79,
      f1Score: 0.83,
      support: 112,
      complexity: 'moderate',
      coverage: 12.8,
      falsePositiveRate: 0.12,
      accuracy: 0.87,
    },
    {
      id: 'r3',
      condition: '(NDWI > 0.2) AND (rain_mm > 10) AND (temperature > 15)',
      prediction: 1,
      predictionLabel: 'MEDIUM FLOOD RISK',
      precision: 0.85,
      recall: 0.75,
      f1Score: 0.79,
      support: 98,
      complexity: 'moderate',
      coverage: 11.2,
      falsePositiveRate: 0.15,
      accuracy: 0.84,
    },
    {
      id: 'r4',
      condition: '(water_level_cm >= 450) AND (rain_mm > 15) AND (soil_moisture > 0.5) AND (humidity > 80)',
      prediction: 1,
      predictionLabel: 'MEDIUM FLOOD RISK',
      precision: 0.82,
      recall: 0.72,
      f1Score: 0.76,
      support: 87,
      complexity: 'complex',
      coverage: 10.1,
      falsePositiveRate: 0.18,
      accuracy: 0.81,
    },
    {
      id: 'r5',
      condition: '(precipitation > 30) AND (water_level_cm >= 480)',
      prediction: 1,
      predictionLabel: 'MEDIUM FLOOD RISK',
      precision: 0.79,
      recall: 0.68,
      f1Score: 0.73,
      support: 76,
      complexity: 'simple',
      coverage: 8.9,
      falsePositiveRate: 0.21,
      accuracy: 0.78,
    },
    {
      id: 'r6',
      condition: '(water_level_cm >= 400) AND (rain_mm > 5)',
      prediction: 0,
      predictionLabel: 'LOW FLOOD RISK',
      precision: 0.91,
      recall: 0.88,
      f1Score: 0.89,
      support: 245,
      complexity: 'simple',
      coverage: 28.1,
      falsePositiveRate: 0.09,
      accuracy: 0.90,
    },
    {
      id: 'r7',
      condition: '(soil_moisture < 0.3) OR (NDWI < -0.1)',
      prediction: 0,
      predictionLabel: 'LOW FLOOD RISK',
      precision: 0.89,
      recall: 0.84,
      f1Score: 0.86,
      support: 189,
      complexity: 'moderate',
      coverage: 21.6,
      falsePositiveRate: 0.11,
      accuracy: 0.88,
    },
  ]

  return {
    id: 'rules-weather-001',
    name: 'weather.csv',
    description: 'Rule-based model for flood risk prediction using weather and water level data',
    dataSource: 'Copernicus Climate Data Store, IMGW, MPWIK',
    totalRules: rules.length,
    averagePrecision: rules.reduce((sum, r) => sum + r.precision, 0) / rules.length,
    averageRecall: rules.reduce((sum, r) => sum + r.recall, 0) / rules.length,
    lastUpdated: new Date().toLocaleDateString(),
    rules,
  }
}
