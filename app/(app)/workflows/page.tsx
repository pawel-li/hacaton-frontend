'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table'
import { getAllWorkflows } from '@/lib/mockWorkflows'
import { Workflow } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Activity,
  Pause,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: <Activity className="h-3 w-3" /> },
  paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-800', icon: <Pause className="h-3 w-3" /> },
  error: { label: 'Error', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-3 w-3" /> },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800', icon: <CheckCircle2 className="h-3 w-3" /> },
}

function SortButton({ column }: { column: any }) {
  return (
    <button
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="ml-1 inline-flex p-0"
    >
      {column.getIsSorted() === false && <ArrowUpDown className="h-4 w-4 text-muted-foreground" />}
      {column.getIsSorted() === 'asc' && <ArrowUp className="h-4 w-4" />}
      {column.getIsSorted() === 'desc' && <ArrowDown className="h-4 w-4" />}
    </button>
  )
}

export default function WorkflowsPage() {
  const workflows = useMemo(() => getAllWorkflows(), [])
  const [sorting, setSorting] = useState<SortingState>([])

  const activeCount = workflows.filter((w) => w.status === 'active').length
  const errorCount = workflows.filter((w) => w.status === 'error').length
  const avgDuration = workflows.length
    ? Math.round(
        workflows
          .flatMap((w) => w.runs)
          .reduce((s, r) => s + r.durationMs, 0) /
          workflows.flatMap((w) => w.runs).length /
          1000
      )
    : 0

  const columns = [
    {
      accessorKey: 'name',
      header: ({ column }: any) => (
        <div className="flex items-center">Name <SortButton column={column} /></div>
      ),
      cell: ({ row }: any) => {
        const w = row.original as Workflow
        return (
          <div>
            <Link href={`/workflows/${w.id}`} className="font-semibold hover:underline">
              {w.name}
            </Link>
            <p className="text-xs text-muted-foreground">{w.projectName}</p>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const s = statusConfig[row.getValue('status') as string]
        return (
          <Badge className={`gap-1 ${s.color}`}>
            {s.icon} {s.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'steps',
      header: 'Steps',
      cell: ({ row }: any) => {
        const w = row.original as Workflow
        const ok = w.steps.filter((s) => s.status === 'success').length
        return (
          <span className="font-mono text-sm">
            {ok}/{w.steps.length}
          </span>
        )
      },
    },
    {
      accessorKey: 'schedule',
      header: 'Schedule',
      cell: ({ row }: any) => (
        <span className="text-sm text-muted-foreground">{row.getValue('schedule')}</span>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }: any) => (
        <div className="flex items-center">Last Run <SortButton column={column} /></div>
      ),
      cell: ({ row }: any) => (
        <span className="text-sm">{new Date(row.getValue('updatedAt') as string).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'nextRunAt',
      header: 'Next Run',
      cell: ({ row }: any) => {
        const val = row.getValue('nextRunAt') as string
        return <span className="text-sm">{val === '—' ? '—' : new Date(val).toLocaleString()}</span>
      },
    },
    {
      accessorKey: 'successRate',
      header: ({ column }: any) => (
        <div className="flex items-center">Success Rate <SortButton column={column} /></div>
      ),
      cell: ({ row }: any) => {
        const rate = row.getValue('successRate') as number
        const color = rate >= 90 ? 'text-green-700' : rate >= 75 ? 'text-yellow-700' : 'text-red-700'
        return (
          <div className="flex items-center gap-2">
            <span className={`font-mono text-sm font-semibold ${color}`}>{rate.toFixed(1)}%</span>
            <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-green-500" style={{ width: `${rate}%` }} />
            </div>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: workflows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-sm text-muted-foreground">
            Automated pipelines for data ingestion, rule training, monitoring &amp; alerting
          </p>
        </div>
        <Button className="gap-2" onClick={() => toast('Workflow creation wizard coming soon!')}>
          <Plus className="h-4 w-4" /> New Workflow
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Zap className="h-4 w-4" /> Total Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{workflows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Activity className="h-4 w-4" /> Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <AlertTriangle className="h-4 w-4" /> Failed Last Run
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-700">{errorCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" /> Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgDuration}s</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflows Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
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
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/50">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      No workflows yet. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
