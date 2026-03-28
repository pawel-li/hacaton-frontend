# ruleWorker — Frontend Architecture & API Specification

> Rule-based ML monitoring platform for flood/disaster risk detection, powered by Copernicus satellite data.

---

## Table of Contents

1. [Views & Pages](#views--pages)
2. [Type Definitions](#type-definitions)
3. [API Specification](#api-specification)
4. [Database Schema](#database-schema)

---

## Views & Pages

### `/` — Home (Landing)

Static onboarding page. No API calls required.

| Element | Description |
|---------|-------------|
| Hero section | Product intro, "Watch Demo" + "Get Started" |
| Quick-start steps | 6-step guide (Create API Key → Dashboard) |
| Code snippet | `pip install ruleworker` copy block |
| Resources | Docs, API Reference, Notebook, Support links |

---

### `/projects` — Projects List

Server-rendered page. Loads projects from the database and supports creating new ones.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/projects` | GET | List all projects |
| `POST /api/projects` | POST | Create a new project |

**Request (POST):**
```json
{ "name": "Wrocław Flood Monitor" }
```

**Response (GET):**
```json
[
  { "id": "clx...", "name": "Wrocław Flood Monitor", "createdAt": "2026-03-24T10:00:00Z" }
]
```

---

### `/projects/{id}` — Project Overview

Displays project details, area/target config, and map placeholder.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/projects/{id}` | GET | Full project detail |
| `PATCH /api/projects/{id}` | PATCH | Update project settings |
| `POST /api/projects/{id}/retrain` | POST | Trigger model retraining |

**Response (GET):**
```json
{
  "id": "clx...",
  "name": "Wrocław Flood Monitor",
  "area": { "type": "city", "name": "Wrocław" },
  "target": { "type": "threshold", "variable": "water_level_cm", "condition": ">", "value": 580 },
  "webhookUrl": "https://webhook.site/abc123",
  "monitoringEnabled": true,
  "status": "active",
  "createdAt": "2026-03-24T10:00:00Z",
  "updatedAt": "2026-03-24T10:00:00Z",
  "lastTraining": "2026-03-24T12:00:00Z",
  "lastAlert": "2026-03-24T14:30:00Z"
}
```

**User actions → endpoints:**
| Action | Endpoint |
|--------|----------|
| Toggle monitoring | `PATCH /api/projects/{id}` `{ "monitoringEnabled": true }` |
| Edit project | `PATCH /api/projects/{id}` `{ "name": "...", "webhookUrl": "..." }` |
| Retrain model | `POST /api/projects/{id}/retrain` |

---

### `/projects/{id}/datasets/{filename}` — Dataset Detail

Shows a tabular preview of an uploaded dataset file with metadata and column info.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/projects/{id}/datasets` | GET | List available datasets |
| `GET /api/projects/{id}/datasets/{filename}` | GET | Dataset metadata + paginated rows |
| `GET /api/projects/{id}/datasets/{filename}/download` | GET | Download raw CSV file |

**Response (GET detail):**
```json
{
  "id": "ds-weather",
  "name": "weather.csv",
  "description": "Wrocław meteorological + hydrological readings",
  "columns": [
    { "name": "timestamp", "type": "date" },
    { "name": "temperature", "type": "number" },
    { "name": "waterLevel", "type": "number" },
    { "name": "precipitation", "type": "number" },
    { "name": "soilMoisture", "type": "number" },
    { "name": "floodRisk", "type": "string" }
  ],
  "rows": 15420,
  "fileSize": 2458000,
  "lastUpdated": "2026-03-20T08:00:00Z",
  "data": [
    { "timestamp": "2026-03-20", "temperature": 8.2, "waterLevel": 320, "precipitation": 12.5, "soilMoisture": 0.45, "floodRisk": "Low" }
  ],
  "page": 1,
  "pageSize": 100,
  "totalPages": 155
}
```

**Query params:** `?page=1&pageSize=100&sort=timestamp&order=desc`

---

### `/projects/{id}/rules/{filename}` — Rules Analysis

Shows extracted RIPPER/ML rules with precision/recall metrics and complexity ratings.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/projects/{id}/rules` | GET | List rule sets |
| `GET /api/projects/{id}/rules/{filename}` | GET | Full rules with metrics |
| `POST /api/projects/{id}/rules` | POST | Create a new rule manually |
| `GET /api/projects/{id}/rules/{filename}/export` | GET | Export rules as CSV |

**Response (GET detail):**
```json
{
  "id": "rs-weather",
  "name": "weather.csv",
  "dataSource": "Copernicus Climate Data Store, IMGW-PIB, MPWiK",
  "totalRules": 7,
  "averagePrecision": 0.87,
  "averageRecall": 0.80,
  "lastUpdated": "2026-03-24T12:00:00Z",
  "rules": [
    {
      "id": "r1",
      "condition": "(water_level_cm >= 550) AND (rain_mm > 20)",
      "prediction": 1,
      "predictionLabel": "HIGH FLOOD RISK",
      "precision": 0.92,
      "recall": 0.85,
      "f1Score": 0.88,
      "support": 145,
      "complexity": "moderate",
      "coverage": 0.23,
      "falsePositiveRate": 0.08,
      "accuracy": 0.91
    }
  ]
}
```

---

### `/projects/{id}/monitor` — Live Monitor

Real-time rule evaluation with the Rule Proximity Gauge (trend tracker). Displays how close current sensor readings are to triggering each rule.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/projects/{id}/monitor/live` | GET | Current feature values + triggered rules |
| `GET /api/projects/{id}/rules` | GET | Rules for proximity calculation |
| `POST /api/projects/{id}/monitor/evaluate` | POST | Evaluate rules against provided values |
| `WS /api/projects/{id}/monitor/stream` | WebSocket | Live sensor data stream |

**Response (GET live):**
```json
{
  "currentValues": {
    "water_level_cm": 560,
    "rain_mm": 25,
    "soil_moisture": 0.55,
    "NDWI": 0.15
  },
  "previousValues": {
    "water_level_cm": 530,
    "rain_mm": 18,
    "soil_moisture": 0.50,
    "NDWI": 0.10
  },
  "triggeredRuleIds": ["r1"],
  "timestamp": "2026-03-24T14:30:00Z"
}
```

**Request (POST evaluate):**
```json
{
  "featureValues": {
    "water_level_cm": 560,
    "rain_mm": 25,
    "soil_moisture": 0.55,
    "NDWI": 0.15
  }
}
```

**Response (POST evaluate):**
```json
{
  "triggeredRuleIds": ["r1"],
  "ruleProximities": [
    {
      "ruleId": "r1",
      "overallProximity": 1.0,
      "triggered": true,
      "conditions": [
        { "variable": "water_level_cm", "operator": ">=", "threshold": 550, "currentValue": 560, "proximity": 1.0, "triggered": true },
        { "variable": "rain_mm", "operator": ">", "threshold": 20, "currentValue": 25, "proximity": 1.0, "triggered": true }
      ]
    },
    {
      "ruleId": "r2",
      "overallProximity": 0.92,
      "triggered": false,
      "conditions": [
        { "variable": "soil_moisture", "operator": ">", "threshold": 0.6, "currentValue": 0.55, "proximity": 0.92, "triggered": false },
        { "variable": "water_level_cm", "operator": ">=", "threshold": 500, "currentValue": 560, "proximity": 1.0, "triggered": true }
      ]
    }
  ]
}
```

**WebSocket message (stream):**
```json
{
  "type": "sensor_update",
  "timestamp": "2026-03-24T14:31:00Z",
  "values": { "water_level_cm": 562, "rain_mm": 26, "soil_moisture": 0.56, "NDWI": 0.16 }
}
```

---

### `/projects/{id}/monitor/timeline` — Historical Event Timeline

Timeline view showing past rule triggers overlaid on actual disaster events, grouped by year.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/projects/{id}/timeline` | GET | All historical events |
| `GET /api/projects/{id}/timeline/stats` | GET | Aggregated detection statistics |

**Response (GET events):**
```json
{
  "events": [
    {
      "id": "te-01",
      "date": "2026-03-24T14:30:00Z",
      "type": "rule_trigger",
      "title": "High water + heavy rain alert",
      "description": "Rules r1 & r2 triggered. Water level at 565 cm with 28 mm rainfall.",
      "severity": "high",
      "ruleIds": ["r1", "r2"],
      "waterLevelCm": 565,
      "rainMm": 28,
      "verified": false,
      "source": "ruleWorker live monitor"
    },
    {
      "id": "te-02",
      "date": "2026-03-10T06:00:00Z",
      "type": "disaster",
      "title": "Odra minor flood — Wrocław Kozanów",
      "description": "Localized flooding after 3 days of rain. Water level peaked at 590 cm.",
      "severity": "high",
      "waterLevelCm": 590,
      "rainMm": 45,
      "source": "IMGW-PIB / MPWiK Wrocław"
    }
  ]
}
```

**Query params:** `?type=rule_trigger|disaster&severity=low|moderate|high|critical&from=2024-01-01&to=2026-12-31`

**Response (GET stats):**
```json
{
  "totalEvents": 13,
  "totalTriggers": 8,
  "totalDisasters": 5,
  "verifiedAlerts": 3,
  "falseAlarms": 5,
  "missedEvents": 1,
  "detectionRate": 80
}
```

---

### `/projects/{id}/monitor/settings` — Monitor Settings

*(Page placeholder — not yet implemented)*

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/projects/{id}/monitor/settings` | GET | Current monitoring config |
| `PATCH /api/projects/{id}/monitor/settings` | PATCH | Update monitoring config |

**Response (GET):**
```json
{
  "enabled": true,
  "intervalSeconds": 300,
  "webhookUrl": "https://webhook.site/abc123",
  "alertCooldownMinutes": 60,
  "dataSources": ["imgw_hydro", "era5_land", "sentinel2_ndwi"],
  "notificationChannels": ["webhook", "email"]
}
```

---

### `/projects/{id}/monitor/logs` — Monitor Logs

*(Page placeholder — not yet implemented)*

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/projects/{id}/monitor/logs` | GET | Paginated monitoring log entries |

**Response (GET):**
```json
{
  "logs": [
    {
      "id": "ml-001",
      "timestamp": "2026-03-24T14:30:00Z",
      "level": "info",
      "message": "Evaluation cycle completed. 1 rule triggered.",
      "ruleIds": ["r1"],
      "featureSnapshot": { "water_level_cm": 560, "rain_mm": 25 }
    }
  ],
  "page": 1,
  "totalPages": 12
}
```

**Query params:** `?level=info|warn|error&page=1&pageSize=50`

---

### `/workflows` — Workflows List

Global cross-project automation pipelines.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/workflows` | GET | List all workflows |
| `POST /api/workflows` | POST | Create a new workflow |

**Response (GET):**
```json
[
  {
    "id": "wf-flood-wroclaw",
    "name": "Wrocław Flood Pipeline",
    "projectId": "clx...",
    "projectName": "Wrocław Flood Monitor",
    "status": "active",
    "schedule": "*/30 * * * *",
    "nextRunAt": "2026-03-24T15:00:00Z",
    "successRate": 95.2,
    "stepsTotal": 6,
    "stepsCompleted": 6,
    "lastRunAt": "2026-03-24T14:30:00Z",
    "createdAt": "2026-01-15T10:00:00Z"
  }
]
```

---

### `/workflows/{id}` — Workflow Detail

Shows the 6-step pipeline visualization, configuration, and execution history.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/workflows/{id}` | GET | Full workflow with steps, runs, config |
| `PATCH /api/workflows/{id}` | PATCH | Update workflow (enable/disable, schedule) |
| `DELETE /api/workflows/{id}` | DELETE | Delete workflow |
| `POST /api/workflows/{id}/run` | POST | Trigger manual run |

**Response (GET):**
```json
{
  "id": "wf-flood-wroclaw",
  "name": "Wrocław Flood Pipeline",
  "projectId": "clx...",
  "projectName": "Wrocław Flood Monitor",
  "status": "active",
  "schedule": "*/30 * * * *",
  "nextRunAt": "2026-03-24T15:00:00Z",
  "successRate": 95.2,
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-03-24T14:30:00Z",
  "steps": [
    {
      "id": "step-ingest",
      "type": "data_ingestion",
      "name": "Ingest Copernicus & IMGW data",
      "status": "success",
      "config": {
        "sources": ["ERA5-Land", "IMGW Hydro", "Sentinel-2"],
        "region": "wroclaw",
        "format": "csv"
      },
      "lastRunAt": "2026-03-24T14:30:00Z",
      "durationMs": 12400
    }
  ],
  "runs": [
    {
      "id": "run-001",
      "workflowId": "wf-flood-wroclaw",
      "startedAt": "2026-03-24T14:30:00Z",
      "finishedAt": "2026-03-24T14:32:15Z",
      "status": "success",
      "stepsCompleted": 6,
      "stepsTotal": 6,
      "alertsTriggered": 1,
      "durationMs": 135000
    }
  ]
}
```

**Pipeline step types (in order):**
1. `data_ingestion` — Fetch from Copernicus/IMGW/Sentinel
2. `data_validation` — Schema checks, outlier detection
3. `ripper_training` — Re-train RIPPER classification rules
4. `live_monitoring` — Evaluate rules against latest data
5. `alert_dispatch` — Send webhook/email alerts
6. `report_generation` — Generate summary PDF/dashboard

---

### `/workflows/{id}/logs` — Workflow Execution Logs

Filterable log stream for a specific workflow.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/workflows/{id}/logs` | GET | Paginated + filterable logs |

**Response (GET):**
```json
{
  "logs": [
    {
      "id": "log-001",
      "runId": "run-001",
      "timestamp": "2026-03-24T14:30:05Z",
      "level": "info",
      "stepType": "data_ingestion",
      "stepName": "Ingest Copernicus & IMGW data",
      "message": "Successfully fetched 1,420 new records from ERA5-Land."
    }
  ],
  "page": 1,
  "totalPages": 5
}
```

**Query params:** `?level=info|warn|error&stepType=data_ingestion|ripper_training&runId=run-001&page=1&pageSize=100`

---

## Type Definitions

All types used across the frontend, defined in `lib/types.ts`.

### Core Types

```typescript
interface Area {
  type: string          // "city" | "region" | "basin"
  name: string          // "Wrocław"
}

interface Target {
  type: string          // "threshold" | "classification" | "regression"
  variable: string      // "water_level_cm"
  condition: string     // ">" | ">=" | "<" | "<="
  value: number | string
}

interface ProjectDetail {
  id: string
  name: string
  area: Area
  target: Target
  webhookUrl: string
  monitoringEnabled: boolean
  status: 'active' | 'inactive' | 'training' | 'error'
  createdAt: string
  updatedAt: string
  lastTraining: string
  lastAlert: string
}
```

### Dataset Types

```typescript
interface Column {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean'
}

interface Dataset {
  id: string
  name: string
  description: string
  columns: Column[]
  data: Record<string, any>[]
  fileSize: number
  lastUpdated: string
}

interface DatasetInfo {
  rows: number
  columns: number
  dateRange: [string, string]
  missingData: Record<string, string>
  sampleData: Record<string, any>[]
}
```

### Rule Types

```typescript
interface Rule {
  id: string
  condition: string     // RIPPER-style: "(variable op value) AND ..."
  prediction: number    // 0 or 1
  precision?: number
  recall?: number
}

interface RuleMetrics extends Rule {
  predictionLabel: string    // "HIGH FLOOD RISK"
  f1Score: number
  support: number
  complexity: 'simple' | 'moderate' | 'complex'
  coverage: number
  falsePositiveRate: number
  accuracy: number
}

interface AlertRecord {
  id: string
  timestamp: string
  triggeredRules: string[]
  webhookStatus: 'success' | 'failed' | 'pending'
}
```

### Monitor Types

```typescript
interface FeatureValues {
  [key: string]: number   // e.g. { water_level_cm: 560, rain_mm: 25 }
}

interface RuleEvaluationResult {
  currentValues: FeatureValues
  triggeredRuleIds: string[]
}

interface ConditionProximity {
  variable: string
  operator: string
  threshold: number
  currentValue: number
  proximity: number        // 0.0 – 1.0
  triggered: boolean
}

interface RuleProximity {
  ruleId: string
  overallProximity: number // 0.0 – 1.0 (bottleneck of conditions)
  triggered: boolean
  trend: 'rising' | 'falling' | 'stable'
  conditions: ConditionProximity[]
}
```

### Timeline Types

```typescript
interface TimelineEvent {
  id: string
  date: string
  type: 'rule_trigger' | 'disaster'
  title: string
  description: string
  severity: 'low' | 'moderate' | 'high' | 'critical'
  ruleIds?: string[]
  waterLevelCm?: number
  rainMm?: number
  verified?: boolean       // was the alert confirmed by a real event?
  source?: string          // "IMGW-PIB", "Sentinel-2", etc.
}

interface TimelineStats {
  totalEvents: number
  totalTriggers: number
  totalDisasters: number
  verifiedAlerts: number
  falseAlarms: number
  missedEvents: number
  detectionRate: number    // percentage 0–100
}
```

### Workflow Types

```typescript
type WorkflowStatus = 'active' | 'paused' | 'error' | 'completed'
type StepStatus = 'success' | 'warning' | 'error' | 'disabled' | 'running' | 'pending'
type LogLevel = 'info' | 'warn' | 'error'
type WorkflowStepType =
  | 'data_ingestion'
  | 'data_validation'
  | 'ripper_training'
  | 'live_monitoring'
  | 'alert_dispatch'
  | 'report_generation'

interface WorkflowStep {
  id: string
  type: WorkflowStepType
  name: string
  status: StepStatus
  config: Record<string, string | number | boolean | string[]>
  lastRunAt: string | null
  durationMs: number | null
}

interface WorkflowRun {
  id: string
  workflowId: string
  startedAt: string
  finishedAt: string | null
  status: 'success' | 'failed' | 'running' | 'cancelled'
  stepsCompleted: number
  stepsTotal: number
  alertsTriggered: number
  durationMs: number
}

interface WorkflowLog {
  id: string
  runId: string
  timestamp: string
  level: LogLevel
  stepType: WorkflowStepType
  stepName: string
  message: string
}

interface Workflow {
  id: string
  name: string
  projectId: string
  projectName: string
  status: WorkflowStatus
  steps: WorkflowStep[]
  runs: WorkflowRun[]
  logs: WorkflowLog[]
  schedule: string         // cron expression
  nextRunAt: string
  createdAt: string
  updatedAt: string
  successRate: number      // percentage 0–100
}
```

---

## API Specification

### Base URL

```
https://api.ruleworker.io/v1
```

All endpoints return JSON. Authentication via `Authorization: Bearer <token>` header.

---

### Projects

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects` | List all projects |
| `POST` | `/projects` | Create project |
| `GET` | `/projects/{id}` | Get project detail |
| `PATCH` | `/projects/{id}` | Update project |
| `DELETE` | `/projects/{id}` | Delete project |
| `POST` | `/projects/{id}/retrain` | Trigger RIPPER retraining |

### Datasets

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/{id}/datasets` | List datasets for project |
| `POST` | `/projects/{id}/datasets` | Upload new dataset (multipart) |
| `GET` | `/projects/{id}/datasets/{filename}` | Get dataset metadata + rows |
| `DELETE` | `/projects/{id}/datasets/{filename}` | Delete dataset |
| `GET` | `/projects/{id}/datasets/{filename}/download` | Download raw CSV |

**Query params for dataset rows:** `page`, `pageSize`, `sort`, `order`

### Rules

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/{id}/rules` | List rule sets |
| `GET` | `/projects/{id}/rules/{filename}` | Get rules with metrics |
| `POST` | `/projects/{id}/rules` | Create rule manually |
| `DELETE` | `/projects/{id}/rules/{ruleId}` | Delete a specific rule |
| `GET` | `/projects/{id}/rules/{filename}/export` | Export as CSV |

### Monitor

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/{id}/monitor/live` | Current sensor readings + evaluations |
| `POST` | `/projects/{id}/monitor/evaluate` | Evaluate rules against custom values |
| `GET` | `/projects/{id}/monitor/settings` | Get monitor config |
| `PATCH` | `/projects/{id}/monitor/settings` | Update monitor config |
| `GET` | `/projects/{id}/monitor/logs` | Paginated monitor logs |
| `WS` | `/projects/{id}/monitor/stream` | WebSocket for live sensor feed |

### Timeline

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/{id}/timeline` | Historical events (triggers + disasters) |
| `GET` | `/projects/{id}/timeline/stats` | Detection rate statistics |
| `POST` | `/projects/{id}/timeline` | Add manual disaster event |

**Query params:** `type`, `severity`, `from`, `to`, `page`, `pageSize`

### Alerts

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/{id}/alerts` | List triggered alerts |
| `GET` | `/projects/{id}/alerts/{alertId}` | Alert detail |

### Workflows

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/workflows` | List all workflows |
| `POST` | `/workflows` | Create workflow |
| `GET` | `/workflows/{id}` | Get workflow detail (steps + runs) |
| `PATCH` | `/workflows/{id}` | Update workflow (enable/disable, schedule) |
| `DELETE` | `/workflows/{id}` | Delete workflow |
| `POST` | `/workflows/{id}/run` | Trigger manual execution |
| `GET` | `/workflows/{id}/logs` | Execution logs |

**Query params for logs:** `level`, `stepType`, `runId`, `page`, `pageSize`

---

### Error Format

All errors follow a consistent shape:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Project with id 'xxx' not found.",
    "status": 404
  }
}
```

| Code | Status | When |
|------|--------|------|
| `VALIDATION_ERROR` | 400 | Invalid request body / params |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | No access to resource |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Duplicate name / resource |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Database Schema

Current Prisma schema (SQLite — will migrate to PostgreSQL for production):

```prisma
model Project {
  id                String    @id @default(cuid())
  name              String
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  status            String    @default("active")     // active | inactive | training | error
  areaType          String?                          // city | region | basin
  areaName          String?
  targetVariable    String?                          // water_level_cm
  targetCondition   String?                          // > | >= | < | <=
  targetValue       Float?                           // 580
  webhookUrl        String?
  monitoringEnabled Boolean   @default(false)
  lastTraining      DateTime?
  lastAlert         DateTime?

  datasets          Dataset[]
  rules             RuleSet[]
  alerts            Alert[]
  workflows         Workflow[]
  timelineEvents    TimelineEvent[]
  monitorLogs       MonitorLog[]
}

model Dataset {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  filename    String
  description String?
  rows        Int
  columns     Int
  fileSize    Int                           // bytes
  filePath    String                        // storage path
  dateFrom    DateTime?
  dateTo      DateTime?
  missingData Json?                         // { "NDWI": "12%" }
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([projectId, filename])
}

model RuleSet {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  filename    String
  dataSource  String?
  lastUpdated DateTime @default(now())
  rules       Rule[]

  @@unique([projectId, filename])
}

model Rule {
  id               String   @id @default(cuid())
  ruleSetId        String
  ruleSet          RuleSet  @relation(fields: [ruleSetId], references: [id])
  condition        String                    // "(water_level_cm >= 550) AND (rain_mm > 20)"
  prediction       Int                       // 0 or 1
  predictionLabel  String?                   // "HIGH FLOOD RISK"
  precision        Float?
  recall           Float?
  f1Score          Float?
  support          Int?
  complexity       String?                   // simple | moderate | complex
  coverage         Float?
  falsePositiveRate Float?
  accuracy         Float?
  createdAt        DateTime @default(now())
}

model Alert {
  id             String   @id @default(cuid())
  projectId      String
  project        Project  @relation(fields: [projectId], references: [id])
  timestamp      DateTime @default(now())
  triggeredRules Json                        // ["r1", "r2"]
  webhookStatus  String   @default("pending") // success | failed | pending
  featureSnapshot Json?                      // { water_level_cm: 560, ... }
}

model TimelineEvent {
  id           String   @id @default(cuid())
  projectId    String
  project      Project  @relation(fields: [projectId], references: [id])
  date         DateTime
  type         String                        // rule_trigger | disaster
  title        String
  description  String
  severity     String                        // low | moderate | high | critical
  ruleIds      Json?                         // ["r1", "r2"]
  waterLevelCm Float?
  rainMm       Float?
  verified     Boolean  @default(false)
  source       String?
  createdAt    DateTime @default(now())
}

model Workflow {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])
  name        String
  status      String   @default("active")    // active | paused | error | completed
  schedule    String                         // cron expression
  nextRunAt   DateTime?
  successRate Float    @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  steps       WorkflowStep[]
  runs        WorkflowRun[]
}

model WorkflowStep {
  id         String   @id @default(cuid())
  workflowId String
  workflow   Workflow  @relation(fields: [workflowId], references: [id])
  type       String                          // data_ingestion | data_validation | ...
  name       String
  status     String   @default("pending")    // success | warning | error | disabled | running | pending
  config     Json                            // step-specific config
  sortOrder  Int
  lastRunAt  DateTime?
  durationMs Int?
}

model WorkflowRun {
  id              String    @id @default(cuid())
  workflowId      String
  workflow        Workflow   @relation(fields: [workflowId], references: [id])
  startedAt       DateTime  @default(now())
  finishedAt      DateTime?
  status          String    @default("running") // success | failed | running | cancelled
  stepsCompleted  Int       @default(0)
  stepsTotal      Int
  alertsTriggered Int       @default(0)
  durationMs      Int       @default(0)

  logs            WorkflowLog[]
}

model WorkflowLog {
  id        String      @id @default(cuid())
  runId     String
  run       WorkflowRun @relation(fields: [runId], references: [id])
  timestamp DateTime    @default(now())
  level     String                           // info | warn | error
  stepType  String                           // data_ingestion | ...
  stepName  String
  message   String
}

model MonitorLog {
  id              String   @id @default(cuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id])
  timestamp       DateTime @default(now())
  level           String                     // info | warn | error
  message         String
  ruleIds         Json?                      // ["r1"]
  featureSnapshot Json?                      // { water_level_cm: 560 }
}
```

---

### Endpoint Count Summary

| Domain | Endpoints |
|--------|-----------|
| Projects | 6 |
| Datasets | 5 |
| Rules | 5 |
| Monitor | 6 (+1 WS) |
| Timeline | 3 |
| Alerts | 2 |
| Workflows | 7 |
| **Total** | **35** |

---

### Implementation Priority

| Phase | Scope | Endpoints |
|-------|-------|-----------|
| **1 — Core CRUD** | Projects, Datasets (upload + list), Rules (list) | 10 |
| **2 — Monitoring** | Live evaluation, sensor stream, settings | 6 |
| **3 — Timeline** | Historical events, stats, manual entry | 3 |
| **4 — Workflows** | Pipeline CRUD, execution, logs | 7 |
| **5 — Alerts** | Alert history, webhook dispatch | 2 |
| **6 — Polish** | Export, download, WebSocket | 7 |
