import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Grid3x3 } from 'lucide-react'
import type { Settings } from '@/types'
import { StorageManager } from '@/lib/storage'

export function App() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const storedSettings = await StorageManager.getSettings()
    setSettings(storedSettings)
  }

  const saveSettings = async () => {
    if (!settings) return
    
    setIsSaving(true)
    try {
      await StorageManager.setSettings(settings)
      setSaveStatus('Settings saved successfully!')
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (error) {
      setSaveStatus('Failed to save settings')
      setTimeout(() => setSaveStatus(null), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    if (settings) {
      setSettings({ ...settings, [key]: value })
    }
  }

  if (!settings) {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Grid3x3 className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Tab Nudge Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alert Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tab Threshold</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="200"
                step="1"
                value={settings.thresholdTabs}
                onChange={(e) => updateSetting('thresholdTabs', parseInt(e.target.value))}
                className="flex-1"
              />
              <Badge variant="outline" className="min-w-fit">
                {settings.thresholdTabs} tabs
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Alert when tab count exceeds this threshold
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cooldown Period</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="60"
                step="1"
                value={settings.cooldownMinutes}
                onChange={(e) => updateSetting('cooldownMinutes', parseInt(e.target.value))}
                className="flex-1"
              />
              <Badge variant="outline" className="min-w-fit">
                {settings.cooldownMinutes} min
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum time between repeated alerts
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Default Snooze Duration</label>
            <div className="flex items-center gap-4">
              <select
                value={settings.snoozeMinutesDefault}
                onChange={(e) => updateSetting('snoozeMinutesDefault', parseInt(e.target.value))}
                className="flex-1 p-2 border rounded-md"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={180}>3 hours</option>
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              How long to snooze notifications by default
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Action Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Close Count</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={settings.quickOldestCount}
                onChange={(e) => updateSetting('quickOldestCount', parseInt(e.target.value))}
                className="flex-1"
              />
              <Badge variant="outline" className="min-w-fit">
                {settings.quickOldestCount} tabs
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              How many oldest tabs to close with quick action
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Language</label>
            <select
              value={settings.i18nLocale}
              onChange={(e) => updateSetting('i18nLocale', e.target.value as 'ko' | 'en')}
              className="w-full p-2 border rounded-md"
            >
              <option value="en">English</option>
              <option value="ko">한국어</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="weeklyReport"
              checked={settings.weeklyReportOptIn}
              onChange={(e) => updateSetting('weeklyReportOptIn', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="weeklyReport" className="text-sm font-medium">
              Enable weekly usage reports
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          className="px-8"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
        
        {saveStatus && (
          <span className={`text-sm ${
            saveStatus.includes('success') ? 'text-green-600' : 'text-red-600'
          }`}>
            {saveStatus}
          </span>
        )}
      </div>
    </div>
  )
}