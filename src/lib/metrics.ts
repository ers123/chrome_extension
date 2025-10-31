import { openDB, type IDBPDatabase } from 'idb'

type MetricEventType =
  | 'alert_shown'
  | 'action_executed'
  | 'snooze'

export interface MetricEvent<T = any> {
  id?: number
  ts: number
  type: MetricEventType
  payload?: T
}

let dbPromise: Promise<IDBPDatabase<any>> | null = null

async function getDb() {
  if (!dbPromise) {
    dbPromise = openDB('tab-nudge-metrics', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('events')) {
          const store = db.createObjectStore('events', {
            keyPath: 'id',
            autoIncrement: true,
          })
          store.createIndex('by_type', 'type', { unique: false })
          store.createIndex('by_ts', 'ts', { unique: false })
        }
      },
    })
  }
  return dbPromise
}

export async function logEvent<T = any>(type: MetricEventType, payload?: T) {
  try {
    const db = await getDb()
    const event: MetricEvent<T> = {
      ts: Date.now(),
      type,
      payload,
    }
    await db.add('events', event)
  } catch (e) {
    // Metrics are best-effort; avoid crashing
    console.warn('Metrics log failed:', e)
  }
}

export interface DashboardAggs {
  avgConcurrent: number
  maxConcurrent: number
  openedCount: number
  duplicateRate: number
  topDomains: string[]
  actionHistory: Array<{
    ts: number
    actionType: string
    count: number
    reason?: string
    sampleDomains?: string[]
  }>
}

export async function getDashboardAggs(): Promise<DashboardAggs> {
  const db = await getDb()
  const tx = db.transaction('events', 'readonly')
  const store = tx.objectStore('events')
  const byTs = store.index('by_ts')

  const now = Date.now()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  const since = now - sevenDaysMs

  const events: MetricEvent[] = []
  let cursor = await byTs.openCursor()
  while (cursor) {
    if (cursor.value.ts >= since) {
      events.push(cursor.value as MetricEvent)
    }
    cursor = await cursor.continue()
  }

  // Derive aggs from recent events
  let openedCount = 0
  let maxConcurrent = 0
  let concurrentSamples = 0
  let concurrentSum = 0
  let duplicatesClosed = 0
  let totalClosed = 0
  const actionHistory: DashboardAggs['actionHistory'] = []
  const domainCount = new Map<string, number>()

  for (const ev of events) {
    if (ev.type === 'action_executed') {
      const payload = (ev.payload || {}) as any
      totalClosed += payload.affectedCount || 0
      if (payload.action === 'CLOSE_DUPLICATES') {
        duplicatesClosed += payload.affectedCount || 0
      }
      if (payload.action === 'GROUP_DOMAIN' && payload.domain) {
        domainCount.set(payload.domain, (domainCount.get(payload.domain) || 0) + 1)
      }
      actionHistory.push({
        ts: ev.ts,
        actionType: payload.action || 'UNKNOWN',
        count: payload.affectedCount || 0,
        reason: payload.reason,
        sampleDomains: payload.domain ? [payload.domain] : undefined,
      })
    } else if (ev.type === 'alert_shown') {
      // Use alerts to sample concurrent tab counts
      const payload = (ev.payload || {}) as any
      const current = payload.current || 0
      concurrentSamples += 1
      concurrentSum += current
      if (current > maxConcurrent) maxConcurrent = current
    }
  }

  const avgConcurrent = concurrentSamples > 0 ? Math.round(concurrentSum / concurrentSamples) : 0
  const duplicateRate = totalClosed > 0 ? Math.round((duplicatesClosed / totalClosed) * 100) : 0
  const topDomains = [...domainCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([d]) => d)

  return {
    avgConcurrent,
    maxConcurrent,
    openedCount, // Not tracked yet
    duplicateRate,
    topDomains,
    actionHistory,
  }
}
