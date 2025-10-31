import { TabMonitor } from './tab-monitor'
import { ActionEngine } from './action-engine'
import { NotificationManager } from './notification-manager'
import { StorageManager } from '../lib/storage'
import { getDashboardAggs } from '@/lib/metrics'
import type { RuntimeMessage } from '@/types'

class BackgroundService {
  private tabMonitor: TabMonitor
  private actionEngine: ActionEngine
  private notificationManager: NotificationManager

  constructor() {
    this.tabMonitor = new TabMonitor()
    this.actionEngine = new ActionEngine()
    this.notificationManager = new NotificationManager()
    
    this.init()
  }

  private async init() {
    // Request notification permission if not granted
    await this.ensureNotificationPermission()
    
    // Listen for tab events
    this.tabMonitor.on('thresholdExceeded', (data: any) => {
      this.notificationManager.showAlert(data)
    })
    this.tabMonitor.on('thresholdCleared', () => {
      this.notificationManager.clearAll()
    })

    // Listen for runtime messages
    chrome.runtime.onMessage.addListener(
      (message: RuntimeMessage, sender, sendResponse) => {
        this.handleMessage(message, sender, sendResponse)
        return true // Keep channel open for async response
      }
    )

    // Listen for notification clicks
    chrome.notifications.onClicked.addListener((notificationId) => {
      if (notificationId === 'tab-threshold-alert') {
        // Open actions panel in new tab
        this.openActionsPanel()
      }
    })

    // Listen for notification button clicks
    chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
      if (notificationId === 'tab-threshold-alert') {
        if (buttonIndex === 0) {
          // Quick Clean button
          this.actionEngine.executeAction('CLOSE_OLDEST')
        } else if (buttonIndex === 1) {
          // Snooze button
          this.actionEngine.executeAction('SNOOZE')
        }
      }
    })

    // Listen for alarms (snooze, weekly reports)
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'snooze-end') {
        this.handleSnoozeEnd()
      } else if (alarm.name.startsWith('weekly-report')) {
        this.handleWeeklyReport()
      }
    })

    // Listen for commands (keyboard shortcuts)
    chrome.commands.onCommand.addListener((command) => {
      switch (command) {
        case 'open_actions':
          this.openActionsPanel()
          break
        case 'open_dashboard':
          this.openDashboardPage()
          break
        case 'close_oldest':
          this.actionEngine.executeAction('CLOSE_OLDEST')
          break
        case 'close_duplicates':
          this.actionEngine.executeAction('CLOSE_DUPLICATES')
          break
        case 'snooze':
          this.actionEngine.executeAction('SNOOZE')
          break
      }
    })

    console.log('Tab Nudge background service initialized')
  }

  private async openActionsPanel() {
    try {
      console.log('🔄 Background: Opening actions panel in new tab...')
      
      const actionsUrl = chrome.runtime.getURL('actions.html')
      await chrome.tabs.create({ url: actionsUrl })
      console.log('✅ Background: Actions panel opened successfully')
    } catch (error) {
      console.error('❌ Background: Error opening actions panel:', error)
    }
  }

  private async openDashboardPage() {
    try {
      const url = chrome.runtime.getURL('dashboard.html')
      await chrome.tabs.create({ url })
    } catch (error) {
      console.error('Error opening dashboard page:', error)
    }
  }

  private async ensureNotificationPermission() {
    try {
      // Check if notifications API is available
      if (chrome.notifications && chrome.notifications.getPermissionLevel) {
        chrome.notifications.getPermissionLevel((permission) => {
          console.log('Notification permission level:', permission)
          
          if (permission !== 'granted') {
            console.warn('Notifications not enabled. Please enable in chrome://extensions/')
          }
        })
      } else {
        console.warn('Notifications API not available')
      }
    } catch (error) {
      console.error('Error checking notification permission:', error)
    }
  }

  private async handleMessage(
    message: RuntimeMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    try {
      switch (message.type) {
        case 'RUN_ACTION':
          const result = await this.actionEngine.executeAction(
            message.payload.action,
            message.payload.data
          )
          sendResponse(result)
          break

        case 'ACTION_PREVIEW':
          const preview = await this.actionEngine.previewAction(
            message.payload.action,
            message.payload.data
          )
          sendResponse(preview)
          break

        case 'DASHBOARD_REQUEST':
          const dashboardData = await this.generateDashboardData()
          sendResponse({ type: 'DASHBOARD_RESPONSE', payload: dashboardData })
          break
        case 'OPEN_DASHBOARD':
          await this.openDashboardPage()
          sendResponse({ success: true })
          break

        case 'SETTINGS_UPDATED':
          // Settings are already updated in storage, just refresh monitor
          await this.tabMonitor.refreshSettings()
          break

        case 'OPEN_ACTIONS_PANEL':
          await this.openActionsPanel()
          sendResponse({ success: true })
          break

        default:
          console.warn('Unknown message type:', message.type)
      }
    } catch (error) {
      console.error('Error handling message:', error)
      sendResponse({ error: error instanceof Error ? error.message : String(error) })
    }
  }

  private async handleSnoozeEnd() {
    const state = await StorageManager.getRuntimeState()
    await StorageManager.setRuntimeState({
      ...state,
      snoozeUntil: null
    })
    
    console.log('Snooze period ended')
  }

  private async handleWeeklyReport() {
    // TODO: Implement weekly report generation
    console.log('Weekly report generation not yet implemented')
  }

  private async generateDashboardData() {
    // Pull from IndexedDB aggs and blend with live tab count if desired
    const aggs = await getDashboardAggs()
    return aggs
  }
}

// Initialize the background service
new BackgroundService()
