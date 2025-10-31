import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { 
  Grid3x3, 
  AlertTriangle, 
  Clock, 
  Copy, 
  X, 
  Settings,
  BellOff 
} from 'lucide-react'
import type { Settings as SettingsType } from '@/types'
import { StorageManager } from '@/lib/storage'

interface TabInfo {
  id: number
  title: string
  url: string
  favIconUrl?: string
  lastAccessed: number
  windowId: number
}

export function App() {
  const [tabs, setTabs] = useState<TabInfo[]>([])
  const [settings, setSettings] = useState<SettingsType | null>(null)
  const [duplicateTabs, setDuplicateTabs] = useState<TabInfo[]>([])
  const [oldTabs, setOldTabs] = useState<TabInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Get current window to filter tabs to this window only
      const currentWindow = await chrome.windows.getCurrent()
      const [allTabs, storedSettings] = await Promise.all([
        chrome.tabs.query({ windowId: currentWindow.id }),
        StorageManager.getSettings(),
      ])
      
      const tabsWithAccess = allTabs.map((tab, index) => ({
        id: tab.id!,
        title: tab.title || 'Untitled',
        url: tab.url || '',
        favIconUrl: tab.favIconUrl,
        lastAccessed: Date.now() - (index * 60000), // Simulate age based on order
        windowId: tab.windowId
      }))

      setTabs(tabsWithAccess)
      setSettings(storedSettings)

      // Find duplicates
      const urlCounts = new Map<string, TabInfo[]>()
      tabsWithAccess.forEach(tab => {
        if (tab.url) {
          if (!urlCounts.has(tab.url)) {
            urlCounts.set(tab.url, [])
          }
          urlCounts.get(tab.url)!.push(tab)
        }
      })

      const duplicates: TabInfo[] = []
      urlCounts.forEach(tabs => {
        if (tabs.length > 1) {
          // Keep the first tab, mark others as duplicates
          duplicates.push(...tabs.slice(1))
        }
      })
      setDuplicateTabs(duplicates)

      // Show all tabs for user selection, sorted by age (oldest first)
      const allTabsList = tabsWithAccess
        .slice()
        .sort((a, b) => a.id - b.id) // Sort by tab ID (older tabs typically have lower IDs)

      setOldTabs(allTabsList)
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  const closeTabs = async (tabIds: number[]) => {
    try {
      await chrome.tabs.remove(tabIds)
      await loadData() // Refresh data
    } catch (error) {
      console.error('Error closing tabs:', error)
    }
  }

  const closeOldestTabs = async () => {
    const tabIds = oldTabs.slice(0, 5).map(tab => tab.id)
    await closeTabs(tabIds)
  }

  const closeDuplicateTabs = async () => {
    const tabIds = duplicateTabs.map(tab => tab.id)
    await closeTabs(tabIds)
  }

  const snoozeNotifications = async () => {
    try {
      // Let the background service handle snooze logic with user settings
      chrome.runtime.sendMessage({
        type: 'RUN_ACTION',
        payload: { action: 'SNOOZE' }
      })
    } catch (error) {
      console.error('Error snoozing notifications:', error)
    }
  }

  const openSettings = () => {
    chrome.runtime.openOptionsPage()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Grid3x3 className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Tab Nudge Actions</h1>
            <Badge variant="outline" className="ml-2">
              {tabs.length} tabs open
            </Badge>
          </div>
          
          <Button 
            variant="outline" 
            onClick={openSettings}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Overview Alert */}
        {settings && tabs.length > settings.thresholdTabs && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Too many tabs open!</AlertTitle>
            <AlertDescription>
              You have {tabs.length} tabs open, which is above your threshold of {settings.thresholdTabs} tabs. 
              Consider using the cleanup actions below to improve browser performance.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <Card className="border-2 border-blue-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              ⚡ Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={closeOldestTabs} 
                disabled={oldTabs.length === 0}
                className="flex items-center gap-2 h-auto p-6 flex-col bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400"
              >
                <Clock className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-bold text-lg">🧹 Close Old</div>
                  <div className="text-sm opacity-90">
                    {oldTabs.length > 0 ? `Close ${Math.min(5, oldTabs.length)} oldest tabs` : 'No old tabs found'}
                  </div>
                </div>
              </Button>

              <Button 
                onClick={closeDuplicateTabs}
                disabled={duplicateTabs.length === 0}
                className="flex items-center gap-2 h-auto p-6 flex-col bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400"
              >
                <Copy className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-bold text-lg">🔍 Remove Dupes</div>
                  <div className="text-sm opacity-90">
                    {duplicateTabs.length > 0 ? `Close ${duplicateTabs.length} duplicate tabs` : 'No duplicates found'}
                  </div>
                </div>
              </Button>

              <Button 
                onClick={snoozeNotifications}
                variant="outline"
                className="flex items-center gap-2 h-auto p-6 flex-col border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-400 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <BellOff className="h-8 w-8 text-purple-600" />
                <div className="text-center">
                  <div className="font-bold text-lg text-purple-700">😴 Snooze</div>
                  <div className="text-sm text-purple-600">
                    Pause alerts temporarily
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Old Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                All Tabs ({oldTabs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {oldTabs.length === 0 ? (
                <p className="text-muted-foreground text-sm">No tabs found</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {oldTabs.map(tab => (
                    <div key={tab.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      {tab.favIconUrl && (
                        <img src={tab.favIconUrl} alt="" className="w-4 h-4" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{tab.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{tab.url}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => closeTabs([tab.id])}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Duplicate Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                Duplicate Tabs ({duplicateTabs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {duplicateTabs.length === 0 ? (
                <p className="text-muted-foreground text-sm">No duplicate tabs found</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {duplicateTabs.map(tab => (
                    <div key={tab.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      {tab.favIconUrl && (
                        <img src={tab.favIconUrl} alt="" className="w-4 h-4" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{tab.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{tab.url}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => closeTabs([tab.id])}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}