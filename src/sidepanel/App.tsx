import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { 
  Trash2, 
  Copy, 
  FolderOpen, 
  Clock, 
  Grid3x3, 
  CheckCircle 
} from 'lucide-react'
import type { ActionType } from '@/types'

interface ActionPreview {
  action: ActionType
  count: number
  description: string
}

export function App() {
  const [tabCount, setTabCount] = useState(0)
  const [previews, setPreviews] = useState<ActionPreview[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)

  useEffect(() => {
    loadTabData()
  }, [])

  const loadTabData = async () => {
    const tabs = await chrome.tabs.query({})
    setTabCount(tabs.length)
    
    // Generate action previews
    const previewData: ActionPreview[] = [
      {
        action: 'CLOSE_OLDEST',
        count: Math.min(10, tabs.length),
        description: 'Close oldest unused tabs'
      },
      {
        action: 'CLOSE_DUPLICATES',
        count: getDuplicateCount(tabs),
        description: 'Close duplicate tabs'
      },
      {
        action: 'GROUP_DOMAIN',
        count: getTopDomainCount(tabs),
        description: 'Group tabs by domain'
      }
    ]
    
    setPreviews(previewData)
  }

  const getDuplicateCount = (tabs: chrome.tabs.Tab[]): number => {
    const urlMap = new Map<string, number>()
    tabs.forEach(tab => {
      if (tab.url) {
        const normalizedUrl = tab.url.split('#')[0].split('?')[0]
        urlMap.set(normalizedUrl, (urlMap.get(normalizedUrl) || 0) + 1)
      }
    })
    
    let duplicates = 0
    urlMap.forEach(count => {
      if (count > 1) duplicates += count - 1
    })
    return duplicates
  }

  const getTopDomainCount = (tabs: chrome.tabs.Tab[]): number => {
    const domainMap = new Map<string, number>()
    tabs.forEach(tab => {
      if (tab.url) {
        try {
          const domain = new URL(tab.url).hostname
          domainMap.set(domain, (domainMap.get(domain) || 0) + 1)
        } catch {}
      }
    })
    
    const topDomain = Array.from(domainMap.entries())
      .sort((a, b) => b[1] - a[1])[0]
    return topDomain ? topDomain[1] : 0
  }

  const executeAction = async (action: ActionType) => {
    setIsLoading(true)
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'RUN_ACTION',
        payload: { action }
      })
      
      setLastAction(`${action} completed - ${response?.affectedCount || 0} tabs affected`)
      await loadTabData() // Refresh data
    } catch (error) {
      console.error('Action failed:', error)
      setLastAction('Action failed - please try again')
    } finally {
      setIsLoading(false)
    }
  }

  const snoozeAlerts = () => {
    executeAction('SNOOZE')
  }

  const getActionIcon = (action: ActionType) => {
    switch (action) {
      case 'CLOSE_OLDEST': return <Trash2 className="h-4 w-4" />
      case 'CLOSE_DUPLICATES': return <Copy className="h-4 w-4" />
      case 'GROUP_DOMAIN': return <FolderOpen className="h-4 w-4" />
      default: return <Grid3x3 className="h-4 w-4" />
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" />
            Tab Actions
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{tabCount}</div>
            <div className="text-sm text-muted-foreground">tabs currently open</div>
          </div>

          {lastAction && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Action Completed</AlertTitle>
              <AlertDescription>{lastAction}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {previews.map((preview) => (
              <Card key={preview.action} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getActionIcon(preview.action)}
                    <div>
                      <div className="font-medium text-sm">{preview.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {preview.count} tabs affected
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => executeAction(preview.action)}
                    disabled={isLoading || preview.count === 0}
                  >
                    {preview.count > 0 ? 'Execute' : 'None'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4" />
                <div>
                  <div className="font-medium text-sm">Snooze Alerts</div>
                  <div className="text-xs text-muted-foreground">
                    Pause notifications for 1 hour
                  </div>
                </div>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={snoozeAlerts}
                disabled={isLoading}
              >
                Snooze
              </Button>
            </div>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}