'use client'

import { useParams } from 'next/navigation'
import React, { useState, useMemo } from 'react'
import { getMockWeatherDataset } from '@/lib/mockDatasets'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, ArrowLeft } from 'lucide-react'
import { DataTable } from '@/components/data-table'
import Link from 'next/link'
import { toast } from 'sonner'

export default function DatasetPage() {
  const params = useParams()
  const projectId = params.id as string
  const filename = params.filename as string

  const dataset = useMemo(() => {
    if (filename === 'weather.csv') {
      return getMockWeatherDataset()
    }
    return null
  }, [filename])

  if (!dataset) {
    return <div className="p-8 text-center text-muted-foreground">Dataset not found</div>
  }

  const handleDownload = () => {
    const csv = convertToCSV(dataset.data)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success(`Downloaded ${filename}`)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${projectId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{filename}</h1>
            <p className="text-sm text-muted-foreground">{dataset.description}</p>
          </div>
        </div>
        <Button onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      {/* Dataset Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Rows</p>
              <p className="text-2xl font-bold">{dataset.data.length}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Columns</p>
              <p className="text-2xl font-bold">{dataset.columns.length}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">File Size</p>
              <p className="text-2xl font-bold">{formatBytes(dataset.fileSize)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-2xl font-bold">{dataset.lastUpdated}</p>
            </div>
          </div>

          {/* Columns List */}
          <div className="mt-6">
            <h3 className="mb-3 font-semibold">Columns</h3>
            <div className="flex flex-wrap gap-2">
              {dataset.columns.map((col) => (
                <Badge key={col.name} variant="outline">
                  {col.name}
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({col.type})
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
          <CardDescription>
            Showing {Math.min(dataset.data.length, 100)} of {dataset.data.length} rows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={dataset.columns} data={dataset.data} />
        </CardContent>
      </Card>
    </div>
  )
}

function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header]
        // Escape quotes in CSV
        return typeof value === 'string' && value.includes(',')
          ? `"${value.replace(/"/g, '""')}"`
          : value
      }).join(',')
    ),
  ]
  
  return csv.join('\n')
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
