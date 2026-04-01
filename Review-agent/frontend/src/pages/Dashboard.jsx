import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import api from '../api'
import toast from 'react-hot-toast'
import { RefreshCw, Wand2, Loader2, Settings, BarChart2, MessageSquare, Zap, Link, AlertCircle } from 'lucide-react'
import StatsBar from '../components/StatsBar'
import ReviewCard from '../components/ReviewCard'
import SettingsPanel from '../components/SettingsPanel'
import AnalyticsPanel from '../components/AnalyticsPanel'

const TABS = [
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'suggested', label: 'AI Suggested' },
  { value: 'approved', label: 'Approved' },
  { value: 'posted', label: 'Posted' },
]

export default function Dashboard() {
  const { business } = useAuth()
  const [tab, setTab] = useState('reviews')
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({})
  const [filter, setFilter] = useState('')
  const [sentimentFilter, setSentimentFilter] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [bulkGenerating, setBulkGenerating] = useState(false)
  const [connectingGoogle, setConnectingGoogle] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const params = {}
      if (filter) params.status = filter
      if (sentimentFilter) params.sentiment = sentimentFilter
      const [reviewsRes, statsRes] = await Promise.all([
        api.get('/api/reviews/', { params }),
        api.get('/api/reviews/stats'),
      ])
      setReviews(reviewsRes.data)
      setStats(statsRes.data)
    } catch {
      toast.error('Failed to load reviews')
    }
  }, [filter, sentimentFilter])

  useEffect(() => { loadData() }, [loadData])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await api.get('/api/reviews/sync')
      toast.success(`Synced ${res.data.synced} new review${res.data.synced !== 1 ? 's' : ''}`)
      await loadData()
    } catch {
      toast.error('Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const handleBulkGenerate = async () => {
    setBulkGenerating(true)
    try {
      const res = await api.post('/api/reviews/bulk-generate', {})
      toast.success(`Generated ${res.data.generated} replies`)
      await loadData()
    } catch {
      toast.error('Bulk generate failed')
    } finally {
      setBulkGenerating(false)
    }
  }

  const handleConnectGoogle = async () => {
    setConnectingGoogle(true)
    try {
      const res = await api.get('/api/auth/google/connect')
      window.open(res.data.auth_url, '_blank')
    } catch {
      toast.error('Failed to start Google connection')
    } finally {
      setConnectingGoogle(false)
    }
  }

  const pendingCount = reviews.filter(r => r.status === 'pending').length

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{business?.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {business?.google_connected
              ? <span className="text-green-600 font-medium">Google Connected</span>
              : <span className="text-orange-500">Google not connected — using demo data</span>
            }
          </p>
        </div>
        {!business?.google_connected && (
          <button onClick={handleConnectGoogle} disabled={connectingGoogle} className="btn-secondary text-sm">
            {connectingGoogle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
            Connect Google
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'reviews' && (
        <>
          <StatsBar stats={stats} />

          {/* Demo notice */}
          {!business?.google_connected && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm text-blue-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Demo Mode</strong> — Using sample reviews. Connect your Google Business Profile to use real data.
                Reviews marked [demo] won't actually post to Google.
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button onClick={handleSync} disabled={syncing} className="btn-secondary">
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Sync Reviews
            </button>
            {pendingCount > 0 && (
              <button onClick={handleBulkGenerate} disabled={bulkGenerating} className="btn-primary">
                {bulkGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                AI Reply All ({pendingCount})
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <select className="input py-1.5 text-sm w-auto" value={filter} onChange={e => setFilter(e.target.value)}>
                {FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className="input py-1.5 text-sm w-auto" value={sentimentFilter} onChange={e => setSentimentFilter(e.target.value)}>
                <option value="">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
          </div>

          {/* Review list */}
          {reviews.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No reviews found. Click "Sync Reviews" to load.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} onUpdate={loadData} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'analytics' && <AnalyticsPanel stats={stats} reviews={reviews} />}
      {tab === 'settings' && <SettingsPanel />}
    </div>
  )
}
