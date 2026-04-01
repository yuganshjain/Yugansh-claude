import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'

const COLORS = { positive: '#22c55e', neutral: '#f59e0b', negative: '#ef4444' }

export default function AnalyticsPanel({ stats, reviews }) {
  if (!stats || stats.total === 0) {
    return (
      <div className="card p-8 text-center text-gray-400">
        <p>No review data yet. Sync your reviews to see analytics.</p>
      </div>
    )
  }

  const pieData = [
    { name: 'Positive', value: stats.positive, color: COLORS.positive },
    { name: 'Neutral', value: stats.neutral, color: COLORS.neutral },
    { name: 'Negative', value: stats.negative, color: COLORS.negative },
  ].filter(d => d.value > 0)

  const statusData = [
    { name: 'Pending', value: stats.pending },
    { name: 'Replied', value: stats.replied },
  ]

  // Rating distribution
  const ratingDist = [1, 2, 3, 4, 5].map(star => ({
    star: `${star}★`,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment breakdown */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Review Sentiment</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Rating distribution */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ratingDist} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="star" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reply status */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Reply Status</h3>
        <div className="flex items-center gap-6">
          {statusData.map(({ name, value }) => (
            <div key={name} className="text-center">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{name}</p>
            </div>
          ))}
          <div className="flex-1 ml-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-600">Response rate</span>
              <span className="font-semibold text-gray-900">{stats.response_rate}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${stats.response_rate}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
