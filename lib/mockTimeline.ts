// ── Types ────────────────────────────────────────────────

export interface TimelineEvent {
  id: string
  date: string                      // ISO date string
  type: 'rule_trigger' | 'disaster' // rule alert vs real-world event
  title: string
  description: string
  severity: 'low' | 'moderate' | 'high' | 'critical'
  ruleIds?: string[]                // which rules fired (only for rule_trigger)
  waterLevelCm?: number
  rainMm?: number
  verified?: boolean                // was the alert later confirmed by a real event?
  source?: string                   // data source attribution
}

// ── Mock data ────────────────────────────────────────────

export function getMockTimelineEvents(): TimelineEvent[] {
  return [
    // 2026
    {
      id: 'te-01',
      date: '2026-03-24T14:30:00Z',
      type: 'rule_trigger',
      title: 'High water + heavy rain alert',
      description: 'Rules r1 & r2 triggered simultaneously. Water level at 565 cm with 28 mm rainfall in the last 6 hours.',
      severity: 'high',
      ruleIds: ['r1', 'r2'],
      waterLevelCm: 565,
      rainMm: 28,
      verified: false,
      source: 'ruleWorker live monitor',
    },
    {
      id: 'te-02',
      date: '2026-03-10T06:00:00Z',
      type: 'disaster',
      title: 'Odra minor flood — Wrocław Kozanów',
      description: 'Localized flooding in Kozanów district after 3 days of continuous rain. Water level peaked at 590 cm. Municipal emergency services deployed sandbag barriers.',
      severity: 'high',
      waterLevelCm: 590,
      rainMm: 45,
      source: 'IMGW-PIB / MPWiK Wrocław',
    },
    {
      id: 'te-03',
      date: '2026-03-09T22:15:00Z',
      type: 'rule_trigger',
      title: 'Critical water level + soil saturation',
      description: 'Rule r1 fired 8 hours before the Kozanów flood. Soil moisture exceeded 0.65, water level at 555 cm.',
      severity: 'critical',
      ruleIds: ['r1', 'r2'],
      waterLevelCm: 555,
      rainMm: 38,
      verified: true,
      source: 'ruleWorker monitor',
    },

    // 2025
    {
      id: 'te-04',
      date: '2025-09-15T08:15:00Z',
      type: 'rule_trigger',
      title: 'Satellite vegetation index anomaly',
      description: 'Rule r3 triggered by elevated NDWI (0.28) combined with 14 mm rain. Early warning signal for potential waterlogging.',
      severity: 'moderate',
      ruleIds: ['r3'],
      rainMm: 14,
      verified: false,
      source: 'Sentinel-2 NDWI / ERA5-Land',
    },
    {
      id: 'te-05',
      date: '2025-07-22T03:00:00Z',
      type: 'disaster',
      title: 'Flash flood — Wrocław Maślice',
      description: 'Unexpected flash flooding after a supercell thunderstorm dropped 62 mm of rain in 2 hours. Storm drains overwhelmed; 120 properties affected.',
      severity: 'critical',
      waterLevelCm: 620,
      rainMm: 62,
      source: 'IMGW-PIB / Wrocław City Alert',
    },
    {
      id: 'te-06',
      date: '2025-07-21T20:45:00Z',
      type: 'rule_trigger',
      title: 'Rapid rain accumulation warning',
      description: 'Rule r1 triggered as rain exceeded 20 mm threshold while water level was rising through 540 cm.',
      severity: 'high',
      ruleIds: ['r1'],
      waterLevelCm: 540,
      rainMm: 35,
      verified: true,
      source: 'ruleWorker monitor',
    },
    {
      id: 'te-07',
      date: '2025-06-02T18:45:00Z',
      type: 'rule_trigger',
      title: 'Elevated water level alert',
      description: 'Rule r1 fired as water level reached 560 cm with sustained 22 mm rain. Webhook delivery failed; manual notification sent.',
      severity: 'moderate',
      ruleIds: ['r1'],
      waterLevelCm: 560,
      rainMm: 22,
      verified: false,
      source: 'ruleWorker monitor',
    },
    {
      id: 'te-08',
      date: '2025-04-18T11:00:00Z',
      type: 'disaster',
      title: 'Spring snowmelt flooding — upper Odra',
      description: 'Rapid snowmelt in the Sudetes combined with rain caused Odra levels to rise to 575 cm at the Wrocław gauge. No major property damage but alert level was raised for 48 hours.',
      severity: 'moderate',
      waterLevelCm: 575,
      rainMm: 18,
      source: 'IMGW-PIB',
    },

    // 2024
    {
      id: 'te-09',
      date: '2024-09-14T10:00:00Z',
      type: 'disaster',
      title: 'September 2024 Odra flood',
      description: 'Major flood event along the Odra basin caused by Storm Boris. Water level peaked at 680 cm in Wrocław — the highest since 1997. Extensive evacuation of Kozanów and Maślice districts.',
      severity: 'critical',
      waterLevelCm: 680,
      rainMm: 95,
      source: 'IMGW-PIB / Copernicus EMS',
    },
    {
      id: 'te-10',
      date: '2024-09-13T16:30:00Z',
      type: 'rule_trigger',
      title: 'All rules triggered — extreme conditions',
      description: 'All three monitoring rules fired simultaneously 18 hours before the flood peak. Water level at 610 cm, rain accumulation 72 mm, soil fully saturated.',
      severity: 'critical',
      ruleIds: ['r1', 'r2', 'r3'],
      waterLevelCm: 610,
      rainMm: 72,
      verified: true,
      source: 'ruleWorker monitor (backtest)',
    },
    {
      id: 'te-11',
      date: '2024-06-05T09:20:00Z',
      type: 'rule_trigger',
      title: 'Soil moisture threshold exceeded',
      description: 'Rule r2 triggered by soil moisture 0.68 combined with water level at 510 cm. No subsequent flooding occurred.',
      severity: 'low',
      ruleIds: ['r2'],
      waterLevelCm: 510,
      rainMm: 8,
      verified: false,
      source: 'ERA5-Land soil moisture',
    },

    // 2023
    {
      id: 'te-12',
      date: '2023-12-28T05:00:00Z',
      type: 'disaster',
      title: 'Winter ice-jam flood warning',
      description: 'Ice jams on the Odra near Brzeg Dolny caused upstream water backup. Wrocław gauge read 545 cm. No dam breach but precautionary evacuations ordered.',
      severity: 'moderate',
      waterLevelCm: 545,
      source: 'IMGW-PIB',
    },
    {
      id: 'te-13',
      date: '2023-07-10T14:00:00Z',
      type: 'rule_trigger',
      title: 'NDWI anomaly detected',
      description: 'Rule r3 triggered by sudden rise in NDWI (0.31) from Sentinel-2 imagery after 3 days of intermittent rain.',
      severity: 'low',
      ruleIds: ['r3'],
      rainMm: 16,
      verified: false,
      source: 'Sentinel-2 / Copernicus',
    },
  ]
}

// ── Summary stats ────────────────────────────────────────

export function getTimelineStats(events: TimelineEvent[]) {
  const triggers = events.filter(e => e.type === 'rule_trigger')
  const disasters = events.filter(e => e.type === 'disaster')
  const verifiedTriggers = triggers.filter(e => e.verified)
  const missedDisasters = disasters.filter(d => {
    // A disaster is "missed" if no verified trigger exists within 48 hours before it
    const dTime = new Date(d.date).getTime()
    return !triggers.some(t => {
      const tTime = new Date(t.date).getTime()
      return t.verified && tTime < dTime && dTime - tTime < 48 * 60 * 60 * 1000
    })
  })

  return {
    totalEvents: events.length,
    totalTriggers: triggers.length,
    totalDisasters: disasters.length,
    verifiedAlerts: verifiedTriggers.length,
    falseAlarms: triggers.length - verifiedTriggers.length,
    missedEvents: missedDisasters.length,
    detectionRate: disasters.length > 0
      ? Math.round(((disasters.length - missedDisasters.length) / disasters.length) * 100)
      : 0,
  }
}
