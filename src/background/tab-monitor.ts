import { StorageManager } from '../lib/storage'
import type { Settings } from '@/types'


export class TabMonitor {
  private settings: Settings | null = null
  private debounceTimer: NodeJS.Timeout | null = null
  private eventListeners = new Map<string, Function[]>()

  constructor() {
    this.init()
  }

  private async init() {
    await this.refreshSettings()
    this.setupTabListeners()
  }

  async refreshSettings() {
    this.settings = await StorageManager.getSettings()
  }

  private setupTabListeners() {
    // Listen for tab creation
    chrome.tabs.onCreated.addListener(() => {
      this.debounceTabCountCheck()
    })

    // Listen for tab removal
    chrome.tabs.onRemoved.addListener(() => {
      this.debounceTabCountCheck()
    })

    // Listen for tab updates (URL changes)
    chrome.tabs.onUpdated.addListener(() => {
      this.debounceTabCountCheck()
    })

    // Listen for window creation/removal
    chrome.windows.onCreated.addListener(() => {
      this.debounceTabCountCheck()
    })

    chrome.windows.onRemoved.addListener(() => {
      this.debounceTabCountCheck()
    })
  }

  private debounceTabCountCheck() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      this.checkTabThreshold()
    }, 500) // 500ms debounce
  }

  private async checkTabThreshold() {
    if (!this.settings) {
      await this.refreshSettings()
      if (!this.settings) return
    }

    try {
      const tabs = await chrome.tabs.query({})
      const currentCount = tabs.length
      const threshold = this.settings.thresholdTabs

      if (currentCount > threshold) {
        const canAlert = await this.canShowAlert()
        if (canAlert) {
          await this.recordAlertTime()
          this.emit('thresholdExceeded', { current: currentCount, threshold })
        }
      } else {
        // When returning below threshold, notify listeners to clear UI cues
        this.emit('thresholdCleared', { current: currentCount, threshold })
      }
    } catch (error) {
      console.error('Error checking tab threshold:', error)
    }
  }

  private async canShowAlert(): Promise<boolean> {
    if (!this.settings) return false

    const state = await StorageManager.getRuntimeState()

    // Check if snoozed
    if (state.snoozeUntil && Date.now() < state.snoozeUntil) {
      return false
    }

    // Check cooldown period
    if (state.lastAlertAt) {
      const cooldownMs = this.settings.cooldownMinutes * 60 * 1000
      const timeSinceLastAlert = Date.now() - state.lastAlertAt
      
      if (timeSinceLastAlert < cooldownMs) {
        return false
      }
    }

    return true
  }

  private async recordAlertTime() {
    const state = await StorageManager.getRuntimeState()
    await StorageManager.setRuntimeState({
      ...state,
      lastAlertAt: Date.now()
    })
  }

  // Simple event emitter
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  // Get current tab statistics
  async getTabStats() {
    const tabs = await chrome.tabs.query({})
    const windows = await chrome.windows.getAll()
    
    return {
      totalTabs: tabs.length,
      totalWindows: windows.length,
      activeTabs: tabs.filter(tab => tab.active).length,
      pinnedTabs: tabs.filter(tab => tab.pinned).length
    }
  }
}
