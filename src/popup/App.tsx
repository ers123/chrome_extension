import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Settings, Grid3x3, AlertTriangle } from 'lucide-react'
import type { Settings as SettingsType } from '@/types'
import { StorageManager } from '@/lib/storage'

export function App() {
  const [tabCount, setTabCount] = useState(0)
  const [settings, setSettings] = useState<SettingsType | null>(null)
  const [isOverThreshold, setIsOverThreshold] = useState(false)

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      // Get current window to show only this window's tabs
      const currentWindow = await chrome.windows.getCurrent()
      const [tabs, storedSettings] = await Promise.all([
        chrome.tabs.query({ windowId: currentWindow.id }),
        StorageManager.getSettings(),
      ])
      
      setTabCount(tabs.length)
      setSettings(storedSettings)
      setIsOverThreshold(tabs.length > storedSettings.thresholdTabs)
    }

    loadData()
  }, [])

  const openActionsPanel = async () => {
    console.log('🔄 Button clicked - opening actions panel in new tab...')
    
    try {
      // Create a new tab with the actions panel
      const actionsUrl = chrome.runtime.getURL('actions.html')
      await chrome.tabs.create({ url: actionsUrl })
      console.log('✅ Actions panel opened in new tab')
      
      // Close the popup
      window.close()
    } catch (error) {
      console.error('❌ Error opening actions panel:', error)
      // Fallback to options page
      chrome.runtime.openOptionsPage()
    }
  }

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  if (!settings) {
    return (
      <div className="w-80 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Grid3x3 className="h-5 w-5 text-white" />
              <span className="font-bold">Tab Nudge</span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={openOptions}
              className="h-8 w-8 hover:bg-white/20 text-white"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 p-6">
          {isOverThreshold ? (
            <Alert variant="destructive" className="border-red-200 bg-red-50 animate-pulse">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Too many tabs!</AlertTitle>
              <AlertDescription className="text-red-700">
                You have <span className="font-bold">{tabCount}</span> tabs open. Consider cleaning up to improve performance.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="text-center py-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600 animate-bounce">{tabCount}</div>
              <div className="text-sm text-green-700 font-medium">tabs open - looking good!</div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
            <span className="text-sm font-medium text-slate-700">Threshold:</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">{settings.thresholdTabs} tabs</Badge>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={openActionsPanel} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              ✨ Open Actions Panel
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  chrome.runtime.sendMessage({
                    type: 'RUN_ACTION',
                    payload: { action: 'CLOSE_OLDEST' }
                  })
                }}
                className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300"
              >
                🧹 Close Old
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  chrome.runtime.sendMessage({
                    type: 'RUN_ACTION',
                    payload: { action: 'SNOOZE' }
                  })
                }}
                className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
              >
                😴 Snooze
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}