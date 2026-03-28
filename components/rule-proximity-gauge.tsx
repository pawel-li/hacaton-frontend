'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Shield } from 'lucide-react'

// ── Types ────────────────────────────────────────────────

interface ParsedCondition {
  variable: string
  operator: string
  threshold: number
}

interface ConditionProximity {
  condition: ParsedCondition
  currentValue: number
  proximity: number // 0..1
  triggered: boolean
}

interface RuleProximity {
  ruleId: string
  condition: string
  prediction: number
  conditions: ConditionProximity[]
  overallProximity: number // 0..1  — min of individual proximities (bottleneck)
  triggered: boolean
  trend: 'rising' | 'falling' | 'stable'
}

interface RuleProximityGaugeProps {
  rules: { id: string; condition: string; prediction: number; precision?: number; recall?: number }[]
  featureValues: Record<string, number>
  previousValues?: Record<string, number>
}

// ── Condition parser ─────────────────────────────────────

function parseConditions(conditionStr: string): ParsedCondition[] {
  const parts = conditionStr.split(/\bAND\b|\bOR\b/i)
  return parts
    .map(part => {
      const match = part.match(/(\w+)\s*(>=|<=|>|<|==|!=)\s*([\d.]+)/)
      if (!match) return null
      return { variable: match[1], operator: match[2], threshold: parseFloat(match[3]) }
    })
    .filter((c): c is ParsedCondition => c !== null)
}

function calcProximity(current: number, threshold: number, operator: string): { proximity: number; triggered: boolean } {
  if (operator === '>=' || operator === '>') {
    if (threshold === 0) return { proximity: current > 0 ? 1 : 0, triggered: current >= threshold }
    const p = Math.max(0, Math.min(current / threshold, 1))
    const triggered = operator === '>=' ? current >= threshold : current > threshold
    return { proximity: p, triggered }
  }
  if (operator === '<=' || operator === '<') {
    if (current === 0) return { proximity: 1, triggered: true }
    const p = Math.max(0, Math.min(threshold / current, 1))
    const triggered = operator === '<=' ? current <= threshold : current < threshold
    return { proximity: p, triggered }
  }
  return { proximity: 0, triggered: false }
}

function computeRuleProximities(
  rules: RuleProximityGaugeProps['rules'],
  values: Record<string, number>,
  prevValues?: Record<string, number>,
): RuleProximity[] {
  return rules.map(rule => {
    const parsed = parseConditions(rule.condition)
    const conditions: ConditionProximity[] = parsed.map(cond => {
      const currentValue = values[cond.variable] ?? 0
      const { proximity, triggered } = calcProximity(currentValue, cond.threshold, cond.operator)
      return { condition: cond, currentValue, proximity, triggered }
    })

    const overallProximity = conditions.length > 0
      ? Math.min(...conditions.map(c => c.proximity))
      : 0

    const triggered = conditions.length > 0 && conditions.every(c => c.triggered)

    // Trend from previous values
    let trend: RuleProximity['trend'] = 'stable'
    if (prevValues) {
      const prevParsed = parsed.map(cond => {
        const pv = prevValues[cond.variable] ?? 0
        return calcProximity(pv, cond.threshold, cond.operator).proximity
      })
      const prevOverall = prevParsed.length > 0 ? Math.min(...prevParsed) : 0
      const diff = overallProximity - prevOverall
      if (diff > 0.02) trend = 'rising'
      else if (diff < -0.02) trend = 'falling'
    }

    return {
      ruleId: rule.id,
      condition: rule.condition,
      prediction: rule.prediction,
      conditions,
      overallProximity,
      triggered,
      trend,
    }
  })
}

// ── Visual helpers ───────────────────────────────────────

function proximityColor(p: number): string {
  if (p >= 0.9) return 'var(--proximity-critical)'
  if (p >= 0.7) return 'var(--proximity-warning)'
  return 'var(--proximity-safe)'
}

function proximityBg(p: number): string {
  if (p >= 0.9) return 'var(--proximity-critical-bg)'
  if (p >= 0.7) return 'var(--proximity-warning-bg)'
  return 'var(--proximity-safe-bg)'
}

function proximityLabel(p: number): string {
  if (p >= 1) return 'Triggered'
  if (p >= 0.9) return 'Critical'
  if (p >= 0.7) return 'Elevated'
  if (p >= 0.4) return 'Moderate'
  return 'Low'
}

const TrendIcon = ({ trend }: { trend: RuleProximity['trend'] }) => {
  if (trend === 'rising') return <TrendingUp className="w-3.5 h-3.5 text-red-500" />
  if (trend === 'falling') return <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
  return <Minus className="w-3.5 h-3.5 text-neutral-400" />
}

// ── Component ────────────────────────────────────────────

export function RuleProximityGauge({ rules, featureValues, previousValues }: RuleProximityGaugeProps) {
  const ruleProximities = computeRuleProximities(rules, featureValues, previousValues)

  const maxProximity = Math.max(...ruleProximities.map(r => r.overallProximity))
  const anyTriggered = ruleProximities.some(r => r.triggered)

  return (
    <div
      className="space-y-5"
      style={{
        '--proximity-safe': '#10b981',
        '--proximity-safe-bg': '#ecfdf5',
        '--proximity-warning': '#f59e0b',
        '--proximity-warning-bg': '#fffbeb',
        '--proximity-critical': '#ef4444',
        '--proximity-critical-bg': '#fef2f2',
      } as React.CSSProperties}
    >
      {/* Summary strip */}
      <div
        className="flex items-center justify-between rounded-lg px-4 py-3 border"
        style={{
          backgroundColor: anyTriggered ? 'var(--proximity-critical-bg)' : proximityBg(maxProximity),
          borderColor: anyTriggered ? '#fecaca' : 'transparent',
        }}
      >
        <div className="flex items-center gap-2.5">
          {anyTriggered
            ? <AlertTriangle className="w-4 h-4 text-red-500" />
            : <Shield className="w-4 h-4" style={{ color: proximityColor(maxProximity) }} />}
          <span className="text-[13px] font-medium text-neutral-800">
            {anyTriggered
              ? `${ruleProximities.filter(r => r.triggered).length} rule(s) triggered`
              : `Closest rule at ${Math.round(maxProximity * 100)}%`}
          </span>
        </div>
        <span
          className="text-[12px] font-semibold uppercase tracking-wide"
          style={{ color: anyTriggered ? 'var(--proximity-critical)' : proximityColor(maxProximity) }}
        >
          {anyTriggered ? 'Alert' : proximityLabel(maxProximity)}
        </span>
      </div>

      {/* Per-rule gauges */}
      <div className="space-y-3">
        {ruleProximities.map((rp) => (
          <RuleCard key={rp.ruleId} rp={rp} />
        ))}
      </div>
    </div>
  )
}

// ── RuleCard ─────────────────────────────────────────────

function RuleCard({ rp }: { rp: RuleProximity }) {
  const pct = Math.round(rp.overallProximity * 100)
  const color = proximityColor(rp.overallProximity)

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      {/* Rule header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-md text-[11px] font-bold text-white shrink-0"
          style={{ backgroundColor: color }}
        >
          {pct}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-neutral-800 truncate leading-snug">
            Rule {rp.ruleId.replace('r', '#')}
          </p>
          <p className="text-[11px] text-neutral-500 font-mono truncate">
            {rp.condition}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <TrendIcon trend={rp.trend} />
          <span className="text-[11px] text-neutral-500 capitalize">{rp.trend}</span>
        </div>
      </div>

      {/* Overall bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${pct}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[11px] text-neutral-400">0%</span>
          <span className="text-[11px] font-medium" style={{ color }}>
            {pct}% — {proximityLabel(rp.overallProximity)}
          </span>
          <span className="text-[11px] text-neutral-400">100%</span>
        </div>
      </div>

      {/* Condition breakdown */}
      <div className="px-4 pb-3 pt-2 space-y-2">
        {rp.conditions.map((cp, i) => {
          const cpPct = Math.round(cp.proximity * 100)
          const cpColor = proximityColor(cp.proximity)
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[12px] text-neutral-500 w-28 shrink-0 truncate font-mono">
                {cp.condition.variable}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${cpPct}%`, backgroundColor: cpColor }}
                />
              </div>
              <span className="text-[11px] font-medium w-20 text-right shrink-0" style={{ color: cpColor }}>
                {cp.currentValue} / {cp.condition.threshold}
              </span>
              {cp.triggered && (
                <span className="text-[10px] text-red-500 font-semibold uppercase">Hit</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
