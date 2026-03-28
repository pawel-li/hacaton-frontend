'use client'

import React, { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getWorkflowById } from '@/lib/mockWorkflows'
import { WorkflowLog, WorkflowStepType, LogLevel } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Info,
  AlertTriangle,
  XCircle,
  Filter,
} from 'lucide-react'

const levelConfig: Record<LogLevel, { color: string; icon: React.ReactNode }> = {
  info: { color: 'bg-blue-100 text-blue-800', icon: <Info className="h-3 w-3" /> },
  warn: { color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="h-3 w-3" /> },
  error: { color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
}

const stepLabels: Record<WorkflowStepType, string> = {
  data_ingestion: 'Data Ingestion',
  data_validation: 'Data Validation',
  ripper_training: 'RIPPER Training',
  live_monitoring: 'Live Monitoring',
  alert_dispatch: 'Alert Dispatch',
  report_generation: 'Report Generation',
}

const stepColors: Record<WorkflowStepType, string> = {
  data_ingestion: 'bg-blue-50 text-blue-700',
  data_validation: 'bg-emerald-50 text-emerald-700',
  ripper_training: 'bg-purple-50 text-purple-700',
  live_monitoring: 'bg-cyan-50 text-cyan-700',
  alert_dispatch: 'bg-orange-50 text-orange-700',
  report_generation: 'bg-pink-50 text-pink-700',
}

export default function WorkflowLogsPage() {
  const params = useParams()
  const workflowId = params.id as string

  const workflow = useMemo(() => getWorkflowById(workflowId), [workflowId])

  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all')
  const [stepFilter, setStepFilter] = useState<WorkflowStepType | 'all'>('all')

  if (!workflow) {
    return <div className="p-8 text-center text-muted-foreground">Workflow not found</div>
  }

  const filteredLogs = workflow.logs.filter((log) => {
    if (levelFilter !== 'all' && log.level !== levelFilter) return false
    if (stepFilter !== 'all' && log.stepType !== stepFilter) return false
    return true
  })

  const infoCount = workflow.logs.filter((l) => l.level === 'info').length
  const warnCount = workflow.logs.filter((l) => l.level === 'warn').length
  const errorCount = workflow.logs.filter((l) => l.level === 'error').length

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/workflows/${workflowId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Execution Logs</h1>
          <p className="text-sm text-muted-foreground">{workflow.name}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Entries</p>
            <p className="text-2xl font-bold">{workflow.logs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Info</p>
            <p className="text-2xl font-bold text-blue-700">{infoCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Warnings</p>
            <p className="text-2xl font-bold text-yellow-700">{warnCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Errors</p>
            <p className="text-2xl font-bold text-red-700">{errorCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Level filter */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Level</p>
              <div className="flex gap-1">
                {(['all', 'info', 'warn', 'error'] as const).map((lv) => (
                  <Button
                    key={lv}
                    variant={levelFilter === lv ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLevelFilter(lv)}
                  >
                    {lv === 'all' ? 'All' : lv.charAt(0).toUpperCase() + lv.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Step filter */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Step</p>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant={stepFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStepFilter('all')}
                >
                  All
                </Button>
                {(Object.keys(stepLabels) as WorkflowStepType[]).map((st) => (
                  <Button
                    key={st}
                    variant={stepFilter === st ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStepFilter(st)}
                  >
                    {stepLabels[st]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log stream */}
      <Card>
        <CardHeader>
          <CardTitle>Log Stream</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {workflow.logs.length} entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              No log entries match your filters.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredLogs.map((log) => {
                const lc = levelConfig[log.level]
                const sc = stepColors[log.stepType]
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
                  >
                    {/* Timestamp */}
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>

                    {/* Level badge */}
                    <Badge className={`shrink-0 gap-1 ${lc.color}`}>
                      {lc.icon} {log.level}
                    </Badge>

                    {/* Step badge */}
                    <Badge variant="outline" className={`shrink-0 ${sc}`}>
                      {log.stepName}
                    </Badge>

                    {/* Message */}
                    <span className="flex-1">{log.message}</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
