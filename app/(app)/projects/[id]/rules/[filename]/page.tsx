'use client'

import { useParams } from 'next/navigation'
import React, { useMemo } from 'react'
import Link from 'next/link'
import { getMockRulesDataset } from '@/lib/mockRules'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Download, BarChart3, TrendingUp } from 'lucide-react'
import { RulesTable } from '@/components/rules-table'
import { toast } from 'sonner'

export default function RulesPage() {
  const params = useParams()
  const projectId = params.id as string
  const filename = params.filename as string

  const rulesDataset = useMemo(() => {
    if (filename === 'weather.csv') {
      return getMockRulesDataset()
    }
    return null
  }, [filename])

  if (!rulesDataset) {
    return <div className="p-8 text-center text-muted-foreground">Rules not found</div>
  }

  const handleExport = () => {
    const csv = convertRulesToCSV(rulesDataset.rules)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rules-${filename}`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Rules exported as CSV')
  }

  const handleCreateRule = () => {
    toast('Rule creation modal would open here. Coming soon!')
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
            <h1 className="text-3xl font-bold">Rules - {filename}</h1>
            <p className="text-sm text-muted-foreground">{rulesDataset.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleCreateRule} className="gap-2">
            <Plus className="h-4 w-4" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Dataset Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Data Source & Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data Sources</p>
              <p className="text-sm text-foreground">{rulesDataset.dataSource}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-sm text-foreground">{rulesDataset.lastUpdated}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Total Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{rulesDataset.totalRules}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Precision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {(rulesDataset.averagePrecision * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Recall</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {(rulesDataset.averageRecall * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Risk Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {rulesDataset.rules.filter(r => r.predictionLabel === 'HIGH FLOOD RISK').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rule Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rule Statistics</CardTitle>
          <CardDescription>Performance breakdown by rule complexity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Simple Rules */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Simple Rules
                </Badge>
                <span className="font-bold text-lg">
                  {rulesDataset.rules.filter(r => r.complexity === 'simple').length}
                </span>
              </div>
              <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Avg Precision:</span>
                  <span className="font-medium">
                    {(
                      rulesDataset.rules
                        .filter(r => r.complexity === 'simple')
                        .reduce((sum, r) => sum + r.precision, 0) /
                      (rulesDataset.rules.filter(r => r.complexity === 'simple').length || 1)
                    * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Coverage:</span>
                  <span className="font-medium">
                    {rulesDataset.rules
                      .filter(r => r.complexity === 'simple')
                      .reduce((sum, r) => sum + r.coverage, 0)
                      .toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Moderate Rules */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  Moderate Rules
                </Badge>
                <span className="font-bold text-lg">
                  {rulesDataset.rules.filter(r => r.complexity === 'moderate').length}
                </span>
              </div>
              <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Avg Precision:</span>
                  <span className="font-medium">
                    {(
                      rulesDataset.rules
                        .filter(r => r.complexity === 'moderate')
                        .reduce((sum, r) => sum + r.precision, 0) /
                      (rulesDataset.rules.filter(r => r.complexity === 'moderate').length || 1)
                    * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Coverage:</span>
                  <span className="font-medium">
                    {rulesDataset.rules
                      .filter(r => r.complexity === 'moderate')
                      .reduce((sum, r) => sum + r.coverage, 0)
                      .toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Complex Rules */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  Complex Rules
                </Badge>
                <span className="font-bold text-lg">
                  {rulesDataset.rules.filter(r => r.complexity === 'complex').length}
                </span>
              </div>
              <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Avg Precision:</span>
                  <span className="font-medium">
                    {(
                      rulesDataset.rules
                        .filter(r => r.complexity === 'complex')
                        .reduce((sum, r) => sum + r.precision, 0) /
                      (rulesDataset.rules.filter(r => r.complexity === 'complex').length || 1)
                    * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Coverage:</span>
                  <span className="font-medium">
                    {rulesDataset.rules
                      .filter(r => r.complexity === 'complex')
                      .reduce((sum, r) => sum + r.coverage, 0)
                      .toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Extracted Rules</CardTitle>
          <CardDescription>
            Classification rules extracted from the flood prediction model. Click column headers to sort.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RulesTable rules={rulesDataset.rules} />
        </CardContent>
      </Card>

      {/* Rule Quality Guidelines */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-base">Rule Quality Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="font-medium">✓ Precision {'>'} 0.85</p>
              <p className="text-muted-foreground">High confidence predictions</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">✓ Recall {'>'} 0.75</p>
              <p className="text-muted-foreground">Good coverage of positive cases</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">✓ Low FPR {'<'} 0.15</p>
              <p className="text-muted-foreground">Minimal false alarms</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function convertRulesToCSV(rules: any[]): string {
  const headers = [
    'ID',
    'Condition',
    'Prediction',
    'Precision',
    'Recall',
    'F1 Score',
    'Support',
    'Coverage %',
    'False Positive Rate',
    'Accuracy',
    'Complexity',
  ]

  const csv = [
    headers.join(','),
    ...rules.map((rule) =>
      [
        rule.id,
        `"${rule.condition.replace(/"/g, '""')}"`,
        rule.predictionLabel,
        (rule.precision * 100).toFixed(2),
        (rule.recall * 100).toFixed(2),
        (rule.f1Score * 100).toFixed(2),
        rule.support,
        rule.coverage.toFixed(2),
        (rule.falsePositiveRate * 100).toFixed(2),
        (rule.accuracy * 100).toFixed(2),
        rule.complexity,
      ].join(',')
    ),
  ]

  return csv.join('\n')
}
