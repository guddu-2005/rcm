import { useStore } from '../../store'
import { getWorkers } from '../../storage'
import { DEPARTMENTS, DEPT_ICONS, type Department } from '../../types'
export default function DepartmentPanel() {
  const { complaints } = useStore()
  const workers = getWorkers()
  const deptStats = DEPARTMENTS.map(dept => {
    const dc = complaints.filter(c => c.department === dept)
    const resolved = dc.filter(c => c.status === 'Resolved' || c.status === 'Closed').length
    const rate = dc.length ? Math.round((resolved / dc.length) * 100) : 0
    const activeWorkers = workers.filter(w => w.department === dept).length
    return { dept, total: dc.length, resolved, rate, activeWorkers, pending: dc.length - resolved }
  })
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Department Panel</h1>
        <p className="text-sm text-gray-500">Performance overview across all 6 municipal departments.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deptStats.map(({ dept, total, resolved, rate, activeWorkers, pending }) => (
          <div key={dept} className="cs-card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{DEPT_ICONS[dept as Department]}</span>
              <div>
                <h3 className="font-display font-bold text-gray-900 text-sm">{dept}</h3>
                <p className="text-xs text-gray-500">{activeWorkers} active workers</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="font-bold text-lg text-gray-900">{total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-2">
                <div className="font-bold text-lg text-amber-700">{pending}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="font-bold text-lg text-green-700">{resolved}</div>
                <div className="text-xs text-gray-500">Resolved</div>
              </div>
            </div>
            {}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500 font-medium">Resolution Rate</span>
                <span className={`font-bold ${rate >= 70 ? 'text-green-600' : rate >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{rate}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${rate >= 70 ? 'bg-green-500' : rate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${rate}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
