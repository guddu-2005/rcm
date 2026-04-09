import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../../store'
import { addWorker, getWorkers } from '../../storage'
import { DEPARTMENTS, type Department } from '../../types'
import { FormError } from '../../components/ui'
import { HardHat, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
export default function WorkerRegister() {
  const navigate = useNavigate()
  const { login } = useStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', employeeId: '', department: '' as Department | '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required'
    if (form.password.length < 6) e.password = 'Min 6 characters'
    if (!form.employeeId.trim()) e.employeeId = 'Employee ID is required'
    if (!form.department) e.department = 'Select your department'
    if (getWorkers().find(w => w.email === form.email)) e.email = 'Email already registered'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const worker = addWorker({ name: form.name.trim(), email: form.email, password: form.password, employeeId: form.employeeId.trim(), department: form.department as Department })
    login({ role: 'worker', userId: worker.id, name: worker.name, email: worker.email, department: worker.department })
    toast.success('Worker account created! 🔧')
    navigate('/worker/dashboard')
    setLoading(false)
  }
  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: '' })) }
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
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Worker Registration</h1>
          <p className="text-sm text-gray-500">Register as a field worker to accept and resolve tasks.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { k: 'name', label: 'Full Name', placeholder: 'Your full name', type: 'text' },
            { k: 'email', label: 'Email', placeholder: 'worker@dept.gov', type: 'email' },
            { k: 'password', label: 'Password', placeholder: 'Min 6 characters', type: 'password' },
            { k: 'employeeId', label: 'Employee ID', placeholder: 'EMP-XXXX', type: 'text' },
          ].map(({ k, label, placeholder, type }) => (
            <div key={k}>
              <label className="cs-label">{label}</label>
              <input className="cs-input" type={type} placeholder={placeholder} value={(form as any)[k]} onChange={e => set(k, e.target.value)} />
              <FormError msg={errors[k]} />
            </div>
          ))}
          <div>
            <label className="cs-label">Department</label>
            <select className="cs-input" value={form.department} onChange={e => set('department', e.target.value)}>
              <option value="">-- Select Department --</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <FormError msg={errors.department} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full justify-center py-3 text-base font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700 active:scale-95 transition-all flex items-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '🔧 Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already registered? <Link to="/worker/login" className="text-amber-600 font-semibold hover:underline">Sign in</Link>
        </p>
        <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700">
          <strong>Demo:</strong> ajay@water.gov / work123
        </div>
      </div>
    </div>
  )
}
