import { ProjectDetail, DatasetInfo, Rule, AlertRecord, RuleEvaluationResult } from './types';

export const mockProjectDetail: Record<string, {
  project: ProjectDetail;
  dataset: DatasetInfo;
  rules: Rule[];
  alerts: AlertRecord[];
  liveEvaluation: RuleEvaluationResult;
}> = {
  // We use a fallback key "default" to show some data even if ID doesn't match ideally in a real app,
  // but we will copy this to whichever ID was requested if we want it to work for any dynamic Prisma ID,
  // or handle the fallback in the component. Let's export it as a base mock we can just clone.
  'default_mock_id': {
    project: {
      id: 'default_mock_id',
      name: 'Wrocław Flood Monitor',
      area: { type: 'city', name: 'Wrocław' },
      target: { type: 'threshold', variable: 'water_level_cm', condition: '>', value: 580 },
      webhookUrl: 'https://webhook.site/abc123',
      monitoringEnabled: true,
      status: 'active',
      createdAt: '2026-03-24T10:00:00Z',
      updatedAt: '2026-03-24T10:00:00Z',
      lastTraining: '2026-03-24T12:00:00Z',
      lastAlert: '2026-03-24T14:30:00Z',
    },
    dataset: {
      rows: 15420,
      columns: 14,
      dateRange: ['2015-01-01', '2026-03-20'],
      missingData: {
        'NDWI': '12%',
        'Soil Moisture': '4%',
      },
      sampleData: [
        { date: '2026-03-20', water_level_cm: 320, rain_mm: 12.5, soil_moisture: 0.45, NDWI: -0.1 },
        { date: '2026-03-19', water_level_cm: 315, rain_mm: 5.0, soil_moisture: 0.42, NDWI: -0.12 },
        { date: '2026-03-18', water_level_cm: 310, rain_mm: 0.0, soil_moisture: 0.40, NDWI: -0.15 },
        { date: '2026-03-17', water_level_cm: 312, rain_mm: 2.1, soil_moisture: 0.41, NDWI: -0.14 },
        { date: '2026-03-16', water_level_cm: 318, rain_mm: 15.2, soil_moisture: 0.46, NDWI: -0.09 },
      ]
    },
    rules: [
      { id: 'r1', condition: '(water_level_cm >= 550) AND (rain_mm > 20)', prediction: 1, precision: 0.92, recall: 0.85 },
      { id: 'r2', condition: '(soil_moisture > 0.6) AND (water_level_cm >= 500)', prediction: 1, precision: 0.88, recall: 0.79 },
      { id: 'r3', condition: '(NDWI > 0.2) AND (rain_mm > 10)', prediction: 1, precision: 0.85, recall: 0.75 },
    ],
    alerts: [
      { id: 'al1', timestamp: '2026-03-24T14:30:00Z', triggeredRules: ['r1', 'r2'], webhookStatus: 'success' },
      { id: 'al2', timestamp: '2025-09-15T08:15:00Z', triggeredRules: ['r3'], webhookStatus: 'success' },
      { id: 'al3', timestamp: '2025-06-02T18:45:00Z', triggeredRules: ['r1'], webhookStatus: 'failed' },
    ],
    liveEvaluation: {
      currentValues: {
        water_level_cm: 560,
        rain_mm: 25,
        soil_moisture: 0.55,
        NDWI: 0.15
      },
      triggeredRuleIds: ['r1']
    }
  }
};

// Helper function to return a mock clone for any ID, so dynamic DB IDs don't just return "Not found" 
// unless we specifically want them to. Since the request wants ID based data, we will just map any ID 
// to this mock data but override the ID and maybe the Name if we can.
export function getMockProjectData(id: string) {
  // If we had specific db mappings we could return them here.
  // For the sake of the UI prototype, we return the default mock but override the project ID.
  const data = JSON.parse(JSON.stringify(mockProjectDetail['default_mock_id']));
  data.project.id = id;
  return data;
}
