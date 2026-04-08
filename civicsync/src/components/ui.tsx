import React from 'react'
import { STATUS_CONFIG, PRIORITY_CONFIG, type ComplaintStatus, type Priority } from '../types'
import { Circle } from 'lucide-react'

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`status-badge border ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority]
  return (
    <span className={`status-badge ${cfg.bg} ${cfg.color}`}>
      {priority}
    </span>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-3xl mb-4">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-gray-700 mb-1">{title}</h3>
      {sub && <p className="text-sm text-gray-500">{sub}</p>}
    </div>
  )
}

export function FormError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="cs-error">⚠ {msg}</p>
}

export function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-14 h-14 text-lg'
  return (
    <div className={`${sz} rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center flex-shrink-0`}>
      {name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
    </div>
  )
}
