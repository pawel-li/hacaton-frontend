'use client'

import React, { useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { getWorkflowById } from '@/lib/mockWorkflows'
import { WorkflowStep, WorkflowRun, WorkflowStepType } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Database,
  ShieldCheck,
  BrainCircuit,
  Satellite,
  Bell,
  FileBarChart,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Pause,
  Play,
  Settings,
  Trash2,
  ScrollText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'

// ── Step icon/color map ────────────────────────────────────

const stepMeta: Record<WorkflowStepType, { icon: React.ReactNode; accent: string }> = {
  data_ingestion: { icon: <Database className="h-5 w-5" />, accent: 'border-blue-500 bg-blue-50 text-blue-700' },
  data_validation: { icon: <ShieldCheck className="h-5 w-5" />, accent: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  ripper_training: { icon: <BrainCircuit className="h-5 w-5" />, accent: 'border-purple-500 bg-purple-50 text-purple-700' },
  live_monitoring: { icon: <Satellite className="h-5 w-5" />, accent: 'border-cyan-500 bg-cyan-50 text-cyan-700' },
  alert_dispatch: { icon: <Bell className="h-5 w-5" />, accent: 'border-orange-500 bg-orange-50 text-orange-700' },
  report_generation: { icon: <FileBarChart className="h-5 w-5" />, accent: 'border-pink-500 bg-pink-50 text-pink-700' },
}

const statusDot: Record<string, { color: string; icon: React.ReactNode }> = {
  success: { color: 'bg-green-500', icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> },
  warning: { color: 'bg-yellow-500', icon: <AlertTriangle className="h-4 w-4 text-yellow-600" /> },
  error: { color: 'bg-red-500', icon: <XCircle className="h-4 w-4 text-red-600" /> },
  disabled: { color: 'bg-gray-300', icon: <Pause className="h-4 w-4 text-gray-400" /> },
  running: { color: 'bg-blue-500 animate-pulse', icon: <Play className="h-4 w-4 text-blue-600" /> },
  pending: { color: 'bg-gray-300', icon: <Clock className="h-4 w-4 text-gray-400" /> },
}

// ── Page ───────────────────────────────────────────────────

export default function WorkflowDetailPage() {
  const params = useParams()
  const workflowId = params.id as string

  const workflow = useMemo(() => getWorkflowById(workflowId), [workflowId])

  if (!workflow) {
    return <div className="p-8 text-center text-muted-foreground">Workflow not found</div>
  }

  const wfStatus =
    workflow.status === 'active'
      ? 'bg-green-100 text-green-800'
      : workflow.status === 'paused'
        ? 'bg-yellow-100 text-yellow-800'
        : workflow.status === 'error'
          ? 'bg-red-100 text-red-800'
          : 'bg-blue-100 text-blue-800'

  // Execution history table columns
  const runColumns = [
    {
      accessorKey: 'id',
      header: 'Run ID',
      cell: ({ row }: any) => (
        <span className="font-mono text-xs">{(row.getValue('id') as string).slice(-6)}</span>
      ),
    },
    {
      accessorKey: 'startedAt',
      header: 'Started',
      cell: ({ row }: any) => (
        <span className="text-sm">{new Date(row.getValue('startedAt') as string).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'durationMs',
      header: 'Duration',
      cell: ({ row }: any) => (
        <span className="font-mono text-sm">{((row.getValue('durationMs') as number) / 1000).toFixed(1)}s</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const s = row.getValue('status') as string
        const color =
          s === 'success'
            ? 'bg-green-100 text-green-800'
            : s === 'failed'
              ? 'bg-red-100 text-red-800'
              : s === 'running'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
        return <Badge className={color}>{s}</Badge>
      },
    },
    {
      accessorKey: 'stepsCompleted',
      header: 'Steps',
      cell: ({ row }: any) => {
        const run = row.original as WorkflowRun
        return (
          <span className="font-mono text-sm">
            {run.stepsCompleted}/{run.stepsTotal}
          </span>
        )
      },
    },
    {
      accessorKey: 'alertsTriggered',
      header: 'Alerts',
      cell: ({ row }: any) => {
        const n = row.getValue('alertsTriggered') as number
        return n > 0 ? (
          <Badge className="bg-orange-100 text-orange-800">{n} triggered</Badge>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )
      },
    },
  ]

  const runsTable = useReactTable({
    data: workflow.runs,
    columns: runColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/workflows">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{workflow.name}</h1>
              <Badge className={wfStatus}>{workflow.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Project: {workflow.projectName} · Schedule: {workflow.schedule}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border-r pr-4">
            <Switch
              id="wf-enabled"
              checked={workflow.status === 'active'}
              onCheckedChange={(v) =>
                toast(v ? 'Workflow enabled' : 'Workflow paused')
              }
            />
            <Label htmlFor="wf-enabled">Enabled</Label>
          </div>
          <Link href={`/workflows/${workflowId}/logs`}>
            <Button variant="outline" size="sm" className="gap-2">
              <ScrollText className="h-4 w-4" /> Logs
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => toast('Settings editor coming soon!')}
          >
            <Settings className="h-4 w-4" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-red-600 hover:text-red-700"
            onClick={() => toast('Deletion would require confirmation')}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Steps</p>
            <p className="text-2xl font-bold">{workflow.steps.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Runs</p>
            <p className="text-2xl font-bold">{workflow.runs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Success Rate</p>
            <p className="text-2xl font-bold">{workflow.successRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Next Run</p>
            <p className="text-lg font-bold">
              {workflow.nextRunAt === '—' ? '—' : new Date(workflow.nextRunAt).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Last Updated</p>
            <p className="text-lg font-bold">{new Date(workflow.updatedAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline</CardTitle>
          <CardDescription>Sequential workflow steps from data ingestion to reporting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative ml-6">
            {workflow.steps.map((step, idx) => {
              const meta = stepMeta[step.type]
              const dot = statusDot[step.status]
              const isLast = idx === workflow.steps.length - 1

              return (
                <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                  {/* Vertical connector line */}
                  {!isLast && (
                    <div className="absolute left-5 top-12 h-[calc(100%-2rem)] w-px bg-border" />
                  )}

                  {/* Status dot on the line */}
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background shadow-sm"
                    style={{ borderColor: dot.color.includes('green') ? '#22c55e' : dot.color.includes('red') ? '#ef4444' : dot.color.includes('yellow') ? '#eab308' : dot.color.includes('blue') ? '#3b82f6' : '#d1d5db' }}
                  >
                    {dot.icon}
                  </div>

                  {/* Step card */}
                  <div className={`flex-1 rounded-lg border-l-4 p-4 ${meta.accent}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {meta.icon}
                        <h3 className="font-semibold">{step.name}</h3>
                        <Badge variant="outline" className="text-xs capitalize">{step.status}</Badge>
                      </div>
                      {step.lastRunAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(step.lastRunAt).toLocaleString()}
                          {step.durationMs && ` · ${(step.durationMs / 1000).toFixed(1)}s`}
                        </span>
                      )}
                    </div>
                    {/* Config summary */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(step.config).map(([k, v]) => (
                        <span
                          key={k}
                          className="inline-block rounded bg-white/60 px-2 py-0.5 text-xs"
                        >
                          <span className="font-medium">{k}:</span>{' '}
                          {Array.isArray(v) ? v.join(', ') : String(v)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>Past workflow runs and their outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                {runsTable.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="bg-muted/50">
                    {hg.headers.map((h) => (
                      <TableHead key={h.id} className="font-semibold">
                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {runsTable.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Page {runsTable.getState().pagination.pageIndex + 1} of {runsTable.getPageCount()}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                disabled={!runsTable.getCanPreviousPage()}
                onClick={() => runsTable.previousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={!runsTable.getCanNextPage()}
                onClick={() => runsTable.nextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
