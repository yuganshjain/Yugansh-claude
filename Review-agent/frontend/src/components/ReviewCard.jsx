import { useState } from 'react'
import { Star, Wand2, Check, Send, EyeOff, Loader2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import api from '../api'
import toast from 'react-hot-toast'

const SENTIMENT_STYLES = {
  positive: 'bg-green-50 text-green-700 border-green-200',
  neutral: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  negative: 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_BADGE = {
  pending: { label: 'Needs Reply', className: 'bg-orange-50 text-orange-700' },
  suggested: { label: 'AI Suggested', className: 'bg-blue-50 text-blue-700' },
  approved: { label: 'Approved', className: 'bg-indigo-50 text-indigo-700' },
  posted: { label: 'Posted', className: 'bg-green-50 text-green-700' },
  ignored: { label: 'Ignored', className: 'bg-gray-50 text-gray-500' },
}

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </div>
  )
}

export default function ReviewCard({ review, onUpdate }) {
  const [expanded, setExpanded] = useState(review.status !== 'posted' && review.status !== 'ignored')
  const [replyText, setReplyText] = useState(review.suggested_reply || review.final_reply || '')
  const [loading, setLoading] = useState(null) // 'generate' | 'approve' | 'post' | 'ignore'

  const handleGenerate = async () => {
    setLoading('generate')
    try {
      const res = await api.post(`/api/reviews/${review.id}/generate`)
      setReplyText(res.data.suggested_reply)
      toast.success('Reply generated')
      onUpdate()
    } catch {
      toast.error('Failed to generate reply')
    } finally {
      setLoading(null)
    }
  }

  const handleApprove = async () => {
    if (!replyText.trim()) { toast.error('Reply cannot be empty'); return }
    setLoading('approve')
    try {
      await api.post(`/api/reviews/${review.id}/approve`, { reply_text: replyText })
      toast.success('Reply approved')
      onUpdate()
    } catch {
      toast.error('Failed to approve')
    } finally {
      setLoading(null)
    }
  }

  const handlePost = async () => {
    setLoading('post')
    try {
      await api.post(`/api/reviews/${review.id}/post`)
      toast.success(review.is_mock ? 'Posted (mock mode)' : 'Posted to Google!')
      onUpdate()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to post')
    } finally {
      setLoading(null)
    }
  }

  const handleIgnore = async () => {
    setLoading('ignore')
    try {
      await api.post(`/api/reviews/${review.id}/ignore`)
      onUpdate()
    } catch {
      toast.error('Failed to ignore')
    } finally {
      setLoading(null)
    }
  }

  const badge = STATUS_BADGE[review.status] || STATUS_BADGE.pending
  const isPosted = review.status === 'posted'
  const isIgnored = review.status === 'ignored'

  return (
    <div className={`card overflow-hidden transition-all ${isPosted ? 'opacity-75' : ''}`}>
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {review.reviewer_name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{review.reviewer_name}</span>
            <Stars rating={review.rating} />
            <span className={`text-xs px-2 py-0.5 rounded-full border ${SENTIMENT_STYLES[review.sentiment]}`}>
              {review.sentiment}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
              {badge.label}
            </span>
            {review.is_mock && <span className="text-xs text-gray-400">[demo]</span>}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Review text */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700 italic">
              {review.text ? `"${review.text}"` : <span className="text-gray-400">No written review — star rating only</span>}
            </p>
          </div>

          {/* Reply area */}
          {!isPosted && !isIgnored && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Your Reply</label>
                <button
                  onClick={handleGenerate}
                  disabled={loading === 'generate'}
                  className="btn-secondary text-xs py-1 px-2"
                >
                  {loading === 'generate'
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : replyText ? <RefreshCw className="w-3 h-3" /> : <Wand2 className="w-3 h-3" />
                  }
                  {replyText ? 'Regenerate' : 'AI Generate'}
                </button>
              </div>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Click 'AI Generate' or write your reply..."
                rows={3}
                className="input resize-none"
              />
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleApprove} disabled={!replyText || loading === 'approve'} className="btn-secondary text-xs">
                  {loading === 'approve' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Save & Approve
                </button>
                {review.status === 'approved' && (
                  <button onClick={handlePost} disabled={loading === 'post'} className="btn-success text-xs">
                    {loading === 'post' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    Post to Google
                  </button>
                )}
                <button onClick={handleIgnore} disabled={loading === 'ignore'} className="btn-danger text-xs ml-auto">
                  {loading === 'ignore' ? <Loader2 className="w-3 h-3 animate-spin" /> : <EyeOff className="w-3 h-3" />}
                  Ignore
                </button>
              </div>
            </div>
          )}

          {/* Posted reply */}
          {isPosted && review.final_reply && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs font-medium text-green-700 mb-1">Your reply (posted)</p>
              <p className="text-sm text-green-900">{review.final_reply}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
