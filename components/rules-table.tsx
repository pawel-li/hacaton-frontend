'use client'

import React, { useState, useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { RuleMetrics } from '@/lib/mockRules'

interface RulesTableProps {
  rules: RuleMetrics[]
}

export function RulesTable({ rules }: RulesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const tableColumns = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }: any) => (
        <div className="font-mono text-xs font-semibold">{row.getValue('id')}</div>
      ),
    },
    {
      accessorKey: 'condition',
      header: 'Condition',
      cell: ({ row }: any) => {
        const condition = row.getValue('condition') as string
        const complexity = row.original.complexity
        
        const complexityColor =
          complexity === 'simple'
            ? 'bg-green-100 text-green-800'
            : complexity === 'moderate'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
        
        return (
          <div className="space-y-2">
            <code className="block text-xs bg-muted p-2 rounded font-mono overflow-auto max-w-md">
              {condition}
            </code>
            <Badge className={`text-xs ${complexityColor}`}>{complexity}</Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'predictionLabel',
      header: 'Prediction',
      cell: ({ row }: any) => {
        const label = row.getValue('predictionLabel') as string
        const color =
          label === 'HIGH FLOOD RISK'
            ? 'bg-red-100 text-red-800'
            : label === 'MEDIUM FLOOD RISK'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
        
        return <Badge className={`${color}`}>{label}</Badge>
      },
    },
    {
      accessorKey: 'precision',
      header: ({ column }: any) => (
        <div className="flex items-center gap-1">
          Precision
          <button
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
            className="ml-1 inline-flex p-0"
          >
            {column.getIsSorted() === false && (
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            )}
            {column.getIsSorted() === 'asc' && <ArrowUp className="h-4 w-4" />}
            {column.getIsSorted() === 'desc' && (
              <ArrowDown className="h-4 w-4" />
            )}
          </button>
        </div>
      ),
      cell: ({ row }: any) => {
        const value = row.getValue('precision') as number
        return (
          <div className="flex items-center gap-2">
            <div className="text-right font-mono text-sm font-medium">
              {(value * 100).toFixed(1)}%
            </div>
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${value * 100}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'recall',
      header: ({ column }: any) => (
        <div className="flex items-center gap-1">
          Recall
          <button
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
            className="ml-1 inline-flex p-0"
          >
            {column.getIsSorted() === false && (
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            )}
            {column.getIsSorted() === 'asc' && <ArrowUp className="h-4 w-4" />}
            {column.getIsSorted() === 'desc' && (
              <ArrowDown className="h-4 w-4" />
            )}
          </button>
        </div>
      ),
      cell: ({ row }: any) => {
        const value = row.getValue('recall') as number
        return (
          <div className="flex items-center gap-2">
            <div className="text-right font-mono text-sm font-medium">
              {(value * 100).toFixed(1)}%
            </div>
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500"
                style={{ width: `${value * 100}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'f1Score',
      header: ({ column }: any) => (
        <div className="flex items-center gap-1">
          F1 Score
          <button
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
            className="ml-1 inline-flex p-0"
          >
            {column.getIsSorted() === false && (
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            )}
            {column.getIsSorted() === 'asc' && <ArrowUp className="h-4 w-4" />}
            {column.getIsSorted() === 'desc' && (
              <ArrowDown className="h-4 w-4" />
            )}
          </button>
        </div>
      ),
      cell: ({ row }: any) => {
        const value = row.getValue('f1Score') as number
        return (
          <div className="font-mono text-sm font-semibold">
            {(value * 100).toFixed(1)}%
          </div>
        )
      },
    },
    {
      accessorKey: 'support',
      header: 'Support',
      cell: ({ row }: any) => (
        <div className="text-right font-mono text-sm">{row.getValue('support')}</div>
      ),
    },
    {
      accessorKey: 'coverage',
      header: ({ column }: any) => (
        <div className="flex items-center gap-1">
          Coverage
          <button
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
            className="ml-1 inline-flex p-0"
          >
            {column.getIsSorted() === false && (
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            )}
            {column.getIsSorted() === 'asc' && <ArrowUp className="h-4 w-4" />}
            {column.getIsSorted() === 'desc' && (
              <ArrowDown className="h-4 w-4" />
            )}
          </button>
        </div>
      ),
      cell: ({ row }: any) => {
        const value = row.getValue('coverage') as number
        return (
          <div className="flex items-center gap-2">
            <div className="text-right font-mono text-sm font-medium">
              {value.toFixed(1)}%
            </div>
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: rules,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No rules available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()} • Showing{' '}
          {table.getRowModel().rows.length > 0
            ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
            : 0}
          -
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            rules.length
          )}{' '}
          of {rules.length} rules
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
