import {
  Workflow,
  WorkflowStep,
  WorkflowRun,
  WorkflowLog,
  WorkflowStepType,
  StepStatus,
  LogLevel,
} from './types'

// ── Step templates ─────────────────────────────────────────

function makeSteps(
  overrides: Partial<Record<WorkflowStepType, { status: StepStatus; lastRunAt: string | null; durationMs: number | null; config: Record<string, any> }>>
): WorkflowStep[] {
  const defaults: { type: WorkflowStepType; name: string; config: Record<string, any> }[] = [
    {
      type: 'data_ingestion',
      name: 'Data Ingestion',
      config: { source: 'Copernicus CDS, IMGW API, MPWIK', format: 'CSV / NetCDF', schedule: 'Every 6 hours' },
    },
    {
      type: 'data_validation',
      name: 'Data Validation',
      config: { missingThreshold: '15%', outlierDetection: true, dateConsistency: true },
    },
    {
      type: 'ripper_training',
      name: 'RIPPER Training',
      config: { algorithm: 'JRip (RIPPER)', targetVariable: 'flood_risk', minPrecision: 0.80, folds: 5 },
    },
    {
      type: 'live_monitoring',
      name: 'Live Monitoring',
      config: { pollingInterval: '15 min', source: 'Sentinel-2 / ERA5', evaluationWindow: '24 hours' },
    },
    {
      type: 'alert_dispatch',
      name: 'Alert Dispatch',
      config: { webhookUrl: 'https://webhook.site/abc123', emailRecipients: ['ops@city.gov'], escalation: true },
    },
    {
      type: 'report_generation',
      name: 'Report Generation',
      config: { schedule: 'Daily 06:00 UTC', format: 'PDF + CSV', recipients: ['mayor@city.gov', 'flood-team@city.gov'] },
    },
  ]

  return defaults.map((d, i) => {
    const o = overrides[d.type]
    return {
      id: `step-${i + 1}`,
      type: d.type,
      name: d.name,
      status: o?.status ?? 'success',
      config: { ...d.config, ...o?.config },
      lastRunAt: o?.lastRunAt ?? '2026-03-24T12:00:00Z',
      durationMs: o?.durationMs ?? 1200 + Math.floor(Math.random() * 3000),
    }
  })
}

// ── Run generator ──────────────────────────────────────────

function makeRuns(workflowId: string, count: number, failIndex?: number): WorkflowRun[] {
  const runs: WorkflowRun[] = []
  const base = new Date('2026-03-24T14:00:00Z')
  for (let i = 0; i < count; i++) {
    const started = new Date(base.getTime() - i * 6 * 3600_000)
    const dur = 8000 + Math.floor(Math.random() * 12000)
    const isFailed = i === failIndex
    runs.push({
      id: `${workflowId}-run-${i + 1}`,
      workflowId,
      startedAt: started.toISOString(),
      finishedAt: new Date(started.getTime() + dur).toISOString(),
      status: isFailed ? 'failed' : 'success',
      stepsCompleted: isFailed ? 3 : 6,
      stepsTotal: 6,
      alertsTriggered: i === 0 ? 2 : i % 3 === 0 ? 1 : 0,
      durationMs: dur,
    })
  }
  return runs
}

// ── Log generator ──────────────────────────────────────────

const stepNames: Record<WorkflowStepType, string> = {
  data_ingestion: 'Data Ingestion',
  data_validation: 'Data Validation',
  ripper_training: 'RIPPER Training',
  live_monitoring: 'Live Monitoring',
  alert_dispatch: 'Alert Dispatch',
  report_generation: 'Report Generation',
}

const logTemplates: { level: LogLevel; stepType: WorkflowStepType; msg: string }[] = [
  { level: 'info', stepType: 'data_ingestion', msg: 'Fetching ERA5 reanalysis data from Copernicus CDS...' },
  { level: 'info', stepType: 'data_ingestion', msg: 'Downloaded 2,340 records from IMGW telemetry API.' },
  { level: 'info', stepType: 'data_ingestion', msg: 'MPWIK water infrastructure data synced (145 stations).' },
  { level: 'info', stepType: 'data_validation', msg: 'Schema validation passed — 14 columns, 15,420 rows.' },
  { level: 'warn', stepType: 'data_validation', msg: 'Missing NDWI values: 12.1% (threshold 15%). Proceeding.' },
  { level: 'info', stepType: 'data_validation', msg: 'Outlier check passed. No anomalous sensor readings.' },
  { level: 'info', stepType: 'ripper_training', msg: 'Starting JRip training with 5-fold cross-validation...' },
  { level: 'info', stepType: 'ripper_training', msg: 'Extracted 7 rules. Best precision: 0.92, recall: 0.85.' },
  { level: 'info', stepType: 'ripper_training', msg: 'Model artifact saved: wroclaw_ripper_rules.txt' },
  { level: 'info', stepType: 'live_monitoring', msg: 'Polling Sentinel-2 latest pass (tile T33UXS)...' },
  { level: 'info', stepType: 'live_monitoring', msg: 'Evaluating 7 rules against current sensor readings.' },
  { level: 'warn', stepType: 'live_monitoring', msg: 'Rule r1 triggered: water_level_cm=560, rain_mm=25.' },
  { level: 'info', stepType: 'alert_dispatch', msg: 'Webhook POST to https://webhook.site/abc123 — 200 OK.' },
  { level: 'info', stepType: 'alert_dispatch', msg: 'Email alert dispatched to ops@city.gov.' },
  { level: 'error', stepType: 'alert_dispatch', msg: 'Escalation webhook failed: timeout after 10s. Retrying...' },
  { level: 'info', stepType: 'alert_dispatch', msg: 'Escalation retry succeeded (attempt 2/3).' },
  { level: 'info', stepType: 'report_generation', msg: 'Generating daily flood risk report (PDF + CSV)...' },
  { level: 'info', stepType: 'report_generation', msg: 'Report delivered to 2 recipients.' },
]

function makeLogs(runId: string, subset?: number[]): WorkflowLog[] {
  const indices = subset ?? logTemplates.map((_, i) => i)
  const base = new Date('2026-03-24T12:00:00Z')
  return indices.map((idx, order) => {
    const t = logTemplates[idx]
    return {
      id: `${runId}-log-${order + 1}`,
      runId,
      timestamp: new Date(base.getTime() + order * 2500).toISOString(),
      level: t.level,
      stepType: t.stepType,
      stepName: stepNames[t.stepType],
      message: t.msg,
    }
  })
}

// ── Mock workflows ─────────────────────────────────────────

const mockWorkflows: Workflow[] = [
  {
    id: 'wf-flood-wroclaw',
    name: 'Wrocław Flood Pipeline',
    projectId: 'cmn4b0jr70002g2acpk8dye9u',
    projectName: 'Wrocław Flood Monitor',
    status: 'active',
    steps: makeSteps({}),
    runs: makeRuns('wf-flood-wroclaw', 8),
    logs: makeLogs('wf-flood-wroclaw-run-1'),
    schedule: 'Every 6 hours',
    nextRunAt: '2026-03-24T18:00:00Z',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-03-24T14:30:00Z',
    successRate: 95.2,
  },
  {
    id: 'wf-odra-quality',
    name: 'Odra Water Quality',
    projectId: 'cmn4b0jr70002g2acpk8dye9u',
    projectName: 'Wrocław Flood Monitor',
    status: 'active',
    steps: makeSteps({
      data_ingestion: { status: 'success', lastRunAt: '2026-03-24T10:00:00Z', durationMs: 3200, config: { source: 'Copernicus CDS, GIOŚ Water Quality API', schedule: 'Every 12 hours' } },
      ripper_training: { status: 'success', lastRunAt: '2026-03-24T10:05:00Z', durationMs: 5600, config: { targetVariable: 'water_quality_index', minPrecision: 0.75 } },
      live_monitoring: { status: 'success', lastRunAt: '2026-03-24T10:08:00Z', durationMs: 1800, config: { pollingInterval: '30 min', evaluationWindow: '48 hours' } },
    }),
    runs: makeRuns('wf-odra-quality', 6),
    logs: makeLogs('wf-odra-quality-run-1', [0, 1, 3, 4, 6, 7, 9, 10, 12, 16, 17]),
    schedule: 'Every 12 hours',
    nextRunAt: '2026-03-24T22:00:00Z',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-03-24T10:10:00Z',
    successRate: 100,
  },
  {
    id: 'wf-drought-alert',
    name: 'Drought Early Warning',
    projectId: 'cmn4b0jr70002g2acpk8dye9u',
    projectName: 'Wrocław Flood Monitor',
    status: 'paused',
    steps: makeSteps({
      data_ingestion: { status: 'success', lastRunAt: '2026-03-20T06:00:00Z', durationMs: 2800, config: { source: 'ERA5 Land, Sentinel-2 NDWI', schedule: 'Daily 06:00 UTC' } },
      data_validation: { status: 'success', lastRunAt: '2026-03-20T06:03:00Z', durationMs: 900, config: {} },
      ripper_training: { status: 'success', lastRunAt: '2026-03-20T06:05:00Z', durationMs: 4200, config: { targetVariable: 'drought_severity', minPrecision: 0.70 } },
      live_monitoring: { status: 'disabled', lastRunAt: null, durationMs: null, config: { pollingInterval: '6 hours' } },
      alert_dispatch: { status: 'disabled', lastRunAt: null, durationMs: null, config: {} },
      report_generation: { status: 'disabled', lastRunAt: null, durationMs: null, config: { schedule: 'Weekly Monday 08:00 UTC' } },
    }),
    runs: makeRuns('wf-drought-alert', 4),
    logs: makeLogs('wf-drought-alert-run-1', [0, 3, 4, 6, 7]),
    schedule: 'Daily 06:00 UTC',
    nextRunAt: '—',
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-03-20T06:10:00Z',
    successRate: 87.5,
  },
  {
    id: 'wf-infra-risk',
    name: 'Infrastructure Flood Risk',
    projectId: 'cmn4b0jr70002g2acpk8dye9u',
    projectName: 'Wrocław Flood Monitor',
    status: 'error',
    steps: makeSteps({
      data_ingestion: { status: 'success', lastRunAt: '2026-03-24T08:00:00Z', durationMs: 1900, config: { source: 'MPWIK Infrastructure, OpenStreetMap Waterways' } },
      data_validation: { status: 'error', lastRunAt: '2026-03-24T08:02:00Z', durationMs: 400, config: { missingThreshold: '10%' } },
      ripper_training: { status: 'pending', lastRunAt: null, durationMs: null, config: { targetVariable: 'infrastructure_damage_risk' } },
      live_monitoring: { status: 'pending', lastRunAt: null, durationMs: null, config: {} },
      alert_dispatch: { status: 'pending', lastRunAt: null, durationMs: null, config: { webhookUrl: 'https://infra-alerts.city.gov/hook' } },
      report_generation: { status: 'pending', lastRunAt: null, durationMs: null, config: {} },
    }),
    runs: makeRuns('wf-infra-risk', 5, 0),
    logs: makeLogs('wf-infra-risk-run-1', [0, 1, 3]),
    schedule: 'Every 8 hours',
    nextRunAt: '2026-03-24T16:00:00Z',
    createdAt: '2026-03-10T14:00:00Z',
    updatedAt: '2026-03-24T08:02:00Z',
    successRate: 72.0,
  },
]

// ── Public API ─────────────────────────────────────────────

export function getAllWorkflows(): Workflow[] {
  return mockWorkflows
}

export function getWorkflowById(id: string): Workflow | null {
  return mockWorkflows.find((w) => w.id === id) ?? null
}
