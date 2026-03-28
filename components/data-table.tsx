'use client'

import React, { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface Column {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean'
}

interface DataTableProps {
  columns: Column[]
  data: Record<string, any>[]
}

export function DataTable({ columns, data }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  // Convert columns to TanStack format
  const tableColumns = columns.map((col) => ({
    accessorKey: col.name,
    header: ({ column: tanstackColumn }: any) => (
      <div className="flex items-center gap-1">
        <span>{col.name}</span>
        <button
          onClick={() =>
            tanstackColumn.toggleSorting(
              tanstackColumn.getIsSorted() === 'asc'
            )
          }
          className="ml-1 inline-flex p-0"
        >
          {tanstackColumn.getIsSorted() === false && (
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          )}
          {tanstackColumn.getIsSorted() === 'asc' && (
            <ArrowUp className="h-4 w-4" />
          )}
          {tanstackColumn.getIsSorted() === 'desc' && (
            <ArrowDown className="h-4 w-4" />
          )}
        </button>
      </div>
    ),
    cell: ({ row }: any) => {
      const value = row.getValue(col.name)
      
      if (col.type === 'number') {
        return <div className="text-right font-mono text-sm">{value}</div>
      }
      
      if (col.name === 'floodRisk') {
        const statusColor =
          value === 'High'
            ? 'bg-red-100 text-red-800'
            : value === 'Medium'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
        return (
          <div className={`inline-block rounded px-2 py-1 text-xs font-medium ${statusColor}`}>
            {value}
          </div>
        )
      }
      
      return <div className="text-sm">{String(value)}</div>
    },
  }))

  const table = useReactTable({
    data: data.slice(0, 100), // Show first 100 rows for performance
    columns: tableColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="space-y-4">
      {/* Table */}
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
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
            data.length
          )}{' '}
          of {data.length} rows
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
