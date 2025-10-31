import type { Settings, RuntimeState } from '@/types'

const DEFAULT_SETTINGS: Settings = {
  thresholdTabs: 30,
  cooldownMinutes: 10,
  quickOldestCount: 10,
  snoozeMinutesDefault: 60,
  weeklyReportOptIn: false,
  i18nLocale: 'en',
  oldTabThreshold: 24,
}

const DEFAULT_RUNTIME_STATE: RuntimeState = {
  lastAlertAt: null,
  snoozeUntil: null,
  undoStack: [],
}

export class StorageManager {
  static async getSettings(): Promise<Settings> {
    const result = await chrome.storage.local.get('settings')
    return { ...DEFAULT_SETTINGS, ...result.settings }
  }

  static async setSettings(settings: Partial<Settings>): Promise<void> {
    const current = await this.getSettings()
    const updated = { ...current, ...settings }
    await chrome.storage.local.set({ settings: updated })
    
    // Notify all contexts of settings update
    chrome.runtime.sendMessage({
      type: 'SETTINGS_UPDATED',
      payload: settings,
    })
  }

  static async getRuntimeState(): Promise<RuntimeState> {
    const result = await chrome.storage.local.get('runtimeState')
    return { ...DEFAULT_RUNTIME_STATE, ...result.runtimeState }
  }

  static async setRuntimeState(state: Partial<RuntimeState>): Promise<void> {
    const current = await this.getRuntimeState()
    const updated = { ...current, ...state }
    await chrome.storage.local.set({ runtimeState: updated })
  }

  static async clearRuntimeState(): Promise<void> {
    await chrome.storage.local.set({ runtimeState: DEFAULT_RUNTIME_STATE })
  }
}