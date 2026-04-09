import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../../store'
import { FormError } from '../../components/ui'
import { Shield, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
const ADMIN_EMAIL = 'admin@gmail.com'
const ADMIN_PASS = '1234'
export default function AdminLogin() {
  const navigate = useNavigate()
  const { login } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASS) {
      setError('Invalid credentials. Use admin@gmail.com / 1234')
      setLoading(false)
      return
    }
    login({ role: 'admin', userId: 'ADMIN-001', name: 'Municipal Admin', email })
    toast.success('Admin access granted 🛡️')
    navigate('/admin/dashboard')
    setLoading(false)
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 animate-fade-up">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-6 transition-colors">
          <ArrowLeft size={13} /> Back
        </Link>
        <div className="mb-7">
          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="text-purple-600" size={22} />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Admin Login</h1>
          <p className="text-sm text-gray-500">Restricted access for municipal administrators.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="cs-label">Admin Email</label>
            <input className="cs-input" type="email" placeholder="admin@gmail.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="cs-label">Password</label>
            <input className="cs-input" type="password" placeholder="••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <FormError msg={error} />}
          <button type="submit" disabled={loading} className="w-full justify-center py-3 text-base font-bold bg-purple-600 text-white rounded-xl hover:bg-purple-700 active:scale-95 transition-all flex items-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '🛡️ Admin Sign In'}
          </button>
        </form>
        <div className="mt-5 p-3 rounded-xl bg-purple-50 border border-purple-100 text-xs text-purple-700">
          <strong>Credentials:</strong> admin@gmail.com / 1234
        </div>
      </div>
    </div>
  )
}
