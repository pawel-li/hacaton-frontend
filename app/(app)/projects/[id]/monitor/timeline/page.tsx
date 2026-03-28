'use client'

import React, { useState, useMemo } from 'react'
import {
  getMockTimelineEvents,
  getTimelineStats,
  type TimelineEvent,
} from '@/lib/mockTimeline'
import {
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  Waves,
  Radio,
  Filter,
  ChevronDown,
  ChevronUp,
  Droplets,
  Gauge,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
} from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function yearFromIso(iso: string) {
  return new Date(iso).getFullYear()
}

const severityConfig: Record<TimelineEvent['severity'], { color: string; bg: string; label: string }> = {
  low:      { color: '#6b7280', bg: '#f3f4f6', label: 'Low' },
  moderate: { color: '#d97706', bg: '#fffbeb', label: 'Moderate' },
  high:     { color: '#ea580c', bg: '#fff7ed', label: 'High' },
  critical: { color: '#dc2626', bg: '#fef2f2', label: 'Critical' },
}

const typeConfig: Record<TimelineEvent['type'], { icon: typeof AlertTriangle; label: string; accent: string }> = {
  rule_trigger: { icon: Radio,       label: 'Rule Trigger',    accent: '#6366f1' },
  disaster:     { icon: CloudRain,   label: 'Disaster Event',  accent: '#dc2626' },
}

// ── Page ─────────────────────────────────────────────────

export default function TimelinePage() {
  const allEvents = useMemo(() => getMockTimelineEvents(), [])
  const stats = useMemo(() => getTimelineStats(allEvents), [allEvents])

  const [typeFilter, setTypeFilter] = useState<'all' | 'rule_trigger' | 'disaster'>('all')
  const [severityFilter, setSeverityFilter] = useState<'all' | TimelineEvent['severity']>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return allEvents.filter(e => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false
      if (severityFilter !== 'all' && e.severity !== severityFilter) return false
      return true
    })
  }, [allEvents, typeFilter, severityFilter])

  // Group by year
  const grouped = useMemo(() => {
    const map = new Map<number, TimelineEvent[]>()
    for (const e of filtered) {
      const y = yearFromIso(e.date)
      if (!map.has(y)) map.set(y, [])
      map.get(y)!.push(e)
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0])
  }, [filtered])

  return (
    <div className="flex flex-col flex-1 h-full gap-6 p-6 overflow-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Historical Timeline</h1>
        <p className="text-[13px] text-neutral-500 mt-1">
          Past rule triggers overlaid with actual disaster events — evaluate how well rules predicted real-world outcomes.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard label="Total" value={stats.totalEvents} icon={<Eye className="w-4 h-4 text-neutral-400" />} />
        <StatCard label="Triggers" value={stats.totalTriggers} icon={<Radio className="w-4 h-4 text-indigo-500" />} />
        <StatCard label="Disasters" value={stats.totalDisasters} icon={<CloudRain className="w-4 h-4 text-red-500" />} />
        <StatCard label="Verified" value={stats.verifiedAlerts} icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />} />
        <StatCard label="False alarms" value={stats.falseAlarms} icon={<ShieldAlert className="w-4 h-4 text-amber-500" />} />
        <StatCard label="Missed" value={stats.missedEvents} icon={<EyeOff className="w-4 h-4 text-red-400" />} />
        <StatCard label="Detection" value={`${stats.detectionRate}%`} icon={<Gauge className="w-4 h-4 text-emerald-500" />} accent />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-neutral-400" />
        <span className="text-[12px] text-neutral-500 mr-1">Type</span>
        {(['all', 'rule_trigger', 'disaster'] as const).map(v => (
          <button
            key={v}
            onClick={() => setTypeFilter(v)}
            className={`px-2.5 py-1 rounded-md text-[12px] font-medium border transition-colors ${
              typeFilter === v
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            {v === 'all' ? 'All' : v === 'rule_trigger' ? 'Rule triggers' : 'Disasters'}
          </button>
        ))}
        <span className="w-px h-5 bg-neutral-200 mx-1" />
        <span className="text-[12px] text-neutral-500 mr-1">Severity</span>
        {(['all', 'low', 'moderate', 'high', 'critical'] as const).map(v => (
          <button
            key={v}
            onClick={() => setSeverityFilter(v)}
            className={`px-2.5 py-1 rounded-md text-[12px] font-medium border transition-colors ${
              severityFilter === v
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
          <EyeOff className="w-8 h-8 mb-2" />
          <p className="text-[13px]">No events match the current filters.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([year, events]) => (
            <YearGroup
              key={year}
              year={year}
              events={events}
              expandedId={expandedId}
              onToggle={(id) => setExpandedId(prev => prev === id ? null : id)}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-2 pb-4 border-t border-neutral-100 text-[11px] text-neutral-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: typeConfig.rule_trigger.accent }} />
          Rule trigger
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: typeConfig.disaster.accent }} />
          Disaster event
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Verified (rule confirmed by event)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-neutral-300" />
          Unverified
        </span>
      </div>
    </div>
  )
}

// ── StatCard ─────────────────────────────────────────────

function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-lg border px-3 py-2.5 ${accent ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-neutral-200'}`}>
      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-[11px] text-neutral-500">{label}</span></div>
      <p className={`text-lg font-semibold ${accent ? 'text-emerald-700' : 'text-neutral-800'}`}>{value}</p>
    </div>
  )
}

// ── YearGroup ────────────────────────────────────────────

function YearGroup({ year, events, expandedId, onToggle }: {
  year: number
  events: TimelineEvent[]
  expandedId: string | null
  onToggle: (id: string) => void
}) {
  return (
    <div>
      {/* Year label */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[13px] font-semibold text-neutral-800 bg-neutral-100 px-2.5 py-0.5 rounded-md">{year}</span>
        <span className="flex-1 h-px bg-neutral-100" />
        <span className="text-[11px] text-neutral-400">{events.length} event{events.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Vertical timeline */}
      <div className="relative ml-4 pl-6 border-l-2 border-neutral-100 space-y-1">
        {events.map((event) => (
          <TimelineCard
            key={event.id}
            event={event}
            isExpanded={expandedId === event.id}
            onToggle={() => onToggle(event.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ── TimelineCard ─────────────────────────────────────────

function TimelineCard({ event, isExpanded, onToggle }: {
  event: TimelineEvent
  isExpanded: boolean
  onToggle: () => void
}) {
  const type = typeConfig[event.type]
  const severity = severityConfig[event.severity]
  const Icon = type.icon

  return (
    <div className="relative group">
      {/* Dot on the vertical line */}
      <div
        className="absolute -left-[31px] top-3.5 w-3 h-3 rounded-full border-2 border-white"
        style={{ backgroundColor: type.accent }}
      />

      <button
        onClick={onToggle}
        className="w-full text-left rounded-lg border border-neutral-200 bg-white hover:border-neutral-300 transition-colors px-4 py-3 mb-2"
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="w-4 h-4 shrink-0" style={{ color: type.accent }} />
            <span className="text-[13px] font-medium text-neutral-800 truncate">{event.title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {event.verified && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            )}
            <span
              className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
              style={{ color: severity.color, backgroundColor: severity.bg }}
            >
              {severity.label}
            </span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />}
          </div>
        </div>

        {/* Date + type label */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-neutral-400">{formatDate(event.date)} · {formatTime(event.date)}</span>
          <span className="text-[10px] text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded">{type.label}</span>
          {event.ruleIds && event.ruleIds.length > 0 && (
            <span className="text-[10px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded font-mono">
              {event.ruleIds.join(', ')}
            </span>
          )}
        </div>

        {/* Expanded detail */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-neutral-100 space-y-3" onClick={(e) => e.stopPropagation()}>
            <p className="text-[13px] text-neutral-600 leading-relaxed">{event.description}</p>

            {/* Metric pills */}
            <div className="flex flex-wrap gap-2">
              {event.waterLevelCm != null && (
                <MetricPill icon={<Waves className="w-3 h-3" />} label="Water level" value={`${event.waterLevelCm} cm`} />
              )}
              {event.rainMm != null && (
                <MetricPill icon={<Droplets className="w-3 h-3" />} label="Rainfall" value={`${event.rainMm} mm`} />
              )}
            </div>

            {/* Source */}
            {event.source && (
              <p className="text-[11px] text-neutral-400">
                Source: <span className="text-neutral-500">{event.source}</span>
              </p>
            )}
          </div>
        )}
      </button>
    </div>
  )
}

// ── MetricPill ───────────────────────────────────────────

function MetricPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1">
      {icon}
      <span className="text-neutral-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  )
}
