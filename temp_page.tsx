'use client'

import { useParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { getMockProjectData } from '@/lib/mockProjectDetail'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Settings, RefreshCw, Download, Map as MapIcon, Link as LinkIcon, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string

  // State
  const [data, setData] = useState<any>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [featureValues, setFeatureValues] = useState<Record<string, number>>({})

  useEffect(() => {
    const mockData = getMockProjectData(projectId)
    if (mockData) {
      setData(mockData)
      setIsMonitoring(mockData.project.monitoringEnabled)
      setFeatureValues(mockData.liveEvaluation.currentValues)
    }
  }, [projectId])

  if (!data) {
    return <div className="p-8 text-center text-muted-foreground">Loading project...</div>
  }

  const { project, dataset, rules, alerts } = data

  const handleEdit = () => toast('Edit project modal would open here.')
  const handleRetrain = () => toast('Model retraining has been triggered.')
  const handleDownload = () => toast('Dataset is being prepared for download...')
  
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

      // eslint-disable-next-line no-new-func
      return new Function(`return ${evalCondition}`)()
    } catch {
      return false
    }
  }

  const triggeredRuleIds = rules.filter((r: any) => evaluateRule(r.condition, featureValues)).map((r: any) => r.id)

  return (
    <div className="flex flex-col flex-1 h-full gap-6 p-6 overflow-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="capitalize">
              {project.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 text-xs font-mono">ID: {project.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4 border-r pr-4">
            <Switch 
              id="monitor-mode" 
              checked={isMonitoring} 
              onCheckedChange={(c) => {
                setIsMonitoring(c)
                toast(c ? 'Monitoring enabled' : 'Monitoring disabled')
              }} 
            />
            <Label htmlFor="monitor-mode">Monitor</Label>
          </div>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Settings className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button size="sm" onClick={handleRetrain}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retrain
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dataset">Dataset</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
        </TabsList>
        
        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
                <CardDescription>Target definitions and area of interest.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">Area</span>
                    <div className="flex items-center">
                      <MapIcon className="w-4 h-4 mr-2 text-primary" />
                      {project.area.name} ({project.area.type})
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">Target</span>
                    <div>
                      {project.target.variable} {project.target.condition} {project.target.value}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">Webhook</span>
                    <div className="flex items-center text-sm">
                      <LinkIcon className="w-4 h-4 mr-2 text-primary" />
                      <span className="truncate max-w-[150px]">{project.webhookUrl}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">Timestamps</span>
                    <div className="text-xs space-y-1">
                      <div>Last Train: {new Date(project.lastTraining).toLocaleString()}</div>
                      <div>Last Alert: {new Date(project.lastAlert).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Map View</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-[200px]">
                <div className="w-full h-full bg-slate-100 rounded-md border-2 border-dashed border-slate-200 flex items-center justify-center">
                  <span className="text-slate-400 font-medium">Map visualization placeholder</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* DATASET TAB */}
        <TabsContent value="dataset" className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-lg">Rows / Columns</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">
                {dataset.rows.toLocaleString()} / {dataset.columns}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-lg">Date Range</CardTitle></CardHeader>
              <CardContent className="text-xl font-medium">
                {dataset.dateRange[0]}<br/><span className="text-sm text-muted-foreground">to</span> {dataset.dateRange[1]}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-lg">Missing Data %</CardTitle></CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  {Object.entries(dataset.missingData).map(([key, val]) => (
                    <li key={key} className="flex justify-between">
                      <span>{key}</span>
                      <span className="font-medium text-destructive">{val as string}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Sample Records</CardTitle>
                <CardDescription>First 5 rows of the dataset</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={handleDownload}><Download className="w-4 h-4 mr-2" /> Download CSV</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(dataset.sampleData[0]).map(col => (
                      <TableHead key={col}>{col.toUpperCase()}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataset.sampleData.map((row: any, i: number) => (
                    <TableRow key={i}>
                      {Object.values(row).map((val: any, j: number) => (
                        <TableCell key={j}>{val}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RULES TAB */}
        <TabsContent value="rules" className="mt-6 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Rules</CardTitle>
              <CardDescription>Classification logic extracted from the model algorithm.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule: any) => (
                  <div key={rule.id} className="p-4 rounded-lg border bg-slate-50 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="font-mono text-sm">
                      <span className="text-primary font-bold">IF</span> {rule.condition} <br/>
                      <span className="text-primary font-bold">THEN</span> predict = {rule.prediction}
                    </div>
                    <div className="flex gap-4 text-sm bg-white p-2 rounded border items-center">
                      <div className="flex flex-col items-center"><span className="text-muted-foreground text-xs">Precision</span><span className="font-medium">{rule.precision}</span></div>
                      <div className="flex flex-col items-center"><span className="text-muted-foreground text-xs">Recall</span><span className="font-medium">{rule.recall}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Triggered Rules</TableHead>
                    <TableHead>Webhook</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((al: any) => (
                    <TableRow key={al.id}>
                      <TableCell>{new Date(al.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-xs">{al.triggeredRules.join(', ')}</TableCell>
                      <TableCell>
                        {al.webhookStatus === 'success' ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Success</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1"/> Failed</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MONITOR TAB */}
        <TabsContent value="monitor" className="mt-6">
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
                    {rules.filter((r: any) => triggeredRuleIds.includes(r.id)).map((rule: any) => (
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
        </TabsContent>
      </Tabs>
    </div>
  )
}