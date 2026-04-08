import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../../store'
import { getWorkers } from '../../storage'
import { FormError } from '../../components/ui'
import { HardHat, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WorkerLogin() {
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
    const worker = getWorkers().find(w => w.email === email && w.password === password)
    if (!worker) { setError('Invalid email or password'); setLoading(false); return }
    login({ role: 'worker', userId: worker.id, name: worker.name, email: worker.email, department: worker.department })
    toast.success(`Welcome back, ${worker.name.split(' ')[0]}! 🔧`)
    navigate('/worker/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 animate-fade-up">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-6">
          <ArrowLeft size={13} /> Back
        </Link>
        <div className="mb-7">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
            <HardHat className="text-amber-600" size={22} />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Worker Sign In</h1>
          <p className="text-sm text-gray-500">Access your assigned tasks.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="cs-label">Email</label>
            <input className="cs-input" type="email" placeholder="worker@dept.gov" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="cs-label">Password</label>
            <input className="cs-input" type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <FormError msg={error} />}
          <button type="submit" disabled={loading}
            className="w-full justify-center py-3 text-base font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700 active:scale-95 transition-all flex items-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '🔧 Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Not registered? <Link to="/worker/register" className="text-amber-600 font-semibold hover:underline">Register</Link>
        </p>
        <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700">
          <strong>Demo:</strong> ajay@water.gov / work123
        </div>
      </div>
    </div>
  )
}
