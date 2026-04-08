import {
  LS, type Citizen, type DepartmentUser, type Worker, type Complaint,
  type Department, type Priority, type ComplaintStatus, CATEGORY_TO_DEPT
} from './types'
import { computePriorityScore } from './priorityEngine'

// ============================
// Generic Storage Helpers
// ============================
export function lsGet<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
export function lsSet<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

// ============================
// ID Generator
// ============================
export function newId() { return `${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}` }

// ============================
// Seed Data — runs once
// ============================
export function seedIfNeeded() {
  if (lsGet(LS.SEEDED, false)) return

  // Citizens
  const citizens: Citizen[] = [
    { id: 'CIT-001', name: 'Rahul Sharma', mobile: '9876543210', email: 'rahul@citizen.in', password: 'pass123', role: 'citizen', createdAt: daysAgo(10) },
    { id: 'CIT-002', name: 'Priya Patel', mobile: '9812345678', email: 'priya@citizen.in', password: 'pass123', role: 'citizen', createdAt: daysAgo(8) },
  ]

  // Department users
  const deptUsers: DepartmentUser[] = [
    { id: 'DEPT-001', department: 'Water Supply',          email: 'water@dept.gov',     password: 'dept123', role: 'department', createdAt: daysAgo(30) },
    { id: 'DEPT-002', department: 'Garbage & Sanitation',  email: 'garbage@dept.gov',   password: 'dept123', role: 'department', createdAt: daysAgo(30) },
    { id: 'DEPT-003', department: 'Electricity',           email: 'power@dept.gov',     password: 'dept123', role: 'department', createdAt: daysAgo(30) },
    { id: 'DEPT-004', department: 'Road & Infrastructure', email: 'roads@dept.gov',     password: 'dept123', role: 'department', createdAt: daysAgo(30) },
    { id: 'DEPT-005', department: 'Public Transport',      email: 'transport@dept.gov', password: 'dept123', role: 'department', createdAt: daysAgo(30) },
    { id: 'DEPT-006', department: 'Traffic Management',    email: 'traffic@dept.gov',   password: 'dept123', role: 'department', createdAt: daysAgo(30) },
  ]

  // Workers — 2 per key department
  const workers: Worker[] = [
    { id: 'WRK-001', name: 'Ajay Verma', email: 'ajay@water.gov', password: 'work123', employeeId: 'EMP-W01', department: 'Water Supply', role: 'worker', createdAt: daysAgo(20) },
    { id: 'WRK-002', name: 'Suresh Nair', email: 'suresh@water.gov', password: 'work123', employeeId: 'EMP-W02', department: 'Water Supply', role: 'worker', createdAt: daysAgo(19) },
    { id: 'WRK-003', name: 'Ravi Singh', email: 'ravi@roads.gov', password: 'work123', employeeId: 'EMP-R01', department: 'Road & Infrastructure', role: 'worker', createdAt: daysAgo(18) },
    { id: 'WRK-004', name: 'Meena Kumari', email: 'meena@roads.gov', password: 'work123', employeeId: 'EMP-R02', department: 'Road & Infrastructure', role: 'worker', createdAt: daysAgo(17) },
    { id: 'WRK-005', name: 'Deepak Rao', email: 'deepak@power.gov', password: 'work123', employeeId: 'EMP-E01', department: 'Electricity', role: 'worker', createdAt: daysAgo(16) },
    { id: 'WRK-006', name: 'Anita Devi', email: 'anita@power.gov', password: 'work123', employeeId: 'EMP-E02', department: 'Electricity', role: 'worker', createdAt: daysAgo(15) },
    { id: 'WRK-007', name: 'Kiran Roy', email: 'kiran@garbage.gov', password: 'work123', employeeId: 'EMP-G01', department: 'Garbage & Sanitation', role: 'worker', createdAt: daysAgo(14) },
    { id: 'WRK-008', name: 'Lata Mishra', email: 'lata@garbage.gov', password: 'work123', employeeId: 'EMP-G02', department: 'Garbage & Sanitation', role: 'worker', createdAt: daysAgo(13) },
  ]

  // Complaints
  const c1: Complaint = {
    id: 'CMP-001', title: 'Water pipe burst near school',
    description: 'A major water pipe has burst at the junction near Blue Star School, causing road flooding.',
    category: 'Water Leak', department: 'Water Supply',
    location: 'Blue Star School Junction, Ward 12', priority: 'High', status: 'In Progress',
    citizenId: 'CIT-001', citizenName: 'Rahul Sharma', citizenPhone: '9876543210',
    assignedDept: 'Water Supply', assignedWorkerId: 'WRK-001', assignedWorkerName: 'Ajay Verma',
    timeline: [
      { status: 'Submitted', note: 'Complaint filed.', timestamp: daysAgo(5), by: 'Rahul Sharma' },
      { status: 'Verified', note: 'Reviewed by admin.', timestamp: daysAgo(4), by: 'Admin' },
      { status: 'Assigned', note: 'Assigned to Water Supply dept.', timestamp: daysAgo(3), by: 'Admin' },
      { status: 'In Progress', note: 'Worker dispatched to site.', timestamp: daysAgo(2), by: 'Ajay Verma' },
    ],
    createdAt: daysAgo(5), updatedAt: daysAgo(2),
  }

  const c2: Complaint = {
    id: 'CMP-002', title: 'Large pothole on MG Road causing accidents',
    description: 'A dangerous 2-foot wide pothole has appeared on MG Road near the traffic signal. Vehicles are swerving dangerously.',
    category: 'Pothole', department: 'Road & Infrastructure',
    location: 'MG Road, Near Signal No.4', priority: 'High', status: 'Assigned',
    citizenId: 'CIT-002', citizenName: 'Priya Patel', citizenPhone: '9812345678',
    assignedDept: 'Road & Infrastructure', assignedWorkerId: 'WRK-003', assignedWorkerName: 'Ravi Singh',
    timeline: [
      { status: 'Submitted', note: 'Complaint filed.', timestamp: daysAgo(3), by: 'Priya Patel' },
      { status: 'Verified', note: 'Reviewed by admin.', timestamp: daysAgo(2), by: 'Admin' },
      { status: 'Assigned', note: 'Assigned to Road dept.', timestamp: daysAgo(1), by: 'Admin' },
    ],
    createdAt: daysAgo(3), updatedAt: daysAgo(1),
  }

  const c3: Complaint = {
    id: 'CMP-003', title: 'Streetlights not working in colony',
    description: 'All streetlights in Sector 9 colony have been non-functional for 4 days. Area is unsafe at night.',
    category: 'Streetlight Broken', department: 'Electricity',
    location: 'Sector 9 Colony, Block B', priority: 'Medium', status: 'Submitted',
    citizenId: 'CIT-001', citizenName: 'Rahul Sharma',
    timeline: [
      { status: 'Submitted', note: 'Complaint filed.', timestamp: daysAgo(1), by: 'Rahul Sharma' },
    ],
    createdAt: daysAgo(1), updatedAt: daysAgo(1),
  }

  const c4: Complaint = {
    id: 'CMP-004', title: 'Garbage overflowing at market area',
    description: 'Garbage bins near the local market have not been cleared for a week. Causing foul smell and health hazards.',
    category: 'Garbage Overflow', department: 'Garbage & Sanitation',
    location: 'Main Market, Ward 5', priority: 'High', status: 'Resolved',
    citizenId: 'CIT-002', citizenName: 'Priya Patel',
    assignedDept: 'Garbage & Sanitation', assignedWorkerId: 'WRK-007', assignedWorkerName: 'Kiran Roy',
    resolutionNote: 'Area cleaned and bins replaced. Issue resolved.',
    timeline: [
      { status: 'Submitted', note: 'Complaint filed.', timestamp: daysAgo(7), by: 'Priya Patel' },
      { status: 'Verified', note: 'Reviewed.', timestamp: daysAgo(6), by: 'Admin' },
      { status: 'Assigned', note: 'Assigned to Sanitation.', timestamp: daysAgo(5), by: 'Admin' },
      { status: 'In Progress', note: 'Cleanup crew dispatched.', timestamp: daysAgo(4), by: 'Kiran Roy' },
      { status: 'Resolved', note: 'Area cleaned and bins replaced. Issue resolved.', timestamp: daysAgo(2), by: 'Kiran Roy' },
    ],
    createdAt: daysAgo(7), updatedAt: daysAgo(2), resolvedAt: daysAgo(2),
  }

  lsSet(LS.CITIZENS, citizens)
  lsSet(LS.DEPARTMENT_USERS, deptUsers)
  lsSet(LS.WORKERS, workers)
  lsSet(LS.COMPLAINTS, [c1, c2, c3, c4])
  lsSet(LS.SEEDED, true)
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

// ============================
// CRUD Helpers
// ============================
export function getComplaints(): Complaint[] { return lsGet<Complaint[]>(LS.COMPLAINTS, []) }
export function saveComplaints(c: Complaint[]) { lsSet(LS.COMPLAINTS, c) }

export function addComplaint(data: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'status'>) {
  const complaints = getComplaints()
  const id = `CMP-${String(complaints.length + 1).padStart(3, '0')}-${newId().slice(0,4)}`
  const now = new Date().toISOString()
  // Auto-compute AI priority score if not already provided (e.g. from frontend Groq API)
  const computed = computePriorityScore(data.title, data.description, data.category)
  const finalScore = data.priorityScore ?? computed.score
  const finalLevel = data.priority ?? computed.level

  const complaint: Complaint = {
    ...data,
    id,
    priority: finalLevel,
    priorityScore: finalScore,
    status: 'Submitted',
    timeline: [{ status: 'Submitted', note: 'Complaint filed via CivicSync.', timestamp: now, by: data.citizenName }],
    createdAt: now,
    updatedAt: now,
  }
  complaints.push(complaint)
  saveComplaints(complaints)
  return complaint
}

export function updateComplaint(id: string, updates: Partial<Complaint>, statusNote?: { note: string; by: string }) {
  const complaints = getComplaints()
  const idx = complaints.findIndex(c => c.id === id)
  if (idx === -1) return
  const now = new Date().toISOString()
  complaints[idx] = { ...complaints[idx], ...updates, updatedAt: now }
  if (statusNote && updates.status) {
    complaints[idx].timeline = [
      ...complaints[idx].timeline,
      { status: updates.status, note: statusNote.note, timestamp: now, by: statusNote.by }
    ]
  }
  saveComplaints(complaints)
  return complaints[idx]
}

export function getCitizens(): Citizen[] { return lsGet<Citizen[]>(LS.CITIZENS, []) }
export function getDeptUsers(): DepartmentUser[] { return lsGet<DepartmentUser[]>(LS.DEPARTMENT_USERS, []) }
export function getWorkers(): Worker[] { return lsGet<Worker[]>(LS.WORKERS, []) }

export function addCitizen(data: Omit<Citizen, 'id' | 'role' | 'createdAt'>) {
  const citizens = getCitizens()
  const citizen: Citizen = { ...data, id: `CIT-${newId()}`, role: 'citizen', createdAt: new Date().toISOString() }
  citizens.push(citizen)
  lsSet(LS.CITIZENS, citizens)
  return citizen
}

export function addWorker(data: Omit<Worker, 'id' | 'role' | 'createdAt'>) {
  const workers = getWorkers()
  const worker: Worker = { ...data, id: `WRK-${newId()}`, role: 'worker', createdAt: new Date().toISOString() }
  workers.push(worker)
  lsSet(LS.WORKERS, workers)
  return worker
}

export function isOverdue(complaint: Complaint): boolean {
  if (complaint.status === 'Resolved' || complaint.status === 'Closed') return false
  const created = new Date(complaint.createdAt).getTime()
  return (Date.now() - created) > 3 * 24 * 60 * 60 * 1000
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
