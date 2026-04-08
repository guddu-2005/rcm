// ==============================
// CivicSync — Core Types
// ==============================

export type UserRole = 'citizen' | 'admin' | 'department' | 'worker'

export type Department =
  | 'Water Supply'
  | 'Garbage & Sanitation'
  | 'Electricity'
  | 'Road & Infrastructure'
  | 'Public Transport'
  | 'Traffic Management'

export const DEPARTMENTS: Department[] = [
  'Water Supply', 'Garbage & Sanitation', 'Electricity',
  'Road & Infrastructure', 'Public Transport', 'Traffic Management',
]

export const CATEGORY_TO_DEPT: Record<string, Department> = {
  'Water Leak': 'Water Supply',
  'Water Supply Issue': 'Water Supply',
  'No Water': 'Water Supply',
  'Garbage Overflow': 'Garbage & Sanitation',
  'Waste Disposal': 'Garbage & Sanitation',
  'Sanitation Issue': 'Garbage & Sanitation',
  'Power Outage': 'Electricity',
  'Electricity Issue': 'Electricity',
  'Streetlight Broken': 'Electricity',
  'Pothole': 'Road & Infrastructure',
  'Road Damage': 'Road & Infrastructure',
  'Bridge Issue': 'Road & Infrastructure',
  'Bus Delay': 'Public Transport',
  'Metro Issue': 'Public Transport',
  'Transport Disruption': 'Public Transport',
  'Traffic Signal Broken': 'Traffic Management',
  'Illegal Parking': 'Traffic Management',
  'Traffic Jam': 'Traffic Management',
  'Other': 'Water Supply',
}

export const COMPLAINT_CATEGORIES = Object.keys(CATEGORY_TO_DEPT)

export type ComplaintStatus = 'Submitted' | 'Verified' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed'
export type Priority = 'Low' | 'Medium' | 'High'

export interface StatusEvent {
  status: ComplaintStatus
  note: string
  timestamp: string
  by: string
}

export interface Complaint {
  id: string
  title: string
  description: string
  category: string
  department: Department
  location: string
  photo?: string
  priority: Priority
  priorityScore?: number   // AI computed 0–100
  status: ComplaintStatus
  citizenId: string
  citizenName: string
  citizenPhone?: string
  assignedDept?: Department
  assignedWorkerId?: string
  assignedWorkerName?: string
  resolutionNote?: string
  resolutionPhoto?: string
  timeline: StatusEvent[]
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export interface Citizen {
  id: string
  name: string
  mobile: string
  email: string
  password: string
  role: 'citizen'
  createdAt: string
}

export interface DepartmentUser {
  id: string
  department: Department
  email: string
  password: string
  role: 'department'
  createdAt: string
}

export interface Worker {
  id: string
  name: string
  email: string
  password: string
  employeeId: string
  department: Department
  role: 'worker'
  createdAt: string
}

export interface AdminUser {
  email: string
  password: string
  role: 'admin'
}

// ==============================
// LocalStorage Keys
// ==============================
export const LS = {
  CITIZENS: 'cs_citizens',
  DEPARTMENT_USERS: 'cs_departments',
  WORKERS: 'cs_workers',
  COMPLAINTS: 'cs_complaints',
  SESSION: 'cs_session',
  SEEDED: 'cs_seeded',
}

// ==============================
// Status Settings
// ==============================
export const STATUS_CONFIG: Record<ComplaintStatus, { color: string; bg: string; dot: string }> = {
  'Submitted':   { color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',   dot: 'bg-blue-500' },
  'Verified':    { color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200', dot: 'bg-purple-500' },
  'Assigned':    { color: 'text-indigo-700',  bg: 'bg-indigo-50 border-indigo-200', dot: 'bg-indigo-500' },
  'In Progress': { color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',   dot: 'bg-amber-500' },
  'Resolved':    { color: 'text-green-700',   bg: 'bg-green-50 border-green-200',   dot: 'bg-green-500' },
  'Closed':      { color: 'text-gray-600',    bg: 'bg-gray-100 border-gray-200',    dot: 'bg-gray-400' },
}

export const PRIORITY_CONFIG: Record<Priority, { color: string; bg: string }> = {
  'Low':    { color: 'text-gray-600',   bg: 'bg-gray-100' },
  'Medium': { color: 'text-amber-700',  bg: 'bg-amber-50' },
  'High':   { color: 'text-red-700',    bg: 'bg-red-50' },
}

export const DEPT_ICONS: Record<Department, string> = {
  'Water Supply': '💧',
  'Garbage & Sanitation': '🗑️',
  'Electricity': '⚡',
  'Road & Infrastructure': '🛣️',
  'Public Transport': '🚌',
  'Traffic Management': '🚦',
}
