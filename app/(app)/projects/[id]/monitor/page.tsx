'use client'

import { useParams } from 'next/navigation'
import React, { useState, useMemo } from 'react'
import { getMockProjectData } from '@/lib/mockProjectDetail'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { Rule } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { RuleProximityGauge } from '@/components/rule-proximity-gauge'

export default function MonitorPage() {
  const params = useParams()
  const projectId = params.id as string

  const mockData = useMemo(() => getMockProjectData(projectId), [projectId])
  const rules: Rule[] = mockData?.rules ?? []
  const [featureValues, setFeatureValues] = useState<Record<string, number>>(
    () => mockData?.liveEvaluation.currentValues ?? {}
  )

  const previousValues: Record<string, number> = {
    water_level_cm: 530,
    rain_mm: 18,
    soil_moisture: 0.50,
    NDWI: 0.10,
  }

  if (rules.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Loading monitor...</div>
  }

  const handleFeatureChange = (key: string, val: string) => {
    setFeatureValues(prev => ({ ...prev, [key]: Number(val) || 0 }))
  }

  const evaluateRule = (condition: string, values: Record<string, number>): boolean => {
    try {
      let evalCondition = condition
        .replace(/AND/g, '&&')
        .replace(/OR/g, '||')

      Object.keys(values).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'g')
        evalCondition = evalCondition.replace(regex, String(values[key]))
      })

      return new Function(`return ${evalCondition}`)()
    } catch {
      return false
    }
  }

  const triggeredRuleIds = rules
    .filter((r) => evaluateRule(r.condition, featureValues))
    .map((r) => r.id)

  return (
    <div className="flex flex-col flex-1 h-full gap-6 p-6 overflow-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Monitor</h1>
        <p className="text-sm text-muted-foreground mt-1">Live rule evaluation and proximity tracking.</p>
      </div>

      {/* Rule Proximity Gauge */}
      <div>
        <h3 className="text-[15px] font-semibold text-neutral-800 mb-1">Rule Proximity</h3>
        <p className="text-[13px] text-neutral-500 mb-4">How close current readings are to triggering each rule.</p>
        <RuleProximityGauge
          rules={rules}
          featureValues={featureValues}
          previousValues={previousValues}
        />
      </div>

      {/* Live values + Evaluation engine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Feature Values</CardTitle>
            <CardDescription>Simulate incoming sensor data to test rule evaluations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(featureValues).map(key => (
              <div key={key} className="space-y-1">
                <Label className="uppercase text-xs" htmlFor={`fv-${key}`}>{key.replace(/_/g, ' ')}</Label>
                <Input
                  id={`fv-${key}`}
                  type="number"
                  value={featureValues[key]}
                  onChange={(e) => handleFeatureChange(key, e.target.value)}
                />
              </div>
            ))}
            <div className="pt-4 flex justify-end">
              <Button variant="secondary" onClick={() => toast('Values reset to live stream.')}>Reset to Live</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evaluation Engine</CardTitle>
            <CardDescription>Rules currently evaluated as TRUE</CardDescription>
          </CardHeader>
          <CardContent>
            {triggeredRuleIds.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border rounded-lg h-[200px] text-center">
                <CheckCircle2 className="w-10 h-10 text-slate-300 mb-2" />
                <p className="font-medium text-slate-500">No events detected.</p>
                <p className="text-sm text-slate-400">All features are within safe thresholds.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-destructive font-medium bg-destructive/10 p-3 rounded-md">
                  <AlertTriangle className="w-5 h-5" />
                  Alert conditions met! Triggered {triggeredRuleIds.length} rule(s).
                </div>
                {rules.filter((r) => triggeredRuleIds.includes(r.id)).map((rule) => (
                  <div key={rule.id} className="p-3 border-l-4 border-destructive bg-slate-50 rounded-r-lg font-mono text-sm leading-relaxed">
                    <div className="text-xs text-muted-foreground mb-1">Rule ID: {rule.id}</div>
                    {rule.condition}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
