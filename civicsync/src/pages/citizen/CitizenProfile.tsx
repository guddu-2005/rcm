import { useStore } from '../../store'
import { getCitizens, getComplaints } from '../../storage'
import { Avatar } from '../../components/ui'
import { Phone, Mail, CheckCircle, FileText } from 'lucide-react'

export default function CitizenProfile() {
  const { session } = useStore()
  const citizens = getCitizens()
  const citizen = citizens.find(c => c.id === session?.userId)
  const myComplaints = getComplaints().filter(c => c.citizenId === session?.userId)

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <div className="cs-card mb-4">
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={session?.name || 'User'} size="lg" />
          <div>
            <h2 className="font-display font-bold text-xl text-gray-900">{citizen?.name || session?.name}</h2>
            <span className="text-xs bg-primary-100 text-primary-700 font-semibold px-2.5 py-1 rounded-full">Citizen</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: <Mail size={15} />, label: 'Email', val: citizen?.email || session?.email },
            { icon: <Phone size={15} />, label: 'Mobile', val: citizen?.mobile || '—' },
            { icon: <FileText size={15} />, label: 'Complaints Filed', val: myComplaints.length },
            { icon: <CheckCircle size={15} />, label: 'Resolved', val: myComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length },
          ].map(({ icon, label, val }) => (
            <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="text-primary-600">{icon}</div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
