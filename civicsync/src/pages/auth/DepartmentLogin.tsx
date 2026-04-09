import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../../store'
import { getDeptUsers } from '../../storage'
import { DEPARTMENTS, type Department } from '../../types'
import { FormError } from '../../components/ui'
import { Building2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
export default function DepartmentLogin() {
  const navigate = useNavigate()
  const { login } = useStore()
  const [dept, setDept] = useState<Department | ''>('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!dept) { setError('Please select your department'); return }
    if (!email || !password) { setError('Email and password are required'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const users = getDeptUsers()
    const match = users.find(u => u.department === dept && u.email === email && u.password === password)
    if (!match) { setError('Invalid department credentials'); setLoading(false); return }
    login({ role: 'department', userId: match.id, name: dept, email: match.email, department: dept })
    toast.success(`${dept} Portal — Welcome! 🏢`)
    navigate('/department/dashboard')
    setLoading(false)
  }
  const DEPT_CREDS: Record<string, string> = {
    'Water Supply': 'water@dept.gov',
    'Garbage & Sanitation': 'garbage@dept.gov',
    'Electricity': 'power@dept.gov',
    'Road & Infrastructure': 'roads@dept.gov',
    'Public Transport': 'transport@dept.gov',
    'Traffic Management': 'traffic@dept.gov',
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 animate-fade-up">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-6 transition-colors">
          <ArrowLeft size={13} /> Back
        </Link>
        <div className="mb-7">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
            <Building2 className="text-green-600" size={22} />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Department Login</h1>
          <p className="text-sm text-gray-500">Sign in to manage your department's complaints.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="cs-label">Select Department</label>
            <select className="cs-input" value={dept} onChange={e => { setDept(e.target.value as Department); setEmail(DEPT_CREDS[e.target.value] || '') }}>
              <option value="">-- Choose Department --</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="cs-label">Department Email</label>
            <input className="cs-input" type="email" placeholder="dept@gov.in" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="cs-label">Password</label>
            <input className="cs-input" type="password" placeholder="dept123" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <FormError msg={error} />}
          <button type="submit" disabled={loading}
            className="w-full justify-center py-3 text-base font-bold bg-green-600 text-white rounded-xl hover:bg-green-700 active:scale-95 transition-all flex items-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '🏢 Sign In'}
          </button>
        </form>
        <div className="mt-5 p-3 rounded-xl bg-green-50 border border-green-100 text-xs text-green-700">
          <strong>Demo:</strong> Select any dept → email auto-fills · Password: <strong>dept123</strong>
        </div>
      </div>
    </div>
  )
}
