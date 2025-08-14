"use client"

import { useState, useEffect } from 'react'
import { useSessionStore } from '@/stores/useSessionStore'
import { useUserStore } from '@/stores/useUserStore'
import { supabase } from '@/lib/supabase'
import { 
  Timer, 
  Volume2, 
  VolumeX, 
  Save, 
  RotateCcw, 
  User, 
  Bell,
  Moon,
  Sun
} from 'lucide-react'
import { useTheme } from 'next-themes'

interface UserSettings {
  focusTime: number
  shortBreakTime: number
  longBreakTime: number
  cyclesUntilLongBreak: number
  soundEnabled: boolean
  notificationsEnabled: boolean
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
}

export default function SettingsPage() {
  const { user } = useUserStore()
  const { 
    focusTime, 
    shortBreakTime, 
    longBreakTime, 
    cyclesUntilLongBreak,
    updateSettings 
  } = useSessionStore()
  const { theme, setTheme } = useTheme()
  
  const [settings, setLocalSettings] = useState<UserSettings>({
    focusTime: focusTime,
    shortBreakTime: shortBreakTime,
    longBreakTime: longBreakTime,
    cyclesUntilLongBreak: cyclesUntilLongBreak,
    soundEnabled: true,
    notificationsEnabled: false,
    autoStartBreaks: false,
    autoStartPomodoros: false
  })
  
  const [userProfile, setUserProfile] = useState({
    full_name: '',
    avatar_url: ''
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    // Load user profile
    if (user) {
      setUserProfile({
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || ''
      })
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('focusflow-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setLocalSettings(prev => ({ ...prev, ...parsed }))
    }
  }, [user])

  const handleTimerSettingChange = (key: keyof UserSettings, value: number) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleBooleanSettingChange = (key: keyof UserSettings, value: boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // Update timer settings in store
      updateSettings({
        focusTime: settings.focusTime,
        shortBreakTime: settings.shortBreakTime,
        longBreakTime: settings.longBreakTime,
        cyclesUntilLongBreak: settings.cyclesUntilLongBreak
      })

      // Save all settings to localStorage
      localStorage.setItem('focusflow-settings', JSON.stringify(settings))

      // Update user profile if changed
      if (user && (userProfile.full_name !== user.user_metadata?.full_name)) {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: userProfile.full_name }
        })
        
        if (error) {
          console.error('Error updating profile:', error)
        }
      }

      setSaveMessage('Settings saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveMessage('Error saving settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetToDefaults = () => {
    const defaultSettings: UserSettings = {
      focusTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      cyclesUntilLongBreak: 4,
      soundEnabled: true,
      notificationsEnabled: false,
      autoStartBreaks: false,
      autoStartPomodoros: false
    }
    setLocalSettings(defaultSettings)
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      handleBooleanSettingChange('notificationsEnabled', permission === 'granted')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize your FocusFlow experience
        </p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${
          saveMessage.includes('Error') 
            ? 'bg-destructive/10 text-destructive' 
            : 'bg-green-500/10 text-green-600'
        }`}>
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Settings */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Timer className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Timer Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Focus Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.focusTime}
                onChange={(e) => handleTimerSettingChange('focusTime', parseInt(e.target.value) || 25)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Short Break Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakTime}
                onChange={(e) => handleTimerSettingChange('shortBreakTime', parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Long Break Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakTime}
                onChange={(e) => handleTimerSettingChange('longBreakTime', parseInt(e.target.value) || 15)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Cycles Until Long Break
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={settings.cyclesUntilLongBreak}
                onChange={(e) => handleTimerSettingChange('cyclesUntilLongBreak', parseInt(e.target.value) || 4)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Moon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Theme</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md border ${
                    theme === 'light' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background hover:bg-accent'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md border ${
                    theme === 'dark' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background hover:bg-accent'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md border ${
                    theme === 'system' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background hover:bg-accent'
                  }`}
                >
                  <span>System</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications & Sounds */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Notifications & Sounds</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sound Notifications</p>
                <p className="text-sm text-muted-foreground">Play sounds when timer completes</p>
              </div>
              <button
                onClick={() => handleBooleanSettingChange('soundEnabled', !settings.soundEnabled)}
                className={`p-2 rounded-md ${
                  settings.soundEnabled 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Browser Notifications</p>
                <p className="text-sm text-muted-foreground">Show notification when timer completes</p>
              </div>
              <button
                onClick={requestNotificationPermission}
                className={`px-3 py-1 rounded-md text-sm ${
                  settings.notificationsEnabled 
                    ? 'bg-green-500/10 text-green-600' 
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {settings.notificationsEnabled ? 'Enabled' : 'Enable'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-start Breaks</p>
                <p className="text-sm text-muted-foreground">Automatically start break timers</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoStartBreaks}
                onChange={(e) => handleBooleanSettingChange('autoStartBreaks', e.target.checked)}
                className="w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-start Focus Sessions</p>
                <p className="text-sm text-muted-foreground">Automatically start focus timers after breaks</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoStartPomodoros}
                onChange={(e) => handleBooleanSettingChange('autoStartPomodoros', e.target.checked)}
                className="w-4 h-4"
              />
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name</label>
              <input
                type="text"
                value={userProfile.full_name}
                onChange={(e) => setUserProfile(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border rounded-md bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleResetToDefaults}
          className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Defaults</span>
        </button>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center space-x-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  )
}
