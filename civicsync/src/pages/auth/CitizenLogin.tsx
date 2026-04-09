import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../../store'
import { getCitizens } from '../../storage'
import { FormError } from '../../components/ui'
import { User, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
export default function CitizenLogin() {
  const navigate = useNavigate()
  const { login } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Email and password are required'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const citizen = getCitizens().find(c => c.email === email && c.password === password)
    if (!citizen) { setError('Invalid email or password'); setLoading(false); return }
    login({ role: 'citizen', userId: citizen.id, name: citizen.name, email: citizen.email })
    toast.success(`Welcome back, ${citizen.name.split(' ')[0]}! 👋`)
    navigate('/citizen/dashboard')
    setLoading(false)
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 animate-fade-up">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-6 transition-colors">
          <ArrowLeft size={13} /> Back to Home
        </Link>
        <div className="mb-7">
          <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
            <User className="text-primary-600" size={22} />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Citizen Sign In</h1>
          <p className="text-sm text-gray-500">Access your complaint dashboard.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="cs-label">Email Address</label>
            <input className="cs-input" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="cs-label">Password</label>
            <div className="relative">
              <input className="cs-input pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          {error && <FormError msg={error} />}
          <button type="submit" disabled={loading} className="cs-btn-primary w-full justify-center py-3 text-base">
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '🔐 Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-5">
          No account?{' '}
          <Link to="/citizen/register" className="text-primary-600 font-semibold hover:underline">Register here</Link>
        </p>
        <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
          <strong>Demo:</strong> rahul@citizen.in / pass123
        </div>
      </div>
    </div>
  )
}
