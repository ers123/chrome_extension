// Chrome Extension Types
export interface Settings {
  thresholdTabs: number
  cooldownMinutes: number
  quickOldestCount: number
  snoozeMinutesDefault: number
  weeklyReportOptIn: boolean
  i18nLocale: 'ko' | 'en'
  oldTabThreshold: number
}

export interface RuntimeState {
  lastAlertAt: number | null
  snoozeUntil: number | null
  undoStack: UndoEntry[]
}

export interface UndoEntry {
  id: string
  createdAt: number
  type: 'close' | 'group' | 'archive'
  tabs: TabSnapshot[]
}

export interface TabSnapshot {
  id?: number
  url: string
  index: number
  pinned: boolean
  title: string
  windowId: number
}

export interface ActionLog {
  ts: number
  actionType: string
  count: number
  reason: string
  sampleDomains: string[]
}

export interface DailyAgg {
  date: string
  avgConcurrent: number
  maxConcurrent: number
  openedCount: number
  duplicateRate: number
  topDomains: string[]
}

// Runtime Messages
export type RuntimeMessage = 
  | { type: 'ALERT_TRIGGERED'; payload: { current: number; threshold: number } }
  | { type: 'RUN_ACTION'; payload: { action: ActionType; data?: any } }
  | { type: 'ACTION_PREVIEW'; payload: { action: ActionType; data?: any } }
  | { type: 'ACTION_RESULT'; payload: { summary: string; affectedCount: number; undoId?: string } }
  | { type: 'SETTINGS_UPDATED'; payload: Partial<Settings> }
  | { type: 'DASHBOARD_REQUEST' }
  | { type: 'DASHBOARD_RESPONSE'; payload: DashboardData }
  | { type: 'OPEN_ACTIONS_PANEL' }
  | { type: 'OPEN_DASHBOARD' }

export type ActionType = 'CLOSE_OLDEST' | 'CLOSE_DUPLICATES' | 'GROUP_DOMAIN' | 'SNOOZE'

export interface DashboardData {
  avgConcurrent: number
  maxConcurrent: number
  openedCount: number
  duplicateRate: number
  topDomains: string[]
  actionHistory: ActionLog[]
}

export interface AlertNotificationData {
  current: number
  threshold: number
}
