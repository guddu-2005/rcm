import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../../store'
import { addCitizen, getCitizens } from '../../storage'
import { FormError } from '../../components/ui'
import { User, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
export default function CitizenRegister() {
  const navigate = useNavigate()
  const { login } = useStore()
  const [form, setForm] = useState({ name: '', mobile: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = 'Enter a valid 10-digit mobile number'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address'
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    const existing = getCitizens().find(c => c.email === form.email)
    if (existing) e.email = 'Email already registered. Please log in.'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const citizen = addCitizen({ name: form.name.trim(), mobile: form.mobile, email: form.email, password: form.password })
    login({ role: 'citizen', userId: citizen.id, name: citizen.name, email: citizen.email })
    toast.success('Welcome to CivicSync! 🎉')
    navigate('/citizen/dashboard')
    setLoading(false)
  }
  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: '' })) }
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
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Create Citizen Account</h1>
          <p className="text-sm text-gray-500">File and track civic complaints in your city.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="cs-label">Full Name</label>
            <input className="cs-input" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} />
            <FormError msg={errors.name} />
          </div>
          <div>
            <label className="cs-label">Mobile Number</label>
            <input className="cs-input" placeholder="10-digit mobile" value={form.mobile} onChange={e => set('mobile', e.target.value)} maxLength={10} />
            <FormError msg={errors.mobile} />
          </div>
          <div>
            <label className="cs-label">Email Address</label>
            <input className="cs-input" type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            <FormError msg={errors.email} />
          </div>
          <div>
            <label className="cs-label">Password</label>
            <div className="relative">
              <input className="cs-input pr-10" type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <FormError msg={errors.password} />
          </div>
          <div>
            <label className="cs-label">Confirm Password</label>
            <input className="cs-input" type="password" placeholder="Re-enter password" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
            <FormError msg={errors.confirm} />
          </div>
          <button type="submit" disabled={loading} className="cs-btn-primary w-full justify-center py-3 text-base mt-2">
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '✨ Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/citizen/login" className="text-primary-600 font-semibold hover:underline">Sign In</Link>
        </p>
        <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
          <strong>Demo Account:</strong> rahul@citizen.in / pass123
        </div>
      </div>
    </div>
  )
}
