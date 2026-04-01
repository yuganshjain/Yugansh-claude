import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { Star, LayoutDashboard, Settings, LogOut, Menu, X, BarChart2, Zap } from 'lucide-react'

export default function Layout({ children }) {
  const { business, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            <span className="text-lg font-bold">ReviewAI</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 truncate">{business?.name}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={LayoutDashboard} label="Reviews" active />
          <NavItem icon={BarChart2} label="Analytics" />
          <NavItem icon={Zap} label="Auto-Reply" badge={business?.auto_reply ? 'ON' : null} />
          <NavItem icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium">
              {business?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{business?.name}</p>
              <p className="text-xs text-gray-400 truncate">{business?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm w-full py-1 transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold">ReviewAI</span>
          </div>
        </header>
        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavItem({ icon: Icon, label, active, badge }) {
  return (
    <button className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
      <Icon className="w-4 h-4" />
      <span className="flex-1 text-left">{label}</span>
      {badge && <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">{badge}</span>}
    </button>
  )
}
