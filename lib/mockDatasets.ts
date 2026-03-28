export interface Column {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean'
}

export interface Dataset {
  id: string
  name: string
  description: string
  columns: Column[]
  data: Record<string, any>[]
  fileSize: number
  lastUpdated: string
}

export function getMockWeatherDataset(): Dataset {
  const data: Record<string, any>[] = []
  
  // Generate mock data with water levels, temperature, etc.
  const startDate = new Date('2024-01-01')
  
  for (let i = 0; i < 100; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    data.push({
      timestamp: date.toISOString().split('T')[0],
      temperature: (15 + Math.random() * 20).toFixed(2),
      humidity: Math.floor(40 + Math.random() * 60),
      waterLevel: (150 + Math.random() * 100 - 30).toFixed(2),
      precipitation: (Math.random() * 50).toFixed(2),
      windSpeed: (Math.random() * 25).toFixed(2),
      pressure: (1000 + Math.random() * 20).toFixed(2),
      rainIntensity: (Math.random() * 100).toFixed(2),
      soilMoisture: Math.floor(30 + Math.random() * 70),
      floodRisk: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
    })
  }

  const columns: Column[] = [
    { name: 'timestamp', type: 'date' },
    { name: 'temperature', type: 'number' },
    { name: 'humidity', type: 'number' },
    { name: 'waterLevel', type: 'number' },
    { name: 'precipitation', type: 'number' },
    { name: 'windSpeed', type: 'number' },
    { name: 'pressure', type: 'number' },
    { name: 'rainIntensity', type: 'number' },
    { name: 'soilMoisture', type: 'number' },
    { name: 'floodRisk', type: 'string' },
  ]

  // Calculate approximate file size
  const fileSize = JSON.stringify(data).length

  return {
    id: 'weather-dataset-001',
    name: 'weather.csv',
    description: 'Weather and water level monitoring data for flood prediction',
    columns,
    data,
    fileSize,
    lastUpdated: new Date().toLocaleDateString(),
  }
}
