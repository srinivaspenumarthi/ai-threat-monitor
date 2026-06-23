// ===================
// threat-detail.tsx
//
// Modal dialog for full threat event inspection
//
// Renders a click-to-dismiss overlay (also dismissable via
// Escape key) with a detail panel
// displaying four sections: Overview (severity badge,
// threat score to 4 decimals, detection timestamp, review
// status), Request (source IP, method, path, status code,
// response size, user agent), Component Scores (per-model
// score bars with percentage fill widths), and conditionally
// Geolocation (country, city) and Matched Rules (tag list).
// Returns null when threat prop is null. Connects to
// api/types/threats.types, components/severity-badge,
// pages/threats
// ===================

import { useEffect } from 'react'
import { LuX } from 'react-icons/lu'
import type { ThreatEvent } from '@/api/types'
import { SeverityBadge } from './severity-badge'
import styles from './threat-detail.module.scss'

interface ThreatDetailProps {
  threat: ThreatEvent | null
  onClose: () => void
}

function getTopSignal(
  scores: Record<string, number>,
): { label: string; value: number } | null {
  const entries = Object.entries(scores)
  if (entries.length === 0) return null

  const [label, value] = entries.sort((a, b) => b[1] - a[1])[0]
  return { label: label.toUpperCase(), value }
}

function getWhyFlagged(threat: ThreatEvent): string[] {
  const reasons: string[] = []
  const path = threat.request_path.toLowerCase()
  const topSignal = getTopSignal(threat.component_scores)

  if (threat.matched_rules && threat.matched_rules.length > 0) {
    reasons.push(`Matched ${threat.matched_rules.length} detection rule(s)`)
  }

  if (
    path.includes('login') ||
    path.includes('signin') ||
    path.includes('auth')
  ) {
    reasons.push('Sensitive authentication endpoint was targeted')
  }

  if (topSignal && topSignal.value >= 0.8) {
    reasons.push(
      `Strong ${topSignal.label.toLowerCase()} detector signal (${topSignal.value.toFixed(2)})`,
    )
  }

  if (threat.threat_score >= 0.8) {
    reasons.push('Overall threat score is very high')
  } else if (threat.threat_score >= 0.6) {
    reasons.push('Overall threat score crossed the alert threshold')
  }

  if (threat.request_method === 'POST') {
    reasons.push('Request used POST, which can carry malicious input payloads')
  }

  return reasons.slice(0, 4)
}

function getRecommendedAction(threat: ThreatEvent): string {
  const path = threat.request_path.toLowerCase()

  if (threat.severity === 'HIGH') {
    return 'Block the source IP if repeated and inspect the affected endpoint immediately.'
  }

  if (path.includes('login') || path.includes('signin')) {
    return 'Review the login flow, rate-limit the endpoint, and check for credential abuse.'
  }

  if (threat.matched_rules && threat.matched_rules.length > 0) {
    return 'Review the matched rule pattern and verify whether the request reached sensitive application logic.'
  }

  return 'Monitor this source for repeats and review server-side validation on the targeted route.'
}

function getResponsePlaybook(threat: ThreatEvent): string[] {
  const path = threat.request_path

  return [
    `Check access logs around this request time for repeated hits from ${threat.source_ip}.`,
    `Review the endpoint ${path} and confirm input validation, rate limits, and auth checks are in place.`,
    'If similar alerts continue, block the IP temporarily and investigate related application errors.',
  ]
}

function formatRequestTarget(path: string, queryString: string): string {
  return queryString ? `${path}?${queryString}` : path
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString()
}

export function ThreatDetail({
  threat,
  onClose,
}: ThreatDetailProps): React.ReactElement | null {
  useEffect(() => {
    if (!threat) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [threat, onClose])

  if (!threat) return null

  const whyFlagged = getWhyFlagged(threat)
  const recommendedAction = getRecommendedAction(threat)
  const responsePlaybook = getResponsePlaybook(threat)

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: modal overlay dismiss
    <div
      role="presentation"
      className={styles.overlay}
      onClick={onClose}
      onKeyDown={() => {}}
    >
      <div
        role="dialog"
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={() => {}}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Threat Details</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <LuX />
          </button>
        </div>

        <div className={styles.body}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Overview</h3>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Severity</span>
                <SeverityBadge severity={threat.severity} />
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Threat Score</span>
                <span className={styles.fieldValue}>
                  {threat.threat_score.toFixed(4)}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Detected</span>
                <span className={styles.fieldValue}>
                  {formatDate(threat.created_at)}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Reviewed</span>
                <span className={styles.fieldValue}>
                  {threat.reviewed ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Request</h3>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Source IP</span>
                <span className={styles.mono}>{threat.source_ip}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Method</span>
                <span className={styles.fieldValue}>{threat.request_method}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Target URL</span>
                <span className={styles.mono}>
                  {formatRequestTarget(
                    threat.request_path,
                    threat.query_string,
                  )}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Query String</span>
                <span className={styles.mono}>
                  {threat.query_string || 'None'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Status</span>
                <span className={styles.fieldValue}>{threat.status_code}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Response Size</span>
                <span className={styles.fieldValue}>
                  {threat.response_size} B
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>User Agent</span>
                <span className={styles.mono}>{threat.user_agent}</span>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Component Scores</h3>
            <div className={styles.scores}>
              {Object.entries(threat.component_scores).map(([key, val]) => (
                <div key={key} className={styles.scoreRow}>
                  <span className={styles.scoreLabel}>{key}</span>
                  <div className={styles.scoreBar}>
                    <div
                      className={styles.scoreFill}
                      style={{ width: `${Math.min(val * 100, 100)}%` }}
                    />
                  </div>
                  <span className={styles.scoreValue}>{val.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Why Flagged</h3>
            <div className={styles.explanations}>
              {whyFlagged.map((reason) => (
                <div key={reason} className={styles.explanationItem}>
                  {reason}
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Recommended Action</h3>
            <div className={styles.actionCard}>{recommendedAction}</div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Response Playbook</h3>
            <div className={styles.playbook}>
              {responsePlaybook.map((step, index) => (
                <div key={step} className={styles.playbookStep}>
                  <span className={styles.playbookIndex}>{index + 1}</span>
                  <span className={styles.playbookText}>{step}</span>
                </div>
              ))}
            </div>
          </section>

          {threat.geo.country && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Geolocation</h3>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Country</span>
                  <span className={styles.fieldValue}>{threat.geo.country}</span>
                </div>
                {threat.geo.city && (
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>City</span>
                    <span className={styles.fieldValue}>{threat.geo.city}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {threat.matched_rules && threat.matched_rules.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Matched Rules</h3>
              <div className={styles.rules}>
                {threat.matched_rules.map((rule) => (
                  <span key={rule} className={styles.rule}>
                    {rule}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
