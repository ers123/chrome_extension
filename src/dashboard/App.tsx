import { useEffect, useMemo, useState } from 'react'
import type { DashboardData, RuntimeMessage } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type ActionAgg = { name: string; count: number }

export default function DashboardApp() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const res = await chrome.runtime.sendMessage({ type: 'DASHBOARD_REQUEST' } as RuntimeMessage)
        if (res?.payload) {
          setData(res.payload as DashboardData)
        } else {
          throw new Error('No payload from background')
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const actionAggs: ActionAgg[] = useMemo(() => {
    if (!data) return []
    const counts = new Map<string, number>()
    for (const item of data.actionHistory) {
      counts.set(item.actionType, (counts.get(item.actionType) || 0) + (item.count || 0))
    }
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }))
  }, [data])

  if (loading) return <div className="p-6">Loading dashboard…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!data) return <div className="p-6">No data available.</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Tab Nudge — Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Avg Concurrent" value={String(data.avgConcurrent)} />
        <StatCard label="Max Concurrent" value={String(data.maxConcurrent)} />
        <StatCard label="Duplicate Rate" value={`${data.duplicateRate}%`} />
      </div>

      <Card className="p-4">
        <h2 className="font-medium mb-2">Actions Summary</h2>
        {actionAggs.length === 0 ? (
          <div className="text-sm text-muted-foreground">No actions recorded yet.</div>
        ) : (
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={actionAggs} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="font-medium mb-2">Top Domains</h2>
        {data.topDomains.length === 0 ? (
          <div className="text-sm text-muted-foreground">No domain data yet.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.topDomains.map((d) => (
              <Badge key={d} variant="secondary">{d}</Badge>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </Card>
  )
}
