import { useState } from 'react'
import { lsGet, lsSet } from '../../storage'
import { FormError } from '../../components/ui'
import { Settings, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
const ADMIN_KEY = 'cs_admin_password'
export default function AdminSettings() {
  const [current, setCurrent] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const handleChange = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const stored = lsGet<string>(ADMIN_KEY, '1234')
    if (current !== stored) { setError('Current password is incorrect'); return }
    if (newPw.length < 4) { setError('New password must be at least 4 characters'); return }
    if (newPw !== confirm) { setError('Passwords do not match'); return }
    lsSet(ADMIN_KEY, newPw)
    toast.success('Password updated successfully!')
    setCurrent(''); setNewPw(''); setConfirm('')
  }
  return (
    <div className="max-w-md">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-sm text-gray-500">Manage admin credentials.</p>
      </div>
      <div className="cs-card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Lock size={18} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-display font-bold text-gray-900">Change Password</h3>
            <p className="text-xs text-gray-500">Admin account: admin@gmail.com</p>
          </div>
        </div>
        <form onSubmit={handleChange} className="space-y-4">
          <div>
            <label className="cs-label">Current Password</label>
            <input className="cs-input" type="password" value={current} onChange={e => setCurrent(e.target.value)} placeholder="Current password" />
          </div>
          <div>
            <label className="cs-label">New Password</label>
            <input className="cs-input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 4 characters" />
          </div>
          <div>
            <label className="cs-label">Confirm New Password</label>
            <input className="cs-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" />
          </div>
          {error && <FormError msg={error} />}
          <button type="submit" className="cs-btn-primary">
            <Settings size={15} /> Update Password
          </button>
        </form>
      </div>
    </div>
  )
}
