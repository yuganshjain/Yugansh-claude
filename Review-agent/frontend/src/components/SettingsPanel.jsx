import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import api from '../api'
import toast from 'react-hot-toast'
import { Loader2, Save, Zap, Globe, Bell, Palette } from 'lucide-react'

const TONES = [
  { value: 'professional', label: 'Professional', desc: 'Polished, solution-focused' },
  { value: 'friendly', label: 'Friendly', desc: 'Warm and approachable' },
  { value: 'formal', label: 'Formal', desc: 'Corporate and dignified' },
  { value: 'casual', label: 'Casual', desc: 'Relaxed and conversational' },
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
]

export default function SettingsPanel() {
  const { business, refreshBusiness } = useAuth()
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/api/settings/').then(res => setSettings(res.data))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.patch('/api/settings/', settings)
      await refreshBusiness()
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (!settings) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }))

  return (
    <div className="max-w-2xl space-y-6">
      {/* Brand Voice */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <Palette className="w-5 h-5 text-purple-600" /> Brand Voice
        </div>

        <div>
          <label className="label">Reply Tone</label>
          <div className="grid grid-cols-2 gap-2">
            {TONES.map(t => (
              <button
                key={t.value}
                onClick={() => set('tone', t.value)}
                className={`text-left p-3 rounded-lg border-2 text-sm transition-all ${settings.tone === t.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="font-medium">{t.label}</div>
                <div className="text-xs text-gray-500">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Custom Instructions (optional)</label>
          <textarea
            value={settings.brand_voice || ''}
            onChange={e => set('brand_voice', e.target.value)}
            placeholder="e.g. Always mention our loyalty program. Never offer refunds in public replies. Sign off with 'The [Business] Team'."
            rows={3}
            className="input resize-none"
          />
        </div>

        <div>
          <label className="label">Reply Language</label>
          <select className="input" value={settings.language} onChange={e => set('language', e.target.value)}>
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>

      {/* Auto-Reply */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <Zap className="w-5 h-5 text-yellow-500" /> Auto-Reply
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Enable Auto-Reply</p>
            <p className="text-xs text-gray-500">Replies post automatically when conditions are met</p>
          </div>
          <button
            onClick={() => set('auto_reply', !settings.auto_reply)}
            className={`relative w-11 h-6 rounded-full transition-colors ${settings.auto_reply ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.auto_reply ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        {settings.auto_reply && (
          <div>
            <label className="label">Minimum Stars for Auto-Reply</label>
            <div className="flex items-center gap-3">
              <input
                type="range" min="1" max="5" step="0.5"
                value={settings.auto_reply_threshold}
                onChange={e => set('auto_reply_threshold', parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-8">{settings.auto_reply_threshold}★</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Only auto-reply to reviews with {settings.auto_reply_threshold}+ stars</p>
          </div>
        )}
      </div>

      {/* Alerts */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-semibold">
          <Bell className="w-5 h-5 text-red-500" /> Negative Review Alerts
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Alert on Negative Reviews</p>
            <p className="text-xs text-gray-500">Get notified when a bad review comes in</p>
          </div>
          <button
            onClick={() => set('alert_on_negative', !settings.alert_on_negative)}
            className={`relative w-11 h-6 rounded-full transition-colors ${settings.alert_on_negative ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.alert_on_negative ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        {settings.alert_on_negative && (
          <>
            <div>
              <label className="label">Alert Email</label>
              <input type="email" className="input" value={settings.alert_email || ''} onChange={e => set('alert_email', e.target.value)} placeholder="manager@business.com" />
            </div>
            <div>
              <label className="label">Alert Threshold (max stars)</label>
              <div className="flex items-center gap-3">
                <input type="range" min="1" max="3" step="0.5" value={settings.negative_threshold} onChange={e => set('negative_threshold', parseFloat(e.target.value))} className="flex-1" />
                <span className="text-sm font-medium w-8">{settings.negative_threshold}★</span>
              </div>
            </div>
          </>
        )}
      </div>

      <button onClick={save} disabled={saving} className="btn-primary">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Settings
      </button>
    </div>
  )
}
