import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { Menu, X, LogOut, ChevronRight } from 'lucide-react'
import { Avatar } from './ui'

interface NavItem { label: string; href: string; icon: React.ReactNode }

interface SidebarShellProps {
  title: string
  subtitle: string
  navItems: NavItem[]
  children: React.ReactNode
  accentColor?: string
}

export function SidebarShell({ title, subtitle, navItems, children, accentColor = 'bg-primary-600' }: SidebarShellProps) {
  const { session, logout } = useStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`${accentColor} px-5 py-5`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="font-display font-bold text-white text-base">C</span>
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm">CivicSync</div>
            <div className="text-xs text-white/70">{subtitle}</div>
          </div>
        </div>
        {session && (
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            <Avatar name={session.name} size="sm" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{session.name}</div>
              <div className="text-xs text-white/60 truncate">{session.email}</div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">{title}</p>
        {navItems.map(item => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `cs-sidebar-link${isActive ? ' active' : ''}`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button onClick={handleLogout}
          className="cs-sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-white flex-shrink-0 shadow-2xl">{sidebarContent}</div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 h-14 flex items-center gap-3">
          <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <span className="font-display font-bold text-sm">{subtitle}</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
