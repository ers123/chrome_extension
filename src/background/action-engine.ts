import { StorageManager } from '../lib/storage'
import { logEvent } from '@/lib/metrics'
import type { ActionType, UndoEntry, TabSnapshot } from '@/types'

export class ActionEngine {
  async executeAction(action: ActionType, data?: any) {
    console.log(`Executing action: ${action}`)
    let result: any
    switch (action) {
      case 'CLOSE_OLDEST':
        result = await this.closeOldestTabs(data?.count)
        break
      case 'CLOSE_DUPLICATES':
        result = await this.closeDuplicateTabs()
        break
      case 'GROUP_DOMAIN':
        result = await this.groupDomainTabs(data?.domain)
        break
      case 'SNOOZE':
        result = await this.snoozeAlerts(data?.minutes)
        break
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    // Best-effort metrics logging
    try {
      await logEvent('action_executed', {
        action,
        affectedCount: result?.affectedCount ?? 0,
        domain: data?.domain,
        reason: data?.reason,
      })
    } catch (e) {
      // ignore
    }

    return result
  }

  async previewAction(action: ActionType, data?: any) {
    switch (action) {
      case 'CLOSE_OLDEST':
        return await this.previewCloseOldest(data?.count)
      case 'CLOSE_DUPLICATES':
        return await this.previewCloseDuplicates()
      case 'GROUP_DOMAIN':
        return await this.previewGroupDomain(data?.domain)
      case 'SNOOZE':
        return { count: 0, description: 'Snooze notifications for specified duration' }
      default:
        return { count: 0, description: 'Unknown action' }
    }
  }

  private async closeOldestTabs(count?: number): Promise<any> {
    const settings = await StorageManager.getSettings()
    const targetCount = count || settings.quickOldestCount

    try {
      const tabs = await chrome.tabs.query({})
      
      // Filter out pinned tabs and sort by lastAccessed (oldest first)
      const eligibleTabs = tabs
        .filter(tab => !tab.pinned && tab.id !== undefined)
        .sort((a, b) => {
          const aTime = 'lastAccessed' in a ? (a as any).lastAccessed || 0 : 0
          const bTime = 'lastAccessed' in b ? (b as any).lastAccessed || 0 : 0
          return aTime - bTime
        })
        .slice(0, targetCount)

      if (eligibleTabs.length === 0) {
        return { summary: 'No eligible tabs to close', affectedCount: 0 }
      }

      // Create undo entry
      const undoId = await this.createUndoEntry('close', eligibleTabs)

      // Close tabs
      const tabIds = eligibleTabs.map(tab => tab.id!).filter(id => id !== undefined)
      await Promise.all(tabIds.map(id => chrome.tabs.remove(id)))

      return {
        summary: `Closed ${eligibleTabs.length} oldest tabs`,
        affectedCount: eligibleTabs.length,
        undoId
      }
    } catch (error) {
      console.error('Error closing oldest tabs:', error)
      throw error
    }
  }

  private async closeDuplicateTabs(): Promise<any> {
    try {
      const tabs = await chrome.tabs.query({})
      
      // Group tabs by normalized URL
      const urlGroups = new Map<string, chrome.tabs.Tab[]>()
      
      tabs.forEach(tab => {
        if (tab.url) {
          // Normalize URL by removing hash and query params
          const normalizedUrl = tab.url.split('#')[0].split('?')[0]
          
          if (!urlGroups.has(normalizedUrl)) {
            urlGroups.set(normalizedUrl, [])
          }
          urlGroups.get(normalizedUrl)!.push(tab)
        }
      })

      // Find duplicates (groups with more than 1 tab)
      const duplicateTabs: chrome.tabs.Tab[] = []
      
      urlGroups.forEach(group => {
        if (group.length > 1) {
          // Keep the most recently accessed tab, close others
          const sorted = group.sort((a, b) => {
            const aTime = 'lastAccessed' in a ? (a as any).lastAccessed || 0 : 0
            const bTime = 'lastAccessed' in b ? (b as any).lastAccessed || 0 : 0
            return bTime - aTime
          })
          duplicateTabs.push(...sorted.slice(1)) // All but the first (most recent)
        }
      })

      if (duplicateTabs.length === 0) {
        return { summary: 'No duplicate tabs found', affectedCount: 0 }
      }

      // Create undo entry
      const undoId = await this.createUndoEntry('close', duplicateTabs)

      // Close duplicate tabs
      const tabIds = duplicateTabs.map(tab => tab.id!).filter(id => id !== undefined)
      await Promise.all(tabIds.map(id => chrome.tabs.remove(id)))

      return {
        summary: `Closed ${duplicateTabs.length} duplicate tabs`,
        affectedCount: duplicateTabs.length,
        undoId
      }
    } catch (error) {
      console.error('Error closing duplicate tabs:', error)
      throw error
    }
  }

  private async groupDomainTabs(domain?: string): Promise<any> {
    try {
      const tabs = await chrome.tabs.query({})
      
      if (!domain) {
        // Find the domain with most tabs
        const domainCounts = new Map<string, chrome.tabs.Tab[]>()
        
        tabs.forEach(tab => {
          if (tab.url) {
            try {
              const hostname = new URL(tab.url).hostname
              if (!domainCounts.has(hostname)) {
                domainCounts.set(hostname, [])
              }
              domainCounts.get(hostname)!.push(tab)
            } catch (e) {
              // Invalid URL, skip
            }
          }
        })

        // Find domain with most tabs
        let maxCount = 0
        let targetDomain = ''
        domainCounts.forEach((domainTabs, domainName) => {
          if (domainTabs.length > maxCount) {
            maxCount = domainTabs.length
            targetDomain = domainName
          }
        })

        domain = targetDomain
      }

      if (!domain) {
        return { summary: 'No suitable domain found', affectedCount: 0 }
      }

      // Find tabs for this domain
      const domainTabs = tabs.filter(tab => {
        if (tab.url) {
          try {
            return new URL(tab.url).hostname === domain
          } catch (e) {
            return false
          }
        }
        return false
      })

      if (domainTabs.length <= 1) {
        return { summary: `Only ${domainTabs.length} tab(s) for ${domain}`, affectedCount: 0 }
      }

      // Create new window and move tabs
      const newWindow = await chrome.windows.create({
        tabId: domainTabs[0].id,
        focused: false
      })

      // Move remaining tabs to new window
      if (domainTabs.length > 1) {
        const remainingTabIds = domainTabs.slice(1).map(tab => tab.id!).filter(id => id !== undefined)
        
        await Promise.all(
          remainingTabIds.map(tabId => 
            chrome.tabs.move(tabId, { 
              windowId: newWindow.id!,
              index: -1 
            })
          )
        )
      }

      return {
        summary: `Grouped ${domainTabs.length} ${domain} tabs in new window`,
        affectedCount: domainTabs.length
      }
    } catch (error) {
      console.error('Error grouping domain tabs:', error)
      throw error
    }
  }

  private async snoozeAlerts(minutes?: number): Promise<any> {
    const settings = await StorageManager.getSettings()
    const snoozeMinutes = minutes || settings.snoozeMinutesDefault
    
    const snoozeUntil = Date.now() + (snoozeMinutes * 60 * 1000)
    
    const state = await StorageManager.getRuntimeState()
    await StorageManager.setRuntimeState({
      ...state,
      snoozeUntil
    })

    // Clear any existing snooze alarms before creating new one
    try {
      await chrome.alarms.clear('snooze-end')
    } catch (e) {
      // Ignore clearing errors
    }

    // Set alarm to re-enable alerts
    chrome.alarms.create('snooze-end', { when: snoozeUntil })

    return {
      summary: `Alerts snoozed for ${snoozeMinutes} minutes`,
      affectedCount: 0
    }
  }

  // Preview methods
  private async previewCloseOldest(count?: number) {
    const settings = await StorageManager.getSettings()
    const targetCount = count || settings.quickOldestCount

    const tabs = await chrome.tabs.query({})
    const eligibleTabs = tabs.filter(tab => !tab.pinned)
    const actualCount = Math.min(targetCount, eligibleTabs.length)

    return {
      count: actualCount,
      description: `Will close ${actualCount} oldest non-pinned tabs`
    }
  }

  private async previewCloseDuplicates() {
    const tabs = await chrome.tabs.query({})
    const urlGroups = new Map<string, chrome.tabs.Tab[]>()
    
    tabs.forEach(tab => {
      if (tab.url) {
        const normalizedUrl = tab.url.split('#')[0].split('?')[0]
        if (!urlGroups.has(normalizedUrl)) {
          urlGroups.set(normalizedUrl, [])
        }
        urlGroups.get(normalizedUrl)!.push(tab)
      }
    })

    let duplicateCount = 0
    urlGroups.forEach(group => {
      if (group.length > 1) {
        duplicateCount += group.length - 1
      }
    })

    return {
      count: duplicateCount,
      description: `Will close ${duplicateCount} duplicate tabs`
    }
  }

  private async previewGroupDomain(domain?: string) {
    const tabs = await chrome.tabs.query({})
    
    if (!domain) {
      const domainCounts = new Map<string, number>()
      tabs.forEach(tab => {
        if (tab.url) {
          try {
            const hostname = new URL(tab.url).hostname
            domainCounts.set(hostname, (domainCounts.get(hostname) || 0) + 1)
          } catch (e) {}
        }
      })

      let maxCount = 0
      domainCounts.forEach(count => {
        if (count > maxCount) maxCount = count
      })

      return {
        count: maxCount,
        description: `Will group ${maxCount} tabs from top domain`
      }
    }

    const domainTabs = tabs.filter(tab => {
      if (tab.url) {
        try {
          return new URL(tab.url).hostname === domain
        } catch (e) {
          return false
        }
      }
      return false
    })

    return {
      count: domainTabs.length,
      description: `Will group ${domainTabs.length} tabs from ${domain}`
    }
  }

  private async createUndoEntry(type: UndoEntry['type'], tabs: chrome.tabs.Tab[]): Promise<string> {
    const undoId = `undo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const tabSnapshots: TabSnapshot[] = tabs.map(tab => ({
      id: tab.id,
      url: tab.url || '',
      index: tab.index,
      pinned: tab.pinned,
      title: tab.title || '',
      windowId: tab.windowId
    }))

    const undoEntry: UndoEntry = {
      id: undoId,
      createdAt: Date.now(),
      type,
      tabs: tabSnapshots
    }

    const state = await StorageManager.getRuntimeState()
    const updatedStack = [...state.undoStack, undoEntry]
    
    // Keep only last 5 undo entries and remove expired ones (>10 seconds)
    const now = Date.now()
    const validEntries = updatedStack
      .filter(entry => now - entry.createdAt < 10000) // 10 seconds
      .slice(-5) // Keep last 5

    await StorageManager.setRuntimeState({
      ...state,
      undoStack: validEntries
    })

    return undoId
  }
}
