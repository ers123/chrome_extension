import type { AlertNotificationData } from '@/types'
import { logEvent } from '@/lib/metrics'

export class NotificationManager {
  async showAlert(data: AlertNotificationData) {
    try {
      // Update extension action badge as an additional visual cue
      try {
        await chrome.action.setBadgeBackgroundColor({ color: '#ef4444' })
        await chrome.action.setBadgeText({ text: String(Math.min(99, data.current)) })
      } catch (e) {
        // ignore badge errors
      }
      // Clear any existing notification first
      chrome.notifications.clear('tab-threshold-alert')

      // Create the alert notification
      await chrome.notifications.create('tab-threshold-alert', {
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'Tab Nudge Alert',
        message: `You have ${data.current} tabs open (threshold: ${data.threshold})`,
        contextMessage: 'Consider cleaning up to improve performance',
        buttons: [
          { title: '🧹 Quick Clean' },
          { title: '😴 Snooze 1h' }
        ],
        requireInteraction: true,
        priority: 2
      })

      console.log(`Alert shown: ${data.current} tabs (threshold: ${data.threshold})`)

      // Best-effort metrics
      await logEvent('alert_shown', data)
    } catch (error) {
      console.error('Error showing notification:', error)
    }
  }

  async showActionResult(message: string) {
    try {
      await chrome.notifications.create(`action-result-${Date.now()}`, {
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'Tab Nudge',
        message,
        priority: 1
      })

      // Auto-clear after 3 seconds
      setTimeout(() => {
        chrome.notifications.clear(`action-result-${Date.now() - 3000}`)
      }, 3000)
    } catch (error) {
      console.error('Error showing action result notification:', error)
    }
  }

  async clearAll() {
    try {
      // Simple approach: just clear known notifications
      const knownNotifications = ['tab-threshold-alert']
      knownNotifications.forEach(id => {
        chrome.notifications.clear(id)
      })

      // Clear badge
      try {
        await chrome.action.setBadgeText({ text: '' })
      } catch (e) {
        // ignore
      }
    } catch (error) {
      console.error('Error clearing notifications:', error)
    }
  }
}
