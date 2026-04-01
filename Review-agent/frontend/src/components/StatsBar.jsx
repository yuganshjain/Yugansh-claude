import { Star, MessageSquare, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

export default function StatsBar({ stats }) {
  const cards = [
    { label: 'Total Reviews', value: stats.total, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg Rating', value: stats.avg_rating ? `${stats.avg_rating} ★` : '—', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Response Rate', value: stats.response_rate ? `${stats.response_rate}%` : '0%', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Needs Reply', value: stats.pending, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="card p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
