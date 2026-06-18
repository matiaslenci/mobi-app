import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Topbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="px-6 sm:px-10 lg:px-14 py-10 lg:py-14 max-w-[1100px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
