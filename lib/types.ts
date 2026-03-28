export interface Area {
  type: string;
  name: string;
}

export interface Target {
  type: string;
  variable: string;
  condition: string;
  value: number | string;
}

export interface ProjectDetail {
  id: string;
  name: string;
  area: Area;
  target: Target;
  webhookUrl: string;
  monitoringEnabled: boolean;
  status: 'active' | 'inactive' | 'training' | 'error';
  createdAt: string;
  updatedAt: string;
  lastTraining: string;
  lastAlert: string;
}

export interface DatasetInfo {
  rows: number;
  columns: number;
  dateRange: [string, string];
  missingData: Record<string, string>;
  sampleData: Record<string, any>[];
}

export interface Rule {
  id: string;
  condition: string;
  prediction: number;
  precision?: number;
  recall?: number;
}

export interface AlertRecord {
  id: string;
  timestamp: string;
  triggeredRules: string[];
  webhookStatus: 'success' | 'failed' | 'pending';
}

export interface FeatureValues {
  [key: string]: number;
}

export interface RuleEvaluationResult {
  currentValues: FeatureValues;
  triggeredRuleIds: string[];
}

// ── Workflows ──────────────────────────────────────────────

export type WorkflowStatus = 'active' | 'paused' | 'error' | 'completed';
export type StepStatus = 'success' | 'warning' | 'error' | 'disabled' | 'running' | 'pending';
export type LogLevel = 'info' | 'warn' | 'error';

export type WorkflowStepType =
  | 'data_ingestion'
  | 'data_validation'
  | 'ripper_training'
  | 'live_monitoring'
  | 'alert_dispatch'
  | 'report_generation';

export interface WorkflowStepConfig {
  [key: string]: string | number | boolean | string[];
}

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  name: string;
  status: StepStatus;
  config: WorkflowStepConfig;
  lastRunAt: string | null;
  durationMs: number | null;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  startedAt: string;
  finishedAt: string | null;
  status: 'success' | 'failed' | 'running' | 'cancelled';
  stepsCompleted: number;
  stepsTotal: number;
  alertsTriggered: number;
  durationMs: number;
}

export interface WorkflowLog {
  id: string;
  runId: string;
  timestamp: string;
  level: LogLevel;
  stepType: WorkflowStepType;
  stepName: string;
  message: string;
}

export interface Workflow {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  runs: WorkflowRun[];
  logs: WorkflowLog[];
  schedule: string;
  nextRunAt: string;
  createdAt: string;
  updatedAt: string;
  successRate: number;
}
