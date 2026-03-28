'use client'

import { useParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { getMockProjectData } from '@/lib/mockProjectDetail'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Settings, RefreshCw, Map as MapIcon, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string

  const [data, setData] = useState<any>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)

  useEffect(() => {
    const mockData = getMockProjectData(projectId)
    if (mockData) {
      setData(mockData)
      setIsMonitoring(mockData.project.monitoringEnabled)
    }
  }, [projectId])

  if (!data) {
    return <div className="p-8 text-center text-muted-foreground">Loading project...</div>
  }

  const { project } = data

  const handleEdit = () => toast('Edit project modal would open here.')
  const handleRetrain = () => toast('Model retraining has been triggered.')

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

      {/* Overview */}
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
    </div>
  )
}
